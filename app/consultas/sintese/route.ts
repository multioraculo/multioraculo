import { NextResponse } from "next/server"
import OpenAI from "openai"
import { coerceSynthesisInput, synthesisPrompt } from "@/lib/oracles/synthesis"
import { SYNTHESIS_SYSTEM_MESSAGE } from "@/lib/oracles/language"
import { resolveLocale } from "@/lib/i18n/config"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { claimSynthesis } from "@/lib/billing/usage"
import { VISITOR_COOKIE, isVisitorId } from "@/lib/billing/visitor"

export const runtime = "nodejs"
// Netlify impõe 60 s por função (não configurável). Esta rota só escreve a
// síntese, então fica bem abaixo disso.
export const maxDuration = 60

/**
 * Segunda etapa da consulta: recebe os oráculos já interpretados e devolve a
 * síntese em streaming (NDJSON: {type:"delta"} ... {type:"done"}).
 * Body: { question, oracles, seed?, locale? }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const question = String(body?.question || "").trim()
  const oracles = coerceSynthesisInput(body?.oracles)
  const locale = resolveLocale(body?.locale)
  const seed = String(body?.seed || "").trim()

  if (!question) {
    return NextResponse.json({ error: "Pergunta ausente." }, { status: 400 })
  }
  if (!oracles) {
    return NextResponse.json({ error: "Oráculos ausentes ou inválidos." }, { status: 400 })
  }

  // A síntese só existe para uma tiragem concluída (seed registrado em
  // reading_usage) do mesmo usuário, e uma única vez. Não conta na cota.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const visitorCookie = (await cookies()).get(VISITOR_COOKIE)?.value
  const visitorId = isVisitorId(visitorCookie) ? visitorCookie : null
  if (!seed || !(await claimSynthesis(seed, user?.id ?? null, visitorId))) {
    return NextResponse.json({ error: "Tiragem não encontrada ou já sintetizada.", code: "invalid_reading" }, { status: 403 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 })
  }

  const openai = new OpenAI({ apiKey })
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"))

      try {
        send({ type: "start", locale })

        const synthStream = await openai.chat.completions.create({
          model: "gpt-4o",
          temperature: 0.85,
          max_tokens: 900,
          presence_penalty: 0.3,
          stream: true,
          messages: [
            {
              role: "system",
              content: SYNTHESIS_SYSTEM_MESSAGE[locale],
            },
            { role: "user", content: synthesisPrompt(question, oracles, locale, seed) },
          ],
        })

        for await (const chunk of synthStream) {
          const delta = chunk.choices[0]?.delta?.content || ""
          if (delta) send({ type: "delta", text: delta })
        }

        send({ type: "done" })
      } catch (err: any) {
        try {
          send({ type: "error", message: String(err?.message || err) })
        } catch {}
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  })
}
