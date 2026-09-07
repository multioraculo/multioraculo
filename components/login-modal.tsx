"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useI18n } from "@/components/i18n-provider"

type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const supabase = useMemo(() => createClient(), [])
  const { dict } = useI18n()
  const t = dict.login
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  function reset() {
    setName("")
    setEmail("")
    setPassword("")
    setMessage(null)
    setError(null)
    setLoading(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSignIn() {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        return
      }

      toast.success(t.success)
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp() {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })

      if (error) {
        setError(error.message)
        return
      }

      setMessage(t.accountCreated)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8">
        <button
          onClick={handleClose}
          aria-label={dict.common.close}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-light text-white mb-2">{t.title}</h2>
          <p className="text-white/70 text-sm">{t.subtitle}</p>
        </div>

        <div className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-white/40 transition-all duration-200"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-white/40 transition-all duration-200"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-white/40 transition-all duration-200"
          />

          {message && <p className="text-green-300 text-xs text-center">{message}</p>}
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <div className="space-y-3">
            {mode === "signin" ? (
              <>
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-6 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full font-medium text-sm hover:bg-white/15 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t.signingIn : t.signIn}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(null); setMessage(null) }}
                  className="w-full py-3 px-6 backdrop-blur-md bg-white/5 border border-white/10 text-white/80 rounded-full font-medium text-sm hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  {t.createAccount}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full py-3 px-6 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full font-medium text-sm hover:bg-white/15 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t.creating : t.createAccount}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(null); setMessage(null) }}
                  className="w-full py-3 px-6 backdrop-blur-md bg-white/5 border border-white/10 text-white/80 rounded-full font-medium text-sm hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  {t.haveAccount}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 px-6 text-white/60 hover:text-white/80 font-medium text-sm transition-colors duration-200"
            >
              {t.continueWithout}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
