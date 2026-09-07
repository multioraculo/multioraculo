import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { VISITOR_COOKIE, isVisitorId, newVisitorId, visitorCookieOptions } from "@/lib/billing/visitor"

export async function updateSession(request: NextRequest) {
  // Id de visitante para a tiragem gratuita sem login (ver lib/billing/visitor.ts).
  // Gerado ANTES da resposta e gravado na própria requisição, para que a rota
  // desta mesma chamada já enxergue o id (evita dois ids na primeira visita).
  let pendingVisitorId: string | null = null
  if (!isVisitorId(request.cookies.get(VISITOR_COOKIE)?.value)) {
    pendingVisitorId = newVisitorId()
    request.cookies.set(VISITOR_COOKIE, pendingVisitorId)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not add any logic between createServerClient and getUser().
  // A simple mistake here causes random logged-out issues on route change.
  await supabase.auth.getUser()

  if (pendingVisitorId) {
    supabaseResponse.cookies.set(VISITOR_COOKIE, pendingVisitorId, visitorCookieOptions())
  }

  return supabaseResponse
}
