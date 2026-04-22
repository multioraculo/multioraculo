import { redirect } from "next/navigation"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import DiaryList from "@/components/diary-list"
import { createClient } from "@/lib/supabase/server"
import type { JournalEntry } from "@/lib/types"

export default async function DiarioPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect("/")

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) console.error("Erro ao carregar diário:", error)

  const entries = (data ?? []) as JournalEntry[]

  return (
    <ShaderBackground>
      <Header initialUser={user} />
      <div className="relative z-10 min-h-screen pt-16 pb-16">
        {/* Hero */}
        <div className="text-center py-16 px-4 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-light italic instrument text-white mb-6">
            Grimório
          </h1>
          <p className="text-lg sm:text-xl text-white/70 leading-relaxed">
            Seu espaço sagrado para registrar a vida como ela se desenrola.
            Aqui, o cotidiano encontra o eterno, e cada dia se torna página
            de um livro maior. Escreva livremente — sobre o que sentiu,
            descobriu, sonhou acordado ou simplesmente viveu.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-8 pb-16">
          <DiaryList initialEntries={entries} />
        </div>
      </div>
    </ShaderBackground>
  )
}
