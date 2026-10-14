import type { User } from "@supabase/supabase-js"

/**
 * O usuário verificado viaja do middleware para a página num cabeçalho interno.
 *
 * O PROBLEMA, medido com um servidor de auth simulado: cada navegação de quem
 * está logado fazia DUAS idas ao Supabase Auth, uma no middleware (que renova
 * a sessão e valida o token) e outra na página, só para desenhar o cabeçalho.
 * A segunda validava o mesmo token, na mesma requisição, e não renovava nada:
 * o middleware já tinha escrito os cookies novos na própria requisição antes
 * de a página rodar. Para visitante sem sessão não há ida nenhuma, em nenhum
 * dos dois lugares: a economia é toda de quem está logado.
 *
 * O QUE ISTO FAZ: o middleware serializa aqui o resultado do seu `getUser()`,
 * que É verificado no servidor de auth, e a página lê (lib/auth/usuario-da-
 * requisicao.ts). Nenhuma sessão passa a ser confiada sem verificação: a
 * verificação continua acontecendo, uma vez, no middleware.
 *
 * O QUE NÃO VIAJA: só id, e-mail e os campos de perfil que o cabeçalho
 * mostra. Quem precisa do usuário para consultar o banco continua com o
 * cliente do Supabase, que leva o token; e rotas de API continuam chamando
 * `getUser()` por conta própria.
 *
 * BLINDAGEM, no mesmo molde de x-locale (lib/i18n/rotas.ts): o middleware
 * SEMPRE reescreve este cabeçalho, inclusive vazio, em toda requisição que
 * passa por ele. O que o navegador mandar com esse nome nunca chega à página.
 * As únicas rotas fora do middleware (middleware.ts, `config.matcher`) são
 * arquivos estáticos, metadata e três APIs públicas, e nenhuma delas renderiza
 * página nem lê este cabeçalho.
 *
 * Este módulo roda no edge (middleware) e no Node (páginas): só APIs comuns às
 * duas plataformas, sem `next/headers` e sem `Buffer`.
 */

export const HEADER_USUARIO = "x-usuario"

/** o que o cabeçalho da página precisa saber de quem está logado */
export type UsuarioDaSessao = {
  id: string
  email?: string
  user_metadata: {
    [chave: string]: unknown
    full_name?: string
    name?: string
    avatar_url?: string
    picture?: string
  }
}

const CAMPOS_DE_PERFIL = ["full_name", "name", "avatar_url", "picture"] as const

function paraBase64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto)
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function deBase64Url(valor: string): string {
  const b64 = valor.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (valor.length % 4)) % 4)
  const bin = atob(b64)
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

/** Valor do cabeçalho: vazio para visitante; base64url de um JSON curto para quem está logado. */
export function serializarUsuario(user: User | null | undefined): string {
  if (!user?.id) return ""
  const perfil: UsuarioDaSessao["user_metadata"] = {}
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  for (const campo of CAMPOS_DE_PERFIL) {
    if (typeof meta[campo] === "string") perfil[campo] = meta[campo] as string
  }
  const compacto: UsuarioDaSessao = { id: user.id, user_metadata: perfil }
  if (typeof user.email === "string" && user.email) compacto.email = user.email
  return paraBase64Url(JSON.stringify(compacto))
}

/** Lê o valor do cabeçalho. Qualquer coisa fora do formato esperado vale como visitante. */
export function desserializarUsuario(valor: string | null | undefined): UsuarioDaSessao | null {
  if (!valor) return null
  try {
    const bruto = JSON.parse(deBase64Url(valor)) as unknown
    if (!bruto || typeof bruto !== "object") return null
    const { id, email, user_metadata } = bruto as Record<string, unknown>
    if (typeof id !== "string" || !id) return null
    const perfil: UsuarioDaSessao["user_metadata"] = {}
    if (user_metadata && typeof user_metadata === "object") {
      for (const campo of CAMPOS_DE_PERFIL) {
        const v = (user_metadata as Record<string, unknown>)[campo]
        if (typeof v === "string") perfil[campo] = v
      }
    }
    const usuario: UsuarioDaSessao = { id, user_metadata: perfil }
    if (typeof email === "string" && email) usuario.email = email
    return usuario
  } catch {
    return null
  }
}
