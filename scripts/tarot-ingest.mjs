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
/** cheio: recorta a figura como no modo transparente, mas guarda o campo da
 *  própria carta em vez de vazá-lo. O céu estrelado e a trama da gravura são
 *  parte do desenho: vazados, o traço fino some e a carta fica apagada. */
const cheio = args.includes("--cheio")
/** sólido: grava a carta opaca, sem transparência (padrão) */
const solido = !args.includes("--recortado") && !cheio
/** tela única de saída no modo recortado: todas as cartas do mesmo tamanho */
const TELA = opt("tela", "600,992").split(",").map(Number)
/** a lâmina é a mesma para as 78: número no alto e nome embaixo em todas */
const TELA_MAIOR = opt("tela-maior", "600,992").split(",").map(Number)
/** deformação máxima permitida; o que faltar para encher vira corte centrado */
const ESTICA = parseFloat(opt("estica", "0.07"))
/** se o corte passar disso, estica mais em vez de cortar desenho */
const CORTE_MAX = parseFloat(opt("corte-max", "0.12"))
const ESTICA_MAX = parseFloat(opt("estica-max", "0.16"))
/** realce do traço depois da reamostragem; 0 desliga */
const nitidez = parseFloat(opt("nitidez", "0.8"))
const deformacoes = []
const cercaduras = []
/**
 * Aparo lateral extra, simétrico, em pixels da folha. Só para carta em que a
 * recentragem deixou um pedaço de numeral impresso colado numa borda sem par
 * na outra: o Cinco de Paus ficava com meio "V" à esquerda e nada à direita, e
 * o pedaço lia como moldura e puxava o olho para a esquerda. Corta igual dos
 * dois lados, então o centro não muda.
 */
