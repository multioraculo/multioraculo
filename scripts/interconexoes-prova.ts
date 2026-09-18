/**
 * Prova factual das Interconexões: nenhum aspecto escrito à mão.
 *
 * Todo número deste relatório sai do motor. O mapa natal é um dos 40 casos do
 * corpus que o `verify:astro` já congela, e o script confere que as longitudes
 * batem com o golden antes de usar qualquer uma delas. O céu do dia vem de
 * `estadoDoCeu`, o mesmo do horóscopo. As interconexões são todos os ângulos
 * entre os dois conjuntos, calculados, não escolhidos.
 *
 * No fim, um verificador refaz tudo do zero, a partir de novas chamadas ao
 * motor, e confere: longitude do trânsito, longitude natal, ângulo real,
 * aspecto, orbe, aplicativo ou separativo, e se cada número impresso no mockup
 * existe entre os fatos calculados.
 *
 *   node --import ./scripts/ts-register.mjs scripts/interconexoes-prova.ts
 *   ... --caso "Porto Alegre, HV de 2015"   (outro nascimento do corpus)
 *   ... --dia 2026-09-18                    (outro dia de trânsito)
 */
import fs from "fs"
import path from "path"
import { toUT } from "caelus-birth"
import { CASOS, medir, type Caso } from "./astro-fixtures"
import {
  diaDeHoje,
  estadoDoCeu,
  grauNoSigno,
  indiceDoSigno,
  motor,
  partesUtc,
  ORBE_MAX,
  ORBE_MAX_LUA,
  type Corpo,
} from "../lib/astro/ceu"
import { ANGULO_ASPECTO } from "../lib/astro/simbolos"
import { ASPECTOS, CORPOS as NOMES, SIGNOS } from "../lib/astro/nomes"

const CORPOS_MAPA = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as const

// ---------------------------------------------------------------------------
// geometria
// ---------------------------------------------------------------------------

const norm360 = (x: number) => ((x % 360) + 360) % 360

/** Ângulo real entre duas longitudes, de 0 a 180. */
function separacao(a: number, b: number): number {
  const d = norm360(a - b)
  return d > 180 ? 360 - d : d
}

const g = (x: number, casas = 2) => x.toFixed(casas).replace(".", ",")

/** Grau e minuto dentro do signo, do jeito que a tela mostra. */
function grauMinuto(lon: number): string {
  const dentro = grauNoSigno(lon)
  const grau = Math.floor(dentro)
  const minuto = Math.round((dentro - grau) * 60)
  return minuto === 60 ? String(grau + 1) + "°00" : String(grau) + "°" + String(minuto).padStart(2, "0")
}

const posicaoTexto = (lon: number) => grauMinuto(lon) + " de " + SIGNOS.pt[indiceDoSigno(lon)]

/** Todas as longitudes do céu num instante. */
function corposEm(jd: number): Record<string, { lon: number; retrograde: boolean }> {
  return motor().chart(...partesUtc(jd), 0, 0, "whole_sign").bodies as any
}

// ---------------------------------------------------------------------------
// o mapa natal, conferido contra o golden antes de ser usado
// ---------------------------------------------------------------------------

type PontoNatal = {
  id: string
  nome: string
  lon: number
  retrogrado: boolean
  casa: number | null
  tipo: "corpo" | "angulo"
}

