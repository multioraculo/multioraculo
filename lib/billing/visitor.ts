/**
 * Identidade de visitante sem login: um cookie httpOnly com um id aleatório.
 *
 * Serve para dar UMA tiragem gratuita antes de pedir conta e, depois do
 * login, atribuir essa tiragem à conta. Não é antifraude: o objetivo é
 * reduzir fricção na primeira experiência, não impedir contornos.
 *
 * Este módulo não importa nada do Next para poder ser usado no middleware.
 */

export const VISITOR_COOKIE = "mo_visitor"
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 ano

export function visitorCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE,
  }
}

/** Cabeçalho Set-Cookie pronto, para respostas que não usam NextResponse (streams). */
export function serializeVisitorCookie(id: string): string {
  const o = visitorCookieOptions()
  return [
    `${VISITOR_COOKIE}=${encodeURIComponent(id)}`,
    `Path=${o.path}`,
    `Max-Age=${o.maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
    o.secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")
}

export function isVisitorId(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f-]{20,64}$/i.test(v)
}

export function newVisitorId(): string {
  return crypto.randomUUID()
}
