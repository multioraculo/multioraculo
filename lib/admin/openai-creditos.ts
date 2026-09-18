/**
 * Quanto foi colocado na OpenAI, e quanto disso ainda resta.
 *
 * A pergunta parece de API e não é. A OpenAI não devolve saldo restante para
 * uma chave comum: existe a API de custos da organização, que exige uma chave
 * de administração e mesmo assim informa QUANTO SAIU, nunca quanto sobrou.
 * Quanto entrou é informação de quem pagou, então entra digitada.
 *
 * O restante é sempre uma subtração feita na hora, e nunca um campo guardado:
 * soma das recargas menos o gasto medido em ai_usage. Assim não existe saldo
 * que possa divergir do histórico que o sustenta.
 *
 * O GASTO É ESTIMATIVA e a tela precisa dizer isso. Ele é calculado por tokens
 * com a tabela de preços vigente no momento de cada chamada, e a fatura real
 * continua sendo a da OpenAI. Duas coisas podem afastar os dois números: um
 * preço que mudou e não foi atualizado na tabela, e qualquer consumo feito
 * FORA deste aplicativo, que esta contagem não tem como ver. Por isso a tela
 * mostra junto as chamadas e os tokens que sustentam o valor: um custo alto
 * com pouco token é sinal de tabela errada, e um custo alto com muito token
 * é consumo mesmo.
 */
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"

export type CreditoRow = {
  id: string
  amount_usd: number
  occurred_on: string
  note: string | null
  created_at: string
}

export type SaldoOpenAi = {
  /** a tabela existe? enquanto a migration não rodar, a tela explica em vez de somar zero */
  disponivel: boolean
  creditos: CreditoRow[]
  depositadoUsd: number
  /** gasto estimado, somado de ai_usage */
  gastoUsd: number
  restanteUsd: number
  /** quanto do que entrou já foi consumido, de 0 a 1; nulo quando nada entrou */
  consumido: number | null
}

export async function getSaldoOpenAi(gastoUsd: number): Promise<SaldoOpenAi> {
  const vazio: SaldoOpenAi = {
    disponivel: false,
    creditos: [],
    depositadoUsd: 0,
    gastoUsd,
    restanteUsd: 0,
    consumido: null,
  }
  if (!hasAdminClient()) return vazio

  const { data, error } = await createAdminClient()
    .from("openai_credits")
    .select("id, amount_usd, occurred_on, note, created_at")
    .order("occurred_on", { ascending: false })
    .limit(200)

  if (error) {
    // tabela ausente é o estado normal antes da migration, e não um defeito
    console.warn("[admin/openai-creditos]", error.message)
    return vazio
  }

  const creditos = (data ?? []).map((r) => ({
    id: String(r.id),
    amount_usd: Number(r.amount_usd) || 0,
    occurred_on: String(r.occurred_on),
    note: (r.note as string | null) ?? null,
    created_at: String(r.created_at),
  }))
  const depositadoUsd = creditos.reduce((s, c) => s + c.amount_usd, 0)

  return {
    disponivel: true,
    creditos,
    depositadoUsd,
    gastoUsd,
    restanteUsd: depositadoUsd - gastoUsd,
    consumido: depositadoUsd > 0 ? gastoUsd / depositadoUsd : null,
  }
}
