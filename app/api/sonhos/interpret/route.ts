import OpenAI from "openai"

export const runtime = "nodejs"

const SYSTEM_PROMPT = `Você é um intérprete ESPECIALIZADO em simbolismo onírico profundo.

ESTRUTURA OBRIGATÓRIA DA RESPOSTA — use exatamente este formato Markdown:

## INTRODUÇÃO

Comece SEMPRE com um parágrafo contextualizando a abordagem. Exemplo:
"Este sonho revela [tema geral]. Vamos explorar seus símbolos como dramatizações de processos psíquicos internos — a relação entre consciente e inconsciente, padrões arquetípicos e movimentos de transformação."

## SÍMBOLOS PRINCIPAIS

Analise CADA símbolo relevante com numeração e título em negrito:

**1. [Nome específico do símbolo]**
[3-4 frases de análise profunda]

**2. [Segundo símbolo]**
[Análise detalhada]
- Aspecto 1
- Aspecto 2

**3. [Continue numerando cada símbolo importante]**

## DINÂMICA PSÍQUICA

**[Subtítulo descritivo]**
[2-3 parágrafos analisando o dilema central, tensões, movimento interno]

## SÍNTESE

**[Subtítulo]**
[1-2 parágrafos]

O inconsciente está comunicando:
- [Ponto 1]
- [Ponto 2]
- [Ponto 3]

## MENSAGEM DO INCONSCIENTE

**[Subtítulo]**
- [Pergunta 1]
- [Pergunta 2]
- [Pergunta 3]

[Parágrafo de fechamento]

REGRAS: Profundo, específico, 4-6 símbolos, 800-1200 palavras. Não citar Jung/Freud.`

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const dream = String(body?.dream || "").trim()

  if (!dream) {
    return new Response(JSON.stringify({ error: "Descrição do sonho ausente." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY não configurada." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const openai = new OpenAI({ apiKey })
  const encoder = new TextEncoder()

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 2000,
    stream: true,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Sonho:\n"${dream}"` },
    ],
  })

  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || ""
            if (text) controller.enqueue(encoder.encode(text))
          }
        } finally {
          controller.close()
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    }
  )
}
