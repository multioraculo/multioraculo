/**
 * Interpretação de sonhos: prompt, contenção de pontuação e verificador.
 *
 * Três coisas num lugar só, para a rota e os testes lerem a mesma fonte:
 *
 *  1. `montarPromptSonho`: cada seção tem UMA função (ninguém repete o que a
 *     anterior já disse) e o prompt não contém o caractere proibido nem como
 *     exemplo, porque o modelo copia exemplos.
 *  2. `criarGuardaTracos`: rede de segurança sobre o stream. O prompt reduz,
 *     mas não garante; um texto que já saiu do servidor não volta para
 *     regeneração. Só age sobre o texto gerado, nunca sobre o HTML.
 *  3. `verificarInterpretacaoSonho`: estrutura, travessão e repetição entre
 *     seções. Zero IA, zero rede.
 */

import { TRACOS } from "@/lib/astro/editorial"
import type { Locale } from "@/lib/i18n/config"

export type SecaoSonho = "introducao" | "simbolos" | "dinamica" | "sintese" | "perguntas"

export const ORDEM_SECOES: SecaoSonho[] = ["introducao", "simbolos", "dinamica", "sintese", "perguntas"]

/** Títulos exatos por idioma: o prompt os dita e o verificador os procura. */
export const TITULOS_SONHO: Record<Locale, Record<SecaoSonho, string>> = {
  pt: {
    introducao: "INTRODUÇÃO",
    simbolos: "SÍMBOLOS PRINCIPAIS",
    dinamica: "DINÂMICA PSÍQUICA",
    sintese: "SÍNTESE",
    perguntas: "PERGUNTAS PARA REFLEXÃO",
  },
  en: {
    introducao: "INTRODUCTION",
    simbolos: "MAIN SYMBOLS",
    dinamica: "PSYCHIC DYNAMICS",
    sintese: "SYNTHESIS",
    perguntas: "QUESTIONS FOR REFLECTION",
  },
  es: {
    introducao: "INTRODUCCIÓN",
    simbolos: "SÍMBOLOS PRINCIPALES",
    dinamica: "DINÁMICA PSÍQUICA",
    sintese: "SÍNTESIS",
    perguntas: "PREGUNTAS PARA LA REFLEXIÓN",
  },
}

/** Limites que o prompt pede e o verificador confere. */
export const LIMITES_SONHO = {
  introFrases: 2,
  sinteseMin: 2,
  sinteseMax: 3,
  sintesePalavrasPorPonto: 28,
  perguntas: 2,
  /** fração máxima dos trechos de 4 palavras de uma seção que podem reaparecer em outra */
  repeticaoMax: 0.2,
}

