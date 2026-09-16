/**
 * Proteção de regressão do motor astrológico. Roda antes do build
 * (npm run verify:astro) e FALHA se qualquer mapa do corpus mudar.
 *
 * Confere, contra scripts/astro.golden.json, para os 40 nascimentos de
 * scripts/astro-fixtures.ts:
 *  1. a resolução da hora local — zona, deslocamento, status (ok, hora
 *     ambígua ou hora inexistente) e o instante em Dia Juliano;
 *  2. a longitude de cada corpo;
 *  3. Ascendente e Meio-do-Céu;
 *  4. as doze cúspides, e qual sistema de casas acabou sendo usado — em
 *     latitude alta o Placidus não existe e o motor troca sozinho.
 *
 * A tolerância é de 0,1 arcsegundo: ruído de ponto flutuante passa, mudança
 * de modelo não. Uma versão nova do motor que mexa em qualquer valor aparece
 * aqui, no build, e não numa carta de cliente.
 *
 * Regenerar o golden (só com a mudança conferida e aceita):
 *   node --import ./scripts/ts-register.mjs scripts/verify-astro.ts --write
 * Comparar com motores independentes (XALEN e astronomy-engine, dependências
 * de desenvolvimento):
 *   node --import ./scripts/ts-register.mjs scripts/verify-astro.ts --cross
 */
import fs from "fs"
import path from "path"
import { createRequire } from "module"
import { CASOS, medir, type Medida } from "./astro-fixtures"

const TOLERANCIA_ARCSEC = 0.1
const TOLERANCIA_JD = 1e-7 // ~0,01 segundo
const arquivo = path.join(process.cwd(), "scripts", "astro.golden.json")

type Golden = {
  gerado: string
  versoes: Record<string, string>
  toleranciaArcsec: number
  casos: Medida[]
}

const req = createRequire(path.join(process.cwd(), "package.json"))
const versao = (pkg: string): string => JSON.parse(fs.readFileSync(req.resolve(`${pkg}/package.json`), "utf8")).version

const atual = CASOS.map(medir)

if (process.argv.includes("--write")) {
  const golden: Golden = {
    gerado: new Date().toISOString().slice(0, 10),
    versoes: { caelus: versao("caelus"), "caelus-birth": versao("caelus-birth") },
    toleranciaArcsec: TOLERANCIA_ARCSEC,
    casos: atual,
  }
  fs.writeFileSync(arquivo, JSON.stringify(golden, null, 1) + "\n")
  console.log(`[verify:astro] golden gravado: ${atual.length} mapas, caelus ${golden.versoes.caelus}`)
  process.exit(0)
}

async function main() {
  if (process.argv.includes("--cross")) await cruzado()
  else conferir()
}

main().catch((err) => {
  console.error("[verify:astro] erro ao conferir o motor:", err)
  process.exit(1)
})

