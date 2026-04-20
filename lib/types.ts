// Database row types — mirrors the real Supabase schema exactly

export type Profile = {
  id: string            // uuid, FK → auth.users(id)
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export type Consultation = {
  id: string            // uuid
  user_id: string       // FK → auth.users(id)
  question: string
  selected_oracles: Record<string, unknown> | null   // jsonb
  synthesis: string | null
  oracle_outputs: Record<string, unknown> | null     // jsonb
  is_saved: boolean
  user_notes: string | null
  created_at: string
}

export type JournalEntry = {
  id: string            // uuid
  user_id: string       // FK → auth.users(id)
  title: string | null
  content: string
  consultation_id: string | null  // nullable FK → consultations(id)
  created_at: string
  updated_at: string
}

export type DreamEntry = {
  id: string            // uuid
  user_id: string       // FK → auth.users(id)
  dream_text: string
  interpretation: string | null
  is_saved: boolean
  created_at: string
}

export type Dream = {
  id: string            // uuid
  user_id: string       // FK → auth.users(id)
  dream_description: string
  interpretation: string | null
  personal_notes: string | null
  created_at: string
  updated_at: string
}
