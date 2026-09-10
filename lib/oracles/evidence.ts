/**
 * Seleção de trechos de referência POR ITEM SORTEADO.
 *
 * Antes, os termos de todos os itens de um oráculo eram jogados num único
 * saco e disputavam seis vagas: uma carta bem documentada tomava o lugar das
 * outras nove, e um termo amplo como o nome do naipe selecionava trechos que
 * não falavam da carta nenhuma. Agora cada item procura a SUA referência, e o
 * trecho chega ao prompt já dizendo a que símbolo pertence.
 *
 * Regras:
 * - um trecho só é candidato de um item se casar com um termo ESPECÍFICO dele
 *   (nome da carta, do hexagrama, da linha, da runa, do odu), como palavra
 *   inteira;
 * - termos amplos (naipe, numeração) e palavras da pergunta apenas desempatam
 *   entre trechos já elegíveis;
 * - item sem referência específica fica SEM trecho. Melhor nenhuma referência
 *   do que uma referência sobre outro símbolo.
 *
 * O sorteio já aconteceu antes: nada aqui influencia quais símbolos saíram.
 * Módulo puro (sem rede e sem disco) para ser exercitado por testes.
 */

import { findTerm, normalizeText, textHasTerm, type DrawItem } from "./draw"

export type Evidence = { source: string; excerpt: string; about?: string; itemIndex?: number; chunkId?: string }

/** Trecho já normalizado, pronto para busca. */
export type Chunk = { source: string; id: string; raw: string; norm: string }

/** Teto de trechos por oráculo e tamanho de cada trecho. */
export const MAX_EVIDENCE = 12
export const EXCERPT_CHARS = 500

const STOP = new Set([
  "a","o","os","as","de","do","da","dos","das","e","é","em","no","na","nos","nas",
  "por","para","pra","com","sem","um","uma","uns","umas","que","isso","isto","aqui",
  "agora","hoje","já","não","sim","se","eu","você","vc","me","minha","meu","teu",
  "tua","seu","sua","dela","dele","eles","elas","ao","à","às","é","ser","estar",
  "como","qual","quais","quando","onde","porquê","pq",
  // en
  "the","and","for","with","what","this","that","have","from","are","you","your","about",
  // es
  "que","por","para","con","una","uno","los","las","del","qué","cómo","mis","sus",
])

/** Palavras úteis da pergunta; entram só como desempate. */
export function keywords(q: string): string[] {
  const tokens = normalizeText(q)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.length >= 3)
    .filter((t) => !STOP.has(t))
  return Array.from(new Set(tokens)).slice(0, 18)
}

/**
 * Recorte do trecho em volta da PRIMEIRA menção ao símbolo, e não os
 * primeiros caracteres do bloco: em blocos longos a passagem sobre a carta
 * costuma estar no meio, e cortar do começo mandava ao modelo um pedaço que
 * não falava do símbolo nenhum. Ajusta as pontas para não partir palavras.
 */
export function excerptAround(raw: string, norm: string, terms: string[]): string {
  if (raw.length <= EXCERPT_CHARS) return raw
  // a normalização preserva o comprimento em texto latino comum; quando não
  // preservar, não dá para mapear posições e voltamos ao começo do bloco
  if (norm.length !== raw.length) return raw.slice(0, EXCERPT_CHARS)

  let at = -1
  for (const t of terms) {
    // mesma regra de palavra inteira usada na seleção, para a janela cair
    // exatamente sobre a menção que qualificou o trecho
    const p = findTerm(norm, t)
    if (p >= 0 && (at < 0 || p < at)) at = p
  }
  if (at < 0) return raw.slice(0, EXCERPT_CHARS)

  const before = Math.floor(EXCERPT_CHARS * 0.3)
  let start = Math.max(0, at - before)
  let end = Math.min(raw.length, start + EXCERPT_CHARS)
  start = Math.max(0, end - EXCERPT_CHARS)
  if (start > 0) {
    const sp = raw.indexOf(" ", start)
    if (sp > 0 && sp - start < 40) start = sp + 1
  }
  if (end < raw.length) {
    const sp = raw.lastIndexOf(" ", end)
    if (sp > start && end - sp < 40) end = sp
  }
  const body = raw.slice(start, end).trim()
  return (start > 0 ? "…" : "") + body + (end < raw.length ? "…" : "")
}

/**
 * Escolhe os trechos de um oráculo, item a item.
 * `names` são os nomes já traduzidos dos itens, na mesma ordem, usados para
 * rotular cada trecho no prompt ("Fonte 3 — sobre \"Rainha de Copas\"").
 */
export function selectEvidence(
  items: DrawItem[],
  names: string[],
  questionKeys: string[],
  pool: Chunk[]
): Evidence[] {
  const perItem = Math.max(1, Math.min(3, Math.round(MAX_EVIDENCE / Math.max(1, items.length))))
  const taken = new Set<string>()
  const out: Evidence[] = []

  items.forEach((item, idx) => {
    if (out.length >= MAX_EVIDENCE) return
    const about = names[idx] ?? ""
    const scored: Array<{ id: string; source: string; raw: string; norm: string; score: number }> = []

    for (const c of pool) {
      if (taken.has(c.id)) continue
      let score = 0
      for (const t of item.searchTerms) if (textHasTerm(c.norm, t)) score += 3
      if (score === 0) continue // sem referência específica a este símbolo
      // identidade obrigatória do contexto (ex.: o hexagrama de origem da
      // linha mutante). Sem ela, o trecho é descartado: melhor nenhuma
      // referência do que a linha de outro hexagrama.
      const context = item.contextTerms ?? []
      if (context.length > 0) {
        let contextHits = 0
        for (const t of context) if (textHasTerm(c.norm, t)) contextHits++
        if (contextHits === 0) continue
        score += Math.min(3, contextHits)
      }
      for (const t of item.broadTerms ?? []) if (textHasTerm(c.norm, t)) score += 1
      for (const k of questionKeys) if (c.norm.includes(k)) score += 1
      score += Math.min(2, Math.floor(c.raw.length / 600))
      scored.push({ id: c.id, source: c.source, raw: c.raw, norm: c.norm, score })
    }

    scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    for (const s of scored.slice(0, perItem)) {
      if (out.length >= MAX_EVIDENCE) break
      taken.add(s.id)
      out.push({
        source: s.source,
        excerpt: excerptAround(s.raw, s.norm, item.searchTerms),
        about,
        itemIndex: idx,
        chunkId: s.id,
      })
    }
  })

  return out
}
