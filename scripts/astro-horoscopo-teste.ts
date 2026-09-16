/**
 * Gera a leitura de um signo e mostra o que o verificador achou dela.
 * CHAMADA PAGA à OpenAI. Ferramenta de avaliação de linguagem: não grava no
 * banco, não passa pelo cache, e mostra todas as tentativas.
 *
 *   node --import ./scripts/ts-register.mjs scripts/astro-horoscopo-teste.ts 2026-09-16 5
 *
 * MODELO_ASTRO troca o modelo (padrão gpt-4o).
 */
import { config } from "dotenv"
import OpenAI from "openai"
import { diaDeHoje } from "../lib/astro/ceu"
import { prepararDia } from "../lib/astro/horoscopo"
import { promptHoroscopo } from "../lib/astro/prompt-horoscopo"
import { verificarLeitura } from "../lib/astro/verificador"
import { SIGNOS } from "../lib/astro/nomes"
import { estimateCostUsd } from "../lib/ai/pricing"

config({ path: ".env.local", quiet: true })

const MODELO = process.env.MODELO_ASTRO ?? "gpt-4o"
const TEMPERATURA = Number(process.env.TEMP_ASTRO ?? 0.7)
const locale = "pt" as const
const TENTATIVAS = 3

async function main() {
  const chave = process.env.OPENAI_API_KEY
  if (!chave) throw new Error("OPENAI_API_KEY não está definido (.env.local)")

  const dia = process.argv[2]?.includes("-") ? process.argv[2] : diaDeHoje()
  const signo = Number(process.argv.find((a, i) => i >= 2 && /^\d{1,2}$/.test(a)) ?? 5)

  const { cards } = prepararDia(dia, signo, locale)
  const prompt = promptHoroscopo({ dia, signo, cards, locale })
  const openai = new OpenAI({ apiKey: chave })
  let custo = 0
  let violacoes: string[] = []

  console.log(`\n${dia} · ${SIGNOS[locale][signo]} · ${MODELO} · temperatura ${TEMPERATURA}`)
  console.log(`movimentos: ${cards.map((c) => c.titulo).join(" | ")}\n`)

  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    const user = violacoes.length
      ? `${prompt.user}\n\nA TENTATIVA ANTERIOR FOI REPROVADA. Reescreva do zero, sem repetir o que causou isto:\n${violacoes.map((v) => `- ${v}`).join("\n")}`
      : prompt.user

    const resposta = await openai.chat.completions.create({
      model: MODELO,
      temperature: TEMPERATURA,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: user },
      ],
    })
    custo += estimateCostUsd(MODELO, resposta.usage?.prompt_tokens ?? 0, resposta.usage?.completion_tokens ?? 0)

    let bruto: unknown
    try {
      bruto = JSON.parse(resposta.choices[0]?.message?.content ?? "{}")
    } catch {
      violacoes = ["a resposta não era JSON válido"]
      console.log(`tentativa ${tentativa}: JSON inválido`)
      continue
    }

    const veredito = verificarLeitura({ bruto, cards, signo, locale })
    console.log(`${"─".repeat(70)}\ntentativa ${tentativa}: ${veredito.ok ? "APROVADA" : "reprovada"}`)
    if (!veredito.ok) {
      for (const v of veredito.violacoes) console.log(`  ! ${v}`)
      violacoes = veredito.violacoes
    }

    const leitura = (bruto ?? {}) as Record<string, any>
    console.log(`\n  EM FOCO HOJE: ${leitura.foco ?? "?"}`)
    for (const [i, card] of cards.entries()) {
      const r = (leitura.relacoes ?? []).find((x: any) => Number(x?.n) === i + 1) ?? (leitura.relacoes ?? [])[i]
      console.log(`\n  [${i + 1}] ${card.titulo}`)
      console.log(`      ${(r?.polaridade ?? []).join("  ×  ")}`)
      console.log(`      ${r?.explicacao ?? ""}`)
    }
    const t = leitura.tendencias ?? {}
    console.log(`\n  TENDÊNCIAS: ${t.texto ?? ""}`)
    console.log(`  disponível: ${t.disponivel ?? ""}`)
    console.log(`  em jogo: ${t.emJogo ?? ""}\n`)

    if (veredito.ok) break
  }

  console.log(`${"─".repeat(70)}\ncusto estimado desta rodada: US$ ${custo.toFixed(4)}\n`)
}

main().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
