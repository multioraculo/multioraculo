/**
 * Prova da camada de linguagem do horóscopo: os mesmos fatos, dita de outro jeito.
 *
 * CHAMADA PAGA à OpenAI. Ferramenta de avaliação: não grava, não usa cache e
 * não toca em nada do produto.
 *
 * NADA MUDA ANTES DA PROSA. A seleção, o ranking, os cards, os orbes e o signo
 * vêm de `prepararDia`, exatamente os mesmos que a rota usa hoje. O que este
 * script troca é só o prompt da escrita.
 *
 * A REGRA NOVA: os planetas são a fonte, não o assunto. A mecânica já está na
 * tela, em Relações do Céu e no Céu de Hoje; a explicação não precisa recitá-la
 * de novo. Ela responde outra pergunta: como isso se reconhece na experiência?
 *
 * O rigor não muda de tamanho, muda de lugar. Cada termo continua declarando
 * de que pedaço de que fato saiu, e o verificador confere. O que sai da prosa
 * é o nome do planeta, não a origem dele.
 *
 *   node --import ./scripts/ts-register.mjs scripts/horoscopo-traduzido-prova.ts 5
 */
import { config } from "dotenv"
import OpenAI from "openai"
import { diaDeHoje } from "../lib/astro/ceu"
import { prepararDia } from "../lib/astro/horoscopo"
import { ASPECTOS, CORPOS, FASES, SIGNOS } from "../lib/astro/nomes"
import { REGRAS_COMUNS, PROIBIDAS, TRACOS } from "../lib/astro/editorial"
import type { CardMovimento } from "../lib/astro/apresentar"
import { estimateCostUsd } from "../lib/ai/pricing"

config({ path: ".env.local", quiet: true })

const MODELO = process.env.MODELO_ASTRO ?? "gpt-4o"
const TEMPERATURA = Number(process.env.TEMP_ASTRO ?? 0.7)
const locale = "pt" as const
const TENTATIVAS = 4

// ---------------------------------------------------------------------------
// as origens que cada card oferece, do mesmo jeito da síntese coletiva
// ---------------------------------------------------------------------------

function origensDoCard(card: CardMovimento): string[] {
  const fora: string[] = []
  const lados = [card.a, card.b].filter(Boolean) as CardMovimento["a"][]
  for (const lado of lados) {
    fora.push(lado.nome, lado.nomeSigno)
    if (lado.retrogrado) fora.push(`retrogradação de ${lado.nome}`)
    if (lado.regente) fora.push(`regência de ${lado.nome}`)
  }
  if (card.aspecto) fora.push(ASPECTOS[locale][card.aspecto])
  if (card.tipo === "evento") fora.push(card.titulo)
  return [...new Set(fora)]
}

function descreverCard(card: CardMovimento, i: number): string {
  const linhas: string[] = [`[${i + 1}] ${card.titulo.toUpperCase()} · ${card.detalhe}`]
  linhas.push(`    o que este ângulo estabelece: ${card.glosa}`)
  for (const [rotulo, lado] of [["A", card.a], ["B", card.b]] as const) {
    if (!lado) continue
    linhas.push(
      `    ${rotulo} · ${lado.nome}${lado.regente ? " (rege o signo do leitor)" : ""}` +
        ` em ${lado.nomeSigno} ${lado.grauTexto}${lado.retrogrado ? ", retrógrado" : ""}`,
    )
    linhas.push(`       o que ele faz: ${lado.verbos.join(", ")}`)
    linhas.push(`       campo de ${lado.nomeSigno}: ${lado.campo}`)
  }
  if (card.contexto.length) linhas.push(`    também hoje: ${card.contexto.join("; ")}`)
  linhas.push(`    ORIGENS possíveis: ${origensDoCard(card).join(" | ")}`)
  return linhas.join("\n")
}

// ---------------------------------------------------------------------------

