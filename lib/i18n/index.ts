import { LOCALE_META, type Locale } from "./config"
import { dictionaries, type Dictionary } from "./dictionaries"

export * from "./config"
export type { Dictionary } from "./dictionaries"

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

/** Substitui {chave} por valores: fmt("Olá, {name}", { name: "Ana" }) */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}

export type DateStyle = "long" | "short"

export function formatDate(iso: string, locale: Locale, style: DateStyle = "long"): string {
  return new Date(iso).toLocaleDateString(LOCALE_META[locale].tag, {
    day: "2-digit",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  })
}
