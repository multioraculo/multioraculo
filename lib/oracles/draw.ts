/**
 * Sorteio real dos cinco oráculos.
 *
 * Toda a aleatoriedade acontece aqui, em código, ANTES de qualquer chamada ao
 * modelo de linguagem. O modelo recebe os símbolos como entrada fixa e apenas
 * interpreta. Nenhum resultado depende do texto da pergunta.
 *
 * O seed é gerado com o gerador criptográfico do Node e alimenta um PRNG
 * (sfc32) de boa qualidade estatística, para que uma tiragem possa ser
 * reproduzida a partir do seed registrado.
 */

import { randomBytes } from "crypto"

// ---------------------------------------------------------------------------
// RNG
// ---------------------------------------------------------------------------

export type Rng = {
  /** inteiro uniforme em [0, n) sem viés de módulo */
  int: (n: number) => number
  /** booleano com p = 0.5 */
  bool: () => boolean
  /** embaralha uma cópia (Fisher–Yates) */
  shuffle: <T>(arr: readonly T[]) => T[]
}

export function newSeed(): string {
  return randomBytes(16).toString("hex")
}

// cyrb128: transforma uma string em 4 palavras de 32 bits para semear o sfc32
function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0]
}

export function makeRng(seed: string): Rng {
  let [a, b, c, d] = cyrb128(seed)

  const next32 = (): number => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0
    let t = (a + b) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    d = (d + 1) | 0
    t = (t + d) | 0
    c = (c + t) | 0
    return t >>> 0
  }

  // descarta os primeiros valores (aquecimento do estado)
  for (let i = 0; i < 20; i++) next32()

  const int = (n: number): number => {
    if (!Number.isInteger(n) || n <= 0) throw new Error(`int(${n}) inválido`)
    // rejection sampling: evita viés de módulo
    const limit = Math.floor(0x100000000 / n) * n
    let x = next32()
    while (x >= limit) x = next32()
    return x % n
  }

  const bool = () => (next32() & 1) === 1

  const shuffle = <T,>(arr: readonly T[]): T[] => {
    const out = arr.slice()
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(i + 1)
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  return { int, bool, shuffle }
}

// ---------------------------------------------------------------------------
// Tipos comuns
// ---------------------------------------------------------------------------

export type DrawItem = {
  position: string
  name: string
  /** termos usados para buscar trechos nos PDFs sobre este símbolo */
  searchTerms: string[]
}

