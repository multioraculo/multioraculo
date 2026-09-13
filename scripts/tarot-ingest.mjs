#!/usr/bin/env node
/**
 * Ingestão das ilustrações do Tarô a partir das folhas de referência
 * (gravura marfim e ouro sobre lâmina azul), mesmo método do Lenormand.
 *
 * Para cada célula da grade o script:
 *   1. localiza a carta pela aresta luminosa (linhas quase brancas que
 *      atravessam a célula), então a grade não precisa ser exata;
 *   2. recorta uma JANELA FIXA relativa à carta — a mesma que o componente
 *      usa para posicionar a arte, por isso escala e posição batem com a
 *      referência. A janela deixa de fora a faixa do nome impresso (em
 *      francês) e o numeral do topo: nome e número vêm do motor, no idioma
 *      da pessoa;
 *   3. separa o traço do fundo azul por luminância, recupera a cor real do
 *      traço e grava PNG com fundo transparente em public/tarot/art/<id>.png.
 *
 * As folhas e o que há em cada célula estão em FOLHAS, abaixo: rodar
 * `node scripts/tarot-ingest.mjs` sem argumentos refaz o baralho inteiro.
 *
 * Uso:
 *   node scripts/tarot-ingest.mjs [ids,…]        só estas cartas (padrão: todas)
 *     [--art 0.055,0.02,0.945,0.965]  janela da arte dentro da carta (frações)
 *     [--threshold 0.07]             luminância mínima acima do fundo para virar traço (baixa: preserva o céu estrelado)
 *     [--maxw 300]                   largura máxima do PNG final (a carta renderiza a 92 px)
 *     [--debug <dir>]                grava conferências (original × arte sobre a lâmina)
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const sharp = require("sharp")

const SRC = "public/tarot/newcbd"
const OUT = "public/tarot/art"

/**
 * Folhas de referência, na ordem de leitura de cada grade (esquerda→direita,
 * cima→baixo). "-" pula a célula: são as quatro cartas que vieram em duas
 * versões (o XIII, o VIII e o X de Ouros, o II de Ouros), das quais fica
 * valendo a primeira ocorrência.
 */
const FOLHAS = [
  ["Tarot_01.png", 3, 2, ["major-02", "major-03", "major-04", "major-12", "major-13", "major-14"]],
  ["Tarot_02.png", 3, 2, ["major-05", "major-06", "major-07", "major-15", "major-16", "major-17"]],
  ["Tarot_03.png", 3, 2, ["major-08", "major-09", "major-10", "major-18", "major-19", "major-20"]],
  ["Tarot_04.png", 3, 2, ["major-11", "coins-11", "coins-12", "major-21", "coins-07", "coins-08"]],
  ["Tarot_05.png", 3, 2, ["coins-13", "coins-14", "cups-01", "cups-08", "cups-10", "cups-11"]],
  ["Tarot_06.png", 3, 2, ["cups-02", "cups-03", "cups-04", "cups-12", "cups-13", "cups-14"]],
  ["Tarot_07.png", 3, 2, ["cups-05", "cups-06", "wands-05", "major-00", "major-01", "coins-01"]],
  ["Tarot_08.png", 3, 2, ["wands-06", "wands-07", "wands-08", "coins-02", "coins-03", "coins-04"]],
  ["Tarot_09.png", 3, 2, ["wands-09", "wands-10", "wands-11", "coins-05", "coins-06", "coins-10"]],
  ["Tarot_10.png", 3, 2, ["wands-12", "wands-13", "wands-14", "-", "coins-09", "-"]],
  ["Tarot_11.png", 4, 2, ["swords-14", "wands-01", "wands-02", "wands-03", "swords-10", "swords-11", "swords-12", "swords-13"]],
  ["Tarot_12.png", 3, 2, ["swords-01", "swords-02", "swords-03", "swords-04", "swords-05", "swords-06"]],
  ["Tarot_13.png", 2, 2, ["swords-08", "swords-09", "swords-07", "-"]],
  ["Tarot_14.png", 2, 2, ["cups-09", "-", "cups-07", "wands-04"]],
]

