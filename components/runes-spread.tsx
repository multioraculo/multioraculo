"use client"

import { useI18n } from "@/components/i18n-provider"

/**
 * Visualização da tiragem de Runas. Só desenha o que o motor já sorteou:
 * nome, glifo, posição e orientação de cada runa vêm do payload da leitura.
 * Nenhuma regra nova: a ordem é a das posições do mapa de 9 forças, e a
 * inversão aparece como o glifo de cabeça para baixo mais um rótulo.
 *
 * Materialidade com as mesmas técnicas dos Búzios (SVG + CSS, sem canvas ou
 * WebGL): como o búzio, o próprio glifo é o objeto, repousando direto sobre
 * o card. Gradiente no SVG para translucidez lilás, bevel por filtro de
 * iluminação, lado escuro para espessura, highlight perolado, brilho muito
 * discreto, sombra de contato e projetada por drop-shadow em CSS, e entrada
 * escalonada por keyframes CSS só na primeira aparição.
 */

export type RuneCardData = { position: string; name: string; glyph: string; reversed: boolean }

/** Traços de cada runa do Futhark Antigo em um quadro 100×100 (só linhas retas). */
const RUNE_PATHS: Record<string, string> = {
  Fehu: "M35 10 V90 M35 30 L65 12 M35 50 L65 32",
  Uruz: "M30 10 V90 M30 10 L70 35 V90",
  Thurisaz: "M35 10 V90 M35 30 L65 50 L35 70",
  Ansuz: "M35 10 V90 M35 20 L65 38 M35 42 L65 60",
  Raidho: "M30 10 V90 M30 10 L65 28 L30 50 L65 90",
  Kenaz: "M65 15 L35 50 L65 85",
  Gebo: "M25 20 L75 80 M75 20 L25 80",
  Wunjo: "M30 10 V90 M30 10 L65 30 L30 52",
  Hagalaz: "M30 10 V90 M70 10 V90 M30 35 L70 65",
  Nauthiz: "M50 10 V90 M32 62 L68 38",
  Isa: "M50 10 V90",
  Jera: "M55 25 L35 40 L55 55 M45 45 L65 60 L45 75",
  Eihwaz: "M50 10 V90 M50 10 L35 22 M50 90 L65 78",
  Perthro: "M30 10 V90 M30 10 L60 30 L45 50 L60 70 L30 90",
  Algiz: "M50 10 V90 M50 40 L30 15 M50 40 L70 15",
  Sowilo: "M65 10 L35 42 L65 58 L35 90",
  Tiwaz: "M50 10 V90 M50 10 L30 30 M50 10 L70 30",
  Berkano: "M30 10 V90 M30 10 L60 28 L30 50 L60 72 L30 90",
  Ehwaz: "M30 10 V90 M70 10 V90 M30 10 L50 35 L70 10",
  Mannaz: "M30 10 V90 M70 10 V90 M30 10 L70 45 M70 10 L30 45",
  Laguz: "M35 10 V90 M35 10 L65 35",
  Ingwaz: "M50 25 L70 50 L50 75 L30 50 Z",
  Dagaz: "M30 10 V90 M70 10 V90 M30 10 L70 90 M70 10 L30 90",
  Othala: "M50 15 L70 40 L50 65 L30 40 Z M40 52 L25 85 M60 52 L75 85",
}

/** Gradiente e filtros compartilhados por todos os glifos (renderizado uma vez por tiragem). */
function RuneDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        {/* corpo translúcido lilás: claro no alto à esquerda, denso embaixo à direita */}
        <linearGradient id="rg-body" gradientUnits="userSpaceOnUse" x1="20" y1="5" x2="80" y2="95">
          <stop offset="0%" stopColor="#f3ecff" stopOpacity="0.92" />
          <stop offset="45%" stopColor="#c7adf7" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#7d5cc9" stopOpacity="0.9" />
        </linearGradient>
        {/* bevel arredondado: a borda do traço recebe luz difusa e especular de cima à esquerda */}
        <filter id="rg-bevel" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.8" specularExponent="16" lightingColor="#ffffff" result="spec">
            <feDistantLight azimuth="225" elevation="42" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feDiffuseLighting in="blur" surfaceScale="4" diffuseConstant="0.55" lightingColor="#ffffff" result="diff">
            <feDistantLight azimuth="225" elevation="55" />
          </feDiffuseLighting>
          <feComposite in="diff" in2="SourceAlpha" operator="in" result="diffIn" />
          <feComposite in="SourceGraphic" in2="diffIn" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="shaded" />
          <feComposite in="shaded" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0.42" k3="0.58" k4="0" result="mix" />
          <feComposite in="mix" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.7" k4="0" />
        </filter>
        <filter id="rg-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="rg-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
      </defs>
    </svg>
  )
}

/** Espessura do traço esculpido, em unidades do quadro 100×100 da runa. */
const STROKE = 13

/**
 * O objeto é só o traço da runa: não há placa nem geometria atrás dele.
 * Camadas do mesmo caminho, de baixo para cima: brilho lilás discreto,
 * lado escuro deslocado para baixo e à direita (espessura), corpo
 * translúcido com bevel por iluminação, e um fio de highlight perolado.
 * A inversão gira apenas a geometria (grupo interno); luz, deslocamentos
 * e sombra continuam fixos, então a runa parece virada, não reiluminada.
 * Inclinação e escala mínimas são determinísticas por posição.
 */
