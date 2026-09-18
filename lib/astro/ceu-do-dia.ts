/**
 * A leitura coletiva do céu: o que o dia coloca em evidência, para todo mundo.
 *
 * DUAS CAMADAS, e a separação é o ponto do módulo.
 *
 * A camada factual é a tela: mandala, posições com nome por extenso, aspectos,
 * orbes. Ela é a prova, e fica visível. A camada interpretativa é este texto, e
 * ele NÃO repete nome de planeta, de signo, de aspecto nem de fase. Quem lê não
 * deveria precisar decodificar astrologia para entender a mensagem.
 *
 * Isso não afrouxa a exigência, muda onde ela é cobrada: cada termo declara de
 * qual pedaço de qual fato saiu, e o verificador confere se aquela origem
 * existe, se o termo não é só a base dela repetida, e se um termo que diz vir
 * de uma retrogradação carrega mesmo o movimento de volta.
 *
 * A seleção derruba aspecto entre dois lentos mesmo com orbe pequeno: Netuno a
 * zero grau de Plutão é o fundo de uma geração, não a notícia de hoje.
 */
import type { Locale } from "@/lib/i18n/config"
import { ORBE_MAX, ORBE_MAX_LUA, type Ceu, type Corpo } from "./ceu"
import { ASPECTOS, CORPOS, FASES, LUNACOES, SIGNOS } from "./nomes"
import {
  ANGULO_ASPECTO,
  FUNCAO_VERBOS,
  GLOSA_ASPECTO,
  GLOSA_MOVIMENTO,
  LENTOS,
  LINHA_SIGNO,
} from "./simbolos"
import { PROIBIDAS, REGRAS_COMUNS, TRACOS } from "./editorial"

export type TermoDoCeu = { texto: string; origem: string }
export type SinteseDoCeu = { termos: TermoDoCeu[]; sintese: string }
export type VereditoDoCeu = { ok: true; sintese: SinteseDoCeu } | { ok: false; violacoes: string[] }

export type FatoDoCeu = {
  id: string
  /** o fato inteiro, com todos os nomes: é o que o modelo lê */
  texto: string
  /** como ele aparece na camada factual da tela, curto */
  factual: string
  nota: number
  corpos: Corpo[]
  /**
   * De que pedaços deste fato um termo pode nascer. São ATÔMICAS: "Plutão" e
   * "retrogradação de Plutão" são duas origens, e cada uma sustenta um termo.
   * Sem isso, um termo dizia vir de um planeta retrógrado sem carregar nada da
   * retrogradação.
   */
  origens: string[]
  /** a base simbólica de cada origem, que já existe no produto */
  bases: Record<string, string[]>
}

const numero = (n: number, locale: Locale) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))

const BASE_ASPECTO: Record<string, number> = {
  conjunction: 1,
  opposition: 0.92,
  square: 0.88,
  trine: 0.72,
  sextile: 0.6,
  quincunx: 0.45,
}

/** Sem signo do leitor, o papel é só o que o corpo é para todo mundo. */
const PAPEL: Record<string, number> = {
  sun: 1.35,
  moon: 1.35,
  mercury: 1.1,
  venus: 1.1,
  mars: 1.1,
  jupiter: 0.95,
  saturn: 0.95,
  uranus: 0.75,
  neptune: 0.75,
  pluto: 0.75,
}

export const QUANTOS_FATOS = 3

