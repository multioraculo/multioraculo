/**
 * Extrator das runas — roda UMA VEZ e grava lib/oracles/runas-fichas.ts.
 *
 * FONTE: Wayne Brekke, The Complete Guide to Runes: An Essential Reference for
 * Runelore, Meanings, Divination, and Magic. Rockridge Press, 2023. 196 pp.
 *
 * POR QUE EXISTE. Antes desta ficha o produto invertia 16 das 24 runas com 50%
 * de chance sem nenhuma fonte: a referência ativa (Thorsson, FUTHARK: A
 * Handbook of Rune Magic) é um manual de magia rúnica e não tem doutrina de
 * reversão nenhuma — "merkstave" 0, "reversed" 0, "inverted" 0 em 282 mil
 * caracteres. Brekke declara, runa por runa, quais invertem e o que a inversão
 * significa em cada uma: 15 com reversão, 9 sem, as 24 cobertas.
 *
 * O QUE NÃO ENTRA. A runa em branco (Wyrd) é tratada pelo livro como adição
 * moderna, explicitamente "not an actual rune", atribuída a Ralph Blum e
 * opcional. Fica fora, e há trava para isso.
 *
 * CASO ESPECIAL DOCUMENTADO. Hagalaz não declara a ausência de reversão na
 * própria ficha: quem declara é a ficha da Isa, "There is no reverse meaning
 * for Isa, much like Nauthiz and Hagal" (p80). Sem tratar isso, Hagalaz cai
 * como "muda" e a contagem 15/9 não fecha.
 */
import fs from "node:fs"
import path from "node:path"

const ARQ = "data/pdfs/candidatos/the-complete-guide-to-runes-an-essential-reference-for-runelore-meanings-divination-and-magic.pdf"
const SAIDA = path.join(process.cwd(), "lib", "oracles", "runas-fichas.ts")
const FONTE = "Wayne Brekke, The Complete Guide to Runes (Rockridge Press, 2023)"

if (!fs.existsSync(ARQ)) { console.error(`[extrair-brekke] ${ARQ} não encontrado`); process.exit(1) }
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(ARQ)), useSystemFonts: true }).promise
const paginas = []
for (let p = 1; p <= doc.numPages; p++) paginas.push((await (await doc.getPage(p)).getTextContent()).items.map((i) => i.str).join(" "))
const texto = paginas.join("\n")
const limpa = (s) => s.replace(/\s+/g, " ").trim()

// posição → número de página, para citar a fonte
const limites = []
{ let acc = 0; for (const p of paginas) { acc += p.length + 1; limites.push(acc) } }
const paginaDe = (pos) => limites.findIndex((x) => x >= pos) + 1

// ── as fichas: cada uma abre com "PRONUNCIATION:" e o nome vem antes ──────
const marcas = [...texto.matchAll(/PRONUNCIATION\s*:/g)].map((m) => m.index)
const CAMPOS = "PRONUNCIATION|ALSO KNOWN AS|SOUND|TRANSLATION|KEYWORDS|TAROT"
const campo = (corpo, nome) => {
  const re = new RegExp(`${nome}\\s*:\\s*([\\s\\S]*?)(?=\\s(?:${CAMPOS})\\s*:|$)`)
  const m = corpo.match(re)
  return m ? limpa(m[1]) : ""
}
/**
 * KEYWORDS É O ÚLTIMO MARCADOR DA FICHA, então o lookahead acima não encontra
 * fim e engole a prosa inteira — 2 mil a 2,9 mil caracteres em vez da lista.
 * A fonte não põe pontuação entre a lista e a prosa:
 *
 *   "KEYWORDS: energy, light, power, sun, and sunlight Sowilo is the rune…"
 *   "KEYWORDS: abundance, cattle, …, generosity, and wealth In ancient times…"
 *
 * Cortar no nome da runa não serve: a prosa do Fehu abre com "In ancient
 * times". Cortar na primeira maiúscula também não: as keywords do Ansuz
 * incluem "Loki" e "Odin". O que nunca acontece DENTRO de uma lista separada
 * por vírgula é "minúscula espaço Maiúscula" — numa lista, a maiúscula vem
 * sempre depois de vírgula ou de "and". É essa a fronteira.
 */
