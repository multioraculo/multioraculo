/**
 * Consumo de tiragens (server only).
 *
 * Unidade de consumo = uma consulta completa (os cinco oráculos), registrada
 * em `reading_usage` pelo seed do sorteio. A síntese não conta; ela só é
 * liberada para um seed já concluído do mesmo usuário, uma única vez.
 *
 * A checagem de cota + o registro acontecem numa função SQL atômica
 * (`consume_reading`), com trava por usuário, para que chamadas simultâneas
 * não ultrapassem o limite.
 */

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { getUserEntitlement, type Entitlement } from "./entitlement"
import { freeMonthlyLimit } from "./plans"

export type ConsumeResult =
  | { allowed: true; used: number; limit: number | null; remaining: number | null; entitlement: Entitlement; tracked: boolean }
  | { allowed: false; code: "limit_reached" | "login_required" | "billing_unavailable"; used: number; limit: number | null; entitlement: Entitlement }

/**
 * Sem service role não há como contar nem registrar. Em desenvolvimento o
 * sistema segue aberto (comportamento original); em produção falha fechado
 * para o limite nunca ser silenciosamente desligado.
 */
function billingUnavailableIsFatal(): boolean {
  return process.env.NODE_ENV === "production"
}

export async function consumeReading(input: {
  userId: string | null
  seed: string
  locale: string
}): Promise<ConsumeResult> {
  const entitlement = await getUserEntitlement(input.userId)
  const limit = entitlement.monthlyLimit

  if (!hasAdminClient()) {
    if (billingUnavailableIsFatal()) {
      console.error("[billing] SUPABASE_SERVICE_ROLE_KEY ausente em produção: consulta bloqueada")
      return { allowed: false, code: "billing_unavailable", used: 0, limit, entitlement }
    }
    console.warn("[billing] SUPABASE_SERVICE_ROLE_KEY ausente: consulta liberada sem registro (dev)")
    return { allowed: true, used: 0, limit, remaining: null, entitlement, tracked: false }
  }

  const admin = createAdminClient()

  // Visitante sem login: só permitido enquanto o plano Free não tem limite
  // (comportamento original do projeto). Com limite configurado, é preciso
  // entrar para que o consumo possa ser contado.
  if (!input.userId) {
    if (freeMonthlyLimit() !== null) {
      return { allowed: false, code: "login_required", used: 0, limit, entitlement }
    }
    const { error } = await admin
      .from("reading_usage")
      .insert({ user_id: null, seed: input.seed, status: "started", locale: input.locale })
    if (error) console.error("[billing] falha ao registrar tiragem anônima:", error.message)
    return { allowed: true, used: 0, limit: null, remaining: null, entitlement, tracked: !error }
  }

  const { data, error } = await admin.rpc("consume_reading", {
    p_user_id: input.userId,
    p_seed: input.seed,
    p_limit: limit,
    p_period_start: entitlement.periodStart,
    p_period_end: entitlement.periodEnd,
    p_locale: input.locale,
  })

  if (error) {
    console.error("[billing] consume_reading falhou:", error.message)
    return { allowed: false, code: "billing_unavailable", used: 0, limit, entitlement }
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row?.allowed) {
    return { allowed: false, code: "limit_reached", used: Number(row?.used ?? 0), limit, entitlement }
  }
  return {
    allowed: true,
    used: Number(row.used ?? 0),
    limit,
    remaining: row.remaining === null || row.remaining === undefined ? null : Number(row.remaining),
    entitlement,
    tracked: true,
  }
}

export async function completeReading(seed: string): Promise<void> {
  if (!hasAdminClient()) return
  const { error } = await createAdminClient()
    .from("reading_usage")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("seed", seed)
    .eq("status", "started")
  if (error) console.error("[billing] completeReading:", error.message)
}

/** Tiragem que falhou não conta na cota. */
export async function failReading(seed: string): Promise<void> {
  if (!hasAdminClient()) return
  const { error } = await createAdminClient()
    .from("reading_usage")
    .update({ status: "failed" })
    .eq("seed", seed)
    .eq("status", "started")
  if (error) console.error("[billing] failReading:", error.message)
}

/**
 * Libera a síntese para um seed concluído do mesmo usuário (ou anônimo),
 * uma única vez. Devolve false se o seed não existe, é de outro usuário,
 * não foi concluído ou já teve síntese.
 */
export async function claimSynthesis(seed: string, userId: string | null): Promise<boolean> {
  if (!hasAdminClient()) return !billingUnavailableIsFatal()
  const admin = createAdminClient()
  let q = admin
    .from("reading_usage")
    .update({ synthesized_at: new Date().toISOString() })
    .eq("seed", seed)
    .eq("status", "completed")
    .is("synthesized_at", null)
  q = userId ? q.eq("user_id", userId) : q.is("user_id", null)
  const { data, error } = await q.select("id")
  if (error) {
    console.error("[billing] claimSynthesis:", error.message)
    return false
  }
  return Array.isArray(data) && data.length === 1
}