function conferir() {
  if (!fs.existsSync(arquivo)) {
    console.error("[verify:astro] golden ausente. Gere com --write depois de conferir os valores.")
    process.exit(1)
  }
  const golden = JSON.parse(fs.readFileSync(arquivo, "utf8")) as Golden
  const falhas: string[] = []
  let conferidos = 0

  const igual = (caso: string, campo: string, obtido: unknown, esperado: unknown) => {
    conferidos++
    if (obtido !== esperado) falhas.push(`${caso} · ${campo}: obtido ${String(obtido)}, esperado ${String(esperado)}`)
  }
  const proximo = (caso: string, campo: string, obtido: number, esperado: number, tol: number, unidade: string) => {
    conferidos++
    let d = Math.abs(obtido - esperado)
    if (unidade === "arcsec") {
      d = d % 360
      if (d > 180) d = 360 - d
      d *= 3600
    }
    if (d > tol) falhas.push(`${caso} · ${campo}: diferença de ${d.toFixed(3)} ${unidade} (obtido ${obtido}, esperado ${esperado})`)
  }

  if (golden.casos.length !== atual.length) falhas.push(`o corpus tem ${atual.length} casos e o golden tem ${golden.casos.length}`)

  for (const medida of atual) {
    const esperado = golden.casos.find((c) => c.rotulo === medida.rotulo)
    if (!esperado) {
      falhas.push(`${medida.rotulo}: caso ausente no golden`)
      continue
    }
    igual(medida.rotulo, "zona", medida.zona, esperado.zona)
    igual(medida.rotulo, "status da hora local", medida.status, esperado.status)
    igual(medida.rotulo, "deslocamento", medida.offsetMinutes, esperado.offsetMinutes)
    igual(medida.rotulo, "sistema de casas", medida.sistemaCasas, esperado.sistemaCasas)
    proximo(medida.rotulo, "instante (jdUt)", medida.jdUt, esperado.jdUt, TOLERANCIA_JD, "dias")
    for (const [nome, lon] of Object.entries(medida.corpos)) {
      if (esperado.corpos[nome] === undefined) {
        falhas.push(`${medida.rotulo}: corpo ${nome} não existe no golden`)
        continue
      }
      proximo(medida.rotulo, nome, lon, esperado.corpos[nome], TOLERANCIA_ARCSEC, "arcsec")
    }
    proximo(medida.rotulo, "ascendente", medida.angulos.asc, esperado.angulos.asc, TOLERANCIA_ARCSEC, "arcsec")
    proximo(medida.rotulo, "meio-do-céu", medida.angulos.mc, esperado.angulos.mc, TOLERANCIA_ARCSEC, "arcsec")
    for (let i = 0; i < medida.cuspides.length; i++) {
      proximo(medida.rotulo, `cúspide ${i + 1}`, medida.cuspides[i], esperado.cuspides[i], TOLERANCIA_ARCSEC, "arcsec")
    }
  }

  if (falhas.length) {
    console.error(`\n[verify:astro] motor ALTERADO: ${falhas.length} de ${conferidos} conferências falharam.`)
    console.error("Mapas calculados não podem mudar sem conferência. Diferenças:\n")
    for (const f of falhas.slice(0, 40)) console.error(`  - ${f}`)
    if (falhas.length > 40) console.error(`  ... e mais ${falhas.length - 40}`)
    process.exit(1)
  }
  console.log(`[verify:astro] motor íntegro: ${conferidos} conferências em ${atual.length} mapas (caelus ${versao("caelus")})`)
}

/** Comparação com motores independentes. Fora do build: usa dependências de desenvolvimento. */
async function cruzado() {
  const A = await import("astronomy-engine")
  const X = await import("@xalen/wasm")
  X.initSync({ module: fs.readFileSync(path.join(path.dirname(req.resolve("@xalen/wasm/package.json")), "xalen_wasm_bg.wasm")) })
  const xalen = new X.XalenWasm()

  const difAng = (a: number, b: number) => {
    let d = Math.abs(a - b) % 360
    if (d > 180) d = 360 - d
    return d * 3600
  }
  const idsXalen: Record<string, number> = { sun: 0, moon: 1, mercury: 2, venus: 3, mars: 4, jupiter: 5, saturn: 6, uranus: 7, neptune: 8, pluto: 11 }
  const corposAE: Record<string, unknown> = {
    sun: A.Body.Sun, mercury: A.Body.Mercury, venus: A.Body.Venus, mars: A.Body.Mars,
    jupiter: A.Body.Jupiter, saturn: A.Body.Saturn, uranus: A.Body.Uranus, neptune: A.Body.Neptune, pluto: A.Body.Pluto,
  }
  const piores: Record<string, { valor: number; caso: string }> = {}
  const anota = (chave: string, valor: number, caso: string) => {
    if (!piores[chave] || valor > piores[chave].valor) piores[chave] = { valor, caso }
  }

  for (const medida of atual) {
    const t = A.MakeTime(new Date((medida.jdUt - 2440587.5) * 86400000))
    for (const [nome, lon] of Object.entries(medida.corpos)) {
      if (idsXalen[nome] !== undefined) anota(`xalen ${nome}`, difAng(lon, xalen.tropicalLongitude(medida.jdUt, idsXalen[nome])), medida.rotulo)
      if (nome === "moon") {
        const m = A.EclipticGeoMoon(t) as { lon: number }
        anota("astronomy-engine moon", difAng(lon, m.lon), medida.rotulo)
      } else if (corposAE[nome]) {
        const v = A.RotateVector(A.InverseRotation(A.Rotation_ECT_EQJ(t)), A.GeoVector(corposAE[nome] as never, t, true))
        anota(`astronomy-engine ${nome}`, difAng(lon, ((Math.atan2(v.y, v.x) * 180) / Math.PI + 360) % 360), medida.rotulo)
      }
    }
  }

  console.log(`[verify:astro --cross] pior desvio por corpo, em arcsegundos, nos ${atual.length} mapas:\n`)
  for (const [chave, p] of Object.entries(piores).sort((a, b) => b[1].valor - a[1].valor)) {
    console.log(`  ${chave.padEnd(28)} ${p.valor.toFixed(2).padStart(8)}   ${p.caso}`)
  }
}
