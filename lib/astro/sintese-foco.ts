/**
 * A síntese do foco: o que aquela frase quer dizer no dia de quem lê.
 *
 * "Desafios entre profundidade e afirmação nas relações" está correto e é quase
 * inútil sozinho. O leitor entende as palavras e não sabe o que fazer com elas.
 * Os cards logo abaixo explicam cada movimento, mas explicam pela técnica:
 * planeta, signo, orbe, ângulo. Falta o degrau do meio, que é onde a astrologia
 * editorial boa vive — dizer como aquilo poderia aparecer num dia comum.
 *
 * ELA É UMA CAMADA A MAIS, NUNCA UM RISCO A MAIS. Três decisões garantem isso:
 *
 *  1. É OPCIONAL DE PONTA A PONTA. Se o modelo não a escrever, se ela reprovar,
 *     ou se a linha no cache for de antes desta mudança, a tela mostra a frase
 *     do foco sozinha, que é exatamente o produto de ontem. Uma camada nova não
 *     pode custar a leitura de ninguém;
 *  2. NÃO NOMEIA A TÉCNICA. Nem planeta, nem signo, nem aspecto — a mesma regra
 *     que já vale para o foco. Quem quiser o nome dos corpos abre o card logo
 *     abaixo, onde ele está com grau e orbe. Repetir aqui seria dizer duas
 *     vezes a mesma coisa em dois registros diferentes;
 *  3. É HIPÓTESE, SEMPRE. Toda frase concreta abre com uma das marcas fechadas
 *     de `editorial`. Dita como hipótese, é leitura; dita como fato, é
 *     previsão, e o motor não calculou futuro nenhum.
 *
 * A ÂNCORA SÃO OS TERMOS. Eles já passaram pelo verificador do horóscopo, que
 * exige que cada um declare de qual elemento calculado saiu. Amarrar a síntese
 * a eles é amarrá-la, de segunda mão, aos mesmos fatos — sem precisar de um
 * segundo sistema de rastreamento que teria de ser mantido em dia sozinho.
 */
import type { Locale } from "@/lib/i18n/config"
import {
  CONSELHO,
  EXPRESSOES_EVITAR,
  FALSA_PRECISAO,
  MARCAS_HIPOTESE,
  PREVISAO,
  PROIBIDAS,
  TRACOS,
} from "./editorial"
import { ASPECTOS, CORPOS, SIGNOS } from "./nomes"
import type { RelacaoEscrita } from "./prompt-horoscopo"

export const FRASES_SINTESE = { min: 2, max: 3 }
export const PALAVRAS_SINTESE_MAX = 70
/** quantos termos a síntese precisa retomar para não flutuar solta */
const ANCORAS_MINIMAS = 2
/** quanto de um termo precisa reaparecer para contar como retomado */
const PISO_DE_RETOMADA = 0.5

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

