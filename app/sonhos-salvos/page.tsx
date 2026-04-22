import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import SavedDreamsList from "@/components/saved-dreams-list"
import { createClient } from "@/lib/supabase/server"
import type { Dream } from "@/lib/types"

export default async function SonhosSalvosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let dreams: Dream[] = []
  if (user) {
    const { data } = await supabase
      .from("dreams")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    dreams = (data ?? []) as Dream[]
  }

  return (
    <ShaderBackground>
      <Header initialUser={user ?? null} />
      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          {user ? (
            <SavedDreamsList initialDreams={dreams} userId={user.id} />
          ) : (
            <div className="text-center py-20">
              <p className="text-white/40 text-sm mb-4">Faça login para ver seus sonhos salvos.</p>
            </div>
          )}
        </div>
      </div>
    </ShaderBackground>
  )
}
