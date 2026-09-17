/**
 * As ilustrações do horóscopo, na mesma gravura da roda do mapa: filete fino,
 * marfim sobre a lâmina violeta, sem preenchimento.
 *
 * Nenhuma delas é enfeite. Cada uma desenha um dado que já está na página:
 *
 *  - o ângulo do aspecto é desenhado no ângulo verdadeiro, com os dois corpos
 *    nas longitudes que o motor calculou. Quem não sabe o que é uma quadratura
 *    vê que ela é um canto reto, e que um trígono é largo;
 *  - a roda do dia põe os dez corpos onde eles estão agora, e liga os que
 *    fazem aspecto;
 *  - a fase da Lua é desenhada iluminada do lado certo para quem olha do
 *    hemisfério sul, que é de onde o Multioráculo fala.
 */
import { GlifoPlaneta } from "@/components/astro-wheel"
import type { Ceu, Corpo } from "@/lib/astro/ceu"
import { LENTOS } from "@/lib/astro/simbolos"

const rad = (graus: number) => (graus * Math.PI) / 180

/**
 * Arredonda para três casas. Não é estética: seno e cosseno podem diferir no
 * último dígito entre o Node do servidor e o V8 do navegador (a especificação
 * permite), e o React acusa erro de hidratação quando o caminho do SVG sai com
 * um dígito diferente dos dois lados.
 */
const arred = (n: number) => Math.round(n * 1000) / 1000

/** Longitude eclíptica para ponto na tela: 0° de Áries à esquerda, anti-horário. */
function ponto(lon: number, raio: number, centro: number): [number, number] {
  const a = rad(((lon % 360) + 360) % 360)
  return [arred(centro - Math.cos(a) * raio), arred(centro + Math.sin(a) * raio)]
}

/** Aspecto suave é tracejado; duro é contínuo. Mesma convenção da roda do mapa. */
const suave = (aspecto: string) => aspecto === "trine" || aspecto === "sextile" || aspecto === "quincunx"

/**
 * O ângulo de um aspecto, desenhado. Os dois corpos nas longitudes reais, a
 * corda entre eles e o arco que o ângulo abre.
 */
export function DiagramaAngulo({
  aLon,
  bLon,
  aspecto,
  tamanho = 88,
}: {
  aLon: number
  bLon: number
  aspecto: string
  tamanho?: number
}) {
  const L = 100
  const c = L / 2
  const raio = 34
  const [ax, ay] = ponto(aLon, raio, c)
  const [bx, by] = ponto(bLon, raio, c)

  // arco interno mostrando a abertura entre os dois, pelo caminho mais curto
  const bruto = (((bLon - aLon) % 360) + 360) % 360
  const curto = bruto > 180 ? 360 - bruto : bruto
  const inicio = bruto > 180 ? bLon : aLon
  const raioArco = 15
  const [ix, iy] = ponto(inicio, raioArco, c)
  const [fx, fy] = ponto(inicio + curto, raioArco, c)

  return (
    <svg viewBox={`0 0 ${L} ${L}`} width={tamanho} height={tamanho} className="shrink-0" aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeLinecap="round">
        <circle cx={c} cy={c} r={raio} strokeWidth={1} opacity={0.3} />
        {Array.from({ length: 12 }, (_, i) => {
          const [x1, y1] = ponto(i * 30, raio, c)
          const [x2, y2] = ponto(i * 30, raio + 4, c)
          return <path key={i} d={`M${x1} ${y1}L${x2} ${y2}`} strokeWidth={0.9} opacity={0.28} />
        })}
        <path
          d={`M${ax} ${ay}L${bx} ${by}`}
          strokeWidth={1.3}
          opacity={0.85}
          strokeDasharray={suave(aspecto) ? "3 3" : undefined}
        />
        <path
          d={`M${ix} ${iy}A${raioArco} ${raioArco} 0 ${curto > 180 ? 1 : 0} 1 ${fx} ${fy}`}
          strokeWidth={0.9}
          opacity={0.4}
        />
      </g>
      <g fill="currentColor" opacity={0.9}>
        <circle cx={ax} cy={ay} r={2.6} />
        <circle cx={bx} cy={by} r={2.6} />
      </g>
      <text
        x={c}
        y={c + 3.5}
        textAnchor="middle"
        fill="currentColor"
        opacity={0.55}
        style={{ fontSize: 11, letterSpacing: "0.02em" }}
      >
        {Math.round(curto)}°
      </text>
    </svg>
  )
}

