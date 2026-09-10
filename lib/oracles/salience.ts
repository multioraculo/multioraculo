/**
 * Condensação por saliência: reduz uma leitura ao seu conteúdo informativo
 * sem reescrevê-la, para que os cinco oráculos cheguem à síntese com peso
 * comparável — mesma quantidade de INFORMAÇÃO, não só de caracteres.
 *
 * O que é preservado, nesta ordem de prioridade:
 *   1. conclusão (últimas frases) e tese (primeira frase);
 *   2. tensões, contradições e advertências (marcadores em pt/en/es);
 *   3. elementos centrais e relações (frases que nomeiam símbolos sorteados);
 *   4. o restante, na ordem original, até o orçamento.
 *
 * O corte acontece SEMPRE em fim de frase; nenhuma frase é truncada no meio.
 * Módulo puro, sem dependências: serve ao servidor e a testes.
 */

/** Orçamento por oráculo na síntese (caracteres). Igual para os cinco. */
export const SYNTHESIS_ORACLE_BUDGET = 1500

/** Marcadores de tensão, contradição, risco e advertência (pt · en · es). */
const TENSION = [
  // pt
  "mas", "porem", "porém", "contudo", "entretanto", "no entanto", "embora", "ainda que", "apesar",
  "tensao", "tensão", "conflito", "contradicao", "contradição", "contradiz", "oposicao", "oposição",
  "risco", "perigo", "cuidado", "alerta", "atencao", "atenção", "evite", "evitar", "cautela",
  "ruptura", "perda", "obstaculo", "obstáculo", "impedimento", "sombra", "resistencia", "resistência",
  "nao ", "não ", "dificuldade", "adverte", "advertencia", "advertência", "ameaca", "ameaça",
  // en
  "but", "however", "although", "though", "yet", "nevertheless", "despite",
  "tension", "conflict", "contradiction", "contradicts", "opposition",
  "risk", "danger", "caution", "warning", "beware", "avoid", "careful",
  "rupture", "loss", "obstacle", "shadow", "resistance", "difficulty", "threat",
  // es
  "pero", "sin embargo", "aunque", "no obstante", "a pesar",
  "tension", "tensión", "conflicto", "contradiccion", "contradicción", "oposicion", "oposición",
  "riesgo", "peligro", "cuidado", "aviso", "evita", "cautela",
  "ruptura", "perdida", "pérdida", "obstaculo", "obstáculo", "sombra", "resistencia", "dificultad",
]

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

/**
 * Divide em frases sem quebrar abreviações e números ("Hex. 36", "24-72",
 * "Sr. "): só corta quando o que vem depois começa como frase nova.
 */
export function splitSentences(text: string): string[] {
  const parts = text
    .trim()
    .split(/(?<=[.!?…])[ \t]+(?=["“'(\[]?[A-ZÀ-ÖØ-Þ])/u)
    .map((s) => s.trim())
    .filter(Boolean)
  // parágrafos também separam unidades semânticas
  return parts.flatMap((p) => p.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean))
}

export type SalienceOptions = {
  /** teto em caracteres; o resultado nunca passa disso */
  budget?: number
  /** nomes dos símbolos sorteados: frases que os citam são elementos centrais */
  symbols?: string[]
}

/** Pontuação de saliência de uma frase dentro da leitura. */
function scoreOf(sentence: string, i: number, total: number, symbols: string[]): number {
  const s = normalize(sentence)
  let score = 0
  if (i === total - 1) score += 5 // conclusão
  else if (i === total - 2) score += 2
  if (i === 0) score += 3 // tese
  for (const m of TENSION) {
    if (s.includes(m)) {
      score += 3
      break
    }
  }
  for (const sym of symbols) {
    if (sym.length >= 3 && s.includes(sym)) {
      score += 2
      break
    }
  }
  return score
}

/**
 * Reduz `text` ao orçamento preservando o que carrega informação. Devolve as
 * frases escolhidas na ordem original, unidas por espaço. Texto que já cabe
 * volta inteiro.
 */
export function condenseReading(text: string, opts: SalienceOptions = {}): string {
  const budget = opts.budget ?? SYNTHESIS_ORACLE_BUDGET
  const clean = text.trim()
  if (clean.length <= budget) return clean

  const sentences = splitSentences(clean)
  if (sentences.length <= 1) {
    // sem fronteira de frase: corta no último espaço antes do teto
    const cut = clean.lastIndexOf(" ", budget)
    return clean.slice(0, cut > budget * 0.6 ? cut : budget).trim()
  }

  const symbols = (opts.symbols ?? []).map(normalize)
  const ranked = sentences
    .map((s, i) => ({ i, s, score: scoreOf(s, i, sentences.length, symbols) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)

  const chosen = new Set<number>()
  let used = 0
  for (const r of ranked) {
    const cost = r.s.length + (chosen.size > 0 ? 1 : 0)
    if (used + cost > budget) continue
    chosen.add(r.i)
    used += cost
  }
  // nenhuma frase coube (frases muito longas): garante ao menos a conclusão
  if (chosen.size === 0) {
    const last = sentences[sentences.length - 1]
    const cut = last.lastIndexOf(" ", budget)
    return last.slice(0, cut > budget * 0.6 ? cut : budget).trim()
  }

  return sentences
    .filter((_, i) => chosen.has(i))
    .join(" ")
    .trim()
}
