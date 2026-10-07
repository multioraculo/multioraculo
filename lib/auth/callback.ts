import {
  AUTH_RETURN_PARAM, OAUTH_NEXT_COOKIE, OAUTH_NEXT_PATH, nextFromCookieValue, readCookieHeader, withQueryParam,
} from "@/lib/auth/oauth-next"

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

  // O adapter da Netlify anexa a query da REQUEST (code, state...) a qualquer
  // redirect cujo Location não tenha query própria. Por isso toda saída leva uma
  // query própria: `auth_return=1` no sucesso, `auth_error` na falha. O Header
  // remove o marcador da URL depois do retorno.
  const finish = (reason?: "cancelled" | "failed") => {
    const path = reason ? withQueryParam(next, "auth_error", reason) : withQueryParam(next, AUTH_RETURN_PARAM, "1")
    const target = new URL(path, deps.base)
    const secure = deps.base.startsWith("https:")
    // Apaga de verdade: Max-Age=0 E Expires no passado, mesmo Path (a mesclagem de
    // cookies do Next descarta o Max-Age=0 sozinho; o Expires garante a deleção).
    const headers = new Headers({ Location: target.toString() })
    headers.append(
      "Set-Cookie",
      `${OAUTH_NEXT_COOKIE}=; Path=${OAUTH_NEXT_PATH}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax` +
        (secure ? "; Secure" : "")
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
