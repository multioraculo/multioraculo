/**
 * A tiragem do dia, pronta para a tela, de um lugar só.
 *
 * Mesmo motivo do céu: a Home passou a precisar disto no servidor, e a página
 * chamar a própria API por HTTP seria uma volta de rede para falar com o mesmo
 * processo. Extraída, a função serve a página e a rota, e não há duas versões
 * da verdade para divergirem.
 *
 * O CORPO DEVOLVIDO É IDÊNTICO ao da rota, nos quatro caminhos: dia passado,
 * sem chave da OpenAI, geração bem-sucedida e erro na geração.
 */
import OpenAI from "openai"
import type { Locale } from "@/lib/i18n/config"
import { recordAiUsage } from "@/lib/ai/usage"
import { diaDaTiragem, tiragemDoDia } from "./tiragem-dia"
import { leituraDoDia, lerTiragemGravada } from "./tiragem-dia-server"

const MODELO = "gpt-4o"

export type TiragemDoDiaNaTela = Awaited<ReturnType<typeof leituraDoDia>> | {
  dia: string
  tiragem: ReturnType<typeof tiragemDoDia>
  eixo: null
  sintese: null
  cartas: null
  cache: false
}

export async function payloadDaTiragemDoDia(
  locale: Locale,
  diaPedido?: string | null,
): Promise<TiragemDoDiaNaTela> {
  const hoje = diaDaTiragem()
  const dia = diaDaTiragem(diaPedido ?? undefined)

  // dia diferente de hoje só é servido do que já está gravado: o passado não
  // se gera sob demanda, e o futuro não se anuncia
  if (dia !== hoje) {
    return { dia, tiragem: tiragemDoDia(dia, locale), eixo: null, sintese: null, cartas: null, cache: false }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { dia, tiragem: tiragemDoDia(dia, locale), eixo: null, sintese: null, cartas: null, cache: false }
  }
  const openai = new OpenAI({ apiKey })

  try {
    return await leituraDoDia({
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
  } catch (erro) {
    console.error("[tiragem-dia]", erro)
    return { dia, tiragem: tiragemDoDia(dia, locale), eixo: null, sintese: null, cartas: null, cache: false }
  }
}

/**
 * O mesmo corpo, mas SÓ se a leitura do dia já estiver gravada. Mesmo motivo do
 * céu: a Home não pode esperar uma geração para desenhar o HTML.
 */
export async function payloadDaTiragemDoDiaSeGravada(locale: Locale): Promise<TiragemDoDiaNaTela | null> {
  const dia = diaDaTiragem()
  const guardada = await lerTiragemGravada(dia, locale)
  if (!guardada) return null
  return {
    dia,
    tiragem: tiragemDoDia(dia, locale),
    eixo: guardada.eixo,
    sintese: guardada.sintese,
    cartas: guardada.cartas,
    model: guardada.model,
    cache: true,
    violacoes: [],
  }
}
