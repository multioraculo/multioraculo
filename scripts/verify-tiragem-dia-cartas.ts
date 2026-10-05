/**
 * O verso de cada carta da tiragem do dia.
 *
 * Nasceu de um defeito real: ao virar o Seis de Ouros invertido, o verso começava
 * falando do Seis de Ouros e terminava na Raposa, porque a Home pendurava a
 * SÍNTESE (o cruzamento das duas cartas) no verso de cada uma. Este arquivo
 * trava três coisas:
 *
 *  A. a fonte: as 36 fichas do Lenormand e as 78 do Tarô existem, e o material
 *     de uma carta nunca traz outra carta nem combinações;
 *  B. o verificador: texto individual que cita a OUTRA carta, o outro oráculo ou
 *     a ideia de conjunto é reprovado, nos três idiomas, incluindo o caso exato
 *     "Seis de Ouros invertida + Raposa"; a síntese, ao contrário, PODE e DEVE
 *     relacionar as duas;
 *  C. a decisão de gravar/refazer e o contrato do verso na tela: o registro
 *     legado (sem interpretação individual) cai no fallback sem texto, e a
 *     síntese NUNCA vira verso.
 *
 * Tudo com respostas SIMULADAS. Zero IA, zero rede, zero banco.
 */
import fs from "node:fs"
import path from "node:path"
import { TAROT_DECK } from "../lib/oracles/draw"
import { renderSym } from "../lib/oracles/localize"
import { tarotCardId, tarotCardRef } from "../lib/oracles/tarot-assets"
import { lenormandId } from "../lib/oracles/lenormand-assets"
import type { TiragemDoDia } from "../lib/oracles/tiragem-dia"
import { LENORMAND_FICHAS } from "../lib/oracles/lenormand-fichas"
import { CARTAS_COBERTAS } from "../lib/oracles/tarot-referencia"
import {
  cartasDeJson, citaNome, fichaDoLenormand, materialDoLenormand, materialDoTarot, nucleoDoNome, referenciasCruzadas,
} from "../lib/oracles/cartas-individuais"
import { avaliarGeracao, promptTiragemDia, verificarCartas, verificarSintese } from "../lib/oracles/prompt-tiragem-dia"
import type { Locale } from "../lib/i18n/config"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

/** Monta a dupla à mão (a tiragem real é por data; aqui a data não importa). */
function dupla(indTarot: number, invertida: boolean, indLenormand: number, locale: Locale): TiragemDoDia {
  return {
    dia: "2026-10-04",
    seed: "teste",
    tarot: {
      indice: indTarot,
      invertida,
      carta: tarotCardRef(indTarot, invertida),
      nome: renderSym({ kind: "tarot", card: indTarot, reversed: invertida }, locale),
      id: tarotCardId(indTarot),
    },
    lenormand: {
      indice: indLenormand,
      nome: renderSym({ kind: "lenormand", card: indLenormand }, locale),
      id: lenormandId(indLenormand),
    },
  }
}
const idx = (nome: string) => TAROT_DECK.findIndex((c) => c.name === nome)
const SEIS_DE_OUROS = idx("Seis de Ouros")
const O_SOL = idx("O Sol")
const RAPOSA = 13
const SOL_LENORMAND = 30
confere("o Seis de Ouros existe no baralho", SEIS_DE_OUROS >= 0)

