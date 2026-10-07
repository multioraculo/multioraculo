/**
 * GET /api/horoscopo?signo=0..11[&dia=AAAA-MM-DD]
 *
 * Devolve a leitura do dia de um signo, no idioma do cookie.
 *
 * Geração sob demanda: a primeira pessoa daquele signo no dia paga uma
 * chamada, e todas as outras leem do banco.
 *
 * Desde a função agendada netlify/functions/pregerar-horoscopo.ts, os doze
 * signos costumam já estar gravados quando o dia começa, e esta rota devolve
 * do cache. O caminho sob demanda continua aqui inteiro, e é ele que responde
 * quando a função não rodou, falhou naquele signo, ou o idioma está fora da
 * lista de pré-geração.
 *
 * Aberta a visitante de propósito: o horóscopo geral é a porta de entrada do
 * módulo, não consome cota e não tem dado pessoal em ponto nenhum.
 */
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { diaDeHoje } from "@/lib/astro/ceu"
import { horoscopoDoSigno, lerCache, prepararDia } from "@/lib/astro/horoscopo"
import { guardaDoHoroscopo } from "@/lib/astro/horoscopo-guarda"
import { LINHA_SIGNO } from "@/lib/astro/simbolos"
import { SIGNOS } from "@/lib/astro/nomes"
import { recordAiUsage } from "@/lib/ai/usage"
import { getLocale } from "@/lib/i18n/server"

export const runtime = "nodejs"
export const maxDuration = 60

const MODELO = "gpt-4o"
const FORMATO_DIA = /^\d{4}-\d{2}-\d{2}$/

/**
 * O diagnóstico por tentativa NUNCA vai no corpo público em produção.
 *
 * Ele traz regra interna do verificador, contagem de tokens e custo estimado:
 * é material de quem opera o sistema, não de quem lê o horóscopo. Expor as
 * regras conta a qualquer visitante exatamente o que é conferido no texto, e
 * expor custo conta quanto cada leitura sai. Nada disso ajuda quem veio ler o
 * dia.
 *
 * O lugar dele são os registros do servidor, que a instrumentação já escreve
 * sempre. No corpo da resposta ele só aparece em desenvolvimento, ou quando
 * alguém liga HOROSCOPO_DIAGNOSTICO=1 de propósito para uma investigação
 * pontual, e aí é uma decisão consciente de quem liga.
 */
function podeExporDiagnostico(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.HOROSCOPO_DIAGNOSTICO === "1"
}

/** Tira o diagnóstico do corpo quando ele não deve sair daqui. */
function semDiagnostico<T extends { diagnostico?: unknown }>(r: T): T {
  if (podeExporDiagnostico()) return r
  const { diagnostico: _fora, ...resto } = r
  return resto as T
}

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
    // A guarda compartilha pedidos iguais em andamento e esfria, por alguns
    // minutos, a chave cuja geração tentou e falhou. Ver horoscopo-guarda.ts:
    // é o que impede um rastreador ou script de repetir o gasto a cada pedido.
    const guardado = await guardaDoHoroscopo.executar(`${dia}:${signo}:${locale}`, () => horoscopoDoSigno({
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
        return {
          conteudo: resposta.choices[0]?.message?.content ?? "{}",
          model: resposta.model ?? MODELO,
          usage: resposta.usage,
        }
      },
    }))
    if (guardado.estado === "esfriando") return NextResponse.json(semLeitura(dia, signo, locale))
    return NextResponse.json(semDiagnostico(guardado.resultado))
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
