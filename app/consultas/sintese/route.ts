import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createSynthesisFilter, normalizeSynthesisText, synthesisPrompt, type SynthesisInput } from "@/lib/oracles/synthesis"
import { SYNTHESIS_SYSTEM_MESSAGE } from "@/lib/oracles/language"
import { resolveLocale } from "@/lib/i18n/config"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { claimSynthesisSlot, releaseSynthesisSlot } from "@/lib/billing/usage"
import { loadOwnedReading, storeSynthesis } from "@/lib/billing/results"
import { VISITOR_COOKIE, isVisitorId } from "@/lib/billing/visitor"
import { recordAiUsage, type TokenUsage } from "@/lib/ai/usage"

export const runtime = "nodejs"
// Netlify impõe 60 s por função (não configurável). Esta rota só escreve a
// síntese, então trabalha dentro de um orçamento folgado.
export const maxDuration = 60

const SYNTHESIS_TIMEOUT_MS = 40_000
const HEARTBEAT_MS = 8_000

/**
 * Segunda etapa da consulta: escreve a síntese das cinco leituras.
 *
 * Body: { seed, locale? } — e SÓ isso. Os cinco resultados são lidos do
 * servidor pelo seed (reading_results), nunca recebidos do cliente: assim
 * ninguém sintetiza uma tiragem inventada.
 *
 * Nova tentativa é segura: se a síntese já existe, ela é devolvida tal como
 * foi guardada; se uma geração anterior morreu no meio, a vaga é retomada
 * depois de dois minutos. Em nenhum caso há novo sorteio, nova interpretação
 * ou novo consumo de cota.
 *
 * Erros saem por CÓDIGO; o texto mostrado à pessoa vem do dicionário do
 * cliente. Nada da OpenAI chega ao navegador.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const locale = resolveLocale(body?.locale)
  const seed = String(body?.seed || "").trim()

  if (!seed) {
    return NextResponse.json({ code: "reading_not_found" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const visitorCookie = (await cookies()).get(VISITOR_COOKIE)?.value
  const visitorId = isVisitorId(visitorCookie) ? visitorCookie : null

  const record = await loadOwnedReading(seed, user?.id ?? null, visitorId)
  if (!record) {
    return NextResponse.json({ code: "reading_not_found" }, { status: 404 })
  }

  const encoder = new TextEncoder()
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
  }

  // Síntese já escrita (refresh, nova tentativa depois de uma queda de rede):
  // devolve o texto guardado, sem OpenAI, sem custo e sem variação.
  const stored = record.synthesis?.trim()
  if (stored) {
    return new Response(replayStream(stored, encoder, locale), { headers })
  }

  // Uma geração por vez. Uma tentativa anterior que morreu libera a vaga
  // sozinha depois de dois minutos.
  if (!(await claimSynthesisSlot(seed))) {
    return NextResponse.json({ code: "synthesis_in_progress" }, { status: 409 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    await releaseSynthesisSlot(seed)
    return NextResponse.json({ code: "internal" }, { status: 500 })
  }

  const openai = new OpenAI({ apiKey })
  const oracles = record.oracles as unknown as SynthesisInput

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false
      const send = (obj: object) => {
        if (closed) return
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"))
      }
      // sinal de vida: sem isso, proxies e redes móveis derrubam a conexão
      const beat = setInterval(() => send({ type: "ping" }), HEARTBEAT_MS)

      let ok = false
      try {
        send({ type: "start", locale })

        const synthStream = await openai.chat.completions.create(
          {
            model: "gpt-4o",
            temperature: 0.85,
            max_tokens: 900,
            presence_penalty: 0.3,
            stream: true,
            stream_options: { include_usage: true },
            messages: [
              { role: "system", content: SYNTHESIS_SYSTEM_MESSAGE[locale] },
              { role: "user", content: synthesisPrompt(record.question, oracles, locale, seed) },
            ],
          },
          { timeout: SYNTHESIS_TIMEOUT_MS, maxRetries: 0 }
        )

        let usage: TokenUsage = null
        let model = "gpt-4o"
        let acc = ""
        // o marcador de parágrafo vira "\n\n" aqui e nunca chega ao navegador
        const filter = createSynthesisFilter()
        for await (const chunk of synthStream) {
          if (chunk.usage) usage = chunk.usage
          if (chunk.model) model = chunk.model
          const delta = chunk.choices[0]?.delta?.content || ""
          if (delta) {
            const text = filter.push(delta)
            if (text) {
              acc += text
              send({ type: "delta", text })
            }
          }
        }
        const tail = filter.flush()
        if (tail) {
          acc += tail
          send({ type: "delta", text: tail })
        }
        await recordAiUsage({ operation: "synthesis", model, usage, seed, userId: user?.id ?? null })

        const synthesis = normalizeSynthesisText(acc)
        if (!synthesis) throw new Error("síntese vazia")
        await storeSynthesis(seed, synthesis)
        ok = true
        send({ type: "done" })
      } catch (err) {
        console.error("[sintese]", seed, err)
        // a leitura continua guardada: liberar a vaga permite tentar de novo
        await releaseSynthesisSlot(seed).catch(() => {})
        send({ type: "error", code: "synthesis_failed" })
      } finally {
        clearInterval(beat)
        if (!ok) {
          // nada mais será enviado
        }
        closed = true
        controller.close()
      }
    },
  })

  return new Response(stream, { headers })
}

/** Devolve uma síntese já guardada no mesmo formato do streaming. */
function replayStream(text: string, encoder: TextEncoder, locale: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      const send = (obj: object) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"))
      send({ type: "start", locale })
      for (let i = 0; i < text.length; i += 120) {
        send({ type: "delta", text: text.slice(i, i + 120) })
      }
      send({ type: "done" })
      controller.close()
    },
  })
}
