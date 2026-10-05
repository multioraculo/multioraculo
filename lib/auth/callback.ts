import { OAUTH_NEXT_COOKIE, OAUTH_NEXT_PATH, nextFromCookieValue, readCookieHeader } from "@/lib/auth/oauth-next"

export type CallbackDeps = {
  exchange: (code: string) => Promise<{ error: unknown }>
  /** origem pública do site (já resolvida a partir do host/forwarded host) */
  base: string
  nowMs?: number
}

/**
 * Lógica do /auth/callback, separada da rota para ser testada. O destino vem
 * SÓ do cookie `mo.oauth.next` (revalidado por safeNext); a query `next` é
 * ignorada. O cookie é apagado em TODA saída.
 */
export async function handleAuthCallback(request: Request, deps: CallbackDeps): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const next = nextFromCookieValue(readCookieHeader(request.headers.get("cookie")), deps.nowMs)

  const finish = (reason?: "cancelled" | "failed") => {
    let target: URL
    if (reason) {
      target = new URL(next, deps.base)
      target.searchParams.set("auth_error", reason)
    } else {
      target = new URL(next, deps.base)
    }
    // Response padrão (não NextResponse): o módulo precisa carregar em Node puro nos testes
    const headers = new Headers({ Location: target.toString() })
    headers.append(
      "Set-Cookie",
      `${OAUTH_NEXT_COOKIE}=; Path=${OAUTH_NEXT_PATH}; Max-Age=0; SameSite=Lax` +
        (deps.base.startsWith("https:") ? "; Secure" : "")
    )
    return new Response(null, { status: 307, headers })
  }

  const providerError = searchParams.get("error")
  if (providerError) return finish(providerError === "access_denied" ? "cancelled" : "failed")

  const code = searchParams.get("code")
  if (!code) return finish("failed")

  try {
    const { error } = await deps.exchange(code)
    if (error) return finish("failed")
  } catch {
    return finish("failed")
  }
  return finish()
}
