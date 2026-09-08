"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

/**
 * Cadastro e revogação de acessos especiais. O navegador só pede ao servidor;
 * a validação e a autorização acontecem em /api/admin/overrides.
 */

const input =
  "w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/35"

export function OverrideForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [plan, setPlan] = useState<"unlimited" | "essential">("unlimited")
  const [reason, setReason] = useState("beta_tester")
  const [expiresAt, setExpiresAt] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch("/api/admin/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan, reason, expiresAt: expiresAt || undefined }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json?.error || "Não foi possível criar o acesso.")
        return
      }
      toast.success("Acesso criado.")
      setEmail("")
      setExpiresAt("")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-[1.6fr_1fr_1fr_1fr_auto] gap-2 items-end">
      <label className="block">
        <span className="block text-white/50 text-[11px] uppercase tracking-widest mb-1">E-mail</span>
        <input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pessoa@exemplo.com" />
      </label>
      <label className="block">
        <span className="block text-white/50 text-[11px] uppercase tracking-widest mb-1">Plano</span>
        <select className={input} value={plan} onChange={(e) => setPlan(e.target.value as "unlimited" | "essential")}>
          <option value="unlimited" className="text-black">Ilimitado</option>
          <option value="essential" className="text-black">Essencial</option>
        </select>
      </label>
      <label className="block">
        <span className="block text-white/50 text-[11px] uppercase tracking-widest mb-1">Motivo</span>
        <input className={input} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={80} placeholder="beta_tester" />
      </label>
      <label className="block">
        <span className="block text-white/50 text-[11px] uppercase tracking-widest mb-1">Expira em (opcional)</span>
        <input className={input} type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="h-[38px] px-5 rounded-full bg-white/15 border border-white/25 text-white text-sm hover:bg-white/20 disabled:opacity-50 whitespace-nowrap"
      >
        {busy ? "Salvando…" : "Conceder acesso"}
      </button>
    </form>
  )
}

export function RevokeButton({ id, email }: { id: string; email: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function revoke() {
    if (!window.confirm(`Revogar o acesso de ${email}?`)) return
    setBusy(true)
    try {
      const res = await fetch("/api/admin/overrides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json?.error || "Não foi possível revogar.")
        return
      }
      toast.success("Acesso revogado.")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button onClick={revoke} disabled={busy} className="text-xs text-amber-200/80 hover:text-amber-100 disabled:opacity-50">
      {busy ? "…" : "Revogar"}
    </button>
  )
}
