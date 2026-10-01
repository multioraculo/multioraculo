import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import DiaryList from "@/components/diary-list"
import { createClient } from "@/lib/supabase/server"
import { getI18n } from "@/lib/i18n/server"
import type { JournalEntry } from "@/lib/types"

/**
 * O Diário. Aceita uma ABERTURA vinda da Home: `?abertura=N` escolhe uma frase
 * do repertório e ela chega ao editor como rascunho, já aberto e apagável numa
 * tecla. Nada é gravado por chegar aqui com o parâmetro — o registro só existe
 * quando a pessoa salva, e um convite que criasse entrada sozinho encheria o
 * Diário de coisas que ninguém escreveu.
 */
export default async function DiarioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const { dict } = await getI18n()

  const pedida = (await searchParams).abertura
  const indice = Number(Array.isArray(pedida) ? pedida[0] : pedida)
  const aberturas = dict.home.journalOpenings
  const rascunho = Number.isInteger(indice) && indice >= 0 && indice < aberturas.length ? `${aberturas[indice]} ` : null

  const { data: { user } } = await supabase.auth.getUser()

  let entries: JournalEntry[] = []
  if (user) {
    const { data } = await supabase
      .from("journal_entries")
      .select("id, user_id, title, content, consultation_id, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    entries = (data ?? []) as JournalEntry[]
  }

  return (
    <ShaderBackground tone="grimorio">
      <Header initialUser={user ?? null} />
      <div className="relative z-10 min-h-screen pt-16 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pb-16">
          <div className="py-16">
            <h1 className="text-5xl sm:text-6xl font-light italic instrument text-white mb-4">
              {dict.grimoire.title}
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
              {dict.grimoire.intro}
            </p>
          </div>

          {user ? (
            <DiaryList initialEntries={entries} rascunho={rascunho} />
          ) : (
            <div className="text-center py-20">
              <p className="text-white/40 text-sm mb-4">{dict.grimoire.loginToAccess}</p>
            </div>
          )}
        </div>
      </div>
    </ShaderBackground>
  )
}
