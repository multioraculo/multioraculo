/**
 * O payload da síntese de sinastria: TUDO o que o modelo vê, e nada além.
 *
 * Constrói-se exclusivamente a partir da seleção de evidência
 * (`selecionarEvidencia`): fatos calculados, evidência selecionada e núcleos
 * operacionais. O repertório inteiro do Davison nunca chega aqui, e nem os
 * fatos que o seletor descartou. Isso é o que dá sentido à regra de que o
 * modelo não completa astrologia por conta própria: o que não está no payload
 * não existe para ele.
 *
 * Os fatos já vêm DITOS no idioma de saída, com o dono de cada corpo
 * ("sua Lua", "Vênus da outra pessoa"). O apelido da outra pessoa, o nome, a
 * data e o lugar de nascimento nunca entram: ela é "a outra pessoa".
 *
 * Os BLOCOS ELEGÍVEIS são decididos aqui, por código, e não pelo modelo: um
 * bloco temático só pode existir se alguma evidência selecionada sustenta a
 * dimensão dele. Essa tabela é editorial (a fonte não agrupa a leitura em
 * blocos), e é a mesma que o verificador usa para recusar um bloco sem lastro.
 */
import type { Locale } from "@/lib/i18n/config"
import { INTERASPECTOS, OVERLAYS } from "./davison"
import { aplicabilidadeDaFrase } from "./davison/aplicabilidade"
import type { Dimensao } from "./davison/tipos"
import { ASPECTOS, CORPOS, SIGNOS } from "./nomes"
import type { Dinamica, ItemEvidencia, SelecaoSinastria, SemelhancaSelecionada } from "./selecao-sinastria"
import type { FatoAspecto, FatoIndisponibilidade, FatoOverlay, FatoSemelhanca, Pessoa } from "./sinastria"
import type { Vinculo } from "./sinastria-servico"

export type IdDeBloco =
  | "sintese_da_relacao"
  | "pontos_em_comum"
  | "onde_se_encontram"
  | "onde_ha_tensao"
  | "comunicacao"
  | "afeto_e_intimidade"
  | "vida_pratica_e_sustentacao"
  | "o_que_a_relacao_mobiliza"
  | "sintese_final"

export const BLOCOS: readonly IdDeBloco[] = [
  "sintese_da_relacao",
  "pontos_em_comum",
  "onde_se_encontram",
  "onde_ha_tensao",
  "comunicacao",
  "afeto_e_intimidade",
  "vida_pratica_e_sustentacao",
  "o_que_a_relacao_mobiliza",
  "sintese_final",
]

/** Os dois blocos que sempre existem. Os outros só existem quando há lastro. */
export const BLOCOS_OBRIGATORIOS: readonly IdDeBloco[] = ["sintese_da_relacao", "sintese_final"]

/**
 * Que dimensões da evidência sustentam cada bloco temático. Editorial: o livro
 * não divide a leitura em blocos. Dimensões que não estão aqui (ação, expansão,
 * identidade, limites) alimentam "onde se encontram" e "onde há tensão".
 */
export const DIMENSOES_DO_BLOCO: Partial<Record<IdDeBloco, readonly Dimensao[]>> = {
  comunicacao: ["comunicacao"],
  afeto_e_intimidade: ["afeto_intimidade", "emocional"],
  vida_pratica_e_sustentacao: ["vida_pratica", "sustentacao_compromisso"],
  o_que_a_relacao_mobiliza: ["transformacao"],
}

/**
 * O que o vínculo orienta: a ÊNFASE da narrativa, nada mais. Nunca muda os
 * fatos, os orbes nem o que a evidência diz. Editorial.
 */
export const ENFASE_POR_VINCULO: Record<Vinculo, readonly IdDeBloco[]> = {
  romantico: ["afeto_e_intimidade", "comunicacao", "o_que_a_relacao_mobiliza"],
  amizade: ["pontos_em_comum", "onde_se_encontram", "comunicacao"],
  familia: ["vida_pratica_e_sustentacao", "o_que_a_relacao_mobiliza", "afeto_e_intimidade"],
  trabalho: ["comunicacao", "vida_pratica_e_sustentacao", "onde_ha_tensao"],
  outro: [],
}

