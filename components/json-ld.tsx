import { serializarLd } from "@/lib/seo/json-ld"

/** Um bloco application/ld+json. Os dados vêm de lib/seo/json-ld.ts, nunca de entrada de usuário. */
export default function JsonLd({ dados }: { dados: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarLd(dados) }} />
}
