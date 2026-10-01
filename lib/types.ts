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

/**
 * A consulta como a LISTA precisa dela.
 *
 * A lista de leituras salvas mostra pergunta, síntese e data, e nada mais. O
 * tipo largo arrastava `oracle_outputs` e `selected_oracles`, dois jsonb com a
 * saída inteira dos cinco oráculos, em toda linha de toda listagem. Quem abre
 * uma leitura continua recebendo tudo, pela página de detalhe.
 */
export type ConsultationNaLista = Pick<Consultation, "id" | "question" | "synthesis" | "created_at">

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

export type JourneyAnalysis = {
  id: string            // uuid
  user_id: string       // FK → auth.users(id)
  analysis_text: string // JSON string of JourneyData
  dreams_analyzed: number | null
  created_at: string
}

export type JourneyData = {
  timeline: Array<{
    number: number
    title: string
    archetypes: string
    summary: string
  }>
  patterns: string[]
  turningPoint: string
  essence: string
}
