/**
 * A tiragem astrológica: quais três movimentos do céu de hoje importam para
 * cada signo, e por quê.
 *
 * O céu é o mesmo para os doze. O que muda é o peso: o regente do signo pesa
 * mais, um planeta atravessando o próprio signo pesa mais, e um aspecto entre
 * dois planetas lentos pesa pouco mesmo quando está quase exato (ele dura
 * meses; não é notícia de hoje).
 *
 * Nada aqui depende de modelo de linguagem. Mesma data e mesmo signo devolvem
 * sempre os mesmos três movimentos, e é isso que o teste de regressão trava.
 *
 * A escala foi calibrada contra o céu real de quatro datas, verificando duas
 * coisas: que o aspecto mais exato do céu (Netuno sextil Plutão, orbe 0,01°,
 * que dura meses) nunca entra, e que os doze signos não recebem a mesma
 * seleção. Sem as cartas de posição, recebem: em dias calmos o céu tem só
 * três aspectos pessoais, e não há de onde tirar diferença.
 */
import { ORBE_MAX, ORBE_MAX_LUA, posicaoDe, type Ceu, type Corpo, type Evento } from "./ceu"
import { ELEMENTO, LENTOS, PESSOAIS, REGENTE, REGENTE_TRADICIONAL } from "./simbolos"

export type MovimentoBase = { id: string; nota: number }

export type Movimento = MovimentoBase &
  (
    | { tipo: "aspecto"; a: Corpo; b: Corpo; aspecto: string; orbe: number; aplicativo: boolean }
    | { tipo: "posicao"; corpo: Corpo; signo: number; grau: number; retrogrado: boolean; noProprioSigno: boolean }
    | { tipo: "evento"; evento: Evento }
  )

/** força própria de cada ângulo */
const BASE_ASPECTO: Record<string, number> = {
  conjunction: 1, opposition: 0.92, square: 0.88, trine: 0.72, sextile: 0.6, quincunx: 0.45,
}

/**
 * Trânsito curto é notícia; trânsito de anos é cenário. Sem isto, "Sol em
 * Virgem" (que vale um mês inteiro) abriria a leitura de Virgem todo dia.
 */
const DURACAO: Record<Corpo, number> = {
  moon: 1.15, sun: 0.9, mercury: 0.92, venus: 0.92, mars: 0.85,
  jupiter: 0.75, saturn: 0.7, uranus: 0.6, neptune: 0.6, pluto: 0.6,
}

const BASE_POSICAO_NO_SIGNO = 0.62
const BASE_POSICAO_REGENTE = 0.45
const PISO = 0.2

/** peso do corpo para ESTE signo: é aqui que a regência entra */
export function papel(corpo: Corpo, signo: number): number {
  if (corpo === REGENTE[signo]) return 1.6
  if (corpo === REGENTE_TRADICIONAL[signo]) return 1.3
  if (corpo === "sun" || corpo === "moon") return 1.3
  if (PESSOAIS.has(corpo)) return 1.1
  if (LENTOS.has(corpo)) return 0.7
  return 0.95
}

/**
 * Quanto a função daquele planeta conversa com o que o signo põe em
 * movimento. Deriva só da regência, e não de uma tabela de cento e vinte
 * células escolhida a dedo: regente do signo, regente tradicional, regente do
 * signo oposto (o eixo) e regente de signo do mesmo elemento.
 */
export function afinidade(corpo: Corpo, signo: number): number {
  if (corpo === REGENTE[signo]) return 1
  if (corpo === REGENTE_TRADICIONAL[signo]) return 0.85
  const oposto = (signo + 6) % 12
  if (corpo === REGENTE[oposto] || corpo === REGENTE_TRADICIONAL[oposto]) return 0.75
  for (let s = 0; s < 12; s++) {
    if (ELEMENTO[s] !== ELEMENTO[signo]) continue
    if (corpo === REGENTE[s] || corpo === REGENTE_TRADICIONAL[s]) return 0.7
  }
  if (corpo === "sun" || corpo === "moon") return 0.6
  return 0.5
}

const ressonancia = (a: Corpo, b: Corpo, signo: number) => 0.85 + 0.3 * ((afinidade(a, signo) + afinidade(b, signo)) / 2)

