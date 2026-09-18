"use client"

/**
 * A Home: o dia, em voz baixa.
 *
 * Sem caixas. A hierarquia vem de escala, espaço e dois filetes finos. Quase
 * não há botões: o bloco do horóscopo inteiro é clicável, o Diário tem uma
 * linha, e a tiragem não tem link nenhum, porque a leitura dela acontece ali
 * mesmo.
 *
 * A ordem conta uma história: o céu de hoje (a Lua, igual para todos), a
 * leitura do seu signo, a tiragem coletiva do dia, o que ficou de hoje, e o
 * tempo que você conta.
 *
 * Nada aqui recalcula o que já existe. A Lua é a MESMA do painel do usuário,
 * pelo mesmo componente. As cartas são as mesmas lâminas da consulta. O
 * horóscopo é a leitura já gerada.
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { useI18n } from "@/components/i18n-provider"
import { fmt } from "@/lib/i18n"
import MoonToday from "@/components/moon-today"
import MarcosHome from "@/components/marcos-home"
import { guardarPerguntaEscolhida, usePerguntaSugerida } from "@/components/perguntas-sugeridas"
import FocusCard, { useFocusCard } from "@/components/focus-card"
import { TarotCapsule } from "@/components/tarot-spread"
import { LenormandCard } from "@/components/lenormand-table"
import { SIGNOS } from "@/lib/astro/nomes"
import type { Leitura } from "@/lib/astro/prompt-horoscopo"
import type { TiragemDoDia } from "@/lib/oracles/tiragem-dia"

export type RegistroDeHoje = { titulo: string; hoje: boolean } | null

type RespostaTiragem = { dia: string; tiragem: TiragemDoDia; eixo: [string, string] | null; sintese: string | null }
type RespostaHoroscopo = { nomeSigno: string; leitura: Leitura | null }

const CHAVE_SIGNO = "multioraculo:signo"
const GLIFOS_SIGNO = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]

/** As duas cartas têm proporções diferentes; estas larguras as deixam da mesma altura. */
const LARGURA_TAROT = 104
const LARGURA_LENORMAND = 124

const semNumero = (nome: string) => nome.replace(/^\d{1,2}\s*[—–-]\s*/, "")

