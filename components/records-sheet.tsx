"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useI18n } from "@/components/i18n-provider"
import type { Dictionary } from "@/lib/i18n"

/**
 * "Registros": área pessoal da navegação principal. Reúne o que a pessoa
 * guardou no produto (leituras salvas, sonhos salvos, Grimório), tudo em
 * rotas que já existem. Sem novos tipos de registro.
 *
 * É pessoal: sem login o painel explica e oferece entrar (abre o modal de
 * login do cabeçalho pelo evento "open-login"). As rotas mantêm as próprias
 * regras; nada de autenticação muda aqui.
 */
export function recordLinks(dict: Dictionary) {
  const t = dict.records
  return [
    { href: "/leituras-salvas", label: dict.nav.savedReadings, hint: t.savedReadingsHint },
    { href: "/sonhos-salvos", label: dict.nav.savedDreams, hint: t.savedDreamsHint },
    { href: "/diario", label: dict.nav.grimoire, hint: t.grimoireHint },
  ]
}

export const RECORD_PATHS = ["/leituras-salvas", "/sonhos-salvos"]

/** Estado de login só quando o painel abre; null = ainda não sabe. */
export function useLoggedIn(active: boolean): boolean | null {
  const supabase = useMemo(() => createClient(), [])
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  useEffect(() => {
    if (!active) return
    let alive = true
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setLoggedIn(Boolean(data.user))
    })
    return () => {
      alive = false
    }
  }, [active, supabase])
  return loggedIn
}

export function RecordsLoginPrompt({ onLogin, compact = false }: { onLogin: () => void; compact?: boolean }) {
  const { dict } = useI18n()
  const t = dict.records
  return (
    <div className={compact ? "px-3 py-2" : "px-1 py-2"}>
      <p className="text-white/90 text-sm">{t.loginTitle}</p>
      <p className="text-white/50 text-xs mt-1 leading-relaxed">{t.loginText}</p>
      <button
        type="button"
        onClick={onLogin}
        className="mt-3 h-9 px-4 rounded-full bg-white/12 border border-white/20 text-white text-sm hover:bg-white/18 transition-colors"
      >
        {t.login}
      </button>
    </div>
  )
}

export default function RecordsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dict } = useI18n()
  const t = dict.records
  const loggedIn = useLoggedIn(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const login = () => {
    onClose()
    window.dispatchEvent(new CustomEvent("open-login"))
  }

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={t.title}>
      <button className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-label={dict.common.close} onClick={onClose} />
      <div className="absolute left-0 right-0 bottom-0 rounded-t-3xl border-t border-white/12 bg-[rgba(24,12,56,0.82)] backdrop-blur-xl px-5 pt-3 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] explore-sheet-enter">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25" aria-hidden="true" />
        <p className="text-white/45 text-[10px] uppercase tracking-widest mb-2">{t.title}</p>
        {loggedIn === false ? (
          <RecordsLoginPrompt onLogin={login} />
        ) : (
          <ul className="space-y-1" aria-busy={loggedIn === null}>
            {recordLinks(dict).map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={onClose}
                  className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 text-white/90 hover:bg-white/8 active:bg-white/10 transition-colors"
                >
                  <span>
                    <span className="block text-base font-light">{it.label}</span>
                    <span className="block text-white/45 text-xs mt-0.5">{it.hint}</span>
                  </span>
                  <span className="text-white/35" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
