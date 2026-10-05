/**
 * Integridade da referência do I Ching.
 *
 * A conferência central é a BINÁRIA: o padrão Nine/Six das seis linhas de um
 * hexagrama É o binário dele. Se uma linha vier do capítulo vizinho, ou se a
 * polaridade for lida errado, o binário não fecha — e como os 64 hexagramas
 * ocupam os 64 padrões possíveis de 6 bits, exatamente uma vez cada, a prova é
 * completa sem usar ordinal, pinyin ou número impresso. Foi ela que achou um
 * `startsWith("NINE")` que dava 6 a toda primeira linha.
 *
 * Zero IA, zero rede.
 */
import { drawAll, HEXAGRAMS, hexagramNumber } from "../lib/oracles/draw"
import { ICHING_FICHAS } from "../lib/oracles/iching-fichas"
import { HEXAGRAMAS_COBERTOS, LINHAS_COBERTAS, fichaDoHexagrama, divergenciasIChing, referenciaDoIChing } from "../lib/oracles/iching-referencia"
import { buildCBaseMinMaterial } from "../lib/oracles/references"
import { LOCALES, type Locale } from "../lib/i18n/config"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

const SEEDS = ["fase10:0", "fase10:1", "fase10:2", "fase10:37", "fase10:65", "fase10:216", "fase10:256", "fase10:306", "fase10:317", "fase10:594"]
const PERGUNTA = "O que está em jogo agora?"

/**
 * As duas romanizações que a fonte escreve diferente da nossa tabela. O
 * vínculo canônico é o NÚMERO; isto fica registrado para que a divergência não
 * seja confundida com defeito, e para que uma mudança silenciosa apareça.
 */
const PINYIN_DIVERGENTE: Record<number, string> = { 40: "Xie", 57: "Sun" }

// ── A · as 64 fichas e as 384 linhas ──────────────────────────────────────
function parteA() {
  confere("A · 64 hexagramas com ficha", HEXAGRAMAS_COBERTOS === 64, String(HEXAGRAMAS_COBERTOS))
  confere("A · 384 linhas", LINHAS_COBERTAS === 384, String(LINHAS_COBERTAS))
  for (let n = 1; n <= 64; n++) {
    const f = fichaDoHexagrama(n)
    confere(`A · hexagrama ${n} tem ficha`, !!f)
    if (!f) continue
    confere(`A · hexagrama ${n} tem 6 linhas`, f.linhas.length === 6, `${f.linhas.length}`)
    const pos = f.linhas.map((l) => l.linha).sort((a, b) => a - b)
    confere(`A · hexagrama ${n}: linhas 1..6 sem repetir`, pos.join() === "1,2,3,4,5,6", pos.join())
    confere(`A · hexagrama ${n}: base não vazia`, f.base.length >= 15, `${f.base.length} chars`)
    confere(`A · hexagrama ${n}: página registrada`, f.pagina > 0, String(f.pagina))
    for (const l of f.linhas) {
      confere(`A · ${n}.${l.linha}: texto presente`, l.texto.length >= 3, `${l.texto.length} chars`)
      confere(`A · ${n}.${l.linha}: valor 6 ou 9`, l.valor === 6 || l.valor === 9, String(l.valor))
      confere(`A · ${n}.${l.linha}: página registrada`, l.pagina > 0, String(l.pagina))
    }
  }
  const txt = JSON.stringify(ICHING_FICHAS)
  confere("A · zero NUL", !txt.includes("\u0000"))
  // as páginas têm de crescer com o número do hexagrama, e as linhas de um
  // hexagrama têm de vir depois da abertura dele. Não prova a página exata,
  // mas pega erro grosseiro sem reabrir o PDF no prebuild.
  const ordenadas = [...ICHING_FICHAS].sort((a, b) => a.numero - b.numero)
  let foraDeOrdem = 0
  for (let i = 1; i < ordenadas.length; i++) if (ordenadas[i].pagina <= ordenadas[i - 1].pagina) foraDeOrdem++
  confere("A · páginas crescem com o número do hexagrama", foraDeOrdem === 0, `${foraDeOrdem} fora de ordem`)
  let linhaAntes = 0
  for (const f of ICHING_FICHAS) for (const l of f.linhas) if (l.pagina < f.pagina) linhaAntes++
  confere("A · nenhuma linha vem antes da abertura do seu hexagrama", linhaAntes === 0, String(linhaAntes))
  // coordenadas únicas: NN.L não pode repetir no índice inteiro
  const coord = new Set<string>()
  let dup = 0
  for (const f of ICHING_FICHAS) for (const l of f.linhas) {
    const k = `${f.numero}.${l.linha}`
    if (coord.has(k)) dup++
    coord.add(k)
  }
  confere("A · 384 coordenadas NN.L distintas", coord.size === 384 && dup === 0, `${coord.size} distintas, ${dup} duplicadas`)
}

