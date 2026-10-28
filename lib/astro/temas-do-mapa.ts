/**
 * O mapa natal lido tema por tema, para quem não sabe astrologia.
 *
 * A tela mostrava "Mercúrio · 20°50 Virgem · casa 4" num menu recolhido, e o
 * número da casa ficava para a pessoa cruzar sozinha com um guia à parte. A
 * dinâmica que funciona é a de responder a uma pergunta da vida antes de dar o
 * dado: o título é o tema ("Pensamento e fala"), e o planeta é a resposta.
 *
 * Cada ponto é lido em três camadas, sempre na mesma ordem:
 *  - o que ele é EM VOCÊ (o corpo);
 *  - com que tom ele se expressa (o signo);
 *  - em que área da vida você o vive (a casa).
 *
 * Tudo aqui é texto fixo, escrito uma vez e traduzido. Não há modelo: o mapa
 * não muda, e a leitura dele também não deve mudar de um dia para o outro.
 */
import type { Locale } from "@/lib/i18n/config"
import { EM_VOCE } from "./explicar-interconexao"
import { SIGNOS } from "./nomes"
import { LINHA_SIGNO, TERRENO_DA_CASA } from "./simbolos"

/** A ordem dos temas: identidade primeiro, os lentos por último. */
export const ORDEM_DOS_TEMAS = [
  "sun", "asc", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "mc", "uranus", "neptune", "pluto",
] as const

const FRASES: Record<Locale, {
  tom: (signo: string, linha: string) => string
  onde: (area: string, emVoce: string) => string
}> = {
  pt: {
    tom: (s, l) => `Com o tom de ${s}: ${l}.`,
    onde: (a, v) => `É sobretudo em ${a} que você vive ${v}.`,
  },
  en: {
    tom: (s, l) => `With the tone of ${s}: ${l}.`,
    onde: (a, v) => `It is mostly in ${a} that you live out ${v}.`,
  },
  es: {
    tom: (s, l) => `Con el tono de ${s}: ${l}.`,
    onde: (a, v) => `Es sobre todo en ${a} donde vives ${v}.`,
  },
}

const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

/** "Início · impulso · afirmação" vira "início, impulso, afirmação". */
const linhaCorrida = (linha: string) => linha.split(" · ").join(", ").toLowerCase()

export type LeituraDoPonto = {
  /** o que aquele ponto é em você */
  emVoce: string
  /** o tom do signo; vazio quando o signo não é certo */
  tom: string
  /** a área da vida, pela casa; vazio sem hora de nascimento ou para os ângulos */
  onde: string
}

/**
 * @param id corpo ("sun", …) ou ângulo ("asc", "mc")
 * @param signo índice 0–11, ou null quando o signo não é certo
 * @param casa casa natal, ou null
 */
export function lerPonto(id: string, signo: number | null, casa: number | null, locale: Locale): LeituraDoPonto {
  const F = FRASES[locale]
  const emVoce = EM_VOCE[locale][id] ?? ""
  const tom = signo !== null ? F.tom(SIGNOS[locale][signo], linhaCorrida(LINHA_SIGNO[locale][signo])) : ""
  const onde = casa !== null && emVoce ? F.onde(TERRENO_DA_CASA[locale][casa - 1], emVoce) : ""
  return { emVoce: maiuscula(emVoce), tom, onde }
}
