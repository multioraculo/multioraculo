"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import PrayerLoader from "@/components/prayer-loader"


const placeholders = [
  "Onde estou confundindo desejo com destino?",
  "O que a vida já colocou diante de mim que ainda não vi?",
  "Qual parte de mim precisa morrer para que algo maior possa nascer?",
  "Se eu não fosse guiado pelo medo, qual seria o meu gesto agora?",
  "O que é verdadeiro aqui e o que é apenas ruído da mente?",
  "Qual é a lição que o tempo já está tentando me ensinar, mas eu insisto em ignorar?",
  "Que corrente invisível está movendo meu destino neste instante?",
  "Onde estou tentando controlar, quando deveria apenas permitir?",
  "Qual é o fio mais fino, porém mais forte, que pode me guiar neste momento?",
  "O que estou chamando de obstáculo, mas que na verdade é uma iniciação?",
  "Que oportunidade já está madura, mas espera apenas a minha coragem?",
  "O que realmente significa prosperidade para mim agora?",
  "Se a vida me desse apenas um gesto hoje, qual seria o gesto correto?",
]

type HeroContentProps = {
  initialUser: User | null
}

export default function HeroContent({ initialUser }: HeroContentProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [question, setQuestion] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activeOracle, setActiveOracle] = useState<number | null>(null)
  const [synthesis, setSynthesis] = useState<string | null>(null)
  const [oracles, setOracles] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prayerDone, setPrayerDone] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  // Sync when the server re-renders the page after an auth change (triggered
  // by Header's router.refresh()). No onAuthStateChange here — only Header
  // subscribes, to avoid concurrent lock acquisitions on the same client.
  useEffect(() => {
    setCurrentUser(initialUser)
  }, [initialUser])

  useEffect(() => {
    if (!isFocused && !isTyping && question === "") {
      intervalRef.current = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
      }, 5000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isFocused, isTyping, question])

  const handleSubmit = async () => {
    if (!question.trim()) return
    setIsLoading(true)
    setPrayerDone(false)
    setSynthesis(null)
    setOracles(null)
    setShowResults(true)
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
    try {
      const res = await fetch("/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ""

      // Parse newline-delimited JSON stream from the route
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split("\n")
        buf = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)

            if (event.type === "oracles") {
              // 5 parallel oracle calls finished — release the prayer timer
              setOracles(event.oracles ?? null)
              setIsLoading(false)
            } else if (event.type === "delta") {
              // Synthesis text streaming in
              setSynthesis((prev) => (prev ?? "") + event.text)
            } else if (event.type === "complete") {
              // Safety-override shortcut (no oracle data)
              setSynthesis(event.synthesis ?? null)
              setOracles(event.oracles ?? null)
              setIsLoading(false)
            } else if (event.type === "error") {
              console.error("Oracle stream error:", event.message)
              setIsLoading(false)
            }
          } catch {
            // malformed line — skip
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewQuestion = () => {
    setQuestion("")
    setShowResults(false)
    setActiveOracle(null)
    setIsTyping(false)
    setSynthesis(null)
    setOracles(null)
    setIsSaved(false)
    document.querySelector("textarea")?.focus()
  }

  const handleSave = async () => {
    if (isSaved || saveLoading) return
    if (!question || !synthesis) {
      setSaveMessage("Não há leitura pronta para salvar.")
      return
    }

    setSaveLoading(true)

    try {
      const res = await fetch("/api/save-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, synthesis, oracle_outputs: oracles }),
      })

      const json = await res.json()

      if (res.status === 401) {
        toast.error("Faça login para salvar.")
      } else if (!res.ok) {
        toast.error(json.error ?? "Não foi possível salvar a leitura.")
      } else {
        setIsSaved(true)
        toast.success("Leitura salva!")
      }
    } catch {
      toast.error("Não foi possível salvar a leitura.")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleShare = async () => {
    const text = synthesis ? `"${question}"\n\n${synthesis}` : question

    // 1. Try Web Share API (mobile + modern desktop)
    if (navigator.share) {
      try {
        await navigator.share({ title: "Multioráculo", text })
        return // share sheet opened — done
      } catch (err: any) {
        if (err?.name === "AbortError") return // user dismissed — do nothing
        // Any other error: fall through to clipboard
      }
    }

    // 2. Clipboard API fallback
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // 3. Last resort: execCommand (older browsers)
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

  const OracleIcon = useMemo(
    () =>
      ({ index, name, tooltip }: { index: number; name: string; tooltip: string }) => {
        const isActive = activeOracle === index

        const iconDesigns = [
          // I Ching - Six horizontal capsules
          <div key="iching" className="relative w-full h-full flex flex-col justify-center items-center gap-0.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-8 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full" />
            ))}
          </div>,

          // Tarô - Arc with eight-pointed star
          <div key="taro" className="relative w-full h-full flex justify-center items-center">
            <div className="w-10 h-6 border-2 border-purple-400 rounded-t-full"></div>
            <div className="absolute w-3 h-3 text-purple-400">✦</div>
          </div>,

          // Búzios - Three cowrie shell outlines (oval + central slit)
          <div key="buzios" className="relative w-full h-full flex justify-center items-center">
            <svg width="30" height="22" viewBox="0 0 30 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="5" cy="11" rx="3.5" ry="7" stroke="#c084fc" strokeWidth="1.25" />
              <line x1="1.5" y1="11" x2="8.5" y2="11" stroke="#c084fc" strokeWidth="1" strokeLinecap="round" />
              <ellipse cx="15" cy="11" rx="3.5" ry="7" stroke="#a78bfa" strokeWidth="1.25" />
              <line x1="11.5" y1="11" x2="18.5" y2="11" stroke="#a78bfa" strokeWidth="1" strokeLinecap="round" />
              <ellipse cx="25" cy="11" rx="3.5" ry="7" stroke="#818cf8" strokeWidth="1.25" />
              <line x1="21.5" y1="11" x2="28.5" y2="11" stroke="#818cf8" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>,

          // Lenormand - Rounded portal
          <div key="lenormand" className="relative w-full h-full flex justify-center items-center">
            <div
              className="w-8 h-8 rounded-full border-2 border-teal-400"
              style={{
                background: "radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%)",
              }}
            ></div>
          </div>,

          // Runas - Circular ring with angular glyph
          <div key="runas" className="relative w-full h-full flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-400 flex justify-center items-center">
              <div className="text-indigo-400 text-xs font-bold">ᚱ</div>
            </div>
          </div>,
        ]

        return (
          <div className="flex flex-col items-center gap-1.5">
            <button
              className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl transition-all duration-200 ${
                isActive
                  ? "scale-105 shadow-lg shadow-purple-500/20 bg-white/10"
                  : "opacity-90 hover:scale-102 hover:shadow-md hover:shadow-purple-500/10 bg-white/5"
              }`}
              style={{
                backdropFilter: "blur(10px)",
                border: isActive ? "1px solid rgba(139,69,193,0.4)" : "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={() => setActiveOracle(activeOracle === index ? null : index)}
              title={tooltip}
              aria-label={tooltip}
            >
              {iconDesigns[index]}
              {isActive && <div className="absolute inset-0 rounded-xl border border-purple-400/50 animate-pulse"></div>}
            </button>
            <span className="text-white/90 text-base sm:text-base font-normal tracking-normal w-24 sm:w-28 text-center">{name}</span>
          </div>
        )
      },
    [activeOracle],
  )

  return (
    <>
      {!showResults && (
        <main className="relative z-20 min-h-[85dvh] flex flex-col justify-end pt-6 pb-8 px-4 sm:pl-8 sm:pr-0" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))" }}>
          <div className="max-w-lg">
            <div
              className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm mb-1 relative"
              style={{
                filter: "url(#glass-effect)",
              }}
            >
              <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
              <span className="text-white/90 text-xs font-light relative z-10">Síntese Multioráculo</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-1">
              <span className="font-medium italic instrument">A singularidade</span> te trouxe
              <br />
              <span className="font-light tracking-tight text-white">até aqui.</span>
            </h1>

            <p className="text-base font-light text-white/80 mb-3 leading-relaxed">
              A mesma pergunta, vista por vários ângulos. Tarô, I Ching, Runas, Búzios e Cartas Lenormand. Cada oráculo
              revela uma parte do mapa. Juntos, eles mostram o caminho inteiro.
            </p>

            <div className="mb-4">
              <p className="text-xs font-light text-white/60 mb-2">Está pronta para começar? Escreva sua pergunta.</p>

              <textarea
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value)
                  setIsTyping(e.target.value.length > 0)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (question.trim()) handleSubmit()
                  }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholders[currentPlaceholder]}
                className="w-full h-24 px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-base resize-none focus:outline-none focus:border-white/40 transition-all duration-200"
                style={{ filter: "url(#glass-effect)" }}
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleSubmit}
                disabled={!question.trim()}
                className="group px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-light text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg hover:shadow-white/10 transform disabled:hover:scale-100 disabled:hover:shadow-none flex items-center"
              >
                <span className="group-hover:scale-105 transition-transform duration-200 inline-block group-disabled:scale-100">
                  Receber minha resposta
                </span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Results Section - Only appears after consultation */}
      {showResults && (
        <div id="results-section" className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-8">
            {/* Question Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-white/60 text-sm mb-3">Sua pergunta</h3>
              <p className="text-white text-base leading-relaxed">{question}</p>
            </div>

            {/* Synthesis Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                {isLoading || !prayerDone ? (
                  <>
                    <h3 className="text-white text-lg">Multioráculo</h3>
                    <span className="text-white/50 text-xs">• está realizando a sua tiragem</span>
                  </>
                ) : (
                  <>
                    <h3 className="text-white text-lg">Sua resposta</h3>
                    <span className="text-white/50 text-xs">• Esta é a sua resposta</span>
                  </>
                )}
              </div>
              <div className="text-white/80 text-sm leading-relaxed">
                {isLoading || !prayerDone ? (
                  <PrayerLoader
                    isLoading={isLoading}
                    onComplete={() => setPrayerDone(true)}
                  />
                ) : synthesis ? (
                  <div className="space-y-4">
                    {synthesis.split(/\n{2,}/).map((para, i) => (
                      <p key={i} className="text-white/80 text-sm leading-relaxed">{para.trim()}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Oracle Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-white/10 space-y-8">
              <h3 className="text-white text-lg text-center font-light">Ler por oráculo</h3>

              <div className="relative">
                {/* Right fade — hints scrollable content on mobile */}
                <div className="absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-black/25 to-transparent pointer-events-none z-10 sm:hidden" />
                <div className="oracle-scroll flex gap-3 sm:gap-4 overflow-x-auto sm:justify-center px-1 pb-2">
                  {["I Ching", "Tarô", "Búzios", "Lenormand", "Runas"].map((name, index) => (
                    <OracleIcon key={index} index={index} name={name} tooltip={name} />
                  ))}
                </div>
              </div>

              {/* Oracle Detail Card */}
              {activeOracle !== null && (() => {
                const ORACLE_KEYS = ["iching", "tarot", "buzios", "lenormand", "runas"]
                const key = ORACLE_KEYS[activeOracle]
                const oracle = oracles?.[key]
                const oracleName = ["I Ching", "Tarô", "Búzios", "Lenormand", "Runas"][activeOracle]
                const items = oracle?.draw?.items ?? []
                const notes = oracle?.draw?.notes
                const reading = oracle?.reading ?? (isLoading ? "Carregando..." : "")

                return (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20 animate-in slide-in-from-top-2 duration-300 space-y-5">

                    {/* Header */}
                    <div>
                      <h4 className="text-white text-base font-light">{oracleName}</h4>
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
                                  <p className="text-white/45 text-xs leading-relaxed mt-0.5">{item.meaning}</p>
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
                          <p className="text-white/25 text-[10px] uppercase tracking-widest mb-3">Leitura tradicional</p>
                        )}
                        <div className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{reading}</div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Keep/Share buttons */}
              <div className="flex flex-col items-center gap-3 pt-6 border-t border-white/10">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaved || saveLoading || !synthesis}
                    title={isSaved ? "Salvo" : "Salvar leitura"}
                    className="group flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 group-hover:text-white group-hover:bg-white/15 transition-all duration-200 group-hover:scale-105 transform group-disabled:hover:scale-100 flex items-center justify-center">
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
                    </span>
                    <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-200">
                      {isSaved ? "Salvo" : "Salvar Leitura"}
                    </span>
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={!synthesis}
                    title="Encaminhar"
                    className="group flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 group-hover:text-white group-hover:bg-white/15 transition-all duration-200 group-hover:scale-105 transform group-disabled:hover:scale-100 flex items-center justify-center">
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

            {/* Ask another question button */}
            <div className="flex justify-center pt-8">
              <button
                onClick={handleNewQuestion}
                className="group px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-light text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30 cursor-pointer hover:scale-105 transform flex items-center"
              >
                <span className="group-hover:scale-105 transition-transform duration-200 inline-block">
                  Fazer outra pergunta
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  )
}
