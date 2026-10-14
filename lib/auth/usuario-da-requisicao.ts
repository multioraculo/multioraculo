import { headers } from "next/headers"
import { HEADER_USUARIO, desserializarUsuario, type UsuarioDaSessao } from "./usuario-header"

/**
 * Quem está logado nesta requisição, segundo o `getUser()` que o middleware já
 * fez e verificou. Só em Server Components de PÁGINA, que sempre passam pelo
 * middleware (ver lib/auth/usuario-header.ts).
 *
 * Substitui o par `createClient()` + `auth.getUser()` nas páginas que só
 * precisam do usuário para montar o cabeçalho: mesma resposta, sem a segunda
 * ida ao servidor de autenticação. Página que consulta o banco em nome da
 * pessoa continua criando o cliente do Supabase para a consulta.
 */
export async function usuarioDaRequisicao(): Promise<UsuarioDaSessao | null> {
  const h = await headers()
  return desserializarUsuario(h.get(HEADER_USUARIO))
}