// ── a linguagem dos fatos ────────────────────────────────────────────────────

export const ELEMENTOS: Record<Locale, Record<string, string>> = {
  pt: { fire: "fogo", earth: "terra", air: "ar", water: "água" },
  en: { fire: "fire", earth: "earth", air: "air", water: "water" },
  es: { fire: "fuego", earth: "tierra", air: "aire", water: "agua" },
}
export const MODOS: Record<Locale, Record<string, string>> = {
  pt: { cardinal: "cardinal", fixed: "fixo", mutable: "mutável" },
  en: { cardinal: "cardinal", fixed: "fixed", mutable: "mutable" },
  es: { cardinal: "cardinal", fixed: "fijo", mutable: "mutable" },
}
const ANGULOS: Record<Locale, Record<string, string>> = {
  pt: { asc: "Ascendente", mc: "Meio do Céu" },
  en: { asc: "Ascendant", mc: "Midheaven" },
  es: { asc: "Ascendente", mc: "Medio Cielo" },
}
const FEMININOS_PT = new Set(["moon", "venus"])

/** Como o texto chama cada pessoa, e os rótulos que o verificador procura. */
export const DONOS: Record<Locale, { A: string[]; B: string[] }> = {
  pt: { A: ["você", "seu", "sua"], B: ["outra pessoa"] },
  en: { A: ["your", "you"], B: ["other person"] },
  es: { A: ["tu", "usted"], B: ["otra persona"] },
}

function nome(id: string, pessoa: Pessoa, locale: Locale): string {
  const base = (ANGULOS[locale][id] ?? (CORPOS[locale] as Record<string, string>)[id] ?? id)
  if (locale === "pt") {
    if (pessoa === "A") return `${FEMININOS_PT.has(id) ? "sua" : "seu"} ${base}`
    return `${id === "asc" || id === "sun" || id === "mc" ? "o " : id === "moon" || id === "venus" ? "a " : ""}${base} da outra pessoa`
  }
  if (locale === "en") return pessoa === "A" ? `your ${base}` : `the other person's ${base}`
  return pessoa === "A" ? `tu ${base}` : `${id === "moon" ? "la " : id === "sun" ? "el " : ""}${base} de la otra persona`
}

const decimal = (n: number, locale: Locale) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))
const LIGA: Record<Locale, { em: string; com: string; orbe: string; casa: string; naCasa: string; limite: string }> = {
  pt: { em: "em", com: "com", orbe: "orbe", casa: "casa", naCasa: "está na casa", limite: "limite" },
  en: { em: "in", com: "with", orbe: "orb", casa: "house", naCasa: "is in house", limite: "limit" },
  es: { em: "en", com: "con", orbe: "orbe", casa: "casa", naCasa: "está en la casa", limite: "límite" },
}

export function frasearAspecto(f: FatoAspecto, locale: Locale): string {
  const L = LIGA[locale]
  const asp = (ASPECTOS[locale] as Record<string, string>)[f.aspecto]
  return `${nome(f.corpoA, "A", locale)} ${L.em} ${asp} ${L.com} ${nome(f.corpoB, "B", locale)} (${L.orbe} ${decimal(f.orbe, locale)}°, ${L.limite} ${decimal(f.orbeLimite, locale)}°)`
}

export function frasearOverlay(f: FatoOverlay, locale: Locale): string {
  const L = LIGA[locale]
  const planeta = nome(f.planeta, f.donoDoPlaneta, locale)
  const dono = f.donoDaCasa === "A" ? "your" : "the other person's"
  if (locale === "pt") return `${planeta} ${L.naCasa} ${f.casa} ${f.donoDaCasa === "A" ? "sua" : "da outra pessoa"}`
  if (locale === "en") return `${planeta} ${L.naCasa} ${f.casa}, ${dono}`
  return `${planeta} ${L.naCasa} ${f.casa} ${f.donoDaCasa === "A" ? "tuya" : "de la otra persona"}`
}

