import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const SYSTEM_PROMPT = `Você é um especialista em simbolismo onírico e análise psíquica profunda.
Analise os sonhos fornecidos cronologicamente e retorne APENAS um objeto JSON válido com esta estrutura exata:

{
  "timeline": [
    {
      "number": 1,
      "title": "Título evocativo e simbólico para este sonho",
      "archetypes": "Arquétipo Principal · Símbolo 1 · Símbolo 2",
      "summary": "Resumo psicológico de 1-2 frases sobre o que este sonho revela"
    }
  ],
  "patterns": [
    "Frase fluida descrevendo o padrão e seu significado psicológico em linguagem natural",
    "Outra frase natural descrevendo o que o padrão revela sobre o momento interior"
  ],
  "turningPoint": "Descrição em linguagem natural do sonho que marca uma mudança de perspectiva ou virada na jornada.",
  "essence": "O tema central da fase atual em linguagem poética e direta. Escreva 2-3 frases reveladoras."
}

REGRAS ABSOLUTAS:
- Responda APENAS com JSON válido, sem texto, markdown ou explicações adicionais
- "timeline": uma entrada por sonho, do mais antigo (número 1) ao mais recente
- "patterns": de 3 a 5 padrões, cada um escrito como uma frase natural e fluida, SEM usar travessões (—) ou dois-pontos como separadores
- "turningPoint": texto corrido, SEM travessões como separadores
- "essence": síntese do momento psíquico atual, SEM travessões
- Use linguagem natural e expressiva. Escreva como prosa, não como lista com separadores artificiais
- PROIBIDO usar o caractere — (em-dash) em qualquer campo
- Idioma de toda a resposta: Português
- NÃO citar Jung, Freud ou qualquer autor pelo nome`

export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const { data: dreams, error: dreamsError } = await supabase
    .from("dreams")
    .select("dream_description, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(20)

  if (dreamsError || !dreams || dreams.length < 3) {
    return NextResponse.json(
      { error: "São necessários pelo menos 3 sonhos para a análise." },
      { status: 400 }
    )
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

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analise estes ${dreams.length} sonhos e retorne o JSON da jornada:\n\n${dreamsList}`,
        },
      ],
    })

    const raw = completion.choices?.[0]?.message?.content ?? "{}"
    const journeyData = JSON.parse(raw)
    return NextResponse.json({ ok: true, journeyData })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Erro ao gerar análise." },
      { status: 500 }
    )
  }
}
