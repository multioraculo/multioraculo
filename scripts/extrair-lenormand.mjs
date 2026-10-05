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

// ─────────────────────────────────────────────────────────────────────────────
// CAMADA 2 — AS COMBINAÇÕES, em módulo separado.
//
// POR QUE SEPARADA. A ficha é o que a carta significa sozinha; a combinação é o
// que duas cartas dizem JUNTAS, numa ordem. São níveis diferentes de evidência e
// o verso da carta da Home só pode usar o primeiro. Gerar dois módulos mantém o
// schema que a Home já consome intocado e deixa a responsabilidade separada.
//
// A DIREÇÃO É DADA. O livro afirma, na ficha da Raposa: "When Fox comes before a
// card, it will affect what follows more severely, so Fox + Fish means that
// something is seriously up with your money, whereas Fish + Fox is saying you
// received the wrong change." Nos 21 pares que aparecem nas duas direções, o
// texto difere em 21. Por isso `cartas` guarda a ORDEM da fonte e nada aqui
// simetriza.
//
// O QUE NÃO ENTRA: as entradas `X on House of Y` / `X in House of Y`, que são o
// sistema de CASAS do Grand Tableau — outro método, com outra mesa, e não as
// combinações do Portrait Spread.
// ─────────────────────────────────────────────────────────────────────────────

const SAIDA_COMB = path.join(process.cwd(), "lib", "oracles", "lenormand-combinacoes.ts")

/** Colapsa espaços guardando, para cada caractere do resultado, o índice original. */
function normalizaComMapa(s, deslocamento) {
  let saida = ""
  const mapa = []
  let espacoAtras = false
  for (let j = 0; j < s.length; j++) {
    const c = s[j]
    const espaco = c === " " || c === "\n" || c === "\t" || c === "\r"
    if (espaco) {
      if (!espacoAtras) { saida += " "; mapa.push(deslocamento + j) }
      espacoAtras = true
    } else {
      saida += c
      mapa.push(deslocamento + j)
      espacoAtras = false
    }
  }
  return { saida, mapa }
}

// Todos os nomes que o livro usa para uma carta, apelidos inclusive, do mais
// longo para o mais curto (senão "Star" casaria dentro de "Stars").
const NOMES_TODOS = CARTAS.flatMap((ns, i) => ns.map((n) => ({ n, i })))
  .sort((a, b) => b.n.length - a.n.length)
const ALTERNATIVA = NOMES_TODOS.map((x) => x.n).join("|")
const indiceDoNome = (n) => NOMES_TODOS.find((x) => x.n === n)?.i ?? -1

// `-i-` é o "+" lido errado pelo OCR; o espaço antes do "+" às vezes some
// ("Anchor+ Mice"); o qualificador de direção vem como " L" ou " R".
const CARTA_RE = `(?:${ALTERNATIVA})(?: [LR])?`
const ENTRADA_RE = new RegExp(`(${CARTA_RE})((?: ?(?:\\+|-i-) ?${CARTA_RE})+) ?:`, "g")
const PECA_RE = new RegExp(`(${ALTERNATIVA})(?: ([LR]))?`, "g")
// o livro escreve as casas de quatro jeitos: "on House of", "in House of",
// "on the House of", "in the House of"
const CASA_RE = / (?:on|in)(?: the)? House of /

const combinacoes = []
const avisosComb = []
let casasIgnoradas = 0

for (let i = 0; i < 36; i++) {
  const ini = marcasGeneral[i]
  const fim = i + 1 < 36 ? marcasGeneral[i + 1] : Math.min(texto.length, ini + 6000)
  const fatia = texto.slice(ini, fim)
  const mc = REGEX.Combinations.exec(fatia)
  REGEX.Combinations.lastIndex = 0
  if (!mc) { avisosComb.push(`${i + 1} ${CARTAS[i][0]}: sem rótulo "Combinations"`); continue }

  const base = ini + mc.index + mc[0].length
  const { saida: corpoCru, mapa } = normalizaComMapa(texto.slice(base, fim), base)
  const nasCasas = corpoCru.match(new RegExp(CASA_RE.source, "g"))
  casasIgnoradas += nasCasas ? nasCasas.length : 0

  // corta na primeira entrada de CASA, recuando até o fim da frase anterior
  // para não deixar meia frase de casa colada na última glosa
  const posCasa = corpoCru.search(CASA_RE)
  let corpo = corpoCru
  if (posCasa >= 0) {
    const fimFrase = corpoCru.lastIndexOf(". ", posCasa)
    corpo = corpoCru.slice(0, fimFrase >= 0 ? fimFrase + 1 : posCasa)
  }
  // depois das entradas vem a legenda da gravura, que o OCR devolve como uma
  // sequência de letras soltas ("f lo i j a c k Out* n tta frim ti")
  const lixo = corpo.search(/(?: [a-zA-Z]){4,}(?![a-zA-Z])/)
  if (lixo >= 0) corpo = corpo.slice(0, lixo)

  const achados = [...corpo.matchAll(ENTRADA_RE)]
  if (!achados.length) avisosComb.push(`${i + 1} ${CARTAS[i][0]}: nenhuma entrada reconhecida`)

  achados.forEach((m, k) => {
    PECA_RE.lastIndex = 0
    const pecas = [...m[0].matchAll(PECA_RE)].map((p) => ({ i: indiceDoNome(p[1]), q: p[2] ?? "" }))
    if (pecas.some((p) => p.i < 0)) { avisosComb.push(`${i + 1} ${CARTAS[i][0]}: nome desconhecido em "${m[0]}"`); return }
    const a = m.index + m[0].length
    const b = k + 1 < achados.length ? achados[k + 1].index : corpo.length
    // "Ring + Man/Woman:" não é uma entrada (a barra é uma alternativa do autor,
    // não uma carta): a glosa é cortada antes dela, em vez de inventar um par
    let glosa = corpo.slice(a, b).trim()
    const grudado = glosa.search(new RegExp(` ?(?:${ALTERNATIVA})(?: [LR])? ?(?:\\+|-i-|/)`))
    if (grudado >= 0) glosa = glosa.slice(0, grudado)
    glosa = glosa.trim().replace(/[;,.]+$/, "")
    if (!glosa) { avisosComb.push(`${i + 1} ${CARTAS[i][0]}: glosa vazia em "${m[0]}"`); return }
    combinacoes.push({
      dono: i,
      cartas: pecas.map((p) => p.i),
      qualificadores: pecas.map((p) => p.q),
      glosa,
      pagina: paginaDe(mapa[m.index] ?? base),
    })
  })
}