const keywordsDe = (corpo) => {
  const bruto = campo(corpo, "KEYWORDS")
  const m = bruto.match(/^([\s\S]*?[a-z])\s+[A-Z]/)
  return limpa(m ? m[1] : bruto)
}

/** declara que a runa NÃO tem reversão */
const NEGA = [
  /has no reversed (?:meaning|interpretation|position)/i,
  /there is no reverse (?:meaning|position)/i,
  /not have a reversed (?:position|meaning)/i,
  /does not have a reversed/i,
  /no reverse (?:meaning|position)\b/i,
  /no reverse for/i,
  /never in reverse/i,
]
/** oferece um sentido invertido */
const DA = [
  /\brevers(?:ed|e)\b[^.]{0,30}\b(?:indicat|sugges|may|can|could|point|shows|lets|is\b)/i,
  /^revers(?:ed|e),/i,
  /\bif\b[^.]{0,30}\brevers/i,
  /\bin (?:a|the) revers(?:ed|e) position\b/i,
  /\bwhen\b[^.]{0,30}\bappears revers/i,
]
// a abertura do Capítulo Cinco fala do ÆTT, não de uma runa; ela encosta no
// fim do bloco da Wunjo e precisa ser descartada
const DO_AETT = /Many of these runes have no reversed meaning/i

