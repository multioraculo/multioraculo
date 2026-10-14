import { usuarioDaRequisicao } from "@/lib/auth/usuario-da-requisicao"
import Header from "@/components/header"
import HeroContent from "@/components/hero-content"
import ShaderBackground from "@/components/shader-background"
import JsonLd from "@/components/json-ld"
import { organizationLd, websiteLd } from "@/lib/seo/json-ld"
import { getI18n } from "@/lib/i18n/server"
import { metadataDaRota } from "@/lib/seo/rota"

export const generateMetadata = () => metadataDaRota("home")

export default async function HomePage() {
  // quem está logado vem do getUser() que o middleware já fez nesta requisição
  const user = await usuarioDaRequisicao()
  const { dict } = await getI18n()

  return (
    <ShaderBackground>
      <JsonLd dados={[organizationLd(), websiteLd(dict.seo.home.description)]} />
      <Header initialUser={user} />
      <HeroContent initialUser={user} />
    </ShaderBackground>
  )
}
