import { NextResponse } from "next/server"
import OpenAI, { toFile } from "openai"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { resolveLocale } from "@/lib/i18n/config"
import { VISITOR_COOKIE, isVisitorId } from "@/lib/billing/visitor"
import { recordAiUsage } from "@/lib/ai/usage"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Transcrição de voz para texto. Recebe UM segmento de áudio (multipart:
 * `audio`, `locale`) e devolve só o texto.
 *
 * Privacidade: o áudio existe apenas em memória, pelo tempo da chamada à
 * OpenAI, e é descartado com a resposta. Nada vai para disco, banco,
 * storage ou log; o texto transcrito também não é registrado. Em ai_usage
 * fica só duração/custo estimado, sem conteúdo.
 *
 * Não consome nenhuma cota de tiragem ou sonho: é só outra forma de
 * preencher um campo. Limites de abuso: tamanho do segmento, duração
 * declarada e um teto de segmentos por pessoa numa janela curta.
 */

const MODEL = "gpt-4o-mini-transcribe"
const MAX_BYTES = 2_500_000 // ~12 s de áudio com folga, em qualquer codec
const MAX_SEGMENT_SECONDS = 20
const WINDOW_MS = 10 * 60 * 1000
const MAX_SEGMENTS_PER_WINDOW = 60 // ≈ 12 min de fala a cada 10 min, por pessoa

// Melhor esforço por instância (funções serverless podem ter várias).
const buckets = new Map<string, number[]>()
function allow(key: string): boolean {
  const now = Date.now()
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (arr.length >= MAX_SEGMENTS_PER_WINDOW) {
    buckets.set(key, arr)
    return false
  }
  arr.push(now)
  buckets.set(key, arr)
  if (buckets.size > 5000) buckets.clear()
  return true
}

const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } })

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return json({ error: "unavailable", code: "unavailable" }, 503)

  // quem está pedindo: conta ou visitante (só para o limite e para o registro de custo)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const v = (await cookies()).get(VISITOR_COOKIE)?.value
  const visitorId = isVisitorId(v) ? v : null
  const key = user?.id ?? visitorId
  if (!key) return json({ error: "forbidden", code: "forbidden" }, 403)
  if (!allow(key)) return json({ error: "rate_limited", code: "rate_limited" }, 429)

  const length = Number(req.headers.get("content-length") ?? 0)
  if (length > MAX_BYTES + 4096) return json({ error: "too_large", code: "too_large" }, 413)

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return json({ error: "bad_request", code: "bad_request" }, 400)
  }
  const audio = form.get("audio")
  const locale = resolveLocale(String(form.get("locale") ?? ""))
  const seconds = Math.min(MAX_SEGMENT_SECONDS, Math.max(0, Number(form.get("seconds") ?? 0) || 0))
  if (!(audio instanceof Blob) || audio.size === 0) return json({ error: "bad_request", code: "bad_request" }, 400)
  if (audio.size > MAX_BYTES) return json({ error: "too_large", code: "too_large" }, 413)
  const type = audio.type || "audio/webm"
  if (!/^audio\/|^video\/(mp4|webm)/.test(type)) return json({ error: "bad_request", code: "bad_request" }, 400)
  const ext = type.includes("mp4") || type.includes("m4a") ? "m4a" : type.includes("ogg") ? "ogg" : type.includes("wav") ? "wav" : "webm"

  try {
    const openai = new OpenAI({ apiKey })
    // o buffer vive só aqui; sai de escopo ao fim da função
    const file = await toFile(Buffer.from(await audio.arrayBuffer()), `segment.${ext}`, { type })
    const result: any = await openai.audio.transcriptions.create({
      file,
      model: MODEL,
      language: locale,
      response_format: "json",
    })
    const text = String(result?.text ?? "").trim()

    // custo: tokens de áudio quando a API informa; senão, estimativa por duração
    const usage = result?.usage
    await recordAiUsage({
      operation: "transcribe",
      model: MODEL,
      usage: usage && typeof usage.input_tokens === "number"
        ? { prompt_tokens: usage.input_tokens, completion_tokens: usage.output_tokens ?? 0, total_tokens: usage.total_tokens ?? 0 }
        : { prompt_tokens: Math.round(seconds * 50), completion_tokens: Math.round(text.length / 4), total_tokens: 0 },
      userId: user?.id ?? null,
    })

    return json({ text })
  } catch (err: any) {
    console.error("[voice/transcribe]", err?.status ?? "", err?.message ?? err)
    return json({ error: "transcription_failed", code: "failed" }, 502)
  }
}
