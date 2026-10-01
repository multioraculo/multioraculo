/**
 * Marcos pessoais: contagens que a própria pessoa define.
 *
 * "42 dias sem fumar" não é placar do aplicativo. O que se guarda é a data de
 * começo; o número de dias é calculado na hora de mostrar. Reiniciar é mudar
 * a data, e não perder nada.
 *
 * A contagem é em dias civis do fuso do produto, não em horas: quem começou
 * ontem à noite tem um dia hoje de manhã, e não zero.
 */
export const FUSO_DO_PRODUTO = "America/Sao_Paulo"

export type Marco = {
  id: string
  name: string
  /** AAAA-MM-DD */
  started_on: string
  note: string | null
  archived: boolean
  /**
   * Meta em dias, ou nula.
   *
   * Nula é o padrão e significa "esta contagem não tem fim": "42 dias sem
   * fumar" não termina, e pôr um alvo nela transformaria uma coisa que a pessoa
   * está vivendo numa tarefa a cumprir. Com meta, o marco vira outra coisa,
   * também legítima: "21 dias meditando" é uma experiência com horizonte, e ver
   * 12 de 21 diz algo que 12 sozinho não diz.
   */
  target: number | null
}

export const META_MAXIMA = 3650

export const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/

/** A data civil de hoje no fuso do produto, em AAAA-MM-DD. */
export function hojeCivil(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO_DO_PRODUTO, year: "numeric", month: "2-digit", day: "2-digit" }).format(agora)
}

/**
 * Quantos dias civis desde o começo. Hoje é 0, ontem é 1.
 * Negativo quando a data está no futuro, e quem chama decide o que fazer.
 */
export function diasDesde(inicio: string, hoje: string = hojeCivil()): number {
  const a = Date.parse(`${inicio}T00:00:00Z`)
  const b = Date.parse(`${hoje}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0
  return Math.round((b - a) / 86_400_000)
}

/**
 * Quanto da meta já foi andado, de 0 a 1. Nulo quando não há meta.
 *
 * Passa de 1 quando a pessoa continua depois de chegar, e isso é de propósito:
 * quem fez 30 dias de uma meta de 21 não voltou a zero nem "terminou". Quem
 * desenha decide o que fazer com o excedente; aqui não se mente sobre ele.
 */
export function progressoDaMeta(dias: number, meta: number | null): number | null {
  if (!meta || meta <= 0) return null
  return Math.max(0, dias) / meta
}
