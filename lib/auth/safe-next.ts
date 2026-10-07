// Destino de retorno do login (`next` / `returnTo`): só caminho interno.
// Usado pelo callback do OAuth e pelo modal de login. Qualquer coisa suspeita
// vira o fallback; nunca se tenta "consertar" a entrada.

const BASE = "https://interno.invalid"
const MAX_LEN = 512

export function safeNext(raw: unknown, fallback = "/"): string {
  if (typeof raw !== "string") return fallback
  const v = raw.trim()
  if (!v || v.length > MAX_LEN) return fallback
  if (!v.startsWith("/") || v.startsWith("//")) return fallback
  if (v.includes("\\") || /[\u0000-\u001f\u007f]/.test(v)) return fallback

  // a versão decodificada não pode virar "//host" nem trazer barra invertida
  let decoded = v
  try {
    decoded = decodeURIComponent(v)
  } catch {
    return fallback
  }
  if (decoded.startsWith("//") || decoded.includes("\\") || /[\u0000-\u001f\u007f]/.test(decoded)) return fallback

  let url: URL
  try {
    url = new URL(v, BASE)
  } catch {
    return fallback
  }
  if (url.origin !== BASE) return fallback
  // o próprio callback como destino faria laço
  if (url.pathname === "/auth/callback" || url.pathname.startsWith("/auth/callback/")) return fallback
  return url.pathname + url.search
}