export function frasearSemelhanca(f: FatoSemelhanca, locale: Locale): string {
  const quem = (pessoa: Pessoa) => (locale === "pt" ? (pessoa === "A" ? "em você" : "na outra pessoa") : locale === "en" ? (pessoa === "A" ? "in you" : "in the other person") : pessoa === "A" ? "en ti" : "en la otra persona")
  if (f.dimensao === "elemento") {
    const t = locale === "pt" ? "elemento dominante" : locale === "en" ? "dominant element" : "elemento dominante"
    return `${t}: ${ELEMENTOS[locale][f.padraoA]} ${quem("A")}, ${ELEMENTOS[locale][f.padraoB]} ${quem("B")}`
  }
  if (f.dimensao === "modo") {
    const t = locale === "pt" ? "modo dominante" : locale === "en" ? "dominant mode" : "modo dominante"
    return `${t}: ${MODOS[locale][f.padraoA]} ${quem("A")}, ${MODOS[locale][f.padraoB]} ${quem("B")}`
  }
  if (f.dimensao === "elemento_do_sol") {
    const t = locale === "pt" ? "Sol no mesmo elemento" : locale === "en" ? "Sun in the same element" : "Sol en el mismo elemento"
    return `${t} (${ELEMENTOS[locale][f.padraoA]})`
  }
  const [corpo, signo] = f.padraoA.split(":")
  const t = locale === "pt" ? "mesmo signo" : locale === "en" ? "same sign" : "mismo signo"
  return `${(CORPOS[locale] as Record<string, string>)[corpo]}: ${t} (${SIGNOS[locale][Number(signo)]})`
}

export function frasearIndisponivel(i: FatoIndisponibilidade, locale: Locale): string {
  const quem = i.pessoa === "A" ? (locale === "pt" ? "você" : locale === "en" ? "you" : "tú") : locale === "pt" ? "a outra pessoa" : locale === "en" ? "the other person" : "la otra persona"
  const corpo = (id: string) => (CORPOS[locale] as Record<string, string>)[id] ?? id
  const item = String(i.item)
  const T: Record<Locale, Record<string, string>> = {
    pt: { hora: "a hora de nascimento não é conhecida: sem Ascendente, Meio do Céu, casas nem overlays com as casas dela", signo: "o signo de {c} não é definido", retro: "se {c} está retrógrado é indeterminado", aspectos: "os aspectos de {c} não podem ser afirmados", overlay: "a casa de {c} não é definida", dominante: "o {c} dominante não é definido" },
    en: { hora: "the birth time is unknown: no Ascendant, Midheaven, houses or overlays with its houses", signo: "the sign of {c} is not defined", retro: "whether {c} is retrograde is undetermined", aspectos: "the aspects of {c} cannot be stated", overlay: "the house of {c} is not defined", dominante: "the dominant {c} is not defined" },
    es: { hora: "la hora de nacimiento no se conoce: sin Ascendente, Medio Cielo, casas ni overlays con sus casas", signo: "el signo de {c} no está definido", retro: "si {c} está retrógrado es indeterminado", aspectos: "los aspectos de {c} no pueden afirmarse", overlay: "la casa de {c} no está definida", dominante: "el {c} dominante no está definido" },
  }
  const t = T[locale]
  const [tipo, alvo] = item.split(":")
  let texto: string
  if (["asc", "mc", "ic", "desc", "casas", "overlays", "grupos_de_casa", "hemisferios"].includes(item)) texto = t.hora
  else if (tipo === "signo") texto = t.signo.replace("{c}", corpo(alvo))
  else if (tipo === "retrogradacao") texto = t.retro.replace("{c}", corpo(alvo))
  else if (tipo === "aspectos") texto = t.aspectos.replace("{c}", corpo(alvo))
  else if (tipo === "overlay") texto = t.overlay.replace("{c}", corpo(alvo))
  else if (item === "elemento_dominante" || item === "modo_dominante") texto = t.dominante.replace("{c}", item === "elemento_dominante" ? (locale === "pt" ? "elemento" : "element") : locale === "pt" ? "modo" : "mode")
  else texto = item
  return `${quem}: ${texto}`
}

// ── o payload ────────────────────────────────────────────────────────────────

