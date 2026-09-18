import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import InterconexoesPage from "@/components/interconexoes-page"
import { createClient } from "@/lib/supabase/server"
import { getI18n } from "@/lib/i18n/server"

/**
 * Interconexões: o céu de hoje encontrando o mapa da pessoa.
 *
 * A página é aberta para quem não tem conta, de propósito. A promessa e o que
 * vai ser pedido ficam à vista antes de qualquer login: ninguém entrega data,
 * hora e cidade de nascimento sem antes saber para quê.
 */
export const dynamic = "force-dynamic"

export default async function Interconexoes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { dict } = await getI18n()

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-24 pb-24">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <h1 className="text-white/95 instrument italic text-3xl sm:text-4xl mb-8">{dict.interconexoes.title}</h1>
          <InterconexoesPage initialUser={user} />
        </div>
      </div>
    </ShaderBackground>
  )
}