// ── A. a fonte ───────────────────────────────────────────────────────────────
confere("as 78 cartas de Tarô têm ficha", CARTAS_COBERTAS === 78, String(CARTAS_COBERTAS))
confere("as 36 cartas de Lenormand têm ficha", LENORMAND_FICHAS.length === 36)
const NOMES_LN = ["Rider", "Clover", "Ship", "House", "Tree", "Clouds", "Snake", "Coffin", "Bouquet", "Scythe", "Rod", "Whip", "Birds", "Child", "Fox", "Bear", "Stars", "Stork", "Dog", "Tower", "Garden", "Mountain", "Paths", "Crossroads", "Mice", "Heart", "Ring", "Book", "Letter", "Man", "Woman", "Lily", "Sun", "Moon", "Key", "Fish", "Anchor", "Cross"]
for (const f of LENORMAND_FICHAS) {
  const quem = `ficha ${f.indice + 1} ${f.nomeFonte}`
  const outras = NOMES_LN.filter((n) => n !== f.nomeFonte && !(f.nomeFonte === "Rod" && n === "Whip") && !(f.nomeFonte === "Paths" && n === "Crossroads"))
  const citadas = outras.filter((n) => new RegExp(`(?<![A-Za-z])${n}(?![a-z])`).test(f.geral))
  confere(`${quem}: o "General" não cita outra carta`, citadas.length === 0, citadas.join(", "))
  confere(`${quem}: sem combinações (+) no General`, !/\+/.test(f.geral) && !/Combinations/i.test(f.geral))
  confere(`${quem}: General tem corpo`, f.geral.length >= 60)
  const mat = materialDoLenormand(dupla(O_SOL, false, f.indice, "pt"))
  confere(`${quem}: material existe e não traz o Tarô`, !!mat && !/\bTar[oô]t?\b/i.test(mat))
}
confere("fichaDoLenormand devolve a Raposa", fichaDoLenormand(RAPOSA)?.nomeFonte === "Fox")
{
  const m = materialDoTarot(dupla(SEIS_DE_OUROS, true, RAPOSA, "pt"))
  confere("material do Seis de Ouros invertido existe e traz a reversão", !!m && /Revers/i.test(m), String(m).slice(0, 80))
  confere("material do Seis de Ouros não menciona a Raposa nem Lenormand", !!m && !/Raposa|Fox|Lenormand/i.test(m))
  const l = materialDoLenormand(dupla(SEIS_DE_OUROS, true, RAPOSA, "pt"))
  confere("material da Raposa não menciona o Seis de Ouros", !!l && !/Seis de Ouros|Pentacle|Coins/i.test(l))
}

// ── B. o verificador, com textos SIMULADOS ───────────────────────────────────
type Caso = { locale: Locale; tarot: string; lenormand: string; sintese: string; eixo: [string, string] }
const BONS: Caso[] = [
  {
    locale: "pt",
    tarot:
      "O Seis de Ouros fala de expansão, de abundância de recursos e de maneiras possíveis de avançar, num bom equilíbrio entre estabilidade e movimento. Invertido, a fonte diz que o sentido da carta permanece semelhante.",
    lenormand:
      "A Raposa indica algo errado ou que corre por trás: sobrevivência pela astúcia, observação furtiva e a possibilidade de manipulação. É uma carta desafiadora, ligada ao engano e ao que se faz sem ser visto.",
    sintese:
      "O Seis de Ouros invertido mantém o sentido de abundância e de caminhos abertos, e a Raposa coloca ao lado dele uma vigilância sobre o que acontece por trás. Lado a lado, a expansão e a astúcia se medem uma pela outra, sem que nenhuma das duas vença.",
    eixo: ["expansão", "astúcia"],
  },
  {
    locale: "en",
    tarot:
      "The Six of Coins speaks of expansion, an abundance of resources and possible ways forward, in a good balance between stability and movement. Reversed, the source says the meaning of the card stays similar.",
    lenormand:
      "The Fox points to something wrong or going on behind the scenes: survival by cunning, stealthy observation and the possibility of manipulation. It is a challenging card, tied to deceit and to what is done unseen.",
    sintese:
      "The Six of Coins reversed keeps its sense of abundance and open paths, and the Fox sets beside it a watchfulness over what happens behind the scenes. Side by side, expansion and cunning are weighed against each other, and neither one simply wins out.",
    eixo: ["expansion", "cunning"],
  },
  {
    locale: "es",
    tarot:
      "El Seis de Oros habla de expansión, de abundancia de recursos y de maneras posibles de avanzar, en un buen equilibrio entre estabilidad y movimiento. Invertido, la fuente dice que el sentido de la carta permanece similar.",
    lenormand:
      "El Zorro indica algo torcido o que ocurre a escondidas: supervivencia por astucia, observación sigilosa y la posibilidad de manipulación. Es una carta desafiante, ligada al engaño y a lo que se hace sin ser visto.",
    sintese:
      "El Seis de Oros invertido conserva su sentido de abundancia y de caminos abiertos, y El Zorro pone a su lado una vigilancia sobre lo que ocurre a escondidas. Lado a lado, la expansión y la astucia se miden una contra otra, sin que ninguna de las dos venza.",
    eixo: ["expansión", "astucia"],
  },
]
const resp = (c: Caso, over: { tarot?: string | null; lenormand?: string | null } = {}) =>
  JSON.stringify({
    eixo: c.eixo,
    cartas: {
      tarot: { interpretation: over.tarot === undefined ? c.tarot : over.tarot },
      lenormand: { interpretation: over.lenormand === undefined ? c.lenormand : over.lenormand },
    },
    sintese: c.sintese,
  })

