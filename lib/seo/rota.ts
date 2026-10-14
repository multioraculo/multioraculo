import type { Metadata } from "next"
import { getI18n } from "@/lib/i18n/server"
import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
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
  const { locale } = await getI18n()
  return metadataDaRotaEstatica(chave, locale)
}

/**
 * A mesma metadata, com o idioma vindo de `params`: é a versão das páginas
 * estáticas, que não podem ler cookies nem cabeçalhos (ver app/l/[locale]).
 */
export function metadataDaRotaEstatica(chave: ChavePagina, locale: Locale): Metadata {
  const { title, description } = getDictionary(locale).seo[chave]
  return paginaPublica({
    chave,
    titulo: title,
    descricao: description,
    locale,
    absoluto: chave === "home",
  })
}
