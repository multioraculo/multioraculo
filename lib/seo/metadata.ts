import type { Metadata } from "next"
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/config"
import { caminhoDaRota, type ChaveRota } from "@/lib/i18n/rotas"
import { SITE_NAME, urlAbsoluta } from "./site"

/**
 * Páginas pessoais, painéis e telas de retorno: fora do índice, mas com
 * `follow`, para o rastreador ainda seguir os links públicos que houver nelas.
 *
 * Isto é sinal de indexação, NÃO controle de acesso. Quem protege o conteúdo
 * é a autenticação/autorização de cada rota. E estas rotas NÃO entram no
 * robots.txt de propósito: se o rastreador for proibido de abrir a página, ele
 * nunca lê o noindex.
 */
export const NOINDEX_FOLLOW = { index: false, follow: true } as const

export function paginaPrivada(): Metadata {
  return { robots: NOINDEX_FOLLOW }
}

/** "pt-BR" vira "pt_BR", o formato que o Open Graph espera. */
function localeOg(locale: Locale): string {
  return LOCALE_META[locale].tag.replace("-", "_")
}

/** Código hreflang de cada idioma. */
const HREFLANG: Record<Locale, string> = { pt: "pt-BR", en: "en", es: "es" }

/**
 * Alternativas de idioma de uma página: uma por idioma, mais x-default
 * (português, a versão sem prefixo). É recíproco por construção: toda versão
 * declara as mesmas quatro entradas. Usado no <head> e no sitemap.
 */
export function alternativasDeIdioma(chave: ChaveRota): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[HREFLANG[l]] = urlAbsoluta(caminhoDaRota(chave, l))
  languages["x-default"] = urlAbsoluta(caminhoDaRota(chave, "pt"))
  return languages
}

/**
 * Metadata de uma página pública, no idioma da URL.
 *
 * O canonical é o endereço da própria versão, sem parâmetros: `?utm_*`,
 * `?checkout=` e afins apontam para a mesma página. As alternativas só listam
 * versões que existem (as 21 URLs de lib/i18n/rotas.ts).
 *
 * `absoluto` tira o sufixo " | Multioráculo" do título (só a Home usa).
 */
export function paginaPublica(p: {
  chave: ChaveRota
  titulo: string
  descricao: string
  locale: Locale
  absoluto?: boolean
}): Metadata {
  const caminho = caminhoDaRota(p.chave, p.locale)
  const url = urlAbsoluta(caminho)
  const tituloCompleto = p.absoluto ? p.titulo : `${p.titulo} | ${SITE_NAME}`
  return {
    title: p.absoluto ? { absolute: p.titulo } : p.titulo,
    description: p.descricao,
    alternates: { canonical: caminho, languages: alternativasDeIdioma(p.chave) },
    // o Next NÃO herda o openGraph do layout quando a página define o seu:
    // por isso a página repete tudo, inclusive a imagem
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: localeOg(p.locale),
      alternateLocale: LOCALES.filter((l) => l !== p.locale).map(localeOg),
      url,
      title: tituloCompleto,
      description: p.descricao,
      images: [{ url: urlAbsoluta("/opengraph-image"), width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: tituloCompleto,
      description: p.descricao,
      images: [urlAbsoluta("/opengraph-image")],
    },
  }
}
