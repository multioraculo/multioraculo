/**
 * A referência estruturada do Lenormand, na estrutura que a fonte tem.
 *
 * DUAS CAMADAS, porque a fonte tem duas. Caitlín Matthews, cap. 2 ("Lenormand
 * Lexicon"), traz uma ficha individual para as 36 cartas (`General`, `Effect`,
 * listas de palavras) e, depois do rótulo `Combinations:`, as combinações entre
 * cartas. A primeira camada é a BASE: 9 de 9 cartas sorteadas têm ficha, sempre.
 * A segunda é EVIDÊNCIA RELACIONAL ADICIONAL, e só aparece quando a fonte de
 * fato glosa aquela combinação naquela direção.
 *
 * POR QUE SUBSTITUI A BUSCA LEXICAL. Medido nas 40 leituras do baseline: o
 * trecho lexical de `lenormand_handbook.pdf` traz 79% de trechos citando carta
 * que não foi sorteada, 1.156 ocorrências, 3,2 por trecho. É estrutural, não
 * acidente: o léxico e as seções `Combinations` nomeiam outras cartas por
 * projeto, e qualquer janela de texto do livro arrasta cartas alheias à mesa.
 *
 * O MÉTODO É O DO LIVRO. "Spread 6: The Portrait" (p. 193-194) é a nossa mesa
 * 3x3, e o livro prescreve o que se lê nela: colunas (passado, presente,
 * futuro), linhas, cantos, diamante e flechas, com a carta 5 como foco da
 * questão e a carta 1 como aquilo que a provocou. Knighting e Mirroring
 * (p. 198-202) existem, mas o próprio livro os chama de opcionais ("don't have
 * to be used every time") e ficam fora deste MVP.
 *
 * O CATÁLOGO É ESPARSO E ISSO NÃO É HIERARQUIA. Só cerca de 14% das relações da
 * mesa têm glosa explícita. Um par glosado não é uma relação "mais forte": é
 * apenas uma relação com documentação mais específica. O rótulo do bloco diz
 * isso ao modelo com todas as letras.
 */
import type { Locale } from "@/lib/i18n"
import type { Evidence } from "./evidence"
import type { DrawItem } from "./draw"
import { LENORMAND_DECK } from "./draw"
import { LENORMAND_FICHAS, LENORMAND_FONTE, type FichaLenormand } from "./lenormand-fichas"
import { LENORMAND_COMBINACOES, type CombinacaoLenormand } from "./lenormand-combinacoes"

// ── aliases ──────────────────────────────────────────────────────────────────

/**
 * O livro grafa duas cartas com outro nome que o nosso baralho. Resolvido AQUI,
 * na camada de referência: nem `LENORMAND_DECK` nem a ficha gerada são tocados,
 * e o vínculo continua sendo o ÍNDICE da carta, nunca uma aproximação de texto.
 */
export const ALIASES_DO_LIVRO: Record<number, { noLivro: string; noBaralho: string }> = {
  10: { noLivro: "Rod", noBaralho: "Whip" },
  21: { noLivro: "Paths", noBaralho: "Crossroads" },
}

// ── direção da arte (os casos L/R) ───────────────────────────────────────────

/**
 * Duas cartas do baralho têm, no livro, um sentido que depende de para que lado
 * a arte aponta, e o livro marca isso com L ou R depois do nome:
 *
 *   Nuvens — p. 71: "I shall be placing an L or R after each definition to
 *            indicate that the dark clouds are on the left or right side."
 *   Foice  — p. 159: "I have put Scythe L for when it faces left and Scythe R
 *            for the blade facing right."
 *
 * A NOSSA ARTE FOI MEDIDA, não suposta (`scripts/verify-lenormand.ts` refaz a
 * medição a cada build, sobre os PNGs de `public/lenormand/`):
 *
 *   clouds.png — 64,5% da tinta na metade esquerda contra 35,5% na direita:
 *                a massa escura, com o rosto, está à ESQUERDA  -> L
 *   scythe.png — centro horizontal da tinta a 0,572 no terço superior (a lâmina)
 *                contra 0,382 no terço inferior (o cabo): a lâmina sai para a
 *                DIREITA  -> R
 *
 * Isso não é inversão de carta e não toca o sorteio: é uma propriedade fixa da
 * arte. As entradas do catálogo com o qualificador contrário (Nuvens R, Foice L)
 * são descartadas, porque descrevem outro baralho.
 */
