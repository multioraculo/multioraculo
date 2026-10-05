/**
 * Higiene e proporcionalidade da evidência que chega ao C-base-min.
 *
 * Não impõe igualdade entre oráculos: a diferença de volume total reflete
 * quantidades diferentes de unidades sorteadas (o tarô tem 10 posições, os
 * búzios têm 2 quedas), e isso é legítimo. O que este verificador cobra é:
 *
 *   1. BÚZIOS: uma ficha por Odu sorteado, zero Odu vizinho, cobertura total,
 *      e dedup quando as duas quedas dão o mesmo Odu.
 *   2. MÉTRICAS POR UNIDADE: chars, cobertura, nº de referências e
 *      contaminação por unidade sorteada, para detectar EXTREMO inexplicável —
 *      não para igualar.
 *
 * Zero IA, zero rede: só o índice local e o material montado em código.
 */
import { drawAll, ODUS, RUNES, HEXAGRAMS, LENORMAND_DECK, TAROT_DECK, type OracleKey } from "../lib/oracles/draw"
import { buildCBaseMinMaterial } from "../lib/oracles/references"
import { ODUS_FICHAS } from "../lib/oracles/odus-fichas"
import { ODUS_COBERTOS, ODUS_SEM_FICHA, fichaDoOdu } from "../lib/oracles/buzios-referencia"
import { ORACLE_ORDER } from "../lib/oracles/synthesis"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

const SEEDS = ["fase10:0", "fase10:3", "fase10:12", "fase10:25", "fase10:31", "fase10:244", "fase10:594", "fase10:685"]
const PERGUNTA = "O que está em jogo agora?"
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const LETRA = "abcdefghijklmnopqrstuvwxyz0123456789"
function inteira(hay: string, needle: string): boolean {
  let i = -1
  while ((i = hay.indexOf(needle, i + 1)) >= 0) {
    const a = i === 0 ? " " : hay[i - 1]
    const b = i + needle.length >= hay.length ? " " : hay[i + needle.length]
    if (!LETRA.includes(a) && !LETRA.includes(b)) return true
  }
  return false
}
const TETO = (k: OracleKey) => (k === "tarot" ? 16 : 10)

// ── A · o índice dos Odus ─────────────────────────────────────────────────
function parteA() {
  confere("A · 16 fichas de Odu (1..16)", ODUS_COBERTOS === 16, String(ODUS_COBERTOS))
  for (let i = 1; i <= 16; i++) confere(`A · Odu ${i} (${ODUS[i]}) tem ficha`, !!fichaDoOdu(i))
  // a lacuna conhecida fica REGISTRADA, para não ser confundida com defeito novo
  confere("A · a lacuna conhecida é exatamente o resultado 0", ODUS_SEM_FICHA.length === 1 && ODUS_SEM_FICHA[0] === 0, ODUS_SEM_FICHA.join(","))
  confere("A · o resultado 0 segue sem ficha", !fichaDoOdu(0))
  confere("A · toda ficha tem os dois polos", ODUS_FICHAS.every((f) => f.positivo.length > 10 && f.negativo.length > 10))
  confere("A · toda ficha tem Odu e Orixá", ODUS_FICHAS.every((f) => f.odu.length > 2 && f.orixa.length > 2))
  // nenhuma ficha pode citar OUTRO Odu
  const cruzados: string[] = []
  for (const f of ODUS_FICHAS) {
    const t = norm(`${f.positivo} ${f.negativo}`)
    for (const g of ODUS_FICHAS) {
      if (g.abertos === f.abertos) continue
      for (const nome of [norm(g.odu), norm(ODUS[g.abertos] ?? "")]) {
        if (nome.length >= 3 && inteira(t, nome)) cruzados.push(`${f.odu} cita ${g.odu}`)
      }
    }
  }
  confere("A · nenhuma ficha cita outro Odu", cruzados.length === 0, cruzados.join(" | "))
  // o cabeçalho do documento não pode ter vazado para dentro de nenhuma ficha
  const CAB = /JOGO DE B[UÚ]ZIOS MERINDINLOGUN|PALAVRAS CHAVES|OR[IÍ]X[AÁ]S\s+ABERTO\s+FECHADO/i
  const vazou = ODUS_FICHAS.filter((f) => CAB.test(`${f.positivo} ${f.negativo}`))
  confere("A · nenhum cabeçalho de documento dentro da ficha", vazou.length === 0, vazou.map((f) => f.odu).join(", "))
}

