import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { findStripeCustomerId, getStripe, siteUrl, stripeLocale } from "@/lib/billing/stripe"
import { resolveLocale } from "@/lib/i18n/config"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Abre o Stripe Customer Portal (ver assinatura, trocar cartão, cancelar).
 * Body: { locale?: string }. Resposta: { url } ou { error, code }.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const locale = resolveLocale(body?.locale)

  if (!process.env.STRIPE_SECRET_KEY || !hasAdminClient()) {
    return NextResponse.json({ error: "Pagamentos não configurados.", code: "not_configured" }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado.", code: "unauthenticated" }, { status: 401 })
  }

  const customerId = await findStripeCustomerId(createAdminClient(), user.id)
  if (!customerId) {
    return NextResponse.json({ error: "Nenhuma assinatura Stripe para esta conta.", code: "no_customer" }, { status: 404 })
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl(req)}/assinatura`,
      locale: stripeLocale(locale) as any,
    })
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("[billing/portal]", err?.message || err)
    return NextResponse.json({ error: "Não foi possível abrir o portal.", code: "portal_failed" }, { status: 500 })
  }
}
