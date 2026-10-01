/**
 * GET /api/tiragem-dia[?dia=AAAA-MM-DD][&locale=pt|en|es]
 *
 * A tiragem do dia: uma carta de Tarô e uma de Lenormand, a mesma para todo
 * mundo, com a leitura do cruzamento entre as duas.
 *
 * Pública de propósito. Ela não é de ninguém em particular: é o dia. Não
 * consome cota, não escreve em reading_usage e não encosta no paywall. Dia
 * diferente de hoje só é servido do que já está gravado.
 *
 * A montagem do corpo está em `payloadDaTiragemDoDia`, que a Home também usa
 * no servidor — assim a página não precisa chamar a própria API por HTTP.
 *
 * SEM CACHE COMPARTILHADO NA BORDA, pelo mesmo motivo medido em
 * `/api/ceu-dia`: a Netlify monta a chave de cache com `query=__nextDataReq|_rsc`
 * e descarta todo o resto da query string, `locale` incluído. As três URLs por
 * idioma colapsavam numa entrada só, e a primeira a chegar era servida a todos
 * até a virada do dia. A resposta volta a ser privada.
 *
 * Idioma na URL continua: ele não existe mais para o cache, mas mantém o
 * pedido do cliente explícito em vez de depender do cookie viajar no fetch.
 */
import { NextResponse } from "next/server"
import { getLocale } from "@/lib/i18n/server"
import { isLocale } from "@/lib/i18n/config"
import { payloadDaTiragemDoDia } from "@/lib/oracles/tiragem-dia-payload"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const pedido = params.get("locale")
  const locale = isLocale(pedido) ? pedido : await getLocale()

  const corpo = await payloadDaTiragemDoDia(locale, params.get("dia"))

  return NextResponse.json(corpo, { headers: { "Cache-Control": "private, no-cache" } })
}