const args = process.argv.slice(2)
const opt = (name, def) => { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : def }
/** Janela da arte dentro da carta (x0, y0, x1, y1): a mesma no CSS. */
const JANELA = opt("art", "0.026,0.014,0.974,0.986").split(",").map(Number)
const threshold = parseFloat(opt("threshold", "0.07"))
const maxW = parseInt(opt("maxw", "760"), 10)
/** força da recuperação de cor do traço: 1 = nenhuma, 0,35 = agressiva */
const unmix = parseFloat(opt("unmix", "0.8"))
/** sólido: grava a carta opaca, sem transparência (padrão) */
const solido = !args.includes("--recortado")
/** tela única de saída no modo recortado: todas as cartas do mesmo tamanho */
const TELA = opt("tela", "360,595").split(",").map(Number)
/** a lâmina é a mesma para as 78: número no alto e nome embaixo em todas */
const TELA_MAIOR = opt("tela-maior", "360,595").split(",").map(Number)
/** deformação máxima permitida; o que faltar para encher vira corte centrado */
const ESTICA = parseFloat(opt("estica", "0.07"))
/** se o corte passar disso, estica mais em vez de cortar desenho */
const CORTE_MAX = parseFloat(opt("corte-max", "0.12"))
const ESTICA_MAX = parseFloat(opt("estica-max", "0.16"))
const deformacoes = []
const debugDir = opt("debug", null)
const somente = args.filter((a) => !a.startsWith("--") && args[args.indexOf(a) - 1]?.startsWith("--") !== true)
const filtro = somente.length ? new Set(somente.flatMap((s) => s.split(","))) : null

fs.mkdirSync(OUT, { recursive: true })
if (debugDir) fs.mkdirSync(debugDir, { recursive: true })

