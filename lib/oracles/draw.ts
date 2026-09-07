/**
 * Sorteio real dos cinco oráculos.
 *
 * Toda a aleatoriedade acontece aqui, em código, ANTES de qualquer chamada ao
 * modelo de linguagem. O modelo recebe os símbolos como entrada fixa e apenas
 * interpreta. Nenhum resultado depende do texto da pergunta nem do idioma.
 *
 * Este módulo produz apenas DADOS ESTRUTURADOS (índices, números, flags). Os
 * nomes e textos em cada idioma são gerados por `localize.ts`, para que a
 * lógica do sorteio exista uma única vez, independente de idioma.
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

export type OracleKey = "tarot" | "iching" | "runas" | "buzios" | "lenormand"

/** Identidade de um símbolo sorteado, independente de idioma */
export type Sym =
  | { kind: "tarot"; card: number; reversed: boolean } // índice em TAROT_DECK (0–77)
  | { kind: "hexagram"; number: number; role: "primary" | "resulting" } // King Wen 1–64
  | { kind: "line"; n: number; value: 6 | 9 } // linha mutante (1–6, de baixo para cima)
  | { kind: "rune"; index: number; reversed: boolean } // índice em RUNES (0–23)
  | { kind: "odu"; open: number; throwIndex: 1 | 2 } // búzios abertos (0–16)
  | { kind: "lenormand"; card: number } // índice em LENORMAND_DECK (0–35)

export type DrawItem = {
  /** chave da posição no método (ex.: "cc3" = 4ª posição da Cruz Celta) */
  positionKey: string
  sym: Sym
  /** termos usados para buscar trechos nos PDFs sobre este símbolo (pt + en) */
  searchTerms: string[]
}

export type TarotMeta = { majors: number; reversed: number; dominantSuit: number | null }
export type IChingMeta = {
  lines: number[]
  bits: number[]
  primary: number
  moving: number[]
  resulting: number | null
  lowerTrigram: number
  upperTrigram: number
}
export type RunesMeta = { reversed: number }
export type BuziosMeta = { first: number; second: number }
export type LenormandMeta = { center: number }

export type OracleDraw =
  | { key: "tarot"; items: DrawItem[]; meta: TarotMeta }
  | { key: "iching"; items: DrawItem[]; meta: IChingMeta }
  | { key: "runas"; items: DrawItem[]; meta: RunesMeta }
  | { key: "buzios"; items: DrawItem[]; meta: BuziosMeta }
  | { key: "lenormand"; items: DrawItem[]; meta: LenormandMeta }

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

// ---------------------------------------------------------------------------
// TARÔ — Cruz Celta, 78 cartas (Marselha). Nomes canônicos em português.
// ---------------------------------------------------------------------------

export const MAJOR_ARCANA = [
  "O Louco", "O Mago", "A Papisa", "A Imperatriz", "O Imperador", "O Papa",
  "Os Enamorados", "O Carro", "A Justiça", "O Eremita", "A Roda da Fortuna",
  "A Força", "O Enforcado", "A Morte", "A Temperança", "O Diabo", "A Torre",
  "A Estrela", "A Lua", "O Sol", "O Julgamento", "O Mundo",
]
export const SUITS = ["Copas", "Espadas", "Paus", "Ouros"]
export const RANKS = ["Ás", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito",
  "Nove", "Dez", "Valete", "Cavaleiro", "Rainha", "Rei"]

// nomes em inglês, usados só para localizar trechos nos manuais em inglês
const MAJOR_ARCANA_EN = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant",
  "The Lovers", "The Chariot", "Justice", "The Hermit", "Wheel of Fortune",
  "Strength", "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower",
  "The Star", "The Moon", "The Sun", "Judgement", "The World",
]
const SUITS_EN = ["Cups", "Swords", "Wands", "Coins"]
const RANKS_EN = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Page", "Knight", "Queen", "King"]

export type TarotCard =
  | { major: number; name: string; terms: string[] }
  | { suit: number; rank: number; name: string; terms: string[] }

/** índice 0–21 = arcanos maiores; 22–77 = menores (naipe × 14 + valor) */
export const TAROT_DECK: TarotCard[] = [
  ...MAJOR_ARCANA.map((n, i) => ({
    major: i,
    name: n,
    terms: [n.replace(/^(O|A|Os|As) /, ""), MAJOR_ARCANA_EN[i].replace(/^The /, ""), `arcano ${i}`],
  })),
  ...SUITS.flatMap((s, si) =>
    RANKS.map((r, ri) => ({
      suit: si,
      rank: ri,
      name: `${r} de ${s}`,
      terms: [`${r} de ${s}`, s, `${RANKS_EN[ri]} of ${SUITS_EN[si]}`, SUITS_EN[si]],
    }))
  ),
]

