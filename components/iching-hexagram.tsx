"use client"

import { useI18n } from "@/components/i18n-provider"
import { fmt } from "@/lib/i18n"
import { bitsOfHexagram } from "@/lib/oracles/draw"

/**
 * Visualização do I Ching: o hexagrama real da consulta, construído pelas
 * seis linhas que o motor já sorteou (de baixo para cima). Só representa o
 * payload: bits (1 = yang, 0 = yin), linhas mutantes e hexagrama resultante.
 *
 * Leituras antigas não trazem o campo estruturado; nesse caso as linhas são
 * reconstruídas do número King Wen do hexagrama principal (inversão da
 * tabela do motor) e as mutantes, da diferença para o resultante.
 *
 * Materialidade no mesmo universo de Búzios e Runas, sem WebGL, mas mais
 * etérea: peças de vidro fosco / jade translúcido. O gradiente do card é
 * visto (desfocado) através de cada peça, a luz parece atravessar o volume
 * e o relevo vem de sombras internas; espessura, sombra de contato e um
 * brilho externo mínimo mantêm o objeto físico. Yin e yang diferem pela
 * geometria (barra inteira × barra partida), nunca só pela cor.
 */

export type HexagramData = {
  bits: number[]
  moving: number[]
  primary: number
  resulting: number | null
  lowerTrigram: number
  upperTrigram: number
}

type Item = { position?: string; name: string }

/** Índice do trigrama (ordem Qian, Dui, Li, Zhen, Xun, Kan, Gen, Kun) a partir de 3 bits de baixo para cima. */
const TRIGRAM_KEYS = ["111", "110", "101", "100", "011", "010", "001", "000"]
function trigramIndex(bits: number[]): number {
  return Math.max(0, TRIGRAM_KEYS.indexOf(bits.join("")))
}

/** Número King Wen no início do nome do item ("24. O Retorno" / "24. Return"). */
function numberOf(name: string): number | null {
  const m = name.trim().match(/^(\d{1,2})\./)
  const n = m ? parseInt(m[1], 10) : NaN
  return n >= 1 && n <= 64 ? n : null
}

/** Reconstrói a estrutura a partir dos itens quando o payload não traz `hexagram`. */
export function hexagramFromItems(items: Item[]): HexagramData | null {
  if (items.length === 0) return null
  const primary = numberOf(items[0].name)
  if (!primary) return null
  const bits = bitsOfHexagram(primary)
  const last = items.length > 1 ? numberOf(items[items.length - 1].name) : null
  const resulting = last && last !== primary ? last : items.length > 1 && last === primary ? last : null
  let moving: number[] = []
  if (resulting) {
    const rbits = bitsOfHexagram(resulting)
    moving = bits.map((b, i) => (b !== rbits[i] ? i + 1 : 0)).filter(Boolean)
  }
  return { bits, moving, primary, resulting, lowerTrigram: trigramIndex(bits.slice(0, 3)), upperTrigram: trigramIndex(bits.slice(3, 6)) }
}

/**
 * Uma linha: yang = uma peça inteira; yin = duas peças com vão no meio.
 * Cada peça é vidro fosco em CSS (classes hx-* em globals.css): preenchimento
 * baixo, backdrop-filter desfocando o gradiente que passa por trás, bevel e
 * borda luminosa por sombras internas, lateral em lilás semi-transparente
 * para a espessura, sombra de contato suave e brilho externo mínimo.
 * Sem filter CSS no contêiner: ele quebraria o backdrop-filter das peças.
 */
function Line({ yang, moving, delay, animate }: { yang: boolean; moving: boolean; delay: number; animate: boolean }) {
  // geometria no mesmo quadro 0–200 das versões anteriores (percentuais)
  const shapes: Array<[number, number]> = yang ? [[6, 188]] : [[6, 80], [114, 80]]
  const pos = ([x, w]: [number, number]) => ({ left: `${x / 2}%`, width: `${w / 2}%` })
  return (
    <div
      className={`hx-line relative h-[19px] ${moving ? "hx-moving" : ""} ${animate ? "hx-enter" : ""}`}
      style={{ animationDelay: animate ? `${delay}ms` : undefined }}
    >
      {shapes.map((s) => (
        <div key={`g${s[0]}`} className="hx-gl" style={pos(s)} aria-hidden="true" />
      ))}
      {shapes.map((s) => (
        <div key={`s${s[0]}`} className="hx-sd" style={pos(s)} aria-hidden="true" />
      ))}
      {shapes.map((s) => (
        <div key={`p${s[0]}`} className="hx-pc" style={pos(s)} aria-hidden="true" />
      ))}
      {moving && <div className="hx-dot" aria-hidden="true" />}
    </div>
  )
}

