/**
 * O céu de um dia, em dados estruturados. Nenhuma frase, nenhuma
 * interpretação: posições, aspectos e eventos, como o motor os calcula.
 *
 * Esta é a única camada que fala com o motor astronômico. Tudo acima dela
 * (relevância, prompt, tela) trabalha sobre estes números, e é o que permite
 * afirmar que nenhuma posição nasce de um modelo de linguagem.
 *
 * O "dia" é o dia civil de São Paulo, declarado na tela: o céu não tem fuso,
 * mas o leitor tem.
 */
import { Engine, lunarPhases, stations, solarEclipses, lunarEclipses } from "caelus"
import { embeddedData } from "caelus/data-embedded"

export const FUSO_DO_DIA = "America/Sao_Paulo"

export const CORPOS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as const
export type Corpo = (typeof CORPOS)[number]

/** orbe máximo aceito, em graus: a Lua anda rápido demais para orbes largos */
export const ORBE_MAX = 3
export const ORBE_MAX_LUA = 1.5

export type Posicao = {
  corpo: Corpo
  /** longitude eclíptica, 0 a 360 */
  lon: number
  /** 0 = Áries ... 11 = Peixes */
  signo: number
  /** grau dentro do signo, 0 a 30 */
  grau: number
  retrogrado: boolean
}

export type AspectoCeu = {
  a: Corpo
  b: Corpo
  /** conjunction | opposition | square | trine | sextile | quincunx */
  aspecto: string
  orbe: number
  /** o ângulo ainda está se fechando */
  aplicativo: boolean
}

export type Evento =
  | { tipo: "lunacao"; fase: string; lon: number; signo: number; grau: number }
  | { tipo: "eclipse"; especie: "solar" | "lunar"; lon: number; signo: number; grau: number }
  | { tipo: "estacao"; corpo: Corpo; sentido: string; lon: number; signo: number; grau: number }
  | { tipo: "ingresso"; corpo: Corpo; lon: number; signo: number; grau: number }

export type Ceu = {
  dia: string
  jdMeio: number
  posicoes: Posicao[]
  aspectos: AspectoCeu[]
  eventos: Evento[]
  /** 0 a 7, da Lua nova à minguante côncava */
  faseLua: number
}

let motorCache: Engine | null = null
export function motor(): Engine {
  if (!motorCache) motorCache = new Engine(embeddedData)
  return motorCache
}

/** O dia civil de São Paulo agora, em AAAA-MM-DD. */
export function diaDeHoje(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO_DO_DIA, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
}

/** Dia civil brasileiro para janela em Dia Juliano [início, fim). */
export function janelaDoDia(dia: string): { jdInicio: number; jdFim: number; jdMeio: number } {
  const [ano, mes, data] = dia.split("-").map(Number)
  // São Paulo está a menos 3h desde 2019, sem horário de verão: a janela local
  // começa às 03:00 UTC do mesmo dia.
  const jdInicio = diaJuliano(ano, mes, data, 0) + 3 / 24
  return { jdInicio, jdFim: jdInicio + 1, jdMeio: jdInicio + 0.5 }
}

export function indiceDoSigno(lon: number): number {
  return Math.floor((((lon % 360) + 360) % 360) / 30)
}

export function grauNoSigno(lon: number): number {
  return (((lon % 360) + 360) % 360) % 30
}

