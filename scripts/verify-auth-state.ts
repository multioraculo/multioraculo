// onAuthStateChange sem deadlock + logout robusto. Sem rede e sem Supabase real:
// o cliente de auth é o supabase-js de verdade, com fetch simulado.
import { createClient } from "@supabase/supabase-js"
import { createAuthStateHandler, performSignOut } from "../lib/auth/auth-state"

let falhas = 0
function ok(c: boolean, n: string, extra?: unknown) {
  if (!c) { falhas++; console.error("FALHOU:", n, extra ?? "") }
}
const tick = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms))
const limite = <T>(p: Promise<T>, ms: number, vazio: string) =>
  Promise.race([p, new Promise<string>((r) => setTimeout(() => r(vazio), ms))])

async function main() {
// ── A. o handler: síncrono, adiado, sem duplicar ─────────────────────────────
function montar(opts: { markerDone?: boolean; ensure?: () => Promise<any> } = {}) {
  const fila: Array<() => void> = []
  const log: string[] = []
  let marker = opts.markerDone ?? false
  const handler = createAuthStateHandler({
    setUser: (u) => log.push(`setUser:${u ? u.id : "null"}`),
    ensureProfile: async (u) => { log.push(`ensure:${u.id}`); return opts.ensure ? opts.ensure() : { error: null } },
    refresh: () => log.push("refresh"),
    markerDone: () => marker,
    markDone: () => { marker = true; log.push("mark") },
    clearMarker: () => { marker = false; log.push("clear") },
    schedule: (fn) => void fila.push(fn),
  })
  const drenar = async () => { while (fila.length) { fila.shift()!(); await tick() } }
  return { handler, log, fila, drenar, marker: () => marker }
}
const U = { id: "u1" }

for (const ev of ["SIGNED_IN", "INITIAL_SESSION", "SIGNED_OUT", "TOKEN_REFRESHED", "USER_UPDATED"]) {
  const h = montar().handler
  const r: unknown = h(ev, ev === "SIGNED_OUT" ? null : { user: U })
  ok(r === undefined, `callback (${ev}) não devolve Promise`, r)
}
{
  const t = montar()
  t.handler("SIGNED_IN", { user: U })
  ok(t.log.join() === "setUser:u1", "setUser síncrono e nada remoto antes do adiamento", t.log)
  ok(!t.log.includes("ensure:u1"), "ensureProfile NÃO roda dentro do callback")
  await t.drenar()
  ok(t.log.join() === "setUser:u1,ensure:u1,mark,refresh", "SIGNED_IN: profile → marcador → refresh (adiados)", t.log)
}
{
  const t = montar()
  t.handler("INITIAL_SESSION", { user: U })
  await t.drenar()
  ok(t.log.join() === "setUser:u1,ensure:u1,mark", "INITIAL_SESSION: profile sem refresh", t.log)
}
{ // SIGNED_IN e INITIAL_SESSION em sequência: profile uma vez só
  let resolver!: () => void
  const lento = () => new Promise<any>((r) => { resolver = () => r({ error: null }) })
  const t = montar({ ensure: lento })
  t.handler("SIGNED_IN", { user: U })
  t.handler("INITIAL_SESSION", { user: U })
  const p = t.drenar()
  await tick(5)
  resolver()
  await p
  await tick(5)
  ok(t.log.filter((l) => l === "ensure:u1").length === 1, "profile roda uma vez com SIGNED_IN + INITIAL_SESSION", t.log)
}
{ // marcador presente: não consulta; SIGNED_IN ainda atualiza a página
  const t = montar({ markerDone: true })
  t.handler("SIGNED_IN", { user: U })
  await t.drenar()
  ok(!t.log.includes("ensure:u1") && t.log.includes("refresh"), "marcador presente: sem ensureProfile, com refresh", t.log)
}
{ // falha de profile não derruba nada e não marca
  const t = montar({ ensure: async () => ({ error: new Error("x") }) })
  t.handler("INITIAL_SESSION", { user: U })
  await t.drenar()
  ok(!t.log.includes("mark"), "erro de profile não marca")
  const t2 = montar({ ensure: async () => { throw new Error("rede") } })
  t2.handler("SIGNED_IN", { user: U })
  await t2.drenar()
  ok(!t2.log.includes("mark") && t2.log.includes("refresh"), "ensureProfile que lança não quebra", t2.log)
}
{ // SIGNED_OUT: limpa o marcador e adia o refresh
  const t = montar({ markerDone: true })
  t.handler("SIGNED_OUT", null)
  ok(t.log.join() === "setUser:null,clear", "SIGNED_OUT limpa marcador e usuário (síncrono)", t.log)
  ok(!t.marker(), "marcador removido")
  await t.drenar()
  ok(t.log.at(-1) === "refresh", "refresh do SIGNED_OUT adiado")
}

// ── B. cliente de auth real: SIGNED_IN durante o exchange PKCE ──────────────
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url")
const jwt = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "u1", exp: 4102444800, role: "authenticated" })}.sig`
const sessao = {
  access_token: jwt, refresh_token: "r", token_type: "bearer", expires_in: 3600, expires_at: 4102444800,
  user: { id: "u1", aud: "authenticated", email: "a@b.c", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01" },
}
const fakeFetch = async (url: any) => {
  const u = String(url)
  const body = u.includes("/rest/v1/") ? "[]" : u.includes("grant_type=pkce") ? JSON.stringify(sessao) : "{}"
  return new Response(body, { status: 200, headers: { "content-type": "application/json" } })
}
// lock exclusivo como o navigator.locks do navegador
function novoLock() {
  let cauda: Promise<unknown> = Promise.resolve()
  return (_n: string, _t: number, fn: () => Promise<any>) => { const run = cauda.then(fn); cauda = run.catch(() => {}); return run }
}

async function cenarioPkce(modo: "novo" | "antigo", key: string) {
  const g = globalThis as any
  const loc = { href: "https://site.test/faq?code=abc123", pathname: "/faq", hash: "" } as any
  Object.defineProperty(loc, "search", { get: () => new URL(loc.href).search })
  g.window = { document: {}, location: loc, history: { state: null, replaceState: (_s: any, _u: any, url: string) => { loc.href = url } }, addEventListener() {}, removeEventListener() {} }
  g.document = { visibilityState: "visible", addEventListener() {}, removeEventListener() {} }
  const m = new Map<string, string>([[`${key}-code-verifier`, "verifier-xyz"]])
  const c = createClient("https://fake.supabase.co", "anon", {
    global: { fetch: fakeFetch as any },
    auth: {
      flowType: "pkce", detectSessionInUrl: true, storageKey: key, persistSession: true, autoRefreshToken: false,
      lock: novoLock() as any,
      storage: { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) },
    },
  })
  const eventos: string[] = []
  let retornos: unknown[] = []
  if (modo === "novo") {
    const h = createAuthStateHandler({
      setUser: () => {}, refresh: () => {}, markerDone: () => false, markDone: () => {}, clearMarker: () => {},
      ensureProfile: async () => { await c.from("profiles").select("id").maybeSingle(); return { error: null } },
    })
    c.auth.onAuthStateChange((e, s) => { eventos.push(e); retornos.push(h(e, s as any)) })
  } else {
    // o Header antigo: async, com await de chamada ao Supabase
    c.auth.onAuthStateChange(async (e) => {
      eventos.push(e)
      if (e === "SIGNED_IN" || e === "INITIAL_SESSION") await c.from("profiles").select("id").maybeSingle()
    })
  }
  await tick(600)
  const codeNaUrl = new URL(loc.href).searchParams.has("code")
  const sess = await limite(c.auth.getSession().then((r) => (r.data.session ? "tem" : "null")), 1500, "PENDURADO")
  const so = await limite(c.auth.signOut({ scope: "local" }).then(() => "resolveu"), 1500, "PENDURADO")
  delete g.window
  delete g.document
  return { eventos, codeNaUrl, sess, so, retornos }
}

{
  const novo = await cenarioPkce("novo", "kn")
  ok(novo.eventos.includes("SIGNED_IN") && novo.eventos.includes("INITIAL_SESSION"), "PKCE: SIGNED_IN e INITIAL_SESSION acontecem", novo.eventos)
  ok(!novo.codeNaUrl, "PKCE: ?code removido da URL depois do exchange")
  ok(novo.sess === "tem", "PKCE: getSession() não pendura", novo.sess)
  ok(novo.so === "resolveu", "PKCE: signOut() não pendura", novo.so)
  ok(novo.retornos.every((r) => r === undefined), "callback do cliente real nunca devolve Promise pendente")

  // controle: o handler antigo (async + await no Supabase) trava de fato
  const antigo = await cenarioPkce("antigo", "ka")
  ok(antigo.sess === "PENDURADO" && antigo.so === "PENDURADO" && antigo.codeNaUrl,
    "controle: o handler antigo reproduz o deadlock (se isto falhar, o teste acima não prova nada)", antigo)
}

// ── C. logout robusto ───────────────────────────────────────────────────────
function fakeAuth(plano: { global?: unknown; local?: unknown; sessaoDepois?: boolean; getSessionLanca?: boolean }) {
  const chamadas: string[] = []
  return {
    chamadas,
    auth: {
      signOut: async (o?: { scope: "local" | "global" | "others" }) => {
        const escopo = o?.scope ?? "global"
        chamadas.push(`signOut:${escopo}`)
        return { error: (escopo === "local" ? plano.local : plano.global) ?? null }
      },
      getSession: async () => {
        chamadas.push("getSession")
        if (plano.getSessionLanca) throw new Error("x")
        return { data: { session: plano.sessaoDepois ? { user: U } : null } }
      },
    },
  }
}
{
  let limpou = 0
  const a = fakeAuth({})
  ok((await performSignOut(a.auth, () => void limpou++)) === true, "logout normal: sucesso")
  ok(a.chamadas.join() === "signOut:global,getSession", "logout normal: uma chamada global + verificação", a.chamadas)
  ok(limpou === 1, "logout normal: marcador limpo")
}
{
  let limpou = 0
  const a = fakeAuth({ global: new Error("500") })
  ok((await performSignOut(a.auth, () => void limpou++)) === true, "remoto com erro + fallback local ok: sucesso")
  ok(a.chamadas.join() === "signOut:global,signOut:local,getSession", "tenta o escopo local depois do erro", a.chamadas)
  ok(limpou === 1, "fallback: marcador limpo")
}
{
  let limpou = 0
  const a = fakeAuth({ global: new Error("500"), local: new Error("falhou") })
  ok((await performSignOut(a.auth, () => void limpou++)) === false, "ambos falham: não finge logout")
  ok(limpou === 1, "ambos falham: marcador limpo mesmo assim (só reexecuta o profile)")
  ok(!a.chamadas.includes("getSession"), "ambos falham: nem precisa verificar a sessão")
}
{
  const a = fakeAuth({ sessaoDepois: true })
  ok((await performSignOut(a.auth, () => {})) === false, "sem erro mas a sessão permanece: UI não finge logout")
}
{
  const a = fakeAuth({ getSessionLanca: true })
  ok((await performSignOut(a.auth, () => {})) === true, "getSession lançando: vale o resultado do signOut")
  const b = { signOut: async () => { throw new Error("rede") }, getSession: async () => ({ data: { session: null } }) }
  ok((await performSignOut(b as any, () => {})) === false, "signOut que lança: não finge logout")
}

  if (falhas) process.exit(1)
  console.log("verify-auth-state: ok")
  process.exit(0)
}
main()
