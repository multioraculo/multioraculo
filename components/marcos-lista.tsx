"use client"

/**
 * A página dos marcos: criar, editar, reiniciar, arquivar, apagar.
 *
 * Nenhuma palavra de desempenho. Reiniciar é uma ação neutra, com o efeito
 * dito em uma linha ("muda a data de início para hoje"), e nada some quando
 * acontece. Arquivar existe para quem quer parar de acompanhar sem apagar a
 * história.
 */
import { useCallback, useEffect, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { fmt } from "@/lib/i18n"
import { ContagemDeDias } from "@/components/marcos-home"
import { diasDesde, hojeCivil, type Marco } from "@/lib/marcos"

type Rascunho = { name: string; started_on: string; note: string }

const vazio = (): Rascunho => ({ name: "", started_on: hojeCivil(), note: "" })

export default function MarcosLista() {
  const { dict, formatDate } = useI18n()
  const t = dict.marcos as unknown as Record<string, string>
  const [marcos, setMarcos] = useState<Marco[] | null>(null)
  const [novo, setNovo] = useState<Rascunho | null>(null)
  const [editando, setEditando] = useState<string | null>(null)
  const [rascunho, setRascunho] = useState<Rascunho>(vazio())
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    const res = await fetch("/api/marcos")
    if (!res.ok) return
    const d = await res.json()
    setMarcos(d.marcos as Marco[])
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const criar = async () => {
    if (!novo?.name.trim()) return
    setSalvando(true)
    await fetch("/api/marcos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: novo.name, started_on: novo.started_on, note: novo.note || null }),
    })
    setNovo(null)
    setSalvando(false)
    await carregar()
  }

  const alterar = async (id: string, mudancas: Partial<Marco>) => {
    setSalvando(true)
    await fetch(`/api/marcos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mudancas),
    })
    setEditando(null)
    setSalvando(false)
    await carregar()
  }

  const apagar = async (id: string) => {
    setSalvando(true)
    await fetch(`/api/marcos/${id}`, { method: "DELETE" })
    setSalvando(false)
    await carregar()
  }

  if (marcos === null) return <div className="h-24 animate-pulse rounded bg-white/[0.04]" />

  const ativos = marcos.filter((m) => !m.archived)
  const arquivados = marcos.filter((m) => m.archived)

  const campos = (valor: Rascunho, mudar: (r: Rascunho) => void) => (
    <div className="space-y-3">
      <div>
        <label className="block text-white/35 text-[10px] uppercase tracking-widest mb-1.5">{t.name}</label>
        <input
          value={valor.name}
          onChange={(e) => mudar({ ...valor, name: e.target.value })}
          placeholder={t.namePlaceholder}
          maxLength={80}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/85 text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
        />
      </div>
      <div>
        <label className="block text-white/35 text-[10px] uppercase tracking-widest mb-1.5">{t.start}</label>
        <input
          type="date"
          value={valor.started_on}
          max={hojeCivil()}
          onChange={(e) => mudar({ ...valor, started_on: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/85 text-sm focus:outline-none focus:border-white/25 transition-colors [color-scheme:dark]"
        />
      </div>
      <div>
        <label className="block text-white/35 text-[10px] uppercase tracking-widest mb-1.5">{t.note}</label>
        <input
          value={valor.note}
          onChange={(e) => mudar({ ...valor, note: e.target.value })}
          maxLength={280}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/85 text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
        />
      </div>
    </div>
  )

  return (
    <div>
      <p className="text-white/50 text-sm leading-relaxed font-light">{t.intro}</p>

      {/* criar */}
      <div className="mt-8">
        {novo ? (
          <div className="border-t border-white/10 pt-6">
            {campos(novo, setNovo)}
            <div className="flex gap-4 mt-4">
              <button
                onClick={criar}
                disabled={salvando || !novo.name.trim()}
                className="text-white/80 hover:text-white text-sm disabled:opacity-40 transition-colors"
              >
                {t.create}
              </button>
              <button onClick={() => setNovo(null)} className="text-white/35 hover:text-white/60 text-sm transition-colors">
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setNovo(vazio())} className="text-white/45 hover:text-white/75 text-sm transition-colors">
            {t.add} ↗
          </button>
        )}
      </div>

      {/* ativos */}
      <div className="mt-10 space-y-8">
        {ativos.length === 0 && !novo && <p className="text-white/30 text-sm font-light">{t.empty}</p>}

        {ativos.map((marco) => (
          <div key={marco.id} className="border-t border-white/[0.07] pt-6">
            {editando === marco.id ? (
              <>
                {campos(rascunho, setRascunho)}
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => alterar(marco.id, { name: rascunho.name, started_on: rascunho.started_on, note: rascunho.note || null })}
                    disabled={salvando}
                    className="text-white/80 hover:text-white text-sm disabled:opacity-40 transition-colors"
                  >
                    {t.save}
                  </button>
                  <button onClick={() => setEditando(null)} className="text-white/35 hover:text-white/60 text-sm transition-colors">
                    {t.cancel}
                  </button>
                </div>
              </>
            ) : (
              <>
                <ContagemDeDias dias={diasDesde(marco.started_on)} t={t} />
                <p className="text-white/80 text-[15px] font-light mt-1">{marco.name}</p>
                <p className="text-white/25 text-[11px] font-light mt-1">
                  {fmt(t.since, { data: formatDate(`${marco.started_on}T12:00:00`) })}
                </p>
                {marco.note && <p className="text-white/45 text-[13px] font-light mt-2 leading-relaxed">{marco.note}</p>}

                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-[12px]">
                  <button
                    onClick={() => {
                      setEditando(marco.id)
                      setRascunho({ name: marco.name, started_on: marco.started_on, note: marco.note ?? "" })
                    }}
                    className="text-white/35 hover:text-white/70 transition-colors"
                  >
                    {t.edit}
                  </button>
                  <button
                    onClick={() => alterar(marco.id, { started_on: hojeCivil() })}
                    title={t.restartHint}
                    className="text-white/35 hover:text-white/70 transition-colors"
                  >
                    {t.restart}
                  </button>
                  <button onClick={() => alterar(marco.id, { archived: true })} className="text-white/35 hover:text-white/70 transition-colors">
                    {t.archive}
                  </button>
                  <button onClick={() => apagar(marco.id)} className="text-white/20 hover:text-white/50 transition-colors ml-auto">
                    {t.remove}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* arquivados */}
      {arquivados.length > 0 && (
        <div className="mt-14">
          <p className="text-white/20 text-[9px] uppercase tracking-[0.22em] font-light">{t.archivedTitle}</p>
          <div className="mt-4 space-y-4">
            {arquivados.map((marco) => (
              <div key={marco.id} className="flex items-baseline gap-3">
                <span className="text-white/40 text-sm font-light">{marco.name}</span>
                <span className="text-white/20 text-[11px]">
                  {fmt(t.since, { data: formatDate(`${marco.started_on}T12:00:00`) })}
                </span>
                <button
                  onClick={() => alterar(marco.id, { archived: false })}
                  className="ml-auto text-white/25 hover:text-white/60 text-[12px] transition-colors"
                >
                  {t.unarchive}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
