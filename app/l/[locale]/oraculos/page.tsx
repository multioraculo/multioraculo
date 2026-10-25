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
  return metadataDaRotaEstatica("oraculos", locale)
}

export default async function OraculosPage({ params }: { params: Params }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale).oraclesPage

  return (
    <ShaderBackground>
      <Header />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-light italic instrument text-white mb-8">{t.title}</h1>
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-3">{t.whatIsTitle}</h2>
              <p className="text-white/80 leading-relaxed text-sm">{t.whatIsText}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-3">{t.howTitle}</h2>
              <div className="space-y-3 text-white/80 text-sm">
                {t.how.map((item) => (
                  <div key={item.title}>
                    <h3 className="font-medium text-white mb-1 text-sm">{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-3">{t.askTitle}</h2>
              <div className="space-y-3 text-white/80 text-sm">
                <p>{t.askIntro}</p>
                <div className="space-y-1">
                  {t.askExamples.map((ex) => (
                    <p key={ex.label}>
                      <strong className="text-white">{ex.label}</strong> {ex.example}
                    </p>
                  ))}
                </div>
                <p>{t.askOutro}</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-3">{t.deliversTitle}</h2>
              <p className="text-white/80 leading-relaxed text-sm">{t.deliversText}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-4">{t.traditionsTitle}</h2>
              <p className="text-white/80 leading-relaxed text-sm mb-6">{t.traditionsIntro}</p>

              <div className="space-y-6">
                {t.traditions.map((tr) => (
                  <div key={tr.title}>
                    <h3 className="text-lg font-medium text-white mb-2">{tr.title}</h3>
                    <p className="text-white/80 leading-relaxed text-sm">{tr.text}</p>
                  </div>
                ))}

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mt-6">
                  <h3 className="text-lg font-medium text-white mb-2">{t.whyTogetherTitle}</h3>
                  <div className="space-y-3">
                    {t.whyTogether.map((paragrafo, i) => (
                      <p key={i} className="text-white/80 leading-relaxed text-sm">{paragrafo}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
