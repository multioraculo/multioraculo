/**
 * Prova factual das Interconexões: nenhum aspecto escrito à mão.
 *
 * Todo número deste relatório sai do motor, e o algoritmo é o DE PRODUÇÃO:
 * este script importa `lib/astro/interconexoes` e `lib/astro/mapa`, os mesmos
 * módulos que a página usa. Uma prova sobre uma cópia do algoritmo não
 * provaria nada sobre o que roda.
 *
 * O mapa natal é um dos 40 casos do corpus que o `verify:astro` congela, e o
 * script confere as longitudes contra o golden antes de usar qualquer uma. O
 * céu do dia vem de `estadoDoCeu`, o mesmo do horóscopo.
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
import { CASOS, medir, type Caso } from "./astro-fixtures"
import { corposEm, diaDeHoje, estadoDoCeu, grauNoSigno, indiceDoSigno } from "../lib/astro/ceu"
import { mapaNatal, type DadosNascimento, type MapaNatal } from "../lib/astro/mapa"
import {
  casaDe,
  interconexoes,
  pontosDoMapa,
  selecionar,
  separacao,
  type Interconexao,
} from "../lib/astro/interconexoes"
import { ANGULO_ASPECTO } from "../lib/astro/simbolos"
import { ASPECTOS, CORPOS as NOMES, SIGNOS } from "../lib/astro/nomes"

const CORPOS_MAPA = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as const

// ---------------------------------------------------------------------------
// apresentação
// ---------------------------------------------------------------------------

const norm360 = (x: number) => ((x % 360) + 360) % 360
const g = (x: number, casas = 2) => x.toFixed(casas).replace(".", ",")

function grauMinuto(lon: number): string {
  const dentro = grauNoSigno(lon)
  const grau = Math.floor(dentro)
  const minuto = Math.round((dentro - grau) * 60)
  return minuto === 60 ? String(grau + 1) + "°00" : String(grau) + "°" + String(minuto).padStart(2, "0")
}

const posicaoTexto = (lon: number) => grauMinuto(lon) + " de " + SIGNOS.pt[indiceDoSigno(lon)]

/** Em português o ponto do mapa tem gênero: a Lua e as casas são dela. */
const FEMININO = new Set(["moon"])
const artigo = (id: string) => (FEMININO.has(id) || id.indexOf("casa") === 0 ? "sua" : "seu")

const nomeDoPonto = (id: string) => {
  if (id === "asc") return "Ascendente"
  if (id === "mc") return "Meio-do-Céu"
  if (id.indexOf("casa") === 0) return "casa " + id.slice(4)
  return NOMES.pt[id]
}

const ehCorpo = (id: string) => (CORPOS_MAPA as readonly string[]).includes(id)

function linhaTitulo(c: Interconexao): string {
  if (c.tipo === "posicao") return NOMES.pt[c.transito] + " de hoje atravessa sua " + nomeDoPonto(c.ponto.id) + " natal"
  const sufixo = ehCorpo(c.ponto.id) ? " natal" : ""
  return (
    NOMES.pt[c.transito] + " de hoje em " + ASPECTOS.pt[c.aspecto] + " com " +
    artigo(c.ponto.id) + " " + nomeDoPonto(c.ponto.id) + sufixo
  )
}

function linhaFatos(c: Interconexao): string {
  const transito = NOMES.pt[c.transito] + " a " + posicaoTexto(c.lonTransito) + (c.retroTransito ? ", retrógrado" : "")
  if (c.tipo === "posicao") return transito + " · casa " + c.casa + " natal começa a " + posicaoTexto(c.ponto.lon)
  const natalTexto =
    nomeDoPonto(c.ponto.id) + (ehCorpo(c.ponto.id) ? " natal" : "") + " a " + posicaoTexto(c.ponto.lon) +
    (c.ponto.retrogrado ? ", retrógrado" : "")
  return (
    transito + " · " + natalTexto +
    " · ângulo real " + g(c.separacao) + "°" +
    " · " + ASPECTOS.pt[c.aspecto] + " de " + c.anguloAspecto + "°" +
    " · orbe " + g(c.orbe) + "°" +
    " · " + (c.aplicativo ? "aplicativo" : "separativo")
  )
}

// ---------------------------------------------------------------------------
// o mapa do produto, conferido contra o golden antes de ser usado
// ---------------------------------------------------------------------------

const doisDigitos = (n: number) => String(n).padStart(2, "0")

function nascimentoDoCaso(caso: Caso, comHora: boolean): DadosNascimento {
  return {
    born_on: `${caso.year}-${doisDigitos(caso.month)}-${doisDigitos(caso.day)}`,
    born_at: comHora ? `${doisDigitos(caso.hour)}:${doisDigitos(caso.minute)}` : null,
    lat: caso.lat,
    lon: caso.lon,
    place_label: caso.rotulo,
  }
}

