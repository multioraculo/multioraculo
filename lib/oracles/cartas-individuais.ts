/**
 * A interpretação INDIVIDUAL das duas cartas do dia: o verso de cada carta.
 *
 * TRÊS CAMADAS, e elas não se misturam:
 *
 *   resultado bruto         → a carta sorteada (`tiragem.tarot`, `tiragem.lenormand`)
 *   interpretação individual → o que ESSA carta significa dentro do SEU oráculo
 *                              (`cartas.tarot.interpretation`, `cartas.lenormand.interpretation`)
 *   síntese cruzada          → a relação entre as duas (`sintese`)
 *
 * O verso da carta usa a segunda. O bloco abaixo da tiragem usa a terceira.
 * A síntese NUNCA volta a servir de verso: foi esse o defeito que mostrava a
 * Raposa no verso do Seis de Ouros invertido.
 *
 * Aqui moram três coisas, todas puras (sem rede, sem banco):
 *  1. o MATERIAL de cada carta, vindo das fichas estruturadas do projeto, que
 *     é tudo o que a geração pode usar para dizer o que a carta significa;
 *  2. o formato em que a interpretação viaja e é gravada;
 *  3. a detecção de REFERÊNCIA CRUZADA, que reprova o texto individual que
 *     cita a outra carta, o outro oráculo ou a ideia de "conjunto".
 */
import type { Locale } from "@/lib/i18n/config"
import { TAROT_DECK } from "./draw"
import { fichaDaCarta, REVERSAO_METODO } from "./tarot-referencia"
import { LENORMAND_FICHAS, type FichaLenormand } from "./lenormand-fichas"
import type { TiragemDoDia } from "./tiragem-dia"

/** O que viaja no payload e é gravado. `null` = sem interpretação individual. */
export type CartasIndividuais = {
  tarot: { interpretation: string | null }
  lenormand: { interpretation: string | null }
}

export const SEM_CARTAS: CartasIndividuais = {
  tarot: { interpretation: null },
  lenormand: { interpretation: null },
}

/** Lê o que veio do banco/JSON sem confiar na forma: registro antigo vira `null`. */
export function cartasDeJson(bruto: unknown): CartasIndividuais | null {
  const o = bruto as { tarot?: { interpretation?: unknown }; lenormand?: { interpretation?: unknown } } | null
  if (!o || typeof o !== "object") return null
  const lim = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null)
  const tarot = lim(o.tarot?.interpretation)
  const lenormand = lim(o.lenormand?.interpretation)
  if (!tarot && !lenormand) return null
  return { tarot: { interpretation: tarot }, lenormand: { interpretation: lenormand } }
}

// ── 1. o material ────────────────────────────────────────────────────────────

const limpa = (s: string) => s.replace(/\s+/g, " ").trim()

/**
 * O material do Tarô: a ficha do Ben-Dov daquela carta, na orientação sorteada.
 * Está em português, e é EVIDÊNCIA INTERNA: o texto exibido é uma paráfrase no
 * idioma pedido, nunca a ficha.
 */
export function materialDoTarot(tiragem: TiragemDoDia): string | null {
  const ficha = fichaDaCarta(TAROT_DECK[tiragem.tarot.indice].name)
  if (!ficha) return null
  const linhas = [`Sentido-base (fonte: ${ficha.fonte}, em português): ${limpa(ficha.base)}`]
  if (tiragem.tarot.invertida) {
    linhas.push(
      ficha.invertida_similar
        ? "Reversão: a fonte diz que, invertida, o sentido desta carta permanece semelhante."
        : `Reversão específica desta carta (fonte): ${limpa(ficha.invertida)}`,
    )
  }
  return linhas.join("\n")
}

/** Regra geral da fonte sobre inversão, para o prompt citar sem inventar. */
export const REGRA_DE_REVERSAO = (locale: Locale) => REVERSAO_METODO[locale]

/**
 * O material do Lenormand: a ficha INDIVIDUAL da carta (General, Effect e as
 * listas de palavras), sem as combinações e sem as frases que citam outra
 * carta. "Timing" e "Lenormand Universe" ficam de fora de propósito (um é
 * previsão; o outro, nas palavras da autora, um título dela, não tradicional).
 */
export function fichaDoLenormand(indice: number): FichaLenormand | undefined {
  return LENORMAND_FICHAS.find((f) => f.indice === indice)
}

export function materialDoLenormand(tiragem: TiragemDoDia): string | null {
  const f = fichaDoLenormand(tiragem.lenormand.indice)
  if (!f) return null
  const linhas = [`Entrada da carta (fonte: Matthews, The Complete Lenormand Oracle Handbook, em inglês; no livro "${f.nomeFonte}"): ${f.geral}`]
  if (f.efeito) linhas.push(`Efeito segundo a fonte: ${f.efeito}${f.efeitoNota ? ` (${f.efeitoNota})` : ""}.`)
  if (f.substantivos.length) linhas.push(`Substantivos: ${f.substantivos.join("; ")}.`)
  if (f.adjetivos.length) linhas.push(`Adjetivos: ${f.adjetivos.join("; ")}.`)
  if (f.verbos.length) linhas.push(`Verbos: ${f.verbos.join("; ")}.`)
  if (f.pessoas.length) linhas.push(`Pessoas: ${f.pessoas.join("; ")}.`)
  return linhas.join("\n")
}

// ── 2. referência cruzada ────────────────────────────────────────────────────

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

