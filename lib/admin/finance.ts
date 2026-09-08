/**
 * Receita real, lida da Stripe no servidor (nunca no navegador).
 *
 * - MRR: assinaturas vigentes na tabela `subscriptions` (só provedor stripe)
 *   × preço do price correspondente. Admin, testers e overrides não estão
 *   nessa tabela, então nunca entram.
 * - Receita recebida: faturas PAGAS (invoice.amount_paid), por mês e plano.
 * - Líquido e taxas: transações de saldo da Stripe (charge/payment), que já
 *   trazem a taxa descontada. Reembolsos aparecem separados.
 * - Pagamentos falhos: faturas abertas com tentativa de cobrança.
 *
 * Cache curto em memória por instância, para o dashboard não bater na
 * Stripe a cada abertura de aba.
 */

import type Stripe from "stripe"
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { getStripe } from "@/lib/billing/stripe"
import { stripeConfigured, stripePriceFor, type Plan } from "@/lib/billing/plans"

export type PaidPlan = Exclude<Plan, "free">

export type FinanceMonthly = {
  month: string // YYYY-MM (fuso America/Sao_Paulo)
  invoices: number
  grossCents: number
  essentialCents: number
  unlimitedCents: number
  netCents: number
  feeCents: number
  refundCents: number
}

export type FinanceReport = {
  configured: boolean
  currency: string
  fetchedAt: string
  error: string | null
  prices: Record<PaidPlan, { unitAmountCents: number; interval: string } | null>
  activeByPlan: Record<PaidPlan, number>
  mrrCents: number
  monthly: FinanceMonthly[]
  receivedMonthCents: number
  receivedTotalCents: number
  netMonthCents: number
  netTotalCents: number
  feeTotalCents: number
  refundTotalCents: number
  failedPayments: number
  /** true quando a listagem da Stripe foi cortada no teto de segurança */
  truncated: boolean
}

const TZ = "America/Sao_Paulo"
const CACHE_MS = 5 * 60 * 1000
const MAX_ITEMS = 5000

let cache: { at: number; report: FinanceReport } | null = null

export function monthKey(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000)
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" }).formatToParts(d)
  const y = parts.find((p) => p.type === "year")?.value
  const m = parts.find((p) => p.type === "month")?.value
  return `${y}-${m}`
}

export function currentMonthKey(): string {
  return monthKey(Math.floor(Date.now() / 1000))
}

function emptyReport(configured: boolean, error: string | null): FinanceReport {
  return {
    configured,
    currency: "brl",
    fetchedAt: new Date().toISOString(),
    error,
    prices: { essential: null, unlimited: null },
    activeByPlan: { essential: 0, unlimited: 0 },
    mrrCents: 0,
    monthly: [],
    receivedMonthCents: 0,
    receivedTotalCents: 0,
    netMonthCents: 0,
    netTotalCents: 0,
    feeTotalCents: 0,
    refundTotalCents: 0,
    failedPayments: 0,
    truncated: false,
  }
}

function planOfInvoice(inv: Stripe.Invoice, priceIds: Record<PaidPlan, string | null>): PaidPlan | null {
  for (const line of inv.lines?.data ?? []) {
    const anyLine: any = line
    const priceId: string | undefined = anyLine.price?.id ?? anyLine.pricing?.price_details?.price
    if (priceId && priceId === priceIds.essential) return "essential"
    if (priceId && priceId === priceIds.unlimited) return "unlimited"
  }
  return null
}

export async function getFinanceReport(force = false): Promise<FinanceReport> {
  if (!force && cache && Date.now() - cache.at < CACHE_MS) return cache.report
  if (!stripeConfigured() || !hasAdminClient()) return emptyReport(false, null)

  const report = emptyReport(true, null)
  try {
    const stripe = getStripe()
    const priceIds: Record<PaidPlan, string | null> = { essential: stripePriceFor("essential"), unlimited: stripePriceFor("unlimited") }

    // Preços vigentes (para o MRR)
    for (const plan of ["essential", "unlimited"] as PaidPlan[]) {
      const id = priceIds[plan]
      if (!id) continue
      const price = await stripe.prices.retrieve(id)
      report.prices[plan] = { unitAmountCents: price.unit_amount ?? 0, interval: price.recurring?.interval ?? "month" }
      if (price.currency) report.currency = price.currency
    }

    // Assinaturas vigentes (fonte: Supabase, só Stripe)
    const { data: subs } = await createAdminClient()
      .from("subscriptions")
      .select("plan, status")
      .eq("billing_provider", "stripe")
      .in("status", ["active", "trialing", "past_due"])
    for (const s of subs ?? []) {
      const plan = String(s.plan)
      if (plan === "essential" || plan === "unlimited") report.activeByPlan[plan] += 1
    }
    for (const plan of ["essential", "unlimited"] as PaidPlan[]) {
      const p = report.prices[plan]
      if (!p) continue
      const monthly = p.interval === "year" ? Math.round(p.unitAmountCents / 12) : p.unitAmountCents
      report.mrrCents += report.activeByPlan[plan] * monthly
    }

    const months = new Map<string, FinanceMonthly>()
    const bucket = (key: string) => {
      let m = months.get(key)
      if (!m) {
        m = { month: key, invoices: 0, grossCents: 0, essentialCents: 0, unlimitedCents: 0, netCents: 0, feeCents: 0, refundCents: 0 }
        months.set(key, m)
      }
      return m
    }

    // Faturas pagas: receita bruta por mês e por plano
    let seen = 0
    for await (const inv of stripe.invoices.list({ status: "paid", limit: 100 })) {
      if (++seen > MAX_ITEMS) { report.truncated = true; break }
      if (!inv.amount_paid) continue
      const paidAt = inv.status_transitions?.paid_at ?? inv.created
      const m = bucket(monthKey(paidAt))
      m.invoices += 1
      m.grossCents += inv.amount_paid
      const plan = planOfInvoice(inv, priceIds)
      if (plan === "essential") m.essentialCents += inv.amount_paid
      if (plan === "unlimited") m.unlimitedCents += inv.amount_paid
    }

    // Transações de saldo: líquido, taxas e reembolsos
    seen = 0
    for await (const tx of stripe.balanceTransactions.list({ limit: 100 })) {
      if (++seen > MAX_ITEMS) { report.truncated = true; break }
      const m = bucket(monthKey(tx.created))
      if (tx.type === "charge" || tx.type === "payment") {
        m.netCents += tx.net
        m.feeCents += tx.fee
      } else if (tx.type === "refund" || tx.type === "payment_refund") {
        m.refundCents += Math.abs(tx.amount)
        m.netCents += tx.net
      }
    }

    // Faturas abertas com tentativa de cobrança = pagamento falhou e a Stripe insiste
    seen = 0
    for await (const inv of stripe.invoices.list({ status: "open", limit: 100 })) {
      if (++seen > 500) break
      if ((inv.attempt_count ?? 0) > 0) report.failedPayments += 1
    }

    report.monthly = [...months.values()].sort((a, b) => a.month.localeCompare(b.month))
    const cur = currentMonthKey()
    for (const m of report.monthly) {
      report.receivedTotalCents += m.grossCents
      report.netTotalCents += m.netCents
      report.feeTotalCents += m.feeCents
      report.refundTotalCents += m.refundCents
      if (m.month === cur) {
        report.receivedMonthCents += m.grossCents
        report.netMonthCents += m.netCents
      }
    }
  } catch (err: any) {
    report.error = String(err?.message || err)
    console.error("[admin/finance]", report.error)
  }

  cache = { at: Date.now(), report }
  return report
}