function sistema(nomeSigno: string): string {
  return `Responda apenas com JSON válido, sem Markdown. Todo texto destinado ao leitor é escrito em português do Brasil.

Você escreve a leitura diária de ${nomeSigno} no Multioráculo. Ela é a mesma para todas as pessoas desse signo.

${REGRAS_COMUNS}

OS PLANETAS SÃO A FONTE, NÃO O ASSUNTO
A mecânica já está na tela, logo acima do seu texto: a pessoa vê "Mercúrio em Libra em oposição a Saturno em Áries", com grau, orbe e sentido. Repetir isso na explicação não acrescenta nada e deixa a leitura abstrata para quem não conhece astrologia.

Por isso a sua prosa NÃO NOMEIA planeta, signo, aspecto nem fase. Ela responde outra pergunta: como isto se reconhece na experiência?

Em vez de "Mercúrio e Saturno colocam em evidência a necessidade de aceitar limites nas análises", escreva algo na direção de "Nem tudo melhora quando continua sendo analisado. Há coisas que ganham forma quando uma comparação termina e um limite fica claro".

SUBSTANTIVO ABSTRATO VIRA MOVIMENTO
Prefira verbo a substantivo, e experiência a teoria. "Necessidade de análise e estrutura" vira "continuar examinando ou decidir onde colocar um limite". "Transformação de valores" vira "perceber o que ainda vale sustentar e o que já começou a mudar". Não existe dicionário fixo: a frase nasce da configuração daquele dia.

NÃO USE MULETA. Nada de "a necessidade de", "a busca por", "a capacidade de", "o potencial de", "a importância de". Essas construções empurram a frase de volta para a teoria. Onde elas apareceriam, use o verbo direto.

COMECE PELA EXPERIÊNCIA, NÃO PELA FORÇA. Em vez de "distinguir entra em conflito com delimitar", escreva como isso se reconhece: "Nem tudo melhora quando continua sendo examinado. Algumas coisas ganham forma quando uma comparação termina e um limite fica claro". A frase deve poder ser lida por alguém que nunca ouviu falar de astrologia e ainda assim reconhecer o movimento.

O RIGOR NÃO MUDA, MUDA DE LUGAR
Cada TERMO que você usar nasce de uma ORIGEM declarada, escolhida da lista do card. "Comparar" pode vir de Libra, "delimitar" de Saturno, "revisar" de uma retrogradação. O leitor não vê essa declaração; ela existe para o verificador. O que não pode é uma frase que caberia em qualquer outro dia.

NADA DE ACONTECIMENTO
Você não sabe nada sobre a vida de quem lê. Não existe mensagem que chega, conversa que acontece, pessoa que volta, dinheiro que entra, viagem, trabalho, família nem saúde. Nenhum desses fatos está calculado, e inventá-los é o erro mais fácil de cometer aqui.

E NADA DE CONSELHO. Não diga o que fazer, não diga que é hora de nada, não mande confiar nem aproveitar. Escreva no indicativo o que está posto, o que se aproxima, o que se separa, o que fica em tensão.

O QUE DEVOLVER
- foco: uma frase curta, o que o dia coloca em evidência para este signo.
- relacoes: uma entrada por card, na ordem, com:
    n: o número do card
    termos: de 2 a 3 entradas {texto, origem}, cada origem da lista daquele card
    explicacao: DUAS ou TRÊS frases, no máximo 55 palavras, contendo os termos
- paraOSigno: DUAS frases sobre por que isto toca especificamente quem é deste signo, falando do modo de operar dele e não do planeta que o rege.

Devolva JSON: {"foco": "...", "relacoes": [{"n": 1, "termos": [{"texto": "...", "origem": "..."}], "explicacao": "..."}], "paraOSigno": "..."}`
}

// ---------------------------------------------------------------------------
// verificador da camada de linguagem
// ---------------------------------------------------------------------------

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const ACONTECIMENTO =
  /(mensagem|conversa|telefonem|encontro|viagem|viajar|dinheiro|salári|emprego|trabalh|chefe|parceir|namorad|cônjuge|famíli|filho|saúde|doenç|médic|contrato|reunião)\w*/gi
const PREVISAO = /(você (vai|irá|deve|precisa)|acontecerá|surgirá|receberá|chegará|vai acontecer|é hora de|aproveite|confie)/gi
// verbo de conselho e muleta abstrata: os dois afastam a frase da experiência
const CONSELHO = /(exig|ped(e|indo)|demand|convid|favorec|desafi|propõe|sugere|aconselha)\w*/gi
const MULETA = /(a necessidade de|a busca por|a capacidade de|o potencial de|a importância de|a tendência a)/gi
const NOMES_ASTRO = (): string[] => [
  ...Object.values(CORPOS[locale]).filter(Boolean),
  ...SIGNOS[locale],
  ...Object.values(ASPECTOS[locale]),
  ...FASES[locale],
]

