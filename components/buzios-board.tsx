"use client"

import { useMemo } from "react"
import { useI18n } from "@/components/i18n-provider"
import { fmt } from "@/lib/i18n"
import {
  BUZIOS_TOTAL,
  generateBuziosLayout,
  oduFromLabel,
  openCountFromLabel,
} from "@/lib/oracles/buzios-layout"

/**
 * Visualização da queda dos búzios. Só representa o resultado já calculado
 * pelo motor: a quantidade de abertos vem de fora e o desenho é
 * determinístico a partir do seed da leitura.
 */

// ---------------------------------------------------------------------------
// Assets: as duas faces do cauri preparado para o jogo
// ---------------------------------------------------------------------------

/** Aberto: a boca natural da concha voltada para cima (fenda serrilhada). */
export function BuzioOpen({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 20 27" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="bz-open-body" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f1e9ff" />
          <stop offset="100%" stopColor="#c9b3f0" />
        </radialGradient>
      </defs>
      <ellipse cx="10" cy="13.5" rx="8.6" ry="12.4" fill="url(#bz-open-body)" stroke="rgba(120,80,190,0.55)" strokeWidth="0.9" />
      {/* fenda da boca */}
      <path d="M10 3.6 C 8.9 8, 8.9 19, 10 23.4 C 11.1 19, 11.1 8, 10 3.6 Z" fill="#3b2364" opacity="0.92" />
      {/* dentes serrilhados dos dois lados */}
      <g stroke="#3b2364" strokeWidth="0.75" strokeLinecap="round" opacity="0.85">
        <line x1="8.9" y1="6.5" x2="7.3" y2="6.1" />
        <line x1="8.7" y1="9" x2="7" y2="8.7" />
        <line x1="8.6" y1="11.5" x2="6.9" y2="11.3" />
        <line x1="8.6" y1="14" x2="6.9" y2="14" />
        <line x1="8.6" y1="16.5" x2="6.9" y2="16.7" />
        <line x1="8.8" y1="19" x2="7.1" y2="19.4" />
        <line x1="11.1" y1="6.5" x2="12.7" y2="6.1" />
        <line x1="11.3" y1="9" x2="13" y2="8.7" />
        <line x1="11.4" y1="11.5" x2="13.1" y2="11.3" />
        <line x1="11.4" y1="14" x2="13.1" y2="14" />
        <line x1="11.4" y1="16.5" x2="13.1" y2="16.7" />
        <line x1="11.2" y1="19" x2="12.9" y2="19.4" />
      </g>
    </svg>
  )
}

/** Fechado: o dorso cortado voltado para cima (superfície lisa com o anel do corte). */
export function BuzioClosed({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 20 27" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="bz-closed-body" cx="38%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#fbf7ff" />
          <stop offset="60%" stopColor="#dccbf5" />
          <stop offset="100%" stopColor="#a98ad8" />
        </radialGradient>
      </defs>
      <ellipse cx="10" cy="13.5" rx="8.6" ry="12.4" fill="url(#bz-closed-body)" stroke="rgba(120,80,190,0.55)" strokeWidth="0.9" />
      {/* anel do corte no dorso: uma elipse interna lisa, sem fenda */}
      <ellipse cx="10" cy="13.2" rx="4.6" ry="7.6" fill="none" stroke="rgba(90,55,150,0.45)" strokeWidth="0.8" />
      <ellipse cx="9.3" cy="11.8" rx="2.4" ry="4.2" fill="rgba(255,255,255,0.55)" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Mesa
// ---------------------------------------------------------------------------

type BoardProps = {
  seed: string
  openCount: number
  ariaLabel: string
  /** animação sutil só na primeira aparição (leitura ao vivo) */
  animate?: boolean
}

export function BuziosBoard({ seed, openCount, ariaLabel, animate = false }: BoardProps) {
  const shells = useMemo(() => generateBuziosLayout({ seed, openCount }), [seed, openCount])

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="buzios-board relative mx-auto aspect-square rounded-full overflow-hidden select-none"
      style={{
        width: "min(100%, 340px)",
        background:
          "radial-gradient(circle at 45% 35%, rgba(181,126,255,0.30), rgba(74,39,137,0.42) 55%, rgba(18,18,48,0.72))",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "inset 0 0 50px rgba(255,255,255,0.04), 0 20px 60px rgba(20,5,60,0.22)",
      }}
    >
      {/* marcações abstratas: anel interno e traços radiais discretos na borda */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="0.9" fill="rgba(255,255,255,0.22)" />
        <g stroke="rgba(255,255,255,0.12)" strokeWidth="0.35">
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2
            const x1 = 50 + 46.5 * Math.cos(a)
            const y1 = 50 + 46.5 * Math.sin(a)
            const x2 = 50 + 48.5 * Math.cos(a)
            const y2 = 50 + 48.5 * Math.sin(a)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
        </g>
      </svg>

      {shells.map((s) => (
        <div
          key={s.id}
          className={animate ? "buzios-shell-enter" : undefined}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
            animationDelay: animate ? `${s.id * 35}ms` : undefined,
            filter: "drop-shadow(0 2px 3px rgba(15,5,40,0.45))",
          }}
        >
          {s.open ? <BuzioOpen /> : <BuzioClosed />}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// As duas quedas de uma leitura, com legendas
// ---------------------------------------------------------------------------

type CastsProps = {
  /** seed persistente da leitura (OracleResult.seed) ou, na falta, o id da leitura salva */
  seed: string
  items: Array<{ position?: string; name: string }>
  /** contagens vindas do motor; leituras antigas usam o número do texto do item */
  shells?: { primary: number; confirmation: number } | null
  animate?: boolean
}

export default function BuziosCasts({ seed, items, shells, animate = false }: CastsProps) {
  const { dict } = useI18n()
  const t = dict.buzios

  const primaryItem = items[0]
  const confirmationItem = items[1]
  const primary = shells?.primary ?? openCountFromLabel(primaryItem?.name)
  const confirmation = shells?.confirmation ?? openCountFromLabel(confirmationItem?.name)
  if (primary === null || primary === undefined) return null

  const casts = [
    {
      key: "primary",
      title: t.firstCast,
      open: primary,
      odu: oduFromLabel(primaryItem?.name),
      aria: t.ariaPrimary,
    },
    ...(confirmation !== null && confirmation !== undefined
      ? [
          {
            key: "confirmation",
            title: t.secondCast,
            open: confirmation,
            odu: oduFromLabel(confirmationItem?.name),
            aria: t.ariaConfirmation,
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      {casts.map((c) => (
        <div key={c.key} className="space-y-2">
          <p className="text-white/45 text-[11px] uppercase tracking-widest">{c.title}</p>
          <BuziosBoard
            seed={`${seed}:buzios:${c.key}`}
            openCount={c.open}
            ariaLabel={fmt(c.aria, { open: c.open, total: BUZIOS_TOTAL, odu: c.odu })}
            animate={animate}
          />
          <p className="text-white/70 text-xs text-center">
            {fmt(t.openCount, { open: c.open, total: BUZIOS_TOTAL })}
            {c.odu ? <span className="text-white/45"> · {c.odu}</span> : null}
          </p>
        </div>
      ))}
    </div>
  )
}
