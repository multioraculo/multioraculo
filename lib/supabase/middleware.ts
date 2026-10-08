import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { VISITOR_COOKIE, isVisitorId, newVisitorId, visitorCookieOptions } from "@/lib/billing/visitor"

/**
 * `opcoes` existe para o roteamento por idioma (middleware.ts): um rewrite
 * interno (/en/oracles atende por /oraculos) e cabeçalhos internos de idioma.
 * Sem opções, o comportamento é exatamente o de sempre.
 */
export type OpcoesDeRoteamento = { rewriteTo?: URL; headers?: Record<string, string> }

export async function updateSession(request: NextRequest, opcoes: OpcoesDeRoteamento = {}) {
  // A resposta que repassa a requisição adiante. É recriada quando a sessão
  // renova os cookies, então o rewrite e os cabeçalhos precisam sair daqui, e
  // não de uma única chamada, ou a segunda resposta os perderia.
  const novaResposta = () => {
    if (!opcoes.rewriteTo && !opcoes.headers) return NextResponse.next({ request })
    const headers = new Headers(request.headers)
    for (const [k, v] of Object.entries(opcoes.headers ?? {})) headers.set(k, v)
    return opcoes.rewriteTo
      ? NextResponse.rewrite(opcoes.rewriteTo, { request: { headers } })
      : NextResponse.next({ request: { headers } })
  }

  // Id de visitante para a tiragem gratuita sem login (ver lib/billing/visitor.ts).
  // Gerado ANTES da resposta e gravado na própria requisição, para que a rota
  // desta mesma chamada já enxergue o id (evita dois ids na primeira visita).
  let pendingVisitorId: string | null = null
  if (!isVisitorId(request.cookies.get(VISITOR_COOKIE)?.value)) {
    pendingVisitorId = newVisitorId()
    request.cookies.set(VISITOR_COOKIE, pendingVisitorId)
  }

  let supabaseResponse = novaResposta()

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
          supabaseResponse = novaResposta()
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
