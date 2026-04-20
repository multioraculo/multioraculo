import { redirect } from "next/navigation"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import DreamsPage from "@/components/dreams-page"
import { createClient } from "@/lib/supabase/server"
import type { Dream } from "@/lib/types"

export default async function SonhosPage() {
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
      <DreamsPage initialDreams={dreams} />
    </ShaderBackground>
  )
}
