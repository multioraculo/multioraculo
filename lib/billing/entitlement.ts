/**
 * Camada central de entitlement.
 *
 * Responde "qual plano este usuário tem e o que pode usar", olhando apenas a
 * tabela `subscriptions` do Supabase. De onde a assinatura veio (Stripe hoje,
 * Google Play / App Store amanhã) é irrelevante aqui: o webhook de cada
 * provedor só precisa manter essa tabela atualizada.
 */

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import {
  ENTITLED_STATUSES,
  PLAN_LIMITS,
  USAGE_KINDS,
  monthlyLimitFor,
  type BillingProvider,
  type Plan,
  type SubscriptionStatus,
  type UsageKind,
} from "./plans"

export type SubscriptionRow = {
  user_id: string
  plan: Plan
  status: SubscriptionStatus
  billing_provider: BillingProvider
  provider_customer_id: string | null
  provider_subscription_id: string
  provider_price_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
}

export type Entitlement = {
  /** plano efetivo (o que o usuário pode usar agora) */
  plan: Plan
  /** limite de tiragens completas no período; null = ilimitado (compatibilidade) */
  monthlyLimit: number | null
  /** limites por tipo de consumo; null = ilimitado, 0 = não incluído */
  limits: Record<UsageKind, number | null>
  /** janela de contagem: ciclo de cobrança para assinantes, mês civil para Free */
  periodStart: string
  periodEnd: string
  /** existe registro de assinatura (mesmo que já não dê direito ao plano) */
  subscription: {
    plan: Plan
    status: SubscriptionStatus
    provider: BillingProvider
    cancelAtPeriodEnd: boolean
    currentPeriodEnd: string | null
    /** cobrança falhou e a Stripe está tentando de novo */
    paymentProblem: boolean
    /** checkout iniciado mas pagamento ainda não confirmado */
    pending: boolean
    /** assinatura encerrada (não dá mais direito ao plano) */
    ended: boolean
  } | null
}

function calendarMonth(now = new Date()): { start: string; end: string } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  return { start: start.toISOString(), end: end.toISOString() }
}

export function freeEntitlement(): Entitlement {
  const { start, end } = calendarMonth()
  return {
    plan: "free",
    monthlyLimit: monthlyLimitFor("free"),
    limits: { ...PLAN_LIMITS.free },
    periodStart: start,
    periodEnd: end,
    subscription: null,
  }
}

export async function getSubscriptionRow(userId: string): Promise<SubscriptionRow | null> {
  if (!hasAdminClient()) return null
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("subscriptions")
    .select(
      "user_id, plan, status, billing_provider, provider_customer_id, provider_subscription_id, provider_price_id, current_period_start, current_period_end, cancel_at_period_end, canceled_at"
    )
    .eq("user_id", userId)
    .maybeSingle()
  if (error) {
    console.error("[entitlement] erro ao ler subscriptions:", error.message)
    return null
  }
  return (data as SubscriptionRow | null) ?? null
}

/** Decide se uma linha de assinatura dá direito ao plano pago neste instante. */
export function isEntitled(row: SubscriptionRow, now = new Date()): boolean {
  if (!ENTITLED_STATUSES.includes(row.status)) return false
  if (row.plan === "free") return false
  // Se o período já venceu há mais de 1 dia sem renovação registrada, não confia.
  if (row.current_period_end) {
    const end = new Date(row.current_period_end).getTime()
    if (Number.isFinite(end) && end + 24 * 60 * 60 * 1000 < now.getTime()) return false
  }
  return true
}

export async function getUserEntitlement(userId: string | null | undefined): Promise<Entitlement> {
  if (!userId) return freeEntitlement()

  const row = await getSubscriptionRow(userId)
  if (!row) return freeEntitlement()

  const entitled = isEntitled(row)
  const month = calendarMonth()
  const info: NonNullable<Entitlement["subscription"]> = {
    plan: row.plan,
    status: row.status,
    provider: row.billing_provider,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    currentPeriodEnd: row.current_period_end,
    paymentProblem: row.status === "past_due" || row.status === "unpaid",
    pending: row.status === "incomplete",
    ended: !entitled,
  }

  if (!entitled) {
    return { ...freeEntitlement(), subscription: info }
  }

  const periodStart = row.current_period_start ?? month.start
  const periodEnd = row.current_period_end ?? month.end
  return {
    plan: row.plan,
    monthlyLimit: monthlyLimitFor(row.plan),
    limits: { ...PLAN_LIMITS[row.plan] },
    periodStart,
    periodEnd,
    subscription: info,
  }
}

/** Janela em que um consumo 'started' ainda pode estar em andamento (espelha consume_reading). */
export const STARTED_WINDOW_MS = 10 * 60 * 1000

/**
 * Consumos de um tipo que contam no período: concluídos, mais os iniciados
 * há poucos minutos (em andamento). 'started' antigas são falhas técnicas.
 */
export async function getUsage(
  userId: string,
  periodStart: string,
  periodEnd: string,
  kind: UsageKind = "reading"
): Promise<number> {
  if (!hasAdminClient()) return 0
  const admin = createAdminClient()
  const windowStart = new Date(Date.now() - STARTED_WINDOW_MS).toISOString()
  const { count, error } = await admin
    .from("reading_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kind", kind)
    .gte("created_at", periodStart)
    .lt("created_at", periodEnd)
    .or(`status.eq.completed,and(status.eq.started,created_at.gte.${windowStart})`)
  if (error) {
    console.error("[entitlement] erro ao contar uso:", error.message)
    return 0
  }
  return count ?? 0
}

export type KindUsage = { limit: number | null; used: number; remaining: number | null }
export type EntitlementWithUsage = Entitlement & {
  /** compatibilidade: tiragens */
  used: number
  remaining: number | null
  usage: Record<UsageKind, KindUsage>
}

export async function getUserEntitlementWithUsage(userId: string | null | undefined): Promise<EntitlementWithUsage> {
  const ent = await getUserEntitlement(userId)
  const usage = {} as Record<UsageKind, KindUsage>
  for (const kind of USAGE_KINDS) {
    const limit = ent.limits[kind]
    const used = userId && limit !== 0 ? await getUsage(userId, ent.periodStart, ent.periodEnd, kind) : 0
    usage[kind] = { limit, used, remaining: limit === null ? null : Math.max(limit - used, 0) }
  }
  return { ...ent, used: usage.reading.used, remaining: usage.reading.remaining, usage }
}
