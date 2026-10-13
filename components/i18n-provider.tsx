"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { caminhoEquivalente, localeDaUrl, localeDaUrlDepoisDeMontar, localeEfetivo, localizarCaminho } from "@/lib/i18n/rotas"
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
  /** "/oraculos" vira "/en/oracles" em inglês. Só mexe nos caminhos públicos; o resto passa. */
  path: (caminho: string) => string
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
 * Nas 21 URLs públicas o idioma é o da URL (o servidor já renderiza assim, via
 * middleware). Nas demais páginas a fonte da verdade no servidor é o cookie,
 * o que permite renderizar já no idioma certo, sem piscar. O localStorage é uma
 * cópia de segurança: se o cookie sumir, a preferência é restaurada a partir
 * dele, mas só fora das URLs públicas, onde a URL manda.
 *
 * O idioma é DERIVADO do pathname: o layout raiz não re-renderiza numa
 * navegação suave, então initialLocale sozinho ficaria velho ao ir de
 * /oraculos para /en/oracles. Mas só DEPOIS de montar: no servidor e no
 * primeiro render, o pathname pode ser o da reescrita interna (na Netlify, é),
 * e quem vale é initialLocale, que o servidor decidiu pela URL de verdade.
 */
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [montado, setMontado] = useState(false)
  const doUrl = localeDaUrlDepoisDeMontar(pathname, montado)
  const [escolhido, setLocaleState] = useState<Locale>(initialLocale)
  const locale: Locale = localeEfetivo(escolhido, pathname, montado)

  useEffect(() => setMontado(true), [])

  const setLocale = useCallback(
    (next: Locale) => {
      if (!isLocale(next)) return
      setLocaleState(next)
      try {
        writeCookie(next)
        localStorage.setItem(LOCALE_STORAGE_KEY, next)
      } catch {}
      document.documentElement.lang = next
      // Página pública: o idioma mora na URL, então vai para a versão
      // equivalente. Nada de refresh: é outra URL, e o servidor a renderiza no
      // idioma dela.
      const equivalente = caminhoEquivalente(window.location.pathname, next)
      if (equivalente) {
        router.push(equivalente + window.location.search)
        return
      }
      // Página pessoal: o endereço é o mesmo e o idioma segue o cookie.
      // Server Components re-renderizam no novo idioma.
      router.refresh()
    },
    [router]
  )

  // A URL pública manda: a escolha acompanha o que a pessoa está lendo, para
  // as páginas pessoais (que seguem o cookie) falarem o mesmo idioma.
  useEffect(() => {
    if (!doUrl) return
    setLocaleState(doUrl)
    document.documentElement.lang = doUrl
    try {
      if (readCookie() !== doUrl) writeCookie(doUrl)
      localStorage.setItem(LOCALE_STORAGE_KEY, doUrl)
    } catch {}
  }, [doUrl])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
      // em URL pública a URL manda: não restaura preferência antiga por cima dela
      if (!localeDaUrl(window.location.pathname) && isLocale(stored) && !readCookie() && stored !== locale) {
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
      path: (caminho) => localizarCaminho(caminho, locale),
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