/** Um corpo atravessando um signo: o setor de trinta graus aceso, e o corpo nele. */
export function DiagramaPosicao({ lon, tamanho = 88 }: { lon: number; tamanho?: number }) {
  const L = 100
  const c = L / 2
  const raio = 34
  const inicioSigno = Math.floor((((lon % 360) + 360) % 360) / 30) * 30
  const [sx, sy] = ponto(inicioSigno, raio, c)
  const [ex, ey] = ponto(inicioSigno + 30, raio, c)
  const [px, py] = ponto(lon, raio, c)

  return (
    <svg viewBox={`0 0 ${L} ${L}`} width={tamanho} height={tamanho} className="shrink-0" aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeLinecap="round">
        <circle cx={c} cy={c} r={raio} strokeWidth={1} opacity={0.3} />
        {Array.from({ length: 12 }, (_, i) => {
          const [x1, y1] = ponto(i * 30, raio, c)
          const [x2, y2] = ponto(i * 30, raio + 4, c)
          return <path key={i} d={`M${x1} ${y1}L${x2} ${y2}`} strokeWidth={0.9} opacity={0.28} />
        })}
        <path d={`M${sx} ${sy}A${raio} ${raio} 0 0 1 ${ex} ${ey}`} strokeWidth={2.2} opacity={0.85} />
        <path d={`M${c} ${c}L${px} ${py}`} strokeWidth={0.9} opacity={0.35} />
      </g>
      <circle cx={px} cy={py} r={2.8} fill="currentColor" opacity={0.9} />
    </svg>
  )
}

/**
 * A Lua como ela aparece no céu. Oito fases, iluminadas do lado que se vê do
 * hemisfério sul: aqui a crescente acende pela esquerda.
 */
export function FaseLua({ fase, tamanho = 26 }: { fase: number; tamanho?: number }) {
  const r = 12
  const c = 14
  const k = (fase % 8) / 8
  const rx = arred(Math.abs(Math.cos(2 * Math.PI * k)) * r)
  const crescendo = k < 0.5
  const externo = crescendo ? 0 : 1
  const terminador = k < 0.25 || k >= 0.75 ? externo : 1 - externo

  return (
    <svg viewBox="0 0 28 28" width={tamanho} height={tamanho} className="shrink-0" aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.35} />
      {fase !== 0 && (
        <path
          d={`M${c} ${c - r}A${r} ${r} 0 0 ${externo} ${c} ${c + r}A${rx} ${r} 0 0 ${terminador} ${c} ${c - r}`}
          fill="currentColor"
          opacity={0.5}
        />
      )}
    </svg>
  )
}

/** O céu inteiro do dia numa roda: os dez corpos onde estão, e o que se aspecta. */
export function RodaDoDia({ ceu, tamanho = 240 }: { ceu: Ceu; tamanho?: number }) {
  const L = 200
  const c = L / 2
  const raioSigno = 86
  const raioDentro = 72
  const raioGlifo = 58
  const raioAspecto = 52

  return (
    <svg viewBox={`0 0 ${L} ${L}`} width={tamanho} height={tamanho} className="mx-auto max-w-full" aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeLinecap="round">
        <circle cx={c} cy={c} r={raioSigno} strokeWidth={1.2} opacity={0.4} />
        <circle cx={c} cy={c} r={raioDentro} strokeWidth={0.9} opacity={0.28} />
        {Array.from({ length: 12 }, (_, i) => {
          const [x1, y1] = ponto(i * 30, raioDentro, c)
          const [x2, y2] = ponto(i * 30, raioSigno, c)
          return <path key={i} d={`M${x1} ${y1}L${x2} ${y2}`} strokeWidth={0.9} opacity={0.3} />
        })}
        {ceu.aspectos.map((a) => {
          const [x1, y1] = ponto(posicaoDe(ceu, a.a), raioAspecto, c)
          const [x2, y2] = ponto(posicaoDe(ceu, a.b), raioAspecto, c)
          const coletivo = LENTOS.has(a.a) && LENTOS.has(a.b)
          return (
            <path
              key={`${a.a}-${a.b}-${a.aspecto}`}
              d={`M${x1} ${y1}L${x2} ${y2}`}
              strokeWidth={coletivo ? 0.7 : 1.1}
              opacity={coletivo ? 0.25 : 0.6}
              strokeDasharray={suave(a.aspecto) ? "3 3" : undefined}
            />
          )
        })}
      </g>
      {ceu.posicoes.map((p) => {
        const [x, y] = ponto(p.lon, raioGlifo, c)
        return (
          // o glifo é um svg próprio: desloca-se meia caixa para o centro cair na longitude
          <g key={p.corpo} transform={`translate(${x - 7.5} ${y - 7.5})`} className="text-white/70">
            <GlifoPlaneta id={p.corpo} tamanho={15} />
          </g>
        )
      })}
    </svg>
  )
}

function posicaoDe(ceu: Ceu, corpo: Corpo): number {
  return ceu.posicoes.find((p) => p.corpo === corpo)?.lon ?? 0
}
