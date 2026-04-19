"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Consultation } from "@/lib/types"

interface ConsultationsListProps {
  consultations: Consultation[]
}

export default function ConsultationsList({ consultations: initial }: ConsultationsListProps) {
  const [items, setItems] = useState<Consultation[]>(initial)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    if (openMenu) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [openMenu])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("consultations").delete().eq("id", id)
    if (!error) setItems((prev) => prev.filter((c) => c.id !== id))
    setDeleteConfirm(null)
    setOpenMenu(null)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
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
    )
  }

  return (
    <div className="space-y-3" ref={menuRef}>
      {items.map((c) => (
        <div key={c.id} className="relative">
          {deleteConfirm === c.id ? (
            <div className="bg-white/5 backdrop-blur-sm border border-red-400/30 rounded-2xl p-6 flex items-center justify-between gap-4">
              <p className="text-white/80 text-sm">Deseja excluir esta leitura?</p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleDelete(c.id)}
                  className="px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-400/40 text-red-300 hover:bg-red-500/30 text-sm transition-colors"
                >
                  Excluir
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 group">
              <div className="flex items-start justify-between gap-4">
                <a
                  href={`/leituras-salvas/${c.id}`}
                  className="flex-1 min-w-0"
                >
                  <p className="text-white text-sm font-medium leading-relaxed group-hover:text-white/90">
                    {c.question}
                  </p>
                </a>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-white/40 text-xs whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  {/* Arrow → opens dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
                      aria-label="Opções"
                    >
                      <svg
                        className="w-4 h-4 transition-transform duration-200"
                        style={{ transform: openMenu === c.id ? "rotate(90deg)" : "none" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {openMenu === c.id && (
                      <div className="absolute right-0 top-9 z-50 w-32 backdrop-blur-md bg-black/40 border border-white/20 rounded-xl overflow-hidden shadow-xl p-1">
                        <a
                          href={`/leituras-salvas/${c.id}`}
                          className="block px-3 py-2 text-white/90 hover:bg-white/5 rounded-lg transition-colors text-sm"
                          onClick={() => setOpenMenu(null)}
                        >
                          Ver leitura
                        </a>
                        <button
                          onClick={() => { setOpenMenu(null); setDeleteConfirm(c.id) }}
                          className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {c.synthesis && (
                <a href={`/leituras-salvas/${c.id}`} className="block">
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{c.synthesis}</p>
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
