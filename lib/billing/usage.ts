/**
 * Consumo de cota (server only) — tiragens, sonhos e jornada.
 *
 * Unidade de consumo = uma operação completa que chama o modelo, registrada
 * UMA vez em `reading_usage` (seed + kind). A síntese da tiragem não conta;
 * ela só é liberada para um seed já concluído do mesmo dono, uma vez.
 *
 * Dois caminhos:
 * - Usuário logado: função SQL atômica `consume_reading` (cota do plano por
 *   tipo, trava por usuário). Antes dela, consumos feitos sem login com o
 *   mesmo cookie de visitante são atribuídos à conta, para contarem na cota.
 * - Visitante sem login: uma gratuita de cada tipo experimentável (tiragem,
 *   sonho) por cookie, garantida por índice único no banco. Depois, pede login.
 *
 * Em todos os casos, falha técnica ('failed' ou 'started' abandonada) nunca
 * consome cota.
 */

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { getUserEntitlement, STARTED_WINDOW_MS, type Entitlement } from "./entitlement"
import { TRIAL_KINDS, type UsageKind } from "./plans"

export type ConsumeCode = "limit_reached" | "plan_required" | "trial_used" | "billing_unavailable"

export type ConsumeResult =
  | { allowed: true; used: number; limit: number | null; remaining: number | null; entitlement: Entitlement; tracked: boolean }
  | { allowed: false; code: ConsumeCode; used: number; limit: number | null; entitlement: Entitlement }

/** HTTP status por código, para as rotas responderem de forma uniforme. */
export function httpStatusFor(code: ConsumeCode): number {
  switch (code) {
    case "trial_used":
      return 401
    case "billing_unavailable":
      return 503
    default:
      return 402
  }
}

/**
 * Sem service role não há como contar nem registrar. Em desenvolvimento o
 * sistema segue aberto (comportamento original); em produção falha fechado
 * para o limite nunca ser silenciosamente desligado.
 */
function billingUnavailableIsFatal(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Consumos feitos sem login com este cookie passam a pertencer à conta.
 * Chamado ao consumir logado, ao abrir a página de assinatura e no status,
 * para que "já usou a gratuita" apareça logo após o login.
 */
export async function attributeVisitorReadings(userId: string, visitorId: string | null): Promise<void> {
  if (!visitorId || !hasAdminClient()) return
  const { error } = await createAdminClient()
    .from("reading_usage")
    .update({ user_id: userId })
    .eq("visitor_id", visitorId)
    .is("user_id", null)
  // 23505: a conta já tinha uma preview pendente própria; a do cookie fica como visitante
  if (error && error.code !== "23505") console.error("[billing] attributeVisitorReadings:", error.message)
  // conteúdo das previews acompanha a atribuição
  const { attributePreviewResults } = await import("./preview")
  await attributePreviewResults(userId, visitorId)
}

export async function consumeReading(input: {
  userId: string | null
  visitorId: string | null
  seed: string
  locale: string
  kind?: UsageKind
}): Promise<ConsumeResult> {
  const kind: UsageKind = input.kind ?? "reading"
  const entitlement = await getUserEntitlement(input.userId)
  const limit = entitlement.limits[kind]

  if (!hasAdminClient()) {
    if (billingUnavailableIsFatal()) {
      console.error("[billing] SUPABASE_SERVICE_ROLE_KEY ausente em produção: consumo bloqueado")
      return { allowed: false, code: "billing_unavailable", used: 0, limit, entitlement }
    }
    console.warn("[billing] SUPABASE_SERVICE_ROLE_KEY ausente: consumo liberado sem registro (dev)")
    return { allowed: true, used: 0, limit, remaining: null, entitlement, tracked: false }
  }

  const admin = createAdminClient()

  // ------------------------------------------------------------------------
  // Visitante sem login: uma gratuita por tipo experimentável, por cookie.
  // ------------------------------------------------------------------------
  if (!input.userId) {
    if (!TRIAL_KINDS.includes(kind) || !input.visitorId) {
      return { allowed: false, code: "trial_used", used: 0, limit, entitlement }
    }

    // tentativa abandonada (queda/timeout) não bloqueia a gratuita
    const windowStart = new Date(Date.now() - STARTED_WINDOW_MS).toISOString()
    await admin
      .from("reading_usage")
      .update({ status: "failed" })
      .eq("visitor_id", input.visitorId)
      .eq("kind", kind)
      .eq("status", "started")
      .lt("created_at", windowStart)

    const { error } = await admin
      .from("reading_usage")
      .insert({ user_id: null, visitor_id: input.visitorId, seed: input.seed, status: "started", locale: input.locale, kind })

    if (error) {
      // índice único reading_usage_visitor_trial_idx: já existe gratuita deste tipo para o visitante
      if (error.code === "23505") {
        return { allowed: false, code: "trial_used", used: 1, limit, entitlement }
      }
      console.error("[billing] falha ao registrar gratuita de visitante:", error.message)
      return { allowed: false, code: "billing_unavailable", used: 0, limit, entitlement }
    }
    return { allowed: true, used: 1, limit: 1, remaining: 0, entitlement, tracked: true }
  }

  // ------------------------------------------------------------------------
  // Usuário logado: atribui a gratuita feita antes do login e consome no plano.
  // ------------------------------------------------------------------------
  await attributeVisitorReadings(input.userId, input.visitorId)

  // tipo não incluído no plano (ex.: Jornada no Free)
  if (limit === 0) {
    return { allowed: false, code: "plan_required", used: 0, limit, entitlement }
  }

  const { data, error } = await admin.rpc("consume_reading", {
    p_user_id: input.userId,
    p_seed: input.seed,
    p_limit: limit,
    p_period_start: entitlement.periodStart,
    p_period_end: entitlement.periodEnd,
    p_locale: input.locale,
    p_kind: kind,
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

/** Consumo que falhou não conta na cota (nem na gratuita do visitante). */
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
 * Libera a síntese para um seed concluído do mesmo dono (conta ou cookie de
 * visitante), uma única vez. Devolve false se o seed não existe, é de outra
 * pessoa, não foi concluído ou já teve síntese.
 */
export async function claimSynthesis(seed: string, userId: string | null, visitorId: string | null): Promise<boolean> {
  if (!hasAdminClient()) return !billingUnavailableIsFatal()
  const admin = createAdminClient()
  let q = admin
    .from("reading_usage")
    .update({ synthesized_at: new Date().toISOString() })
    .eq("seed", seed)
    .eq("kind", "reading")
    .eq("status", "completed")
    .is("synthesized_at", null)

  // dono: a conta, ou (se a tiragem foi anônima e ainda não atribuída) o cookie
  if (userId && visitorId) q = q.or(`user_id.eq.${userId},and(user_id.is.null,visitor_id.eq.${visitorId})`)
  else if (userId) q = q.eq("user_id", userId)
  else if (visitorId) q = q.is("user_id", null).eq("visitor_id", visitorId)
  else return false

  const { data, error } = await q.select("id")
  if (error) {
    console.error("[billing] claimSynthesis:", error.message)
    return false
  }
  return Array.isArray(data) && data.length === 1
}

/** Lê o cookie de visitante de um jar do Next (cookies()). */
export function visitorIdFrom(value: string | undefined): string | null {
  return typeof value === "string" && /^[0-9a-f-]{20,64}$/i.test(value) ? value : null
}