const APARO_LATERAL = { "wands-05": 14 }
const centragens = []
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
      // A escala de luz sai do MIOLO da janela, nunca da faixa de fora. Ali
      // mora a cercadura impressa, que é o ponto mais claro da carta: usá-la
      // como topo estica a escala e deixa a gravura inteira em alfa parcial.
      // Era o que apagava os Maiores, gravados em traço fino, que nunca
      // chegam ao branco da moldura.
      const miolo = []
      const mx0 = Math.round(region.width * 0.09), mx1 = region.width - mx0
      const my0 = Math.round(region.height * 0.09), my1 = region.height - my0
      for (let y = my0; y < my1; y++) for (let x = mx0; x < mx1; x++) miolo.push(lum[y * region.width + x])
      const sorted = Float32Array.from(miolo.length > 1000 ? miolo : lum).sort()
      const bg = sorted[Math.floor(sorted.length * 0.5)]
      const topo = sorted[Math.floor(sorted.length * 0.995)]
      const span = Math.max(topo - bg, 0.05)
      let br = 0, bgc = 0, bb = 0, bn = 0
      for (let i = 0; i < n; i++) if (Math.abs(lum[i] - bg) < 0.03) { br += rgb[i * 3]; bgc += rgb[i * 3 + 1]; bb += rgb[i * 3 + 2]; bn++ }
      br /= bn || 1; bgc /= bn || 1; bb /= bn || 1
      const out = Buffer.alloc(n * 4)
      // A moldura da carta é uma linha clara e FRIA rente à borda. O traço da
      // gravura é quente (creme). Só na margem externa da janela, o que for
      // claro e frio vira fundo: assim a moldura some sem tocar no desenho.
      const margem = Math.round(region.width * 0.03)
      // No modo cheio a carta sai como foi impressa, com cor e tom originais.
      // Mesmo assim a máscara vazada é calculada inteira, com todas as limpezas:
      // é ela que sabe onde termina o desenho e onde começa o resto de moldura,
      // e é por ela que o recorte da carta cheia é enquadrado e centrado.
      const opaco = cheio ? Buffer.alloc(n * 4) : null
      if (cheio) for (let i = 0; i < n; i++) {
        opaco[i * 4] = rgb[i * 3]; opaco[i * 4 + 1] = rgb[i * 3 + 1]; opaco[i * 4 + 2] = rgb[i * 3 + 2]; opaco[i * 4 + 3] = 255
      }
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
      // --- ponto de branco do alfa ------------------------------------------
      // Na lâmina, alfa parcial lê como carta apagada. Os Maiores são
      // gravados em traço fino e mal chegavam a 190 de alfa, enquanto os
      // Menores, de traço cheio, passavam de 240: lado a lado, os Maiores
      // pareciam desbotados. Aqui o topo do traço de CADA carta vai a opaco,
      // e o pé da escala sobe um pouco, o que ainda tira véu. Não mexe em cor
      // nem em desenho, só na presença.
      {
        const PISO = parseInt(opt("piso-alfa", "28"), 10)
        const alvoP90 = parseInt(opt("alvo-alfa", "238"), 10)
        const amostra = []
        for (let i = 0; i < n; i++) { const a = out[i * 4 + 3]; if (a > 12) amostra.push(a) }
        if (amostra.length > 500) {
          amostra.sort((a, b) => a - b)
          // O ponto de branco sai do percentil 90 do traço, não do topo: o
          // topo já satura em todas as cartas, e o que separa um Maior de um
          // Menor é o corpo da escala, não a ponta. Onde o corpo está baixo,
          // o traço fino sobe; onde já está alto, quase nada muda.
          const branco = Math.max(PISO + 40, amostra[Math.floor(amostra.length * 0.90)])
          if (process.env.VERBRANCO) console.log("   branco", id, branco)
          if (branco < alvoP90) {
            const escala = 255 / (branco - PISO)
            for (let i = 0; i < n; i++) {
              const a = out[i * 4 + 3]
              out[i * 4 + 3] = a <= PISO ? 0 : Math.min(255, Math.round((a - PISO) * escala))
            }
          }
        }
      }

      // quanto saiu de cada lado; no modo cheio é por aqui que a faixa é
      // recortada, já que não há transparência em volta para aparar
      const cortes = { esq: 0, dir: 0, topo: 0, base: 0 }
      // --- resto da cercadura impressa ------------------------------------
      // Mesmo com o filete localizado na folha, sobra rente a borda uma tira
      // do que ficou de fora: o filete de baixo, a craquele e um fio do campo
      // azul. Ela aparece como LINHA CHEIA atravessando a janela inteira, o
      // que o desenho nunca faz. Acha a linha mais externa de cada lado e
      // apaga dela para fora; o que estiver mais para dentro (a cercadura
      // ornamental dos menores, por exemplo) fica.
      {
        const W2 = region.width, H2 = region.height
        const cobertura = (lado, d, piso = 60) => {
          let c = 0, t = 0
          if (lado === "esq" || lado === "dir") {
            const x = lado === "esq" ? d : W2 - 1 - d
            for (let y = 0; y < H2; y++) { t++; if (out[(y * W2 + x) * 4 + 3] >= piso) c++ }
          } else {
            const y = lado === "topo" ? d : H2 - 1 - d
            for (let x = 0; x < W2; x++) { t++; if (out[(y * W2 + x) * 4 + 3] >= piso) c++ }
          }
          return c / t
        }
        for (const lado of ["esq", "dir", "topo", "base"]) {
          const n = lado === "esq" || lado === "dir" ? W2 : H2
          const busca = Math.round(n * 0.12)
          const teto = Math.round(n * 0.06)
          const fino = Math.max(2, Math.round(n * 0.008))
          const v = []
          for (let d = 0; d <= busca + 6; d++) v.push(cobertura(lado, d))
          let fim = -1
          for (let d = 0; d <= busca; d++) {
            if (v[d] < 0.72) continue
            let e = d
            while (e + 1 <= busca + 4 && v[e + 1] >= 0.55) e++
            const pico = Math.max(...v.slice(d, e + 1))
            // linha impressa: ou atravessa quase inteira, ou e fina e isolada,
            // com o desenho sumindo logo depois dela
            const cheia = pico >= 0.88
            const isolada = e - d + 1 <= fino && Math.min(v[e + 1] ?? 1, v[e + 2] ?? 1) <= 0.20
            // guarda a MAIS FUNDA que ainda esta na faixa de fora: uma
            // fiapo de um pixel rente a borda escondia a cercadura de verdade
            // logo atras dela
            if ((cheia || isolada) && e <= teto) fim = e
          }
          // Segunda passada, no alfa fraco. A cercadura deixa um halo de alfa
          // baixo rente a borda que o limiar de 60 nao enxerga e que a lamina,
          // com o brilho que subimos, mostra como um fio de moldura. O halo
          // morre depressa para dentro; o desenho, nao.
          {
            const gatilho = Math.max(3, Math.round(n * 0.015))
            const tetoFraco = Math.round(n * 0.04)
            const f = []
            for (let d = 0; d <= tetoFraco + 2; d++) f.push(cobertura(lado, d, 16))
            let inicio = -1
            // 0,70 e nao 0,80: em varias cartas a tira saiu picotada na
            // impressao e nunca fecha a borda inteira, mas ainda le como
            // moldura na tela
            for (let d = 0; d <= gatilho; d++) if (f[d] >= 0.70) { inicio = d; break }
            if (inicio >= 0) {
              let e = inicio
              while (e + 1 <= tetoFraco && f[e + 1] >= 0.45) e++
              if (e > fim) fim = e
            }
          }

          if (fim >= 0) {
            const apaga = (i4) => { out[i4 + 3] = 0 }
            for (let d = 0; d <= fim; d++) {
              if (lado === "esq" || lado === "dir") {
                const x = lado === "esq" ? d : W2 - 1 - d
                for (let y = 0; y < H2; y++) apaga((y * W2 + x) * 4)
              } else {
                const y = lado === "topo" ? d : H2 - 1 - d
                for (let x = 0; x < W2; x++) apaga((y * W2 + x) * 4)
              }
            }
            cortes[lado] = fim + 1
            cercaduras.push(`${id} ${lado} ${fim + 1}px`)
          }
          // Resta a neblina: alfa fraco espalhado na faixa de fora, herdado do
          // papel em volta do filete. Some com ela onde o alfa e baixo demais
          // para ser traco; o desenho que encosta na borda tem alfa cheio no
          // miolo e so perde a franja, que a suavizacao adiante refaz.
          const faixa = Math.round(n * 0.025)
          const dInicio = Math.max(0, fim + 1)
          for (let d = dInicio; d < Math.min(n, dInicio + faixa); d++) {
            if (lado === "esq" || lado === "dir") {
              const x = lado === "esq" ? d : W2 - 1 - d
              for (let y = 0; y < H2; y++) { const i3 = (y * W2 + x) * 4 + 3; if (out[i3] < 70) out[i3] = 0 }
            } else {
              const y = lado === "topo" ? d : H2 - 1 - d
              for (let x = 0; x < W2; x++) { const i3 = (y * W2 + x) * 4 + 3; if (out[i3] < 70) out[i3] = 0 }
            }
          }
        }
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
      // O aparo da máscara encosta no traço: tira a moldura, o cisco e o campo
      // vazio em volta, e com isso centra o desenho. A carta cheia usa
      // exatamente essa caixa, recortada da cor original. Antes o recorte cheio
      // seguia a janela da folha, que é assimétrica, e trazia junto a fita de
      // moldura da direita: a moldura voltava e o Ás de Ouros saía de lado.
      const aparoMascara = await sharp(arteLimpa).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true })
      let caixa = {
        left: -(aparoMascara.info.trimOffsetLeft ?? 0), top: -(aparoMascara.info.trimOffsetTop ?? 0),
        width: aparoMascara.info.width, height: aparoMascara.info.height,
      }
      if (cheio) {
        // A suavização do alfa deixa na borda da máscara um fio de um pixel
        // que o aparo conserva. Na carta vazada ele é quase transparente e não
        // aparece; na cheia, aquela coluna é o próprio filete impresso, claro,
        // e virava uma linha colada na borda. Três pixels para dentro resolve.
        const RECUO = 3
        caixa = { left: caixa.left + RECUO, top: caixa.top + RECUO, width: caixa.width - 2 * RECUO, height: caixa.height - 2 * RECUO }

        // Pip é simétrico por desenho, mas a folha nem sempre corta a carta
        // no meio: o Ás de Ouros vinha 5% para a esquerda. Na lâmina vazada o
        // campo era a própria lâmina e o desvio sumia; com o campo da carta,
        // aparece. Acha o eixo onde o espelho casa melhor e tira a sobra do lado
        // mais largo, sem cortar mais que 14% e sem mexer em figura e Maiores.
        // (10% deixava de fora o Cinco de Paus, que vinha 5,5% fora do eixo.)
        const ehPip = !ehMaior && Number(id.slice(-2)) <= 10
        if (ehPip) {
          const W2 = region.width, w = caixa.width, h = caixa.height
          const passoY = Math.max(1, Math.floor(h / 330)), passoX = Math.max(1, Math.floor(w / 220))
          let melhor = Infinity, eixo = Math.floor(w / 2)
          for (let c = Math.round(w * 0.4); c <= Math.round(w * 0.6); c++) {
            const alcance = Math.min(c, w - 1 - c)
            let soma = 0, k = 0
            for (let y = Math.round(h * 0.1); y < Math.round(h * 0.9); y += passoY) {
              const base = (caixa.top + y) * W2 + caixa.left
              for (let d = 1; d < alcance; d += passoX) { soma += Math.abs(lum[base + c - d] - lum[base + c + d]); k++ }
            }
            const erro = soma / Math.max(1, k)
            if (erro < melhor) { melhor = erro; eixo = c }
          }
          const sobra = Math.abs(w - 1 - 2 * eixo)
          const limite = Math.round(w * 0.14)
          if (sobra >= 3 && sobra <= limite) {
            if (2 * eixo < w - 1) caixa = { ...caixa, width: w - sobra }
            else caixa = { ...caixa, left: caixa.left + sobra, width: w - sobra }
            centragens.push(`${id} ${sobra}px ${2 * eixo < w - 1 ? "da direita" : "da esquerda"}`)
          }
        }
      }
      if (cheio && APARO_LATERAL[id]) {
        const a = APARO_LATERAL[id]
        caixa = { ...caixa, left: caixa.left + a, width: caixa.width - 2 * a }
      }
      const aparada = cheio
        ? await sharp(opaco, { raw: { width: region.width, height: region.height, channels: 4 } })
            .extract(caixa)
            .png().toBuffer({ resolveWithObject: true })
        : aparoMascara
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
      deformacoes.push({ id, deformacao, antes, corte: corteResultante, topoFrac: corte[0], baseFrac: corte[1], lateral, AW, AH })
      const ancora = ehMaior || ehFigura ? "top" : "centre"
      // Uma reamostragem só. Encadear "fill" e depois "cover" interpola duas
      // vezes a mesma gravura, e cada passagem tira nitidez: a conta do
      // esticão e a do enquadramento entram juntas num único resize, e o que
      // sobrar vira recorte, que não interpola nada.
      const escala = Math.max(tela[0] / largAjust, tela[1] / AH)
      const LW = Math.max(tela[0], Math.round(largAjust * escala))
      const LH = Math.max(tela[1], Math.round(AH * escala))
      const esq = Math.round((LW - tela[0]) / 2)
      const alto = ancora === "top" ? 0 : Math.round((LH - tela[1]) / 2)
      let pipe = sharp(aparada.data)
        .resize({ width: LW, height: LH, fit: "fill", kernel: "lanczos3" })
        .extract({ left: esq, top: alto, width: tela[0], height: tela[1] })
      // A gravura é traço fino: depois de qualquer reamostragem ela perde
      // acutância. A máscara devolve a borda do traço sem inventar textura —
      // é a mesma ideia do realce de escaneamento, com mão leve.
      if (nitidez > 0) pipe = pipe.sharpen({ sigma: nitidez, m1: 0.5, m2: 2.2 })
      await pipe
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
/**
 * Equalização do baralho cheio, ancorada no material da carta: o azul do
 * campo e o creme do traço. Para cada carta mede-se a cor dessas duas
 * âncoras; o alvo é a mediana do baralho. O que leva uma à outra é uma reta
 * por canal — ganho e deslocamento — e é justamente ela que acerta de uma vez
 * brilho (deslocamento), contraste (distância entre as âncoras), temperatura
 * (canais separados) e força do azul e do creme.
 *
 * Não é correção por carta: é o mesmo critério para as 78, e quem já está no
 * registro quase não se mexe. A força fica abaixo de 1 de propósito, para
 * deixar viva a diferença natural entre um arcano denso e um pip vazio.
 */
