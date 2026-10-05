/**
 * Integridade da referência do Lenormand: as fichas individuais, as combinações
 * dirigidas e o método Portrait.
 *
 * O que este verificador existe para impedir:
 *
 *  1. QUE A DIREÇÃO SE PERCA. A fonte afirma que a ordem é o sentido ("Fox +
 *     Fish ... whereas Fish + Fox is saying you received the wrong change") e,
 *     dos pares que ela glosa nas duas direções, nenhum repete o texto. Se
 *     alguém "consertar" a falta de A→B usando B→A, a leitura passa a dizer o
 *     contrário do que a fonte diz. A parte D prova que o inverso NÃO é usado.
 *  2. QUE A MESA VIRE OUTRA MESA. As 28 relações saem das sequências que
 *     Matthews prescreve em p. 194 e dos pares com a carta central de p. 193.
 *     Knighting e Mirroring existem no livro, mas ele os chama de opcionais e
 *     eles ficam fora: a parte B rejeita qualquer relação que não seja das 28.
 *  3. QUE ENTRE MATERIAL DE OUTRO MÉTODO. As entradas "X on House of Y" são as
 *     casas do Grand Tableau, outra mesa; os trios são outro nível de leitura.
 *     Nenhum dos dois pode chegar à síntese.
 *  4. QUE A ARTE E O CATÁLOGO SE DESENCONTREM. Nuvens e Foice têm sentido que
 *     depende do lado para onde a arte aponta. A parte F REMEDE os PNGs e exige
 *     que a medição continue dando Nuvens L e Foice R.
 *  5. QUE O BLOCO RELACIONAL ESTOURE o corte de 320 do prompt e perca relação.
 *
 * As mutações da parte G quebram de propósito as travas principais e exigem que
 * elas caiam: um teste que não falha quando devia não está testando nada.
 *
 * Zero IA, zero rede.
 */
import fs from "node:fs"
import path from "node:path"
import { drawAll, LENORMAND_DECK, LENORMAND_POSITIONS_COUNT } from "../lib/oracles/draw"
import { renderDraw } from "../lib/oracles/localize"
import { LENORMAND_FICHAS, LENORMAND_PDF_SHA256 } from "../lib/oracles/lenormand-fichas"
import { LENORMAND_COMBINACOES, LENORMAND_COMBINACOES_PDF_SHA256, type CombinacaoLenormand } from "../lib/oracles/lenormand-combinacoes"
import {
  referenciaDoLenormand, RELACOES_DA_MESA, PARES_DIRIGIDOS, FICHAS_COBERTAS,
  combinacaoDirigida, divergenciasLenormand, valeParaNossaArte,
  DIRECAO_DA_ARTE, ALIASES_DO_LIVRO, METODO_LENORMAND,
} from "../lib/oracles/lenormand-referencia"
import { LENORMAND_IDS } from "../lib/oracles/lenormand-assets"
import { LOCALES, type Locale } from "../lib/i18n/config"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

/** Os 40 seeds congelados do baseline, os mesmos das outras frentes. */
const SEEDS = [
  "fase10:65", "fase10:77", "fase10:81", "fase10:160", "fase10:195", "fase10:216",
  "fase10:244", "fase10:306", "fase10:317", "fase10:328", "fase10:1", "fase10:2", "fase10:5",
  "fase10:9", "fase10:10", "fase10:11", "fase10:12", "fase10:14", "fase10:23", "fase10:31",
  "fase10:3", "fase10:72", "fase10:202", "fase10:221", "fase10:256", "fase10:389",
  "fase10:481", "fase10:594", "fase10:678", "fase10:685", "fase10:0", "fase10:13", "fase10:15",
  "fase10:20", "fase10:21", "fase10:25", "fase10:26", "fase10:37", "fase10:50", "fase10:52",
]

/**
 * AS 28 RELAÇÕES, escritas à mão a partir do livro e não lidas do módulo.
 *
 * É de propósito: se a lista do módulo mudar sozinha, esta aqui não muda junto e
 * a parte B cai. Cada linha tem a página que a sustenta.
 *
 *   p194  colunas 1-4-7 / 2-5-8 / 3-6-9, linhas 1-2-3 / 4-5-6 / 7-8-9,
 *         cantos 1-9-3-7, diamante 2-4-6-8, flechas 1-8-3 e 7-2-9
 *   p193  a carta central lida com cada uma das oito ao redor
 */
