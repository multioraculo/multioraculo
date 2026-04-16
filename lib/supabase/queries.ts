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
