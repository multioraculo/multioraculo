import type { SupabaseClient } from "@supabase/supabase-js"
import { safeNext } from "@/lib/auth/safe-next"
import { serializeNextCookie } from "@/lib/auth/oauth-next"

/**
 * Inicia o login com Google (PKCE: o verifier fica em cookie, o `code` é
 * trocado no servidor em /auth/callback). Só roda no navegador. Devolve true
 * se o redirecionamento foi iniciado.
 *
 * O `redirectTo` é SEMPRE `<origem>/auth/callback`, sem query, para casar
 * exatamente com a allowlist do Supabase. O destino de retorno vai no cookie
 * curto `mo.oauth.next` (validado de novo no callback).
 */
export async function startGoogleSignIn(
  supabase: SupabaseClient,
  returnTo?: string | null
): Promise<boolean> {
  const here = window.location.pathname + window.location.search
  const next = safeNext(returnTo, safeNext(here))
  document.cookie = serializeNextCookie(next, { secure: window.location.protocol === "https:" })
  const redirectTo = `${window.location.origin}/auth/callback`
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  })
  return !error
}