let feitas = 0
for (const [arquivo, cols, rows, ids] of FOLHAS) {
  if (ids.length !== cols * rows) { console.error(`${arquivo}: ${ids.length} ids para ${cols}×${rows}`); process.exit(1) }
  if (filtro && !ids.some((id) => filtro.has(id))) continue
  const file = path.join(SRC, arquivo)
  const { data: px, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width, H = info.height, C = info.channels
  const lumAt = (x, y) => { const i = (y * W + x) * C; return (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255 }
  const cw = W / cols, chh = H / rows

  /**
   * Acha a carta na célula pelo CAMPO AZUL, não pela aresta luminosa: assim a
   * borda que brilha, o halo em volta e a margem branca da folha ficam de fora.
   * Pixel de carta = azul bem acima do vermelho e longe do branco.
   */
  const isCard = (x, y) => {
    const i = (y * W + x) * C
    return px[i + 2] > px[i] + 12 && lumAt(x, y) < 0.8
  }
  const findCard = (x0, y0, x1, y1) => {
    const colFrac = [], rowFrac = []
    for (let x = x0; x < x1; x++) { let n = 0; for (let y = y0; y < y1; y++) if (isCard(x, y)) n++; colFrac.push(n / (y1 - y0)) }
    for (let y = y0; y < y1; y++) { let n = 0; for (let x = x0; x < x1; x++) if (isCard(x, y)) n++; rowFrac.push(n / (x1 - x0)) }
    const first = (arr) => arr.findIndex((v) => v >= 0.3)
    const last = (arr) => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i] >= 0.3) return i; return -1 }
    const cl = first(colFrac), cr = last(colFrac), rt = first(rowFrac), rb = last(rowFrac)
    if (cl < 0 || cr <= cl + 50 || rt < 0 || rb <= rt + 50) return null
    return { x0: x0 + cl, y0: y0 + rt, x1: x0 + cr + 1, y1: y0 + rb + 1 }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = ids[r * cols + c]
      if (id === "-" || (filtro && !filtro.has(id))) continue
      const cell = { x0: Math.round(c * cw), y0: Math.round(r * chh), x1: Math.round((c + 1) * cw), y1: Math.round((r + 1) * chh) }
      const found = findCard(cell.x0, cell.y0, cell.x1, cell.y1)
      const card = found ?? cell
      // Apara o halo. A folha tem um brilho lavanda em volta de cada carta, e
      // ele é azulado o bastante para passar no teste que acha a carta. Aqui o
      // critério é o azul PROFUNDO do campo impresso, e a borda só é aceita
      // quando várias linhas seguidas confirmam o campo: uma linha isolada
      // pode ser o filete claro da moldura ou uma estrela. Depois de achar o
      // campo, recua um pouco para não comer o filete, que é parte da carta.
      {
        const campoAzul = (x, y) => {
          const i = (y * W + x) * C
          return px[i + 2] > px[i] + 25 && lumAt(x, y) < 0.55
        }
        const fracCol = (x) => { let n = 0; for (let y = card.y0; y < card.y1; y++) if (campoAzul(x, y)) n++; return n / (card.y1 - card.y0) }
        const fracLin = (y) => { let n = 0; for (let x = card.x0; x < card.x1; x++) if (campoAzul(x, y)) n++; return n / (card.x1 - card.x0) }
        const lado = Math.min(card.x1 - card.x0, card.y1 - card.y0)
        const limite = Math.round(lado * 0.16)
        const corrida = Math.max(3, Math.round(lado * 0.012))
        const recuo = Math.max(2, Math.round(lado * 0.012))
        const buscar = (frac, de, passo) => {
          for (let k = 0; k < limite; k++) {
            const pos = de + passo * k
            let ok = true
            for (let r = 0; r < corrida; r++) if (frac(pos + passo * r) < 0.5) { ok = false; break }
            if (ok) return Math.max(0, k - recuo)
          }
          return 0
        }
        card.x0 += buscar(fracCol, card.x0, 1)
        card.x1 -= buscar(fracCol, card.x1 - 1, -1)
        card.y0 += buscar(fracLin, card.y0, 1)
        card.y1 -= buscar(fracLin, card.y1 - 1, -1)

        // Última passada: o que sobrou de brilho é uma orla bem mais clara que
        // o campo da própria carta. Compara a mediana da linha de borda com a
        // mediana do miolo e apara enquanto a diferença for grande.
        const medianaDe = (vals) => { vals.sort((a, b) => a - b); return vals[Math.floor(vals.length / 2)] }
        const miolo = []
        for (let y = card.y0 + Math.round((card.y1 - card.y0) * 0.2); y < card.y1 - Math.round((card.y1 - card.y0) * 0.2); y += 3)
          for (let x = card.x0 + Math.round((card.x1 - card.x0) * 0.2); x < card.x1 - Math.round((card.x1 - card.x0) * 0.2); x += 3) miolo.push(lumAt(x, y))
        const base = medianaDe(miolo)
        const medCol = (x) => { const v = []; for (let y = card.y0; y < card.y1; y += 2) v.push(lumAt(x, y)); return medianaDe(v) }
        const medLin = (y) => { const v = []; for (let x = card.x0; x < card.x1; x += 2) v.push(lumAt(x, y)); return medianaDe(v) }
        const orla = Math.round(lado * 0.05)
        for (let i = 0; i < orla && medCol(card.x0) > base + 0.18; i++) card.x0++
        for (let i = 0; i < orla && medCol(card.x1 - 1) > base + 0.18; i++) card.x1--
        for (let i = 0; i < orla && medLin(card.y0) > base + 0.18; i++) card.y0++
        for (let i = 0; i < orla && medLin(card.y1 - 1) > base + 0.18; i++) card.y1--
      }
      const w = card.x1 - card.x0, h = card.y1 - card.y0
      // Só a FIGURA. A carta impressa separa o numeral do alto e a faixa do
      // nome embaixo por um FILETE claro que atravessa a carta inteira. Achar
      // esse filete por carta é bem mais preciso que um recorte fixo em
      // fração, que ora deixava o numeral, ora comia o chapéu da figura.
      const ehMaior = id.startsWith("major-")
      const ehFigura = !ehMaior && Number(id.slice(-2)) >= 11
      let corte, lateral = [JANELA[0], JANELA[2]]
      if (solido) corte = [JANELA[1], JANELA[3]]
      else {
        const x0f = Math.round(card.x0 + 0.12 * w), x1f = Math.round(card.x1 - 0.12 * w)
        const claroNaLinha = (y) => { let n = 0; for (let x = x0f; x < x1f; x++) if (lumAt(x, y) > 0.62) n++; return n / (x1f - x0f) }
        // Um FILETE é uma linha fina e isolada: clara na própria linha e escura
        // logo acima e logo abaixo. Sem essa exigência, elementos horizontais
        // do desenho — o braço do cavaleiro, a trave dos bastões — passavam
        // por filete e o recorte comia a cabeça da figura.
        const folga = Math.max(3, Math.round(h * 0.012))
        const ehFilete = (y) =>
          claroNaLinha(y) > 0.80 &&
          claroNaLinha(y - folga) < 0.45 &&
          claroNaLinha(y + folga) < 0.45
        // Nos Maiores a busca não desce abaixo de 5,5%: lá está o filete de
        // fora da moldura, e pegá-lo deixava o numeral impresso dentro da arte
        // (era o que acontecia em Le Pape e L'Amoureux). O filete que interessa
        // é o de baixo do numeral, mais fundo na carta.
        const minTopo = Math.round(h * (ehMaior ? 0.055 : 0.012))
        let topo = null
        for (let k = Math.round(h * 0.20); k >= minTopo; k--) {
          if (ehFilete(card.y0 + k)) { topo = k; break }
        }
        let base = null
        for (let k = Math.round(h * 0.70); k < Math.round(h * 0.985); k++) {
          if (ehFilete(card.y0 + k)) { base = k; break }
        }
        const margem = Math.round(h * 0.012)
        // Quando NÃO se acha o filete, o recuo tem de ser mínimo: em várias
        // cartas a figura encosta no alto da carta (o Cavaleiro de Copas é o
        // caso claro) e qualquer recuo generoso raspa a cabeça.
        const topoFrac = topo != null ? (topo + margem) / h : (ehMaior ? 0.062 : 0.014)
        const baseFrac = base != null ? (base - margem) / h : (ehMaior ? 0.9 : ehFigura ? 0.876 : 0.972)
        corte = [topoFrac, baseFrac]

        // Mesma ideia nas laterais: a cercadura impressa é um filete claro
        // vertical, e é ele que sobrava como rebarba nos dois lados. Procura
        // dentro dos primeiros 18% de cada lado, já limitado à altura da
        // figura, para não confundir com o traço do desenho.
        const yA = Math.round(card.y0 + topoFrac * h), yB = Math.round(card.y0 + baseFrac * h)
        const claroNaColuna = (x) => { let n = 0; for (let y = yA; y < yB; y++) if (lumAt(x, y) > 0.62) n++; return n / Math.max(1, yB - yA) }
        const margemX = Math.round(w * 0.014)
        const folgaX = Math.max(3, Math.round(w * 0.02))
        const ehFileteV = (x) =>
          claroNaColuna(x) > 0.80 && claroNaColuna(x - folgaX) < 0.45 && claroNaColuna(x + folgaX) < 0.45
        let esq = null
        for (let k = Math.round(w * 0.18); k >= Math.round(w * 0.004); k--) if (ehFileteV(card.x0 + k)) { esq = k; break }
        let dir = null
        for (let k = Math.round(w * 0.18); k >= Math.round(w * 0.004); k--) if (ehFileteV(card.x1 - 1 - k)) { dir = k; break }
        lateral = [
          esq != null ? (esq + margemX) / w : JANELA[0],
          dir != null ? 1 - (dir + margemX) / w : JANELA[2],
        ]
      }
      const region = {
        left: Math.round(card.x0 + lateral[0] * w), top: Math.round(card.y0 + corte[0] * h),
        width: Math.round((lateral[1] - lateral[0]) * w), height: Math.round((corte[1] - corte[0]) * h),
      }
      if (solido) {
        // A carta inteira, opaca, como foi impressa: o céu estrelado e o campo
        // azul fazem parte da composição e sumiriam se virassem transparência.
        // O acabamento vem da lâmina em volta, não de recortar o desenho.
        await sharp(file)
          .extract({ left: region.left, top: region.top, width: region.width, height: region.height })
          .resize({ width: Math.min(region.width, maxW) })
          .webp({ quality: 86, effort: 6 })
          .toFile(path.join(OUT, `${id}.webp`))
        feitas++
        console.log("ok", id.padEnd(10), found ? "carta " : "CÉLULA", `${w}×${h}`, `arte ${region.width}×${region.height}`, `proporção ${(region.width / region.height).toFixed(3)}`)
        continue
      }
      const n = region.width * region.height
      const lum = new Float32Array(n), rgb = new Uint8Array(n * 3)
      for (let y = 0; y < region.height; y++) for (let x = 0; x < region.width; x++) {
        const si = ((region.top + y) * W + region.left + x) * C, di = y * region.width + x
        rgb[di * 3] = px[si]; rgb[di * 3 + 1] = px[si + 1]; rgb[di * 3 + 2] = px[si + 2]
        lum[di] = (0.2126 * px[si] + 0.7152 * px[si + 1] + 0.0722 * px[si + 2]) / 255
      }
      const sorted = Float32Array.from(lum).sort()
      const bg = sorted[Math.floor(n * 0.5)]
      const topo = sorted[Math.floor(n * 0.995)]
      const span = Math.max(topo - bg, 0.05)
      let br = 0, bgc = 0, bb = 0, bn = 0
      for (let i = 0; i < n; i++) if (Math.abs(lum[i] - bg) < 0.03) { br += rgb[i * 3]; bgc += rgb[i * 3 + 1]; bb += rgb[i * 3 + 2]; bn++ }
      br /= bn || 1; bgc /= bn || 1; bb /= bn || 1
      const out = Buffer.alloc(n * 4)
      // A moldura da carta é uma linha clara e FRIA rente à borda. O traço da
      // gravura é quente (creme). Só na margem externa da janela, o que for
      // claro e frio vira fundo: assim a moldura some sem tocar no desenho.
      const margem = Math.round(region.width * 0.03)
      for (let i = 0; i < n; i++) {
        const px_x = i % region.width, px_y = (i / region.width) | 0
        const naMargem = px_x < margem || px_x >= region.width - margem || px_y < margem || px_y >= region.height - margem
        const frio = rgb[i * 3 + 2] >= rgb[i * 3] - 4
        if (naMargem && frio && lum[i] > 0.62) { out[i * 4] = 244; out[i * 4 + 1] = 234; out[i * 4 + 2] = 216; out[i * 4 + 3] = 0; continue }
        const t = (lum[i] - bg) / span
        const a = t <= threshold ? 0 : Math.min(1, (t - threshold) / (1 - threshold))
        if (a > 0) {
          // Recupera a cor do traço tirando o fundo de dentro do pixel, mas com
          // mão leve: k alto demais clareia e esverdeia o ouro da gravura.
          const k = Math.max(a, unmix)
          out[i * 4] = Math.max(0, Math.min(255, br + (rgb[i * 3] - br) / k))
          out[i * 4 + 1] = Math.max(0, Math.min(255, bgc + (rgb[i * 3 + 1] - bgc) / k))
          out[i * 4 + 2] = Math.max(0, Math.min(255, bb + (rgb[i * 3 + 2] - bb) / k))
        } else { out[i * 4] = 244; out[i * 4 + 1] = 234; out[i * 4 + 2] = 216 }
        out[i * 4 + 3] = Math.round(a * 255)
      }
      const dest = path.join(OUT, `${id}.png`)
      const arte = await sharp(out, { raw: { width: region.width, height: region.height, channels: 4 } }).png().toBuffer()
      // o sharp aplica resize ANTES do composite no mesmo pipeline, então a
      // tela é montada primeiro e só depois reduzida, em duas passagens
      // TELA ÚNICA. Todas as cartas saem exatamente do mesmo tamanho, com a
      // gravura preenchendo tudo: primeiro apara no traço (tira a sobra
      // transparente em volta), depois estica para a tela. Como as gravuras já
      // chegam quase na proporção certa, a deformação é pequena — o relatório
      // no fim mostra quanto foi em cada carta.
      // TELA ÚNICA por tipo: maiores e menores têm janelas diferentes na
      // lâmina, porque só os maiores reservam faixa de número e de nome.
      // --- acabamento do recorte -------------------------------------------
      // a) tira cisco: componente de alfa pequeno demais é rebarba do halo ou
      //    serrilha solta, não desenho.
      {
        const vis = new Uint8Array(n)
        const minArea = Math.max(10, Math.round(n * 0.00004))
        const pilha = new Int32Array(n)
        for (let p0 = 0; p0 < n; p0++) {
          if (vis[p0] || out[p0 * 4 + 3] < 40) continue
          let topo = 0, conta = 0
          pilha[topo++] = p0; vis[p0] = 1
          const comp = []
          while (topo > 0) {
            const q = pilha[--topo], qx = q % region.width, qy = (q / region.width) | 0
            comp.push(q); conta++
            const viz = [qx > 0 ? q - 1 : -1, qx < region.width - 1 ? q + 1 : -1,
                         qy > 0 ? q - region.width : -1, qy < region.height - 1 ? q + region.width : -1]
            for (const r of viz) if (r >= 0 && !vis[r] && out[r * 4 + 3] >= 40) { vis[r] = 1; pilha[topo++] = r }
          }
          if (conta < minArea) for (const q of comp) out[q * 4 + 3] = 0
        }
      }
      // b) apara o degrau do limiar no alfa. O peso do próprio pixel é alto de
      //    propósito: média simples engrossa o traço e faz a gravura parecer
      //    de baixa resolução, que era o efeito da versão anterior.
      {
        const SUAVE = 40
        const a0 = new Uint8Array(n)
        for (let i2 = 0; i2 < n; i2++) a0[i2] = out[i2 * 4 + 3]
        for (let y = 0; y < region.height; y++) for (let x = 0; x < region.width; x++) {
          let soma = a0[y * region.width + x] * SUAVE, peso = SUAVE
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const nx = x + dx, ny = y + dy
            if (nx < 0 || ny < 0 || nx >= region.width || ny >= region.height) continue
            soma += a0[ny * region.width + nx]; peso++
          }
          out[(y * region.width + x) * 4 + 3] = Math.round(soma / peso)
        }
      }

      const arteLimpa = await sharp(out, { raw: { width: region.width, height: region.height, channels: 4 } })
        .png().toBuffer()

      // c) apara no traço: some a margem transparente, então a figura encosta
      //    nas quatro bordas e preenche a janela da lâmina.
      const aparada = await sharp(arteLimpa).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true })
      const AW = aparada.info.width, AH = aparada.info.height
      const tela = ehMaior ? TELA_MAIOR : TELA
      const alvo = tela[0] / tela[1]
      const antes = AW / AH
      // d) enquadramento híbrido. Primeiro tenta caber esticando até ESTICA;
      //    o que faltar vira corte. Se o corte passar de CORTE_MAX, estica um
      //    pouco mais (até ESTICA_MAX) para devolver desenho em vez de cortar.
      //    Em carta com figura o corte é ancorado no topo, porque a cabeça é o
      //    que não pode sumir; em pip, que é simétrico, fica centrado.
      const precisa = alvo / antes
      let fator = Math.min(1 + ESTICA, Math.max(1 - ESTICA, precisa))
      let corteResultante = Math.abs(1 - precisa / fator)
      if (corteResultante > CORTE_MAX) {
        const necessario = precisa / (1 + CORTE_MAX * Math.sign(precisa - fator) || 1)
        fator = Math.min(1 + ESTICA_MAX, Math.max(1 - ESTICA_MAX, precisa / (1 + CORTE_MAX * (precisa > fator ? 1 : -1))))
        corteResultante = Math.abs(1 - precisa / fator)
      }
      const largAjust = Math.max(8, Math.round(AW * fator))
      const deformacao = Math.abs(fator - 1)
      deformacoes.push({ id, deformacao, antes, corte: corteResultante, topoFrac: corte[0], baseFrac: corte[1], lateral })
      const ancora = ehMaior || ehFigura ? "top" : "centre"
      await sharp(aparada.data)
        .resize({ width: largAjust, height: AH, fit: "fill" })
        .resize({ width: tela[0], height: tela[1], fit: "cover", position: ancora })
        .png({ compressionLevel: 9, palette: true, colours: 128, quality: 100, effort: 10 })
        .toFile(dest)
      feitas++
      console.log("ok", id.padEnd(10), found ? "carta " : "CÉLULA", `${w}×${h}`, `arte ${region.width}×${region.height}`, `proporção ${(region.width / region.height).toFixed(3)}`)
      if (debugDir) {
        const orig = await sharp(file).extract({ left: card.x0, top: card.y0, width: w, height: h }).toBuffer()
        const lamina = await sharp({ create: { width: w, height: h, channels: 4, background: { r: 26, g: 30, b: 92, alpha: 1 } } })
          .composite([{ input: dest, left: region.left - card.x0, top: region.top - card.y0 }]).png().toBuffer()
        await sharp({ create: { width: w * 2 + 12, height: h, channels: 4, background: { r: 12, g: 8, b: 34, alpha: 1 } } })
          .composite([{ input: orig, left: 0, top: 0 }, { input: lamina, left: w + 12, top: 0 }]).png().toFile(path.join(debugDir, `${id}.png`))
      }
    }
  }
}
console.log(`\n${feitas} cartas em ${OUT}`)

