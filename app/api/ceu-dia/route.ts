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
 * A montagem do corpo está em `payloadDoCeuDoDia`, que a Home também usa no
 * servidor — assim a página não precisa chamar a própria API por HTTP.
 *
 * SEM CACHE COMPARTILHADO NA BORDA, e isto foi medido em produção, não suposto.
 *
 * A tentativa anterior guardava a resposta na borda quando o idioma vinha na
 * URL, apostando que a chave de cache seria a URL inteira e que por isso não
 * haveria como servir português a quem pediu em espanhol. A Netlify diz o
 * contrário no próprio cabeçalho que ela devolve:
 *
 *     Netlify-Vary: query=__nextDataReq|_rsc
 *     Cache-Status: "Netlify Edge"; hit; ttl=16579
 *
 * A chave inclui SÓ aqueles dois parâmetros. `locale` é descartado, e com ele
 * qualquer outro parâmetro. Na prática `?locale=pt`, `?locale=en` e
 * `?locale=es` colapsavam numa entrada única: a primeira que chegasse ficava
 * servida a todos os idiomas até a virada do dia. Em 2026-10-01 os três
 * idiomas voltaram byte a byte iguais, em português, inclusive os nomes das
 * cartas — que são calculados em processo e não lidos do banco, o que provou
 * que a resposta vinha da borda e não da origem.
 *
 * Então a resposta volta a ser privada. O custo é real e conhecido: entre
 * 0,84 s e 2,25 s por requisição, refazendo trabalho para entregar menos de um
 * quilobyte. É um preço que este caminho pode pagar, porque ele virou
 * fallback: a Home lê o conteúdo do dia no servidor e o manda no HTML, e só
 * cai aqui quando o texto ainda não existe no banco.
 *
 * Idioma na URL continua: ele não existe mais para o cache, mas mantém o
 * pedido do cliente explícito em vez de depender do cookie viajar no fetch.
 */
import { NextResponse } from "next/server"
import { getLocale } from "@/lib/i18n/server"
import { isLocale } from "@/lib/i18n/config"
import { payloadDoCeuDoDia } from "@/lib/astro/ceu-do-dia-payload"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request: Request) {
  const pedido = new URL(request.url).searchParams.get("locale")
  const locale = isLocale(pedido) ? pedido : await getLocale()

  const corpo = await payloadDoCeuDoDia(locale)

  return NextResponse.json(corpo, { headers: { "Cache-Control": "private, no-cache" } })
}