export type FatoNoPayload = { id: string; texto: string; categoria?: string }
export type DinamicaNoPayload = {
  /** o id que a resposta cita */
  id: string
  fatos: FatoNoPayload[]
  /** as frases como vão ao prompt: só as aplicáveis ao vínculo, com o núcleo geral no lugar do exemplo */
  evidencia: string[]
  /** as mesmas frases, com a origem de cada uma */
  itens: ItemEvidencia[]
  /** só as dimensões que as frases mantidas ainda sustentam */
  dimensoes: Dimensao[]
  camada: "aspectos" | "overlays"
  categorias: string[]
  contraponto: boolean
}
export type SemelhancaNoPayload = { id: string; fato: string; nucleo: string[] }

export type PayloadSinastria = {
  locale: Locale
  vinculo: Vinculo
  aspectos: DinamicaNoPayload[]
  overlays: DinamicaNoPayload[]
  semelhancas: SemelhancaNoPayload[]
  /** dinâmicas selecionadas cuja evidência inteira não se aplica a este vínculo: não vão ao prompt e não são citáveis */
  omitidasPorVinculo: string[]
  /** a ressalva curta sobre semelhança demais, uma vez só */
  ressalvaDasSemelhancas: string | null
  indisponibilidades: string[]
  /** os blocos que o modelo PODE escrever, e os que ele tem de deixar nulos */
  blocosElegiveis: IdDeBloco[]
  /** a ordem de ênfase que o vínculo sugere; nunca muda um fato */
  enfase: IdDeBloco[]
  /** os ids que a resposta pode citar: dinâmicas, fatos e semelhanças */
  idsCitaveis: string[]
}

const fatoDe = (f: FatoAspecto | FatoOverlay, locale: Locale): FatoNoPayload =>
  f.tipo === "aspecto" ? { id: f.id, texto: frasearAspecto(f, locale), categoria: f.categoria } : { id: f.id, texto: frasearOverlay(f, locale) }

/** As referências das frases que sustentam cada dimensão, na mesma notação com que o seletor numera as frases. */
function sustentacoes(d: Dinamica): Array<{ dimensao: Dimensao; refs: string[] }> {
  if (d.camada === "overlays") {
    const g = OVERLAYS.find((x) => x.id === d.evidencia.glosa)
    return (g?.dimensoes ?? []).map((x) => ({ dimensao: x.categoria, refs: x.sustentadaPor.map((r) => r.replace(/^(\w+):(\d+)$/, "$1[$2]")) }))
  }
  const g = INTERASPECTOS.find((x) => x.id === d.evidencia.glosa)
  if (!g) return []
  return (["favoravel", "adverso"] as const).flatMap((lado) =>
    (g[lado]?.dimensoes ?? []).map((x) => ({ dimensao: x.categoria, refs: x.sustentadaPor.map((r) => { const [campo, i] = r.split(":"); return `${lado}.${campo}[${i}]` }) })),
  )
}

/**
 * A evidência da dinâmica como este vínculo a recebe. A revisão de aplicabilidade só tira frase que não
 * se aplica ao vínculo e troca o exemplo pelo núcleo geral. Nada disso mexe no aspecto, no ranking nem no
 * orçamento: a seleção já foi feita, e as dimensões é que se recalculam sobre o que ficou.
 * Sem vínculo (`null`), a evidência vai inteira, como a seleção a entregou.
 */
function dinamicaNoPayload(d: Dinamica, locale: Locale, vinculo: Vinculo | null): DinamicaNoPayload | null {
  const itens: ItemEvidencia[] = []
  for (const i of d.evidencia.itens) {
    if (!vinculo) { itens.push(i); continue }
    const a = aplicabilidadeDaFrase(d.evidencia.glosa, i.ref, vinculo)
    if (a.aplica) itens.push(a.texto ? { ...i, texto: a.texto } : i)
  }
  if (itens.length === 0) return null
  const mantidas = new Set(itens.map((i) => i.ref))
  const dimensoes = [...new Set(sustentacoes(d).filter((x) => x.refs.some((r) => mantidas.has(r))).map((x) => x.dimensao))].sort()
  return {
    id: d.id,
    fatos: [d.principal, ...d.reforcos].map((f) => fatoDe(f, locale)),
    // o papel de cada corpo vem rotulado com o corpo, senão a frase solta não diz de quem é
    evidencia: itens.map((i: ItemEvidencia) => (i.tipo === "papel" ? `${(CORPOS[locale] as Record<string, string>)[i.ref.replace("papeis.", "")] ?? i.ref}: ${i.texto}` : i.texto)),
    itens,
    dimensoes,
    camada: d.camada,
    categorias: d.categorias,
    contraponto: d.contraponto,
  }
}

