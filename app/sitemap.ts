import type { MetadataRoute } from "next"
import { LOCALES } from "@/lib/i18n/config"
import { ROTAS_PUBLICAS } from "@/lib/i18n/rotas"
import { alternativasDeIdioma } from "@/lib/seo/metadata"
import { urlAbsoluta } from "@/lib/seo/site"

/**
 * As 21 URLs públicas (7 páginas x 3 idiomas). Cada uma declara as quatro
 * alternativas (pt-BR, en, es, x-default), as mesmas do <head>, e todas
 * apontam para URLs que existem.
 *
 * Sem `lastModified`: nenhuma destas páginas tem uma data de alteração que o
 * código saiba afirmar com verdade, e uma data inventada ensina o Google a
 * ignorar o campo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROTAS_PUBLICAS.flatMap((rota) =>
    LOCALES.map((locale) => ({
      url: urlAbsoluta(rota[locale]),
      alternates: { languages: alternativasDeIdioma(rota.chave) },
    })),
  )
}
