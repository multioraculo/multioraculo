import OpenAI from "openai"
import { cookies } from "next/headers"
import { LOCALE_META, resolveLocale } from "@/lib/i18n/config"
import { createClient } from "@/lib/supabase/server"
import { newSeed } from "@/lib/oracles/draw"
import { completeReading, consumeReading, failReading, httpStatusFor, visitorIdFrom } from "@/lib/billing/usage"
import { VISITOR_COOKIE } from "@/lib/billing/visitor"
import { recordAiUsage, type TokenUsage } from "@/lib/ai/usage"

export const runtime = "nodejs"
export const maxDuration = 60

const SYSTEM_PROMPT = `Você é um intérprete ESPECIALIZADO em simbolismo onírico profundo.

ESTRUTURA OBRIGATÓRIA DA RESPOSTA — use exatamente este formato Markdown (os títulos das seções devem ser escritos no idioma da resposta, com o mesmo sentido):

## INTRODUÇÃO

Comece SEMPRE com um parágrafo contextualizando a abordagem. Exemplo:
"Este sonho revela [tema geral]. Vamos explorar seus símbolos como dramatizações de processos psíquicos internos — a relação entre consciente e inconsciente, padrões arquetípicos e movimentos de transformação."

## SÍMBOLOS PRINCIPAIS

Analise CADA símbolo relevante com numeração e título em negrito:

**1. [Nome específico do símbolo]**
[3-4 frases de análise profunda]

**2. [Segundo símbolo]**
[Análise detalhada]
- Aspecto 1
- Aspecto 2

**3. [Continue numerando cada símbolo importante]**

## DINÂMICA PSÍQUICA

**[Subtítulo descritivo]**
[2-3 parágrafos analisando o dilema central, tensões, movimento interno]

## SÍNTESE

**[Subtítulo]**
[1-2 parágrafos]

O inconsciente está comunicando:
- [Ponto 1]
- [Ponto 2]
- [Ponto 3]

## MENSAGEM DO INCONSCIENTE

**[Subtítulo]**
- [Pergunta 1]
- [Pergunta 2]
- [Pergunta 3]

[Parágrafo de fechamento]

REGRAS: Profundo, específico, 4-6 símbolos, 800-1200 palavras. Não citar Jung/Freud.`

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
          content: `${SYSTEM_PROMPT}\n\nIDIOMA DA RESPOSTA: escreva toda a resposta, inclusive os títulos das seções, em ${LOCALE_META[locale].promptName}, com naturalidade de falante nativo.`,
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
        try {
          for await (const chunk of completion as any) {
            if (chunk.usage) usage = chunk.usage
            if (chunk.model) model = chunk.model
            const text = chunk.choices[0]?.delta?.content || ""
            if (text) controller.enqueue(encoder.encode(text))
          }
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