for (const c of BONS) {
  const t = dupla(SEIS_DE_OUROS, true, RAPOSA, c.locale)
  const bruto = JSON.parse(resp(c))
  const v = verificarCartas({ bruto, tiragem: t, locale: c.locale })
  confere(`${c.locale}: Seis de Ouros + Raposa, os dois versos aprovados`, v.violacoes.length === 0 && !!v.tarot && !!v.lenormand, v.violacoes.join(" | "))
  confere(`${c.locale}: o verso do Seis de Ouros NÃO contém a Raposa`, !!v.tarot && !citaNome(v.tarot, t.lenormand.nome) && !/raposa|fox|zorro/i.test(v.tarot))
  confere(`${c.locale}: o verso da Raposa NÃO contém o Seis de Ouros`, !!v.lenormand && !citaNome(v.lenormand, t.tarot.nome))
  const s = verificarSintese({ bruto, tiragem: t, locale: c.locale })
  confere(`${c.locale}: a síntese continua passando e relaciona as duas`, s.ok, s.ok ? "" : s.violacoes.join(" | "))
}

/** textos que um modelo desatento poderia devolver, e que TÊM de ser reprovados */
const RUINS: { locale: Locale; alvo: "tarot" | "lenormand"; texto: string; porque: string }[] = [
  { locale: "pt", alvo: "tarot", porque: "o caso do print: a Raposa no verso do Seis de Ouros", texto: "O Seis de Ouros invertido fala de uma troca desigual, e a presença da Raposa reforça a ideia de que alguém leva vantagem sem ser visto na medida do que se dá e recebe." },
  { locale: "en", alvo: "tarot", porque: "o caso do print, em inglês", texto: "The Six of Coins reversed speaks of an unequal exchange, and the Fox adds the idea that someone gains an advantage unseen in the measure of what is given and received." },
  { locale: "es", alvo: "tarot", porque: "o caso do print, em espanhol", texto: "El Seis de Oros invertido habla de un intercambio desigual, y El Zorro refuerza la idea de que alguien saca ventaja sin ser visto en la medida de lo que se da y se recibe." },
  { locale: "pt", alvo: "tarot", porque: "cita o Lenormand", texto: "O Seis de Ouros invertido fala de uma troca desigual, e no Lenormand essa desproporção costuma pedir uma segunda leitura sobre a medida do que se dá e do que se recebe." },
  { locale: "pt", alvo: "tarot", porque: "cita a síntese", texto: "O Seis de Ouros invertido fala de uma troca desigual, e a síntese abaixo mostra como essa desproporção pesa na medida do que se dá e do que se recebe nesta tiragem." },
  { locale: "pt", alvo: "tarot", porque: "cita o I Ching", texto: "O Seis de Ouros invertido fala de uma troca desigual, tema que também aparece no I Ching como um desequilíbrio de forças na medida do que se dá e do que se recebe." },
  { locale: "pt", alvo: "tarot", porque: "cita Runas", texto: "O Seis de Ouros invertido fala de uma troca desigual, e as Runas costumam desenhar essa mesma desproporção na medida do que se dá e do que se recebe entre as pessoas." },
  { locale: "pt", alvo: "tarot", porque: "cita Búzios", texto: "O Seis de Ouros invertido fala de uma troca desigual, e nos Búzios esse desequilíbrio aparece como um caminho torto na medida do que se dá e do que se recebe." },
  { locale: "pt", alvo: "tarot", porque: "convergência", texto: "O Seis de Ouros invertido fala de uma troca desigual, em convergência com a outra carta, na medida do que se dá e do que se recebe entre as pessoas envolvidas." },
  { locale: "pt", alvo: "lenormand", porque: "o Seis de Ouros no verso da Raposa", texto: "A Raposa indica algo que corre por trás e, junto do Seis de Ouros invertido, sugere uma troca em que alguém leva vantagem sem ser visto, com astúcia e manipulação." },
  { locale: "pt", alvo: "lenormand", porque: "cita o Tarô", texto: "A Raposa indica algo que corre por trás: no Tarô, esse tipo de figura costuma lembrar astúcia e manipulação, sobrevivência pela esperteza e observação furtiva de quem espreita." },
  { locale: "en", alvo: "lenormand", porque: "cita o Tarot", texto: "The Fox points to something going on behind the scenes, much as a Tarot figure of cunning would: survival by shrewdness, stealthy observation and the possibility of manipulation." },
  { locale: "es", alvo: "lenormand", porque: "cita a carta de Tarô", texto: "El Zorro indica algo que ocurre a escondidas, y junto al Seis de Oros sugiere un intercambio en que alguien saca ventaja sin ser visto, con astucia y manipulación." },
  { locale: "pt", alvo: "lenormand", porque: "'em conjunto'", texto: "A Raposa indica algo que corre por trás e, em conjunto com a outra carta, mostra sobrevivência pela astúcia, observação furtiva e a possibilidade de manipulação." },
]
for (const r of RUINS) {
  const base = BONS.find((b) => b.locale === r.locale) as Caso
  const t = dupla(SEIS_DE_OUROS, true, RAPOSA, r.locale)
  const bruto = JSON.parse(resp(base, { [r.alvo]: r.texto }))
  const v = verificarCartas({ bruto, tiragem: t, locale: r.locale })
  confere(`reprova (${r.locale}, ${r.alvo}): ${r.porque}`, v[r.alvo] === null && v.violacoes.length > 0, `devolveu ${JSON.stringify(v[r.alvo])?.slice(0, 50)}`)
  const outro = r.alvo === "tarot" ? "lenormand" : "tarot"
  confere(`o outro verso não é afetado (${r.locale}, ${r.alvo})`, v[outro] === base[outro], v.violacoes.join(" | "))
}

