"use client"

import { useState } from "react"
import { toast } from "sonner"

interface ReadingNotesProps {
  consultationId: string
  initialNotes: string | null
}

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

export default function ReadingNotes({ consultationId, initialNotes }: ReadingNotesProps) {
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [saveToJournal, setSaveToJournal] = useState(false)
  const [journalTitle, setJournalTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!initialNotes)

  const handleSave = async () => {
    if (!notes.trim() || saving) return
    setSaving(true)
    setSaved(false)

    try {
      const notesRes = await fetch(`/api/consultations/${consultationId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_notes: notes }),
      })
      if (!notesRes.ok) throw new Error("Erro ao salvar nota na leitura.")

      if (saveToJournal) {
        const journalRes = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: journalTitle.trim() || null,
            content: notes,
            consultation_id: consultationId,
          }),
        })
        if (!journalRes.ok) throw new Error("Erro ao salvar no Diário.")
      }

      setSaved(true)
      toast.success(saveToJournal ? "Nota salva e adicionada ao Diário." : "Nota salva.")
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar nota.")
    } finally {
      setSaving(false)
    }
  }

  const isEmpty = !notes.trim()

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-4">
      <h3 className="text-white/60 text-sm font-light">Nota pessoal</h3>

      <textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false) }}
        placeholder="Adicionar nota pessoal sobre esta leitura..."
        rows={4}
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm resize-none focus:outline-none focus:border-white/25 transition-colors duration-200"
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="save-to-journal"
          checked={saveToJournal}
          onChange={(e) => setSaveToJournal(e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-white/5 accent-white/80 cursor-pointer"
        />
        <label htmlFor="save-to-journal" className="text-white/60 text-sm cursor-pointer select-none">
          Salvar também no Diário
        </label>
      </div>

      {saveToJournal && (
        <input
          type="text"
          value={journalTitle}
          onChange={(e) => setJournalTitle(e.target.value)}
          placeholder="Título da entrada no Diário (opcional)"
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-white/25 transition-colors duration-200"
        />
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isEmpty}
          className={[
            "px-5 py-2 rounded-full border text-sm transition-all duration-200 flex items-center gap-2",
            saving
              ? "bg-white/10 border-white/20 text-white/60 cursor-wait"
              : saved
              ? "bg-white/10 border-white/20 text-green-400 cursor-default"
              : isEmpty
              ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
              : "bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/15",
          ].join(" ")}
        >
          {saving ? (
            <><Spinner /> Salvando…</>
          ) : saved ? (
            "Salvo ✓"
          ) : (
            "Salvar nota"
          )}
        </button>
      </div>
    </div>
  )
}
