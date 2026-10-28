"use client"

import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { lenormandArtPng, lenormandArtSrcSet, lenormandId, lenormandIndexOfId } from "@/lib/oracles/lenormand-assets"
import FocusCard, { useFocusCard } from "@/components/focus-card"

/**
 * Mesa de 9 cartas do Lenormand (3×3), exatamente como o motor sorteia:
 * ordem linha a linha, posição central em destaque discreto, sem invertidas.
 * A proximidade das cartas na grade é a mesma que a interpretação usa
 * (cruz horizontal, vertical e adjacências), sem linhas ou setas.
 *
 * Cada carta reproduz a referência visual do baralho: lâmina violeta
 * translúcida de cantos arredondados, aresta luminosa fina, craquelê
 * discreto, número no alto e nome em serifa itálica embaixo, ambos em
 * marfim; a ilustração é a gravura marfim ingerida da referência
 * (public/lenormand/<id>.png), posicionada na mesma janela da carta
 * original. Número e nome vêm do motor (idioma da pessoa), não da imagem.
 *
 * Toque numa carta: ela sai da mesa e aparece maior; segundo toque vira e
 * mostra o significado; terceiro toque devolve à mesa (FocusCard).
 *
 * Identificação: id estável do payload (`cards`) ou, em leituras antigas, o
 * número no início do nome ("24 — Coração"), que é independente do idioma.
 */

type Item = { position?: string; name: string; meaning?: string }
export type LenormandCardRef = { id: string; number: number }

type Props = {
  items: Item[]
  cards?: LenormandCardRef[] | null
  /** distribuição carta a carta só na primeira aparição (leitura ao vivo) */
  animate?: boolean
}

const STEP_MS = 90

/** Índice 0–35 a partir do payload ou do número no nome do item. */
function indexOf(card: LenormandCardRef | undefined, item: Item | undefined): number | null {
  if (card) {
    const i = lenormandIndexOfId(card.id)
    if (i >= 0) return i
    if (card.number >= 1 && card.number <= 36) return card.number - 1
  }
  const m = item?.name.trim().match(/^(\d{1,2})\s*[—–-]/)
  const n = m ? parseInt(m[1], 10) : NaN
  return n >= 1 && n <= 36 ? n - 1 : null
}

function displayName(name: string): string {
  return name.replace(/^\d{1,2}\s*[—–-]\s*/, "")
}

/**
 * A lâmina de uma carta: número, gravura e nome. Tamanho vem de --ln-cw.
 * `sizes` é a largura CSS da lâmina, para o navegador escolher a gravura de
 * 300 ou 600 px; `prioridade` é para a carta da primeira dobra (loading=eager).
 */
export function LenormandCard({
  index,
  name,
  center = false,
  className = "",
  style,
  sizes = "100px",
  prioridade = false,
}: {
  index: number
  name: string
  center?: boolean
  className?: string
  style?: React.CSSProperties
  sizes?: string
  prioridade?: boolean
}) {
  // luz de espera até a gravura chegar (.ln-art.is-loading), como no Tarô
  const [carregando, setCarregando] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth > 0) setCarregando(false)
  }, [])
  const id = lenormandId(index)
  const webp = lenormandArtSrcSet(id)
  return (
    <div className={`ln-card ${center ? "ln-center" : ""} ${className}`} style={style}>
      <span className="ln-num" aria-hidden="true">{index + 1}</span>
      <div className={"ln-art" + (carregando ? " is-loading" : "")} aria-hidden="true">
        {/* gravura com fundo transparente: WebP no <source>, PNG de nome fixo no <img>
            para navegador sem WebP (como no Tarô); se a arte da carta ainda não
            existir, a lâmina fica só com número e nome */}
        <picture>
          {webp ? <source type="image/webp" srcSet={webp} sizes={sizes} /> : null}
          <img
            ref={imgRef}
            src={lenormandArtPng(id)}
            alt={name}
            loading={prioridade ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            onLoad={() => setCarregando(false)}
            onError={(ev) => {
              setCarregando(false)
              ev.currentTarget.style.display = "none"
            }}
          />
        </picture>
      </div>
      <span className="ln-name" aria-hidden="true">{name}</span>
    </div>
  )
}

export default function LenormandTable({ items, cards, animate = false }: Props) {
  const { dict } = useI18n()
  const t = dict.lenormand
  const focus = useFocusCard()

  const entries = items.slice(0, 9).map((it, i) => {
    const index = indexOf(cards?.[i], it)
    return { index, position: it.position ?? "", name: displayName(it.name), meaning: it.meaning }
  })
  if (entries.length !== 9 || entries.some((e) => e.index === null)) return null

  return (
    <>
      <div className="ln-table" role="list" aria-label={t.tableLabel}>
        {entries.map((e, i) => (
          <div key={i} role="listitem" aria-label={`${e.position ? e.position + ": " : ""}${e.index! + 1}, ${e.name}`} className={focus.focusedIndex === i ? "fc-away" : ""}>
            <div className="ln-pos">{e.position}</div>
            <button type="button" className="fc-btn" onClick={() => focus.open(i)} aria-label={`${e.name}. ${dict.focus.open}`}>
              <LenormandCard
                index={e.index!}
                name={e.name}
                center={i === 4}
                className={animate ? "ln-deal" : ""}
                style={{ animationDelay: animate ? `${i * STEP_MS}ms` : undefined }}
              />
            </button>
          </div>
        ))}
      </div>
      <FocusCard
        state={focus.state}
        items={entries.map((e) => ({ position: e.position, name: `${e.index! + 1} · ${e.name}`, meaning: e.meaning }))}
        renderFront={(i) => (
          <LenormandCard index={entries[i].index!} name={entries[i].name} center={i === 4} sizes="280px" style={{ "--ln-cw": "min(78vw, 280px, 37vh)", width: "100%" } as React.CSSProperties} />
        )}
        onAdvance={focus.advance}
        onClose={focus.close}
        width="min(78vw, 280px, 37vh)"
        aspect="0.62"
        live={animate}
        backClassName="fc-back-lenormand"
      />
    </>
  )
}
