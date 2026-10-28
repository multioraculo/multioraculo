import { NextResponse } from "next/server"
import OpenAI from "openai"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { resolveLocale } from "@/lib/i18n/config"
import { newSeed } from "@/lib/oracles/draw"
import { completeReading, consumeReading, failReading, httpStatusFor, jornadaEmAndamento, visitorIdFrom } from "@/lib/billing/usage"
import { VISITOR_COOKIE } from "@/lib/billing/visitor"
import { recordAiUsage, type TokenUsage } from "@/lib/ai/usage"
import { executarJornada } from "@/lib/dreams/jornada-servico"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Jornada dos Sonhos: síntese simbólica entre os sonhos salvos da pessoa.
 * A sequência (ler, decidir, reutilizar, cobrar, gerar, salvar) está em
 * lib/dreams/jornada-servico.ts; aqui só se montam as dependências reais.
 *
 * - vale a partir de 2 sonhos; com 3 ou mais a leitura é reconsiderada junto
 *   com a anterior (que entra no prompt como hipótese);
 * - análise em dia é devolvida SEM chamar o modelo e SEM consumir cota;
 * - só roda quando a pessoa pede (nada de gerar ao abrir a página);
 * - uma geração por vez por pessoa; cada geração é uma linha nova em
 *   journey_analyses e linhas antigas nunca são reescritas.
 */

// Trava em memória: cobre o desenvolvimento (sem service role) e pedidos que
// caem na mesma instância. A trava que vale entre instâncias é a do banco.
const emMemoria = new Map<string, { seed: string; em: number }>()
const TRAVA_MS = 2 * 60 * 1000 // a rota tem maxDuration de 60 s; trava esquecida expira

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const locale = resolveLocale(body?.locale)

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado.", code: "unauthenticated" }, { status: 401 })
  }
  const userId = user.id
  const visitorId = visitorIdFrom((await cookies()).get(VISITOR_COOKIE)?.value)

  const r = await executarJornada({
    client: supabase,
    userId,
    locale,
    novaSeed: newSeed,
    async consumir(seed) {
      const c = await consumeReading({ userId, visitorId, seed, locale, kind: "journey" })
      if (!c.allowed) {
        return {
          allowed: false,
          status: httpStatusFor(c.code),
          corpo: {
            error: "A Jornada onírica não está disponível no seu plano ou o limite do período foi atingido.",
            code: c.code,
            plan: c.entitlement.plan,
            used: c.used,
            limit: c.limit,
            periodEnd: c.entitlement.periodEnd,
          },
        }
      }
      emMemoria.set(userId, { seed, em: Date.now() })
      return { allowed: true }
    },
    async concluir(seed) {
      if (emMemoria.get(userId)?.seed === seed) emMemoria.delete(userId)
      await completeReading(seed)
    },
    async falhar(seed) {
      if (emMemoria.get(userId)?.seed === seed) emMemoria.delete(userId)
      await failReading(seed).catch(() => {})
    },
    async outraEmAndamento(seed) {
      const local = emMemoria.get(userId)
      if (local && local.seed !== seed && Date.now() - local.em < TRAVA_MS) return true
      return jornadaEmAndamento(userId, seed)
    },
    modeloDisponivel: () => Boolean(process.env.OPENAI_API_KEY),
    async gerar(system, user) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 2800,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      })
      return { raw: JSON.parse(completion.choices?.[0]?.message?.content ?? "{}"), model: completion.model, usage: completion.usage }
    },
    async registrarUso(seed, model, usage) {
      await recordAiUsage({ operation: "journey", model, usage: usage as TokenUsage, seed, userId })
    },
    aviso: (m) => console.warn("[jornada]", m),
  })

  return NextResponse.json(r.corpo, { status: r.status })
}