function natal(caso: Caso) {
  const medida = medir(caso)
  const golden = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts", "astro.golden.json"), "utf8"))
  const congelado = golden.casos.find((c: any) => c.rotulo === caso.rotulo)
  if (!congelado) throw new Error("caso fora do golden: " + caso.rotulo)

  // 0,1 arcsegundo: a mesma tolerância do verify:astro
  const tol = 0.1 / 3600
  const divergencias: string[] = []
  for (const [id, lon] of Object.entries(medida.corpos)) {
    if (Math.abs(lon - congelado.corpos[id]) > tol) divergencias.push(id)
  }
  if (Math.abs(medida.angulos.asc - congelado.angulos.asc) > tol) divergencias.push("asc")
  if (Math.abs(medida.angulos.mc - congelado.angulos.mc) > tol) divergencias.push("mc")

  // o mesmo mapa pelo motor do produto (dados embarcados), para garantir que
  // os dois caminhos dão o mesmo céu
  const ut = toUT({ ...caso })
  const mapaProduto = motor().chart(
    ut.utc.year, ut.utc.month, ut.utc.day,
    ut.utc.hour, ut.utc.minute, ut.utc.second,
    caso.lat, caso.lon, "placidus",
  )
  const corpos = mapaProduto.bodies as any
  let maiorDelta = 0
  const deltas: Array<{ id: string; arcsec: number }> = []
  for (const id of CORPOS_MAPA) {
    const delta = Math.abs(corpos[id].lon - medida.corpos[id])
    deltas.push({ id, arcsec: delta * 3600 })
    maiorDelta = Math.max(maiorDelta, delta)
  }
  deltas.sort((a, b) => b.arcsec - a.arcsec)

  const pontos: PontoNatal[] = [
    ...CORPOS_MAPA.map((id) => ({
      id: id as string,
      nome: NOMES.pt[id],
      lon: medida.corpos[id],
      retrogrado: Boolean(corpos[id].retrograde),
      casa: corpos[id].house as number,
      tipo: "corpo" as const,
    })),
    { id: "asc", nome: "Ascendente", lon: medida.angulos.asc, retrogrado: false, casa: 1, tipo: "angulo" as const },
    { id: "mc", nome: "Meio-do-Céu", lon: medida.angulos.mc, retrogrado: false, casa: 10, tipo: "angulo" as const },
  ]

  return { caso, medida, pontos, cuspides: medida.cuspides, divergencias, maiorDelta, deltas, ut }
}

/**
 * Sem hora, cada corpo natal tem um intervalo, não um ponto: onde ele esteve
 * entre 00:00 e 23:59 daquele dia, naquele lugar. Amostrado de hora em hora,
 * o que também pega o corpo que estaciona no meio do dia.
 */
function intervalosSemHora(caso: Caso): Record<string, { min: number; max: number; amplitude: number }> {
  const amostras: Record<string, number[]> = {}
  for (let h = 0; h <= 24; h++) {
    const hora = Math.min(h, 23)
    const minuto = h === 24 ? 59 : 0
    const ut = toUT({ ...caso, hour: hora, minute: minuto })
    const corpos = motor().chart(
      ut.utc.year, ut.utc.month, ut.utc.day,
      ut.utc.hour, ut.utc.minute, ut.utc.second,
      caso.lat, caso.lon, "whole_sign",
    ).bodies as any
    for (const id of CORPOS_MAPA) {
      if (!amostras[id]) amostras[id] = []
      amostras[id].push(corpos[id].lon)
    }
  }
  const saida: Record<string, { min: number; max: number; amplitude: number }> = {}
  for (const [id, lons] of Object.entries(amostras)) {
    // o dia inteiro cabe em menos de meio círculo para qualquer corpo, então
    // basta desenrolar em torno da primeira amostra
    const base = lons[0]
    const soltos = lons.map((l) => base + ((((l - base) % 360) + 540) % 360) - 180)
    const min = Math.min(...soltos)
    const max = Math.max(...soltos)
    saida[id] = { min, max, amplitude: max - min }
  }
  return saida
}

// ---------------------------------------------------------------------------
// as interconexões
// ---------------------------------------------------------------------------

type Interconexao = {
  tipo: "aspecto" | "posicao"
  transito: Corpo
  nomeTransito: string
  lonTransito: number
  retroTransito: boolean
  ponto: PontoNatal
  separacao: number
  aspecto: string
  anguloAspecto: number
  orbe: number
  orbeMax: number
  aplicativo: boolean
  casa: number | null
  nota: number
  fatores: Record<string, number>
}

const BASE_ASPECTO: Record<string, number> = {
  conjunction: 1,
  opposition: 0.92,
  square: 0.88,
  trine: 0.72,
  sextile: 0.6,
  quincunx: 0.45,
}

/** O quanto aquele ponto do mapa é o centro da pessoa. */
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

