import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import HoroscopePage from "@/components/horoscope-page"
import { createClient } from "@/lib/supabase/server"
import { getI18n } from "@/lib/i18n/server"

/**
 * Horóscopo: o texto do dia dos doze signos. Aberto a visitante, sem cota —
 * é a porta de entrada da área de astrologia, e não há dado pessoal nele.
 * O mapa astral, que tem, vem depois e atrás de login.
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
          <HoroscopePage />
        </div>
      </div>
    </ShaderBackground>
  )
}
