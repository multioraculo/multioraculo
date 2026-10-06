// Transporte do destino do OAuth por cookie + callback. Sem rede e sem Supabase.
import { handleAuthCallback } from "../lib/auth/callback"
import {
  OAUTH_NEXT_COOKIE, encodeNextCookieValue, nextFromCookieValue, serializeNextCookie, stripAuthParams,
} from "../lib/auth/oauth-next"

let falhas = 0
function ok(c: boolean, n: string, extra?: unknown) {
  if (!c) { falhas++; console.error("FALHOU:", n, extra ?? "") }
}

const BASE = "https://oauth-google--multioraculo.netlify.app"
const NOW = 1_800_000_000_000
const ts = Math.floor(NOW / 1000)
const val = (next: string, ms = NOW) => encodeNextCookieValue(next, ms)

// ── cookie: serialização ─────────────────────────────────────────────────────
{
  const https = serializeNextCookie("/leitura/abc", { secure: true, nowMs: NOW })
  ok(https.startsWith(`${OAUTH_NEXT_COOKIE}=`), "nome do cookie")
  ok(/; Path=\/auth(;|$)/.test(https), "Path=/auth", https)
  ok(/; Max-Age=600(;|$)/.test(https), "vida de 10 min", https)
  ok(/; SameSite=Lax/.test(https), "SameSite=Lax", https)
  ok(/; Secure$/.test(https), "Secure em https", https)
  ok(!/; Secure/.test(serializeNextCookie("/", { secure: false, nowMs: NOW })), "sem Secure em http")
  ok(!/HttpOnly/i.test(https), "não finge HttpOnly")
  ok(https.split(";")[0] === `${OAUTH_NEXT_COOKIE}=v1.${ts}.%2Fleitura%2Fabc`, "valor = versão + carimbo + só o caminho", https)
  // o que entra no cookie já passa por safeNext
  ok(nextFromCookieValue(val("https://evil.com"), NOW) === "/", "gravar absoluto vira /")
}

// ── cookie: leitura ──────────────────────────────────────────────────────────
const lido = (raw: string | null | undefined, ms = NOW) => nextFromCookieValue(raw, ms)
ok(lido(val("/")) === "/", "destino /")
ok(lido(val("/leitura/abc123")) === "/leitura/abc123", "destino /leitura/<seed>")
ok(lido(val("/assinatura?plano=ilimitado&x=1")) === "/assinatura?plano=ilimitado&x=1", "destino com query própria")
ok(lido(null) === "/" && lido(undefined) === "/" && lido("") === "/", "cookie ausente")
ok(lido(val("/leitura/abc", NOW - 601_000)) === "/", "cookie expirado (>10 min)")
ok(lido(val("/leitura/abc", NOW - 599_000)) === "/leitura/abc", "dentro da validade")
ok(lido(val("/leitura/abc", NOW + 3_600_000)) === "/", "carimbo do futuro")
for (const lixo of ["lixo", "v1", "v1.", "v1.x.%2F", "v2.1800000000.%2Fa", "v1.1800000000", "v1.1800000000.%E0%A4%A", "%2Fleitura%2Fabc"]) {
  ok(lido(lixo) === "/", `malformado: ${lixo}`)
}
// adulterado à mão: valor bem formado com destino hostil
const hostis = [
  "https://evil.com", "//evil.com", "/\\evil.com", "/%2F%2Fevil.com", "/%5Cevil.com",
  "javascript:alert(1)", "/auth/callback", "/auth/callback?next=/", "http://evil.com/a",
]
for (const hostil of hostis) {
  const r = lido(`v1.${ts}.${encodeURIComponent(hostil)}`)
  ok(r === "/", `cookie adulterado (${hostil}) nunca vira redirect externo`, r)
  ok(lido(`v1.${ts}.${hostil}`) === "/", `cookie adulterado cru (${hostil})`)
}