export type OracleDraw = {
  items: DrawItem[]
  /** resumo curto, exibido no cliente como draw.notes */
  notes: string
  /** descrição completa da tiragem para o prompt do modelo */
  description: string
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

// ---------------------------------------------------------------------------
// TARÔ — Cruz Celta, 78 cartas (Marselha)
// ---------------------------------------------------------------------------

const MAJOR_ARCANA = [
  "O Louco", "O Mago", "A Papisa", "A Imperatriz", "O Imperador", "O Papa",
  "Os Enamorados", "O Carro", "A Justiça", "O Eremita", "A Roda da Fortuna",
  "A Força", "O Enforcado", "A Morte", "A Temperança", "O Diabo", "A Torre",
  "A Estrela", "A Lua", "O Sol", "O Julgamento", "O Mundo",
]
const SUITS = ["Copas", "Espadas", "Paus", "Ouros"]
const RANKS = ["Ás", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito",
  "Nove", "Dez", "Valete", "Cavaleiro", "Rainha", "Rei"]

export const TAROT_DECK: Array<{ name: string; terms: string[] }> = [
  ...MAJOR_ARCANA.map((n, i) => ({
    name: n,
    terms: [n.replace(/^(O|A|Os|As) /, ""), `arcano ${i}`],
  })),
  ...SUITS.flatMap((s) =>
    RANKS.map((r) => ({ name: `${r} de ${s}`, terms: [`${r} de ${s}`, s, r] }))
  ),
]

export const CELTIC_CROSS = [
  "Situação central", "O que cruza", "Fundamento", "Passado recente",
  "Coroamento possível", "Futuro próximo", "Como o consulente se vê",
  "Influências externas", "Esperanças ou medos", "Resultado final",
]

export function drawTarot(rng: Rng): OracleDraw {
  const deck = rng.shuffle(TAROT_DECK)
  const items: DrawItem[] = CELTIC_CROSS.map((position, i) => {
    const card = deck[i]
    const reversed = rng.bool()
    return {
      position,
      name: reversed ? `${card.name} invertida` : card.name,
      searchTerms: card.terms,
    }
  })
  const majors = items.filter((it) => MAJOR_ARCANA.some((m) => it.name.startsWith(m))).length
  const reversed = items.filter((it) => it.name.endsWith("invertida")).length
  const suitCount: Record<string, number> = {}
  for (const it of items) for (const s of SUITS) if (it.name.includes(` de ${s}`)) suitCount[s] = (suitCount[s] || 0) + 1
  const dominant = Object.entries(suitCount).sort((a, b) => b[1] - a[1])[0]
  const notes = [
    `${majors} arcanos maiores`,
    `${reversed} invertidas`,
    dominant && dominant[1] >= 3 ? `predominância de ${dominant[0]}` : null,
  ].filter(Boolean).join(" · ")

  const description =
    `Cruz Celta, 10 cartas sorteadas de um baralho de 78 (Tarô de Marselha), sem reposição, ` +
    `cada carta com 50% de chance de sair invertida.\n` +
    items.map((it, i) => `${i + 1}. ${it.position}: ${it.name}`).join("\n") +
    `\nPadrão: ${notes}.`
  return { items, notes, description }
}

// ---------------------------------------------------------------------------
// I CHING — três moedas, hexagrama principal, linhas mutantes, resultante
// ---------------------------------------------------------------------------

type Trigram = { key: string; pinyin: string; name: string; attr: string }
// key = três linhas de baixo para cima, 1 = yang, 0 = yin
const TRIGRAMS: Trigram[] = [
  { key: "111", pinyin: "Qian", name: "Céu", attr: "o criativo, força" },
  { key: "110", pinyin: "Dui", name: "Lago", attr: "a alegria, serenidade" },
  { key: "101", pinyin: "Li", name: "Fogo", attr: "o aderir, clareza" },
  { key: "100", pinyin: "Zhen", name: "Trovão", attr: "o incitar, movimento" },
  { key: "011", pinyin: "Xun", name: "Vento", attr: "o suave, penetração" },
  { key: "010", pinyin: "Kan", name: "Água", attr: "o abismal, perigo" },
  { key: "001", pinyin: "Gen", name: "Montanha", attr: "a quietude, repouso" },
  { key: "000", pinyin: "Kun", name: "Terra", attr: "o receptivo, devoção" },
]

// Tabela King Wen: KING_WEN[inferior][superior], ordem dos trigramas acima
// (Qian, Dui, Li, Zhen, Xun, Kan, Gen, Kun)
const KING_WEN: number[][] = [
  /* Qian */ [1, 43, 14, 34, 9, 5, 26, 11],
  /* Dui  */ [10, 58, 38, 54, 61, 60, 41, 19],
  /* Li   */ [13, 49, 30, 55, 37, 63, 22, 36],
  /* Zhen */ [25, 17, 21, 51, 42, 3, 27, 24],
  /* Xun  */ [44, 28, 50, 32, 57, 48, 18, 46],
  /* Kan  */ [6, 47, 64, 40, 59, 29, 4, 7],
  /* Gen  */ [33, 31, 56, 62, 53, 39, 52, 15],
  /* Kun  */ [12, 45, 35, 16, 20, 8, 23, 2],
]

// nomes em inglês (Wilhelm), usados só para localizar trechos no manual em inglês
const HEXAGRAMS_EN = ["The Creative","The Receptive","Difficulty at the Beginning","Youthful Folly","Waiting","Conflict","The Army","Holding Together","Small Taming","Treading","Peace","Standstill","Fellowship","Great Possession","Modesty","Enthusiasm","Following","Work on the Decayed","Approach","Contemplation","Biting Through","Grace","Splitting Apart","Return","Innocence","Great Taming","Nourishment","Great Preponderance","The Abysmal","The Clinging","Influence","Duration","Retreat","Great Power","Progress","Darkening of the Light","The Family","Opposition","Obstruction","Deliverance","Decrease","Increase","Breakthrough","Coming to Meet","Gathering Together","Pushing Upward","Oppression","The Well","Revolution","The Cauldron","The Arousing","Keeping Still","Development","The Marrying Maiden","Abundance","The Wanderer","The Gentle","The Joyous","Dispersion","Limitation","Inner Truth","Small Preponderance","After Completion","Before Completion"]

export const HEXAGRAMS: Array<{ pinyin: string; name: string }> = [
  { pinyin: "Qian", name: "O Criativo" },
  { pinyin: "Kun", name: "O Receptivo" },
  { pinyin: "Zhun", name: "A Dificuldade Inicial" },
  { pinyin: "Meng", name: "A Insensatez Juvenil" },
  { pinyin: "Xu", name: "A Espera" },
  { pinyin: "Song", name: "O Conflito" },
  { pinyin: "Shi", name: "O Exército" },
  { pinyin: "Bi", name: "A União" },
  { pinyin: "Xiao Chu", name: "O Poder de Domar do Pequeno" },
  { pinyin: "Lü", name: "A Conduta" },
  { pinyin: "Tai", name: "A Paz" },
  { pinyin: "Pi", name: "A Estagnação" },
  { pinyin: "Tong Ren", name: "Comunidade com os Homens" },
  { pinyin: "Da You", name: "A Grande Posse" },
  { pinyin: "Qian", name: "A Modéstia" },
  { pinyin: "Yu", name: "O Entusiasmo" },
  { pinyin: "Sui", name: "O Seguir" },
  { pinyin: "Gu", name: "Trabalho sobre o que se Deteriorou" },
  { pinyin: "Lin", name: "A Aproximação" },
  { pinyin: "Guan", name: "A Contemplação" },
  { pinyin: "Shi He", name: "Morder Através" },
  { pinyin: "Bi", name: "A Graça" },
  { pinyin: "Bo", name: "A Desintegração" },
  { pinyin: "Fu", name: "O Retorno" },
  { pinyin: "Wu Wang", name: "A Inocência" },
  { pinyin: "Da Chu", name: "O Poder de Domar do Grande" },
  { pinyin: "Yi", name: "Os Cantos da Boca" },
  { pinyin: "Da Guo", name: "A Preponderância do Grande" },
  { pinyin: "Kan", name: "O Abismal" },
  { pinyin: "Li", name: "O Aderir" },
  { pinyin: "Xian", name: "A Influência" },
  { pinyin: "Heng", name: "A Duração" },
  { pinyin: "Dun", name: "A Retirada" },
  { pinyin: "Da Zhuang", name: "O Poder do Grande" },
  { pinyin: "Jin", name: "O Progresso" },
  { pinyin: "Ming Yi", name: "O Obscurecimento da Luz" },
  { pinyin: "Jia Ren", name: "A Família" },
  { pinyin: "Kui", name: "A Oposição" },
  { pinyin: "Jian", name: "O Impedimento" },
  { pinyin: "Jie", name: "A Libertação" },
  { pinyin: "Sun", name: "A Diminuição" },
  { pinyin: "Yi", name: "O Aumento" },
  { pinyin: "Guai", name: "A Resolução" },
  { pinyin: "Gou", name: "Vir ao Encontro" },
  { pinyin: "Cui", name: "A Reunião" },
  { pinyin: "Sheng", name: "O Impulso para Cima" },
  { pinyin: "Kun", name: "A Opressão" },
  { pinyin: "Jing", name: "O Poço" },
  { pinyin: "Ge", name: "A Revolução" },
  { pinyin: "Ding", name: "O Caldeirão" },
  { pinyin: "Zhen", name: "O Incitar" },
  { pinyin: "Gen", name: "A Quietude" },
  { pinyin: "Jian", name: "O Desenvolvimento" },
  { pinyin: "Gui Mei", name: "A Jovem que se Casa" },
  { pinyin: "Feng", name: "A Abundância" },
  { pinyin: "Lü", name: "O Andarilho" },
  { pinyin: "Xun", name: "A Suavidade" },
  { pinyin: "Dui", name: "A Alegria" },
  { pinyin: "Huan", name: "A Dissolução" },
  { pinyin: "Jie", name: "A Limitação" },
  { pinyin: "Zhong Fu", name: "A Verdade Interior" },
  { pinyin: "Xiao Guo", name: "A Preponderância do Pequeno" },
  { pinyin: "Ji Ji", name: "Após a Conclusão" },
  { pinyin: "Wei Ji", name: "Antes da Conclusão" },
]

function trigramOf(bits: number[]): Trigram {
  const key = bits.join("")
  const t = TRIGRAMS.find((x) => x.key === key)
  if (!t) throw new Error(`trigrama desconhecido ${key}`)
  return t
}

/** bits de baixo para cima (6 valores 0/1) → número King Wen */
export function hexagramNumber(bits: number[]): number {
  const lower = trigramOf(bits.slice(0, 3))
  const upper = trigramOf(bits.slice(3, 6))
  const li = TRIGRAMS.indexOf(lower)
  const ui = TRIGRAMS.indexOf(upper)
  return KING_WEN[li][ui]
}

function hexLabel(n: number) {
  const h = HEXAGRAMS[n - 1]
  return `${n}. ${h.name}`
}

function hexTerms(n: number) {
  const h = HEXAGRAMS[n - 1]
  return [
    h.pinyin,
    h.name.replace(/^(O|A|Os|As) /, ""),
    HEXAGRAMS_EN[n - 1].replace(/^The /, ""),
    `hexagrama ${n}`,
    `hexagram ${n}`,
  ]
}

function ordinal(n: number) {
  return ["primeira", "segunda", "terceira", "quarta", "quinta", "sexta"][n - 1]
}

export function drawIChing(rng: Rng): OracleDraw {
  // três moedas: cara = 3, coroa = 2; soma 6 (yin mutante), 7 (yang), 8 (yin), 9 (yang mutante)
  const lines: number[] = []
  for (let i = 0; i < 6; i++) {
    let sum = 0
    for (let c = 0; c < 3; c++) sum += rng.bool() ? 3 : 2
    lines.push(sum)
  }
  const bits = lines.map((v) => (v === 7 || v === 9 ? 1 : 0))
  const moving = lines.map((v, i) => (v === 6 || v === 9 ? i + 1 : 0)).filter(Boolean)
  const primary = hexagramNumber(bits)
  const lower = trigramOf(bits.slice(0, 3))
  const upper = trigramOf(bits.slice(3, 6))

  const items: DrawItem[] = [
    { position: "Hexagrama principal", name: hexLabel(primary), searchTerms: hexTerms(primary) },
  ]
  for (const n of moving) {
    const v = lines[n - 1]
    items.push({
      position: `Linha ${n} mutante`,
      name: v === 9
        ? `Nove na ${ordinal(n)} posição (yang → yin)`
        : `Seis na ${ordinal(n)} posição (yin → yang)`,
      searchTerms: [v === 9 ? "nove" : "seis", `${ordinal(n)} posição`, ...hexTerms(primary)],
    })
  }
  let resulting: number | null = null
  if (moving.length > 0) {
    const rbits = bits.map((b, i) => (moving.includes(i + 1) ? 1 - b : b))
    resulting = hexagramNumber(rbits)
    items.push({ position: "Hexagrama resultante", name: hexLabel(resulting), searchTerms: hexTerms(resulting) })
  }

  const notes = resulting
    ? `Hex. ${primary} → ${resulting} (linhas mutantes: ${moving.join(", ")})`
    : `Hex. ${primary}, sem linhas mutantes`

  const description =
    `Método das três moedas, seis lançamentos (de baixo para cima).\n` +
    `Valores das linhas: ${lines.join(" ")} (6 = yin mutante, 7 = yang, 8 = yin, 9 = yang mutante).\n` +
    `Hexagrama principal: ${hexLabel(primary)} (${HEXAGRAMS[primary - 1].pinyin}). ` +
    `Trigrama inferior: ${lower.pinyin} — ${lower.name} (${lower.attr}). ` +
    `Trigrama superior: ${upper.pinyin} — ${upper.name} (${upper.attr}).\n` +
    (moving.length
      ? `Linhas mutantes: ${moving.join(", ")}.\nHexagrama resultante: ${hexLabel(resulting!)} (${HEXAGRAMS[resulting! - 1].pinyin}).`
      : `Sem linhas mutantes: não há hexagrama resultante; leia apenas o Julgamento e a Imagem.`)
  return { items, notes, description }
}

// ---------------------------------------------------------------------------
// RUNAS — Futhark Antigo, mapa de 9 forças
// ---------------------------------------------------------------------------

export const RUNES: Array<{ name: string; glyph: string; reversible: boolean }> = [
  { name: "Fehu", glyph: "ᚠ", reversible: true },
  { name: "Uruz", glyph: "ᚢ", reversible: true },
  { name: "Thurisaz", glyph: "ᚦ", reversible: true },
  { name: "Ansuz", glyph: "ᚨ", reversible: true },
  { name: "Raidho", glyph: "ᚱ", reversible: true },
  { name: "Kenaz", glyph: "ᚲ", reversible: true },
  { name: "Gebo", glyph: "ᚷ", reversible: false },
  { name: "Wunjo", glyph: "ᚹ", reversible: true },
  { name: "Hagalaz", glyph: "ᚺ", reversible: false },
  { name: "Nauthiz", glyph: "ᚾ", reversible: true },
  { name: "Isa", glyph: "ᛁ", reversible: false },
  { name: "Jera", glyph: "ᛃ", reversible: false },
  { name: "Eihwaz", glyph: "ᛇ", reversible: false },
  { name: "Perthro", glyph: "ᛈ", reversible: true },
  { name: "Algiz", glyph: "ᛉ", reversible: true },
  { name: "Sowilo", glyph: "ᛊ", reversible: false },
  { name: "Tiwaz", glyph: "ᛏ", reversible: true },
  { name: "Berkano", glyph: "ᛒ", reversible: true },
  { name: "Ehwaz", glyph: "ᛖ", reversible: true },
  { name: "Mannaz", glyph: "ᛗ", reversible: true },
  { name: "Laguz", glyph: "ᛚ", reversible: true },
  { name: "Ingwaz", glyph: "ᛜ", reversible: false },
  { name: "Dagaz", glyph: "ᛞ", reversible: false },
  { name: "Othala", glyph: "ᛟ", reversible: true },
]

export const RUNE_POSITIONS = [
  "Raiz", "Obstáculo", "Fundamento oculto", "Passado próximo", "Futuro próximo",
  "Caminho", "Sombra", "Proteção", "Resultado",
]

export function drawRunes(rng: Rng): OracleDraw {
  const bag = rng.shuffle(RUNES)
  const items: DrawItem[] = RUNE_POSITIONS.map((position, i) => {
    const r = bag[i]
    const reversed = r.reversible && rng.bool()
    return {
      position,
      name: `${r.name} (${r.glyph})${reversed ? " invertida" : ""}`,
      searchTerms: [r.name],
    }
  })
  const reversed = items.filter((it) => it.name.endsWith("invertida")).length
  const notes = `9 runas de 24, ${reversed} invertida${reversed === 1 ? "" : "s"}`
  const description =
    `Mapa de 9 forças: 9 runas sorteadas de um saco com as 24 runas do Futhark Antigo, sem reposição. ` +
    `Runas reversíveis saem invertidas com 50% de chance; Gebo, Hagalaz, Isa, Jera, Eihwaz, Sowilo, Ingwaz e Dagaz não têm posição invertida.\n` +
    items.map((it, i) => `${i + 1}. ${it.position}: ${it.name}`).join("\n")
  return { items, notes, description }
}

// ---------------------------------------------------------------------------
// BÚZIOS — 16 conchas, Odu pela contagem de búzios abertos
// ---------------------------------------------------------------------------

export const ODUS: string[] = [
  "Opirá",          // 0
  "Okanran",        // 1
  "Ejiokô",         // 2
  "Etaogundá",      // 3
  "Irosun",         // 4
  "Oxê",            // 5
  "Obará",          // 6
  "Odi",            // 7
  "Ejionile",       // 8
  "Ossá",           // 9
  "Ofun",           // 10
  "Owanrin",        // 11
  "Ejilaxeborá",    // 12
  "Ejiologbon",     // 13
  "Iká",            // 14
  "Obeogundá",      // 15
  "Alafia",         // 16
]

function throwShells(rng: Rng): number {
  let open = 0
  for (let i = 0; i < 16; i++) if (rng.bool()) open++
  return open
}

export function drawBuzios(rng: Rng): OracleDraw {
  const first = throwShells(rng)
  const second = throwShells(rng)
  const label = (n: number) => `${n} búzios abertos — ${ODUS[n]}`
  const items: DrawItem[] = [
    { position: "Odu principal", name: label(first), searchTerms: [ODUS[first], `${first} búzios`] },
    { position: "Segunda queda (confirmação)", name: label(second), searchTerms: [ODUS[second], `${second} búzios`] },
  ]
  const notes = `${ODUS[first]} (${first}) · confirmação ${ODUS[second]} (${second})`
  const description =
    `Jogo de 16 búzios (merindilogun). Cada concha cai aberta ou fechada com igual probabilidade; ` +
    `o Odu é dado pelo número de búzios abertos.\n` +
    `Primeira queda (Odu principal): ${label(first)}.\n` +
    `Segunda queda (confirmação / aspecto complementar): ${label(second)}.\n` +
    `Observação: 0 abertos = Opirá (jogo fechado); 16 abertos = Alafia.`
  return { items, notes, description }
}

// ---------------------------------------------------------------------------
// LENORMAND — 36 cartas, mesa 3×3
// ---------------------------------------------------------------------------

// nomes em inglês, usados só para localizar trechos nos manuais em inglês
const LENORMAND_EN = ["Rider","Clover","Ship","House","Tree","Clouds","Snake","Coffin","Bouquet","Scythe","Whip","Birds","Child","Fox","Bear","Stars","Stork","Dog","Tower","Garden","Mountain","Crossroads","Mice","Heart","Ring","Book","Letter","Man","Woman","Lily","Sun","Moon","Key","Fish","Anchor","Cross"]

export const LENORMAND_DECK = [
  "Cavaleiro", "Trevo", "Navio", "Casa", "Árvore", "Nuvens", "Serpente", "Caixão",
  "Buquê", "Foice", "Chicote", "Pássaros", "Criança", "Raposa", "Urso", "Estrelas",
  "Cegonha", "Cão", "Torre", "Jardim", "Montanha", "Caminhos", "Ratos", "Coração",
  "Anel", "Livro", "Carta", "Homem", "Mulher", "Lírios", "Sol", "Lua", "Chave",
  "Peixes", "Âncora", "Cruz",
].map((name, i) => ({ number: i + 1, name, en: LENORMAND_EN[i] }))

// ordem de leitura linha a linha; o centro é o 5º item
export const LENORMAND_POSITIONS = [
  "Canto sup. esq.", "Acima", "Canto sup. dir.",
  "Esquerda", "Centro", "Direita",
  "Canto inf. esq.", "Abaixo", "Canto inf. dir.",
]

export function drawLenormand(rng: Rng): OracleDraw {
  const deck = rng.shuffle(LENORMAND_DECK)
  const items: DrawItem[] = LENORMAND_POSITIONS.map((position, i) => {
    const c = deck[i]
    return { position, name: `${c.number} — ${c.name}`, searchTerms: [c.name, c.en] }
  })
  const center = items[4]
  const notes = `Centro: ${center.name}`
  const description =
    `Mesa de 9 cartas (quadrado 3×3), sorteadas de um baralho de 36 sem reposição. ` +
    `Disposição linha a linha:\n` +
    `[${items[0].name}] [${items[1].name}] [${items[2].name}]\n` +
    `[${items[3].name}] [${items[4].name}] [${items[5].name}]\n` +
    `[${items[6].name}] [${items[7].name}] [${items[8].name}]\n` +
    `Carta central (tema dominante): ${center.name}.`
  return { items, notes, description }
}

// ---------------------------------------------------------------------------
// Tiragem simultânea
// ---------------------------------------------------------------------------

export type OracleKey = "tarot" | "iching" | "runas" | "buzios" | "lenormand"

/**
 * Realiza as cinco tiragens de uma vez. Cada oráculo recebe seu próprio RNG
 * derivado do seed, de modo que o resultado de um nunca influencia o outro e
 * cada tiragem é reproduzível isoladamente.
 */
export function drawAll(seed: string): Record<OracleKey, OracleDraw> {
  return {
    tarot: drawTarot(makeRng(`${seed}:tarot`)),
    iching: drawIChing(makeRng(`${seed}:iching`)),
    runas: drawRunes(makeRng(`${seed}:runas`)),
    buzios: drawBuzios(makeRng(`${seed}:buzios`)),
    lenormand: drawLenormand(makeRng(`${seed}:lenormand`)),
  }
}

/** termos de busca normalizados de todos os itens de uma tiragem */
export function searchTermsOf(draw: OracleDraw): string[] {
  const set = new Set<string>()
  for (const it of draw.items) for (const t of it.searchTerms) {
    const n = norm(t).trim()
    if (n.length >= 3) set.add(n)
  }
  return Array.from(set)
}
