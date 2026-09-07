/**
 * Integração Stripe (server only). A Stripe é UM provedor de pagamento: o que
 * ela faz aqui é manter `billing_customers` e `subscriptions` atualizadas.
 * A autorização do usuário nunca consulta a Stripe diretamente.
 */

import Stripe from "stripe"
import type { SupabaseClient } from "@supabase/supabase-js"
import { planForStripePrice, type SubscriptionStatus } from "./plans"

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada")
  stripeClient = new Stripe(key, { appInfo: { name: "Multioraculo", url: "https://multioraculo.com" } })
  return stripeClient
}

/** URL pública do site para success/cancel/return URLs. */
export function siteUrl(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, "")
  const proto = req.headers.get("x-forwarded-proto") ?? "https"
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host")
  if (host) return `${proto}://${host}`
  return new URL(req.url).origin
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export async function findStripeCustomerId(admin: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await admin
    .from("billing_customers")
    .select("provider_customer_id")
    .eq("user_id", userId)
    .eq("provider", "stripe")
    .maybeSingle()
  return data?.provider_customer_id ?? null
}

export async function findUserIdByStripeCustomer(admin: SupabaseClient, customerId: string): Promise<string | null> {
  const { data } = await admin
    .from("billing_customers")
    .select("user_id")
    .eq("provider", "stripe")
    .eq("provider_customer_id", customerId)
    .maybeSingle()
  return data?.user_id ?? null
}

export async function linkStripeCustomer(admin: SupabaseClient, userId: string, customerId: string): Promise<void> {
  const { error } = await admin
    .from("billing_customers")
    .upsert({ user_id: userId, provider: "stripe", provider_customer_id: customerId }, { onConflict: "user_id,provider" })
  if (error) throw new Error(`billing_customers upsert: ${error.message}`)
}

/**
 * Reutiliza o cliente Stripe do usuário ou cria um novo, sempre carimbado com
 * o user.id do Supabase em metadata. O e-mail é informativo, não é a chave.
 */
export async function getOrCreateStripeCustomer(
  admin: SupabaseClient,
  user: { id: string; email: string | null | undefined }
): Promise<string> {
  const existing = await findStripeCustomerId(admin, user.id)
  if (existing) return existing

  const stripe = getStripe()
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: { supabase_user_id: user.id },
  })
  await linkStripeCustomer(admin, user.id, customer.id)
  return customer.id
}

// ---------------------------------------------------------------------------
// Assinaturas
// ---------------------------------------------------------------------------

const STATUS_SET = new Set<SubscriptionStatus>([
  "trialing", "active", "past_due", "canceled", "unpaid", "incomplete", "incomplete_expired", "paused",
])

function toIso(epochSeconds: number | null | undefined): string | null {
  return typeof epochSeconds === "number" ? new Date(epochSeconds * 1000).toISOString() : null
}

/** Período atual: nas versões recentes da API fica no item; nas antigas, na assinatura. */
function periodOf(sub: Stripe.Subscription): { start: number | null; end: number | null } {
  const item: any = sub.items?.data?.[0]
  const anySub: any = sub
  return {
    start: item?.current_period_start ?? anySub.current_period_start ?? null,
    end: item?.current_period_end ?? anySub.current_period_end ?? null,
  }
}

export function subscriptionToRow(sub: Stripe.Subscription, userId: string) {
  const priceId = sub.items?.data?.[0]?.price?.id ?? null
  const plan = planForStripePrice(priceId) ?? "free"
  const status = (STATUS_SET.has(sub.status as SubscriptionStatus) ? sub.status : "incomplete") as SubscriptionStatus
  const period = periodOf(sub)
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null
  return {
    user_id: userId,
    plan,
    status,
    billing_provider: "stripe" as const,
    provider_customer_id: customerId,
    provider_subscription_id: sub.id,
    provider_price_id: priceId,
    current_period_start: toIso(period.start),
    current_period_end: toIso(period.end),
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    canceled_at: toIso(sub.canceled_at),
    metadata: { livemode: sub.livemode },
  }
}

/** Resolve o usuário Supabase dono de uma assinatura Stripe (metadata primeiro, depois o cliente). */
export async function resolveUserIdForSubscription(admin: SupabaseClient, sub: Stripe.Subscription): Promise<string | null> {
  const fromMeta = sub.metadata?.supabase_user_id
  if (fromMeta) return fromMeta
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id
  if (!customerId) return null
  const fromCustomer = await findUserIdByStripeCustomer(admin, customerId)
  if (fromCustomer) return fromCustomer
  // último recurso: metadata do próprio cliente Stripe
  try {
    const customer = await getStripe().customers.retrieve(customerId)
    if (!("deleted" in customer) && customer.metadata?.supabase_user_id) return customer.metadata.supabase_user_id
  } catch {}
  return null
}

/**
 * Grava o estado da assinatura no Supabase (uma linha por usuário).
 * Protege contra eventos fora de ordem: uma assinatura antiga encerrada não
 * sobrescreve uma nova que ainda dá direito ao plano.
 */
export async function syncStripeSubscription(
  admin: SupabaseClient,
  sub: Stripe.Subscription,
  userIdHint?: string | null
): Promise<{ userId: string | null; skipped: boolean }> {
  const userId = userIdHint ?? (await resolveUserIdForSubscription(admin, sub))
  if (!userId) {
    console.error(`[stripe] assinatura ${sub.id} sem usuário Supabase associado`)
    return { userId: null, skipped: true }
  }

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id
  if (customerId) await linkStripeCustomer(admin, userId, customerId)

  const row = subscriptionToRow(sub, userId)

  const { data: current } = await admin
    .from("subscriptions")
    .select("provider_subscription_id, status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle()

  if (current && current.provider_subscription_id !== sub.id) {
    const currentEntitled = ["active", "trialing", "past_due"].includes(current.status)
    const incomingEntitled = ["active", "trialing", "past_due"].includes(row.status)
    if (currentEntitled && !incomingEntitled) {
      // evento tardio de uma assinatura anterior: ignora
      return { userId, skipped: true }
    }
  }

  const { error } = await admin.from("subscriptions").upsert(row, { onConflict: "user_id" })
  if (error) throw new Error(`subscriptions upsert: ${error.message}`)
  return { userId, skipped: false }
}

/** Idioma do Checkout / Portal a partir do locale do site. */
export function stripeLocale(locale: string): Stripe.Checkout.SessionCreateParams.Locale {
  if (locale === "pt") return "pt-BR"
  if (locale === "es") return "es"
  return "en"
}