// o mesmo núcleo dos dois lados NÃO é cruzamento: Sol e Sol, cada um fala do seu
{
  const t = dupla(O_SOL, false, SOL_LENORMAND, "pt")
  confere("O Sol e Sol têm o mesmo núcleo", nucleoDoNome(t.tarot.nome) === nucleoDoNome(t.lenormand.nome), `${nucleoDoNome(t.tarot.nome)} / ${nucleoDoNome(t.lenormand.nome)}`)
  const r = referenciasCruzadas("O Sol traz vitalidade e clareza, e a luz que expõe o que estava na sombra.", { oraculo: "tarot", propria: t.tarot.nome, outra: t.lenormand.nome, locale: "pt" })
  confere("a palavra Sol na carta do Sol não é referência cruzada", r.length === 0, r.join("; "))
}
confere("'sol' não casa 'solução' (palavra inteira)", !citaNome("uma solução prática", "O Sol"))
confere("plural casa o nome (Estrela / Estrelas)", citaNome("há estrelas no céu", "A Estrela"))

// campo ausente, JSON sem a camada nova, vazio
{
  const t = dupla(SEIS_DE_OUROS, true, RAPOSA, "pt")
  const sem = verificarCartas({ bruto: { eixo: ["a", "b"], sintese: "x" }, tiragem: t, locale: "pt" })
  confere("resposta sem `cartas` é reprovada (ausente), não aceita", sem.violacoes.length === 2 && sem.tarot === null && sem.lenormand === null)
  const vazio = verificarCartas({ bruto: resp(BONS[0], { tarot: "   " }) && JSON.parse(resp(BONS[0], { tarot: "   " })), tiragem: t, locale: "pt" })
  confere("interpretação vazia é reprovada", vazio.tarot === null && vazio.violacoes.some((x) => x.includes("ausente")))
}