// ── B · A CONFERÊNCIA BINÁRIA ─────────────────────────────────────────────
function parteB() {
  const porBits = new Map<string, number>()
  for (const f of ICHING_FICHAS) {
    const bits = [...f.linhas].sort((a, b) => a.linha - b.linha).map((l) => (l.valor === 9 ? 1 : 0))
    const s = bits.join("")
    confere(`B · hexagrama ${f.numero}: 6 bits`, s.length === 6, s)
    const derivado = hexagramNumber(bits)
    confere(`B · hexagrama ${f.numero}: as linhas formam o binário dele`, derivado === f.numero,
      `as linhas dão ${s}, que é o hexagrama ${derivado}`)
    if (porBits.has(s)) confere(`B · binário ${s} repetido`, false, `hexagramas ${porBits.get(s)} e ${f.numero}`)
    porBits.set(s, f.numero)
  }
  confere("B · 64 binários distintos", porBits.size === 64, String(porBits.size))
  // e os 64 padrões possíveis estão todos presentes
  let faltam = 0
  for (let i = 0; i < 64; i++) if (!porBits.has(i.toString(2).padStart(6, "0"))) faltam++
  confere("B · os 64 padrões possíveis de 6 bits estão cobertos", faltam === 0, `${faltam} ausentes`)
}

// ── C · coerência com a tabela do motor ───────────────────────────────────
function parteC() {
  const div = divergenciasIChing()
  confere("C · fichas e tabela do motor concordam", div.length === 0, div.join(" | "))
  for (const [n, naFonte] of Object.entries(PINYIN_DIVERGENTE)) {
    const f = fichaDoHexagrama(Number(n))
    confere(`C · hexagrama ${n}: divergência de romanização registrada`, f?.pinyinFonte === naFonte,
      `ficha diz "${f?.pinyinFonte ?? "nada"}", esperado "${naFonte}"`)
    confere(`C · hexagrama ${n}: o nome do produto é preservado`, f?.pinyin === HEXAGRAMS[Number(n) - 1].pinyin)
  }
  const inesperadas = ICHING_FICHAS.filter((f) => f.pinyinFonte && !PINYIN_DIVERGENTE[f.numero])
  confere("C · nenhuma divergência de romanização não declarada", inesperadas.length === 0,
    inesperadas.map((f) => `${f.numero} (${f.pinyinFonte})`).join(", "))
}

