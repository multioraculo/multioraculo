import { Engine } from "caelus"
import { embeddedData } from "caelus/data-embedded"
import { toUT } from "caelus-birth"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import AstroWheel, { GlifoPlaneta, type CorpoRoda } from "@/components/astro-wheel"
import { createClient } from "@/lib/supabase/server"

// TEMPORÁRIO: confere a roda do mapa com um nascimento fixo. Não commitar.
export const dynamic = "force-dynamic"

const CASO = { year: 1988, month: 3, day: 14, hour: 21, minute: 40, zone: "America/Sao_Paulo", lat: -19.92, lon: -43.94, lugar: "Belo Horizonte, MG" }
const CORPOS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]

// Os nomes vêm do código, nunca do modelo — a mesma regra que já vale para os outros oráculos.
const NOMES: Record<string, string> = {
  sun: "Sol", moon: "Lua", mercury: "Mercúrio", venus: "Vênus", mars: "Marte",
  jupiter: "Júpiter", saturn: "Saturno", uranus: "Urano", neptune: "Netuno", pluto: "Plutão",
}
const SIGNOS: Record<string, string> = {
  Aries: "Áries", Taurus: "Touro", Gemini: "Gêmeos", Cancer: "Câncer", Leo: "Leão", Virgo: "Virgem",
  Libra: "Libra", Scorpio: "Escorpião", Sagittarius: "Sagitário", Capricorn: "Capricórnio",
  Aquarius: "Aquário", Pisces: "Peixes",
}

const ORDEM_SIGNOS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
const grauMinuto = (g: number) => {
  const grau = Math.floor(g)
  const minuto = Math.round((g - grau) * 60)
  return minuto === 60 ? `${grau + 1}°00'` : `${grau}°${String(minuto).padStart(2, "0")}'`
}
const signoDe = (lon: number) => SIGNOS[ORDEM_SIGNOS[Math.floor((((lon % 360) + 360) % 360) / 30)]]

export default async function PreviewRoda() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ut = toUT(CASO)
  const engine = new Engine(embeddedData)
  const mapa = engine.chart(ut.utc.year, ut.utc.month, ut.utc.day, ut.utc.hour, ut.utc.minute, ut.utc.second, CASO.lat, CASO.lon, "placidus")

  const bodies = mapa.bodies as unknown as Record<string, { lon: number; retrograde: boolean; sign: string; signDeg: number; house: number }>
  const corpos: CorpoRoda[] = CORPOS.map((id) => ({ id, lon: bodies[id].lon, retrogrado: bodies[id].retrograde }))
  const aspectos = (mapa.aspects as unknown as Array<{ a: string; b: string; aspect: string; strength: number }>)
    .filter((a) => CORPOS.includes(a.a) && CORPOS.includes(a.b))
    .map((a) => ({ a: a.a, b: a.b, tipo: a.aspect, forca: a.strength }))

  const linhas = [
    ...CORPOS.map((id) => ({
      id,
      nome: NOMES[id],
      posicao: `${grauMinuto(bodies[id].signDeg)} ${SIGNOS[bodies[id].sign] ?? bodies[id].sign}`,
      casa: `casa ${bodies[id].house}`,
      retro: bodies[id].retrograde,
    })),
    { id: "asc", nome: "Ascendente", posicao: `${grauMinuto(mapa.angles.asc % 30)} ${signoDe(mapa.angles.asc)}`, casa: "", retro: false },
    { id: "mc", nome: "Meio-do-Céu", posicao: `${grauMinuto(mapa.angles.mc % 30)} ${signoDe(mapa.angles.mc)}`, casa: "", retro: false },
  ]

  const data = `${String(CASO.day).padStart(2, "0")}/${String(CASO.month).padStart(2, "0")}/${CASO.year}`
  const hora = `${String(CASO.hour).padStart(2, "0")}:${String(CASO.minute).padStart(2, "0")}`

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45 mb-2">Conferência · dados fixos</p>
          <h1 className="text-white text-4xl sm:text-5xl font-light italic instrument mb-8">A roda do mapa</h1>

          <article className="rounded-2xl border border-white/12 bg-[linear-gradient(168deg,rgba(112,88,214,0.34)_0%,rgba(84,62,190,0.40)_50%,rgba(70,50,168,0.46)_100%)] backdrop-blur-md overflow-hidden">
            <header className="px-5 sm:px-8 pt-6 pb-4 text-center">
              <p className="text-[#f4ead8]/90 text-sm">{CASO.lugar}</p>
              <p className="text-[#f4ead8]/50 text-xs mt-0.5 tabular-nums">
                {data} · {hora} · {ut.zone}
              </p>
            </header>

            <div className="px-3 sm:px-8 flex justify-center">
              <AstroWheel
                corpos={corpos}
                cuspides={mapa.cusps as number[]}
                asc={mapa.angles.asc}
                mc={mapa.angles.mc}
                aspectos={aspectos}
                tamanho={600}
              />
            </div>

            <div className="mt-2 border-t border-[#f4ead8]/12 px-5 sm:px-8 py-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#f4ead8]/45 mb-3">Posições</p>
              <ul className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
                {linhas.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-[7px] border-b border-[#f4ead8]/8 last:border-0">
                    <span className="text-[#f4ead8]/80 shrink-0 w-5 flex justify-center">
                      {GLIFOS_COM_GLIFO.includes(l.id) ? <GlifoPlaneta id={l.id} tamanho={17} /> : null}
                    </span>
                    <span className="text-[#f4ead8]/85 text-sm flex-1">{l.nome}</span>
                    <span className="text-[#f4ead8]/70 text-sm tabular-nums whitespace-nowrap">
                      {l.posicao}
                      {l.retro ? " ℞" : ""}
                    </span>
                    <span className="text-[#f4ead8]/40 text-xs w-[58px] text-right whitespace-nowrap">{l.casa}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <p className="mt-4 text-white/35 text-xs">
            Hora local resolvida como {ut.status} · fuso {ut.offsetMinutes / 60}h · casas {mapa.houseSystem}
          </p>
        </div>
      </div>
    </ShaderBackground>
  )
}

const GLIFOS_COM_GLIFO = CORPOS