export const DIRECAO_DA_ARTE: Record<number, "L" | "R"> = {
  5: "L", // Nuvens / Clouds
  9: "R", // Foice / Scythe
}

/** A combinação vale para a NOSSA arte? Sem qualificador, vale sempre. */
export function valeParaNossaArte(c: CombinacaoLenormand): boolean {
  return c.qualificadores.every((q, i) => !q || DIRECAO_DA_ARTE[c.cartas[i]] === q)
}

// ── as relações posicionais do Portrait Spread ───────────────────────────────

/**
 * As 28 relações do conjunto adotado, em posições 1–9 da mesa:
 *
 *     1 2 3
 *     4 5 6
 *     7 8 9
 *
 * Cada uma é DIRIGIDA, na ordem em que o livro lê a sequência, porque a ordem é
 * o sentido: "When Fox comes before a card, it will affect what follows more
 * severely, so Fox + Fish means that something is seriously up with your money,
 * whereas Fish + Fox is saying you received the wrong change" (ficha da Raposa).
 *
 * As sequências de p. 194 entram pelos seus pares CONSECUTIVOS. A flecha que o
 * livro imprime como "7 + 2 + 3" é lida aqui como 7-2-9 porque o exemplo
 * trabalhado da mesma página a resolve assim: "The arrows: Paths + Moon + Snake"
 * são, naquela mesa, as posições 7, 2 e 9. É correção de OCR com evidência, não
 * conveniência geométrica.
 */
const SEQUENCIAS: Array<{ pos: number[]; origem: string }> = [
  { pos: [1, 4, 7], origem: "p194 coluna do passado" },
  { pos: [2, 5, 8], origem: "p194 coluna do presente" },
  { pos: [3, 6, 9], origem: "p194 coluna do futuro" },
  { pos: [1, 2, 3], origem: "p194 linha" },
  { pos: [4, 5, 6], origem: "p194 linha" },
  { pos: [7, 8, 9], origem: "p194 linha" },
  { pos: [1, 9, 3, 7], origem: "p194 cantos" },
  { pos: [2, 4, 6, 8], origem: "p194 diamante" },
  { pos: [1, 8, 3], origem: "p194 flecha" },
  { pos: [7, 2, 9], origem: "p194 flecha (exemplo p196)" },
]

/**
 * A carta central lida com cada uma das oito ao redor (p. 193: "read every card
 * surrounding it with it as a pair"). A direção vai do CENTRO para fora: a
 * posição 5 é o foco da questão e é ela que tinge o que a rodeia. Duas dessas
 * oito (5->6 e 5->8) já vêm das sequências de p. 194 e não são contadas duas
 * vezes.
 */
const DO_CENTRO = [1, 2, 3, 4, 6, 7, 8, 9].map((p) => ({ pos: [5, p], origem: "p193 par com a carta central" }))

export type RelacaoPosicional = { de: number; para: number; origem: string }

export const RELACOES_DA_MESA: RelacaoPosicional[] = (() => {
  const saida: RelacaoPosicional[] = []
  const vistas = new Set<string>()
  for (const s of [...SEQUENCIAS, ...DO_CENTRO]) {
    for (let i = 0; i + 1 < s.pos.length; i++) {
      const chave = `${s.pos[i]}>${s.pos[i + 1]}`
      if (vistas.has(chave)) continue
      vistas.add(chave)
      saida.push({ de: s.pos[i], para: s.pos[i + 1], origem: s.origem })
    }
  }
  return saida
})()

// ── catálogo, indexado por par dirigido ──────────────────────────────────────

