/**
 * Extrai o índice estruturado do Tarô a partir do capítulo 12 de
 * "O Tarô de Marselha Revelado" (Yoav Ben-Dov), uma vez, para um JSON
 * conferível. Não roda em produção e não toca em `pdfs.index.json`.
 *
 * POR QUE NÃO RAG DIRETO NESTE LIVRO. Os títulos do livro são compostos em
 * versalete, e o pdfjs devolve as letras seguintes como NUL (U+0000):
 *
 *     "O\0\0\0\0 Á\0 \0\0 O\0\0\0\0:"   é   "OUROS ÁS DE OUROS:"
 *     "C\0\0\0\0 1 – O M\0\0\0:"        é   "CARTA 1 – O MAGO:"
 *
 * São 7.685 NULs, 1,41 % do texto, concentrados exatamente nos NOMES DAS
 * CARTAS. Como o seletor de evidência casa pelo nome da carta como palavra
 * inteira, um índice bruto deste PDF teria trechos que nunca seriam
 * encontrados. Nenhuma das sete fontes já indexadas tem esse problema.
 *
 * A SAÍDA É POSICIONAL, e não por nome. Os nomes não são recuperáveis dos
 * NULs, mas a ORDEM do capítulo é fixa: 21 cartas numeradas, O Louco, e
 * depois cada naipe na ordem Ás, 2 a 10, Valete, Cavaleiro, Rainha, Rei. O
 * nome vem do nosso próprio baralho, o que garante que a chave do índice seja
 * exatamente a chave que o motor sorteia.
 *
 * `MENSAGEM:` É DESCARTADA de propósito: são imperativos ("Ouse e vença",
 * "Deixe ir o que já acabou") e a síntese do produto proíbe prescrever.
 *
 * Uso:  node scripts/extrair-bendov.mjs <pdf> <saida.json>
 */
import fs from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { createHash } from "node:crypto"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"

const PDF = process.argv[2] ?? "data/pdfs/candidatos/o-taro-de-marselha-revelado-um-guia-completo-para-o-seu-simbolismo-significados-e-metodos.pdf"
const SAIDA = process.argv[3] ?? "lib/oracles/bendov-cartas.ts"

