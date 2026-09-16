/**
 * Corpus de validação do motor astrológico: 40 nascimentos entre 1926 e hoje,
 * que é a janela de 100 anos que o produto aceita.
 *
 * Os casos não são aleatórios. Cada um existe para expor um problema conhecido:
 * as quatro eras de horário de verão do Brasil (1931-33, 1949-53, 1963-68 e
 * 1985-2019), horas que acontecem duas vezes e horas que não existem, fusos de
 * meia hora e de 45 minutos, mudanças de fuso por decreto, latitudes onde
 * Placidus deixa de existir, e os dois hemisférios.
 *
 * Quem calcula é o caelus; o caelus-birth resolve hora local para UT.
 */
import { createRequire } from "module"
import path from "path"
import { Engine } from "caelus"
import { loadNodeData } from "caelus/node"
import { toUT } from "caelus-birth"

export type Caso = {
  rotulo: string
  year: number
  month: number
  day: number
  hour: number
  minute: number
  /** zona IANA declarada; sem ela o caelus-birth resolveria pelas coordenadas */
  zone: string
  lat: number
  /** leste positivo: as Américas são negativas */
  lon: number
}

export const CASOS: Caso[] = [
  { rotulo: "São Paulo, HV de 1933", year: 1933, month: 1, day: 15, hour: 2, minute: 30, zone: "America/Sao_Paulo", lat: -23.55, lon: -46.63 },
  { rotulo: "São Paulo, HV de 1951", year: 1951, month: 2, day: 10, hour: 23, minute: 45, zone: "America/Sao_Paulo", lat: -23.55, lon: -46.63 },
  { rotulo: "Rio, HV de 1965", year: 1965, month: 1, day: 20, hour: 12, minute: 0, zone: "America/Sao_Paulo", lat: -22.91, lon: -43.17 },
  { rotulo: "São Paulo, sem HV (1972)", year: 1972, month: 6, day: 30, hour: 18, minute: 0, zone: "America/Sao_Paulo", lat: -23.55, lon: -46.63 },
  { rotulo: "São Paulo, HV de 1988", year: 1988, month: 10, day: 20, hour: 3, minute: 30, zone: "America/Sao_Paulo", lat: -23.55, lon: -46.63 },
  { rotulo: "São Paulo, volta do HV", year: 1988, month: 2, day: 7, hour: 0, minute: 30, zone: "America/Sao_Paulo", lat: -23.55, lon: -46.63 },
  { rotulo: "Manaus", year: 1995, month: 3, day: 3, hour: 9, minute: 15, zone: "America/Manaus", lat: -3.12, lon: -60.02 },
  { rotulo: "Fortaleza", year: 2001, month: 11, day: 11, hour: 21, minute: 0, zone: "America/Fortaleza", lat: -3.73, lon: -38.52 },
  { rotulo: "Porto Alegre, HV de 2015", year: 2015, month: 2, day: 21, hour: 23, minute: 30, zone: "America/Sao_Paulo", lat: -30.03, lon: -51.23 },
  { rotulo: "Recife, 2026", year: 2026, month: 1, day: 5, hour: 6, minute: 0, zone: "America/Recife", lat: -8.05, lon: -34.88 },
  { rotulo: "Nova York, 1926", year: 1926, month: 12, day: 1, hour: 8, minute: 0, zone: "America/New_York", lat: 40.71, lon: -74.01 },
  { rotulo: "Nova York, buraco do HV", year: 1975, month: 4, day: 27, hour: 2, minute: 30, zone: "America/New_York", lat: 40.71, lon: -74.01 },
  { rotulo: "Nova York, hora repetida", year: 2010, month: 11, day: 7, hour: 1, minute: 30, zone: "America/New_York", lat: 40.71, lon: -74.01 },
  { rotulo: "Londres, hora dupla de guerra", year: 1940, month: 6, day: 15, hour: 13, minute: 0, zone: "Europe/London", lat: 51.51, lon: -0.13 },
  { rotulo: "Londres, horário britânico", year: 1968, month: 10, day: 27, hour: 12, minute: 0, zone: "Europe/London", lat: 51.51, lon: -0.13 },
  { rotulo: "Paris, eclipse de 1999", year: 1999, month: 8, day: 11, hour: 11, minute: 0, zone: "Europe/Paris", lat: 48.86, lon: 2.35 },
  { rotulo: "Lisboa", year: 1986, month: 3, day: 30, hour: 1, minute: 30, zone: "Europe/Lisbon", lat: 38.72, lon: -9.14 },
  { rotulo: "Tóquio, HV do pós-guerra", year: 1948, month: 5, day: 2, hour: 10, minute: 0, zone: "Asia/Tokyo", lat: 35.68, lon: 139.69 },
  { rotulo: "Pequim, HV dos anos 80", year: 1986, month: 5, day: 4, hour: 3, minute: 0, zone: "Asia/Shanghai", lat: 39.9, lon: 116.41 },
  { rotulo: "Calcutá, meia hora", year: 1960, month: 7, day: 7, hour: 5, minute: 45, zone: "Asia/Kolkata", lat: 22.57, lon: 88.36 },
  { rotulo: "Catmandu, 45 minutos", year: 2003, month: 9, day: 9, hour: 14, minute: 45, zone: "Asia/Kathmandu", lat: 27.72, lon: 85.32 },
  { rotulo: "Teerã, meia hora", year: 1979, month: 9, day: 1, hour: 7, minute: 30, zone: "Asia/Tehran", lat: 35.69, lon: 51.39 },
  { rotulo: "Adelaide, meia hora com HV", year: 1994, month: 12, day: 25, hour: 0, minute: 30, zone: "Australia/Adelaide", lat: -34.93, lon: 138.6 },
  { rotulo: "Reykjavík, latitude 64", year: 1955, month: 1, day: 1, hour: 12, minute: 0, zone: "Atlantic/Reykjavik", lat: 64.15, lon: -21.94 },
  { rotulo: "Tromsø, latitude 69,6", year: 1980, month: 6, day: 21, hour: 0, minute: 0, zone: "Europe/Oslo", lat: 69.65, lon: 18.96 },
  { rotulo: "Ushuaia, latitude −54,8", year: 1999, month: 7, day: 15, hour: 17, minute: 0, zone: "America/Argentina/Ushuaia", lat: -54.8, lon: -68.3 },
  { rotulo: "Nuuk", year: 2007, month: 3, day: 25, hour: 3, minute: 30, zone: "America/Nuuk", lat: 64.18, lon: -51.72 },
  { rotulo: "Anchorage", year: 1983, month: 10, day: 30, hour: 1, minute: 30, zone: "America/Anchorage", lat: 61.22, lon: -149.9 },
  { rotulo: "Cidade do Cabo", year: 1969, month: 2, day: 14, hour: 16, minute: 20, zone: "Africa/Johannesburg", lat: -33.92, lon: 18.42 },
  { rotulo: "Sydney, volta do HV", year: 2006, month: 4, day: 2, hour: 2, minute: 30, zone: "Australia/Sydney", lat: -33.87, lon: 151.21 },
  { rotulo: "Auckland, buraco do HV", year: 1974, month: 11, day: 3, hour: 2, minute: 30, zone: "Pacific/Auckland", lat: -36.85, lon: 174.76 },
  { rotulo: "Havana", year: 1971, month: 1, day: 1, hour: 0, minute: 0, zone: "America/Havana", lat: 23.11, lon: -82.37 },
  { rotulo: "Cidade do México", year: 2008, month: 4, day: 6, hour: 2, minute: 30, zone: "America/Mexico_City", lat: 19.43, lon: -99.13 },
  { rotulo: "Moscou, 1991", year: 1991, month: 3, day: 31, hour: 2, minute: 30, zone: "Europe/Moscow", lat: 55.76, lon: 37.62 },
  { rotulo: "Berlim, 1945", year: 1945, month: 4, day: 2, hour: 2, minute: 30, zone: "Europe/Berlin", lat: 52.52, lon: 13.41 },
  { rotulo: "Buenos Aires, 1930", year: 1930, month: 5, day: 10, hour: 15, minute: 0, zone: "America/Argentina/Buenos_Aires", lat: -34.6, lon: -58.38 },
  { rotulo: "Lima", year: 1994, month: 1, day: 1, hour: 12, minute: 0, zone: "America/Lima", lat: -12.05, lon: -77.04 },
  { rotulo: "Bogotá", year: 1992, month: 5, day: 2, hour: 23, minute: 0, zone: "America/Bogota", lat: 4.71, lon: -74.07 },
  { rotulo: "Singapura, antes da virada", year: 1981, month: 12, day: 31, hour: 23, minute: 30, zone: "Asia/Singapore", lat: 1.35, lon: 103.82 },
  { rotulo: "Seul, HV de 1988", year: 1988, month: 9, day: 17, hour: 13, minute: 0, zone: "Asia/Seoul", lat: 37.57, lon: 126.98 },
]