/** Os fatos do dia, ordenados, com os dois primeiros já escolhidos por nota. */
export function fatosDoCeu(ceu: Ceu, locale: Locale): { escolhidos: FatoDoCeu[]; todos: FatoDoCeu[] } {
  const signos = SIGNOS[locale]
  const nomes = CORPOS[locale]
  const aspectos = ASPECTOS[locale]
  const onde = (corpo: Corpo) => ceu.posicoes.find((p) => p.corpo === corpo)!
  const candidatos: FatoDoCeu[] = []

  for (const a of ceu.aspectos) {
    if (!BASE_ASPECTO[a.aspecto]) continue
    const orbeMax = a.a === "moon" || a.b === "moon" ? ORBE_MAX_LUA : ORBE_MAX
    const exatidao = 0.55 + 0.45 * (1 - Math.min(a.orbe, orbeMax) / orbeMax)
    const papel = (PAPEL[a.a] + PAPEL[a.b]) / 2
    const geracional = LENTOS.has(a.a) && LENTOS.has(a.b) ? 0.3 : 1
    const tempo = a.orbe < 0.2 ? 1.1 : a.aplicativo ? 1.08 : 0.96
    const pa = onde(a.a)
    const pb = onde(a.b)

    const origens = [nomes[a.a], signos[pa.signo], nomes[a.b], signos[pb.signo], aspectos[a.aspecto]]
    const bases: Record<string, string[]> = {
      [nomes[a.a]]: FUNCAO_VERBOS[locale][a.a],
      [signos[pa.signo]]: [LINHA_SIGNO[locale][pa.signo]],
      [nomes[a.b]]: FUNCAO_VERBOS[locale][a.b],
      [signos[pb.signo]]: [LINHA_SIGNO[locale][pb.signo]],
      [aspectos[a.aspecto]]: [GLOSA_ASPECTO[locale][a.aspecto]],
    }
    for (const [corpo, pos] of [[a.a, pa], [a.b, pb]] as const) {
      if (!pos.retrogrado) continue
      const origem = rotuloRetrogradacao(nomes[corpo], locale)
      origens.push(origem)
      bases[origem] = [GLOSA_MOVIMENTO[locale].retrogrado]
    }

    const retro = (r: boolean) => (r ? `, ${GLOSA_MOVIMENTO[locale].retrogrado.split(",")[0]}` : "")
    candidatos.push({
      id: `aspecto:${a.a}~${a.b}:${a.aspecto}`,
      texto:
        `${nomes[a.a]} ${numero(pa.grau, locale)}° ${signos[pa.signo]}${retro(pa.retrogrado)}` +
        ` / ${aspectos[a.aspecto]} (${ANGULO_ASPECTO[a.aspecto]}°) / ` +
        `${nomes[a.b]} ${numero(pb.grau, locale)}° ${signos[pb.signo]}${retro(pb.retrogrado)}` +
        ` / orbe ${numero(a.orbe, locale)}°`,
      factual: `${nomes[a.a]} ${aspectos[a.aspecto]} ${nomes[a.b]}`,
      nota: BASE_ASPECTO[a.aspecto] * exatidao * papel * geracional * tempo,
      corpos: [a.a, a.b],
      origens,
      bases,
    })
  }

  for (const e of ceu.eventos) {
    const base = e.tipo === "eclipse" ? 2.2 : e.tipo === "lunacao" ? 1.8 : e.tipo === "estacao" ? 1.5 : 1.2
    const corpo: Corpo = e.tipo === "estacao" || e.tipo === "ingresso" ? e.corpo : "moon"
    const origens = [nomes[corpo], signos[e.signo]]
    const bases: Record<string, string[]> = {
      [nomes[corpo]]: FUNCAO_VERBOS[locale][corpo],
      [signos[e.signo]]: [LINHA_SIGNO[locale][e.signo]],
    }
    let texto: string
    if (e.tipo === "lunacao") {
      const fase = LUNACOES[locale][e.fase] ?? e.fase
      texto = `${fase} ${numero(e.grau, locale)}° ${signos[e.signo]}`
      origens.push(fase)
      bases[fase] = [FASES[locale][ceu.faseLua]]
    } else if (e.tipo === "eclipse") {
      texto = `${e.especie === "solar" ? "eclipse solar" : "eclipse lunar"} ${numero(e.grau, locale)}° ${signos[e.signo]}`
    } else if (e.tipo === "estacao") {
      const origem = rotuloRetrogradacao(nomes[e.corpo], locale)
      texto = `${nomes[e.corpo]} ${e.sentido === "direct" ? "direto" : "retrógrado"} ${numero(e.grau, locale)}° ${signos[e.signo]}`
      if (e.sentido !== "direct") {
        origens.push(origem)
        bases[origem] = [GLOSA_MOVIMENTO[locale].retrogrado]
      }
    } else {
      texto = `${nomes[e.corpo]} entra em ${signos[e.signo]}`
    }
    candidatos.push({ id: `evento:${e.tipo}`, texto, factual: texto, nota: base, corpos: [corpo], origens, bases })
  }

  const todos = [...candidatos].sort((x, y) => y.nota - x.nota || (x.id < y.id ? -1 : 1))

  // anti-redundância: uma relação que traz um corpo novo vale mais do que outra
  // que repete os mesmos dois
  const escolhidos: FatoDoCeu[] = []
  const restantes = [...todos]
  while (escolhidos.length < QUANTOS_FATOS && restantes.length) {
    let melhor = 0
    let melhorNota = -1
    restantes.forEach((c, i) => {
      const repetidos = c.corpos.filter((corpo) => escolhidos.some((e) => e.corpos.includes(corpo))).length
      const nota = c.nota * (repetidos === 0 ? 1 : repetidos === 1 ? 0.6 : 0.35)
      if (nota > melhorNota) {
        melhorNota = nota
        melhor = i
      }
    })
    escolhidos.push(restantes.splice(melhor, 1)[0])
  }
  return { escolhidos, todos }
}

