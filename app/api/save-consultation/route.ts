import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const body = await request.json()
  const { question, synthesis, oracle_outputs } = body

  if (!question || !synthesis) {
    return NextResponse.json({ error: "Pergunta ou síntese ausente." }, { status: 400 })
  }

  const { data: consultation, error: insertError } = await supabase
    .from("consultations")
    .insert({
      user_id: user.id,
      question,
      synthesis,
      oracle_outputs: oracle_outputs ?? null,
      selected_oracles: null,
      is_saved: true,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, consultation })
}
