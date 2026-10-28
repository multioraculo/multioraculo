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
      <Card title={t.timeline}><Timeline itens={data.timeline} /></Card>
      <Card title={t.connectionsTitle}><Lista itens={data.connections} /></Card>
      <Card title={t.integratedTitle}>
        <div className="space-y-3">
          {data.integrated.split(/\n\s*\n/).map((p, i) => (
            <p key={i} className="text-sm text-white/70 leading-relaxed">{p}</p>
          ))}
        </div>
      </Card>
      {data.openQuestions.length > 0 && (
        <Card title={t.openTitle}><Lista itens={data.openQuestions} /></Card>
      )}
      {data.evolution.length > 0 && (
        <Card title={t.evolutionTitle} wide>
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
