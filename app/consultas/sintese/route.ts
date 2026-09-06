import { NextResponse } from "next/server"
import OpenAI from "openai"
import { coerceSynthesisInput, synthesisPrompt } from "@/lib/oracles/synthesis"

export const runtime = "nodejs"
// Netlify impõe 60 s por função (não configurável). Esta rota só escreve a
// síntese, então fica bem abaixo disso.
export const maxDuration = 60

/**
 * Segunda etapa da consulta: recebe os oráculos já interpretados e devolve a
 * síntese em streaming (NDJSON: {type:"delta"} ... {type:"done"}).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const question = String(body?.question || "").trim()
  const oracles = coerceSynthesisInput(body?.oracles)

  if (!question) {
    return NextResponse.json({ error: "Pergunta ausente." }, { status: 400 })
  }
  if (!oracles) {
    return NextResponse.json({ error: "Oráculos ausentes ou inválidos." }, { status: 400 })
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
        send({ type: "start" })

        const synthStream = await openai.chat.completions.create({
          model: "gpt-4o",
          temperature: 0.7,
          max_tokens: 750,
          stream: true,
          messages: [
            {
              role: "system",
              content:
                "Escreva apenas a síntese em texto, sem títulos extras e sem bullets. Responda sempre no mesmo idioma em que a pergunta foi feita. Se a pergunta for em inglês, responda em inglês. Se for em português, responda em português.",
            },
            { role: "user", content: synthesisPrompt(question, oracles) },
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