export function RuneObject({ name, glyph, reversed, index, width = 64, height = 83 }: { name: string; glyph: string; reversed: boolean; index: number; width?: number; height?: number }) {
  const d = RUNE_PATHS[name]
  const tilt = (((index * 7) % 5) - 2) * 0.8
  const scale = 1 - ((index * 3) % 3) * 0.012
  const rot = reversed ? "rotate(180 50 50)" : undefined
  const layer = (key: string, dx: number, dy: number, attrs: React.SVGProps<SVGPathElement> & React.SVGProps<SVGTextElement>) => (
    <g key={key} transform={`translate(${dx} ${dy})`}>
      <g transform={rot}>
        {d ? (
          <path d={d} fill="none" strokeLinecap="round" strokeLinejoin="round" {...(attrs as React.SVGProps<SVGPathElement>)} />
        ) : (
          <text x="50" y="80" textAnchor="middle" fontSize="80" fill="none" strokeLinejoin="round" {...(attrs as React.SVGProps<SVGTextElement>)}>
            {glyph}
          </text>
        )}
      </g>
    </g>
  )
  return (
    <svg
      width={width}
      height={height}
      viewBox="-12 -30 124 161"
      aria-hidden="true"
      focusable="false"
      style={{
        overflow: "visible",
        transform: `rotate(${tilt}deg) scale(${scale})`,
        filter: "drop-shadow(0 3px 3px rgba(10,3,30,0.48)) drop-shadow(0 12px 15px rgba(10,3,30,0.3))",
      }}
    >
      {layer("glow", 0, 1, { stroke: "#c9a7ff", strokeOpacity: 0.28, strokeWidth: STROKE + 9, filter: "url(#rg-glow)" })}
      {layer("side2", 2.2, 3.4, { stroke: "#3d2478", strokeOpacity: 0.95, strokeWidth: STROKE })}
      {layer("side1", 1.1, 1.7, { stroke: "#5b3da3", strokeOpacity: 0.9, strokeWidth: STROKE })}
      {layer("body", 0, 0, { stroke: "url(#rg-body)", strokeWidth: STROKE, filter: "url(#rg-bevel)" })}
      {layer("highlight", -2.4, -2.6, { stroke: "#ffffff", strokeOpacity: 0.5, strokeWidth: 2.6, filter: "url(#rg-soft)" })}
    </svg>
  )
}

/**
 * Lê nome, glifo e orientação do texto do item quando o payload não traz o
 * campo estruturado (leituras antigas): "Hagalaz (ᚺ) invertida" em pt/en/es.
 */
export function runeFromLabel(label: string): { name: string; glyph: string; reversed: boolean } | null {
  const m = label.trim().match(/^([A-Za-z]+)\s*\((.)\)\s*(.*)$/u)
  if (!m) return null
  return { name: m[1], glyph: m[2], reversed: m[3].trim().length > 0 }
}

type Props = {
  items: Array<{ position?: string; name: string }>
  /** campo estruturado vindo do motor; leituras antigas usam o texto do item */
  runes?: Array<{ name: string; glyph: string; reversed: boolean }> | null
  /** entrada escalonada só na primeira aparição (leitura ao vivo) */
  animate?: boolean
}

export default function RunesSpread({ items, runes, animate = false }: Props) {
  const { dict } = useI18n()
  const t = dict.runes

  const cards: RuneCardData[] = items
    .map((it, i) => {
      const r = runes?.[i] ?? runeFromLabel(it.name)
      if (!r) return null
      return { position: it.position ?? "", name: r.name, glyph: r.glyph, reversed: r.reversed }
    })
    .filter((c): c is RuneCardData => c !== null)

  if (cards.length === 0) return null

  return (
    <>
      <RuneDefs />
      <div className="grid grid-cols-3 gap-2 sm:gap-3" role="list" aria-label={t.spreadLabel}>
        {cards.map((c, i) => (
          <div
            key={i}
            role="listitem"
            aria-label={`${c.position ? c.position + ": " : ""}${c.name}${c.reversed ? `, ${t.reversed}` : ""}`}
            className={`relative flex flex-col items-center rounded-xl border border-white/[0.12] px-2 pt-3 pb-3 text-center ${animate ? "rune-enter" : ""}`}
            style={{
              background:
                "radial-gradient(circle at 50% 25%, rgba(181,126,255,0.14), rgba(255,255,255,0.035) 60%, rgba(255,255,255,0.02))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 40px rgba(255,255,255,0.02)",
              animationDelay: animate ? `${i * 90}ms` : undefined,
            }}
          >
            <span className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-widest leading-tight min-h-[2.2em] flex items-center">
              {c.position}
            </span>
            <div className="my-1.5 sm:my-2 flex items-center justify-center">
              <RuneObject name={c.name} glyph={c.glyph} reversed={c.reversed} index={i} />
            </div>
            <span className="text-white/90 text-xs sm:text-sm font-medium leading-tight">{c.name}</span>
            <span className={`text-[10px] mt-1 leading-tight ${c.reversed ? "text-amber-200/80" : "text-white/35"}`}>
              {c.reversed ? t.reversed : t.upright}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
