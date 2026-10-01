/**
 * GET  /api/marcos  → os marcos da pessoa, ativos primeiro
 * POST /api/marcos  → cria um marco
 *
 * Dado pessoal: tudo passa pelo cliente do usuário, e a RLS garante que
 * ninguém lê nem escreve o marco de outra pessoa.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { FORMATO_DATA, META_MAXIMA, hojeCivil } from "@/lib/marcos"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  // ── a coluna `target` pode ainda não existir ──────────────────────────────
  //
  // Código e banco não sobem no mesmo instante: o deploy entra quando o build
  // termina, e a migration entra quando alguém a roda. Entre os dois, pedir uma
  // coluna que não existe faria o PostgREST devolver erro e Marcos sumiria da
  // Home de todo mundo — por causa de uma janela de minutos.
  //
  // Então a leitura tenta com a meta e, no erro de coluna inexistente (42703),
  // repete sem ela. Quando a migration tiver rodado em todos os ambientes, este
  // bloco pode virar uma consulta só outra vez.
  const COLUNAS = "id, name, started_on, note, archived"
  const consulta = (campos: string) =>
    supabase
      .from("milestones")
      .select(campos)
      .eq("user_id", user.id)
      .order("archived", { ascending: true })
      .order("started_on", { ascending: true })

  let { data, error } = await consulta(`${COLUNAS}, target`)
  if (error?.code === "42703") {
    console.warn("[marcos] coluna target ainda não existe no banco; lendo sem meta")
    ;({ data, error } = await consulta(COLUNAS))
  }

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
  // meta é opcional: ausente ou nula significa contagem sem fim
  const bruta = corpo?.target
  const target = bruta === undefined || bruta === null || bruta === "" ? null : Number(bruta)

  if (!name || name.length > 80) return NextResponse.json({ error: "Nome inválido." }, { status: 400 })
  if (!FORMATO_DATA.test(started_on)) return NextResponse.json({ error: "Data inválida." }, { status: 400 })
  if (target !== null && (!Number.isInteger(target) || target < 1 || target > META_MAXIMA)) {
    return NextResponse.json({ error: "Meta inválida." }, { status: 400 })
  }
  // um marco começa no passado ou hoje: contar para a frente seria outra coisa
  if (started_on > hojeCivil()) return NextResponse.json({ error: "A data de início não pode estar no futuro." }, { status: 400 })

  const criar = (comMeta: boolean) =>
    supabase
      .from("milestones")
      .insert(comMeta ? { user_id: user.id, name, started_on, note, target } : { user_id: user.id, name, started_on, note })
      .select(comMeta ? "id, name, started_on, note, archived, target" : "id, name, started_on, note, archived")
      .single()

  // mesma janela da leitura: sem a coluna, cria o marco sem meta em vez de
  // recusar. Perder a meta é ruim; não deixar criar marco nenhum é pior
  let { data, error } = await criar(true)
  if (error?.code === "42703") {
    console.warn("[marcos] coluna target ainda não existe no banco; criando sem meta")
    ;({ data, error } = await criar(false))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ marco: data })
}
