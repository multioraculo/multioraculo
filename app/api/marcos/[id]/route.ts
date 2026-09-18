/**
 * PATCH  /api/marcos/[id]  → edita, arquiva ou reinicia
 * DELETE /api/marcos/[id]  → apaga
 *
 * Reiniciar é só mudar a data de início: não há contagem guardada para
 * zerar, nem nada a perder.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { FORMATO_DATA, hojeCivil } from "@/lib/marcos"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const corpo = await request.json().catch(() => null)
  const mudancas: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (corpo?.name !== undefined) {
    const name = String(corpo.name).trim()
    if (!name || name.length > 80) return NextResponse.json({ error: "Nome inválido." }, { status: 400 })
    mudancas.name = name
  }
  if (corpo?.started_on !== undefined) {
    const started_on = String(corpo.started_on).trim()
    if (!FORMATO_DATA.test(started_on)) return NextResponse.json({ error: "Data inválida." }, { status: 400 })
    if (started_on > hojeCivil()) return NextResponse.json({ error: "A data de início não pode estar no futuro." }, { status: 400 })
    mudancas.started_on = started_on
  }
  if (corpo?.note !== undefined) mudancas.note = corpo.note ? String(corpo.note).trim().slice(0, 280) : null
  if (corpo?.archived !== undefined) mudancas.archived = Boolean(corpo.archived)

  const { data, error } = await supabase
    .from("milestones")
    .update(mudancas)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, name, started_on, note, archived")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ marco: data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const { error } = await supabase.from("milestones").delete().eq("id", id).eq("user_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
