/**
 * Extrator do I Ching — roda UMA VEZ e grava lib/oracles/iching-fichas.ts.
 *
 * FONTE: o PDF de `i_ching_original.pdf` (Eranos Yijing / Ritsema & Karcher).
 *
 * POR QUE EXISTE. A busca lexical cobria 2,0 das ~3,5 unidades sorteadas e
 * 23% das referências citavam hexagramas que não saíram. A causa, medida: o
 * `pdfs.index.json` aprovado contém o prefácio, a introdução acadêmica, o
 * aparato de "Fields of meaning" e a CONCORDÂNCIA final — e a concordância é
 * organizada por palavra-chave inglesa, com cada entrada citando dezenas de
 * coordenadas `NN.La/b` de hexagramas diferentes. Buscar nela devolve, por
 * construção, material de hexagramas não sorteados.
 *
 * Os 64 capítulos com os textos oraculares existem no PDF, mas o versalete é
 * extraído partido — "INITIAL NINE" sai como "I NITIAL   N INE" — e por isso
 * as fórmulas de linha que `lineTerms` procura praticamente não eram achadas.
 *
 * ATRIBUIÇÃO. As 64 âncoras `INITIAL NINE|INITIAL SIX` saem em ordem de
 * hexagrama, uma por capítulo, e o número vem do ordinal da âncora. Atribuição
 * posicional foi exatamente o que deslocou uma sequência inteira na extração
 * do Ben-Dov, então aqui ela é CONFERIDA contra um sinal independente: o
 * pinyin do hexagrama, que a nossa tabela `HEXAGRAMS` guarda por número e que
 * a fonte escreve em maiúsculas dentro de cada capítulo. Qualquer divergência
 * aborta a gravação.
 *
 * NÃO TRANSFORMA A FONTE. Os textos são tersos e ficam tersos. Nada de prosa
 * nova, nada de conhecimento geral de I Ching, nada de completar lacuna.
 */
import fs from "node:fs"
import path from "node:path"

const ARQ = "data/pdfs/i_ching_original.pdf"
const SAIDA = path.join(process.cwd(), "lib", "oracles", "iching-fichas.ts")
const FONTE = "Eranos Yijing (Ritsema & Karcher), The Original I Ching Oracle"

// OS PINYINS VÊM DA TABELA DO PROJETO, não de lista digitada à mão. A minha
// primeira versão trazia uma lista que eu mesmo escrevi e ela divergia em
// cinco hexagramas (9, 26, 43, 54, 56) — a trava reprovou a atribuição quando
// o erro era da minha lista, não da extração.
const { HEXAGRAMS, hexagramNumber } = await import("../lib/oracles/draw.ts").catch(() => ({ HEXAGRAMS: null }))
  .then((m) => m.HEXAGRAMS ? m : import("file://" + path.join(process.cwd(), "lib", "oracles", "draw.ts")))
const PINYIN = HEXAGRAMS.map((h) => h.pinyin)

/**
 * A FONTE ROMANIZA DOIS HEXAGRAMAS DE OUTRO JEITO: o 40 é "Xie" nela e "Jie" na
 * nossa tabela; o 57 é "Sun" nela e "Xun" na nossa. O vínculo canônico continua
 * sendo o NÚMERO impresso no cabeçalho; a grafia da fonte entra na ficha como
 * metadata e a nossa permanece para a UI. Não é fuzzy match: é tabela
 * explícita, indexada por número.
 */
const PINYIN_DA_FONTE = { 40: "Xie", 57: "Sun" }

if (!fs.existsSync(ARQ)) { console.error(`[extrair-iching] ${ARQ} não encontrado`); process.exit(1) }
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(ARQ)), useSystemFonts: true }).promise
const paginas = []
for (let p = 1; p <= doc.numPages; p++) paginas.push((await (await doc.getPage(p)).getTextContent()).items.map((i) => i.str).join(" "))

// normaliza o versalete partido e os espaços, preservando as quebras de página
const bruto = paginas.join("\n\f\n")
const norm = bruto
  .replace(/\b([A-Z])\s+([A-Z]{2,})\b/g, "$1$2")   // "I NITIAL" → "INITIAL"
  // O "AT" DA FÓRMULA SAI PARTIDO EM UM CASO. Na página 237 o marcador da
  // segunda linha do hexagrama 15 é "S IX A T S ECOND": o "AT" vem como "A T",
  // e a regra acima não junta porque o segundo pedaço tem uma letra só. Nas
  // páginas vizinhas o "AT" está íntegro ("N INE AT T HIRD"), então isto é um
  // caso isolado de renderização, não um padrão. O conserto fica restrito à
  // fórmula, entre o NINE/SIX e o ordinal, para não juntar "A T" em prosa.
  .replace(/\b(NINE|SIX)\s+A\s+T\s+(SECOND|THIRD|FOURTH|FIFTH)\b/g, "$1 AT $2")
  .replace(/[ \t]+/g, " ")
