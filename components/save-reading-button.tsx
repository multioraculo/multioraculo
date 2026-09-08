"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useI18n } from "@/components/i18n-provider"

/** Salva uma leitura já desbloqueada (página /leitura/[seed]) no histórico. */
export default function SaveReadingButton({
  question,
  synthesis,
  oracles,
}: {
  question: string
  synthesis: string
  oracles: Record<string, unknown>
}) {
  const { dict } = useI18n()
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const save = async () => {
    if (saved || busy) return
    setBusy(true)
    try {
      const res = await fetch("/api/save-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, synthesis, oracle_outputs: oracles }),
      })
      if (res.status === 401) {
        toast.error(dict.results.loginToSave)
        window.dispatchEvent(new CustomEvent("open-login"))
      } else if (!res.ok) {
        toast.error(dict.results.saveFailed)
      } else {
        setSaved(true)
        toast.success(dict.results.savedOk)
      }
    } catch {
      toast.error(dict.results.saveFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={save}
      disabled={saved || busy}
      className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-light text-sm hover:bg-white/15 hover:border-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saved ? dict.results.saved : dict.results.saveReading}
    </button>
  )
}
