/**
 * O horóscopo do dia, do cálculo à leitura publicável.
 *
 * Geração sob demanda: só o signo que alguém abriu é gerado, uma vez por dia
 * e por idioma, e daí em diante todo mundo lê a mesma linha do banco. Signo
 * que ninguém abriu não custa nada.
 *
 * A chamada ao modelo não mora aqui: quem tem o cliente da OpenAI é a rota,
 * como no resto do projeto. Este módulo recebe `gerar` e cuida do que é dele:
 * céu, tiragem, cards, cache, verificação e a retentativa com o motivo na mão.
 *
 * Sem a tabela de cache, a rota NÃO gera: entrega os movimentos e o céu
 * calculado, sem texto. Gerar sem poder guardar significaria pagar uma chamada
 * por visita numa página que está no menu principal, e ninguém veria isso
 * acontecer. O recurso acende sozinho no minuto em que a migração rodar.
 *
 * Leitura reprovada não é gravada nem entregue. Se as tentativas acabarem, a
 * página mostra os movimentos e o céu calculado sem texto interpretativo: é a
 * mesma postura do índice de PDFs da síntese, que prefere faltar a entregar
 * material não verificado.
 */
import type { Locale } from "@/lib/i18n/config"
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { apresentar, type CardMovimento } from "./apresentar"
import { estadoDoCeu, type Ceu } from "./ceu"
import { estimateCostUsd } from "@/lib/ai/pricing"
import { lerLinhaGravada } from "./linha-gravada"
import { promptHoroscopo, type Leitura } from "./prompt-horoscopo"
import { selecionarMovimentos } from "./relevancia"
import { LINHA_SIGNO } from "./simbolos"
import { SIGNOS } from "./nomes"
import { verificarLeitura } from "./verificador"

export type Resposta = {
  conteudo: string
  model: string
  /** tokens da chamada, quando quem gera souber informar; serve para o custo por tentativa */
  usage?: { prompt_tokens?: number | null; completion_tokens?: number | null } | null
}
export type Gerar = (prompt: { system: string; user: string }) => Promise<Resposta>

/**
 * COMO UMA TENTATIVA TERMINOU, sem a categoria genérica "falhou".
 *
 * A distinção não é acadêmica: cada uma pede uma reação diferente. Erro de
 * rede pede nova tentativa imediata; reprovação do verificador pede o motivo
 * de volta no prompt; resposta vazia costuma ser corte por limite de tokens; e
 * erro de banco significa que a leitura ficou boa e foi perdida, que é o pior
 * caso e o mais silencioso de todos.
 */
export type Desfecho =
  | "sucesso"
  | "erro_api"
  | "timeout"
  | "resposta_vazia"
  | "erro_parse"
  | "reprovado"
  | "erro_banco"

export type Tentativa = {
  n: number
  desfecho: Desfecho
  /** tempo da chamada ao modelo */
  msIa: number
  /** tempo do verificador, que é local e deve ser desprezível */
  msVerificador: number
  /** as violações do verificador. São mensagens de REGRA, sem conteúdo de usuário */
  regras: string[]
  tokensEntrada?: number
  tokensSaida?: number
  custoUsd?: number
}

export type Diagnostico = {
  /** veio do cache, foi gerado, ou a linha gravada estava em formato incompatível */
  cache: "hit" | "miss" | "incompativel"
  msCache: number
  msTotal: number
  tentativas: Tentativa[]
}

/** O que a tela recebe. `leitura` é nula quando nenhuma tentativa passou. */
export type HoroscopoDoDia = {
  dia: string
  signo: number
  nomeSigno: string
  linhaSigno: string
  locale: Locale
  cards: CardMovimento[]
  ceu: Ceu
  leitura: Leitura | null
  model: string | null
  /** veio do banco, sem chamada paga */
  cache: boolean
  tentativas: number
  violacoes: string[]
  /** onde o tempo foi gasto. Sem conteúdo de usuário: só tempos, categorias e contagens */
  diagnostico?: Diagnostico
}

const TENTATIVAS = 4

