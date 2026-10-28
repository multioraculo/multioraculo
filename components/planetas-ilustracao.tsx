"use client"

/**
 * Os planetas e os dois ângulos na gravura do site: filete fino, marfim sobre a
 * lâmina violeta, sem preenchimento, com a sombra feita em hachura como numa
 * prancha antiga. Mesmo traço de `elementos-ilustracao.tsx`.
 *
 * Cada corpo é reconhecível pelo que tem de seu: os raios do Sol, o crescente
 * da Lua, as faixas e a mancha de Júpiter, os anéis de Saturno e o anel quase
 * em pé de Urano. O Ascendente é o Sol nascendo no horizonte; o Meio-do-Céu é o
 * Sol no alto do arco.
 *
 * Decorativos: `aria-hidden`. O nome vem escrito ao lado.
 */
import { useId, type ReactNode } from "react"

const TRACO = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const
const C = 32

/** Linhas diagonais que cobrem a prancha inteira; a máscara decide onde aparecem. */
function Hachura({ mascara, passo = 2.2, opacidade = 0.55 }: { mascara: string; passo?: number; opacidade?: number }) {
  const linhas: ReactNode[] = []
  for (let k = -64; k <= 64; k += passo) {
    linhas.push(<line key={k} x1={k} y1={64} x2={k + 64} y2={0} />)
  }
  return (
    <g mask={`url(#${mascara})`} strokeWidth={0.55} opacity={opacidade}>
      {linhas}
    </g>
  )
}

/**
 * Uma esfera: o contorno e a sombra do lado oposto à luz, que vem de cima e da
 * esquerda. `fundo` é o quanto a sombra avança (0 nada, 1 a esfera inteira).
 */
