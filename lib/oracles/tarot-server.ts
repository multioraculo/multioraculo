/**
 * Server only: reconstrói as cartas estruturadas de uma leitura antiga a
 * partir do seed, com o MESMO sorteio do motor. Leituras anteriores ao
 * campo `cards` no payload passam a ter a visualização sem nenhum ajuste
 * de texto; leituras sem seed (anteriores ao sorteio em código) ficam só
 * com a lista textual.
 */

import { drawAll } from "./draw"
import { tarotCardRef, type TarotCardRef } from "./tarot-assets"

export function tarotCardsFromSeed(seed: string | null | undefined): TarotCardRef[] | null {
  if (!seed || !/^[0-9a-f]{16,64}$/i.test(seed)) return null
  try {
    return drawAll(seed).tarot.items.map((it) => {
      const s = it.sym as { kind: "tarot"; card: number; reversed: boolean }
      return tarotCardRef(s.card, s.reversed)
    })
  } catch {
    return null
  }
}
