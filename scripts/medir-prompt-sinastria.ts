/** Mede o prompt de sinastria nos 18 pares do corpus: tamanho, frases por vínculo e custo estimado. Não chama modelo. */
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { selecionarEvidencia } from "../lib/astro/selecao-sinastria"
import { montarPayload } from "../lib/astro/payload-sinastria"
import { promptSinastria } from "../lib/astro/prompt-sinastria"
import { VINCULOS } from "../lib/astro/sinastria-servico"
import { REVISAO_DE_APLICABILIDADE } from "../lib/astro/davison/aplicabilidade"
import { amostra } from "./simular-selecao-sinastria"

const tok = (t: string) => Math.round(t.length / 3.6)
const med = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
const casos = amostra()
const tam: number[] = []
const porVinculo: Record<string, { removidas: number; neutralizadas: number; omitidas: number }> = {}
for (const v of VINCULOS) porVinculo[v] = { removidas: 0, neutralizadas: 0, omitidas: 0 }
for (const c of casos) {
  const sel = selecionarEvidencia(sinastria(mapaNatal(c.a), mapaNatal(c.b)))
  for (const v of VINCULOS) {
    const p = montarPayload(sel, { locale: "pt", vinculo: v })
    const { system, user } = promptSinastria(p)
    if (v === "amizade") tam.push(tok(system) + tok(user))
    const dins = [...sel.aspectos, ...sel.overlays]
    for (const d of dins) {
      const noP = [...p.aspectos, ...p.overlays].find((x) => x.id === d.id)
      if (!noP) { porVinculo[v].omitidas += 1; porVinculo[v].removidas += d.evidencia.itens.length; continue }
      for (const i of d.evidencia.itens) {
        const k = `${d.evidencia.glosa}#${i.ref}`
        const r = REVISAO_DE_APLICABILIDADE[k]
        if (!noP.itens.some((x) => x.ref === i.ref)) porVinculo[v].removidas += 1
        else if (r?.classe === "exemplo_contextual" && r.texto) porVinculo[v].neutralizadas += 1
      }
    }
  }
}
console.log("tokens do prompt (system+user, amizade) por par:", tam.join(" "))
console.log(`mediana ${med(tam)}, mínimo ${Math.min(...tam)}, máximo ${Math.max(...tam)}`)
console.log("nos 18 pares, por vínculo:", JSON.stringify(porVinculo))
