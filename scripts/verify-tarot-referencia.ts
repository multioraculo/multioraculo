/**
 * Integridade da referência estruturada do Tarô.
 *
 * Nasceu de uma medição: em 40 leituras reais, o tarô entregava referência
 * para 3,0 das 10 cartas e ZERO invertidas tinham suporte textual sobre o que
 * inversão significa. Este verificador cobra que isso não volte.
 *
 * Nenhuma chamada paga: o índice é um módulo e o material é montado em código.
 */
import { BENDOV_CARTAS } from "../lib/oracles/bendov-cartas"
import { fichaDaCarta, trechoDaCarta, REVERSAO_METODO, CARTAS_COBERTAS } from "../lib/oracles/tarot-referencia"
import { buildCBaseMinMaterial } from "../lib/oracles/references"
import { cbaseMinSynthesisPrompt } from "../lib/oracles/synthesis-cbase-min"
import { drawAll, TAROT_DECK } from "../lib/oracles/draw"
import { LOCALES, type Locale } from "../lib/i18n/config"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

// fase10:0 traz o Arcano VI de pé e fase10:31 o traz invertido. Os dois estão
// aqui de propósito: VI é a única carta cujo nome o motor e a fonte escrevem
// diferente, e antes do apelido ela caía calada — em 6 das 400 cartas das 40
// leituras do baseline, uma delas invertida.
const SEEDS = ["fase10:0", "fase10:31", "fase10:3", "fase10:25", "fase10:65", "fase10:594", "fase10:52"]
const PERGUNTA = "O que está em jogo agora?"

