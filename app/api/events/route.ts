import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { logEvent } from "@/lib/billing/events"
import { VISITOR_COOKIE, isVisitorId } from "@/lib/billing/visitor"

export const runtime = "nodejs"

/**
 * Evento de interface registrado pelo navegador. Lista fechada: só
 * "oracle_opened" (qual cartão de oráculo a pessoa abriu). Sem conteúdo.
 */
const ORACLES = new Set(["tarot", "iching", "runas", "buzios", "lenormand"])

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const type = String(body?.type ?? "")
  if (type !== "oracle_opened") return NextResponse.json({ ok: false }, { status: 400 })

  const oracle = String(body?.oracle ?? "")
  if (!ORACLES.has(oracle)) return NextResponse.json({ ok: false }, { status: 400 })
  const seedRaw = String(body?.seed ?? "")
  const seed = /^[0-9a-f]{8,64}$/i.test(seedRaw) ? seedRaw : null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const v = (await cookies()).get(VISITOR_COOKIE)?.value
  await logEvent("oracle_opened", { userId: user?.id ?? null, visitorId: isVisitorId(v) ? v : null, seed, meta: { oracle } })
  return NextResponse.json({ ok: true })
}
