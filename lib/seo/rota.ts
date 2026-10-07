import type { Metadata } from "next"
import { getI18n } from "@/lib/i18n/server"
import { PAGINAS_INDEXAVEIS, type ChavePagina } from "./paginas"
import { paginaPublica } from "./metadata"

/**
 * Metadata de uma rota pública, no idioma do cookie. Só para Server
 * Components (lê o cookie). Cada página chama com a sua chave:
 *
 *   export const generateMetadata = () => metadataDaRota("faq")
 */
export async function metadataDaRota(chave: ChavePagina): Promise<Metadata> {
  const { dict, locale } = await getI18n()
  const pagina = PAGINAS_INDEXAVEIS.find((p) => p.chave === chave)
  if (!pagina) throw new Error(`rota pública desconhecida: ${chave}`)
  const { title, description } = dict.seo[chave]
  return paginaPublica({
    caminho: pagina.caminho,
    titulo: title,
    descricao: description,
    locale,
    absoluto: chave === "home",
  })
}
