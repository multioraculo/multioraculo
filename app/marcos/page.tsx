import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import MarcosLista from "@/components/marcos-lista"
import { createClient } from "@/lib/supabase/server"
import { getI18n } from "@/lib/i18n/server"

/**
 * Os marcos pessoais: contagens que a própria pessoa define.
 *
 * Fica fora de Registros de propósito: não é um registro do que aconteceu, é
 * um tempo em curso. Chega pela Home, que é onde ele é contado.
 */
export const dynamic = "force-dynamic"

export default async function MarcosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { dict } = await getI18n()

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-24 pb-24">
        <div className="max-w-xl mx-auto px-5 sm:px-8">
          <h1 className="text-white/95 instrument italic text-3xl sm:text-4xl mb-6">{dict.marcos.title}</h1>
          {user ? <MarcosLista /> : <p className="text-white/50 text-sm font-light leading-relaxed">{dict.marcos.needAccount}</p>}
        </div>
      </div>
    </ShaderBackground>
  )
}
