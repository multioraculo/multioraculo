import { cookies } from "next/headers"
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config"
import { getDictionary } from "./index"

/** Idioma escolhido pelo usuário (cookie), com fallback para o padrão. Só em Server Components e rotas. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  return resolveLocale(store.get(LOCALE_COOKIE)?.value)
}

/** Atalho para páginas server-side: idioma + dicionário de uma vez */
export async function getI18n() {
  const locale = await getLocale()
  return { locale, dict: getDictionary(locale) }
}
