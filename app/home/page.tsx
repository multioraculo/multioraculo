import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import HomeHoje, { type RegistroDeHoje } from "@/components/home-hoje"
import { createClient } from "@/lib/supabase/server"

/**
 * A Home: o dia de hoje reunido num lugar só.
 *
 * O servidor traz só uma coisa: se já existe registro de hoje no Diário, para
 * o fecho da página convidar a continuar em vez de convidar a começar. O
 * resto (a Lua, a tiragem do dia, o horóscopo, os marcos) é buscado no
 * cliente, porque depende do navegador ou de rota própria.
 *
 * Esta primeira etapa mora em /home. A migração de "/" fica para depois, com
 * os fluxos de login e paywall testados: eles vivem na consulta, e mover as
 * duas coisas ao mesmo tempo seria trocar o piso e a parede juntos.
 */
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let registro: RegistroDeHoje = null
  if (user) {
    const { data } = await supabase
      .from("journal_entries")
      .select("title, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
    const ultimo = data?.[0]
    if (ultimo) {
      const texto = (ultimo.title as string) || (ultimo.content as string) || ""
      registro = {
        titulo: texto.length > 90 ? `${texto.slice(0, 90).trimEnd()}…` : texto,
        hoje: mesmoDia(ultimo.created_at as string),
      }
    }
  }

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      {/* menos respiro no topo do celular: eram 96px entre o cabeçalho e o
          título, e eles empurravam as cartas para fora da primeira dobra. No
          desktop, onde sobra altura, a folga original fica. */}
      <div className="relative z-10 min-h-screen pt-16 sm:pt-24 pb-24">
        {/* A largura cresce no desktop, a medida de leitura não: cada bloco de
            texto corrido continua limitado lá dentro, e a largura extra é gasta
            em composição. No celular e no tablet nada muda. */}
        <div className="max-w-xl lg:max-w-5xl mx-auto px-5 sm:px-8">
          <HomeHoje initialUser={user} registro={registro} />
        </div>
      </div>
    </ShaderBackground>
  )
}

/** Mesmo dia civil de São Paulo, que é o dia declarado do produto. */
function mesmoDia(iso: string): boolean {
  const formatar = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(d)
  return formatar(new Date(iso)) === formatar(new Date())
}
