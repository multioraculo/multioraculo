"use client"

import { useI18n } from "@/components/i18n-provider"
import { tarotArtSrc, tarotNumeral, type TarotCardRef } from "@/lib/oracles/tarot-assets"
import FocusCard, { useFocusCard } from "@/components/focus-card"

/**
 * Visualização da Cruz Celta do Tarô. Só representa o que o motor sorteou:
 * dez cartas, nas dez posições reais, com a orientação de cada uma. A imagem
 * vem de um id estável (índice do baralho → arquivo), nunca do texto.
 *
 * Cada carta é a arte histórica encapsulada em uma lâmina translúcida: uma
 * moldura fina de vidro (backdrop-filter, borda com highlight, espessura
 * atrás, sombra de contato e projetada) em volta da imagem intacta. Nenhum
 * filtro toca a ilustração.
 *
 * Desktop: geometria tradicional da Cruz Celta (cruz + bastão), com o número
 * da posição em cada carta; a lista textual logo abaixo dá posição, nome e
 * orientação. Celular: grade de duas colunas na ordem das posições, com
 * rótulo, nome e orientação em cada carta. Carta invertida termina
 * fisicamente de cabeça para baixo; a que cruza deita sobre a central.
 *
 * Toque numa carta: ela sai da mesa e aparece maior; segundo toque vira e
 * mostra o significado; terceiro toque devolve à mesa (FocusCard).
 */

type Item = { position?: string; name: string; meaning?: string }

type Props = {
  items: Item[]
  /** cartas estruturadas vindas do motor (ou reconstruídas do seed no servidor) */
  cards?: TarotCardRef[] | null
  /** distribuição carta a carta só na primeira aparição (leitura ao vivo) */
  animate?: boolean
}

// Proporção da arte: 205 × 397
const CARD_W = 92
const CARD_H = Math.round((CARD_W * 397) / 205) // 178
const GX = 14
const GY = 12
const STAFF_GAP = 40
const CROSS_W = 3 * CARD_W + 2 * GX
const BOX_W = CROSS_W + STAFF_GAP + CARD_W
const BOX_H = 4 * CARD_H + 3 * GY
const CROSS_TOP = Math.round((BOX_H - (3 * CARD_H + 2 * GY)) / 2)

const colX = (c: number) => c * (CARD_W + GX)
const rowY = (r: number) => CROSS_TOP + r * (CARD_H + GY)
const staffY = (r: number) => r * (CARD_H + GY)

/** Posição de cada uma das 10 cartas na geometria da Cruz Celta (índice = ordem do motor). */
const SLOTS: Array<{ x: number; y: number; rot: number; z: number }> = [
  { x: colX(1), y: rowY(1), rot: 0, z: 1 }, // 1 situação central
  { x: colX(1), y: rowY(1), rot: 90, z: 2 }, // 2 o que cruza (deitada sobre a central)
  { x: colX(1), y: rowY(2), rot: 0, z: 1 }, // 3 fundamento
  { x: colX(0), y: rowY(1), rot: 0, z: 1 }, // 4 passado recente
  { x: colX(1), y: rowY(0), rot: 0, z: 1 }, // 5 coroamento possível
  { x: colX(2), y: rowY(1), rot: 0, z: 1 }, // 6 futuro próximo
  { x: CROSS_W + STAFF_GAP, y: staffY(3), rot: 0, z: 1 }, // 7 como se vê
  { x: CROSS_W + STAFF_GAP, y: staffY(2), rot: 0, z: 1 }, // 8 influências externas
  { x: CROSS_W + STAFF_GAP, y: staffY(1), rot: 0, z: 1 }, // 9 esperanças ou medos
  { x: CROSS_W + STAFF_GAP, y: staffY(0), rot: 0, z: 1 }, // 10 resultado final
]

const STEP_MS = 140

