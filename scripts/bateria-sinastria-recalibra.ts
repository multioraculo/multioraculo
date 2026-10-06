/**
 * Bateria 1, passo de recalibração SEM nova geração: reaplica o verificador
 * estrutural revisado (hard fail × warning) e roda o juiz corrigido (contrato
 * por paragraph_id) sobre as 20 respostas congeladas, TODAS as que têm
 * estrutura legível, e não só as aprovadas pelo gate.
 *
 * Gasto: só as 20 chamadas do juiz (gpt-4o-mini, temperatura 0). Não gera
 * síntese, não repara, não altera nenhum arquivo congelado.
 *
 *   node --import ./scripts/ts-register.mjs scripts/bateria-sinastria-recalibra.ts
 */
import fs from "fs"
import path from "path"
import OpenAI from "openai"
import { estimateCostUsd } from "../lib/ai/pricing"
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { selecionarEvidencia } from "../lib/astro/selecao-sinastria"
import type { PayloadSinastria } from "../lib/astro/payload-sinastria"
import type { SinteseSinastria } from "../lib/astro/prompt-sinastria"
import { verificarRespostaSinastria } from "../lib/astro/verificador-resposta-sinastria"
import { executarJuizEmSombra } from "../lib/astro/juiz-semantico-sinastria"
import { dados } from "./simular-selecao-sinastria"

const RAIZ = path.resolve("data/bateria-sinastria")
for (const linha of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = /^([A-Z_]+)=(.*)$/.exec(linha)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "")
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const MODELO_JUIZ = "gpt-4o-mini"
const chave: Record<string, { a: number; b: number; horaA: boolean; horaB: boolean; vinculo: string }> = JSON.parse(fs.readFileSync(path.join(RAIZ, "chave.json"), "utf8"))
fs.mkdirSync(path.join(RAIZ, "recalibracao"), { recursive: true })

async function main() {
  let custo = 0
  const resumo: Array<Record<string, unknown>> = []
  for (const [id, k] of Object.entries(chave)) {
    const r = JSON.parse(fs.readFileSync(path.join(RAIZ, "resultado", `${id}.json`), "utf8"))
    const payload: PayloadSinastria = r.payload
    const bruto = JSON.parse(r.geracao.texto) as SinteseSinastria
    const selecao = selecionarEvidencia(sinastria(mapaNatal(dados(k.a, k.horaA)), mapaNatal(dados(k.b, k.horaB))))

    // 1 · o estrutural revisado, sobre a mesma resposta
    const v = verificarRespostaSinastria({ bruto, payload, selecao, locale: "pt" })

    // 2 · o juiz corrigido, sobre toda resposta legível
    const caixa: { uso: { entrada: number; saida: number; custo: number; latenciaMs: number; modelo: string; texto: string } | null } = { uso: null }
    const registro = await executarJuizEmSombra({
      payload, sintese: bruto, locale: "pt",
      chamar: async (p) => {
        const t0 = Date.now()
        const resp = await openai.chat.completions.create({ model: MODELO_JUIZ, temperature: p.temperatura, response_format: { type: "json_object" }, messages: [{ role: "system", content: p.system }, { role: "user", content: p.user }] })
        const ent = resp.usage?.prompt_tokens ?? 0
        const sai = resp.usage?.completion_tokens ?? 0
        caixa.uso = { entrada: ent, saida: sai, custo: estimateCostUsd(resp.model ?? MODELO_JUIZ, ent, sai), latenciaMs: Date.now() - t0, modelo: resp.model ?? MODELO_JUIZ, texto: resp.choices[0]?.message?.content ?? "" }
        return caixa.uso.texto
      },
    })
    const u = caixa.uso
    if (u) custo += u.custo
    fs.writeFileSync(path.join(RAIZ, "recalibracao", `${id}.json`), JSON.stringify({ id, vinculo: k.vinculo, estruturalRevisado: v.ok ? { ok: true, violacoes: [], avisos: v.avisos } : { ok: false, violacoes: v.violacoes, avisos: v.avisos }, juiz: registro, usoDoJuiz: u }, null, 1))
    resumo.push({ id, estrutural: v.ok ? "aprovada" : "HARD", hard: v.ok ? 0 : v.violacoes.length, avisos: v.avisos.length, juiz: registro.status, causa: registro.causa, problemas: registro.problemas.length, violacoesDoJuiz: registro.violacoes.length })
    console.log(`${id} estrutural ${v.ok ? "ok" : "HARD"} (${v.ok ? 0 : v.violacoes.length} hard, ${v.avisos.length} avisos) juiz ${registro.status}${registro.causa ? ` (${registro.causa})` : ""}`)
  }
  console.log(`custo do juiz nas 20: US$ ${custo.toFixed(4)}`)
  fs.writeFileSync(path.join(RAIZ, "recalibracao", "_resumo.json"), JSON.stringify({ custoUsd: custo, resumo }, null, 1))
}
main().catch((e) => { console.error(e); process.exit(1) })
