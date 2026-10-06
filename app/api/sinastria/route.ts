import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserEntitlement } from "@/lib/billing/entitlement"
import type { DadosNascimento } from "@/lib/astro/mapa"
import { compararAvulsa, ehVinculo, validarNascimento, type NascimentoValidado } from "@/lib/astro/sinastria-servico"
import { pessoasStore } from "@/lib/astro/sinastria-store-supabase"

export const runtime = "nodejs"

/**
 * POST /api/sinastria
 *
 * Compara o mapa de quem pede com o de outra pessoa e devolve os FATOS da
 * relação. Não há texto, não há modelo, não há custo por chamada.
 *
 * O corpo traz `vinculo` e UM de dois: `pessoa` (os dados de nascimento, para
 * a comparação avulsa) ou `pessoaId` (uma pessoa que o usuário já guardou).
 *
 * ESTA ROTA NÃO GRAVA NADA. A pessoa B de uma comparação avulsa vive só na
 * memória desta requisição. Guardar é `POST /api/sinastria/pessoas`.
 *
 * A ordem é a mesma das Interconexões: o usuário vem da sessão, o plano é
 * conferido antes de qualquer cálculo, e só então os mapas são lidos.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "nao_autenticado" }, { status: 401 })

  const entitlement = await getUserEntitlement(user.id)

  const corpo = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!ehVinculo(corpo?.vinculo)) return NextResponse.json({ error: "vinculo_invalido" }, { status: 400 })
  const vinculo = corpo.vinculo

  let b: NascimentoValidado
  if (typeof corpo?.pessoaId === "string") {
    const salva = await pessoasStore(supabase).obter(user.id, corpo.pessoaId)
    if (!salva) return NextResponse.json({ error: "pessoa_nao_encontrada" }, { status: 404 })
    b = {
      born_on: salva.born_on,
      born_at: salva.born_at,
      lat: salva.lat,
      lon: salva.lon,
      place_label: salva.place_label,
      tz: salva.tz,
      tzStatus: salva.tz_status,
    }
  } else {
    const v = validarNascimento(corpo?.pessoa)
    if (!v.ok) return NextResponse.json({ error: v.erro }, { status: 400 })
    b = v.dados
  }

  const { data: linha } = await supabase
    .from("birth_data")
    .select("born_on, born_at, tz, lat, lon")
    .eq("user_id", user.id)
    .maybeSingle()
  if (!linha) return NextResponse.json({ error: "sem_mapa" }, { status: 404 })

  const a: DadosNascimento = {
    born_on: linha.born_on as string,
    born_at: ((linha.born_at as string | null) ?? null)?.slice(0, 5) ?? null,
    lat: linha.lat as number,
    lon: linha.lon as number,
    place_label: "",
    tz: linha.tz as string,
  }

  const r = compararAvulsa({ plano: entitlement.plan, a, b, vinculo })
  if (!r.ok) return NextResponse.json({ error: r.erro, plan: entitlement.plan }, { status: r.status })
  const { ok: _ok, ...resposta } = r
  return NextResponse.json(resposta)
}