function rotuloRetrogradacao(nome: string, locale: Locale): string {
  const palavra = { pt: "retrogradação de", en: "retrogradation of", es: "retrogradación de" }[locale]
  return `${palavra} ${nome}`
}

/** As duas linhas de fatos que a Home mostra acima da síntese. */
export function camadaFactual(ceu: Ceu, escolhidos: FatoDoCeu[], locale: Locale): string[] {
  const signos = SIGNOS[locale]
  const em = { pt: "em", en: "in", es: "en" }[locale]
  const sol = ceu.posicoes.find((p) => p.corpo === "sun")!
  const lua = ceu.posicoes.find((p) => p.corpo === "moon")!
  const primeira = `${CORPOS[locale].sun} ${em} ${signos[sol.signo]} · ${CORPOS[locale].moon} ${FASES[locale][ceu.faseLua]} ${em} ${signos[lua.signo]}`
  const segunda = escolhidos
    .filter((f) => f.id.startsWith("aspecto:"))
    .map((f) => f.factual)
    .join(" · ")
  return segunda ? [primeira, segunda] : [primeira]
}

// ---------------------------------------------------------------------------
// o prompt
// ---------------------------------------------------------------------------

const IDIOMA: Record<Locale, string> = {
  pt: "Responda apenas com JSON válido, sem Markdown. O texto destinado ao leitor é escrito em português do Brasil.",
  en: "Respond only with valid JSON, no Markdown. The text addressed to the reader is written in English.",
  es: "Responde solo con JSON válido, sin Markdown. El texto dirigido al lector se escribe en español.",
}

const PALAVRAS_MAX = 45
const TERMOS = { min: 3, max: 5 }

export function sistemaDoCeu(locale: Locale): string {
  return `${IDIOMA[locale]}

Você escreve a leitura coletiva do céu de hoje no Multioráculo. Ela vale para todas as pessoas, sem exceção: não é horóscopo de signo e não é leitura pessoal.

${REGRAS_COMUNS}

DUAS CAMADAS, E VOCÊ ESCREVE SÓ A SEGUNDA
A tela já mostra a configuração com todos os nomes, logo acima do seu texto: os planetas, os signos, os graus, os aspectos e os orbes. A prova já está dada ali.

Por isso a sua síntese NÃO REPETE NOME NENHUM: nem de planeta, nem de signo, nem de aspecto, nem de fase. Quem lê não deveria precisar decodificar astrologia para entender a mensagem.

Em vez de "Mercúrio em Libra em oposição a Saturno retrógrado em Áries marca um confronto entre comunicação e estrutura", escreva algo como "Pensamento e limite ficam frente a frente, e comparação e definição entram no mesmo movimento".

ISSO NÃO AUTORIZA GENERALIZAR
Cada TERMO nasce de um pedaço declarado de um fato, e você declara qual. O que não pode é um termo que caberia em qualquer outro dia.

O TERMO PRECISA CARREGAR O QUE É ESPECÍFICO DA ORIGEM
As origens são atômicas, e cada uma sustenta um termo só. Um planeta e a retrogradação dele são origens diferentes: se você declarar a retrogradação, o termo precisa trazer o movimento de volta, como revisão, retomada, retorno ou algo que ainda está sendo revisto. E o termo nunca é apenas a base da origem repetida: ele situa aquilo no que está acontecendo hoje.

PELO MENOS UM TERMO VEM DE UM ÂNGULO. O que mudou hoje é a relação entre os corpos, não a qualidade de cada um isolado.

O MOVIMENTO PRIMEIRO, O ENCONTRO DEPOIS. A primeira frase nomeia o que está sendo mobilizado hoje. A segunda nomeia o que esse movimento encontra: o que o sustenta, o que o atravessa, o que o revisa.

VOCÊ NÃO SABE NADA SOBRE QUEM LÊ. Não nomeie esfera nenhuma da vida: nem relações, vínculos, afetos, trabalho, dinheiro ou saúde.

NÃO ESCREVA CONSELHO NEM PEDIDO. O céu não exige, não pede, não demanda, não convida, não favorece, não sugere e não desafia ninguém. Escreva no indicativo o que está posto, o que se aproxima, o que se separa, o que fica em tensão.

O QUE DEVOLVER
- termos: de ${TERMOS.min} a ${TERMOS.max} entradas com texto e origem. A origem é exatamente uma das ORIGENS listadas no fato.
- sintese: DUAS frases, no máximo ${PALAVRAS_MAX} palavras somadas, contendo todos os termos.

Devolva JSON: {"termos": [{"texto": "...", "origem": "..."}], "sintese": "..."}`
}

