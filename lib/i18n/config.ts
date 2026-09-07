/**
 * Configuração central de idiomas.
 *
 * Para adicionar um idioma: acrescente o código em LOCALES, os metadados em
 * LOCALE_META, crie `dictionaries/<código>.ts` seguindo o tipo Dictionary e
 * registre-o em `dictionaries/index.ts`. Nada mais precisa mudar.
 */

export const LOCALES = ["pt", "en", "es"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "pt"

/** Nome do cookie e da chave em localStorage que guardam a escolha do usuário */
export const LOCALE_COOKIE = "locale"
export const LOCALE_STORAGE_KEY = "multioraculo.locale"
/** Um ano, em segundos */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export type LocaleMeta = {
  /** Nome do idioma no próprio idioma (aparece no seletor) */
  nativeName: string
  /** Código curto exibido no botão do seletor */
  short: string
  /** Tag BCP 47 usada em datas e no atributo lang do <html> */
  tag: string
  /** Nome do idioma em português, usado nas instruções aos modelos */
  promptName: string
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  pt: { nativeName: "Português", short: "PT", tag: "pt-BR", promptName: "português do Brasil" },
  en: { nativeName: "English", short: "EN", tag: "en-US", promptName: "inglês" },
  es: { nativeName: "Español", short: "ES", tag: "es-ES", promptName: "espanhol" },
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value)
}

/** Normaliza qualquer entrada (cookie, body de API, Accept-Language) para um Locale válido */
export function resolveLocale(value: unknown): Locale {
  if (isLocale(value)) return value
  if (typeof value === "string") {
    const base = value.toLowerCase().split(/[-_]/)[0]
    if (isLocale(base)) return base
  }
  return DEFAULT_LOCALE
}