// ── D · o que chega ao prompt ─────────────────────────────────────────────
async function parteD() {
  for (const seed of SEEDS) {
    const m = await buildCBaseMinMaterial(PERGUNTA, seed, "pt")
    const d = drawAll(seed).iching
    const refs = m.iching.evidence.filter((e) => typeof e.itemIndex === "number")
    const itens = d.items.length
    confere(`D · ${seed}: uma entrada por unidade sorteada`, refs.length === itens, `${refs.length} de ${itens}`)
    // nenhuma linha não sorteada, nenhum hexagrama vizinho — medido pelo NÚMERO
    const sort = new Set([d.meta.primary, ...(d.meta.resulting ? [d.meta.resulting] : [])])
    let intrusos = 0, linhasIntrusas = 0
    for (const e of refs) {
      const t = e.excerpt.replace(/\s+/g, " ").slice(0, 320)
      for (const mm of t.matchAll(/hexagram[ae]?\s+(?:inicial\s+|resultante\s+|principal\s+)?([1-9]|[1-5]\d|6[0-4])\b/gi)) {
        if (!sort.has(Number(mm[1]))) intrusos++
      }
      for (const mm of t.matchAll(/linha móvel (\d)\b/g)) {
        if (!d.meta.moving.includes(Number(mm[1]))) linhasIntrusas++
      }
    }
    confere(`D · ${seed}: zero hexagrama não sorteado`, intrusos === 0, String(intrusos))
    confere(`D · ${seed}: zero linha não sorteada`, linhasIntrusas === 0, String(linhasIntrusas))
    // a hierarquia: inicial, depois as linhas, depois a resultante
    const papeis = refs.map((e) => {
      const t = e.excerpt
      return /hexagrama inicial/.test(t) ? "ini" : /linha móvel/.test(t) ? "lin" : /hexagrama resultante/.test(t) ? "res" : "?"
    })
    confere(`D · ${seed}: a primeira entrada é o hexagrama inicial`, papeis[0] === "ini", papeis.join(","))
    if (d.meta.resulting) confere(`D · ${seed}: a última é o resultante`, papeis[papeis.length - 1] === "res", papeis.join(","))
    else confere(`D · ${seed}: sem mutação, sem resultante`, !papeis.includes("res"), papeis.join(","))
    confere(`D · ${seed}: as linhas ficam no meio`, papeis.slice(1, 1 + d.meta.moving.length).every((p) => p === "lin"), papeis.join(","))
    confere(`D · ${seed}: nenhuma busca no glossário`, refs.every((e) => e.source.startsWith("Eranos Yijing")), refs.map((e) => e.source).join(" | "))
  }
}

// ── E · envelope e idiomas ────────────────────────────────────────────────
async function parteE() {
  for (const locale of LOCALES as readonly Locale[]) {
    const d = drawAll(SEEDS[0])
    const ev = referenciaDoIChing(d.iching.items, locale)
    confere(`E · ${locale}: nenhum trecho passa de 320`, ev.every((e) => e.excerpt.replace(/\s+/g, " ").length <= 320),
      String(Math.max(...ev.map((e) => e.excerpt.replace(/\s+/g, " ").length))))
    const rot = { pt: "hexagrama inicial", en: "primary hexagram", es: "hexagrama inicial" }[locale]
    confere(`E · ${locale}: o rótulo está localizado`, ev.some((e) => e.excerpt.includes(rot)), ev[0]?.excerpt.slice(0, 60) ?? "")
  }
}

// ── F · o sorteio não mudou ───────────────────────────────────────────────
function parteF() {
  // Valores LIDOS do motor, não digitados de memória: a primeira versão desta
  // lista trazia expectativas que eu inventei, e a conferência reprovou — o
  // sorteio estava certo, a expectativa não. `drawIChing` não foi tocado nesta
  // rodada (diff de 0 linhas em iching/hexagram/trigram/hexTerms/lineTerms).
  const conhecidos: Array<[string, number, string, number | null]> = [
    //           primary · linhas móveis · resultante
    ["fase10:65", 4, "", null],
    ["fase10:0", 47, "4", 29],
    ["fase10:1", 40, "3,4", 46],
    ["fase10:2", 62, "3,5,6", 12],
    ["fase10:37", 12, "1,3", 13],
    ["fase10:594", 19, "6", 41],
  ]
  for (const [seed, primary, moving, resulting] of conhecidos) {
    const d = drawAll(seed).iching
    confere(`F · ${seed}: sorteio idêntico`,
      d.meta.primary === primary && d.meta.moving.join(",") === moving && (d.meta.resulting ?? null) === resulting,
      `primary ${d.meta.primary} moving [${d.meta.moving.join(",")}] resulting ${d.meta.resulting}`)
  }
}

async function main() {
  parteA()
  parteB()
  parteC()
  await parteD()
  await parteE()
  parteF()
  if (falhas.length) {
    console.error(`\nA referência do I Ching falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas.slice(0, 30)) console.error(`  ${f}`)
    if (falhas.length > 30) console.error(`  … e mais ${falhas.length - 30}`)
    console.error("")
    process.exit(1)
  }
  console.log(`referência do I Ching: ${conferidos} conferências, 64 hexagramas, 384 linhas, binário fechado`)
}

main()