export default function HomeHoje({ initialUser, registro }: { initialUser: User | null; registro: RegistroDeHoje }) {
  const { dict, locale, formatDate } = useI18n()
  const t = dict.home
  const ti = dict.interconexoes
  const [tiragem, setTiragem] = useState<RespostaTiragem | null>(null)
  const [horoscopo, setHoroscopo] = useState<RespostaHoroscopo | null>(null)
  const [signo, setSigno] = useState<number | null>(null)
  const [hoje, setHoje] = useState("")
  // a leitura coletiva do céu, para quem ainda não escolheu signo
  const [ceuDoDia, setCeuDoDia] = useState<{ factual: string[]; sintese: string | null } | null>(null)
  // null enquanto não se sabe: assim a chamada não pisca para quem já tem mapa
  const [mapa, setMapa] = useState<{ temMapa: boolean; primeira: string | null } | null>(
    initialUser ? null : { temMapa: false, primeira: null },
  )

  useEffect(() => {
    setHoje(
      new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
    )
    fetch("/api/tiragem-dia")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setTiragem(d as RespostaTiragem))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/ceu-dia")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCeuDoDia({ factual: d.factual ?? [], sintese: d.sintese ?? null }))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!initialUser) return
    fetch("/api/mapa")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMapa({ temMapa: Boolean(d?.mapa), primeira: null }))
      .catch(() => setMapa({ temMapa: false, primeira: null }))
  }, [initialUser])

  // o signo mora no navegador, escolhido na página do Horóscopo. É ele, e não
  // a sessão, que decide se há leitura pessoal para mostrar: quem escolheu
  // Virgem sem conta continua tendo a leitura de Virgem
  useEffect(() => {
    let guardado: string | null = null
    try {
      guardado = localStorage.getItem(CHAVE_SIGNO)
    } catch {
      guardado = null
    }
    const indice = Number(guardado)
    if (guardado === null || !Number.isInteger(indice) || indice < 0 || indice > 11) return
    setSigno(indice)
    fetch(`/api/horoscopo?signo=${indice}`)
      .then((r) => r.json())
      .then((d) => setHoroscopo(d as RespostaHoroscopo))
      .catch(() => {})
  }, [])

  const data = hoje ? formatDate(`${hoje}T12:00:00`) : ""
  const foco = horoscopo?.leitura?.foco ?? null
  const primeiraFrase = horoscopo?.leitura?.relacoes[0]?.explicacao?.split(/(?<=[.!?])\s+/)[0] ?? null

  return (
    <div>
      {/* o nome e o território, uma vez só */}
      <h1 className="text-white instrument italic text-[34px] sm:text-[40px] leading-none">Multioráculo</h1>
      <p className="text-white/45 text-[13.5px] font-light mt-2.5">{t.brandSubtitle}</p>

      <div className="h-14" />

      {/* HOJE, e a Lua: o céu, igual para todos */}
      <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">
        {t.today}
        {data && <span className="text-white/20"> · {data}</span>}
      </p>
      <div className="mt-7 min-h-[140px]">
        <MoonToday variante="ampla" />
      </div>

      <div className="h-px bg-white/[0.055] mt-7" />

      {/* O HORÓSCOPO, em três níveis: o céu, o signo, o mapa */}
      <HoroscopoDaHome
        signo={signo}
        foco={foco}
        ceu={ceuDoDia}
        mapa={mapa}
        t={t as unknown as Record<string, string>}
        ti={ti as unknown as Record<string, string>}
        locale={locale}
      />

      {/* A TIRAGEM COLETIVA: a leitura acontece aqui, sem link */}
      <div className="h-16 sm:h-20" />

      {/* dois níveis, e o rótulo em cima diz qual é qual antes da pergunta */}
      <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">{t.drawCollective}</p>
      <h2 className="text-white/95 instrument italic text-[21px] sm:text-2xl leading-snug mt-2.5">{t.drawQuestion}</h2>

      <div className="flex items-end justify-center gap-5 mt-8">
        {tiragem ? (
          <CartasDoDia tiragem={tiragem} />
        ) : (
          <>
            <div className="rounded-[6px] bg-white/[0.04] animate-pulse" style={{ width: LARGURA_TAROT, height: 201 }} />
            <div className="rounded-[6px] bg-white/[0.04] animate-pulse" style={{ width: LARGURA_LENORMAND, height: 200 }} />
          </>
        )}
      </div>

      {tiragem && (
        <p className="text-center instrument italic text-white/90 text-base mt-7">
          {tiragem.tiragem.tarot.nome}
          <span className="not-italic text-white/25 text-sm px-1.5">×</span>
          {semNumero(tiragem.tiragem.lenormand.nome)}
        </p>
      )}

      {tiragem?.eixo && (
        <p className="text-center text-white/30 text-[10px] tracking-[0.16em] font-light mt-2.5">
          {tiragem.eixo[0]} · {tiragem.eixo[1]}
        </p>
      )}

      {tiragem?.sintese ? (
        <p className="text-white/80 text-[14.5px] leading-[1.78] font-light mt-6">{tiragem.sintese}</p>
      ) : tiragem ? (
        <p className="text-white/35 text-[13px] leading-relaxed font-light mt-6">{t.drawWaiting}</p>
      ) : null}

      {/* o segundo nível: a mesma pergunta do dia, agora virada para dentro.
          A consulta começa por uma pergunta, e a pergunta já está ali */}
      {tiragem && <ConviteDePergunta rotulo={t.drawPersonal} convite={t.andYouToday} />}

      {/* O DIÁRIO, quase um rodapé */}
      <div className="h-16" />
      <div className="h-px bg-white/[0.055]" />

      <Link href="/diario" className="group block mt-7">
        {registro?.hoje ? (
          <>
            <p className="text-white/40 text-xs font-light">{t.diaryToday}</p>
            <p className="text-white/75 text-[15px] leading-relaxed font-light mt-2 line-clamp-2">{registro.titulo}</p>
            <span className="block text-white/25 group-hover:text-white/45 text-[11px] font-light mt-3 transition-colors">
              {t.diaryContinue} ↗
            </span>
          </>
        ) : (
          <>
            <h2 className="text-white/90 instrument italic text-lg">{t.diaryQuestion}</h2>
            <span className="block text-white/25 group-hover:text-white/45 text-[11px] font-light mt-2 transition-colors">
              {t.diaryCta} ↗
            </span>
          </>
        )}
      </Link>

      {/* MARCOS: o tempo que a pessoa conta */}
      <MarcosHome logado={Boolean(initialUser)} />
    </div>
  )
}

/**
 * As duas cartas do dia, consultáveis como as da leitura.
 *
 * Mesma peça e mesmo gesto do resultado do Multioráculo: um toque tira a carta
 * da mesa e a mostra maior, outro a vira, e o terceiro devolve. Quem faz isso é
 * o FocusCard, que já existia; aqui ele só é chamado.
 *
 * São duas instâncias e não uma porque as lâminas têm proporções diferentes, e
 * o FocusCard recebe uma proporção por vez. Cada carta tem o seu foco.
 */
