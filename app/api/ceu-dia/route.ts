/**
 * GET /api/ceu-dia
 *
 * O que o céu de hoje coloca em evidência: os fatos escolhidos do dia e a
 * tradução simbólica deles, a mesma para todas as pessoas.
 *
 * Pública de propósito, como a tiragem do dia. Não é de ninguém em particular:
 * é o céu. Não consome cota, não escreve em reading_usage e não encosta no
 * paywall.
 *
 * Os fatos saem do cálculo e voltam sempre, mesmo sem chave nem cache; o que
 * depende de geração é só o texto. É por isso que a tela nunca fica vazia: na
 * pior hipótese ela mostra a camada factual, que é o que o produto promete.
 */
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getLocale } from "@/lib/i18n/server"
import { recordAiUsage } from "@/lib/ai/usage"
import { diaDeHoje, estadoDoCeu } from "@/lib/astro/ceu"
import { camadaFactual, fatosDoCeu } from "@/lib/astro/ceu-do-dia"
import { leituraDoCeu } from "@/lib/astro/ceu-do-dia-server"

export const runtime = "nodejs"
export const maxDuration = 60

const MODELO = "gpt-4o"

/** Só os campos que a tela usa: o resto do fato é para o prompt e o verificador. */
function paraTela(fatos: ReturnType<typeof fatosDoCeu>["escolhidos"]) {
  return fatos.map((f) => ({ id: f.id, factual: f.factual, texto: f.texto }))
}

export async function GET() {
  const locale = await getLocale()
  const dia = diaDeHoje()

  const semTexto = () => {
    const ceu = estadoDoCeu(dia)
    const { escolhidos } = fatosDoCeu(ceu, locale)
    return NextResponse.json({
      dia,
      factual: camadaFactual(ceu, escolhidos, locale),
      fatos: paraTela(escolhidos),
      sintese: null,
      cache: false,
    })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return semTexto()
  const openai = new OpenAI({ apiKey })

  try {
    const resultado = await leituraDoCeu({
      dia,
      locale,
      gerar: async ({ system, user }) => {
        const resposta = await openai.chat.completions.create({
          model: MODELO,
          temperature: 0.7,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        })
        await recordAiUsage({
          operation: "sky_daily",
          model: resposta.model ?? MODELO,
          usage: resposta.usage,
          seed: `${dia}:${locale}`,
        })
        return { conteudo: resposta.choices[0]?.message?.content ?? "{}", model: resposta.model ?? MODELO }
      },
    })
    return NextResponse.json({
      dia: resultado.dia,
      factual: resultado.factual,
      fatos: paraTela(resultado.fatos),
      sintese: resultado.sintese,
      cache: resultado.cache,
    })
  } catch (erro) {
    console.error("[ceu-dia]", erro)
    return semTexto()
  }
}