export function promptCeuDoDia(ceu: Ceu, escolhidos: FatoDoCeu[], locale: Locale): { system: string; user: string } {
  const signos = SIGNOS[locale]
  const sol = ceu.posicoes.find((p) => p.corpo === "sun")!
  const lua = ceu.posicoes.find((p) => p.corpo === "moon")!
  const retro = ceu.posicoes.filter((p) => p.retrogrado).map((p) => CORPOS[locale][p.corpo])

  const linhas = [
    `DIA: ${ceu.dia}`,
    "",
    "O CÉU, EM GERAL",
    `Sol ${numero(sol.grau, locale)}° ${signos[sol.signo]}.`,
    `Lua ${numero(lua.grau, locale)}° ${signos[lua.signo]}, fase ${FASES[locale][ceu.faseLua]}.`,
    retro.length ? `Retrógrados hoje: ${retro.join(", ")}.` : "Nenhum planeta retrógrado hoje.",
    "",
    "FATOS DO DIA (escreva só sobre estes)",
  ]
  escolhidos.forEach((f, i) => {
    linhas.push(`${i + 1}. ${f.texto}`)
    linhas.push(`   ORIGENS possíveis: ${f.origens.join(" | ")}`)
  })
  return { system: sistemaDoCeu(locale), user: linhas.join("\n") }
}

// ---------------------------------------------------------------------------
// verificador
// ---------------------------------------------------------------------------

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const significativas = (texto: string) =>
  semAcento(texto)
    .split(/[^\p{L}]+/u)
    .filter((p) => p.length >= 4)

/** O termo é NADA ALÉM da base da origem? Repetir a base não interpreta nada. */
function ecoTotal(texto: string, base: string[]): boolean {
  const doTermo = significativas(texto)
  if (!doTermo.length) return false
  const daBase = new Set(base.flatMap(significativas))
  return doTermo.every((p) => daBase.has(p))
}

/**
 * Noções que sustentam uma retrogradação, derivadas da glosa do próprio
 * produto ("um tema que volta para revisão"). São raízes e não palavras
 * obrigatórias: revisto, revisão, retomada, retorno, volta e refazer passam.
 */
const NOCOES_RETROGRADACAO: Record<Locale, string[]> = {
  pt: ["revis", "rever", "reve", "retom", "retorn", "volt", "refaz", "reexam", "atras"],
  en: ["revis", "review", "return", "back", "redo", "reexam", "again"],
  es: ["revis", "retom", "retorn", "vuelt", "volv", "rehac", "reexam", "atras"],
}

function carregaRetrogradacao(texto: string, locale: Locale): boolean {
  const t = semAcento(texto)
  return NOCOES_RETROGRADACAO[locale].some((raiz) => t.includes(raiz))
}

