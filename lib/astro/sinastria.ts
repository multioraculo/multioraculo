/**
 * A sinastria natal: o que dois mapas, medidos um contra o outro, têm de fato.
 *
 * Determinístico e sem interpretação. Esta camada devolve FATOS com
 * identificador, e é sobre eles que a síntese vai trabalhar e o verificador vai
 * conferir. O tipo de vínculo (romântico, amizade...) NÃO entra aqui: ele só
 * escolhe, mais adiante, quais dimensões a leitura destaca. Nenhuma função
 * deste arquivo recebe o vínculo, e é isso que garante que ele não mexe em
 * aspecto, orbe nem relevância.
 *
 * DE ONDE VEM CADA REGRA (Davison, Synastry, 1977; páginas do PDF em
 * `docs/auditoria-davison-sinastria.md`). Quando a regra é do projeto e não do
 * livro, isto está dito ao lado dela. Nada aqui finge que o livro prescreve
 * mais do que prescreve.
 *
 *  - ORBES. O livro dá uma FAIXA, uma vez (p. 56): conjunção, sextil,
 *    quadratura, trígono e oposição "not more than about two or three
 *    degrees", "a degree or two more" com luminares, e os demais aspectos
 *    "within about a degree and a half". Aqui se usa o TETO de cada faixa
 *    (3°, 5° e 1,5°). É uma ESCOLHA do projeto dentro do que o livro permite,
 *    e não um número que ele prescreva.
 *  - ÂNGULOS (Asc e MC). O livro não dá orbe para eles. Usa-se 3° nos cinco
 *    aspectos maiores, SEM a extensão dos luminares: é uma INFERÊNCIA
 *    EDITORIAL CONSERVADORA, marcada em cada fato (`inferido`). O quincunce
 *    com ângulo continua em 1,5°: a inferência nunca alarga o que o livro
 *    estreita.
 *  - ASPECTOS. Os seis que o projeto já usa. Semi-sextil, semi-quadratura e
 *    sesquiquadratura são sustentados pelo livro e ficam de fora do MVP.
 *  - CATEGORIA. Trígono e sextil são harmônicos, quadratura, oposição e
 *    quincunce são discordantes (p. 52). A conjunção é variável, e a oposição
 *    também o é segundo p. 55; aqui a oposição fica discordante, com
 *    `tambemVariavel`. Harmônico não é "bom" nem discordante é "mau" (p. 27,
 *    53): a categoria descreve o ângulo, não julga a relação.
 *  - ANGULO × ANGULO (Asc de A com Asc de B) não entra: o livro não os trata.
 *  - OVERLAYS (p. 93 a 139). O planeta de um na casa do outro, com a direção
 *    preservada. Só os dez corpos, só com hora de quem é dono da casa, e a
 *    casa é a que o motor calculou: não há "orbe de cúspide", porque o livro
 *    não dá limiar numérico.
 *  - DIGNIDADES E AFLIÇÕES. O livro modula todo par por elas. O projeto NÃO as
 *    calcula nesta versão, e nenhum fato afirma fortalecimento ou
 *    enfraquecimento. Limite metodológico interno.
 *  - AGREGAÇÃO. Não existe aqui contagem de favoráveis contra discordantes, nem
 *    nota de compatibilidade. `forca` é sempre nula: os pesos são decisão do
 *    produto e ainda não foram tomados.
 *
 * SEM HORA a regra é a das Interconexões, estendida para dois lados: um
 * aspecto só existe se vale em TODO o intervalo possível dos dois pontos. Com o
 * teto de 5°, isso desliga por completo os aspectos da Lua de quem não sabe a
 * hora (ela anda 12 a 15° por dia), e é uma propriedade da conta, não uma
 * escolha. O que sobra da Lua é o signo, quando o intervalo cabe em um só.
 */
import type { Corpo } from "./ceu"
import { casaDe, pontosDoMapa, separacao, type PontoNatal } from "./interconexoes"
import { CORPOS_MAPA, type MapaNatal, type RetrogradoEstado } from "./mapa"
import { ANGULO_ASPECTO, ELEMENTO, MODO } from "./simbolos"

