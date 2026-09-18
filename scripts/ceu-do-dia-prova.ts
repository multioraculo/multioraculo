/**
 * Prova da síntese coletiva do céu: a leitura que vale para todo mundo.
 *
 * CHAMADA PAGA à OpenAI. É ferramenta de avaliação, não código de produto: não
 * grava nada, não tem cache e não entra em rota nenhuma.
 *
 * DUAS CAMADAS, e a separação é o ponto.
 *
 * A camada factual mostra a configuração com todos os nomes: "Sol em Virgem ·
 * Lua quarto crescente em Sagitário", "Mercúrio oposição Saturno". Ela é a
 * prova, e fica visível.
 *
 * A camada interpretativa traduz o que aquilo estabelece e NÃO repete nome de
 * planeta, de signo, de aspecto nem de fase. Quem lê não deveria precisar
 * decodificar astrologia para entender a mensagem.
 *
 * Isso não afrouxa nada: cada termo da interpretação declara de qual pedaço de
 * qual fato ele saiu, e o verificador confere se aquela origem existe. O
 * cálculo continua inteiro por baixo; muda só o que sobe para a superfície.
 *
 *   node --import ./scripts/ts-register.mjs scripts/ceu-do-dia-prova.ts
 *   ... --dia 2026-09-21    (outro dia)
 *   ... --seco              (só os fatos e o prompt, sem chamar a OpenAI)
 */
import { config } from "dotenv"
import OpenAI from "openai"
import { estadoDoCeu, diaDeHoje, ORBE_MAX, ORBE_MAX_LUA, type Ceu, type Corpo } from "../lib/astro/ceu"
import { ASPECTOS, CORPOS as NOMES, FASES, LUNACOES, SIGNOS } from "../lib/astro/nomes"
import {
  ANGULO_ASPECTO,
  FUNCAO_VERBOS,
  GLOSA_ASPECTO,
  GLOSA_MOVIMENTO,
  LENTOS,
  LINHA_SIGNO,
} from "../lib/astro/simbolos"
import { PROIBIDAS, REGRAS_COMUNS, TRACOS } from "../lib/astro/editorial"

config({ path: ".env.local", quiet: true })

const MODELO = process.env.MODELO_ASTRO ?? "gpt-4o"
const TEMPERATURA = 0.7
const LOCALE = "pt" as const
const numero = (n: number) => n.toFixed(1).replace(".", ",")

// ---------------------------------------------------------------------------
// seleção coletiva: sem signo do leitor, e sem deixar os lentos dominarem
// ---------------------------------------------------------------------------

const BASE_ASPECTO: Record<string, number> = {
  conjunction: 1, opposition: 0.92, square: 0.88, trine: 0.72, sextile: 0.6, quincunx: 0.45,
}

/** Sem signo do leitor, o papel é só o que o corpo é para todo mundo. */
const PAPEL: Record<string, number> = {
  sun: 1.35, moon: 1.35, mercury: 1.1, venus: 1.1, mars: 1.1,
  jupiter: 0.95, saturn: 0.95, uranus: 0.75, neptune: 0.75, pluto: 0.75,
}

type Fato = {
  id: string
  /** o fato inteiro, com todos os nomes: é isto que o modelo lê */
  texto: string
  /** como ele aparece na camada factual da tela, curto */
  factual: string
  nota: number
  corpos: Corpo[]
  /**
   * De que pedaços deste fato um termo pode nascer. As origens são ATÔMICAS:
   * "Plutão" e "retrogradação de Plutão" são duas, e não uma. Foi assim que o
   * termo que dizia vir de um planeta retrógrado sem carregar nada da
   * retrogradação deixou de ser possível: se a revisão é para aparecer, ela
   * precisa ser declarada e escrita por conta própria.
   */
  origens: string[]
  /**
   * A base simbólica de cada origem, que já existe no produto: os verbos do
   * planeta, a linha do signo, a glosa do ângulo, a glosa da retrogradação. O
   * verificador usa isto para dois testes opostos: o termo não pode ser SÓ a
   * base (seria eco), e o termo de uma retrogradação precisa carregar alguma
   * noção dela (senão a origem foi declarada e não foi usada).
   */
  bases: Record<string, string[]>
}

