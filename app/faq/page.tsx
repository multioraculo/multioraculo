import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import { getI18n } from "@/lib/i18n/server"

export default async function FAQPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { dict } = await getI18n()

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
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
