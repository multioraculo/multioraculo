import type { Metadata } from "next"
import { getI18n } from "@/lib/i18n/server"
import type { ChavePagina } from "./paginas"
import { paginaPublica } from "./metadata"

/**
 * Metadata de uma rota pública, no idioma da URL (o middleware informa o
 * idioma ao servidor). Só para Server Components. Cada página chama com a sua
 * chave:
 *
 *   export const generateMetadata = () => metadataDaRota("faq")
 */
export async function metadataDaRota(chave: ChavePagina): Promise<Metadata> {
  const { dict, locale } = await getI18n()
  const { title, description } = dict.seo[chave]
  return paginaPublica({
    chave,
    titulo: title,
    descricao: description,
    locale,
    absoluto: chave === "home",
  })
}