function selecionar(ceu: Ceu, quantos: number): { escolhidos: Fato[]; todos: Fato[] } {
  const signos = SIGNOS[LOCALE]
  const nomes = NOMES[LOCALE]
  const aspectos = ASPECTOS[LOCALE]
  const onde = (corpo: Corpo) => ceu.posicoes.find((p) => p.corpo === corpo)!
  const candidatos: Fato[] = []

  for (const a of ceu.aspectos) {
    if (!BASE_ASPECTO[a.aspecto]) continue
    const orbeMax = a.a === "moon" || a.b === "moon" ? ORBE_MAX_LUA : ORBE_MAX
    const exatidao = 0.55 + 0.45 * (1 - Math.min(a.orbe, orbeMax) / orbeMax)
    const papel = (PAPEL[a.a] + PAPEL[a.b]) / 2
    // dois lentos a meio grau um do outro continuam sendo o fundo de uma
    // geração, e não o que mudou hoje
    const geracional = LENTOS.has(a.a) && LENTOS.has(a.b) ? 0.3 : 1
    const tempo = a.orbe < 0.2 ? 1.1 : a.aplicativo ? 1.08 : 0.96
    const pa = onde(a.a)
    const pb = onde(a.b)
    const origens = [nomes[a.a], signos[pa.signo], nomes[a.b], signos[pb.signo], aspectos[a.aspecto]]
    const bases: Record<string, string[]> = {
      [nomes[a.a]]: FUNCAO_VERBOS[LOCALE][a.a],
      [signos[pa.signo]]: [LINHA_SIGNO[LOCALE][pa.signo]],
      [nomes[a.b]]: FUNCAO_VERBOS[LOCALE][a.b],
      [signos[pb.signo]]: [LINHA_SIGNO[LOCALE][pb.signo]],
      [aspectos[a.aspecto]]: [GLOSA_ASPECTO[LOCALE][a.aspecto]],
    }
    if (pa.retrogrado) {
      origens.push(`retrogradação de ${nomes[a.a]}`)
      bases[`retrogradação de ${nomes[a.a]}`] = [GLOSA_MOVIMENTO[LOCALE].retrogrado]
    }
    if (pb.retrogrado) {
      origens.push(`retrogradação de ${nomes[a.b]}`)
      bases[`retrogradação de ${nomes[a.b]}`] = [GLOSA_MOVIMENTO[LOCALE].retrogrado]
    }
    candidatos.push({
      id: `aspecto:${a.a}~${a.b}:${a.aspecto}`,
      texto:
        `${nomes[a.a]} a ${numero(pa.grau)}° de ${signos[pa.signo]}${pa.retrogrado ? ", retrógrado" : ""}` +
        ` em ${aspectos[a.aspecto]} (${ANGULO_ASPECTO[a.aspecto]}°) com ` +
        `${nomes[a.b]} a ${numero(pb.grau)}° de ${signos[pb.signo]}${pb.retrogrado ? ", retrógrado" : ""}` +
        `, orbe ${numero(a.orbe)}°, ${a.aplicativo ? "aplicativo" : "separativo"}`,
      factual: `${nomes[a.a]} ${aspectos[a.aspecto]} ${nomes[a.b]}`,
      nota: BASE_ASPECTO[a.aspecto] * exatidao * papel * geracional * tempo,
      corpos: [a.a, a.b],
      origens,
      bases,
    })
  }

  for (const e of ceu.eventos) {
    const base = e.tipo === "eclipse" ? 2.2 : e.tipo === "lunacao" ? 1.8 : e.tipo === "estacao" ? 1.5 : 1.2
    const corpo: Corpo = e.tipo === "estacao" || e.tipo === "ingresso" ? e.corpo : "moon"
    const texto =
      e.tipo === "lunacao"
        ? `fase exata hoje: ${LUNACOES[LOCALE][e.fase] ?? e.fase}, a ${numero(e.grau)}° de ${signos[e.signo]}`
        : e.tipo === "eclipse"
          ? `Eclipse ${e.especie === "solar" ? "solar" : "lunar"} a ${numero(e.grau)}° de ${signos[e.signo]}`
          : e.tipo === "estacao"
            ? `${nomes[e.corpo]} estaciona e fica ${e.sentido === "direct" ? "direto" : "retrógrado"} a ${numero(e.grau)}° de ${signos[e.signo]}`
            : `${nomes[e.corpo]} entra em ${signos[e.signo]}`
    const origens = [nomes[corpo], signos[e.signo]]
    const bases: Record<string, string[]> = {
      [nomes[corpo]]: FUNCAO_VERBOS[LOCALE][corpo],
      [signos[e.signo]]: [LINHA_SIGNO[LOCALE][e.signo]],
    }
    if (e.tipo === "lunacao") {
      const fase = LUNACOES[LOCALE][e.fase] ?? e.fase
      origens.push(fase)
      bases[fase] = [FASES[LOCALE][ceu.faseLua]]
    }
    if (e.tipo === "estacao") {
      const nome = e.sentido === "direct" ? "retomada de movimento" : `retrogradação de ${nomes[e.corpo]}`
      origens.push(nome)
      bases[nome] = [GLOSA_MOVIMENTO[LOCALE].retrogrado]
    }
    candidatos.push({
      id: `evento:${e.tipo}`,
      texto,
      factual: texto,
      nota: base,
      corpos: e.tipo === "estacao" || e.tipo === "ingresso" ? [e.corpo] : ["moon", "sun"],
      origens,
      bases,
    })
  }

  const ordenados = [...candidatos].sort((x, y) => y.nota - x.nota)
  const escolhidos: Fato[] = []
  const restantes = [...ordenados]
  while (escolhidos.length < quantos && restantes.length) {
    let melhor = 0
    let melhorNota = -1
    restantes.forEach((c, i) => {
      const repetidos = c.corpos.filter((corpo) => escolhidos.some((e) => e.corpos.includes(corpo))).length
      const nota = c.nota * (repetidos === 0 ? 1 : repetidos === 1 ? 0.6 : 0.35)
      if (nota > melhorNota) {
        melhorNota = nota
        melhor = i
      }
    })
    escolhidos.push(restantes.splice(melhor, 1)[0])
  }
  return { escolhidos, todos: ordenados }
}

