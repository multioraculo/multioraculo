/** Confere a revisão de aplicabilidade contra as glosas e lista o que a palavra achou e a revisão não cobriu. */
import { INTERASPECTOS, OVERLAYS, SEMELHANCAS, itensDe } from "../lib/astro/davison"
import { REVISAO_DE_APLICABILIDADE } from "../lib/astro/davison/aplicabilidade"
import { problemasDeTexto } from "../lib/astro/davison/validar"

const todas = new Map<string, string>()
for (const g of [...INTERASPECTOS, ...OVERLAYS]) for (const i of itensDe(g)) todas.set(`${g.id}#${i.ref}`, i.texto)

let ruins = 0
for (const [k, r] of Object.entries(REVISAO_DE_APLICABILIDADE)) {
  const atual = todas.get(k)
  if (atual === undefined) { console.log("SEM FRASE:", k); ruins++; continue }
  if (atual !== r.de) { console.log("TEXTO DIFERENTE:", k, "\n  glosa:", atual, "\n  revisão:", r.de); ruins++ }
  if (r.classe === "exemplo_contextual" && r.texto) {
    const p = problemasDeTexto(r.texto)
    if (p.length) { console.log("TRAVA:", k, p); ruins++ }
    if (r.texto.length > r.de.length + 12) { console.log("NEUTRO MAIOR:", k); ruins++ }
  }
}
const ex = Object.values(REVISAO_DE_APLICABILIDADE).filter((r) => r.classe === "exemplo_contextual")
console.log(`revisadas ${Object.keys(REVISAO_DE_APLICABILIDADE).length}: exemplo_contextual ${ex.length} (neutralizadas ${ex.filter((r) => r.classe === "exemplo_contextual" && r.texto).length}, mantidas ${ex.filter((r) => r.classe === "exemplo_contextual" && !r.texto).length}), dependencia_real ${Object.keys(REVISAO_DE_APLICABILIDADE).length - ex.length}; problemas ${ruins}`)

// o que a palavra acha e a revisão não cobre (para o olho)
const RE = /(romance|rom[âa]ntic\w*|namor\w*|íntim\w*|casal|sexual|sexo|sócio\w*|negócio\w*|empreg\w*|colega\w*|irm[ãa]\w*|filh\w*|famíli\w*|parent\w*|marid\w*|espos\w*|trabalh\w*|profission\w*)/i
const fora: string[] = []
for (const [k, t] of todas) if (RE.test(t) && !REVISAO_DE_APLICABILIDADE[k]) fora.push(`${k} | ${t}`)
console.log(`\nencontradas pela palavra e fora da revisão (campo da vida, terceiro ou idioma): ${fora.length}`)
if (process.argv[2] === "-v") for (const f of fora) console.log(f)
const sem = SEMELHANCAS.flatMap((g) => [...g.nucleoOperacional.map((n) => n.texto), ...(g.nucleoOperacionalEspecifico ?? []).map((n) => n.texto), ...(g.ressalvaOperacional ? [g.ressalvaOperacional.texto] : [])]).filter((t) => RE.test(t))
console.log(`semelhanças com termo de vínculo no núcleo operacional: ${sem.length}`, sem)
process.exit(ruins ? 1 : 0)