function conferirContraGolden(caso: Caso, mapa: MapaNatal) {
  const medida = medir(caso)
  const golden = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts", "astro.golden.json"), "utf8"))
  const congelado = golden.casos.find((c: any) => c.rotulo === caso.rotulo)
  if (!congelado) throw new Error("caso fora do golden: " + caso.rotulo)

  // 0,1 arcsegundo: a mesma tolerância do verify:astro
  const tol = 0.1 / 3600
  const divergencias: string[] = []
  for (const [id, lon] of Object.entries(medida.corpos)) {
    if (Math.abs((lon as number) - congelado.corpos[id]) > tol) divergencias.push(id)
  }

  // o mapa do produto usa os dados embarcados; o golden usa os dados de disco.
  // A diferença é conhecida e fica registrada aqui, corpo a corpo.
  const deltas = CORPOS_MAPA.map((id) => {
    const doProduto = mapa.corpos.find((c) => c.corpo === id)!.lon
    return { id, arcsec: Math.abs(doProduto - medida.corpos[id]) * 3600 }
  }).sort((a, b) => b.arcsec - a.arcsec)

  return { medida, divergencias, deltas }
}

// ---------------------------------------------------------------------------
// verificador: refaz tudo do zero e compara
// ---------------------------------------------------------------------------