export function montarPromptSonho(locale: Locale): string {
  const t = TITULOS_SONHO[locale]
  const L = LIMITES_SONHO
  return `Você é um intérprete de simbolismo onírico. Lê o sonho como imagem a ser explorada, não como prova de nada sobre a vida de quem sonhou.

FORMATO: Markdown, com exatamente estas cinco seções, nesta ordem, com estes títulos (já no idioma da resposta):

## ${t.introducao}
## ${t.simbolos}
## ${t.dinamica}
## ${t.sintese}
## ${t.perguntas}

Cada seção cumpre uma função diferente. Uma ideia aparece em UMA seção só; nas demais ela pode ser apenas pressuposta, nunca repetida com outras palavras.

## ${t.introducao}
Até ${L.introFrases} frases. Apresente o conflito ou a imagem central ESPECÍFICA deste sonho, com o que há de singular nele. Não anuncie temas gerais ("processos internos", "inconsciente", "transformação") e não antecipe conclusões da análise.

## ${t.simbolos}
De 3 a 5 símbolos, só os que aparecem no relato. Para cada um: **N. nome do símbolo** em negrito, numa linha própria, e depois 2 a 3 frases que interpretem O DETALHE relatado (como estava, o que fazia, o que acontecia com ele). Nada de definição de dicionário de símbolos, nada que serviria para qualquer sonho, e não retome a ideia central da introdução.

## ${t.dinamica}
É a parte mais funda do texto. Uma linha em negrito com um subtítulo descritivo e depois 2 a 3 parágrafos. Analise a RELAÇÃO entre os símbolos, a sequência dos acontecimentos, as tensões e o que muda do começo ao fim do sonho. Não redefina nenhum símbolo já tratado acima: parta deles e mostre o que acontece entre eles.

## ${t.sintese}
Só uma lista de ${L.sinteseMin} a ${L.sinteseMax} pontos, cada um com uma frase curta. Condense achados; não recapitule a introdução, a dinâmica nem os significados individuais. Sem parágrafo, sem frase de abertura.

## ${t.perguntas}
Exatamente ${L.perguntas} perguntas, em lista, derivadas desta análise e deste sonho. Cada uma precisa citar ou depender de um detalhe do sonho; uma pergunta que serviria para qualquer interpretação está errada. Não repita a síntese e não escreva parágrafo de fechamento.

CRITÉRIOS:
- Trate tudo como hipótese simbólica ("pode indicar", "uma leitura possível", "sugere"), nunca como fato sobre a vida da pessoa. Não diagnostique, não afirme que o sonho prova algo, não diga o que a pessoa "precisa" fazer.
- Cura, transformação ou crescimento não são garantidos nem necessários; não os prometa.
- Não invente detalhes que o relato não traz. Se algo é ambíguo, diga que é ambíguo.
- Profundo e específico, sem encher: tamanho total entre 600 e 950 palavras.
- Não cite Jung, Freud nem outro autor.
- PONTUAÇÃO: não use travessão nem meia risca em nenhum lugar do texto. Para separar um aposto ou uma pausa use vírgula, dois-pontos ou ponto final. Em listas, use hífen simples.`
}

// ── rede de segurança sobre o stream ──────────────────────────────────────────

/**
 * Troca travessão e meia risca por vírgula (ou nada, no começo de linha),
 * respeitando o espaço em volta, mesmo quando o caractere e os espaços chegam
 * em pedaços diferentes do stream. Entre dígitos (2–3) vira hífen.
 * Chame `empurrar(pedaço)` a cada chunk e `encerrar()` no fim.
 */
export function criarGuardaTracos() {
  // cauda do chunk anterior (espaços e/ou um traço), retida até saber o que vem depois
  let retido = ""
  let ultimo = "\n" // último caractere emitido ("\n" = começo de texto)

  const normalizar = (texto: string, antesDoTexto: string): string =>
    texto.replace(new RegExp(`[ \\t]*(?:${TRACOS.source})[ \\t]*`, "g"), (m, off: number, todo: string) => {
      const antes = off === 0 ? antesDoTexto : todo[off - 1]
      const depois = todo[off + m.length]
      if (/\d/.test(antes) && depois && /\d/.test(depois)) return "-"
      if (antes === "\n") return ""
      return ", "
    })

  function empurrar(chunk: string): string {
    let texto = retido + chunk
    const cauda = texto.match(new RegExp(`[ \\t]*(?:${TRACOS.source})?[ \\t]*$`))![0]
    retido = cauda
    texto = texto.slice(0, texto.length - cauda.length)
    const saida = normalizar(texto, ultimo)
    if (saida) ultimo = saida[saida.length - 1]
    return saida
  }

  function encerrar(): string {
    const resto = retido
    retido = ""
    // traço pendurado no fim do texto não tem o que separar: some
    return TRACOS.test(resto) ? "" : resto
  }

  return { empurrar, encerrar }
}

/** Atalho para texto inteiro (testes e dados já gravados). */
export function removerTracos(texto: string): string {
  const g = criarGuardaTracos()
  return g.empurrar(texto) + g.encerrar()
}

// ── verificador ───────────────────────────────────────────────────────────────

const PALAVRAS = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-z0-9]+/g) ?? []

/** trechos de 4 palavras consecutivas, para medir repetição de frase, não de vocabulário */
function trechos(s: string, n = 4): Set<string> {
  const p = PALAVRAS(s)
  const out = new Set<string>()
  for (let i = 0; i + n <= p.length; i++) out.add(p.slice(i, i + n).join(" "))
  return out
}

