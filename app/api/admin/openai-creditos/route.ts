import { NextResponse } from "next/server"
import { currentAdmin } from "@/lib/admin/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

/**
 * Recargas feitas na conta da OpenAI. Só admin, validado no servidor.
 * POST   { amountUsd, occurredOn?: "AAAA-MM-DD", note? }  → registra
 * DELETE { id }                                           → apaga a linha
 *
 * Apaga de verdade, e não marca como revogado: é um lançamento digitado à mão,
 * e o único motivo para tirá-lo é ter sido digitado errado. Manter um erro de
 * digitação no histórico não conta nada a ninguém.
 */

const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } })

const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

export async function POST(req: Request) {
  const admin = await currentAdmin()
  if (!admin) return json({ error: "Acesso negado." }, 403)

  const body = await req.json().catch(() => ({}))
  const amountUsd = Number(body?.amountUsd)
  const occurredOn = String(body?.occurredOn ?? "").trim()
  const note = String(body?.note ?? "").trim()

  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return json({ error: "Valor precisa ser maior que zero.", code: "invalid_amount" }, 400)
  }
  if (amountUsd > 1_000_000) {
    return json({ error: "Valor acima do limite da tabela.", code: "invalid_amount" }, 400)
  }
  if (occurredOn && !DATA_RE.test(occurredOn)) {
    return json({ error: "Data inválida.", code: "invalid_date" }, 400)
  }
  if (note.length > 200) return json({ error: "Nota longa demais (até 200 caracteres).", code: "invalid_note" }, 400)

  const { data, error } = await createAdminClient()
    .from("openai_credits")
    .insert({
      // duas casas, que é o que a tabela guarda e o que o recibo mostra
      amount_usd: Math.round(amountUsd * 100) / 100,
      ...(occurredOn ? { occurred_on: occurredOn } : {}),
      note: note || null,
      created_by: admin.id,
    })
    .select("id")
    .single()

  if (error) {
    // a tabela ainda não existe: vale dizer isso, e não "erro inesperado"
    if (error.code === "42P01") {
      return json({ error: "A tabela openai_credits ainda não foi criada no banco.", code: "no_table" }, 409)
    }
    console.error("[admin/openai-creditos] insert:", error.message)
    return json({ error: "Não foi possível registrar a recarga." }, 500)
  }
  return json({ ok: true, id: data.id })
}

export async function DELETE(req: Request) {
  const admin = await currentAdmin()
  if (!admin) return json({ error: "Acesso negado." }, 403)

  const body = await req.json().catch(() => ({}))
  const id = String(body?.id ?? "")
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "Id inválido.", code: "invalid_id" }, 400)

  const { error } = await createAdminClient().from("openai_credits").delete().eq("id", id)
  if (error) {
    console.error("[admin/openai-creditos] delete:", error.message)
    return json({ error: "Não foi possível apagar." }, 500)
  }
  return json({ ok: true })
}