const limpa = (s) => s.replace(/\s+/g, " ").trim()

// posição → página
const limites = []
{ let acc = 0; for (const p of norm.split("\n\f\n")) { acc += p.length + 3; limites.push(acc) } }
const paginaDe = (pos) => limites.findIndex((x) => x >= pos) + 1
/**
 * A página por POSIÇÃO erra em ±1 quando o cabeçalho do capítulo encosta na
 * quebra de página da extração. Para a citação ser exata, a página é achada
 * procurando o próprio texto nas páginas — o que é possível porque elas estão
 * em memória. Rastreabilidade por página é o ponto do exercício.
 */
const paginasLimpas = paginas.map((x) => x.replace(/\s+/g, " ").trim())
const paginaDoTexto = (texto, fallback, janela = 6) => {
  const t = limpa(texto).slice(0, 40)
  if (t.length < 12) return fallback
  // A BUSCA É RESTRITA À VIZINHANÇA do capítulo: varrer o livro inteiro achava
  // uma recorrência do mesmo texto noutra seção e punha 14 bases depois das
  // próprias linhas. O fallback posicional dá o ponto de partida.
  const de = Math.max(0, fallback - 2), ate = Math.min(paginasLimpas.length, fallback + janela)
  for (let k = de; k < ate; k++) if (paginasLimpas[k].includes(t)) return k + 1
  const i = paginasLimpas.findIndex((p) => p.includes(t))
  return i >= 0 ? i + 1 : fallback
}

// ── OS 64 CAPÍTULOS, PELO NÚMERO IMPRESSO ────────────────────────────────
// Cada capítulo abre com "NN NOME Pinyin The situation described by this
// hexagram is characterized by…". A frase é a âncora e o NÚMERO vem impresso
// logo antes — nada de ordinal. Atribuição por posição foi o que deslocou uma
// sequência inteira na extração do Ben-Dov, e aqui a primeira tentativa (por
// ordinal das âncoras de linha) atribuiu o capítulo 14 ao número 15 sem que a
// trava de pinyin reclamasse, porque ela olhava uma janela larga demais.
// DUAS FRASES DE ABERTURA, e a segunda só existe duas vezes no livro inteiro:
// os hexagramas 36 (p442, "36 BRIGHTNESS HIDDEN | Ming Yi") e 39 (p474,
// "39 LIMPING | Jian") abrem com "This hexagram describes a situation…" em vez
// de "The situation described by this hexagram…". Era só isso: o número está
// impresso e presente na camada de texto nos dois, e o pinyin bate com a nossa
// tabela. Ancorar numa frase só deixava 62 de 64.
const ABRE = "(?:The situation described by this hexagram|This hexagram describes a situation)"
const erros = []
const cabecalhos = []
for (const m of norm.matchAll(new RegExp(ABRE, "g"))) {
  const antes = norm.slice(Math.max(0, m.index - 150), m.index)
  // o último "NN MAIÚSCULAS" antes da frase é o cabeçalho, e ele tem de estar
  // ADJACENTE: num capítulo real o que separa o nome da frase é no máximo o
  // pinyin e uma barra ("36 BRIGHTNESS HIDDEN | Ming Yi This hexagram…").
  // Sem esta exigência, a seção de instruções do prefácio, que cita a frase
  // ao explicar a estrutura do livro, entra como um 65º capítulo.
  const hs = [...antes.matchAll(/\b(\d{1,2})\s+([A-ZÀ-Ü][A-ZÀ-Ü]+(?:\s+[A-ZÀ-Ü]+)*)/g)]
  const h = hs[hs.length - 1]
  const adjacente = h && antes.length - (h.index + h[0].length) <= 30
  if (!h || !adjacente) continue
  const n = Number(h[1])
  if (n < 1 || n > 64) { erros.push(`capítulo em ${m.index}: número ${n} fora de 1..64`); continue }
  cabecalhos.push({ numero: n, nome: h[2].trim(), ini: m.index - (antes.length - h.index) })
}
cabecalhos.sort((a, b) => a.ini - b.ini)
const vistos = new Set()
for (const c of cabecalhos) {
  if (vistos.has(c.numero)) erros.push(`hexagrama ${c.numero} aparece mais de uma vez`)
  vistos.add(c.numero)
}
for (let n = 1; n <= 64; n++) if (!vistos.has(n)) erros.push(`hexagrama ${n} sem capítulo localizado`)