const MAIORES = ["O Mago","A Papisa","A Imperatriz","O Imperador","O Papa","O Amante","O Carro","A Justiça","O Eremita","A Roda da Fortuna","A Força","O Enforcado","A Morte","A Temperança","O Diabo","A Torre","A Estrela","A Lua","O Sol","O Julgamento","O Mundo"]
const NAIPES = [["Ouros", "O"], ["Copas", "C"], ["Paus", "P"], ["Espadas", "E"]]
const RANKS = ["Ás", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez", "Valete", "Cavaleiro", "Rainha", "Rei"]

const limpa = (s) => s.replace(/\u0000/g, "").replace(/\s+/g, " ").trim()

// ── lê o PDF por página ────────────────────────────────────────────────────
const buf = await fs.readFile(PDF)
const doc = await pdfjsLib.getDocument({
  data: new Uint8Array(buf),
  standardFontDataUrl: pathToFileURL(path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts") + path.sep).href,
  cMapUrl: pathToFileURL(path.join(process.cwd(), "node_modules", "pdfjs-dist", "cmaps") + path.sep).href,
  cMapPacked: true,
  verbosity: 0,
}).promise

const paginas = []
for (let p = 1; p <= doc.numPages; p++) {
  const c = await (await doc.getPage(p)).getTextContent()
  paginas.push(c.items.map((i) => i.str).join(" ").replace(/[ \t]+/g, " ").trim())
}

// ── isola o capítulo 12 e guarda de que página veio cada trecho ────────────
let inicio = paginas.findIndex((s, i) => i > 400 && /I\u0000{12,}R\u0000{6}/.test(s))
if (inicio < 0) inicio = 431
let fim = paginas.findIndex((s, i) => i > inicio && /Compre agora e leia/.test(s))
if (fim < 0) fim = paginas.length

/** posição absoluta → número da página */
const mapaPagina = []
let acc = ""
for (let p = inicio; p < fim; p++) {
  mapaPagina.push({ de: acc.length, pagina: p + 1 })
  acc += paginas[p] + " "
}
const paginaDe = (pos) => {
  let r = mapaPagina[0]?.pagina ?? 0
  for (const m of mapaPagina) if (m.de <= pos) r = m.pagina; else break
  return r
}

// ── acha o início de cada ficha, na ordem do capítulo ──────────────────────
// maiores: "C␀␀␀␀ N –"   |   Louco: "O L␀:"   |   menores: "<rank> ␀␀ <S>␀+:"
const marcas = []
// a carta 13 do Marselha NÃO TEM NOME, e por isso o marcador dela é
// "C␀␀␀␀ 13:" com dois-pontos, enquanto as outras são "C␀␀␀␀ N – NOME:"
for (const m of acc.matchAll(/C\u0000{4} (\d{1,2})\s*[–:-]/g)) marcas.push({ pos: m.index, tipo: "maior", n: Number(m[1]) })
for (const m of acc.matchAll(/O L\u0000{2,6}:/g)) marcas.push({ pos: m.index, tipo: "louco" })
// O NOME NÃO É RECUPERÁVEL DOS NULs, MAS O COMPRIMENTO É. Cada palavra em
// versalete vira a inicial mais um NUL por letra restante, então a dupla
// (inicial, nº de NULs) identifica a palavra sem ambiguidade:
//
//   ÁS = Á+1   VALETE = V+5   CAVALEIRO = C+8   RAINHA = R+5   REI = R+2
//   OUROS = O+4   COPAS = C+4   PAUS = P+3   ESPADAS = E+6
//
// Isso desambigua o que a posição não desambiguava: "C" é Copas com 4 NULs e
// Cavaleiro com 8; "R" é Rainha com 5 e Rei com 2.
//
// A PRIMEIRA VERSÃO ATRIBUÍA POR ORDEM, e isso falhou em silêncio: um
// marcador não casado deslocou toda a sequência de Espadas, e o que o livro
// chama "5 de Espadas" saiu gravado como "Quatro de Espadas". Nome errado é
// pior que carta faltando, porque passa despercebido.
const RANK_POR_MARCA = { "Á1": "Ás", V5: "Valete", C8: "Cavaleiro", R5: "Rainha", R2: "Rei" }
const NAIPE_POR_MARCA = { O4: "Ouros", C4: "Copas", P3: "Paus", E6: "Espadas" }

// `\s*:` e não `:` — a ficha do Dois de Espadas tem um espaço antes dos
// dois-pontos ("2 ␀␀ E␀␀␀␀␀␀ :"), e só ela
for (const m of acc.matchAll(/(?:^|[\s\u0000])(\d{1,2}|[ÁVCR]\u0000{1,8})\s*\u0000{2}\s*([OCPE])(\u0000{3,6})\s*:/g)) {
  const [, rankCru, naipeLetra, naipeNuls] = m
  const naipe = NAIPE_POR_MARCA[`${naipeLetra}${naipeNuls.length}`]
  if (!naipe) continue
  let rank
  if (/^\d/.test(rankCru)) {
    rank = ["", "", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez"][Number(rankCru)]
  } else {
    rank = RANK_POR_MARCA[`${rankCru[0]}${rankCru.length - 1}`]
  }
  if (!rank) continue
  marcas.push({ pos: m.index, tipo: "menor", nome: `${rank} de ${naipe}` })
}
marcas.sort((a, b) => a.pos - b.pos)

// ── monta as fichas ────────────────────────────────────────────────────────
const cartas = []
let iMenor = 0
for (let i = 0; i < marcas.length; i++) {
  const ini = marcas[i].pos
  const bloco = acc.slice(ini, marcas[i + 1]?.pos ?? acc.length)

  // dentro do bloco: título, base, (MENSAGEM), INVERTIDA.
  // tudo em deslocamentos do MESMO texto, para não haver aritmética de offset
  const fimTitulo = bloco.indexOf(":") + 1
  // A BUSCA COMEÇA DEPOIS DO TÍTULO, e isso não é zelo: "INVERTIDA" tem 9
  // letras, logo I mais 8 NUL — exatamente a mesma assinatura de "IMPERADOR",
  // e "IMPERATRIZ" fica a um NUL de distância. Procurar no bloco inteiro fazia
  // o TÍTULO dessas duas cartas ser lido como o marcador de reversão, e a
  // ficha inteira, MENSAGEM incluída, ia parar no campo `invertida`.
  //
  // "MENSAGEM" tem 8 letras: M mais 7 NUL. São 22 no capítulo, uma por Arcano
  // Maior, e o trecho entre ela e "INVERTIDA" é descartado inteiro.
  const desloc = (i) => (i < 0 ? -1 : i + fimTitulo)
  const corpo = bloco.slice(fimTitulo)
  const iInv = desloc(corpo.search(/I(?:\u0000 ?){8}:/))
  const iMsg = desloc(corpo.search(/M(?:\u0000 ?){7}:/))
  const corteBase = [iMsg, iInv].filter((x) => x > fimTitulo).sort((a, b) => a - b)[0] ?? bloco.length
  const base = limpa(bloco.slice(fimTitulo, corteBase))
  const invertida = iInv >= 0 ? limpa(bloco.slice(iInv).replace(/^I(?:\u0000 ?){8}:/, "")) : ""

  let nome = null
  if (marcas[i].tipo === "maior") nome = MAIORES[marcas[i].n - 1]
  else if (marcas[i].tipo === "louco") nome = "O Louco"
  else nome = marcas[i].nome
  if (!nome || !base) continue
  cartas.push({
    carta: nome,
    base,
    invertida,
    invertida_similar: /^similar/i.test(invertida),
    fonte: "Ben-Dov, O Tarô de Marselha Revelado",
    pagina: paginaDe(ini),
  })
}

const saida = {
  fonte: "Yoav Ben-Dov, O Tarô de Marselha Revelado (Pensamento-Cultrix, 2020), capítulo 12",
  extraidoEm: new Date().toISOString().slice(0, 10),
  pdfSha256: createHash("sha256").update(buf).digest("hex"),
  cartas,
}
await fs.mkdir(path.dirname(SAIDA), { recursive: true })
// módulo TS, e não JSON: o Node puro exige atributo de importação para JSON e
// o runner dos verificadores roda em ESM puro. O arquivo continua sendo dado
// legível e diffável, gerado por este script e nunca editado à mão.
const cabecalho = `/**
 * GERADO POR scripts/extrair-bendov.mjs — NÃO EDITAR À MÃO.
 *
 * Índice estruturado do Tarô, carta a carta, extraído do capítulo 12 de
 * ${saida.fonte}.
 * Extraído em ${saida.extraidoEm}. sha256 do PDF: ${saida.pdfSha256}
 *
 * O campo invertida_similar marca as cartas em que a fonte diz só "Similar.",
 * ou seja, aquelas em que a inversão não muda o sentido. As seções
 * "MENSAGEM:" do livro são descartadas na extração: são imperativas e a
 * síntese do produto proíbe prescrever.
 */
export type FichaDeCarta = {
  carta: string
  base: string
  invertida: string
  invertida_similar: boolean
  fonte: string
  pagina: number
}

export const BENDOV_FONTE = ${JSON.stringify(saida.fonte)}
export const BENDOV_PDF_SHA256 = ${JSON.stringify(saida.pdfSha256)}

export const BENDOV_CARTAS: FichaDeCarta[] = `
await fs.writeFile(SAIDA, `${cabecalho}${JSON.stringify(cartas, null, 1)}\n`)

// ── a extração FALHA ALTO em vez de entregar nome errado ──────────────────
const mensagens = (acc.match(/M(?:\u0000 ?){7}:/g) || []).length
const vazou = cartas.filter((c) => /\bM:/.test(c.base) || /\bM:/.test(c.invertida))
if (mensagens !== 22 || vazou.length) {
  console.error(`\nMENSAGEM MAL RECORTADA — nada foi gravado.`)
  console.error(`  marcadores encontrados: ${mensagens} (esperado 22, um por Arcano Maior)`)
  if (vazou.length) console.error(`  vazou em: ${vazou.map((c) => c.carta).join(", ")}`)
  process.exit(1)
}

const esperadas = [...MAIORES, "O Louco", ...NAIPES.flatMap(([n]) => RANKS.map((r) => `${r} de ${n}`))]
const obtidas = new Set(cartas.map((c) => c.carta))
const faltando = esperadas.filter((n) => !obtidas.has(n))
const repetidas = cartas.map((c) => c.carta).filter((n, i, a) => a.indexOf(n) !== i)
if (faltando.length || repetidas.length || cartas.length !== 78) {
  console.error(`\nEXTRAÇÃO INCOMPLETA — nada foi gravado.`)
  if (faltando.length) console.error(`  faltando (${faltando.length}): ${faltando.join(", ")}`)
  if (repetidas.length) console.error(`  repetidas: ${[...new Set(repetidas)].join(", ")}`)
  console.error(`  total: ${cartas.length}, esperado 78`)
  process.exit(1)
}

const comInv = cartas.filter((c) => c.invertida).length
const similares = cartas.filter((c) => c.invertida_similar).length
console.log(`cartas extraídas: ${cartas.length}/78`)
console.log(`  com reversão   : ${comInv}  (${similares} marcadas "Similar.")`)
console.log(`  NUL na saída   : ${JSON.stringify(saida).includes("\u0000") ? "SIM (erro)" : "nenhum"}`)
console.log(`gravado em ${SAIDA}`)
