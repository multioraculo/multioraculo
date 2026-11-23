"use client"

import { useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import Link from "@/components/localized-link"
import { useI18n } from "@/components/i18n-provider"
import { fmt } from "@/lib/i18n"
import { estadoDaJornada, lerAnalise, MAX_SONHOS, type JornadaV2, type LinhaDeJornada } from "@/lib/dreams/jornada-estado"
import type { Dream, JourneyData } from "@/lib/types"

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} style={{ animation: "oracle-spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function Card({ title, children, wide = false }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={["bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6", wide ? "md:col-span-2" : ""].join(" ")}>
      <p className="text-white/25 text-[12px] uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  )
}

function Dot() {
  return (
    <span className="shrink-0 w-3 flex justify-center pt-[9px]">
      <span className="block h-1 w-1 rounded-full bg-white/25" />
    </span>
  )
}

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="space-y-3">
      {itens.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-white/70 leading-relaxed">
          <Dot />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Timeline({ itens }: { itens: Array<{ number: number; title: string; archetypes: string; summary: string }> }) {
  return (
    <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
      {itens.map((item) => (
        <div key={item.number} className="border-l border-white/15 pl-4">
          <p className="text-sm font-medium text-white/85 leading-snug">
            {item.number}. {item.title}
          </p>
          <p className="text-[13px] text-white/35 mt-0.5">{item.archetypes}</p>
          <p className="text-xs text-white/55 mt-1 leading-relaxed">{item.summary}</p>
        </div>
      ))}
    </div>
  )
}

const ROW_H = 68
const HEAD = 44
const LABEL_H = 26

/** "A Sombra (a crítica)" -> ["A Sombra", "a crítica"] */
function partirNome(nome: string): [string, string] {
  const m = nome.match(/^(.*?)\s*\((.*)\)\s*$/)
  return m ? [m[1], m[2]] : [nome, ""]
}

/**
 * Mapa da Jornada: colunas são os sonhos, linhas são os arquétipos em ordem de
 * relevância. A linha luminosa segue, em cada sonho, o arquétipo mais forte.
 * Tudo sai de dados já salvos (timeline e archetypeList): nenhuma chamada ao modelo.
 */
function MapaDaJornada({ data }: { data: JornadaV2 }) {
  const { dict } = useI18n()
  const t = dict.savedDreams
  const n = data.timeline.length
  const arqs = data.archetypeList.slice(0, 7)
  const [sel, setSel] = useState<number>(n)
  if (n < 2 || arqs.length === 0) return null

  const H = HEAD + arqs.length * ROW_H
  const xPct = (num: number) => ((num - 0.5) / n) * 100
  const yRow = (r: number) => HEAD + r * ROW_H + LABEL_H + (ROW_H - LABEL_H) / 2

  // o arquétipo que conduz cada sonho: o "Arquétipo Principal" da linha do tempo, quando
  // casa com uma linha da lista; senão, a primeira linha da lista que contém o sonho
  const norm = (x: string) => x.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim()
  const nomes = arqs.map((a) => norm(partirNome(a.name)[0]))
  const forte = new Map<number, number>()
  for (let num = 1; num <= n; num++) {
    const principal = norm((data.timeline.find((x) => x.number === num)?.archetypes ?? "").split("·")[0])
    let r = principal ? nomes.findIndex((nm) => nm === principal || nm.includes(principal) || principal.includes(nm)) : -1
    if (r < 0 || !arqs[r].dreams.includes(num)) r = arqs.findIndex((a) => a.dreams.includes(num))
    if (r >= 0) forte.set(num, r)
  }
  const pts = [...forte.entries()].sort((a, b) => a[0] - b[0]).map(([num, r]) => ({ num, x: xPct(num), y: yRow(r) }))
  let d = ""
  pts.forEach((p, i) => {
    if (i === 0) return void (d = `M ${p.x} ${p.y}`)
    const q = pts[i - 1]
    const mx = (q.x + p.x) / 2
    d += ` C ${mx} ${q.y}, ${mx} ${p.y}, ${p.x} ${p.y}`
  })

  const atual = data.timeline.find((x) => x.number === sel)

  return (
    <Card title={t.mapTitle} wide>
      <p className="text-[13px] text-white/40 leading-relaxed -mt-2 mb-5 max-w-2xl">{t.mapHint}</p>
      <div className="relative" style={{ height: H }}>
        {/* rótulos e trilhos, de ponta a ponta */}
        {arqs.map((a, r) => {
          const [nome, imagem] = partirNome(a.name)
          return (
            <div key={r} className="absolute left-0 right-0" style={{ top: HEAD + r * ROW_H, height: ROW_H }}>
              <div className="flex items-baseline justify-between gap-3 text-[12px] leading-tight" style={{ height: LABEL_H }}>
                <span className="text-white/75 font-medium shrink-0">
                  <span className="text-white/30 tabular-nums mr-1.5">{r + 1}</span>
                  {nome}
                </span>
                {imagem && <span className="text-white/30 truncate text-right">{imagem}</span>}
              </div>
              <div className="absolute left-0 right-0 h-px bg-white/10" style={{ top: LABEL_H + (ROW_H - LABEL_H) / 2 }} />
            </div>
          )
        })}

        {/* área dos sonhos: mesma largura para a linha, os pontos e os números */}
        <div className="absolute top-0 bottom-0" style={{ left: "3%", right: "3%" }}>
          <div
            className="absolute top-0 bottom-0 rounded-xl bg-white/[0.06] transition-all duration-300"
            style={{ left: `${((sel - 1) / n) * 100}%`, width: `${100 / n}%` }}
          />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" aria-hidden="true">
            {d && (
              <>
                <path d={d} fill="none" stroke="rgb(125 211 252)" strokeOpacity="0.10" strokeWidth="16" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={d} fill="none" stroke="rgb(125 211 252)" strokeOpacity="0.22" strokeWidth="8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={d} fill="none" stroke="rgb(186 230 253)" strokeOpacity="0.85" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </>
            )}
          </svg>

          {data.timeline.map((x) => (
            <button
              key={x.number}
              type="button"
              onClick={() => setSel(x.number)}
              aria-pressed={sel === x.number}
              aria-label={`${fmt(t.mapDream, { n: x.number })}: ${x.title}`}
              title={x.title}
              className={[
                "absolute top-2 -translate-x-1/2 h-7 p-0 flex items-center justify-center rounded-full text-[11px] sm:text-[12px] tabular-nums border transition-colors",
                sel === x.number ? "bg-white/20 border-white/40 text-white" : "bg-white/5 border-white/10 text-white/50 hover:text-white/80",
              ].join(" ")}
              style={{ left: `${xPct(x.number)}%`, width: `min(28px, calc(${100 / n}% - 2px))` }}
            >
              {x.number}
            </button>
          ))}

          {arqs.flatMap((a, r) =>
            a.dreams.filter((num) => num >= 1 && num <= n).map((num) => {
              const naLinha = forte.get(num) === r
              return (
                <button
                  key={`${r}-${num}`}
                  type="button"
                  onClick={() => setSel(num)}
                  aria-label={`${a.name}, ${fmt(t.mapDream, { n: num })}`}
                  title={`${a.name} · ${fmt(t.mapDream, { n: num })}`}
                  className={[
                    "absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-125",
                    naLinha ? "h-[18px] w-[18px] bg-white shadow-[0_0_14px_4px_rgba(125,211,252,0.55)]" : "h-[11px] w-[11px] bg-white/45",
                  ].join(" ")}
                  style={{ left: `${xPct(num)}%`, top: yRow(r) }}
                />
              )
            })
          )}
        </div>
      </div>

      {atual && (
        <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4" aria-live="polite">
          <p className="text-sm font-medium text-white/85 leading-snug">{atual.number}. {atual.title}</p>
          <p className="text-[13px] text-white/40 mt-0.5">{atual.archetypes}</p>
          <p className="text-sm text-white/65 mt-2 leading-relaxed">{atual.summary}</p>
        </div>
      )}
    </Card>
  )
}

/** Leituras salvas antes da versão 2: o mesmo grid de quatro cartões de sempre. */
function LeituraAntiga({ data }: { data: JourneyData }) {
  const { dict } = useI18n()
  const t = dict.savedDreams
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card title={t.timeline}><Timeline itens={data.timeline} /></Card>
      <Card title={t.patterns}><Lista itens={data.patterns} /></Card>
      <Card title={t.turningPoint}><p className="text-sm text-white/70 leading-relaxed">{data.turningPoint}</p></Card>
      <Card title={t.essence}><p className="text-sm text-white/70 leading-relaxed">{data.essence}</p></Card>
    </div>
  )
}

function LeituraNova({ data }: { data: JornadaV2 }) {
  const { dict } = useI18n()
  const t = dict.savedDreams
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card title={t.integratedTitle} wide>
        <div className="space-y-3 max-w-3xl">
          {data.integrated.split(/\n\s*\n/).map((p, i) => (
            <p key={i} className="text-base sm:text-lg font-light text-white/85 leading-relaxed">{p}</p>
          ))}
        </div>
      </Card>
      <MapaDaJornada data={data} />
      {data.archetypeList?.length > 0 && (
        <Card title={t.archetypesTitle} wide>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {data.archetypeList.map((a, i) => {
              const [nome, imagem] = partirNome(a.name)
              return (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 mt-0.5 h-6 w-6 rounded-full border border-white/15 bg-white/5 text-white/50 text-[12px] tabular-nums flex items-center justify-center">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/90 leading-snug">
                      {nome}
                      {imagem && <span className="font-normal text-white/40"> · {imagem}</span>}
                    </p>
                    {a.dreams?.length > 0 && (
                      <p className="text-[12px] text-white/35 mt-0.5">{fmt(t.archetypesIn, { dreams: a.dreams.join(", ") })}</p>
                    )}
                    <p className="text-sm text-white/65 leading-relaxed mt-1.5">{a.meaning}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>
      )}
      <Card title={t.timeline} wide>
        <ol className="relative grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          {data.timeline.map((item) => (
            <li key={item.number} className="flex gap-3">
              <span className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-sky-200/15 border border-sky-200/30 text-sky-100/80 text-[12px] tabular-nums flex items-center justify-center">{item.number}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/85 leading-snug">{item.title}</p>
                <p className="text-[12px] text-white/35 mt-0.5">{item.archetypes}</p>
                <p className="text-[13px] text-white/60 mt-1 leading-relaxed">{item.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
      <Card title={t.connectionsTitle}><Lista itens={data.connections} /></Card>
      {data.evolution.length > 0 && (
        <Card title={t.evolutionTitle}>
          <div className="space-y-4">
            {data.evolution.map((e, i) => (
              <div key={i} className="border-l border-white/15 pl-4">
                <p className="text-[12px] uppercase tracking-widest text-white/35">{t.evolutionTypes[e.type] ?? e.type}</p>
                <p className="text-sm text-white/70 leading-relaxed mt-1">{e.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

/**
 * Jornada dos Sonhos (a partir de dois sonhos). Nada é gerado ao abrir a
 * página: a pessoa pede a primeira leitura e as atualizações. A tela só diz
 * "em dia" quando a leitura cobre exatamente os sonhos que existem agora.
 */
export default function JornadaSonhos({ dreams, initialJourney }: { dreams: Dream[]; initialJourney: LinhaDeJornada | null }) {
  const { dict, locale, formatDate } = useI18n()
  const t = dict.savedDreams
  const [salva, setSalva] = useState<LinhaDeJornada | null>(initialJourney)
  const [loading, setLoading] = useState(false)
  const [bloqueio, setBloqueio] = useState<string | null>(null)

  const estado = useMemo(() => estadoDaJornada(dreams, salva), [dreams, salva])
  const lida = useMemo(() => (salva ? lerAnalise(salva.analysis_text) : null), [salva])

  const gerar = async () => {
    setLoading(true)
    setBloqueio(null)
    try {
      const res = await fetch("/sonhos/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      })
      const json = await res.json()
      if (!res.ok) {
        // o servidor responde com um código; todo texto mostrado é do dicionário (o `error` do servidor está em português)
        if (json?.code === "plan_required") return setBloqueio(dict.billing.journeyPlanRequired)
        if (json?.code === "free_used") return setBloqueio(dict.billing.journeyFreeUsed)
        if (json?.code === "limit_reached") {
          return setBloqueio(fmt(dict.billing.journeyLimitReached, { date: json.periodEnd ? formatDate(json.periodEnd, "long") : "" }))
        }
        if (json?.code === "in_progress") return toast.message(t.inProgress)
        throw new Error(t.errorGenerate)
      }
      if (json.journey) {
        setSalva(json.journey as LinhaDeJornada)
      } else if (json.journeyData) {
        // gerou mas não salvou: a leitura fica na tela, sem inventar uma linha do banco
        setSalva({
          id: "local",
          analysis_text: JSON.stringify(json.journeyData),
          created_at: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      toast.error(t.errorGenerate)
    } finally {
      setLoading(false)
    }
  }

  if (estado.total < 2) return null

  const botao = (rotulo: string, destaque: boolean) => (
    <button
      onClick={gerar}
      disabled={loading}
      className={[
        "rounded-full border text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-wait",
        destaque
          ? "px-8 py-3 bg-white/10 hover:bg-white/15 border-white/20 text-white/80 hover:text-white"
          : "px-6 py-2 bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white/80",
      ].join(" ")}
    >
      {rotulo}
    </button>
  )

  const avisoDePlano = bloqueio && (
    <div className="basis-full bg-white/5 backdrop-blur-sm border border-white/15 rounded-xl p-4 flex flex-wrap items-center gap-3" role="status">
      <p className="text-white/80 text-sm leading-relaxed">{bloqueio}</p>
      <Link
        href="/assinatura"
        className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white font-light text-sm hover:bg-white/15 hover:border-white/30 transition-all duration-200"
      >
        {dict.dreams.seePlans}
      </Link>
    </div>
  )

  const novos = estado.novos.length
  const v2 = lida?.versao === 2 ? lida.data : null
  const porId = new Map(dreams.map((d) => [d.id, d]))
  const conta = v2 ? v2.dreamIds.length : lida?.versao === 1 ? lida.data.timeline.length : 0

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-light italic instrument text-white mb-4">{t.journeyTitle}</h1>
        <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl">{t.journeyIntro}</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner className="w-8 h-8 text-white/40" />
          <p className="text-white/40 text-sm">{t.analyzing}</p>
        </div>
      )}

      {/* ainda não há leitura: o convite para a primeira */}
      {!loading && estado.fase === "pronta" && (
        <div className="flex items-center gap-4 flex-wrap">
          {botao(t.exploreConnections, true)}
          {avisoDePlano}
        </div>
      )}

      {/* um sonho citado na leitura foi excluído: o texto não é mostrado */}
      {!loading && estado.fase === "sonho_excluido" && (
        <div className="flex items-center gap-4 flex-wrap">
          <p className="basis-full text-white/55 text-sm leading-relaxed max-w-2xl">{t.deletedNotice}</p>
          {botao(t.regenerate, true)}
          {avisoDePlano}
        </div>
      )}

      {!loading && lida && (estado.fase === "atual" || estado.fase === "desatualizada") && (
        <>
          {estado.fase === "desatualizada" && (
            <div className="mb-6 flex items-center gap-4 flex-wrap bg-white/5 border border-white/15 rounded-xl p-4">
              <p className="text-white/70 text-sm leading-relaxed flex-1 min-w-[220px]">
                {novos === 1 ? t.outdatedOne : fmt(t.outdatedMany, { count: novos })}
              </p>
              {botao(t.updateAnalysis, false)}
              {avisoDePlano}
            </div>
          )}

          {lida.versao === 2 ? <LeituraNova data={lida.data} /> : <LeituraAntiga data={lida.data} />}

          <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-white/30 text-sm">
            {salva && <span>{fmt(t.generatedOn, { date: formatDate(salva.created_at, "short") })}</span>}
            {conta > 0 && (
              <span>{v2 && conta === MAX_SONHOS && estado.total > MAX_SONHOS ? fmt(t.basedOnWindow, { count: conta }) : fmt(t.basedOn, { count: conta })}</span>
            )}
          </div>

          {v2 && v2.dreamIds.length === 2 && <p className="text-white/35 text-sm mt-3 max-w-2xl leading-relaxed">{t.firstReadingNote}</p>}

          {estado.fundamentos.length > 0 && (
            <details className="mt-4 group">
              <summary className="cursor-pointer text-white/40 hover:text-white/60 text-sm select-none">{t.dreamsConsidered}</summary>
              <ul className="mt-3 space-y-2">
                {estado.fundamentos.map((id) => {
                  const d = porId.get(id)
                  if (!d) return null
                  return (
                    <li key={id} className="text-[13px] text-white/45 leading-relaxed">
                      <span className="text-white/30">{formatDate(d.created_at, "short")}</span>{" "}
                      {d.dream_description.length > 90 ? `${d.dream_description.slice(0, 90)}…` : d.dream_description}
                    </li>
                  )
                })}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  )
}
