/**
 * Nomes astrológicos nos três idiomas. Vêm do código, nunca do modelo — a
 * mesma regra que já vale para as cartas, runas e hexagramas em
 * lib/oracles/localize.ts.
 *
 * Isso serve a duas coisas: o fato chega ao modelo já no idioma de saída, e o
 * verificador tem um léxico fechado para conferir o que o texto afirma.
 */
import type { Locale } from "@/lib/i18n/config"

export const SIGNOS: Record<Locale, string[]> = {
  pt: ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"],
  en: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  es: ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"],
}

/** Chaves do motor → nome. A ordem é a do caelus. */
export const CORPOS: Record<Locale, Record<string, string>> = {
  pt: { sun: "Sol", moon: "Lua", mercury: "Mercúrio", venus: "Vênus", mars: "Marte", jupiter: "Júpiter", saturn: "Saturno", uranus: "Urano", neptune: "Netuno", pluto: "Plutão", chiron: "Quíron", mean_node: "Nodo lunar", true_node: "Nodo lunar" },
  en: { sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars", jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune", pluto: "Pluto", chiron: "Chiron", mean_node: "Lunar node", true_node: "Lunar node" },
  es: { sun: "Sol", moon: "Luna", mercury: "Mercurio", venus: "Venus", mars: "Marte", jupiter: "Júpiter", saturn: "Saturno", uranus: "Urano", neptune: "Neptuno", pluto: "Plutón", chiron: "Quirón", mean_node: "Nodo lunar", true_node: "Nodo lunar" },
}

export const ASPECTOS: Record<Locale, Record<string, string>> = {
  pt: { conjunction: "conjunção", opposition: "oposição", square: "quadratura", trine: "trígono", sextile: "sextil", quincunx: "quincunce" },
  en: { conjunction: "conjunction", opposition: "opposition", square: "square", trine: "trine", sextile: "sextile", quincunx: "quincunx" },
  es: { conjunction: "conjunción", opposition: "oposición", square: "cuadratura", trine: "trígono", sextile: "sextil", quincunx: "quincuncio" },
}

/** Fases da Lua em oito faixas, pela elongação Sol-Lua. */
/**
 * A palavra que liga os dois nomes no título: "em oposição A Saturno", mas
 * "em quadratura COM Plutão". Sem isto o título sai torto em português.
 */
export const LIGACAO_ASPECTO: Record<Locale, Record<string, string>> = {
  pt: { conjunction: "com", opposition: "a", square: "com", trine: "com", sextile: "com", quincunx: "com" },
  en: { conjunction: "with", opposition: "to", square: "to", trine: "to", sextile: "to", quincunx: "to" },
  es: { conjunction: "con", opposition: "a", square: "con", trine: "con", sextile: "con", quincunx: "con" },
}

export const FASES: Record<Locale, string[]> = {
  pt: ["nova", "crescente côncava", "quarto crescente", "crescente gibosa", "cheia", "minguante gibosa", "quarto minguante", "minguante côncava"],
  en: ["new", "waxing crescent", "first quarter", "waxing gibbous", "full", "waning gibbous", "last quarter", "waning crescent"],
  es: ["nueva", "creciente cóncava", "cuarto creciente", "creciente gibosa", "llena", "menguante gibosa", "cuarto menguante", "menguante cóncava"],
}

/** Nome das lunações exatas, que o motor devolve como evento. */
export const LUNACOES: Record<Locale, Record<string, string>> = {
  pt: { new: "Lua nova", first_quarter: "quarto crescente", full: "Lua cheia", last_quarter: "quarto minguante" },
  en: { new: "New Moon", first_quarter: "first quarter", full: "Full Moon", last_quarter: "last quarter" },
  es: { new: "Luna nueva", first_quarter: "cuarto creciente", full: "Luna llena", last_quarter: "cuarto menguante" },
}

export const RETROGRADO: Record<Locale, { retrograde: string; direct: string }> = {
  pt: { retrograde: "retrógrado", direct: "direto" },
  en: { retrograde: "retrograde", direct: "direct" },
  es: { retrograde: "retrógrado", direct: "directo" },
}

/** Frases curtas que o gerador de fatos monta, por idioma. */
export const FRASES: Record<Locale, {
  luaEm: (grau: string, signo: string, fase: string) => string
  aspecto: (a: string, asp: string, b: string, orbe: string, aplicativo: boolean) => string
  ingresso: (corpo: string, signo: string) => string
  estacao: (corpo: string, sentido: string, grau: string, signo: string) => string
  lunacao: (nome: string, grau: string, signo: string) => string
  eclipse: (tipo: "solar" | "lunar", grau: string, signo: string) => string
  aplicativo: string
}> = {
  pt: {
    luaEm: (g, s, f) => `Lua a ${g}° de ${s}, ${f}`,
    aspecto: (a, asp, b, orbe, apl) => `${a} em ${asp} com ${b}, orbe de ${orbe}°${apl ? ", aplicativo" : ""}`,
    ingresso: (c, s) => `${c} entra em ${s}`,
    estacao: (c, sentido, g, s) => `${c} estaciona ${sentido} a ${g}° de ${s}`,
    lunacao: (n, g, s) => `${n} a ${g}° de ${s}`,
    eclipse: (t, g, s) => `eclipse ${t === "solar" ? "solar" : "lunar"} a ${g}° de ${s}`,
    aplicativo: "aplicativo",
  },
  en: {
    luaEm: (g, s, f) => `Moon at ${g}° ${s}, ${f}`,
    aspecto: (a, asp, b, orbe, apl) => `${a} ${asp} ${b}, orb ${orbe}°${apl ? ", applying" : ""}`,
    ingresso: (c, s) => `${c} enters ${s}`,
    estacao: (c, sentido, g, s) => `${c} stations ${sentido} at ${g}° ${s}`,
    lunacao: (n, g, s) => `${n} at ${g}° ${s}`,
    eclipse: (t, g, s) => `${t === "solar" ? "solar" : "lunar"} eclipse at ${g}° ${s}`,
    aplicativo: "applying",
  },
  es: {
    luaEm: (g, s, f) => `Luna a ${g}° de ${s}, ${f}`,
    aspecto: (a, asp, b, orbe, apl) => `${a} en ${asp} con ${b}, orbe de ${orbe}°${apl ? ", aplicativo" : ""}`,
    ingresso: (c, s) => `${c} entra en ${s}`,
    estacao: (c, sentido, g, s) => `${c} estaciona ${sentido} a ${g}° de ${s}`,
    lunacao: (n, g, s) => `${n} a ${g}° de ${s}`,
    eclipse: (t, g, s) => `eclipse ${t === "solar" ? "solar" : "lunar"} a ${g}° de ${s}`,
    aplicativo: "aplicativo",
  },
}

export const indiceDoSigno = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30)
export const grauNoSigno = (lon: number) => ((lon % 30) + 30) % 30
export const signoDe = (lon: number, locale: Locale) => SIGNOS[locale][indiceDoSigno(lon)]

/** Faixa de fase pela elongação, em oito partes. */
export const faseDe = (elongacao: number, locale: Locale) => {
  const e = ((elongacao % 360) + 360) % 360
  const i = Math.floor(((e + 22.5) % 360) / 45)
  return FASES[locale][i]
}
