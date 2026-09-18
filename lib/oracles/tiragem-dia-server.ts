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
import { promptTiragemDia, verificarSintese } from "./prompt-tiragem-dia"
import { tiragemDoDia, type TiragemDoDia } from "./tiragem-dia"

export type Gerar = (prompt: { system: string; user: string }) => Promise<{ conteudo: string; model: string }>

export type LeituraDoDia = {
  dia: string
  tiragem: TiragemDoDia
  eixo: [string, string] | null
  sintese: string | null
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
  const base: LeituraDoDia = { dia, tiragem, eixo: null, sintese: null, model: null, cache: false, violacoes: [] }

  if (!(await cacheDisponivel())) return { ...base, violacoes: ["cache indisponível"] }

  const guardada = await ler(dia, locale)
  if (guardada) return { ...base, eixo: guardada.eixo, sintese: guardada.sintese, model: guardada.model, cache: true }

  const prompt = promptTiragemDia(tiragem, locale)
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
    const veredito = verificarSintese({ bruto, tiragem, locale })
    if (!veredito.ok) {
      violacoes = veredito.violacoes
      continue
    }
    await gravar({ dia, locale, seed: tiragem.seed, eixo: veredito.eixo, sintese: veredito.sintese, model, tentativas: tentativa })
    return { ...base, eixo: veredito.eixo, sintese: veredito.sintese, model }
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
  const { data, error } = await createAdminClient()
    .from("daily_draw")
    .select("eixo, sintese, model")
    .eq("dia", dia)
    .eq("locale", locale)
    .maybeSingle()
  if (error || !data?.sintese) return null
  return {
    eixo: (data.eixo as [string, string] | null) ?? null,
    sintese: data.sintese as string,
    model: data.model as string,
  }
}

async function gravar(linha: {
  dia: string
  locale: Locale
  seed: string
  eixo: [string, string]
  sintese: string
  model: string
  tentativas: number
}): Promise<void> {
  if (!hasAdminClient()) return
  try {
    await createAdminClient()
      .from("daily_draw")
      .upsert(
        {
          dia: linha.dia,
          locale: linha.locale,
          seed: linha.seed,
          eixo: linha.eixo,
          sintese: linha.sintese,
          model: linha.model,
          tentativas: linha.tentativas,
        },
        { onConflict: "dia,locale", ignoreDuplicates: true },
      )
  } catch {
    // gravar é otimização: sem cache o próximo pedido gera de novo
  }
}