const POR_PAR = new Map<string, CombinacaoLenormand>()
for (const c of LENORMAND_COMBINACOES) {
  if (c.cartas.length !== 2) continue // trios e mais ficam guardados, mas não entram no MVP
  if (!valeParaNossaArte(c)) continue
  const chave = `${c.cartas[0]}>${c.cartas[1]}`
  if (!POR_PAR.has(chave)) POR_PAR.set(chave, c)
}

/** Quantos pares dirigidos deste baralho o catálogo tem. */
export const PARES_DIRIGIDOS = POR_PAR.size
/** Quantas cartas têm ficha individual. 36 é o esperado. */
export const FICHAS_COBERTAS = LENORMAND_FICHAS.length

const POR_INDICE = new Map<number, FichaLenormand>(LENORMAND_FICHAS.map((f) => [f.indice, f]))

export function fichaDaCartaLenormand(indice: number): FichaLenormand | undefined {
  return POR_INDICE.get(indice)
}

export function combinacaoDirigida(a: number, b: number): CombinacaoLenormand | undefined {
  return POR_PAR.get(`${a}>${b}`)
}

// ── montagem das entradas ────────────────────────────────────────────────────

const TETO_DO_TRECHO = 320
const limpa = (s: string) => s.replace(/\s+/g, " ").trim()

/** Corta no fim de frase, nunca no meio de uma palavra. */
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

/**
 * O rótulo do bloco vai no `source`, NÃO no texto.
 *
 * O prompt corta o `excerpt` em 320 caracteres e deixa o `source` inteiro. Pôr o
 * rótulo no texto gastava 76 dos 320 e espremia as glosas; no `source` ele vem
 * completo e os 320 ficam todos para o que a fonte efetivamente diz. A ressalva
 * de que ter glosa não torna a relação mais importante é dita uma vez no método
 * (`METODO_LENORMAND`), que também não passa pelo corte.
 */
const ROTULO: Record<Locale, string> = {
  pt: "relações da mesa, combinações documentadas em",
  en: "spread relations, combinations documented in",
  es: "relaciones de la mesa, combinaciones documentadas en",
}

/** O nome da carta como o LIVRO a grafa — é dele a glosa, em inglês. */
function nomeNoLivro(indice: number): string {
  return POR_INDICE.get(indice)?.nomeFonte ?? LENORMAND_DECK[indice].en
}

/**
 * Encurta uma glosa sem partir palavra.
 *
 * A glosa da fonte é uma lista de locuções separadas por ponto e vírgula
 * ("Taking advantage of the gift; a stealthy gift; surprisingly cunning"), então
 * o corte natural é nessa separação: sobram locuções inteiras. Se nem a primeira
 * couber, corta no último espaço — nunca no meio de uma palavra.
 */
function porLocucoes(glosa: string, teto: number): string {
  const t = limpa(glosa)
  if (t.length <= teto) return t
  const partes = t.split(/;\s*/).filter(Boolean)
  let saida = ""
  for (const p of partes) {
    const candidata = saida ? `${saida}; ${p}` : p
    if (candidata.length > teto) break
    saida = candidata
  }
  if (!saida) {
    const corte = t.lastIndexOf(" ", Math.max(0, teto))
    saida = corte > 0 ? t.slice(0, corte) : t.slice(0, Math.max(0, teto))
  }
  return saida.replace(/[;,.\s]+$/, "")
}

/** Reparte o que sobra do teto igualmente entre as glosas, sem desperdiçar. */
function reparte(tamanhos: number[], disponivel: number): number[] {
  const n = tamanhos.length
  if (!n) return []
  const cota = new Array<number>(n).fill(0)
  let sobra = disponivel
  let vivos = tamanhos.map((_, i) => i)
  while (vivos.length && sobra > 0) {
    const fatia = Math.floor(sobra / vivos.length)
    if (fatia <= 0) break
    const proximos: number[] = []
    for (const i of vivos) {
      const quer = tamanhos[i] - cota[i]
      const da = Math.min(quer, fatia)
      cota[i] += da
      sobra -= da
      if (cota[i] < tamanhos[i]) proximos.push(i)
    }
    if (proximos.length === vivos.length && proximos.every((i) => cota[i] === 0)) break
    vivos = proximos
  }
  return cota
}

