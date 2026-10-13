import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/config"
import {
  HEADER_LOCALE,
  HEADER_LOCALE_URL,
  caminhoDaRota,
  caminhoSemBarra,
  rotaDoCaminho,
  temPrefixoDeIdioma,
} from "@/lib/i18n/rotas"

/** Caminho que não existe: serve de destino para /en/... e /es/... inválidos, que viram 404. */
const CAMINHO_INEXISTENTE = "/_idioma-inexistente"

/**
 * Roteamento por idioma das 21 URLs públicas (lib/i18n/rotas.ts).
 *
 *  - /oraculos, /faq...        português, e ficam em português SEMPRE: a URL
 *                              manda, cookie e Accept-Language não entram.
 *  - /en/oracles, /es/faq...   REWRITE (nunca redirect) para a mesma página em
 *                              português, com o idioma no cabeçalho interno.
 *                              Uma página só, três idiomas, cada um com URL
 *                              própria e rastreável.
 *  - /en/qualquer-outra-coisa  404. Não existe versão inventada, então não
 *                              existe página duplicada.
 *  - todo o resto              (páginas pessoais, painel, APIs): como antes, o
 *                              idioma é o cookie.
 *
 * Os cabeçalhos x-locale/x-locale-url são SEMPRE reescritos aqui, inclusive
 * esvaziados: o que o cliente mandar com esse nome nunca chega ao servidor.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // barra final nas URLs de idioma: 308 para a mesma URL sem barra, com a query
  // intacta. É normalização de endereço, não escolha de idioma.
  const semBarra = caminhoSemBarra(pathname)
  if (semBarra) {
    // URL padrão, e não request.nextUrl.clone(): o NextURL preserva a barra final ao
    // reescrever o pathname, e o redirect apontaria para a própria URL (laço)
    const limpa = new URL(request.url)
    limpa.pathname = semBarra
    return NextResponse.redirect(limpa, 308)
  }

  const rota = rotaDoCaminho(pathname)

  if (rota) {
    const interno = request.nextUrl.clone()
    interno.pathname = caminhoDaRota(rota.chave, "pt")
    const resposta = await updateSession(request, {
      rewriteTo: rota.locale === "pt" ? undefined : interno,
      headers: { [HEADER_LOCALE]: rota.locale, [HEADER_LOCALE_URL]: "1" },
    })
    // a preferência acompanha a URL visitada: as páginas pessoais, que seguem
    // o cookie, passam a falar o idioma que a pessoa estava lendo
    if (request.cookies.get(LOCALE_COOKIE)?.value !== rota.locale) {
      resposta.cookies.set(LOCALE_COOKIE, rota.locale, { path: "/", maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: "lax" })
    }
    return resposta
  }

  if (temPrefixoDeIdioma(pathname)) {
    const inexistente = request.nextUrl.clone()
    inexistente.pathname = CAMINHO_INEXISTENTE
    return await updateSession(request, {
      rewriteTo: inexistente,
      headers: { [HEADER_LOCALE]: "", [HEADER_LOCALE_URL]: "" },
    })
  }

  return await updateSession(request, { headers: { [HEADER_LOCALE]: "", [HEADER_LOCALE_URL]: "" } })
}

/**
 * A LISTA DE FORA É CURTA DE PROPÓSITO.
 *
 * O middleware chama `auth.getUser()`, que é uma ida ao servidor de
 * autenticação do Supabase, em TODA requisição que ele vê. Para quem precisa de
 * sessão isso é o preço correto e continua valendo. Para quem não precisa, é
 * uma volta de rede antes de o trabalho começar.
 *
 * Só sai daqui o que foi provado público. As duas rotas abaixo foram lidas
 * linha a linha em auditorias:
 *
 *   /api/ceu-dia        não chama createClient, não lê sessão, não consulta
 *                       entitlement, não escreve em reading_usage, não encosta
 *                       no paywall. O conteúdo é o céu daquele dia, igual para
 *                       todas as pessoas, e varia só por dia e idioma.
 *   /api/tiragem-dia    idem: a carta do dia é a mesma para todo mundo.
 *
 *   /robots.txt, /sitemap.xml, /manifest.webmanifest, /opengraph-image
 *                       arquivos de metadata do Next (app/robots.ts, sitemap.ts,
 *                       manifest.ts, opengraph-image.tsx). Não leem sessão nem
 *                       cookie: devolvem o mesmo conteúdo para todo mundo. Sem
 *                       esta exclusão, cada visita de rastreador custaria um
 *                       getUser() e ainda ganharia o cookie de visitante.
 *
 * Nenhuma outra rota entra nesta lista sem a mesma prova. Em particular,
 * `/api/horoscopo` também não lê sessão hoje, e mesmo assim fica de fora da
 * exclusão: ela PODE gastar uma geração paga, e eu prefiro que uma rota com
 * custo continue passando pela mesma porta que todo o resto.
 */
export const config = {
  matcher: [
    // O webhook da Stripe não tem sessão de usuário: fica fora do middleware do Supabase.
    "/((?!_next/static|_next/image|favicon.ico|api/billing/webhook|api/ceu-dia|api/tiragem-dia|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
