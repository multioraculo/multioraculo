/**
 * GET  /api/marcos  → os marcos da pessoa, ativos primeiro
 * POST /api/marcos  → cria um marco
 *
 * Dado pessoal: tudo passa pelo cliente do usuário, e a RLS garante que
 * ninguém lê nem escreve o marco de outra pessoa.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { FORMATO_DATA, hojeCivil } from "@/lib/marcos"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const { data, error } = await supabase
    .from("milestones")
    .select("id, name, started_on, note, archived")
    .eq("user_id", user.id)
    .order("archived", { ascending: true })
    .order("started_on", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ marcos: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const corpo = await request.json().catch(() => null)
  const name = String(corpo?.name ?? "").trim()
  const started_on = String(corpo?.started_on ?? "").trim()
  const note = corpo?.note ? String(corpo.note).trim().slice(0, 280) : null

  if (!name || name.length > 80) return NextResponse.json({ error: "Nome inválido." }, { status: 400 })
  if (!FORMATO_DATA.test(started_on)) return NextResponse.json({ error: "Data inválida." }, { status: 400 })
  // um marco começa no passado ou hoje: contar para a frente seria outra coisa
  if (started_on > hojeCivil()) return NextResponse.json({ error: "A data de início não pode estar no futuro." }, { status: 400 })

  const { data, error } = await supabase
    .from("milestones")
    .insert({ user_id: user.id, name, started_on, note })
    .select("id, name, started_on, note, archived")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ marco: data })
}
