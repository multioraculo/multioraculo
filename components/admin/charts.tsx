"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

/**
 * Gráficos simples do admin (recharts, já no projeto). Paleta do site:
 * lilás para uso, índigo para pessoas, âmbar para custo, verde para receita.
 */

export type Series = { key: string; name: string; color?: string }
export type Point = { label: string } & Record<string, number | string>

const COLORS = ["#c4b5fd", "#818cf8", "#fcd34d", "#86efac", "#f9a8d4"]

const axisStyle = { fill: "rgba(255,255,255,0.45)", fontSize: 11 }
const tooltipStyle = {
  contentStyle: { background: "rgba(20,12,40,0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, fontSize: 12 },
  labelStyle: { color: "rgba(255,255,255,0.7)" },
  itemStyle: { color: "#fff" },
}

export function BarsChart({ data, series, height = 220, format }: { data: Point[]; series: Series[]; height?: number; format?: "int" | "usd" | "brl" }) {
  const fmt = formatter(format)
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={2}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} tickFormatter={fmt} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.05)" }} formatter={(v: any) => fmt(Number(v))} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color ?? COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={28} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LinesChart({ data, series, height = 220, format }: { data: Point[]; series: Series[]; height?: number; format?: "int" | "usd" | "brl" }) {
  const fmt = formatter(format)
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} tickFormatter={fmt} />
          <Tooltip {...tooltipStyle} formatter={(v: any) => fmt(Number(v))} />
          {series.map((s, i) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color ?? COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatter(format?: "int" | "usd" | "brl") {
  if (format === "usd") return (v: number) => `$${v.toFixed(v < 10 ? 2 : 0)}`
  if (format === "brl") return (v: number) => `R$${(v / 100).toFixed(0)}`
  return (v: number) => new Intl.NumberFormat("pt-BR").format(v)
}
