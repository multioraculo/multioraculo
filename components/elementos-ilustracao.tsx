/**
 * Os quatro elementos e os três modos, na gravura do site: filete fino, marfim sobre a lâmina violeta, sem
 * preenchimento. Os elementos são os triângulos da tradição (fogo para cima, água para baixo, ar e terra com a
 * barra); os modos são desenhados pelo que fazem: o cardinal parte do centro, o fixo se assenta, o mutável ondula.
 *
 * Decorativos: `aria-hidden`. O nome e o sentido vêm escritos ao lado.
 */
import type { ReactNode } from "react"

const TRACO = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const

function Moldura({ tamanho, className, children }: { tamanho: number; className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" width={tamanho} height={tamanho} className={className} aria-hidden="true" focusable="false" {...TRACO}>
      <circle cx="24" cy="24" r="21.5" strokeWidth={0.8} opacity={0.4} />
      {children}
    </svg>
  )
}

export function Elemento({ id, tamanho = 44, className = "" }: { id: string; tamanho?: number; className?: string }) {
  return (
    <Moldura tamanho={tamanho} className={className}>
      {id === "fire" && (
        <>
          <path d="M24 9.5 L38.5 34.5 H9.5 Z" strokeWidth={1.4} />
          {/* a chama, dentro do triângulo */}
          <path d="M24 20.5c-3.2 4.4-3.6 7.6-0.9 10.1c0.5 0.5 1.3 0.5 1.8 0c2.7-2.5 2.3-5.7-0.9-10.1z" strokeWidth={1} opacity={0.75} />
          <path d="M17 40.5h14" strokeWidth={0.8} opacity={0.5} />
        </>
      )}
      {id === "air" && (
        <>
          <path d="M24 9.5 L38.5 34.5 H9.5 Z" strokeWidth={1.4} />
          <path d="M15.2 26.5h17.6" strokeWidth={1.4} />
          <path d="M13 40c3-2.6 6-2.6 9 0s6 2.6 9 0" strokeWidth={0.8} opacity={0.55} />
        </>
      )}
      {id === "water" && (
        <>
          <path d="M24 38.5 L9.5 13.5 H38.5 Z" strokeWidth={1.4} />
          <path d="M16.5 19.5c2.4-2 4.8-2 7.2 0s4.8 2 7.2 0" strokeWidth={1} opacity={0.75} />
          <path d="M18.8 24.3c1.9-1.6 3.8-1.6 5.7 0s3.8 1.6 5.7 0" strokeWidth={1} opacity={0.6} />
        </>
      )}
      {id === "earth" && (
        <>
          <path d="M24 38.5 L9.5 13.5 H38.5 Z" strokeWidth={1.4} />
          <path d="M15.2 21.5h17.6" strokeWidth={1.4} />
          <path d="M15 8.5h18" strokeWidth={0.8} opacity={0.5} />
        </>
      )}
    </Moldura>
  )
}

export function Modo({ id, tamanho = 44, className = "" }: { id: string; tamanho?: number; className?: string }) {
  return (
    <Moldura tamanho={tamanho} className={className}>
      {id === "cardinal" && (
        <>
          {/* parte do centro, para os quatro lados */}
          <circle cx="24" cy="24" r="2.2" strokeWidth={1.2} />
          <path d="M24 19V9.5 M21 12.5l3-3l3 3" strokeWidth={1.2} />
          <path d="M24 29v9.5 M21 35.5l3 3l3-3" strokeWidth={1.2} />
          <path d="M19 24H9.5 M12.5 21l-3 3l3 3" strokeWidth={1.2} />
          <path d="M29 24h9.5 M35.5 21l3 3l-3 3" strokeWidth={1.2} />
        </>
      )}
      {id === "fixed" && (
        <>
          {/* assentado: um quadrado dentro do outro, e o centro firme */}
          <rect x="11.5" y="11.5" width="25" height="25" strokeWidth={1.4} />
          <rect x="17.5" y="17.5" width="13" height="13" strokeWidth={0.9} opacity={0.7} />
          <circle cx="24" cy="24" r="1.6" strokeWidth={1} />
        </>
      )}
      {id === "mutable" && (
        <>
          {/* ondula: duas curvas que se cruzam e se ajustam */}
          <path d="M8.5 19c4.5-8 9-8 15.5 0s11 8 15.5 0" strokeWidth={1.3} />
          <path d="M8.5 29c4.5-8 9-8 15.5 0s11 8 15.5 0" strokeWidth={1.3} opacity={0.65} />
        </>
      )}
    </Moldura>
  )
}
