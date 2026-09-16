/**
 * Proteção de regressão da tiragem do horóscopo. Roda antes do build
 * (npm run verify:horoscopo) e FALHA se a seleção de movimentos mudar.
 *
 * A escolha dos três movimentos de cada signo é determinística: depende só do
 * céu calculado e da regra de relevância, nunca de modelo de linguagem. Este
 * teste trava isso. Confere, contra scripts/horoscopo.golden.json, para oito
 * datas escolhidas por terem céus diferentes (dia calmo, lunação, eclipse,
 * estação, ingresso de lento) e para os doze signos:
 *  1. quais movimentos foram escolhidos, na ordem;
 *  2. a nota de cada um;
 *  3. as invariantes da regra, que valem em qualquer céu.
 *
 * As invariantes são o que impede uma calibração futura de estragar o
 * produto sem ninguém notar:
 *  a. aspecto entre dois planetas lentos nunca entra por exatidão (Netuno
 *     sextil Plutão com orbe de 0,01° dura meses: não é notícia do dia);
 *  b. todo signo recebe pelo menos um movimento;
 *  c. os doze signos não recebem todos a mesma seleção;
 *  d. nenhum movimento aparece duas vezes na mesma leitura.
 *
 * Regenerar o golden (só com a mudança conferida e aceita):
 *   node --import ./scripts/ts-register.mjs scripts/verify-horoscopo.ts --write
 */
import fs from "fs"
import path from "path"
import { estadoDoCeu } from "../lib/astro/ceu"
import { selecionarMovimentos } from "../lib/astro/relevancia"
import { LENTOS, REGENTE } from "../lib/astro/simbolos"
import { EXPRESSOES_EVITAR, PROIBIDAS } from "../lib/astro/editorial"
import { LOCALES } from "../lib/i18n/config"

const TOLERANCIA_NOTA = 1e-9
const arquivo = path.join(process.cwd(), "scripts", "horoscopo.golden.json")

/** Oito céus diferentes entre si, não oito dias seguidos. */
export const DATAS = [
  "2026-09-16", // dia calmo: só três aspectos pessoais no céu inteiro
  "2026-09-21",
  "2026-10-02",
  "2026-11-13",
  "2027-01-07",
  "2027-02-26",
  "2027-06-11",
  "2028-03-30",
]

type Linha = { dia: string; signo: number; movimentos: Array<{ id: string; nota: number }> }
type Golden = { gerado: string; datas: string[]; linhas: Linha[] }

function medir(): Linha[] {
  const linhas: Linha[] = []
  for (const dia of DATAS) {
    const ceu = estadoDoCeu(dia)
    for (let signo = 0; signo < 12; signo++) {
      const movimentos = selecionarMovimentos(ceu, signo)
      linhas.push({ dia, signo, movimentos: movimentos.map((m) => ({ id: m.id, nota: m.nota })) })
    }
  }
  return linhas
}

function invariantes(linhas: Linha[]): string[] {
  const falhas: string[] = []

  // o prompt promete ao modelo que estas expressões reprovam o texto: o
  // verificador precisa mesmo pegá-las, senão a promessa é falsa
  for (const locale of LOCALES) {
    for (const frase of EXPRESSOES_EVITAR[locale]) {
      if (!PROIBIDAS[locale].some((regex) => regex.test(frase))) {
        falhas.push(`${locale}: "${frase}" está na lista do prompt mas nenhum regex do verificador a pega`)
      }
    }
  }

  for (const dia of DATAS) {
    const doDia = linhas.filter((l) => l.dia === dia)
    const assinaturas = new Set(doDia.map((l) => l.movimentos.map((m) => m.id).sort().join("|")))
    if (assinaturas.size < 2) {
      falhas.push(`${dia}: os doze signos receberam a mesma seleção`)
    }
    for (const linha of doDia) {
      if (!linha.movimentos.length) falhas.push(`${dia} signo ${linha.signo}: nenhum movimento`)
      const ids = linha.movimentos.map((m) => m.id)
      if (new Set(ids).size !== ids.length) falhas.push(`${dia} signo ${linha.signo}: movimento repetido`)
    }

    // (a) aspecto lento com lento não pode entrar por exatidão
    const ceu = estadoDoCeu(dia)
    const lentoLento = ceu.aspectos.filter((x) => LENTOS.has(x.a) && LENTOS.has(x.b) && x.orbe < 0.5)
    for (const asp of lentoLento) {
      const id = `aspecto:${asp.a}~${asp.b}:${asp.aspecto}`
      const invadiu = doDia.filter((l) => l.movimentos.some((m) => m.id === id))
      // só é aceitável quando um dos dois rege o signo
      const indevido = invadiu.filter((l) => {
        const regentes = [asp.a, asp.b]
        return !regentes.includes(regenteDoSigno(l.signo))
      })
      if (indevido.length) {
        falhas.push(`${dia}: ${id} (orbe ${asp.orbe.toFixed(2)}°) entrou em ${indevido.length} signo(s) sem reger nenhum deles`)
      }
    }
  }

  return falhas
}

const regenteDoSigno = (signo: number) => REGENTE[signo]

function main() {
  const linhas = medir()
  const falhasInvariantes = invariantes(linhas)

  if (process.argv.includes("--write")) {
    const golden: Golden = { gerado: new Date().toISOString(), datas: DATAS, linhas }
    fs.writeFileSync(arquivo, JSON.stringify(golden, null, 2) + "\n")
    console.log(`golden do horóscopo gravado: ${linhas.length} leituras em ${DATAS.length} datas`)
    if (falhasInvariantes.length) {
      console.error("\nATENÇÃO: o golden foi gravado, mas as invariantes falharam:")
      for (const f of falhasInvariantes) console.error(`  ${f}`)
      process.exit(1)
    }
    return
  }

  if (!fs.existsSync(arquivo)) {
    console.error(`golden ausente: ${arquivo}\nGere com --write depois de conferir a seleção.`)
    process.exit(1)
  }

  const golden: Golden = JSON.parse(fs.readFileSync(arquivo, "utf8"))
  const falhas: string[] = [...falhasInvariantes]
  let conferidos = 0

  for (const linha of linhas) {
    const esperado = golden.linhas.find((l) => l.dia === linha.dia && l.signo === linha.signo)
    if (!esperado) {
      falhas.push(`${linha.dia} signo ${linha.signo}: ausente no golden`)
      continue
    }
    const agora = linha.movimentos.map((m) => m.id).join(" | ")
    const antes = esperado.movimentos.map((m) => m.id).join(" | ")
    if (agora !== antes) {
      falhas.push(`${linha.dia} signo ${linha.signo}:\n    golden: ${antes}\n     agora: ${agora}`)
      continue
    }
    linha.movimentos.forEach((m, i) => {
      conferidos += 1
      const diferenca = Math.abs(m.nota - esperado.movimentos[i].nota)
      if (diferenca > TOLERANCIA_NOTA) {
        falhas.push(`${linha.dia} signo ${linha.signo} ${m.id}: nota ${esperado.movimentos[i].nota} virou ${m.nota}`)
      }
    })
  }

  if (falhas.length) {
    console.error(`\nA tiragem do horóscopo mudou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas) console.error(`  ${f}`)
    console.error("\nSe a mudança for intencional, confira a seleção e regenere com --write.")
    process.exit(1)
  }

  console.log(`horóscopo: ${linhas.length} leituras, ${conferidos} movimentos conferidos, tudo igual ao golden`)
}

main()