const fichas = []
for (const [k, pos] of marcas.entries()) {
  const antes = limpa(texto.slice(Math.max(0, pos - 90), pos))
  const nomeFonte = (antes.match(/([A-ZÆÞ][a-zæþ’']+)\s*$/) || [])[1] || antes.split(/\s+/).pop()
  const fim = k + 1 < marcas.length ? marcas[k + 1] - 90 : Math.min(texto.length, pos + 7000)
  const corpo = limpa(texto.slice(pos, fim))
  const frases = corpo.split(/(?<=[.!?])\s+/)
  const comRevers = frases.filter((s) => /\brevers/i.test(s) && !DO_AETT.test(s))
  const nega = comRevers.some((s) => NEGA.some((re) => re.test(s)))
  const da = !nega && comRevers.some((s) => DA.some((re) => re.test(s)))
  // base: a prosa sem as frases de reversão (para o campo não repetir o outro)
  // e SEM as frases que falam da runa em branco. A fonte diz, na ficha do
  // Pertho, que ele substitui a Wyrd para quem não usa a peça lisa — texto
  // fiel, mas sobre um mecanismo que o produto não tem. Mandá-lo ao modelo
  // convidaria a citar uma 25ª peça que não existe no nosso sorteio. Mesma
  // decisão tomada com as seções "MENSAGEM:" do Ben-Dov.
  const semWyrd = frases.filter((s) => !/\bwyrd\b|\bblank stave\b|\bblank rune\b/i.test(s))
  const cortadasPorWyrd = frases.length - semWyrd.length
  const base = limpa(semWyrd.filter((s) => !/\brevers/i.test(s)).join(" ").replace(new RegExp(`^(?:${CAMPOS})\\s*:[\\s\\S]*?KEYWORDS\\s*:\\s*`), ""))
  fichas.push({
    nomeFonte,
    pagina: paginaDe(pos),
    aliases: campo(corpo, "ALSO KNOWN AS").split(/,\s*|\s+(?:and|or)\s+/).map((x) => x.trim()).filter(Boolean),
    traducao: campo(corpo, "TRANSLATION"),
    keywords: keywordsDe(corpo).split(/,\s*|\s+and\s+/).map((x) => x.trim()).filter(Boolean),
    base: base.slice(0, 900),
    cortadasPorWyrd,
    reversed: da ? limpa(comRevers.join(" ")) : "",
    reversaoNaFonte: da,
    declaraSemReversao: nega,
  })
}

// ── Hagalaz: a negação está na ficha da Isa ───────────────────────────────
const isa = fichas.find((f) => /^isa$/i.test(f.nomeFonte))
const hagal = fichas.find((f) => /^hagalaz$/i.test(f.nomeFonte))
const ISA_CITA_HAGAL = /much like Nauthiz and Hagal/i
if (hagal && !hagal.declaraSemReversao && isa && ISA_CITA_HAGAL.test(isa.reversed + " " + isa.base + " " + (isa.declaraSemReversao ? "x" : ""))) {
  hagal.declaraSemReversao = true
  hagal.viaOutraFicha = `declarado na ficha de Isa (p${isa.pagina}): "much like Nauthiz and Hagal"`
}
// o teste acima depende de a frase da Isa estar em algum campo; se não estiver,
// a trava de 15/9 abaixo falha e nada é gravado — de propósito
if (hagal && !hagal.declaraSemReversao) {
  const bruto = texto.match(/There is no reverse meaning for Isa[^.]*\./i)
  if (bruto && ISA_CITA_HAGAL.test(bruto[0])) {
    hagal.declaraSemReversao = true
    hagal.viaOutraFicha = `declarado na ficha de Isa (p${isa?.pagina ?? "?"}): ${JSON.stringify(limpa(bruto[0]))}`
  }
}

// ── mapa nome da fonte → id do motor ──────────────────────────────────────
// o livro escreve Gifu, Pertho e Berkana; o nome do nosso motor está no campo
// ALSO KNOWN AS da própria fonte nos três casos, então o mapa é documentado
const PARA_MOTOR = { Gifu: "Gebo", Pertho: "Perthro", Berkana: "Berkano" }
const ORDEM_MOTOR = ["Fehu", "Uruz", "Thurisaz", "Ansuz", "Raidho", "Kenaz", "Gebo", "Wunjo", "Hagalaz",
  "Nauthiz", "Isa", "Jera", "Eihwaz", "Perthro", "Algiz", "Sowilo", "Tiwaz", "Berkano", "Ehwaz",
  "Mannaz", "Laguz", "Ingwaz", "Dagaz", "Othala"]

const saida = []
const erros = []
for (const f of fichas) {
  const nome = PARA_MOTOR[f.nomeFonte] ?? f.nomeFonte
  const id = ORDEM_MOTOR.indexOf(nome)
  if (id < 0) { erros.push(`"${f.nomeFonte}" não corresponde a nenhuma runa do motor`); continue }
  if (/wyrd|blank/i.test(nome)) { erros.push(`"${nome}" é a runa em branco e não deve entrar`); continue }
  saida.push({
    id, nome, nomeFonte: f.nomeFonte, aliases: f.aliases, traducao: f.traducao, keywords: f.keywords,
    base: f.base, reversed: f.reversed, reversaoNaFonte: f.reversaoNaFonte,
    pagina: f.pagina, viaOutraFicha: f.viaOutraFicha,
  })
}
saida.sort((a, b) => a.id - b.id)

// ── travas: nada é gravado se alguma falhar ───────────────────────────────
if (saida.length !== 24) erros.push(`${saida.length} fichas, esperado 24`)
for (const [i, n] of ORDEM_MOTOR.entries()) if (!saida.some((f) => f.id === i)) erros.push(`runa ${i} (${n}) ausente`)
const comRev = saida.filter((f) => f.reversaoNaFonte)
const semRev = saida.filter((f) => !f.reversaoNaFonte)
if (comRev.length !== 15) erros.push(`${comRev.length} com reversão, esperado 15: ${comRev.map((f) => f.nome).join(", ")}`)
if (semRev.length !== 9) erros.push(`${semRev.length} sem reversão, esperado 9: ${semRev.map((f) => f.nome).join(", ")}`)
const nauthiz = saida.find((f) => f.nome === "Nauthiz")
if (!nauthiz) erros.push("Nauthiz ausente")
else if (nauthiz.reversaoNaFonte) erros.push(`Nauthiz saiu COM reversão; a fonte (p${nauthiz.pagina}) diz "has no reversed interpretation"`)
for (const f of saida) {
  if (/\u0000/.test(f.base + f.reversed)) erros.push(`${f.nome}: NUL no texto`)
  if (f.reversaoNaFonte && f.reversed.length < 20) erros.push(`${f.nome}: marcada com reversão mas o texto tem ${f.reversed.length} chars`)
  if (!f.reversaoNaFonte && f.reversed) erros.push(`${f.nome}: marcada SEM reversão mas tem texto de reversão`)
  if (f.base.length < 60) erros.push(`${f.nome}: base com só ${f.base.length} chars`)
  if (!f.aliases.length) erros.push(`${f.nome}: sem aliases`)
  // os campos curtos têm de ser curtos: KEYWORDS é o último marcador da ficha
  // e já engoliu a prosa inteira uma vez, sem nada reclamar
  const kw = f.keywords.join(", ")
  if (!f.keywords.length) erros.push(`${f.nome}: sem keywords`)
  if (kw.length > 200) erros.push(`${f.nome}: keywords com ${kw.length} chars — a prosa vazou para o campo`)
  if (f.traducao.length > 120) erros.push(`${f.nome}: traducao com ${f.traducao.length} chars`)
  if (f.aliases.join(", ").length > 120) erros.push(`${f.nome}: aliases com ${f.aliases.join(", ").length} chars`)
  if (/wyrd|blank/i.test(f.nome) || /wyrd|blank/i.test(f.nomeFonte)) erros.push(`${f.nome}: é a runa em branco`)
  if (/wyrd/i.test(f.base + f.reversed)) erros.push(`${f.nome}: a runa em branco sobrou no texto enviado`)
}
// os três nomes divergentes devem trazer o nome do motor entre os aliases
for (const [fonte, motor] of Object.entries(PARA_MOTOR)) {
  const f = saida.find((x) => x.nomeFonte === fonte)
  if (!f) { erros.push(`ficha "${fonte}" não encontrada`); continue }
  if (!f.aliases.some((a) => a.toLowerCase() === motor.toLowerCase())) {
    erros.push(`"${fonte}" → "${motor}": o nome do motor NÃO está nos aliases da fonte (${f.aliases.join(", ")}); o mapa deixaria de ser documentado`)
  }
}
if (erros.length) {
  console.error(`[extrair-brekke] FALHOU, nada foi gravado:`)
  for (const e of erros) console.error(`  - ${e}`)
  process.exit(1)
}

const ts = `/**
 * GERADO POR scripts/extrair-brekke.mjs — NÃO EDITAR À MÃO.
 *
 * Fichas das 24 runas do Elder Futhark, de ${FONTE}.
 * Extraído em ${new Date().toISOString().slice(0, 10)}.
 *
 * \`reversaoNaFonte\` é DOUTRINA, não geometria: diz se o livro oferece um
 * sentido invertido para aquela runa. São 15 que oferecem e 9 que declaram
 * explicitamente não ter. Não confundir com a flag \`reversible\` de
 * lib/oracles/draw.ts, que existe para preservar o consumo do RNG das leituras
 * já geradas — ver o comentário lá.
 *
 * A runa em branco (Wyrd) fica de fora: a fonte a trata como adição moderna e
 * "not an actual rune".
 */
export type FichaDeRuna = {
  /** índice em RUNES de lib/oracles/draw.ts */
  id: number
  /** nome como o motor o escreve */
  nome: string
  /** nome como a fonte o escreve (Gifu, Pertho e Berkana divergem) */
  nomeFonte: string
  aliases: string[]
  traducao: string
  keywords: string[]
  base: string
  /** vazio nas 9 que a fonte declara sem reversão */
  reversed: string
  reversaoNaFonte: boolean
  pagina: number
  /** preenchido quando a declaração está na ficha de OUTRA runa */
  viaOutraFicha?: string
}

export const RUNAS_FONTE = ${JSON.stringify(FONTE)}

export const RUNAS_FICHAS: FichaDeRuna[] = ${JSON.stringify(saida, null, 1)}
`
fs.writeFileSync(SAIDA, ts, "utf8")
console.log(`[extrair-brekke] 24 fichas gravadas em ${path.relative(process.cwd(), SAIDA)}`)
console.log(`  com reversão (15): ${comRev.map((f) => `${f.nome} p${f.pagina}`).join(" · ")}`)
console.log(`  sem reversão  (9): ${semRev.map((f) => `${f.nome} p${f.pagina}`).join(" · ")}`)
if (hagal?.viaOutraFicha) console.log(`  Hagalaz: ${hagal.viaOutraFicha}`)
const comCorte = fichas.filter((f) => f.cortadasPorWyrd > 0)
if (comCorte.length) console.log(`  frases sobre a runa em branco removidas: ${comCorte.map((f) => `${f.nomeFonte} (${f.cortadasPorWyrd})`).join(", ")}`)
