/**
 * Mostra o céu de um dia e o que a tiragem escolhe para cada signo.
 * Ferramenta de conferência: não chama IA, não grava nada, não custa nada.
 *
 *   node --import ./scripts/ts-register.mjs scripts/astro-movimentos.ts 2026-09-16
 *   node --import ./scripts/ts-register.mjs scripts/astro-movimentos.ts 2026-09-16 5
 */
import { diaDeHoje, estadoDoCeu } from "../lib/astro/ceu"
import { pontuar, selecionarMovimentos, type Movimento } from "../lib/astro/relevancia"
import { ASPECTOS, CORPOS, SIGNOS } from "../lib/astro/nomes"
import { SIMBOLO_ASPECTO } from "../lib/astro/simbolos"

const dia = process.argv[2] && process.argv[2].includes("-") ? process.argv[2] : diaDeHoje()
const soEste = process.argv.find((a, i) => i >= 2 && /^\d{1,2}$/.test(a))
const ceu = estadoDoCeu(dia)
const nome = CORPOS.pt
const signos = SIGNOS.pt

const grau = (g: number) => g.toFixed(1).padStart(4) + "°"

console.log(`\n${dia}\n`)
console.log("posições:")
for (const p of ceu.posicoes) {
  console.log(`  ${nome[p.corpo].padEnd(9)} ${grau(p.grau)} ${signos[p.signo].padEnd(12)} ${p.retrogrado ? "retrógrado" : ""}`)
}

console.log("\naspectos dentro do orbe:")
for (const a of ceu.aspectos) {
  console.log(
    `  ${nome[a.a].padEnd(9)} ${SIMBOLO_ASPECTO[a.aspecto] ?? "?"} ${nome[a.b].padEnd(9)} ${ASPECTOS.pt[a.aspecto] ?? a.aspecto} orbe ${a.orbe.toFixed(2)}° ${a.aplicativo ? "aplicativo" : "separativo"}`,
  )
}

if (ceu.eventos.length) {
  console.log("\neventos:")
  for (const e of ceu.eventos) console.log(`  ${JSON.stringify(e)}`)
}

const descrever = (m: Movimento): string => {
  if (m.tipo === "aspecto") {
    return `${nome[m.a]} ${SIMBOLO_ASPECTO[m.aspecto]} ${nome[m.b]} (${ASPECTOS.pt[m.aspecto]}, orbe ${m.orbe.toFixed(2)}°, ${m.aplicativo ? "aplicativo" : "separativo"})`
  }
  if (m.tipo === "posicao") {
    const onde = m.noProprioSigno ? "no próprio signo" : "regente"
    return `${nome[m.corpo]} em ${signos[m.signo]} ${m.grau.toFixed(1)}°${m.retrogrado ? " ℞" : ""} (${onde})`
  }
  return `evento ${m.id}`
}

console.log("\ntiragem por signo:")
for (let s = 0; s < 12; s++) {
  if (soEste !== undefined && Number(soEste) !== s) continue
  console.log(`\n  ${signos[s].toUpperCase()}`)
  for (const m of selecionarMovimentos(ceu, s)) {
    console.log(`    ${m.nota.toFixed(3)}  ${descrever(m)}`)
  }
  if (soEste !== undefined) {
    console.log("    fora da seleção:")
    const escolhidos = new Set(selecionarMovimentos(ceu, s).map((m) => m.id))
    for (const m of pontuar(ceu, s).filter((m) => !escolhidos.has(m.id))) {
      console.log(`      ${m.nota.toFixed(3)}  ${descrever(m)}`)
    }
  }
}
console.log("")
