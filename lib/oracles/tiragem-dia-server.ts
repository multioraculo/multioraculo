/**
 * A tiragem do dia com síntese: cache por dia e idioma.
 *
 * A dupla de cartas é recalculável a qualquer momento a partir da data, então
 * não precisa ser guardada. O que se guarda é o texto, porque ele custa uma
 * chamada paga. E como a tiragem é a mesma para todo mundo, são três chamadas
 * por dia no total, uma por idioma, não uma por pessoa.
 *
 * Sem tabela de cache, não se gera nada: seria pagar uma chamada por visita
 * numa página que abre todo dia.
 */
import type { Locale } from "@/lib/i18n/config"
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { avaliarGeracao, promptTiragemDia } from "./prompt-tiragem-dia"
import { cartasDeJson, type CartasIndividuais } from "./cartas-individuais"
import { tiragemDoDia, type TiragemDoDia } from "./tiragem-dia"

export type Gerar = (prompt: { system: string; user: string }) => Promise<{ conteudo: string; model: string }>

export type LeituraDoDia = {
  dia: string
  tiragem: TiragemDoDia
  eixo: [string, string] | null
  /** a síntese CRUZADA das duas cartas: mora abaixo da tiragem e nunca é o verso de uma carta */
  sintese: string | null
  /**
   * a interpretação INDIVIDUAL de cada carta, o verso dela. Nulo em registro
   * antigo (gravado antes desta camada existir) e em dia sem texto aprovado:
   * a UI então mostra só nome e orientação.
   */
  cartas: CartasIndividuais | null
  model: string | null
  cache: boolean
  violacoes: string[]
}

const TENTATIVAS = 3
const VALIDADE_DO_NAO = 60_000

let temOndeGuardar = false
let ultimaPergunta = 0

/** O sim vale para sempre; o não vale por um minuto, para a migration acender sozinha. */
export async function cacheDisponivel(): Promise<boolean> {
  if (temOndeGuardar) return true
  if (ultimaPergunta && Date.now() - ultimaPergunta < VALIDADE_DO_NAO) return false
  ultimaPergunta = Date.now()
  if (!hasAdminClient()) return false
  const { error } = await createAdminClient().from("daily_draw").select("dia").limit(1)
  temOndeGuardar = !error
  if (error) console.warn("[tiragem-dia] sem tabela de cache, geração desligada:", error.message)
  return temOndeGuardar
}

export async function leituraDoDia(params: { dia: string; locale: Locale; gerar: Gerar }): Promise<LeituraDoDia> {
  const { dia, locale, gerar } = params
  const tiragem = tiragemDoDia(dia, locale)
  const base: LeituraDoDia = { dia, tiragem, eixo: null, sintese: null, cartas: null, model: null, cache: false, violacoes: [] }

  if (!(await cacheDisponivel())) return { ...base, violacoes: ["cache indisponível"] }

  // registro antigo, sem `cartas`, funciona igual: o verso cai no fallback e a
  // síntese antiga segue onde estava. Não se regera o histórico.
  const guardada = await ler(dia, locale)
  if (guardada) return { ...base, eixo: guardada.eixo, sintese: guardada.sintese, cartas: guardada.cartas, model: guardada.model, cache: true }

  const prompt = promptTiragemDia(tiragem, locale)
  let violacoes: string[] = []

  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    const { conteudo, model } = await gerar(comCorrecao(prompt, violacoes))
    // A síntese e cada verso são julgados SEPARADAMENTE (avaliarGeracao). Só a
    // síntese pode justificar refazer a geração; um verso reprovado vira null e
    // a Home mostra só a carta. Nunca texto cruzado, nunca a síntese como verso.
    const decisao = avaliarGeracao({ conteudo, tiragem, locale })
    if (decisao.acao === "refazer") {
      violacoes = decisao.violacoes
      continue
    }
    await gravar({ dia, locale, seed: tiragem.seed, eixo: decisao.eixo, sintese: decisao.sintese, cartas: decisao.cartas, model, tentativas: tentativa })
    return { ...base, eixo: decisao.eixo, sintese: decisao.sintese, cartas: decisao.cartas, model, violacoes: decisao.violacoes }
  }

  return { ...base, violacoes }
}

function comCorrecao(prompt: { system: string; user: string }, violacoes: string[]): { system: string; user: string } {
  if (!violacoes.length) return prompt
  return {
    system: prompt.system,
    user: `${prompt.user}

A TENTATIVA ANTERIOR FOI REPROVADA. Reescreva do zero, sem repetir o que causou isto:
${violacoes.map((v) => `- ${v}`).join("\n")}`,
  }
}

async function ler(dia: string, locale: Locale) {
  if (!hasAdminClient()) return null
  const db = createAdminClient()
  // `cartas` é coluna ADITIVA (migration 20261005). Antes de ela existir, pedir a
  // coluna falha; nesse caso lê-se sem ela, e o cache da síntese continua valendo
  // em vez de a Home regerar (e pagar) a cada visita.
  let res: { data: Record<string, unknown> | null; error: unknown } = await db
    .from("daily_draw")
    .select("eixo, sintese, model, cartas")
    .eq("dia", dia)
    .eq("locale", locale)
    .maybeSingle()
  if (res.error) {
    res = await db.from("daily_draw").select("eixo, sintese, model").eq("dia", dia).eq("locale", locale).maybeSingle()
  }
  const { data, error } = res
  if (error || !data?.sintese) return null
  return {
    eixo: (data.eixo as [string, string] | null) ?? null,
    sintese: data.sintese as string,
    cartas: cartasDeJson(data.cartas),
    model: data.model as string,
  }
}

/**
 * O que está GRAVADO para aquele dia, sem gerar nada. Mesmo papel do céu:
 * entregar à Home o que já existe, e nunca fazê-la esperar por uma geração.
 */
export async function lerTiragemGravada(dia: string, locale: Locale) {
  return ler(dia, locale)
}

async function gravar(linha: {
  dia: string
  locale: Locale
  seed: string
  eixo: [string, string]
  sintese: string
  cartas: CartasIndividuais | null
  model: string
  tentativas: number
}): Promise<void> {
  if (!hasAdminClient()) return
  try {
    const db = createAdminClient()
    const registro = {
      dia: linha.dia,
      locale: linha.locale,
      seed: linha.seed,
      eixo: linha.eixo,
      sintese: linha.sintese,
      model: linha.model,
      tentativas: linha.tentativas,
    }
    const opcoes = { onConflict: "dia,locale", ignoreDuplicates: true }
    // com a coluna `cartas`; sem ela (migration ainda não aplicada), grava só o que já existia
    const { error } = await db.from("daily_draw").upsert({ ...registro, cartas: linha.cartas }, opcoes)
    if (error) await db.from("daily_draw").upsert(registro, opcoes)
  } catch {
    // gravar é otimização: sem cache o próximo pedido gera de novo
  }
}