function stripReversed(name: string, word: string): string {
  const re = new RegExp(`\\s+${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
  return name.replace(re, "")
}

/**
 * A carta desenhada pela interface: lâmina translúcida, filetes, número no alto
 * e nome embaixo, na mesma linguagem do Lenormand. Da imagem vem só a gravura,
 * com fundo transparente, e ela preenche a janela inteira.
 *
 * Número e nome vêm do motor, então acompanham o idioma; a carta impressa não
 * entra com sua tipografia em francês.
 */
function Capsule({ card, name, label, width }: { card: TarotCardRef; name: string; label: string; width?: number }) {
  const numeral = tarotNumeral(card)
  return (
    <div className="tk-card" style={{ ...(width ? { width } : undefined), ["--tk-cw" as string]: `${width ?? 150}px` }}>
      {numeral ? <span className="tk-num" aria-hidden="true">{numeral}</span> : null}
      <span className="tk-rule tk-rule-top" aria-hidden="true" />
      <div className="tk-art">
        <img src={tarotArtSrc(card.id)} alt="" width={260} height={430} loading="lazy" draggable={false} />
      </div>
      <span className="tk-rule tk-rule-bot" aria-hidden="true" />
      <span className="tk-nome" aria-hidden="true">{name}</span>
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default function TarotSpread({ items, cards, animate = false }: Props) {
  const { dict } = useI18n()
  const t = dict.tarot
  const focus = useFocusCard()
  if (!cards || cards.length === 0) return null

  const entries = cards.slice(0, 10).map((card, i) => {
    const it = items[i] ?? { name: "" }
    const name = stripReversed(it.name, t.reversed)
    const orientation = card.reversed ? t.reversed : t.upright
    const label = `${it.position ? it.position + ": " : ""}${name}, ${orientation}`
    return { card, position: it.position ?? "", name, orientation, label, meaning: it.meaning }
  })
  const openLabel = (e: (typeof entries)[number]) => `${e.label}. ${dict.focus.open}`

  const wobble = (i: number) => (((i * 7) % 5) - 2) * 1.5

  return (
    <>
      {/* Desktop: geometria da Cruz Celta */}
      <div className="hidden sm:flex justify-center" role="list" aria-label={t.spreadLabel}>
        <div className="relative" style={{ width: BOX_W, height: BOX_H }}>
          {entries.map((e, i) => {
            const s = SLOTS[i]
            const rot = s.rot + (e.card.reversed ? 180 : 0)
            // carta deitada (cruza): o número vai para a ponta esquerda da carta na horizontal
            const sideways = s.rot % 180 !== 0
            const badge = sideways ? { left: -(CARD_H - CARD_W) / 2 + 4, top: (CARD_H - CARD_W) / 2 + 4 } : { left: 4, top: 4 }
            return (
              <div key={i} role="listitem" aria-label={e.label} className={`absolute ${focus.focusedIndex === i ? "fc-away" : ""}`} style={{ left: s.x, top: s.y, width: CARD_W, zIndex: s.z }}>
                <button type="button" className="fc-btn" onClick={() => focus.open(i)} aria-label={openLabel(e)}>
                <div
                  className={`tc-slot ${animate ? "tc-deal-enter" : ""}`}
                  style={
                    {
                      "--rot": `${rot}deg`,
                      "--wob": `${wobble(i)}deg`,
                      "--dx": `${-(s.x + 90)}px`,
                      "--dy": `${-(s.y + 150)}px`,
                      animationDelay: animate ? `${i * STEP_MS}ms` : undefined,
                    } as React.CSSProperties
                  }
                >
                  <Capsule card={e.card} name={e.name} label={e.label} width={CARD_W} />
                </div>
                </button>
                <span className={`tc-num ${animate ? "tc-num-enter" : ""}`} style={{ ...badge, animationDelay: animate ? `${i * STEP_MS + 420}ms` : undefined }} aria-hidden="true">
                  {i + 1}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Celular: grade na ordem das posições, com rótulos */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:hidden" role="list" aria-label={t.spreadLabel}>
        {entries.map((e, i) => {
          const rot = e.card.reversed ? 180 : 0
          return (
            <div key={i} role="listitem" aria-label={e.label} className={`flex flex-col items-center text-center ${focus.focusedIndex === i ? "fc-away" : ""}`}>
              <span className="text-white/40 text-[10px] uppercase tracking-widest leading-tight min-h-[2.2em] flex items-end mb-2">
                {e.position}
              </span>
              <button type="button" className="fc-btn" onClick={() => focus.open(i)} aria-label={openLabel(e)}>
              <div
                className={`tc-slot ${animate ? "tc-deal-enter" : ""}`}
                style={
                  {
                    width: "min(100%, 150px)",
                    "--rot": `${rot}deg`,
                    "--wob": `${wobble(i)}deg`,
                    "--dx": `${i % 2 === 0 ? -120 : 120}px`,
                    "--dy": "-140px",
                    animationDelay: animate ? `${i * STEP_MS}ms` : undefined,
                  } as React.CSSProperties
                }
              >
                <Capsule card={e.card} name={e.name} label={e.label} width={150} />
              </div>
              </button>
              <span className="text-white/90 text-xs font-medium leading-tight mt-2">{e.name}</span>
              <span className={`text-[10px] mt-0.5 leading-tight ${e.card.reversed ? "text-amber-200/80" : "text-white/35"}`}>{e.orientation}</span>
            </div>
          )
        })}
      </div>

      <FocusCard
        state={focus.state}
        items={entries.map((e) => ({ position: e.position, name: e.name, orientation: e.orientation, meaning: e.meaning }))}
        renderFront={(i) => (
          <div style={{ transform: entries[i].card.reversed ? "rotate(180deg)" : undefined }}>
            <Capsule card={entries[i].card} name={entries[i].name} label={entries[i].label} width={300} />
          </div>
        )}
        onAdvance={focus.advance}
        onClose={focus.close}
        width="min(78vw, 300px, 31vh)"
        aspect="92 / 178"
        live={animate}
      />

    </>
  )
}
