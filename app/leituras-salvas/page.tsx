import { redirect } from "next/navigation"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import ConsultationsList from "@/components/consultations-list"
import { createClient } from "@/lib/supabase/server"
import type { Consultation } from "@/lib/types"

export default async function LeiturasSalvasPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/")
  }

  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_saved", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao carregar leituras salvas:", error)
  }

  const consultations = (data ?? []) as Consultation[]

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-white mb-6">Leituras Salvas</h1>
          </div>

          <ConsultationsList consultations={consultations} />
        </div>
      </div>
    </ShaderBackground>
  )
}
