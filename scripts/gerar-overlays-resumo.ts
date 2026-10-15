/**
 * Gera `lib/astro/davison/overlays-resumo.ts`: a frase que o repertório dá a cada planeta numa casa ("Quem tem o Sol
 * reflete a essência de si em sintonia com a forma como quem tem a casa se apresenta ao mundo"), SEM o resto da glosa.
 *
 * Existe porque a tela mostra essa frase e não pode importar `overlays.ts` (387 KB) no navegador. É um recorte
 * paráfrase do repertório, sem trecho literal da fonte; o teste `verify:sinastria-leitura` confere que o recorte
 * acompanha o repertório.
 *
 *   node --import ./scripts/ts-register.mjs scripts/gerar-overlays-resumo.ts
 */
import fs from "fs"
import { OVERLAYS_DAVISON } from "../lib/astro/davison/overlays"

// a única frase do repertório que não diz "quem tem <planeta>": normalizada para a tela poder trocá-la
const AJUSTES: Record<string, string> = {
  "mercury@casa5": "Quem tem Mercúrio oferece ideias ao campo de quem tem a casa.",
}

const linhas = OVERLAYS_DAVISON.map((g) => `  ${JSON.stringify(g.id)}: ${JSON.stringify(AJUSTES[g.id] ?? g.funcaoIntroduzida)},`)
const arquivo = `/**
 * GERADO por scripts/gerar-overlays-resumo.ts a partir de overlays.ts. Não edite à mão.
 * A frase de cada planeta numa casa (a "função introduzida"), para a tela, sem importar o repertório inteiro.
 */
export const RESUMO_DO_OVERLAY: Record<string, string> = {
${linhas.join("\n")}
}
`
fs.writeFileSync("lib/astro/davison/overlays-resumo.ts", arquivo)
console.log(`${linhas.length} frases em lib/astro/davison/overlays-resumo.ts`)