function CartasDoDia({ tiragem }: { tiragem: RespostaTiragem }) {
  const { dict } = useI18n()
  const focoTarot = useFocusCard()
  const focoLenormand = useFocusCard()
  const tarot = tiragem.tiragem.tarot
  const lenormand = tiragem.tiragem.lenormand
  const nomeLenormand = semNumero(lenormand.nome)
  // a leitura do dia é do CRUZAMENTO das duas, então é ela que aparece no
  // verso de qualquer uma: não existe leitura separada por carta
  const leitura = tiragem.sintese ?? undefined
  const orientacao = tarot.invertida ? dict.tarot.reversed : dict.tarot.upright

  return (
    <>
      <div className={focoTarot.focusedIndex === 0 ? "fc-away" : ""}>
        <button
          type="button"
          className="fc-btn"
          onClick={() => focoTarot.open(0)}
          aria-label={`${tarot.nome}. ${dict.focus.open}`}
        >
          <TarotCapsule card={tarot.carta} name={tarot.nome} label={tarot.nome} width={LARGURA_TAROT} />
        </button>
      </div>

      <div className={focoLenormand.focusedIndex === 0 ? "fc-away" : ""}>
        <button
          type="button"
          className="fc-btn"
          onClick={() => focoLenormand.open(0)}
          aria-label={`${nomeLenormand}. ${dict.focus.open}`}
        >
          <LenormandCard
            index={lenormand.indice}
            name={nomeLenormand}
            style={{ ["--ln-cw" as string]: `${LARGURA_LENORMAND}px` }}
          />
        </button>
      </div>

      <FocusCard
        state={focoTarot.state}
        items={[{ position: dict.oracles.tarot, name: tarot.nome, orientation: orientacao, meaning: leitura }]}
        renderFront={() => (
          <div style={{ transform: tarot.carta.reversed ? "rotate(180deg)" : undefined }}>
            <TarotCapsule card={tarot.carta} name={tarot.nome} label={tarot.nome} width={300} />
          </div>
        )}
        onAdvance={focoTarot.advance}
        onClose={focoTarot.close}
        width="min(78vw, 300px, 31vh)"
        aspect="92 / 178"
      />

      <FocusCard
        state={focoLenormand.state}
        items={[{ position: dict.oracles.lenormand, name: `${lenormand.indice + 1} · ${nomeLenormand}`, meaning: leitura }]}
        renderFront={() => (
          <LenormandCard
            index={lenormand.indice}
            name={nomeLenormand}
            style={{ ["--ln-cw" as string]: "min(78vw, 280px, 37vh)", width: "100%" } as React.CSSProperties}
          />
        )}
        onAdvance={focoLenormand.advance}
        onClose={focoLenormand.close}
        width="min(78vw, 280px, 37vh)"
        aspect="0.62"
        backClassName="fc-back-lenormand"
      />
    </>
  )
}

/**
 * O convite para a consulta pessoal, logo depois da leitura que é de todos.
 *
 * Não é botão nem anúncio: é a mesma pergunta sugerida que gira no campo do
 * Multioráculo, na mesma lista e na mesma cadência, aqui em voz alta. Quem
 * tocar nela chega em "/" com ela escrita no campo, editável, sem nada
 * enviado; o login, a cota e o paywall da consulta continuam sendo os mesmos.
 *
 * A que vale é a que está na tela: a troca espera o texto apagar antes de
 * mudar, então ninguém clica numa pergunta e leva outra.
 */
function ConviteDePergunta({ rotulo, convite }: { rotulo: string; convite: string }) {
  const { pergunta } = usePerguntaSugerida(false)
  const [mostrada, setMostrada] = useState(pergunta)
  const [opacidade, setOpacidade] = useState(1)

  useEffect(() => {
    if (!pergunta || pergunta === mostrada) return
    setOpacidade(0)
    const id = setTimeout(() => {
      setMostrada(pergunta)
      setOpacidade(1)
    }, 400)
    return () => clearTimeout(id)
  }, [pergunta, mostrada])

  if (!mostrada) return null

  return (
    <div className="mt-14">
      {/* o mesmo par do bloco de cima, rótulo e pergunta, para a passagem de
          um nível para o outro ser lida de relance */}
      <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">{rotulo}</p>
      <h2 className="text-white/95 instrument italic text-[21px] sm:text-2xl leading-snug mt-2.5">{convite}</h2>
      <Link
        href="/"
        onClick={() => guardarPerguntaEscolhida(mostrada)}
        className="group block mt-6 min-h-[3.2em] sm:min-h-[2.4em]"
      >
        <span
          className="text-white/60 group-hover:text-white/85 text-[15px] sm:text-base leading-relaxed font-light transition-opacity duration-[400ms] motion-reduce:transition-none"
          style={{ opacity: opacidade }}
        >
          {mostrada}
        </span>
      </Link>
    </div>
  )
}

