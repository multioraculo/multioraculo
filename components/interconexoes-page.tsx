"use client"

/**
 * Interconexões: o céu de hoje encontrando o mapa de uma pessoa.
 *
 * A ordem da tela é a ordem do desejo. Primeiro a promessa, que é o que
 * justifica o pedido; depois o pedido, que é pequeno e está todo à vista;
 * depois o mapa, que é a primeira coisa que a pessoa recebe de volta, na
 * mesma sessão e sem pagar nada; e por último as interconexões do dia.
 *
 * Nenhum formulário aparece antes da promessa, e nenhum dado é pedido além
 * dos três que o cálculo exige. A cidade vira coordenadas aqui dentro, e é
 * das coordenadas que sai o fuso: ninguém precisa saber o próprio fuso de
 * 1988, e ninguém deveria precisar declarar isso.
 *
 * Os fatos desta tela são cálculo, então são de graça e ficam. O que é pago é
 * a leitura escrita deles, que ainda não existe.
 */
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { useI18n } from "@/components/i18n-provider"
import { fmt } from "@/lib/i18n"
import AstroWheel, { GlifoPlaneta } from "@/components/astro-wheel"
import { ASPECTOS, CORPOS, SIGNOS } from "@/lib/astro/nomes"
import type { MapaNatal } from "@/lib/astro/mapa"
import type { Interconexao } from "@/lib/astro/interconexoes"

type Cidade = { nome: string; regiao: string; pais: string; lat: number; lon: number; rotulo: string }
type Nascimento = { born_on: string; born_at: string | null; lat: number; lon: number; place_label: string; tz?: string }
type Resposta = {
  nascimento: Nascimento | null
  mapa: MapaNatal | null
  tzStatus?: "ok" | "ambiguous" | "nonexistent"
  dia?: string
  interconexoes?: Interconexao[]
}

const indiceDoSigno = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30)
const grauNoSigno = (lon: number) => (((lon % 30) + 30) % 30)
const numero = (x: number, casas = 2) => x.toFixed(casas).replace(".", ",")

/** Grau e minuto dentro do signo: 12°31, do jeito que uma efeméride escreve. */
function grauMinuto(lon: number): string {
  const dentro = grauNoSigno(lon)
  const grau = Math.floor(dentro)
  const minuto = Math.round((dentro - grau) * 60)
  return minuto === 60 ? `${grau + 1}°00` : `${grau}°${String(minuto).padStart(2, "0")}`
}

