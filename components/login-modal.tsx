"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { startGoogleSignIn } from "@/lib/auth/oauth"
import { useI18n } from "@/components/i18n-provider"
import { EyeIcon, EyeOffIcon } from "@/components/nav-icons"

/** Erros que ficam embaixo do campo que os causou, não no aviso geral. */
type ErrosDeCampo = { email?: string; password?: string; confirm?: string }

const CAMPO =
  "w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-white/40 transition-all duration-200"
/** O mesmo campo, com espaço à direita para o botão do olho não cobrir o texto. */
const CAMPO_COM_OLHO = CAMPO.replace("px-4", "pl-4 pr-14")

type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  /** destino interno após o OAuth; sem ele, volta para a página atual */
  returnTo?: string | null
}

export default function LoginModal({ isOpen, onClose, onSuccess, returnTo }: LoginModalProps) {
  const supabase = useMemo(() => createClient(), [])
  const { dict } = useI18n()
  const t = dict.login
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ErrosDeCampo>({})

  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)
  /** Onde o cursor estava antes de o campo trocar de type, para voltar ao mesmo lugar. */
  const cursor = useRef<{ el: HTMLInputElement; start: number; end: number } | null>(null)

  // Voltar pelo botão do navegador a partir do Google restaura a página do
  // cache com o estado de loading; sem isto o botão ficaria preso.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setGoogleLoading(false)
    }
    window.addEventListener("pageshow", onShow)
    return () => window.removeEventListener("pageshow", onShow)
  }, [])

  // Trocar password↔text zera a seleção em alguns navegadores: o cursor volta
  // para onde estava, e só quando o campo já estava com o foco.
  useEffect(() => {
    const pendente = cursor.current
    if (!pendente) return
    cursor.current = null
    pendente.el.focus()
    try {
      pendente.el.setSelectionRange(pendente.start, pendente.end)
    } catch {}
  }, [showPassword, showConfirm])

  if (!isOpen) return null

  function reset() {
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setShowPassword(false)
    setShowConfirm(false)
    setMessage(null)
    setError(null)
    setFieldErrors({})
    setLoading(false)
  }

  /**
   * Ver a senha não pode custar o lugar onde a pessoa estava digitando.
   *
   * O mousedown é cancelado para o foco não sair do campo: no celular, sair do
   * campo derruba o teclado no meio da digitação. O cursor é lido aqui, antes
   * de qualquer coisa — no clique o navegador já mexeu na seleção. E o mouseup
   * também é cancelado (abaixo): sem isso o navegador recolhe a seleção para o
   * começo depois que o efeito já a tinha devolvido, e quem continuasse
   * digitando escreveria no início da senha.
   */
  function guardarCursor(e: React.MouseEvent, ref: React.RefObject<HTMLInputElement>) {
    e.preventDefault()
    const el = ref.current
    // Sem foco no campo não há cursor a devolver, e o alvo anterior precisa sair
    // daqui: senão um mousedown que não virou clique devolveria o foco ao campo
    // errado no próximo olho.
    cursor.current = null
    if (!el || document.activeElement !== el) return
    cursor.current = {
      el,
      start: el.selectionStart ?? el.value.length,
      end: el.selectionEnd ?? el.value.length,
    }
  }

  /** Trocar de aba não é erro: o que já foi digitado fica, só a confirmação sai de cena. */
  function trocarModo(proximo: "signin" | "signup") {
    setMode(proximo)
    setError(null)
    setMessage(null)
    setFieldErrors({})
    setConfirmPassword("")
    setShowConfirm(false)
  }

  /**
   * Cadastro só vai ao Supabase com as duas senhas iguais. Nada é apagado
   * quando a validação recusa: a pessoa corrige o que errou e segue.
   */
  function cadastroValido(): boolean {
    const erros: ErrosDeCampo = {}
    if (!email.trim()) erros.email = t.emailRequired
    if (!password) erros.password = t.passwordRequired
    if (!confirmPassword) erros.confirm = t.confirmRequired
    else if (password && password !== confirmPassword) erros.confirm = t.passwordMismatch
    setFieldErrors(erros)
    return Object.keys(erros).length === 0
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

  async function handleGoogle() {
    if (googleLoading || loading) return
    setGoogleLoading(true)
    setError(null)
    setMessage(null)
    try {
      const started = await startGoogleSignIn(supabase, returnTo)
      // Se começou, o navegador está indo para o Google: mantém o loading.
      if (!started) {
        setError(t.googleFailed)
        setGoogleLoading(false)
      }
    } catch {
      setError(t.googleFailed)
      setGoogleLoading(false)
    }
  }

  async function handleSignUp() {
    setError(null)
    setMessage(null)

    if (!cadastroValido()) return

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })

      if (error) {
        // A regra de senha continua sendo a do Supabase; só a recusa dela
        // aparece colada no campo, em vez de no aviso geral.
        if (error.code === "weak_password") setFieldErrors((e) => ({ ...e, password: error.message }))
        else setError(error.message)
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
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full py-3 px-6 flex items-center justify-center gap-3 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full font-medium text-sm hover:bg-white/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            {googleLoading ? t.googleLoading : t.google}
          </button>

          <div className="flex items-center gap-3 text-white/40 text-xs" role="separator">
            <span className="h-px flex-1 bg-white/15" />
            {t.or}
            <span className="h-px flex-1 bg-white/15" />
          </div>

          {mode === "signup" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              autoComplete="name"
              className={CAMPO}
            />
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setFieldErrors((f) => ({ ...f, email: undefined }))
              }}
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? "login-erro-email" : undefined}
              className={CAMPO}
            />
            {fieldErrors.email && (
              <p id="login-erro-email" className="mt-1.5 px-1 text-red-400 text-xs">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  const valor = e.target.value
                  setPassword(valor)
                  // Corrigiu a senha e as duas voltaram a bater: o aviso some sozinho.
                  setFieldErrors((f) => ({
                    ...f,
                    password: undefined,
                    confirm: valor === confirmPassword ? undefined : f.confirm,
                  }))
                }}
                placeholder={t.passwordPlaceholder}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={fieldErrors.password ? "login-erro-senha" : undefined}
                className={CAMPO_COM_OLHO}
              />
              <button
                type="button"
                onMouseDown={(e) => guardarCursor(e, passwordRef)}
                onMouseUp={(e) => e.preventDefault()}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="login-erro-senha" className="mt-1.5 px-1 text-red-400 text-xs">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <div className="relative">
                <input
                  ref={confirmRef}
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setFieldErrors((f) => ({ ...f, confirm: undefined }))
                  }}
                  placeholder={t.confirmPasswordPlaceholder}
                  autoComplete="new-password"
                  aria-invalid={fieldErrors.confirm ? true : undefined}
                  aria-describedby={fieldErrors.confirm ? "login-erro-confirmar" : undefined}
                  className={CAMPO_COM_OLHO}
                />
                <button
                  type="button"
                  onMouseDown={(e) => guardarCursor(e, confirmRef)}
                  onMouseUp={(e) => e.preventDefault()}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? t.hidePassword : t.showPassword}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
                >
                  {showConfirm ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.confirm && (
                <p id="login-erro-confirmar" className="mt-1.5 px-1 text-red-400 text-xs">
                  {fieldErrors.confirm}
                </p>
              )}
            </div>
          )}

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
                  onClick={() => trocarModo("signup")}
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
                  onClick={() => trocarModo("signin")}
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
