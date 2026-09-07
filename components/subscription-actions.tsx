"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useI18n } from "@/components/i18n-provider"

export type SubscriptionActionMode =
  /** iniciar Stripe Checkout para o plano */
  | "subscribe"
  /** abrir o Stripe Customer Portal (ver, trocar cartão, cancelar, trocar plano) */
  | "manage"
  /** usuário deslogado: abre o modal de login */
  | "login"
  /** assinatura comprada em outra loja: sem ação aqui */
  | "store"

type Props = {
  plan: "essential" | "unlimited"
  mode: SubscriptionActionMode
  label: string
  /** variante visual do card em destaque */
  highlighted?: boolean
}

/**
 * Botão de ação de um plano. O frontend só pede ao servidor para abrir o
 * Checkout ou o Portal; nunca atribui plano. O estado real vem do webhook.
 */
export default function SubscriptionActions({ plan, mode, label, highlighted }: Props) {
  const { dict, locale } = useI18n()
  const [busy, setBusy] = useState(false)

  const base =
    "w-full py-3 px-6 backdrop-blur-md border text-white rounded-full font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  const variant = highlighted
    ? "bg-white/15 border-white/30 hover:bg-white/20 hover:scale-105"
    : "bg-white/10 border-white/20 hover:bg-white/15 hover:scale-105"

  const errorMessage = (code: string | undefined) => {
    const e = dict.billing.errors
    switch (code) {
      case "already_subscribed":
        return e.alreadySubscribed
      case "not_configured":
        return e.notConfigured
      case "no_customer":
        return e.noCustomer
      case "unauthenticated":
        return e.unauthenticated
      default:
        return e.generic
    }
  }

  const go = async (endpoint: string, body: Record<string, unknown>) => {
    setBusy(true)
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, locale }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.url) {
        if (json?.code === "unauthenticated") window.dispatchEvent(new CustomEvent("open-login"))
        toast.error(errorMessage(json?.code))
        setBusy(false)
        return
      }
      window.location.assign(json.url)
    } catch {
      toast.error(dict.billing.errors.generic)
      setBusy(false)
    }
  }

  const onClick = () => {
    if (mode === "login") {
      window.dispatchEvent(new CustomEvent("open-login"))
      return
    }
    if (mode === "subscribe") return go("/api/billing/checkout", { plan })
    if (mode === "manage") return go("/api/billing/portal", {})
  }

  return (
    <button
      onClick={onClick}
      disabled={busy || mode === "store"}
      className={`${base} ${variant}`}
    >
      {busy ? dict.billing.redirecting : label}
    </button>
  )
}
