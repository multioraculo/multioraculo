/**
 * GET /api/tiragem-dia[?dia=AAAA-MM-DD]
 *
 * A tiragem do dia: uma carta de Tarô e uma de Lenormand, a mesma para todo
 * mundo, mais a síntese do cruzamento.
 *
 * Pública de propósito. Ela não é de ninguém em particular: é o dia. Não
 * consome cota, não escreve em reading_usage e não cria consulta, então não
 * encosta no paywall nem interfere nas consultas normais.
 *
 * Não existe job à meia-noite: a chave é a data, então a dupla vira sozinha
 * às 00:00 no fuso do produto. O que custa é a síntese, gerada na primeira
 * visita do dia e guardada para as seguintes.
 */
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getLocale } from "@/lib/i18n/server"
import { recordAiUsage } from "@/lib/ai/usage"
import { diaDaTiragem, tiragemDoDia } from "@/lib/oracles/tiragem-dia"
import { leituraDoDia } from "@/lib/oracles/tiragem-dia-server"

export const runtime = "nodejs"
export const maxDuration = 60

const MODELO = "gpt-4o"

export async function GET(request: Request) {
  const locale = await getLocale()
  const hoje = diaDaTiragem()
  const pedido = new URL(request.url).searchParams.get("dia")
  const dia = diaDaTiragem(pedido)

  // dia diferente de hoje só é servido do que já está gravado: o passado não
  // se gera sob demanda, e o futuro não se anuncia
  if (dia !== hoje) {
    return NextResponse.json({ dia, tiragem: tiragemDoDia(dia, locale), eixo: null, sintese: null, cache: false })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ dia, tiragem: tiragemDoDia(dia, locale), eixo: null, sintese: null, cache: false })
  }
  const openai = new OpenAI({ apiKey })

  try {
    const resultado = await leituraDoDia({
      dia,
      locale,
      gerar: async ({ system, user }) => {
        const resposta = await openai.chat.completions.create({
          model: MODELO,
          temperature: 0.8,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        })
        await recordAiUsage({
          operation: "daily_draw",
          model: resposta.model ?? MODELO,
          usage: resposta.usage,
          seed: `${dia}:${locale}`,
        })
        return { conteudo: resposta.choices[0]?.message?.content ?? "{}", model: resposta.model ?? MODELO }
      },
    })
    return NextResponse.json(resultado)
  } catch (erro) {
    console.error("[tiragem-dia]", erro)
    return NextResponse.json({ dia, tiragem: tiragemDoDia(dia, locale), eixo: null, sintese: null, cache: false })
  }
}
