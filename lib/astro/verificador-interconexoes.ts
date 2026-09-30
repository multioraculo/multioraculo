/**
 * O verificador da síntese pessoal.
 *
 * DELIBERADAMENTE PEQUENO. O do horóscopo tem dezenas de regras porque aquele
 * texto tem estrutura fixa: três relações, termos por forma, origens por lado.
 * Aqui o texto é corrido, e inventar uma gramática inteira para ele criaria um
 * segundo sistema para manter. As regras abaixo são as que impedem o que este
 * texto pode errar de pior, e nada além.
 *
 * O que ele barra, e por que cada coisa:
 *
 *  1. VOCABULÁRIO FECHADO. Citar planeta, signo, casa ou aspecto que não está
 *     nos fatos daquela pessoa naquele dia. É o erro mais grave: o texto é
 *     individual, e uma invenção aqui é uma afirmação falsa sobre a vida de
 *     alguém, não uma imprecisão editorial.
 *  2. AFIRMAÇÃO SEM FATO. Toda afirmação declara de qual fato saiu, e o id tem
 *     de existir. Declarar origem inexistente é o mesmo que não declarar.
 *  3. COBERTURA DO QUE MAIS PESA. A interconexão de maior nota precisa ser
 *     tocada. Uma síntese que ignora o principal e desenvolve o marginal está
 *     lendo outro dia.
 *  4. PREVISÃO. Os fatos descrevem um céu, não um futuro. "Vai acontecer" não
 *     se sustenta em nada que o motor calculou.
 *  5. CONSELHO. O produto inteiro recusa prescrição, e aqui seria pior, porque
 *     o texto é pessoal e pago.
 *  6. GENÉRICO. Frase que serviria para qualquer pessoa em qualquer dia é o
 *     jeito educado de não dizer nada. Mede-se por ausência de qualquer nome
 *     dos fatos.
 *  7. TAMANHO E REGISTRO. Frases, palavras, travessão e as expressões vetadas
 *     que já valem para o resto do produto.
 *
 * O que ele NÃO faz: julgar se a interpretação é boa. Isso não é verificável, e
 * fingir que é seria pior do que não tentar.
 */
import type { Locale } from "@/lib/i18n/config"
import { EXPRESSOES_EVITAR, PROIBIDAS, TRACOS } from "./editorial"
import { ASPECTOS, CORPOS, SIGNOS } from "./nomes"
import type { FatoPessoal } from "./fatos-interconexoes"
import { AFIRMACOES, FRASES, PALAVRAS_MAX, type SintesePessoal } from "./prompt-interconexoes"

export type VereditoPessoal = { ok: true; sintese: SintesePessoal } | { ok: false; violacoes: string[] }

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

