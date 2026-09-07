import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { getSubscriptionRow, isEntitled } from "@/lib/billing/entitlement"
import { isPaidPlan, stripeConfigured, stripePriceFor } from "@/lib/billing/plans"
import { getOrCreateStripeCustomer, getStripe, siteUrl, stripeLocale } from "@/lib/billing/stripe"
import { resolveLocale } from "@/lib/i18n/config"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Inicia um Stripe Checkout (modo assinatura) para o usuário autenticado.
 * Body: { plan: "essential" | "unlimited", locale?: string }
 * Resposta: { url } para redirecionar, ou { error, code }.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const plan = body?.plan
  const locale = resolveLocale(body?.locale)

  if (!isPaidPlan(plan)) {
    return NextResponse.json({ error: "Plano inválido.", code: "invalid_plan" }, { status: 400 })
  }
  if (!stripeConfigured() || !hasAdminClient()) {
    return NextResponse.json({ error: "Pagamentos não configurados.", code: "not_configured" }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado.", code: "unauthenticated" }, { status: 401 })
  }

  // Evita assinatura duplicada: quem já tem plano pago vigente vai ao Portal.
  const existing = await getSubscriptionRow(user.id)
  if (existing && isEntitled(existing)) {
    return NextResponse.json({ error: "Assinatura já ativa.", code: "already_subscribed" }, { status: 409 })
  }

  try {
    const admin = createAdminClient()
    const stripe = getStripe()
    const customerId = await getOrCreateStripeCustomer(admin, { id: user.id, email: user.email })
    const base = siteUrl(req)

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      // Vínculo confiável com o usuário: id do Supabase, não o e-mail.
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, plan },
      subscription_data: { metadata: { supabase_user_id: user.id, plan } },
      line_items: [{ price: stripePriceFor(plan)!, quantity: 1 }],
      locale: stripeLocale(locale),
      allow_promotion_codes: true,
      success_url: `${base}/assinatura?checkout=success`,
      cancel_url: `${base}/assinatura?checkout=cancel`,
    })

    if (!session.url) throw new Error("Checkout sem URL")
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("[billing/checkout]", err?.message || err)
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento.", code: "checkout_failed" }, { status: 500 })
  }
}
