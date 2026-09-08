/**
 * Vínculo determinístico entre a carta sorteada (índice 0–77 em TAROT_DECK) e
 * o arquivo de imagem. Nada de comparação de texto: o índice é o identificador
 * estável. Módulo puro, seguro para o navegador (não importa o motor).
 *
 * Índice 0–21 = arcanos maiores (0 = O Louco … 21 = O Mundo).
 * Índice 22–77 = menores: naipe × 14 + valor, na ordem do motor
 * (Copas, Espadas, Paus, Ouros; Ás … Dez, Valete, Cavaleiro, Rainha, Rei).
 *
 * Deck: CBD Tarot de Marseille (Yoav Ben-Dov, 2010, sobre Nicolas Conver 1760),
 * arquivos em public/tarot/cbd — ver CREDITS.md.
 */

export const TAROT_ASSET_BASE = "/tarot/cbd"
export const TAROT_DECK_SIZE = 78

/** Naipes na ordem do motor (SUITS em draw.ts) → nome do arquivo. */
export const SUIT_SLUGS = ["cups", "swords", "wands", "coins"] as const
export type SuitSlug = (typeof SUIT_SLUGS)[number]

export type TarotCardRef =
  | { id: string; arcana: "major"; number: number; reversed: boolean }
  | { id: string; arcana: "minor"; suit: SuitSlug; rank: number; reversed: boolean }

const pad = (n: number) => String(n).padStart(2, "0")

/** Identificador estável de uma carta pelo índice do baralho (sem orientação). */
export function tarotCardId(index: number): string {
  if (!Number.isInteger(index) || index < 0 || index >= TAROT_DECK_SIZE) throw new Error(`carta inválida ${index}`)
  if (index < 22) return `major-${pad(index)}`
  const m = index - 22
  return `${SUIT_SLUGS[Math.floor(m / 14)]}-${pad((m % 14) + 1)}`
}

/** Caminho público da imagem de uma carta. */
export function tarotAssetPath(cardIdOrIndex: string | number): string {
  const id = typeof cardIdOrIndex === "number" ? tarotCardId(cardIdOrIndex) : cardIdOrIndex
  return `${TAROT_ASSET_BASE}/${id}.jpg`
}

/** Estrutura enviada ao navegador para cada carta da tiragem. */
export function tarotCardRef(index: number, reversed: boolean): TarotCardRef {
  const id = tarotCardId(index)
  if (index < 22) return { id, arcana: "major", number: index, reversed }
  const m = index - 22
  return { id, arcana: "minor", suit: SUIT_SLUGS[Math.floor(m / 14)], rank: (m % 14) + 1, reversed }
}

/** Todos os ids do baralho (para conferência dos arquivos). */
export function allTarotCardIds(): string[] {
  return Array.from({ length: TAROT_DECK_SIZE }, (_, i) => tarotCardId(i))
}

export const TAROT_CREDIT = {
  deck: "CBD Tarot de Marseille",
  author: "Dr. Yoav Ben-Dov",
  url: "https://www.cbdtarot.com",
  license: "CC BY-NC-SA 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/3.0/",
}
