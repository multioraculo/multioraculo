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
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pb-16">
          {/* Hero — alinhado à esquerda, consistente com /sonhos e home */}
          <div className="py-16">
            <h1 className="text-5xl sm:text-6xl font-light italic instrument text-white mb-4">
              Grimório
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
              Seu espaço sagrado para registrar o que a vida revela.
              Cada registro guarda um fragmento da sua travessia interior.
              Escreva sobre o que sentiu, compreendeu ou viveu.
            </p>
          </div>

          <DiaryList initialEntries={entries} />
        </div>
      </div>
    </ShaderBackground>
  )
}