/** Muda quando orbe, regra ou categoria mudam: invalida qualquer cache futuro. */
export const VERSAO_SINASTRIA = "sinastria-2026-10-a"

export type Pessoa = "A" | "B"

/** Os seis aspectos do projeto, e só eles. */
export const ASPECTOS_SINASTRIA = ["conjunction", "opposition", "square", "trine", "sextile", "quincunx"] as const
export type AspectoSinastria = (typeof ASPECTOS_SINASTRIA)[number]

const MAIORES: ReadonlySet<string> = new Set(["conjunction", "opposition", "square", "trine", "sextile"])
const LUMINARES: ReadonlySet<string> = new Set(["sun", "moon"])

/** Teto de cada faixa da fonte (p. 56). Escolha do projeto, não prescrição do livro. */
export const ORBES = {
  maior: 3,
  maiorComLuminar: 5,
  menor: 1.5,
  /** inferência editorial: o livro não dá orbe para Asc e MC */
  angulo: 3,
} as const

export type GrupoDeOrbe = "maior" | "maior_com_luminar" | "menor" | "angulo_inferido"

export type Fonte = { regra: string; pdfPagina: number }

export type Indisponivel =
  | "asc"
  | "mc"
  | "ic"
  | "desc"
  | "casas"
  | "overlays"
  | "grupos_de_casa"
  | "hemisferios"
  | "elemento_dominante"
  | "modo_dominante"
  | `signo:${string}`
  | `retrogradacao:${string}`
  | `aspectos:${string}`
  | `overlay:${string}`

export type MotivoIndisponivel =
  | "hora_desconhecida"
  | "intervalo_cruza_signo"
  | "estacao_no_dia"
  | "intervalo_cruza_casa"
  | "orbe_nao_robusto"
  | "empate_sem_ascendente"
  | "empate_exige_regente_do_ascendente"
  | "sem_criterio_na_fonte"

export type Disponibilidade = {
  dependeDeHora: boolean
  /** firme = vale no intervalo inteiro das duas pessoas */
  robustez: "firme"
}

export type FatoAspecto = {
  tipo: "aspecto"
  /** "A.venus~B.mars:trine": o dono vem antes do corpo, então A↔B nunca vira B↔A */
  id: string
  corpoA: string
  corpoB: string
  aspecto: AspectoSinastria
  /** no ponto médio do intervalo, quando há intervalo */
  orbe: number
  /** o pior orbe possível no intervalo; igual a `orbe` quando as horas são conhecidas */
  piorOrbe: number
  orbeLimite: number
  grupoDeOrbe: GrupoDeOrbe
  /** verdadeiro quando o limite é inferência editorial e não faixa da fonte */
  inferido: boolean
  categoria: "harmonico" | "discordante" | "variavel"
  /** conjunção e oposição são "variáveis" segundo o livro (p. 55) */
  tambemVariavel: boolean
  retroA: RetrogradoEstado | null
  retroB: RetrogradoEstado | null
  /** não sustentada pela fonte para aspecto entre dois mapas natais */
  direcao: null
  /** os pesos ainda não foram decididos */
  forca: null
  /** orbe / limite: uma medida, não um peso */
  exatidao: number
  disponibilidade: Disponibilidade
  fonte: Fonte
}

export type FatoOverlay = {
  tipo: "overlay"
  /** "A.mars@B.casa7": o planeta é de A, a casa é de B */
  id: string
  planeta: string
  donoDoPlaneta: Pessoa
  donoDaCasa: Pessoa
  casa: number
  direcao: "A_em_B" | "B_em_A"
  sistemaDeCasas: string
  disponibilidade: Disponibilidade
  fonte: Fonte
}