const RELACOES_ESPERADAS = [
  "1>4", "4>7", "2>5", "5>8", "3>6", "6>9",
  "1>2", "2>3", "4>5", "5>6", "7>8", "8>9",
  "1>9", "9>3", "3>7",
  "2>4", "4>6", "6>8",
  "1>8", "8>3", "7>2", "2>9",
  "5>1", "5>2", "5>3", "5>4", "5>7", "5>9",
]

/** O que a geometria de Knighting e Mirroring daria — e que NÃO pode estar lá. */
const FORA_DO_MVP = [
  "1>6", "1>3", "1>7", "2>8", "3>4", "3>8", "3>9", "4>9", "6>7", "7>9", "7>6", "9>2",
]

const chaveRel = (r: { de: number; para: number }) => `${r.de}>${r.para}`
const cartasDo = (seed: string) =>
  drawAll(seed).lenormand.items.map((x) => (x.sym as { kind: "lenormand"; card: number }).card)
const divergencias = divergenciasLenormand()

// ── os detectores ────────────────────────────────────────────────────────────
//
// São funções puras de propósito: as partes D e E as aplicam ao que a referência
// produz de verdade, e a parte G as aplica a entradas DELIBERADAMENTE quebradas
// para provar que elas acusam. Uma trava que nunca viu um caso ruim não é trava.

/**
 * O catálogo reindexado AQUI, do módulo gerado, sem passar por
 * `combinacaoDirigida`.
 *
 * É deliberado. Se o detector consultasse a mesma função que a referência usa,
 * um fallback simétrico enfiado nela ficaria invisível: a trava perguntaria ao
 * próprio defeito se há defeito. Esta checagem de sabotagem foi o que mostrou
 * isso — com o detector antigo, pôr `?? POR_PAR.get(\`${b}>${a}\`)` em
 * `combinacaoDirigida` passava pela parte D sem um arranhão.
 */
const CATALOGO_CRU = new Map<string, CombinacaoLenormand>()
for (const c of LENORMAND_COMBINACOES) {
  if (c.cartas.length !== 2) continue
  if (!c.qualificadores.every((q, i) => !q || DIRECAO_DA_ARTE[c.cartas[i]] === q)) continue
  const chave = `${c.cartas[0]}>${c.cartas[1]}`
  if (!CATALOGO_CRU.has(chave)) CATALOGO_CRU.set(chave, c)
}

/** O que, num bloco relacional, não pode estar lá. */
function auditaBloco(excerpt: string, cartas: number[]) {
  let entregues = 0, invertidas = 0, foraDaMesa = 0, deTrio = 0
  for (const m of excerpt.matchAll(/(\d)→(\d) /g)) {
    entregues += 1
    const de = Number(m[1]), para = Number(m[2])
    if (!RELACOES_ESPERADAS.includes(`${de}>${para}`)) foraDaMesa += 1
    const a = cartas[de - 1], b = cartas[para - 1]
    const direto = CATALOGO_CRU.get(`${a}>${b}`)
    if (!direto) invertidas += 1
    else if (direto.cartas.length !== 2) deTrio += 1
  }
  return { entregues, invertidas, foraDaMesa, deTrio }
}

/**
 * A referência e o catálogo cru têm de concordar carta a carta. É a trava que
 * pega um fallback simétrico mesmo quando ele é consistente consigo mesmo.
 */
function parteDirecaoDoServico() {
  let divergiu = 0, inventou = 0
  for (let a = 0; a < 36; a++) {
    for (let b = 0; b < 36; b++) {
      if (a === b) continue
      const servido = combinacaoDirigida(a, b)
      const cru = CATALOGO_CRU.get(`${a}>${b}`)
      if (servido && !cru) inventou += 1
      else if (servido && cru && servido.glosa !== cru.glosa) divergiu += 1
      else if (!servido && cru) divergiu += 1
    }
  }
  confere("D · a referência serve exatamente o catálogo, sem inventar par", inventou === 0, `${inventou} pares servidos que a fonte não glosa nessa direção`)
  confere("D · nenhuma glosa servida difere da do catálogo", divergiu === 0, `${divergiu}`)
}