/** O quanto aquele trânsito é notícia: a Lua faz isso com todo mundo todo mês. */
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

const orbeMaximo = (transito: string) => (transito === "moon" ? ORBE_MAX_LUA : ORBE_MAX)

function casaDe(lon: number, cuspides: number[]): number {
  for (let i = 0; i < 12; i++) {
    const inicio = cuspides[i]
    const fim = cuspides[(i + 1) % 12]
    const largura = norm360(fim - inicio)
    if (norm360(lon - inicio) < largura) return i + 1
  }
  return 1
}

/**
 * Todas as relações reais entre o céu de hoje e o mapa. Quando a hora é
 * desconhecida, uma relação com um corpo natal só entra se o aspecto valer em
 * TODO o intervalo possível daquele corpo naquele dia; ângulos e casas não
 * entram de jeito nenhum, porque sem hora eles varrem o círculo inteiro.
 */
function interconexoes(
  pontos: PontoNatal[],
  cuspides: number[],
  jdMeio: number,
  opcoes: { semHora: boolean; intervalos?: Record<string, { min: number; max: number; amplitude: number }> },
): { aceitas: Interconexao[]; recusadas: Array<{ descricao: string; motivo: string }> } {
  const agora = corposEm(jdMeio)
  const daquiUmaHora = corposEm(jdMeio + 1 / 24)
  const aceitas: Interconexao[] = []
  const recusadas: Array<{ descricao: string; motivo: string }> = []

  for (const transito of CORPOS_MAPA) {
    const lonT = agora[transito].lon
    const lonT1 = daquiUmaHora[transito].lon
    const orbeMax = orbeMaximo(transito)

    for (const ponto of pontos) {
      if (opcoes.semHora && ponto.tipo === "angulo") continue

      const sep = separacao(lonT, ponto.lon)
      for (const [aspecto, angulo] of Object.entries(ANGULO_ASPECTO)) {
        const orbe = Math.abs(sep - angulo)
        if (orbe > orbeMax) continue

        // a regra do intervalo: o aspecto precisa valer no intervalo inteiro
        if (opcoes.semHora && opcoes.intervalos) {
          const faixa = opcoes.intervalos[ponto.id]
          const passos = 400
          let piorOrbe = 0
          for (let k = 0; k <= passos; k++) {
            const lonN = faixa.min + ((faixa.max - faixa.min) * k) / passos
            piorOrbe = Math.max(piorOrbe, Math.abs(separacao(lonT, lonN) - angulo))
          }
          if (piorOrbe > orbeMax) {
            recusadas.push({
              descricao: NOMES.pt[transito] + " " + ASPECTOS.pt[aspecto] + " " + ponto.nome + " natal",
              motivo:
                "orbe chega a " + g(piorOrbe) + "° dentro do intervalo de " + g(faixa.amplitude) +
                "° da posição natal (máximo " + g(orbeMax, 1) + "°)",
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
          nomeTransito: NOMES.pt[transito],
          lonTransito: lonT,
          retroTransito: Boolean(agora[transito].retrograde),
          ponto,
          separacao: sep,
          aspecto,
          anguloAspecto: angulo,
          orbe,
          orbeMax,
          aplicativo: orbeDepois < orbe,
          casa: null,
          nota: Object.values(fatores).reduce((a, b) => a * b, 1),
          fatores,
        })
      }
    }

    // travessia de casa natal: posição, não ângulo
    if (!opcoes.semHora && CASA_RAPIDOS[transito]) {
      const casa = casaDe(lonT, cuspides)
      const fatores = { base: 0.55, exatidao: 1, papelNatal: 1, pesoTransito: CASA_RAPIDOS[transito], fase: 1 }
      aceitas.push({
        tipo: "posicao",
        transito,
        nomeTransito: NOMES.pt[transito],
        lonTransito: lonT,
        retroTransito: Boolean(agora[transito].retrograde),
        ponto: {
          id: "casa" + casa,
          nome: "casa " + casa,
          lon: cuspides[casa - 1],
          retrogrado: false,
          casa,
          tipo: "angulo",
        },
        separacao: 0,
        aspecto: "posicao",
        anguloAspecto: 0,
        orbe: 0,
        orbeMax: 0,
        aplicativo: false,
        casa,
        nota: Object.values(fatores).reduce((a, b) => a * b, 1),
        fatores,
      })
    }
  }

  return { aceitas, recusadas }
}

/** Escolha gulosa, penalizando repetição de corpo em trânsito ou de ponto natal. */
function selecionar(lista: Interconexao[], quantas: number): Interconexao[] {
  const restantes = [...lista]
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

// ---------------------------------------------------------------------------
// o mockup, montado a partir dos fatos e de mais nada
// ---------------------------------------------------------------------------

/** Em português o ponto do mapa tem gênero: a Lua e as casas são dela. */
const FEMININO = new Set(["moon"])
const artigo = (id: string) => (FEMININO.has(id) || id.indexOf("casa") === 0 ? "sua" : "seu")

function linhaTitulo(c: Interconexao): string {
  if (c.tipo === "posicao") return c.nomeTransito + " de hoje atravessa sua " + c.ponto.nome + " natal"
  const sufixo = c.ponto.tipo === "corpo" ? " natal" : ""
  return c.nomeTransito + " de hoje em " + ASPECTOS.pt[c.aspecto] + " com " + artigo(c.ponto.id) + " " + c.ponto.nome + sufixo
}

function linhaFatos(c: Interconexao): string {
  const transito = c.nomeTransito + " a " + posicaoTexto(c.lonTransito) + (c.retroTransito ? ", retrógrado" : "")
  if (c.tipo === "posicao") return transito + " · casa " + c.casa + " natal começa a " + posicaoTexto(c.ponto.lon)
  const natalTexto = c.ponto.nome + " natal a " + posicaoTexto(c.ponto.lon) + (c.ponto.retrogrado ? ", retrógrado" : "")
  return (
    transito + " · " + natalTexto +
    " · ângulo real " + g(c.separacao) + "°" +
    " · " + ASPECTOS.pt[c.aspecto] + " de " + c.anguloAspecto + "°" +
    " · orbe " + g(c.orbe) + "°" +
    " · " + (c.aplicativo ? "aplicativo" : "separativo")
  )
}

// ---------------------------------------------------------------------------
// verificador: refaz tudo do zero e compara
// ---------------------------------------------------------------------------

function verificar(escolhidas: Interconexao[], caso: Caso, jdMeio: number, dia: string, textoMockup: string) {
  const falhas: string[] = []
  const ok: string[] = []
  const medida = medir(caso)
  const agora = corposEm(jdMeio)
  const daquiUmaHora = corposEm(jdMeio + 1 / 24)

  for (const c of escolhidas) {
    const rotulo = linhaTitulo(c)

    const lonT = agora[c.transito].lon
    if (Math.abs(lonT - c.lonTransito) > 1e-9) falhas.push(rotulo + ": longitude do trânsito não confere")

    if (c.tipo === "aspecto" && c.ponto.tipo === "corpo") {
      const lonN = medida.corpos[c.ponto.id]
      if (Math.abs(lonN - c.ponto.lon) > 1e-9) falhas.push(rotulo + ": longitude natal não confere")
    }
    if (c.ponto.id === "asc" && Math.abs(medida.angulos.asc - c.ponto.lon) > 1e-9) falhas.push(rotulo + ": Ascendente divergente")
    if (c.ponto.id === "mc" && Math.abs(medida.angulos.mc - c.ponto.lon) > 1e-9) falhas.push(rotulo + ": Meio-do-Céu divergente")

    if (c.tipo === "aspecto") {
      const sep = separacao(lonT, c.ponto.lon)
      if (Math.abs(sep - c.separacao) > 1e-9) falhas.push(rotulo + ": ângulo real não confere")
      if (ANGULO_ASPECTO[c.aspecto] !== c.anguloAspecto) falhas.push(rotulo + ": ângulo do aspecto errado")
      const orbe = Math.abs(sep - ANGULO_ASPECTO[c.aspecto])
      if (Math.abs(orbe - c.orbe) > 1e-9) falhas.push(rotulo + ": orbe não confere")
      if (orbe > c.orbeMax) falhas.push(rotulo + ": orbe " + g(orbe) + " acima do máximo " + c.orbeMax)
      const depois = Math.abs(separacao(daquiUmaHora[c.transito].lon, c.ponto.lon) - ANGULO_ASPECTO[c.aspecto])
      if (depois < orbe !== c.aplicativo) falhas.push(rotulo + ": aplicativo/separativo invertido")
      ok.push(
        rotulo + ": trânsito " + g(lonT, 4) + "° · natal " + g(c.ponto.lon, 4) +
        "° · ângulo " + g(sep, 4) + "° · " + c.aspecto + " " + c.anguloAspecto +
        "° · orbe " + g(orbe, 4) + "° · " + (c.aplicativo ? "aplicativo" : "separativo"),
      )
    } else {
      const casa = casaDe(lonT, medida.cuspides)
      if (casa !== c.casa) falhas.push(rotulo + ": casa não confere")
      ok.push(
        rotulo + ": trânsito " + g(lonT, 4) + "° · casa " + casa +
        " (cúspide " + g(medida.cuspides[casa - 1], 4) + "°)",
      )
    }
  }

  // todo número impresso precisa existir entre os fatos calculados
  const permitidos = new Set<string>()
  // o dia do trânsito também é um fato, e é ele que datou tudo isto
  for (const parte of dia.split("-")) permitidos.add(parte)
  for (const c of escolhidas) {
    permitidos.add(g(c.separacao))
    permitidos.add(g(c.orbe))
    permitidos.add(String(c.anguloAspecto))
    if (c.casa !== null) permitidos.add(String(c.casa))
    for (const lon of [c.lonTransito, c.ponto.lon]) {
      const gm = grauMinuto(lon)
      permitidos.add(gm)
      for (const parte of gm.split("°")) if (parte) permitidos.add(String(Number(parte)))
    }
  }
  const numeros = textoMockup.match(/\d+(?:,\d+)?/g) || []
  const sobrando = numeros.filter((n) => !permitidos.has(n) && !Array.from(permitidos).some((p) => p.indexOf(n) >= 0))
  if (sobrando.length) falhas.push("números no mockup sem origem calculada: " + sobrando.join(", "))

  return { falhas, ok }
}

// ---------------------------------------------------------------------------

function main() {
  const argv = process.argv
  const rotulo = argv.includes("--caso") ? argv[argv.indexOf("--caso") + 1] : "São Paulo, HV de 1988"
  const dia = argv.includes("--dia") ? argv[argv.indexOf("--dia") + 1] : diaDeHoje()
  const caso = CASOS.find((c) => c.rotulo === rotulo)
  if (!caso) throw new Error("nascimento fora do corpus: " + rotulo)

  const linha = (t = "") => console.log(t)
  const titulo = (t: string) => {
    linha()
    linha(t)
    linha("=".repeat(t.length))
  }

  // 1 e 2 --------------------------------------------------------------------
  titulo("1. NASCIMENTO DE TESTE (do corpus que o verify:astro congela)")
  const mapa = natal(caso)
  const dd = String(caso.day).padStart(2, "0")
  const mm = String(caso.month).padStart(2, "0")
  const hh = String(caso.hour).padStart(2, "0")
  const mi = String(caso.minute).padStart(2, "0")
  linha(caso.rotulo)
  linha(dd + "/" + mm + "/" + caso.year + " às " + hh + ":" + mi + " · " + caso.zone + " · lat " + caso.lat + " lon " + caso.lon)
  linha("hora local resolvida: " + mapa.ut.zone + ", deslocamento " + mapa.ut.offsetMinutes + " min, status " + mapa.ut.status + ", JD " + mapa.medida.jdUt)
  linha("sistema de casas: " + mapa.medida.sistemaCasas)
  linha(mapa.divergencias.length ? "DIVERGE DO GOLDEN: " + mapa.divergencias.join(", ") : "confere com scripts/astro.golden.json (tolerância 0,1 arcsegundo)")
  linha("diferença entre o motor do golden e o motor do produto, por corpo (arcsegundos):")
  linha("  " + mapa.deltas.map((d) => NOMES.pt[d.id] + " " + g(d.arcsec, 3)).join(" · "))

  titulo("2. O MAPA")
  for (const p of mapa.pontos) {
    linha(
      p.nome.padEnd(13) + posicaoTexto(p.lon).padEnd(22) + "lon " + g(p.lon, 4).padStart(9) + "°  " +
      (p.casa ? "casa " + p.casa : "") + (p.retrogrado ? "  retrógrado" : ""),
    )
  }

  // 3 ------------------------------------------------------------------------
  titulo("3. O CÉU DE " + dia)
  const ceu = estadoDoCeu(dia)
  for (const p of ceu.posicoes) {
    linha(
      NOMES.pt[p.corpo].padEnd(13) + posicaoTexto(p.lon).padEnd(22) + "lon " + g(p.lon, 4).padStart(9) + "°" +
      (p.retrogrado ? "  retrógrado" : ""),
    )
  }

  // 4 ------------------------------------------------------------------------
  titulo("4. TODAS AS INTERCONEXÕES REAIS")
  const todas = interconexoes(mapa.pontos, mapa.cuspides, ceu.jdMeio, { semHora: false })
  const aspectos = todas.aceitas.filter((c) => c.tipo === "aspecto")
  const posicoes = todas.aceitas.filter((c) => c.tipo === "posicao")
  linha(
    aspectos.length + " aspectos dentro do orbe (" + ORBE_MAX + "° em geral, " + ORBE_MAX_LUA +
    "° para a Lua em trânsito) e " + posicoes.length + " travessias de casa",
  )
  linha()
  for (const c of [...aspectos].sort((a, b) => a.orbe - b.orbe)) {
    const alvo = c.ponto.nome + (c.ponto.tipo === "corpo" ? " natal" : "")
    linha(
      "  " + c.nomeTransito.padEnd(9) + ASPECTOS.pt[c.aspecto].padEnd(11) + alvo.padEnd(18) +
      "ângulo " + g(c.separacao).padStart(6) + "°  orbe " + g(c.orbe).padStart(5) + "°  " +
      (c.aplicativo ? "aplicativo" : "separativo") + "  nota " + g(c.nota, 3),
    )
  }
  linha()
  for (const c of posicoes) linha("  " + c.nomeTransito.padEnd(9) + "atravessa a casa " + c.casa + " natal  nota " + g(c.nota, 3))

  // 5 e 6 --------------------------------------------------------------------
  titulo("5. RANKING E SELEÇÃO")
  const ordenadas = [...todas.aceitas].sort((a, b) => b.nota - a.nota)
  ordenadas.slice(0, 10).forEach((c, i) => {
    const f = c.fatores
    linha(String(i + 1).padStart(2) + ". " + g(c.nota, 3).padStart(6) + "  " + linhaTitulo(c))
    linha(
      "      base " + g(f.base, 2) + " × exatidão " + g(f.exatidao, 2) + " × papel natal " + g(f.papelNatal, 2) +
      " × peso do trânsito " + g(f.pesoTransito, 2) + " × fase " + g(f.fase, 2),
    )
  })
  const escolhidas = selecionar(ordenadas, 3)
  linha()
  linha("escolhidas (sem repetir corpo em trânsito nem ponto natal):")
  escolhidas.forEach((c, i) => linha("  " + (i + 1) + ". " + linhaTitulo(c)))

  titulo("6. O CÁLCULO DE CADA UMA")
  for (const c of escolhidas) {
    linha(linhaTitulo(c))
    linha("  longitude do trânsito   " + g(c.lonTransito, 6) + "°   (" + posicaoTexto(c.lonTransito) + ")")
    if (c.tipo === "aspecto") {
      linha("  longitude natal         " + g(c.ponto.lon, 6) + "°   (" + posicaoTexto(c.ponto.lon) + ")")
      linha("  diferença bruta         " + g(norm360(c.lonTransito - c.ponto.lon), 6) + "°")
      linha("  ângulo real             " + g(c.separacao, 6) + "°")
      linha("  aspecto                 " + ASPECTOS.pt[c.aspecto] + " (" + c.anguloAspecto + "°)")
      linha("  orbe                    " + g(c.orbe, 6) + "°  (máximo " + c.orbeMax + "°)")
      const depois = Math.abs(separacao(corposEm(ceu.jdMeio + 1 / 24)[c.transito].lon, c.ponto.lon) - c.anguloAspecto)
      linha("  daqui a uma hora        orbe " + g(depois, 6) + "°  →  " + (c.aplicativo ? "aplicativo" : "separativo"))
    } else {
      linha("  cúspide da casa " + c.casa + "       " + g(c.ponto.lon, 6) + "°   (" + posicaoTexto(c.ponto.lon) + ")")
    }
    linha()
  }

  // 7 ------------------------------------------------------------------------
  titulo("7. MOCKUP: SUAS INTERCONEXÕES DE HOJE")
  const mockup: string[] = []
  mockup.push("SUAS INTERCONEXÕES DE HOJE · " + dia)
  mockup.push("")
  escolhidas.forEach((c, i) => {
    mockup.push(linhaTitulo(c))
    mockup.push("   " + linhaFatos(c))
    mockup.push(i === 0 ? "   [primeira frase real da leitura] [vidro]" : "   [leitura sob o vidro]")
    mockup.push("")
  })
  mockup.push("A leitura escrita das suas interconexões faz parte dos planos pagos.")
  mockup.push("Os fatos acima são calculados e continuam seus.")
  const textoMockup = mockup.join("\n")
  linha(textoMockup)

  // 8 ------------------------------------------------------------------------
  titulo("8. VERIFICADOR")
  const conferencia = verificar(escolhidas, caso, ceu.jdMeio, dia, textoMockup)
  for (const l of conferencia.ok) linha("  ok  " + l)
  linha()
  if (conferencia.falhas.length) {
    for (const f of conferencia.falhas) linha("  FALHA  " + f)
    process.exitCode = 1
  } else {
    linha("  " + escolhidas.length + " interconexões reconferidas do zero: longitude do trânsito, longitude natal,")
    linha("  ângulo real, aspecto, orbe, aplicativo ou separativo.")
    linha("  nenhum número do mockup sem origem calculada.")
  }

  // 9 ------------------------------------------------------------------------
  titulo("9. A MESMA PESSOA, SEM A HORA DE NASCIMENTO")
  const intervalos = intervalosSemHora(caso)
  linha("intervalo possível de cada corpo natal naquele dia:")
  for (const id of CORPOS_MAPA) {
    const f = intervalos[id]
    const mesmoSigno = indiceDoSigno(f.min) === indiceDoSigno(f.max)
    linha(
      "  " + NOMES.pt[id].padEnd(9) + g(f.amplitude, 3).padStart(7) + "°   " +
      (mesmoSigno
        ? "signo definido: " + SIGNOS.pt[indiceDoSigno(f.min)]
        : "signo INDEFINIDO: entre " + SIGNOS.pt[indiceDoSigno(f.min)] + " e " + SIGNOS.pt[indiceDoSigno(f.max)]),
    )
  }
  const semHora = interconexoes(mapa.pontos, mapa.cuspides, ceu.jdMeio, { semHora: true, intervalos })
  linha()
  linha("Ascendente, Meio-do-Céu e casas: fora, sem exceção.")
  linha("sobram " + semHora.aceitas.length + " interconexões válidas no intervalo inteiro:")
  for (const c of selecionar([...semHora.aceitas].sort((a, b) => b.nota - a.nota), 3)) {
    linha("  " + linhaTitulo(c) + " · orbe " + g(c.orbe) + "°")
  }
  linha()
  const recusadasLua = semHora.recusadas.filter((r) => r.descricao.indexOf("Lua") >= 0)
  linha("recusadas por incerteza: " + semHora.recusadas.length + ", das quais " + recusadasLua.length + " com a Lua natal.")
  for (const r of semHora.recusadas.slice(0, 8)) linha("  " + r.descricao + " → " + r.motivo)
}

main()
