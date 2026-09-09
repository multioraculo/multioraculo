"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useI18n } from "@/components/i18n-provider"

/**
 * Entrada por voz para qualquer campo de texto do produto.
 *
 * Fluxo: toque no microfone → pede permissão → grava com MediaRecorder em
 * segmentos curtos → cada segmento vai para /api/voice/transcribe e o texto
 * volta e é acrescentado ao campo, preservando o que já estava escrito →
 * toque de novo para parar. A pessoa edita e envia como sempre.
 *
 * Privacidade: o áudio de cada segmento fica só em memória até a resposta e
 * é descartado; nada vai para storage, histórico ou analytics.
 *
 * Toda a lógica (suporte, permissão, gravação, segmentação, transcrição,
 * estados, erros, i18n) está aqui. Os campos só posicionam o botão.
 */

export type VoiceState = "idle" | "listening" | "transcribing" | "error"
export type VoiceErrorCode = "unsupported" | "denied" | "nomic" | "failed" | "rate_limited"

const SEGMENT_MS = 12_000
const MAX_SESSION_MS = 4 * 60_000

function pickMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"]
  return candidates.find((m) => MediaRecorder.isTypeSupported(m))
}

export function isVoiceSupported(): boolean {
  if (typeof window === "undefined") return false
  return typeof navigator.mediaDevices?.getUserMedia === "function" && typeof MediaRecorder !== "undefined" && window.isSecureContext
}

/** Junta a transcrição ao texto existente sem apagar nada. */
export function appendTranscript(prev: string, text: string): string {
  const t = text.trim()
  if (!t) return prev
  const p = prev.replace(/[ \t]+$/, "")
  if (!p) return t
  const sep = /\n$/.test(p) ? "" : " "
  return p + sep + t
}

export function useVoiceInput({ onText }: { onText: (text: string) => void }) {
  const { locale } = useI18n()
  const [state, setState] = useState<VoiceState>("idle")
  const [error, setError] = useState<VoiceErrorCode | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [supported, setSupported] = useState(true)

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const listeningRef = useRef(false)
  const pendingRef = useRef(0)
  const segmentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const segmentStart = useRef(0)
  const sessionStart = useRef(0)
  const onTextRef = useRef(onText)
  onTextRef.current = onText

  useEffect(() => {
    setSupported(isVoiceSupported())
  }, [])

  const settle = useCallback(() => {
    // estado final depois de parar: aguarda segmentos pendentes
    if (!listeningRef.current) setState(pendingRef.current > 0 ? "transcribing" : "idle")
  }, [])

  const send = useCallback(
    async (blob: Blob, secs: number) => {
      if (blob.size < 800) return // segmento vazio (toque rápido)
      pendingRef.current += 1
      setState((s) => (listeningRef.current ? s : "transcribing"))
      try {
        const fd = new FormData()
        fd.append("audio", blob, "segment")
        fd.append("locale", locale)
        fd.append("seconds", String(Math.round(secs)))
        const res = await fetch("/api/voice/transcribe", { method: "POST", body: fd })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          setError(j?.code === "rate_limited" ? "rate_limited" : "failed")
          setState("error")
          return
        }
        const j = await res.json()
        if (j?.text) onTextRef.current(String(j.text))
      } catch {
        setError("failed")
        setState("error")
      } finally {
        pendingRef.current -= 1
        settle()
      }
    },
    [locale, settle]
  )

  const startRecorder = useCallback(() => {
    const stream = streamRef.current
    if (!stream) return
    const mime = pickMime()
    const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
    const chunks: BlobPart[] = []
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data)
    }
    rec.onstop = () => {
      const secs = (Date.now() - segmentStart.current) / 1000
      const blob = new Blob(chunks, { type: rec.mimeType || mime || "audio/webm" })
      chunks.length = 0 // libera o áudio bruto assim que o blob é montado
      void send(blob, secs)
      if (listeningRef.current) startRecorder()
      else settle()
    }
    segmentStart.current = Date.now()
    rec.start()
    recorderRef.current = rec
    if (segmentTimer.current) clearTimeout(segmentTimer.current)
    segmentTimer.current = setTimeout(() => {
      if (listeningRef.current && rec.state === "recording") rec.stop()
    }, SEGMENT_MS)
  }, [send, settle])

  const stop = useCallback(() => {
    listeningRef.current = false
    if (segmentTimer.current) clearTimeout(segmentTimer.current)
    if (tickTimer.current) clearInterval(tickTimer.current)
    const rec = recorderRef.current
    if (rec && rec.state === "recording") rec.stop()
    else settle()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recorderRef.current = null
  }, [settle])

  const start = useCallback(async () => {
    setError(null)
    if (!isVoiceSupported()) {
      setSupported(false)
      setError("unsupported")
      setState("error")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
    } catch (e: any) {
      const name = String(e?.name ?? "")
      setError(name === "NotFoundError" || name === "OverconstrainedError" ? "nomic" : "denied")
      setState("error")
      return
    }
    listeningRef.current = true
    sessionStart.current = Date.now()
    setSeconds(0)
    setState("listening")
    startRecorder()
    tickTimer.current = setInterval(() => {
      const elapsed = Date.now() - sessionStart.current
      setSeconds(Math.floor(elapsed / 1000))
      if (elapsed >= MAX_SESSION_MS) stop()
    }, 500)
  }, [startRecorder, stop])

  const toggle = useCallback(() => {
    if (listeningRef.current) stop()
    else void start()
  }, [start, stop])

  useEffect(() => () => stop(), [stop])

  return { state, error, seconds, supported, toggle, stop }
}

/**
 * Botão de microfone para colocar dentro de um campo (canto inferior
 * direito). O campo precisa ter padding à direita para o texto não passar
 * por baixo. Mostra o estado por ícone, texto e aria-*, não só por cor.
 */
export default function VoiceMicButton({ onText, className = "" }: { onText: (text: string) => void; className?: string }) {
  const { dict } = useI18n()
  const t = dict.voice
  const { state, error, seconds, supported, toggle } = useVoiceInput({ onText })
  if (!supported && state !== "error") return null

  const listening = state === "listening"
  const transcribing = state === "transcribing"
  const label = listening ? t.stop : t.start
  const status = listening ? `${t.listening} ${fmtSeconds(seconds)}` : transcribing ? t.transcribing : null
  const errorText = state === "error" && error ? t.errors[error] : null

  return (
    <div className={`voice-wrap ${className}`}>
      {status && (
        <span className={`voice-status ${listening ? "is-listening" : ""}`} aria-live="polite">
          {listening && <span className="voice-dot" aria-hidden="true" />}
          {status}
        </span>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-pressed={listening}
        title={label}
        className={`voice-btn ${listening ? "is-listening" : ""} ${transcribing ? "is-busy" : ""}`}
      >
        {transcribing ? (
          <span className="voice-spinner" aria-hidden="true" />
        ) : listening ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="3.5" width="6" height="11" rx="3" />
            <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6" />
          </svg>
        )}
      </button>
      {errorText && (
        <p className="voice-error" role="alert">
          {errorText}
        </p>
      )}
    </div>
  )
}

function fmtSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, "0")}`
}
