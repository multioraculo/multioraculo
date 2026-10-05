/**
 * A referência estruturada das runas, uma por runa sorteada.
 *
 * POR QUE ELA EXISTE. A fonte ativa (Thorsson, FUTHARK: A Handbook of Rune
 * Magic) é um manual de magia rúnica: em 282 mil caracteres não há uma única
 * ocorrência de "merkstave", "reversed", "inverted" ou "upside down". As
 * quatro de "reverse" falam do lado de trás de um talismã. A auditoria mediu
 * ainda 96 de 348 trechos contaminados, com 215 menções a runas que não foram
 * sorteadas. Brekke cobre as duas lacunas: ficha por runa e reversão
 * declarada, runa por runa.
 *
 * O QUE ELA NÃO É. Não é tabela de equivalências. Brekke não dá uma regra
 * universal de inversão: para 15 runas ele escreve o sentido invertido
 * específico daquela runa, e para 9 declara que não existe sentido invertido.
 * As 15 reversões não convergem para um único padrão — ausência da qualidade,
 * bloqueio, perda concreta, desequilíbrio e domínio afetado aparecem em
 * proporções diferentes.
 *
 * Thorsson continua entrando, por busca lexical, como camada de runelore:
 * etimologia, ideografia do traço e uso mágico. As duas fontes preenchem
 * campos disjuntos, então não há fusão nem contradição silenciosa.
 */
import type { Locale } from "@/lib/i18n"
import type { Evidence } from "./evidence"
import type { DrawItem } from "./draw"
import { RUNES } from "./draw"
import { RUNAS_FICHAS, RUNAS_FONTE, type FichaDeRuna } from "./runas-fichas"

const POR_ID = new Map<number, FichaDeRuna>(RUNAS_FICHAS.map((f) => [f.id, f]))

/** Quantas das 24 runas têm ficha. 24 é o esperado; o verificador cobra. */
export const RUNAS_COBERTAS = POR_ID.size

/** As que a fonte declara COM sentido invertido. 15 é o esperado. */
export const RUNAS_COM_REVERSAO = RUNAS_FICHAS.filter((f) => f.reversaoNaFonte).map((f) => f.nome)

export function fichaDaRuna(id: number): FichaDeRuna | undefined {
  return POR_ID.get(id)
}

/**
 * A REGRA GERAL DA REVERSÃO, dita UMA VEZ no material do método.
 *
 * Resumo da seção "Reversed Runes" do capítulo 8, mais as duas frases da
 * introdução. Está aqui, e não repetida em cada runa, porque é regra de
 * leitura e não significado de símbolo: continua sendo a ficha de cada runa
 * que diz o que aquela inversão é. Inclui o registro, feito pelo próprio
 * autor, de que a prática é moderna e influenciada pelo tarô.
 */
export const REVERSAO_RUNAS: Record<Locale, string> = {
  pt: "Sobre runas invertidas, segundo a referência: a leitura de runas invertidas é prática moderna, influenciada pelo tarô, e parte dos praticantes não a usa; invertida não equivale automaticamente a presságio ruim, e é outro canal de mensagem, não a versão ruim da runa; pode apontar questão que pede atenção, advertência sobre o que vem se nada for preparado, ou confirmação de que algo está difícil; muitas invertidas numa mesma tiragem pedem olhar a posição de cada uma e investigar por que apareceram assim, em vez de somar desgraça; e de 24 runas, 9 não têm posição invertida — quando caem, são lidas de pé.",
  en: "On reversed runes, per the reference: reading runes reversed is a modern practice influenced by tarot, and some practitioners do not use it at all; reversed does not automatically mean a bad omen, and works as another channel of meaning rather than the bad version of the rune; it can point to an issue needing attention, a warning about what may come if nothing is prepared, or confirmation that something is hard right now; many reversals in one spread call for looking at each one's position and asking why they came up that way, rather than adding up doom; and of the 24 runes, 9 have no reversed position — when they come up, they are read upright.",
  es: "Sobre runas invertidas, según la referencia: leer runas invertidas es práctica moderna, influida por el tarot, y parte de quienes practican no la usa; invertida no equivale automáticamente a mal presagio, y funciona como otro canal de mensaje, no como la versión mala de la runa; puede señalar un asunto que pide atención, una advertencia sobre lo que viene si nada se prepara, o confirmación de que algo está difícil; muchas invertidas en una misma tirada piden mirar la posición de cada una e indagar por qué salieron así, en vez de sumar desgracia; y de 24 runas, 9 no tienen posición invertida — cuando salen, se leen derechas.",
}

