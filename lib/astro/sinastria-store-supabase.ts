/**
 * O armazenamento das pessoas guardadas, com o cliente do próprio usuário: é a
 * RLS que garante que ninguém lê o nascimento de outra pessoa, e nada aqui usa
 * a service role.
 */
import type { SupabaseClient } from "@supabase/supabase-js"
import type { LinhaPessoa, PessoasStore } from "./sinastria-servico"

const CAMPOS = "id, nickname, born_on, born_at, tz, tz_status, lat, lon, place_label"

export function pessoasStore(supabase: SupabaseClient): PessoasStore {
  return {
    async contar(ownerId) {
      const { count, error } = await supabase.from("saved_people").select("id", { count: "exact", head: true }).eq("owner_id", ownerId)
      if (error) throw error
      return count ?? 0
    },
    async inserir(ownerId, linha: LinhaPessoa) {
      const { data, error } = await supabase.from("saved_people").insert({ owner_id: ownerId, ...linha }).select("id").single()
      if (error || !data) throw error ?? new Error("sem retorno")
      return { id: data.id as string }
    },
    async obter(ownerId, id) {
      const { data, error } = await supabase.from("saved_people").select(CAMPOS).eq("owner_id", ownerId).eq("id", id).maybeSingle()
      if (error) throw error
      if (!data) return null
      return { ...(data as LinhaPessoa & { id: string }), born_at: data.born_at ? String(data.born_at).slice(0, 5) : null }
    },
    async listar(ownerId) {
      const { data, error } = await supabase
        .from("saved_people")
        .select("id, nickname, place_label, born_on")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as Array<{ id: string; nickname: string; place_label: string; born_on: string }>
    },
    async apagar(ownerId, id) {
      const { data, error } = await supabase.from("saved_people").delete().eq("owner_id", ownerId).eq("id", id).select("id")
      if (error) throw error
      return (data?.length ?? 0) > 0
    },
  }
}
