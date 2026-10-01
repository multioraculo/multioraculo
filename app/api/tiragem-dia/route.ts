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
 * O CORPO DA RESPOSTA NÃO MUDOU. O que mudou foi de onde ele vem — a montagem
 * está em `payloadDaTiragemDoDia`, que a Home também usa no servidor — e o
 * cabeçalho de cache, explicado em `lib/http/cache-do-dia`.
 *
 * `?locale` é opcional e existe para o cache: com ele, a chave da borda é a
 * própria URL e não há como uma resposta em português ser servida a quem pediu
 * em espanhol. Sem ele, o idioma continua vindo do cookie e a resposta não é
 * compartilhada.
 */
import { NextResponse } from "next/server"
import { getLocale } from "@/lib/i18n/server"
import { isLocale } from "@/lib/i18n/config"
import { payloadDaTiragemDoDia } from "@/lib/oracles/tiragem-dia-payload"
import { cacheDoDia } from "@/lib/http/cache-do-dia"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const pedido = params.get("locale")
  const explicito = isLocale(pedido)
  const locale = explicito ? pedido : await getLocale()

  const corpo = await payloadDaTiragemDoDia(locale, params.get("dia"))

  const publicavel = explicito && corpo.sintese !== null
  return NextResponse.json(corpo, { headers: { "Cache-Control": cacheDoDia(publicavel) } })
}
