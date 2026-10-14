import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, resolveLocale, type Locale } from "@/lib/i18n/config"
import {
  HEADER_LOCALE,
  HEADER_LOCALE_URL,
  caminhoDaRota,
  caminhoInterno,
  caminhoSemBarra,
  ehCaminhoInterno,
  ehRotaDeServico,
  rotaDoCaminho,
  temPrefixoDeIdioma,
} from "@/lib/i18n/rotas"

/** Caminho que não existe em idioma nenhum: reescrever para ele dá 404 dentro do layout raiz, no idioma certo. */
const CAMINHO_INEXISTENTE = "/_nao-encontrado"

/** Cabeçalhos de idioma esvaziados: a página segue o cookie (getLocale). */
const SEM_IDIOMA_NA_URL = { [HEADER_LOCALE]: "", [HEADER_LOCALE_URL]: "" }

/**
 * Roteamento por idioma. TODA página mora em app/l/[locale]/... e nenhuma URL
 * pública mostra isso: este middleware reescreve (REWRITE, nunca redirect)
 * cada pedido de página para o caminho interno com o idioma no segmento.
 *
 *  - /oraculos, /faq...        português, e ficam em português SEMPRE: a URL
 *                              manda, cookie e Accept-Language não entram.
 *                              Vão para /l/pt/oraculos, /l/pt/faq...
 *  - /en/oracles, /es/faq...   a mesma página, em /l/en/oraculos, /l/es/faq...
 *                              Uma página só, três idiomas, cada um com URL
 *                              própria e rastreável.
 *  - /en/qualquer-outra-coisa  404, no idioma do prefixo. Não existe versão
 *                              inventada, então não existe página duplicada.
 *  - /home, /diario, /admin... (páginas pessoais, painel): o idioma é o cookie,
 *                              e vão para /l/<cookie>/home...
 *  - /l/...                    pedido de fora para o caminho interno: 404.
 *  - /api/..., /auth/...       rotas de serviço: sessão renovada, sem reescrita.
 *
 * POR QUE O IDIOMA ESTÁ NO CAMINHO: assim o layout raiz lê o idioma de `params`
 * em vez de headers()/cookies(), e as páginas que não leem a requisição podem
 * ser geradas estáticas no build (ver app/l/[locale]/layout.tsx).
 *
 * Os cabeçalhos x-locale/x-locale-url são SEMPRE reescritos aqui, inclusive
 * esvaziados: o que o cliente mandar com esse nome nunca chega ao servidor.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // barra final: 308 para a mesma URL sem barra, com a query intacta. É
  // normalização de endereço, não escolha de idioma. Vale para qualquer caminho:
  // se a barra chegasse à reescrita, o Next redirecionaria para o caminho
  // interno e o exporia.
  const semBarra = caminhoSemBarra(pathname)
  if (semBarra) {
    // URL padrão, e não request.nextUrl.clone(): o NextURL preserva a barra final ao
    // reescrever o pathname, e o redirect apontaria para a própria URL (laço)
    const limpa = new URL(request.url)
    limpa.pathname = semBarra
    return NextResponse.redirect(limpa, 308)
  }

  // rotas de serviço (APIs, callback do login, geração da consulta): só a sessão
  if (ehRotaDeServico(pathname)) {
    return await updateSession(request, { headers: SEM_IDIOMA_NA_URL })
  }

  const reescrever = (locale: Locale, caminhoPt: string, headers: Record<string, string>) => {
    const interno = request.nextUrl.clone()
    interno.pathname = caminhoInterno(locale, caminhoPt)
    return updateSession(request, { rewriteTo: interno, headers })
  }

  // o caminho interno não é endereço: quem o pede de fora recebe 404
  if (ehCaminhoInterno(pathname)) {
    return await reescrever("pt", CAMINHO_INEXISTENTE, SEM_IDIOMA_NA_URL)
  }

  // as 21 URLs públicas: o idioma é o da URL
  const rota = rotaDoCaminho(pathname)
  if (rota) {
    const resposta = await reescrever(rota.locale, caminhoDaRota(rota.chave, "pt"), {
      [HEADER_LOCALE]: rota.locale,
      [HEADER_LOCALE_URL]: "1",
    })
    // a preferência acompanha a URL visitada: as páginas pessoais, que seguem
    // o cookie, passam a falar o idioma que a pessoa estava lendo
    if (request.cookies.get(LOCALE_COOKIE)?.value !== rota.locale) {
      resposta.cookies.set(LOCALE_COOKIE, rota.locale, { path: "/", maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: "lax" })
    }
    return resposta
  }

  // /en/... ou /es/... que não é nenhuma das 21: 404 no idioma do prefixo
  if (temPrefixoDeIdioma(pathname)) {
    return await reescrever(pathname.startsWith("/es") ? "es" : "en", CAMINHO_INEXISTENTE, SEM_IDIOMA_NA_URL)
  }

  // todo o resto (páginas pessoais, painel, endereços inexistentes): o idioma é o cookie
  return await reescrever(resolveLocale(request.cookies.get(LOCALE_COOKIE)?.value), pathname, SEM_IDIOMA_NA_URL)
}

/**
 * A LISTA DE FORA É CURTA DE PROPÓSITO.
 *
 * O middleware chama `auth.getUser()`, que é uma ida ao servidor de
 * autenticação do Supabase, em TODA requisição que ele vê. Para quem precisa de
 * sessão isso é o preço correto e continua valendo. Para quem não precisa, é
 * uma volta de rede antes de o trabalho começar.
 *
 * Só sai daqui o que foi provado público. As duas rotas abaixo foram lidas
 * linha a linha em auditorias:
 *
 *   /api/ceu-dia        não chama createClient, não lê sessão, não consulta
 *                       entitlement, não escreve em reading_usage, não encosta
 *                       no paywall. O conteúdo é o céu daquele dia, igual para
 *                       todas as pessoas, e varia só por dia e idioma.
 *   /api/tiragem-dia    idem: a carta do dia é a mesma para todo mundo.
 *
 *   /robots.txt, /sitemap.xml, /manifest.webmanifest, /opengraph-image
 *                       arquivos de metadata do Next (app/robots.ts, sitemap.ts,
 *                       manifest.ts, opengraph-image.tsx). Não leem sessão nem
 *                       cookie: devolvem o mesmo conteúdo para todo mundo. Sem
 *                       esta exclusão, cada visita de rastreador custaria um
 *                       getUser() e ainda ganharia o cookie de visitante.
 *
 * Nenhuma outra rota entra nesta lista sem a mesma prova. Em particular,
 * `/api/horoscopo` também não lê sessão hoje, e mesmo assim fica de fora da
 * exclusão: ela PODE gastar uma geração paga, e eu prefiro que uma rota com
 * custo continue passando pela mesma porta que todo o resto.
 */
export const config = {
  matcher: [
    // O webhook da Stripe não tem sessão de usuário: fica fora do middleware do Supabase.
    "/((?!_next/static|_next/image|favicon.ico|api/billing/webhook|api/ceu-dia|api/tiragem-dia|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
