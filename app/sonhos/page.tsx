import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import DreamsPage from "@/components/dreams-page"
import { createClient } from "@/lib/supabase/server"

export default async function SonhosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ShaderBackground>
      <Header initialUser={user ?? null} />
      <DreamsPage />
    </ShaderBackground>
  )
}
