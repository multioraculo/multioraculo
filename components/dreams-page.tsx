"use client"

import { useState, useRef, useEffect, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import type { Dream } from "@/lib/types"

const DreamLoader = lazy(() => import("@/components/dream-loader"))

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

export default function DreamsPage({ initialDreams }: { initialDreams: Dream[] }) {
  const router = useRouter()
  const [dreams, setDreams] = useState<Dream[]>(initialDreams)

  // Main flow state — mirrors hero-content.tsx showResults pattern
  const [step, setStep] = useState<"input" | "loading" | "result">("input")
  const [dreamText, setDreamText] = useState("")
  const [interpretation, setInterpretation] = useState<string | null>(null)
  const [personalNotes, setPersonalNotes] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  // History card states
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Journey
  const [journeyAnalysis, setJourneyAnalysis] = useState<string | null>(null)
  const [journeyLoading, setJourneyLoading] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [openMenuId])

  // ── Interpretation ──────────────────────────────────────────

  const handleInterpret = async () => {
    if (!dreamText.trim()) return
    setStep("loading")
    setTimeout(() => {
      document.getElementById("dream-results")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
    try {
      const res = await fetch("/api/dreams/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream: dreamText }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setInterpretation(json.interpretation)
      setPersonalNotes("")
      setIsSaved(false)
      setStep("result")
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao interpretar sonho.")
      setStep("input")
    }
  }

  const handleNewDream = () => {
    setDreamText("")
    setInterpretation(null)
    setPersonalNotes("")
    setIsSaved(false)
    setStep("input")
    setTimeout(() => {
      document.querySelector<HTMLTextAreaElement>("textarea")?.focus()
    }, 50)
  }

  // ── Save ────────────────────────────────────────────────────

  const handleSave = async () => {
    if (isSaved || saveLoading || !dreamText.trim() || !interpretation) return
    setSaveLoading(true)
    try {
      const res = await fetch("/api/dreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dream_description: dreamText,
          interpretation,
          personal_notes: personalNotes.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setIsSaved(true)
      toast.success("Sonho salvo com sucesso!")
      router.push("/sonhos-salvos")
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar sonho.")
    } finally {
      setSaveLoading(false)
    }
  }

  // ── Share ───────────────────────────────────────────────────

  const handleShare = async () => {
    const text = interpretation
      ? `"${dreamText}"\n\n${interpretation}`
      : dreamText

    if (navigator.share) {
      try {
        await navigator.share({ title: "Diário de Sonhos", text })
        return
      } catch (err: any) {
        if (err?.name === "AbortError") return
      }
    }

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement("textarea")
      el.value = text
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    toast.success("Copiado para a área de transferência.")
  }

  // ── History card actions ────────────────────────────────────

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

  const handleGenerateJourney = async () => {
    setJourneyLoading(true)
    try {
      const res = await fetch("/api/dreams/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreams }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setJourneyAnalysis(json.analysis)
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao gerar análise.")
    } finally {
      setJourneyLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <>
      {/* ── Input screen ──────────────────────────────────────── */}
      {step === "input" && (
        <>
          <main
            className="relative z-20 min-h-[85dvh] flex flex-col justify-end pt-6 pb-8 px-4 sm:pl-8 sm:pr-0"
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))" }}
          >
            <div className="max-w-lg">
              <h1 className="text-4xl sm:text-5xl tracking-tight font-light text-white mb-2">
                <span className="font-medium italic instrument">O inconsciente</span> fala
                <br />
                <span className="font-light tracking-tight text-white">enquanto você dorme.</span>
              </h1>

              <p className="text-base font-light text-white/80 mb-4 leading-relaxed">
                Descreva seu sonho e revele os símbolos que a psique está comunicando.
              </p>

              <div className="mb-4">
                <p className="text-xs font-light text-white/60 mb-2">Descreva seu sonho com os detalhes que lembrar.</p>
                <textarea
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && dreamText.trim()) {
                      e.preventDefault()
                      handleInterpret()
                    }
                  }}
                  placeholder="Descreva seu sonho..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-base resize-none focus:outline-none focus:border-white/40 transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleInterpret}
                  disabled={!dreamText.trim()}
                  className="group px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-light text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg hover:shadow-white/10 transform disabled:hover:scale-100 disabled:hover:shadow-none flex items-center"
                >
                  <span className="group-hover:scale-105 transition-transform duration-200 inline-block group-disabled:scale-100">
                    Interpretar Símbolos
                  </span>
                </button>
              </div>
            </div>
          </main>

          {/* History section — below input when there are saved dreams */}
          {dreams.length > 0 && (
            <div className="relative z-10">
              <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-16 space-y-6">

                {/* Sua Jornada */}
                {dreams.length >= 3 && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-white text-base font-light">Sua Jornada</h2>
                        <p className="text-white/35 text-xs mt-0.5">
                          {journeyAnalysis ? "Análise dos seus" : "Baseada nos seus"} {dreams.length} sonhos
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateJourney}
                        disabled={journeyLoading}
                        className={[
                          "shrink-0 px-4 py-1.5 rounded-full border text-xs transition-all duration-200 flex items-center gap-1.5",
                          journeyLoading
                            ? "bg-white/5 border-white/10 text-white/40 cursor-wait"
                            : journeyAnalysis
                            ? "bg-white/5 border-white/10 text-white/50 hover:text-white/70 hover:bg-white/10"
                            : "bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/15",
                        ].join(" ")}
                      >
                        {journeyLoading ? (
                          <><Spinner className="w-3 h-3" /> Analisando...</>
                        ) : journeyAnalysis ? (
                          "Atualizar Análise"
                        ) : (
                          "Gerar Análise"
                        )}
                      </button>
                    </div>

                    {!journeyAnalysis && !journeyLoading && (
                      <p className="text-white/30 text-sm">
                        Clique em "Gerar Análise" para ver os padrões e temas recorrentes nos seus sonhos.
                      </p>
                    )}

                    {journeyAnalysis && (
                      <div className="border-t border-white/10 pt-4 space-y-3">
                        {journeyAnalysis.split(/\n{2,}/).map((para, i) => (
                          <p key={i} className="text-white/70 text-sm leading-relaxed">{para.trim()}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Dreams list */}
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
                                <div className="absolute right-0 top-9 z-50 w-44 backdrop-blur-md bg-black/40 border border-white/20 rounded-xl overflow-hidden shadow-xl p-1">
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
                              : dream.dream_description.slice(0, 100) +
                                (dream.dream_description.length > 100 ? "…" : "")}
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
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Loading + Result screen ───────────────────────────── */}
      {(step === "loading" || step === "result") && (
        <div id="dream-results" className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-8">

            {/* Loading state */}
            {step === "loading" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <Suspense
                  fallback={
                    <div className="flex justify-center py-10">
                      <Spinner className="w-7 h-7 text-white/40" />
                    </div>
                  }
                >
                  <DreamLoader />
                </Suspense>
              </div>
            )}

            {/* Result state */}
            {step === "result" && interpretation && (
              <>
                {/* Dream preview card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <h3 className="text-white/60 text-sm mb-3">Seu sonho</h3>
                  <p className="text-white text-base leading-relaxed">{dreamText}</p>
                </div>

                {/* Interpretation card — rich markdown rendering */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <div className="dream-interpretation space-y-0">
                    <ReactMarkdown
                      components={{
                        h2: ({ children }) => (
                          <h2 className="text-white/25 text-[10px] uppercase tracking-widest mt-8 mb-3 first:mt-0 border-t border-white/10 pt-6 [&:first-child]:border-t-0 [&:first-child]:pt-0">
                            {children}
                          </h2>
                        ),
                        p: ({ children, node }) => {
                          // Bold-only paragraph = symbol title (e.g. **1. Symbol name**)
                          const isTitle =
                            node?.children?.length === 1 &&
                            (node.children[0] as any)?.tagName === "strong"
                          return isTitle ? (
                            <p className="text-white/90 text-sm font-medium mt-5 mb-2 first:mt-0">
                              {children}
                            </p>
                          ) : (
                            <p className="text-white/75 text-sm leading-relaxed mb-3">{children}</p>
                          )
                        },
                        strong: ({ children }) => (
                          <strong className="text-white/90 font-medium">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="space-y-1.5 mb-3 pl-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="space-y-3 mb-3 pl-1">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-white/75 text-sm leading-relaxed flex gap-2">
                            <span className="text-white/30 shrink-0 mt-0.5">—</span>
                            <span>{children}</span>
                          </li>
                        ),
                        hr: () => null,
                      }}
                    >
                      {interpretation}
                    </ReactMarkdown>
                  </div>

                  {/* Personal notes */}
                  <div className="mt-6">
                    <p className="text-white/25 text-[10px] uppercase tracking-widest mb-2">
                      Notas pessoais
                    </p>
                    <textarea
                      value={personalNotes}
                      onChange={(e) => setPersonalNotes(e.target.value)}
                      placeholder="Adicionar suas reflexões..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm resize-none focus:outline-none focus:border-white/25 transition-colors duration-200"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col items-center gap-3 pt-6 border-t border-white/10 mt-6">
                    <div className="flex justify-center gap-4">
                      {/* Salvar no Diário */}
                      <button
                        onClick={handleSave}
                        disabled={isSaved || saveLoading || !interpretation}
                        title={isSaved ? "Salvo" : "Salvar no Diário"}
                        className="group flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 group-hover:text-white group-hover:bg-white/15 transition-all duration-200 group-hover:scale-105 transform group-disabled:hover:scale-100 flex items-center justify-center">
                          {saveLoading ? (
                            <Spinner />
                          ) : (
                            <svg
                              className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                              fill={isSaved ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-200">
                          {isSaved ? "Salvo" : "Salvar no Diário"}
                        </span>
                      </button>

                      {/* Encaminhar */}
                      <button
                        onClick={handleShare}
                        title="Encaminhar"
                        className="group flex flex-col items-center gap-1"
                      >
                        <span className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 group-hover:text-white group-hover:bg-white/15 transition-all duration-200 group-hover:scale-105 transform flex items-center justify-center">
                          <svg
                            className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                            />
                          </svg>
                        </span>
                        <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-200">
                          Encaminhar
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interpretar outro sonho */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleNewDream}
                    className="group px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-light text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30 cursor-pointer hover:scale-105 transform flex items-center"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200 inline-block">
                      Interpretar outro sonho
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
