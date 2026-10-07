// Roda a sonda /auth/probe em todos os modos e imprime a tabela.
// Uso: node scripts/probe-auth-redirect.mjs [baseUrl]   (padrão: o branch deploy)
const base = (process.argv[2] ?? "https://oauth-google--multioraculo.netlify.app").replace(/\/+$/, "")
const modes = ["none", "raw", "raw-big", "jar", "jar-big", "next-jar"]
const rows = []
for (const mode of modes) {
  const nonce = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  const res = await fetch(`${base}/auth/probe?mode=${mode}&code=PROBE&nonce=${nonce}`, { redirect: "manual", cache: "no-store" })
  const loc = res.headers.get("location") ?? "(sem Location)"
  const calc = res.headers.get("x-probe-location") ?? "(sem header)"
  const sc = res.headers.getSetCookie()
  const probeCookies = sc.filter((c) => c.startsWith("probe_"))
  const bytes = probeCookies.reduce((n, c) => n + c.length, 0)
  const leaked = /PROBE|nonce=/.test(loc) || loc.includes(nonce)
  rows.push({ modo: mode, status: res.status, "x-probe-location": calc, "Location final": loc, "Set-Cookie (probe_*)": `${probeCookies.length} / ${bytes} B`, "cache-control": res.headers.get("cache-control"), "PROBE vazou?": leaked ? "SIM" : "não", "Location == calculado?": loc === calc ? "sim" : "NÃO" })
}
console.table(rows)
