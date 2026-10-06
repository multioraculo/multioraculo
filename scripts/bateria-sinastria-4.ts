/**
 * Bateria 4 da sinastria (PAGA, última): 6 entradas já usadas, uma geração cada, uma por caso, para medir o novo contrato de fechamento.
 * Reparo, fallback e juiz DESLIGADOS; sem retry de qualidade (só de transporte). Não corrige nada.
 *
 * Casos 1 a 5: o par de controle da bateria 1 nos cinco vínculos.
 * Casos 6 a 10: entradas JÁ USADAS na bateria 1 (mesmo par, mesmas horas, mesmo vínculo):
 *   L-036fca (troca de dono), L-d4313b (síntese da relação com 105 palavras), L-2fa549 (S8),
 *   L-f64a03 (pouca evidência, hora desconhecida), L-03a1dd (tensão e facilidade fortes).
 *
 *   node --import ./scripts/ts-register.mjs scripts/bateria-sinastria-2.ts
 */
import crypto from "crypto"
import fs from "fs"
import path from "path"
import OpenAI from "openai"
import { estimateCostUsd } from "../lib/ai/pricing"
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { selecionarEvidencia } from "../lib/astro/selecao-sinastria"
import { montarPayload } from "../lib/astro/payload-sinastria"
import { promptSinastria } from "../lib/astro/prompt-sinastria"
import { executarPipeline } from "../lib/astro/pipeline-sinastria"
import { dados } from "./simular-selecao-sinastria"

const RAIZ = path.resolve("data/bateria-sinastria")
const SAIDA = path.join(RAIZ, "bateria4")
for (const linha of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = /^([A-Z_]+)=(.*)$/.exec(linha)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "")
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const MODELO = "gpt-4o"

type Entrada = { a: number; b: number; horaA: boolean; horaB: boolean; vinculo: string; grupo: string; origem?: string }
const chave1: Record<string, Entrada> = JSON.parse(fs.readFileSync(path.join(RAIZ, "chave.json"), "utf8"))
const chave3: Record<string, Entrada> = JSON.parse(fs.readFileSync(path.join(RAIZ, "bateria3", "chave.json"), "utf8"))
// as 6 entradas da última bateria: (1) N-008490, (2) N-e2c35a, (3) N-bfa037, (4) N-383686 (gerou "duradouro"),
// (5) L-ee5f90 (o caso recorrente de signo:mercury com traço inventado, da bateria 1), (6) N-6b7f01 (fechou corretamente)
const casos: Array<{ origem: string; grupo: string; entrada: Entrada }> = [
  ...["N-008490", "N-e2c35a", "N-bfa037", "N-383686"].map((id) => ({ origem: id, grupo: "bateria3", entrada: chave3[id] })),
  { origem: "L-ee5f90", grupo: "bateria1", entrada: chave1["L-ee5f90"] },
  { origem: "N-6b7f01", grupo: "bateria3", entrada: chave3["N-6b7f01"] },
]
if (casos.length !== 6) throw new Error("a última bateria tem 6 casos")

async function chamar(system: string, user: string) {
  const t0 = Date.now()
  let ultima: unknown
  for (let k = 0; k < 3; k++) {
    try {
      const r = await openai.chat.completions.create({ model: MODELO, temperature: 0.7, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] })
      const ent = r.usage?.prompt_tokens ?? 0
      const sai = r.usage?.completion_tokens ?? 0
      return { texto: r.choices[0]?.message?.content ?? "", entrada: ent, saida: sai, custo: estimateCostUsd(r.model ?? MODELO, ent, sai), latenciaMs: Date.now() - t0, modeloReal: r.model ?? MODELO, tentativasDeTransporte: k + 1 }
    } catch (e) {
      ultima = e
      const status = (e as { status?: number }).status
      if (status && status < 500 && status !== 429) break
      await new Promise((ok) => setTimeout(ok, 2000 * (k + 1)))
    }
  }
  throw ultima
}

async function main() {
  fs.mkdirSync(path.join(SAIDA, "resultado"), { recursive: true })
  const chaveSaida: Record<string, unknown> = {}
  let total = 0
  for (const c of casos) {
    const id = `P-${crypto.randomBytes(3).toString("hex")}`
    const e = c.entrada
    const selecao = selecionarEvidencia(sinastria(mapaNatal(dados(e.a, e.horaA)), mapaNatal(dados(e.b, e.horaB))))
    const payload = montarPayload(selecao, { locale: "pt", vinculo: e.vinculo as never })
    const { system, user } = promptSinastria(payload)
    const caixa: { g: Awaited<ReturnType<typeof chamar>> | null; erro: string | null } = { g: null, erro: null }
    const r = await executarPipeline({
      payload, selecao, locale: "pt", reparoAtivo: false,
      gerar: async () => {
        try { caixa.g = await chamar(system, user) } catch (x) { caixa.erro = x instanceof Error ? x.message : String(x); return null }
        try { return JSON.parse(caixa.g.texto) } catch { return caixa.g.texto }
      },
    })
    const g = caixa.g
    if (g) total += g.custo
    const estrutural = r.origem === "geracao" ? { ok: true, violacoes: [] as string[] } : { ok: false, violacoes: "violacoesDoGerador" in r ? r.violacoesDoGerador : [caixa.erro ?? "sem resposta"] }
    fs.writeFileSync(path.join(SAIDA, "resultado", `${id}.json`), JSON.stringify({
      id, origem: c.origem, grupo: c.grupo, vinculo: e.vinculo, prompt: { chars: system.length + user.length, tokensEstimados: Math.round((system.length + user.length) / 3.6), system, user },
      geracao: g && { modelo: g.modeloReal, entrada: g.entrada, saida: g.saida, custoUsd: g.custo, latenciaMs: g.latenciaMs, tentativasDeTransporte: g.tentativasDeTransporte, texto: g.texto },
      erroDeGeracao: caixa.erro, origemDoPipeline: r.origem, estrutural, payload,
    }, null, 1))
    chaveSaida[id] = { ...e, origem: c.origem, grupo: c.grupo, vinculo: e.vinculo }
    console.log(`${id} ${c.grupo.padEnd(8)} ${e.vinculo.padEnd(9)} (de ${c.origem}) entrada ${g?.entrada ?? "-"} saída ${g?.saida ?? "-"} ${g ? (g.latenciaMs / 1000).toFixed(1) + "s" : ""} estrutural ${estrutural.ok ? "ok" : "HARD"}`)
  }
  fs.writeFileSync(path.join(SAIDA, "chave.json"), JSON.stringify(chaveSaida, null, 1))
  console.log(`custo total da bateria 4: US$ ${total.toFixed(4)}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
