/**
 * Renderiza uma tiragem (dados estruturados de `draw.ts`) em um idioma:
 * nomes dos símbolos, posições, resumo (notes) e descrição para o prompt.
 *
 * A lógica de sorteio nunca é duplicada por idioma: só as tabelas de nomes e
 * as frases-modelo vivem aqui. Para adicionar um idioma, acrescente uma
 * entrada em NAMES e em PHRASES.
 */

import type { Locale } from "@/lib/i18n/config"
import {
  HEXAGRAMS,
  HEXAGRAMS_EN,
  LENORMAND_DECK,
  LENORMAND_EN,
  MAJOR_ARCANA,
  ODUS,
  RANKS,
  RUNES,
  SUITS,
  TAROT_DECK,
  TRIGRAMS,
  type DrawItem,
  type OracleDraw,
  type Sym,
} from "./draw"

export type RenderedItem = { position: string; name: string }
export type RenderedDraw = {
  items: RenderedItem[]
  /** resumo curto, exibido no cliente como draw.notes */
  notes: string
  /** descrição completa da tiragem para o prompt do modelo */
  description: string
}

// ---------------------------------------------------------------------------
// Tabelas de nomes por idioma
// ---------------------------------------------------------------------------

type Names = {
  majors: string[]
  ranks: string[]
  suits: string[]
  /** "Ás de Copas": função que junta valor e naipe */
  minor: (rank: string, suit: string) => string
  reversed: string
  celticCross: string[]
  hexagrams: string[]
  /** nome do hexagrama, sem artigo (para "Hex. 36: Obscurecimento da Luz") */
  trigrams: Array<{ name: string; attr: string }>
  linePosition: string
  lineOrdinals: string[]
  hexPrimary: string
  hexResulting: string
  runePositions: string[]
  oduMain: string
  oduSecond: string
  oduLabel: (open: number, odu: string) => string
  lenormand: string[]
  lenormandPositions: string[]
}

