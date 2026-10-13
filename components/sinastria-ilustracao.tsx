/**
 * O cruzamento de dois mapas, na mesma gravura da roda do mapa: filete fino,
 * marfim sobre a lâmina violeta, sem preenchimento.
 *
 * É UMA ILUSTRAÇÃO DO CONCEITO, e não o mapa de ninguém: duas rodas de doze
 * signos que se sobrepõem, com alguns planetas voltados para a região comum e
 * os aspectos que cruzam de uma roda à outra. Os aspectos seguem a convenção
 * da roda do mapa: contato duro em traço contínuo, contato suave em traço
 * pontilhado, e a distinção é de forma e não de cor. Os glifos são os mesmos
 * da roda (`GLIFOS`), então nada aqui é um desenho paralelo.
 *
 * Decorativa: `aria-hidden`. O texto da chamada diz o que ela mostra. Os
 * caminhos são arredondados a três casas: seno e cosseno podem diferir no
 * último dígito entre o Node e o navegador, e o React acusaria erro de
 * hidratação.
 */
import { GLIFOS } from "@/components/astro-wheel"

const rad = (g: number) => (g * Math.PI) / 180
const arred = (n: number) => Math.round(n * 1000) / 1000

const L = 320
const A = 160
const R = 64
const CA: [number, number] = [104, A / 2]
const CB: [number, number] = [216, A / 2]

const noAnel = (c: [number, number], graus: number, raio: number): [number, number] => [
  arred(c[0] + Math.cos(rad(graus)) * raio),
  arred(c[1] + Math.sin(rad(graus)) * raio),
]

/** Doze marcas de signo, de trinta em trinta graus, entre dois raios. */
function Marcas({ c }: { c: [number, number] }) {
  const d = Array.from({ length: 12 }, (_, i) => {
    const [x1, y1] = noAnel(c, i * 30, R)
    const [x2, y2] = noAnel(c, i * 30, R - 7)
    return `M${x1} ${y1}L${x2} ${y2}`
  }).join("")
  return <path d={d} strokeWidth={0.8} opacity={0.5} />
}

/** Um planeta no anel: o glifo da roda, centrado no ponto. */
function Planeta({ id, p }: { id: string; p: [number, number] }) {
  return (
    <g transform={`translate(${p[0]} ${p[1]}) scale(0.95)`}>
      <path d={GLIFOS[id]} strokeWidth={1.25} />
    </g>
  )
}

// planetas de cada um: três voltados para a região comum e um do lado de fora
const PLANETAS_A: Array<[string, number]> = [["sun", -50], ["venus", 5], ["saturn", 55], ["mercury", 180]]
const PLANETAS_B: Array<[string, number]> = [["moon", 230], ["mars", 175], ["jupiter", 125], ["neptune", 0]]
const RAIO = 46

const aPos = PLANETAS_A.map(([id, g]) => ({ id, p: noAnel(CA, g, RAIO) }))
const bPos = PLANETAS_B.map(([id, g]) => ({ id, p: noAnel(CB, g, RAIO) }))

/** [de A, de B, contato]: dois suaves e um duro, que é o que uma relação costuma ter. */
const CONTATOS: Array<[number, number, "duro" | "trigono" | "sextil"]> = [
  [0, 1, "trigono"],
  [1, 2, "duro"],
  [2, 0, "sextil"],
]
const TRACO: Record<string, { tracejado?: string; opacidade: number }> = {
  duro: { opacidade: 0.62 },
  trigono: { tracejado: "6 5", opacidade: 0.5 },
  sextil: { tracejado: "2.5 5", opacidade: 0.42 },
}

export default function SinastriaIlustracao({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${L} ${A}`}
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* as duas rodas */}
      {[CA, CB].map((c, i) => (
        <g key={i}>
          <circle cx={c[0]} cy={c[1]} r={R} strokeWidth={1} opacity={0.62} />
          <circle cx={c[0]} cy={c[1]} r={R - 7} strokeWidth={0.6} opacity={0.4} />
          <Marcas c={c} />
        </g>
      ))}

      {/* os aspectos que cruzam de uma roda à outra */}
      {CONTATOS.map(([ia, ib, tipo]) => {
        const t = TRACO[tipo]
        return (
          <line
            key={`${ia}-${ib}`}
            x1={aPos[ia].p[0]}
            y1={aPos[ia].p[1]}
            x2={bPos[ib].p[0]}
            y2={bPos[ib].p[1]}
            strokeWidth={0.9}
            strokeDasharray={t.tracejado}
            opacity={t.opacidade}
          />
        )
      })}

      {/* os planetas de cada um, voltados para o outro */}
      {aPos.map((x) => (
        <Planeta key={`a-${x.id}`} id={x.id} p={x.p} />
      ))}
      {bPos.map((x) => (
        <Planeta key={`b-${x.id}`} id={x.id} p={x.p} />
      ))}
    </svg>
  )
}
