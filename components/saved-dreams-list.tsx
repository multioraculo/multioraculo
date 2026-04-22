"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import { createClient } from "@/lib/supabase/client"
import type { Dream, JourneyAnalysis, JourneyData } from "@/lib/types"

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      style={{ animation: "oracle-spin 0.8s linear infinite" }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function SavedDreamsList({
  initialDreams,
  userId,
}: {
  initialDreams: Dream[]
  userId: string
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [dreams, setDreams] = useState<Dream[]>(initialDreams)

  // ── Journey state ───────────────────────────────────────────
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null)
  const [journeyLoading, setJourneyLoading] = useState(false)
  const [savedJourney, setSavedJourney] = useState<JourneyAnalysis | null>(null)
  const [journeyDirty, setJourneyDirty] = useState(false)
  const [saveJourneyLoading, setSaveJourneyLoading] = useState(false)

  // ── Dream card state ────────────────────────────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [openMenuId])

  // Load latest saved journey analysis on mount
  useEffect(() => {
    if (dreams.length < 4) return
    const load = async () => {
      try {
        const { data } = await supabase
          .from("journey_analyses")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
        if (data) {
          setSavedJourney(data as JourneyAnalysis)
          try {
            setJourneyData(JSON.parse(data.analysis_text) as JourneyData)
          } catch {
            // old plain-text format — discard
          }
        }
      } catch {
        // silently ignore if table doesn't exist yet
      }
    }
    load()
  }, [dreams.length, userId, supabase])

  // ── Journey handlers ────────────────────────────────────────

  const handleGenerateJourney = async () => {
    setJourneyLoading(true)
    setJourneyData(null)
    setJourneyDirty(false)
    try {
      const res = await fetch("/sonhos/journey", { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro ao gerar análise.")
      setJourneyData(json.journeyData as JourneyData)
      setJourneyDirty(true)
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao gerar análise.")
    } finally {
      setJourneyLoading(false)
    }
  }

  const handleSaveJourney = async () => {
    if (!journeyData || saveJourneyLoading) return
    setSaveJourneyLoading(true)
    try {
      const { data, error } = await supabase
        .from("journey_analyses")
        .insert({
          user_id: userId,
          analysis_text: JSON.stringify(journeyData),
          dreams_analyzed: dreams.length,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      setSavedJourney(data as JourneyAnalysis)
      setJourneyDirty(false)
      toast.success("Análise da jornada salva!")
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar análise.")
    } finally {
      setSaveJourneyLoading(false)
    }
  }

  // ── Dream card handlers ─────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/dreams/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setDreams((prev) => prev.filter((d) => d.id !== id))
      setDeleteConfirmId(null)
      toast.success("Sonho excluído.")
    } catch {
      toast.error("Erro ao excluir sonho.")
    }
  }

  const handleUpdateNotes = async (id: string) => {
    setSavingNotesId(id)
    try {
      const res = await fetch(`/api/dreams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personal_notes: editNotes || null }),
      })
      if (!res.ok) throw new Error()
      setDreams((prev) =>
        prev.map((d) => (d.id === id ? { ...d, personal_notes: editNotes || null } : d))
      )
      setEditingNotesId(null)
      toast.success("Notas atualizadas.")
    } catch {
      toast.error("Erro ao atualizar notas.")
    } finally {
      setSavingNotesId(null)
    }
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 1: SUA JORNADA (apenas se 4+ sonhos)
          ══════════════════════════════════════════════════════ */}
      {dreams.length >= 4 && (
        <section className="mb-16">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-light italic instrument text-white mb-4">
              Sua Jornada
            </h1>
            <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl">
              Leitura da evolução dos seus sonhos, revelando padrões que retornam,
              transformações que se aprofundam e o tema essencial que se desdobra
              ao longo da sua travessia interior.
            </p>
          </div>

          {/* Estado: nunca gerou */}
          {!journeyData && !journeyLoading && (
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleGenerateJourney}
                className="px-8 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-sm text-white/80 hover:text-white transition-all duration-200"
              >
                Gerar Análise
              </button>
              {savedJourney && (
                <p className="text-white/30 text-sm">
                  Última análise: {formatDateShort(savedJourney.created_at)}
                </p>
              )}
            </div>
          )}

          {/* Estado: gerando */}
          {journeyLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Spinner className="w-8 h-8 text-white/40" />
              <p className="text-white/40 text-sm">Analisando sua jornada onírica...</p>
            </div>
          )}

          {/* Estado: análise gerada — grid 2×2 */}
          {journeyData && !journeyLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                {/* Card 1: Linha de Evolução */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <p className="text-white/25 text-[10px] uppercase tracking-widest mb-4">
                    Linha de Evolução
                  </p>
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                    {journeyData.timeline.map((item) => (
                      <div key={item.number} className="border-l border-white/15 pl-4">
                        <p className="text-sm font-medium text-white/85 leading-snug">
                          {item.number}. {item.title}
                        </p>
                        <p className="text-[11px] text-white/35 mt-0.5">{item.archetypes}</p>
                        <p className="text-xs text-white/55 mt-1 leading-relaxed">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Padrões Recorrentes */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <p className="text-white/25 text-[10px] uppercase tracking-widest mb-4">
                    Padrões Recorrentes
                  </p>
                  <ul className="space-y-3">
                    {journeyData.patterns.map((pattern, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/70 leading-relaxed">
                        <span className="text-white/25 shrink-0 mt-0.5">—</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 3: Ponto de Virada */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <p className="text-white/25 text-[10px] uppercase tracking-widest mb-4">
                    Ponto de Virada
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">{journeyData.turningPoint}</p>
                </div>

                {/* Card 4: Essência da Fase Atual */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <p className="text-white/25 text-[10px] uppercase tracking-widest mb-4">
                    Essência da Fase Atual
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">{journeyData.essence}</p>
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {journeyDirty ? (
                  <button
                    onClick={handleSaveJourney}
                    disabled={saveJourneyLoading}
                    className="px-6 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-sm text-white/80 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                  >
                    {saveJourneyLoading
                      ? <><Spinner className="w-3 h-3" /> Salvando...</>
                      : "Salvar Análise"}
                  </button>
                ) : savedJourney ? (
                  <p className="text-white/30 text-sm">
                    ✓ Análise salva em {formatDateShort(savedJourney.created_at)}
                  </p>
                ) : null}
                <button
                  onClick={handleGenerateJourney}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-white/45 hover:text-white/70 transition-all duration-200"
                >
                  Atualizar Análise
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Divider */}
      {dreams.length >= 4 && (
        <div className="border-t border-white/10 mb-12" />
      )}

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 2: SONHOS SALVOS
          ══════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className={[
            "font-light italic instrument text-white",
            dreams.length >= 4 ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl",
          ].join(" ")}>
            Sonhos Salvos
          </h2>
          <button
            onClick={() => router.push("/sonhos")}
            className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/15 text-sm transition-all duration-200"
          >
            Novo Sonho
          </button>
        </div>

        {/* Empty state */}
        {dreams.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm mb-4">Nenhum sonho salvo ainda.</p>
            <button
              onClick={() => router.push("/sonhos")}
              className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/15 text-sm transition-all duration-200"
            >
              Interpretar primeiro sonho
            </button>
          </div>
        )}

        {/* Dreams list */}
        {dreams.length > 0 && (
          <div className="space-y-3" ref={menuRef}>
            {dreams.map((dream) => (
              <div key={dream.id}>
                {deleteConfirmId === dream.id ? (
                  <div className="bg-white/5 backdrop-blur-sm border border-red-400/30 rounded-2xl p-6 flex items-center justify-between gap-4">
                    <p className="text-white/80 text-sm">Deseja excluir este sonho?</p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleDelete(dream.id)}
                        className="px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-400/40 text-red-300 hover:bg-red-500/30 text-sm transition-colors"
                      >
                        Excluir
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-sm transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200">
                    {/* Card header */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/35 text-xs">{formatDate(dream.created_at)}</span>

                      <div className="relative shrink-0">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === dream.id ? null : dream.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
                        >
                          <svg
                            className="w-4 h-4 transition-transform duration-200"
                            style={{ transform: openMenuId === dream.id ? "rotate(90deg)" : "none" }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {openMenuId === dream.id && (
                          <div className="absolute right-0 top-9 z-50 w-48 backdrop-blur-md bg-black/40 border border-white/20 rounded-xl overflow-hidden shadow-xl p-1">
                            <button
                              onClick={() => {
                                setExpandedId(expandedId === dream.id ? null : dream.id)
                                setOpenMenuId(null)
                              }}
                              className="w-full text-left px-3 py-2 text-white/90 hover:bg-white/5 rounded-lg transition-colors text-sm"
                            >
                              Ver interpretação
                            </button>
                            <button
                              onClick={() => {
                                setEditingNotesId(dream.id)
                                setEditNotes(dream.personal_notes ?? "")
                                setExpandedId(dream.id)
                                setOpenMenuId(null)
                              }}
                              className="w-full text-left px-3 py-2 text-white/90 hover:bg-white/5 rounded-lg transition-colors text-sm"
                            >
                              Editar notas pessoais
                            </button>
                            <button
                              onClick={() => { setDeleteConfirmId(dream.id); setOpenMenuId(null) }}
                              className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors text-sm"
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description preview */}
                    <p className="text-white/75 text-sm leading-relaxed">
                      {expandedId === dream.id
                        ? dream.dream_description
                        : dream.dream_description.slice(0, 120) +
                          (dream.dream_description.length > 120 ? "…" : "")}
                    </p>

                    {/* Expanded: interpretation + notes */}
                    {expandedId === dream.id && (
                      <div className="space-y-5 border-t border-white/10 pt-4">
                        {dream.interpretation && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10 dream-interpretation space-y-0">
                            <ReactMarkdown
                              components={{
                                h2: ({ children }) => (
                                  <h2 className="text-white/25 text-[10px] uppercase tracking-widest mt-6 mb-2 first:mt-0 border-t border-white/10 pt-4 [&:first-child]:border-t-0 [&:first-child]:pt-0">
                                    {children}
                                  </h2>
                                ),
                                p: ({ children, node }) => {
                                  const isTitle =
                                    node?.children?.length === 1 &&
                                    (node.children[0] as any)?.tagName === "strong"
                                  return isTitle ? (
                                    <p className="text-white/85 text-sm font-medium mt-4 mb-1.5 first:mt-0">
                                      {children}
                                    </p>
                                  ) : (
                                    <p className="text-white/65 text-sm leading-relaxed mb-2.5">{children}</p>
                                  )
                                },
                                strong: ({ children }) => (
                                  <strong className="text-white/85 font-medium">{children}</strong>
                                ),
                                ul: ({ children }) => (
                                  <ul className="space-y-1 mb-2.5 pl-1">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="space-y-2.5 mb-2.5 pl-1">{children}</ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-white/65 text-sm leading-relaxed flex gap-2">
                                    <span className="text-white/25 shrink-0 mt-0.5">—</span>
                                    <span>{children}</span>
                                  </li>
                                ),
                                hr: () => null,
                              }}
                            >
                              {dream.interpretation}
                            </ReactMarkdown>
                          </div>
                        )}

                        {/* Notes editing */}
                        {editingNotesId === dream.id ? (
                          <div className="space-y-3">
                            <p className="text-white/25 text-[10px] uppercase tracking-widest">Notas pessoais</p>
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={4}
                              autoFocus
                              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm resize-none focus:outline-none focus:border-white/25 transition-colors duration-200"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="px-4 py-1.5 rounded-full text-white/50 hover:text-white/80 text-sm transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleUpdateNotes(dream.id)}
                                disabled={savingNotesId === dream.id}
                                className={[
                                  "px-5 py-1.5 rounded-full border text-sm transition-all duration-200 flex items-center gap-2",
                                  savingNotesId === dream.id
                                    ? "bg-white/10 border-white/20 text-white/60 cursor-wait"
                                    : "bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/15",
                                ].join(" ")}
                              >
                                {savingNotesId === dream.id ? <><Spinner /> Salvando…</> : "Salvar"}
                              </button>
                            </div>
                          </div>
                        ) : dream.personal_notes ? (
                          <div className="space-y-2">
                            <p className="text-white/25 text-[10px] uppercase tracking-widest">Notas pessoais</p>
                            <p className="text-white/55 text-sm leading-relaxed">{dream.personal_notes}</p>
                          </div>
                        ) : null}

                        <button
                          onClick={() => { setExpandedId(null); setEditingNotesId(null) }}
                          className="text-white/30 hover:text-white/50 text-xs transition-colors"
                        >
                          Recolher
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
