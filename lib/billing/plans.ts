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

/**
 * Limite mensal de tiragens completas por plano. `null` = ilimitado.
 *
 * FREE: o projeto nunca teve limite (a consulta era aberta, inclusive sem
 * login). Esse comportamento é preservado por padrão. Para ativar um limite
 * gratuito, defina FREE_MONTHLY_READINGS (ex.: "1"); a partir daí visitantes
 * sem login precisam entrar para consultar, porque só assim há como contar.
 */
export function monthlyLimitFor(plan: Plan): number | null {
  switch (plan) {
    case "essential":
      return 8
    case "unlimited":
      return null
    case "free":
    default:
      return freeMonthlyLimit()
  }
}

export function freeMonthlyLimit(): number | null {
  const raw = process.env.FREE_MONTHLY_READINGS
  if (!raw || !raw.trim()) return null
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : null
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
