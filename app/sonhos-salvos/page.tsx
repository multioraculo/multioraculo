import { redirect } from "next/navigation"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import SavedDreamsList from "@/components/saved-dreams-list"
import { createClient } from "@/lib/supabase/server"
import type { Dream } from "@/lib/types"

export default async function SonhosSalvosPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect("/")

  const { data, error } = await supabase
    .from("dreams")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) console.error("Erro ao carregar sonhos:", error)

  const dreams = (data ?? []) as Dream[]

  return (
    <ShaderBackground>
      <Header initialUser={user} />
      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <SavedDreamsList initialDreams={dreams} userId={user.id} />
        </div>
      </div>
    </ShaderBackground>
  )
}
