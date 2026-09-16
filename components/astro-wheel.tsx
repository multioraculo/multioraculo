/**
 * A roda do mapa, na língua visual do Multioráculo: gravura em marfim sobre a
 * lâmina violeta, filete fino, serifa nas capitulares. Sem preenchimento, sem
 * cor de sinalização: tensão e fluidez se distinguem pelo traço, como as
 * cartas distinguem sombra e luz pela hachura.
 *
 * Desenha só o que o motor calculou. Nenhuma posição é inventada aqui: a
 * componente recebe longitudes prontas e as converte em geometria.
 *
 * Convenção: Ascendente à esquerda, signos correndo no sentido anti-horário.
 */

export type CorpoRoda = { id: string; lon: number; retrogrado?: boolean }
export type AspectoRoda = { a: string; b: string; tipo: string; forca: number }

export type RodaProps = {
  corpos: CorpoRoda[]
  /** 12 cúspides, em graus de longitude eclíptica */
  cuspides: number[]
  asc: number
  mc: number
  aspectos?: AspectoRoda[]
  /** nomes curtos dos signos, do idioma da pessoa, começando por Áries */
  signos?: string[]
  /** lado da caixa em px */
  tamanho?: number
  className?: string
}

const SIGNOS_PT = ["ÁRIES", "TOURO", "GÊMEOS", "CÂNCER", "LEÃO", "VIRGEM", "LIBRA", "ESCORPIÃO", "SAGITÁRIO", "CAPRICÓRNIO", "AQUÁRIO", "PEIXES"]

/** Raios, em fração do lado: de fora para dentro. */
const R = {
  signoFora: 0.45,
  signoDentro: 0.385,
  rotulo: 0.418,
  graus: 0.377,
  casaFora: 0.385,
  planeta: 0.327,
  grauPlaneta: 0.283,
  casaDentro: 0.246,
  numeroCasa: 0.226,
  aspecto: 0.218,
  /** os eixos recebem rótulo fora do anel, mas ainda dentro do quadro */
  eixo: 0.487,
}

/** Glifos planetários: símbolos tradicionais, redesenhados no traço do app. */
export const GLIFOS: Record<string, string> = {
  sun: "M0 -4.6a4.6 4.6 0 1 0 0 9.2a4.6 4.6 0 1 0 0 -9.2 M0 -0.5a0.5 0.5 0 1 0 0 1a0.5 0.5 0 1 0 0 -1",
  moon: "M2.4 -5.1a5.4 5.4 0 1 0 0 10.2a6.6 6.6 0 0 1 0 -10.2",
  mercury: "M-3 -6a3 3 0 0 0 6 0 M0 -3.2a3.4 3.4 0 1 0 0 6.8a3.4 3.4 0 1 0 0 -6.8 M0 3.6v3.4 M-2.2 5.4h4.4",
  venus: "M0 -6.4a3.4 3.4 0 1 0 0 6.8a3.4 3.4 0 1 0 0 -6.8 M0 0.4v6.2 M-2.4 4.2h4.8",
  mars: "M-1.4 1.6a3.6 3.6 0 1 0 0 -0.2 M1.6 -1.4l4.6 -4.6 M2.6 -6h3.6v3.6",
  jupiter: "M-4.4 -3.6c2.6 -2.4 5.6 -0.8 4.4 1.8c-1 2.2 -3.2 4.2 -3.2 6.4 M-4.8 4.6h8.8",
  saturn: "M-3.6 -5.2h4.4 M-1.2 -6.2v7.2c0 2.4 1.6 3.4 3 3.2c1.6 -0.2 2.4 -1.8 1.8 -3.4",
  uranus: "M0 -6.4v9 M-3.4 -3.4h6.8 M-3.4 -5.8v4.8 M3.4 -5.8v4.8 M0 4.2a1.9 1.9 0 1 0 0 3.8a1.9 1.9 0 1 0 0 -3.8",
  neptune: "M0 -5.8v11 M-2.6 3.6h5.2 M-5 -5.2v2.8c0 2.8 2.2 5 5 5s5 -2.2 5 -5v-2.8",
  // monograma PL: mais distinto de Vênus em tamanho pequeno que a variante de círculo e crescente
  pluto: "M-4 6.4v-12.8h3.2a3.2 3.2 0 0 1 0 6.4h-3.2 M1.4 -6.4v12.8h4.6",
  chiron: "M-2.4 -6.6l4.6 3.4l-4.6 3.4 M0 -3.2v5.4 M0 2.6a2.4 2.4 0 1 0 0 4.8a2.4 2.4 0 1 0 0 -4.8",
  mean_node: "M0 -5.6a3.6 3.6 0 0 0 -3.6 3.6v3.4 M0 -5.6a3.6 3.6 0 0 1 3.6 3.6v3.4 M-5.4 1.4h3.6 M1.8 1.4h3.6",
  true_node: "M0 -5.6a3.6 3.6 0 0 0 -3.6 3.6v3.4 M0 -5.6a3.6 3.6 0 0 1 3.6 3.6v3.4 M-5.4 1.4h3.6 M1.8 1.4h3.6",
}

