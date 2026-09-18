/**
 * A linha gravada do horóscopo, conferida antes de virar tela.
 *
 * O cache guarda `leitura` e `cards` como JSON, e JSON não carrega tipo: o que
 * volta do banco é `unknown` com aparência de objeto. Enquanto isso foi um
 * cast, uma linha escrita por uma versão anterior do formato chegava inteira
 * na renderização e quebrava a página no primeiro campo que já não existia.
 * Não é hipótese: quando `relacoes[].polaridade` virou `relacoes[].termos`,
 * todo signo com leitura em cache naquele dia ficou com a tela quebrada, e a
 * correção foi apagar a tabela na mão.
 *
 * A regra agora é uma só, e não depende de ninguém lembrar de nada no dia do
 * deploy: linha no formato de hoje é usada, linha em qualquer outro formato é
 * tratada como ausente, e o fluxo normal gera de novo por cima.
 *
 * A conferência é ESTRUTURAL, não editorial. O verificador julga se o texto
 * pode existir; isto aqui só pergunta se os campos que a tela vai ler estão
 * lá e são do tipo certo. Reprovar por regra de estilo nova invalidaria
 * leituras boas e cobraria uma geração por causa de uma vírgula.
 *
 * O que é conferido é a superfície inteira dos dois tipos, e não só os campos
 * que quebram hoje. Um campo que a tela ainda não lê é um campo que ela pode
 * passar a ler amanhã, e aí a linha velha voltaria a quebrar.
 */
import { type CardMovimento, type FormaCard, type LadoCard } from "./apresentar"
import { ORIGENS, type Leitura, type RelacaoEscrita, type TermoEscrito } from "./prompt-horoscopo"
import { termosEsperados } from "./verificador"

const ehTexto = (v: unknown): v is string => typeof v === "string"
const ehNumero = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)
const ehBooleano = (v: unknown): v is boolean => typeof v === "boolean"
const ehObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v)

/** Campo opcional do tipo: nulo passa, ausente não. */
function nuloOu<T>(v: unknown, eh: (x: unknown) => x is T): boolean {
  return v === null || eh(v)
}

function listaDe<T>(v: unknown, eh: (x: unknown) => x is T): v is T[] {
  return Array.isArray(v) && v.every(eh)
}

const FORMAS: readonly FormaCard[] = ["contraste", "articulacao", "convergencia", "posicao"]
const TIPOS: readonly CardMovimento["tipo"][] = ["aspecto", "posicao", "evento"]

function ehLado(v: unknown): v is LadoCard {
  if (!ehObjeto(v)) return false
  return (
    ehTexto(v.corpo) &&
    ehTexto(v.nome) &&
    ehTexto(v.funcoes) &&
    listaDe(v.verbos, ehTexto) &&
    ehBooleano(v.regente) &&
    nuloOu(v.rotuloRegente, ehTexto) &&
    ehNumero(v.signo) &&
    ehTexto(v.nomeSigno) &&
    ehTexto(v.campo) &&
    ehNumero(v.grau) &&
    ehTexto(v.grauTexto) &&
    ehBooleano(v.retrogrado)
  )
}

function ehCard(v: unknown): v is CardMovimento {
  if (!ehObjeto(v)) return false
  const m = v.mencoes
  if (!ehObjeto(m)) return false
  return (
    ehTexto(v.id) &&
    ehTexto(v.tipo) &&
    (TIPOS as readonly string[]).includes(v.tipo) &&
    ehTexto(v.forma) &&
    (FORMAS as readonly string[]).includes(v.forma) &&
    ehLado(v.a) &&
    (v.b === null || ehLado(v.b)) &&
    nuloOu(v.aspecto, ehTexto) &&
    nuloOu(v.simbolo, ehTexto) &&
    ehTexto(v.titulo) &&
    nuloOu(v.tituloSemSigno, ehTexto) &&
    ehTexto(v.detalhe) &&
    ehTexto(v.glosa) &&
    nuloOu(v.anguloReal, ehNumero) &&
    nuloOu(v.orbe, ehNumero) &&
    nuloOu(v.aplicativo, ehBooleano) &&
    listaDe(v.contexto, ehTexto) &&
    listaDe(m.corpos, ehTexto) &&
    listaDe(m.signos, ehNumero) &&
    listaDe(m.aspectos, ehTexto)
  )
}

function ehTermo(v: unknown): v is TermoEscrito {
  return ehObjeto(v) && ehTexto(v.texto) && ehTexto(v.origem) && (ORIGENS as readonly string[]).includes(v.origem)
}

/**
 * A relação conferida contra o card que ela explica.
 *
 * A quantidade de termos vem de `termosEsperados`, a mesma função que o
 * verificador usa ao gravar, e não de uma cópia da regra: duas cópias
 * acabariam discordando, e a que discordasse aqui recusaria linha boa.
 *
 * `n` é conferido contra a posição porque é assim que a tela lê: ela percorre
 * os cards e pega `relacoes[i]`. Se a ordem gravada não for essa, cada card
 * recebe a explicação de outro, e nada nisso levanta erro.
 */
function ehRelacao(v: unknown, card: CardMovimento, posicao: number): v is RelacaoEscrita {
  if (!ehObjeto(v)) return false
  if (v.n !== posicao + 1) return false
  if (!ehTexto(v.explicacao)) return false
  if (!listaDe(v.termos, ehTermo)) return false
  return v.termos.length === termosEsperados(card)
}

export type LinhaGravada = { leitura: Leitura; cards: CardMovimento[] }

/**
 * A linha do banco, se ela estiver no formato de hoje. Nula em qualquer outro
 * caso, e quem chama trata nula como "não existe leitura gravada".
 */
export function lerLinhaGravada(bruto: { leitura: unknown; cards: unknown }): LinhaGravada | null {
  const cards = bruto.cards
  if (!Array.isArray(cards) || cards.length === 0 || !cards.every(ehCard)) return null

  const leitura = bruto.leitura
  if (!ehObjeto(leitura)) return null
  if (!ehTexto(leitura.foco) || leitura.foco.trim() === "") return null

  const relacoes = leitura.relacoes
  if (!Array.isArray(relacoes)) return null
  // uma relação por card: a tela casa as duas listas por posição
  if (relacoes.length !== cards.length) return null
  if (!relacoes.every((r, i) => ehRelacao(r, cards[i], i))) return null

  return {
    leitura: { foco: leitura.foco, relacoes: relacoes as RelacaoEscrita[] },
    cards: cards as CardMovimento[],
  }
}