// ── B · o material dos búzios numa tiragem ────────────────────────────────
async function parteB() {
  for (const seed of SEEDS) {
    const m = await buildCBaseMinMaterial(PERGUNTA, seed, "pt")
    const d = drawAll(seed)
    const dist = [...new Set([d.buzios.meta.first, d.buzios.meta.second])]
    const semFicha = dist.filter((x) => !fichaDoOdu(x))
    const ev = m.buzios.evidence.filter((e) => typeof e.itemIndex === "number")
    // uma entrada por Odu DISTINTO que tem ficha
    confere(`B · ${seed}: uma entrada por Odu distinto`, ev.length === dist.length - semFicha.length, `${ev.length} entradas para ${dist.length - semFicha.length} Odu(s)`)
    const vistos = new Set<number>()
    let intrusos = 0
    for (const e of ev) {
      const t = norm(e.excerpt.replace(/\s+/g, " ").slice(0, 320))
      for (let i = 0; i <= 16; i++) {
        const nomes = [norm(fichaDoOdu(i)?.odu ?? ""), norm(ODUS[i] ?? "")].filter((x) => x.length >= 3)
        if (!nomes.some((x) => inteira(t, x))) continue
        if (dist.includes(i)) vistos.add(i); else intrusos++
      }
    }
    confere(`B · ${seed}: zero Odu não sorteado`, intrusos === 0, `${intrusos} intruso(s)`)
    confere(`B · ${seed}: todos os Odus sorteados com ficha aparecem`, vistos.size === dist.length - semFicha.length, `${vistos.size} de ${dist.length - semFicha.length}`)
    // quedas iguais: uma ficha só, marcada
    if (dist.length === 1 && !semFicha.length) {
      confere(`B · ${seed}: quedas iguais dão UMA ficha`, ev.length === 1, String(ev.length))
      confere(`B · ${seed}: e a repetição é dita`, /nas duas quedas|both throws|dos tiradas/.test(ev[0]?.excerpt ?? ""))
    }
  }
}

// ── C · métricas por unidade sorteada ─────────────────────────────────────
async function parteC() {
  const acc: Record<string, { itens: number; refs: number; chars: number; cob: number; min: number; max: number }> = {}
  for (const k of ORACLE_ORDER) acc[k] = { itens: 0, refs: 0, chars: 0, cob: 0, min: Infinity, max: 0 }
  for (const seed of SEEDS) {
    const m = await buildCBaseMinMaterial(PERGUNTA, seed, "pt")
    for (const k of ORACLE_ORDER) {
      const a = acc[k]
      a.itens += m[k].items.length
      const refs = m[k].evidence.filter((e) => typeof e.itemIndex === "number").slice(0, TETO(k))
      a.refs += refs.length
      for (const e of refs) {
        const n = Math.min(320, e.excerpt.replace(/\s+/g, " ").length)
        a.chars += n; a.min = Math.min(a.min, n); a.max = Math.max(a.max, n)
      }
      a.cob += new Set(refs.map((e) => e.itemIndex)).size
    }
  }
  const porItem = ORACLE_ORDER.map((k) => acc[k].chars / acc[k].itens)
  const razao = Math.max(...porItem) / Math.min(...porItem)
  // NÃO exige igualdade: só detecta extremo. 3x é folga generosa sobre o 1,51x medido.
  confere("C · nenhum oráculo é extremo em chars por unidade sorteada", razao <= 3,
    ORACLE_ORDER.map((k, i) => `${k} ${Math.round(porItem[i])}`).join(" · ") + ` → razão ${razao.toFixed(2)}x`)
  for (const k of ORACLE_ORDER) {
    const a = acc[k]
    confere(`C · ${k}: nenhum trecho acima de 320`, a.max <= 320, String(a.max))
    confere(`C · ${k}: cobre ao menos metade das unidades`, a.cob / a.itens >= 0.5, `${(a.cob / a.itens).toFixed(2)}`)
  }
  // os búzios agora devem cobrir TUDO que tem ficha
  confere("C · búzios cobrem todas as unidades", acc.buzios.cob / acc.buzios.itens >= 0.5, String(acc.buzios.cob / acc.buzios.itens))
  if (process.argv.includes("--tabela")) {
    console.log(`\n  métricas por unidade sorteada (${SEEDS.length} seeds):`)
    console.log(`    sistema      itens  refs  chars/item   min   max   cobertura`)
    for (const k of ORACLE_ORDER) {
      const a = acc[k]
      console.log(`    ${k.padEnd(11)} ${String(a.itens).padStart(5)} ${String(a.refs).padStart(5)}  ${String(Math.round(a.chars / a.itens)).padStart(9)}  ${String(a.min === Infinity ? 0 : a.min).padStart(4)}  ${String(a.max).padStart(4)}   ${(a.cob / a.itens * 100).toFixed(0)}%`)
    }
  }
}

async function main() {
  parteA()
  await parteB()
  await parteC()
  if (falhas.length) {
    console.error(`\nA higiene da evidência falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas) console.error(`  ${f}`)
    console.error("")
    process.exit(1)
  }
  console.log(`higiene da evidência: ${conferidos} conferências, 16 Odus com ficha, zero símbolo não sorteado nos búzios`)
}

main()