/** Tensão em traço cheio, fluidez em traço pontilhado: a distinção é de forma, não de cor. */
const ASPECTOS: Record<string, { tracejado?: string; opacidade: number }> = {
  opposition: { opacidade: 0.62 },
  square: { opacidade: 0.54 },
  trine: { tracejado: "6 5", opacidade: 0.46 },
  sextile: { tracejado: "2.5 5", opacidade: 0.38 },
  quincunx: { tracejado: "1 6", opacidade: 0.3 },
}

/** O mesmo glifo da roda, para reaproveitar na tabela de posições. */
export function GlifoPlaneta({ id, tamanho = 18, className = "" }: { id: string; tamanho?: number; className?: string }) {
  const d = GLIFOS[id]
  if (!d) return null
  return (
    <svg viewBox="-9 -9 18 18" width={tamanho} height={tamanho} className={className} aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AstroWheel({
  corpos,
  cuspides,
  asc,
  mc,
  aspectos = [],
  signos = SIGNOS_PT,
  tamanho = 560,
  className = "",
}: RodaProps) {
  const L = 1000
  const c = L / 2
  const rad = (g: number) => (g * Math.PI) / 180
  /** longitude eclíptica → ponto na tela, com o Ascendente à esquerda */
  const P = (lon: number, r: number) => {
    const a = rad(((lon - asc) % 360 + 360) % 360)
    return [c - Math.cos(a) * r * L, c + Math.sin(a) * r * L] as const
  }
  const linha = (lon: number, r1: number, r2: number) => {
    const [x1, y1] = P(lon, r1)
    const [x2, y2] = P(lon, r2)
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`
  }

  // Planetas muito próximos se empurram, e um fio liga o glifo à posição real.
  const ordenados = [...corpos].sort((p, q) => p.lon - q.lon)
  const MIN = 7.2
  const desloc = ordenados.map((p) => ({ ...p, mostra: p.lon }))
  for (let volta = 0; volta < 60; volta++) {
    let mexeu = false
    for (let i = 0; i < desloc.length; i++) {
      const a = desloc[i]
      const b = desloc[(i + 1) % desloc.length]
      let d = ((b.mostra - a.mostra) % 360 + 360) % 360
      if (d < MIN) {
        const empurra = (MIN - d) / 2
        a.mostra = (a.mostra - empurra + 360) % 360
        b.mostra = (b.mostra + empurra) % 360
        mexeu = true
      }
    }
    if (!mexeu) break
  }

  const grau = (lon: number) => Math.floor(((lon % 30) + 30) % 30)
  const ids = new Set(corpos.map((p) => p.id))
  const lonDe = (id: string) => corpos.find((p) => p.id === id)?.lon ?? 0

  return (
    <svg
      viewBox={`0 0 ${L} ${L}`}
      width={tamanho}
      height={tamanho}
      className={`aw-root ${className}`}
      role="img"
      aria-label="Roda do mapa"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      <g className="aw-tinta" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* anéis */}
        <circle cx={c} cy={c} r={R.signoFora * L} strokeWidth={1.9} opacity={0.85} />
        <circle cx={c} cy={c} r={R.signoDentro * L} strokeWidth={1.2} opacity={0.68} />
        <circle cx={c} cy={c} r={R.casaDentro * L} strokeWidth={1.1} opacity={0.52} />
        <circle cx={c} cy={c} r={R.aspecto * L} strokeWidth={0.9} opacity={0.32} />

        {/* graus: marca a cada 1°, mais longa a cada 5° */}
        {Array.from({ length: 360 }, (_, g) => (
          <path
            key={`g${g}`}
            d={linha(g, R.signoDentro, g % 5 === 0 ? R.graus - 0.012 : R.graus)}
            strokeWidth={g % 30 === 0 ? 1.3 : g % 5 === 0 ? 0.9 : 0.75}
            opacity={g % 30 === 0 ? 0.7 : g % 5 === 0 ? 0.52 : 0.34}
          />
        ))}

        {/* signos: limite e nome em serifa */}
        {Array.from({ length: 12 }, (_, i) => {
          const inicio = i * 30
          const [x, y] = P(inicio + 15, R.rotulo)
          // o nome acompanha o anel: assim cabe inteiro, sem abreviação que
          // deixe o signo ambíguo. Quando a tangente aponta para baixo, gira
          // meia volta para o texto não ficar de cabeça para baixo.
          let giro = (Math.atan2(y - c, x - c) * 180) / Math.PI + 90
          giro = ((giro % 360) + 360) % 360
          if (giro > 90 && giro < 270) giro += 180
          return (
            <g key={`s${i}`}>
              <path d={linha(inicio, R.signoDentro, R.signoFora)} strokeWidth={1.25} opacity={0.72} />
              <text
                x={x}
                y={y}
                className="aw-signo"
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                stroke="none"
                opacity={0.75}
                transform={`rotate(${giro.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`}
              >
                {signos[i]}
              </text>
            </g>
          )
        })}

        {/* casas: cúspide e número */}
        {cuspides.map((cusp, i) => {
          const proxima = cuspides[(i + 1) % 12]
          const meio = cusp + ((((proxima - cusp) % 360) + 360) % 360) / 2
          const [x, y] = P(meio, R.numeroCasa)
          const eixo = i === 0 || i === 3 || i === 6 || i === 9
          return (
            <g key={`c${i}`}>
              <path d={linha(cusp, R.casaDentro, R.casaFora)} strokeWidth={eixo ? 1.6 : 0.95} opacity={eixo ? 0.8 : 0.46} />
              <text x={x} y={y} className="aw-casa" textAnchor="middle" dominantBaseline="central" fill="currentColor" stroke="none" opacity={0.58}>
                {i + 1}
              </text>
            </g>
          )
        })}

        {/* aspectos, no disco interno */}
        {aspectos.map((asp, i) => {
          const estilo = ASPECTOS[asp.tipo]
          if (!estilo || !ids.has(asp.a) || !ids.has(asp.b)) return null
          const [x1, y1] = P(lonDe(asp.a), R.aspecto)
          const [x2, y2] = P(lonDe(asp.b), R.aspecto)
          return (
            <line
              key={`a${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={0.6 + asp.forca * 0.9}
              strokeDasharray={estilo.tracejado}
              opacity={estilo.opacidade * (0.45 + asp.forca * 0.55)}
            />
          )
        })}

        {/* eixos: Ascendente e Meio-do-Céu */}
        {[
          { lon: asc, nome: "ASC" },
          { lon: mc, nome: "MC" },
        ].map((eixo) => {
          const [x, y] = P(eixo.lon, R.eixo)
          // o rótulo se ancora pelo lado em que está, senão escapa do quadro
          const lado = x - c
          const ancora = lado < -8 ? "start" : lado > 8 ? "end" : "middle"
          const desvio = ancora === "start" ? 8 : ancora === "end" ? -8 : 0
          return (
            <g key={eixo.nome}>
              <path d={linha(eixo.lon, R.casaDentro, R.signoFora)} strokeWidth={1.8} opacity={0.88} />
              <text x={x + desvio} y={y} className="aw-eixo" textAnchor={ancora} dominantBaseline="central" fill="currentColor" stroke="none" opacity={0.8}>
                {eixo.nome}
              </text>
            </g>
          )
        })}

        {/* planetas */}
        {desloc.map((p) => {
          const [gx, gy] = P(p.mostra, R.planeta)
          const [tx, ty] = P(p.mostra, R.grauPlaneta)
          const glifo = GLIFOS[p.id]
          return (
            <g key={p.id}>
              <path d={linha(p.lon, R.casaFora - 0.008, R.casaFora - 0.032)} strokeWidth={1.1} opacity={0.62} />
              {Math.abs(p.mostra - p.lon) > 0.4 && (
                <path
                  d={`M${P(p.lon, R.casaFora - 0.032)[0]} ${P(p.lon, R.casaFora - 0.032)[1]}L${P(p.mostra, R.planeta + 0.026)[0]} ${P(p.mostra, R.planeta + 0.026)[1]}`}
                  strokeWidth={0.7}
                  opacity={0.42}
                />
              )}
              {glifo && (
                <g transform={`translate(${gx} ${gy}) scale(1.9)`} strokeWidth={1.25} opacity={1}>
                  <path d={glifo} />
                </g>
              )}
              <text x={tx} y={ty} className="aw-grau" textAnchor="middle" dominantBaseline="central" fill="currentColor" stroke="none" opacity={0.72}>
                {grau(p.lon)}°{p.retrogrado ? " ℞" : ""}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