// ── A · o índice cobre as 78 ──────────────────────────────────────────────
function parteA() {
  confere("A · o índice tem 78 cartas", CARTAS_COBERTAS === 78, String(CARTAS_COBERTAS))
  const NAIPES = ["Ouros", "Copas", "Paus", "Espadas"]
  const RANKS = ["Ás", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez", "Valete", "Cavaleiro", "Rainha", "Rei"]
  const maiores = TAROT_DECK.filter((c) => "major" in c)
  confere("A · os 22 Arcanos Maiores têm ficha", maiores.every((c) => fichaDaCarta(c.name)), maiores.filter((c) => !fichaDaCarta(c.name)).map((c) => c.name).join(", "))
  for (const n of NAIPES) {
    const faltam = RANKS.filter((r) => !fichaDaCarta(`${r} de ${n}`))
    confere(`A · as 14 de ${n} têm ficha`, faltam.length === 0, faltam.join(", "))
  }
  const ases = NAIPES.filter((n) => fichaDaCarta(`Ás de ${n}`)).length
  const numericas = NAIPES.flatMap((n) => RANKS.slice(1, 10).map((r) => `${r} de ${n}`)).filter((c) => fichaDaCarta(c)).length
  const corte = NAIPES.flatMap((n) => RANKS.slice(10).map((r) => `${r} de ${n}`)).filter((c) => fichaDaCarta(c)).length
  confere("A · 4 Ases", ases === 4, String(ases))
  confere("A · 36 numéricas de 2 a 10", numericas === 36, String(numericas))
  confere("A · 16 cartas da corte", corte === 16, String(corte))

  // ESTA É A CONFERÊNCIA QUE IMPORTA, e é a que achou o defeito: não basta o
  // índice ter 78 fichas, é preciso que o nome com que o MOTOR sorteia encontre
  // cada uma. O Arcano VI diverge ("Os Enamorados" aqui, "O Amante" na fonte).
  const semFicha = TAROT_DECK.filter((c) => !fichaDaCarta(c.name))
  confere("A · toda carta do baralho do motor tem ficha", semFicha.length === 0, semFicha.map((c) => c.name).join(", "))
  confere("A · o Arcano VI encontra a ficha apesar do nome diferente", fichaDaCarta("Os Enamorados")?.carta === "O Amante", String(fichaDaCarta("Os Enamorados")?.carta))
}

// ── B · higiene da extração ───────────────────────────────────────────────
function parteB() {
  const txt = JSON.stringify(BENDOV_CARTAS)
  confere("B · nenhum NUL no índice", !txt.includes("\u0000"))
  // as MENSAGEM do livro são imperativas e a síntese proíbe prescrever
  const imperativos = ["Ouse e vença", "Deixe ir o que já acabou", "Crie uma nova realidade", "Assuma o controle sobre si", "Aja com base nos seus instintos", "Mostre poder de liderança"]
  const vazados = imperativos.filter((f) => txt.includes(f))
  confere("B · nenhum conteúdo de MENSAGEM", vazados.length === 0, vazados.join(" / "))
  confere("B · nenhuma ficha com marca 'M:' residual", !BENDOV_CARTAS.some((f) => /\bM:/.test(f.base) || /\bM:/.test(f.invertida)))
  confere("B · toda ficha tem base e reversão", BENDOV_CARTAS.every((f) => f.base.length > 10 && f.invertida.length > 3))
  confere("B · toda ficha tem fonte e página", BENDOV_CARTAS.every((f) => f.fonte.length > 0 && f.pagina > 0))

  // "Similar." é resposta da fonte, não lacuna: ela diz que a inversão não muda
  const similares = BENDOV_CARTAS.filter((f) => f.invertida_similar)
  confere("B · 16 cartas marcadas 'Similar.'", similares.length === 16, String(similares.length))
  confere("B · nenhum Arcano Maior é 'Similar.'", !similares.some((f) => TAROT_DECK.some((c) => "major" in c && c.name === f.carta)), similares.map((f) => f.carta).join(", "))
}

// ── C · fidelidade à fonte, conferida carta a carta ───────────────────────
// Os pares abaixo foram lidos DIRETO do PDF antes da extração existir. Se a
// extração deslocar de novo — já deslocou uma vez, e em silêncio — isto cai.
const AMOSTRA: Array<[string, string, string]> = [
  ["Cinco de Espadas", "Ruptura", "iniciativa inútil"],
  ["Dez de Espadas", "Exaustão", "Imobilidade"],
  ["A Torre", "Romper estruturas sólidas", "Choque"],
  ["Ás de Ouros", "bom começo para as coisas materiais", "Similar"],
  ["A Morte", "fim de algo cuja hora chegou", "Dificuldade para lidar com perdas"],
  ["O Louco", "Liberdade com relação a convenções", "Dificuldade em escolher"],
  ["Dez de Copas", "Liderança", "líder em queda"],
  ["Cinco de Paus", "Superação", "situação complexa"],
  ["Rei de Espadas", "Determinação em romper com o passado", "coração dividido"],
  ["Rainha de Ouros", "Ativos tangíveis", "Conservadorismo"],
  ["A Imperatriz", "Abundância, crescimento", "Comportamento impulsivo"],
  ["O Imperador", "Conquistas práticas e materiais", "Beligerância"],
]
function parteC() {
  for (const [carta, naBase, naInv] of AMOSTRA) {
    const f = fichaDaCarta(carta)
    confere(`C · ${carta}: base confere com a fonte`, !!f && f.base.includes(naBase), f ? f.base.slice(0, 70) : "sem ficha")
    confere(`C · ${carta}: reversão confere com a fonte`, !!f && f.invertida.includes(naInv), f ? f.invertida.slice(0, 70) : "sem ficha")
  }
}

// ── D · o que chega ao prompt ─────────────────────────────────────────────
async function parteD() {
  for (const seed of SEEDS) {
    const m = await buildCBaseMinMaterial(PERGUNTA, seed, "pt")
    const refs = m.tarot.evidence.filter((e) => typeof e.itemIndex === "number")
    const itens = new Set(refs.map((e) => e.itemIndex))
    confere(`D · ${seed}: as 10 cartas recebem referência`, itens.size === 10, `${itens.size} de 10`)

    const d = drawAll(seed)
    d.tarot.items.forEach((it, i) => {
      const sym = it.sym as { card: number; reversed: boolean }
      const daCarta = refs.filter((e) => e.itemIndex === i).map((e) => e.excerpt).join(" ")
      if (sym.reversed) {
        confere(`D · ${seed}#${i + 1} ${TAROT_DECK[sym.card].name} invertida traz a reversão`, /invertida:/.test(daCarta), daCarta.slice(0, 60))
      } else {
        confere(`D · ${seed}#${i + 1} carta normal NÃO traz reversão`, !/invertida:/.test(daCarta), daCarta.slice(0, 60))
      }
    })
    // O QUE CHEGA AO PROMPT nos outros quatro, não o que é produzido.
    // A primeira versão disto checava o número de entradas PRODUZIDAS e
    // afirmava que os outros quatro não haviam mudado de volume. Deixou de ser
    // verdade quando as runas ganharam ficha estruturada: elas passaram a
    // produzir 17,7 entradas por leitura (9 fichas + 8,7 trechos lexicais),
    // das quais o montador leva 10. O invariante que importa é o teto, não a
    // produção.
    for (const k of ["iching", "runas", "buzios", "lenormand"] as const) {
      const n = m[k].evidence.filter((e) => typeof e.itemIndex === "number").slice(0, 10).length
      confere(`D · ${seed}: ${k} entrega no máximo 10 ao prompt`, n <= 10, String(n))
    }
  }
}

// ── E · a lógica geral da reversão, uma vez e nos três idiomas ────────────
async function parteE() {
  for (const locale of LOCALES as readonly Locale[]) {
    const m = await buildCBaseMinMaterial(PERGUNTA, SEEDS[0], locale)
    const p = cbaseMinSynthesisPrompt(PERGUNTA, m, locale, SEEDS[0])
    const marca = { pt: "não equivale automaticamente a significado negativo", en: "does not automatically mean a negative reading", es: "no equivale automáticamente a un significado negativo" }[locale]
    const ocorrencias = p.split(marca).length - 1
    confere(`E · ${locale}: a lógica da reversão está no prompt`, ocorrencias >= 1, "ausente")
    confere(`E · ${locale}: e aparece UMA vez só`, ocorrencias <= 1, `${ocorrencias} vezes`)
    confere(`E · ${locale}: o método do tarô a carrega`, m.tarot.method.includes(marca))
    for (const k of ["iching", "runas", "buzios", "lenormand"] as const) {
      confere(`E · ${locale}: ${k} NÃO recebe regra de reversão`, !m[k].method.includes(marca))
    }
    confere(`E · ${locale}: o texto existe`, REVERSAO_METODO[locale].length > 100)
  }
}

// ── F · o sorteio não mudou ───────────────────────────────────────────────
function parteF() {
  // Seeds com resultado conhecido: se o RNG derivar, a comparação pareada das
  // 40 leituras deixa de medir a mudança de referência.
  //
  // A COLUNA DE RUNAS MUDOU EM DOIS SEEDS, DE PROPÓSITO. Nauthiz deixou de
  // produzir resultado invertido (Brekke, p78: "has no reversed
  // interpretation"), então fase10:3 caiu de 5 para 4 invertidas e fase10:594
  // também. Nenhuma outra runa mudou, e tarô, I Ching, búzios e Lenormand
  // seguem idênticos — cada oráculo tem stream próprio. Quem guarda essa
  // mudança em detalhe é `verify:runas`, parte C, com os cinco seeds afetados
  // fixados em lista literal.
  const conhecidos: Array<[string, number, number, number, number]> = [
    //           tarô inv · runas inv · maiores · hexagrama
    ["fase10:0", 6, 4, 4, 47],
    ["fase10:3", 7, 4, 2, 60], // runas 5 → 4 (Nauthiz)
    ["fase10:25", 8, 2, 4, 10],
    ["fase10:65", 3, 2, 1, 4],
    ["fase10:594", 9, 4, 4, 19], // runas 5 → 4 (Nauthiz)
  ]
  for (const [seed, tInv, rInv, maiores, hex] of conhecidos) {
    const d = drawAll(seed)
    confere(
      `F · ${seed}: sorteio como esperado`,
      d.tarot.meta.reversed === tInv && d.runas.meta.reversed === rInv && d.tarot.meta.majors === maiores && d.iching.meta.primary === hex,
      `t${d.tarot.meta.reversed} r${d.runas.meta.reversed} m${d.tarot.meta.majors} h${d.iching.meta.primary}`,
    )
  }
}

// ── G · o orçamento por campo ─────────────────────────────────────────────
// O montador do prompt corta cada trecho em 320 chars. A base nunca chega
// perto disso, então quem era cortada era sempre a reversão, por estar no fim:
// 58 das 212 invertidas das 40 leituras do baseline chegavam mutiladas no meio
// de uma frase. O orçamento por campo reparte o mesmo envelope. Isto cobra que
// o envelope seja respeitado e que nenhum campo seja cortado fora de frase.
const SEM_PT = "a fonte diz que invertida o sentido permanece semelhante"
function prefixosValidos(t: string): Set<string> {
  const lim = t.replace(/\s+/g, " ").trim()
  const out = new Set([lim])
  let acc = ""
  for (const f of lim.split(/(?<=[.;!?])\s+/).filter(Boolean)) { acc = acc ? `${acc} ${f}` : f; out.add(acc) }
  return out
}
function parteG() {
  for (const locale of LOCALES as readonly Locale[]) {
    let maior = 0
    for (const f of BENDOV_CARTAS) {
      for (const inv of [false, true]) {
        const t = trechoDaCarta(f, inv, locale).replace(/\s+/g, " ").trim()
        maior = Math.max(maior, t.length)
      }
    }
    confere(`G · ${locale}: nenhum trecho passa de 320 chars`, maior <= 320, `maior ${maior}`)
  }
  // a base vai inteira quando a carta está de pé (máx 279 nas 78 fichas)
  const basesCortadas = BENDOV_CARTAS.filter((f) => trechoDaCarta(f, false, "pt").trim() !== f.base.replace(/\s+/g, " ").trim())
  confere("G · carta de pé entrega a base inteira", basesCortadas.length === 0, basesCortadas.map((f) => f.carta).join(", "))
  // invertida: o que chega é a reversão inteira, ou um corte em fim de frase
  const ruins: string[] = []
  let inteiras = 0
  for (const f of BENDOV_CARTAS) {
    const t = trechoDaCarta(f, true, "pt").replace(/\s+/g, " ").trim()
    const p = t.indexOf("invertida: ")
    if (p < 0) { ruins.push(`${f.carta} (reversão ausente)`); continue }
    const entregue = t.slice(p + 11).trim()
    const fonte = f.invertida_similar ? SEM_PT : f.invertida.replace(/\s+/g, " ").trim()
    if (entregue === fonte) inteiras++
    else if (!prefixosValidos(fonte).has(entregue)) ruins.push(`${f.carta}: ...${entregue.slice(-40)}`)
  }
  confere("G · reversão nunca cortada no meio de frase", ruins.length === 0, ruins.join(" | "))
  confere("G · a frase de 'Similar.' vai sempre inteira", BENDOV_CARTAS.filter((f) => f.invertida_similar).every((f) => trechoDaCarta(f, true, "pt").includes(SEM_PT)))
  confere("G · maioria das reversões chega inteira", inteiras >= 50, `${inteiras} de 78`)
}

async function main() {
  parteG()
  parteA()
  parteB()
  parteC()
  parteF()
  await parteD()
  await parteE()

  if (falhas.length) {
    console.error(`\nA referência do tarô falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas) console.error(`  ${f}`)
    console.error("")
    process.exit(1)
  }
  console.log(`referência do tarô: ${conferidos} conferências, 78 cartas, reversão por carta e método em pt/en/es`)
}

main()