/** As duas linhas que aparecem na tela com todos os nomes. */
function camadaFactual(ceu: Ceu, escolhidos: Fato[]): string[] {
  const signos = SIGNOS[LOCALE]
  const sol = ceu.posicoes.find((p) => p.corpo === "sun")!
  const lua = ceu.posicoes.find((p) => p.corpo === "moon")!
  const primeira = `Sol em ${signos[sol.signo]} · Lua ${FASES[LOCALE][ceu.faseLua]} em ${signos[lua.signo]}`
  const segunda = escolhidos.filter((f) => f.id.startsWith("aspecto:")).map((f) => f.factual).join(" · ")
  return segunda ? [primeira, segunda] : [primeira]
}

// ---------------------------------------------------------------------------
// o prompt
// ---------------------------------------------------------------------------

const SISTEMA = `Você escreve a leitura coletiva do céu de hoje no Multioráculo, em português do Brasil.

Ela vale para todas as pessoas, sem exceção: não é horóscopo de signo e não é leitura pessoal.

${REGRAS_COMUNS}

DUAS CAMADAS, E VOCÊ ESCREVE SÓ A SEGUNDA
A tela já mostra a configuração com todos os nomes, logo acima do seu texto: "Sol em Virgem · Lua quarto crescente em Sagitário", "Mercúrio oposição Saturno". A prova já está dada ali.

Por isso a sua síntese NÃO REPETE NOME NENHUM: nem de planeta, nem de signo, nem de aspecto, nem de fase. Quem lê não deveria precisar decodificar astrologia para entender a mensagem.

Em vez de "Mercúrio em Libra em oposição a Saturno retrógrado em Áries marca um confronto entre comunicação e estrutura", escreva algo como "Pensamento e limite ficam frente a frente, e comparação e definição entram no mesmo movimento".

ISSO NÃO AUTORIZA GENERALIZAR
Cada TERMO que você usar nasce de um pedaço declarado de um fato, e você declara qual. "Comparação" pode vir de Libra. "Limite" pode vir de Saturno. "Ampliar o campo" pode vir de Sagitário. O que não pode é um termo que caberia em qualquer outro dia.

O TERMO PRECISA CARREGAR O QUE É ESPECÍFICO DA ORIGEM
As origens são atômicas, e cada uma sustenta um termo só. "Plutão" e "retrogradação de Plutão" são duas origens diferentes: se você declarar a retrogradação, o termo precisa trazer o movimento de volta, como revisão, retomada, retorno ou algo que ainda está sendo revisto. "Transformação profunda" não serve como termo da retrogradação, porque a retrogradação não participa dele; ela serviria como termo de "Plutão", e aí a revisão precisa de um termo próprio.

E o termo não pode ser apenas a base da origem repetida. Ele situa aquilo no que está acontecendo hoje.

O QUE DEVOLVER
- termos: de 3 a 5 entradas com texto e origem. A origem é exatamente uma das ORIGENS listadas no fato. O texto é a palavra ou expressão curta como ela aparece na síntese.
- sintese: DUAS frases, no máximo 45 palavras somadas, contendo todos os termos. Sem cauda explicativa no fim: se a frase já disse o que tinha para dizer, ela acaba.

O MOVIMENTO PRIMEIRO, O ENCONTRO DEPOIS. A primeira frase nomeia o que está sendo mobilizado hoje. A segunda nomeia o que esse movimento encontra: o que o sustenta, o que o atravessa, o que o revisa. Quem lê não sabe astrologia e precisa entender a frase como entenderia qualquer outra em português.

PELO MENOS UM TERMO VEM DE UM ÂNGULO. O que mudou hoje é a relação entre os corpos, não a qualidade de cada um deles isolado. Uma síntese que só enfileira qualidades de planetas e signos perdeu a notícia.

VOCÊ NÃO SABE NADA SOBRE QUEM LÊ. Não nomeie esfera nenhuma da vida: nem relações, vínculos, afetos, trabalho, dinheiro ou saúde.

NÃO ESCREVA CONSELHO NEM PEDIDO. O céu não exige, não pede, não demanda, não convida, não favorece, não sugere e não desafia ninguém. Escreva no indicativo o que está posto, o que se aproxima, o que se separa, o que fica em tensão.

Devolva JSON: {"termos": [{"texto": "...", "origem": "..."}], "sintese": "..."}`