export function verificarCeu(params: {
  bruto: unknown
  escolhidos: FatoDoCeu[]
  locale: Locale
  /** mínimo de termos; cai para 3 em dia com menos de dois ângulos */
  minimoTermos?: number
}): VereditoDoCeu {
  const { bruto, escolhidos, locale } = params
  const violacoes: string[] = []

  const termosBrutos = (bruto as { termos?: unknown })?.termos
  const termos: TermoDoCeu[] = Array.isArray(termosBrutos)
    ? termosBrutos
        .map((t) => ({ texto: String((t as TermoDoCeu)?.texto ?? "").trim(), origem: String((t as TermoDoCeu)?.origem ?? "").trim() }))
        .filter((t) => t.texto && t.origem)
    : []
  const sintese = typeof (bruto as { sintese?: unknown })?.sintese === "string" ? (bruto as { sintese: string }).sintese.trim() : ""
  if (!sintese) return { ok: false, violacoes: ["síntese ausente"] }

  // 1. a superfície não nomeia astrologia
  const proibidoNomear = [
    ...Object.values(CORPOS[locale]).filter(Boolean),
    ...SIGNOS[locale],
    ...Object.values(ASPECTOS[locale]),
    ...FASES[locale],
  ]
  for (const nome of proibidoNomear) {
    if (new RegExp(`(^|[^\\p{L}])${nome}([^\\p{L}]|$)`, "iu").test(sintese)) {
      violacoes.push(`a síntese nomeia "${nome}"`)
    }
  }

  // 2. cada termo declara uma origem que existe, e aparece na síntese
  const origensValidas = new Set(escolhidos.flatMap((f) => f.origens))
  const baseDaOrigem = new Map<string, string[]>()
  const fatoDaOrigem = new Map<string, string>()
  for (const f of escolhidos) {
    for (const o of f.origens) {
      baseDaOrigem.set(o, f.bases[o] ?? [])
      if (!fatoDaOrigem.has(o)) fatoDaOrigem.set(o, f.id)
    }
  }

  const minimo = params.minimoTermos ?? TERMOS.min
  if (termos.length < minimo || termos.length > TERMOS.max) {
    violacoes.push(`${termos.length} termos (queremos de ${minimo} a ${TERMOS.max})`)
  }

  const usadas = new Set<string>()
  for (const t of termos) {
    if (!origensValidas.has(t.origem)) {
      violacoes.push(`"${t.texto}" declara origem "${t.origem}", que não existe nos fatos`)
      continue
    }
    if (!semAcento(sintese).includes(semAcento(t.texto))) violacoes.push(`"${t.texto}" não aparece na síntese`)
    if (usadas.has(t.origem)) violacoes.push(`origem "${t.origem}" usada por mais de um termo`)
    usadas.add(t.origem)
    if (ecoTotal(t.texto, baseDaOrigem.get(t.origem) ?? [])) {
      violacoes.push(`"${t.texto}" é só a base de "${t.origem}", não interpreta nada`)
    }
    if (ehRetrogradacao(t.origem, locale) && !carregaRetrogradacao(t.texto, locale)) {
      violacoes.push(`"${t.texto}" vem de "${t.origem}" mas não carrega o movimento de volta`)
    }
  }

  const fatosCobertos = new Set([...usadas].map((o) => fatoDaOrigem.get(o)))
  if (fatosCobertos.size < 2) violacoes.push("todos os termos vêm do mesmo fato")

  // o ângulo é a notícia: sem ele a síntese vira lista de qualidades soltas
  const angulos = new Set(Object.values(ASPECTOS[locale]))
  const temAngulo = escolhidos.some((f) => f.origens.some((o) => angulos.has(o)))
  if (temAngulo && ![...usadas].some((o) => angulos.has(o))) {
    violacoes.push("nenhum termo vem de um ângulo: a relação entre os corpos ficou de fora")
  }

  // 3. as regras editoriais que já valem no resto do produto
  for (const proibida of PROIBIDAS[locale]) {
    const achou = sintese.match(proibida)
    if (achou) violacoes.push(`expressão proibida: "${achou[0].trim()}"`)
  }
  if (TRACOS.test(sintese)) violacoes.push("usa travessão")
  if (/arquetíp|arquétip/i.test(sintese)) violacoes.push('usa a palavra "arquétipo"')

  const CONSELHO = /(exig|ped(e|indo)|demand|convid|favorec|desafi|propõe|sugere|aconselha)\w*/gi
  for (const achou of sintese.matchAll(CONSELHO)) violacoes.push(`fala como conselho: "${achou[0]}"`)
  const VIDA = /(afetiv|afeto|amoros|relaç|relacionament|vínculo|trabalh|carreir|financ|dinheiro|saúde|família)\w*/gi
  for (const achou of sintese.matchAll(VIDA)) violacoes.push(`inventa esfera de vida: "${achou[0]}"`)

  const frases = sintese.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (frases.length !== 2) violacoes.push(`${frases.length} frases (queremos 2)`)
  const palavras = sintese.trim().split(/\s+/).length
  if (palavras > PALAVRAS_MAX) violacoes.push(`${palavras} palavras, acima de ${PALAVRAS_MAX}`)

  return violacoes.length ? { ok: false, violacoes } : { ok: true, sintese: { termos, sintese } }
}

function ehRetrogradacao(origem: string, locale: Locale): boolean {
  const palavra = { pt: "retrogradação de", en: "retrogradation of", es: "retrogradación de" }[locale]
  return origem.startsWith(palavra)
}

/**
 * Quantos termos exigir hoje. Em dia cheio pedimos quatro, porque três deixam
 * a leitura curta demais para o que os fatos ofereciam. Em dia com menos de
 * dois ângulos, três é o que dá para sustentar sem forçar.
 */
export function minimoDeTermos(escolhidos: FatoDoCeu[]): number {
  const angulos = escolhidos.filter((f) => f.id.startsWith("aspecto:")).length
  return angulos >= 2 ? 4 : 3
}
