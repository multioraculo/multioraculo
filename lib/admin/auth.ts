/**
 * Autorização da área administrativa (server only).
 *
 * Quem é admin está em `user_roles` (Supabase), lido com a service role.
 * Nada disto chega ao navegador: páginas e endpoints /admin chamam
 * `currentAdmin()` e negam quando ele devolve null. Não existe e-mail fixo
 * no código; o primeiro admin é definido pela migration.
 */

import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"

export async function isAdminUser(userId: string): Promise<boolean> {
  if (!hasAdminClient()) return false
  const admin = createAdminClient()
  const { data } = await admin.from("user_roles").select("role").eq("user_id", userId).maybeSingle()
  if (data?.role === "admin") return true
  // override com motivo 'admin' cadastrado por e-mail antes da conta existir:
  // get_user_access liga o override e concede o papel no primeiro acesso
  const { data: acc } = await admin.rpc("get_user_access", { p_user_id: userId })
  const row = Array.isArray(acc) ? acc[0] : acc
  return row?.source === "admin"
}

/** Usuário autenticado com papel admin, ou null. */
export async function currentAdmin(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return (await isAdminUser(user.id)) ? user : null
}
