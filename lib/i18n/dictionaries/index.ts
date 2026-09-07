import type { Locale } from "../config"
import { pt, type Dictionary } from "./pt"
import { en } from "./en"
import { es } from "./es"

export type { Dictionary }

/** Registro de dicionários. Novos idiomas entram aqui e em LOCALES (config.ts). */
export const dictionaries: Record<Locale, Dictionary> = { pt, en, es }