async function equalizarCheio() {
  const forca = parseFloat(opt("forca", "0.85"))
  /** o quanto a densidade de cada carta é puxada para a do baralho */
  const forcaDens = parseFloat(opt("forca-densidade", "0.6"))
  /** tinta quente comum, em passos de canal sobre as âncoras do baralho */
  const quente = parseFloat(opt("quente", "1"))
  /** quanto o campo azul deixa a lâmina passar, no mais escuro da carta */
  const vazado = parseFloat(opt("vazado", "0.38"))
  /** translucidez leve também no creme: a lâmina tinge o alto e tira o neon */
  const vazadoTraco = parseFloat(opt("vazado-traco", "0.08"))
  /** percentil que define o campo: baixo isola o azul limpo, alto mistura a
   *  trama da gravura, o que fazia o arcano denso parecer de fundo mais claro */
  const pCampo = parseFloat(opt("percentil-campo", "0.15"))
  // Acabamento de cor. Tira croma sem tirar luz: a luminância de cada pixel
  // fica onde está, então contraste e leitura não mudam. O corte é mais forte
  // nas duas pontas, onde a cor grita — o azul saturado do campo e o amarelo
  // do creme — e leve no meio-tom, onde vive a trama da gravura.
  const satAzul = parseFloat(opt("sat-azul", "0.72"))
  const satMeio = parseFloat(opt("sat-meio", "0.92"))
  const satCreme = parseFloat(opt("sat-creme", "0.70"))
  /** ombro do alto: acima dele a luz sobe mais devagar, e o creme para de estourar */
  const ombro = parseFloat(opt("ombro", "0.88"))
  const ombroForca = parseFloat(opt("ombro-forca", "0.55"))
  const arquivos = fs.readdirSync(OUT).filter((f) => f.endsWith(".png"))
  if (arquivos.length < 10) return
  const medir = async (f) => {
    const { data, info } = await sharp(path.join(OUT, f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const n = info.width * info.height
    const lum = new Float32Array(n)
    for (let i = 0; i < n; i++) lum[i] = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]
    const ord = Float32Array.from(lum).sort()
    const q = (p) => ord[Math.floor(n * p)]
    // campo: o terço mais escuro, que é o azul; traço: o creme, sem o estouro
    const escuro = q(pCampo), claro = q(0.92), teto = q(0.995)
    const campo = [[], [], []], traco = [[], [], []]
    for (let i = 0; i < n; i++) {
      if (lum[i] <= escuro) for (let c = 0; c < 3; c++) campo[c].push(data[i * 4 + c])
      else if (lum[i] >= claro && lum[i] <= teto) for (let c = 0; c < 3; c++) traco[c].push(data[i * 4 + c])
    }
    const med = (v) => { v.sort((a, b) => a - b); return v[v.length >> 1] ?? 0 }
    const cm = campo.map(med), tm = traco.map(med)
    // densidade: onde cai o pixel do meio entre o campo e o traço. É o que
    // separa um Maior, de trama fina que enche o campo de meio-tom, de um
    // pip de traço cheio sobre azul limpo — e era o que continuava
    // destoando depois de acertar as duas pontas.
    const lumDe = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    const lc = lumDe(cm), lt = lumDe(tm)
    const x50 = (q(0.5) - lc) / Math.max(1, lt - lc)
    return { f, campo: cm, traco: tm, x50 }
  }
  const medidas = []
  for (const f of arquivos) medidas.push(await medir(f))
  const mediana = (v) => { const o = v.slice().sort((a, b) => a - b); return o[o.length >> 1] }
  // Alvo do baralho, com uma pitada de ouro: o mesmo desvio quente para as
  // 78 não descaracteriza nenhuma, e é o que dá liga ao conjunto.
  // O ouro vem quase todo de tirar azul, não de somar vermelho: o creme já
  // está perto de 250 no vermelho e somar ali estoura o alto da gravura.
  const QUENTE_TRACO = [2, 0, -6], QUENTE_CAMPO = [3, 1, -7]
  const trava = (v) => Math.max(0, Math.min(255, Math.round(v)))
  const alvoCampo = [0, 1, 2].map((c) => trava(mediana(medidas.map((m) => m.campo[c])) + quente * QUENTE_CAMPO[c]))
  const alvoTraco = [0, 1, 2].map((c) => trava(mediana(medidas.map((m) => m.traco[c])) + quente * QUENTE_TRACO[c]))
  const alvoX50 = mediana(medidas.map((m) => m.x50))
  const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  console.log(`
âncoras do baralho: campo ${alvoCampo.join(",")} · traço ${alvoTraco.join(",")}`)
  const tocadas = []
  for (const m of medidas) {
    const ganho = [1, 1, 1], desloc = [0, 0, 0]
    for (let c = 0; c < 3; c++) {
      const vao = m.traco[c] - m.campo[c]
      if (Math.abs(vao) < 20) continue
      const a = (alvoTraco[c] - alvoCampo[c]) / vao
      const b = alvoCampo[c] - a * m.campo[c]
      ganho[c] = Math.min(1.45, Math.max(0.75, 1 - forca + forca * a))
      desloc[c] = Math.min(60, Math.max(-60, forca * b))
    }
    // gama que leva a densidade da carta para perto da do baralho sem tocar
    // nas duas âncoras: só o miolo da escala se move
    let gama = 1
    if (m.x50 > 0.01 && m.x50 < 0.99 && alvoX50 > 0.01) {
      const g = Math.log(alvoX50) / Math.log(m.x50)
      gama = Math.min(1.35, Math.max(0.8, 1 - forcaDens + forcaDens * g))
    }
    const { data, info } = await sharp(path.join(OUT, m.f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const n = info.width * info.height
    const vao = [0, 1, 2].map((c) => Math.max(1, alvoTraco[c] - alvoCampo[c]))
    const PESO = [0.2126, 0.7152, 0.0722]
    const rgb = [0, 0, 0]
    for (let i = 0; i < n; i++) {
      let soma = 0
      for (let c = 0; c < 3; c++) {
        const v = data[i * 4 + c] * ganho[c] + desloc[c]
        const x = (v - alvoCampo[c]) / vao[c]
        // a gama só vale dentro das âncoras; fora delas a reta segue, para
        // não inventar nem cortar o que passa do creme ou fica abaixo do azul
        const y = x <= 0 || x >= 1 ? x : Math.pow(x, gama)
        rgb[c] = alvoCampo[c] + y * vao[c]
        soma += PESO[c] * Math.max(0, Math.min(1.2, y))
      }
      // ombro: a luz acima do ombro é comprimida na direção do campo, sem
      // girar a cor; o creme continua claro, só não bate mais no teto
      if (soma > ombro) {
        const alvo = ombro + (soma - ombro) * ombroForca
        const f = alvo / soma
        for (let c = 0; c < 3; c++) rgb[c] = alvoCampo[c] + (rgb[c] - alvoCampo[c]) * f
      }
      // croma por posição na escala: azul no fundo, meio-tom, creme no alto
      const pos = Math.max(0, Math.min(1, soma))
      const sat = pos < 0.5 ? satAzul + (satMeio - satAzul) * (pos / 0.5) : satMeio + (satCreme - satMeio) * ((pos - 0.5) / 0.5)
      const L = PESO[0] * rgb[0] + PESO[1] * rgb[1] + PESO[2] * rgb[2]
      for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.max(0, Math.min(255, Math.round(L + sat * (rgb[c] - L))))
      soma = Math.min(1, soma)
      // o campo deixa a lâmina passar um fio; o traço continua opaco
      // A translucidez é o que a versão vazada tinha de bom: a lâmina atravessa
      // a carta e quebra o azul e o amarelo. Forte no campo, leve no creme,
      // e o traço nunca fica ralo a ponto de perder corpo.
      if (vazado > 0 || vazadoTraco > 0) {
        const opac = 1 - vazado * Math.pow(1 - soma, 1.2) - vazadoTraco * soma
        data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(255 * opac)))
      }
    }
    const buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png({ compressionLevel: 9, palette: true, colours: 128, quality: 100, effort: 10 }).toBuffer()
    fs.writeFileSync(path.join(OUT, m.f), buf)
    tocadas.push({ id: m.f.replace(/\.png$/, ""), ganho, desloc, gama, dCampo: lum(m.campo) - lum(alvoCampo), dTraco: lum(m.traco) - lum(alvoTraco) })
  }
  tocadas.sort((a, b) => Math.abs(b.dTraco) - Math.abs(a.dTraco))
  console.log(`${tocadas.length} de ${medidas.length} cartas ajustadas`)
  for (const t of tocadas.slice(0, 10))
    console.log(`  ${t.id.padEnd(10)} campo ${t.dCampo > 0 ? "+" : ""}${t.dCampo.toFixed(0).padStart(3)} traço ${t.dTraco > 0 ? "+" : ""}${t.dTraco.toFixed(0).padStart(4)}  ganho ${t.ganho.map((g) => g.toFixed(2)).join("/")}  gama ${t.gama.toFixed(2)}`)
  return tocadas
}

if (!filtro && !args.includes("--sem-equalizar")) await (cheio ? equalizarCheio() : equalizar())

{
  const esc = deformacoes.map((d) => ({ id: d.id, f: Math.max(TELA[0] / d.AW, TELA[1] / d.AH), AW: d.AW, AH: d.AH }))
  esc.sort((a, b) => b.f - a.f)
  console.log(`
escala ate a tela: pior ${esc[0].f.toFixed(2)}x  mediana ${esc[Math.floor(esc.length / 2)].f.toFixed(2)}x  melhor ${esc[esc.length - 1].f.toFixed(2)}x`)
  for (const e of esc.slice(0, 8)) console.log(`  ${e.id.padEnd(10)} ${e.AW}x${e.AH} -> ${e.f.toFixed(2)}x`)
}

if (centragens.length) console.log(`
pip recentrado no eixo de simetria: ${centragens.join(", ")}`)
if (cercaduras.length) console.log(`
cercadura aparada em ${cercaduras.length} bordas: ${cercaduras.join(", ")}`)

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
