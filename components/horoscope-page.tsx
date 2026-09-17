"use client"

/**
 * O horóscopo do dia: o signo, a pergunta do dia, três relações do céu e as
 * tendências. Embaixo, o céu calculado, sem interpretação.
 *
 * Cada relação é um pequeno diagrama de duas forças: os dois planetas em
 * colunas, o símbolo do ângulo entre elas e a tradução do que aquele ângulo
 * estabelece. Fechado, o card já diz quem, que relação e o que isso mobiliza
 * no signo. A explicação só aparece ao abrir, para a primeira tela não ser um
 * paredão de texto.
 *
 * A leitura vem da rota, que gera sob demanda: só o signo em que alguém
 * clicou é gerado, uma vez por dia, e daí em diante todo mundo lê o mesmo.
 */
import { useCallback, useEffect, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { GlifoPlaneta, GlifoSigno } from "@/components/astro-wheel"
import { DiagramaAngulo, DiagramaPosicao, FaseLua, RodaDoDia } from "@/components/astro-ilustracoes"
import { fmt } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import type { CardMovimento } from "@/lib/astro/apresentar"
import type { Ceu } from "@/lib/astro/ceu"
import type { Leitura, RelacaoEscrita } from "@/lib/astro/prompt-horoscopo"
import { ASPECTOS, CORPOS, SIGNOS } from "@/lib/astro/nomes"
import { LENTOS, SIMBOLO_ASPECTO } from "@/lib/astro/simbolos"

type Resposta = {
  dia: string
  signo: number
  nomeSigno: string
  linhaSigno: string
  cards: CardMovimento[]
  ceu: Ceu
  leitura: Leitura | null
}

const CHAVE = "multioraculo:signo"

/** O card traz o nome do ângulo traduzido; o desenho precisa da chave do motor. */
function chaveDoAspecto(card: CardMovimento): string {
  return card.mencoes.aspectos[0] ?? "conjunction"
}

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} style={{ animation: "oracle-spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return <p className="text-white/25 text-[10px] uppercase tracking-widest">{children}</p>
}

/** Uma coluna do card: glifo, nome, e os verbos onde o contraste fica visível. */
function Coluna({ lado, alinhamento }: { lado: CardMovimento["a"]; alinhamento: "esquerda" | "direita" }) {
  const direita = alinhamento === "direita"
  return (
    <div className={`flex-1 ${direita ? "sm:text-right sm:items-end" : ""} flex flex-col`}>
      <span className={`text-white/70 ${direita ? "sm:self-end" : "self-start"}`}>
        <GlifoPlaneta id={lado.corpo} tamanho={22} />
      </span>
      <span className="text-white text-[13px] tracking-[0.08em] mt-2">{lado.nome.toUpperCase()}</span>
      {lado.regente && lado.rotuloRegente && (
        <span className="text-white/35 text-[9px] uppercase tracking-[0.12em] mt-0.5">{lado.rotuloRegente}</span>
      )}
      <span className="text-white/65 text-[12px] leading-[1.75] mt-2">
        {lado.verbos.map((verbo) => (
          <span key={verbo} className="block">
            {verbo}
          </span>
        ))}
      </span>
    </div>
  )
}

function CardRelacao({
  card,
  relacao,
  rotuloEm,
  rotuloNo,
  signos,
  lons,
  aberto,
}: {
  card: CardMovimento
  relacao: RelacaoEscrita | null
  rotuloEm: string
  rotuloNo: string
  signos: string[]
  lons: Partial<Record<string, number>>
  aberto: boolean
}) {
  // num aspecto o lado direito é o outro planeta; numa posição é o campo por
  // onde ele passa, que é o signo
  const campo = card.b ? null : signos[card.mencoes.signos[0] ?? 0]
  const lonA = lons[card.a.corpo]
  const lonB = card.b ? lons[card.b.corpo] : undefined
  const diagrama =
    card.b && card.simbolo && lonA !== undefined && lonB !== undefined ? (
      <DiagramaAngulo aLon={lonA} bLon={lonB} aspecto={chaveDoAspecto(card)} />
    ) : lonA !== undefined ? (
      <DiagramaPosicao lon={lonA} />
    ) : null
  const conteudo = (
    <>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Coluna lado={card.a} alinhamento="direita" />

        <div className="flex sm:flex-col items-center justify-center gap-2 sm:w-20 shrink-0">
          <span className="h-px flex-1 sm:flex-none sm:h-8 sm:w-px bg-white/15" />
          <span className={card.simbolo ? "text-white/75 text-lg leading-none" : "text-white/45 text-[10px] uppercase tracking-[0.16em]"}>
            {card.simbolo ?? rotuloNo}
          </span>
          <span className="h-px flex-1 sm:flex-none sm:h-8 sm:w-px bg-white/15" />
        </div>

        {card.b ? (
          <Coluna lado={card.b} alinhamento="esquerda" />
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-white text-[13px] tracking-[0.08em]">{(campo ?? "").toUpperCase()}</span>
            <span className="text-white/45 text-[11px] mt-1 tabular-nums">{card.detalhe}</span>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-black/20 px-3 py-3 flex items-center gap-3">
        {diagrama && <span className="text-white/70">{diagrama}</span>}
        <div className="min-w-0">
          {card.b ? (
            <p className="text-white/80 text-[10px] uppercase tracking-[0.14em]">
              {card.titulo}
              <span className="text-white/40 normal-case tracking-normal"> {card.detalhe}</span>
            </p>
          ) : (
            <p className="text-white/80 text-[10px] uppercase tracking-[0.14em]">{card.titulo}</p>
          )}
          <p className="text-white/55 text-[11.5px] leading-relaxed mt-1">{card.glosa}</p>
        </div>
      </div>

      {relacao && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <Rotulo>{rotuloEm}</Rotulo>
          <p className="text-white text-[13.5px] tracking-[0.05em] leading-relaxed mt-1.5 uppercase">
            {relacao.polaridade[0]} <span className="text-white/40">×</span> {relacao.polaridade[1]}
          </p>
        </div>
      )}
    </>
  )

  if (!relacao) {
    return <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10">{conteudo}</div>
  }

  return (
    <details
      open={aberto}
      className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10 [&[open]]:bg-white/[0.07]"
    >
      <summary className="list-none cursor-pointer marker:hidden [&::-webkit-details-marker]:hidden">{conteudo}</summary>
      <p className="text-white/75 text-[13px] leading-relaxed mt-4">{relacao.explicacao}</p>
    </details>
  )
}

function CeuDeHoje({ ceu, locale, t }: { ceu: Ceu; locale: Locale; t: Record<string, string> }) {
  const nome = CORPOS[locale]
  const signos = SIGNOS[locale]
  const aspectos = ASPECTOS[locale]
  const numero = (n: number) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))
  const pessoais = ceu.aspectos.filter((a) => !(LENTOS.has(a.a) && LENTOS.has(a.b)))
  const coletivos = ceu.aspectos.filter((a) => LENTOS.has(a.a) && LENTOS.has(a.b))

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <Rotulo>{t.sky}</Rotulo>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 mt-4">
        {ceu.posicoes.map((p) => (
          <div key={p.corpo} className="flex items-center gap-2 text-white/65 text-[12px] tabular-nums">
            <span className="text-white/45">
              <GlifoPlaneta id={p.corpo} tamanho={14} />
            </span>
            <span>
              {numero(p.grau)}° {signos[p.signo]}
              {p.retrogrado && <span className="text-white/40"> ℞</span>}
            </span>
            {p.corpo === "moon" && (
              <span className="text-white/55">
                <FaseLua fase={ceu.faseLua} tamanho={16} />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
        {pessoais.map((a) => (
          <div key={`${a.a}-${a.b}-${a.aspecto}`} className="flex items-center gap-2 text-white/65 text-[12px]">
            <span className="flex items-center gap-1 text-white/45">
              <GlifoPlaneta id={a.a} tamanho={14} />
              <span className="text-white/70">{SIMBOLO_ASPECTO[a.aspecto]}</span>
              <GlifoPlaneta id={a.b} tamanho={14} />
            </span>
            <span className="tabular-nums">
              {nome[a.a]} {aspectos[a.aspecto]} {nome[a.b]}, {t.orb} {numero(a.orbe)}°,{" "}
              {a.aplicativo ? t.applying : t.separating}
            </span>
          </div>
        ))}
      </div>

      {coletivos.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-white/30 text-[11px] leading-relaxed">{t.collective}</p>
          <div className="mt-2 space-y-1">
            {coletivos.map((a) => (
              <p key={`${a.a}-${a.b}-${a.aspecto}`} className="text-white/45 text-[12px] tabular-nums">
                {nome[a.a]} {aspectos[a.aspecto]} {nome[a.b]}, {t.orb} {numero(a.orbe)}°
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="text-white/30 text-xs mt-4 pt-3 border-t border-white/10">{t.skyNote}</p>
    </div>
  )
}

export default function HoroscopePage({ ceu }: { ceu: Ceu }) {
  const { dict, locale, formatDate } = useI18n()
  const t = dict.horoscope
  const signos = SIGNOS[locale]

  const [signo, setSigno] = useState<number | null>(null)
  const [dados, setDados] = useState<Resposta | null>(null)
  const [carregando, setCarregando] = useState(false)

  const buscar = useCallback(async (indice: number) => {
    setCarregando(true)
    setDados(null)
    try {
      const res = await fetch(`/api/horoscopo?signo=${indice}`)
      setDados((await res.json()) as Resposta)
    } catch {
      setDados(null)
    } finally {
      setCarregando(false)
    }
  }, [])

  // o signo escolhido fica no navegador: é preferência, não dado de conta
  useEffect(() => {
    let guardado: string | null = null
    try {
      guardado = localStorage.getItem(CHAVE)
    } catch {
      guardado = null
    }
    const indice = Number(guardado)
    if (guardado !== null && Number.isInteger(indice) && indice >= 0 && indice < 12) {
      setSigno(indice)
      void buscar(indice)
    }
  }, [buscar])

  const escolher = (indice: number) => {
    if (indice === signo) return
    setSigno(indice)
    try {
      localStorage.setItem(CHAVE, String(indice))
    } catch {
      // navegação privada: a escolha vale só para esta visita
    }
    void buscar(indice)
  }

  const leitura = dados?.leitura ?? null
  const rotuloEm = dados ? fmt(t.inSign, { signo: dados.nomeSigno }) : ""

  return (
    <div className="space-y-8">
      <p className="text-white/60 text-base leading-relaxed max-w-xl">{t.intro}</p>

      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 flex flex-col items-center">
        <span className="text-white/70">
          <RodaDoDia ceu={ceu} tamanho={250} />
        </span>
        <div className="flex items-center gap-2 mt-3 text-white/45 text-xs">
          <FaseLua fase={ceu.faseLua} tamanho={18} />
          <span>{formatDate(`${ceu.dia}T12:00:00`)}</span>
        </div>
      </div>

      <div>
        <Rotulo>{t.chooseSign}</Rotulo>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
          {signos.map((nome, i) => {
            const ativo = i === signo
            return (
              <button
                key={nome}
                type="button"
                onClick={() => escolher(i)}
                aria-pressed={ativo}
                className={`rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 ${
                  ativo
                    ? "bg-white/15 border-white/30 text-white"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <GlifoSigno indice={i} tamanho={17} className={ativo ? "text-white/85" : "text-white/45"} />
                  <span className="block text-sm instrument italic">{nome}</span>
                </span>
                <span className="block text-[10px] text-white/35 tabular-nums mt-0.5">{t.dates[i]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {carregando && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-3 py-6 text-white/50 text-sm">
            <Spinner className="w-4 h-4 text-white/40" />
            {t.loading}
          </div>
        </div>
      )}

      {dados && !carregando && (
        <div className="space-y-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-white text-3xl instrument italic">{dados.nomeSigno}</h2>
            <p className="text-white/55 text-[13px] mt-2">{dados.linhaSigno}</p>

            {leitura ? (
              <div className="mt-5 pt-4 border-t border-white/10">
                <Rotulo>{t.focus}</Rotulo>
                <p className="text-white text-2xl instrument italic leading-snug mt-2">{leitura.foco}</p>
              </div>
            ) : (
              <p className="text-white/55 text-sm leading-relaxed mt-5 pt-4 border-t border-white/10">{t.unavailable}</p>
            )}
          </div>

          {dados.cards.length > 0 && (
            <div className="space-y-3">
              <Rotulo>{t.relations}</Rotulo>
              {dados.cards.map((card, i) => (
                <CardRelacao
                  key={card.id}
                  card={card}
                  relacao={leitura?.relacoes[i] ?? null}
                  rotuloEm={rotuloEm}
                  rotuloNo={t.inWord}
                  signos={signos}
                  lons={Object.fromEntries(dados.ceu.posicoes.map((p) => [p.corpo, p.lon]))}
                  aberto={i === 0}
                />
              ))}
            </div>
          )}

          {leitura && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <Rotulo>{t.trends}</Rotulo>
              <p className="text-white/80 text-base leading-relaxed mt-3">{leitura.tendencias.texto}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10">
                <div>
                  <Rotulo>{t.available}</Rotulo>
                  <p className="text-white/70 text-[13px] leading-relaxed mt-1.5">{leitura.tendencias.disponivel}</p>
                </div>
                <div>
                  <Rotulo>{t.atStake}</Rotulo>
                  <p className="text-white/70 text-[13px] leading-relaxed mt-1.5">{leitura.tendencias.emJogo}</p>
                </div>
              </div>
            </div>
          )}

          <CeuDeHoje ceu={dados.ceu} locale={locale} t={t as unknown as Record<string, string>} />
        </div>
      )}
    </div>
  )
}