const FORMULAS = [
  ["INITIAL NINE", "INITIAL SIX"],
  ["NINE AT SECOND", "SIX AT SECOND"],
  ["NINE AT THIRD", "SIX AT THIRD"],
  ["NINE AT FOURTH", "SIX AT FOURTH"],
  ["NINE AT FIFTH", "SIX AT FIFTH"],
  ["NINE ABOVE", "SIX ABOVE"],
]
const TODAS = FORMULAS.flat()
const fichas = []
for (const [k, cab] of cabecalhos.entries()) {
  const fim = k + 1 < cabecalhos.length ? cabecalhos[k + 1].ini : norm.length
  const corpo = norm.slice(cab.ini, fim)

  // base: a seção "Image of the Situation" DESTE capítulo
  let base = ""
  for (const m of [...corpo.matchAll(/Image of the Situation/g)]) {
    const resto = corpo.slice(m.index + 22)
    if (/^\s*(see|,|\.)/i.test(resto)) continue
    base = limpa(resto.split(/Outer and Inner|Counter Hexagram|Preceding Situation|Hexagrams in Pairs|Patterns of Wisdom|Fields of meaning|Transforming Lines/)[0])
    if (base.length > 20) break
    base = ""
  }
  if (!base) erros.push(`hex ${cab.numero}: sem "Image of the Situation" no capítulo`)

  // as 6 linhas
  // `\b` dentro de template literal é BACKSPACE em JavaScript, não fronteira
  // de palavra. Daí o `\\b`.
  const reQualquer = new RegExp(`\\b(?:${TODAS.join("|")})\\b`, "g")
  const marcas = [...corpo.matchAll(reQualquer)].map((m) => ({ i: m.index, f: m[0] }))
  const linhas = []
  for (const [j, m] of marcas.entries()) {
    const idx = FORMULAS.findIndex(([a, b]) => a === m.f || b === m.f)
    if (idx < 0 || linhas.some((l) => l.linha === idx + 1)) continue
    const fimBloco = marcas[j + 1] ? marcas[j + 1].i : corpo.length
    const bloco = corpo.slice(m.i + m.f.length, fimBloco)
    const partes = bloco.split(/\bComments\b/)
    const texto = limpa(partes[0])
    const comentario = limpa((partes[1] ?? "").split(/Fields of meaning/)[0])
    if (!texto) continue
    // `includes`, não `startsWith`: a fórmula da primeira linha é
    // "INITIAL NINE", que não COMEÇA com "NINE". Com startsWith, toda linha 1
    // recebia 6 e o hexagrama 1 saía 011111 em vez de 111111 — foi a trava
    // binária abaixo que expôs isso.
    linhas.push({ linha: idx + 1, valor: m.f.includes("NINE") ? 9 : 6, texto: texto.slice(0, 400), comentario: comentario.slice(0, 400), pagina: paginaDoTexto(texto, paginaDe(cab.ini + m.i)) })
  }
  linhas.sort((a, b) => a.linha - b.linha)

  // CONFERÊNCIA INDEPENDENTE: o pinyin da nossa tabela tem de estar no
  // cabeçalho deste capítulo, entre o nome e a frase de abertura
  const nosso = PINYIN[cab.numero - 1]
  const naFonte = PINYIN_DA_FONTE[cab.numero] ?? nosso
  const cabTexto = corpo.slice(0, 220)
  if (!cabTexto.includes(naFonte)) {
    erros.push(`hex ${cab.numero}: pinyin "${naFonte}" não está no cabeçalho ("${limpa(cabTexto.slice(0, 90))}")`)
  }
  fichas.push({
    numero: cab.numero, nomeFonte: cab.nome,
    pinyin: nosso,                                        // o do produto, para a UI
    pinyinFonte: naFonte === nosso ? undefined : naFonte, // só quando divergem
    base: base.slice(0, 700), linhas, pagina: paginaDoTexto(base, paginaDe(cab.ini)),
  })
}
fichas.sort((a, b) => a.numero - b.numero)

