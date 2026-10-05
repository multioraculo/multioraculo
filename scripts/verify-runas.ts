/**
 * Integridade da referência das runas e, sobretudo, do consumo de RNG.
 *
 * O que este verificador existe para impedir:
 *
 *  1. que a flag dupla de `RUNES` seja "limpada". `reversible` alimenta o
 *     `&&` de `drawRunes` e define a sequência de bools; `reversaoNaFonte` só
 *     mascara a saída. Unificar as duas deslocaria a orientação de todas as
 *     runas sorteadas depois de Nauthiz, em todo seed existente — medido: 21
 *     de 360 orientações em 40 seeds, contra 5 de 360 do jeito certo.
 *  2. que a correção de Nauthiz volte atrás ou se espalhe. Os cinco seeds que
 *     mudam estão fixados abaixo como lista literal.
 *  3. que a lista de runas sem reversão na copy divirja da tabela.
 *
 * Zero IA, zero rede.
 */
import { drawAll, makeRng, RUNES, RUNE_POSITIONS_COUNT } from "../lib/oracles/draw"
import { renderDraw } from "../lib/oracles/localize"
import { RUNAS_FICHAS } from "../lib/oracles/runas-fichas"
import { RUNAS_COBERTAS, fichaDaRuna, trechoDaRuna, REVERSAO_RUNAS, divergenciasEntreMotorEFichas } from "../lib/oracles/runas-referencia"
import { buildCBaseMinMaterial } from "../lib/oracles/references"
import { cbaseMinSynthesisPrompt } from "../lib/oracles/synthesis-cbase-min"
import { ORACLE_ORDER } from "../lib/oracles/synthesis"
import { LOCALES, type Locale } from "../lib/i18n/config"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

/**
 * OS CINCO SEEDS QUE MUDAM, e nenhum outro.
 *
 * Nauthiz aparece em 12 dos 40 seeds congelados do baseline; em cinco deles
 * tinha caído invertida, e passa a ser lida de pé. Esta lista é literal de
 * propósito: se um sexto seed mudar, ou se a mudança deixar de ser só Nauthiz,
 * alguma coisa deslocou o RNG e o teste cai.
 */
const SEEDS_QUE_MUDAM = ["fase10:3", "fase10:12", "fase10:26", "fase10:37", "fase10:594"]
const SEEDS = ["fase10:0", "fase10:3", "fase10:12", "fase10:25", "fase10:26", "fase10:31", "fase10:37", "fase10:244", "fase10:594", "fase10:685"]
const PERGUNTA = "O que está em jogo agora?"

// ── A · as duas flags e as duas contagens ─────────────────────────────────
function parteA() {
  confere("A · 24 runas na tabela do motor", RUNES.length === 24, String(RUNES.length))
  const consome = RUNES.filter((r) => r.reversible)
  const comRev = RUNES.filter((r) => r.reversaoNaFonte)
  confere("A · 16 runas consomem bool (reversible)", consome.length === 16, `${consome.length}: ${consome.map((r) => r.name).join(", ")}`)
  confere("A · 15 runas têm reversão na fonte", comRev.length === 15, `${comRev.length}: ${comRev.map((r) => r.name).join(", ")}`)
  confere("A · 9 runas sem reversão na fonte", RUNES.length - comRev.length === 9, String(RUNES.length - comRev.length))
  // a ÚNICA divergência permitida entre as duas flags é Nauthiz
  const divergem = RUNES.filter((r) => r.reversible !== r.reversaoNaFonte)
  confere("A · as flags divergem em exatamente uma runa", divergem.length === 1, divergem.map((r) => r.name).join(", "))
  confere("A · e essa runa é Nauthiz", divergem[0]?.name === "Nauthiz", divergem[0]?.name ?? "nenhuma")
  confere("A · Nauthiz não produz invertida", RUNES.find((r) => r.name === "Nauthiz")?.reversaoNaFonte === false)
  confere("A · Nauthiz CONTINUA consumindo bool", RUNES.find((r) => r.name === "Nauthiz")?.reversible === true,
    "se isto virar false, a orientação de todas as runas depois dela muda em todo seed")
  // quem não consome bool nunca pode ter reversão
  const impossivel = RUNES.filter((r) => !r.reversible && r.reversaoNaFonte)
  confere("A · nenhuma runa tem reversão sem consumir bool", impossivel.length === 0, impossivel.map((r) => r.name).join(", "))
}

