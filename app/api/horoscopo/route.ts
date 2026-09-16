/**
 * GET /api/horoscopo?signo=0..11[&dia=AAAA-MM-DD]
 *
 * Devolve a leitura do dia de um signo, no idioma do cookie.
 *
 * Geração sob demanda: a primeira pessoa daquele signo no dia paga uma
 * chamada, e todas as outras leem do banco. Signo que ninguém abriu não é
 * gerado. É por isso que a rota não tem um job diário de doze signos.
 *
 * Aberta a visitante de propósito: o horóscopo geral é a porta de entrada do
 * módulo, não consome cota e não tem dado pessoal em ponto nenhum.
 */
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { diaDeHoje } from "@/lib/astro/ceu"
import { horoscopoDoSigno, lerCache, prepararDia } from "@/lib/astro/horoscopo"
import { LINHA_SIGNO } from "@/lib/astro/simbolos"
import { SIGNOS } from "@/lib/astro/nomes"
import { recordAiUsage } from "@/lib/ai/usage"
import { getLocale } from "@/lib/i18n/server"

export const runtime = "nodejs"
export const maxDuration = 60

const MODELO = "gpt-4o"
const FORMATO_DIA = /^\d{4}-\d{2}-\d{2}$/

export async function GET(request: Request) {
  const url = new URL(request.url)
  const signo = Number(url.searchParams.get("signo"))
  if (!Number.isInteger(signo) || signo < 0 || signo > 11) {
    return NextResponse.json({ error: "Signo inválido." }, { status: 400 })
  }

  const pedido = url.searchParams.get("dia")
  const hoje = diaDeHoje()
  const dia = pedido && FORMATO_DIA.test(pedido) ? pedido : hoje
  const locale = await getLocale()

  // dia diferente de hoje só é servido do que já está gravado: o passado não
  // se gera sob demanda, e o futuro não se anuncia.
  if (dia !== hoje) {
    const guardado = await lerCache(dia, signo, locale)
    return NextResponse.json(guardado ?? semLeitura(dia, signo, locale))
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json(semLeitura(dia, signo, locale))
  const openai = new OpenAI({ apiKey })

  try {
    const resultado = await horoscopoDoSigno({
      dia,
      signo,
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
          operation: "horoscope",
          model: resposta.model ?? MODELO,
          usage: resposta.usage,
          seed: `${dia}:${signo}:${locale}`,
        })
        return { conteudo: resposta.choices[0]?.message?.content ?? "{}", model: resposta.model ?? MODELO }
      },
    })
    return NextResponse.json(resultado)
  } catch (erro) {
    console.error("[horoscopo]", erro)
    return NextResponse.json(semLeitura(dia, signo, locale))
  }
}

/** Sem texto interpretativo, mas com os movimentos e o céu calculado. */
function semLeitura(dia: string, signo: number, locale: "pt" | "en" | "es") {
  const { ceu, cards } = prepararDia(dia, signo, locale)
  return {
    dia,
    signo,
    nomeSigno: SIGNOS[locale][signo],
    linhaSigno: LINHA_SIGNO[locale][signo],
    locale,
    cards,
    ceu,
    leitura: null,
    model: null,
    cache: false,
    tentativas: 0,
    violacoes: [],
  }
}
