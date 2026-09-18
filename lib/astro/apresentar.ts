/**
 * O movimento calculado vira card, com a configuração INTEIRA.
 *
 * Um aspecto não é "Mercúrio oposição Saturno". É Mercúrio a 11,3° de Libra,
 * direto, em oposição de 178,7° com orbe de 1,29° ainda se fechando, contra
 * Saturno a 12,6° de Áries, retrógrado. Tudo isso entra aqui e segue junto
 * para o prompt e para a tela, porque interpretar só o par de nomes produz
 * frase plausível e genérica.
 *
 * O card também carrega o CONTEXTO: os outros aspectos que os corpos dele
 * fazem no mesmo dia. Sem isso, o Sol em Virgem seria lido como peça isolada
 * quando na verdade está acoplado a Marte.
 *
 * E carrega a FORMA, decidida pela geometria e não pelo layout: oposição e
 * quadratura admitem dois polos; sextil e trígono não viram conflito; uma
 * posição não precisa de polaridade nenhuma.
 */
import type { Locale } from "@/lib/i18n/config"
import type { Ceu, Corpo } from "./ceu"
import type { Movimento } from "./relevancia"
import { ASPECTOS, CORPOS, LUNACOES, RETROGRADO, SIGNOS } from "./nomes"
import {
  ANGULO_ASPECTO,
  FUNCAO_NOMES,
  FUNCAO_VERBOS,
  GLOSA_ASPECTO,
  GLOSA_MOVIMENTO,
  LINHA_SIGNO,
  REGENTE,
  ROTULO_REGENTE,
  SIMBOLO_ASPECTO,
} from "./simbolos"

/** A forma do card nasce do ângulo, não da diagramação. */
export type FormaCard = "contraste" | "articulacao" | "convergencia" | "posicao"

export type LadoCard = {
  corpo: Corpo
  nome: string
  /** os três substantivos sob o nome */
  funcoes: string
  /** os três verbos da coluna, onde o contraste fica visível */
  verbos: string[]
  /** este corpo rege o signo do leitor */
  regente: boolean
  rotuloRegente: string | null
  /** onde ele está: o campo em que a função dele opera hoje */
  signo: number
  nomeSigno: string
  campo: string
  grau: number
  grauTexto: string
  retrogrado: boolean
}

export type CardMovimento = {
  id: string
  tipo: "aspecto" | "posicao" | "evento"
  forma: FormaCard
  a: LadoCard
  b: LadoCard | null
  /** chave do motor, quando há ângulo */
  aspecto: string | null
  simbolo: string | null
  /** a faixa do meio: "OPOSIÇÃO" ou "SOL EM VIRGEM" */
  titulo: string
  /** "orbe 1,3°, aplicativo" ou "24,7°" */
  detalhe: string
  /** o que o ângulo estabelece, ou o que a posição é, em linguagem comum */
  glosa: string
  anguloReal: number | null
  orbe: number | null
  aplicativo: boolean | null
  /** outros aspectos que os corpos deste card fazem hoje */
  contexto: string[]
  /**
   * O que este card autoriza o texto a nomear. O verificador usa isto para
   * reprovar qualquer planeta, signo ou aspecto que a leitura cite sem que o
   * céu calculado o contenha.
   */
  mencoes: { corpos: Corpo[]; signos: number[]; aspectos: string[] }
}

const numero = (n: number, locale: Locale) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))

export function formaDoAspecto(aspecto: string | null): FormaCard {
  if (!aspecto) return "posicao"
  if (aspecto === "conjunction") return "convergencia"
  if (aspecto === "opposition" || aspecto === "square") return "contraste"
  return "articulacao"
}