function Hexagram({ bits, moving, startDelay, step, animate, label }: { bits: number[]; moving: number[]; startDelay: number; step: number; animate: boolean; label: string }) {
  return (
    <div className="flex flex-col-reverse gap-[10px] w-[172px] max-w-full" role="img" aria-label={label}>
      {bits.map((b, i) => (
        <Line key={i} yang={b === 1} moving={moving.includes(i + 1)} delay={startDelay + i * step} animate={animate} />
      ))}
    </div>
  )
}

type Props = {
  items: Item[]
  /** estrutura vinda do motor; leituras antigas usam os itens */
  hexagram?: HexagramData | null
  /** construção linha a linha só na primeira aparição (leitura ao vivo) */
  animate?: boolean
}

export default function IChingHexagram({ items, hexagram, animate = false }: Props) {
  const { dict } = useI18n()
  const t = dict.iching
  const data = hexagram ?? hexagramFromItems(items)
  if (!data || data.bits.length !== 6) return null

  const rbits = data.resulting ? data.bits.map((b, i) => (data.moving.includes(i + 1) ? 1 - b : b)) : null
  const name = (n: number) => items.find((it) => numberOf(it.name) === n)?.name.replace(/^\d{1,2}\.\s*/, "") ?? ""
  const trig = (bits: number[]) => ({ upper: t.trigrams[trigramIndex(bits.slice(3, 6))], lower: t.trigrams[trigramIndex(bits.slice(0, 3))] })
  const p = trig(data.bits)
  const r = rbits ? trig(rbits) : null
  const movingText = data.moving.map((n) => t.lineOrdinals[n - 1]).join(", ")
  const fade = animate ? "hx-fade" : ""

  const caption = (title: string, n: number, tri: { upper: string; lower: string }) => (
    <div className={`mt-3 text-center ${fade}`} style={animate ? { animationDelay: "1250ms" } : undefined}>
      <p className="text-white/40 text-[10px] uppercase tracking-widest">{title}</p>
      <p className="text-white/90 text-[13px] mt-0.5">{n} · {name(n)}</p>
      <p className="text-white/45 text-[11px] mt-1 leading-relaxed">
        {t.upper} · {tri.upper}
        <br />
        {t.lower} · {tri.lower}
      </p>
    </div>
  )

  const ariaPrimary = fmt(t.ariaHexagram, { number: data.primary, name: name(data.primary), lines: data.bits.map((b) => (b ? t.yang : t.yin)).join(", ") })

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-[10px] sm:gap-x-9 sm:gap-y-4 pt-2 pb-1">
        <div className="flex flex-col items-center">
          <Hexagram bits={data.bits} moving={data.moving} startDelay={0} step={170} animate={animate} label={ariaPrimary} />
          {caption(data.resulting ? t.primary : t.hexagram, data.primary, p)}
        </div>

        {rbits && r && data.resulting && (
          <>
            <div className={`flex flex-col items-center gap-0.5 text-white/35 ${fade}`} style={animate ? { animationDelay: "1400ms" } : undefined} aria-hidden="true">
              <span className="text-xl leading-none hidden sm:inline">→</span>
              <span className="text-xl leading-none sm:hidden">↓</span>
              <span className="text-[10px] uppercase tracking-widest">{t.transformation}</span>
            </div>
            <div className={`flex flex-col items-center ${fade}`} style={animate ? { animationDelay: "1500ms" } : undefined}>
              <Hexagram
                bits={rbits}
                moving={data.moving}
                startDelay={1550}
                step={60}
                animate={animate}
                label={fmt(t.ariaHexagram, { number: data.resulting, name: name(data.resulting), lines: rbits.map((b) => (b ? t.yang : t.yin)).join(", ") })}
              />
              {caption(t.resulting, data.resulting, r)}
            </div>
          </>
        )}
      </div>
      <p className={`text-white/50 text-[11px] text-center mt-3 ${fade}`} style={animate ? { animationDelay: "1250ms" } : undefined}>
        {data.moving.length > 0 ? (
          <>
            {t.movingLines} <span className="text-violet-200/95 font-medium">{movingText}</span>
          </>
        ) : (
          t.noMoving
        )}
      </p>
    </>
  )
}