/** Quantas vezes um texto nomeia carta que não está na mesa. */
function cartasForaDaMesa(texto: string, sorteadas: Set<number>): number {
  let n = 0
  for (let i = 0; i < 36; i++) {
    if (sorteadas.has(i)) continue
    for (const nome of new Set([LENORMAND_DECK[i].en, LENORMAND_FICHAS[i].nomeFonte])) {
      if (new RegExp(`(?<![A-Za-z])${nome}(?![a-z])`).test(texto)) n += 1
    }
  }
  return n
}

/** O bloco relacional de uma mesa, ou "" quando a fonte não glosa nada dela. */
function blocoDe(seed: string): string {
  const e = referenciaDoLenormand(drawAll(seed).lenormand.items, "pt").find((x) => /relações da mesa/.test(x.source))
  return e ? e.excerpt : ""
}

// ── A · as fichas individuais, que são a base ────────────────────────────────

function parteA() {
  confere("A · 36 fichas individuais", FICHAS_COBERTAS === 36, `${FICHAS_COBERTAS}`)
  confere("A · índices 0–35 completos e sem repetição",
    new Set(LENORMAND_FICHAS.map((f) => f.indice)).size === 36 &&
    LENORMAND_FICHAS.every((f) => f.indice >= 0 && f.indice <= 35))
  confere("A · as duas fontes vieram do MESMO PDF",
    LENORMAND_PDF_SHA256 === LENORMAND_COMBINACOES_PDF_SHA256,
    `${LENORMAND_PDF_SHA256.slice(0, 12)} vs ${LENORMAND_COMBINACOES_PDF_SHA256.slice(0, 12)}`)
  confere("A · o baralho do motor tem 36 cartas e 9 posições",
    LENORMAND_DECK.length === 36 && LENORMAND_POSITIONS_COUNT === 9)
  confere("A · ids canônicos: 36, únicos, alinhados ao baralho",
    LENORMAND_IDS.length === 36 && new Set(LENORMAND_IDS).size === 36)

  // os aliases do livro, declarados e só eles
  const divergentes = LENORMAND_FICHAS.filter((f) => f.nomeFonte !== LENORMAND_DECK[f.indice].en).map((f) => f.indice)
  confere("A · aliases declarados cobrem exatamente as divergências de nome",
    divergentes.sort((a, b) => a - b).join() === Object.keys(ALIASES_DO_LIVRO).map(Number).sort((a, b) => a - b).join(),
    `divergem ${divergentes.join(", ")}; declarados ${Object.keys(ALIASES_DO_LIVRO).join(", ")}`)
  confere("A · nenhuma divergência entre ficha, catálogo e motor",
    divergencias.length === 0, divergencias.slice(0, 3).join(" | "))

  for (const f of LENORMAND_FICHAS) {
    const quem = `${f.indice + 1} ${f.nomeFonte}`
    confere(`A · ${quem}: General com corpo`, f.geral.length >= 60, `${f.geral.length} chars`)
    confere(`A · ${quem}: sem NUL`, !JSON.stringify(f).includes("\\u0000"))
    confere(`A · ${quem}: página no léxico`, f.pagina >= 61 && f.pagina <= 120, `p${f.pagina}`)
    // o General é o significado ISOLADO: nada de "+" nem de outro sistema
    confere(`A · ${quem}: General sem combinação`, !/\+/.test(f.geral))
    confere(`A · ${quem}: General sem outro sistema`, !/\b(Tarot|Tarocchi|I Ching|Runes?|Kipper|Marseille)\b/.test(f.geral))
  }
}

// ── B · a mesa é a do livro, e só ela ────────────────────────────────────────

