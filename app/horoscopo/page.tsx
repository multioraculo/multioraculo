import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import { createClient } from "@/lib/supabase/server"
import { getI18n } from "@/lib/i18n/server"

/**
 * Horóscopo: a área nasce aqui, ainda sem conteúdo. O item já existe na
 * navegação, então a rota precisa existir junto — um link para lugar nenhum
 * seria pior do que uma página que diz o que vem.
 */
export const dynamic = "force-dynamic"

export default async function HoroscopoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { dict } = await getI18n()

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <h1 className="text-white text-5xl sm:text-6xl font-light italic instrument mb-6">{dict.horoscope.title}</h1>
          <p className="text-white/60 text-base leading-relaxed max-w-xl">{dict.horoscope.soon}</p>
        </div>
      </div>
    </ShaderBackground>
  )
}
