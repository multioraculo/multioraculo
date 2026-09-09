"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { fmt } from "@/lib/i18n"
import MoonToday from "@/components/moon-today"
import type { Plan } from "@/lib/billing/plans"

/**
 * Painel do avatar: pequeno resumo pessoal da conta.
 *   nome / e-mail
 *   PLANO  — plano efetivo real (mesma fonte de verdade do billing:
 *            /api/billing/status → entitlement, com admin/override acima de
 *            Stripe acima de Free), leituras disponíveis e a ação certa
 *   HOJE   — fase da Lua real do dia com significado simbólico fixo
 *   CONTA  — administração (se for admin) e sair
 * O conteúdo pessoal (leituras, sonhos, Grimório) vive em "Registros", na
 * navegação principal.
 */

interface UserMenuProps {
  user: { email: string; full_name: string | null }
  onLogout: () => void
}

type Status = {
  plan: Plan
  access: { source: "admin" | "override" | "subscription" | "free" }
  usage: { reading: { limit: number | null; used: number; remaining: number | null } }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1.5">{children}</p>
}

function Divider() {
  return <div className="border-t border-white/10 my-3" />
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  // null = ainda não perguntou ao servidor; consulta uma vez, ao abrir o menu
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [status, setStatus] = useState<Status | null | "error">(null)
  const router = useRouter()
  const { dict } = useI18n()
  const t = dict.account
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClose = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClose)
    document.addEventListener("touchstart", handleClose)
    return () => {
      document.removeEventListener("mousedown", handleClose)
      document.removeEventListener("touchstart", handleClose)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || isAdmin !== null) return
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((j) => setIsAdmin(Boolean(j?.admin)))
      .catch(() => setIsAdmin(false))
  }, [isOpen, isAdmin])

  // plano: busca a cada abertura (a cota muda ao longo do uso), sem cache
  useEffect(() => {
    if (!isOpen) return
    let alive = true
    fetch("/api/billing/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => alive && setStatus(j as Status))
      .catch(() => alive && setStatus("error"))
    return () => {
      alive = false
    }
  }, [isOpen])

  const go = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  const planBlock = () => {
    if (status === null) return <p className="text-white/40 text-xs">{t.loading}</p>
    if (status === "error") return null
    const internal = status.access.source === "admin" || status.access.source === "override"
    const r = status.usage.reading
    const usage =
      r.limit === null
        ? t.unlimitedReadings
        : fmt(r.limit === 1 ? t.readingsAvailableOne : t.readingsAvailable, { remaining: r.remaining ?? 0, limit: r.limit })
    return (
      <>
        <p className="text-white text-sm font-medium tracking-wide">{dict.billing.planNames[status.plan]}</p>
        <p className="text-white/60 text-xs mt-0.5">{usage}</p>
        {internal ? (
          <p className="text-white/40 text-xs mt-1.5">{t.internalAccess}</p>
        ) : (
          <Link href="/assinatura" onClick={() => setIsOpen(false)} className="inline-block text-white/80 hover:text-white text-xs mt-1.5 underline underline-offset-4 decoration-white/30">
            {status.plan === "free" ? t.knowPlans : t.managePlan}
          </Link>
        )}
      </>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 transition-all duration-200 flex items-center justify-center"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium">{user.email.charAt(0).toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 backdrop-blur-xl bg-[rgba(24,12,56,0.82)] border border-white/15 rounded-2xl p-4 shadow-[0_16px_40px_rgba(10,4,30,0.35)]">
          <div>
            {user.full_name && <p className="text-white text-sm font-medium">{user.full_name}</p>}
            <p className="text-white/55 text-xs break-all">{user.email}</p>
          </div>

          <Divider />

          <SectionLabel>{t.plan}</SectionLabel>
          {planBlock()}

          <Divider />

          <SectionLabel>{t.today}</SectionLabel>
          <MoonToday />

          <Divider />

          <SectionLabel>{t.accountSection}</SectionLabel>
          {isAdmin && (
            <button onClick={() => go("/admin")} className="block w-full text-left py-1.5 text-white/80 hover:text-white text-sm transition-colors">
              {dict.nav.admin}
            </button>
          )}
          <button onClick={() => { setIsOpen(false); onLogout() }} className="block w-full text-left py-1.5 text-white/60 hover:text-white text-sm transition-colors">
            {dict.common.logout}
          </button>
        </div>
      )}
    </div>
  )
}
