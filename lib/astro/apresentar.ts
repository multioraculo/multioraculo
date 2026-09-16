/**
 * O movimento calculado vira card: nomes, funções, símbolo, orbe e a tradução
 * do ângulo, tudo no idioma do leitor.
 *
 * Esta é a fronteira entre número e palavra, e ela é nossa: a mesma estrutura
 * alimenta a tela e o prompt. O modelo recebe exatamente o que o usuário vê, e
 * por isso não tem como afirmar uma posição que a tela não mostre.
 */
import type { Locale } from "@/lib/i18n/config"
import type { Corpo } from "./ceu"
import type { Movimento } from "./relevancia"
import { ASPECTOS, CORPOS, LUNACOES, RETROGRADO, SIGNOS } from "./nomes"
import {
  FUNCAO_NOMES,
  FUNCAO_VERBOS,
  GLOSA_ASPECTO,
  GLOSA_MOVIMENTO,
  REGENTE,
  ROTULO_REGENTE,
  SIMBOLO_ASPECTO,
} from "./simbolos"

export type LadoCard = {
  corpo: Corpo
  nome: string
  /** os três substantivos sob o nome */
  funcoes: string
  /** os três verbos da coluna, onde o contraste fica visível */
  verbos: string[]
  /** este planeta rege o signo do leitor */
  regente: boolean
  rotuloRegente: string | null
}

export type CardMovimento = {
  id: string
  tipo: "aspecto" | "posicao" | "evento"
  a: LadoCard
  b: LadoCard | null
  /** símbolo do ângulo, quando há dois corpos */
  simbolo: string | null
  /** a faixa do meio: "OPOSIÇÃO" ou "SOL EM VIRGEM" */
  titulo: string
  /** "orbe 2,9°, aplicativo" ou "23,8°, retrógrado" */
  detalhe: string
  /** o que o ângulo estabelece, ou o que a posição é, em linguagem comum */
  glosa: string
  /**
   * O que este card autoriza o texto a nomear. O verificador usa isto para
   * reprovar qualquer planeta, signo ou aspecto que a leitura cite sem que o
   * céu calculado o contenha.
   */
  mencoes: { corpos: Corpo[]; signos: number[]; aspectos: string[] }
}

const numero = (n: number, locale: Locale) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))

function lado(corpo: Corpo, signo: number, locale: Locale): LadoCard {
  const regente = REGENTE[signo] === corpo
  return {
    corpo,
    nome: CORPOS[locale][corpo],
    funcoes: FUNCAO_NOMES[locale][corpo],
    verbos: FUNCAO_VERBOS[locale][corpo],
    regente,
    rotuloRegente: regente ? ROTULO_REGENTE[locale](SIGNOS[locale][signo]) : null,
  }
}

export function apresentar(movimento: Movimento, signo: number, locale: Locale): CardMovimento {
  const signos = SIGNOS[locale]
  const glosaMov = GLOSA_MOVIMENTO[locale]

  if (movimento.tipo === "aspecto") {
    const modificador = movimento.aplicativo ? glosaMov.aplicativo : glosaMov.separativo
    const orbe = locale === "en" ? `orb ${numero(movimento.orbe, locale)}°` : `orbe ${numero(movimento.orbe, locale)}°`
    const ritmo = movimento.aplicativo
      ? { pt: "aplicativo", en: "applying", es: "aplicativo" }[locale]
      : { pt: "separativo", en: "separating", es: "separativo" }[locale]
    return {
      id: movimento.id,
      tipo: "aspecto",
      a: lado(movimento.a, signo, locale),
      b: lado(movimento.b, signo, locale),
      simbolo: SIMBOLO_ASPECTO[movimento.aspecto] ?? null,
      titulo: ASPECTOS[locale][movimento.aspecto] ?? movimento.aspecto,
      detalhe: `${orbe}, ${ritmo}`,
      glosa: `${GLOSA_ASPECTO[locale][movimento.aspecto]}. ${maiuscula(modificador)}.`,
      mencoes: { corpos: [movimento.a, movimento.b], signos: [], aspectos: [movimento.aspecto] },
    }
  }

  if (movimento.tipo === "posicao") {
    const nome = CORPOS[locale][movimento.corpo]
    const em = { pt: "em", en: "in", es: "en" }[locale]
    const detalhe = movimento.retrogrado
      ? `${numero(movimento.grau, locale)}°, ${RETROGRADO[locale].retrograde}`
      : `${numero(movimento.grau, locale)}°`
    const glosaBase = movimento.noProprioSigno
      ? PERMANENCIA[locale](nome, signos[movimento.signo], true)
      : PERMANENCIA[locale](nome, signos[movimento.signo], false)
    return {
      id: movimento.id,
      tipo: "posicao",
      a: lado(movimento.corpo, signo, locale),
      b: null,
      simbolo: null,
      titulo: `${nome} ${em} ${signos[movimento.signo]}`,
      detalhe,
      glosa: movimento.retrogrado ? `${glosaBase}. ${maiuscula(glosaMov.retrogrado)}.` : `${glosaBase}.`,
      mencoes: { corpos: [movimento.corpo], signos: [movimento.signo], aspectos: [] },
    }
  }

  const evento = movimento.evento
  const corpo: Corpo = evento.tipo === "estacao" || evento.tipo === "ingresso" ? evento.corpo : "moon"
  const titulo = tituloDoEvento(movimento, signo, locale)
  return {
    id: movimento.id,
    tipo: "evento",
    a: lado(corpo, signo, locale),
    b: evento.tipo === "lunacao" || evento.tipo === "eclipse" ? lado("sun", signo, locale) : null,
    simbolo: null,
    titulo,
    detalhe: `${numero(evento.grau, locale)}° ${signos[evento.signo]}`,
    glosa: `${GLOSA_EVENTO[locale][evento.tipo]}.`,
    mencoes: {
      corpos: evento.tipo === "lunacao" || evento.tipo === "eclipse" ? [corpo, "sun"] : [corpo],
      signos: [evento.signo],
      aspectos: [],
    },
  }
}

