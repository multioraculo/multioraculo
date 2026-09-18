/**
 * Proteção do cache do horóscopo: linha em formato incompatível nunca vira tela.
 *
 * O cache guarda `leitura` e `cards` como JSON. Quando o formato da leitura
 * mudou, as linhas escritas pela versão anterior continuaram lá, e a página
 * quebrou no primeiro campo que já não existia. A correção na época foi apagar
 * a tabela na mão, o que só funciona se alguém lembrar, e no dia certo.
 *
 * Este teste trava a regra que substituiu aquilo:
 *   cache válido       → usa
 *   cache incompatível → ignora, e o fluxo normal gera de novo por cima
 *
 * Três partes:
 *   A. lerLinhaGravada contra o formato de hoje e contra quinze formas de estar
 *      errado, uma delas o formato antigo de verdade, recuperado do commit em
 *      que ele mudou;
 *   B. a prova de que aquele formato quebrava mesmo: os acessos que a tela faz
 *      são executados sobre a linha antiga e precisam estourar. Sem isto o
 *      teste passaria mesmo que a validação não fosse necessária;
 *   C. lerCache e horoscopoDoSigno de ponta a ponta, contra um PostgREST falso,
 *      conferindo que a linha incompatível devolve nulo, que a geração acontece,
 *      e que a gravação passa POR CIMA da linha velha em vez de desistir dela.
 *
 * Não gasta chamada paga: o modelo é substituído por uma função que devolve uma
 * leitura fixa, e essa leitura é conferida pelo verificador de verdade antes de
 * qualquer outra coisa, para o teste não se apoiar num texto que já não seria
 * aceito hoje.
 */
import http from "http"
import type { AddressInfo } from "net"
import { prepararDia } from "../lib/astro/horoscopo"
import { lerLinhaGravada } from "../lib/astro/linha-gravada"
import { verificarLeitura } from "../lib/astro/verificador"

const DIA = "2026-09-16"
const SIGNO = 5
const LOCALE = "pt" as const

const falhas: string[] = []
let conferidos = 0

