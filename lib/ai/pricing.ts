/**
 * Tabela de preços dos modelos (USD por 1 milhão de tokens), versionada.
 *
 * O custo de cada chamada é calculado NA HORA e gravado em ai_usage junto com
 * a versão da tabela usada. Quando um preço mudar, acrescente uma nova
 * entrada com `since` mais recente: o histórico já gravado não é recalculado.
 * Tudo aqui é ESTIMATIVA; a fatura real é a da OpenAI.
 */

export type ModelPrice = {
  /** prefixo do nome do modelo (ex.: "gpt-4o-mini" cobre "gpt-4o-mini-2024-07-18") */
  model: string
  /** data de vigência (ISO) */
  since: string
  inputPerMillion: number
  outputPerMillion: number
}

export const PRICING_VERSION = "2026-09"

// Ordem importa: prefixos mais específicos primeiro.
export const MODEL_PRICES: ModelPrice[] = [
  { model: "gpt-4o-mini", since: "2024-07-18", inputPerMillion: 0.15, outputPerMillion: 0.6 },
  { model: "gpt-4o", since: "2024-08-06", inputPerMillion: 2.5, outputPerMillion: 10 },
  // transcrição de voz: tokens de áudio na entrada, texto na saída (≈ US$ 0,003 por minuto falado)
  { model: "gpt-4o-mini-transcribe", since: "2025-03-20", inputPerMillion: 1.25, outputPerMillion: 5 },
]

export function priceFor(model: string, at: Date = new Date()): ModelPrice | null {
  const candidates = MODEL_PRICES.filter((p) => model.startsWith(p.model) && new Date(p.since).getTime() <= at.getTime())
  if (candidates.length === 0) return null
  // prefixo mais longo (mais específico) e vigência mais recente
  candidates.sort((a, b) => b.model.length - a.model.length || b.since.localeCompare(a.since))
  return candidates[0]
}

/** Custo estimado em USD; 0 quando o modelo não está na tabela (fica registrado mesmo assim). */
export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number, at: Date = new Date()): number {
  const p = priceFor(model, at)
  if (!p) return 0
  const cost = (inputTokens / 1_000_000) * p.inputPerMillion + (outputTokens / 1_000_000) * p.outputPerMillion
  return Math.round(cost * 1_000_000) / 1_000_000
}
