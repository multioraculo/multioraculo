/**
 * O mapa natal: o céu do instante em que a pessoa nasceu.
 *
 * Determinístico. Os mesmos cinco dados produzem sempre o mesmo mapa, então
 * nada disto é guardado no banco: guardar o resultado ao lado dos dados seria
 * manter duas verdades sobre a mesma coisa, e um dia elas discordariam.
 *
 * O motor é o mesmo do céu do dia (`ceu.ts`), com os mesmos dados embarcados.
 * Isso é deliberado: o que as Interconexões medem são ângulos ENTRE os dois
 * céus, e dois motores diferentes, ainda que ambos corretos, colocariam uma
 * diferença de alguns arcsegundos dentro de cada ângulo medido.
 *
 * SEM HORA DE NASCIMENTO nada é inventado. Não existem Ascendente,
 * Meio-do-Céu nem casas, porque eles giram 360 graus em 24 horas. E a posição
 * de cada corpo deixa de ser um ponto e passa a ser o intervalo onde ele
 * esteve naquele dia, amostrado de hora em hora, o que também pega o corpo
 * que estaciona no meio do dia. O signo só é afirmado quando o intervalo
 * inteiro cabe em um signo só.
 */
import { toUT } from "caelus-birth"
import { grauNoSigno, indiceDoSigno, motor, type Corpo } from "./ceu"

export const CORPOS_MAPA: Corpo[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]

/** Janela de nascimentos que o motor tem corpus para sustentar. */
export const ANOS_ACEITOS = 100

export type DadosNascimento = {
  /** AAAA-MM-DD */
  born_on: string
  /** HH:MM, ou null quando a pessoa não sabe a hora */
  born_at: string | null
  lat: number
  lon: number
  place_label: string
  tz?: string
}

export type CorpoNatal = {
  corpo: Corpo
  /** longitude eclíptica; com hora desconhecida, o meio do intervalo */
  lon: number
  signo: number
  grau: number
  retrogrado: boolean
  /** casa natal; null quando a hora é desconhecida */
  casa: number | null
  /** amplitude da incerteza, em graus; 0 quando a hora é conhecida */
  incerteza: number
  /** falso quando o intervalo possível atravessa a fronteira de um signo */
  signoDefinido: boolean
}

export type MapaNatal = {
  /** zona IANA resolvida pelas coordenadas */
  tz: string
  tzStatus: "ok" | "ambiguous" | "nonexistent"
  jdUt: number
  horaConhecida: boolean
  sistemaCasas: string
  corpos: CorpoNatal[]
  /** null sem hora de nascimento */
  asc: number | null
  mc: number | null
  /** as doze cúspides, ou null sem hora de nascimento */
  cuspides: number[] | null
  /** aspectos entre os corpos do próprio mapa; vazio sem hora, porque a Lua fica incerta */
  aspectos: Array<{ a: string; b: string; tipo: string; forca: number }>
}

const partes = (data: string) => data.split("-").map(Number)
const horaEMinuto = (hora: string) => hora.split(":").map(Number)

/** Meio-dia local: só o instante de referência de um dia sem hora declarada. */
const HORA_REFERENCIA = 12

function calcular(dados: DadosNascimento, hora: number, minuto: number, casas: "placidus" | "whole_sign") {
  const [ano, mes, dia] = partes(dados.born_on)
  const ut = toUT({ year: ano, month: mes, day: dia, hour: hora, minute: minuto, lat: dados.lat, lon: dados.lon, ...(dados.tz ? { zone: dados.tz } : {}) })
  const mapa = motor().chart(
    ut.utc.year, ut.utc.month, ut.utc.day,
    ut.utc.hour, ut.utc.minute, ut.utc.second,
    dados.lat, dados.lon, casas,
  )
  return { ut, mapa }
}

/**
 * O intervalo de cada corpo ao longo do dia civil do nascimento, para quando
 * a hora é desconhecida. Vinte e cinco amostras: a cada hora, mais o fim.
 */
