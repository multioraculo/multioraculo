import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeNext } from "@/lib/auth/safe-next"

/**
 * Callback único do OAuth (Google) via Supabase, fluxo PKCE.
 * Troca o `code` por sessão NO SERVIDOR; os cookies da sessão saem na
 * própria resposta de redirect. `next` só é aceito se for caminho interno.
 * Falhas e cancelamentos voltam ao destino com `?auth_error=...`, que o
 * Header traduz em aviso curto (nunca a mensagem técnica).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = safeNext(searchParams.get("next"))

  // atrás do Netlify o host público vem em x-forwarded-host
  const forwardedHost = request.headers.get("x-forwarded-host")
  const base =
    process.env.NODE_ENV !== "production" || !forwardedHost ? origin : `https://${forwardedHost}`

  const back = (reason?: "cancelled" | "failed") => {
    if (!reason) return NextResponse.redirect(`${base}${next}`)
    const u = new URL(next, base)
    u.searchParams.set("auth_error", reason)
    return NextResponse.redirect(u)
  }

  const providerError = searchParams.get("error")
  if (providerError) return back(providerError === "access_denied" ? "cancelled" : "failed")

  const code = searchParams.get("code")
  if (!code) return back("failed")

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return back("failed")
  } catch {
    return back("failed")
  }
  return back()
}
