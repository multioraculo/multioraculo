import { NextResponse } from "next/server"
import OpenAI from "openai"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { LOCALE_META, resolveLocale } from "@/lib/i18n/config"
import { newSeed } from "@/lib/oracles/draw"
import { completeReading, consumeReading, failReading, httpStatusFor, visitorIdFrom } from "@/lib/billing/usage"
import { VISITOR_COOKIE } from "@/lib/billing/visitor"
import { recordAiUsage } from "@/lib/ai/usage"

export const runtime = "nodejs"
export const maxDuration = 60

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
- NÃO citar Jung, Freud ou qualquer autor pelo nome`

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const locale = resolveLocale(body?.locale)

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado.", code: "unauthenticated" }, { status: 401 })
  }

  const { data: dreams, error: dreamsError } = await supabase
    .from("dreams")
    .select("dream_description, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(20)

  if (dreamsError || !dreams || dreams.length < 3) {
    return NextResponse.json(
      { error: "São necessários pelo menos 3 sonhos para a análise.", code: "not_enough_dreams" },
      { status: 400 }
    )
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 })
  }

  // Cota (server-side): a Jornada é um consumo do tipo "journey", incluído só
  // nos planos pagos (Essencial 1/mês, Ilimitado sem limite).
  const visitorId = visitorIdFrom((await cookies()).get(VISITOR_COOKIE)?.value)
  const seed = newSeed()
  const consume = await consumeReading({ userId: user.id, visitorId, seed, locale, kind: "journey" })
  if (!consume.allowed) {
    return NextResponse.json(
      {
        error: "A Jornada onírica não está disponível no seu plano ou o limite do período foi atingido.",
        code: consume.code,
        plan: consume.entitlement.plan,
        used: consume.used,
        limit: consume.limit,
        periodEnd: consume.entitlement.periodEnd,
      },
      { status: httpStatusFor(consume.code) }
    )
  }

  const openai = new OpenAI({ apiKey })

  const dreamsList = dreams
    .map((d: any, i: number) => {
      const date = new Date(d.created_at).toLocaleDateString(LOCALE_META[locale].tag, {
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
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n- Idioma de todos os textos do JSON: ${LOCALE_META[locale].promptName}`,
        },
        {
          role: "user",
          content: `Analise estes ${dreams.length} sonhos e retorne o JSON da jornada:\n\n${dreamsList}`,
        },
      ],
    })

    await recordAiUsage({ operation: "journey", model: completion.model || "gpt-4o", usage: completion.usage, seed, userId: user.id })
    const raw = completion.choices?.[0]?.message?.content ?? "{}"
    const journeyData = JSON.parse(raw)
    await completeReading(seed)
    return NextResponse.json({ ok: true, journeyData })
  } catch (err: any) {
    // falha técnica não consome a cota
    await failReading(seed).catch(() => {})
    return NextResponse.json(
      { error: err.message ?? "Erro ao gerar análise." },
      { status: 500 }
    )
  }
}