/**
 * Uma entrada por CARTA SORTEADA, mais UM bloco com todas as relações da mesa
 * que a fonte documenta.
 *
 * SÃO 10 ENTRADAS NO MÁXIMO, de propósito: 9 fichas e 1 bloco. O teto de
 * `synthesis-cbase-min.ts` é 10 para os quatro oráculos que não são o tarô, e
 * juntar as combinações num bloco só é o que permite entregá-las todas sem
 * mexer num prompt congelado.
 */
export function referenciaDoLenormand(itens: DrawItem[], locale: Locale): Evidence[] {
  const r = ROTULO[locale]
  const cartas = itens.map((it) => (it.sym as { kind: "lenormand"; card: number }).card)
  const saida: Evidence[] = []

  // camada 1: a ficha individual, uma por carta sorteada
  itens.forEach((_, i) => {
    const f = POR_INDICE.get(cartas[i])
    if (!f) return
    // `Timing` e `Lenormand Universe` nunca vão ao modelo: o primeiro é previsão
    // de data e o segundo, nas palavras da autora, "a nontraditional, mythic
    // title ... from my own practice".
    const partes = [`${f.nomeFonte}: ${f.geral}`]
    if (f.efeito) partes.push(`Effect: ${f.efeito}${f.efeitoNota ? ` (${f.efeitoNota})` : ""}.`)
    saida.push({
      source: `${LENORMAND_FONTE}, p. ${f.pagina}`,
      excerpt: porFrases(partes.join(" "), TETO_DO_TRECHO),
      itemIndex: i,
    })
  })

  // camada 2: as relações da mesa, num bloco só
  const achadas = RELACOES_DA_MESA.map((rel) => {
    const a = cartas[rel.de - 1]
    const b = cartas[rel.para - 1]
    const c = combinacaoDirigida(a, b)
    return c ? { rel, c } : null
  }).filter((x): x is { rel: RelacaoPosicional; c: CombinacaoLenormand } => x !== null)

  if (achadas.length) {
    // o prefixo é só o par de POSIÇÕES: o nome das cartas já está na lista de
    // itens do prompt, e repeti-lo aqui custaria ~22 caracteres por relação de
    // um orçamento de 320 que precisa caber até nove relações
    const prefixos = achadas.map(({ rel }) => `${rel.de}→${rel.para} `)
    const glosas = achadas.map(({ c }) => limpa(c.glosa))
    const separador = " · "
    const fixo = prefixos.reduce((s, p) => s + p.length, 0) + separador.length * (achadas.length - 1)
    const disponivel = Math.max(0, TETO_DO_TRECHO - fixo)
    // CADA GLOSA GANHA PRIMEIRO A SUA LOCUÇÃO INICIAL, e só o que sobra é
    // repartido. Sem isso, um rateio igual podia dar 33 caracteres a uma glosa
    // de 38 e entregar "A book in public domain or out of" — fragmento pendurado
    // que não é o que a fonte diz. Só quando nem os mínimos cabem é que o
    // rateio volta a ser puramente proporcional.
    const minimos = glosas.map((g) => (g.split(/;\s*/)[0] ?? g).length)
    const somaMin = minimos.reduce((s, m) => s + m, 0)
    const cotas = somaMin <= disponivel
      ? reparte(glosas.map((g, i) => g.length - minimos[i]), disponivel - somaMin).map((extra, i) => minimos[i] + extra)
      : reparte(glosas.map((g) => g.length), disponivel)
    const corpo = achadas
      .map((_, i) => prefixos[i] + porLocucoes(glosas[i], cotas[i]))
      .join(separador)
    const paginas = [...new Set(achadas.map(({ c }) => c.pagina))].sort((x, y) => x - y)
    saida.push({
      source: `${r} ${LENORMAND_FONTE}, p. ${paginas.join(", ")}`,
      // o bloco fala da mesa inteira; fica ancorado na carta central, que é o
      // foco da questão segundo a fonte
      excerpt: limpa(corpo),
      itemIndex: 4,
    })
  }

  return saida
}

