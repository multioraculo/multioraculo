/**
 * Gera a síntese da tiragem do dia e mostra o veredito do verificador.
 * CHAMADA PAGA. Ferramenta de avaliação: não grava no banco, não usa cache.
 *
 *   node --import ./scripts/ts-register.mjs scripts/tiragem-dia-teste.ts 2026-09-18
 *
 * MODELO_DIA troca o modelo (padrão gpt-4o-mini).
 */
import { config } from "dotenv"
import OpenAI from "openai"
import { tiragemDoDia } from "../lib/oracles/tiragem-dia"
import { promptTiragemDia, verificarSintese } from "../lib/oracles/prompt-tiragem-dia"
import { estimateCostUsd } from "../lib/ai/pricing"
config({ path: ".env.local", quiet: true })

const MODELO = process.env.MODELO_DIA ?? "gpt-4o-mini"

async function main() {
  const t = tiragemDoDia(process.argv[2] ?? "2026-09-18", "pt")
  console.log(`TARÔ: ${t.tarot.nome}\nLENORMAND: ${t.lenormand.nome}\n`)
  const { system, user } = promptTiragemDia(t, "pt")
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  let custo = 0
  let violacoes: string[] = []
  for (let i = 1; i <= 3; i++) {
    const pedido = violacoes.length ? `${user}\n\nA TENTATIVA ANTERIOR FOI REPROVADA:\n${violacoes.map((v) => `- ${v}`).join("\n")}` : user
    const r = await openai.chat.completions.create({
      model: MODELO, temperature: 0.8, response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: pedido }],
    })
    custo += estimateCostUsd(MODELO, r.usage?.prompt_tokens ?? 0, r.usage?.completion_tokens ?? 0)
    const bruto = JSON.parse(r.choices[0]?.message?.content ?? "{}")
    const v = verificarSintese({ bruto, tiragem: t, locale: "pt" })
    console.log(`tentativa ${i}: ${v.ok ? "APROVADA" : "reprovada"}`)
    if (!v.ok) { for (const x of v.violacoes) console.log(`  ! ${x}`); violacoes = v.violacoes }
    console.log(`  eixo: ${(bruto.eixo ?? []).join(" · ")}`)
    console.log(`  ${bruto.sintese ?? ""}\n`)
    if (v.ok) break
  }
  console.log(`custo: US$ ${custo.toFixed(5)} (${MODELO})`)
}
main().catch((e) => { console.error(e); process.exit(1) })