const ROTULO: Record<Locale, { invertida: string; semReversao: string }> = {
  pt: { invertida: "invertida", semReversao: "a fonte declara que esta runa não tem posição invertida" },
  en: { invertida: "reversed", semReversao: "the source states this rune has no reversed position" },
  es: { invertida: "invertida", semReversao: "la fuente declara que esta runa no tiene posición invertida" },
}

/** Teto do montador de prompt; o trecho é cortado em fronteira de frase. */
const TETO_DO_TRECHO = 320
const limpa = (s: string) => s.replace(/\s+/g, " ").trim()

function porFrases(texto: string, teto: number): string {
  const t = limpa(texto)
  if (t.length <= teto) return t
  const frases = t.split(/(?<=[.;!?])\s+/).filter(Boolean)
  let saida = frases[0] ?? t
  for (const f of frases.slice(1)) {
    if (saida.length + 1 + f.length > teto) break
    saida += " " + f
  }
  return saida
}
function reparte(base: number, inv: number, total: number): [number, number] {
  if (base + inv <= total) return [base, inv]
  const justo = Math.floor(total / 2)
  if (base < justo) return [base, total - base]
  if (inv < justo) return [total - inv, inv]
  return [justo, total - justo]
}

/** O trecho de uma runa, com cada campo no seu próprio orçamento. */
export function trechoDaRuna(ficha: FichaDeRuna, invertida: boolean, locale: Locale): string {
  const r = ROTULO[locale]
  const base = limpa(`${ficha.keywords.join(", ")}. ${ficha.base}`)
  if (!invertida) return porFrases(base, TETO_DO_TRECHO)
  const prefixo = ` · ${r.invertida}: `
  // runa sem reversão na fonte nunca chega invertida (drawRunes mascara), mas
  // se chegasse, o material diria o que a fonte diz — e não inventaria sentido
  if (!ficha.reversaoNaFonte) {
    const orc = TETO_DO_TRECHO - prefixo.length - r.semReversao.length
    return `${porFrases(base, orc)}${prefixo}${r.semReversao}`
  }
  const inv = limpa(ficha.reversed)
  const [orcBase, orcInv] = reparte(base.length, inv.length, TETO_DO_TRECHO - prefixo.length)
  return `${porFrases(base, orcBase)}${prefixo}${porFrases(inv, orcInv)}`
}

/** Uma entrada por RUNA SORTEADA, na ordem das posições. */
export function referenciaDasRunas(itens: DrawItem[], locale: Locale): Evidence[] {
  const saida: Evidence[] = []
  itens.forEach((item, i) => {
    const sym = item.sym as { kind: "rune"; index: number; reversed: boolean }
    if (sym?.kind !== "rune") return
    const ficha = fichaDaRuna(sym.index)
    if (!ficha) return
    saida.push({
      source: `${RUNAS_FONTE}, p. ${ficha.pagina}`,
      excerpt: trechoDaRuna(ficha, sym.reversed, locale),
      itemIndex: i,
    })
  })
  return saida
}

/** Conferência de coerência entre o motor e as fichas; usada pelo verificador. */
export function divergenciasEntreMotorEFichas(): string[] {
  const out: string[] = []
  RUNES.forEach((r, i) => {
    const f = fichaDaRuna(i)
    if (!f) { out.push(`${r.name}: sem ficha`); return }
    if (f.nome !== r.name) out.push(`id ${i}: motor diz "${r.name}", ficha diz "${f.nome}"`)
    if (f.reversaoNaFonte !== r.reversaoNaFonte) out.push(`${r.name}: motor reversaoNaFonte=${r.reversaoNaFonte}, ficha=${f.reversaoNaFonte}`)
  })
  return out
}