function parteB() {
  const achadas = RELACOES_DA_MESA.map(chaveRel)
  confere("B · 28 relações posicionais", RELACOES_DA_MESA.length === 28, `${RELACOES_DA_MESA.length}`)
  confere("B · as 28 são exatamente as do livro",
    [...achadas].sort().join() === [...RELACOES_ESPERADAS].sort().join(),
    `sobra ${achadas.filter((x) => !RELACOES_ESPERADAS.includes(x)).join(",") || "nada"}; falta ${RELACOES_ESPERADAS.filter((x) => !achadas.includes(x)).join(",") || "nada"}`)
  confere("B · nenhuma relação repetida", new Set(achadas).size === achadas.length)
  confere("B · toda posição entre 1 e 9",
    RELACOES_DA_MESA.every((r) => r.de >= 1 && r.de <= 9 && r.para >= 1 && r.para <= 9 && r.de !== r.para))
  confere("B · nenhuma relação de Knighting ou Mirroring (opcionais, fora do MVP)",
    FORA_DO_MVP.every((x) => !achadas.includes(x)),
    FORA_DO_MVP.filter((x) => achadas.includes(x)).join(","))
  confere("B · toda relação tem a página que a sustenta",
    RELACOES_DA_MESA.every((r) => /p19[34]/.test(r.origem)),
    RELACOES_DA_MESA.filter((r) => !/p19[34]/.test(r.origem)).map(chaveRel).join(","))
  // a carta central aparece como origem em 8 relações (as de p193, menos as que
  // já vêm das sequências de p194) e como destino nas sequências
  const doCentro = RELACOES_DA_MESA.filter((r) => r.de === 5).length
  confere("B · a carta central é origem em 8 relações", doCentro === 8, `${doCentro}`)
}

// ── C · o catálogo de combinações ────────────────────────────────────────────

function parteC() {
  const pares = LENORMAND_COMBINACOES.filter((c) => c.cartas.length === 2)
  const trios = LENORMAND_COMBINACOES.filter((c) => c.cartas.length > 2)
  confere("C · catálogo com as 224 entradas extraídas", LENORMAND_COMBINACOES.length === 224, `${LENORMAND_COMBINACOES.length}`)
  confere("C · 182 pares e 42 entradas de três ou mais", pares.length === 182 && trios.length === 42,
    `${pares.length} pares, ${trios.length} trios+`)
  confere("C · pares dirigidos servíveis para a nossa arte", PARES_DIRIGIDOS === 172, `${PARES_DIRIGIDOS}`)

  for (const c of LENORMAND_COMBINACOES) {
    const quem = `p${c.pagina} ${c.cartas.join("+")}`
    confere(`C · ${quem}: índices válidos`, c.cartas.every((x) => x >= 0 && x <= 35))
    confere(`C · ${quem}: pelo menos duas cartas`, c.cartas.length >= 2)
    confere(`C · ${quem}: um qualificador por carta`, c.qualificadores.length === c.cartas.length)
    confere(`C · ${quem}: glosa sem rótulo nem casa do Grand Tableau`,
      !/House of|Combinations|General\s*:/i.test(c.glosa), c.glosa.slice(0, 40))
    confere(`C · ${quem}: glosa sem lixo de OCR`, !/(?: [a-zA-Z]){4,}(?![a-zA-Z])/.test(c.glosa), c.glosa.slice(0, 40))
    confere(`C · ${quem}: glosa com corpo`, c.glosa.length >= 8 && c.glosa.length <= 200, `${c.glosa.length} chars`)
    confere(`C · ${quem}: sem NUL`, !JSON.stringify(c).includes("\\u0000"))
    confere(`C · ${quem}: página no léxico`, c.pagina >= 61 && c.pagina <= 120, `p${c.pagina}`)
    c.qualificadores.forEach((q, i) => {
      confere(`C · ${quem}: qualificador só em Nuvens ou Foice`,
        !q || DIRECAO_DA_ARTE[c.cartas[i]] !== undefined, `"${q}" na carta ${c.cartas[i]}`)
    })
  }

  // a decisão dos 18 casos L/R, explícita: ficam os que batem com a nossa arte
  const comQual = LENORMAND_COMBINACOES.filter((c) => c.qualificadores.some((q) => q))
  const aceitos = comQual.filter(valeParaNossaArte)
  confere("C · 25 entradas com qualificador L/R no catálogo", comQual.length === 25, `${comQual.length}`)
  confere("C · a decisão de L/R é por carta, não por convenção",
    aceitos.every((c) => c.qualificadores.every((q, i) => !q || DIRECAO_DA_ARTE[c.cartas[i]] === q)))
  confere("C · nenhuma entrada de arte contrária é servida",
    LENORMAND_COMBINACOES.filter((c) => !valeParaNossaArte(c))
      .every((c) => c.cartas.length !== 2 || combinacaoDirigida(c.cartas[0], c.cartas[1]) === undefined ||
        valeParaNossaArte(combinacaoDirigida(c.cartas[0], c.cartas[1])!)))
}

