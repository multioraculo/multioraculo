"use client"

/**
 * O horóscopo do dia: a roda do céu, o foco, três relações e os fatos
 * calculados.
 *
 * Cada relação é um pequeno diagrama, e a FORMA dele vem da geometria, não da
 * diagramação: oposição e quadratura mostram dois termos em tensão; sextil e
 * trígono mostram dois termos que se somam, sem conflito fabricado; uma
 * posição não recebe termo nenhum. Fechado, o card já diz quem, que relação e
 * o que ela mobiliza. A explicação aparece ao abrir.
 *
 * A leitura vem da rota, que gera sob demanda: só o signo em que alguém
 * clicou é gerado, uma vez por dia, e daí em diante todo mundo lê o mesmo.
 */
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { GlifoPlaneta, GlifoSigno } from "@/components/astro-wheel"
import { DiagramaAngulo, DiagramaPosicao, FaseLua, RodaDoDia } from "@/components/astro-ilustracoes"
import { fmt } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import type { CardMovimento } from "@/lib/astro/apresentar"
import type { Ceu } from "@/lib/astro/ceu"
import type { Leitura, RelacaoEscrita } from "@/lib/astro/prompt-horoscopo"
import { ASPECTOS, CORPOS, FASES, LUNACOES, SIGNOS } from "@/lib/astro/nomes"
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