// ── B · as fichas ─────────────────────────────────────────────────────────
function parteB() {
  confere("B · 24 fichas", RUNAS_COBERTAS === 24, String(RUNAS_COBERTAS))
  const semFicha = RUNES.map((r, i) => (fichaDaRuna(i) ? null : r.name)).filter(Boolean)
  confere("B · toda runa do motor tem ficha", semFicha.length === 0, semFicha.join(", "))
  const div = divergenciasEntreMotorEFichas()
  confere("B · motor e fichas concordam em nome e reversão", div.length === 0, div.join(" | "))
  confere("B · 15 fichas com reversão", RUNAS_FICHAS.filter((f) => f.reversaoNaFonte).length === 15)
  confere("B · 9 fichas sem reversão", RUNAS_FICHAS.filter((f) => !f.reversaoNaFonte).length === 9)
  for (const f of RUNAS_FICHAS) {
    confere(`B · ${f.nome}: base não vazia`, f.base.length >= 60, `${f.base.length} chars`)
    confere(`B · ${f.nome}: tem aliases`, f.aliases.length > 0)
    confere(`B · ${f.nome}: tem página`, f.pagina > 0, String(f.pagina))
    if (f.reversaoNaFonte) confere(`B · ${f.nome}: texto de reversão presente`, f.reversed.length >= 20, `${f.reversed.length} chars`)
    else confere(`B · ${f.nome}: sem texto de reversão`, f.reversed === "", f.reversed.slice(0, 60))
  }
  const txt = JSON.stringify(RUNAS_FICHAS)
  confere("B · zero NUL", !txt.includes("\u0000"))
  confere("B · nenhuma Wyrd / runa em branco", !/\bwyrd\b|\bblank rune\b|\bblank stave\b/i.test(txt),
    (txt.match(/[^"]{0,60}\bwyrd\b[^"]{0,60}/i) ?? [])[0] ?? "")
  // os três nomes que a fonte escreve diferente trazem o nosso nos aliases
  for (const [fonte, motor] of [["Gifu", "Gebo"], ["Pertho", "Perthro"], ["Berkana", "Berkano"]] as const) {
    const f = RUNAS_FICHAS.find((x) => x.nomeFonte === fonte)
    confere(`B · "${fonte}" traz "${motor}" nos aliases da fonte`,
      !!f && f.aliases.some((a) => a.toLowerCase() === motor.toLowerCase()), f?.aliases.join(", ") ?? "ficha ausente")
  }
}

// ── C · O CONSUMO DE RNG — a conferência mais importante ──────────────────
/** reimplementa drawRunes para comparar o consumo, sem depender do motor */
function orientacoes(seed: string, condicao: (i: number) => boolean, mascara: (i: number) => boolean) {
  const rng = makeRng(`${seed}:runas`)
  const order = rng.shuffle(RUNES.map((_, i) => i))
  const out: Array<{ index: number; reversed: boolean }> = []
  for (let i = 0; i < RUNE_POSITIONS_COUNT; i++) {
    const index = order[i]
    const caiu = condicao(index) && rng.bool()
    out.push({ index, reversed: caiu && mascara(index) })
  }
  return out
}
function parteC() {
  // regra ANTIGA: reversible decidia tudo
  const antiga = (seed: string) => orientacoes(seed, (i) => RUNES[i].reversible, () => true)
  // regra NOVA, como o motor faz hoje
  const nova = (seed: string) => orientacoes(seed, (i) => RUNES[i].reversible, (i) => RUNES[i].reversaoNaFonte)
  // o que aconteceria se alguém "limpasse" a flag dupla
  const errada = (seed: string) => orientacoes(seed, (i) => RUNES[i].reversaoNaFonte, () => true)

  const NAUTHIZ = RUNES.findIndex((r) => r.name === "Nauthiz")
  let mudaram: string[] = []
  let mudancasNaoNauthiz = 0
  let seedsErrada = 0
  for (const seed of SEEDS) {
    const A = antiga(seed), N = nova(seed), E = errada(seed)
    // a seleção das 9 nunca muda: o shuffle vem antes de qualquer bool
    confere(`C · ${seed}: a seleção das 9 runas não muda`, A.map((x) => x.index).join() === N.map((x) => x.index).join())
    // o motor de verdade bate com a reimplementação
    const real = drawAll(seed).runas.items.map((it) => {
      const s = it.sym as { index: number; reversed: boolean }
      return `${s.index}${s.reversed ? "R" : ""}`
    }).join()
    confere(`C · ${seed}: o motor bate com a regra nova`, real === N.map((x) => `${x.index}${x.reversed ? "R" : ""}`).join(), real)
    const dif = A.filter((x, i) => x.reversed !== N[i].reversed)
    if (dif.length) mudaram.push(seed)
    mudancasNaoNauthiz += dif.filter((x) => x.index !== NAUTHIZ).length
    if (E.map((x) => `${x.index}${x.reversed ? "R" : ""}`).join() !== N.map((x) => `${x.index}${x.reversed ? "R" : ""}`).join()) seedsErrada++
  }
  const esperados = SEEDS.filter((s) => SEEDS_QUE_MUDAM.includes(s))
  confere("C · mudam exatamente os seeds previstos", mudaram.sort().join() === esperados.sort().join(),
    `mudaram [${mudaram.join(", ")}], previstos [${esperados.join(", ")}]`)
  confere("C · NENHUMA runa além de Nauthiz muda de orientação", mudancasNaoNauthiz === 0, `${mudancasNaoNauthiz} mudança(s)`)
  confere("C · unificar as flags MUDARIA o sorteio (por isso elas são duas)", seedsErrada > 0,
    "se isto falhar, a flag dupla deixou de ter efeito e pode ser removida")
}

