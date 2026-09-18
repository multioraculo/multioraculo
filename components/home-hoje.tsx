"use client"

/**
 * A Home: o dia, em voz baixa.
 *
 * Sem caixas. A hierarquia vem de escala, espaço e filetes finos, e a ORDEM
 * das camadas é o argumento do produto:
 *
 *   1. o cabeçalho do dia, com a Lua compacta: atmosfera e data, três linhas
 *   2. a TIRAGEM COLETIVA, que é a primeira grande experiência da página
 *   3. a TIRAGEM PESSOAL, que é a mesma pergunta virada para dentro
 *   4. o CÉU DE HOJE, contexto
 *   5. PARA VOCÊ, o recorte pessoal daquele céu
 *   6. SEU REGISTRO, a continuidade
 *
 * A tiragem vem antes da astrologia de propósito. Começando por Lua e céu, a
 * primeira dobra faria a página parecer app de horóscopo, e o Multioráculo é
 * que é a identidade daqui. A astrologia continua inteira, uma camada depois,
 * como contexto e personalização.
 *
 * TRÊS GRAMÁTICAS, e o olho só precisa aprender uma vez:
 *
 *  - `Rotulo` abre toda camada, sempre igual;
 *  - `Chamada` é o único jeito de um link sair desta página. A seta significa
 *    exatamente isso, e ação que acontece aqui mesmo não recebe seta;
 *  - `Pausa` separa camadas; `Filete` separa blocos dentro de uma camada. São
 *    medidas diferentes, e é por elas que se percebe onde uma camada acaba.
 *
 * NO DESKTOP a largura cresce a partir de `lg`, mas a medida de leitura não:
 * todo texto corrido continua limitado, e a largura extra é gasta em
 * composição, nunca em linha de cento e vinte caracteres.
 *
 * Nada aqui recalcula o que já existe. A Lua é a MESMA do painel do usuário,
 * pelo mesmo componente. As cartas são as mesmas lâminas da consulta. O
 * horóscopo é a leitura já gerada.
 */
import { useEffect, useState, type ReactNode } from "react"
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

/** As duas cartas têm proporções diferentes; estas larguras as deixam da mesma altura. */
const LARGURA_TAROT = 118
const LARGURA_LENORMAND = 140

const semNumero = (nome: string) => nome.replace(/^\d{1,2}\s*[—–-]\s*/, "")

// ── as três gramáticas ──────────────────────────────────────────────────────

/** O rótulo que abre uma camada. Sempre o mesmo, para o padrão ser aprendido. */
function Rotulo({ children }: { children: ReactNode }) {
  return <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">{children}</p>
}

/**
 * A pausa entre camadas: respiro grande, filete, respiro. Sempre nesta medida.
 * É ela que diz "aqui começa outra coisa" sem precisar de caixa nem de título
 * maior.
 */
function Pausa() {
  return (
    <>
      <div className="h-16" />
      <div className="h-px bg-white/[0.07]" />
      <div className="h-7" />
    </>
  )
}

/** Filete interno: separa blocos que pertencem à MESMA camada. Mais fino e com menos respiro que a Pausa. */
function Filete() {
  return <div className="h-px bg-white/[0.045] my-7" />
}

/**
 * A chamada editorial: o único jeito de sair da Home.
 *
 * Antes isto era uma linha de 11px em branco a 25%, mais apagada que o texto
 * secundário ao lado dela. Ação principal com menos contraste que o corpo é o
 * defeito: quem lê não encontra, e quem encontra não tem certeza de que
 * clica. Agora o contraste é maior que o de qualquer texto de apoio, o corpo é
 * legível, e a área de toque passa de quarenta pixels no celular.
 *
 * A SETA SIGNIFICA UMA COISA SÓ: esta página fica para trás. Ação que acontece
 * aqui mesmo não recebe seta, ou a gramática deixaria de informar qualquer
 * coisa.
 *
 * `destino` existe para quando o texto não diz para onde leva. Não é um segundo
 * botão: é uma legenda, e o alvo do clique continua sendo a linha inteira.
 */
function Chamada({
  href,
  children,
  destino,
  onClick,
}: {
  href: string
  children: ReactNode
  destino?: string
  onClick?: () => void
}) {
  return (
    <Link href={href} onClick={onClick} className="group block mt-3.5 py-3">
      <span className="flex items-center gap-2">
        <span className="text-white/85 group-hover:text-white text-[14.5px] font-light transition-colors">{children}</span>
        <span className="text-white/45 group-hover:text-white/85 text-[13px] transition-all duration-200 group-hover:translate-x-0.5">
          ↗
        </span>
      </span>
      {destino && <span className="block text-white/35 text-[11px] font-light mt-1.5">{destino}</span>}
    </Link>
  )
}

