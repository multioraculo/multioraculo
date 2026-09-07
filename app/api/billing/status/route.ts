import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserEntitlementWithUsage } from "@/lib/billing/entitlement"

export const runtime = "nodejs"

/** Entitlement + consumo do usuário atual (só leitura; visitante recebe Free). */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const entitlement = await getUserEntitlementWithUsage(user?.id ?? null)
  return NextResponse.json({ authenticated: Boolean(user), ...entitlement }, { headers: { "Cache-Control": "no-store" } })
}
