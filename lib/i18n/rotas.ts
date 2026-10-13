/**
 * Rotas públicas por idioma. É a ÚNICA fonte da arquitetura de URLs
 * internacional: middleware, sitemap, hreflang, canonical, seletor de idioma e
 * links do site leem daqui.
 *
 * Português fica na raiz, sem prefixo; inglês em /en e espanhol em /es.
 *
 * COMO FUNCIONA, sem duplicar página: o middleware reescreve (rewrite, nunca
 * redirect) /en/oracles para o mesmo componente de /oraculos e avisa o servidor
 * do idioma por cabeçalho interno. Cada URL é rastreável diretamente, e nenhum
 * idioma é escolhido por cookie ou Accept-Language nestas rotas.
 *
 * Arquivo puro (sem next/headers, sem React): roda no middleware (edge), no
 * servidor, no cliente e nos verificadores.
 */
import { LOCALES, type Locale } from "./config"

export const ROTAS_PUBLICAS = [
  { chave: "home", pt: "/", en: "/en", es: "/es" },
  { chave: "oraculos", pt: "/oraculos", en: "/en/oracles", es: "/es/oraculos" },
  { chave: "faq", pt: "/faq", en: "/en/faq", es: "/es/preguntas-frecuentes" },
  { chave: "sonhos", pt: "/sonhos", en: "/en/dreams", es: "/es/suenos" },
  { chave: "horoscopo", pt: "/horoscopo", en: "/en/horoscope", es: "/es/horoscopo" },
  { chave: "assinatura", pt: "/assinatura", en: "/en/subscription", es: "/es/suscripcion" },
  { chave: "interconexoes", pt: "/interconexoes", en: "/en/interconnections", es: "/es/interconexiones" },
] as const

export type ChaveRota = (typeof ROTAS_PUBLICAS)[number]["chave"]

/** Idiomas com prefixo na URL (o padrão, português, não tem). */
export const PREFIXOS: Record<Exclude<Locale, "pt">, string> = { en: "/en", es: "/es" }

/** Cabeçalhos internos que o middleware escreve e getLocale() lê. Nunca confie neles vindos de fora. */
export const HEADER_LOCALE = "x-locale"
export const HEADER_LOCALE_URL = "x-locale-url"

export function caminhoDaRota(chave: ChaveRota, locale: Locale): string {
  const rota = ROTAS_PUBLICAS.find((r) => r.chave === chave)
  if (!rota) throw new Error(`rota pública desconhecida: ${chave}`)
  return rota[locale]
}

/** Tira barra final (exceto a raiz). */
function normalizar(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname
}

/** A URL é uma das 21 públicas? Casamento exato: nada de prefixo "parecido". */
export function rotaDoCaminho(pathname: string): { chave: ChaveRota; locale: Locale } | null {
  const p = normalizar(pathname)
  for (const rota of ROTAS_PUBLICAS) {
    for (const locale of LOCALES) {
      if (rota[locale] === p) return { chave: rota.chave, locale }
    }
  }
  return null
}

/** O caminho começa com /en ou /es (como segmento inteiro)? */
export function temPrefixoDeIdioma(pathname: string): boolean {
  return /^\/(en|es)(\/|$)/.test(pathname)
}

/**
 * Idioma determinado pela URL, ou null quando a URL não fala de idioma
 * (páginas pessoais, painel, retorno de login: essas seguem o cookie).
 */
export function localeDaUrl(pathname: string): Locale | null {
  return rotaDoCaminho(pathname)?.locale ?? null
}

/**
 * Para links: "/oraculos" vira "/en/oracles" em inglês. Só mexe nos caminhos
 * públicos exatos; o resto (e query/hash) passa como veio.
 */
export function localizarCaminho(caminho: string, locale: Locale): string {
  const corte = caminho.search(/[?#]/)
  const base = corte === -1 ? caminho : caminho.slice(0, corte)
  const resto = corte === -1 ? "" : caminho.slice(corte)
  const rota = ROTAS_PUBLICAS.find((r) => r.pt === normalizar(base))
  return rota ? `${rota[locale]}${resto}` : caminho
}

/**
 * A página equivalente em outro idioma, para o seletor. Devolve null quando a
 * URL atual não é pública (páginas pessoais não mudam de endereço: o idioma
 * delas segue o cookie).
 */
export function caminhoEquivalente(pathname: string, alvo: Locale): string | null {
  const atual = rotaDoCaminho(pathname)
  return atual ? caminhoDaRota(atual.chave, alvo) : null
}

/**
 * Idioma que a URL determina, mas SÓ depois de o componente montar no navegador.
 *
 * No servidor, e no primeiro render da hidratação, o pathname que o React vê
 * pode ser o do endereço INTERNO da reescrita (/sonhos em vez de /en/dreams):
 * foi o que a Netlify entregou em produção, e o HTML inicial de /en/dreams saiu
 * em português. Antes de montar, quem vale é o idioma que o servidor decidiu
 * (initialLocale, vindo do cabeçalho do middleware). Depois de montar, o
 * pathname é o do navegador, e acompanha as navegações suaves.
 */
export function localeDaUrlDepoisDeMontar(pathname: string | null | undefined, montado: boolean): Locale | null {
  return montado && pathname ? localeDaUrl(pathname) : null
}

/** O idioma em uso: o da URL quando já montou e a URL fala de idioma; senão, o escolhido (initialLocale ou preferência). */
export function localeEfetivo(escolhido: Locale, pathname: string | null | undefined, montado: boolean): Locale {
  return localeDaUrlDepoisDeMontar(pathname, montado) ?? escolhido
}

/**
 * Normalização da barra final: "/en/oracles/" devolve "/en/oracles"; o que já
 * está sem barra (ou não é rota de idioma) devolve null. O Next faz isto sozinho
 * nas páginas, mas a reescrita do middleware escondia a barra em produção e
 * /en/oracles/ respondia 200: o canonical já apontava para a URL limpa, mas é
 * uma segunda URL servindo a mesma página. Só vale para as 21 URLs públicas e
 * para qualquer coisa com prefixo /en ou /es. O destino nunca termina em barra,
 * então não há laço. Não tem relação com idioma: a URL de destino é a mesma
 * página, no mesmo idioma.
 */
export function caminhoSemBarra(pathname: string): string | null {
  if (pathname.length <= 1 || !pathname.endsWith("/")) return null
  if (!rotaDoCaminho(pathname) && !temPrefixoDeIdioma(pathname)) return null
  const limpo = pathname.replace(/\/+$/, "")
  return limpo === "" ? "/" : limpo
}
