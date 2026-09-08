import type { ReactNode } from "react"

/**
 * Peças visuais da área administrativa, na estética do site (vidro escuro,
 * tipografia leve). Server-safe: sem estado.
 */

export function fmtInt(n: number | null | undefined): string {
  return new Intl.NumberFormat("pt-BR").format(Math.round(Number(n ?? 0)))
}

export function fmtUsd(n: number | null | undefined, digits = 2): string {
  const v = Number(n ?? 0)
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: Math.max(digits, 4) }).format(v)
}

export function fmtMoney(cents: number | null | undefined, currency = "brl"): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency.toUpperCase() }).format(Number(cents ?? 0) / 100)
}

export function fmtPct(part: number, whole: number): string {
  if (!whole) return "–"
  return `${((part / whole) * 100).toFixed(1).replace(".", ",")}%`
}

/** "2026-09-01" ou "2026-09" → "set 2026" */
export function fmtMonth(key: string): string {
  const [y, m] = key.split("-")
  const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1))
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" }).format(d).replace(".", "")
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "–"
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(iso))
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "–"
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date(iso))
}

export function Section({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="text-white text-lg font-light">{title}</h2>
        {hint && <p className="text-white/45 text-xs">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

export function Cards({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{children}</div>
}

export function Stat({ label, value, sub, tone = "default" }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "default" | "accent" | "warn" }) {
  const ring = tone === "accent" ? "border-violet-300/30" : tone === "warn" ? "border-amber-300/30" : "border-white/10"
  return (
    <div className={`backdrop-blur-md bg-white/5 border ${ring} rounded-2xl p-4`}>
      <p className="text-white/50 text-[11px] uppercase tracking-widest leading-tight">{label}</p>
      <p className="text-white text-2xl font-light mt-1.5 leading-none">{value}</p>
      {sub && <p className="text-white/45 text-xs mt-2 leading-snug">{sub}</p>}
    </div>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-white/50 text-xs leading-relaxed mt-3">{children}</p>
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 ${className}`}>{children}</div>
}

export function Table({ head, rows, empty = "Sem dados ainda." }: { head: ReactNode[]; rows: ReactNode[][]; empty?: string }) {
  return (
    <div className="overflow-x-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/45 text-[11px] uppercase tracking-widest">
            {head.map((h, i) => (
              <th key={i} className={`px-4 py-3 font-normal whitespace-nowrap ${i > 0 ? "text-right" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="px-4 py-6 text-white/45 text-center">{empty}</td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/[0.06] text-white/85">
              {r.map((c, j) => (
                <td key={j} className={`px-4 py-2.5 whitespace-nowrap ${j > 0 ? "text-right tabular-nums" : ""}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "ok" | "warn" | "muted" }) {
  const cls =
    tone === "ok" ? "border-green-300/30 text-green-100 bg-green-400/10" :
    tone === "warn" ? "border-amber-300/30 text-amber-100 bg-amber-400/10" :
    tone === "muted" ? "border-white/10 text-white/45" :
    "border-violet-300/30 text-violet-100 bg-violet-400/10"
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] leading-tight ${cls}`}>{children}</span>
}
