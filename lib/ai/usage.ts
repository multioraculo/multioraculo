/**
 * Registro de uso da OpenAI (server only): uma linha por chamada em ai_usage,
 * com tokens e custo estimado. Sem prompt, sem resposta. Best-effort: nunca
 * derruba a requisição do usuário se o registro falhar.
 */

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { PRICING_VERSION, estimateCostUsd } from "./pricing"

export type AiOperation = "safety" | "oracle" | "synthesis" | "dream" | "journey" | "transcribe"

/** Formato de `usage` devolvido pela OpenAI (respostas normais e último chunk do streaming). */
export type TokenUsage =
  | { prompt_tokens?: number | null; completion_tokens?: number | null; total_tokens?: number | null }
  | null
  | undefined

export async function recordAiUsage(input: {
  operation: AiOperation
  model: string
  usage: TokenUsage
  seed?: string | null
  userId?: string | null
}): Promise<void> {
  if (!hasAdminClient()) return
  const inputTokens = Math.max(0, Number(input.usage?.prompt_tokens ?? 0) || 0)
  const outputTokens = Math.max(0, Number(input.usage?.completion_tokens ?? 0) || 0)
  const totalTokens = Number(input.usage?.total_tokens ?? 0) || inputTokens + outputTokens
  try {
    const { error } = await createAdminClient().from("ai_usage").insert({
      operation_type: input.operation,
      model: input.model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      estimated_cost_usd: estimateCostUsd(input.model, inputTokens, outputTokens),
      pricing_version: PRICING_VERSION,
      seed: input.seed ?? null,
      user_id: input.userId ?? null,
    })
    if (error) console.warn("[ai_usage]", input.operation, error.message)
  } catch (err) {
    console.warn("[ai_usage]", input.operation, err)
  }
}
