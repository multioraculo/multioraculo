import { createClient } from "@/lib/supabase/server"
import { handleAuthCallback } from "@/lib/auth/callback"

/**
 * Callback único do OAuth (Google) via Supabase, fluxo PKCE.
 * Troca o `code` por sessão NO SERVIDOR; os cookies da sessão saem na
 * própria resposta de redirect. O destino vem do cookie `mo.oauth.next`
 * (ver lib/auth/callback.ts); falhas e cancelamentos voltam a ele com
 * `?auth_error=...`, que o Header traduz em aviso curto.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  // atrás do Netlify o host público vem em x-forwarded-host
  const forwardedHost = request.headers.get("x-forwarded-host")
  const base =
    process.env.NODE_ENV !== "production" || !forwardedHost ? origin : `https://${forwardedHost}`

  return handleAuthCallback(request, {
    base,
    exchange: async (code) => {
      const supabase = await createClient()
      return supabase.auth.exchangeCodeForSession(code)
    },
  })
}
