/**
 * Definição central dos planos. Todo o resto do sistema (entitlement, rotas,
 * página de assinatura) lê daqui. Nenhum ID da Stripe é fixado no código: os
 * prices vêm de variáveis de ambiente.
 */

export type Plan = "free" | "essential" | "unlimited"
export const PLANS: Plan[] = ["free", "essential", "unlimited"]
export const PAID_PLANS: Plan[] = ["essential", "unlimited"]

export type BillingProvider = "stripe" | "google_play" | "apple"

/** Espelha os status da Stripe; outros provedores são mapeados para estes. */
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused"

/** Status que ainda dão direito ao plano pago (past_due: em tentativa de cobrança). */
export const ENTITLED_STATUSES: SubscriptionStatus[] = ["active", "trialing", "past_due"]

export function isPlan(v: unknown): v is Plan {
  return typeof v === "string" && (PLANS as string[]).includes(v)
}

export function isPaidPlan(v: unknown): v is Exclude<Plan, "free"> {
  return typeof v === "string" && (PAID_PLANS as string[]).includes(v)
}

// ---------------------------------------------------------------------------
// Tipos de consumo e cotas
// ---------------------------------------------------------------------------

/**
 * O que consome cota (cada um chama o modelo):
 * - reading: tiragem completa (cinco oráculos + síntese), contada uma vez
 * - dream:   interpretação de um sonho
 * - journey: análise evolutiva dos sonhos salvos (Jornada onírica)
 * Sonhos salvos, Grimório e leituras salvas são só armazenamento: exigem
 * login, não consomem cota.
 */
export type UsageKind = "reading" | "dream" | "journey"
export const USAGE_KINDS: UsageKind[] = ["reading", "dream", "journey"]

export function isUsageKind(v: unknown): v is UsageKind {
  return typeof v === "string" && (USAGE_KINDS as string[]).includes(v)
}

/** Limite mensal por plano e tipo. `null` = ilimitado; `0` = não incluído no plano. */
export const PLAN_LIMITS: Record<Plan, Record<UsageKind, number | null>> = {
  // Free: 1 tiragem e 1 sonho por mês civil (a primeira de cada, sem login,
  // vale por cookie de visitante). Jornada só nos planos pagos.
  free: { reading: 1, dream: 1, journey: 0 },
  essential: { reading: 8, dream: 3, journey: 1 },
  unlimited: { reading: null, dream: null, journey: null },
}

/** Tipos que o visitante sem login pode experimentar uma vez. */
export const TRIAL_KINDS: UsageKind[] = ["reading", "dream"]

export function monthlyLimitFor(plan: Plan, kind: UsageKind = "reading"): number | null {
  const limits = PLAN_LIMITS[plan]
  // atenção: null significa "sem limite" e precisa sobreviver (nada de `?? 0`)
  if (!limits || !(kind in limits)) return 0
  return limits[kind]
}

// ---------------------------------------------------------------------------
// Stripe: mapeamento plano ↔ price via ambiente (server only)
// ---------------------------------------------------------------------------

const STRIPE_PRICE_ENV: Record<Exclude<Plan, "free">, string> = {
  essential: "STRIPE_PRICE_ESSENCIAL",
  unlimited: "STRIPE_PRICE_ILIMITADO",
}

export function stripePriceFor(plan: Exclude<Plan, "free">): string | null {
  return process.env[STRIPE_PRICE_ENV[plan]]?.trim() || null
}

export function planForStripePrice(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null
  for (const plan of PAID_PLANS as Array<Exclude<Plan, "free">>) {
    if (stripePriceFor(plan) === priceId) return plan
  }
  return null
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && stripePriceFor("essential") && stripePriceFor("unlimited"))
}
