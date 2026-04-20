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
      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <DiaryList initialEntries={entries} />
        </div>
      </div>
    </ShaderBackground>
  )
}