export type FatoSemelhanca = {
  tipo: "semelhanca"
  id: string
  dimensao: "elemento" | "elemento_do_sol" | "modo" | "signo_do_corpo"
  padraoA: string
  padraoB: string
  tipoDeSemelhanca: "igual" | "mesma_polaridade" | "polaridade_oposta" | "diferente"
  contagensA?: number[]
  contagensB?: number[]
  /**
   * Como cada lado chegou ao seu dominante: só a contagem, ou um desempate da
   * fonte (p. 40). Só existe nas dimensões `elemento` e `modo`.
   */
  desempateA?: "contagem" | "ascendente" | "sol"
  desempateB?: "contagem" | "ascendente" | "sol"
  /** a contagem tem corpo com signo indefinido (a Lua, quase sempre) */
  condicional: boolean
  classe?: "geracional" | "rapido" | "intermediario"
  /**
   * Semelhança não é facilidade. O livro diz que parecer demais pode virar
   * competição e falta de contraponto (p. 30, 39). Presente sempre que os dois
   * lados são iguais.
   */
  ressalvaDaFonte: "semelhanca_nao_implica_facilidade" | null
  fonte: Fonte
}

export type FatoIndisponibilidade = {
  tipo: "indisponivel"
  pessoa: Pessoa
  item: Indisponivel
  motivo: MotivoIndisponivel
}

export type Recusada = {
  a: string
  b: string
  aspecto: AspectoSinastria
  orbe: number
  piorOrbe: number
  orbeLimite: number
}

export type ResultadoSinastria = {
  versao: string
  aspectos: FatoAspecto[]
  overlays: FatoOverlay[]
  semelhancas: FatoSemelhanca[]
  indisponibilidades: FatoIndisponibilidade[]
  /** candidatos que existiriam no meio do intervalo e não valem no intervalo inteiro */
  recusadas: Recusada[]
}

const F_ORBES: Fonte = { regra: "davison:orbes", pdfPagina: 56 }
const F_INFERENCIA_ANGULO: Fonte = { regra: "inferencia-editorial:orbe-de-angulo", pdfPagina: 56 }
const F_OVERLAY: Fonte = { regra: "davison:house-interchanges", pdfPagina: 93 }
const F_ELEMENTO: Fonte = { regra: "davison:elementos", pdfPagina: 32 }
const F_MODO: Fonte = { regra: "davison:quadruplicidades", pdfPagina: 46 }
const F_SIGNO: Fonte = { regra: "davison:mesmo-signo", pdfPagina: 30 }

/** O orbe máximo de um par, e de onde ele vem. */
export function orbeDoPar(aspecto: string, a: string, b: string): { limite: number; grupo: GrupoDeOrbe; inferido: boolean } {
  const angulo = a === "asc" || a === "mc" || b === "asc" || b === "mc"
  if (!MAIORES.has(aspecto)) return { limite: ORBES.menor, grupo: "menor", inferido: false }
  // o ângulo vence o luminar: a extensão de 5° não vale quando há Asc ou MC
  if (angulo) return { limite: ORBES.angulo, grupo: "angulo_inferido", inferido: true }
  if (LUMINARES.has(a) || LUMINARES.has(b)) return { limite: ORBES.maiorComLuminar, grupo: "maior_com_luminar", inferido: false }
  return { limite: ORBES.maior, grupo: "maior", inferido: false }
}

function categoriaDe(aspecto: string): Pick<FatoAspecto, "categoria" | "tambemVariavel"> {
  if (aspecto === "trine" || aspecto === "sextile") return { categoria: "harmonico", tambemVariavel: false }
  if (aspecto === "conjunction") return { categoria: "variavel", tambemVariavel: true }
  if (aspecto === "opposition") return { categoria: "discordante", tambemVariavel: true }
  return { categoria: "discordante", tambemVariavel: false }
}

/**
 * O pior orbe que o aspecto pode ter dentro dos dois intervalos. A distância
 * entre os dois pontos só depende da diferença de longitudes, então os dois
 * intervalos viram um só, o da diferença, e basta varrê-lo.
 */