// ── D · a direção, que é o ponto ─────────────────────────────────────────────

function parteD() {
  // a fonte prova que a ordem muda o sentido: onde glosa as duas direções, o
  // texto difere. Se algum dia passar a coincidir, a premissa mudou.
  let nasDuas = 0, iguais = 0
  const vistos = new Set<string>()
  for (const c of LENORMAND_COMBINACOES) {
    if (c.cartas.length !== 2) continue
    const [a, b] = c.cartas
    const inv = LENORMAND_COMBINACOES.find((x) => x.cartas.length === 2 && x.cartas[0] === b && x.cartas[1] === a)
    if (!inv || vistos.has(`${b}>${a}`)) continue
    vistos.add(`${a}>${b}`)
    nasDuas += 1
    const n = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, "").replace(/ +/g, " ").trim()
    if (n(c.glosa) === n(inv.glosa)) iguais += 1
  }
  confere("D · há pares glosados nas duas direções", nasDuas >= 20, `${nasDuas}`)
  confere("D · nenhum deles repete o texto (a ordem é o sentido)", iguais === 0, `${iguais} iguais`)

  // e, nas 40 mesas, nenhuma relação entregue usa o inverso
  let entregues = 0, invertidas = 0, foraDaMesa = 0, deTrio = 0
  for (const seed of SEEDS) {
    const r = auditaBloco(blocoDe(seed), cartasDo(seed))
    entregues += r.entregues; invertidas += r.invertidas
    foraDaMesa += r.foraDaMesa; deTrio += r.deTrio
  }
  confere("D · toda relação entregue existe na direção da mesa", invertidas === 0, `${invertidas} de ${entregues}`)
  confere("D · nenhuma relação entregue está fora das 28", foraDaMesa === 0, `${foraDaMesa}`)
  confere("D · nenhuma entrada de três ou mais cartas chega ao MVP", deTrio === 0, `${deTrio}`)
  confere("D · as 40 mesas produziram relação", entregues > 0, `${entregues}`)
  parteDirecaoDoServico()
}

// ── E · o que chega à síntese ────────────────────────────────────────────────

