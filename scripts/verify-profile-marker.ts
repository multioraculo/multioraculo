import {
  PROFILE_MARKER_KEY, clearProfileMarker, markProfileDone, profileMarkerDone,
} from "../lib/auth/profile-marker"

let falhas = 0
function ok(c: boolean, n: string) { if (!c) { falhas++; console.error("FALHOU:", n) } }

function memStore(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init))
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    raw: m,
  }
}
const quebrado = {
  getItem: () => { throw new Error("bloqueado") },
  setItem: () => { throw new Error("bloqueado") },
  removeItem: () => { throw new Error("bloqueado") },
}

const s = memStore()
ok(!profileMarkerDone("A", s), "sem marcador: roda")
markProfileDone("A", s)
ok(s.raw.get(PROFILE_MARKER_KEY) === "A", "guarda o user.id")
ok(profileMarkerDone("A", s), "mesmo usuário: pula")
ok(!profileMarkerDone("B", s), "usuário B não herda o marcador de A")
markProfileDone("B", s)
ok(!profileMarkerDone("A", s), "troca de usuário força nova verificação de A")
clearProfileMarker(s)
ok(!s.raw.has(PROFILE_MARKER_KEY) && !profileMarkerDone("B", s), "logout remove o marcador")
for (const lixo of ["", "true", "{\"id\":\"A\"}", "A ", "a"]) {
  ok(!profileMarkerDone("A", memStore({ [PROFILE_MARKER_KEY]: lixo })), `corrompido (${JSON.stringify(lixo)}) só reexecuta`)
}
ok(!profileMarkerDone("", s), "id vazio nunca é 'feito'")
ok(!profileMarkerDone("A", null), "sem storage: roda")
ok(!profileMarkerDone("A", quebrado as any), "storage que lança: roda, sem quebrar")
markProfileDone("A", quebrado as any)
clearProfileMarker(quebrado as any)

if (falhas) process.exit(1)
console.log("verify-profile-marker: ok")
