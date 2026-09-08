"use client"

import { useI18n } from "@/components/i18n-provider"
import { TAROT_CREDIT, tarotAssetPath, type TarotCardRef } from "@/lib/oracles/tarot-assets"

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
 */

type Item = { position?: string; name: string }

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

function Capsule({ card, label, width }: { card: TarotCardRef; label: string; width?: number }) {
  return (
    <div className="tc-capsule" style={width ? { width } : undefined}>
      <img
        className="tc-art"
        src={tarotAssetPath(card.id)}
        alt=""
        width={205}
        height={397}
        loading="lazy"
        draggable={false}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default function TarotSpread({ items, cards, animate = false }: Props) {
  const { dict } = useI18n()
  const t = dict.tarot
  if (!cards || cards.length === 0) return null

  const entries = cards.slice(0, 10).map((card, i) => {
    const it = items[i] ?? { name: "" }
    const name = stripReversed(it.name, t.reversed)
    const orientation = card.reversed ? t.reversed : t.upright
    const label = `${it.position ? it.position + ": " : ""}${name}, ${orientation}`
    return { card, position: it.position ?? "", name, orientation, label }
  })

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
              <div key={i} role="listitem" aria-label={e.label} className="absolute" style={{ left: s.x, top: s.y, width: CARD_W, zIndex: s.z }}>
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
                  <Capsule card={e.card} label={e.label} width={CARD_W} />
                </div>
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
            <div key={i} role="listitem" aria-label={e.label} className="flex flex-col items-center text-center">
              <span className="text-white/40 text-[10px] uppercase tracking-widest leading-tight min-h-[2.2em] flex items-end mb-2">
                {e.position}
              </span>
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
                <Capsule card={e.card} label={e.label} />
              </div>
              <span className="text-white/90 text-xs font-medium leading-tight mt-2">{e.name}</span>
              <span className={`text-[10px] mt-0.5 leading-tight ${e.card.reversed ? "text-amber-200/80" : "text-white/35"}`}>{e.orientation}</span>
            </div>
          )
        })}
      </div>

      <p className="text-white/35 text-[10px] text-center mt-4 leading-relaxed">
        {t.credit}{" "}
        <a href={TAROT_CREDIT.url} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 hover:text-white/60">
          {TAROT_CREDIT.deck}, {TAROT_CREDIT.author}
        </a>{" "}
        ·{" "}
        <a href={TAROT_CREDIT.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 hover:text-white/60">
          {TAROT_CREDIT.license}
        </a>
      </p>
    </>
  )
}
