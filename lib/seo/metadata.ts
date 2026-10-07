import type { Metadata } from "next"
import { LOCALE_META, type Locale } from "@/lib/i18n/config"
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

/**
 * Metadata de uma página pública.
 *
 * O canonical é o caminho limpo, sem parâmetros: `?utm_*`, `?checkout=` e
 * afins apontam para a mesma página. Não há `hreflang` porque as versões /en e
 * /es ainda não existem: o idioma vem do cookie, e a URL é uma só.
 *
 * `absoluto` tira o sufixo " | Multioráculo" do título (só a Home usa).
 */
export function paginaPublica(p: {
  caminho: string
  titulo: string
  descricao: string
  locale: Locale
  absoluto?: boolean
}): Metadata {
  const url = urlAbsoluta(p.caminho)
  const tituloCompleto = p.absoluto ? p.titulo : `${p.titulo} | ${SITE_NAME}`
  return {
    title: p.absoluto ? { absolute: p.titulo } : p.titulo,
    description: p.descricao,
    alternates: { canonical: p.caminho },
    // o Next NÃO herda o openGraph do layout quando a página define o seu:
    // por isso a página repete tudo, inclusive a imagem
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: localeOg(p.locale),
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