/** Coerência entre as fichas, o catálogo e a tabela do motor. */
export function divergenciasLenormand(): string[] {
  const out: string[] = []
  for (let i = 0; i < 36; i++) {
    const f = POR_INDICE.get(i)
    if (!f) { out.push(`carta ${i + 1}: sem ficha`); continue }
    const nosso = LENORMAND_DECK[i].en
    const alias = ALIASES_DO_LIVRO[i]
    if (alias) {
      if (alias.noLivro !== f.nomeFonte || alias.noBaralho !== nosso) {
        out.push(`carta ${i + 1}: alias declarado ${alias.noLivro}/${alias.noBaralho}, encontrado ${f.nomeFonte}/${nosso}`)
      }
    } else if (f.nomeFonte !== nosso) {
      out.push(`carta ${i + 1}: ficha diz "${f.nomeFonte}", baralho diz "${nosso}" e não há alias declarado`)
    }
  }
  for (const c of LENORMAND_COMBINACOES) {
    if (c.cartas.some((x) => x < 0 || x > 35)) out.push(`combinação p${c.pagina}: índice de carta fora de 0–35`)
    c.qualificadores.forEach((q, i) => {
      if (q && DIRECAO_DA_ARTE[c.cartas[i]] === undefined) {
        out.push(`combinação p${c.pagina}: qualificador "${q}" numa carta sem direção de arte declarada`)
      }
    })
  }
  return out
}

/**
 * A estrutura da mesa, dita ao modelo. Só o que a fonte sustenta: as três
 * colunas, a carta 5 e a carta 1. Nada de nove rótulos inventados.
 *
 * A última frase existe porque "futuro" aqui é NOME DE COLUNA, não licença para
 * prever fato: os guardrails de não fatalismo do prompt continuam valendo.
 */
export const METODO_LENORMAND: Record<Locale, string> = {
  pt: "Mesa de 9 cartas (Portrait Spread, 3×3), sem inversões. Segundo a fonte: carta 5 é o foco da questão; carta 1 é o que provocou a questão; as colunas são passado (1,4,7), presente (2,5,8) e futuro (3,6,9). Lêem-se linhas, colunas, cantos (1-9-3-7), diamante (2-4-6-8) e flechas (1-8-3 e 7-2-9). Os nomes das colunas são estrutura da mesa, não previsão de acontecimento. A fonte glosa só uma parte das combinações possíveis: uma relação ter combinação documentada não a torna mais importante que as outras, apenas mais documentada.",
  en: "Nine-card spread (Portrait Spread, 3×3), no reversals. Per the source: card 5 is the focus of the issue; card 1 is what provoked it; the columns are past (1,4,7), present (2,5,8) and future (3,6,9). Rows, columns, corners (1-9-3-7), the diamond (2-4-6-8) and the arrows (1-8-3 and 7-2-9) are read. The column names are the structure of the spread, not a prediction of events. The source glosses only some of the possible combinations: a relation having a documented combination does not make it more important than the others, only better documented.",
  es: "Mesa de 9 cartas (Portrait Spread, 3×3), sin inversiones. Según la fuente: la carta 5 es el foco de la cuestión; la carta 1 es lo que la provocó; las columnas son pasado (1,4,7), presente (2,5,8) y futuro (3,6,9). Se leen filas, columnas, esquinas (1-9-3-7), el diamante (2-4-6-8) y las flechas (1-8-3 y 7-2-9). Los nombres de las columnas son la estructura de la mesa, no una predicción de hechos. La fuente glosa solo una parte de las combinaciones posibles: que una relación tenga combinación documentada no la vuelve más importante que las demás, solo mejor documentada.",
}