/** Uma coluna do card: glifo, nome, onde ele está, e o que ele faz. */
function Coluna({ lado, alinhamento }: { lado: CardMovimento["a"]; alinhamento: "esquerda" | "direita" }) {
  const direita = alinhamento === "direita"
  return (
    <div className={`flex-1 ${direita ? "sm:text-right sm:items-end" : ""} flex flex-col`}>
      <span className={`text-white/70 ${direita ? "sm:self-end" : "self-start"}`}>
        <GlifoPlaneta id={lado.corpo} tamanho={22} />
      </span>
      <span className="text-white text-[13px] tracking-[0.08em] mt-2">{lado.nome.toUpperCase()}</span>
      <span className="text-white/45 text-[11px] mt-0.5 tabular-nums">
        {lado.nomeSigno} {lado.grauTexto}
        {lado.retrogrado && <span className="text-white/40"> ℞</span>}
      </span>
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

/** Os termos, com o sinal que a forma do movimento pede. */
function Termos({
  relacao,
  card,
  rotuloEm,
  t,
}: {
  relacao: RelacaoEscrita
  card: CardMovimento
  rotuloEm: string
  t: Record<string, string>
}) {
  if (!relacao.termos.length) return null
  const sinal = card.forma === "contraste" ? "×" : card.forma === "convergencia" ? "·" : "+"
  const rotulo = card.forma === "contraste" ? rotuloEm : card.forma === "convergencia" ? t.convergence : t.articulation
  return (
    <div className="mt-4 pt-3 border-t border-white/10">
      <Rotulo>{rotulo}</Rotulo>
      <p className="text-white text-[13.5px] tracking-[0.05em] leading-relaxed mt-1.5 uppercase">
        {relacao.termos[0]?.texto} <span className="text-white/40">{sinal}</span> {relacao.termos[1]?.texto}
      </p>
    </div>
  )
}

function CardRelacao({
  card,
  relacao,
  rotuloEm,
  rotuloNo,
  lons,
  aberto,
  t,
}: {
  card: CardMovimento
  relacao: RelacaoEscrita | null
  rotuloEm: string
  rotuloNo: string
  lons: Partial<Record<string, number>>
  aberto: boolean
  t: Record<string, string>
}) {
  const lonA = lons[card.a.corpo]
  const lonB = card.b ? lons[card.b.corpo] : undefined
  const diagrama =
    card.b && card.aspecto && lonA !== undefined && lonB !== undefined ? (
      <DiagramaAngulo aLon={lonA} bLon={lonB} aspecto={card.aspecto} />
    ) : lonA !== undefined ? (
      <DiagramaPosicao lon={lonA} />
    ) : null

  const conteudo = (
    <>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Coluna lado={card.a} alinhamento="direita" />

        <div className="flex sm:flex-col items-center justify-center gap-2 sm:w-20 shrink-0">
          <span className="h-px flex-1 sm:flex-none sm:h-8 sm:w-px bg-white/15" />
          <span
            className={
              card.simbolo
                ? "text-white/75 text-lg leading-none"
                : "text-white/45 text-[10px] uppercase tracking-[0.16em]"
            }
          >
            {card.simbolo ?? rotuloNo}
          </span>
          <span className="h-px flex-1 sm:flex-none sm:h-8 sm:w-px bg-white/15" />
        </div>

        {card.b ? (
          <Coluna lado={card.b} alinhamento="esquerda" />
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-white text-[13px] tracking-[0.08em]">{card.a.nomeSigno.toUpperCase()}</span>
            <span className="text-white/45 text-[11px] mt-1 leading-relaxed">{card.a.campo}</span>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-black/20 px-3 py-3 flex items-center gap-3">
        {diagrama && <span className="text-white/70">{diagrama}</span>}
        <div className="min-w-0">
          <p className="text-white/80 text-[10px] uppercase tracking-[0.14em]">
            {card.titulo}
            <span className="text-white/40 normal-case tracking-normal"> {card.detalhe}</span>
          </p>
          <p className="text-white/55 text-[11.5px] leading-relaxed mt-1">{card.glosa}</p>
        </div>
      </div>

      {card.contexto.length > 0 && (
        <p className="text-white/35 text-[11px] leading-relaxed mt-3">
          <span className="uppercase tracking-[0.12em] text-white/25">{t.alsoToday}</span> {card.contexto.join("; ")}
        </p>
      )}

      {relacao && <Termos relacao={relacao} card={card} rotuloEm={rotuloEm} t={t} />}
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

/**
 * O dia em resumo, logo abaixo da roda: o que o céu está fazendo hoje, dito em
 * signos e em palavras, antes de qualquer escolha de signo.
 *
 * Não repete a tabela do fim da página. Lá estão os graus e os orbes de tudo;
 * aqui está só o que muda a cara do dia: onde estão os luminares e a fase da
 * Lua, onde andam os outros, quem está retrógrado, qual é o ângulo mais
 * fechado, e o acontecimento do dia quando existe um. Tudo calculado.
 */
function ResumoDoDia({ ceu, locale, t }: { ceu: Ceu; locale: Locale; t: Record<string, string> }) {
  const nome = CORPOS[locale]
  const signos = SIGNOS[locale]
  const aspectos = ASPECTOS[locale]
  const numero = (n: number) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))
  const onde = (corpo: string) => ceu.posicoes.find((p) => p.corpo === corpo)

  const sol = onde("sun")
  const lua = onde("moon")
  const luminares =
    sol && lua
      ? `${nome.sun} ${t.inWord} ${signos[sol.signo]} · ${nome.moon} ${FASES[locale][ceu.faseLua]} ${t.inWord} ${signos[lua.signo]}`
      : ""

  const demais = ceu.posicoes
    .filter((p) => p.corpo !== "sun" && p.corpo !== "moon")
    .map((p) => `${nome[p.corpo]} ${t.inWord} ${signos[p.signo]}`)
    .join(" · ")

  const retrogrados = ceu.posicoes.filter((p) => p.retrogrado).map((p) => nome[p.corpo])

  // o mais exato entre os que mudam de semana para semana: dois lentos a três
  // graus um do outro são o pano de fundo de anos, e não a notícia de hoje
  const pessoais = ceu.aspectos.filter((a) => !(LENTOS.has(a.a) && LENTOS.has(a.b)))
  const maisExato = pessoais.slice().sort((a, b) => a.orbe - b.orbe)[0]

  const acontecimentos = ceu.eventos.map((e) => {
    if (e.tipo === "lunacao") return fmt(t.summaryLunation, { fase: LUNACOES[locale][e.fase] ?? e.fase, signo: signos[e.signo] })
    if (e.tipo === "ingresso") return fmt(t.summaryEnters, { corpo: nome[e.corpo], signo: signos[e.signo] })
    if (e.tipo === "estacao") {
      const chave = e.sentido === "direct" ? t.summaryStationDirect : t.summaryStationRetro
      return fmt(chave, { corpo: nome[e.corpo] })
    }
    return fmt(e.especie === "solar" ? t.summaryEclipseSolar : t.summaryEclipseLunar, { signo: signos[e.signo] })
  })

  return (
    <div>
      <Rotulo>{t.summary}</Rotulo>
      <div className="mt-3 space-y-1.5 text-white/65 text-[12.5px] leading-relaxed font-light">
        {luminares && <p className="text-white/80">{luminares}</p>}
        {demais && <p>{demais}</p>}
        <p>{retrogrados.length ? fmt(t.summaryRetro, { corpos: retrogrados.join(", ") }) : t.summaryNoRetro}</p>
        {maisExato && (
          <p className="tabular-nums">
            {fmt(t.summaryTightest, {
              texto: `${nome[maisExato.a]} ${aspectos[maisExato.aspecto]} ${nome[maisExato.b]}, ${t.orb} ${numero(maisExato.orbe)}°`,
            })}
          </p>
        )}
        {acontecimentos.map((texto) => (
          <p key={texto} className="text-white/85">
            {texto}
          </p>
        ))}
      </div>
    </div>
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
  const rotulos = t as unknown as Record<string, string>

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

        <div className="w-full mt-5 pt-4 border-t border-white/10">
          <ResumoDoDia ceu={ceu} locale={locale} t={rotulos} />
        </div>
      </div>

      {/* a passagem para o mapa vem antes da escolha do signo: o céu desenhado
          acima é de todo mundo, e é esse o momento de dizer que ele não toca
          todo mundo no mesmo lugar */}
      <ChamadaDoMapa t={dict.interconexoes as unknown as Record<string, string>} />

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
                  lons={Object.fromEntries(dados.ceu.posicoes.map((p) => [p.corpo, p.lon]))}
                  aberto={i === 0}
                  t={rotulos}
                />
              ))}
            </div>
          )}

          <CeuDeHoje ceu={dados.ceu} locale={locale} t={rotulos} />
        </div>
      )}
    </div>
  )
}

