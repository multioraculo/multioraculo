/**
 * A relação escrita sem modelo nenhum, só com os fatos.
 *
 * Último degrau da recuperação: quando a geração reprova e os reparos também,
 * o dia não pode ficar sem leitura. Em vez de entregar nada, entrega-se menos.
 *
 * O QUE ELA NÃO FAZ, e é a lista inteira do que a torna aceitável: não
 * interpreta, não aconselha, não afirma causa que os fatos não sustentem, e
 * não usa frase de encher. Cada oração aqui é uma medida do motor dita em
 * português. É mais seca que uma leitura gerada, e é para ser: prefere-se
 * relação curta e sustentada a relação bonita e inventada.
 *
 * OS TERMOS SAEM DE `funcoes`, NUNCA DE `verbos`. O verificador reprova termo
 * que ecoa a lista de verbos, porque ela já está impressa na tela ao lado — e
 * `funcoes` é a outra face do mesmo corpo, que não aparece no card. É essa a
 * única folga que o molde usa, e ela é legítima.
 *
 * NADA AQUI DISPENSA O VERIFICADOR. O que este arquivo devolve passa pelas
 * mesmas checagens que uma relação gerada, e se reprovar não é usado. O molde
 * não tem autoridade nenhuma por ser determinístico.
 */
import type { Locale } from "@/lib/i18n/config"
import type { CardMovimento } from "./apresentar"
import type { Origem, RelacaoEscrita, TermoEscrito } from "./prompt-horoscopo"
import { SIGNOS } from "./nomes"
import { termosEsperados } from "./verificador"

const numero = (n: number, locale: Locale) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))

/** Junta as duas primeiras funções do corpo: "pensamento · linguagem · distinção" → "pensamento e linguagem". */
function termoDeFuncoes(funcoes: string, locale: Locale): string {
  const e = locale === "en" ? "and" : locale === "es" ? "y" : "e"
  const partes = funcoes
    .split(/[·,]/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (partes.length >= 2) return `${partes[0]} ${e} ${partes[1]}`
  return partes[0] ?? funcoes.trim()
}

/**
 * As frases da explicação, na ordem em que os fatos se sustentam.
 *
 * A primeira situa os corpos: quem está onde, em que grau. A segunda dá o que
 * o dia acrescenta: o ângulo com o orbe, ou o que aquele corpo mais faz hoje.
 * Duas frases é o mínimo que o verificador aceita, e o molde fica no mínimo de
 * propósito: cada frase a mais é uma chance a mais de dizer algo que os fatos
 * não sustentam.
 */
function frases(card: CardMovimento, signoLeitor: number, locale: Locale): string[] {
  const signo = SIGNOS[locale][signoLeitor]
  const a = card.a
  const b = card.b
  const saida: string[] = []

  const retro = (lado: typeof a) => (lado.retrogrado ? `, retrógrado,` : "")

  // UMA FRASE POR FATO, e nunca as duas posições na mesma. O verificador exige
  // no mínimo duas frases, e juntar A e B numa só produzia relação de uma frase
  // sempre que não havia ângulo nem contexto para completar.
  saida.push(`${a.nome}${retro(a)} está em ${a.nomeSigno}, a ${a.grauTexto}.`)
  if (b) {
    saida.push(`${b.nome}${retro(b)} está em ${b.nomeSigno}, a ${b.grauTexto}.`)
  } else if (a.regente) {
    saida.push(`${a.nome} rege ${signo}.`)
  }

  if (card.aspecto && b && card.anguloReal !== null && card.orbe !== null) {
    const ritmo = card.aplicativo ? "ainda se aproximando" : "já se afastando"
    saida.push(
      `Os dois estão a ${numero(card.anguloReal, locale)} graus um do outro, com orbe de ${numero(card.orbe, locale)} graus, ${ritmo}.`,
    )
  }

  // o contexto é obrigatório quando existe: o verificador reprova posição que
  // ignora o que aquele corpo faz com os outros no mesmo dia
  if (card.contexto.length > 0) {
    saida.push(`${card.contexto[0]}.`.replace(/\.\.$/, "."))
  }

  // o signo do leitor precisa ser nomeado em algum lugar, e sem regência não
  // foi dito ainda
  const jaCitouSigno = saida.some((f) => f.includes(signo))
  if (!jaCitouSigno) {
    saida.push(`Para ${signo}, é este o movimento do dia.`)
  }

  // piso de duas frases: o verificador reprova abaixo disso, e um molde que
  // reprova não serve para nada
  if (saida.length < 2) saida.push(`Para ${signo}, é este o movimento do dia.`)

  // teto de sete, que é o outro limite da mesma regra
  return saida.slice(0, 7)
}

/**
 * A relação inteira, determinística. Quem chama precisa passá-la pelo
 * verificador antes de usar: este molde não decide nada sozinho.
 */
export function relacaoDeterministica(
  card: CardMovimento,
  posicao: number,
  signoLeitor: number,
  locale: Locale,
): RelacaoEscrita {
  const quantos = termosEsperados(card)
  const termos: TermoEscrito[] = []

  if (quantos === 2) {
    termos.push({ texto: termoDeFuncoes(card.a.funcoes, locale), origem: "planetaA" as Origem })
    const segundo = card.b ? termoDeFuncoes(card.b.funcoes, locale) : termoDeFuncoes(card.a.funcoes, locale)
    termos.push({ texto: segundo, origem: (card.b ? "planetaB" : "signoA") as Origem })
  }

  return { n: posicao + 1, termos, explicacao: frases(card, signoLeitor, locale).join(" ") }
}
