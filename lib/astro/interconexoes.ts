/**
 * As Interconexões: onde o céu de hoje encontra o mapa de uma pessoa.
 *
 * O céu do dia é o mesmo para todo mundo; o que muda é onde ele toca. Aqui
 * isso é uma medida, não uma opinião: todos os ângulos entre os dez corpos de
 * hoje e cada ponto do mapa natal, com o orbe, o sentido e a casa
 * atravessada. A interpretação vem depois, e vem em cima disto.
 *
 * Nada aqui é escolhido à mão. A seleção é uma ordenação com os fatores
 * abertos, pela mesma lógica que o horóscopo já usa: o aspecto vale pelo que
 * ele é, a exatidão pesa, o ponto natal pesa pelo que ele é na pessoa, e o
 * trânsito pesa pelo quanto ele é notícia — a Lua faz quadratura com todo
 * mundo toda semana, Saturno passa pelo mesmo grau a cada vinte e nove anos.
 *
 * SEM HORA DE NASCIMENTO a incerteza é tratada por intervalo e não é
 * compensada no texto: uma relação só entra se o aspecto valer em TODO o
 * intervalo possível daquele corpo naquele dia. Ascendente, Meio-do-Céu e
 * casas ficam de fora sem exceção, porque giram o círculo inteiro em 24
 * horas. É por isso que quase nenhuma relação com a Lua natal sobrevive: ela
 * anda treze graus por dia, e um orbe de três não cabe nisso.
 *
 * Os nomes não moram aqui. Esta camada devolve identificadores; quem escreve
 * "Saturno" ou "Meio-do-Céu" é o dicionário, no idioma de quem lê.
 */
import { ORBE_MAX, ORBE_MAX_LUA, type Ceu, type Corpo } from "./ceu"
import { ANGULO_ASPECTO } from "./simbolos"
import { CORPOS_MAPA, type MapaNatal } from "./mapa"

export type PontoNatal = {
  /** "sun", "moon", ... ou "asc" e "mc" */
  id: string
  lon: number
  retrogrado: boolean
  casa: number | null
  tipo: "corpo" | "angulo"
  /** onde o corpo pode estar quando a hora é desconhecida */
  intervalo?: { min: number; max: number }
}

export type Interconexao = {
  tipo: "aspecto" | "posicao"
  transito: Corpo
  lonTransito: number
  retroTransito: boolean
  ponto: PontoNatal
  /** ângulo real entre as duas longitudes, de 0 a 180 */
  separacao: number
  aspecto: string
  anguloAspecto: number
  orbe: number
  orbeMax: number
  aplicativo: boolean
  /** casa natal atravessada, quando tipo é "posicao" */
  casa: number | null
  nota: number
  fatores: { base: number; exatidao: number; papelNatal: number; pesoTransito: number; fase: number }
}

export type Recusada = { transito: Corpo; ponto: string; aspecto: string; piorOrbe: number; amplitude: number }

const norm360 = (x: number) => ((x % 360) + 360) % 360

/** Ângulo real entre duas longitudes, de 0 a 180. */
export function separacao(a: number, b: number): number {
  const d = norm360(a - b)
  return d > 180 ? 360 - d : d
}

const BASE_ASPECTO: Record<string, number> = {
  conjunction: 1,
  opposition: 0.92,
  square: 0.88,
  trine: 0.72,
  sextile: 0.6,
  quincunx: 0.45,
}

/** O quanto aquele ponto é o centro da pessoa. */
const PAPEL_NATAL: Record<string, number> = {
  asc: 1.5,
  sun: 1.4,
  moon: 1.4,
  mc: 1.15,
  mercury: 1.1,
  venus: 1.1,
  mars: 1.1,
  jupiter: 0.95,
  saturn: 0.95,
  uranus: 0.7,
  neptune: 0.7,
  pluto: 0.7,
}

/** O quanto aquele trânsito é notícia. */
const PESO_TRANSITO: Record<string, number> = {
  moon: 0.45,
  sun: 1,
  mercury: 0.9,
  venus: 0.9,
  mars: 1.05,
  jupiter: 1.15,
  saturn: 1.3,
  uranus: 1.35,
  neptune: 1.35,
  pluto: 1.4,
}

/** Só os rápidos entram como travessia de casa: os lentos ficam anos na mesma. */
const CASA_RAPIDOS: Record<string, number> = { sun: 1, moon: 0.35, mercury: 0.85, venus: 0.85, mars: 0.9 }

export const orbeMaximo = (transito: string) => (transito === "moon" ? ORBE_MAX_LUA : ORBE_MAX)

/** Em que casa natal cai uma longitude. */
export function casaDe(lon: number, cuspides: number[]): number {
  for (let i = 0; i < 12; i++) {
    const largura = norm360(cuspides[(i + 1) % 12] - cuspides[i])
    if (norm360(lon - cuspides[i]) < largura) return i + 1
  }
  return 1
}

/** Os pontos do mapa que podem receber um aspecto, já com a incerteza junto. */
export function pontosDoMapa(mapa: MapaNatal): PontoNatal[] {
  const pontos: PontoNatal[] = mapa.corpos.map((c) => ({
    id: c.corpo,
    lon: c.lon,
    retrogrado: c.retrogrado,
    casa: c.casa,
    tipo: "corpo",
    // a longitude guardada é o meio do intervalo, então as pontas saem dela
    ...(c.incerteza > 0 ? { intervalo: { min: c.lon - c.incerteza / 2, max: c.lon + c.incerteza / 2 } } : {}),
  }))
  if (mapa.asc !== null) pontos.push({ id: "asc", lon: mapa.asc, retrogrado: false, casa: 1, tipo: "angulo" })
  if (mapa.mc !== null) pontos.push({ id: "mc", lon: mapa.mc, retrogrado: false, casa: 10, tipo: "angulo" })
  return pontos
}