function piorOrbe(a: PontoNatal, b: PontoNatal, angulo: number): number {
  if (!a.intervalo && !b.intervalo) return Math.abs(separacao(a.lon, b.lon) - angulo)
  const ia = a.intervalo ?? { min: a.lon, max: a.lon }
  const ib = b.intervalo ?? { min: b.lon, max: b.lon }
  const dMin = ia.min - ib.max
  const dMax = ia.max - ib.min
  const passos = 400
  let pior = 0
  for (let k = 0; k <= passos; k++) {
    const d = dMin + ((dMax - dMin) * k) / passos
    pior = Math.max(pior, Math.abs(separacao(d, 0) - angulo))
  }
  return pior
}

const arredonda = (n: number) => Math.round(n * 1000) / 1000

function estadoRetro(mapa: MapaNatal, id: string): RetrogradoEstado | null {
  return mapa.corpos.find((c) => c.corpo === id)?.retrogradoEstado ?? null
}

function aspectosEntre(a: MapaNatal, b: MapaNatal): { fatos: FatoAspecto[]; recusadas: Recusada[] } {
  const fatos: FatoAspecto[] = []
  const recusadas: Recusada[] = []
  const pa = pontosDoMapa(a)
  const pb = pontosDoMapa(b)

  for (const x of pa) {
    for (const y of pb) {
      // Asc e MC de um contra Asc e MC do outro: o livro não os trata
      if (x.tipo === "angulo" && y.tipo === "angulo") continue

      for (const aspecto of ASPECTOS_SINASTRIA) {
        const angulo = ANGULO_ASPECTO[aspecto]
        const { limite, grupo, inferido } = orbeDoPar(aspecto, x.id, y.id)
        const orbe = Math.abs(separacao(x.lon, y.lon) - angulo)
        if (orbe > limite) continue

        const pior = piorOrbe(x, y, angulo)
        if (pior > limite) {
          recusadas.push({ a: x.id, b: y.id, aspecto, orbe: arredonda(orbe), piorOrbe: arredonda(pior), orbeLimite: limite })
          continue
        }

        fatos.push({
          tipo: "aspecto",
          id: `A.${x.id}~B.${y.id}:${aspecto}`,
          corpoA: x.id,
          corpoB: y.id,
          aspecto,
          orbe: arredonda(orbe),
          piorOrbe: arredonda(pior),
          orbeLimite: limite,
          grupoDeOrbe: grupo,
          inferido,
          ...categoriaDe(aspecto),
          retroA: x.tipo === "corpo" ? estadoRetro(a, x.id) : null,
          retroB: y.tipo === "corpo" ? estadoRetro(b, y.id) : null,
          direcao: null,
          forca: null,
          exatidao: arredonda(orbe / limite),
          disponibilidade: { dependeDeHora: x.tipo === "angulo" || y.tipo === "angulo" || Boolean(x.intervalo || y.intervalo), robustez: "firme" },
          fonte: inferido ? F_INFERENCIA_ANGULO : F_ORBES,
        })
      }
    }
  }
  fatos.sort((p, q) => (p.id < q.id ? -1 : 1))
  return { fatos, recusadas }
}

/** Em que casa de `dono` cai o planeta, e se isso vale no intervalo inteiro. */
function overlaysDe(planeta: MapaNatal, dono: MapaNatal, sentido: "A_em_B" | "B_em_A"): { fatos: FatoOverlay[]; incertos: string[] } {
  const fatos: FatoOverlay[] = []
  const incertos: string[] = []
  if (!dono.cuspides) return { fatos, incertos }
  const donoDoPlaneta: Pessoa = sentido === "A_em_B" ? "A" : "B"
  const donoDaCasa: Pessoa = sentido === "A_em_B" ? "B" : "A"

  for (const c of CORPOS_MAPA) {
    const corpo = planeta.corpos.find((x) => x.corpo === c)
    if (!corpo) continue
    const meia = corpo.incerteza / 2
    const casas = new Set<number>()
    const passos = corpo.incerteza > 0 ? 200 : 0
    for (let k = 0; k <= passos; k++) {
      const lon = passos === 0 ? corpo.lon : corpo.lon - meia + (corpo.incerteza * k) / passos
      casas.add(casaDe(lon, dono.cuspides))
    }
    if (casas.size !== 1) {
      incertos.push(c)
      continue
    }
    const casa = [...casas][0]
    fatos.push({
      tipo: "overlay",
      id: `${donoDoPlaneta}.${c}@${donoDaCasa}.casa${casa}`,
      planeta: c,
      donoDoPlaneta,
      donoDaCasa,
      casa,
      direcao: sentido,
      sistemaDeCasas: dono.sistemaCasas,
      disponibilidade: { dependeDeHora: true, robustez: "firme" },
      fonte: F_OVERLAY,
    })
  }
  return { fatos, incertos }
}