function intervalos(dados: DadosNascimento): Record<string, { min: number; max: number }> {
  const amostras: Record<string, number[]> = {}
  for (let h = 0; h <= 24; h++) {
    const { mapa } = calcular(dados, Math.min(h, 23), h === 24 ? 59 : 0, "whole_sign")
    const corpos = mapa.bodies as unknown as Record<string, { lon: number }>
    for (const corpo of CORPOS_MAPA) {
      if (!amostras[corpo]) amostras[corpo] = []
      amostras[corpo].push(corpos[corpo].lon)
    }
  }
  const saida: Record<string, { min: number; max: number }> = {}
  for (const [corpo, lons] of Object.entries(amostras)) {
    // um dia inteiro cabe em bem menos de meio círculo para qualquer corpo,
    // então desenrolar em torno da primeira amostra basta para a volta de 360
    const base = lons[0]
    const soltos = lons.map((l) => base + ((((l - base) % 360) + 540) % 360) - 180)
    saida[corpo] = { min: Math.min(...soltos), max: Math.max(...soltos) }
  }
  return saida
}

export function mapaNatal(dados: DadosNascimento): MapaNatal {
  const horaConhecida = dados.born_at !== null
  const [hora, minuto] = horaConhecida ? horaEMinuto(dados.born_at as string) : [HORA_REFERENCIA, 0]
  const { ut, mapa } = calcular(dados, hora, minuto, horaConhecida ? "placidus" : "whole_sign")
  const bruto = mapa.bodies as unknown as Record<string, { lon: number; retrograde: boolean; house: number }>

  const faixas = horaConhecida ? null : intervalos(dados)

  const corpos: CorpoNatal[] = CORPOS_MAPA.map((corpo) => {
    const faixa = faixas?.[corpo]
    const lon = faixa ? (faixa.min + faixa.max) / 2 : bruto[corpo].lon
    const incerteza = faixa ? faixa.max - faixa.min : 0
    const signoDefinido = faixa ? indiceDoSigno(faixa.min) === indiceDoSigno(faixa.max) : true
    return {
      corpo,
      lon,
      signo: indiceDoSigno(lon),
      grau: grauNoSigno(lon),
      retrogrado: Boolean(bruto[corpo].retrograde),
      casa: horaConhecida ? bruto[corpo].house : null,
      incerteza,
      signoDefinido,
    }
  })

  const angulos = mapa.angles as unknown as { asc: number; mc: number }
  const cuspides = mapa.cusps as unknown as number[]

  const aspectos = horaConhecida
    ? (mapa.aspects as unknown as Array<{ a: string; b: string; aspect: string; strength: number }>)
        .filter((x) => (CORPOS_MAPA as string[]).includes(x.a) && (CORPOS_MAPA as string[]).includes(x.b))
        .map((x) => ({ a: x.a, b: x.b, tipo: x.aspect, forca: x.strength }))
    : []

  return {
    aspectos,
    tz: ut.zone,
    tzStatus: ut.status,
    jdUt: ut.jdUt,
    horaConhecida,
    sistemaCasas: horaConhecida ? (mapa.houseSystem as unknown as string) : "",
    corpos,
    asc: horaConhecida ? angulos.asc : null,
    mc: horaConhecida ? angulos.mc : null,
    cuspides: horaConhecida ? cuspides : null,
  }
}

/** A zona e o estado da hora local, sem calcular o mapa inteiro. */
export function resolverZona(dados: DadosNascimento): { tz: string; status: "ok" | "ambiguous" | "nonexistent" } {
  const [ano, mes, dia] = partes(dados.born_on)
  const [hora, minuto] = dados.born_at ? horaEMinuto(dados.born_at) : [HORA_REFERENCIA, 0]
  const ut = toUT({ year: ano, month: mes, day: dia, hour: hora, minute: minuto, lat: dados.lat, lon: dados.lon })
  return { tz: ut.zone, status: ut.status }
}