// ── C. a decisão: só a SÍNTESE pode refazer; verso reprovado vira null ────────
{
  const c = BONS[0]
  const t = dupla(SEIS_DE_OUROS, true, RAPOSA, "pt")
  const av = (conteudo: string) => avaliarGeracao({ conteudo, tiragem: t, locale: "pt" })
  const cruzadoTarot = RUINS[0].texto // a Raposa no verso do Seis de Ouros
  const cruzadoLenormand = RUINS[9].texto // o Seis de Ouros no verso da Raposa

  // a tabela da regra, linha a linha
  const ok = av(resp(c))
  confere("síntese ok + Tarô ok + Lenormand ok: grava tudo", ok.acao === "gravar" && ok.cartas?.tarot.interpretation === c.tarot && ok.cartas?.lenormand.interpretation === c.lenormand)

  const soTarotRuim = av(resp(c, { tarot: cruzadoTarot }))
  confere("síntese ok + Tarô inválido + Lenormand ok: grava síntese, tarot=null, grava Lenormand",
    soTarotRuim.acao === "gravar" && soTarotRuim.cartas?.tarot.interpretation === null && soTarotRuim.cartas?.lenormand.interpretation === c.lenormand && soTarotRuim.sintese === c.sintese)

  const soLenormandRuim = av(resp(c, { lenormand: cruzadoLenormand }))
  confere("síntese ok + Tarô ok + Lenormand inválido: grava síntese e Tarô, lenormand=null",
    soLenormandRuim.acao === "gravar" && soLenormandRuim.cartas?.tarot.interpretation === c.tarot && soLenormandRuim.cartas?.lenormand.interpretation === null && soLenormandRuim.sintese === c.sintese)

  const ambosRuins = av(resp(c, { tarot: cruzadoTarot, lenormand: cruzadoLenormand }))
  confere("síntese ok + os dois versos inválidos: grava a síntese e as duas interpretações ficam null",
    ambosRuins.acao === "gravar" && ambosRuins.cartas === null && ambosRuins.sintese === c.sintese)

  // verso inválido NÃO dispara nova chamada, em nenhuma combinação
  for (const [nome, r] of [["Tarô", soTarotRuim], ["Lenormand", soLenormandRuim], ["ambos", ambosRuins]] as const) {
    confere(`verso inválido (${nome}) não provoca retry`, r.acao !== "refazer")
  }

  // a síntese gravada é exatamente a que o modelo escreveu, com ou sem verso ruim
  for (const r of [ok, soTarotRuim, soLenormandRuim, ambosRuins]) {
    confere("a síntese e o eixo gravados são idênticos aos aprovados", r.acao === "gravar" && r.sintese === c.sintese && r.eixo.join() === c.eixo.join())
  }

  // cada verso é julgado sozinho: o resultado de um não depende do outro
  const t1 = verificarCartas({ bruto: JSON.parse(resp(c, { tarot: cruzadoTarot })), tiragem: t, locale: "pt" })
  const t2 = verificarCartas({ bruto: JSON.parse(resp(c, { lenormand: cruzadoLenormand })), tiragem: t, locale: "pt" })
  confere("Tarô e Lenormand são validados independentemente",
    t1.tarot === null && t1.lenormand === c.lenormand && t2.tarot === c.tarot && t2.lenormand === null)

  // a trava de referência cruzada continua decidindo o que pode ser gravado
  confere("a trava continua barrando a Raposa no Seis de Ouros", soTarotRuim.acao === "gravar" && !(soTarotRuim.cartas?.tarot.interpretation ?? "").includes("Raposa"))
  confere("a trava continua barrando o Seis de Ouros na Raposa", soLenormandRuim.acao === "gravar" && !(soLenormandRuim.cartas?.lenormand.interpretation ?? "").includes("Seis de Ouros"))

  // o que continua refazendo: SÓ a síntese (ou JSON inválido)
  const semCamada = av(JSON.stringify({ eixo: c.eixo, sintese: c.sintese }))
  confere("modelo que esquece a camada nova: grava a síntese, cartas null, nunca a síntese no lugar", semCamada.acao === "gravar" && semCamada.cartas === null && semCamada.sintese === c.sintese)
  const sintRuim = av(JSON.stringify({ eixo: c.eixo, cartas: { tarot: { interpretation: c.tarot }, lenormand: { interpretation: c.lenormand } }, sintese: "curta demais" }))
  confere("síntese reprovada continua refazendo, mesmo com versos bons", sintRuim.acao === "refazer")
  confere("JSON inválido continua refazendo", av("{").acao === "refazer")
}

