"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_STORAGE_KEY,
  formatDate as formatDateBase,
  getDictionary,
  isLocale,
  type DateStyle,
  type Dictionary,
  type Locale,
} from "@/lib/i18n"

type I18nContextValue = {
  locale: Locale
  dict: Dictionary
  setLocale: (locale: Locale) => void
  formatDate: (iso: string, style?: DateStyle) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function writeCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`
}

function readCookie(): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : null
}

/**
 * Fonte da verdade no servidor é o cookie (permite renderizar já no idioma
 * certo, sem piscar). O localStorage é uma cópia de segurança: se o cookie
 * sumir, a preferência é restaurada a partir dele.
 */
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback(
    (next: Locale) => {
      if (!isLocale(next)) return
      setLocaleState(next)
      try {
        writeCookie(next)
        localStorage.setItem(LOCALE_STORAGE_KEY, next)
      } catch {}
      document.documentElement.lang = next
      // Server Components (páginas estáticas de texto) re-renderizam no novo idioma
      router.refresh()
    },
    [router]
  )

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
      if (isLocale(stored) && !readCookie() && stored !== locale) {
        setLocale(stored)
      } else if (!stored && isLocale(locale)) {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale)
      }
    } catch {}
    // só na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dict: getDictionary(locale),
      setLocale,
      formatDate: (iso, style) => formatDateBase(iso, locale, style),
    }),
    [locale, setLocale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n deve ser usado dentro de <I18nProvider>")
  return ctx
}