/**
 * Existe onde guardar? Enquanto a resposta for não, não se gera nada: cache
 * ausente é trava de custo, não detalhe.
 *
 * O sim vale para sempre; o não vale por um minuto. Guardar o não para sempre
 * faria a migration parecer que não funcionou: a instância que perguntou antes
 * dela continuaria recusando até ser reciclada, sem novo deploy que a
 * acordasse.
 */
let temOndeGuardar = false
let ultimaPergunta = 0
const VALIDADE_DO_NAO = 60_000

export async function cacheDisponivel(): Promise<boolean> {
  if (temOndeGuardar) return true
  if (ultimaPergunta && Date.now() - ultimaPergunta < VALIDADE_DO_NAO) return false
  ultimaPergunta = Date.now()
  if (!hasAdminClient()) return false
  const { error } = await createAdminClient().from("horoscope_daily").select("dia").limit(1)
  temOndeGuardar = !error
  if (error) console.warn("[horoscopo] sem tabela de cache, geração desligada:", error.message)
  return temOndeGuardar
}

/** A tiragem do dia para um signo: céu, três movimentos e os cards prontos. */
export function prepararDia(dia: string, signo: number, locale: Locale): { ceu: Ceu; cards: CardMovimento[] } {
  const ceu = estadoDoCeu(dia)
  const cards = selecionarMovimentos(ceu, signo).map((m) => apresentar(m, signo, locale, ceu))
  return { ceu, cards }
}

function montar(
  dia: string,
  signo: number,
  locale: Locale,
  ceu: Ceu,
  cards: CardMovimento[],
  extra: Partial<HoroscopoDoDia>,
): HoroscopoDoDia {
  return {
    dia,
    signo,
    nomeSigno: SIGNOS[locale][signo],
    linhaSigno: LINHA_SIGNO[locale][signo],
    locale,
    cards,
    ceu,
    leitura: null,
    model: null,
    cache: false,
    tentativas: 0,
    violacoes: [],
    ...extra,
  }
}

/**
 * O que havia gravado, com a diferença entre não ter nada e ter algo que não
 * serve mais. São dois casos parecidos e com consequências diferentes: linha
 * ausente é gravada com `ignoreDuplicates`, porque outra visita pode ter
 * gerado no mesmo instante e as duas leituras valem; linha incompatível
 * precisa ser SUBSTITUÍDA, senão ela fica lá e todo pedido seguinte paga uma
 * geração nova sem nunca conseguir guardar o resultado.
 */
type Guardado =
  | { estado: "ausente" }
  | { estado: "incompativel" }
  | { estado: "ok"; horoscopo: HoroscopoDoDia }

async function buscarCache(dia: string, signo: number, locale: Locale): Promise<Guardado> {
  if (!hasAdminClient()) return { estado: "ausente" }
  const { data, error } = await createAdminClient()
    .from("horoscope_daily")
    .select("leitura, cards, model, tentativas")
    .eq("dia", dia)
    .eq("signo", signo)
    .eq("locale", locale)
    .maybeSingle()
  if (error || !data?.leitura) return { estado: "ausente" }

  // formato antigo ou estranho é tratado como ausência: a tela nunca recebe
  // linha que ela não sabe ler. Ver lerLinhaGravada.
  const gravado = lerLinhaGravada({ leitura: data.leitura, cards: data.cards })
  if (!gravado) {
    console.warn(`[horoscopo] cache em formato incompatível, regerando: ${dia} signo ${signo} ${locale}`)
    return { estado: "incompativel" }
  }

  // o céu é recalculado, nunca lido do banco: é barato, e assim a seção
  // factual nunca fica dessincronizada do motor
  const { ceu } = prepararDia(dia, signo, locale)
  return {
    estado: "ok",
    horoscopo: montar(dia, signo, locale, ceu, gravado.cards, {
      leitura: gravado.leitura,
      model: typeof data.model === "string" ? data.model : null,
      cache: true,
      tentativas: typeof data.tentativas === "number" ? data.tentativas : 1,
    }),
  }
}

/**
 * A leitura gravada daquele dia, ou nula. Nula também quando existe linha mas
 * ela está em formato que esta versão não lê: cache válido se usa, cache
 * incompatível se ignora e se gera de novo.
 */