function verificar(escolhidas: Interconexao[], jdMeio: number, dia: string, textoMockup: string) {
  const falhas: string[] = []
  const ok: string[] = []
  const agora = corposEm(jdMeio)
  const daquiUmaHora = corposEm(jdMeio + 1 / 24)

  for (const c of escolhidas) {
    const rotulo = linhaTitulo(c)
    const lonT = agora[c.transito].lon
    if (Math.abs(lonT - c.lonTransito) > 1e-9) falhas.push(rotulo + ": longitude do trânsito não confere")

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
      ok.push(rotulo + ": trânsito " + g(lonT, 4) + "° · cúspide " + g(c.ponto.lon, 4) + "°")
    }
  }

  // todo número impresso precisa existir entre os fatos calculados
  const permitidos = new Set<string>()
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
  const nascimento = nascimentoDoCaso(caso, true)
  const mapa = mapaNatal(nascimento)
  const { divergencias, deltas } = conferirContraGolden(caso, mapa)

  linha(caso.rotulo)
  linha(
    `${doisDigitos(caso.day)}/${doisDigitos(caso.month)}/${caso.year} às ${doisDigitos(caso.hour)}:${doisDigitos(caso.minute)}` +
    ` · ${caso.zone} · lat ${caso.lat} lon ${caso.lon}`,
  )
  linha(`hora local resolvida pelo produto: ${mapa.tz}, status ${mapa.tzStatus}, JD ${mapa.jdUt}`)
  linha(`sistema de casas: ${mapa.sistemaCasas}`)
  linha(divergencias.length ? "DIVERGE DO GOLDEN: " + divergencias.join(", ") : "o corpus confere com scripts/astro.golden.json (tolerância 0,1 arcsegundo)")
  linha("diferença entre o mapa do produto e o do golden, por corpo (arcsegundos):")
  linha("  " + deltas.map((d) => NOMES.pt[d.id] + " " + g(d.arcsec, 3)).join(" · "))

  titulo("2. O MAPA, PELO CÓDIGO DE PRODUÇÃO")
  for (const c of mapa.corpos) {
    linha(
      NOMES.pt[c.corpo].padEnd(13) + posicaoTexto(c.lon).padEnd(22) + "lon " + g(c.lon, 4).padStart(9) + "°  " +
      (c.casa ? "casa " + c.casa : "") + (c.retrogrado ? "  retrógrado" : ""),
    )
  }
  if (mapa.asc !== null) linha("Ascendente   " + posicaoTexto(mapa.asc).padEnd(22) + "lon " + g(mapa.asc, 4).padStart(9) + "°")
  if (mapa.mc !== null) linha("Meio-do-Céu  " + posicaoTexto(mapa.mc).padEnd(22) + "lon " + g(mapa.mc, 4).padStart(9) + "°")

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
  const agora = corposEm(ceu.jdMeio)
  const depois = corposEm(ceu.jdMeio + 1 / 24)
  const todas = interconexoes(pontosDoMapa(mapa), mapa.cuspides, agora, depois)
  const aspectos = todas.aceitas.filter((c) => c.tipo === "aspecto")
  const posicoes = todas.aceitas.filter((c) => c.tipo === "posicao")
  linha(`${aspectos.length} aspectos dentro do orbe e ${posicoes.length} travessias de casa`)
  linha()
  for (const c of [...aspectos].sort((a, b) => a.orbe - b.orbe)) {
    const alvo = nomeDoPonto(c.ponto.id) + (ehCorpo(c.ponto.id) ? " natal" : "")
    linha(
      "  " + NOMES.pt[c.transito].padEnd(9) + ASPECTOS.pt[c.aspecto].padEnd(11) + alvo.padEnd(18) +
      "ângulo " + g(c.separacao).padStart(6) + "°  orbe " + g(c.orbe).padStart(5) + "°  " +
      (c.aplicativo ? "aplicativo" : "separativo") + "  nota " + g(c.nota, 3),
    )
  }
  linha()
  for (const c of posicoes) linha("  " + NOMES.pt[c.transito].padEnd(9) + "atravessa a casa " + c.casa + " natal  nota " + g(c.nota, 3))

  // 5 e 6 --------------------------------------------------------------------
  titulo("5. RANKING E SELEÇÃO")
  const ordenadas = [...todas.aceitas].sort((a, b) => b.nota - a.nota)
  ordenadas.slice(0, 8).forEach((c, i) => {
    const f = c.fatores
    linha(String(i + 1).padStart(2) + ". " + g(c.nota, 3).padStart(6) + "  " + linhaTitulo(c))
    linha(
      "      base " + g(f.base, 2) + " × exatidão " + g(f.exatidao, 2) + " × papel natal " + g(f.papelNatal, 2) +
      " × peso do trânsito " + g(f.pesoTransito, 2) + " × fase " + g(f.fase, 2),
    )
  })
  const escolhidas = selecionar(todas.aceitas, 3)
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
      const orbeDepois = Math.abs(separacao(depois[c.transito].lon, c.ponto.lon) - c.anguloAspecto)
      linha("  daqui a uma hora        orbe " + g(orbeDepois, 6) + "°  →  " + (c.aplicativo ? "aplicativo" : "separativo"))
    } else {
      linha("  cúspide da casa " + c.casa + "       " + g(c.ponto.lon, 6) + "°   (" + posicaoTexto(c.ponto.lon) + ")")
      linha("  conferida de novo       casa " + casaDe(c.lonTransito, mapa.cuspides as number[]))
    }
    linha()
  }

  // 7 ------------------------------------------------------------------------
  titulo("7. MOCKUP: SUAS INTERCONEXÕES DE HOJE")
  const mockup: string[] = ["SUAS INTERCONEXÕES DE HOJE · " + dia, ""]
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
  const conferencia = verificar(escolhidas, ceu.jdMeio, dia, textoMockup)
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
  const semHora = mapaNatal(nascimentoDoCaso(caso, false))
  linha("intervalo possível de cada corpo natal naquele dia:")
  for (const c of semHora.corpos) {
    linha(
      "  " + NOMES.pt[c.corpo].padEnd(9) + g(c.incerteza, 3).padStart(7) + "°   " +
      (c.signoDefinido
        ? "signo definido: " + SIGNOS.pt[c.signo]
        : "signo INDEFINIDO: entre " + SIGNOS.pt[indiceDoSigno(c.lon - c.incerteza / 2)] +
          " e " + SIGNOS.pt[indiceDoSigno(c.lon + c.incerteza / 2)]),
    )
  }
  linha()
  linha("Ascendente: " + (semHora.asc === null ? "não existe sem hora" : "ERRO, deveria não existir"))
  linha("casas: " + (semHora.cuspides === null ? "não existem sem hora" : "ERRO, deveriam não existir"))

  const relacoesSemHora = interconexoes(pontosDoMapa(semHora), semHora.cuspides, agora, depois)
  linha()
  linha("sobram " + relacoesSemHora.aceitas.length + " interconexões válidas no intervalo inteiro:")
  for (const c of selecionar(relacoesSemHora.aceitas, 3)) linha("  " + linhaTitulo(c) + " · orbe " + g(c.orbe) + "°")
  linha()
  const recusadas = relacoesSemHora.recusadas
  const comLua = recusadas.filter((r) => r.ponto === "moon")
  linha("recusadas por incerteza: " + recusadas.length + ", das quais " + comLua.length + " com a Lua natal.")
  for (const r of recusadas.slice(0, 8)) {
    linha(
      "  " + NOMES.pt[r.transito] + " " + ASPECTOS.pt[r.aspecto] + " " + nomeDoPonto(r.ponto) +
      " natal → orbe chega a " + g(r.piorOrbe) + "° dentro do intervalo de " + g(r.amplitude) + "°",
    )
  }
}

main()