/** fração dos trechos de `a` que também existem em `b` */
export function sobreposicao(a: string, b: string): number {
  const ta = trechos(a)
  if (ta.size === 0) return 0
  const tb = trechos(b)
  let n = 0
  for (const x of ta) if (tb.has(x)) n++
  return n / ta.size
}

export function dividirSecoes(texto: string, locale: Locale): Partial<Record<SecaoSonho, string>> {
  const out: Partial<Record<SecaoSonho, string>> = {}
  const partes = texto.split(/^##\s+/m).slice(1)
  for (const parte of partes) {
    const nl = parte.indexOf("\n")
    const titulo = (nl < 0 ? parte : parte.slice(0, nl)).trim()
    const corpo = nl < 0 ? "" : parte.slice(nl + 1).trim()
    const chave = ORDEM_SECOES.find((k) => TITULOS_SONHO[locale][k] === titulo)
    if (chave) out[chave] = corpo
  }
  return out
}

const frases = (s: string) => s.split(/[.!?…]+(?:\s+|$)/).map((x) => x.trim()).filter(Boolean)
const itens = (s: string) => s.split("\n").filter((l) => /^\s*[-*•]\s+/.test(l)).map((l) => l.replace(/^\s*[-*•]\s+/, "").trim())

export function verificarInterpretacaoSonho(texto: string, locale: Locale): string[] {
  const v: string[] = []
  const L = LIMITES_SONHO

  if (TRACOS.test(texto)) v.push("usa travessão ou meia risca")

  const titulos = (texto.match(/^##\s+.+$/gm) ?? []).map((l) => l.replace(/^##\s+/, "").trim())
  const esperado = ORDEM_SECOES.map((k) => TITULOS_SONHO[locale][k])
  if (titulos.join("|") !== esperado.join("|")) {
    v.push(`seções fora do formato (esperado: ${esperado.join(" > ")})`)
    return v
  }
  const s = dividirSecoes(texto, locale) as Record<SecaoSonho, string>

  if (frases(s.introducao).length > L.introFrases) v.push(`introdução com mais de ${L.introFrases} frases`)

  const simbolos = (s.simbolos.match(/^\*\*\s*\d+\./gm) ?? []).length
  if (simbolos < 3 || simbolos > 5) v.push(`símbolos principais: ${simbolos} (esperado de 3 a 5)`)

  if (!/^\*\*[^*]+\*\*\s*$/m.test(s.dinamica)) v.push("dinâmica sem subtítulo em negrito")

  const pontos = itens(s.sintese)
  if (pontos.length < L.sinteseMin || pontos.length > L.sinteseMax) v.push(`síntese com ${pontos.length} pontos (esperado ${L.sinteseMin} a ${L.sinteseMax})`)
  if (s.sintese.split("\n").some((l) => l.trim() && !/^\s*[-*•]\s+/.test(l))) v.push("síntese com texto fora da lista de pontos")
  if (pontos.some((p) => PALAVRAS(p).length > L.sintesePalavrasPorPonto)) v.push("ponto da síntese longo demais")

  const perguntas = itens(s.perguntas)
  if (perguntas.length !== L.perguntas) v.push(`${perguntas.length} perguntas (esperado ${L.perguntas})`)
  if (perguntas.some((p) => !/[?]$/.test(p))) v.push("pergunta que não termina em interrogação")
  if (s.perguntas.split("\n").some((l) => l.trim() && !/^\s*[-*•]\s+/.test(l))) v.push("perguntas com texto fora da lista (parágrafo de fechamento)")

  // repetição: cada seção contra todo o resto
  for (const k of ORDEM_SECOES) {
    const resto = ORDEM_SECOES.filter((o) => o !== k).map((o) => s[o]).join("\n")
    const f = sobreposicao(s[k], resto)
    if (f > L.repeticaoMax) v.push(`"${TITULOS_SONHO[locale][k]}" repete ${(f * 100).toFixed(0)}% de outras seções`)
  }
  return v
}
