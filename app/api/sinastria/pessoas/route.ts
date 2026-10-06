import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserEntitlement } from "@/lib/billing/entitlement"
import { salvarPessoa } from "@/lib/astro/sinastria-servico"
import { pessoasStore } from "@/lib/astro/sinastria-store-supabase"

export const runtime = "nodejs"

/**
 * As pessoas que o usuário escolheu guardar para comparar de novo.
 *
 * GET    → a lista (apelido, cidade, data), sem hora nem coordenadas
 * POST   → o ato explícito de salvar: { apelido, nascimento }
 * DELETE → apaga uma pessoa (?id=...), e leva as leituras dela junto
 *
 * Salvar é recurso do plano pago. Listar e apagar NÃO são: quem deixa de pagar
 * continua podendo ver e apagar o que guardou, porque dado de terceiros não
 * pode ficar preso atrás de um paywall.
 */
async function sessao() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET() {
  const { supabase, user } = await sessao()
  if (!user) return NextResponse.json({ error: "nao_autenticado" }, { status: 401 })
  try {
    return NextResponse.json({ pessoas: await pessoasStore(supabase).listar(user.id) })
  } catch {
    return NextResponse.json({ error: "falhou" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { supabase, user } = await sessao()
  if (!user) return NextResponse.json({ error: "nao_autenticado" }, { status: 401 })
  const entitlement = await getUserEntitlement(user.id)
  const corpo = (await request.json().catch(() => null)) as Record<string, unknown> | null
  try {
    const r = await salvarPessoa({
      store: pessoasStore(supabase),
      ownerId: user.id,
      plano: entitlement.plan,
      apelido: corpo?.apelido,
      nascimento: corpo?.nascimento,
    })
    if (!r.ok) return NextResponse.json({ error: r.erro }, { status: r.status })
    return NextResponse.json({ id: r.id })
  } catch {
    return NextResponse.json({ error: "falhou" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { supabase, user } = await sessao()
  if (!user) return NextResponse.json({ error: "nao_autenticado" }, { status: 401 })
  const id = new URL(request.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id_ausente" }, { status: 400 })
  try {
    const apagou = await pessoasStore(supabase).apagar(user.id, id)
    return NextResponse.json({ ok: apagou }, { status: apagou ? 200 : 404 })
  } catch {
    return NextResponse.json({ error: "falhou" }, { status: 500 })
  }
}