export const CELTIC_CROSS_COUNT = 10

export function drawTarot(rng: Rng): Extract<OracleDraw, { key: "tarot" }> {
  const order = rng.shuffle(TAROT_DECK.map((_, i) => i))
  const items: DrawItem[] = []
  let majors = 0
  let reversedCount = 0
  const suitCount = [0, 0, 0, 0]
  for (let i = 0; i < CELTIC_CROSS_COUNT; i++) {
    const card = order[i]
    const reversed = rng.bool()
    const c = TAROT_DECK[card]
    if ("major" in c) majors++
    else suitCount[c.suit]++
    if (reversed) reversedCount++
    items.push({ positionKey: `cc${i}`, sym: { kind: "tarot", card, reversed }, searchTerms: c.terms })
  }
  const maxSuit = Math.max(...suitCount)
  const dominantSuit = maxSuit >= 3 ? suitCount.indexOf(maxSuit) : null
  return { key: "tarot", items, meta: { majors, reversed: reversedCount, dominantSuit } }
}

// ---------------------------------------------------------------------------
// I CHING — três moedas, hexagrama principal, linhas mutantes, resultante
// ---------------------------------------------------------------------------

// key = três linhas de baixo para cima, 1 = yang, 0 = yin
export const TRIGRAMS = [
  { key: "111", pinyin: "Qian" },
  { key: "110", pinyin: "Dui" },
  { key: "101", pinyin: "Li" },
  { key: "100", pinyin: "Zhen" },
  { key: "011", pinyin: "Xun" },
  { key: "010", pinyin: "Kan" },
  { key: "001", pinyin: "Gen" },
  { key: "000", pinyin: "Kun" },
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

// nomes em inglês (Wilhelm), usados nos termos de busca e na localização
export const HEXAGRAMS_EN = ["The Creative","The Receptive","Difficulty at the Beginning","Youthful Folly","Waiting","Conflict","The Army","Holding Together","Small Taming","Treading","Peace","Standstill","Fellowship","Great Possession","Modesty","Enthusiasm","Following","Work on the Decayed","Approach","Contemplation","Biting Through","Grace","Splitting Apart","Return","Innocence","Great Taming","Nourishment","Great Preponderance","The Abysmal","The Clinging","Influence","Duration","Retreat","Great Power","Progress","Darkening of the Light","The Family","Opposition","Obstruction","Deliverance","Decrease","Increase","Breakthrough","Coming to Meet","Gathering Together","Pushing Upward","Oppression","The Well","Revolution","The Cauldron","The Arousing","Keeping Still","Development","The Marrying Maiden","Abundance","The Wanderer","The Gentle","The Joyous","Dispersion","Limitation","Inner Truth","Small Preponderance","After Completion","Before Completion"]

/** nomes canônicos em português + pinyin, índice = número King Wen − 1 */
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

function trigramIndex(bits: number[]): number {
  const key = bits.join("")
  const i = TRIGRAMS.findIndex((x) => x.key === key)
  if (i < 0) throw new Error(`trigrama desconhecido ${key}`)
  return i
}

/** bits de baixo para cima (6 valores 0/1) → número King Wen */
export function hexagramNumber(bits: number[]): number {
  return KING_WEN[trigramIndex(bits.slice(0, 3))][trigramIndex(bits.slice(3, 6))]
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

export function drawIChing(rng: Rng): Extract<OracleDraw, { key: "iching" }> {
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

  const items: DrawItem[] = [
    { positionKey: "primary", sym: { kind: "hexagram", number: primary, role: "primary" }, searchTerms: hexTerms(primary) },
  ]
  for (const n of moving) {
    const value = lines[n - 1] as 6 | 9
    items.push({
      positionKey: `line${n}`,
      sym: { kind: "line", n, value },
      searchTerms: [value === 9 ? "nove" : "seis", value === 9 ? "nine" : "six", ...hexTerms(primary)],
    })
  }
  let resulting: number | null = null
  if (moving.length > 0) {
    const rbits = bits.map((b, i) => (moving.includes(i + 1) ? 1 - b : b))
    resulting = hexagramNumber(rbits)
    items.push({
      positionKey: "resulting",
      sym: { kind: "hexagram", number: resulting, role: "resulting" },
      searchTerms: hexTerms(resulting),
    })
  }

  return {
    key: "iching",
    items,
    meta: {
      lines,
      bits,
      primary,
      moving,
      resulting,
      lowerTrigram: trigramIndex(bits.slice(0, 3)),
      upperTrigram: trigramIndex(bits.slice(3, 6)),
    },
  }
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

export const RUNE_POSITIONS_COUNT = 9

export function drawRunes(rng: Rng): Extract<OracleDraw, { key: "runas" }> {
  const order = rng.shuffle(RUNES.map((_, i) => i))
  const items: DrawItem[] = []
  let reversedCount = 0
  for (let i = 0; i < RUNE_POSITIONS_COUNT; i++) {
    const index = order[i]
    const reversed = RUNES[index].reversible && rng.bool()
    if (reversed) reversedCount++
    items.push({ positionKey: `r${i}`, sym: { kind: "rune", index, reversed }, searchTerms: [RUNES[index].name] })
  }
  return { key: "runas", items, meta: { reversed: reversedCount } }
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

export function drawBuzios(rng: Rng): Extract<OracleDraw, { key: "buzios" }> {
  const first = throwShells(rng)
  const second = throwShells(rng)
  const items: DrawItem[] = [
    { positionKey: "main", sym: { kind: "odu", open: first, throwIndex: 1 }, searchTerms: [ODUS[first], `${first} búzios`] },
    { positionKey: "second", sym: { kind: "odu", open: second, throwIndex: 2 }, searchTerms: [ODUS[second], `${second} búzios`] },
  ]
  return { key: "buzios", items, meta: { first, second } }
}

// ---------------------------------------------------------------------------
// LENORMAND — 36 cartas, mesa 3×3
// ---------------------------------------------------------------------------

// nomes em inglês, usados nos termos de busca e na localização
export const LENORMAND_EN = ["Rider","Clover","Ship","House","Tree","Clouds","Snake","Coffin","Bouquet","Scythe","Whip","Birds","Child","Fox","Bear","Stars","Stork","Dog","Tower","Garden","Mountain","Crossroads","Mice","Heart","Ring","Book","Letter","Man","Woman","Lily","Sun","Moon","Key","Fish","Anchor","Cross"]

/** nomes canônicos em português, índice = número da carta − 1 */
export const LENORMAND_DECK = [
  "Cavaleiro", "Trevo", "Navio", "Casa", "Árvore", "Nuvens", "Serpente", "Caixão",
  "Buquê", "Foice", "Chicote", "Pássaros", "Criança", "Raposa", "Urso", "Estrelas",
  "Cegonha", "Cão", "Torre", "Jardim", "Montanha", "Caminhos", "Ratos", "Coração",
  "Anel", "Livro", "Carta", "Homem", "Mulher", "Lírios", "Sol", "Lua", "Chave",
  "Peixes", "Âncora", "Cruz",
].map((name, i) => ({ number: i + 1, name, en: LENORMAND_EN[i] }))

/** ordem de leitura linha a linha; o centro é o índice 4 */
export const LENORMAND_POSITIONS_COUNT = 9

export function drawLenormand(rng: Rng): Extract<OracleDraw, { key: "lenormand" }> {
  const order = rng.shuffle(LENORMAND_DECK.map((_, i) => i))
  const items: DrawItem[] = []
  for (let i = 0; i < LENORMAND_POSITIONS_COUNT; i++) {
    const card = order[i]
    const c = LENORMAND_DECK[card]
    items.push({ positionKey: `l${i}`, sym: { kind: "lenormand", card }, searchTerms: [c.name, c.en] })
  }
  return { key: "lenormand", items, meta: { center: order[4] } }
}

// ---------------------------------------------------------------------------
// Tiragem simultânea
// ---------------------------------------------------------------------------

export type AllDraws = {
  tarot: Extract<OracleDraw, { key: "tarot" }>
  iching: Extract<OracleDraw, { key: "iching" }>
  runas: Extract<OracleDraw, { key: "runas" }>
  buzios: Extract<OracleDraw, { key: "buzios" }>
  lenormand: Extract<OracleDraw, { key: "lenormand" }>
}

/**
 * Realiza as cinco tiragens de uma vez. Cada oráculo recebe seu próprio RNG
 * derivado do seed, de modo que o resultado de um nunca influencia o outro e
 * cada tiragem é reproduzível isoladamente.
 */
export function drawAll(seed: string): AllDraws {
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
