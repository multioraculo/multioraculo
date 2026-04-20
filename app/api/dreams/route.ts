import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const { data, error } = await supabase
    .from("dreams")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ dreams: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const body = await request.json()
  const { dream_description, interpretation, personal_notes } = body

  if (!dream_description?.trim()) {
    return NextResponse.json({ error: "Descrição do sonho ausente." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("dreams")
    .insert({
      user_id: user.id,
      dream_description: dream_description.trim(),
      interpretation: interpretation ?? null,
      personal_notes: personal_notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, dream: data })
}
