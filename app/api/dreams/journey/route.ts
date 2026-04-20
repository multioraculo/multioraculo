import { NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const dreams = Array.isArray(body?.dreams) ? body.dreams : []

  if (dreams.length < 3) {
    return NextResponse.json({ error: "São necessários pelo menos 3 sonhos para a análise." }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 })
  }

  const openai = new OpenAI({ apiKey })

  const dreamsList = dreams
    .map((d: any, i: number) => {
      const date = new Date(d.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      return `Sonho ${i + 1} (${date}):\n"${d.dream_description}"`
    })
    .join("\n\n")

  const prompt = `Analise esses ${dreams.length} sonhos e identifique:

1. SÍMBOLOS RECORRENTES
   - Quais imagens/figuras aparecem repetidamente?
   - O que isso revela sobre os temas centrais?

2. EVOLUÇÃO TEMPORAL
   - Como os sonhos mudaram ao longo do tempo?
   - Há progressão clara? (ex: passivo → ativo, fuga → confronto)

3. MOMENTOS DE VIRADA
   - Sonhos que marcam mudanças significativas
   - Quando a psique sinalizou transformação

4. TEMA CENTRAL ATUAL
   - Qual o tema dominante agora?
   - O que a jornada onírica está apontando?

FORMATO: 2-3 parágrafos concisos e reveladores, conectando os pontos como uma narrativa de travessia.
TOM: Profundo mas acolhedor, sem jargões.

SONHOS:
${dreamsList}`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 700,
    messages: [
      {
        role: "system",
        content: "Você é um intérprete de sonhos especializado em padrões psíquicos ao longo do tempo. Responda em português, em prosa corrida, sem títulos ou bullets.",
      },
      { role: "user", content: prompt },
    ],
  })

  const analysis = completion.choices?.[0]?.message?.content?.trim() ?? ""
  return NextResponse.json({ ok: true, analysis })
}