function lado(corpo: Corpo, signoDoLeitor: number, ceu: Ceu, locale: Locale): LadoCard {
  const pos = ceu.posicoes.find((p) => p.corpo === corpo)!
  const regente = REGENTE[signoDoLeitor] === corpo
  return {
    corpo,
    nome: CORPOS[locale][corpo],
    funcoes: FUNCAO_NOMES[locale][corpo],
    verbos: FUNCAO_VERBOS[locale][corpo],
    regente,
    rotuloRegente: regente ? ROTULO_REGENTE[locale](SIGNOS[locale][signoDoLeitor]) : null,
    signo: pos.signo,
    nomeSigno: SIGNOS[locale][pos.signo],
    campo: LINHA_SIGNO[locale][pos.signo],
    grau: pos.grau,
    grauTexto: `${numero(pos.grau, locale)}°`,
    retrogrado: pos.retrogrado,
  }
}

/**
 * Os outros aspectos que estes corpos fazem hoje, para a peça não ser lida
 * isolada. Devolve também o que essas linhas nomeiam: o texto pode falar do
 * que está no contexto, e o verificador precisa saber disso ou reprova uma
 * citação que o próprio prompt autorizou.
 */
function contextoDe(
  corpos: Corpo[],
  idProprio: string,
  ceu: Ceu,
  locale: Locale,
): { linhas: string[]; corpos: Corpo[]; signos: number[]; aspectos: string[] } {
  const com = { pt: "com", en: "with", es: "con" }[locale]
  const tambem = { pt: "também faz", en: "also makes", es: "también hace" }[locale]
  const relevantes = ceu.aspectos
    .filter((x) => `aspecto:${x.a}~${x.b}:${x.aspecto}` !== idProprio)
    .filter((x) => corpos.includes(x.a) || corpos.includes(x.b))
  const citados = { corpos: [] as Corpo[], signos: [] as number[], aspectos: [] as string[] }
  const linhas = relevantes.map((x) => {
      const quem = corpos.includes(x.a) ? x.a : x.b
      const outro = corpos.includes(x.a) ? x.b : x.a
      const pos = ceu.posicoes.find((p) => p.corpo === outro)!
      const ritmo = x.aplicativo
        ? { pt: "aplicativo", en: "applying", es: "aplicativo" }[locale]
        : { pt: "separativo", en: "separating", es: "separativo" }[locale]
      const orbe = locale === "en" ? "orb" : "orbe"
      citados.corpos.push(quem, outro)
      citados.signos.push(pos.signo)
      citados.aspectos.push(x.aspecto)
      return `${CORPOS[locale][quem]} ${tambem} ${ASPECTOS[locale][x.aspecto]} ${com} ${CORPOS[locale][outro]} em ${SIGNOS[locale][pos.signo]} ${numero(pos.grau, locale)}° (${orbe} ${numero(x.orbe, locale)}°, ${ritmo})`
    })
  return { linhas, ...citados }
}

