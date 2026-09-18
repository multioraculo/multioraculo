/**
 * A leitura coletiva do céu, com cache por dia e idioma.
 *
 * O céu é o mesmo para todo mundo, então são três gerações por dia no total,
 * uma por idioma, e não uma por pessoa. Os fatos são recalculáveis a qualquer
 * momento a partir da data; o que se guarda é só o texto, porque ele custa uma
 * chamada paga.
 *
 * Sem tabela de cache não se gera nada: seria pagar uma chamada por visita numa
 * página que abre todo dia.
 */
import type { Locale } from "@/lib/i18n/config"
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { estadoDoCeu, type Ceu } from "./ceu"
import {
  camadaFactual,
  fatosDoCeu,
  minimoDeTermos,
  promptCeuDoDia,
  verificarCeu,
  type FatoDoCeu,
  type TermoDoCeu,
} from "./ceu-do-dia"

export type Gerar = (prompt: { system: string; user: string }) => Promise<{ conteudo: string; model: string }>

export type LeituraDoCeu = {
  dia: string
  ceu: Ceu
  /** os fatos escolhidos, já prontos para a tela */
  fatos: FatoDoCeu[]
  /** as duas linhas com os nomes, para a Home */
  factual: string[]
  sintese: string | null
  termos: TermoDoCeu[]
  model: string | null
  cache: boolean
  violacoes: string[]
}

const TENTATIVAS = 4
const VALIDADE_DO_NAO = 60_000

let temOndeGuardar = false
let ultimaPergunta = 0

/** O sim vale para sempre; o não vale por um minuto, para a migration acender sozinha. */
export async function cacheDisponivel(): Promise<boolean> {
  if (temOndeGuardar) return true
  if (ultimaPergunta && Date.now() - ultimaPergunta < VALIDADE_DO_NAO) return false
  ultimaPergunta = Date.now()
  if (!hasAdminClient()) return false
  const { error } = await createAdminClient().from("sky_daily").select("dia").limit(1)
  temOndeGuardar = !error
  if (error) console.warn("[ceu-do-dia] sem tabela de cache, geração desligada:", error.message)
  return temOndeGuardar
}

export async function leituraDoCeu(params: { dia: string; locale: Locale; gerar: Gerar }): Promise<LeituraDoCeu> {
  const { dia, locale, gerar } = params
  const ceu = estadoDoCeu(dia)
  const { escolhidos } = fatosDoCeu(ceu, locale)
  const base: LeituraDoCeu = {
    dia,
    ceu,
    fatos: escolhidos,
    factual: camadaFactual(ceu, escolhidos, locale),
    sintese: null,
    termos: [],
    model: null,
    cache: false,
    violacoes: [],
  }

  if (!(await cacheDisponivel())) return { ...base, violacoes: ["cache indisponível"] }

  const guardada = await ler(dia, locale)
  if (guardada) return { ...base, sintese: guardada.sintese, termos: guardada.termos, model: guardada.model, cache: true }

  const prompt = promptCeuDoDia(ceu, escolhidos, locale)
  const minimoTermos = minimoDeTermos(escolhidos)
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
    const veredito = verificarCeu({ bruto, escolhidos, locale, minimoTermos })
    if (!veredito.ok) {
      violacoes = veredito.violacoes
      continue
    }
    await gravar({ dia, locale, ...veredito.sintese, model, tentativas: tentativa })
    return { ...base, sintese: veredito.sintese.sintese, termos: veredito.sintese.termos, model }
  }

  return { ...base, violacoes }
}

function comCorrecao(prompt: { system: string; user: string }, violacoes: string[]): { system: string; user: string } {
  if (!violacoes.length) return prompt
  return {
    system: prompt.system,
    user: `${prompt.user}

A TENTATIVA ANTERIOR FOI REPROVADA. Reescreva corrigindo isto, e mantendo os mesmos fatos:
${violacoes.map((v) => `- ${v}`).join("\n")}`,
  }
}

async function ler(dia: string, locale: Locale) {
  if (!hasAdminClient()) return null
  const { data, error } = await createAdminClient()
    .from("sky_daily")
    .select("sintese, termos, model")
    .eq("dia", dia)
    .eq("locale", locale)
    .maybeSingle()
  if (error || !data?.sintese) return null
  return {
    sintese: data.sintese as string,
    termos: (data.termos as TermoDoCeu[] | null) ?? [],
    model: data.model as string,
  }
}

async function gravar(linha: {
  dia: string
  locale: Locale
  termos: TermoDoCeu[]
  sintese: string
  model: string
  tentativas: number
}): Promise<void> {
  if (!hasAdminClient()) return
  try {
    await createAdminClient()
      .from("sky_daily")
      .upsert(
        {
          dia: linha.dia,
          locale: linha.locale,
          termos: linha.termos,
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
