/**
 * Renderiza o prompt de sinastria para um par de mapas do corpus de validação,
 * para revisão. Não chama modelo nenhum.
 *
 *   node --import ./scripts/ts-register.mjs scripts/renderizar-prompt-sinastria.ts [indice] [vinculo] [locale]
 */
import fs from "fs"
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { selecionarEvidencia } from "../lib/astro/selecao-sinastria"
import { montarPayload } from "../lib/astro/payload-sinastria"
import { promptSinastria } from "../lib/astro/prompt-sinastria"
import type { Vinculo } from "../lib/astro/sinastria-servico"
import type { Locale } from "../lib/i18n/config"
import { amostra } from "./simular-selecao-sinastria"

const i = Number(process.argv[2] ?? 0)
const vinculo = (process.argv[3] ?? "amizade") as Vinculo
const locale = (process.argv[4] ?? "pt") as Locale
const caso = amostra()[i]
const selecao = selecionarEvidencia(sinastria(mapaNatal(caso.a), mapaNatal(caso.b)))
const payload = montarPayload(selecao, { locale, vinculo })
const { system, user } = promptSinastria(payload)
const tok = (t: string) => Math.round(t.length / 3.6)
const saida = process.argv[5]
const texto = `# SYSTEM\n\n${system}\n\n# USER\n\n${user}\n`
if (saida) fs.writeFileSync(saida, texto)
else console.log(texto)
console.error(`par ${caso.rotulo} · vínculo ${vinculo} · ${locale} · system ${tok(system)} tokens, user ${tok(user)} tokens, total ${tok(system) + tok(user)} · blocos elegíveis: ${payload.blocosElegiveis.join(", ")}`)