// ── a página ────────────────────────────────────────────────────────────────

export default function HomeHoje({ initialUser, registro }: { initialUser: User | null; registro: RegistroDeHoje }) {
  const { dict, locale, formatDate } = useI18n()
  const t = dict.home
  const ti = dict.interconexoes
  const [tiragem, setTiragem] = useState<RespostaTiragem | null>(null)
  const [horoscopo, setHoroscopo] = useState<RespostaHoroscopo | null>(null)
  const [signo, setSigno] = useState<number | null>(null)
  const [hoje, setHoje] = useState("")
  // a leitura coletiva do céu: agora vale para todo mundo, e não só para quem
  // ainda não escolheu signo
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

  return (
    <div>
      {/* ── 1 · CABEÇALHO DO DIA ──────────────────────────────────────────
          No desktop a Lua sai da coluna e vira aposto do título: ocupa o canto
          e some do caminho antes das cartas. */}
      <div className="lg:flex lg:items-start lg:justify-between lg:gap-12">
        <div>
          <h1 className="text-white instrument italic text-[34px] sm:text-[40px] leading-none">Multioráculo</h1>
          <p className="text-white/45 text-[13.5px] font-light mt-2.5">{t.brandSubtitle}</p>
        </div>

        <div className="mt-7 lg:mt-1 lg:shrink-0 lg:text-right">
          <Rotulo>
            {t.today}
            {data && <span className="text-white/20"> · {data}</span>}
          </Rotulo>
          <div className="mt-3 lg:flex lg:flex-col lg:items-end">
            <MoonToday variante="cabecalho" />
          </div>
        </div>
      </div>

      {/* ── 2 · TIRAGEM COLETIVA ──────────────────────────────────────────
          A primeira grande experiência da página. O protagonismo não vem de
          caixa: vem de ser o único título de 24px, o único corpo de 15px e o
          maior respiro interno da Home. */}
      <div className="h-12 sm:h-14" />

      <Rotulo>{t.drawCollective}</Rotulo>
      <h2 className="text-white/95 instrument italic text-[24px] sm:text-[26px] leading-snug mt-2.5">{t.drawQuestion}</h2>

      <div className="mt-8 lg:mt-10 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12 lg:items-center">
        <div className="flex items-end justify-center gap-5 lg:gap-6">
          {tiragem ? (
            <CartasDoDia tiragem={tiragem} />
          ) : (
            <>
              <div className="rounded-[6px] bg-white/[0.04] animate-pulse" style={{ width: LARGURA_TAROT, height: 228 }} />
              <div className="rounded-[6px] bg-white/[0.04] animate-pulse" style={{ width: LARGURA_LENORMAND, height: 226 }} />
            </>
          )}
        </div>

        {/* no celular a combinação é legenda embaixo das cartas; no desktop ela
            abre a coluna de texto, alinhada à esquerda */}
        <div className="mt-7 lg:mt-0">
          {tiragem && (
            <p className="text-center lg:text-left instrument italic text-white/90 text-base lg:text-[19px]">
              {tiragem.tiragem.tarot.nome}
              <span className="not-italic text-white/25 text-sm px-1.5">×</span>
              {semNumero(tiragem.tiragem.lenormand.nome)}
            </p>
          )}

          {tiragem?.eixo && (
            <p className="text-center lg:text-left text-white/30 text-[10px] tracking-[0.16em] font-light mt-2.5">
              {tiragem.eixo[0]} · {tiragem.eixo[1]}
            </p>
          )}

          {tiragem?.sintese ? (
            <p className="text-white/85 text-[15px] leading-[1.78] font-light mt-6 max-w-xl">{tiragem.sintese}</p>
          ) : tiragem ? (
            <p className="text-white/35 text-[13px] leading-relaxed font-light mt-6">{t.drawWaiting}</p>
          ) : null}
        </div>
      </div>

      {/* ── 3 · TIRAGEM PESSOAL ───────────────────────────────────────────
          Colada na coletiva, sem filete: são o mesmo gesto em dois níveis, e a
          pausa só vem depois das duas. */}
      {tiragem && (
        <ConviteDePergunta rotulo={t.drawPersonal} convite={t.andYouToday} destino={t.openInMultioraculo} />
      )}

      <Pausa />

      {/* ── 4 e 5 · O CÉU DE HOJE e PARA VOCÊ ─────────────────────────────
          No desktop as duas camadas astrológicas ficam lado a lado, na mesma
          altura: o céu de todos à esquerda, o seu recorte à direita. A própria
          composição diz que uma é o contexto da outra. */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-14">
        <CeuDeHoje ceu={ceuDoDia} t={t as unknown as Record<string, string>} />

        <div className="mt-14 pt-14 border-t border-white/[0.07] lg:mt-0 lg:pt-0 lg:border-t-0">
          <ParaVoce
            signo={signo}
            foco={foco}
            mapa={mapa}
            t={t as unknown as Record<string, string>}
            ti={ti as unknown as Record<string, string>}
            locale={locale}
          />
        </div>
      </div>

      <Pausa />

      {/* ── 6 · SEU REGISTRO ──────────────────────────────────────────────
          Diário e Marcos passam a ser uma camada só. Antes eram dois blocos
          sem relação declarada, e o segundo parecia sobra de página. */}
      <Rotulo>{t.yourRecord}</Rotulo>

      <div className="mt-5 lg:grid lg:grid-cols-2 lg:gap-14">
        <div>
          {registro?.hoje ? (
            <>
              <p className="text-white/40 text-xs font-light">{t.diaryToday}</p>
              <p className="text-white/75 text-[15px] leading-relaxed font-light mt-2 line-clamp-2">{registro.titulo}</p>
              <Chamada href="/diario">{t.diaryContinue}</Chamada>
            </>
          ) : (
            <>
              <h2 className="text-white/90 instrument italic text-lg">{t.diaryQuestion}</h2>
              <Chamada href="/diario">{t.diaryCta}</Chamada>
            </>
          )}
        </div>

        {/* o filete que separa Diário de Marcos no celular mora DENTRO do
            Marcos: quando não há nenhum, ele não renderiza nada, e uma moldura
            aqui deixaria uma linha solta pendurada no fim da página */}
        <MarcosHome logado={Boolean(initialUser)} />
      </div>
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
 * A PERGUNTA CONTINUA SENDO O ALVO DO CLIQUE, sem botão ao lado. O que mudou é
 * que ela parecia só uma frase solta: agora ocupa uma área com barra à
 * esquerda, fundo próprio e altura de toque, e diz embaixo para onde leva. A
 * legenda não é um segundo botão, e sim parte do mesmo alvo.
 *
 * A pergunta é a mesma lista de sugeridas do Multioráculo, e guardá-la aqui faz
 * a consulta abrir com ela já no campo, editável, com o cursor dentro e sem
 * nada enviado; o login, a cota e o paywall da consulta continuam sendo os
 * mesmos.
 *
 * A que vale é a que está na tela: a troca espera o texto apagar antes de
 * mudar, então ninguém clica numa pergunta e leva outra. A cor do hover é
 * rápida e o apagar é lento, por isso são dois elementos e não um.
 */
function ConviteDePergunta({ rotulo, convite, destino }: { rotulo: string; convite: string; destino: string }) {
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
    <div className="mt-11 lg:mt-14 lg:grid lg:grid-cols-[minmax(0,34fr)_minmax(0,66fr)] lg:gap-12 lg:items-center">
      <div>
        <Rotulo>{rotulo}</Rotulo>
        <h2 className="text-white/95 instrument italic text-[21px] sm:text-2xl leading-snug mt-2.5">{convite}</h2>
      </div>

      <Link
        href="/"
        onClick={() => guardarPerguntaEscolhida(mostrada)}
        className="group block mt-5 lg:mt-0 min-h-[56px] border-l border-white/15 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.055] rounded-r-[4px] pl-4 pr-4 py-4 transition-colors"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="text-white/60 group-hover:text-white/90 text-[15px] sm:text-base leading-relaxed font-light transition-colors">
            <span
              className="transition-opacity duration-[400ms] motion-reduce:transition-none"
              style={{ opacity: opacidade }}
            >
              {mostrada}
            </span>
          </span>
          <span className="text-white/30 group-hover:text-white/70 text-[13px] shrink-0 mt-1 transition-all duration-200 group-hover:translate-x-0.5">
            ↗
          </span>
        </span>
        <span className="block text-white/35 text-[11px] font-light mt-2.5">{destino}</span>
      </Link>
    </div>
  )
}

/**
 * O céu de hoje: a camada de contexto.
 *
 * Mais compacta que a tiragem de propósito. Título menor, corpo menor, e as
 * posições em grau ficam fora: elas puxam a Home para tabela de efeméride, que
 * é justamente o que faria a primeira impressão virar app de astrologia. Quem
 * quiser o número abre o Horóscopo, e a chamada está logo abaixo.
 *
 * Antes este bloco só existia para quem NÃO tinha signo escolhido. Quem tinha
 * nunca via o céu do dia na Home, embora o dado já estivesse carregado. Agora
 * vale para todos, que é o que a camada promete.
 */
function CeuDeHoje({ ceu, t }: { ceu: { factual: string[]; sintese: string | null } | null; t: Record<string, string> }) {
  return (
    <div>
      <Rotulo>{t.skySection}</Rotulo>
      <h2 className="text-white/90 instrument italic text-[21px] leading-snug mt-2.5">{t.skySameForAll}</h2>

      {ceu?.sintese ? (
        <p className="text-white/80 text-[14px] leading-[1.75] font-light mt-4 max-w-xl">{ceu.sintese}</p>
      ) : (
        <p className="text-white/35 text-[13px] leading-relaxed font-light mt-4">{t.horoscopeWaiting}</p>
      )}

      <div className="mt-6">
        <MoonToday variante="leitura" />
      </div>

      <Chamada href="/horoscopo">{t.seeFullSky}</Chamada>
    </div>
  )
}

/**
 * PARA VOCÊ: o recorte pessoal daquele mesmo céu, em três estados.
 *
 * Sem signo, é um convite. Com signo, é a leitura do signo, que continua sendo
 * compartilhada, e é isso que a frase precisa dizer com todas as letras. Com
 * mapa, é a única que é de fato pessoal.
 *
 * SEM GLIFO ZODIACAL. O ♍ estava aqui e parecia peça de app genérico de
 * astrologia: um símbolo que não pertence ao desenho do Multioráculo e que não
 * informa nada a quem não o reconhece. Quem carrega o signo agora é a
 * tipografia, no mesmo corpo e no mesmo itálico das perguntas das outras
 * camadas.
 */
function ParaVoce({
  signo,
  foco,
  mapa,
  t,
  ti,
  locale,
}: {
  signo: number | null
  foco: string | null
  mapa: { temMapa: boolean; primeira: string | null } | null
  t: Record<string, string>
  ti: Record<string, string>
  locale: string
}) {
  const signos = SIGNOS[locale as keyof typeof SIGNOS]

  // C. quem tem mapa: a leitura que é mesmo da pessoa, sem chamada comercial
  if (mapa?.temMapa) {
    return (
      <div>
        <Rotulo>{t.forYou}</Rotulo>
        <h2 className="text-white/90 instrument italic text-[21px] leading-snug mt-2.5">{ti.todayTitle}</h2>
        {mapa.primeira && (
          <p className="text-white/80 text-[14px] leading-relaxed font-light mt-4 max-w-xl">{mapa.primeira}</p>
        )}
        <Chamada href="/interconexoes">{t.seeFullReading}</Chamada>
      </div>
    )
  }

  // B. quem tem signo e não tem mapa: a leitura do signo, dita como o que ela é
  if (signo !== null) {
    return (
      <div>
        <Rotulo>{t.forYou}</Rotulo>
        <h2 className="text-white/90 instrument italic text-[21px] leading-snug mt-2.5">
          {fmt(t.signToday, { signo: signos[signo] })}
        </h2>
        <p className="text-white/80 text-[14px] leading-relaxed font-light mt-4 max-w-xl">
          {foco ?? t.horoscopeWaiting}
        </p>
        <Chamada href="/horoscopo">{t.seeSignReading}</Chamada>

        <Filete />

        {/* a distinção, explícita: o de cima é de todo mundo do signo, o do
            mapa é o único que é só seu */}
        <p className="text-white/50 text-[13px] leading-relaxed font-light max-w-xl">
          {fmt(t.sharedWithSign, { signo: signos[signo] })} {t.yourChartDiffers}
        </p>
        <Chamada href="/interconexoes" destino={ti.callFields}>
          {ti.callCta}
        </Chamada>
      </div>
    )
  }

  // A. sem signo: o convite, e nada mais. O céu já foi dito na camada de cima
  return (
    <div>
      <Rotulo>{t.forYou}</Rotulo>
      <h2 className="text-white/90 instrument italic text-[21px] leading-snug mt-2.5">{t.horoscopeVisitor}</h2>
      <p className="text-white/50 text-[13px] leading-relaxed font-light mt-3 max-w-xl">{t.horoscopeVisitorHint}</p>
      <Chamada href="/horoscopo">{t.pickMySign}</Chamada>
    </div>
  )
}
