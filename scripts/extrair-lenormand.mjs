/**
 * Extrator das fichas do Lenormand — roda UMA VEZ e grava lib/oracles/lenormand-fichas.ts.
 *
 * FONTE: Caitlín Matthews, The Complete Lenormand Oracle Handbook (Destiny Books),
 * capítulo 2, "Lenormand Lexicon": uma entrada por carta, nas 36, com a mesma
 * estrutura (General, Effect, Nouns, Adjectives, Verbs, Adverbs, People, Timing,
 * Lenormand Universe e, no fim, Combinations).
 *
 * POR QUE EXISTE. A tiragem do dia precisa de um texto INDIVIDUAL para o verso
 * da carta de Lenormand, e a auditoria inicial concluiu, errado, que não havia
 * ficha por carta: o ÍNDICE lexical (`pdfs.index.json`) é de fato fatiado em
 * trechos soltos e majoritariamente relacionais, mas o LIVRO tem a ficha. Este
 * arquivo vai direto ao livro, do mesmo jeito que `extrair-bendov.mjs` fez com
 * o Tarô.
 *
 * O QUE NÃO ENTRA, e é deliberado:
 *  - tudo depois de "Combinations:". São pares e trios ("Fox + Bouquet: …") e
 *    pertencem a outro nível: relação entre cartas, nunca o significado
 *    isolado. É exatamente o erro que a regra do verso proíbe;
 *  - frases do "General" que citam OUTRA carta (o livro compara cartas ali:
 *    "Fox + Moon … Child + Sun"). Uma frase assim é relacional, e entra nem
 *    como evidência, para não vazar para o texto individual. Perder material é
 *    seguro; vazar relação não é. A contagem de frases cortadas fica gravada;
 *  - "Timing" e "Lenormand Universe" ficam na ficha (rastreabilidade), mas o
 *    consumidor não os manda ao modelo: o primeiro é previsão e o segundo,
 *    nas palavras da autora, "a nontraditional, mythic title … from my own
 *    practice".
 *
 * O texto do PDF tem hifenização de fim de linha ("momen tary", "agree ments").
 * Não é consertado aqui: a ficha é EVIDÊNCIA INTERNA, não texto exibido.
 */
import fs from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"

const ARQ = "data/pdfs/lenormand_handbook.pdf"
const SAIDA = path.join(process.cwd(), "lib", "oracles", "lenormand-fichas.ts")
const FONTE = "Caitlín Matthews, The Complete Lenormand Oracle Handbook (Destiny Books), cap. 2 (Lenormand Lexicon)"

if (!fs.existsSync(ARQ)) { console.error(`[extrair-lenormand] ${ARQ} não encontrado`); process.exit(1) }
const bytes = fs.readFileSync(ARQ)
const sha = createHash("sha256").update(bytes).digest("hex")

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise
const paginas = []
for (let p = 1; p <= doc.numPages; p++) paginas.push((await (await doc.getPage(p)).getTextContent()).items.map((i) => i.str).join(" "))
const texto = paginas.join("\n")
const limpa = (s) => s.replace(/\s+/g, " ").trim()

const limites = []
{ let acc = 0; for (const p of paginas) { acc += p.length + 1; limites.push(acc) } }
const paginaDe = (pos) => limites.findIndex((x) => x >= pos) + 1

