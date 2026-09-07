import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getUserEntitlementWithUsage } from "@/lib/billing/entitlement"
import { attributeVisitorReadings } from "@/lib/billing/usage"
import { VISITOR_COOKIE, isVisitorId } from "@/lib/billing/visitor"

export const runtime = "nodejs"

/**
 * Entitlement + consumo do usuário atual (só leitura; visitante recebe Free).
 * Logado: antes de ler, atribui à conta a tiragem gratuita feita sem login
 * com o mesmo cookie, para que "já usou" apareça logo após o login.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const v = (await cookies()).get(VISITOR_COOKIE)?.value
    await attributeVisitorReadings(user.id, isVisitorId(v) ? v : null)
  }
  const entitlement = await getUserEntitlementWithUsage(user?.id ?? null)
  return NextResponse.json({ authenticated: Boolean(user), ...entitlement }, { headers: { "Cache-Control": "no-store" } })
}