// ── travas ────────────────────────────────────────────────────────────────
if (fichas.length !== 64) erros.push(`${fichas.length} fichas, esperado 64`)
let totalLinhas = 0
for (const f of fichas) {
  totalLinhas += f.linhas.length
  if (f.linhas.length !== 6) erros.push(`hex ${f.numero} (${f.pinyin}): ${f.linhas.length} linhas, esperado 6 — tem ${f.linhas.map((l) => l.linha).join(",")}`)
  for (const l of f.linhas) {
    if (!l.texto || l.texto.length < 3) erros.push(`hex ${f.numero} linha ${l.linha}: texto vazio`)
    if (/\u0000/.test(l.texto + l.comentario)) erros.push(`hex ${f.numero} linha ${l.linha}: NUL`)
  }
  const vistas = new Set(f.linhas.map((l) => l.linha))
  if (vistas.size !== f.linhas.length) erros.push(`hex ${f.numero}: linha duplicada`)
  if (/\u0000/.test(f.base)) erros.push(`hex ${f.numero}: NUL na base`)
  if (f.base.length < 20) erros.push(`hex ${f.numero}: base com ${f.base.length} chars`)
  // A conferência de atribuição acontece ACIMA, no cabeçalho de cada capítulo
  // (o pinyin da nossa tabela tem de estar nos primeiros 220 chars do bloco).
  // A primeira versão desta trava olhava uma janela de ±20 mil caracteres em
  // volta de uma âncora e, por ser larga demais, aprovou em silêncio um
  // deslocamento que atribuía o capítulo 14 ao número 15.
}
if (totalLinhas !== 384) erros.push(`${totalLinhas} linhas no total, esperado 384`)

/**
 * A TRAVA MAIS FORTE: o padrão Nine/Six das seis linhas de um capítulo É o
 * binário do próprio hexagrama. Se uma linha vier do capítulo vizinho, ou se
 * a polaridade for lida errado, o binário não fecha — e como os 64 hexagramas
 * ocupam os 64 padrões possíveis de 6 bits, exatamente uma vez cada, a
 * conferência é completa: ela prova a atribuição sem usar ordinal, sem usar
 * pinyin e sem usar o número impresso. Foi ela que achou o `startsWith`.
 */
{
  const porBits = new Map()
  for (const f of fichas) {
    const bits = [...f.linhas].sort((a, b) => a.linha - b.linha).map((l) => (l.valor === 9 ? 1 : 0)).join("")
    if (bits.length !== 6) { erros.push(`hex ${f.numero}: ${bits.length} bits`); continue }
    if (porBits.has(bits)) erros.push(`hex ${f.numero} e hex ${porBits.get(bits)} têm o mesmo binário ${bits} — alguma linha veio do capítulo errado`)
    porBits.set(bits, f.numero)
    // e o binário tem de corresponder ao NÚMERO, pela tabela King Wen do motor
    const esperado = hexagramNumber(bits.split("").map(Number))
    if (esperado !== f.numero) erros.push(`hex ${f.numero}: as linhas formam o binário ${bits}, que é o hexagrama ${esperado}`)
  }
  if (porBits.size !== 64) erros.push(`${porBits.size} binários distintos, esperado 64`)
}

if (erros.length) {
  console.error(`[extrair-iching] FALHOU, nada foi gravado (${erros.length} erro(s)):`)
  for (const e of erros.slice(0, 30)) console.error(`  - ${e}`)
  if (erros.length > 30) console.error(`  … e mais ${erros.length - 30}`)
  process.exit(1)
}

const ts = `/**
 * GERADO POR scripts/extrair-iching.mjs — NÃO EDITAR À MÃO.
 *
 * Os 64 hexagramas e as 384 linhas de ${FONTE}.
 * Extraído em ${new Date().toISOString().slice(0, 10)}.
 *
 * Os textos são TERSOS porque a fonte é tersa. Nada foi expandido, completado
 * ou traduzido: o material fica no idioma original (inglês) e só os rótulos
 * são localizados, como já acontece com as fichas do tarô (português) e das
 * runas (inglês).
 */
export type LinhaDeHexagrama = {
  /** 1 a 6, de baixo para cima */
  linha: number
  /** 9 = yang mutante, 6 = yin mutante */
  valor: 6 | 9
  texto: string
  comentario: string
  pagina: number
}

export type FichaDeHexagrama = {
  numero: number
  /** o nome como a fonte o imprime no cabeçalho do capítulo */
  nomeFonte: string
  pinyin: string
  /** a grafia da fonte, quando diverge da nossa */
  pinyinFonte?: string
  /** a seção "Image of the Situation" */
  base: string
  linhas: LinhaDeHexagrama[]
  pagina: number
}

export const ICHING_FONTE = ${JSON.stringify(FONTE)}

export const ICHING_FICHAS: FichaDeHexagrama[] = ${JSON.stringify(fichas, null, 1)}
`
fs.writeFileSync(SAIDA, ts, "utf8")
console.log(`[extrair-iching] 64 hexagramas e ${totalLinhas} linhas em ${path.relative(process.cwd(), SAIDA)}`)
console.log(`  páginas: hex 1 na p${fichas[0].pagina}, hex 64 na p${fichas[63].pagina}`)
console.log(`  base média: ${Math.round(fichas.reduce((a, f) => a + f.base.length, 0) / 64)} chars`)
console.log(`  texto de linha médio: ${Math.round(fichas.flatMap((f) => f.linhas).reduce((a, l) => a + l.texto.length, 0) / totalLinhas)} chars`)