function Esfera({ id, r, cx = C, cy = C, fundo = 0.64, children }: { id: string; r: number; cx?: number; cy?: number; fundo?: number; children?: ReactNode }) {
  // a esfera iluminada é a mesma, deslocada para a luz: quanto mais longe, mais sombra sobra
  const deslocamento = r * fundo * 2
  const d = deslocamento / Math.SQRT2
  return (
    <>
      <defs>
        <mask id={`${id}-sombra`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="black" stroke="none" />
          <circle cx={cx} cy={cy} r={r} fill="white" stroke="none" />
          <circle cx={cx - d} cy={cy - d} r={r} fill="black" stroke="none" />
        </mask>
        <clipPath id={`${id}-dentro`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <Hachura mascara={`${id}-sombra`} />
      <g clipPath={`url(#${id}-dentro)`} strokeWidth={0.8} opacity={0.75}>
        {children}
      </g>
      <circle cx={cx} cy={cy} r={r} strokeWidth={1.3} />
    </>
  )
}

function Raios({ r1, r2, r3, n = 12, cx = C, cy = C, de = 0, ate = 360 }: { r1: number; r2: number; r3: number; n?: number; cx?: number; cy?: number; de?: number; ate?: number }) {
  const out: ReactNode[] = []
  for (let i = 0; i < n; i++) {
    const a = ((de + ((ate - de) * i) / (ate - de === 360 ? n : n - 1)) * Math.PI) / 180
    const fim = i % 2 === 0 ? r2 : r3
    out.push(
      <line
        key={i}
        x1={cx + Math.cos(a) * r1}
        y1={cy - Math.sin(a) * r1}
        x2={cx + Math.cos(a) * fim}
        y2={cy - Math.sin(a) * fim}
        strokeWidth={i % 2 === 0 ? 1.1 : 0.7}
      />,
    )
  }
  return <>{out}</>
}

/** Um anel elíptico em volta de uma esfera: a metade de trás some atrás dela. */
function Anel({ id, rx, ry, rEsfera, inclinacao, duplo = false }: { id: string; rx: number; ry: number; rEsfera: number; inclinacao: number; duplo?: boolean }) {
  const meia = (s: number, rxx: number, ryy: number) => `M ${C - rxx} ${C} A ${rxx} ${ryy} 0 0 ${s} ${C + rxx} ${C}`
  return (
    <>
      <defs>
        <mask id={`${id}-atras`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="white" stroke="none" />
          <circle cx={C} cy={C} r={rEsfera + 0.8} fill="black" stroke="none" />
        </mask>
      </defs>
      <g transform={`rotate(${inclinacao} ${C} ${C})`}>
        {/* a metade de trás: escondida onde a esfera está na frente */}
        <g mask={`url(#${id}-atras)`}>
          <path d={meia(1, rx, ry)} strokeWidth={1.1} />
          {duplo && <path d={meia(1, rx - 3.5, ry - 1)} strokeWidth={0.6} opacity={0.7} />}
        </g>
        {/* a metade da frente passa por cima */}
        <path d={meia(0, rx, ry)} strokeWidth={1.1} />
        {duplo && <path d={meia(0, rx - 3.5, ry - 1)} strokeWidth={0.6} opacity={0.7} />}
      </g>
    </>
  )
}

function Corpo({ id, k }: { id: string; k: string }) {
  switch (k) {
    case "sun":
      return (
        <>
          <circle cx={C} cy={C} r={11} strokeWidth={1.3} />
          <circle cx={C} cy={C} r={7.5} strokeWidth={0.6} opacity={0.5} />
          <circle cx={C} cy={C} r={1.4} strokeWidth={1} />
          <Raios r1={14} r2={24} r3={19.5} n={16} />
        </>
      )
    case "moon":
      return (
        <Esfera id={id} r={18} fundo={0.8}>
          <circle cx={24} cy={24} r={3} />
          <circle cx={31} cy={19} r={1.6} />
          <circle cx={21} cy={33} r={2.2} />
          <circle cx={27.5} cy={28} r={1.1} />
        </Esfera>
      )
    case "mercury":
      return (
        <Esfera id={id} r={11} fundo={0.64}>
          <circle cx={28} cy={28} r={2} />
          <circle cx={34} cy={26} r={1.1} />
          <circle cx={29} cy={35} r={1.4} />
        </Esfera>
      )
    case "venus":
      return (
        <Esfera id={id} r={15} fundo={0.64}>
          <path d="M16 27c5-4 11-4 16-1s10 3 16-1" />
          <path d="M17 33c6-3 10-2 15 0s9 2 14-1" />
          <path d="M20 21c4-2 8-2 12 0" />
        </Esfera>
      )
    case "mars":
      return (
        <Esfera id={id} r={13} fundo={0.64}>
          <path d="M22 21.5c3 1.5 6 1.5 9 0" />
          <path d="M21 31c4-1 6 1.5 10 0.5s5-2 7-1" />
          <path d="M26 36.5l3-2.5 3 1.5" />
        </Esfera>
      )
    case "jupiter":
      return (
        <Esfera id={id} r={19} fundo={0.66}>
          <path d="M12 22c13-3 27-3 40 0" />
          <path d="M12 26.5c13-2 27-2 40 0" />
          <path d="M12 33c13 1.5 27 1.5 40 0" />
          <path d="M12 38.5c13 2.5 27 2.5 40 0" />
          <ellipse cx={26} cy={35.8} rx={4} ry={1.9} strokeWidth={1} />
        </Esfera>
      )
    case "saturn":
      return (
        <>
          <Esfera id={id} r={12.5} fundo={0.66}>
            <path d="M18 28c9-1.5 19-1.5 28 0" />
            <path d="M18 34c9 1 19 1 28 0" />
          </Esfera>
          <Anel id={id} rx={27} ry={7.5} rEsfera={12.5} inclinacao={-16} duplo />
        </>
      )
    case "uranus":
      return (
        <>
          <Esfera id={id} r={13} fundo={0.66}>
            <path d="M32 18c-1.5 9-1.5 19 0 28" />
          </Esfera>
          <Anel id={id} rx={22} ry={4} rEsfera={13} inclinacao={-78} />
        </>
      )
    case "neptune":
      return (
        <Esfera id={id} r={15} fundo={0.64}>
          <path d="M16 25.5c11-2 21-2 32 0" />
          <path d="M16 36c11 1.5 21 1.5 32 0" />
          <ellipse cx={27} cy={30.5} rx={3.4} ry={1.7} strokeWidth={1} />
          <path d="M33 30.5c2 0.6 4 0.6 6 0" />
        </Esfera>
      )
    case "pluto":
      return (
        <>
          <Esfera id={id} r={10} cx={29} cy={33} fundo={0.64}>
            <path d="M26 33.5c-1.4-2.3 1.2-3.9 2.6-1.8c1.2-2.2 4-0.8 2.8 1.6l-2.7 3.4z" />
          </Esfera>
          {/* Caronte, a lua que gira com ele */}
          <circle cx={45} cy={18} r={3.4} strokeWidth={1} />
          <path d="M37 26.5l4.5-4.5" strokeWidth={0.5} strokeDasharray="1 1.6" opacity={0.6} />
        </>
      )
    case "asc":
      return (
        <>
          {/* o Sol nascendo na linha do horizonte, a leste */}
          <path d="M5 38h54" strokeWidth={1.3} />
          <path d="M14 42.5h36M22 46.5h20" strokeWidth={0.6} opacity={0.5} />
          <path d="M21 38a11 11 0 0 1 22 0" strokeWidth={1.3} />
          <Raios cy={38} r1={14} r2={22} r3={18} n={9} de={0} ate={180} />
        </>
      )
    case "mc":
      return (
        <>
          {/* o arco do céu e o Sol no ponto mais alto */}
          <path d="M6 48a26 26 0 0 1 52 0" strokeWidth={0.8} opacity={0.6} strokeDasharray="1.2 2" />
          <path d="M5 48h54" strokeWidth={1.1} />
          <path d="M32 26v20" strokeWidth={0.7} opacity={0.6} />
          <circle cx={C} cy={17} r={6} strokeWidth={1.3} />
          <Raios cy={17} r1={8.5} r2={13} r3={11} n={12} />
        </>
      )
    default:
      return null
  }
}

export function IlustracaoPlaneta({ id, tamanho = 64, className = "" }: { id: string; tamanho?: number; className?: string }) {
  const unico = `pl${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <svg
      viewBox="0 0 64 64"
      width={tamanho}
      height={tamanho}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...TRACO}
    >
      <Corpo id={unico} k={id} />
    </svg>
  )
}
