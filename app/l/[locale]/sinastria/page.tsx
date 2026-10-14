import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import SinastriaPage from "@/components/sinastria-page"
import { usuarioDaRequisicao } from "@/lib/auth/usuario-da-requisicao"
import { getI18n } from "@/lib/i18n/server"
import { getUserEntitlement } from "@/lib/billing/entitlement"
import { hasAstroPessoal } from "@/lib/billing/plans"
import { paginaPrivada } from "@/lib/seo/metadata"

export const metadata = paginaPrivada()

/**
 * Sinastria: o mapa de quem lê encontrando o mapa de outra pessoa.
 *
 * A página abre para quem não tem conta ou plano, de propósito: o que ela faz
 * e o que vai pedir ficam à vista antes de qualquer login ou pagamento. O
 * título é renderizado aqui, no servidor, para ser a primeira coisa a aparecer
 * e não deslocar o que vem depois.
 *
 * O plano é resolvido aqui e o cliente só recebe `temPlano`, um booleano: é
 * aparência, não autorização. Quem decide de verdade são as rotas
 * (`/api/sinastria`), que conferem o entitlement outra vez antes de qualquer
 * cálculo.
 *
 * Fica fora das páginas públicas indexáveis (noindex), como o restante da área
 * pessoal: a sinastria lida com dados de nascimento de terceiros.
 */
export const dynamic = "force-dynamic"

export default async function Sinastria() {
  // quem está logado vem do getUser() que o middleware já fez nesta requisição
  const user = await usuarioDaRequisicao()
  const { dict } = await getI18n()

  const entitlement = user ? await getUserEntitlement(user.id) : null
  const temPlano = hasAstroPessoal(entitlement?.plan)

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-16 sm:pt-24 pb-24">
        {/* a largura cresce no desktop, a medida de leitura não: cada bloco de
            texto corrido continua limitado lá dentro */}
        <div className="max-w-xl lg:max-w-6xl mx-auto px-5 sm:px-8">
          <header className="mb-9 sm:mb-12">
            <h1 className="text-white/95 instrument italic text-3xl sm:text-4xl">{dict.sinastria.title}</h1>
            <p className="text-white/45 text-[15px] leading-relaxed font-light mt-2.5 max-w-lg">{dict.sinastria.lede}</p>
          </header>

          <SinastriaPage initialUser={user} temPlano={temPlano} />
        </div>
      </div>
    </ShaderBackground>
  )
}
