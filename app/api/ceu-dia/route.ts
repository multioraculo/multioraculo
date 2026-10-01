/**
 * GET /api/ceu-dia[?locale=pt|en|es]
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
 *
 * O CORPO DA RESPOSTA NÃO MUDOU. O que mudou foi de onde ele vem — a montagem
 * está em `payloadDoCeuDoDia`, que a Home também usa no servidor — e o
 * cabeçalho de cache, explicado em `lib/http/cache-do-dia`.
 *
 * `?locale` é opcional e existe para o cache: com ele, a chave da borda é a
 * própria URL e não há como uma resposta em português ser servida a quem pediu
 * em espanhol. Sem ele, o idioma continua vindo do cookie, como sempre, e a
 * resposta não é compartilhada.
 */
import { NextResponse } from "next/server"
import { getLocale } from "@/lib/i18n/server"
import { isLocale } from "@/lib/i18n/config"
import { payloadDoCeuDoDia } from "@/lib/astro/ceu-do-dia-payload"
import { cacheDoDia } from "@/lib/http/cache-do-dia"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request: Request) {
  const pedido = new URL(request.url).searchParams.get("locale")
  const explicito = isLocale(pedido)
  const locale = explicito ? pedido : await getLocale()

  const corpo = await payloadDoCeuDoDia(locale)

  // guardar na borda só quando o idioma veio na URL e o texto já existe: uma
  // resposta sem síntese congelaria o "ainda não ficou pronto" até a virada
  const publicavel = explicito && corpo.sintese !== null
  return NextResponse.json(corpo, { headers: { "Cache-Control": cacheDoDia(publicavel) } })
}
