"use client"

import { useI18n } from "@/components/i18n-provider"
import { lenormandArtSrc, lenormandId, lenormandIndexOfId } from "@/lib/oracles/lenormand-assets"

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
 * Identificação: id estável do payload (`cards`) ou, em leituras antigas, o
 * número no início do nome ("24 — Coração"), que é independente do idioma.
 */

type Item = { position?: string; name: string }
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

export default function LenormandTable({ items, cards, animate = false }: Props) {
  const { dict } = useI18n()
  const t = dict.lenormand

  const entries = items.slice(0, 9).map((it, i) => {
    const index = indexOf(cards?.[i], it)
    return { index, position: it.position ?? "", name: displayName(it.name) }
  })
  if (entries.length !== 9 || entries.some((e) => e.index === null)) return null

  return (
    <div className="ln-table" role="list" aria-label={t.tableLabel}>
      {entries.map((e, i) => (
        <div key={i} role="listitem" aria-label={`${e.position ? e.position + ": " : ""}${e.index! + 1}, ${e.name}`}>
          <div className="ln-pos">{e.position}</div>
          <div
            className={`ln-card ${i === 4 ? "ln-center" : ""} ${animate ? "ln-deal" : ""}`}
            style={{ animationDelay: animate ? `${i * STEP_MS}ms` : undefined }}
          >
            <span className="ln-num" aria-hidden="true">{e.index! + 1}</span>
            <div className="ln-art" aria-hidden="true">
              {/* gravura com fundo transparente; se a arte da carta ainda não existir, a lâmina fica só com número e nome */}
              <img
                src={lenormandArtSrc(lenormandId(e.index!))}
                alt=""
                draggable={false}
                onError={(ev) => { ev.currentTarget.style.display = "none" }}
              />
            </div>
            <span className="ln-name" aria-hidden="true">{e.name}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
