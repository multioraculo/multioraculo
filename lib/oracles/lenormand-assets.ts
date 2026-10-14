/**
 * Cartas do Lenormand: ids estáveis (independentes do idioma) e a arte em
 * `public/lenormand/<id>.png`, ingerida das imagens de referência com
 * `scripts/lenormand-ingest.mjs` (gravura marfim com fundo transparente).
 *
 * Índice no array = número − 1, na ordem de LENORMAND_DECK (draw.ts). A arte
 * de cada carta é a JANELA fixa x 8–92 %, y 14–85 % da carta original, e o
 * componente a posiciona na mesma janela da lâmina em CSS, por isso escala e
 * posição ficam idênticas à referência. Módulo puro, seguro no navegador.
 */

import { LENORMAND_ARTE } from "./lenormand-art-manifest"

export const LENORMAND_IDS = [
  "rider", "clover", "ship", "house", "tree", "clouds", "snake", "coffin", "bouquet",
  "scythe", "whip", "birds", "child", "fox", "bear", "stars", "stork", "dog",
  "tower", "garden", "mountain", "crossroads", "mice", "heart", "ring", "book", "letter",
  "man", "woman", "lily", "sun", "moon", "key", "fish", "anchor", "cross",
] as const

export type LenormandId = (typeof LENORMAND_IDS)[number]
export const LENORMAND_COUNT = LENORMAND_IDS.length

/** Janela da arte dentro da carta (frações x0, y0, x1, y1), a mesma do script de ingestão. */
export const LENORMAND_ART_WINDOW = { left: 0.08, top: 0.14, right: 0.92, bottom: 0.85 } as const

/** Id estável da carta pelo índice do baralho (0–35). */
export function lenormandId(index: number): LenormandId {
  const id = LENORMAND_IDS[index]
  if (!id) throw new Error(`carta lenormand inválida ${index}`)
  return id
}

export function lenormandIndexOfId(id: string): number {
  return LENORMAND_IDS.indexOf(id as LenormandId)
}

/**
 * O QUE A INTERFACE SERVE não é o PNG: é o WebP gerado dele por
 * scripts/cartas-webp.mjs, em public/lenormand/arte, com o hash do conteúdo no
 * nome (lib/oracles/lenormand-art-manifest.ts). O nome muda quando a arte
 * muda, e só por isso a Netlify pode guardar esses arquivos por um ano. O PNG
 * de nome fixo continua sendo a fonte aprovada e o recurso de emergência.
 */
export function lenormandArtSrc(id: string): string {
  return LENORMAND_ARTE[id]?.src ?? `/lenormand/${id}.png`
}

/** As larguras disponíveis para o `srcSet` (a fonte de algumas cartas é pequena, e aí há uma só). */
export function lenormandArtSrcSet(id: string): string {
  return LENORMAND_ARTE[id]?.srcSet ?? `/lenormand/${id}.png 600w`
}