function parteE() {
  let cobertas = 0, entradas = 0, maior = 0, naoSorteada = 0, excedeTeto = 0
  const TETO = 320
  for (const seed of SEEDS) {
    const d = drawAll(seed)
    const cartas = cartasDo(seed)
    const sorteadas = new Set(cartas)
    const ev = referenciaDoLenormand(d.lenormand.items, "pt")
    entradas += ev.length
    if (ev.length > 10) excedeTeto += 1
    const fichas = ev.filter((e) => !/relações da mesa/.test(e.source))
    cobertas += new Set(fichas.map((e) => e.itemIndex)).size
    for (const e of ev) {
      maior = Math.max(maior, e.excerpt.replace(/\s+/g, " ").length)
      naoSorteada += cartasForaDaMesa(e.excerpt, sorteadas)
    }
  }
  // NENHUMA GLOSA SAI PARTIDA NO MEIO. O bloco tem orçamento, e algumas glosas
  // são podadas — mas o corte tem de cair no fim de uma locução da fonte, nunca
  // dentro dela: "A book in public domain or out of" não é o que a fonte diz.
  let glosas = 0, inteirasOuPodadasBem = 0
  for (const seed of SEEDS) {
    const cartas = cartasDo(seed)
    const bloco = blocoDe(seed)
    if (!bloco) continue
    const pedacos = bloco.split(" · ")
    const achadas = RELACOES_DA_MESA.filter((r) => CATALOGO_CRU.get(`${cartas[r.de - 1]}>${cartas[r.para - 1]}`))
    achadas.forEach((r, i) => {
      const c = CATALOGO_CRU.get(`${cartas[r.de - 1]}>${cartas[r.para - 1]}`)!
      const inteira = c.glosa.replace(/\s+/g, " ")
      const entregue = (pedacos[i] ?? "").replace(/^\d+→\d+ /, "")
      glosas += 1
      if (entregue === inteira) { inteirasOuPodadasBem += 1; return }
      let acc = ""
      for (const l of inteira.split(/;\s*/)) {
        acc = acc ? `${acc}; ${l}` : l
        if (acc === entregue) { inteirasOuPodadasBem += 1; return }
      }
    })
  }
  confere("E · toda glosa sai inteira ou cortada em fim de locução", glosas === inteirasOuPodadasBem,
    `${glosas - inteirasOuPodadasBem} de ${glosas} partidas no meio`)
  confere("E · 360/360 cartas sorteadas com ficha própria", cobertas === SEEDS.length * 9, `${cobertas}/${SEEDS.length * 9}`)
  confere("E · nenhuma leitura passa de 10 entradas (o teto do prompt)", excedeTeto === 0, `${excedeTeto} leituras`)
  confere("E · nenhuma carta fora da mesa aparece na referência", naoSorteada === 0, `${naoSorteada} ocorrências`)
  confere("E · nenhum trecho passa de 320 (o bloco não é truncado pelo prompt)", maior <= TETO, `maior ${maior}`)
  confere("E · as entradas cabem no teto", entradas / SEEDS.length <= 10, `${(entradas / SEEDS.length).toFixed(1)} por leitura`)

  // o método diz a estrutura da fonte, nos três idiomas, e não promete previsão
  for (const locale of LOCALES as readonly Locale[]) {
    const m = METODO_LENORMAND[locale]
    confere(`E · ${locale}: o método nomeia a carta 5 e a carta 1`, /\b5\b/.test(m) && /\b1\b/.test(m))
    confere(`E · ${locale}: o método diz as três colunas`, /1,4,7/.test(m) && /2,5,8/.test(m) && /3,6,9/.test(m))
    confere(`E · ${locale}: o método ressalva que coluna não é previsão`,
      /não (é|a)|not a prediction|no una predicción/i.test(m))
    confere(`E · ${locale}: o método ressalva que glosa não é importância`,
      /mais documentada|better documented|mejor documentada/i.test(m))
    // os rótulos de posição não voltam a inventar geometria de tela
    const r = renderDraw(drawAll(SEEDS[0]).lenormand, locale)
    const rotulos = r.items.map((i) => i.position ?? "")
    confere(`E · ${locale}: os rótulos de posição são os da fonte`,
      rotulos.length === 9 && !/acima|abaixo|above|below|arriba|abajo|canto|corner|esquina/i.test(rotulos.join(" ")),
      rotulos.join(" | "))
    confere(`E · ${locale}: três colunas e dois destaques, não nove rótulos`,
      new Set(rotulos).size === 5, `${new Set(rotulos).size} rótulos distintos`)
  }
}

// ── F · a arte, remedida ─────────────────────────────────────────────────────

/**
 * Mede a tinta de um PNG: quanto há de cada lado e onde está o centro horizontal
 * nas bandas de cima e de baixo. É a prova de que Nuvens L e Foice R descrevem a
 * NOSSA arte, e não uma convenção herdada.
 */
async function mede(arquivo: string) {
  const sharp = (await import("sharp")).default
  const { data, info } = await sharp(arquivo).raw().ensureAlpha().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  let total = 0, esq = 0
  const cima = { m: 0, x: 0 }, baixo = { m: 0, x: 0 }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const a = data[i + 3] / 255
      if (a < 0.05) continue
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
      const tinta = a * (1 - lum)
      if (tinta <= 0.002) continue
      total += tinta
      if (x < W / 2) esq += tinta
      if (y < H * 0.35) { cima.m += tinta; cima.x += tinta * x }
      if (y > H * 0.65) { baixo.m += tinta; baixo.x += tinta * x }
    }
  }
  return { esquerda: esq / total, cima: cima.x / cima.m / W, baixo: baixo.x / baixo.m / W }
}

