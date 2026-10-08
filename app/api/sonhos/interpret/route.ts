import OpenAI from "openai"
import { cookies } from "next/headers"
import { LOCALE_META, resolveLocale } from "@/lib/i18n/config"
import { createClient } from "@/lib/supabase/server"
import { newSeed } from "@/lib/oracles/draw"
import { completeReading, consumeReading, failReading, httpStatusFor, visitorIdFrom } from "@/lib/billing/usage"
import { VISITOR_COOKIE } from "@/lib/billing/visitor"
import { recordAiUsage, type TokenUsage } from "@/lib/ai/usage"
import { criarGuardaTracos, montarPromptSonho } from "@/lib/oracles/sonhos-prompt"

export const runtime = "nodejs"
export const maxDuration = 60

const json = (body: object, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const dream = String(body?.dream || "").trim()
  const locale = resolveLocale(body?.locale)

  if (!dream) return json({ error: "Descrição do sonho ausente." }, 400)

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return json({ error: "OPENAI_API_KEY não configurada." }, 500)

  // Cota (server-side): uma interpretação = um consumo do tipo "dream".
  // Visitante sem login tem uma gratuita, por cookie; depois pede login.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const visitorId = visitorIdFrom((await cookies()).get(VISITOR_COOKIE)?.value)
  const seed = newSeed()
  const consume = await consumeReading({ userId: user?.id ?? null, visitorId, seed, locale, kind: "dream" })
  if (!consume.allowed) {
    return json(
      {
        error: "Limite de interpretações do período atingido.",
        code: consume.code,
        plan: consume.entitlement.plan,
        used: consume.used,
        limit: consume.limit,
        periodEnd: consume.entitlement.periodEnd,
      },
      httpStatusFor(consume.code)
    )
  }

  const openai = new OpenAI({ apiKey })
  const encoder = new TextEncoder()

  let completion: Awaited<ReturnType<typeof openai.chat.completions.create>>
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
      stream_options: { include_usage: true },
      messages: [
        {
          role: "system",
          content: `${montarPromptSonho(locale)}\n\nIDIOMA DA RESPOSTA: escreva toda a resposta, inclusive os títulos das seções, em ${LOCALE_META[locale].promptName}, com naturalidade de falante nativo.`,
        },
        { role: "user", content: `Sonho:\n"${dream}"` },
      ],
    })
  } catch (err: any) {
    await failReading(seed).catch(() => {})
    return json({ error: "Falha ao interpretar o sonho." }, 502)
  }

  return new Response(
    new ReadableStream({
      async start(controller) {
        let ok = false
        let usage: TokenUsage = null
        let model = "gpt-4o-mini"
        // rede de segurança: o prompt reduz o travessão, a guarda garante
        const guarda = criarGuardaTracos()
        try {
          for await (const chunk of completion as any) {
            if (chunk.usage) usage = chunk.usage
            if (chunk.model) model = chunk.model
            const text = chunk.choices[0]?.delta?.content || ""
            const limpo = text ? guarda.empurrar(text) : ""
            if (limpo) controller.enqueue(encoder.encode(limpo))
          }
          const resto = guarda.encerrar()
          if (resto) controller.enqueue(encoder.encode(resto))
          ok = true
          await recordAiUsage({ operation: "dream", model, usage, seed, userId: user?.id ?? null })
        } finally {
          // só conta quando a interpretação chegou inteira; erro no meio não consome
          await (ok ? completeReading(seed) : failReading(seed)).catch(() => {})
          controller.close()
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    }
  )
}
