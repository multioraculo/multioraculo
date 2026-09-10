"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { useI18n } from "@/components/i18n-provider"

/**
 * Carta em foco: ao tocar numa carta ou runa da tiragem, ela "sai da mesa"
 * (o lugar dela fica apagado) e aparece maior no centro da tela. Um segundo
 * toque vira a carta e mostra, no verso, posição, nome, orientação e o
 * significado que o oráculo escreveu para ela. Um terceiro toque devolve a
 * carta à mesa. Esc e toque fora também fecham.
 *
 * O componente não sabe desenhar cartas: cada tiragem entrega a frente por
 * `renderFront(i)` (a mesma peça da mesa, maior). O verso é uma lâmina de
 * texto comum a todos os oráculos. Só CSS 3D, sem WebGL.
 */

export type FocusItem = { position?: string; name: string; meaning?: string; orientation?: string }

export type FocusState = { index: number; side: "front" | "back" } | null

export function useFocusCard() {
  const [state, setState] = useState<FocusState>(null)
  const open = useCallback((index: number) => setState({ index, side: "front" }), [])
  const advance = useCallback(() => setState((s) => (!s ? null : s.side === "front" ? { ...s, side: "back" } : null)), [])
  const close = useCallback(() => setState(null), [])
  return { state, open, advance, close, focusedIndex: state?.index ?? null }
}

type Props = {
  state: FocusState
  items: FocusItem[]
  renderFront: (index: number) => ReactNode
  onAdvance: () => void
  onClose: () => void
  /** largura da carta em foco (expressão CSS, ex.: "min(78vw, 300px, 31vh)") */
  width: string
  /** proporção largura/altura da carta (ex.: "205 / 397") */
  aspect: string
  /** leitura ao vivo: o significado pode ainda não ter chegado */
  live?: boolean
  /** classe extra para o verso (variações de material por oráculo) */
  backClassName?: string
}

export default function FocusCard({ state, items, renderFront, onAdvance, onClose, width, aspect, live = false, backClassName = "" }: Props) {
  const { dict } = useI18n()
  const t = dict.focus
  const open = state !== null

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!state || typeof document === "undefined") return null
  const item = items[state.index]
  if (!item) return null
  const back = state.side === "back"
  const meaning = item.meaning?.trim()

  return createPortal(
    <div className="fc-root" role="dialog" aria-modal="true" aria-label={item.name}>
      <button type="button" className="fc-backdrop" aria-label={t.close} onClick={onClose} />
      <div className="fc-stage">
        <div className="fc-enter">
          <div
            className={`fc-card ${back ? "is-back" : ""}`}
            style={{ width, aspectRatio: aspect }}
            onClick={onAdvance}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onAdvance()
              }
            }}
            aria-label={back ? t.back : t.flip}
          >
            <div className="fc-face fc-front">{renderFront(state.index)}</div>
            <div className={`fc-face fc-back ${backClassName}`}>
              <div className="fc-panel">
                {item.position && <p className="fc-pos">{item.position}</p>}
                <p className="fc-name">{item.name}</p>
                {item.orientation && <p className="fc-orient">{item.orientation}</p>}
                <p className={`fc-meaning ${meaning ? "" : "is-empty"}`}>{meaning || (live ? t.pending : t.none)}</p>
              </div>
            </div>
          </div>
        </div>
        <p className="fc-hint" aria-hidden="true">{back ? t.back : t.flip}</p>
      </div>
    </div>,
    document.body
  )
}
