import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import DreamsPage from "@/components/dreams-page"
import { usuarioDaRequisicao } from "@/lib/auth/usuario-da-requisicao"
import { metadataDaRota } from "@/lib/seo/rota"

export const generateMetadata = () => metadataDaRota("sonhos")

export default async function SonhosPage() {
  // quem está logado vem do getUser() que o middleware já fez nesta requisição
  const user = await usuarioDaRequisicao()

  return (
    <ShaderBackground tone="sonhos">
      <Header initialUser={user ?? null} />
      <DreamsPage isLoggedIn={Boolean(user)} />
    </ShaderBackground>
  )
}
