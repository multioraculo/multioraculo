import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import { getI18n } from "@/lib/i18n/server"

export default async function OraculosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { dict } = await getI18n()
  const t = dict.oraclesPage

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
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
                  <p className="text-white/80 leading-relaxed text-sm">{t.whyTogetherText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