/**
 * Todas as relações reais entre um céu e um mapa.
 *
 * `posicoesDepois` são as longitudes de uma hora adiante, e servem para uma
 * coisa só: saber se o ângulo está se fechando ou se abrindo.
 */
export function interconexoes(
  pontos: PontoNatal[],
  cuspides: number[] | null,
  agora: Record<string, { lon: number; retrogrado: boolean }>,
  daquiUmaHora: Record<string, { lon: number }>,
): { aceitas: Interconexao[]; recusadas: Recusada[] } {
  const aceitas: Interconexao[] = []
  const recusadas: Recusada[] = []

  for (const transito of CORPOS_MAPA) {
    const lonT = agora[transito].lon
    const lonT1 = daquiUmaHora[transito].lon
    const orbeMax = orbeMaximo(transito)

    for (const ponto of pontos) {
      const sep = separacao(lonT, ponto.lon)

      for (const [aspecto, angulo] of Object.entries(ANGULO_ASPECTO)) {
        const orbe = Math.abs(sep - angulo)
        if (orbe > orbeMax) continue

        // a regra do intervalo: sem hora, o aspecto precisa valer no intervalo
        // inteiro, e não só no meio dele
        if (ponto.intervalo) {
          const passos = 400
          let piorOrbe = 0
          for (let k = 0; k <= passos; k++) {
            const lonN = ponto.intervalo.min + ((ponto.intervalo.max - ponto.intervalo.min) * k) / passos
            piorOrbe = Math.max(piorOrbe, Math.abs(separacao(lonT, lonN) - angulo))
          }
          if (piorOrbe > orbeMax) {
            recusadas.push({
              transito,
              ponto: ponto.id,
              aspecto,
              piorOrbe,
              amplitude: ponto.intervalo.max - ponto.intervalo.min,
            })
            continue
          }
        }

        const orbeDepois = Math.abs(separacao(lonT1, ponto.lon) - angulo)
        const fatores = {
          base: BASE_ASPECTO[aspecto],
          exatidao: 0.55 + 0.45 * (1 - orbe / orbeMax),
          papelNatal: PAPEL_NATAL[ponto.id] ?? 0.7,
          pesoTransito: PESO_TRANSITO[transito],
          fase: orbeDepois < orbe ? 1.1 : 0.95,
        }
        aceitas.push({
          tipo: "aspecto",
          transito,
          lonTransito: lonT,
          retroTransito: agora[transito].retrogrado,
          ponto,
          separacao: sep,
          aspecto,
          anguloAspecto: angulo,
          orbe,
          orbeMax,
          aplicativo: orbeDepois < orbe,
          casa: null,
          nota: fatores.base * fatores.exatidao * fatores.papelNatal * fatores.pesoTransito * fatores.fase,
          fatores,
        })
      }
    }

    // travessia de casa natal: posição, não ângulo, e só existe com hora
    if (cuspides && CASA_RAPIDOS[transito]) {
      const casa = casaDe(lonT, cuspides)
      const fatores = { base: 0.55, exatidao: 1, papelNatal: 1, pesoTransito: CASA_RAPIDOS[transito], fase: 1 }
      aceitas.push({
        tipo: "posicao",
        transito,
        lonTransito: lonT,
        retroTransito: agora[transito].retrogrado,
        ponto: { id: `casa${casa}`, lon: cuspides[casa - 1], retrogrado: false, casa, tipo: "angulo" },
        separacao: 0,
        aspecto: "posicao",
        anguloAspecto: 0,
        orbe: 0,
        orbeMax: 0,
        aplicativo: false,
        casa,
        nota: fatores.base * fatores.pesoTransito,
        fatores,
      })
    }
  }

  return { aceitas, recusadas }
}

/**
 * Escolha gulosa: a melhor primeiro, e as seguintes já descontadas quando
 * repetem o corpo em trânsito ou o ponto natal. Ninguém quer ler a mesma
 * relação três vezes com outro nome.
 */
export function selecionar(lista: Interconexao[], quantas: number): Interconexao[] {
  const restantes = [...lista].sort((a, b) => b.nota - a.nota)
  const escolhidas: Interconexao[] = []
  while (escolhidas.length < quantas && restantes.length) {
    let melhor = 0
    let melhorNota = -1
    restantes.forEach((c, i) => {
      let nota = c.nota
      if (escolhidas.some((e) => e.transito === c.transito)) nota *= 0.45
      if (escolhidas.some((e) => e.ponto.id === c.ponto.id)) nota *= 0.45
      if (nota > melhorNota) {
        melhorNota = nota
        melhor = i
      }
    })
    escolhidas.push(restantes.splice(melhor, 1)[0])
  }
  return escolhidas
}

/** O caminho inteiro, do mapa e do céu já calculados até as três escolhidas. */
export function interconexoesDoDia(
  mapa: MapaNatal,
  ceu: Ceu,
  posicoesDepois: Record<string, { lon: number }>,
  quantas = 3,
): { escolhidas: Interconexao[]; todas: Interconexao[]; recusadas: Recusada[] } {
  const agora: Record<string, { lon: number; retrogrado: boolean }> = {}
  for (const p of ceu.posicoes) agora[p.corpo] = { lon: p.lon, retrogrado: p.retrogrado }
  const { aceitas, recusadas } = interconexoes(pontosDoMapa(mapa), mapa.cuspides, agora, posicoesDepois)
  return { escolhidas: selecionar(aceitas, quantas), todas: aceitas, recusadas }
}