// ── travas das combinações: nada é gravado se a extração não fechar ──────────
const falhasComb = [...avisosComb]
const paresComb = combinacoes.filter((c) => c.cartas.length === 2)
if (combinacoes.length < 200) falhasComb.push(`só ${combinacoes.length} entradas (esperado ~224)`)
if (paresComb.length < 160) falhasComb.push(`só ${paresComb.length} pares (esperado ~182)`)
for (const c of combinacoes) {
  const quem = `${c.cartas.map((x) => CARTAS[x][0]).join(" + ")} (p${c.pagina})`
  if (c.cartas.length < 2) falhasComb.push(`${quem}: entrada com menos de duas cartas`)
  if (c.cartas.some((x) => x < 0 || x > 35)) falhasComb.push(`${quem}: índice fora de 0–35`)
  if (c.qualificadores.some((q) => q && q !== "L" && q !== "R")) falhasComb.push(`${quem}: qualificador inesperado`)
  // só Nuvens (5) e Foice (9) têm direção de arte no livro
  c.qualificadores.forEach((q, j) => {
    if (q && c.cartas[j] !== 5 && c.cartas[j] !== 9) falhasComb.push(`${quem}: qualificador "${q}" numa carta que não é Nuvens nem Foice`)
  })
  if (c.pagina < 61 || c.pagina > 120) falhasComb.push(`${quem}: página ${c.pagina} fora do léxico (61–120)`)
  if (/House of/i.test(c.glosa)) falhasComb.push(`${quem}: glosa com entrada de casa do Grand Tableau`)
  if (/Combinations|General\s*:/i.test(c.glosa)) falhasComb.push(`${quem}: glosa com rótulo`)
  if (/(?: [a-zA-Z]){4,}(?![a-zA-Z])/.test(c.glosa)) falhasComb.push(`${quem}: glosa com lixo de OCR`)
  if (c.glosa.length < 8 || c.glosa.length > 200) falhasComb.push(`${quem}: glosa com ${c.glosa.length} caracteres`)
  if (c.glosa.includes("\0")) falhasComb.push(`${quem}: NUL na glosa`)
}
if (falhasComb.length) {
  console.error("[extrair-lenormand] as combinações não fecharam; o módulo de combinações não foi gravado:\n  " + falhasComb.join("\n  "))
  process.exit(1)
}

const cabComb = `/**
 * GERADO POR scripts/extrair-lenormand.mjs — NÃO EDITAR À MÃO.
 *
 * As COMBINAÇÕES do léxico de ${FONTE},
 * uma entrada por combinação glosada, na ordem em que a fonte a escreve.
 * Extraído em ${new Date().toISOString().slice(0, 10)}. sha256 do PDF: ${sha}
 *
 * A ORDEM É O SENTIDO. O livro afirma, na ficha da Raposa: "When Fox comes
 * before a card, it will affect what follows more severely, so Fox + Fish means
 * that something is seriously up with your money, whereas Fish + Fox is saying
 * you received the wrong change." Dos pares que aparecem nas duas direções,
 * NENHUM repete o texto. Por isso \`cartas\` é uma lista ORDENADA e nada aqui
 * simetriza: a ausência de A→B não é suprida por B→A.
 *
 * NÃO ESTÃO AQUI as entradas "X on House of Y": são o sistema de CASAS do Grand
 * Tableau, outro método e outra mesa.
 *
 * \`qualificadores\` só é preenchido para Nuvens e Foice, as duas cartas cuja
 * direção na arte muda o sentido segundo a fonte (p. 62, 71 e 159).
 */

export type CombinacaoLenormand = {
  /** índices em LENORMAND_DECK, NA ORDEM DA FONTE: cartas[0] age sobre cartas[1] */
  cartas: number[]
  /** "L", "R" ou "" por carta, na mesma ordem */
  qualificadores: string[]
  glosa: string
  /** página do PDF */
  pagina: number
  /** índice da carta em cuja ficha a entrada está impressa */
  dono: number
}

export const LENORMAND_COMBINACOES_FONTE = ${JSON.stringify(FONTE)}
export const LENORMAND_COMBINACOES_PDF_SHA256 = ${JSON.stringify(sha)}

export const LENORMAND_COMBINACOES: CombinacaoLenormand[] = ${JSON.stringify(combinacoes, null, 1)}
`
fs.writeFileSync(SAIDA_COMB, cabComb)
const trios = combinacoes.length - paresComb.length
const comQual = combinacoes.filter((c) => c.qualificadores.some((q) => q)).length
console.log(`[extrair-lenormand] ${combinacoes.length} combinações gravadas em ${path.relative(process.cwd(), SAIDA_COMB)}`)
console.log(`  ${paresComb.length} pares, ${trios} de três ou mais, ${comQual} com qualificador L/R`)
console.log(`  entradas "House of" ignoradas (casas do Grand Tableau): ${casasIgnoradas}`)