function verificar(saida: any, cards: CardMovimento[]): string[] {
  const falhas: string[] = []
  const textos: Array<{ onde: string; texto: string }> = [{ onde: "foco", texto: String(saida?.foco ?? "") }]
  const relacoes = Array.isArray(saida?.relacoes) ? saida.relacoes : []
  relacoes.forEach((r: any, i: number) => textos.push({ onde: `relação ${i + 1}`, texto: String(r?.explicacao ?? "") }))
  textos.push({ onde: "para o signo", texto: String(saida?.paraOSigno ?? "") })

  for (const { onde, texto } of textos) {
    if (!texto.trim()) {
      falhas.push(`${onde}: vazio`)
      continue
    }
    for (const nome of NOMES_ASTRO()) {
      if (new RegExp(`(^|[^\\p{L}])${nome}([^\\p{L}]|$)`, "iu").test(texto)) {
        falhas.push(`${onde}: nomeia "${nome}"`)
      }
    }
    for (const achou of texto.matchAll(ACONTECIMENTO)) falhas.push(`${onde}: inventa acontecimento "${achou[0]}"`)
    for (const achou of texto.matchAll(PREVISAO)) falhas.push(`${onde}: previsão ou conselho "${achou[0]}"`)
    for (const achou of texto.matchAll(CONSELHO)) falhas.push(`${onde}: fala como conselho "${achou[0]}"`)
    for (const achou of texto.matchAll(MULETA)) falhas.push(`${onde}: muleta abstrata "${achou[0]}"`)
    for (const proibida of PROIBIDAS[locale]) {
      const achou = texto.match(proibida)
      if (achou) falhas.push(`${onde}: expressão proibida "${achou[0].trim()}"`)
    }
    if (TRACOS.test(texto)) falhas.push(`${onde}: usa travessão`)
    if (/arquetíp|arquétip/i.test(texto)) falhas.push(`${onde}: usa "arquétipo"`)
  }

  if (relacoes.length !== cards.length) falhas.push(`${relacoes.length} relações para ${cards.length} cards`)
  relacoes.forEach((r: any, i: number) => {
    const card = cards[i]
    if (!card) return
    const validas = new Set(origensDoCard(card))
    const termos = Array.isArray(r?.termos) ? r.termos : []
    if (termos.length < 2 || termos.length > 3) falhas.push(`relação ${i + 1}: ${termos.length} termos (queremos 2 ou 3)`)
    for (const t of termos) {
      const texto = String(t?.texto ?? "")
      const origem = String(t?.origem ?? "")
      if (!validas.has(origem)) falhas.push(`relação ${i + 1}: "${texto}" declara origem "${origem}", que não existe no card`)
      if (!semAcento(String(r?.explicacao ?? "")).includes(semAcento(texto))) {
        falhas.push(`relação ${i + 1}: "${texto}" não aparece na explicação`)
      }
    }
    const palavras = String(r?.explicacao ?? "").trim().split(/\s+/).length
    if (palavras > 55) falhas.push(`relação ${i + 1}: ${palavras} palavras, acima de 55`)
  })

  return falhas
}

// ---------------------------------------------------------------------------

async function main() {
  const chave = process.env.OPENAI_API_KEY
  if (!chave) throw new Error("OPENAI_API_KEY não está definido (.env.local)")

  const dia = process.argv[2]?.includes("-") ? process.argv[2] : diaDeHoje()
  const signo = Number(process.argv.find((a, i) => i >= 2 && /^\d{1,2}$/.test(a)) ?? 5)
  const { cards } = prepararDia(dia, signo, locale)
  const nomeSigno = SIGNOS[locale][signo]

  const user = [
    `DIA: ${dia}`,
    `SIGNO: ${nomeSigno}`,
    "",
    "OS MOVIMENTOS DE HOJE (escreva só sobre estes)",
    ...cards.map((c, i) => descreverCard(c, i)),
  ].join("\n")

  console.log(`\n${dia} · ${nomeSigno} · ${MODELO} · temperatura ${TEMPERATURA}`)
  console.log(`movimentos: ${cards.map((c) => c.titulo).join(" | ")}\n`)

  const openai = new OpenAI({ apiKey: chave })
  let custo = 0
  let falhas: string[] = []
  let saida: any = null

  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    const mensagens: any[] = [
      { role: "system", content: sistema(nomeSigno) },
      { role: "user", content: user },
    ]
    if (saida) {
      mensagens.push({ role: "assistant", content: JSON.stringify(saida) })
      mensagens.push({ role: "user", content: `Reprovado: ${falhas.join("; ")}. Reescreva corrigindo isso, com os mesmos fatos.` })
    }
    const res = await openai.chat.completions.create({
      model: MODELO,
      temperature: TEMPERATURA,
      response_format: { type: "json_object" },
      messages: mensagens,
    })
    custo += estimateCostUsd(res.model ?? MODELO, res.usage?.prompt_tokens ?? 0, res.usage?.completion_tokens ?? 0)
    saida = JSON.parse(res.choices[0]?.message?.content ?? "{}")
    falhas = verificar(saida, cards)
    console.log(`tentativa ${tentativa}: ${falhas.length ? "reprovada" : "APROVADA"}`)
    for (const f of falhas) console.log(`  ! ${f}`)
    if (!falhas.length) break
  }

  console.log("\n" + "=".repeat(70))
  console.log(`EM FOCO HOJE: ${saida?.foco ?? ""}`)
  console.log("=".repeat(70))
  const relacoes = Array.isArray(saida?.relacoes) ? saida.relacoes : []
  relacoes.forEach((r: any, i: number) => {
    const card = cards[i]
    console.log(`\n[${i + 1}] ${card?.titulo} · ${card?.detalhe}`)
    console.log(`    na tela (fato): ${card?.a?.nome}${card?.b ? ` / ${card.b.nome}` : ""}`)
    console.log(`\n    ${r?.explicacao ?? ""}`)
    const termos = Array.isArray(r?.termos) ? r.termos : []
    console.log("\n    rastreamento:")
    for (const t of termos) console.log(`      "${t?.texto}"  vem de  ${t?.origem}`)
  })
  console.log(`\nPARA ${nomeSigno.toUpperCase()}`)
  console.log(`${saida?.paraOSigno ?? ""}`)
  console.log(`\ncusto estimado: US$ ${custo.toFixed(4)}`)
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