function contem(texto: string, termo: string): boolean {
  const t = semAcento(termo)
  if (!t) return false
  return new RegExp(`(^|[^\\p{L}])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "u").test(semAcento(texto))
}

const palavras = (t: string) => t.trim().split(/\s+/).filter(Boolean).length
const frases = (t: string) => t.split(/(?<=[.!?])\s+/).map((f) => f.trim()).filter(Boolean).length

/** Futuro afirmado. Os fatos são um céu medido, não um acontecimento anunciado. */
const PREVISAO: Record<Locale, RegExp[]> = {
  pt: [/\bvai (acontecer|surgir|chegar|trazer|mudar)\b/i, /\bvoc[êe] (vai|ir[áa])\b/i, /\bacontecer[áa]\b/i, /\bser[áa] um (dia|momento|per[íi]odo)\b/i],
  en: [/\bwill (happen|bring|change|arrive)\b/i, /\byou will\b/i, /\bis going to\b/i],
  es: [/\bva a (pasar|llegar|traer|cambiar)\b/i, /\bvas a\b/i, /\bocurrir[áa]\b/i],
}

/** Prescrição. O produto não aconselha em lugar nenhum, e aqui menos ainda. */
const CONSELHO: Record<Locale, RegExp[]> = {
  pt: [/\b(procure|evite|tente|busque|aproveite|cuidado com|permita-se|lembre-se de|e importante que voce)\b/i, /\b(voce deve|voce precisa|e hora de)\b/i],
  en: [/\b(try to|avoid|seek|allow yourself|remember to|you should|you need to|it is time to)\b/i],
  es: [/\b(procura|evita|intenta|busca|permitete|recuerda|debes|necesitas|es hora de)\b/i],
}

export function verificarSintesePessoal(params: {
  bruto: unknown
  fatos: FatoPessoal[]
  locale: Locale
}): VereditoPessoal {
  const { bruto, fatos, locale } = params
  const violacoes: string[] = []

  const entrada = bruto as Partial<SintesePessoal>
  const sintese = typeof entrada?.sintese === "string" ? entrada.sintese.trim() : ""
  const afirmacoes = (Array.isArray(entrada?.afirmacoes) ? entrada.afirmacoes : []).map((a) => ({
    texto: String((a as { texto?: unknown })?.texto ?? "").trim(),
    fato: String((a as { fato?: unknown })?.fato ?? "").trim(),
  }))

  if (!sintese) violacoes.push("síntese vazia")

  // ── 1 · vocabulário fechado ───────────────────────────────────────────────
  const tudoDosFatos = semAcento(fatos.map((f) => f.texto).join(" "))
  const citaNosFatos = (nome: string) => tudoDosFatos.includes(semAcento(nome))
  const todoTexto = [sintese, ...afirmacoes.map((a) => a.texto)].join(" ")

  for (const nome of Object.values(CORPOS[locale])) {
    if (contem(todoTexto, nome) && !citaNosFatos(nome)) {
      violacoes.push(`cita ${nome}, que não está nos seus fatos de hoje`)
    }
  }
  for (const nome of SIGNOS[locale]) {
    if (contem(todoTexto, nome) && !citaNosFatos(nome)) {
      violacoes.push(`cita ${nome}, que não está nos seus fatos de hoje`)
    }
  }
  for (const nome of Object.values(ASPECTOS[locale])) {
    if (contem(todoTexto, nome) && !citaNosFatos(nome)) {
      violacoes.push(`cita ${nome}, que não é ângulo de nenhuma interconexão sua hoje`)
    }
  }

  // ── 2 · toda afirmação declara um fato que existe ─────────────────────────
  if (afirmacoes.length < AFIRMACOES.min || afirmacoes.length > AFIRMACOES.max) {
    violacoes.push(`${afirmacoes.length} afirmação(ões), fora de ${AFIRMACOES.min} a ${AFIRMACOES.max}`)
  }
  const ids = new Set(fatos.map((f) => f.id))
  for (const [i, a] of afirmacoes.entries()) {
    if (!a.texto) violacoes.push(`afirmação ${i + 1}: vazia`)
    if (!ids.has(a.fato)) violacoes.push(`afirmação ${i + 1}: declara o fato "${a.fato}", que não existe`)
    if (a.texto && !contem(sintese, a.texto.split(/\s+/).slice(0, 3).join(" "))) {
      // a afirmação precisa aparecer na síntese, senão ela é decoração
      const inicio = a.texto.split(/\s+/).slice(0, 3).join(" ")
      if (!semAcento(sintese).includes(semAcento(inicio))) {
        violacoes.push(`afirmação ${i + 1}: não aparece na síntese`)
      }
    }
  }

  // ── 3 · o que mais pesa precisa ser tocado ────────────────────────────────
  const principais = fatos.filter((f) => f.tipo === "interconexao").sort((a, b) => b.nota - a.nota)
  if (principais.length > 0) {
    const usados = new Set(afirmacoes.map((a) => a.fato))
    if (!usados.has(principais[0].id)) {
      violacoes.push(`a interconexão mais relevante (${principais[0].id}) não sustenta nenhuma afirmação`)
    }
  }

  // ── 4, 5 · previsão e conselho ────────────────────────────────────────────
  for (const r of PREVISAO[locale]) {
    const achou = todoTexto.match(r)
    if (achou) violacoes.push(`afirma futuro: "${achou[0].trim()}". Os fatos descrevem um céu, não um acontecimento`)
  }
  for (const r of CONSELHO[locale]) {
    const achou = todoTexto.match(r)
    if (achou) violacoes.push(`dá conselho: "${achou[0].trim()}"`)
  }

  // ── 6 · genérico: a síntese precisa nomear algo dos fatos ─────────────────
  const nomesDosFatos = [
    ...Object.values(CORPOS[locale]),
    ...SIGNOS[locale],
    ...Object.values(ASPECTOS[locale]),
  ].filter((n) => citaNosFatos(n))
  if (sintese && !nomesDosFatos.some((n) => contem(sintese, n))) {
    violacoes.push("a síntese não nomeia nada dos seus fatos: serviria para qualquer pessoa")
  }

  // ── 7 · tamanho e registro ────────────────────────────────────────────────
  if (sintese) {
    const nf = frases(sintese)
    if (nf < FRASES.min || nf > FRASES.max) violacoes.push(`${nf} frase(s), fora de ${FRASES.min} a ${FRASES.max}`)
    const np = palavras(sintese)
    if (np > PALAVRAS_MAX) violacoes.push(`${np} palavras, acima de ${PALAVRAS_MAX}`)
  }
  if (TRACOS.test(todoTexto)) violacoes.push("usa travessão ou meia risca")
  for (const regex of PROIBIDAS[locale]) {
    const achou = todoTexto.match(regex)
    if (achou) violacoes.push(`expressão proibida "${achou[0].trim()}"`)
  }
  for (const e of EXPRESSOES_EVITAR[locale]) {
    if (contem(todoTexto, e)) violacoes.push(`expressão evitada "${e}"`)
  }

  if (violacoes.length) return { ok: false, violacoes: [...new Set(violacoes)] }
  return { ok: true, sintese: { afirmacoes, sintese } }
}
