"use client"

import { useEffect, useRef, useState } from "react"
import { LOCALES, LOCALE_META } from "@/lib/i18n"
import { useI18n } from "@/components/i18n-provider"

/** Seletor global de idioma, no mesmo estilo dos botões do cabeçalho. */
export default function LocaleSwitcher() {
  const { locale, dict, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("touchstart", close)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("touchstart", close)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={dict.locale.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={dict.locale.label}
        className="h-10 px-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/85 hover:bg-white/15 hover:text-white transition-all duration-200 flex items-center gap-1.5 text-xs font-medium tracking-wide"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
        {LOCALE_META[locale].short}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={dict.locale.label}
          className="absolute right-0 top-12 z-50 w-40 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-1.5 space-y-0.5"
        >
          {LOCALES.map((code) => {
            const active = code === locale
            return (
              <button
                key={code}
                role="option"
                aria-selected={active}
                lang={code}
                onClick={() => {
                  setOpen(false)
                  if (!active) setLocale(code)
                }}
                className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${
                  active ? "text-white bg-white/10" : "text-white/75 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{LOCALE_META[code].nativeName}</span>
                <span className="text-[10px] text-white/40 tracking-widest">{LOCALE_META[code].short}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
