/**
 * Vínculo determinístico entre a carta sorteada (índice 0–77 em TAROT_DECK) e
 * o arquivo de imagem. Nada de comparação de texto: o índice é o identificador
 * estável. Módulo puro, seguro para o navegador (não importa o motor).
 *
 * Índice 0–21 = arcanos maiores (0 = O Louco … 21 = O Mundo).
 * Índice 22–77 = menores: naipe × 14 + valor, na ordem do motor
 * (Copas, Espadas, Paus, Ouros; Ás … Dez, Valete, Cavaleiro, Rainha, Rei).
 *
 * A arte é a do baralho próprio, em public/tarot/art, ingerida das folhas de
 * referência com scripts/tarot-ingest.mjs.
 */

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

/**
 * Gravura recortada com fundo transparente, ingerida das folhas de referência
 * com `scripts/tarot-ingest.mjs`. A carta em si é desenhada pela interface: a
 * lâmina, o filete, o número e o nome. Da imagem vem só a figura, sem a
 * cercadura, sem o numeral e sem a faixa em francês.
 *
 * Todas as 78 saem na mesma tela, então a figura preenche a janela da lâmina
 * sem sobra. A janela em CSS tem a mesma proporção (ver `.tk-art`).
 */
export const TAROT_ART_BASE = "/tarot/art"

export function tarotArtSrc(cardIdOrIndex: string | number): string {
  const id = typeof cardIdOrIndex === "number" ? tarotCardId(cardIdOrIndex) : cardIdOrIndex
  return `${TAROT_ART_BASE}/${id}.png`
}

const ROMANOS = [
  "", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "VIIII", "X",
  "XI", "XII", "XIII", "XIIII", "XV", "XVI", "XVII", "XVIII", "XVIIII", "XX", "XXI",
]

/**
 * Numeral que a lâmina escreve no alto, na forma de Marselha (IIII, VIIII).
 * O Louco não tem número e as figuras da corte também não, como no impresso.
 */
export function tarotNumeral(card: TarotCardRef): string {
  if (card.arcana === "major") return card.number === 0 ? "" : ROMANOS[card.number] ?? ""
  return card.rank <= 10 ? ROMANOS[card.rank] ?? "" : ""
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