let cache: Engine | null = null

/** O motor, carregado uma vez: os dados vêm do próprio pacote, sem arquivo de efemérides externo. */
export function motor(): Engine {
  if (!cache) {
    const req = createRequire(path.join(process.cwd(), "package.json"))
    const dados = path.join(path.dirname(req.resolve("caelus/package.json")), "data")
    cache = new Engine(loadNodeData(dados, "embedded", "full"))
  }
  return cache
}

export type Medida = {
  rotulo: string
  zona: string
  status: string
  offsetMinutes: number
  jdUt: number
  sistemaCasas: string
  corpos: Record<string, number>
  angulos: { asc: number; mc: number }
  cuspides: number[]
}

/** Hora local → UT → mapa. É esta a cadeia que o teste congela. */
export function medir(caso: Caso): Medida {
  const ut = toUT({
    year: caso.year, month: caso.month, day: caso.day,
    hour: caso.hour, minute: caso.minute,
    lat: caso.lat, lon: caso.lon, zone: caso.zone,
  })
  const mapa = motor().chart(
    ut.utc.year, ut.utc.month, ut.utc.day,
    ut.utc.hour, ut.utc.minute, ut.utc.second,
    caso.lat, caso.lon, "placidus",
  )
  const corpos: Record<string, number> = {}
  for (const [nome, corpo] of Object.entries(mapa.bodies as Record<string, { lon: number }>)) corpos[nome] = corpo.lon
  return {
    rotulo: caso.rotulo,
    zona: ut.zone,
    status: ut.status,
    offsetMinutes: ut.offsetMinutes,
    jdUt: ut.jdUt,
    sistemaCasas: mapa.houseSystem,
    corpos,
    angulos: { asc: mapa.angles.asc, mc: mapa.angles.mc },
    cuspides: mapa.cusps,
  }
}