function confere(titulo: string, condicao: boolean, detalhe = "") {
  conferidos += 1
  if (!condicao) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

/** Cópia funda, para um caso não sujar o outro. */
const copia = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T

// ── o material ──────────────────────────────────────────────────────────────

const { cards } = prepararDia(DIA, SIGNO, LOCALE)

/**
 * Uma leitura no formato de hoje, escrita à mão e aprovada pelo verificador de
 * verdade. Se a seleção de movimentos deste dia mudar, o verificador reprova
 * aqui e o teste diz que a fixture envelheceu, em vez de falhar adiante sem
 * explicação.
 */
const LEITURA_DE_HOJE = {
  foco: "Revisão profunda pesa sobre o que se quer firmar.",
  relacoes: [
    {
      n: 1,
      termos: [] as Array<{ texto: string; origem: string }>,
      explicacao:
        "Mercúrio, que rege Virgem, está em Libra a 9,7 graus, e de lá faz oposição a Saturno em Áries. O regente do signo trabalha comparando, e encontra resistência do outro lado.",
    },
    {
      n: 2,
      termos: [
        { texto: "vínculo que se firma", origem: "planetaA" },
        { texto: "revisão profunda", origem: "movimentoB" },
      ],
      explicacao:
        "Vênus em Escorpião a 3,7 graus forma quadratura de 89,5 graus com Plutão retrógrado em Aquário, orbe de 0,5 grau, já separativo. Para Virgem, o que Vênus quer firmar volta à mesa enquanto Plutão anda para trás.",
    },
    {
      n: 3,
      termos: [] as Array<{ texto: string; origem: string }>,
      explicacao:
        "O Sol atravessa Virgem a 23,8 graus, no próprio território do signo, e faz sextil com Marte em Câncer. O ano solar passa pelo ponto em que o signo é mais ele mesmo.",
    },
  ],
}

/**
 * O formato ANTERIOR, recuperado de lib/astro/prompt-horoscopo.ts e
 * lib/astro/apresentar.ts no commit 5a09bb6^:
 *
 *   RelacaoEscrita = { n, polaridade: [string, string], explicacao }
 *   Leitura        = { foco, relacoes, tendencias }
 *   CardMovimento  = sem forma, aspecto, tituloSemSigno, anguloReal, orbe,
 *                    aplicativo nem contexto
 *   LadoCard       = sem signo, nomeSigno, campo, grau, grauTexto, retrogrado
 *
 * Não é uma invenção do teste: é o que estava gravado em produção no dia em
 * que a tela quebrou.
 */
const LEITURA_ANTIGA = {
  foco: "Um ajuste fino entre o que se quer e o que resiste.",
  relacoes: [
    { n: 1, polaridade: ["comparação", "limite"], explicacao: "Mercúrio em Libra faz oposição a Saturno." },
    { n: 2, polaridade: ["vínculo", "revisão"], explicacao: "Vênus em quadratura com Plutão retrógrado." },
    { n: 3, polaridade: ["identidade", "ação"], explicacao: "Sol em Virgem em sextil com Marte." },
  ],
  tendencias: { texto: "Dia de acerto.", disponivel: "clareza", emJogo: "o que já estava pronto" },
}

const CARDS_ANTIGOS = [
  {
    id: "regente:mercury",
    tipo: "posicao",
    a: {
      corpo: "mercury",
      nome: "Mercúrio",
      funcoes: "mente, troca, medida",
      verbos: ["pensa", "troca", "mede"],
      regente: true,
      rotuloRegente: "regente de Virgem",
    },
    b: null,
    simbolo: null,
    titulo: "Mercúrio em Libra",
    detalhe: "9,7°",
    glosa: "Mercúrio, que rege o signo, está passando por Libra.",
    mencoes: { corpos: ["mercury"], signos: [6], aspectos: [] },
  },
  {
    id: "aspecto:venus~pluto:square",
    tipo: "aspecto",
    a: {
      corpo: "venus",
      nome: "Vênus",
      funcoes: "valor, vínculo, gosto",
      verbos: ["aproxima", "valora", "escolhe"],
      regente: false,
      rotuloRegente: null,
    },
    b: {
      corpo: "pluto",
      nome: "Plutão",
      funcoes: "fundo, poder, corte",
      verbos: ["revolve", "expõe", "transforma"],
      regente: false,
      rotuloRegente: null,
    },
    simbolo: "□",
    titulo: "quadratura",
    detalhe: "89,5°, orbe 0,5°, separativo",
    glosa: "duas forças que se atravessam.",
    mencoes: { corpos: ["venus", "pluto"], signos: [7, 10], aspectos: ["square"] },
  },
  {
    id: "posicao:sun",
    tipo: "posicao",
    a: {
      corpo: "sun",
      nome: "Sol",
      funcoes: "centro, vida, direção",
      verbos: ["ilumina", "conduz", "afirma"],
      regente: false,
      rotuloRegente: null,
    },
    b: null,
    simbolo: null,
    titulo: "Sol em Virgem",
    detalhe: "23,8°",
    glosa: "Sol atravessa o próprio território do signo.",
    mencoes: { corpos: ["sun"], signos: [5], aspectos: ["sextile"] },
  },
]

// ── A. a forma da linha ─────────────────────────────────────────────────────

function parteA() {
  const veredito = verificarLeitura({ bruto: LEITURA_DE_HOJE, cards, signo: SIGNO, locale: LOCALE })
  confere(
    "a fixture de hoje ainda é aceita pelo verificador",
    veredito.ok,
    veredito.ok ? "" : `a seleção de ${DIA} mudou; atualize a fixture. ${veredito.violacoes.join("; ")}`,
  )

  const aceita = lerLinhaGravada({ leitura: copia(LEITURA_DE_HOJE), cards: copia(cards) })
  confere("linha no formato de hoje é aceita", aceita !== null)
  confere("a leitura aceita chega inteira", aceita?.leitura.relacoes.length === cards.length)
  confere("os cards aceitos chegam inteiros", aceita?.cards.length === cards.length)

  const recusas: Array<[string, { leitura: unknown; cards: unknown }]> = [
    ["o formato antigo inteiro", { leitura: LEITURA_ANTIGA, cards: CARDS_ANTIGOS }],
    ["leitura antiga com cards de hoje", { leitura: LEITURA_ANTIGA, cards: copia(cards) }],
    ["cards antigos com leitura de hoje", { leitura: copia(LEITURA_DE_HOJE), cards: CARDS_ANTIGOS }],
  ]

  const semTermos = copia(LEITURA_DE_HOJE) as Record<string, any>
  delete semTermos.relacoes[1].termos
  recusas.push(["relação sem termos", { leitura: semTermos, cards: copia(cards) }])

  const termosDemais = copia(LEITURA_DE_HOJE) as Record<string, any>
  termosDemais.relacoes[0].termos = [
    { texto: "um termo", origem: "planetaA" },
    { texto: "outro termo", origem: "signoA" },
  ]
  recusas.push(["termos numa posição, que não admite nenhum", { leitura: termosDemais, cards: copia(cards) }])

  const termoDeMenos = copia(LEITURA_DE_HOJE) as Record<string, any>
  termoDeMenos.relacoes[1].termos = [{ texto: "vínculo que se firma", origem: "planetaA" }]
  recusas.push(["um termo só num contraste, que pede dois", { leitura: termoDeMenos, cards: copia(cards) }])

  const relacaoDeMenos = copia(LEITURA_DE_HOJE) as Record<string, any>
  relacaoDeMenos.relacoes.pop()
  recusas.push(["menos relações do que cards", { leitura: relacaoDeMenos, cards: copia(cards) }])

  const foraDeOrdem = copia(LEITURA_DE_HOJE) as Record<string, any>
  foraDeOrdem.relacoes[0].n = 3
  foraDeOrdem.relacoes[2].n = 1
  recusas.push(["relações fora da ordem dos cards", { leitura: foraDeOrdem, cards: copia(cards) }])

  const focoVazio = copia(LEITURA_DE_HOJE) as Record<string, any>
  focoVazio.foco = "   "
  recusas.push(["foco vazio", { leitura: focoVazio, cards: copia(cards) }])

  const origemInventada = copia(LEITURA_DE_HOJE) as Record<string, any>
  origemInventada.relacoes[1].termos[0].origem = "intuicao"
  recusas.push(["termo com origem que não existe", { leitura: origemInventada, cards: copia(cards) }])

  const semContexto = copia(cards) as any[]
  delete semContexto[0].contexto
  recusas.push(["card sem contexto", { leitura: copia(LEITURA_DE_HOJE), cards: semContexto }])

  const semVerbos = copia(cards) as any[]
  delete semVerbos[1].a.verbos
  recusas.push(["lado sem verbos", { leitura: copia(LEITURA_DE_HOJE), cards: semVerbos }])

  const formaEstranha = copia(cards) as any[]
  formaEstranha[1].forma = "diagonal"
  recusas.push(["card com forma que não existe", { leitura: copia(LEITURA_DE_HOJE), cards: formaEstranha }])

  const orbeTexto = copia(cards) as any[]
  orbeTexto[1].orbe = "0,5"
  recusas.push(["orbe como texto em vez de número", { leitura: copia(LEITURA_DE_HOJE), cards: orbeTexto }])

  recusas.push(["leitura nula", { leitura: null, cards: copia(cards) }])
  recusas.push(["cards nulos", { leitura: copia(LEITURA_DE_HOJE), cards: null }])
  recusas.push(["cards vazios", { leitura: copia(LEITURA_DE_HOJE), cards: [] }])
  recusas.push(["leitura que é texto", { leitura: "uma leitura", cards: copia(cards) }])

  for (const [nome, bruto] of recusas) {
    let resultado: unknown = null
    try {
      resultado = lerLinhaGravada(bruto)
    } catch (e) {
      falhas.push(`${nome}: lerLinhaGravada estourou com "${(e as Error).message}" em vez de devolver nulo`)
      conferidos += 1
      continue
    }
    confere(`recusa: ${nome}`, resultado === null, "foi aceita")
  }
}

// ── B. a prova de que a linha antiga quebrava ───────────────────────────────

/**
 * Os acessos que a tela faz, copiados de components/horoscope-page.tsx. Não é
 * uma imitação do render: são as expressões que estouram quando o campo não
 * existe, e é por elas que a página caía.
 */
const ACESSOS_DA_TELA: Array<{ onde: string; ler: (leitura: any, cards: any) => unknown }> = [
  { onde: "relacao.termos.length", ler: (l) => l.relacoes[0].termos.length },
  { onde: "card.contexto.length", ler: (_l, c) => c[0].contexto.length },
  { onde: "card.detalhe.split", ler: (_l, c) => c[0].detalhe.split(", ") },
]

function parteB() {
  const estouraram: string[] = []
  for (const acesso of ACESSOS_DA_TELA) {
    try {
      acesso.ler(LEITURA_ANTIGA, CARDS_ANTIGOS)
    } catch {
      estouraram.push(acesso.onde)
    }
  }
  confere(
    "a linha antiga quebra a tela se chegar até ela",
    estouraram.length > 0,
    "nenhum acesso da tela estourou; a fixture antiga não representa mais o problema",
  )

  const guardada = lerLinhaGravada({ leitura: LEITURA_ANTIGA, cards: CARDS_ANTIGOS })
  confere("e nunca chega, porque a validação devolve nulo antes", guardada === null)

  for (const acesso of ACESSOS_DA_TELA) {
    conferidos += 1
    try {
      acesso.ler(LEITURA_DE_HOJE, cards)
    } catch (e) {
      falhas.push(`a linha de hoje estourou em ${acesso.onde}: ${(e as Error).message}`)
    }
  }

  return estouraram
}

// ── C. lerCache e a regeneração, contra um PostgREST falso ──────────────────

type Pedido = { metodo: string; url: string; prefer: string }

async function parteC() {
  let linha: unknown = null
  const pedidos: Pedido[] = []

  const servidor = http.createServer((req, res) => {
    let corpo = ""
    req.on("data", (c) => (corpo += String(c)))
    req.on("end", () => {
      pedidos.push({ metodo: req.method ?? "", url: req.url ?? "", prefer: String(req.headers.prefer ?? "") })
      res.writeHead(req.method === "POST" ? 201 : 200, { "Content-Type": "application/json" })
      // a sondagem de cacheDisponivel pede só a coluna dia e espera uma lista
      if (req.method === "GET" && req.url?.includes("select=dia&")) return res.end("[]")
      if (req.method === "GET") return res.end(JSON.stringify(linha))
      res.end("[]")
    })
  })

  await new Promise<void>((pronto) => servidor.listen(0, "127.0.0.1", pronto))
  const porta = (servidor.address() as AddressInfo).port
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${porta}`
  process.env.SUPABASE_SERVICE_ROLE_KEY = "chave-de-teste"

  // importado só agora: antes disto o cliente não teria para onde apontar
  const { lerCache, horoscopoDoSigno } = await import("../lib/astro/horoscopo")

  const gravada = (l: unknown, c: unknown) => ({ leitura: l, cards: c, model: "gpt-4o", tentativas: 1 })

  let chamadas = 0
  const gerar = async () => {
    chamadas += 1
    return { conteudo: JSON.stringify(LEITURA_DE_HOJE), model: "gpt-4o-teste" }
  }

  // 1. linha válida: lerCache devolve, e o modelo não é chamado
  linha = gravada(copia(LEITURA_DE_HOJE), copia(cards))
  const valida = await lerCache(DIA, SIGNO, LOCALE)
  confere("linha válida: lerCache devolve a leitura", valida !== null && valida.leitura !== null)
  confere("linha válida: marcada como vinda do cache", valida?.cache === true)
  confere("linha válida: o foco é o que estava gravado", valida?.leitura?.foco === LEITURA_DE_HOJE.foco)

  chamadas = 0
  const doCache = await horoscopoDoSigno({ dia: DIA, signo: SIGNO, locale: LOCALE, gerar })
  confere("linha válida: o modelo não é chamado", chamadas === 0, `foi chamado ${chamadas} vez(es)`)
  confere("linha válida: a leitura entregue é a gravada", doCache.leitura?.foco === LEITURA_DE_HOJE.foco)

  // 2. linha antiga: lerCache devolve nulo e não estoura
  linha = gravada(LEITURA_ANTIGA, CARDS_ANTIGOS)
  let antiga: unknown = "não devolveu"
  try {
    antiga = await lerCache(DIA, SIGNO, LOCALE)
  } catch (e) {
    falhas.push(`lerCache estourou na linha antiga: ${(e as Error).message}`)
  }
  confere("linha antiga: lerCache devolve nulo", antiga === null)

  // 3. e a leitura é regerada normalmente, gravando POR CIMA da linha velha
  pedidos.length = 0
  chamadas = 0
  const regerada = await horoscopoDoSigno({ dia: DIA, signo: SIGNO, locale: LOCALE, gerar })
  confere("linha antiga: o modelo é chamado", chamadas === 1, `foi chamado ${chamadas} vez(es)`)
  confere("linha antiga: a leitura volta preenchida", regerada.leitura?.foco === LEITURA_DE_HOJE.foco)
  confere("linha antiga: não vem marcada como cache", regerada.cache === false)

  const gravacao = pedidos.find((p) => p.metodo === "POST")
  confere("linha antiga: a leitura nova é gravada", Boolean(gravacao))
  confere(
    "linha antiga: a gravação passa por cima da linha velha",
    gravacao?.prefer.includes("resolution=merge-duplicates") === true,
    `Prefer veio "${gravacao?.prefer}"; com ignore-duplicates a linha velha ficaria, e todo pedido seguinte pagaria uma geração sem nunca conseguir guardar`,
  )

  // 4. sem linha nenhuma: grava sem passar por cima de quem tenha chegado antes
  linha = null
  pedidos.length = 0
  chamadas = 0
  const nova = await horoscopoDoSigno({ dia: DIA, signo: SIGNO, locale: LOCALE, gerar })
  confere("sem linha: o modelo é chamado", chamadas === 1)
  confere("sem linha: a leitura volta preenchida", nova.leitura?.foco === LEITURA_DE_HOJE.foco)
  const primeira = pedidos.find((p) => p.metodo === "POST")
  confere(
    "sem linha: a gravação não atropela uma corrida",
    primeira?.prefer.includes("resolution=ignore-duplicates") === true,
    `Prefer veio "${primeira?.prefer}"`,
  )

  servidor.close()
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  parteA()
  const estouraram = parteB()
  await parteC()

  if (falhas.length) {
    console.error(`\nO cache do horóscopo falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas) console.error(`  ${f}`)
    console.error("")
    process.exit(1)
  }
  console.log(
    `cache do horóscopo: ${conferidos} conferências, formato antigo recusado ` +
      `(estouraria em ${estouraram.join(" e ")}) e leitura regerada por cima`,
  )
}

main()
