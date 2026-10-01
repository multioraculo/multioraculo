import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import InterconexoesPage from "@/components/interconexoes-page"
import { createClient } from "@/lib/supabase/server"
import { getI18n } from "@/lib/i18n/server"
import { formatDate } from "@/lib/i18n"
import { diaDeHoje } from "@/lib/astro/ceu"
import { getUserEntitlement } from "@/lib/billing/entitlement"
import { isPaidPlan } from "@/lib/billing/plans"

/**
 * Interconexões: o céu de hoje encontrando o mapa da pessoa.
 *
 * A página é aberta para quem não tem conta, de propósito. A promessa e o que
 * vai ser pedido ficam à vista antes de qualquer login: ninguém entrega data,
 * hora e cidade de nascimento sem antes saber para quê.
 *
 * O TÍTULO E A DATA ABREM A PÁGINA FORA DE QUALQUER PLACA, e são renderizados
 * aqui no servidor: são a primeira coisa que aparece, não dependem de nenhuma
 * busca e por isso nunca deslocam o que vem depois.
 *
 * O plano também é resolvido aqui. O cliente só recebe `temPlano`, um booleano:
 * é o que decide se a placa da síntese mostra o botão ou o caminho para os
 * planos. Quem decide de verdade é a rota, que confere o entitlement outra vez
 * antes de qualquer chamada paga — este booleano é aparência, não autorização.
 */
export const dynamic = "force-dynamic"

export default async function Interconexoes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { dict, locale } = await getI18n()

  const entitlement = user ? await getUserEntitlement(user.id) : null
  const temPlano = isPaidPlan(entitlement?.plan)

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-16 sm:pt-24 pb-24">
        {/* A largura cresce no desktop, a medida de leitura não: cada bloco de
            texto corrido continua limitado lá dentro, e a largura extra é gasta
            em composição. No celular e no tablet nada muda. */}
        <div className="max-w-xl lg:max-w-6xl mx-auto px-5 sm:px-8">
          <header className="mb-7 sm:mb-9">
            <h1 className="text-white/95 instrument italic text-3xl sm:text-4xl">{dict.interconexoes.title}</h1>
            <p className="text-white/45 text-[15px] leading-relaxed font-light mt-2.5 max-w-lg">
              {dict.interconexoes.homeBody}
            </p>
            <p className="text-white/30 text-[13px] font-light mt-3 tabular-nums">
              {formatDate(`${diaDeHoje()}T12:00:00`, locale, "long")}
            </p>
          </header>

          <InterconexoesPage initialUser={user} temPlano={temPlano} />
        </div>
      </div>
    </ShaderBackground>
  )
}
