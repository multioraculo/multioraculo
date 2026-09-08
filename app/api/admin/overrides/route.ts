import { NextResponse } from "next/server"
import { currentAdmin } from "@/lib/admin/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

/**
 * Acessos especiais (beta testers e afins). Só admin, validado no servidor.
 * POST   { email, plan?: "unlimited" | "essential", reason?, expiresAt? }  → cria
 * DELETE { id }                                                            → revoga
 * Nunca cria nada na Stripe; nunca conta como assinatura paga.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REASON_RE = /^[\p{L}\p{N} _\-.,:]{1,80}$/u
const PLANS = new Set(["unlimited", "essential"])

const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } })

export async function POST(req: Request) {
  const admin = await currentAdmin()
  if (!admin) return json({ error: "Acesso negado." }, 403)

  const body = await req.json().catch(() => ({}))
  const email = String(body?.email ?? "").trim().toLowerCase()
  const plan = body?.plan ? String(body.plan) : "unlimited"
  const reason = String(body?.reason ?? "beta_tester").trim() || "beta_tester"
  const expiresRaw = body?.expiresAt ? String(body.expiresAt).trim() : ""

  if (!EMAIL_RE.test(email) || email.length > 254) return json({ error: "E-mail inválido.", code: "invalid_email" }, 400)
  if (!PLANS.has(plan)) return json({ error: "Plano inválido.", code: "invalid_plan" }, 400)
  if (!REASON_RE.test(reason)) return json({ error: "Motivo inválido (até 80 caracteres, sem símbolos).", code: "invalid_reason" }, 400)
  if (reason === "admin") return json({ error: "Papel de admin não é concedido por aqui.", code: "invalid_reason" }, 400)

  let expiresAt: string | null = null
  if (expiresRaw) {
    const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(expiresRaw) ? `${expiresRaw}T23:59:59-03:00` : expiresRaw)
    if (!Number.isFinite(d.getTime())) return json({ error: "Data de expiração inválida.", code: "invalid_expiry" }, 400)
    if (d.getTime() <= Date.now()) return json({ error: "A expiração precisa ser no futuro.", code: "invalid_expiry" }, 400)
    expiresAt = d.toISOString()
  }

  const { data, error } = await createAdminClient()
    .from("access_overrides")
    .insert({ email, plan_override: plan, reason, expires_at: expiresAt, created_by: admin.id })
    .select("id")
    .single()
  if (error) {
    if (error.code === "23505") return json({ error: "Já existe um acesso vigente para este e-mail.", code: "exists" }, 409)
    console.error("[admin/overrides] insert:", error.message)
    return json({ error: "Não foi possível criar o acesso." }, 500)
  }
  return json({ ok: true, id: data.id })
}

export async function DELETE(req: Request) {
  const admin = await currentAdmin()
  if (!admin) return json({ error: "Acesso negado." }, 403)

  const body = await req.json().catch(() => ({}))
  const id = String(body?.id ?? "")
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "Id inválido.", code: "invalid_id" }, 400)

  const db = createAdminClient()
  const { data: row } = await db.from("access_overrides").select("id, email, reason, revoked_at").eq("id", id).maybeSingle()
  if (!row) return json({ error: "Acesso não encontrado.", code: "not_found" }, 404)
  if (row.revoked_at) return json({ ok: true, already: true })
  // não deixa o admin logado revogar o próprio acesso de admin por engano
  if (row.reason === "admin" && admin.email && row.email === admin.email.toLowerCase()) {
    return json({ error: "Você não pode revogar o seu próprio acesso de admin.", code: "self" }, 400)
  }

  const { error } = await db.from("access_overrides").update({ revoked_at: new Date().toISOString() }).eq("id", id).is("revoked_at", null)
  if (error) {
    console.error("[admin/overrides] revoke:", error.message)
    return json({ error: "Não foi possível revogar." }, 500)
  }
  return json({ ok: true })
}
