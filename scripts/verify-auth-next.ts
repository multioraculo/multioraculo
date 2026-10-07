import { safeNext } from "../lib/auth/safe-next"

let falhas = 0
function eq(entrada: unknown, esperado: string) {
  const r = safeNext(entrada)
  if (r !== esperado) {
    falhas++
    console.error(`FALHOU: ${JSON.stringify(entrada)} → ${r} (esperado ${esperado})`)
  }
}

eq("/leitura/abc?x=1", "/leitura/abc?x=1")
eq("/assinatura", "/assinatura")
eq("/", "/")
eq(undefined, "/")
eq(null, "/")
eq("", "/")
eq("https://evil.com", "/")
eq("//evil.com", "/")
eq("/\\evil.com", "/")
eq("\\\\evil.com", "/")
eq("/%2F%2Fevil.com", "/")
eq("/%5Cevil.com", "/")
eq("evil.com", "/")
eq("javascript:alert(1)", "/")
eq("/\t/evil.com", "/")
eq("/auth/callback?next=/", "/")
eq("/" + "a".repeat(600), "/")

if (falhas) process.exit(1)
console.log("verify-auth-next: ok")
