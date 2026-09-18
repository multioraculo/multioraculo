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
import MoonToday from "@/components/moon-today"
import MarcosHome from "@/components/marcos-home"
import { guardarPerguntaEscolhida, usePerguntaSugerida } from "@/components/perguntas-sugeridas"
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
  // null enquanto não se sabe: assim a chamada não pisca para quem já tem mapa
  const [temMapa, setTemMapa] = useState<boolean | null>(initialUser ? null : false)

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
    if (!initialUser) return
    fetch("/api/mapa?resumo=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setTemMapa(Boolean(d?.temMapa)))
      .catch(() => setTemMapa(false))
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

      {/* O HORÓSCOPO: a área inteira leva à leitura */}
      <Link href="/horoscopo" className="group block mt-6">
        <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">
          {signo === null && !initialUser ? t.horoscopeGeneric : t.horoscope}
        </p>

        {signo !== null ? (
          <>
            <div className="flex items-baseline gap-2.5 mt-3">
              <span className="text-white/40 text-[13px]">{GLIFOS_SIGNO[signo]}</span>
              <span className="instrument italic text-white text-xl">{SIGNOS[locale][signo]}</span>
              <span className="ml-auto text-white/20 group-hover:text-white/40 text-[11px] transition-colors">↗</span>
            </div>
            {foco ? (
              <>
                <p className="text-white/80 text-[14px] leading-relaxed font-light mt-2">{foco}</p>
                {primeiraFrase && (
                  <p className="text-white/45 text-[12.5px] leading-relaxed font-light mt-1.5">{primeiraFrase}</p>
                )}
              </>
            ) : (
              <p className="text-white/35 text-[13px] leading-relaxed font-light mt-2">{t.horoscopeWaiting}</p>
            )}
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-2.5 mt-3">
              <span className="instrument italic text-white/85 text-lg">
                {initialUser ? t.horoscopePickSign : t.horoscopeVisitor}
              </span>
              <span className="ml-auto text-white/20 group-hover:text-white/40 text-[11px] transition-colors">↗</span>
            </div>
            <p className="text-white/45 text-[12.5px] leading-relaxed font-light mt-2">
              {initialUser ? t.horoscopePickHint : t.horoscopeVisitorHint}
            </p>
          </>
        )}
      </Link>

      {/* a passagem do signo para o mapa, em duas linhas e só para quem ainda
          não tem mapa: quem já tem não precisa ser convidado de novo */}
      {signo !== null && temMapa === false && (
        <Link href="/interconexoes" className="group block mt-6">
          <p className="text-white/50 group-hover:text-white/70 text-[13px] leading-relaxed font-light transition-colors">
            {ti.homeLead}
          </p>
          <p className="text-white/35 group-hover:text-white/55 text-[13px] leading-relaxed font-light transition-colors">
            {ti.homeBody}
          </p>
        </Link>
      )}

      {/* A TIRAGEM COLETIVA: a leitura acontece aqui, sem link */}
      <div className="h-16 sm:h-20" />

      <h2 className="text-white/95 instrument italic text-[21px] sm:text-2xl leading-snug">{t.drawQuestion}</h2>
      <p className="text-white/25 text-[9.5px] uppercase tracking-[0.16em] font-light mt-2">{t.drawShared}</p>

      <div className="flex items-end justify-center gap-5 mt-8">
        {tiragem ? (
          <>
            <TarotCapsule
              card={tiragem.tiragem.tarot.carta}
              name={tiragem.tiragem.tarot.nome}
              label={tiragem.tiragem.tarot.nome}
              width={LARGURA_TAROT}
            />
            <LenormandCard
              index={tiragem.tiragem.lenormand.indice}
              name={semNumero(tiragem.tiragem.lenormand.nome)}
              style={{ ["--ln-cw" as string]: `${LARGURA_LENORMAND}px` }}
            />
          </>
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

      {/* e a sua? a consulta começa por uma pergunta, e a pergunta já está ali */}
      {tiragem && <ConviteDePergunta convite={t.andYours} />}

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
function ConviteDePergunta({ convite }: { convite: string }) {
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
    <div className="mt-11">
      <p className="text-white/45 text-[13px] leading-relaxed font-light">{convite}</p>
      <Link
        href="/"
        onClick={() => guardarPerguntaEscolhida(mostrada)}
        className="group block mt-3.5 min-h-[3.2em] sm:min-h-[2.4em]"
      >
        <span
          className="instrument italic text-white/85 group-hover:text-white text-[19px] sm:text-[21px] leading-snug transition-opacity duration-[400ms] motion-reduce:transition-none"
          style={{ opacity: opacidade }}
        >
          {mostrada}
        </span>
      </Link>
    </div>
  )
}
