"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface UserMenuProps {
  user: { email: string; full_name: string | null }
  onLogout: () => void
}

type Reading = {
  id: string
  question: string
  created_at: string
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [readingsExpanded, setReadingsExpanded] = useState(false)
  const [readings, setReadings] = useState<Reading[]>([])
  const [readingsLoading, setReadingsLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const hasFetched = useRef(false)
  const router = useRouter()

  const fetchReadings = useCallback(async () => {
    if (hasFetched.current) return
    setReadingsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("consultations")
      .select("id, question, created_at")
      .order("created_at", { ascending: false })
      .limit(3)
    setReadings((data ?? []) as Reading[])
    setReadingsLoading(false)
    hasFetched.current = true
  }, [])

  const toggleReadings = () => {
    if (!readingsExpanded) fetchReadings()
    setReadingsExpanded((v) => !v)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from("consultations").delete().eq("id", id)
    setReadings((prev) => prev.filter((r) => r.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 transition-all duration-200 flex items-center justify-center"
      >
        <span className="text-sm font-medium">{user.email.charAt(0).toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-72 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 space-y-1">

            {/* User info */}
            <div className="border-b border-white/10 pb-3 mb-2">
              {user.full_name && (
                <p className="text-white text-sm font-medium">{user.full_name}</p>
              )}
              <p className="text-white/60 text-xs">{user.email}</p>
            </div>

            {/* Nova Leitura */}
            <button
              onClick={() => { setIsOpen(false); router.push("/") }}
              className="w-full text-left py-2 px-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
            >
              Nova Leitura
            </button>

            {/* Leituras Salvas — expandable dropdown */}
            <div>
              <button
                onClick={toggleReadings}
                className="w-full text-left py-2 px-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm flex items-center justify-between"
              >
                <span>Leituras Salvas</span>
                <span className="text-white/40 text-xs">{readingsExpanded ? "▲" : "▼"}</span>
              </button>

              {readingsExpanded && (

                <div className="mt-1 ml-2 space-y-0.5">
                  {readingsLoading ? (
                    <p className="text-white/40 text-xs px-3 py-2">Carregando...</p>
                  ) : readings.length === 0 ? (
                    <p className="text-white/40 text-xs px-3 py-2">Nenhuma leitura salva ainda</p>
                  ) : (
                    readings.map((r) => (
                      <div key={r.id} className="flex items-center gap-1 group">
                        {deleteConfirm === r.id ? (
                          <div className="flex items-center gap-1 w-full px-2 py-1.5">
                            <span className="text-white/60 text-xs flex-1">Tem certeza?</span>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-red-400 hover:text-red-300 text-xs px-2 py-0.5 rounded border border-red-400/30 hover:border-red-300/30 transition-colors"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-white/50 hover:text-white/80 text-xs px-2 py-0.5 rounded border border-white/10 hover:border-white/20 transition-colors"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => { setIsOpen(false); router.push(`/leituras-salvas/${r.id}`) }}
                              className="flex-1 text-left py-1.5 px-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-xs min-w-0"
                            >
                              <span className="block truncate">
                                {r.question.length > 40 ? r.question.slice(0, 40) + "…" : r.question}
                              </span>
                              <span className="text-white/30 text-[10px]">{formatDate(r.created_at)}</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(r.id)}
                              className="shrink-0 px-1.5 py-1 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 text-[10px]"
                              title="Excluir leitura"
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    ))
                  )}
                  <button
                    onClick={() => { setIsOpen(false); router.push("/leituras-salvas") }}
                    className="w-full text-left py-1.5 px-2 text-white/40 hover:text-white/60 text-xs transition-colors"
                  >
                    Ver todas →
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => { setIsOpen(false); router.push("/diario") }}
              className="w-full text-left py-2 px-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
            >
              Diário
            </button>

            {/* Divider */}
            <div className="border-t border-white/10 !mt-2 !mb-1" />

            <button
              onClick={() => { setIsOpen(false); router.push("/oraculos") }}
              className="w-full text-left py-2 px-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
            >
              Oráculos
            </button>
            <button
              onClick={() => { setIsOpen(false); router.push("/assinatura") }}
              className="w-full text-left py-2 px-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
            >
              Assinatura
            </button>
            <button
              onClick={() => { setIsOpen(false); router.push("/faq") }}
              className="w-full text-left py-2 px-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
            >
              FAQ
            </button>

            {/* Divider + Sair */}
            <div className="border-t border-white/10 !mt-2 pt-1">
              <button
                onClick={() => { setIsOpen(false); onLogout() }}
                className="w-full text-left py-2 px-3 text-white/60 hover:text-white/80 hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
