"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useI18n } from "@/components/i18n-provider"

export default function DeleteReadingButton({ id }: { id: string }) {
  const router = useRouter()
  const { dict } = useI18n()
  const t = dict.deleteReading
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
      if (!res.ok) {
        toast.error(t.failed)
        setConfirming(false)
      } else {
        toast.success(t.done)
        router.push("/leituras-salvas")
        router.refresh()
      }
    } catch {
      toast.error(t.failed)
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
          {dict.common.cancel}
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
        {loading ? t.deleting : confirming ? t.confirm : t.delete}
      </button>
    </div>
  )
}