async function parteF() {
  const dir = path.join(process.cwd(), "public", "lenormand")
  confere("F · as duas cartas com direção de arte estão declaradas",
    Object.keys(DIRECAO_DA_ARTE).map(Number).sort((a, b) => a - b).join() === "5,9",
    Object.keys(DIRECAO_DA_ARTE).join(","))

  // Nuvens: p71, "an L or R ... to indicate that the dark clouds are on the left
  // or right side". A nossa arte tem a massa escura à esquerda.
  const nuvens = path.join(dir, "clouds.png")
  if (!fs.existsSync(nuvens)) confere("F · clouds.png existe", false)
  else {
    const m = await mede(nuvens)
    confere("F · Nuvens: a massa escura está à ESQUERDA (logo, L)",
      DIRECAO_DA_ARTE[5] === "L" && m.esquerda >= 0.58,
      `${(m.esquerda * 100).toFixed(1)}% da tinta à esquerda`)
  }

  // Foice: p159, "Scythe L for when it faces left and Scythe R for the blade
  // facing right". Na nossa arte a lâmina (banda de cima) sai à direita do cabo.
  const foice = path.join(dir, "scythe.png")
  if (!fs.existsSync(foice)) confere("F · scythe.png existe", false)
  else {
    const m = await mede(foice)
    confere("F · Foice: a lâmina sai para a DIREITA do cabo (logo, R)",
      DIRECAO_DA_ARTE[9] === "R" && m.cima - m.baixo >= 0.12,
      `centro da tinta: ${m.cima.toFixed(3)} em cima, ${m.baixo.toFixed(3)} embaixo`)
  }
}

// ── G · mutações: as travas principais têm de cair ───────────────────────────