export async function lerCache(dia: string, signo: number, locale: Locale): Promise<HoroscopoDoDia | null> {
  const guardado = await buscarCache(dia, signo, locale)
  return guardado.estado === "ok" ? guardado.horoscopo : null
}

/**
 * A leitura do dia para um signo. Lê o cache; só chama o modelo quando não há
 * linha gravada, que é o que torna a geração sob demanda barata.
 */
export async function horoscopoDoSigno(params: {
  dia: string
  signo: number
  locale: Locale
  gerar: Gerar
}): Promise<HoroscopoDoDia> {
  const { dia, signo, locale, gerar } = params

  const t0 = Date.now()
  const { ceu, cards } = prepararDia(dia, signo, locale)
  if (!(await cacheDisponivel())) return montar(dia, signo, locale, ceu, cards, { violacoes: ["cache indisponível"] })

  const tCache = Date.now()
  const guardado = await buscarCache(dia, signo, locale)
  const msCache = Date.now() - tCache

  if (guardado.estado === "ok") {
    registrar(dia, signo, locale, { cache: "hit", msCache, msTotal: Date.now() - t0, tentativas: [] })
    return { ...guardado.horoscopo, diagnostico: { cache: "hit", msCache, msTotal: Date.now() - t0, tentativas: [] } }
  }
  const substituir = guardado.estado === "incompativel"
  const cache = substituir ? ("incompativel" as const) : ("miss" as const)

  const prompt = promptHoroscopo({ dia, signo, cards, locale })
  let violacoes: string[] = []
  const tentativas: Tentativa[] = []

  const fechar = (extra: Partial<HoroscopoDoDia>) => {
    const diagnostico: Diagnostico = { cache, msCache, msTotal: Date.now() - t0, tentativas }
    registrar(dia, signo, locale, diagnostico)
    return montar(dia, signo, locale, ceu, cards, { ...extra, diagnostico })
  }

  for (let n = 1; n <= TENTATIVAS; n++) {
    const tIa = Date.now()
    let resposta: Resposta
    try {
      resposta = await gerar(comCorrecao(prompt, violacoes))
    } catch (erro) {
      // timeout e erro de transporte chegam os dois como exceção; o nome do
      // erro é o que separa um do outro
      const msg = String((erro as Error)?.name ?? "") + String((erro as Error)?.message ?? "")
      const ehTimeout = /timeout|abort|ETIMEDOUT/i.test(msg)
      tentativas.push({ n, desfecho: ehTimeout ? "timeout" : "erro_api", msIa: Date.now() - tIa, msVerificador: 0, regras: [] })
      violacoes = []
      continue
    }
    const msIa = Date.now() - tIa
    const tokensEntrada = Number(resposta.usage?.prompt_tokens ?? 0) || undefined
    const tokensSaida = Number(resposta.usage?.completion_tokens ?? 0) || undefined
    const custoUsd =
      tokensEntrada || tokensSaida ? estimateCostUsd(resposta.model, tokensEntrada ?? 0, tokensSaida ?? 0) : undefined
    const base = { n, msIa, tokensEntrada, tokensSaida, custoUsd }

    if (!resposta.conteudo || resposta.conteudo.trim() === "" || resposta.conteudo.trim() === "{}") {
      tentativas.push({ ...base, desfecho: "resposta_vazia", msVerificador: 0, regras: [] })
      violacoes = []
      continue
    }

    let bruto: unknown
    try {
      bruto = JSON.parse(resposta.conteudo)
    } catch {
      tentativas.push({ ...base, desfecho: "erro_parse", msVerificador: 0, regras: [] })
      violacoes = ["a resposta não era JSON válido"]
      continue
    }

    const tVer = Date.now()
    const veredito = verificarLeitura({ bruto, cards, signo, locale })
    const msVerificador = Date.now() - tVer

    if (!veredito.ok) {
      tentativas.push({ ...base, desfecho: "reprovado", msVerificador, regras: veredito.violacoes })
      violacoes = veredito.violacoes
      continue
    }

    const gravou = await gravar({
      dia,
      signo,
      locale,
      leitura: veredito.leitura,
      cards,
      model: resposta.model,
      tentativas: n,
      substituir,
    })
    // leitura aprovada que não foi gravada é o pior caso: ela é entregue a esta
    // pessoa e a próxima paga tudo de novo. Fica registrado como tal.
    tentativas.push({ ...base, desfecho: gravou ? "sucesso" : "erro_banco", msVerificador, regras: [] })
    return fechar({ leitura: veredito.leitura, model: resposta.model, tentativas: n })
  }

  return fechar({ tentativas: TENTATIVAS, violacoes })
}

