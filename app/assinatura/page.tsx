import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import { getI18n } from "@/lib/i18n/server"

export default async function AssinaturaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { dict } = await getI18n()
  const t = dict.subscription

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-lg mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl md:leading-tight tracking-tight font-light text-white mb-4">
              <span className="font-medium italic instrument">{dict.common.appName}</span>{t.titleSuffix}
            </h1>

            <p className="text-base sm:text-lg font-light text-white/70 leading-relaxed">{t.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Essencial Plan */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-light text-white mb-2">{t.essential.name}</h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-light text-white">{t.essential.price}</span>
                  <span className="text-white/60">{t.perMonth}</span>
                </div>
                <p className="text-white/80 font-medium mb-4">{t.essential.tagline}</p>
                <p className="text-white/70 text-base">{t.essential.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {t.essential.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-white/80 text-sm">
                    <span className="text-green-400 mt-1">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mb-6">
                <p className="text-white/60 text-xs mb-2">{t.forWhom}</p>
                <p className="text-white/80 text-sm">{t.essential.forWhom}</p>
              </div>

              <button className="w-full py-3 px-6 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full font-medium text-sm hover:bg-white/15 hover:scale-105 transition-all duration-200">
                {t.essential.cta}
              </button>
            </div>

            {/* Ilimitado Plan */}
            <div className="backdrop-blur-md bg-white/15 border border-white/30 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="backdrop-blur-md bg-gradient-to-r from-purple-400/80 to-pink-400/80 border border-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {t.mostPopular}
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-light text-white mb-2">{t.unlimited.name}</h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-light text-white">{t.unlimited.price}</span>
                  <span className="text-white/60">{t.perMonth}</span>
                </div>
                <p className="text-white/80 font-medium mb-4">{t.unlimited.tagline}</p>
                <p className="text-white/70 text-base">{t.unlimited.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {t.unlimited.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-white/80 text-sm">
                    <span className="text-green-400 mt-1">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mb-6">
                <p className="text-white/60 text-xs mb-2">{t.forWhom}</p>
                <p className="text-white/80 text-sm">{t.unlimited.forWhom}</p>
              </div>

              <button className="w-full py-3 px-6 backdrop-blur-md bg-white/15 border border-white/30 text-white rounded-full font-medium text-sm hover:bg-white/20 hover:scale-105 transition-all duration-200">
                {t.unlimited.cta}
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 mb-16">
            <h3 className="text-white font-medium mb-4">{t.notesTitle}</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              {t.notes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