function tituloDoEvento(movimento: Movimento, signo: number, locale: Locale): string {
  if (movimento.tipo !== "evento") return ""
  const evento = movimento.evento
  const signos = SIGNOS[locale]
  const em = { pt: "em", en: "in", es: "en" }[locale]
  if (evento.tipo === "lunacao") return `${LUNACOES[locale][evento.fase] ?? evento.fase} ${em} ${signos[evento.signo]}`
  if (evento.tipo === "eclipse") {
    const nome = { pt: evento.especie === "solar" ? "Eclipse solar" : "Eclipse lunar", en: evento.especie === "solar" ? "Solar eclipse" : "Lunar eclipse", es: evento.especie === "solar" ? "Eclipse solar" : "Eclipse lunar" }[locale]
    return `${nome} ${em} ${signos[evento.signo]}`
  }
  if (evento.tipo === "estacao") {
    const sentido = evento.sentido === "retrograde" ? RETROGRADO[locale].retrograde : RETROGRADO[locale].direct
    return `${CORPOS[locale][evento.corpo]} ${sentido} ${em} ${signos[evento.signo]}`
  }
  const entra = { pt: "entra em", en: "enters", es: "entra en" }[locale]
  return `${CORPOS[locale][evento.corpo]} ${entra} ${signos[evento.signo]}`
}

const PERMANENCIA: Record<Locale, (corpo: string, signo: string, proprio: boolean) => string> = {
  pt: (corpo, signo, proprio) =>
    proprio ? `${corpo} atravessa o próprio território do signo` : `${corpo}, que rege o signo, está passando por ${signo}`,
  en: (corpo, signo, proprio) =>
    proprio ? `${corpo} is crossing the sign's own ground` : `${corpo}, which rules the sign, is passing through ${signo}`,
  es: (corpo, signo, proprio) =>
    proprio ? `${corpo} atraviesa el propio territorio del signo` : `${corpo}, que rige el signo, está pasando por ${signo}`,
}

const GLOSA_EVENTO: Record<Locale, Record<string, string>> = {
  pt: {
    lunacao: "um ciclo da Lua se fecha e outro começa neste ponto do zodíaco",
    eclipse: "uma lunação exata em que um corpo encobre o outro: o ciclo vira e não volta ao ponto anterior",
    estacao: "o planeta para e inverte o movimento aparente: o tema dele volta para revisão",
    ingresso: "o planeta muda de signo e o campo em que ele age passa a ser outro",
  },
  en: {
    lunacao: "one lunar cycle closes and another begins at this point of the zodiac",
    eclipse: "an exact lunation where one body covers the other: the cycle turns and does not return to where it was",
    estacao: "the planet stops and reverses its apparent motion: its theme comes back for review",
    ingresso: "the planet changes sign, and the field it acts in becomes another one",
  },
  es: {
    lunacao: "un ciclo de la Luna se cierra y otro empieza en este punto del zodíaco",
    eclipse: "una lunación exacta en la que un cuerpo cubre al otro: el ciclo gira y no vuelve al punto anterior",
    estacao: "el planeta se detiene e invierte el movimiento aparente: su tema vuelve para revisión",
    ingresso: "el planeta cambia de signo y el campo en el que actúa pasa a ser otro",
  },
}

const maiuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)
