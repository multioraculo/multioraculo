import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import HeroContent from "@/components/hero-content"
import ShaderBackground from "@/components/shader-background"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ShaderBackground>
      <Header initialUser={user} />
      <HeroContent initialUser={user} />
    </ShaderBackground>
  )
}
