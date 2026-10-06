/**
 * Marca, em cada fatia de glosas, de que condição depende cada frase.
 *
 *   node --import ./scripts/ts-register.mjs scripts/marcar-condicoes-davison.ts
 *
 * Idempotente: recalcula `condicoesPorItem` a partir do texto de cada frase,
 * com a mesma regra que o validador cobra (`condicaoDoTexto`). Roda sobre os
 * rascunhos em data/fontes/davison/trabalho/, antes da montagem.
 */
import fs from "fs"
import path from "path"
import { camposDeOverlay, camposDePar, condicaoDoTexto } from "../lib/astro/davison/validar"
import { camposDeSemelhanca } from "../lib/astro/davison/validar-semelhanca"
import type { GlosaDeOverlay, GlosaDePar, GlosaDeSemelhanca } from "../lib/astro/davison/tipos"

const dir = path.join(process.cwd(), "data", "fontes", "davison", "trabalho")
let natal = 0
let aspectos = 0
for (const arquivo of fs.readdirSync(dir).filter((f) => /^(par|ov|sem)-\d+\.json$/.test(f))) {
  const fatia = JSON.parse(fs.readFileSync(path.join(dir, arquivo), "utf8")) as Array<{ glosa: GlosaDePar & GlosaDeOverlay & GlosaDeSemelhanca }>
  for (const e of fatia) {
    const g = e.glosa
    const campos = "dimensao" in g ? camposDeSemelhanca(g) : (g as GlosaDePar).id.includes("@") ? camposDeOverlay(g as GlosaDeOverlay) : camposDePar(g as GlosaDePar)
    const marcas: Record<string, { natal: boolean; aspectos: boolean }> = {}
    for (const c of campos) {
      const cond = condicaoDoTexto(c.texto)
      if (cond.natal || cond.aspectos) {
        marcas[c.ref] = cond
        if (cond.natal) natal += 1
        if (cond.aspectos) aspectos += 1
      }
    }
    g.condicoesPorItem = marcas
  }
  fs.writeFileSync(path.join(dir, arquivo), JSON.stringify(fatia, null, 1))
}
console.log(`marcadas: ${natal} frases dependem da condição natal, ${aspectos} de aspectos entre os mapas`)
