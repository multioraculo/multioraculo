#!/usr/bin/env node
/**
 * Ingestão das ilustrações do Lenormand a partir das imagens de referência
 * (gravura marfim sobre lâmina violeta).
 *
 * Entrada: uma imagem com UMA carta ou uma folha com várias cartas em grade.
 * Para cada célula da grade o script:
 *   1. localiza a carta pela aresta luminosa (linhas quase brancas que
 *      atravessam a célula) — assim a grade não precisa ser exata;
 *   2. recorta uma JANELA FIXA relativa à carta (padrão: x 8–92 %, y 14–85 %),
 *      a mesma que o componente usa para posicionar a arte; assim a escala e a
 *      posição da ilustração ficam idênticas às da referência;
 *   3. separa o traço do fundo violeta por luminância, recupera a cor real do
 *      traço e grava PNG com fundo transparente em public/lenormand/<id>.png.
 *
 * Uso:
 *   node scripts/lenormand-ingest.mjs <imagem> <ids,…> [--cols 3 --rows 2]
 *     [--sheet x0,y0,x1,y1]   área das cartas na folha, em pixels (padrão: imagem inteira)
 *     [--art 0.08,0.14,0.92,0.85]  janela da arte dentro da carta (frações)
 *     [--threshold 0.16]      luminância mínima acima do fundo para virar traço
 *     [--maxw 360]            largura máxima do PNG final (as cartas renderizam a ≤110 px; 360 cobre 3× DPR)
 *     [--debug <dir>]         grava composições de conferência (original × arte sobre violeta)
 *
 * Ids: rider, clover, ship, house, tree, clouds, snake, coffin, bouquet, scythe,
 * whip, birds, child, fox, bear, stars, stork, dog, tower, garden, mountain,
 * crossroads, mice, heart, ring, book, letter, man, woman, lily, sun, moon, key,
 * fish, anchor, cross. Use "-" para pular uma célula.
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const sharp = require("sharp")

const IDS = ["rider","clover","ship","house","tree","clouds","snake","coffin","bouquet","scythe","whip","birds","child","fox","bear","stars","stork","dog","tower","garden","mountain","crossroads","mice","heart","ring","book","letter","man","woman","lily","sun","moon","key","fish","anchor","cross"]
const ART_WINDOW = [0.08, 0.14, 0.92, 0.85]

const args = process.argv.slice(2)
if (args.length < 2) { console.error("uso: lenormand-ingest.mjs <imagem> <ids> [opções]"); process.exit(1) }
const [file, idList] = args
const opt = (name, def) => { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : def }
const cols = parseInt(opt("cols", "1"), 10), rows = parseInt(opt("rows", "1"), 10)
const art = opt("art", ART_WINDOW.join(",")).split(",").map(Number)
const threshold = parseFloat(opt("threshold", "0.16"))
const debugDir = opt("debug", null)
const maxW = parseInt(opt("maxw", "360"), 10)
const ids = idList.split(",").map((s) => s.trim())
for (const id of ids) if (id !== "-" && !IDS.includes(id)) { console.error("id inválido:", id); process.exit(1) }
if (ids.length !== cols * rows) { console.error(`esperava ${cols * rows} ids para ${cols}×${rows}`); process.exit(1) }

const outDir = path.resolve("public/lenormand")
fs.mkdirSync(outDir, { recursive: true })
if (debugDir) fs.mkdirSync(debugDir, { recursive: true })

const { data: px, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width, H = info.height, C = info.channels
const lumAt = (x, y) => { const i = (y * W + x) * C; return (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255 }
const sheetOpt = opt("sheet", null)
const sheet = sheetOpt ? sheetOpt.split(",").map(Number) : [0, 0, W, H]
const cw = (sheet[2] - sheet[0]) / cols, chh = (sheet[3] - sheet[1]) / rows

/** Acha a carta dentro da célula pela aresta luminosa: a primeira e a última
 *  coluna/linha em que ≥ 30 % dos pixels são bem mais claros que o fundo da
 *  célula. Volta null se não encontrar. */