/**
 * O núcleo do nome da carta, sem artigo, sem número, sem a palavra "invertida".
 * "Seis de Ouros invertida" → "seis de ouros"; "14 — Raposa" → "raposa".
 */
export function nucleoDoNome(nome: string): string {
  const limpo = semAcento(nome)
    .replace(/\(.*?\)/g, "")
    .replace(/\b(invertida|invertido|reversed|invertid[ao]s)\b/g, "")
    .replace(/^\d{1,2}\s*[.—–-]\s*/, "")
    .trim()
  return limpo.replace(/^(o|a|os|as|the|el|la|los|las)\s+/, "").trim()
}

/** O nome aparece como palavra inteira (com plural opcional). "sol" não casa "solução". */
export function citaNome(texto: string, nome: string): boolean {
  const nucleo = nucleoDoNome(nome)
  if (!nucleo) return false
  const talo = nucleo.replace(/(e?s)$/, "")
  const base = talo.length >= 3 ? talo : nucleo
  const re = new RegExp(`(?<![a-z0-9])${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:e?s)?(?![a-z0-9])`)
  return re.test(semAcento(texto))
}

type Oraculo = "tarot" | "lenormand"

/** Outros sistemas e a ideia de "conjunto": nada disto pertence a um verso individual. */
// `\b` do JS não trata letra acentuada como letra ("Tarô", "Odù", "orixá" escapavam
// dele), então a palavra inteira é delimitada por lookaround Unicode.
const palavra = (alternativas: string) => new RegExp(`(?<![\\p{L}])(?:${alternativas})(?![\\p{L}])`, "iu")
const OUTROS_SISTEMAS: RegExp[] = [
  palavra("i[\\s-]?ching|iching|hexagram\\p{L}*|trigram\\p{L}*|yijing"),
  palavra("runas?|runes?|runic\\p{L}*|futhark"),
  palavra("b[uú]zios?|cowries|cowrie|cauris?|od[uù]s?|orix[aá]s?|orisha\\p{L}*"),
]
const NOME_DE_ORACULO: Record<Oraculo, RegExp> = {
  // o Tarô não cita o Lenormand; o Lenormand não cita o Tarô
  tarot: palavra("lenormand"),
  lenormand: palavra("tar[oô]t?|tarot|tarocchi"),
}
const IDEIA_DE_CONJUNTO: Record<Locale, RegExp[]> = {
  pt: [
    /\bs[ií]ntese\b/i, /\bor[aá]culos?\b/i, /\bconverg\w*/i, /\bcombina(?:ç|c)[aã]o\b|\bcombinad\w*/i,
    /\bcruzamento\b/i, /\b(a|as) outras? cartas?\b/i, /\b(as )?duas cartas\b/i, /\bambas as cartas\b/i,
    /\bem conjunto\b/i, /\bjunto (com|a|ao|à)\b/i, /\bem rela(?:ç|c)[aã]o [àa] (outra|segunda|primeira)\b/i,
    /\btiragem do dia\b/i, /\boutro (sistema|baralho)\b/i,
  ],
  en: [
    /\bsynthes[ie]s\b/i, /\boracles?\b/i, /\bconverg\w*/i, /\bcombinations?\b/i, /\bcombined\b/i,
    /\bcrossing\b/i, /\bthe other cards?\b/i, /\bboth cards\b/i, /\btogether with\b/i, /\bin conjunction\b/i,
    /\bin tandem\b/i, /\bdaily (draw|spread)\b/i, /\banother (system|deck)\b/i,
  ],
  es: [
    /\bs[ií]ntesis\b/i, /\bor[aá]culos?\b/i, /\bconverg\w*/i, /\bcombinaci[oó]n\b|\bcombinad\w*/i,
    /\bcruce\b/i, /\bla otra carta\b|\blas otras cartas\b/i, /\bambas cartas\b|\blas dos cartas\b/i,
    /\ben conjunto\b/i, /\bjunto (con|a|al)\b/i, /\btirada del d[ií]a\b/i, /\botro (sistema|mazo)\b/i,
  ],
}

/**
 * Tudo o que, num texto individual, é referência cruzada.
 *
 * `propria` e `outra` são os NOMES RENDERIZADOS das duas cartas. Quando as duas
 * têm o mesmo núcleo (Sol e Sol, Lua e Lua, Estrela e Estrelas, Torre e Torre),
 * a palavra é dita legitimamente pela própria carta e não é cruzamento.
 */
export function referenciasCruzadas(
  texto: string,
  ctx: { oraculo: Oraculo; propria: string; outra: string; locale: Locale },
): string[] {
  const achados: string[] = []
  const iguais = nucleoDoNome(ctx.propria) === nucleoDoNome(ctx.outra)
  if (!iguais && citaNome(texto, ctx.outra)) achados.push(`cita a outra carta (${nucleoDoNome(ctx.outra)})`)
  const nome = texto.match(NOME_DE_ORACULO[ctx.oraculo])
  if (nome) achados.push(`cita outro oráculo (${nome[0]})`)
  for (const re of OUTROS_SISTEMAS) {
    const m = texto.match(re)
    if (m) achados.push(`cita outro sistema (${m[0]})`)
  }
  for (const re of IDEIA_DE_CONJUNTO[ctx.locale]) {
    const m = texto.match(re)
    if (m) achados.push(`fala de conjunto/síntese ("${m[0]}")`)
  }
  return achados
}
