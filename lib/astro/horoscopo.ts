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
import { lerLinhaGravada } from "./linha-gravada"
import { promptHoroscopo, type Leitura } from "./prompt-horoscopo"
import { selecionarMovimentos } from "./relevancia"
import { LINHA_SIGNO } from "./simbolos"
import { SIGNOS } from "./nomes"
import { verificarLeitura } from "./verificador"

export type Resposta = { conteudo: string; model: string }
export type Gerar = (prompt: { system: string; user: string }) => Promise<Resposta>

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

  const { ceu, cards } = prepararDia(dia, signo, locale)
  if (!(await cacheDisponivel())) return montar(dia, signo, locale, ceu, cards, { violacoes: ["cache indisponível"] })

  const guardado = await buscarCache(dia, signo, locale)
  if (guardado.estado === "ok") return guardado.horoscopo
  const substituir = guardado.estado === "incompativel"

  const prompt = promptHoroscopo({ dia, signo, cards, locale })
  let violacoes: string[] = []

  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    const { conteudo, model } = await gerar(comCorrecao(prompt, violacoes))
    let bruto: unknown
    try {
      bruto = JSON.parse(conteudo)
    } catch {
      violacoes = ["a resposta não era JSON válido"]
      continue
    }
    const veredito = verificarLeitura({ bruto, cards, signo, locale })
    if (!veredito.ok) {
      violacoes = veredito.violacoes
      continue
    }
    await gravar({ dia, signo, locale, leitura: veredito.leitura, cards, model, tentativas: tentativa, substituir })
    return montar(dia, signo, locale, ceu, cards, { leitura: veredito.leitura, model, tentativas: tentativa })
  }

  return montar(dia, signo, locale, ceu, cards, { tentativas: TENTATIVAS, violacoes })
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
}): Promise<void> {
  if (!hasAdminClient()) return
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
  } catch {
    // gravar é otimização, não requisito: sem cache o próximo pedido gera de novo
  }
}