// ── pontos em comum ──────────────────────────────────────────────────────────

const ELEMENTOS = ["fire", "earth", "air", "water"]
const MODOS = ["cardinal", "fixed", "mutable"]

type Dominante =
  | { estado: "definido"; valor: number; via: "contagem" | "ascendente" | "sol" }
  | { estado: "indeterminado" }
  | { estado: "empate"; motivo: "empate_sem_ascendente" | "empate_exige_regente_do_ascendente" | "sem_criterio_na_fonte" }

type Perfil = { contagens: number[]; indefinidos: number; dominante: Dominante }

/**
 * O elemento (ou modo) em que há mais corpos. Conta-se os dez corpos, e o do
 * Sol não decide sozinho (p. 32, 39).
 *
 * NO EMPATE DE ELEMENTOS a fonte dá, em ordem (p. 40): (1) o elemento do
 * Ascendente; (2) "the majority group containing the Sun", se o do Ascendente
 * não estiver entre os empatados; (3) o regente do Ascendente; (4) se nada
 * resolver, os dois ficam "equally poised".
 *
 *   regra da fonte JÁ IMPLEMENTADA:  1 e 2, só com hora conhecida.
 *   regra da fonte NÃO implementada: 3. Chegando nela, o empate é declarado
 *     como `empate_exige_regente_do_ascendente`: não é um empate genuíno da
 *     fonte, é um ponto onde nosso cálculo parou.
 *
 * SEM HORA o passo 1 não pode ser dado, e o passo 2 só vale "quando o
 * Ascendente não resolveu", o que sem Ascendente não se sabe. Então o empate
 * fica `empate_sem_ascendente`, e o Sol NÃO entra no lugar do Ascendente.
 *
 * Nos MODOS a fonte não dá desempate nenhum: empate é `sem_criterio_na_fonte`.
 *
 * Um corpo com signo indefinido (a Lua que troca de signo no dia) não é
 * contado, e pode virar o dominante de qualquer lado. Só há dominante quando
 * ele vence mesmo que todos os indefinidos fossem para o segundo colocado.
 */
function perfilDe(mapa: MapaNatal, tabela: number[], tamanho: number, desempateDeElementos: boolean): Perfil {
  const contagens = new Array<number>(tamanho).fill(0)
  let indefinidos = 0
  for (const c of mapa.corpos) {
    if (!c.signoDefinido) indefinidos += 1
    else contagens[tabela[c.signo]] += 1
  }
  for (let e = 0; e < tamanho; e++) {
    const outros = contagens.filter((_, i) => i !== e)
    if (contagens[e] > Math.max(...outros) + indefinidos) {
      return { contagens, indefinidos, dominante: { estado: "definido", valor: e, via: "contagem" } }
    }
  }
  if (indefinidos > 0) return { contagens, indefinidos, dominante: { estado: "indeterminado" } }

  const topo = Math.max(...contagens)
  const empatados = contagens.map((n, i) => (n === topo ? i : -1)).filter((i) => i >= 0)
  if (empatados.length === 1) return { contagens, indefinidos, dominante: { estado: "definido", valor: empatados[0], via: "contagem" } }
  if (!desempateDeElementos) return { contagens, indefinidos, dominante: { estado: "empate", motivo: "sem_criterio_na_fonte" } }

  if (mapa.asc === null) return { contagens, indefinidos, dominante: { estado: "empate", motivo: "empate_sem_ascendente" } }
  const noAsc = tabela[Math.floor((((mapa.asc % 360) + 360) % 360) / 30)]
  if (empatados.includes(noAsc)) return { contagens, indefinidos, dominante: { estado: "definido", valor: noAsc, via: "ascendente" } }
  const sol = mapa.corpos.find((c) => c.corpo === "sun")
  if (sol && empatados.includes(tabela[sol.signo])) {
    return { contagens, indefinidos, dominante: { estado: "definido", valor: tabela[sol.signo], via: "sol" } }
  }
  return { contagens, indefinidos, dominante: { estado: "empate", motivo: "empate_exige_regente_do_ascendente" } }
}

