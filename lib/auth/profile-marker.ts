// Marcador de "profile já garantido nesta aba". Guarda SÓ o id do usuário e é
// comparado por igualdade: outro usuário (ou valor ausente/corrompido) nunca
// herda o bootstrap de ninguém, apenas faz ensureProfile rodar de novo, que é
// idempotente. Falha de storage nunca quebra o login.

export const PROFILE_MARKER_KEY = "mo.profile.ok"

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">

function defaultStore(): Store | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage
  } catch {
    return null
  }
}

export function profileMarkerDone(uid: string, store: Store | null = defaultStore()): boolean {
  if (!uid || !store) return false
  try {
    return store.getItem(PROFILE_MARKER_KEY) === uid
  } catch {
    return false
  }
}

export function markProfileDone(uid: string, store: Store | null = defaultStore()): void {
  if (!uid || !store) return
  try {
    store.setItem(PROFILE_MARKER_KEY, uid)
  } catch {}
}

export function clearProfileMarker(store: Store | null = defaultStore()): void {
  if (!store) return
  try {
    store.removeItem(PROFILE_MARKER_KEY)
  } catch {}
}
