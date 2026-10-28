import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import SavedDreamsList from "@/components/saved-dreams-list"
import { createClient } from "@/lib/supabase/server"
import { usuarioDaRequisicao } from "@/lib/auth/usuario-da-requisicao"
import { getI18n } from "@/lib/i18n/server"
import { ultimaAnaliseDoUsuario, type LinhaDeJornada } from "@/lib/dreams/jornada-estado"
import type { Dream } from "@/lib/types"
import { paginaPrivada } from "@/lib/seo/metadata"

// pessoal ou painel: fora do índice. Sinal de indexação, não controle de acesso.
export const metadata = paginaPrivada()

export default async function SonhosSalvosPage() {
  const supabase = await createClient()
  const { dict } = await getI18n()

  // quem está logado vem do getUser() que o middleware já fez nesta requisição
  const user = await usuarioDaRequisicao()

  let dreams: Dream[] = []
  let journey: LinhaDeJornada | null = null
  if (user) {
    const { data } = await supabase
      .from("dreams")
      .select("id, user_id, dream_description, interpretation, personal_notes, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    dreams = (data ?? []) as Dream[]
    // a leitura mais recente da Jornada, se houver; nada é gerado ao abrir a página
    if (dreams.length >= 2) journey = await ultimaAnaliseDoUsuario(supabase, user.id).catch(() => null)
  }

  return (
    <ShaderBackground>
      <Header initialUser={user ?? null} />
      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          {user ? (
            <SavedDreamsList initialDreams={dreams} userId={user.id} initialJourney={journey} />
          ) : (
            <div className="text-center py-20">
              <p className="text-white/40 text-sm mb-4">{dict.dreams.loginToSee}</p>
            </div>
          )}
        </div>
      </div>
    </ShaderBackground>
  )
}