/**
 * Uma linha por pedido, para o tempo aparecer nos registros do servidor.
 *
 * NÃO SAI CONTEÚDO DAQUI. Só dia, signo, idioma, tempos, categorias e as
 * mensagens de regra do verificador, que descrevem estrutura e não o texto. Não
 * há pergunta, dado de nascimento nem nada de conta nesta rota: o horóscopo do
 * signo é coletivo por definição.
 */
function registrar(dia: string, signo: number, locale: Locale, d: Diagnostico): void {
  const cabeca = `[horoscopo] dia=${dia} signo=${signo} locale=${locale} cache=${d.cache} msCache=${d.msCache}`
  if (d.tentativas.length === 0) {
    console.log(`${cabeca} msTotal=${d.msTotal}`)
    return
  }
  for (const t of d.tentativas) {
    const custo = t.custoUsd === undefined ? "" : ` custo=${t.custoUsd.toFixed(5)}`
    const tokens = t.tokensEntrada === undefined ? "" : ` tokens=${t.tokensEntrada}/${t.tokensSaida ?? 0}`
    const regras = t.regras.length ? ` regras=${JSON.stringify(t.regras.map((r) => r.slice(0, 120)))}` : ""
    console.log(
      `${cabeca} tentativa=${t.n} desfecho=${t.desfecho} msIa=${t.msIa} msVerificador=${t.msVerificador}${tokens}${custo}${regras}`,
    )
  }
  const custoTotal = d.tentativas.reduce((soma, t) => soma + (t.custoUsd ?? 0), 0)
  const ultimo = d.tentativas[d.tentativas.length - 1]
  console.log(
    `${cabeca} msTotal=${d.msTotal} tentativas=${d.tentativas.length} resultado=${ultimo.desfecho} custoTotal=${custoTotal.toFixed(5)}`,
  )
}

/** A tentativa seguinte leva o motivo: repetir o pedido igual daria o mesmo texto. */
function comCorrecao(prompt: { system: string; user: string }, violacoes: string[]): { system: string; user: string } {
  if (!violacoes.length) return prompt
  return {
    system: prompt.system,
    user: `${prompt.user}

A TENTATIVA ANTERIOR FOI REPROVADA. Reescreva do zero, sem repetir o que causou isto:
${violacoes.map((v) => `- ${v}`).join("\n")}`,
  }
}

async function gravar(linha: {
  dia: string
  signo: number
  locale: Locale
  leitura: Leitura
  cards: CardMovimento[]
  model: string
  tentativas: number
  /** havia linha, mas em formato que não se lê mais: esta precisa passar por cima */
  substituir: boolean
}): Promise<boolean> {
  if (!hasAdminClient()) return false
  try {
    await createAdminClient()
      .from("horoscope_daily")
      .upsert(
        {
          dia: linha.dia,
          signo: linha.signo,
          locale: linha.locale,
          leitura: linha.leitura,
          cards: linha.cards,
          movimentos: linha.cards.map((c) => c.id),
          model: linha.model,
          tentativas: linha.tentativas,
        },
        { onConflict: "dia,signo,locale", ignoreDuplicates: !linha.substituir },
      )
    return true
  } catch (erro) {
    // gravar é otimização, não requisito: sem cache o próximo pedido gera de
    // novo. Mas deixou de ser silencioso: quem chama precisa saber que a
    // leitura boa se perdeu, senão o custo se repete sem explicação
    console.warn(`[horoscopo] falha ao gravar: dia=${linha.dia} signo=${linha.signo} locale=${linha.locale}`)
    return false
  }
}