/**
 * Equalização do conjunto. As folhas saíram em lotes diferentes e algumas
 * cartas ficaram com o fundo mais claro ou o traço mais apagado que o resto
 * (o Mago é o caso mais visível). A correção ancora em dois pontos que são
 * do MATERIAL, não da composição: o azul do campo (percentil 20) e o creme do
 * traço (percentil 97). Assim um arcano denso e um pip vazio podem continuar
 * com densidades diferentes, que é o certo, e mesmo assim dividirem o mesmo
 * registro de luz.
 *
 * É correção de exposição: o mesmo ganho nos três canais, sem inventar matiz.
 * Ganho e deslocamento são travados em faixas estreitas, e a carta que já está
 * dentro da tolerância não é tocada.
 */
async function equalizar() {
  const arquivos = fs.readdirSync(OUT).filter((f) => f.endsWith(".webp") || f.endsWith(".png"))
  if (arquivos.length < 10) return
  const stats = []
  for (const f of arquivos) {
    const { data, info } = await sharp(path.join(OUT, f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const C = info.channels, n = info.width * info.height
    // só pixel de traço entra na conta: o transparente não é fundo da carta,
    // é o vazio por onde a lâmina aparece, e contá-lo falseia a medição
    const lum = []
    for (let i = 0; i < n; i++) {
      if (data[i * C + 3] < 190) continue
      lum.push(0.2126 * data[i * C] + 0.7152 * data[i * C + 1] + 0.0722 * data[i * C + 2])
    }
    if (lum.length < 500) continue
    const ord = Float32Array.from(lum).sort()
    const q = (p) => ord[Math.min(ord.length - 1, Math.floor(ord.length * p))]
    stats.push({ f, meio: q(0.50), baixo: q(0.10), alto: q(0.90) })
  }
  const medianaDe = (k) => { const v = stats.map((s) => s[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)] }
  const alvo = { meio: medianaDe("meio"), baixo: medianaDe("baixo"), alto: medianaDe("alto") }
  console.log(`
alvo do baralho, medido só na gravura: meio ${alvo.meio.toFixed(0)} · faixa ${(alvo.alto - alvo.baixo).toFixed(0)}`)
  const tocadas = []
  for (const s of stats) {
    // No recorte transparente o traço já sai praticamente uniforme, então
    // mexer no contraste é perseguir ruído. A correção é só de exposição, um
    // deslocamento que leva a mediana da gravura até a mediana do baralho, e
    // só nas cartas que estão de fato fora de tom. As outras não são tocadas.
    const diferenca = alvo.meio - s.meio
    if (Math.abs(diferenca) < 10) continue
    const ganho = 1
    const desloc = Math.min(20, Math.max(-20, diferenca))
    const bruto = fs.readFileSync(path.join(OUT, s.f))
    const saida = s.f.endsWith(".png") ? { png: { compressionLevel: 9, palette: true, quality: 92 } } : { webp: { quality: 86, effort: 6 } }
    let pipe = sharp(bruto).linear(ganho, desloc)
    pipe = saida.png ? pipe.png(saida.png) : pipe.webp(saida.webp)
    const corrigida = await pipe.toBuffer()
    fs.writeFileSync(path.join(OUT, s.f), corrigida)
    tocadas.push({ id: s.f.replace(/\.(webp|png)$/, ""), ganho, desloc, meio: s.meio })
  }
  const peso = (a) => Math.abs(a.ganho - 1) * 100 + Math.abs(a.desloc)
  tocadas.sort((a, b) => peso(b) - peso(a))
  console.log(`${tocadas.length} de ${stats.length} cartas equalizadas; ${stats.length - tocadas.length} já estavam no registro.`)
  for (const a of tocadas.slice(0, 14))
    console.log(`  ${a.id.padEnd(10)} meio ${a.meio.toFixed(0).padStart(3)} → ganho ${a.ganho.toFixed(3)} desloc ${a.desloc.toFixed(1)}`)
  return tocadas
}
if (!filtro && !args.includes("--sem-equalizar")) await equalizar()

if (deformacoes.length) {
  deformacoes.sort((a, b) => b.deformacao - a.deformacao)
  const media = deformacoes.reduce((t, d) => t + d.deformacao, 0) / deformacoes.length
  const ordem = deformacoes.map((d) => d.antes).sort((a, b) => a - b)
  const mediana = ordem[Math.floor(ordem.length / 2)]
  console.log(`
proporção das gravuras: ${ordem[0].toFixed(3)} … ${mediana.toFixed(3)} … ${ordem[ordem.length - 1].toFixed(3)}`)
  console.log(`tela sugerida para deformação mínima: ${Math.round(470 * mediana)}×470`)
  console.log(`deformação para caber na tela ${TELA[0]}×${TELA[1]} — média ${(media * 100).toFixed(1)}%`)
  for (const d of deformacoes.slice(0, 6)) console.log(`  ${d.id.padEnd(10)} estica ${(d.deformacao * 100).toFixed(1)}%  corta ${((d.corte ?? 0) * 100).toFixed(1)}%  (proporção ${d.antes.toFixed(3)})`)
}

// Relatorio de enquadramento, so quando pedido: `--relatorio <caminho>`.
// Fica fora do repositorio de proposito, e um artefato de conferencia.
const relatorio = opt('relatorio', null)
if (relatorio && deformacoes.length) {
  const TAB = String.fromCharCode(9), NL = String.fromCharCode(10)
  const linhas = deformacoes
    .slice()
    .sort((a, b) => (b.topoFrac ?? 0) - (a.topoFrac ?? 0))
    .map((d) => [d.id, ((d.topoFrac ?? 0) * 100).toFixed(1), ((d.baseFrac ?? 0) * 100).toFixed(1),
      ((d.lateral?.[0] ?? 0) * 100).toFixed(1), ((d.lateral?.[1] ?? 0) * 100).toFixed(1),
      (d.deformacao * 100).toFixed(1), ((d.corte ?? 0) * 100).toFixed(1)].join(TAB))
  const cab = ['id','topo','base','esq','dir','estica','corta'].join(TAB)
  fs.writeFileSync(relatorio, cab + NL + linhas.join(NL) + NL)
  console.log('relatorio de enquadramento em ' + relatorio)
}
