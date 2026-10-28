/**
 * O mapa natal lido tema por tema, para quem não sabe astrologia.
 *
 * A tela mostrava "Mercúrio · 20°50 Virgem · casa 4" num menu recolhido, e o
 * número da casa ficava para a pessoa cruzar sozinha com um guia à parte. A
 * dinâmica que funciona é a de responder a uma pergunta da vida antes de dar o
 * dado: o título é o tema ("Pensamento e fala"), e o planeta é a resposta.
 *
 * Cada ponto é lido em duas frases:
 *  - como aquele planeta funciona em você, naquele signo (`PLANETA_NO_SIGNO`);
 *  - em que situações da vida isso aparece, pela casa (`PLANETA_NA_CASA`).
 *
 * Tudo aqui é texto fixo, escrito uma vez e traduzido. Não há modelo: o mapa
 * não muda, e a leitura dele também não deve mudar de um dia para o outro.
 */
import type { Locale } from "@/lib/i18n/config"
import { EM_VOCE } from "./explicar-interconexao"
import { CASA_COMO_LUGAR, PLANETA_NA_CASA, PLANETA_NO_SIGNO } from "./leitura-natal"

/** A ordem dos temas: identidade primeiro, os lentos por último. */
export const ORDEM_DOS_TEMAS = [
  "sun", "asc", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "mc", "uranus", "neptune", "pluto",
] as const

const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

export type LeituraDoPonto = {
  /** como o ponto funciona em você, no signo dele */
  comoEm: string
  /** onde isso aparece na vida, pela casa; vazio sem hora de nascimento ou para os ângulos */
  onde: string
}

/**
 * @param id corpo ("sun", …) ou ângulo ("asc", "mc")
 * @param signo índice 0–11, ou null quando o signo não é certo
 * @param casa casa natal, ou null
 */
export function lerPonto(id: string, signo: number | null, casa: number | null, locale: Locale): LeituraDoPonto {
  // sem signo certo (hora desconhecida e a Lua no limite), fica só o que o ponto é
  const comoEm =
    signo !== null ? PLANETA_NO_SIGNO[locale][id]?.[signo] ?? "" : `${maiuscula(EM_VOCE[locale][id] ?? "")}.`
  const frase = PLANETA_NA_CASA[locale][id]
  const onde = casa !== null && frase ? frase(CASA_COMO_LUGAR[locale][casa - 1]) : ""
  return { comoEm, onde }
}
