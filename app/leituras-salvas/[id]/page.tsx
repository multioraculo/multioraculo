import { redirect } from "next/navigation"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import DeleteReadingButton from "@/components/delete-reading-button"
import { createClient } from "@/lib/supabase/server"

const ORACLE_ORDER = ["iching", "tarot", "buzios", "lenormand", "runas"] as const
const ORACLE_NAMES: Record<string, string> = {
  iching: "I Ching",
  tarot: "Tarô",
  buzios: "Búzios",
  lenormand: "Lenormand",
  runas: "Runas",
}

// Mirrors OracleResult from the consultation route exactly
type OracleItem = {
  position?: string
  name: string
  meaning?: string
}

type OracleOutput = {
  reading?: string
  method?: string
  draw?: {
    notes?: string
    items?: OracleItem[]
  }
}

export default async function LeituraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/")
  }

  const { data: consultation, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !consultation) {
    redirect("/leituras-salvas")
  }

  const date = new Date(consultation.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const oracleOutputs = consultation.oracle_outputs as Record<string, OracleOutput> | null
  const activeOracles = ORACLE_ORDER.filter((key) => oracleOutputs?.[key]?.reading)

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <a
            href="/leituras-salvas"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors duration-200 mb-10 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Leituras Salvas
          </a>

          <div className="space-y-8">
            {/* Pergunta */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white/60 text-sm">Sua pergunta</h3>
                <span className="text-white/30 text-xs">{date}</span>
              </div>
              <p className="text-white text-base leading-relaxed">{consultation.question}</p>
            </div>

            {/* Síntese — mesma estrutura do card "Sua resposta" no live */}
            {consultation.synthesis && (
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-white text-lg">Sua resposta</h3>
                </div>
                <div className="space-y-4">
                  {consultation.synthesis
                    .split(/\n{2,}/)
                    .map((para: string, i: number) => (
                      <p key={i} className="text-white/80 text-sm leading-relaxed">
                        {para.trim()}
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* Oráculos — mesma estrutura do card de detalhe no live */}
            {activeOracles.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 space-y-6">
                <h3 className="text-white text-lg text-center font-light">Ler por oráculo</h3>

                <div className="space-y-4">
                  {activeOracles.map((key) => {
                    const oracle = oracleOutputs![key]
                    const items: OracleItem[] = oracle.draw?.items ?? []
                    const notes = oracle.draw?.notes
                    const reading = oracle.reading ?? ""

                    return (
                      <div
                        key={key}
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 space-y-5"
                      >
                        {/* Header */}
                        <div>
                          <h4 className="text-white text-base font-light">{ORACLE_NAMES[key]}</h4>
                          {notes && <p className="text-white/45 text-xs mt-1">{notes}</p>}
                        </div>

                        {/* Tiragem — o que saiu */}
                        {items.length > 0 && (
                          <div>
                            <p className="text-white/25 text-[10px] uppercase tracking-widest mb-3">Tiragem</p>
                            <div className="space-y-3">
                              {items.map((item, i) => (
                                <div key={i} className="flex gap-3">
                                  {item.position && (
                                    <span className="text-white/30 text-[11px] shrink-0 w-20 sm:w-28 pt-0.5 leading-tight">
                                      {item.position}
                                    </span>
                                  )}
                                  <div className="min-w-0">
                                    <span className="text-white/85 text-xs font-medium">{item.name}</span>
                                    {item.meaning && (
                                      <p className="text-white/45 text-xs leading-relaxed mt-0.5">
                                        {item.meaning}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Leitura tradicional */}
                        {reading && (
                          <div className={items.length > 0 ? "border-t border-white/10 pt-5" : ""}>
                            {items.length > 0 && (
                              <p className="text-white/25 text-[10px] uppercase tracking-widest mb-3">
                                Leitura tradicional
                              </p>
                            )}
                            <div className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">
                              {reading}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Deletar */}
            <div className="flex justify-end pt-2">
              <DeleteReadingButton id={consultation.id} />
            </div>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
