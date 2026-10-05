/**
 * Extrator dos Odus — roda UMA VEZ e grava lib/oracles/odus-fichas.ts.
 *
 * POR QUE EXISTE. A busca lexical devolvia uma janela de página contendo em
 * média 2,6 Odus, dos quais ~1,6 não tinham sido sorteados; 16 de 40 leituras
 * tinham duas quedas diferentes e só uma recebia referência, e 5 não recebiam
 * nenhuma. Uma ficha por Odu resolve as duas coisas.
 *
 * DUAS TABELAS DA MESMA FONTE, com papéis diferentes:
 *
 *  A) "OS PRÓS & CONTRAS DE CADA ODÚ" — `NN NOME <positivo>. <negativo>`.
 *     É daqui que vem o CONTEÚDO da ficha, porque é a única com os dois polos
 *     explícitos, que é o que o produto precisa preservar.
 *
 *  B) "Odù: X Orixá: Y N Búzios Abertos" + Amor/Trabalho/Dinheiro/Família/
 *     Espiritual — 17 entradas, 0..16 sem lacuna. Usada SÓ para o mapeamento
 *     determinístico índice→Odu, porque ela é chaveada pelo número de búzios,
 *     que é exatamente o resultado do nosso sorteio. Isso resolve dois casos
 *     que a tabela A deixava ambíguos:
 *       · o índice 0 (zero abertos) é "Oyaku — 16 Búzios Fechados";
 *       · o "16 OYAKU" da tabela A contava FECHADOS, não o número do Odu,
 *         então nunca houve duas entradas para o Odu 16.
 *
 * NÃO adiciona conteúdo: os campos temáticos da tabela B ficam de fora de
 * propósito. Nada aqui é conhecimento geral sobre Odus.
 */
import fs from "node:fs"
import path from "node:path"

const ARQUIVO = "odus_afro_brasileiros.pdf"
const SAIDA = path.join(process.cwd(), "lib", "oracles", "odus-fichas.ts")
const idx = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "pdfs_index", "pdfs.index.json"), "utf8"))
const chunks = idx.index.find((e) => e.file === ARQUIVO)?.chunks
if (!chunks) { console.error(`[extrair-odus] ${ARQUIVO} não está no índice`); process.exit(1) }
const inteiro = chunks.join("\n")
const limpa = (s) => s.replace(/\s+/g, " ").trim()

// ── B · mapeamento índice → nome da fonte, pelo número de búzios ──────────
const RE_B = /Od[uù]\s*:\s*([^\n]{1,40}?)\s+Orix[aá]\s*:\s*([^\n]{1,60}?)\s+(\d{1,2})\s+B[uú]zios?\s+(Abertos?|Fechados?)/gi
const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const mapa = new Map() // nº de abertos -> { odu, orixa }
/** nomes que a tabela B registra contando FECHADOS, não abertos */
const contaFechados = new Set()
for (const m of inteiro.matchAll(RE_B)) {
  const n = Number(m[3])
  const porAbertos = /^aberto/i.test(m[4])
  const abertos = porAbertos ? n : 16 - n
  if (!porAbertos) contaFechados.add(semAcento(limpa(m[1])))
  if (!mapa.has(abertos)) mapa.set(abertos, { odu: limpa(m[1]), orixa: limpa(m[2]) })
}

// ── A · conteúdo: positivo e negativo por número de Odu ───────────────────
// o cabeçalho é "NN NOME", e NOME pode trazer letra solta de coluna vizinha
// ("OBEOGUND A"), então o recorte é pelo NÚMERO e o nome vem da tabela B.
const RE_A = /\b(0[1-9]|1[0-6])\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]+)*)\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõçà])/g
const marcas = []
for (const m of inteiro.matchAll(RE_A)) {
  const nomeBruto = limpa(m[2])
  // A TABELA A NUMERA DOIS JEITOS, e a B diz qual é qual: a linha do Oyaku traz
  // 16 contando búzios FECHADOS, não o número do Odu. Sem isto o Oyaku entra
  // como um segundo Odu 16 e a trava de duplicata dispara — foi o que ocorreu.
  const n = Number(m[1])
  const abertos = contaFechados.has(semAcento(nomeBruto)) ? 16 - n : n
  marcas.push({ n: abertos, nomeBruto, ini: m.index, corpoIni: m.index + m[0].length - 2 })
}
marcas.sort((a, b) => a.ini - b.ini)

