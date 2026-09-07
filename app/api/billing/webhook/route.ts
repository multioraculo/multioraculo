import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { getStripe, linkStripeCustomer, syncStripeSubscription } from "@/lib/billing/stripe"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Webhook da Stripe: FONTE DA VERDADE do status de assinatura no Supabase.
 *
 * - Assinatura verificada com STRIPE_WEBHOOK_SECRET (corpo bruto).
 * - Idempotente: cada event.id é registrado em `webhook_events`; repetições já
 *   processadas respondem 200 sem efeito. Falhas devolvem 500 para a Stripe
 *   reenviar.
 * - Rápido: só escrita no banco e, no máximo, uma leitura na Stripe.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !hasAdminClient()) {
    return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 })
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 })
  }

  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret)
  } catch (err: any) {
    console.warn("[stripe/webhook] assinatura inválida:", err?.message)
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 })
  }

  const admin = createAdminClient()

  // Idempotência
  const { data: seen } = await admin
    .from("webhook_events")
    .select("id, processed_at")
    .eq("provider", "stripe")
    .eq("event_id", event.id)
    .maybeSingle()
  if (seen?.processed_at) {
    return NextResponse.json({ received: true, duplicate: true })
  }
  if (!seen) {
    const { error } = await admin
      .from("webhook_events")
      .insert({ provider: "stripe", event_id: event.id, event_type: event.type })
    // corrida entre dois envios do mesmo evento: o segundo perde e sai
    if (error && error.code === "23505") return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    await handleEvent(admin, event)
    await admin
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString(), error: null })
      .eq("provider", "stripe")
      .eq("event_id", event.id)
    return NextResponse.json({ received: true })
  } catch (err: any) {
    const message = String(err?.message || err)
    console.error(`[stripe/webhook] ${event.type} ${event.id}:`, message)
    await admin
      .from("webhook_events")
      .update({ error: message.slice(0, 500) })
      .eq("provider", "stripe")
      .eq("event_id", event.id)
    return NextResponse.json({ error: "Falha ao processar evento." }, { status: 500 })
  }
}

type Admin = ReturnType<typeof createAdminClient>

async function handleEvent(admin: Admin, event: Stripe.Event) {
  const stripe = getStripe()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== "subscription" || !session.subscription) return
      const userId = session.client_reference_id || session.metadata?.supabase_user_id || null
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id
      if (userId && customerId) await linkStripeCustomer(admin, userId, customerId)
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id
      const sub = await stripe.subscriptions.retrieve(subId)
      await syncStripeSubscription(admin, sub, userId)
      return
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed": {
      const sub = event.data.object as Stripe.Subscription
      await syncStripeSubscription(admin, sub)
      return
    }

    case "invoice.paid":
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
    case "invoice.payment_action_required": {
      const invoice: any = event.data.object
      // API atual: invoice.parent.subscription_details.subscription; antiga: invoice.subscription
      const subRef = invoice.parent?.subscription_details?.subscription ?? invoice.subscription ?? null
      const subId = typeof subRef === "string" ? subRef : subRef?.id
      if (!subId) return
      const sub = await stripe.subscriptions.retrieve(subId)
      await syncStripeSubscription(admin, sub)
      return
    }

    default:
      // Eventos não tratados são aceitos (200) e ignorados.
      return
  }
}
