import type { MetadataRoute } from "next"
import { PAGINAS_INDEXAVEIS } from "@/lib/seo/paginas"
import { urlAbsoluta } from "@/lib/seo/site"
import { diaDeHoje } from "@/lib/astro/ceu"

/**
 * Só as páginas indexáveis, na URL canônica. Sem alternates de idioma: /en e
 * /es não existem ainda, e apontar hreflang para o que não existe é erro.
 *
 * `lastModified` só onde é verdadeiro: o horóscopo muda todo dia. As demais
 * ficam sem data em vez de carregar um "agora" que mente a cada build.
 */
export const dynamic = "force-dynamic"

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGINAS_INDEXAVEIS.map((p) => ({
    url: urlAbsoluta(p.caminho),
    ...(p.caminho === "/horoscopo" ? { lastModified: diaDeHoje() } : {}),
  }))
}