function contem(texto: string, termo: string): boolean {
  const t = semAcento(termo)
  if (!t) return false
  return new RegExp(`(^|[^\\p{L}])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "u").test(semAcento(texto))
}

const contarPalavras = (t: string) => t.trim().split(/\s+/).filter(Boolean).length
const contarFrases = (t: string) => t.split(/(?<=[.!?])\s+/).map((f) => f.trim()).filter(Boolean).length

/**
 * O termo reapareceu no texto?
 *
 * Por sobreposição de conteúdo, e não por cadeia de caracteres: a síntese
 * reescreve, que é o que prosa faz. Palavras de até três letras ficam de fora
 * porque "de", "com" e "que" estão em qualquer frase e inflariam a conta.
 */
function retomado(termo: string, texto: string): boolean {
  const alvo = semAcento(texto)
  const palavras = semAcento(termo)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((p) => p.length >= 4)
  if (palavras.length === 0) return false
  return palavras.filter((p) => alvo.includes(p)).length / palavras.length >= PISO_DE_RETOMADA
}

/** Todos os termos escritos, em ordem. Cards de posição não têm nenhum. */
export function termosDaLeitura(relacoes: RelacaoEscrita[]): string[] {
  return relacoes.flatMap((r) => r.termos.map((t) => t.texto)).filter(Boolean)
}

export type VereditoSintese = { ok: true } | { ok: false; violacoes: string[] }

export function verificarSinteseFoco(params: {
  texto: string
  relacoes: RelacaoEscrita[]
  locale: Locale
}): VereditoSintese {
  const { texto, relacoes, locale } = params
  const violacoes: string[] = []
  const t = texto.trim()

  if (!t) return { ok: false, violacoes: ["síntese do foco vazia"] }

  // ── tamanho ───────────────────────────────────────────────────────────────
  const nf = contarFrases(t)
  if (nf < FRASES_SINTESE.min || nf > FRASES_SINTESE.max) {
    violacoes.push(`síntese com ${nf} frase(s), fora de ${FRASES_SINTESE.min} a ${FRASES_SINTESE.max}`)
  }
  const np = contarPalavras(t)
  if (np > PALAVRAS_SINTESE_MAX) violacoes.push(`síntese com ${np} palavras, acima de ${PALAVRAS_SINTESE_MAX}`)

  // ── hipótese, nunca acontecimento ─────────────────────────────────────────
  const marcas = MARCAS_HIPOTESE[locale]
  if (!marcas.some((m) => semAcento(t).includes(semAcento(m)))) {
    violacoes.push(`síntese sem marca de hipótese. Use uma destas: ${marcas.join(", ")}`)
  }

  // ── a mesma linguagem do foco: sem nome de planeta, signo ou aspecto ──────
  for (const nome of [
    ...Object.values(CORPOS[locale]),
    ...SIGNOS[locale],
    ...Object.values(ASPECTOS[locale]),
  ]) {
    if (contem(t, nome)) violacoes.push(`síntese: contém o termo técnico ${nome}`)
  }

  // ── âncora: a síntese retoma o que as relações já disseram ────────────────
  const termos = termosDaLeitura(relacoes)
  const precisa = Math.min(ANCORAS_MINIMAS, termos.length)
  if (precisa === 0) {
    violacoes.push("não há termos nas relações para a síntese se apoiar")
  } else {
    const retomados = termos.filter((termo) => retomado(termo, t)).length
    if (retomados < precisa) {
      violacoes.push(
        `síntese retoma ${retomados} termo(s) das relações, e precisa de ${precisa}: sem isso ela serviria para qualquer dia`,
      )
    }
  }

  // ── o que o produto nunca diz ─────────────────────────────────────────────
  for (const r of PREVISAO[locale]) {
    const achou = t.match(r)
    if (achou) violacoes.push(`síntese afirma futuro: "${achou[0].trim()}"`)
  }
  for (const r of CONSELHO[locale]) {
    const achou = t.match(r)
    if (achou) violacoes.push(`síntese dá conselho: "${achou[0].trim()}"`)
  }
  for (const r of FALSA_PRECISAO[locale]) {
    const achou = t.match(r)
    if (achou) violacoes.push(`síntese diz "${achou[0].trim()}", que nenhum cálculo produziu`)
  }
  if (TRACOS.test(t)) violacoes.push("síntese usa travessão ou meia risca")
  for (const regex of PROIBIDAS[locale]) {
    const achou = t.match(regex)
    if (achou) violacoes.push(`síntese: expressão proibida "${achou[0].trim()}"`)
  }
  for (const e of EXPRESSOES_EVITAR[locale]) {
    if (contem(t, e)) violacoes.push(`síntese: expressão evitada "${e}"`)
  }

  if (violacoes.length) return { ok: false, violacoes: [...new Set(violacoes)] }
  return { ok: true }
}

const MOLDE: Record<Locale, (a: string, b: string) => string> = {
  pt: (a, b) => `Hoje isso pode aparecer como ${a}. E também pode surgir como ${b}.`,
  en: (a, b) => `Today this may appear as ${a}. It may also surface as ${b}.`,
  es: (a, b) => `Hoy esto puede aparecer como ${a}. También puede surgir como ${b}.`,
}

/**
 * A síntese escrita sem modelo nenhum, só com os termos.
 *
 * Último degrau, e de propósito o mais seco de todos: ela não interpreta, só
 * põe lado a lado duas coisas que a leitura já disse, e as põe como hipótese.
 * Devolve `null` quando não há dois termos para trabalhar, porque nesse caso a
 * frase do foco sozinha é mais honesta do que um molde com uma perna só.
 */
export function sinteseFocoDeterministica(relacoes: RelacaoEscrita[], locale: Locale): string | null {
  const termos = termosDaLeitura(relacoes)
  if (termos.length < 2) return null
  const minuscula = (s: string) => `${s.charAt(0).toLowerCase()}${s.slice(1)}`
  return MOLDE[locale](minuscula(termos[0]), minuscula(termos[1]))
}

/** O trecho do prompt. Mora aqui para prompt e verificador não divergirem. */
export function instrucaoSinteseFoco(locale: Locale): string {
  const marcas = MARCAS_HIPOTESE[locale].map((m) => `"${m}"`).join(", ")
  if (locale === "en") {
    return [
      `3. "sintese": ${FRASES_SINTESE.min} to ${FRASES_SINTESE.max} sentences, at most ${PALAVRAS_SINTESE_MAX} words, saying how the focus could show up in an ordinary day.`,
      `   It must reuse at least ${ANCORAS_MINIMAS} of the terms you wrote above, in your own words.`,
      `   Every concrete sentence opens with one of these exact marks: ${marcas}.`,
      "   No planet, sign or aspect names: the cards below already carry those. No advice, no prediction, no hour, date, weekday or month.",
    ].join("\n")
  }
  if (locale === "es") {
    return [
      `3. "sintese": de ${FRASES_SINTESE.min} a ${FRASES_SINTESE.max} frases, máximo ${PALAVRAS_SINTESE_MAX} palabras, diciendo cómo el foco podría aparecer en un día común.`,
      `   Tiene que retomar al menos ${ANCORAS_MINIMAS} de los términos que escribiste arriba, con tus palabras.`,
      `   Toda frase concreta abre con una de estas marcas exactas: ${marcas}.`,
      "   Sin nombres de planeta, signo o aspecto: los cards de abajo ya los traen. Sin consejo, sin predicción, sin hora, fecha, día de la semana ni mes.",
    ].join("\n")
  }
  return [
    `3. "sintese": de ${FRASES_SINTESE.min} a ${FRASES_SINTESE.max} frases, no máximo ${PALAVRAS_SINTESE_MAX} palavras, dizendo como o foco poderia aparecer num dia comum.`,
    `   Precisa RETOMAR pelo menos ${ANCORAS_MINIMAS} dos termos que você escreveu acima, com as suas palavras.`,
    `   Toda frase concreta abre com uma destas marcas exatas: ${marcas}.`,
    "   Sem nome de planeta, de signo ou de aspecto: os cards logo abaixo já trazem isso, e repetir seria dizer a mesma coisa duas vezes.",
    "   Sem conselho, sem previsão, e sem hora, data, dia da semana ou mês, que nenhum cálculo produziu.",
    "   É o degrau entre a frase do foco e a explicação técnica: concreto o bastante para a pessoa se reconhecer, hipotético o bastante para não ser adivinhação.",
  ].join("\n")
}
