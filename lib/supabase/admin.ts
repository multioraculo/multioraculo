import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Cliente com a service role: ignora RLS. SÓ pode ser usado em código de
 * servidor (rotas de API, webhooks, Server Components). Nunca importe isto em
 * um componente cliente.
 */
export function hasAdminClient(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL)
}

let cached: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL não configuradas")
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return cached
}
