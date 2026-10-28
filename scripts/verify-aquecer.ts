// A função agendada de aquecimento (netlify/functions/aquecer-rotas.ts) só
// vale o que custa se cada rota da lista existir e for dinâmica: rota que não
// existe é invocação paga para receber 404, e página estática sai do CDN sem
// função nenhuma para aquecer. Roda no prebuild, sem rede.
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { ROTAS_AQUECIDAS, config } from "../netlify/functions/aquecer-rotas"
import { PASTA_DAS_PAGINAS } from "../lib/seo/paginas"

let falhas = 0
function ok(c: boolean, n: string, extra?: unknown) {
  if (!c) {
    falhas++
    console.error("FALHOU:", n, extra ?? "")
  }
}

// a cada N minutos, com N de 1 a 10: mais espaçado e a instância já foi embora
const cron = config.schedule.split(" ")
ok(cron.length === 5, "agenda com cinco campos de cron", config.schedule)
const minuto = cron[0].match(/^\*\/(\d+)$/)
ok(!!minuto && Number(minuto[1]) >= 1 && Number(minuto[1]) <= 10 && cron.slice(1).every((c) => c === "*"), "agenda a cada 1 a 10 minutos", config.schedule)

ok(new Set(ROTAS_AQUECIDAS).size === ROTAS_AQUECIDAS.length, "sem rota repetida")

for (const rota of ROTAS_AQUECIDAS) {
  const [caminho, query] = rota.split("?")
  if (caminho.startsWith("/api/")) {
    const arquivo = path.join("app", caminho, "route.ts")
    ok(existsSync(arquivo), `rota de API existe: ${arquivo}`)
    // a resposta é por idioma, e sem o parâmetro a rota cairia no cookie, que o aquecedor não manda
    ok(/(^|&)locale=(pt|en|es)(&|$)/.test(query ?? ""), `${rota}: pede um idioma explícito`)
    continue
  }
  ok(query === undefined, `${rota}: página sem query`)
  const arquivo = path.join(PASTA_DAS_PAGINAS, caminho === "/" ? "" : caminho, "page.tsx")
  const existe = existsSync(arquivo)
  ok(existe, `página existe: ${arquivo}`)
  if (!existe) continue
  const src = readFileSync(arquivo, "utf8")
  ok(!src.includes("PÁGINA ESTÁTICA"), `${rota}: não é página estática (sai do CDN, nada a aquecer)`)
  ok(/usuarioDaRequisicao\(|getI18n\(|getLocale\(|force-dynamic/.test(src), `${rota}: lê a requisição (é dinâmica de fato)`)
}

console.log(`verify-aquecer: ${falhas === 0 ? "ok" : `${falhas} falha(s)`} | ${ROTAS_AQUECIDAS.length} rotas, agenda "${config.schedule}"`)
if (falhas > 0) process.exit(1)
