import { NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * SONDA TEMPORÁRIA (remover depois do diagnóstico). Isola, no runtime real da
 * Netlify, se um 307 com cookies sai com o Location que o código calculou.
 * Sem sessão, sem Supabase, sem segredos: cookies fictícios `probe_*`.
 *
 * GET /auth/probe?mode=<none|raw|raw-big|jar|jar-big|next-jar>&code=PROBE&nonce=<único>
 * Sempre: 307 -> BASE + "/". `x-probe-location` = o que o código calculou.
 * Nada da query da request entra no Location.
 */
export const dynamic = "force-dynamic"

const BASE = "https://oauth-google--multioraculo.netlify.app"
const TARGET = `${BASE}/`
const NO_STORE = "no-store, private, max-age=0"

// ~ o volume da sessão Google (cookies sb-* fragmentados em pedaços de ~3,2 KB)
const BIG_CHUNK = "x".repeat(3180)
const BIG_NAMES = ["probe_big_0", "probe_big_1"]

type Mode = "none" | "raw" | "raw-big" | "jar" | "jar-big" | "next-jar"
const MODES: Mode[] = ["none", "raw", "raw-big", "jar", "jar-big", "next-jar"]
const COOKIE_ATTRS = "Path=/auth; Max-Age=60; SameSite=Lax"

function baseHeaders(): Headers {
  const h = new Headers()
  h.set("Location", TARGET)
  h.set("x-probe-location", TARGET)
  h.set("Cache-Control", NO_STORE)
  return h
}

export async function GET(request: Request) {
  const mode = new URL(request.url).searchParams.get("mode") as Mode | null
  if (!mode || !MODES.includes(mode)) {
    return new Response(`mode inválido; use: ${MODES.join(", ")}`, { status: 400, headers: { "Cache-Control": NO_STORE } })
  }

  if (mode === "none") return new Response(null, { status: 307, headers: baseHeaders() })

  if (mode === "raw" || mode === "raw-big") {
    const h = baseHeaders()
    if (mode === "raw") h.append("Set-Cookie", `probe_a=1; ${COOKIE_ATTRS}`)
    else BIG_NAMES.forEach((n) => h.append("Set-Cookie", `${n}=${BIG_CHUNK}; ${COOKIE_ATTRS}`))
    return new Response(null, { status: 307, headers: h })
  }

  const jar = await cookies()
  const opts = { path: "/auth", maxAge: 60, sameSite: "lax" as const }
  if (mode === "jar-big") BIG_NAMES.forEach((n) => jar.set(n, BIG_CHUNK, opts))
  else jar.set("probe_a", "1", opts)

  if (mode === "next-jar") {
    const res = NextResponse.redirect(TARGET, 307)
    res.headers.set("x-probe-location", TARGET)
    res.headers.set("Cache-Control", NO_STORE)
    return res
  }
  return new Response(null, { status: 307, headers: baseHeaders() })
}