const NAMES: Record<Locale, Names> = {
  pt: {
    majors: MAJOR_ARCANA,
    ranks: RANKS,
    suits: SUITS,
    minor: (r, s) => `${r} de ${s}`,
    reversed: "invertida",
    celticCross: [
      "Situação central", "O que cruza", "Fundamento", "Passado recente",
      "Coroamento possível", "Futuro próximo", "Como o consulente se vê",
      "Influências externas", "Esperanças ou medos", "Resultado final",
    ],
    hexagrams: HEXAGRAMS.map((h) => h.name),
    trigrams: [
      { name: "Céu", attr: "o criativo, força" },
      { name: "Lago", attr: "a alegria, serenidade" },
      { name: "Fogo", attr: "o aderir, clareza" },
      { name: "Trovão", attr: "o incitar, movimento" },
      { name: "Vento", attr: "o suave, penetração" },
      { name: "Água", attr: "o abismal, perigo" },
      { name: "Montanha", attr: "a quietude, repouso" },
      { name: "Terra", attr: "o receptivo, devoção" },
    ],
    linePosition: "Linha {n} mutante",
    lineOrdinals: ["primeira", "segunda", "terceira", "quarta", "quinta", "sexta"],
    hexPrimary: "Hexagrama principal",
    hexResulting: "Hexagrama resultante",
    runePositions: [
      "Raiz", "Obstáculo", "Fundamento oculto", "Passado próximo", "Futuro próximo",
      "Caminho", "Sombra", "Proteção", "Resultado",
    ],
    oduMain: "Odu principal",
    oduSecond: "Segunda queda (confirmação)",
    oduLabel: (n, odu) => `${n} búzios abertos — ${odu}`,
    lenormand: LENORMAND_DECK.map((c) => c.name),
    lenormandPositions: [
      "Canto sup. esq.", "Acima", "Canto sup. dir.",
      "Esquerda", "Centro", "Direita",
      "Canto inf. esq.", "Abaixo", "Canto inf. dir.",
    ],
  },
  en: {
    majors: [
      "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant",
      "The Lovers", "The Chariot", "Justice", "The Hermit", "Wheel of Fortune",
      "Strength", "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower",
      "The Star", "The Moon", "The Sun", "Judgement", "The World",
    ],
    ranks: ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"],
    suits: ["Cups", "Swords", "Wands", "Coins"],
    minor: (r, s) => `${r} of ${s}`,
    reversed: "reversed",
    celticCross: [
      "Present situation", "What crosses it", "Foundation", "Recent past",
      "Possible outcome", "Near future", "How the querent sees themselves",
      "External influences", "Hopes or fears", "Final outcome",
    ],
    hexagrams: HEXAGRAMS_EN,
    trigrams: [
      { name: "Heaven", attr: "the creative, strength" },
      { name: "Lake", attr: "the joyous, serenity" },
      { name: "Fire", attr: "the clinging, clarity" },
      { name: "Thunder", attr: "the arousing, movement" },
      { name: "Wind", attr: "the gentle, penetration" },
      { name: "Water", attr: "the abysmal, danger" },
      { name: "Mountain", attr: "keeping still, rest" },
      { name: "Earth", attr: "the receptive, devotion" },
    ],
    linePosition: "Moving line {n}",
    lineOrdinals: ["first", "second", "third", "fourth", "fifth", "sixth"],
    hexPrimary: "Primary hexagram",
    hexResulting: "Resulting hexagram",
    runePositions: [
      "Root", "Obstacle", "Hidden foundation", "Recent past", "Near future",
      "Path", "Shadow", "Protection", "Outcome",
    ],
    oduMain: "Main Odu",
    oduSecond: "Second cast (confirmation)",
    oduLabel: (n, odu) => `${n} open shells — ${odu}`,
    lenormand: LENORMAND_EN,
    lenormandPositions: [
      "Top left", "Above", "Top right",
      "Left", "Center", "Right",
      "Bottom left", "Below", "Bottom right",
    ],
  },
  es: {
    majors: [
      "El Loco", "El Mago", "La Papisa", "La Emperatriz", "El Emperador", "El Papa",
      "Los Enamorados", "El Carro", "La Justicia", "El Ermitaño", "La Rueda de la Fortuna",
      "La Fuerza", "El Colgado", "La Muerte", "La Templanza", "El Diablo", "La Torre",
      "La Estrella", "La Luna", "El Sol", "El Juicio", "El Mundo",
    ],
    ranks: ["As", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez", "Sota", "Caballero", "Reina", "Rey"],
    suits: ["Copas", "Espadas", "Bastos", "Oros"],
    minor: (r, s) => `${r} de ${s}`,
    reversed: "invertida",
    celticCross: [
      "Situación central", "Lo que cruza", "Fundamento", "Pasado reciente",
      "Coronamiento posible", "Futuro próximo", "Cómo se ve el consultante",
      "Influencias externas", "Esperanzas o miedos", "Resultado final",
    ],
    hexagrams: [
      "Lo Creativo", "Lo Receptivo", "La Dificultad Inicial", "La Necedad Juvenil", "La Espera", "El Conflicto",
      "El Ejército", "La Solidaridad", "La Fuerza Domesticadora de lo Pequeño", "El Porte", "La Paz", "El Estancamiento",
      "Comunidad con los Hombres", "La Posesión de lo Grande", "La Modestia", "El Entusiasmo", "El Seguimiento",
      "El Trabajo en lo Echado a Perder", "El Acercamiento", "La Contemplación", "La Mordedura Tajante", "La Gracia",
      "La Desintegración", "El Retorno", "La Inocencia", "La Fuerza Domesticadora de lo Grande", "Las Comisuras de la Boca",
      "La Preponderancia de lo Grande", "Lo Abismal", "Lo Adherente", "El Influjo", "La Duración", "La Retirada",
      "El Poder de lo Grande", "El Progreso", "El Oscurecimiento de la Luz", "La Familia", "El Antagonismo",
      "El Impedimento", "La Liberación", "La Merma", "El Aumento", "El Desbordamiento", "El Ir al Encuentro",
      "La Reunión", "La Subida", "La Desazón", "El Pozo", "La Revolución", "El Caldero", "Lo Suscitativo",
      "El Aquietamiento", "La Evolución", "La Muchacha que se Casa", "La Plenitud", "El Andariego", "Lo Suave",
      "Lo Sereno", "La Disolución", "La Restricción", "La Verdad Interior", "La Preponderancia de lo Pequeño",
      "Después de la Consumación", "Antes de la Consumación",
    ],
    trigrams: [
      { name: "Cielo", attr: "lo creativo, fuerza" },
      { name: "Lago", attr: "lo sereno, serenidad" },
      { name: "Fuego", attr: "lo adherente, claridad" },
      { name: "Trueno", attr: "lo suscitativo, movimiento" },
      { name: "Viento", attr: "lo suave, penetración" },
      { name: "Agua", attr: "lo abismal, peligro" },
      { name: "Montaña", attr: "el aquietamiento, reposo" },
      { name: "Tierra", attr: "lo receptivo, devoción" },
    ],
    linePosition: "Línea {n} mutante",
    lineOrdinals: ["primera", "segunda", "tercera", "cuarta", "quinta", "sexta"],
    hexPrimary: "Hexagrama principal",
    hexResulting: "Hexagrama resultante",
    runePositions: [
      "Raíz", "Obstáculo", "Fundamento oculto", "Pasado próximo", "Futuro próximo",
      "Camino", "Sombra", "Protección", "Resultado",
    ],
    oduMain: "Odu principal",
    oduSecond: "Segunda caída (confirmación)",
    oduLabel: (n, odu) => `${n} caracolas abiertas — ${odu}`,
    lenormand: [
      "El Jinete", "El Trébol", "El Barco", "La Casa", "El Árbol", "Las Nubes", "La Serpiente", "El Ataúd",
      "El Ramo", "La Guadaña", "El Látigo", "Los Pájaros", "El Niño", "El Zorro", "El Oso", "Las Estrellas",
      "La Cigüeña", "El Perro", "La Torre", "El Jardín", "La Montaña", "Los Caminos", "Los Ratones", "El Corazón",
      "El Anillo", "El Libro", "La Carta", "El Hombre", "La Mujer", "Los Lirios", "El Sol", "La Luna", "La Llave",
      "Los Peces", "El Ancla", "La Cruz",
    ],
    lenormandPositions: [
      "Esquina sup. izq.", "Arriba", "Esquina sup. der.",
      "Izquierda", "Centro", "Derecha",
      "Esquina inf. izq.", "Abajo", "Esquina inf. der.",
    ],
  },
}

// ---------------------------------------------------------------------------
// Frases-modelo por idioma (descrição para o prompt e resumo)
// ---------------------------------------------------------------------------

type Phrases = {
  tarotIntro: string
  tarotPattern: (majors: number, reversed: number, dominant: string | null) => string
  ichingIntro: string
  ichingLines: (lines: number[]) => string
  ichingHex: (label: string, pinyin: string, lower: string, upper: string) => string
  ichingMoving: (moving: number[], resulting: string, pinyin: string) => string
  ichingNoMoving: string
  ichingNotes: (primary: number, resulting: number | null, moving: number[]) => string
  lineName: (value: 6 | 9, ordinal: string) => string
  runesIntro: string
  runesNotes: (reversed: number) => string
  buziosIntro: string
  buziosThrows: (first: string, second: string) => string
  buziosNotes: (odu1: string, n1: number, odu2: string, n2: number) => string
  lenormandIntro: string
  lenormandCenter: (name: string) => string
  lenormandNotes: (name: string) => string
}

const PHRASES: Record<Locale, Phrases> = {
  pt: {
    tarotIntro:
      "Cruz Celta, 10 cartas sorteadas de um baralho de 78 (Tarô de Marselha), sem reposição, cada carta com 50% de chance de sair invertida.",
    tarotPattern: (m, r, d) =>
      [`${m} arcanos maiores`, `${r} invertidas`, d ? `predominância de ${d}` : null].filter(Boolean).join(" · "),
    ichingIntro: "Método das três moedas, seis lançamentos (de baixo para cima).",
    ichingLines: (l) => `Valores das linhas: ${l.join(" ")} (6 = yin mutante, 7 = yang, 8 = yin, 9 = yang mutante).`,
    ichingHex: (label, pinyin, lower, upper) =>
      `Hexagrama principal: ${label} (${pinyin}). Trigrama inferior: ${lower}. Trigrama superior: ${upper}.`,
    ichingMoving: (mv, res, pinyin) => `Linhas mutantes: ${mv.join(", ")}.\nHexagrama resultante: ${res} (${pinyin}).`,
    ichingNoMoving: "Sem linhas mutantes: não há hexagrama resultante; leia apenas o Julgamento e a Imagem.",
    ichingNotes: (p, r, mv) => (r ? `Hex. ${p} → ${r} (linhas mutantes: ${mv.join(", ")})` : `Hex. ${p}, sem linhas mutantes`),
    lineName: (v, ord) => (v === 9 ? `Nove na ${ord} posição (yang → yin)` : `Seis na ${ord} posição (yin → yang)`),
    runesIntro:
      "Mapa de 9 forças: 9 runas sorteadas de um saco com as 24 runas do Futhark Antigo, sem reposição. Runas reversíveis saem invertidas com 50% de chance; Gebo, Hagalaz, Isa, Jera, Eihwaz, Sowilo, Ingwaz e Dagaz não têm posição invertida.",
    runesNotes: (r) => `9 runas de 24, ${r} invertida${r === 1 ? "" : "s"}`,
    buziosIntro:
      "Jogo de 16 búzios (merindilogun). Cada concha cai aberta ou fechada com igual probabilidade; o Odu é dado pelo número de búzios abertos.",
    buziosThrows: (a, b) =>
      `Primeira queda (Odu principal): ${a}.\nSegunda queda (confirmação / aspecto complementar): ${b}.\nObservação: 0 abertos = Opirá (jogo fechado); 16 abertos = Alafia.`,
    buziosNotes: (o1, n1, o2, n2) => `${o1} (${n1}) · confirmação ${o2} (${n2})`,
    lenormandIntro: "Mesa de 9 cartas (quadrado 3×3), sorteadas de um baralho de 36 sem reposição. Disposição linha a linha:",
    lenormandCenter: (n) => `Carta central (tema dominante): ${n}.`,
    lenormandNotes: (n) => `Centro: ${n}`,
  },
  en: {
    tarotIntro:
      "Celtic Cross, 10 cards drawn from a 78-card deck (Tarot de Marseille), without replacement, each card with a 50% chance of coming out reversed.",
    tarotPattern: (m, r, d) =>
      [`${m} Major Arcana`, `${r} reversed`, d ? `predominance of ${d}` : null].filter(Boolean).join(" · "),
    ichingIntro: "Three-coin method, six casts (from bottom to top).",
    ichingLines: (l) => `Line values: ${l.join(" ")} (6 = old yin, moving; 7 = young yang; 8 = young yin; 9 = old yang, moving).`,
    ichingHex: (label, pinyin, lower, upper) =>
      `Primary hexagram: ${label} (${pinyin}). Lower trigram: ${lower}. Upper trigram: ${upper}.`,
    ichingMoving: (mv, res, pinyin) => `Moving lines: ${mv.join(", ")}.\nResulting hexagram: ${res} (${pinyin}).`,
    ichingNoMoving: "No moving lines: there is no resulting hexagram; read only the Judgment and the Image.",
    ichingNotes: (p, r, mv) => (r ? `Hex. ${p} → ${r} (moving lines: ${mv.join(", ")})` : `Hex. ${p}, no moving lines`),
    lineName: (v, ord) => (v === 9 ? `Nine in the ${ord} place (yang → yin)` : `Six in the ${ord} place (yin → yang)`),
    runesIntro:
      "Map of 9 forces: 9 runes drawn from a bag with the 24 runes of the Elder Futhark, without replacement. Reversible runes come out reversed with a 50% chance; Gebo, Hagalaz, Isa, Jera, Eihwaz, Sowilo, Ingwaz and Dagaz have no reversed position.",
    runesNotes: (r) => `9 runes of 24, ${r} reversed`,
    buziosIntro:
      "Sixteen-cowrie game (merindilogun). Each shell lands open or closed with equal probability; the Odu is given by the number of open shells.",
    buziosThrows: (a, b) =>
      `First cast (main Odu): ${a}.\nSecond cast (confirmation / complementary aspect): ${b}.\nNote: 0 open = Opirá (closed game); 16 open = Alafia.`,
    buziosNotes: (o1, n1, o2, n2) => `${o1} (${n1}) · confirmation ${o2} (${n2})`,
    lenormandIntro: "Nine-card spread (3×3 square), drawn from a 36-card deck without replacement. Layout row by row:",
    lenormandCenter: (n) => `Center card (dominant theme): ${n}.`,
    lenormandNotes: (n) => `Center: ${n}`,
  },
  es: {
    tarotIntro:
      "Cruz Celta, 10 cartas sorteadas de una baraja de 78 (Tarot de Marsella), sin reposición, cada carta con un 50% de probabilidad de salir invertida.",
    tarotPattern: (m, r, d) =>
      [`${m} arcanos mayores`, `${r} invertidas`, d ? `predominio de ${d}` : null].filter(Boolean).join(" · "),
    ichingIntro: "Método de las tres monedas, seis lanzamientos (de abajo hacia arriba).",
    ichingLines: (l) => `Valores de las líneas: ${l.join(" ")} (6 = yin mutante, 7 = yang, 8 = yin, 9 = yang mutante).`,
    ichingHex: (label, pinyin, lower, upper) =>
      `Hexagrama principal: ${label} (${pinyin}). Trigrama inferior: ${lower}. Trigrama superior: ${upper}.`,
    ichingMoving: (mv, res, pinyin) => `Líneas mutantes: ${mv.join(", ")}.\nHexagrama resultante: ${res} (${pinyin}).`,
    ichingNoMoving: "Sin líneas mutantes: no hay hexagrama resultante; lee solo el Dictamen y la Imagen.",
    ichingNotes: (p, r, mv) => (r ? `Hex. ${p} → ${r} (líneas mutantes: ${mv.join(", ")})` : `Hex. ${p}, sin líneas mutantes`),
    lineName: (v, ord) => (v === 9 ? `Nueve en la ${ord} posición (yang → yin)` : `Seis en la ${ord} posición (yin → yang)`),
    runesIntro:
      "Mapa de 9 fuerzas: 9 runas sorteadas de una bolsa con las 24 runas del Futhark Antiguo, sin reposición. Las runas reversibles salen invertidas con un 50% de probabilidad; Gebo, Hagalaz, Isa, Jera, Eihwaz, Sowilo, Ingwaz y Dagaz no tienen posición invertida.",
    runesNotes: (r) => `9 runas de 24, ${r} invertida${r === 1 ? "" : "s"}`,
    buziosIntro:
      "Juego de 16 caracolas (merindilogun). Cada caracola cae abierta o cerrada con igual probabilidad; el Odu lo da el número de caracolas abiertas.",
    buziosThrows: (a, b) =>
      `Primera caída (Odu principal): ${a}.\nSegunda caída (confirmación / aspecto complementario): ${b}.\nObservación: 0 abiertas = Opirá (juego cerrado); 16 abiertas = Alafia.`,
    buziosNotes: (o1, n1, o2, n2) => `${o1} (${n1}) · confirmación ${o2} (${n2})`,
    lenormandIntro: "Mesa de 9 cartas (cuadrado 3×3), sorteadas de una baraja de 36 sin reposición. Disposición fila por fila:",
    lenormandCenter: (n) => `Carta central (tema dominante): ${n}.`,
    lenormandNotes: (n) => `Centro: ${n}`,
  },
}

// ---------------------------------------------------------------------------
// Renderização
// ---------------------------------------------------------------------------

function hexLabel(n: number, names: Names) {
  return `${n}. ${names.hexagrams[n - 1]}`
}

export function renderSym(sym: Sym, locale: Locale): string {
  const n = NAMES[locale]
  switch (sym.kind) {
    case "tarot": {
      const c = TAROT_DECK[sym.card]
      const base = "major" in c ? n.majors[c.major] : n.minor(n.ranks[c.rank], n.suits[c.suit])
      return sym.reversed ? `${base} ${n.reversed}` : base
    }
    case "hexagram":
      return hexLabel(sym.number, n)
    case "line":
      return PHRASES[locale].lineName(sym.value, n.lineOrdinals[sym.n - 1])
    case "rune": {
      const r = RUNES[sym.index]
      return `${r.name} (${r.glyph})${sym.reversed ? ` ${n.reversed}` : ""}`
    }
    case "odu":
      return n.oduLabel(sym.open, ODUS[sym.open])
    case "lenormand": {
      const c = LENORMAND_DECK[sym.card]
      return `${c.number} — ${n.lenormand[sym.card]}`
    }
  }
}

export function renderPosition(item: DrawItem, locale: Locale): string {
  const n = NAMES[locale]
  const k = item.positionKey
  if (k.startsWith("cc")) return n.celticCross[Number(k.slice(2))]
  if (k.startsWith("line")) return n.linePosition.replace("{n}", k.slice(4))
  if (k === "primary") return n.hexPrimary
  if (k === "resulting") return n.hexResulting
  if (k.startsWith("r")) return n.runePositions[Number(k.slice(1))]
  if (k === "main") return n.oduMain
  if (k === "second") return n.oduSecond
  if (k.startsWith("l")) return n.lenormandPositions[Number(k.slice(1))]
  return k
}

export function renderDraw(draw: OracleDraw, locale: Locale): RenderedDraw {
  const n = NAMES[locale]
  const p = PHRASES[locale]
  const items: RenderedItem[] = draw.items.map((it) => ({
    position: renderPosition(it, locale),
    name: renderSym(it.sym, locale),
  }))
  const numbered = items.map((it, i) => `${i + 1}. ${it.position}: ${it.name}`).join("\n")

  switch (draw.key) {
    case "tarot": {
      const m = draw.meta
      const notes = p.tarotPattern(m.majors, m.reversed, m.dominantSuit === null ? null : n.suits[m.dominantSuit])
      return { items, notes, description: `${p.tarotIntro}\n${numbered}\n${notes}.` }
    }
    case "iching": {
      const m = draw.meta
      const lower = n.trigrams[m.lowerTrigram]
      const upper = n.trigrams[m.upperTrigram]
      const trig = (t: { name: string; attr: string }, idx: number) => `${TRIGRAMS[idx].pinyin} — ${t.name} (${t.attr})`
      const primary = HEXAGRAMS[m.primary - 1]
      const description =
        `${p.ichingIntro}\n${p.ichingLines(m.lines)}\n` +
        p.ichingHex(hexLabel(m.primary, n), primary.pinyin, trig(lower, m.lowerTrigram), trig(upper, m.upperTrigram)) +
        "\n" +
        (m.resulting
          ? p.ichingMoving(m.moving, hexLabel(m.resulting, n), HEXAGRAMS[m.resulting - 1].pinyin)
          : p.ichingNoMoving)
      return { items, notes: p.ichingNotes(m.primary, m.resulting, m.moving), description }
    }
    case "runas":
      return { items, notes: p.runesNotes(draw.meta.reversed), description: `${p.runesIntro}\n${numbered}` }
    case "buzios": {
      const m = draw.meta
      const a = n.oduLabel(m.first, ODUS[m.first])
      const b = n.oduLabel(m.second, ODUS[m.second])
      return {
        items,
        notes: p.buziosNotes(ODUS[m.first], m.first, ODUS[m.second], m.second),
        description: `${p.buziosIntro}\n${p.buziosThrows(a, b)}`,
      }
    }
    case "lenormand": {
      const names = items.map((it) => it.name)
      const center = names[4]
      const description =
        `${p.lenormandIntro}\n` +
        `[${names[0]}] [${names[1]}] [${names[2]}]\n` +
        `[${names[3]}] [${names[4]}] [${names[5]}]\n` +
        `[${names[6]}] [${names[7]}] [${names[8]}]\n` +
        p.lenormandCenter(center)
      return { items, notes: p.lenormandNotes(center), description }
    }
  }
}