// ── D · o material que chega ao prompt ────────────────────────────────────
async function parteD() {
  for (const seed of SEEDS) {
    const m = await buildCBaseMinMaterial(PERGUNTA, seed, "pt")
    const d = drawAll(seed)
    const fichas = m.runas.evidence.filter((e) => typeof e.itemIndex === "number" && e.source.startsWith("Wayne Brekke"))
    confere(`D · ${seed}: 9 de 9 runas com ficha`, fichas.length === 9, `${fichas.length} fichas`)
    d.runas.items.forEach((it, i) => {
      const s = it.sym as { index: number; reversed: boolean }
      const txt = fichas.filter((e) => e.itemIndex === i).map((e) => e.excerpt).join(" ")
      const nome = RUNES[s.index].name
      if (s.reversed) confere(`D · ${seed}#${i + 1} ${nome} invertida traz a reversão`, /invertida:/.test(txt), txt.slice(0, 70))
      else confere(`D · ${seed}#${i + 1} ${nome} de pé não traz reversão`, !/invertida:/.test(txt), txt.slice(0, 70))
      // as 9 sem reversão nunca podem chegar invertidas
      if (!RUNES[s.index].reversaoNaFonte) confere(`D · ${seed}#${i + 1} ${nome} nunca chega invertida`, !s.reversed)
    })
  }
}

// ── E · a regra geral e a copy ────────────────────────────────────────────
async function parteE() {
  for (const locale of LOCALES as readonly Locale[]) {
    const m = await buildCBaseMinMaterial(PERGUNTA, SEEDS[0], locale)
    const p = cbaseMinSynthesisPrompt(PERGUNTA, m, locale, SEEDS[0])
    const marca = { pt: "prática moderna, influenciada pelo tarô", en: "a modern practice influenced by tarot", es: "práctica moderna, influida por el tarot" }[locale]
    const n = p.split(marca).length - 1
    confere(`E · ${locale}: a regra de reversão das runas está no prompt`, n >= 1, "ausente")
    confere(`E · ${locale}: e aparece uma vez só`, n <= 1, `${n} vezes`)
    confere(`E · ${locale}: o método das runas a carrega`, m.runas.method.includes(marca))
    for (const k of ORACLE_ORDER.filter((x) => x !== "runas")) {
      confere(`E · ${locale}: ${k} NÃO recebe a regra das runas`, !m[k].method.includes(marca))
    }
    confere(`E · ${locale}: o texto existe`, REVERSAO_RUNAS[locale].length > 120)
    // a copy do método precisa listar as NOVE, derivadas da tabela.
    // A frase de método é a PRIMEIRA linha da description: o resto são os nove
    // itens sorteados, que naturalmente citam runas e não podem entrar na
    // conferência — foi o erro da primeira versão deste teste.
    const fraseMetodo = renderDraw(drawAll(SEEDS[0]).runas, locale).description.split("\n")[0]
    const semRev = RUNES.filter((x) => !x.reversaoNaFonte)
    confere(`E · ${locale}: a copy lista as 9 sem reversão`,
      semRev.every((r) => fraseMetodo.includes(r.name)),
      semRev.filter((r) => !fraseMetodo.includes(r.name)).map((r) => r.name).join(", "))
    const comRev = RUNES.filter((x) => x.reversaoNaFonte)
    confere(`E · ${locale}: a copy não lista nenhuma das 15`,
      comRev.every((r) => !fraseMetodo.includes(r.name)),
      comRev.filter((r) => fraseMetodo.includes(r.name)).map((r) => r.name).join(", "))
    confere(`E · ${locale}: a copy cita Nauthiz entre as sem reversão`, fraseMetodo.includes("Nauthiz"))
  }
}

// ── F · envelope dos trechos ──────────────────────────────────────────────
function parteF() {
  for (const locale of LOCALES as readonly Locale[]) {
    let maior = 0
    for (const f of RUNAS_FICHAS) for (const inv of [false, true]) {
      maior = Math.max(maior, trechoDaRuna(f, inv, locale).replace(/\s+/g, " ").length)
    }
    confere(`F · ${locale}: nenhum trecho de runa passa de 320`, maior <= 320, `maior ${maior}`)
  }
}

async function main() {
  parteA()
  parteB()
  parteC()
  await parteD()
  await parteE()
  parteF()
  if (falhas.length) {
    console.error(`\nA referência das runas falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas) console.error(`  ${f}`)
    console.error("")
    process.exit(1)
  }
  console.log(`referência das runas: ${conferidos} conferências, 24 fichas, 15 com reversão e 9 sem, RNG preservado`)
}

main()