/** Tudo o que o céu faz neste dia, em números. */
export function estadoDoCeu(dia: string): Ceu {
  const eng = motor()
  const { jdInicio, jdFim, jdMeio } = janelaDoDia(dia)
  const mapa = eng.chart(...partesUtc(jdMeio), 0, 0, "whole_sign")
  const bruto = mapa.bodies as unknown as Record<string, { lon: number; retrograde: boolean }>

  const posicoes: Posicao[] = CORPOS.map((corpo) => situar(corpo, bruto[corpo].lon, bruto[corpo].retrograde))

  const aspectos: AspectoCeu[] = (
    mapa.aspects as unknown as Array<{ a: string; b: string; aspect: string; orb: number; phase: string }>
  )
    .filter((x) => CORPOS.includes(x.a as Corpo) && CORPOS.includes(x.b as Corpo))
    .filter((x) => x.orb <= (x.a === "moon" || x.b === "moon" ? ORBE_MAX_LUA : ORBE_MAX))
    .map((x) => ({ a: x.a as Corpo, b: x.b as Corpo, aspecto: x.aspect, orbe: x.orb, aplicativo: x.phase === "applying" }))

  const eventos: Evento[] = []

  for (const [jd, fase] of lunarPhases(eng, jdInicio, jdFim, 2)) {
    eventos.push({ tipo: "lunacao", fase, ...ondeEstava(eng, jd, "moon") })
  }
  if (solarEclipses(eng, jdInicio, jdFim).length) {
    eventos.push({ tipo: "eclipse", especie: "solar", ...ondeEstava(eng, jdMeio, "sun") })
  }
  if (lunarEclipses(eng, jdInicio, jdFim).length) {
    eventos.push({ tipo: "eclipse", especie: "lunar", ...ondeEstava(eng, jdMeio, "moon") })
  }
  for (const corpo of CORPOS) {
    if (corpo === "sun" || corpo === "moon") continue
    for (const [jd, sentido] of stations(eng, corpo, jdInicio, jdFim, 1)) {
      eventos.push({ tipo: "estacao", corpo, sentido, ...ondeEstava(eng, jd, corpo) })
    }
  }
  // ingresso: mudança de signo dentro da janela. A Lua fica de fora, porque
  // troca de signo a cada dois dias e meio: é ritmo, não notícia.
  const noInicio = eng.chart(...partesUtc(jdInicio), 0, 0, "whole_sign").bodies as Record<string, { lon: number }>
  const noFim = eng.chart(...partesUtc(jdFim), 0, 0, "whole_sign").bodies as Record<string, { lon: number }>
  for (const corpo of CORPOS) {
    if (corpo === "moon") continue
    if (indiceDoSigno(noInicio[corpo].lon) !== indiceDoSigno(noFim[corpo].lon)) {
      const lon = noFim[corpo].lon
      eventos.push({ tipo: "ingresso", corpo, lon, signo: indiceDoSigno(lon), grau: grauNoSigno(lon) })
    }
  }

  const elongacao = (((bruto.moon.lon - bruto.sun.lon) % 360) + 360) % 360
  const faseLua = Math.floor(((elongacao + 22.5) % 360) / 45)

  return { dia, jdMeio, posicoes, aspectos, eventos, faseLua }
}

export function posicaoDe(ceu: Ceu, corpo: Corpo): Posicao {
  return ceu.posicoes.find((p) => p.corpo === corpo) as Posicao
}

/**
 * As longitudes de todos os corpos num instante qualquer.
 *
 * Serve para comparar um instante com outro: é assim que se sabe se um ângulo
 * está se fechando ou se abrindo, sem perguntar isso ao motor.
 */
export function corposEm(jd: number): Record<string, { lon: number; retrogrado: boolean }> {
  const bruto = motor().chart(...partesUtc(jd), 0, 0, "whole_sign").bodies as unknown as Record<
    string,
    { lon: number; retrograde: boolean }
  >
  const saida: Record<string, { lon: number; retrogrado: boolean }> = {}
  for (const corpo of CORPOS) saida[corpo] = { lon: bruto[corpo].lon, retrogrado: Boolean(bruto[corpo].retrograde) }
  return saida
}

function situar(corpo: Corpo, lon: number, retrogrado: boolean): Posicao {
  return { corpo, lon, signo: indiceDoSigno(lon), grau: grauNoSigno(lon), retrogrado }
}

function ondeEstava(eng: Engine, jd: number, corpo: Corpo): { lon: number; signo: number; grau: number } {
  const lon = (eng.chart(...partesUtc(jd), 0, 0, "whole_sign").bodies as Record<string, { lon: number }>)[corpo].lon
  return { lon, signo: indiceDoSigno(lon), grau: grauNoSigno(lon) }
}

function diaJuliano(ano: number, mes: number, dia: number, hora: number): number {
  let a = ano
  let m = mes
  if (m <= 2) {
    a -= 1
    m += 12
  }
  const A = Math.floor(a / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (a + 4716)) + Math.floor(30.6001 * (m + 1)) + dia + B - 1524.5 + hora / 24
}

/** Dia Juliano para partes UTC, que é o que engine.chart espera. */
export function partesUtc(jd: number): [number, number, number, number, number, number] {
  const z = Math.floor(jd + 0.5)
  const f = jd + 0.5 - z
  let a = z
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25)
    a = z + 1 + alpha - Math.floor(alpha / 4)
  }
  const b = a + 1524
  const c = Math.floor((b - 122.1) / 365.25)
  const d = Math.floor(365.25 * c)
  const e = Math.floor((b - d) / 30.6001)
  const dia = b - d - Math.floor(30.6001 * e) + f
  const mes = e < 14 ? e - 1 : e - 13
  const ano = mes > 2 ? c - 4716 : c - 4715
  const diaInteiro = Math.floor(dia)
  const horas = (dia - diaInteiro) * 24
  const hora = Math.floor(horas)
  const minutos = (horas - hora) * 60
  const minuto = Math.floor(minutos)
  return [ano, mes, diaInteiro, hora, minuto, Math.round((minutos - minuto) * 60)]
}
