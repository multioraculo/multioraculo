import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
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
 * linha a linha nesta auditoria:
 *
 *   /api/ceu-dia        não chama createClient, não lê sessão, não consulta
 *                       entitlement, não escreve em reading_usage, não encosta
 *                       no paywall. O conteúdo é o céu daquele dia, igual para
 *                       todas as pessoas, e varia só por dia e idioma.
 *   /api/tiragem-dia    idem: a carta do dia é a mesma para todo mundo.
 *
 * Nenhuma outra rota entra nesta lista sem a mesma prova. Em particular,
 * `/api/horoscopo` também não lê sessão hoje, e mesmo assim fica de fora da
 * exclusão: ela PODE gastar uma geração paga, e eu prefiro que uma rota com
 * custo continue passando pela mesma porta que todo o resto.
 */
export const config = {
  matcher: [
    // O webhook da Stripe não tem sessão de usuário: fica fora do middleware do Supabase.
    "/((?!_next/static|_next/image|favicon.ico|api/billing/webhook|api/ceu-dia|api/tiragem-dia|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