function semelhancaDeElemento(a: number, b: number): FatoSemelhanca["tipoDeSemelhanca"] {
  if (a === b) return "igual"
  // fogo e ar são positivos; terra e água, negativos (p. 52: sextil entre elementos compatíveis)
  return a % 2 === b % 2 ? "mesma_polaridade" : "polaridade_oposta"
}

const RESSALVA = "semelhanca_nao_implica_facilidade" as const

function semelhancas(a: MapaNatal, b: MapaNatal, indisp: FatoIndisponibilidade[]): FatoSemelhanca[] {
  const fatos: FatoSemelhanca[] = []

  const elA = perfilDe(a, ELEMENTO, 4, true)
  const elB = perfilDe(b, ELEMENTO, 4, true)
  const moA = perfilDe(a, MODO, 3, false)
  const moB = perfilDe(b, MODO, 3, false)

  const motivo = (p: Perfil): MotivoIndisponivel => (p.dominante.estado === "empate" ? p.dominante.motivo : "intervalo_cruza_signo")
  const registra = (pessoa: Pessoa, item: "elemento_dominante" | "modo_dominante", p: Perfil) => {
    if (p.dominante.estado !== "definido") indisp.push({ tipo: "indisponivel", pessoa, item, motivo: motivo(p) })
  }
  registra("A", "elemento_dominante", elA)
  registra("B", "elemento_dominante", elB)
  registra("A", "modo_dominante", moA)
  registra("B", "modo_dominante", moB)

  if (elA.dominante.estado === "definido" && elB.dominante.estado === "definido") {
    const tipo = semelhancaDeElemento(elA.dominante.valor, elB.dominante.valor)
    fatos.push({
      tipo: "semelhanca",
      id: "elemento",
      dimensao: "elemento",
      padraoA: ELEMENTOS[elA.dominante.valor],
      padraoB: ELEMENTOS[elB.dominante.valor],
      tipoDeSemelhanca: tipo,
      contagensA: elA.contagens,
      contagensB: elB.contagens,
      desempateA: elA.dominante.via,
      desempateB: elB.dominante.via,
      condicional: elA.indefinidos + elB.indefinidos > 0,
      ressalvaDaFonte: tipo === "igual" ? RESSALVA : null,
      fonte: F_ELEMENTO,
    })
  }

  const solA = a.corpos.find((c) => c.corpo === "sun")
  const solB = b.corpos.find((c) => c.corpo === "sun")
  if (solA?.signoDefinido && solB?.signoDefinido) {
    const ea = ELEMENTO[solA.signo]
    const eb = ELEMENTO[solB.signo]
    const tipo = semelhancaDeElemento(ea, eb)
    fatos.push({
      tipo: "semelhanca",
      id: "elemento_do_sol",
      dimensao: "elemento_do_sol",
      padraoA: ELEMENTOS[ea],
      padraoB: ELEMENTOS[eb],
      tipoDeSemelhanca: tipo,
      condicional: false,
      ressalvaDaFonte: tipo === "igual" ? RESSALVA : null,
      fonte: { regra: "davison:elemento-do-sol", pdfPagina: 39 },
    })
  }

  if (moA.dominante.estado === "definido" && moB.dominante.estado === "definido") {
    const igual = moA.dominante.valor === moB.dominante.valor
    fatos.push({
      tipo: "semelhanca",
      id: "modo",
      dimensao: "modo",
      padraoA: MODOS[moA.dominante.valor],
      padraoB: MODOS[moB.dominante.valor],
      tipoDeSemelhanca: igual ? "igual" : "diferente",
      contagensA: moA.contagens,
      contagensB: moB.contagens,
      desempateA: moA.dominante.via,
      desempateB: moB.dominante.via,
      condicional: moA.indefinidos + moB.indefinidos > 0,
      ressalvaDaFonte: igual ? RESSALVA : null,
      fonte: F_MODO,
    })
  }

  // o mesmo corpo no mesmo signo. Entre os lentos isso é a geração, e o livro
  // diz que quase não informa nada (p. 30); entre os rápidos, é o que importa
  for (const ca of a.corpos) {
    const cb = b.corpos.find((c) => c.corpo === ca.corpo)
    if (!cb || !ca.signoDefinido || !cb.signoDefinido || ca.signo !== cb.signo) continue
    const classe = ["uranus", "neptune", "pluto"].includes(ca.corpo)
      ? "geracional"
      : ["jupiter", "saturn"].includes(ca.corpo)
        ? "intermediario"
        : "rapido"
    fatos.push({
      tipo: "semelhanca",
      id: `signo:${ca.corpo}`,
      dimensao: "signo_do_corpo",
      padraoA: `${ca.corpo}:${ca.signo}`,
      padraoB: `${cb.corpo}:${cb.signo}`,
      tipoDeSemelhanca: "igual",
      condicional: false,
      classe,
      ressalvaDaFonte: RESSALVA,
      fonte: F_SIGNO,
    })
  }
  return fatos
}