/**
 * A passagem do coletivo para o pessoal, no fim da página e não antes dela.
 *
 * Aqui a pessoa acabou de ver a roda do dia e a nota de que aquele céu vale
 * para todo mundo. É esse o momento em que "seu signo é só uma parte" deixa
 * de ser argumento de venda e vira a conclusão do que está na tela. Por isso
 * a chamada não é um anúncio à parte nem um botão de assinatura: é a última
 * camada da mesma leitura.
 */
function ChamadaDoMapa({ t }: { t: Record<string, string> }) {
  return (
    <div className="pt-6">
      <div className="h-px bg-white/10" />
      <div className="mt-8 max-w-lg">
        <h2 className="text-white instrument italic text-[23px] sm:text-[26px] leading-snug">{t.callTitle}</h2>
        <p className="text-white/65 text-[14px] leading-relaxed font-light mt-3.5">{t.callLead}</p>
        <p className="text-white/65 text-[14px] leading-relaxed font-light">{t.callBody}</p>
        <Link
          href="/interconexoes"
          className="group inline-flex items-baseline gap-2 mt-6 text-white/85 hover:text-white text-[14.5px] transition-colors"
        >
          {t.callCta}
          <span className="text-white/25 group-hover:text-white/50 text-[11px] transition-colors">↗</span>
        </Link>
        {/* o tamanho do pedido fica à vista antes do clique */}
        <p className="text-white/25 text-[11px] font-light mt-2.5">{t.callFields}</p>
      </div>
    </div>
  )
}
