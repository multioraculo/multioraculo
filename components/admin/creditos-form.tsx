"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

/**
 * Registro das recargas feitas na OpenAI. O navegador só pede ao servidor; a
 * validação e a autorização acontecem em /api/admin/openai-creditos.
 */

const input =
  "w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/35"

export function CreditoForm() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [occurredOn, setOccurredOn] = useState("")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch("/api/admin/openai-creditos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // vírgula decimal é o que se digita em português
          amountUsd: Number(amount.replace(",", ".")),
          occurredOn: occurredOn || undefined,
          note: note || undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json?.error || "Não foi possível registrar.")
        return
      }
      toast.success("Recarga registrada.")
      setAmount("")
      setOccurredOn("")
      setNote("")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr_auto] gap-2 items-end">
      <label className="block">
        <span className="block text-white/50 text-[11px] uppercase tracking-widest mb-1">Valor (US$)</span>
        <input
          className={input}
          required
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="20,00"
        />
      </label>
      <label className="block">
        <span className="block text-white/50 text-[11px] uppercase tracking-widest mb-1">Data da recarga</span>
        <input className={input} type="date" value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)} />
      </label>
      <label className="block">
        <span className="block text-white/50 text-[11px] uppercase tracking-widest mb-1">Nota (opcional)</span>
        <input
          className={input}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="cartão final 1234, recibo da OpenAI"
          maxLength={200}
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="h-[38px] px-5 rounded-xl bg-white/15 border border-white/25 text-white text-sm hover:bg-white/20 disabled:opacity-50 cursor-pointer"
      >
        {busy ? "…" : "Registrar"}
      </button>
    </form>
  )
}

export function ApagarCreditoButton({ id, valor }: { id: string; valor: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function apagar() {
    if (!window.confirm(`Apagar a recarga de ${valor}?`)) return
    setBusy(true)
    try {
      const res = await fetch("/api/admin/openai-creditos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json?.error || "Não foi possível apagar.")
        return
      }
      toast.success("Recarga apagada.")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button onClick={apagar} disabled={busy} className="text-xs text-amber-200/80 hover:text-amber-100 disabled:opacity-50 cursor-pointer">
      {busy ? "…" : "Apagar"}
    </button>
  )
}
