import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import HeroContent from "@/components/hero-content"
import ShaderBackground from "@/components/shader-background"
import JsonLd from "@/components/json-ld"
import { organizationLd, websiteLd } from "@/lib/seo/json-ld"
import { metadataDaRota } from "@/lib/seo/rota"

export const generateMetadata = () => metadataDaRota("home")

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ShaderBackground>
      <JsonLd dados={[organizationLd(), websiteLd()]} />
      <Header initialUser={user} />
      <HeroContent initialUser={user} />
    </ShaderBackground>
  )
}
