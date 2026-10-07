import { safeNext } from "@/lib/auth/safe-next"

// Destino de retorno do OAuth, levado em cookie curto em vez de na query do
// `redirectTo`: o Supabase só aceita `redirectTo` EXATAMENTE igual a uma entrada
// da allowlist, e uma query string o faz cair no Site URL. O cookie é escrito
// pelo navegador, então NUNCA é confiável: toda leitura passa de novo por safeNext.

export const OAUTH_NEXT_COOKIE = "mo.oauth.next"
export const OAUTH_NEXT_PATH = "/auth"
export const OAUTH_NEXT_MAX_AGE_S = 600
const VERSION = "v1"

// Parâmetros que pertencem a um retorno de OAuth, não ao destino. Se a página
// onde o login foi clicado ainda trazia um `?code=` de tentativa anterior, ele
// NÃO pode ir para o destino (o callback o devolveria na URL final).
const AUTH_QUERY_PARAMS = ["code", "state", "error", "error_code", "error_description", "auth_error", "auth_return"]

/** Remove da query do destino os parâmetros de OAuth; o resto da query fica como está. */
export function stripAuthParams(path: string): string {
  const url = new URL(path, "https://interno.invalid")
  if (!AUTH_QUERY_PARAMS.some((p) => url.searchParams.has(p))) return path
  for (const p of AUTH_QUERY_PARAMS) url.searchParams.delete(p)
  return url.pathname + url.search
}

/** Valor do cookie: `v1.<epoch s>.<caminho codificado>`. Só o caminho interno, nada da leitura. */
export function encodeNextCookieValue(next: string, nowMs: number = Date.now()): string {
  return `${VERSION}.${Math.floor(nowMs / 1000)}.${encodeURIComponent(stripAuthParams(safeNext(next)))}`
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
  return stripAuthParams(safeNext(decoded))
}

/** Marcador próprio do retorno bem-sucedido (ver withQueryParam e cleanAuthMarkers). */
export const AUTH_RETURN_PARAM = "auth_return"

/**
 * Acrescenta `chave=valor` ao fim da query de um caminho interno, sem reescrever
 * o resto da query (preserva os bytes dos parâmetros legítimos).
 */
export function withQueryParam(path: string, key: string, value: string): string {
  const hashAt = path.indexOf("#")
  const base = hashAt >= 0 ? path.slice(0, hashAt) : path
  const hash = hashAt >= 0 ? path.slice(hashAt) : ""
  const sep = base.includes("?") ? (base.endsWith("?") || base.endsWith("&") ? "" : "&") : "?"
  return `${base}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}${hash}`
}

/**
 * Usado pelo Header ao chegar da volta do OAuth. Remove da URL só `auth_error` e
 * `auth_return`, preservando o resto da query byte a byte. Devolve null se não
 * houver nenhum dos dois (nada a fazer).
 */
export function cleanAuthMarkers(href: string): { href: string; error: "cancelled" | "failed" | null; hadReturn: boolean } | null {
  const url = new URL(href, "https://interno.invalid")
  if (!url.search) return null
  const parts = url.search.slice(1).split("&")
  let error: "cancelled" | "failed" | null = null
  let hadReturn = false
  const keep: string[] = []
  for (const part of parts) {
    const eq = part.indexOf("=")
    const key = decodeURIComponentSafe(eq < 0 ? part : part.slice(0, eq))
    const value = eq < 0 ? "" : decodeURIComponentSafe(part.slice(eq + 1))
    if (key === "auth_error") error = value === "cancelled" ? "cancelled" : "failed"
    else if (key === AUTH_RETURN_PARAM) hadReturn = true
    else if (part !== "") keep.push(part)
  }
  if (!error && !hadReturn) return null
  const search = keep.length ? "?" + keep.join("&") : ""
  return { href: url.pathname + search + url.hash, error, hadReturn }
}

function decodeURIComponentSafe(v: string): string {
  try {
    return decodeURIComponent(v.replace(/\+/g, " "))
  } catch {
    return v
  }
}