/** Todos os movimentos candidatos, com nota, do mais alto para o mais baixo. */
export function pontuar(ceu: Ceu, signo: number): Movimento[] {
  const saida: Movimento[] = []

  for (const asp of ceu.aspectos) {
    if (!BASE_ASPECTO[asp.aspecto]) continue
    const orbeMax = asp.a === "moon" || asp.b === "moon" ? ORBE_MAX_LUA : ORBE_MAX
    const exatidao = 0.55 + 0.45 * (1 - Math.min(asp.orbe, orbeMax) / orbeMax)
    const papelRel = (papel(asp.a, signo) + papel(asp.b, signo)) / 2
    const ambosLentos = LENTOS.has(asp.a) && LENTOS.has(asp.b)
    const regenteEnvolvido = asp.a === REGENTE[signo] || asp.b === REGENTE[signo]
    const coletivo = ambosLentos ? (regenteEnvolvido ? 0.55 : 0.3) : 1
    const tempo = asp.orbe < 0.2 ? 1.1 : asp.aplicativo ? 1.08 : 0.96
    saida.push({
      tipo: "aspecto",
      id: `aspecto:${asp.a}~${asp.b}:${asp.aspecto}`,
      a: asp.a,
      b: asp.b,
      aspecto: asp.aspecto,
      orbe: asp.orbe,
      aplicativo: asp.aplicativo,
      nota: BASE_ASPECTO[asp.aspecto] * exatidao * papelRel * coletivo * tempo * ressonancia(asp.a, asp.b, signo),
    })
  }

  // planeta atravessando o próprio signo do leitor
  for (const pos of ceu.posicoes) {
    if (pos.signo !== signo) continue
    const anaretico = pos.grau >= 29 ? 1.1 : 1
    saida.push({
      tipo: "posicao",
      id: `posicao:${pos.corpo}`,
      corpo: pos.corpo,
      signo: pos.signo,
      grau: pos.grau,
      retrogrado: pos.retrogrado,
      noProprioSigno: true,
      nota:
        BASE_POSICAO_NO_SIGNO *
        papel(pos.corpo, signo) *
        ressonancia(pos.corpo, pos.corpo, signo) *
        (pos.retrogrado ? 1.12 : 1) *
        anaretico *
        DURACAO[pos.corpo],
    })
  }

  // onde está o regente do signo, esteja ele onde estiver: carta sempre
  // disponível, e diferente para cada signo
  const reg = REGENTE[signo]
  const posReg = posicaoDe(ceu, reg)
  if (posReg.signo !== signo) {
    saida.push({
      tipo: "posicao",
      id: `regente:${reg}`,
      corpo: reg,
      signo: posReg.signo,
      grau: posReg.grau,
      retrogrado: posReg.retrogrado,
      noProprioSigno: false,
      nota:
        BASE_POSICAO_REGENTE *
        papel(reg, signo) *
        ressonancia(reg, reg, signo) *
        (posReg.retrogrado ? 1.12 : 1) *
        DURACAO[reg],
    })
  }

  for (const evento of ceu.eventos) {
    saida.push({ tipo: "evento", id: idDoEvento(evento), evento, nota: notaDoEvento(evento, signo) })
  }

  return saida.sort((x, y) => y.nota - x.nota || (x.id < y.id ? -1 : 1))
}

/**
 * Os três que vão para a tela. Escolha gulosa com desconto de redundância:
 * três relações dizendo a mesma coisa seriam uma leitura só, repetida.
 */
export function selecionarMovimentos(ceu: Ceu, signo: number, quantos = 3): Movimento[] {
  const candidatos = pontuar(ceu, signo)
  const escolhidos: Movimento[] = []
  const restantes = [...candidatos]

  while (escolhidos.length < quantos && restantes.length) {
    let melhor = -1
    let melhorNota = -Infinity
    restantes.forEach((cand, i) => {
      const nota = cand.nota * (1 - 0.6 * Math.min(semelhanca(cand, escolhidos), 1))
      if (nota > melhorNota) {
        melhorNota = nota
        melhor = i
      }
    })
    const ganhou = restantes.splice(melhor, 1)[0]
    if (melhorNota < PISO && escolhidos.length >= 1) break
    escolhidos.push(ganhou)
  }

  return escolhidos
}

function corposDe(m: Movimento): Corpo[] {
  if (m.tipo === "aspecto") return [m.a, m.b]
  if (m.tipo === "posicao") return [m.corpo]
  if (m.evento.tipo === "estacao" || m.evento.tipo === "ingresso") return [m.evento.corpo]
  return ["moon", "sun"]
}

const duro = (aspecto: string) => aspecto === "opposition" || aspecto === "square" || aspecto === "conjunction"

function semelhanca(cand: Movimento, escolhidos: Movimento[]): number {
  let maior = 0
  for (const e of escolhidos) {
    let s = 0
    if (corposDe(cand).some((c) => corposDe(e).includes(c))) s += 0.5
    if (cand.tipo === "aspecto" && e.tipo === "aspecto" && duro(cand.aspecto) === duro(e.aspecto)) s += 0.2
    if (cand.tipo === "posicao" && e.tipo === "posicao") s += 0.2
    maior = Math.max(maior, s)
  }
  return maior
}

function idDoEvento(evento: Evento): string {
  if (evento.tipo === "lunacao") return `lunacao:${evento.fase}`
  if (evento.tipo === "eclipse") return `eclipse:${evento.especie}`
  if (evento.tipo === "estacao") return `estacao:${evento.corpo}:${evento.sentido}`
  return `ingresso:${evento.corpo}`
}

function notaDoEvento(evento: Evento, signo: number): number {
  const noSigno = evento.signo === signo ? 1.25 : 1
  if (evento.tipo === "eclipse") {
    return 1 * ((papel("sun", signo) + papel("moon", signo)) / 2) * ressonancia("sun", "moon", signo) * noSigno
  }
  if (evento.tipo === "lunacao") {
    const base = evento.fase === "new" || evento.fase === "full" ? 0.85 : 0.6
    return base * papel("moon", signo) * ressonancia("moon", "sun", signo) * noSigno
  }
  if (evento.tipo === "estacao") {
    return 0.8 * papel(evento.corpo, signo) * ressonancia(evento.corpo, evento.corpo, signo) * noSigno
  }
  const base = evento.corpo === "sun" ? 0.6 : LENTOS.has(evento.corpo) ? 0.7 : 0.55
  return base * papel(evento.corpo, signo) * ressonancia(evento.corpo, evento.corpo, signo) * noSigno
}
