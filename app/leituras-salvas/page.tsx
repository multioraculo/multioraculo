import { redirect } from "next/navigation"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import ConsultationsList from "@/components/consultations-list"
import { createClient } from "@/lib/supabase/server"
import { getI18n } from "@/lib/i18n/server"
import type { ConsultationNaLista } from "@/lib/types"
import { paginaPrivada } from "@/lib/seo/metadata"

// pessoal ou painel: fora do índice. Sinal de indexação, não controle de acesso.
export const metadata = paginaPrivada()

export default async function LeiturasSalvasPage() {
  const supabase = await createClient()
  const { dict } = await getI18n()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/")
  }

  const { data, error } = await supabase
    .from("consultations")
    // SÓ O QUE A LISTA MOSTRA. `oracle_outputs` e `selected_oracles` são jsonb
    // com a saída inteira dos cinco oráculos, e vinham em toda linha sem nunca
    // serem lidos aqui: a lista usa id, pergunta, síntese e data, e o detalhe
    // busca o resto quando alguém abre uma leitura.
    .select("id, question, synthesis, created_at")
    .eq("user_id", user.id)
    .eq("is_saved", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao carregar leituras salvas:", error)
  }

  const consultations = (data ?? []) as ConsultationNaLista[]

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-white mb-6">{dict.savedReadings.title}</h1>
          </div>

          <ConsultationsList consultations={consultations} />
        </div>
      </div>
    </ShaderBackground>
  )
}
