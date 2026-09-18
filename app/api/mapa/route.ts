/**
 * GET    /api/mapa  → os dados de nascimento da pessoa e o mapa calculado
 * POST   /api/mapa  → grava os dados de nascimento e devolve o mapa
 * DELETE /api/mapa  → apaga os dados de nascimento
 *
 * O mapa nunca é gravado: ele é recalculado a cada leitura, a partir dos
 * mesmos cinco campos, e por isso não há como os dois discordarem. Dado
 * pessoal, então tudo passa pelo cliente do usuário e a RLS é quem garante
 * que ninguém vê o nascimento de outra pessoa.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ANOS_ACEITOS, mapaNatal, resolverZona, type DadosNascimento } from "@/lib/astro/mapa"
import { corposEm, diaDeHoje, estadoDoCeu } from "@/lib/astro/ceu"
import { interconexoesDoDia } from "@/lib/astro/interconexoes"
import { hojeCivil } from "@/lib/marcos"

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/
const FORMATO_HORA = /^\d{2}:\d{2}$/

type Linha = {
  born_on: string
  born_at: string | null
  tz: string
  tz_status: "ok" | "ambiguous" | "nonexistent"
  lat: number
  lon: number
  place_label: string
}

/** A hora volta do Postgres como "21:40:00"; a tela e o cálculo querem "21:40". */
const semSegundos = (hora: string | null) => (hora ? hora.slice(0, 5) : null)

/**
 * O mapa e, junto, onde o céu de hoje o toca. As duas coisas são cálculo puro:
 * não há modelo envolvido, nem custo por pessoa, e por isso elas não passam
 * por cache nem por cota.
 */
function comMapa(linha: Linha) {
  const dados: DadosNascimento = {
    born_on: linha.born_on,
    born_at: semSegundos(linha.born_at),
    lat: linha.lat,
    lon: linha.lon,
    place_label: linha.place_label,
    tz: linha.tz,
  }
  const mapa = mapaNatal(dados)
  const dia = diaDeHoje()
  const ceu = estadoDoCeu(dia)
  // uma hora adiante é o bastante para saber se o ângulo fecha ou abre
  const { escolhidas, recusadas } = interconexoesDoDia(mapa, ceu, corposEm(ceu.jdMeio + 1 / 24))
  return {
    nascimento: dados,
    tzStatus: linha.tz_status,
    mapa,
    dia,
    interconexoes: escolhidas,
    recusadas: recusadas.length,
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  // a Home só precisa saber se existe mapa, e não vale calcular um mapa
  // inteiro a cada abertura para decidir qual frase mostrar
  if (new URL(request.url).searchParams.get("resumo")) {
    const { data } = await supabase.from("birth_data").select("user_id").eq("user_id", user.id).maybeSingle()
    return NextResponse.json({ temMapa: Boolean(data) })
  }

  const { data, error } = await supabase
    .from("birth_data")
    .select("born_on, born_at, tz, tz_status, lat, lon, place_label")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ nascimento: null, mapa: null })
  return NextResponse.json(comMapa(data as Linha))
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const corpo = await request.json().catch(() => null)
  const born_on = String(corpo?.born_on ?? "").trim()
  const horaBruta = corpo?.born_at === null || corpo?.born_at === undefined || corpo?.born_at === "" ? null : String(corpo.born_at).trim()
  const lat = Number(corpo?.lat)
  const lon = Number(corpo?.lon)
  const place_label = String(corpo?.place_label ?? "").trim().slice(0, 120)

  if (!FORMATO_DATA.test(born_on)) return NextResponse.json({ error: "Data de nascimento inválida." }, { status: 400 })
  if (horaBruta !== null && !FORMATO_HORA.test(horaBruta)) return NextResponse.json({ error: "Hora de nascimento inválida." }, { status: 400 })
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return NextResponse.json({ error: "Latitude inválida." }, { status: 400 })
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return NextResponse.json({ error: "Longitude inválida." }, { status: 400 })
  if (!place_label) return NextResponse.json({ error: "Cidade de nascimento inválida." }, { status: 400 })

  const hoje = hojeCivil()
  if (born_on > hoje) return NextResponse.json({ error: "A data de nascimento não pode estar no futuro." }, { status: 400 })
  const limite = `${Number(hoje.slice(0, 4)) - ANOS_ACEITOS}${hoje.slice(4)}`
  if (born_on < limite) return NextResponse.json({ error: "O motor cobre os últimos cem anos." }, { status: 400 })

  const dados: DadosNascimento = { born_on, born_at: horaBruta, lat, lon, place_label }
  // a zona sai das coordenadas, nunca do que a pessoa digitou, e junto vem o
  // aviso de hora que acontece duas vezes ou de hora que não existe
  const zona = resolverZona(dados)

  const { error } = await supabase.from("birth_data").upsert(
    {
      user_id: user.id,
      born_on,
      born_at: horaBruta,
      tz: zona.tz,
      tz_status: zona.status,
      lat,
      lon,
      place_label,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(comMapa({ ...dados, born_at: horaBruta, tz: zona.tz, tz_status: zona.status } as Linha))
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const { error } = await supabase.from("birth_data").delete().eq("user_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
