"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function DeleteReadingButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/delete-consultation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Não foi possível excluir a leitura.")
        setConfirming(false)
      } else {
        toast.success("Leitura excluída.")
        router.push("/leituras-salvas")
        router.refresh()
      }
    } catch {
      toast.error("Não foi possível excluir a leitura.")
      setConfirming(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {confirming && (
        <button
          onClick={() => setConfirming(false)}
          className="text-white/40 hover:text-white/70 text-xs transition-colors duration-200"
        >
          Cancelar
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className={`text-xs px-4 py-2 rounded-full border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          confirming
            ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
            : "border-white/15 text-white/40 hover:text-white/70 hover:border-white/30"
        }`}
      >
        {loading ? "Excluindo..." : confirming ? "Confirmar exclusão" : "Excluir leitura"}
      </button>
    </div>
  )
}
