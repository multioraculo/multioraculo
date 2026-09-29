import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import TarotSpread from "@/components/tarot-spread"
import LenormandTable from "@/components/lenormand-table"
import { createClient } from "@/lib/supabase/server"
import type { TarotCardRef } from "@/lib/oracles/tarot-assets"
import type { LenormandCardRef } from "@/components/lenormand-table"

// BANCADA: exercita o giro das cartas com dados fixos, para conferir o flip
// sem precisar de uma consulta paga. Não commitar.
export const dynamic = "force-dynamic"

const TAROT = [
  { position: "Origem", name: "A Imperatriz", orientation: "direita", meaning: "Abundância que se organiza: o que estava disperso encontra forma e começa a render." },
  { position: "Percurso", name: "O Enforcado", orientation: "invertida", meaning: "Suspensão que não é parada: a espera muda o ângulo de quem olha, e o que parecia travado se reorganiza por dentro." },
  { position: "Direção", name: "Oito de Copas", orientation: "direita", meaning: "Partida deliberada: alguma coisa foi boa e terminou, e seguir adiante não é abandono." },
]

const LENORMAND = [
  { position: "Passado", index: 22, name: "Caminhos" },
  { position: "Presente", index: 12, name: "Pássaros" },
  { position: "Futuro", index: 4, name: "Casa" },
  { position: "Apoio", index: 17, name: "Cegonha" },
  { position: "Centro", index: 24, name: "Coração" },
  { position: "Obstáculo", index: 9, name: "Buquê" },
  { position: "Conselho", index: 31, name: "Sol" },
  { position: "Desfecho", index: 1, name: "Trevo" },
  { position: "Síntese", index: 28, name: "Homem" },
].map((c) => ({ ...c, meaning: `Significado de prova para ${c.name}, longo o bastante para ver como o verso se comporta quando o texto ocupa várias linhas dentro da lâmina.` }))

const CARTAS_TAROT: TarotCardRef[] = [
  { id: "major-03", arcana: "major", number: 3, reversed: false },
  { id: "major-12", arcana: "major", number: 12, reversed: true },
  { id: "cups-08", arcana: "minor", suit: "cups", rank: 8, reversed: false },
]

const CARTAS_LENORMAND: LenormandCardRef[] = [22, 12, 4, 17, 24, 9, 31, 1, 28].map((n) => ({
  id: String(n),
  number: n,
}))

export default async function PreviewFlip() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ShaderBackground>
      <Header initialUser={user} />
      <div className="relative z-10 min-h-screen pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 space-y-16">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45 mb-4">Bancada · tarô</p>
            <TarotSpread items={TAROT} cards={CARTAS_TAROT} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45 mb-4">Bancada · lenormand</p>
            <LenormandTable items={LENORMAND} cards={CARTAS_LENORMAND} />
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
