import type { SupabaseClient } from "@supabase/supabase-js"
import { safeNext } from "@/lib/auth/safe-next"

/**
 * Inicia o login com Google (PKCE: o verifier fica em cookie, o `code` é
 * trocado no servidor em /auth/callback). Só roda no navegador. Devolve true
 * se o redirecionamento foi iniciado.
 */
export async function startGoogleSignIn(
  supabase: SupabaseClient,
  returnTo?: string | null
): Promise<boolean> {
  const here = window.location.pathname + window.location.search
  const next = safeNext(returnTo, safeNext(here))
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  })
  return !error
}
