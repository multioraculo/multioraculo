"use client"

import { useState } from "react"
import { toast } from "sonner"
import type { JournalEntry } from "@/lib/types"

function Spinner() {
  return (
    <svg
      className="w-4 h-4"
      style={{ animation: "oracle-spin 0.8s linear infinite" }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SaveButton({ onClick, disabled, saving }: { onClick: () => void; disabled: boolean; saving: boolean }) {
  return (
    <button
      onClick={saving ? undefined : onClick}
      disabled={disabled && !saving}
      className={[
        "px-5 py-2 rounded-full border text-sm transition-all duration-200 flex items-center gap-2",
        saving
          ? "bg-white/10 border-white/20 text-white/60 cursor-wait"
          : disabled
          ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
          : "bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/15",
      ].join(" ")}
    >
      {saving ? <><Spinner /> Salvando…</> : "Salvar"}
    </button>
  )
}

interface DiaryListProps {
  initialEntries: JournalEntry[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

type FormState = { title: string; content: string }
const emptyForm: FormState = { title: "", content: "" }

export default function DiaryList({ initialEntries }: DiaryListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setCreating(true)
  }

  const startEdit = (entry: JournalEntry) => {
    setCreating(false)
    setEditingId(entry.id)
    setForm({ title: entry.title ?? "", content: entry.content })
  }

  const cancelForm = () => {
    setCreating(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleCreate = async () => {
    if (!form.content.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title || null, content: form.content }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setEntries((prev) => [json.entry, ...prev])
      setCreating(false)
      setForm(emptyForm)
      toast.success("Nota criada.")
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao criar nota.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!form.content.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title || null, content: form.content }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setEntries((prev) => prev.map((e) => (e.id === id ? json.entry : e)))
      setEditingId(null)
      setForm(emptyForm)
      toast.success("Nota atualizada.")
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao atualizar nota.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setEntries((prev) => prev.filter((e) => e.id !== id))
      setDeleteConfirm(null)
      toast.success("Nota excluída.")
    } catch {
      toast.error("Erro ao excluir nota.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light text-white">Diário</h1>
        {!creating && (
          <button
            onClick={startCreate}
            className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/15 text-sm transition-all duration-200"
          >
            Nova Nota
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/15 rounded-2xl p-6 space-y-4">
          <h3 className="text-white/70 text-sm font-light">Nova nota</h3>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Título (opcional)"
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-white/25 transition-colors duration-200"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="O que você quer registrar?"
            rows={5}
            autoFocus
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm resize-none focus:outline-none focus:border-white/25 transition-colors duration-200"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelForm}
              className="px-4 py-2 rounded-full text-white/50 hover:text-white/80 text-sm transition-colors"
            >
              Cancelar
            </button>
            <SaveButton onClick={handleCreate} disabled={!form.content.trim()} saving={saving} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && !creating && (
        <div className="text-center py-20">
          <p className="text-white/40 text-sm mb-4">Nenhuma nota ainda.</p>
          <button
            onClick={startCreate}
            className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/15 text-sm transition-all duration-200"
          >
            Criar primeira nota
          </button>
        </div>
      )}

      {/* Entries list */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="group relative">
            {deleteConfirm === entry.id ? (
              <div className="bg-white/5 backdrop-blur-sm border border-red-400/30 rounded-2xl p-6 flex items-center justify-between gap-4">
                <p className="text-white/80 text-sm">Deseja excluir esta nota?</p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(entry.id)}
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
            ) : editingId === entry.id ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/15 rounded-2xl p-6 space-y-4">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Título (opcional)"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-white/25 transition-colors duration-200"
                />
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={5}
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm resize-none focus:outline-none focus:border-white/25 transition-colors duration-200"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelForm}
                    className="px-4 py-2 rounded-full text-white/50 hover:text-white/80 text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <SaveButton onClick={() => handleUpdate(entry.id)} disabled={!form.content.trim()} saving={saving} />
                </div>
              </div>
            ) : (
              <div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-2 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 cursor-pointer"
                onClick={() => startEdit(entry)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {entry.title && (
                      <p className="text-white text-sm font-medium mb-1">{entry.title}</p>
                    )}
                    <p className="text-white/60 text-sm leading-relaxed line-clamp-3">
                      {entry.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-white/30 text-xs whitespace-nowrap">
                      {formatDate(entry.updated_at !== entry.created_at ? entry.updated_at : entry.created_at)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(entry.id) }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 transition-all duration-200 rounded"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                {entry.consultation_id && (
                  <p className="text-white/25 text-xs">Vinculada a uma leitura</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
