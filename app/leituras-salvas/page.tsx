import { redirect } from "next/navigation"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import { createClient } from "@/lib/supabase/server"
import type { Consultation } from "@/lib/types"

export default async function LeiturasSalvasPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/")
  }

  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_saved", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao carregar leituras salvas:", error)
  }

  const consultations = (data ?? []) as Consultation[]

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-white mb-6">Leituras Salvas</h1>
          </div>

          {consultations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <h3 className="text-white text-lg mb-2">Ainda não há leituras salvas.</h3>
              <p className="text-white/60 text-sm mb-6">Faça uma pergunta e salve sua primeira leitura.</p>
              <a
                href="/"
                className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-light text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:scale-105 inline-block"
              >
                Fazer uma pergunta agora
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map((c) => (
                <a
                  key={c.id}
                  href={`/leituras-salvas/${c.id}`}
                  className="block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/8 hover:border-white/20 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-white text-sm font-medium leading-relaxed group-hover:text-white/90">
                      {c.question}
                    </p>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-white/40 text-xs whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <svg
                        className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  {c.synthesis && (
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{c.synthesis}</p>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </ShaderBackground>
  )
}