function semelhancaNoPayload(s: SemelhancaSelecionada, locale: Locale): SemelhancaNoPayload {
  return { id: s.fato.id, fato: frasearSemelhanca(s.fato, locale), nucleo: s.itens.map((i) => i.texto) }
}

export const sustentaTensao = (d: DinamicaNoPayload) => d.categorias.includes("discordante") || d.itens.some((i) => i.tipo === "tensao")
export const sustentaEncontro = (d: DinamicaNoPayload) =>
  d.categorias.includes("harmonico") || d.categorias.includes("variavel") || d.itens.some((i) => i.via === "favoravel" || (d.camada === "overlays" && i.tipo === "nucleo"))

const dinamicasDoVinculo = (sel: SelecaoSinastria, locale: Locale, vinculo: Vinculo | null) => ({
  aspectos: sel.aspectos.map((d) => dinamicaNoPayload(d, locale, vinculo)).filter((d): d is DinamicaNoPayload => d !== null),
  overlays: sel.overlays.map((d) => dinamicaNoPayload(d, locale, vinculo)).filter((d): d is DinamicaNoPayload => d !== null),
})

/** Os blocos elegíveis: só os que a evidência selecionada, como o vínculo a recebe, sustenta. */
function elegiveis(dinamicas: DinamicaNoPayload[], temSemelhanca: boolean): IdDeBloco[] {
  const ok = new Set<IdDeBloco>()
  if (dinamicas.length > 0) {
    ok.add("sintese_da_relacao")
    ok.add("sintese_final")
  }
  if (temSemelhanca) ok.add("pontos_em_comum")
  if (dinamicas.some(sustentaEncontro)) ok.add("onde_se_encontram")
  if (dinamicas.some(sustentaTensao)) ok.add("onde_ha_tensao")
  for (const [bloco, dims] of Object.entries(DIMENSOES_DO_BLOCO) as Array<[IdDeBloco, readonly Dimensao[]]>) {
    if (dinamicas.some((d) => d.dimensoes.some((x) => dims.includes(x)))) ok.add(bloco)
  }
  return BLOCOS.filter((b) => ok.has(b))
}

export function blocosElegiveisDe(sel: SelecaoSinastria, locale: Locale = "pt", vinculo: Vinculo | null = null): IdDeBloco[] {
  const { aspectos, overlays } = dinamicasDoVinculo(sel, locale, vinculo)
  return elegiveis([...aspectos, ...overlays], sel.semelhancas.length > 0)
}

export function montarPayload(sel: SelecaoSinastria, opcoes: { locale: Locale; vinculo: Vinculo }): PayloadSinastria {
  const { locale, vinculo } = opcoes
  const { aspectos, overlays } = dinamicasDoVinculo(sel, locale, vinculo)
  const semelhancas = sel.semelhancas.map((s) => semelhancaNoPayload(s, locale))
  const blocosElegiveis = elegiveis([...aspectos, ...overlays], semelhancas.length > 0)
  const noPayload = new Set([...aspectos, ...overlays].map((d) => d.id))
  const omitidas = [...sel.aspectos, ...sel.overlays].filter((d) => !noPayload.has(d.id)).map((d) => d.id)
  const idsCitaveis = [
    ...aspectos.flatMap((d) => [d.id, ...d.fatos.map((f) => f.id)]),
    ...overlays.flatMap((d) => [d.id, ...d.fatos.map((f) => f.id)]),
    ...semelhancas.map((s) => s.id),
  ]
  return {
    locale,
    vinculo,
    aspectos,
    overlays,
    semelhancas,
    omitidasPorVinculo: omitidas,
    ressalvaDasSemelhancas: sel.ressalvasDasSemelhancas[0]?.texto ?? null,
    indisponibilidades: sel.indisponibilidades.map((i) => frasearIndisponivel(i, locale)),
    blocosElegiveis,
    enfase: ENFASE_POR_VINCULO[vinculo].filter((b) => blocosElegiveis.includes(b)),
    idsCitaveis: [...new Set(idsCitaveis)],
  }
}
