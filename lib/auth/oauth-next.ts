import { safeNext } from "@/lib/auth/safe-next"

// Destino de retorno do OAuth, levado em cookie curto em vez de na query do
// `redirectTo`: o Supabase só aceita `redirectTo` EXATAMENTE igual a uma entrada
// da allowlist, e uma query string o faz cair no Site URL. O cookie é escrito
// pelo navegador, então NUNCA é confiável: toda leitura passa de novo por safeNext.

export const OAUTH_NEXT_COOKIE = "mo.oauth.next"
export const OAUTH_NEXT_PATH = "/auth"
export const OAUTH_NEXT_MAX_AGE_S = 600
const VERSION = "v1"

/** Valor do cookie: `v1.<epoch s>.<caminho codificado>`. Só o caminho interno, nada da leitura. */
export function encodeNextCookieValue(next: string, nowMs: number = Date.now()): string {
  return `${VERSION}.${Math.floor(nowMs / 1000)}.${encodeURIComponent(safeNext(next))}`
}

/** Linha para `document.cookie`. */
export function serializeNextCookie(next: string, opts: { secure: boolean; nowMs?: number }): string {
  return (
    `${OAUTH_NEXT_COOKIE}=${encodeNextCookieValue(next, opts.nowMs)}` +
    `; Path=${OAUTH_NEXT_PATH}; Max-Age=${OAUTH_NEXT_MAX_AGE_S}; SameSite=Lax` +
    (opts.secure ? "; Secure" : "")
  )
}

/** Extrai o valor bruto do cookie do cabeçalho `Cookie`. */
export function readCookieHeader(header: string | null | undefined, name = OAUTH_NEXT_COOKIE): string | null {
  if (!header) return null
  for (const part of header.split(";")) {
    const i = part.indexOf("=")
    if (i < 0) continue
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim()
  }
  return null
}

/**
 * Destino a partir do valor bruto do cookie. Ausente, malformado, expirado,
 * do futuro ou fora de safeNext: devolve "/".
 */
export function nextFromCookieValue(raw: string | null | undefined, nowMs: number = Date.now()): string {
  if (!raw) return "/"
  const parts = raw.split(".")
  if (parts.length < 3 || parts[0] !== VERSION) return "/"
  const ts = Number(parts[1])
  if (!Number.isInteger(ts)) return "/"
  const ageS = Math.floor(nowMs / 1000) - ts
  if (ageS > OAUTH_NEXT_MAX_AGE_S || ageS < -60) return "/"
  let decoded: string
  try {
    decoded = decodeURIComponent(parts.slice(2).join("."))
  } catch {
    return "/"
  }
  return safeNext(decoded)
}