// registro legado
confere("registro legado (null) vira `null`", cartasDeJson(null) === null && cartasDeJson(undefined) === null && cartasDeJson({}) === null)
confere("registro com lixo vira `null`", cartasDeJson({ tarot: { interpretation: 3 } }) === null && cartasDeJson("x") === null)
{
  const so = cartasDeJson({ tarot: { interpretation: " texto " }, lenormand: { interpretation: null } })
  confere("só um verso: o outro fica nulo", so?.tarot.interpretation === "texto" && so?.lenormand.interpretation === null)
}

// o pedido ao modelo traz as três camadas e o material, e ainda é UMA chamada
for (const loc of ["pt", "en", "es"] as const) {
  const t = dupla(SEIS_DE_OUROS, true, RAPOSA, loc)
  const { user } = promptTiragemDia(t, loc)
  confere(`${loc}: o prompt pede cartas.*.interpretation e a síntese na MESMA chamada`, /"cartas": \{"tarot": \{"interpretation"/.test(user) && /"sintese"/.test(user))
  confere(`${loc}: o prompt carrega o material de cada carta`, /MATERIAL DE CADA CARTA/.test(user) && /Sentido-base/.test(user) && /Entrada da carta/.test(user))
  confere(`${loc}: o prompt proíbe relacionar nos versos`, /PROIBIDO relacionar/.test(user))
}

// ── D. a tela: o verso nunca lê a síntese ────────────────────────────────────
const home = fs.readFileSync(path.join(process.cwd(), "components", "home-hoje.tsx"), "utf8")
const ini = home.indexOf("function CartasDoDia(")
const fim = home.indexOf("\n}\n", ini)
const corpo = home.slice(ini, fim)
const semComentarios = corpo.replace(/\/\/[^\n]*/g, "")
confere("CartasDoDia existe", ini > 0 && fim > ini)
confere("CartasDoDia NÃO lê `sintese`", !/sintese/.test(semComentarios))
confere("o verso lê `cartas.tarot.interpretation` e `cartas.lenormand.interpretation`", /cartas\?\.tarot\?\.interpretation/.test(semComentarios) && /cartas\?\.lenormand\?\.interpretation/.test(semComentarios))
confere("os dois versos usam o fallback sem texto", (semComentarios.match(/hideEmptyMeaning/g) ?? []).length === 2)
const fora = home.slice(0, ini) + home.slice(fim)
confere("a síntese segue renderizada abaixo da tiragem", /\{tiragem\.sintese\}/.test(fora))
const foco = fs.readFileSync(path.join(process.cwd(), "components", "focus-card.tsx"), "utf8")
confere("o FocusCard só esconde o vazio quando pedido (default intacto)", /hideEmptyMeaning = false/.test(foco) && /\(meaning \|\| !hideEmptyMeaning\)/.test(foco))

// ── prova: referências cruzadas por verso (tabela impressa no fim) ───────────
const tabela: string[] = []
for (const c of BONS) {
  const t = dupla(SEIS_DE_OUROS, true, RAPOSA, c.locale)
  for (const alvo of ["tarot", "lenormand"] as const) {
    const texto = c[alvo]
    const achadas = referenciasCruzadas(texto, {
      oraculo: alvo,
      propria: alvo === "tarot" ? t.tarot.nome : t.lenormand.nome,
      outra: alvo === "tarot" ? t.lenormand.nome : t.tarot.nome,
      locale: c.locale,
    })
    confere(`${c.locale}/${alvo}: 0 referências cruzadas no verso`, achadas.length === 0, achadas.join("; "))
    tabela.push(`  ${c.locale} · verso ${alvo === "tarot" ? t.tarot.nome : t.lenormand.nome}: ${achadas.length} referências cruzadas`)
  }
}

// ── fim ──────────────────────────────────────────────────────────────────────
if (falhas.length) {
  console.error(`verify:tiragem-cartas — ${falhas.length} falha(s) em ${conferidos} conferências:`)
  for (const f of falhas) console.error("  ✗ " + f)
  process.exit(1)
}
console.log(`verify:tiragem-cartas — ${conferidos} conferências ok (36 fichas de Lenormand, 78 de Tarô, versos em pt/en/es, decisão de gravar/refazer, contrato da tela).`)
console.log(tabela.join("\n"))
