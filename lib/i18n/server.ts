import { cookies, headers } from "next/headers"
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config"
import { HEADER_LOCALE, HEADER_LOCALE_URL } from "./rotas"
import { getDictionary } from "./index"

/**
 * Idioma da requisição. Só em Server Components e rotas.
 *
 * Nas 21 URLs públicas o idioma vem da URL: o middleware escreve os
 * cabeçalhos internos x-locale / x-locale-url (e apaga qualquer valor que o
 * cliente tenha mandado). Nas demais rotas (páginas pessoais, painel, APIs
 * chamadas pelo navegador) vale a escolha do usuário, o cookie, com fallback
 * para o padrão.
 */
export async function getLocale(): Promise<Locale> {
  const h = await headers()
  if (h.get(HEADER_LOCALE_URL) === "1") return resolveLocale(h.get(HEADER_LOCALE))
  const store = await cookies()
  return resolveLocale(store.get(LOCALE_COOKIE)?.value)
}

/** Atalho para páginas server-side: idioma + dicionário de uma vez */
export async function getI18n() {
  const locale = await getLocale()
  return { locale, dict: getDictionary(locale) }
}
