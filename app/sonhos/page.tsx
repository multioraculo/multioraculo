import { redirect } from "next/navigation"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import DreamsPage from "@/components/dreams-page"
import { createClient } from "@/lib/supabase/server"

export default async function SonhosPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect("/")

  return (
    <ShaderBackground>
      <Header initialUser={user} />
      <DreamsPage />
    </ShaderBackground>
  )
}
