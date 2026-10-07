// Lógica de auth do Header, fora do componente para poder ser testada.
//
// REGRA DE OURO do onAuthStateChange: o callback roda DENTRO do lock do cliente
// de auth (no exchange PKCE, SIGNED_IN é emitido com o lock preso). Se ele fizer
// `await` de qualquer chamada que volte ao Supabase (a consulta pede
// getSession(), que espera o mesmo lock), o cliente trava para sempre:
// o `?code=` não sai da URL, INITIAL_SESSION não vem, getSession e signOut
// penduram. Por isso o callback é SÍNCRONO e todo trabalho remoto é adiado.

export type AuthUserLike = { id: string }
export type AuthEvent = string

export type AuthStateDeps = {
  setUser: (user: AuthUserLike | null) => void
  /** consulta/escrita remota do profile; só roda adiada, nunca dentro do callback */
  ensureProfile: (user: AuthUserLike) => Promise<{ error?: unknown } | void>
  refresh: () => void
  markerDone: (uid: string) => boolean
  markDone: (uid: string) => void
  clearMarker: () => void
  /** adia o trabalho para depois da liberação do lock (padrão: setTimeout 0) */
  schedule?: (fn: () => void) => void
}

export function createAuthStateHandler(deps: AuthStateDeps) {
  const schedule = deps.schedule ?? ((fn: () => void) => void setTimeout(fn, 0))
  const inFlight = new Set<string>()

  async function afterSignIn(event: AuthEvent, user: AuthUserLike) {
    const uid = user.id
    // SIGNED_IN e INITIAL_SESSION em sequência: o profile roda uma vez só
    if (!deps.markerDone(uid) && !inFlight.has(uid)) {
      inFlight.add(uid)
      try {
        const res = await deps.ensureProfile(user)
        if (!res || !res.error) deps.markDone(uid)
      } catch {
        // falha de rede: sem marcador, a próxima carga tenta de novo
      } finally {
        inFlight.delete(uid)
      }
    }
    if (event === "SIGNED_IN") deps.refresh()
  }

  // NÃO é async e não devolve Promise.
  return function onAuthStateChange(event: AuthEvent, session: { user?: AuthUserLike | null } | null): void {
    const user = session?.user ?? null
    deps.setUser(user)

    if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && user) {
      schedule(() => {
        void afterSignIn(event, user)
      })
    } else if (event === "SIGNED_OUT") {
      deps.clearMarker()
      schedule(() => deps.refresh())
    }
  }
}

export type SignOutAuth = {
  signOut: (opts?: { scope: "local" | "global" | "others" }) => Promise<{ error: unknown }>
  getSession: () => Promise<{ data: { session: unknown | null } }>
}

/**
 * Encerra a sessão. Tenta o logout normal; se vier erro, tenta o local (que
 * limpa os cookies sem depender do /logout). Devolve true só se a sessão
 * realmente sumiu. Roda fora de qualquer onAuthStateChange.
 */
export async function performSignOut(auth: SignOutAuth, clearMarker: () => void): Promise<boolean> {
  let failed = false
  try {
    let { error } = await auth.signOut()
    if (error) ({ error } = await auth.signOut({ scope: "local" }))
    failed = Boolean(error)
  } catch {
    failed = true
  }
  clearMarker()
  if (failed) return false
  try {
    const { data } = await auth.getSession()
    if (data.session) return false
  } catch {
    // sem como verificar: vale o resultado do signOut
  }
  return true
}