const fichas = []
const lacunas = []
for (const [i, marca] of marcas.entries()) {
  const fim = marcas[i + 1] ? marcas[i + 1].ini : Math.min(inteiro.length, marca.ini + 400)
  const corpo = limpa(inteiro.slice(marca.corpoIni, fim))
  // o polo positivo termina no primeiro ". " seguido de maiúscula; o resto é o negativo
  const corte = corpo.search(/\.\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/)
  if (corte < 0) { lacunas.push({ n: marca.n, nome: marca.nomeBruto, motivo: "sem fronteira de coluna detectável entre positivo e negativo", corpo }); continue }
  const positivo = limpa(corpo.slice(0, corte + 1))
  const negativo = limpa(corpo.slice(corte + 1))
  // O ÚLTIMO ODU DA TABELA NÃO TEM FIM CONFIÁVEL: depois dele vem o cabeçalho
  // corrido do documento e a tabela seguinte ("PALAVRAS CHAVES DE CADA
  // ORIXÁS"), que o recorte por "próxima marca" engole inteira. Quem cai aqui
  // fica como lacuna em vez de entrar com texto de outra seção.
  const CABECALHO = /JOGO DE B[UÚ]ZIOS MERINDINLOGUN|PALAVRAS CHAVES|OR[IÍ]X[AÁ]S\s+ABERTO\s+FECHADO/i
  if (CABECALHO.test(corpo)) { lacunas.push({ n: marca.n, nome: marca.nomeBruto, motivo: "o bloco invade o cabeçalho do documento e a tabela seguinte; sem fim confiável", corpo }); continue }
  // os dois polos fundidos: sem o ponto de fronteira, o positivo abocanha o negativo
  if (/\bAmigos d[aã]o as costas\b/i.test(positivo)) { lacunas.push({ n: marca.n, nome: marca.nomeBruto, motivo: "a fonte não marca a fronteira entre positivo e negativo nesta linha", corpo }); continue }
  const daTabelaB = mapa.get(marca.n)
  if (!daTabelaB) { lacunas.push({ n: marca.n, nome: marca.nomeBruto, motivo: "sem entrada correspondente na tabela B", corpo }); continue }
  if (!positivo || !negativo) { lacunas.push({ n: marca.n, nome: marca.nomeBruto, motivo: "polo vazio", corpo }); continue }
  fichas.push({ abertos: marca.n, odu: daTabelaB.odu, orixa: daTabelaB.orixa, positivo, negativo })
}

// ── travas: nada é gravado se alguma falhar ───────────────────────────────
const erros = []
const vistos = new Set(fichas.map((f) => f.abertos))
for (let i = 1; i <= 16; i++) if (!vistos.has(i)) erros.push(`Odu ${i} ausente`)
// o indice 0 (zero abertos) e tratado como lacuna aceitavel: ver relatorio
if (fichas.length !== vistos.size) erros.push(`${fichas.length} fichas para ${vistos.size} índices: há duplicata`)
for (const f of fichas) {
  if (/\u0000/.test(f.positivo + f.negativo)) erros.push(`${f.abertos}: NUL no texto`)
  // nenhum nome de OUTRO Odu pode aparecer dentro da ficha
  for (const [n, b] of mapa) {
    if (n === f.abertos) continue
    const nome = b.odu.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    if (nome.length < 4) continue
    const txt = (f.positivo + " " + f.negativo).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    if (txt.includes(nome)) erros.push(`${f.abertos} (${f.odu}): cita o Odu vizinho ${b.odu}`)
  }
}
if (erros.length) {
  console.error(`[extrair-odus] FALHOU, nada foi gravado:`)
  for (const e of erros) console.error(`  - ${e}`)
  process.exit(1)
}

const ts = `/**
 * GERADO POR scripts/extrair-odus.mjs — NÃO EDITAR À MÃO.
 *
 * Fichas dos Odus do jogo de búzios, uma por número de búzios abertos, da
 * tabela "OS PRÓS & CONTRAS DE CADA ODÚ" de ${ARQUIVO}. O nome do
 * Odu e o Orixá vêm da segunda tabela da mesma fonte, chaveada por número de
 * búzios — que é o resultado que o sorteio produz.
 *
 * Extraído em ${new Date().toISOString().slice(0, 10)}.
 * Os campos positivo/negativo são os dois polos da fonte, sem acréscimo.
 */
export type FichaDeOdu = {
  /** número de búzios abertos, 0..16 — a chave do sorteio */
  abertos: number
  odu: string
  orixa: string
  positivo: string
  negativo: string
}

export const ODUS_FONTE = "Jogo de Búzios Merindinlogun, tabela dos prós e contras de cada Odú"
export const ODUS_FONTE_ARQUIVO = ${JSON.stringify(ARQUIVO)}

export const ODUS_FICHAS: FichaDeOdu[] = ${JSON.stringify(fichas.sort((a, b) => a.abertos - b.abertos), null, 1)}
`
fs.writeFileSync(SAIDA, ts, "utf8")
console.log(`[extrair-odus] ${fichas.length} fichas gravadas em ${path.relative(process.cwd(), SAIDA)}`)
console.log(`  cobertos: ${fichas.map((f) => f.abertos).join(", ")}`)
if (lacunas.length) {
  console.log(`\n  LACUNAS (${lacunas.length}) — ficaram FORA, sem ficha estruturada:`)
  for (const l of lacunas) console.log(`    ${l.n} ${l.nome}: ${l.motivo}\n      corpo: ${l.corpo.slice(0, 150)}`)
}