// ── indisponibilidades ───────────────────────────────────────────────────────

function indisponiveisDe(pessoa: Pessoa, mapa: MapaNatal, comAspectoDuvidoso: Set<string>, overlayIncerto: Set<string>): FatoIndisponibilidade[] {
  const saida: FatoIndisponibilidade[] = []
  const poe = (item: Indisponivel, motivo: MotivoIndisponivel) => saida.push({ tipo: "indisponivel", pessoa, item, motivo })

  if (!mapa.horaConhecida) {
    for (const item of ["asc", "mc", "ic", "desc", "casas", "overlays", "grupos_de_casa", "hemisferios"] as const) {
      poe(item, "hora_desconhecida")
    }
  }
  for (const c of mapa.corpos) {
    if (!c.signoDefinido) poe(`signo:${c.corpo}`, "intervalo_cruza_signo")
    if (c.retrogradoEstado === "indeterminado") poe(`retrogradacao:${c.corpo}`, "estacao_no_dia")
    if (comAspectoDuvidoso.has(c.corpo)) poe(`aspectos:${c.corpo}`, "orbe_nao_robusto")
    if (overlayIncerto.has(c.corpo)) poe(`overlay:${c.corpo}`, "intervalo_cruza_casa")
  }
  return saida
}

/**
 * Compara dois mapas. A é quem pede, B é o outro; a ordem importa e é
 * preservada em todos os identificadores.
 */
export function sinastria(a: MapaNatal, b: MapaNatal): ResultadoSinastria {
  const { fatos: aspectos, recusadas } = aspectosEntre(a, b)

  const aEmB = overlaysDe(a, b, "A_em_B")
  const bEmA = overlaysDe(b, a, "B_em_A")

  // de quem é o corpo que não pôde ser decidido: A é o lado `a` da recusada
  const duvidosoA = new Set(recusadas.filter((r) => CORPOS_MAPA.includes(r.a as Corpo)).map((r) => r.a))
  const duvidosoB = new Set(recusadas.filter((r) => CORPOS_MAPA.includes(r.b as Corpo)).map((r) => r.b))

  const indisponibilidades = [
    ...indisponiveisDe("A", a, duvidosoA, new Set(aEmB.incertos)),
    ...indisponiveisDe("B", b, duvidosoB, new Set(bEmA.incertos)),
  ]
  const comuns = semelhancas(a, b, indisponibilidades)

  return {
    versao: VERSAO_SINASTRIA,
    aspectos,
    overlays: [...aEmB.fatos, ...bEmA.fatos].sort((p, q) => (p.id < q.id ? -1 : 1)),
    semelhancas: comuns,
    indisponibilidades,
    recusadas,
  }
}