export default function InterconexoesPage({ initialUser }: { initialUser: User | null }) {
  const { dict, locale, formatDate } = useI18n()
  const t = dict.interconexoes as unknown as Record<string, string>
  const [estado, setEstado] = useState<Resposta | null>(null)
  const [carregando, setCarregando] = useState(Boolean(initialUser))
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    if (!initialUser) return
    fetch("/api/mapa")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEstado(d as Resposta))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [initialUser])

  const temMapa = Boolean(estado?.mapa) && !editando

  return (
    <div>
      {/* a explicação, que é o que justifica o pedido: ninguém entrega data,
          hora e cidade de nascimento antes de entender para quê */}
      {!temMapa && <Abertura t={t} exemplos={dict.interconexoes.examples} />}

      {carregando && <div className="h-24 mt-10 rounded bg-white/[0.04] animate-pulse" />}

      {!carregando && !temMapa && (
        <Formulario
          t={t}
          logado={Boolean(initialUser)}
          inicial={estado?.nascimento ?? null}
          aoSalvar={(r) => {
            setEstado(r)
            setEditando(false)
          }}
          aoCancelar={editando ? () => setEditando(false) : undefined}
        />
      )}

      {temMapa && estado?.mapa && (
        <>
          <Mapa mapa={estado.mapa} nascimento={estado.nascimento as Nascimento} tzStatus={estado.tzStatus} t={t} locale={locale} formatDate={formatDate} />
          <Hoje interconexoes={estado.interconexoes ?? []} dia={estado.dia ?? ""} t={t} locale={locale} formatDate={formatDate} />
          <button
            onClick={() => setEditando(true)}
            className="mt-12 text-white/25 hover:text-white/50 text-[11px] font-light transition-colors"
          >
            {t.edit}
          </button>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

/**
 * A abertura das Interconexões: o que isto é, antes de qualquer campo.
 *
 * A página pedia data, hora e cidade e parecia querer montar um mapa astral,
 * que é uma coisa que existe em qualquer lugar. Não é isso que ela faz. Ela
 * cruza duas camadas: uma que não muda mais, o céu do nascimento, e outra que
 * muda todo dia, o céu de agora.
 *
 * A ordem do texto é a ordem do entendimento: primeiro a ideia, depois o que
 * é a base fixa, depois o que se move, depois exemplos concretos do encontro
 * entre as duas, e só então a diferença em relação ao horóscopo de signo. Sem
 * nada disso, os três campos parecem um cadastro.
 */
function Abertura({ t, exemplos }: { t: Record<string, string>; exemplos: readonly string[] }) {
  return (
    <div className="max-w-xl">
      <h2 className="text-white instrument italic text-[25px] sm:text-[29px] leading-snug">{t.sameForAll}</h2>
      <p className="text-white/75 text-[15.5px] leading-relaxed font-light mt-5">{t.whatItDoes}</p>

      <div className="h-px bg-white/[0.07] mt-9" />

      <p className="text-white/60 text-[14.5px] leading-relaxed font-light mt-8">{t.natalIs}</p>
      <p className="text-white/60 text-[14.5px] leading-relaxed font-light mt-5">{t.skyMoves}</p>

      <ul className="mt-6 space-y-2">
        {exemplos.map((linha) => (
          <li key={linha} className="flex gap-3 text-white/50 text-[13.5px] leading-relaxed font-light">
            <span className="text-white/25 shrink-0">·</span>
            {linha}
          </li>
        ))}
      </ul>

      {/* a frase que a pessoa precisa levar embora */}
      <p className="text-white/85 instrument italic text-[19px] sm:text-xl leading-snug mt-9">{t.mapStays}</p>
      <p className="text-white/50 text-[14px] leading-relaxed font-light mt-2">{t.mapStaysBody}</p>

      <p className="text-white/60 text-[14.5px] leading-relaxed font-light mt-8">{t.vsHoroscope}</p>
    </div>
  )
}

function Formulario({
  t,
  logado,
  inicial,
  aoSalvar,
  aoCancelar,
}: {
  t: Record<string, string>
  logado: boolean
  inicial: Nascimento | null
  aoSalvar: (r: Resposta) => void
  aoCancelar?: () => void
}) {
  const [data, setData] = useState(inicial?.born_on ?? "")
  const [hora, setHora] = useState(inicial?.born_at ?? "")
  const [semHora, setSemHora] = useState(inicial ? inicial.born_at === null : false)
  const [cidade, setCidade] = useState<Cidade | null>(
    inicial ? { nome: inicial.place_label, regiao: "", pais: "", lat: inicial.lat, lon: inicial.lon, rotulo: inicial.place_label } : null,
  )
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const completo = Boolean(data) && Boolean(cidade) && (semHora || Boolean(hora))

  const salvar = async () => {
    if (!completo || !cidade) return
    setSalvando(true)
    setErro(null)
    const res = await fetch("/api/mapa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        born_on: data,
        born_at: semHora ? null : hora,
        lat: cidade.lat,
        lon: cidade.lon,
        place_label: cidade.rotulo,
      }),
    })
    const corpo = await res.json().catch(() => null)
    setSalvando(false)
    if (!res.ok) {
      setErro(corpo?.error ?? "")
      return
    }
    aoSalvar(corpo as Resposta)
  }

  return (
    <div className="mt-12 max-w-md">
      <h3 className="text-white/90 instrument italic text-xl">{t.formTitle}</h3>
      <p className="text-white/45 text-[13px] leading-relaxed font-light mt-2">{t.formBody}</p>

      <div className="mt-7 space-y-5">
        <div>
          <label className="block text-white/35 text-[10px] uppercase tracking-widest mb-2">{t.fieldDate}</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2.5 text-white/85 text-sm focus:outline-none focus:border-white/25 transition-colors [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block text-white/35 text-[10px] uppercase tracking-widest mb-2">{t.fieldTime}</label>
          <div className="flex items-center gap-4">
            <input
              type="time"
              value={hora}
              disabled={semHora}
              onChange={(e) => setHora(e.target.value)}
              className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2.5 text-white/85 text-sm focus:outline-none focus:border-white/25 transition-colors disabled:opacity-30 [color-scheme:dark]"
            />
            <label className="flex items-center gap-2 text-white/45 hover:text-white/70 text-[12px] font-light cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={semHora}
                onChange={(e) => setSemHora(e.target.checked)}
                className="accent-white/70"
              />
              {t.timeUnknown}
            </label>
          </div>
        </div>

        <CampoCidade t={t} cidade={cidade} aoEscolher={setCidade} />
      </div>

      {erro && <p className="text-white/70 text-[12.5px] leading-relaxed mt-5">{erro}</p>}

      <div className="flex items-center gap-4 mt-8">
        {logado ? (
          <button
            onClick={salvar}
            disabled={!completo || salvando}
            className="text-white/80 hover:text-white text-sm disabled:opacity-35 transition-colors"
          >
            {salvando ? `${t.saving}...` : t.save}
          </button>
        ) : (
          <Link href="/login" className="text-white/80 hover:text-white text-sm transition-colors">
            {t.signIn} ↗
          </Link>
        )}
        {aoCancelar && (
          <button onClick={aoCancelar} className="text-white/25 hover:text-white/50 text-[12px] transition-colors">
            {t.cancel}
          </button>
        )}
      </div>

      {!logado && <p className="text-white/30 text-[11.5px] font-light mt-3">{t.needAccount}</p>}
    </div>
  )
}

/** A cidade é escolhida de uma lista, nunca digitada solta: o que vale são as coordenadas. */
function CampoCidade({ t, cidade, aoEscolher }: { t: Record<string, string>; cidade: Cidade | null; aoEscolher: (c: Cidade | null) => void }) {
  const [texto, setTexto] = useState(cidade?.rotulo ?? "")
  const [achadas, setAchadas] = useState<Cidade[] | null>(null)
  const [procurando, setProcurando] = useState(false)
  const pedido = useRef(0)

  const procurar = useCallback(async (q: string) => {
    const meu = ++pedido.current
    if (q.trim().length < 2) {
      setAchadas(null)
      return
    }
    setProcurando(true)
    const res = await fetch(`/api/cidades?q=${encodeURIComponent(q)}`)
    const corpo = await res.json().catch(() => ({ cidades: [] }))
    // uma busca antiga não pode passar na frente da nova
    if (meu !== pedido.current) return
    setAchadas(corpo.cidades as Cidade[])
    setProcurando(false)
  }, [])

  useEffect(() => {
    if (cidade && texto === cidade.rotulo) return
    const id = setTimeout(() => void procurar(texto), 220)
    return () => clearTimeout(id)
  }, [texto, cidade, procurar])

  return (
    <div>
      <label className="block text-white/35 text-[10px] uppercase tracking-widest mb-2">{t.fieldCity}</label>
      <input
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          aoEscolher(null)
        }}
        placeholder={t.cityPlaceholder}
        autoComplete="off"
        className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2.5 text-white/85 text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
      />

      {!cidade && achadas !== null && (
        <div className="mt-2 space-y-0.5">
          {achadas.length === 0 && !procurando && <p className="text-white/30 text-[12px] font-light px-1 py-1">{t.cityNone}</p>}
          {achadas.map((c) => (
            <button
              key={`${c.rotulo}-${c.lat}-${c.lon}`}
              onClick={() => {
                aoEscolher(c)
                setTexto(c.rotulo)
                setAchadas(null)
              }}
              className="block w-full text-left px-2.5 py-2 rounded text-white/60 hover:text-white hover:bg-white/[0.06] text-[13px] font-light transition-colors"
            >
              {c.rotulo}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function Mapa({
  mapa,
  nascimento,
  tzStatus,
  t,
  locale,
  formatDate,
}: {
  mapa: MapaNatal
  nascimento: Nascimento
  tzStatus?: string
  t: Record<string, string>
  locale: string
  formatDate: (iso: string, estilo?: any) => string
}) {
  const signos = SIGNOS[locale as keyof typeof SIGNOS]
  const nomes = CORPOS[locale as keyof typeof CORPOS]

  return (
    <div>
      <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">{t.mapTitle}</p>
      <p className="text-white/40 text-[12.5px] leading-relaxed font-light mt-1.5">{t.mapSubtitle}</p>
      <h2 className="text-white instrument italic text-[24px] sm:text-[28px] leading-snug mt-3">{nascimento.place_label}</h2>
      <p className="text-white/35 text-[12.5px] font-light mt-1.5 tabular-nums">
        {formatDate(`${nascimento.born_on}T12:00:00`)}
        {nascimento.born_at ? ` · ${nascimento.born_at}` : ""}
        {mapa.tz ? ` · ${mapa.tz}` : ""}
      </p>

      {tzStatus === "ambiguous" && <p className="text-white/45 text-[12.5px] leading-relaxed font-light mt-3 max-w-lg">{t.ambiguous}</p>}
      {tzStatus === "nonexistent" && <p className="text-white/45 text-[12.5px] leading-relaxed font-light mt-3 max-w-lg">{t.nonexistent}</p>}

      {mapa.horaConhecida && mapa.cuspides && mapa.asc !== null && mapa.mc !== null && (
        <div className="flex justify-center mt-8 text-white/70">
          <AstroWheel
            corpos={mapa.corpos.map((c) => ({ id: c.corpo, lon: c.lon, retrogrado: c.retrogrado }))}
            cuspides={mapa.cuspides}
            asc={mapa.asc}
            mc={mapa.mc}
            aspectos={mapa.aspectos}
            signos={signos}
            tamanho={330}
          />
        </div>
      )}

      <div className="mt-9 space-y-2.5">
        {mapa.corpos.map((c) => (
          <div key={c.corpo} className="flex items-baseline gap-3 text-[13.5px]">
            <span className="text-white/40 w-4 shrink-0">
              <GlifoPlaneta id={c.corpo} tamanho={13} />
            </span>
            <span className="text-white/75 font-light w-[5.5rem] shrink-0">{nomes[c.corpo]}</span>
            <span className="text-white/90 tabular-nums">
              {c.signoDefinido ? `${grauMinuto(c.lon)} ${signos[c.signo]}` : signos[indiceDoSigno(c.lon)]}
            </span>
            {c.retrogrado && <span className="text-white/30 text-[11px]">℞</span>}
            {c.casa !== null && <span className="text-white/30 text-[11.5px]">{fmt(t.house, { n: c.casa })}</span>}
            {!c.signoDefinido && (
              <span className="text-white/30 text-[11px]">
                {fmt(t.uncertain, {
                  a: signos[indiceDoSigno(c.lon - c.incerteza / 2)],
                  b: signos[indiceDoSigno(c.lon + c.incerteza / 2)],
                })}
              </span>
            )}
          </div>
        ))}

        {mapa.asc !== null && (
          <div className="flex items-baseline gap-3 text-[13.5px] pt-1">
            <span className="w-4 shrink-0" />
            <span className="text-white/75 font-light w-[5.5rem] shrink-0">{t.asc}</span>
            <span className="text-white/90 tabular-nums">{`${grauMinuto(mapa.asc)} ${signos[indiceDoSigno(mapa.asc)]}`}</span>
          </div>
        )}
        {mapa.mc !== null && (
          <div className="flex items-baseline gap-3 text-[13.5px]">
            <span className="w-4 shrink-0" />
            <span className="text-white/75 font-light w-[5.5rem] shrink-0">{t.mc}</span>
            <span className="text-white/90 tabular-nums">{`${grauMinuto(mapa.mc)} ${signos[indiceDoSigno(mapa.mc)]}`}</span>
          </div>
        )}
      </div>

      {!mapa.horaConhecida && (
        <div className="mt-8 max-w-lg">
          <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">{t.noTimeTitle}</p>
          <p className="text-white/50 text-[13px] leading-relaxed font-light mt-2.5">{t.noTimeBody}</p>
        </div>
      )}

      <p className="text-white/30 text-[12.5px] font-light mt-7">{t.mapNote}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------

function Hoje({
  interconexoes,
  dia,
  t,
  locale,
  formatDate,
}: {
  interconexoes: Interconexao[]
  dia: string
  t: Record<string, string>
  locale: string
  formatDate: (iso: string, estilo?: any) => string
}) {
  const signos = SIGNOS[locale as keyof typeof SIGNOS]
  const nomes = CORPOS[locale as keyof typeof CORPOS]
  const aspectos = ASPECTOS[locale as keyof typeof ASPECTOS]

  const posicao = (lon: number) => `${grauMinuto(lon)} ${signos[indiceDoSigno(lon)]}`
  const nomeDoPonto = (id: string) => {
    if (id === "asc") return t.asc
    if (id === "mc") return t.mc
    if (id.startsWith("casa")) return fmt(t.house, { n: id.slice(4) })
    return nomes[id]
  }

  return (
    <div className="mt-16">
      <div className="h-px bg-white/[0.055]" />
      <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light mt-8">
        {t.todayTitle}
        {dia && <span className="text-white/20"> · {formatDate(`${dia}T12:00:00`)}</span>}
      </p>
      <p className="text-white/40 text-[12.5px] leading-relaxed font-light mt-1.5">{t.todaySubtitle}</p>

      {interconexoes.length === 0 ? (
        <p className="text-white/50 text-[14px] leading-relaxed font-light mt-5 max-w-lg">{t.none}</p>
      ) : (
        <div className="mt-7 space-y-9">
          {interconexoes.map((c, i) => {
            const corpoNatal = c.ponto.tipo === "corpo"
            const titulo =
              c.tipo === "posicao"
                ? fmt(t.crossing, { transito: nomes[c.transito], casa: nomeDoPonto(c.ponto.id) })
                : fmt(t.aspectWith, {
                    transito: nomes[c.transito],
                    aspecto: aspectos[c.aspecto],
                    artigo: c.ponto.id === "moon" ? "sua" : "seu",
                    ponto: `${nomeDoPonto(c.ponto.id)}${corpoNatal ? ` ${t.natal}` : ""}`,
                  })

            const fatos =
              c.tipo === "posicao"
                ? [
                    `${nomes[c.transito]} ${posicao(c.lonTransito)}`,
                    fmt(t.cuspAt, { casa: nomeDoPonto(c.ponto.id), posicao: posicao(c.ponto.lon) }),
                  ]
                : [
                    `${nomes[c.transito]} ${posicao(c.lonTransito)}${c.retroTransito ? " ℞" : ""}`,
                    `${nomeDoPonto(c.ponto.id)}${corpoNatal ? ` ${t.natal}` : ""} ${posicao(c.ponto.lon)}${c.ponto.retrogrado ? " ℞" : ""}`,
                    fmt(t.realAngle, { angulo: numero(c.separacao) }),
                    fmt(t.orb, { orbe: numero(c.orbe) }),
                    c.aplicativo ? t.applying : t.separating,
                  ]

            return (
              <div key={`${c.transito}-${c.ponto.id}-${c.aspecto}`}>
                <h3 className="text-white/95 instrument italic text-[19px] sm:text-xl leading-snug">{titulo}</h3>
                <p className="text-white/40 text-[12px] leading-relaxed font-light mt-2 tabular-nums">{fatos.join(" · ")}</p>
                {/* a leitura escrita destes fatos é a camada paga, e ainda não existe */}
                <div className="mt-3.5 space-y-2" aria-hidden="true">
                  {[96, 88].slice(0, i === 0 ? 2 : 1).map((largura, k) => (
                    <div key={k} className="h-[7px] rounded-full bg-white/[0.045]" style={{ width: `${largura}%` }} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-10 max-w-lg">
        <p className="text-white/45 text-[12.5px] leading-relaxed font-light">{t.readingPaid}</p>
        <p className="text-white/30 text-[12.5px] leading-relaxed font-light mt-1">{t.factsYours}</p>
      </div>
    </div>
  )
}