export function apresentar(movimento: Movimento, signo: number, locale: Locale, ceu: Ceu): CardMovimento {
  const glosaMov = GLOSA_MOVIMENTO[locale]
  const orbeRotulo = locale === "en" ? "orb" : "orbe"

  if (movimento.tipo === "aspecto") {
    const a = lado(movimento.a, signo, ceu, locale)
    const b = lado(movimento.b, signo, ceu, locale)
    const contexto = contextoDe([movimento.a, movimento.b], movimento.id, ceu, locale)
    const modificador = movimento.aplicativo ? glosaMov.aplicativo : glosaMov.separativo
    const ritmo = movimento.aplicativo
      ? { pt: "aplicativo", en: "applying", es: "aplicativo" }[locale]
      : { pt: "separativo", en: "separating", es: "separativo" }[locale]
    const separacao = (((b.grau + b.signo * 30 - (a.grau + a.signo * 30)) % 360) + 360) % 360
    const anguloReal = separacao > 180 ? 360 - separacao : separacao
    return {
      id: movimento.id,
      tipo: "aspecto",
      forma: formaDoAspecto(movimento.aspecto),
      a,
      b,
      aspecto: movimento.aspecto,
      simbolo: SIMBOLO_ASPECTO[movimento.aspecto] ?? null,
      titulo: ASPECTOS[locale][movimento.aspecto] ?? movimento.aspecto,
      detalhe: `${numero(anguloReal, locale)}°, ${orbeRotulo} ${numero(movimento.orbe, locale)}°, ${ritmo}`,
      glosa: `${GLOSA_ASPECTO[locale][movimento.aspecto]}. ${maiuscula(modificador)}.`,
      anguloReal,
      orbe: movimento.orbe,
      aplicativo: movimento.aplicativo,
      contexto: contexto.linhas,
      mencoes: {
        corpos: [movimento.a, movimento.b, ...contexto.corpos],
        signos: [a.signo, b.signo, ...contexto.signos],
        aspectos: [movimento.aspecto, ...contexto.aspectos],
      },
    }
  }

  if (movimento.tipo === "posicao") {
    const a = lado(movimento.corpo, signo, ceu, locale)
    const contexto = contextoDe([movimento.corpo], movimento.id, ceu, locale)
    const em = { pt: "em", en: "in", es: "en" }[locale]
    const glosaBase = PERMANENCIA[locale](a.nome, a.nomeSigno, movimento.noProprioSigno)
    return {
      id: movimento.id,
      tipo: "posicao",
      forma: "posicao",
      a,
      b: null,
      aspecto: null,
      simbolo: null,
      titulo: `${a.nome} ${em} ${a.nomeSigno}`,
      detalhe: a.retrogrado ? `${a.grauTexto}, ${RETROGRADO[locale].retrograde}` : a.grauTexto,
      glosa: a.retrogrado ? `${glosaBase}. ${maiuscula(glosaMov.retrogrado)}.` : `${glosaBase}.`,
      anguloReal: null,
      orbe: null,
      aplicativo: null,
      contexto: contexto.linhas,
      mencoes: {
        corpos: [movimento.corpo, ...contexto.corpos],
        signos: [a.signo, ...contexto.signos],
        aspectos: contexto.aspectos,
      },
    }
  }

  const evento = movimento.evento
  const corpo: Corpo = evento.tipo === "estacao" || evento.tipo === "ingresso" ? evento.corpo : "moon"
  const a = lado(corpo, signo, ceu, locale)
  const contextoEvento = contextoDe([corpo], movimento.id, ceu, locale)
  return {
    id: movimento.id,
    tipo: "evento",
    forma: "posicao",
    a,
    b: evento.tipo === "lunacao" || evento.tipo === "eclipse" ? lado("sun", signo, ceu, locale) : null,
    aspecto: null,
    simbolo: null,
    titulo: tituloDoEvento(movimento, locale),
    detalhe: `${numero(evento.grau, locale)}° ${SIGNOS[locale][evento.signo]}`,
    glosa: `${GLOSA_EVENTO[locale][evento.tipo]}.`,
    anguloReal: null,
    orbe: null,
    aplicativo: null,
    contexto: contextoEvento.linhas,
    mencoes: {
      corpos: [...(evento.tipo === "lunacao" || evento.tipo === "eclipse" ? [corpo, "sun" as Corpo] : [corpo]), ...contextoEvento.corpos],
      signos: [evento.signo, ...contextoEvento.signos],
      aspectos: contextoEvento.aspectos,
    },
  }
}

/** O ângulo exato que o aspecto procura, para o texto poder comparar com o real. */
export function anguloNominal(aspecto: string | null): number | null {
  return aspecto ? (ANGULO_ASPECTO[aspecto] ?? null) : null
}

function tituloDoEvento(movimento: Movimento, locale: Locale): string {
  if (movimento.tipo !== "evento") return ""
  const evento = movimento.evento
  const signos = SIGNOS[locale]
  const em = { pt: "em", en: "in", es: "en" }[locale]
  if (evento.tipo === "lunacao") return `${LUNACOES[locale][evento.fase] ?? evento.fase} ${em} ${signos[evento.signo]}`
  if (evento.tipo === "eclipse") {
    const nome = {
      pt: evento.especie === "solar" ? "Eclipse solar" : "Eclipse lunar",
      en: evento.especie === "solar" ? "Solar eclipse" : "Lunar eclipse",
      es: evento.especie === "solar" ? "Eclipse solar" : "Eclipse lunar",
    }[locale]
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
