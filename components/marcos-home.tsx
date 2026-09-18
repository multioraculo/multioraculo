"use client"

/**
 * Os marcos na Home: uma anotação temporal, não um painel.
 *
 * No máximo dois, sem moldura, sem ícone, sem comemoração. O número é grande
 * porque é a única coisa que interessa ali; o resto é dito em voz baixa.
 *
 * Dá para criar um marco daqui mesmo, num formulário de duas linhas que só
 * aparece quando alguém pede. Quem quiser editar, reiniciar ou arquivar vai
 * para a página, porque essas ações pedem mais espaço do que a Home tem.
 *
 * A contagem nunca é guardada: ela é a diferença entre a data de início e
 * hoje, calculada na hora. Reiniciar é mudar a data.
 */
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { fmt } from "@/lib/i18n"
import { diasDesde, hojeCivil, type Marco } from "@/lib/marcos"

const QUANTOS_NA_HOME = 2

export default function MarcosHome({ logado }: { logado: boolean }) {
  const { dict, formatDate } = useI18n()
  const t = dict.marcos as unknown as Record<string, string>
  const [marcos, setMarcos] = useState<Marco[] | null>(null)
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState("")
  const [inicio, setInicio] = useState(hojeCivil())
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    const res = await fetch("/api/marcos")
    if (!res.ok) return
    const d = await res.json()
    setMarcos((d.marcos as Marco[]).filter((m) => !m.archived))
  }, [])

  useEffect(() => {
    if (!logado) return
    void carregar()
  }, [logado, carregar])

  if (!logado || marcos === null) return null

  const criar = async () => {
    if (!nome.trim()) return
    setSalvando(true)
    await fetch("/api/marcos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nome.trim(), started_on: inicio }),
    })
    setNome("")
    setInicio(hojeCivil())
    setCriando(false)
    setSalvando(false)
    await carregar()
  }

  const mostrar = marcos.slice(0, QUANTOS_NA_HOME)

  return (
    // no celular Diário e Marcos se empilham, e o filete diz que continuam sendo
    // a mesma camada; no desktop são duas colunas e o filete some
    <div className="mt-7 pt-7 border-t border-white/[0.045] lg:mt-0 lg:pt-0 lg:border-t-0">
      {/* sub-rótulo da camada SEU REGISTRO: quem dá o respiro em volta é a Home,
          para Diário e Marcos ficarem visivelmente no mesmo bloco */}
      <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">{t.title}</p>

      {mostrar.length > 0 && (
        <div className="mt-4 space-y-5">
          {mostrar.map((marco) => (
            <Link key={marco.id} href="/marcos" className="group block">
              <ContagemDeDias dias={diasDesde(marco.started_on)} t={t} />
              <p className="text-white/70 group-hover:text-white/90 text-[14px] font-light transition-colors mt-0.5">
                {marco.name}
              </p>
              <p className="text-white/25 text-[11px] font-light mt-0.5">
                {fmt(t.since, { data: formatDate(`${marco.started_on}T12:00:00`) })}
              </p>
            </Link>
          ))}
        </div>
      )}

      {criando ? (
        <div className="mt-5 space-y-2.5">
          <input
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={t.namePlaceholder}
            maxLength={80}
            onKeyDown={(e) => e.key === "Enter" && criar()}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2.5 text-white/85 text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
          />
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={inicio}
              max={hojeCivil()}
              onChange={(e) => setInicio(e.target.value)}
              className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white/75 text-[13px] focus:outline-none focus:border-white/25 transition-colors [color-scheme:dark]"
            />
            <button
              onClick={criar}
              disabled={salvando || !nome.trim()}
              className="text-white/70 hover:text-white text-[12px] disabled:opacity-40 transition-colors"
            >
              {t.save}
            </button>
            <button onClick={() => setCriando(false)} className="text-white/25 hover:text-white/50 text-[12px] transition-colors">
              {t.cancel}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-6 mt-2">
          {/* sem seta: o formulário abre aqui mesmo, e a seta significa sair da
              página. O "+" ocupa o lugar dela como sinal de que algo aparece */}
          <button
            onClick={() => setCriando(true)}
            className="group py-3 text-white/85 hover:text-white text-[14.5px] font-light transition-colors cursor-pointer"
          >
            <span className="text-white/40 group-hover:text-white/70 transition-colors">+</span> {t.add}
          </button>
          {marcos.length > QUANTOS_NA_HOME && (
            <Link href="/marcos" className="group py-3 flex items-center gap-2">
              <span className="text-white/85 group-hover:text-white text-[14.5px] font-light transition-colors">{t.all}</span>
              <span className="text-white/45 group-hover:text-white/85 text-[13px] transition-all duration-200 group-hover:translate-x-0.5">
                ↗
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

/** O número é o assunto. Um dia e o primeiro dia têm palavra própria. */
export function ContagemDeDias({ dias, t, tamanho = "grande" }: { dias: number; t: Record<string, string>; tamanho?: "grande" | "medio" }) {
  const classe = tamanho === "grande" ? "text-[26px]" : "text-[20px]"
  if (dias <= 0) return <p className={`text-white/80 instrument italic ${classe} leading-none`}>{t.zeroDays}</p>
  if (dias === 1) return <p className={`text-white instrument italic ${classe} leading-none`}>{t.oneDay}</p>
  return <p className={`text-white instrument italic ${classe} leading-none`}>{fmt(t.days, { n: dias })}</p>
}
