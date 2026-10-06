/**
 * Extrator do Davison — roda sob demanda e grava data/fontes/davison/extrato.json.
 *
 * FONTE: Ronald C. Davison, Synastry: Understanding Human Relations Through
 * Astrology (1977). Edição não confirmável pelo arquivo.
 *
 * O QUE FAZ. Corta o texto do PDF nas 55 leituras de pares de planetas (o
 * capítulo "Interaction between Nativities, Part One") e nas 120 leituras de
 * "planeta na casa" (a parte dois, "House Interchanges"), e grava cada uma com
 * a página, o título e o texto, MAIS um hash do texto normalizado.
 *
 * ONDE FICA O RESULTADO. `data/fontes/` está no .gitignore: é material interno
 * de auditoria e NUNCA entra no repositório nem na tela. O que entra no
 * repositório é só a paráfrase estruturada (lib/astro/davison/*.json), que
 * guarda o hash daqui para provar de qual trecho ela saiu.
 *
 * O QUE NÃO FAZ. Não interpreta, não reescreve, não corrige OCR nem
 * hifenização: o trecho é o que o PDF tem. As páginas 140 a 210 do arquivo são
 * imagens sem texto (capítulos 9 e 10) e ficam de fora.
 *
 *   node scripts/extrair-davison.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"

const ARQ = "data/pdfs/candidatos/davison-synastry.pdf"
const SAIDA_DIR = path.join(process.cwd(), "data", "fontes", "davison")
const SAIDA = path.join(SAIDA_DIR, "extrato.json")

if (!fs.existsSync(ARQ)) {
  console.error(`[extrair-davison] ${ARQ} não encontrado`)
  process.exit(1)
}

const PLANETAS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]
const ID = Object.fromEntries(PLANETAS.map((p) => [p, p.toLowerCase()]))
const reP = PLANETAS.join("|")

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(ARQ)), useSystemFonts: true }).promise

// linhas por página, mantendo as quebras: é por elas que se acha um título
const linhas = []
for (let p = 1; p <= doc.numPages; p++) {
  const itens = (await (await doc.getPage(p)).getTextContent()).items
  let atual = ""
  for (const it of itens) {
    atual += it.str
    if (it.hasEOL) {
      linhas.push({ pagina: p, texto: atual })
      atual = ""
    }
  }
  if (atual.trim()) linhas.push({ pagina: p, texto: atual })
}

const norm = (s) => s.replace(/\s+/g, " ").trim()
const hash = (s) => createHash("sha256").update(norm(s)).digest("hex").slice(0, 16)

const reCap = /^\s*(CHAPTER \d+|Part (One|Two)|House Interchanges)\s*$/
const rePar = new RegExp(`^\\s*(${reP})\\s*/\\s*(${reP})\\s*$`)
const reCasa = new RegExp(`^\\s*(${reP}) in the (\\d{1,2})(?:st|nd|rd|th)?(?: House)?\\s*$`)
const reSecao = /^\s*(THE )?(SUN|MOON|MERCURY|VENUS|MARS|JUPITER|SATURN|URANUS|NEPTUNE|PLUTO) IN THE HOUSES\s*$/
const reTituloLongo = /^\s*Interaction [Bb]etween Nativities\s*$/

const marcas = []
linhas.forEach((l, i) => {
  if (l.pagina < 54 || l.pagina > 139) return
  let m
  if ((m = rePar.exec(l.texto))) marcas.push({ i, tipo: "par", titulo: norm(l.texto), a: ID[m[1]], b: ID[m[2]], pagina: l.pagina })
  else if ((m = reCasa.exec(l.texto))) marcas.push({ i, tipo: "overlay", titulo: norm(l.texto), planeta: ID[m[1]], casa: Number(m[2]), pagina: l.pagina })
  else if ((m = reSecao.exec(l.texto))) marcas.push({ i, tipo: "secao", titulo: norm(l.texto), planeta: m[2].toLowerCase(), pagina: l.pagina })
  else if (reCap.test(l.texto) || reTituloLongo.test(l.texto)) marcas.push({ i, tipo: "fim", titulo: norm(l.texto), pagina: l.pagina })
})

const pares = []
const overlays = []
const introsDePlaneta = {}

marcas.forEach((m, k) => {
  const fimIdx = k + 1 < marcas.length ? marcas[k + 1].i : linhas.length
  const trecho = linhas.slice(m.i + 1, fimIdx).filter((l) => l.pagina <= 139)
  const texto = norm(trecho.map((l) => l.texto).join(" "))
  const paginaFim = trecho.length ? trecho[trecho.length - 1].pagina : m.pagina
  if (m.tipo === "par") pares.push({ id: `${m.a}-${m.b}`, corpos: [m.a, m.b], secao: m.titulo, pdfPaginaInicio: m.pagina, pdfPaginaFim: paginaFim, texto, hash: hash(texto) })
  if (m.tipo === "overlay") overlays.push({ id: `${m.planeta}@casa${m.casa}`, planeta: m.planeta, casa: m.casa, secao: m.titulo, pdfPaginaInicio: m.pagina, pdfPaginaFim: paginaFim, texto, hash: hash(texto) })
  if (m.tipo === "secao") introsDePlaneta[m.planeta] = { secao: m.titulo, pdfPagina: m.pagina, texto }
})

// a introdução geral do capítulo de overlays e as definições das casas
const ini = linhas.findIndex((l) => l.pagina === 94 && /^\s*THE HOUSES\s*$/.test(l.texto))
const casasDef = []
if (ini >= 0) {
  const bloco = norm(linhas.slice(ini + 1).filter((l) => l.pagina >= 94 && l.pagina <= 96).map((l) => l.texto).join(" "))
  const re = /The ?(\d{1,2})(?:st|nd|rd|th) House represents/g
  const pos = [...bloco.matchAll(re)].map((m) => ({ casa: Number(m[1]), i: m.index }))
  pos.forEach((c, k) => {
    const fim = k + 1 < pos.length ? pos[k + 1].i : bloco.indexOf("The readings that follow")
    const texto = bloco.slice(c.i, fim > c.i ? fim : undefined).trim()
    casasDef.push({ casa: c.casa, texto, pdfPaginas: [94, 95], hash: hash(texto) })
  })
}

// ── semelhanças: elementos e modos (capítulo 5) e as passagens gerais ───────
// Os pares de elementos (p. 42 a 46) e de modos (p. 48 a 50) são cortados pelo título; as passagens
// gerais (mesmo signo, elemento do Sol, semelhança demais) por frases de começo e de fim.
const ELEMENTOS = ["Fire", "Earth", "Air", "Water"]
const MODOS = ["Cardinal", "Fixed", "Mutable"]
const reElem = new RegExp(`^\\s*(${ELEMENTOS.join("|")})\\s*/\\s*(${ELEMENTOS.join("|")})\\s*$`)
const reModo = new RegExp(`^\\s*(${MODOS.join("|")})\\s*/\\s*(${MODOS.join("|")})\\s*$`)
const reFimDeSecao = /^\s*(THE QUADRUPLICITIES|PLANETARY HOUSE GROUPS|The Cardinal Signs|The Fixed Signs|The Mutable Signs)\s*$/

const marcasSem = []
linhas.forEach((l, i) => {
  if (l.pagina < 42 || l.pagina > 50) return
  let m
  if ((m = reElem.exec(l.texto))) marcasSem.push({ i, dimensao: "elemento", partes: [m[1].toLowerCase(), m[2].toLowerCase()], titulo: norm(l.texto), pagina: l.pagina })
  else if ((m = reModo.exec(l.texto))) marcasSem.push({ i, dimensao: "modo", partes: [m[1].toLowerCase(), m[2].toLowerCase()], titulo: norm(l.texto), pagina: l.pagina })
  else if (reFimDeSecao.test(l.texto)) marcasSem.push({ i, dimensao: "fim", titulo: norm(l.texto), pagina: l.pagina })
})

const semelhancas = []
marcasSem.forEach((m, k) => {
  if (m.dimensao === "fim") return
  const fimIdx = k + 1 < marcasSem.length ? marcasSem[k + 1].i : linhas.length
  const trecho = linhas.slice(m.i + 1, fimIdx).filter((l) => l.pagina <= 50)
  const texto = norm(trecho.map((l) => l.texto).join(" "))
  const paginaFim = trecho.length ? trecho[trecho.length - 1].pagina : m.pagina
  // o id é canônico: os dois valores em ordem alfabética, porque o fato de sinastria não tem a ordem do livro
  const valor = [...m.partes].sort().join("|")
  semelhancas.push({ id: `${m.dimensao}:${valor}`, dimensao: m.dimensao, valor, secao: m.titulo, pdfPaginaInicio: m.pagina, pdfPaginaFim: paginaFim, texto, hash: hash(texto) })
})

/** O trecho entre duas frases, dentro de um intervalo de páginas, no texto normalizado. */
function entre(paginaMin, paginaMax, inicio, fim) {
  const sel = linhas.filter((l) => l.pagina >= paginaMin && l.pagina <= paginaMax)
  const todo = norm(sel.map((l) => l.texto).join(" "))
  const a = todo.indexOf(inicio)
  const b = todo.indexOf(fim, a)
  if (a < 0 || b < 0) return null
  const texto = todo.slice(a, b + fim.length)
  const pag = sel.find((l) => norm(l.texto).includes(inicio.slice(0, 25)))?.pagina ?? paginaMin
  return { texto, pagina: pag }
}
const geral = (id, dimensao, secao, partes) => {
  const trechos = partes.map((p) => entre(...p))
  if (trechos.some((t) => !t)) {
    console.error(`  ATENÇÃO: passagem geral ${id} não encontrada`)
    return
  }
  const texto = trechos.map((t) => t.texto).join(" ")
  semelhancas.push({ id, dimensao, valor: id, secao, pdfPaginaInicio: Math.min(...trechos.map((t) => t.pagina)), pdfPaginaFim: Math.max(...trechos.map((t) => t.pagina)), texto, hash: hash(texto) })
}
geral("signo_do_corpo", "signo_do_corpo", "Same-sign positions (p. 30)", [[30, 30, "Because of the slow motion of the outer planets", "compatible couples are compared."]])
geral("elemento_do_sol", "elemento_do_sol", "Sun sign and element (p. 39)", [[39, 39, "One of the most publicized areas of Sun sign astrology", "Sun signs should be compatible and there are discordant planetary clashes between the two charts, such disharmonies may greatly outweigh any concord suggested by the compatibility of the Sun signs."]])
geral("semelhanca_geral", "semelhanca_geral", "Too great a similarity (p. 30, 39)", [[30, 30, "Too great a similarity between horoscopes", "competition may replace co-operation."], [39, 39, "Too great an emphasis on the same element", "successfully adapt to the other."]])

const saida = {
  fonte: "Ronald C. Davison, Synastry: Understanding Human Relations Through Astrology (1977)",
  arquivo: ARQ,
  geradoEm: new Date().toISOString().slice(0, 10),
  aviso: "Material interno de auditoria. Não vai para o repositório nem para a tela.",
  pares,
  overlays,
  introsDePlaneta,
  casas: casasDef,
  semelhancas,
}

fs.mkdirSync(SAIDA_DIR, { recursive: true })
fs.writeFileSync(SAIDA, JSON.stringify(saida, null, 1))

const pal = (arr) => arr.reduce((n, x) => n + x.texto.split(/\s+/).length, 0)
console.log(`[extrair-davison] ${pares.length} pares (${pal(pares)} palavras), ${overlays.length} overlays (${pal(overlays)} palavras), ${casasDef.length} casas, ${Object.keys(introsDePlaneta).length} introduções, ${semelhancas.length} semelhanças`)
const esperados = (PLANETAS.length * (PLANETAS.length + 1)) / 2
if (pares.length !== esperados) console.error(`  ATENÇÃO: ${esperados} pares esperados, ${pares.length} achados`)
if (overlays.length !== 120) console.error(`  ATENÇÃO: 120 overlays esperados, ${overlays.length} achados`)
if (semelhancas.length !== 19) console.error(`  ATENÇÃO: 19 semelhanças esperadas (10 elementos, 6 modos, 3 gerais), ${semelhancas.length} achadas`)
if (casasDef.length !== 12) console.error(`  ATENÇÃO: 12 casas esperadas, ${casasDef.length} achadas`)