function prompt(ceu: Ceu, escolhidos: Fato[]): string {
  const signos = SIGNOS[LOCALE]
  const sol = ceu.posicoes.find((p) => p.corpo === "sun")!
  const lua = ceu.posicoes.find((p) => p.corpo === "moon")!
  const retro = ceu.posicoes.filter((p) => p.retrogrado).map((p) => NOMES[LOCALE][p.corpo])

  const linhas = [
    `DIA: ${ceu.dia}`,
    "",
    "O CÉU, EM GERAL",
    `Sol a ${numero(sol.grau)}° de ${signos[sol.signo]}.`,
    `Lua a ${numero(lua.grau)}° de ${signos[lua.signo]}, fase ${FASES[LOCALE][ceu.faseLua]}.`,
    retro.length ? `Retrógrados hoje: ${retro.join(", ")}.` : "Nenhum planeta retrógrado hoje.",
    "",
    "FATOS DO DIA (escreva só sobre estes)",
  ]
  escolhidos.forEach((f, i) => {
    linhas.push(`${i + 1}. ${f.texto}`)
    linhas.push(`   ORIGENS possíveis: ${f.origens.join(" | ")}`)
  })
  return linhas.join("\n")
}

// ---------------------------------------------------------------------------
// verificador
// ---------------------------------------------------------------------------

type Saida = { termos: Array<{ texto: string; origem: string }>; sintese: string }

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const significativas = (texto: string) =>
  semAcento(texto)
    .split(/[^\p{L}]+/u)
    .filter((p) => p.length >= 4)

/**
 * O termo é NADA ALÉM da base da origem?
 *
 * Um termo que vem da função de um planeta vai usar as palavras dela, e isso é
 * honesto. O que não vale é ele ser só isso: repetir a base não interpreta
 * nada. É a mesma regra do horóscopo, e o corte é total, não proporcional.
 */
function ecoTotal(texto: string, base: string[]): boolean {
  const doTermo = significativas(texto)
  if (!doTermo.length) return false
  const daBase = new Set(base.flatMap(significativas))
  return doTermo.every((p) => daBase.has(p))
}

/**
 * Noções que sustentam uma retrogradação, derivadas da própria glosa do
 * produto: "movimento aparente para trás, um tema que volta para revisão".
 *
 * Não é uma lista de palavras obrigatórias e sim de RAÍZES: revisto, revisão,
 * revisada, retomada, retorno, volta, refazer e reexame passam todas. O que
 * não passa é declarar que o termo veio da retrogradação e não trazer nada
 * dela, que foi exatamente o caso de "transformação profunda".
 */
const NOCOES_RETROGRADACAO = ["revis", "rever", "reve", "retom", "retorn", "volt", "refaz", "reexam", "atras"]

function carregaRetrogradacao(texto: string): boolean {
  const t = semAcento(texto)
  return NOCOES_RETROGRADACAO.some((raiz) => t.includes(raiz))
}

