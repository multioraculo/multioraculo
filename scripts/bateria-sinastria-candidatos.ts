/**
 * Primeira bateria de calibração da sinastria, passo 1: enumera os pares
 * candidatos do corpus de validação (40 nascimentos) e mede o que cada um tem
 * de evidência, para a amostra ser escolhida por critério e não pelos
 * primeiros 20. Não chama modelo nenhum.
 *
 *   node --import ./scripts/ts-register.mjs scripts/bateria-sinastria-candidatos.ts <saida.json>
 */
import fs from "fs"
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { selecionarEvidencia } from "../lib/astro/selecao-sinastria"
import { montarPayload } from "../lib/astro/payload-sinastria"
import { CASOS } from "./astro-fixtures"
import { dados } from "./simular-selecao-sinastria"

export type Candidato = {
  a: number
  b: number
  horaA: boolean
  horaB: boolean
  dinamicas: number
  overlays: number
  harmonicas: number
  discordantes: number
  variaveis: number
  semelhancas: number
  tokens: number
  blocos: string[]
  dimensoes: Record<string, number>
}

const saida: Candidato[] = []
for (let a = 0; a < CASOS.length; a++) {
  for (let b = a + 1; b < CASOS.length; b++) {
    for (const [horaA, horaB] of [[true, true], [true, false], [false, true], [false, false]] as const) {
      const r = sinastria(mapaNatal(dados(a, horaA)), mapaNatal(dados(b, horaB)))
      const sel = selecionarEvidencia(r)
      const p = montarPayload(sel, { locale: "pt", vinculo: "outro" })
      const dims: Record<string, number> = {}
      for (const d of [...p.aspectos, ...p.overlays]) for (const x of d.dimensoes) dims[x] = (dims[x] ?? 0) + 1
      const cats = sel.aspectos.flatMap((d) => d.categorias)
      saida.push({
        a, b, horaA, horaB,
        dinamicas: sel.aspectos.length,
        overlays: sel.overlays.length,
        harmonicas: sel.aspectos.filter((d) => d.categorias.includes("harmonico")).length,
        discordantes: sel.aspectos.filter((d) => d.categorias.includes("discordante")).length,
        variaveis: cats.filter((c) => c === "variavel").length,
        semelhancas: sel.semelhancas.length,
        tokens: sel.tokens.total,
        blocos: p.blocosElegiveis,
        dimensoes: dims,
      })
    }
  }
}
fs.writeFileSync(process.argv[2], JSON.stringify(saida))
console.log(`${saida.length} candidatos`)
