"use client"

import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { tarotArtPng, tarotArtSrcSet, tarotNumeral, type TarotCardRef } from "@/lib/oracles/tarot-assets"
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
 * A geometria é a tradicional da Cruz Celta (cruz + bastão), com o número da
 * posição em cada carta, EM QUALQUER TELA: a mesa é desenhada em porcentagens
 * de uma caixa de proporção fixa que ocupa a largura disponível até o tamanho
 * do desktop, e a tipografia da lâmina acompanha a largura real da carta
 * (unidades de container). No celular ela encolhe inteira, em vez de virar uma
 * lista carta a carta; a lista textual logo abaixo continua dando posição,
 * nome e orientação. Carta invertida termina fisicamente de cabeça para baixo;
 * a que cruza deita sobre a central.
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
  /**
   * A interpretação ainda não chegou: o verso promete que o significado
   * aparece quando o oráculo terminar de escrever.
   *
   * Isto NÃO é o mesmo que `animate`, e era de `animate` que vinha antes. O
   * sorteio chega ao navegador antes das cinco interpretações (evento "draw"),
   * e nessa janela a promessa é verdadeira. Depois do evento "oracles" ela
   * deixa de ser — mas `animate` continua ligado, porque é a flag da
   * distribuição das cartas. Uma carta sem significado passava a prometer para
   * sempre um texto que não vem mais, e com o detector de transcrição isso
   * ficou visível: na tiragem com 9 das 10 cartas invertidas os dez
   * significados são descartados, e as dez cartas prometiam.
   */
  pending?: boolean
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

/**
 * Número de cada posição: pequeno, na calha entre as cartas, nunca por cima de
 * uma. A regra é a mesma para todas: termina NUM_GAP px antes da borda
 * esquerda da carta, alinhado ao topo dela. A carta que cruza não tem calha
 * livre dos lados, porque as pontas deitam sobre a 4 e a 6; o 2 vai então para
 * o canto oposto do centro, logo abaixo da ponta direita, na calha entre a
 * central e a 6. Assim 1 e 2 ficam em cantos diferentes e não se tocam.
 */
const NUM_GAP = 4
const NUM: Array<{ x: number; y: number; lado: "esq" | "dir" }> = SLOTS.map((s, i) =>
  i === 1
    ? { x: colX(1) + CARD_W + NUM_GAP, y: rowY(1) + (CARD_H + CARD_W) / 2 + 3, lado: "dir" }
    : { x: s.x - NUM_GAP, y: s.y + 1, lado: "esq" },
)

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
export function TarotCapsule({
  card,
  name,
  label,
  width,
  sizes,
  prioridade = false,
}: {
  card: TarotCardRef
  name: string
  label: string
  /** largura em px; ausente = fluida (100% do container, tipografia em unidades de container) */
  width?: number
  /** `sizes` do <img> quando a largura é fluida */
  sizes?: string
  /** carta da primeira dobra: baixa já, sem esperar o layout (loading=eager) */
  prioridade?: boolean
}) {
  const numeral = tarotNumeral(card)
  // A gravura chega depois da lâmina. Enquanto não chega, a janela mostra uma luz
  // de espera (.tk-art.is-loading), que some no onLoad. Se a imagem já estiver no
  // cache quando o componente monta, o efeito a dá por pronta sem piscar.
  const [carregando, setCarregando] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth > 0) setCarregando(false)
  }, [])
  const webp = tarotArtSrcSet(card.id)
  return (
    <div className="tk-card" style={{ ...(width ? { width } : undefined), ["--tk-cw" as string]: width ? `${width}px` : "100cqw" }}>
      {numeral ? <span className="tk-num" aria-hidden="true">{numeral}</span> : null}
      <span className="tk-rule tk-rule-top" aria-hidden="true" />
      <div className={"tk-art" + (carregando ? " is-loading" : "")}>
        {/* <picture>: o WebP em duas larguras (300 e 600) no <source>, e o navegador
            pega a menor que cobre a lâmina na densidade da tela (a ampliação de
            300 px CSS sempre recebe a de 600). No <img> fica o PNG de nome fixo,
            que só navegador sem WebP pede; quem decodifica WebP nunca o baixa. */}
        <picture>
          {webp ? <source type="image/webp" srcSet={webp} sizes={width ? width + "px" : (sizes ?? "150px")} /> : null}
          <img
            ref={imgRef}
            src={tarotArtPng(card.id)}
            alt={name}
            width={600}
            height={992}
            loading={prioridade ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            onLoad={() => setCarregando(false)}
            onError={() => setCarregando(false)}
          />
        </picture>
      </div>
      <span className="tk-rule tk-rule-bot" aria-hidden="true" />
      <span className="tk-nome" aria-hidden="true">{name}</span>
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default function TarotSpread({ items, cards, animate = false, pending = false }: Props) {
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
  // geometria em porcentagem da caixa: a mesma cruz em qualquer largura
  const px = (v: number) => `${(v / BOX_W) * 100}%`
  const py = (v: number) => `${(v / BOX_H) * 100}%`
  // a carta ocupa CARD_W/BOX_W da caixa, e a caixa no máximo BOX_W (ou a largura da tela, menos as margens)
  const sizesCarta = `(min-width: ${BOX_W + 48}px) ${CARD_W}px, ${Math.round((CARD_W / BOX_W) * 100)}vw`

  return (
    <>
      {/* A Cruz Celta, em qualquer tela: caixa de proporção fixa, cartas em porcentagem */}
      <div className="flex justify-center" role="list" aria-label={t.spreadLabel}>
        <div className="relative w-full" style={{ maxWidth: BOX_W, aspectRatio: `${BOX_W} / ${BOX_H}` }}>
          {entries.map((e, i) => {
            const s = SLOTS[i]
            const rot = s.rot + (e.card.reversed ? 180 : 0)
            return (
              // tc-hit: o clique segue a lâmina girada, não a caixa em pé; é também o
              // container de que a lâmina tira a medida da tipografia (ver globals.css)
              <div key={i} role="listitem" aria-label={e.label} className={`absolute tc-hit ${focus.focusedIndex === i ? "fc-away" : ""}`} style={{ left: px(s.x), top: py(s.y), width: px(CARD_W), zIndex: s.z }}>
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
                  <TarotCapsule card={e.card} name={e.name} label={e.label} sizes={sizesCarta} />
                </div>
                </button>
              </div>
            )
          })}
          {/* números numa camada própria, acima de todas as cartas */}
          {entries.map((_, i) => (
            <span
              key={`n${i}`}
              className={`tc-num ${NUM[i].lado === "dir" ? "tc-num-dir" : ""} ${focus.focusedIndex === i ? "fc-away" : ""}`}
              style={{ left: px(NUM[i].x), top: py(NUM[i].y) }}
              aria-hidden="true"
            >
              <span className={animate ? "tc-num-enter" : undefined} style={{ animationDelay: animate ? `${i * STEP_MS + 420}ms` : undefined }}>
                {i + 1}
              </span>
            </span>
          ))}
        </div>
      </div>

      <FocusCard
        state={focus.state}
        items={entries.map((e) => ({ position: e.position, name: e.name, orientation: e.orientation, meaning: e.meaning }))}
        renderFront={(i) => (
          <div style={{ transform: entries[i].card.reversed ? "rotate(180deg)" : undefined }}>
            <TarotCapsule card={entries[i].card} name={entries[i].name} label={entries[i].label} width={300} />
          </div>
        )}
        onAdvance={focus.advance}
        onClose={focus.close}
        width="min(78vw, 300px, 31vh)"
        aspect="92 / 178"
        live={pending}
      />

    </>
  )
}
