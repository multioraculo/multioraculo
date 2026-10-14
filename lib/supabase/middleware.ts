import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { VISITOR_COOKIE, isVisitorId, newVisitorId, visitorCookieOptions } from "@/lib/billing/visitor"
import { HEADER_USUARIO, serializarUsuario } from "@/lib/auth/usuario-header"

/**
 * `opcoes` existe para o roteamento por idioma (middleware.ts): um rewrite
 * interno (/en/oracles atende por /oraculos) e cabeçalhos internos de idioma.
 * Sem opções, o comportamento é exatamente o de sempre.
 */
export type OpcoesDeRoteamento = { rewriteTo?: URL; headers?: Record<string, string> }

export async function updateSession(request: NextRequest, opcoes: OpcoesDeRoteamento = {}) {
  // Id de visitante para a tiragem gratuita sem login (ver lib/billing/visitor.ts).
  // Gerado ANTES da resposta e gravado na própria requisição, para que a rota
  // desta mesma chamada já enxergue o id (evita dois ids na primeira visita).
  let pendingVisitorId: string | null = null
  if (!isVisitorId(request.cookies.get(VISITOR_COOKIE)?.value)) {
    pendingVisitorId = newVisitorId()
    request.cookies.set(VISITOR_COOKIE, pendingVisitorId)
  }

  // Cookies que a renovação da sessão pedir para gravar. Antes, cada renovação
  // recriava a resposta no meio do `getUser()`; agora a resposta é montada UMA
  // vez, depois, já sabendo quem está logado, e recebe estes cookies. O que
  // chega à página e ao navegador é o mesmo de antes.
  const cookiesParaResposta: { name: string; value: string; options: CookieOptions }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // na requisição, para a página desta mesma chamada já ler o token novo
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesParaResposta.push(...cookiesToSet)
        },
      },
    }
  )

  // Do not add any logic between createServerClient and getUser().
  // A simple mistake here causes random logged-out issues on route change.
  // É esta chamada que renova a sessão vencida e valida o token no servidor
  // de auth; o resultado verificado segue para a página pelo cabeçalho interno.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Cabeçalhos da requisição que a página vai ver: os de idioma (sempre
  // definidos ou esvaziados por middleware.ts) e o do usuário, SEMPRE
  // reescrito aqui, inclusive vazio. Nenhum valor que o cliente mande com esses
  // nomes atravessa este ponto. Montados DEPOIS do getUser(): o cookie
  // renovado já está em request.headers.
  const headers = new Headers(request.headers)
  for (const [k, v] of Object.entries(opcoes.headers ?? {})) headers.set(k, v)
  headers.set(HEADER_USUARIO, serializarUsuario(user))

  const supabaseResponse = opcoes.rewriteTo
    ? NextResponse.rewrite(opcoes.rewriteTo, { request: { headers } })
    : NextResponse.next({ request: { headers } })

  cookiesParaResposta.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))

  if (pendingVisitorId) {
    supabaseResponse.cookies.set(VISITOR_COOKIE, pendingVisitorId, visitorCookieOptions())
  }

  return supabaseResponse
}