// o rótulo às vezes sai com letras separadas ("E ffe c t:", "N o u n s :")
const rotulo = (nome) => new RegExp(nome.replace(/\s+/g, "").split("").map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*") + "\\s*:", "i")

/** nome na ordem do baralho (1 a 36), como o livro o grafa, e os apelidos que ele usa */
const CARTAS = [
  ["Rider"], ["Clover"], ["Ship"], ["House"], ["Tree"], ["Clouds", "Cloud"], ["Snake"], ["Coffin"], ["Bouquet"],
  ["Scythe"], ["Rod", "Whip"], ["Birds", "Bird"], ["Child"], ["Fox", "Foxes"], ["Bear"], ["Stars", "Star"],
  ["Stork"], ["Dog"], ["Tower"], ["Garden"], ["Mountain"], ["Paths", "Crossroads"], ["Mice", "Mouse"],
  ["Heart"], ["Ring"], ["Book"], ["Letter"], ["Man"], ["Woman"], ["Lily", "Lilies"], ["Sun"], ["Moon"],
  ["Key"], ["Fish"], ["Anchor"], ["Cross"],
]

const marcasGeneral = [...texto.matchAll(/General\s*:/g)].map((m) => m.index)
if (marcasGeneral.length !== 36) { console.error(`[extrair-lenormand] esperava 36 "General:", achei ${marcasGeneral.length}. Nada gravado.`); process.exit(1) }

const ORDEM = ["General", "Effect", "Nouns", "Adjectives", "Verbs", "Adverbs", "People", "Timing", "Lenormand Universe", "Combinations"]
const REGEX = Object.fromEntries(ORDEM.map((n) => [n, rotulo(n)]))

const outrasPalavras = (i) => CARTAS.flatMap((nomes, j) => (j === i ? [] : nomes))
const ehOutraCarta = (frase, i) => {
  const outras = outrasPalavras(i)
  const re = new RegExp(`(?<![A-Za-z])(?:${outras.join("|")})(?![a-z])`, "") // maiúscula inicial: o livro grafa as cartas com ela
  // outro SISTEMA também é relação: a ficha da Lua adverte "não leia a Lua do
  // Lenormand como a Lua do Tarot", e isso não pode chegar ao texto individual
  const outroSistema = /\b(?:Tarot|Tarocchi|I Ching|Runes?|Kipper|Marseille)\b/.test(frase)
  return re.test(frase) || outroSistema || /\+/.test(frase) || /\((?:see|See)\b/.test(frase) || /\bchapters?\s+\d/i.test(frase)
}

const fichas = []
for (let i = 0; i < 36; i++) {
  const ini = marcasGeneral[i]
  const fim = i + 1 < 36 ? marcasGeneral[i + 1] : Math.min(texto.length, ini + 6000)
  const fatia = texto.slice(ini, fim)

  // posição de cada rótulo DENTRO da ficha, na ordem em que aparecem
  const achados = []
  let desde = 0
  for (const nome of ORDEM) {
    const m = REGEX[nome].exec(fatia.slice(desde))
    if (!m) continue
    achados.push({ nome, ini: desde + m.index, corpo: desde + m.index + m[0].length })
    desde = desde + m.index + m[0].length
  }
  const campos = {}
  achados.forEach((a, k) => {
    if (a.nome === "Combinations") return
    const ate = k + 1 < achados.length ? achados[k + 1].ini : fatia.length
    campos[a.nome] = limpa(fatia.slice(a.corpo, ate))
  })

  const lista = (s) => (s ? s.replace(/\.$/, "").split(/[;:]\s*/).map((x) => x.trim()).filter(Boolean) : [])
  const frases = (campos.General ?? "").split(/(?<=[.!?])\s+/).map(limpa).filter(Boolean)
  // pergunta ao leitor sobre a direção de outra carta ("Toward which card…?") é relacional
  // (pergunta ao leitor sobre a direção de outra carta, "Toward which card…?", é relacional)
  const manter = frases.filter((f) => !ehOutraCarta(f, i) && !f.endsWith("?"))

  fichas.push({
    indice: i,
    nomeFonte: CARTAS[i][0],
    pagina: paginaDe(ini),
    geral: manter.join(" "),
    frasesCortadas: frases.length - manter.length,
    // a primeira palavra é o veredito (Challenging / Fortunate / Neutral); o resto é nota do livro
    efeito: ((campos.Effect ?? "").match(/^(Challenging|Fortunate|Neutral)/i) || [""])[0],
    efeitoNota: (campos.Effect ?? "").replace(/^(Challenging|Fortunate|Neutral)\b[,.]?\s*/i, "").replace(/\.$/, ""),
    substantivos: lista(campos.Nouns),
    adjetivos: lista(campos.Adjectives),
    verbos: lista(campos.Verbs),
    adverbios: lista(campos.Adverbs),
    pessoas: lista(campos.People),
    tempo: (campos.Timing ?? "").replace(/\.$/, ""),
    universo: (campos["Lenormand Universe"] ?? "").replace(/\.$/, ""),
  })
}

// ── travas: nada é gravado se a extração não fechar ──────────────────────────
const falhas = []
for (const f of fichas) {
  const quem = `${f.indice + 1} ${f.nomeFonte} (p${f.pagina})`
  if (f.geral.length < 60) falhas.push(`${quem}: "General" com ${f.geral.length} caracteres depois do filtro`)
  if (!/^(Challenging|Fortunate|Neutral)$/i.test(f.efeito)) falhas.push(`${quem}: Effect inesperado "${f.efeito.slice(0, 30)}"`)
  if (f.substantivos.length < 3) falhas.push(`${quem}: ${f.substantivos.length} substantivos`)
  if (f.adjetivos.length < 3) falhas.push(`${quem}: ${f.adjetivos.length} adjetivos`)
  if (f.verbos.length < 2) falhas.push(`${quem}: ${f.verbos.length} verbos`)
  if (/Combinations|\bGeneral\s*:/i.test(f.geral + f.efeito + f.universo)) falhas.push(`${quem}: vazou rótulo/combinações`)
  if (/\+/.test(f.geral)) falhas.push(`${quem}: "+" no General`)
}
if (falhas.length) { console.error("[extrair-lenormand] a extração não fechou; nada gravado:\n  " + falhas.join("\n  ")); process.exit(1) }

const cab = `/**
 * GERADO POR scripts/extrair-lenormand.mjs — NÃO EDITAR À MÃO.
 *
 * Ficha individual de cada uma das 36 cartas do Lenormand, extraída de
 * ${FONTE}.
 * Extraído em ${new Date().toISOString().slice(0, 10)}. sha256 do PDF: ${sha}
 *
 * SÓ SIGNIFICADO ISOLADO: as "Combinations" do livro ficam de fora, e do
 * "General" saem as frases que citam outra carta. \`frasesCortadas\` diz quantas.
 * \`pagina\` é a página do PDF. O texto traz hifenização de fim de linha do
 * original; é evidência interna, não texto exibido.
 */
export type FichaLenormand = {
  /** índice em LENORMAND_DECK, 0 a 35 */
  indice: number
  /** nome como o livro o grafa (Rod, Paths…) */
  nomeFonte: string
  pagina: number
  geral: string
  frasesCortadas: number
  efeito: string
  efeitoNota: string
  substantivos: string[]
  adjetivos: string[]
  verbos: string[]
  adverbios: string[]
  pessoas: string[]
  tempo: string
  universo: string
}

export const LENORMAND_FONTE = ${JSON.stringify(FONTE)}
export const LENORMAND_PDF_SHA256 = ${JSON.stringify(sha)}

export const LENORMAND_FICHAS: FichaLenormand[] = ${JSON.stringify(fichas, null, 1)}
`
fs.writeFileSync(SAIDA, cab)
console.log(`[extrair-lenormand] ${fichas.length} fichas gravadas em ${path.relative(process.cwd(), SAIDA)}`)
console.log(`frases do General cortadas por citar outra carta: ${fichas.reduce((a, f) => a + f.frasesCortadas, 0)} (mín ${Math.min(...fichas.map((f) => f.geral.length))} caracteres restantes no menor General)`)
