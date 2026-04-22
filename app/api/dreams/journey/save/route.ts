import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { analysis_text, dreams_analyzed } = body

  if (!analysis_text?.trim()) {
    return NextResponse.json({ error: "Texto da análise ausente." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("journey_analyses")
    .insert({
      user_id: user.id,
      analysis_text: analysis_text.trim(),
      dreams_analyzed: dreams_analyzed ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, journey: data })
}
