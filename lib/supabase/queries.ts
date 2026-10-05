// Minimal Supabase query helpers.
// All functions accept a supabase client so they work from both
// Server Components (server client) and client components (browser client).

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Profile, Consultation, DreamEntry } from "@/lib/types"

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  return { profile: data as Profile | null, error }
}

export async function upsertProfile(
  supabase: SupabaseClient,
  profile: Partial<Profile> & { id: string }
) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single()

  return { profile: data as Profile | null, error }
}

/**
 * Garante o profile de quem entrou (senha ou Google), sem sobrescrever nada:
 * cria se não existir; se existir, só preenche full_name/avatar_url que
 * estejam vazios. O metadata do provedor é valor inicial, nunca fonte
 * permanente. Idempotente (vários SIGNED_IN seguidos não duplicam nem
 * apagam edições).
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  input: { id: string; full_name?: string | null; avatar_url?: string | null }
) {
  const clean = (v?: string | null) => (typeof v === "string" && v.trim() ? v.trim() : null)
  const full_name = clean(input.full_name)
  const avatar_url = clean(input.avatar_url)

  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", input.id)
    .maybeSingle()
  if (readError) return { error: readError }

  if (!existing) {
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: input.id, full_name, avatar_url }, { onConflict: "id", ignoreDuplicates: true })
    return { error }
  }

  const patch: { full_name?: string; avatar_url?: string } = {}
  if (!clean(existing.full_name) && full_name) patch.full_name = full_name
  if (!clean(existing.avatar_url) && avatar_url) patch.avatar_url = avatar_url
  if (!Object.keys(patch).length) return { error: null }

  const { error } = await supabase.from("profiles").update(patch).eq("id", input.id)
  return { error }
}

// ─── Consultations ────────────────────────────────────────────────────────────

export async function getConsultations(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { consultations: (data ?? []) as Consultation[], error }
}

export async function saveConsultation(
  supabase: SupabaseClient,
  input: {
    user_id: string
    question: string
    selected_oracles: Record<string, unknown> | null
    synthesis: string | null
    oracle_outputs: Record<string, unknown> | null
    is_saved?: boolean
  }
) {
  const { data, error } = await supabase
    .from("consultations")
    .insert({
      user_id: input.user_id,
      question: input.question,
      selected_oracles: input.selected_oracles,
      synthesis: input.synthesis,
      oracle_outputs: input.oracle_outputs,
      is_saved: input.is_saved ?? true,
    })
    .select()
    .single()

  return { data: data as Consultation | null, error }
}

// ─── Dream Entries ────────────────────────────────────────────────────────────

export async function getDreamEntries(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("dream_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { dreamEntries: (data ?? []) as DreamEntry[], error }
}

export async function saveDreamEntry(
  supabase: SupabaseClient,
  entry: Omit<DreamEntry, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("dream_entries")
    .insert(entry)
    .select()
    .single()

  return { dreamEntry: data as DreamEntry | null, error }
}
