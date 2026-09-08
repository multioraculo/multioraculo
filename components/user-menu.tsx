"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"

interface UserMenuProps {
  user: { email: string; full_name: string | null }
  onLogout: () => void
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left py-2 px-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
    >
      {label}
    </button>
  )
}

function Divider() {
  return <div className="border-t border-white/10 !my-2" />
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  // null = ainda não perguntou ao servidor; consulta uma vez, ao abrir o menu
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const router = useRouter()
  const { dict } = useI18n()
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

  const go = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 transition-all duration-200 flex items-center justify-center"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium">{user.email.charAt(0).toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-64 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 space-y-0.5">

            {/* User info */}
            <div className="border-b border-white/10 pb-3 mb-2">
              {user.full_name && (
                <p className="text-white text-sm font-medium">{user.full_name}</p>
              )}
              <p className="text-white/60 text-xs">{user.email}</p>
            </div>

            {/* Grupo 1 — Consultas */}
            <MenuItem label={dict.nav.home}          onClick={() => go("/")} />
            <MenuItem label={dict.nav.savedReadings} onClick={() => go("/leituras-salvas")} />
            <MenuItem label={dict.nav.oracles}       onClick={() => go("/oraculos")} />
            <MenuItem label={dict.nav.faq}           onClick={() => go("/faq")} />

            <Divider />

            {/* Grupo 2 — Sonhos */}
            <MenuItem label={dict.nav.dreams}      onClick={() => go("/sonhos")} />
            <MenuItem label={dict.nav.savedDreams} onClick={() => go("/sonhos-salvos")} />

            <Divider />

            {/* Grupo 3 — Grimório */}
            <MenuItem label={dict.nav.grimoire} onClick={() => go("/diario")} />

            <Divider />

            {isAdmin && (
              <>
                <MenuItem label={dict.nav.admin} onClick={() => go("/admin")} />
                <Divider />
              </>
            )}

            {/* Sair — "Assinatura" agora vive no menu global do cabeçalho */}
            <button
              onClick={() => { setIsOpen(false); onLogout() }}
              className="w-full text-left py-2 px-3 text-white/60 hover:text-white/80 hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
            >
              {dict.common.logout}
            </button>
        </div>
      )}
    </div>
  )
}
