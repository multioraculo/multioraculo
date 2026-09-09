/**
 * Fase da Lua para uma data: fração iluminada, idade e nome da fase.
 *
 * Cálculo astronômico determinístico, sem API externa, o mesmo do SunCalc
 * (fórmulas de baixa precisão de Astronomy Answers para as posições do Sol e
 * da Lua). Erro de iluminação abaixo de 1 % e de fase de poucas horas: mais
 * que suficiente para um contexto simbólico diário. Módulo puro, roda igual no
 * servidor e no navegador. Não há astrologia aqui: só geometria Sol–Lua–Terra.
 */

export const MOON_PHASE_KEYS = [
  "newMoon",
  "waxingCrescent",
  "firstQuarter",
  "waxingGibbous",
  "fullMoon",
  "waningGibbous",
  "lastQuarter",
  "waningCrescent",
] as const
export type MoonPhaseKey = (typeof MOON_PHASE_KEYS)[number]

export type MoonState = {
  /** posição no ciclo: 0 = nova, 0,5 = cheia, 1 = nova de novo */
  phase: number
  /** fração do disco iluminada, 0–1 */
  illumination: number
  /** dias desde a Lua nova */
  age: number
  waxing: boolean
  key: MoonPhaseKey
}

export const SYNODIC_MONTH_DAYS = 29.530588853

const RAD = Math.PI / 180
const OBLIQUITY = RAD * 23.4397
const DAY_MS = 86_400_000
const J1970 = 2440588
const J2000 = 2451545

function toDays(date: Date): number {
  return date.getTime() / DAY_MS - 0.5 + J1970 - J2000
}

function rightAscension(l: number, b: number): number {
  return Math.atan2(Math.sin(l) * Math.cos(OBLIQUITY) - Math.tan(b) * Math.sin(OBLIQUITY), Math.cos(l))
}

function declination(l: number, b: number): number {
  return Math.asin(Math.sin(b) * Math.cos(OBLIQUITY) + Math.cos(b) * Math.sin(OBLIQUITY) * Math.sin(l))
}

function sunCoords(d: number) {
  const M = RAD * (357.5291 + 0.98560028 * d)
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))
  const L = M + C + RAD * 102.9372 + Math.PI
  return { dec: declination(L, 0), ra: rightAscension(L, 0) }
}

function moonCoords(d: number) {
  const L = RAD * (218.316 + 13.176396 * d) // longitude eclíptica média
  const M = RAD * (134.963 + 13.064993 * d) // anomalia média
  const F = RAD * (93.272 + 13.22935 * d) // distância média ao nó
  const l = L + RAD * 6.289 * Math.sin(M)
  const b = RAD * 5.128 * Math.sin(F)
  const dist = 385001 - 20905 * Math.cos(M) // km
  return { ra: rightAscension(l, b), dec: declination(l, b), dist }
}

/** Chave da fase a partir da posição no ciclo: oito faixas iguais de 1/8, centradas nas fases principais. */
export function phaseKey(phase: number): MoonPhaseKey {
  const p = ((phase % 1) + 1) % 1
  const idx = Math.floor(((p + 1 / 16) % 1) * 8)
  return MOON_PHASE_KEYS[idx]
}

export function moonState(date: Date = new Date()): MoonState {
  const d = toDays(date)
  const s = sunCoords(d)
  const m = moonCoords(d)
  const sdist = 149_598_000 // km, Terra–Sol
  const phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra))
  const inc = Math.atan2(sdist * Math.sin(phi), m.dist - sdist * Math.cos(phi))
  const angle = Math.atan2(
    Math.cos(s.dec) * Math.sin(s.ra - m.ra),
    Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra)
  )
  const illumination = (1 + Math.cos(inc)) / 2
  const phase = 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / Math.PI
  return {
    phase,
    illumination,
    age: phase * SYNODIC_MONTH_DAYS,
    waxing: phase < 0.5,
    key: phaseKey(phase),
  }
}