/**
 * O horóscopo na Home, em três estados, e a diferença entre eles é conceitual.
 *
 * Sem signo, a leitura é do céu: coletiva, para todo mundo, com os fatos por
 * cima e a tradução simbólica embaixo. Com signo, é a leitura daquele signo,
 * que continua sendo compartilhada, e é isso que a frase precisa dizer com
 * todas as letras. Com mapa, é a única que é de fato pessoal.
 *
 * A progressão importa: céu, signo, mapa. É ela que faz alguém entender por
 * que o mapa natal oferece outra camada, sem ninguém precisar explicar.
 */
function HoroscopoDaHome({
  signo,
  foco,
  ceu,
  mapa,
  t,
  ti,
  locale,
}: {
  signo: number | null
  foco: string | null
  ceu: { factual: string[]; sintese: string | null } | null
  mapa: { temMapa: boolean; primeira: string | null } | null
  t: Record<string, string>
  ti: Record<string, string>
  locale: string
}) {
  const signos = SIGNOS[locale as keyof typeof SIGNOS]

  // C. quem tem mapa: a leitura que é mesmo da pessoa, sem chamada comercial
  if (mapa?.temMapa) {
    return (
      <Link href="/interconexoes" className="group block mt-6">
        <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">{t.horoscope}</p>
        {signo !== null && (
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="text-white/40 text-[13px]">{GLIFOS_SIGNO[signo]}</span>
            <span className="instrument italic text-white text-xl">{signos[signo]}</span>
          </div>
        )}
        <p className="text-white/80 text-[14px] leading-relaxed font-light mt-3">
          {mapa.primeira ?? ti.todayTitle}
        </p>
        <span className="block text-white/25 group-hover:text-white/45 text-[11px] font-light mt-3 transition-colors">
          {t.seeFullReading} ↗
        </span>
      </Link>
    )
  }

  // B. quem tem signo e não tem mapa: a leitura do signo, dita como o que ela é
  if (signo !== null) {
    return (
      <div className="mt-6">
        <Link href="/horoscopo" className="group block">
          <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">
            {fmt(t.signToday, { signo: signos[signo] })}
          </p>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="text-white/40 text-[13px]">{GLIFOS_SIGNO[signo]}</span>
            <span className="text-white/80 text-[14px] leading-relaxed font-light">
              {foco ?? t.horoscopeWaiting}
            </span>
            <span className="ml-auto text-white/20 group-hover:text-white/40 text-[11px] transition-colors">↗</span>
          </div>
        </Link>

        {/* a distinção, explícita: o de cima é de todo mundo do signo, o do
            mapa é o único que é só seu */}
        <Link href="/interconexoes" className="group block mt-5">
          <p className="text-white/45 text-[12.5px] leading-relaxed font-light">
            {fmt(t.sharedWithSign, { signo: signos[signo] })}
          </p>
          <p className="text-white/45 text-[12.5px] leading-relaxed font-light mt-1">{t.yourChartDiffers}</p>
          <span className="block text-white/70 group-hover:text-white text-[13px] mt-3 transition-colors">
            {ti.callCta} ↗
          </span>
          <span className="block text-white/25 text-[10.5px] font-light mt-1.5">{ti.callFields}</span>
        </Link>
      </div>
    )
  }

  // A. sem signo: o céu, que é de todo mundo, com fato em cima e tradução embaixo
  return (
    <div className="mt-6">
      <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">{t.skyToday}</p>
      {ceu?.factual.map((linha) => (
        <p key={linha} className="text-white/70 text-[13px] leading-relaxed font-light mt-2 tabular-nums">
          {linha}
        </p>
      ))}

      <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light mt-6">{t.evidence}</p>
      {ceu?.sintese ? (
        <p className="text-white/85 text-[14.5px] leading-[1.75] font-light mt-2.5">{ceu.sintese}</p>
      ) : (
        <p className="text-white/35 text-[13px] leading-relaxed font-light mt-2.5">{t.horoscopeWaiting}</p>
      )}

      <Link
        href="/horoscopo"
        className="group inline-block text-white/30 hover:text-white/55 text-[11.5px] font-light mt-4 transition-colors"
      >
        {t.seeHoroscope} ↗
      </Link>
    </div>
  )
}
