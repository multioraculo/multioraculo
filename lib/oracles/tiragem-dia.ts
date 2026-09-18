/**
 * A tiragem do dia: uma carta de Tarô e uma de Lenormand, lado a lado, a
 * mesma para todo mundo.
 *
 * A chave é só a data. Por isso não existe job à meia-noite: a tiragem vira
 * sozinha às 00:00, porque ela É a data. Qualquer servidor, a qualquer hora,
 * recalcula a mesma dupla.
 *
 * O sorteio usa o mesmo RNG determinístico das consultas (makeRng sobre uma
 * string), os mesmos baralhos e a mesma convenção de inversão. `drawAll` e a
 * consulta normal não são tocados, então os goldens da síntese continuam
 * valendo.
 *
 * O DIA É O DO PRODUTO. Sendo uma tiragem só para todos, precisa haver uma
 * data só, e ela é a de São Paulo. Quem abre em outro fuso vê a tiragem do
 * dia brasileiro em curso.
 *
 * VERSÃO DA CHAVE. A string semeada começa com `dia:v1:`. Se a regra mudar, a
 * versão sobe e as tiragens antigas continuam reproduzíveis pelo que eram.
 */
import { createHash } from "crypto"
import type { Locale } from "@/lib/i18n/config"
import { LENORMAND_DECK, TAROT_DECK, makeRng, type Sym } from "./draw"
import { lenormandId } from "./lenormand-assets"
import { renderSym } from "./localize"
import { tarotCardId, tarotCardRef, type TarotCardRef } from "./tarot-assets"

/** Fuso do produto: a data que define a tiragem de todos. */
export const FUSO_DO_PRODUTO = "America/Sao_Paulo"

/** Sobe quando a regra da chave mudar, para não reescrever o passado. */
export const VERSAO_TIRAGEM = "v1"

const FORMATO_DIA = /^\d{4}-\d{2}-\d{2}$/

export type TiragemDoDia = {
  dia: string
  seed: string
  tarot: {
    /** índice no baralho, 0 a 77 */
    indice: number
    invertida: boolean
    /** o que a lâmina precisa para desenhar a gravura */
    carta: TarotCardRef
    nome: string
    id: string
  }
  lenormand: {
    /** índice no baralho, 0 a 35 */
    indice: number
    nome: string
    id: string
  }
}

/** A data civil naquele fuso, em AAAA-MM-DD. */
export function diaNoFuso(zona: string, agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit" }).format(agora)
}

/** O dia da tiragem: o do produto, salvo pedido explícito de um dia válido. */
export function diaDaTiragem(pedido?: string | null, agora: Date = new Date()): string {
  const hoje = diaNoFuso(FUSO_DO_PRODUTO, agora)
  return pedido && FORMATO_DIA.test(pedido) ? pedido : hoje
}

export function seedDoDia(dia: string): string {
  return createHash("sha256").update(`dia:${VERSAO_TIRAGEM}:${dia}`).digest("hex")
}

/** As duas cartas do dia. Mesma data, mesma dupla, para qualquer pessoa. */
export function tiragemDoDia(dia: string, locale: Locale): TiragemDoDia {
  const seed = seedDoDia(dia)

  // mesma convenção do baralho completo: embaralha e tira a primeira
  const rngTarot = makeRng(`${seed}:tarot`)
  const indiceTarot = rngTarot.shuffle(TAROT_DECK.map((_, i) => i))[0]
  const invertida = rngTarot.bool()
  const symTarot: Sym = { kind: "tarot", card: indiceTarot, reversed: invertida }

  const rngLenormand = makeRng(`${seed}:lenormand`)
  const indiceLenormand = rngLenormand.shuffle(LENORMAND_DECK.map((_, i) => i))[0]
  const symLenormand: Sym = { kind: "lenormand", card: indiceLenormand }

  return {
    dia,
    seed,
    tarot: {
      indice: indiceTarot,
      invertida,
      carta: tarotCardRef(indiceTarot, invertida),
      nome: renderSym(symTarot, locale),
      id: tarotCardId(indiceTarot),
    },
    lenormand: {
      indice: indiceLenormand,
      nome: renderSym(symLenormand, locale),
      id: lenormandId(indiceLenormand),
    },
  }
}
