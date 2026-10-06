/**
 * Confere uma FATIA de glosas do Davison, escrita à mão, contra a fonte local.
 *
 *   node --import ./scripts/ts-register.mjs scripts/checar-fatia-davison.ts <arquivo.json>
 *
 * A fatia é uma lista de { glosa, auditoria }. `glosa.fonte` só precisa da
 * `ancora`: o resto (página, título, hash) é preenchido na montagem, a partir do
 * extrato. Sai com código 1 se houver qualquer problema.
 */
import fs from "fs"
import path from "path"
import { camposDeOverlay, camposDePar, problemasDeAuditoria, problemasDeOverlay, problemasDePar, type Auditoria } from "../lib/astro/davison/validar"
import { camposDeSemelhanca, problemasDeSemelhanca } from "../lib/astro/davison/validar-semelhanca"
import type { GlosaDeOverlay, GlosaDePar, GlosaDeSemelhanca } from "../lib/astro/davison/tipos"

const arquivo = process.argv[2]
if (!arquivo) {
  console.error("uso: checar-fatia-davison.ts <arquivo.json>")
  process.exit(2)
}
const extratoPath = path.join(process.cwd(), "data", "fontes", "davison", "extrato.json")
if (!fs.existsSync(extratoPath)) {
  console.error("extrato ausente: rode node scripts/extrair-davison.mjs")
  process.exit(2)
}
const extrato = JSON.parse(fs.readFileSync(extratoPath, "utf8")) as {
  pares: Array<{ id: string; texto: string }>
  overlays: Array<{ id: string; texto: string }>
  semelhancas: Array<{ id: string; texto: string }>
}
const fatia = JSON.parse(fs.readFileSync(arquivo, "utf8")) as Array<{ glosa: Record<string, unknown>; auditoria: Auditoria }>

let problemas = 0
const vistos = new Set<string>()
for (const entrada of fatia) {
  const g = entrada.glosa as unknown as GlosaDePar & GlosaDeOverlay
  const id = String(g.id)
  const ehSemelhanca = extrato.semelhancas.some((x) => x.id === id)
  const ehOverlay = id.includes("@")
  const fonte = (ehSemelhanca ? extrato.semelhancas : ehOverlay ? extrato.overlays : extrato.pares).find((x) => x.id === id)
  const lista: string[] = []
  if (!fonte) lista.push("id não existe no extrato")
  if (vistos.has(id)) lista.push("id repetido na fatia")
  vistos.add(id)
  if (fonte) {
    const ancora = String((g.fonte as unknown as { ancora?: string })?.ancora ?? "")
    if (ehSemelhanca) {
      const sg = entrada.glosa as unknown as GlosaDeSemelhanca
      lista.push(...problemasDeSemelhanca(sg))
      lista.push(...problemasDeAuditoria(entrada.auditoria, camposDeSemelhanca(sg), fonte.texto, ancora))
    } else if (ehOverlay) {
      lista.push(...problemasDeOverlay(g))
      lista.push(...problemasDeAuditoria(entrada.auditoria, camposDeOverlay(g), fonte.texto, ancora))
    } else {
      lista.push(...problemasDePar(g))
      lista.push(...problemasDeAuditoria(entrada.auditoria, camposDePar(g), fonte.texto, ancora))
    }
  }
  if (lista.length) {
    problemas += lista.length
    console.error(`\n✗ ${id}`)
    for (const l of lista) console.error(`   - ${l}`)
  } else console.log(`✓ ${id}`)
}
console.log(`\n${fatia.length} entrada(s), ${problemas} problema(s)`)
process.exit(problemas ? 1 : 0)