function verificar(saida: Saida, escolhidos: Fato[]): string[] {
  const falhas: string[] = []
  const texto = saida.sintese

  // 1. a superfície não nomeia astrologia: os nomes ficam na camada factual
  const proibidoNomear = [
    ...Object.values(NOMES[LOCALE]).filter(Boolean),
    ...SIGNOS[LOCALE],
    ...Object.values(ASPECTOS[LOCALE]),
    ...FASES[LOCALE],
  ]
  for (const nome of proibidoNomear) {
    if (new RegExp(`(^|[^\\p{L}])${nome}([^\\p{L}]|$)`, "iu").test(texto)) {
      falhas.push(`a síntese nomeia "${nome}"`)
    }
  }

  // 2. cada termo declara uma origem que existe, e aparece de fato na síntese
  const origensValidas = new Set(escolhidos.flatMap((f) => f.origens))
  const baseDaOrigem = new Map<string, string[]>()
  const fatoDaOrigem = new Map<string, string>()
  for (const f of escolhidos) {
    for (const o of f.origens) {
      baseDaOrigem.set(o, f.bases[o] ?? [])
      if (!fatoDaOrigem.has(o)) fatoDaOrigem.set(o, f.id)
    }
  }

  if (saida.termos.length < 3 || saida.termos.length > 5) {
    falhas.push(`${saida.termos.length} termos (queremos 3 a 5)`)
  }

  const usadas = new Set<string>()
  for (const t of saida.termos) {
    if (!origensValidas.has(t.origem)) {
      falhas.push(`"${t.texto}" declara origem "${t.origem}", que não existe nos fatos`)
      continue
    }
    if (!semAcento(texto).includes(semAcento(t.texto))) falhas.push(`"${t.texto}" não aparece na síntese`)

    // 2a. duas vezes a mesma origem é a mesma coisa dita duas vezes
    if (usadas.has(t.origem)) falhas.push(`origem "${t.origem}" usada por mais de um termo`)
    usadas.add(t.origem)

    // 2b. o termo não pode ser só a base da origem
    if (ecoTotal(t.texto, baseDaOrigem.get(t.origem) ?? [])) {
      falhas.push(`"${t.texto}" é só a base de "${t.origem}", não interpreta nada`)
    }

    // 2c. ESPECIFICIDADE: declarar a retrogradação e não trazer nada dela é
    // o que fazia "transformação profunda" passar vindo de um planeta
    // retrógrado. Agora a origem só é aceita se o termo a sustentar.
    if (t.origem.startsWith("retrogradação") && !carregaRetrogradacao(t.texto)) {
      falhas.push(`"${t.texto}" vem de "${t.origem}" mas não carrega o movimento de volta`)
    }
  }

  // 2d. a síntese não pode se fechar num fato só
  const fatosCobertos = new Set([...usadas].map((o) => fatoDaOrigem.get(o)))
  if (fatosCobertos.size < 2) falhas.push("todos os termos vêm do mesmo fato")

  // 2e. o ângulo é a notícia do dia: pelo menos um termo precisa vir de um.
  // Sem isso a síntese vira uma lista de qualidades de planetas e signos, e
  // some justamente a relação entre eles, que é o que mudou hoje.
  const angulos = new Set(Object.values(ASPECTOS[LOCALE]))
  const temAnguloDisponivel = escolhidos.some((f) => f.origens.some((o) => angulos.has(o)))
  if (temAnguloDisponivel && ![...usadas].some((o) => angulos.has(o))) {
    falhas.push("nenhum termo vem de um ângulo: a relação entre os corpos ficou de fora")
  }

  // 3. as regras editoriais que já valem no resto do produto
  for (const proibida of PROIBIDAS[LOCALE]) {
    const achou = texto.match(proibida)
    if (achou) falhas.push(`expressão proibida: "${achou[0].trim()}"`)
  }
  if (TRACOS.test(texto)) falhas.push("usa travessão")
  if (/arquetíp|arquétip/i.test(texto)) falhas.push('usa a palavra "arquétipo"')

  const CONSELHO = /(exig|ped(e|indo)|demand|convid|favorec|desafi|propõe|sugere|aconselha)\w*/gi
  for (const achou of texto.matchAll(CONSELHO)) falhas.push(`fala como conselho: "${achou[0]}"`)
  const VIDA = /(afetiv|afeto|amoros|relaç|relacionament|vínculo|trabalh|carreir|financ|dinheiro|saúde|família)\w*/gi
  for (const achou of texto.matchAll(VIDA)) falhas.push(`inventa esfera de vida: "${achou[0]}"`)

  const frases = texto.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (frases.length !== 2) falhas.push(`${frases.length} frases (queremos 2)`)
  const palavras = texto.trim().split(/\s+/).length
  if (palavras > 45) falhas.push(`${palavras} palavras, acima de 45`)

  return falhas
}

