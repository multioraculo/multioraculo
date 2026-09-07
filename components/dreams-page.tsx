"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { fmt } from "@/lib/i18n"

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

export default function DreamsPage({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const router = useRouter()
  const { dict, locale, formatDate } = useI18n()
  const t = dict.dreams
  // bloqueio de cota vindo do servidor (gratuita usada, limite do plano)
  const [blocked, setBlocked] = useState<{ message: string; action: "login" | "plans" | null } | null>(null)

  const [step, setStep] = useState<"input" | "loading" | "result">("input")
  const [dreamText, setDreamText] = useState("")
  const [interpretation, setInterpretation] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [personalNotes, setPersonalNotes] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  // ── Interpretation ──────────────────────────────────────────

  const handleInterpret = async () => {
    if (!dreamText.trim()) return
    setBlocked(null)
    setStep("loading")
    setInterpretation(null)
    setIsStreaming(false)
    setPersonalNotes("")
    setIsSaved(false)
    setTimeout(() => {
      document.getElementById("dream-results")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
    try {
      const res = await fetch("/api/sonhos/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream: dreamText, locale }),
      })

      if (!res.ok) {
        // bloqueios de plano vêm do servidor com um código; o texto é do dicionário
        const j = await res.json().catch(() => ({}))
        if (j?.code === "trial_used") {
          setBlocked({ message: dict.billing.dreamTrialUsed, action: "login" })
          window.dispatchEvent(new CustomEvent("open-login"))
        } else if (j?.code === "limit_reached") {
          const date = j.periodEnd ? formatDate(j.periodEnd, "long") : ""
          setBlocked({
            message: j.plan === "free" ? dict.billing.freeDreamUsed : fmt(dict.billing.dreamLimitReached, { limit: j.limit ?? "", date }),
            action: "plans",
          })
        } else if (j?.code === "billing_unavailable") {
          setBlocked({ message: dict.billing.billingUnavailable, action: null })
        } else {
          throw new Error(t.errorInterpret)
        }
        setStep("input")
        return
      }
      if (!res.body) throw new Error(t.noResponse)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""
      let firstChunk = true

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk

        if (firstChunk && accumulated.trim()) {
          setStep("result")
          setIsStreaming(true)
          firstChunk = false
          setTimeout(() => {
            document.getElementById("dream-results")?.scrollIntoView({ behavior: "smooth" })
          }, 50)
        }

        setInterpretation(accumulated)
      }
    } catch (err: any) {
      console.error("[sonhos/interpret] erro:", err)
      toast.error(err.message ?? t.errorInterpret)
      setStep("input")
    } finally {
      setIsStreaming(false)
    }
  }

  const handleNewDream = () => {
    setDreamText("")
    setInterpretation(null)
    setIsStreaming(false)
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
      if (!res.ok) throw new Error(t.errorSave)
      setIsSaved(true)
      toast.success(t.savedOk)
      router.push("/sonhos-salvos")
    } catch (err: any) {
      toast.error(err.message ?? t.errorSave)
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
        await navigator.share({ title: t.shareTitle, text })
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
    toast.success(dict.common.copied)
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <>
      {/* ── Input screen ──────────────────────────────────────── */}
      {step === "input" && (
        <main
          className="relative z-20 min-h-[85dvh] flex flex-col justify-end pt-6 pb-8 px-4 sm:pl-8 sm:pr-0"
          style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))" }}
        >
          <div className="max-w-lg">
            <h1 className="text-4xl sm:text-5xl tracking-tight font-light text-white mb-2">
              <span className="font-medium italic instrument">{t.titleEmphasis}</span> {t.titleRest}
              <br />
              <span className="font-light tracking-tight text-white">{t.titleLine2}</span>
            </h1>

            <p className="text-base font-light text-white/80 mb-4 leading-relaxed">{t.subtitle}</p>

            <div className="mb-4">
              <p className="text-xs font-light text-white/60 mb-2">
                {t.prompt}
                {!isLoggedIn && <span className="text-white/45"> {t.freeHint}</span>}
              </p>
              <textarea
                value={dreamText}
                onChange={(e) => setDreamText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && dreamText.trim()) {
                    e.preventDefault()
                    handleInterpret()
                  }
                }}
                placeholder={t.placeholder}
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-base resize-none focus:outline-none focus:border-white/40 transition-all duration-200"
              />
            </div>

            {blocked && (
              <div className="mb-4 bg-white/5 backdrop-blur-sm border border-white/15 rounded-xl p-4 space-y-3" role="status">
                <p className="text-white/80 text-sm leading-relaxed">{blocked.message}</p>
                {blocked.action === "plans" && (
                  <Link
                    href="/assinatura"
                    className="inline-block px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white font-light text-sm hover:bg-white/15 hover:border-white/30 transition-all duration-200"
                  >
                    {t.seePlans}
                  </Link>
                )}
                {blocked.action === "login" && (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-login"))}
                    className="inline-block px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white font-light text-sm hover:bg-white/15 hover:border-white/30 transition-all duration-200"
                  >
                    {dict.common.login}
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={handleInterpret}
                disabled={!dreamText.trim()}
                className="group px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-light text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg hover:shadow-white/10 transform disabled:hover:scale-100 disabled:hover:shadow-none flex items-center"
              >
                <span className="group-hover:scale-105 transition-transform duration-200 inline-block group-disabled:scale-100">
                  {t.interpret}
                </span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ── Loading + Result screen ───────────────────────────── */}
      {(step === "loading" || step === "result") && (
        <div id="dream-results" className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-8">

            {/* Loading state */}
            {step === "loading" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="flex items-center gap-3 py-6 text-white/50 text-sm">
                  <Spinner className="w-4 h-4 text-white/40" />
                  <span>{t.interpreting}</span>
                </div>
              </div>
            )}

            {/* Result state */}
            {step === "result" && interpretation && (
              <>
                {/* Dream preview card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <h3 className="text-white/60 text-sm mb-3">{t.yourDream}</h3>
                  <p className="text-white text-base leading-relaxed">{dreamText}</p>
                </div>

                {/* Interpretation card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  {isStreaming && (
                    <div className="flex items-center gap-2 mb-4 text-white/40 text-xs">
                      <Spinner className="w-3 h-3" />
                      <span>{t.interpretingShort}</span>
                    </div>
                  )}
                  <div className="dream-interpretation space-y-0">
                    <ReactMarkdown
                      components={{
                        h2: ({ children }) => (
                          <h2 className="text-white/25 text-[10px] uppercase tracking-widest mt-8 mb-3 first:mt-0 border-t border-white/10 pt-6 [&:first-child]:border-t-0 [&:first-child]:pt-0">
                            {children}
                          </h2>
                        ),
                        p: ({ children, node }) => {
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
                      {t.personalNotes}
                    </p>
                    <textarea
                      value={personalNotes}
                      onChange={(e) => setPersonalNotes(e.target.value)}
                      placeholder={t.notesPlaceholder}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm resize-none focus:outline-none focus:border-white/25 transition-colors duration-200"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col items-center gap-3 pt-6 border-t border-white/10 mt-6">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleSave}
                        disabled={isSaved || saveLoading || !interpretation || isStreaming}
                        title={isStreaming ? t.waitToFinish : isSaved ? dict.common.saved : t.saveToJournal}
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
                          {isSaved ? dict.common.saved : t.saveToJournal}
                        </span>
                      </button>

                      <button
                        onClick={handleShare}
                        title={dict.common.share}
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
                          {dict.common.share}
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
                      {t.anotherDream}
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
