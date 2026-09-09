"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"

/**
 * Painel "Explorar": bottom sheet leve com os destinos de descoberta do
 * produto (Oráculos e FAQ), visível também para quem não fez login.
 * Sem busca textual. Fecha ao tocar fora, no Esc ou ao escolher um destino.
 */
export default function ExploreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dict } = useI18n()
  const t = dict.nav

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const items = [
    { href: "/oraculos", label: t.oracles, hint: t.exploreOracles },
    { href: "/faq", label: t.faq, hint: t.exploreFaq },
  ]

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={t.explore}>
      <button className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-label={dict.common.close} onClick={onClose} />
      <div
        className="absolute left-0 right-0 bottom-0 rounded-t-3xl border-t border-white/12 bg-[rgba(24,12,56,0.82)] backdrop-blur-xl px-5 pt-3 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:left-1/2 sm:right-auto sm:bottom-auto sm:top-20 sm:w-80 sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:pb-4 explore-sheet-enter"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25 sm:hidden" aria-hidden="true" />
        <p className="text-white/45 text-[10px] uppercase tracking-widest mb-2">{t.explore}</p>
        <ul className="space-y-1">
          {items.map((it) => (
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
      </div>
    </div>
  )
}