// ---------------------------------------------------------------------------

async function main() {
  const argv = process.argv
  const dia = argv.includes("--dia") ? argv[argv.indexOf("--dia") + 1] : diaDeHoje()
  const seco = argv.includes("--seco")

  const ceu = estadoDoCeu(dia)
  const { escolhidos, todos } = selecionar(ceu, 3)

  console.log("\nRANKING COLETIVO DE " + dia)
  console.log("=".repeat(28))
  todos.slice(0, 9).forEach((c) => {
    const marca = escolhidos.some((e) => e.id === c.id) ? "→" : " "
    console.log(`${marca} ${c.nota.toFixed(3).padStart(6)}  ${c.texto}`)
  })

  const corpo = prompt(ceu, escolhidos)
  console.log("\nO QUE O MODELO RECEBE")
  console.log("=".repeat(21))
  console.log(corpo)

  if (seco) return

  const chave = process.env.OPENAI_API_KEY
  if (!chave) throw new Error("OPENAI_API_KEY não está definido (.env.local)")
  const openai = new OpenAI({ apiKey: chave })

  const t0 = Date.now()
  const TENTATIVAS = 4
  let saida: Saida = { termos: [], sintese: "" }
  let falhas: string[] = []
  let entrada = 0
  let tokensSaida = 0
  let usadas = 0

  console.log("\nTENTATIVAS")
  console.log("=".repeat(10))

  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    usadas = tentativa
    const mensagens: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: SISTEMA },
      { role: "user", content: corpo },
    ]
    // a tentativa seguinte recebe o texto reprovado e o motivo, como o
    // horóscopo já faz: sai mais barato corrigir do que sortear de novo
    if (saida.sintese) {
      mensagens.push({ role: "assistant", content: JSON.stringify(saida) })
      mensagens.push({
        role: "user",
        content: `Reprovado: ${falhas.join("; ")}. Reescreva corrigindo isso e mantendo os mesmos fatos.`,
      })
    }
    const res = await openai.chat.completions.create({
      model: MODELO,
      temperature: TEMPERATURA,
      response_format: { type: "json_object" },
      messages: mensagens,
    })
    entrada += res.usage?.prompt_tokens ?? 0
    tokensSaida += res.usage?.completion_tokens ?? 0
    const bruto = JSON.parse(res.choices[0]?.message?.content ?? "{}")
    saida = {
      termos: Array.isArray(bruto.termos) ? bruto.termos : [],
      sintese: String(bruto.sintese ?? "").trim(),
    }
    falhas = verificar(saida, escolhidos)
    console.log(`  ${tentativa}. ${falhas.length ? falhas.join("; ") : "APROVADA"}`)
    console.log(`     ${saida.sintese}`)
    if (!falhas.length) break
  }
  const segundos = ((Date.now() - t0) / 1000).toFixed(1)

  console.log("\nCOMO FICA NA TELA")
  console.log("=".repeat(16))
  console.log("  O CÉU DE HOJE")
  for (const linha of camadaFactual(ceu, escolhidos)) console.log("  " + linha)
  console.log("")
  console.log("  EM RESUMO")
  console.log("  " + saida.sintese)

  console.log("\nRASTREAMENTO (não aparece na tela)")
  console.log("=".repeat(33))
  for (const t of saida.termos) console.log(`  "${t.texto}"  vem de  ${t.origem}`)

  console.log("\nVERIFICADOR")
  console.log("=".repeat(11))
  if (falhas.length) {
    for (const f of falhas) console.log(`  FALHA  ${f}`)
    console.log("  esgotou as tentativas: em produção esta camada não apareceria hoje.")
  } else {
    console.log(`  aprovada na tentativa ${usadas}.`)
    console.log("  a síntese não nomeia planeta, signo, aspecto nem fase;")
    console.log("  todo termo declara uma origem que existe nos fatos e aparece no texto;")
    console.log("  nenhum verbo de conselho, nenhuma esfera de vida, duas frases no limite.")
  }

  const custo = (entrada * 2.5 + tokensSaida * 10) / 1_000_000
  console.log(
    `\n${MODELO} · ${segundos}s · ${usadas} tentativa(s) · ${entrada} entrada + ${tokensSaida} saída · US$ ${custo.toFixed(4)}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