function findCard(x0, y0, x1, y1) {
  const meds = []; for (let y = y0; y < y1; y += 3) for (let x = x0; x < x1; x += 3) meds.push(lumAt(x, y)); meds.sort((a, b) => a - b)
  const BRIGHT = meds[Math.floor(meds.length / 2)] + 0.22
  const colFrac = [], rowFrac = []
  for (let x = x0; x < x1; x++) { let n = 0; for (let y = y0; y < y1; y++) if (lumAt(x, y) > BRIGHT) n++; colFrac.push(n / (y1 - y0)) }
  for (let y = y0; y < y1; y++) { let n = 0; for (let x = x0; x < x1; x++) if (lumAt(x, y) > BRIGHT) n++; rowFrac.push(n / (x1 - x0)) }
  const first = (arr) => arr.findIndex((v) => v >= 0.3)
  const last = (arr) => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i] >= 0.3) return i; return -1 }
  const cl = first(colFrac), cr = last(colFrac), rt = first(rowFrac), rb = last(rowFrac)
  if (cl < 0 || cr <= cl + 50 || rt < 0 || rb <= rt + 50) return null
  return { x0: x0 + cl, y0: y0 + rt, x1: x0 + cr + 1, y1: y0 + rb + 1 }
}

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const id = ids[r * cols + c]
    if (id === "-") continue
    const cell = { x0: Math.round(sheet[0] + c * cw), y0: Math.round(sheet[1] + r * chh), x1: Math.round(sheet[0] + (c + 1) * cw), y1: Math.round(sheet[1] + (r + 1) * chh) }
    const found = findCard(cell.x0, cell.y0, cell.x1, cell.y1)
    const card = found ?? cell
    const w = card.x1 - card.x0, h = card.y1 - card.y0
    const region = { left: Math.round(card.x0 + art[0] * w), top: Math.round(card.y0 + art[1] * h), width: Math.round((art[2] - art[0]) * w), height: Math.round((art[3] - art[1]) * h) }
    const n = region.width * region.height
    const lum = new Float32Array(n), rgb = new Uint8Array(n * 3)
    for (let y = 0; y < region.height; y++) for (let x = 0; x < region.width; x++) {
      const si = ((region.top + y) * W + region.left + x) * C, di = y * region.width + x
      rgb[di * 3] = px[si]; rgb[di * 3 + 1] = px[si + 1]; rgb[di * 3 + 2] = px[si + 2]
      lum[di] = (0.2126 * px[si] + 0.7152 * px[si + 1] + 0.0722 * px[si + 2]) / 255
    }
    const sorted = Float32Array.from(lum).sort()
    const bg = sorted[Math.floor(n * 0.5)] // fundo: mediana da janela
    const top = sorted[Math.floor(n * 0.995)] // traço: percentil 99,5
    const span = Math.max(top - bg, 0.05)
    // cor média do fundo (para recuperar a cor real do traço por pixel)
    let br = 0, bgc = 0, bb = 0, bn = 0
    for (let i = 0; i < n; i++) if (Math.abs(lum[i] - bg) < 0.03) { br += rgb[i * 3]; bgc += rgb[i * 3 + 1]; bb += rgb[i * 3 + 2]; bn++ }
    br /= bn || 1; bgc /= bn || 1; bb /= bn || 1
    const out = Buffer.alloc(n * 4)
    for (let i = 0; i < n; i++) {
      const t = (lum[i] - bg) / span
      const a = t <= threshold ? 0 : Math.min(1, (t - threshold) / (1 - threshold))
      if (a > 0) {
        const k = Math.max(a, 0.35)
        out[i * 4] = Math.max(0, Math.min(255, br + (rgb[i * 3] - br) / k))
        out[i * 4 + 1] = Math.max(0, Math.min(255, bgc + (rgb[i * 3 + 1] - bgc) / k))
        out[i * 4 + 2] = Math.max(0, Math.min(255, bb + (rgb[i * 3 + 2] - bb) / k))
      } else { out[i * 4] = 244; out[i * 4 + 1] = 234; out[i * 4 + 2] = 216 }
      out[i * 4 + 3] = Math.round(a * 255)
    }
    const dest = path.join(outDir, `${id}.png`)
    await sharp(out, { raw: { width: region.width, height: region.height, channels: 4 } }).resize({ width: Math.min(region.width, maxW) }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(dest)
    console.log("ok", id.padEnd(10), found ? "carta" : "CÉLULA", `${w}×${h} @${card.x0},${card.y0}`, `arte ${region.width}×${region.height}`, `fundo ${bg.toFixed(2)} traço ${top.toFixed(2)}`)
    if (debugDir) {
      // conferência: carta original ao lado da arte recomposta sobre violeta liso
      const orig = await sharp(file).extract({ left: card.x0, top: card.y0, width: w, height: h }).toBuffer()
      const lamina = await sharp({ create: { width: w, height: h, channels: 4, background: { r: 92, g: 70, b: 196, alpha: 1 } } })
        .composite([{ input: dest, left: region.left - card.x0, top: region.top - card.y0 }]).png().toBuffer()
      await sharp({ create: { width: w * 2 + 12, height: h, channels: 4, background: { r: 20, g: 10, b: 50, alpha: 1 } } })
        .composite([{ input: orig, left: 0, top: 0 }, { input: lamina, left: w + 12, top: 0 }]).png().toFile(path.join(debugDir, `${id}.png`))
    }
  }
}
