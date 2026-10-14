import { notFound } from "next/navigation"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import { getDictionary } from "@/lib/i18n"
import { isLocale } from "@/lib/i18n/config"
import { metadataDaRotaEstatica } from "@/lib/seo/rota"

type Params = Promise<{ locale: string }>

/**
 * PÁGINA ESTÁTICA: gerada no build nos três idiomas e servida pelo CDN, sem
 * função. Para continuar assim, ela não pode ler cookies nem cabeçalhos: o
 * idioma vem de `params`, e o cabeçalho descobre quem está logado no cliente,
 * a partir do cookie de sessão, depois de hidratar (initialUser indefinido).
 * Qualquer `cookies()`, `headers()` ou `getI18n()` aqui a devolve à função.
 */
export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return metadataDaRotaEstatica("faq", locale)
}

export default async function FAQPage({ params }: { params: Params }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)

  return (
    <ShaderBackground>
      <Header />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-light italic instrument text-white mb-8">{dict.faq.title}</h1>
          <div className="space-y-4">
            {dict.faq.items.map((faq, index) => (
              <div key={index} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-light text-white mb-3">{faq.q}</h3>
                <p className="text-white/80 leading-relaxed text-sm whitespace-pre-line">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