function parteG() {
  // Cada mutação constrói uma saída ERRADA e exige que o detector a acuse. O
  // `confere` é o oposto do das partes anteriores: aqui passar é detectar.

  // 1. simetrização: usar B→A onde A→B não existe
  let mesaComInverso: { seed: string; cartas: number[]; bloco: string } | null = null
  for (const seed of SEEDS) {
    const cartas = cartasDo(seed)
    const r = RELACOES_DA_MESA.find((rel) => {
      const a = cartas[rel.de - 1], b = cartas[rel.para - 1]
      return !combinacaoDirigida(a, b) && combinacaoDirigida(b, a)
    })
    if (r) { mesaComInverso = { seed, cartas, bloco: `${r.de}→${r.para} glosa do par invertido` }; break }
  }
  confere("G · mutação 1: existe mesa em que a tentação de simetrizar aparece", mesaComInverso !== null)
  if (mesaComInverso) {
    const r = auditaBloco(mesaComInverso.bloco, mesaComInverso.cartas)
    confere("G · mutação 1: a trava de direção ACUSA o par invertido", r.invertidas === 1,
      `acusou ${r.invertidas} de 1 (seed ${mesaComInverso.seed})`)
  }

  // 2. relação de Knighting (1→6) enfiada no bloco
  {
    const cartas = cartasDo(SEEDS[0])
    const r = auditaBloco("1→6 salto de cavalo · 1→4 relação legítima ", cartas)
    confere("G · mutação 2: a trava das 28 ACUSA uma relação de Knighting", r.foraDaMesa === 1, `acusou ${r.foraDaMesa} de 1`)
  }

  // 3. carta que não está na mesa, enfiada numa ficha
  {
    const cartas = cartasDo(SEEDS[0])
    const sorteadas = new Set(cartas)
    const forasteira = LENORMAND_DECK.findIndex((_, i) => !sorteadas.has(i))
    const texto = `Rider: texto qualquer que menciona ${LENORMAND_DECK[forasteira].en} sem motivo.`
    confere("G · mutação 3: a trava de contaminação ACUSA a carta forasteira",
      cartasForaDaMesa(texto, sorteadas) >= 1, `${LENORMAND_DECK[forasteira].en}`)
    confere("G · mutação 3: e não acusa as cartas da própria mesa",
      cartasForaDaMesa(`texto com ${LENORMAND_DECK[cartas[0]].en} e ${LENORMAND_DECK[cartas[1]].en}`, sorteadas) === 0)
  }

  // 4. entrada de três cartas servida como par
  {
    const trio = LENORMAND_COMBINACOES.find((c) => c.cartas.length > 2)!
    confere("G · mutação 4: o catálogo guarda trios", trio !== undefined)
    confere("G · mutação 4: nenhum trio é servível como par dirigido",
      LENORMAND_COMBINACOES.filter((c) => c.cartas.length > 2)
        .every((c) => combinacaoDirigida(c.cartas[0], c.cartas[1])?.cartas.length !== c.cartas.length ||
          combinacaoDirigida(c.cartas[0], c.cartas[1])!.cartas.length === 2))
  }

  // 5. bloco montado sem orçamento: tem de estourar os 320
  {
    let maiorCru = 0, maiorReal = 0
    for (const seed of SEEDS) {
      const cartas = cartasDo(seed)
      const cru = RELACOES_DA_MESA
        .map((r) => {
          const c = combinacaoDirigida(cartas[r.de - 1], cartas[r.para - 1])
          return c ? `${r.de}→${r.para} ${c.glosa}` : null
        })
        .filter(Boolean).join(" · ")
      maiorCru = Math.max(maiorCru, cru.length)
      maiorReal = Math.max(maiorReal, blocoDe(seed).length)
    }
    confere("G · mutação 5: sem orçamento o bloco ESTOURARIA 320", maiorCru > 320, `maior cru ${maiorCru}`)
    confere("G · mutação 5: com orçamento ele cabe", maiorReal <= 320, `maior real ${maiorReal}`)
  }

  // 6. inverter a direção da arte muda quais entradas são servíveis
  {
    const comQual = LENORMAND_COMBINACOES.filter((c) => c.qualificadores.some((q) => q))
    const aceitas = comQual.filter(valeParaNossaArte).length
    // a mesma regra com a arte trocada (Nuvens R, Foice L)
    const trocada: Record<number, "L" | "R"> = { 5: "R", 9: "L" }
    const aceitasTrocadas = comQual.filter((c) =>
      c.qualificadores.every((q, i) => !q || trocada[c.cartas[i]] === q)).length
    confere("G · mutação 6: trocar o lado da arte MUDA o conjunto servido",
      aceitas !== aceitasTrocadas, `${aceitas} com a nossa arte, ${aceitasTrocadas} com a trocada`)
    confere("G · mutação 6: as duas partições somam as 25 entradas com L/R",
      aceitas + aceitasTrocadas === comQual.length, `${aceitas} + ${aceitasTrocadas} de ${comQual.length}`)
  }

  // 7. ficha com combinação vazada no General
  {
    const f = { ...LENORMAND_FICHAS[0], geral: "Rider + Fish: dinheiro a caminho." }
    confere("G · mutação 7: a trava da ficha ACUSA combinação no General", /\+/.test(f.geral))
    confere("G · mutação 7: e nenhuma ficha real a dispara", LENORMAND_FICHAS.every((x) => !/\+/.test(x.geral)))
  }
}

async function main() {
  parteA()
  parteB()
  parteC()
  parteD()
  parteE()
  await parteF()
  parteG()
  if (falhas.length) {
    console.error(`\nA referência do Lenormand falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas) console.error(`  ${f}`)
    console.error("")
    process.exit(1)
  }
  const pares = LENORMAND_COMBINACOES.filter((c: CombinacaoLenormand) => c.cartas.length === 2).length
  console.log(`referência do Lenormand: ${conferidos} conferências, 36 fichas, ${pares} combinações (${PARES_DIRIGIDOS} pares dirigidos serviveis), 28 relações da mesa, Nuvens L e Foice R`)
}

main()