// ── callback ─────────────────────────────────────────────────────────────────
function req(qs: string, cookieValue: string | null) {
  const headers: Record<string, string> = {}
  if (cookieValue !== null) headers.cookie = `outro=1; ${OAUTH_NEXT_COOKIE}=${cookieValue}`
  return new Request(`${BASE}/auth/callback${qs}`, { headers })
}
function apagaCookie(res: Response) {
  const sc = res.headers.get("set-cookie") ?? ""
  return sc.includes(`${OAUTH_NEXT_COOKIE}=;`) && /Max-Age=0/i.test(sc) && /Path=\/auth/i.test(sc)
}
const exchangeOk = async () => ({ error: null as unknown })
const exchangeErro = async () => ({ error: new Error("x") as unknown })
const exchangeLanca = async (): Promise<{ error: unknown }> => { throw new Error("rede") }

async function main() {
  // sucesso: vai ao destino do cookie e apaga o cookie
  {
    let chamado = ""
    const res = await handleAuthCallback(req("?code=abc", val("/leitura/seed1")), {
      base: BASE, nowMs: NOW, exchange: async (c) => { chamado = c; return { error: null } },
    })
    ok(chamado === "abc", "troca o code")
    ok(res.headers.get("location") === `${BASE}/leitura/seed1`, "sucesso → destino do cookie", res.headers.get("location"))
    ok(apagaCookie(res), "sucesso apaga o cookie")
  }
  // sem cookie → "/"
  {
    const res = await handleAuthCallback(req("?code=abc", null), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(res.headers.get("location") === `${BASE}/`, "sem cookie → /")
    ok(apagaCookie(res), "sem cookie também limpa")
  }
  // a query `next` é ignorada
  {
    const res = await handleAuthCallback(req("?code=abc&next=https://evil.com", val("/faq")), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(res.headers.get("location") === `${BASE}/faq`, "query next ignorada")
    const res2 = await handleAuthCallback(req("?code=abc&next=//evil.com", null), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(res2.headers.get("location") === `${BASE}/`, "query next hostil sem cookie → /")
  }
  // cookie adulterado no callback: nunca sai do domínio
  for (const hostil of ["https://evil.com", "//evil.com", "/\\evil.com"]) {
    for (const forma of [`v1.${ts}.${encodeURIComponent(hostil)}`, hostil, encodeURIComponent(hostil)]) {
      const res = await handleAuthCallback(req("?code=abc", forma), { base: BASE, nowMs: NOW, exchange: exchangeOk })
      const loc = res.headers.get("location") ?? ""
      ok(loc === `${BASE}/`, `callback com cookie ${hostil} fica no domínio`, loc)
      ok(apagaCookie(res), "…e apaga o cookie")
    }
  }
  // recursivo
  {
    const res = await handleAuthCallback(req("?code=abc", val("/auth/callback?next=/x")), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(res.headers.get("location") === `${BASE}/`, "destino recursivo → /")
  }
  // cancelamento
  {
    const res = await handleAuthCallback(req("?error=access_denied", val("/leitura/seed1")), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(res.headers.get("location") === `${BASE}/leitura/seed1?auth_error=cancelled`, "cancelamento volta ao destino com auth_error", res.headers.get("location"))
    ok(apagaCookie(res), "cancelamento apaga o cookie")
  }
  // erro do provedor
  {
    const res = await handleAuthCallback(req("?error=server_error", val("/faq")), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(res.headers.get("location") === `${BASE}/faq?auth_error=failed` && apagaCookie(res), "erro do provedor")
  }
  // sem code
  {
    const res = await handleAuthCallback(req("", val("/faq")), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(res.headers.get("location") === `${BASE}/faq?auth_error=failed` && apagaCookie(res), "sem code")
  }
  // erro de exchange (retornado e lançado): code inválido não cria sessão
  for (const [nome, ex] of [["retorna erro", exchangeErro], ["lança", exchangeLanca]] as const) {
    const res = await handleAuthCallback(req("?code=ruim", val("/leitura/seed1")), { base: BASE, nowMs: NOW, exchange: ex })
    ok(res.headers.get("location") === `${BASE}/leitura/seed1?auth_error=failed`, `exchange ${nome}: volta com auth_error`, res.headers.get("location"))
    ok(apagaCookie(res), `exchange ${nome}: apaga o cookie`)
  }
  // destino com query própria + auth_error preserva a query
  {
    const res = await handleAuthCallback(req("?error=access_denied", val("/assinatura?plano=x")), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(res.headers.get("location") === `${BASE}/assinatura?plano=x&auth_error=cancelled`, "query própria preservada", res.headers.get("location"))
  }

  // ── a URL final nunca carrega code/state, venha de onde vier ────────────────
  const semAuth = (loc: string | null) => {
    const u = new URL(loc ?? "")
    return !["code", "state", "error", "error_code", "error_description"].some((p) => u.searchParams.has(p))
  }
  {
    // request com code + destino "/" → "/" (nunca "/?code=abc123")
    const res = await handleAuthCallback(req("?code=abc123", val("/")), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(res.headers.get("location") === `${BASE}/`, "request ?code=abc123 + destino / → /", res.headers.get("location"))
    ok(semAuth(res.headers.get("location")), "sem code na URL final (destino /)")
    // destino com query própria preserva só a query do destino
    const r2 = await handleAuthCallback(req("?code=abc123", val("/leitura/seed?tab=x")), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(r2.headers.get("location") === `${BASE}/leitura/seed?tab=x`, "destino /leitura/seed?tab=x preservado, sem code", r2.headers.get("location"))
    // state da request também não vaza
    const r3 = await handleAuthCallback(req("?code=abc123&state=zzz", val("/faq")), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(r3.headers.get("location") === `${BASE}/faq`, "state da request não vaza", r3.headers.get("location"))
  }
  {
    // causa real: o destino gravado no clique já trazia ?code= de uma tentativa anterior
    const velho = "/?code=ANTIGO"
    ok(nextFromCookieValue(val(velho), NOW) === "/", "cookie com ?code= antigo é limpo na leitura")
    const adulterado = `v1.${ts}.${encodeURIComponent("/leitura/x?code=ANTIGO&tab=x&state=s")}`
    ok(nextFromCookieValue(adulterado, NOW) === "/leitura/x?tab=x", "limpa code/state e mantém a query do destino", nextFromCookieValue(adulterado, NOW))
    const res = await handleAuthCallback(req("?code=NOVO", adulterado), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(res.headers.get("location") === `${BASE}/leitura/x?tab=x`, "callback com cookie sujo: sem code antigo nem novo", res.headers.get("location"))
    // na gravação o destino já sai limpo
    const gravado = serializeNextCookie(velho, { secure: true, nowMs: NOW }).split(";")[0].split("=")[1]
    ok(decodeURIComponent(gravado.split(".").slice(2).join(".")) === "/", "gravação: /?code=ANTIGO vira /", gravado)
    // erro/cancelamento: só auth_error entra
    const c = await handleAuthCallback(req("?error=access_denied", val("/faq?code=ANTIGO&x=1")), { base: BASE, nowMs: NOW, exchange: exchangeOk })
    ok(c.headers.get("location") === `${BASE}/faq?x=1&auth_error=cancelled`, "cancelamento: query legítima + só auth_error", c.headers.get("location"))
    ok(stripAuthParams("/assinatura?plano=a%20b&x=1") === "/assinatura?plano=a%20b&x=1", "sem parâmetros de auth a query fica byte a byte igual")
    ok(stripAuthParams("/a?error_description=x&b=2") === "/a?b=2", "error_description removido")
  }

  if (falhas) process.exit(1)
  console.log("verify-oauth-callback: ok")
}
main()
