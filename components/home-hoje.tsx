"use client"

/**
 * A Home: um deck de placas de vidro.
 *
 * Antes a hierarquia vinha só de escala e espaço, e os assuntos flutuavam no
 * mesmo fundo sem nada dizendo onde um acaba e outro começa. Agora cada
 * assunto tem a sua placa, e o TAMANHO da placa é que informa o peso: dois
 * módulos dominam, dois apoiam, o resto é microplaca.
 *
 * DOIS CAPÍTULOS, numa grade-mãe de doze colunas: HOJE, em duas fileiras que
 * repetem a divisão 7/5 (tiragem coletiva e pessoal; céu de hoje e imagem do
 * inconsciente), e SEU DIA (marcos 5, frase 3, registro 4, numa faixa só, sem
 * placas), que fecha a página. Quem marca o capítulo é o microtítulo com seu
 * fio, o alinhamento e o ritmo; as tiragens (forte), o céu e a imagem
 * continuam em placa.
 *
 * O texto abaixo é o do deck original, e a regra de peso continua valendo:
 * o TAMANHO e a matéria da placa informam o que domina.
 *
 * A ORDEM das camadas continua sendo o argumento do produto:
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
 * AS GRAMÁTICAS, e o olho só precisa aprender uma vez:
 *
 *  - `Modulo` é a placa. Agrupar é a função dela, não enfeitar: um véu
 *    translúcido, um fio de luz e uma sombra curta, com o fundo atravessando.
 *  - `Rotulo` abre todo módulo, sempre igual;
 *  - `Chamada` é o único jeito de um link sair desta página. A seta significa
 *    exatamente isso, e ação que acontece aqui mesmo não recebe seta.
 *
 * O ESPAÇO ENTRE AS PLACAS substituiu os filetes. Quando cada assunto tem
 * contorno próprio, um traço separando vira ruído: a distância já diz tudo, e
 * é a mesma em toda a grade, o que dá o ritmo.
 *
 * NO DESKTOP a largura cresce a partir de `lg`, mas a medida de leitura não:
 * todo texto corrido continua limitado dentro da sua placa, e a largura extra
 * é gasta em composição, nunca em linha de cento e vinte caracteres.
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
import { buscar, CARREGANDO, type Carregamento } from "@/lib/carregamento"
import MoonToday from "@/components/moon-today"
import { RodaDoDia } from "@/components/astro-ilustracoes"
import type { Ceu } from "@/lib/astro/ceu"
import MarcosHome from "@/components/marcos-home"
import FraseDePoder from "@/components/frase-de-poder"
import { guardarPerguntaEscolhida, usePerguntaSugerida } from "@/components/perguntas-sugeridas"
import FocusCard, { useFocusCard } from "@/components/focus-card"
import { TarotCapsule } from "@/components/tarot-spread"
import { LenormandCard } from "@/components/lenormand-table"
import LequeOraculos from "@/components/leque-oraculos"
import ImagemDoInconsciente from "@/components/imagem-do-inconsciente"
import EscolhaUmaCarta from "@/components/escolha-uma-carta"
import { SIGNOS } from "@/lib/astro/nomes"
import type { TiragemDoDia } from "@/lib/oracles/tiragem-dia"
import type { CartasIndividuais } from "@/lib/oracles/cartas-individuais"

export type RegistroDeHoje = { titulo: string; hoje: boolean } | null

/**
 * Três camadas, em campos separados: `tiragem` é o resultado bruto, `cartas` a
 * interpretação individual de cada carta (o verso dela) e `sintese` a relação
 * entre as duas (o bloco abaixo da tiragem). `cartas` é nulo em registro antigo.
 */
type RespostaTiragem = {
  dia: string
  tiragem: TiragemDoDia
  eixo: [string, string] | null
  sintese: string | null
  cartas?: CartasIndividuais | null
}

const CHAVE_SIGNO = "multioraculo:signo"

/** As duas cartas têm proporções diferentes; estas larguras as deixam da mesma altura. */
const LARGURA_TAROT = 118
const LARGURA_LENORMAND = 140

const semNumero = (nome: string) => nome.replace(/^\d{1,2}\s*[—–-]\s*/, "")

// ── as três gramáticas ──────────────────────────────────────────────────────

/**
 * A abertura do Diário daquele dia.
 *
 * Determinística pela data, como o símbolo do inconsciente: a mesma para todo
 * mundo, sem sorteio por pessoa e sem trocar a cada renderização. Uma frase que
 * mudasse ao piscar transformaria o convite em ruído.
 */
function indiceDaAbertura(dia: string, quantas: number): number {
  if (quantas <= 0) return 0
  let n = 0
  for (let i = 0; i < dia.length; i++) n = (n * 31 + dia.charCodeAt(i)) % 100000
  return n % quantas
}

function aberturaDoDia(dia: string, aberturas: readonly string[]): string {
  return aberturas[indiceDaAbertura(dia, aberturas.length)] ?? ""
}

/** O rótulo que abre uma camada. Sempre o mesmo, para o padrão ser aprendido. */
function Rotulo({ children }: { children: ReactNode }) {
  return <p className="text-white/25 text-[12px] uppercase tracking-[0.22em] font-light">{children}</p>
}

/**
 * A placa de vidro. É o que agrupa, e é só isso que ela faz.
 *
 * `forte` é para os dois módulos de nível 1: mesma matéria com um pouco mais
 * de presença. `micro` encolhe o canto, porque microplaca com raio de módulo
 * grande parece módulo grande espremido.
 *
 * Vira `<Link>` quando recebe `href`, e aí a placa inteira é o alvo do clique:
 * no hover a borda acende e ela sobe um pixel. Nada além disso — os módulos
 * existem para organizar, não para chamar atenção uns dos outros.
 */
/**
 * O microtítulo de um capítulo (HOJE e SEU DIA).
 *
 * Os três capítulos são percebidos por alinhamento, ritmo e repetição, e não
 * por caixas externas: um rótulo no mesmo eixo esquerdo, um fio fino que corre
 * até a borda direita da grade, e o mesmo espaço antes e depois, três vezes. O
 * rótulo é um grau mais forte que o dos módulos (que continua em 25%), para a
 * hierarquia ter dois níveis legíveis: capítulo e assunto.
 */
function Capitulo({ titulo, complemento }: { titulo: string; complemento?: string }) {
  return (
    <div className="flex items-center gap-4 mb-4 sm:mb-5">
      <p className="shrink-0 text-white/50 text-[12px] uppercase tracking-[0.22em] font-light">
        {titulo}
        {complemento && <span className="text-white/35"> · {complemento}</span>}
      </p>
      <div className="h-px flex-1 bg-white/[0.12]" aria-hidden="true" />
    </div>
  )
}

function Modulo({
  children,
  className = "",
  forte = false,
  micro = false,
  href,
  onClick,
  aria,
}: {
  children: ReactNode
  className?: string
  forte?: boolean
  micro?: boolean
  href?: string
  onClick?: () => void
  aria?: string
}) {
  const classe = `bento ${forte ? "bento-forte" : ""} ${micro ? "bento-micro" : ""} ${href ? "bento-link" : ""} ${className}`
  if (href) {
    return (
      <Link href={href} onClick={onClick} aria-label={aria} className={classe}>
        {children}
      </Link>
    )
  }
  return <div className={classe}>{children}</div>
}

/**
 * Enquanto o texto não chegou: linhas na altura do que vai ocupar o lugar.
 *
 * Não é enfeite nem spinner: é o espaço reservado. Sem ele a página encolhe e
 * cresce quando o dado chega, e foi isso que produziu o maior deslocamento de
 * layout medido na Home. As larguras são desiguais de propósito, porque texto
 * corrido não termina alinhado.
 */
function LinhasCarregando({ linhas = 3, className = "" }: { linhas?: number; className?: string }) {
  const larguras = ["100%", "96%", "72%", "88%", "64%"]
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: linhas }).map((_, i) => (
        <div
          key={i}
          className="h-[0.85em] rounded-[3px] bg-white/[0.055] animate-pulse motion-reduce:animate-none"
          style={{ width: larguras[i % larguras.length] }}
        />
      ))}
    </div>
  )
}

/** Filete interno: separa blocos DENTRO de uma mesma placa. Entre placas quem separa é o espaço. */
function Filete() {
  return <div className="h-px bg-white/[0.06] my-6" />
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
        <span className="text-white/85 group-hover:text-white text-[16px] font-light transition-colors">{children}</span>
        <span className="text-white/45 group-hover:text-white/85 text-[15px] transition-all duration-200 group-hover:translate-x-0.5">
          ↗
        </span>
      </span>
      {destino && <span className="block text-white/35 text-[13px] font-light mt-1.5">{destino}</span>}
    </Link>
  )
}

// ── a página ────────────────────────────────────────────────────────────────

export default function HomeHoje({
  initialUser,
  registro,
  ceu,
  tiragemInicial = null,
  ceuDoDiaInicial = null,
}: {
  initialUser: User | null
  registro: RegistroDeHoje
  /** o céu calculado no servidor: função pura, sem requisição e sem custo */
  ceu: Ceu
  /**
   * Tiragem e síntese do céu que o servidor JÁ TINHA gravadas.
   *
   * Quando vêm preenchidas, a tela nasce com elas e o navegador não pede nada:
   * era aqui que a Home perdia 2,4 s esperando a hidratação para só então
   * começar a buscar. Quando vêm nulas, significa que o texto do dia ainda não
   * existe, e aí o cliente busca como sempre fez — é esse pedido que dispara a
   * geração, e o servidor não pode esperar por ela sem segurar o HTML.
   */
  tiragemInicial?: RespostaTiragem | null
  ceuDoDiaInicial?: string | null
}) {
  const { dict, locale, formatDate } = useI18n()
  const t = dict.home
  const ti = dict.interconexoes
  const [tiragem, setTiragem] = useState<RespostaTiragem | null>(tiragemInicial)
  const [horoscopo, setHoroscopo] = useState<Carregamento<string>>(CARREGANDO)
  // `undefined` = ainda não lemos o navegador; `null` = lemos e não há signo
  // escolhido. Sem essa diferença, quem tem signo guardado via por um instante
  // o convite de escolher signo, e só depois a própria leitura
  const [signo, setSigno] = useState<number | null | undefined>(undefined)
  const [hoje, setHoje] = useState("")
  // a leitura coletiva do céu: agora vale para todo mundo, e não só para quem
  // ainda não escolheu signo
  const [ceuDoDia, setCeuDoDia] = useState<Carregamento<string>>(
    ceuDoDiaInicial ? { estado: "pronto", dado: ceuDoDiaInicial } : CARREGANDO,
  )
  // quem não tem conta não tem mapa, e isso já se sabe sem perguntar; quem tem
  // conta fica em `carregando` até a resposta, para a camada não piscar o
  // estado errado antes de saber
  const [mapa, setMapa] = useState<Carregamento<{ temMapa: boolean; primeira: string | null }>>(
    initialUser ? CARREGANDO : { estado: "pronto", dado: { temMapa: false, primeira: null } },
  )

  useEffect(() => {
    setHoje(
      new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
    )
    // o servidor já mandou? então não há o que pedir
    if (tiragemInicial) return
    fetch(`/api/tiragem-dia?locale=${locale}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setTiragem(d as RespostaTiragem))
      .catch(() => {})
  }, [tiragemInicial, locale])

  // o `.catch(() => {})` que estava aqui engolia a falha e deixava a seção em
  // carregamento para sempre; agora falha vira `erro`, que é um estado visível
  useEffect(() => {
    if (ceuDoDiaInicial) return
    let vivo = true
    void buscar<string>(`/api/ceu-dia?locale=${locale}`, (c) => (c?.sintese as string | null) ?? null).then((r) => {
      if (vivo) setCeuDoDia(r)
    })
    return () => {
      vivo = false
    }
  }, [ceuDoDiaInicial, locale])

  useEffect(() => {
    if (!initialUser) return
    let vivo = true
    void buscar("/api/mapa", (c) => ({ temMapa: Boolean(c?.mapa), primeira: null as string | null })).then((r) => {
      if (vivo) setMapa(r)
    })
    return () => {
      vivo = false
    }
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
    if (guardado === null || !Number.isInteger(indice) || indice < 0 || indice > 11) {
      setSigno(null)
      return
    }
    setSigno(indice)
    let vivo = true
    void buscar<string>(`/api/horoscopo?signo=${indice}`, (c) => (c?.leitura?.foco as string | null) ?? null).then(
      (r) => {
        if (vivo) setHoroscopo(r)
      },
    )
    return () => {
      vivo = false
    }
  }, [])

  const data = hoje ? formatDate(`${hoje}T12:00:00`) : ""

  return (
    <div>
      {/* ── O CABEÇALHO DA PÁGINA, e ele não é uma placa ───────────────────
          O aplicativo inteiro se chama Multioráculo, e a consulta de cinco
          oráculos também. Enquanto a marca era um módulo do deck, ela competia
          com os outros assuntos em vez de nomear a página, e a consulta
          aparecia duas vezes: uma no card da marca e outra na tiragem pessoal.

          Aqui ela abre a página, sobre o fundo, sem moldura. Título, chamada e
          data: onde você está e em que dia. A Lua vem depois, dentro do céu —
          como primeira placa ela virava a prioridade da Home. */}
      <h1 className="text-white instrument italic text-[34px] sm:text-[42px] lg:text-[46px] leading-none">Multioráculo</h1>
      <p className="text-white/60 text-[16px] sm:text-[15.5px] font-light mt-3">{t.brandSubtitle}</p>
      {/* A data deixou de ser uma terceira linha sob o título: virou o rótulo do
          capítulo HOJE, logo acima das tiragens. Mesmas palavras, outro lugar, e
          a experiência começa mais cedo. */}
      <div className="h-6 sm:h-8 lg:h-7" />

      <div>
        {/* ── FAIXA A · o dia pergunta ─────────────────────────────────────
            A tiragem do dia é uma consulta reduzida: duas cartas, para todo
            mundo, já pronta. A da direita é a inteira: a sua pergunta, cinco
            oráculos, uma síntese. Lado a lado, uma explica a outra, e é por isso
            que a chamada para consultar mora só aqui. */}
        <section aria-label={t.today}>
        <Capitulo titulo={t.today} complemento={data} />
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-12">
          <Modulo forte className="p-6 sm:p-7 lg:p-8 lg:col-span-7">
            <Rotulo>{t.drawCollective}</Rotulo>
            <h2 className="text-white/95 instrument italic text-[23px] sm:text-[25px] leading-snug mt-2.5">
              {t.drawQuestion}
            </h2>

            <div className="flex items-end justify-center gap-5 mt-7">
              {tiragem ? (
                <CartasDoDia tiragem={tiragem} />
              ) : (
                <>
                  <div className="rounded-[6px] bg-white/[0.05] animate-pulse" style={{ width: LARGURA_TAROT, height: 228 }} />
                  <div className="rounded-[6px] bg-white/[0.05] animate-pulse" style={{ width: LARGURA_LENORMAND, height: 226 }} />
                </>
              )}
            </div>

            {tiragem && (
              <p className="text-center instrument italic text-white/90 text-[17px] mt-6">
                {tiragem.tiragem.tarot.nome}
                <span className="not-italic text-white/25 text-sm px-1.5">×</span>
                {semNumero(tiragem.tiragem.lenormand.nome)}
              </p>
            )}

            {tiragem?.eixo && (
              <p className="text-center text-white/30 text-[12px] tracking-[0.16em] font-light mt-2">
                {tiragem.eixo[0]} · {tiragem.eixo[1]}
              </p>
            )}

            {tiragem?.sintese ? (
              <p className="text-white/85 text-[16px] leading-[1.75] font-light mt-6">{tiragem.sintese}</p>
            ) : tiragem ? (
              <p className="text-white/35 text-[15px] leading-relaxed font-light mt-6">{t.drawWaiting}</p>
            ) : (
              <LinhasCarregando linhas={3} className="mt-6" />
            )}
          </Modulo>

          {/* NÍVEL 1 · A CONSULTA — a única chamada para o Multioráculo na
              página inteira. A placa toda é o alvo, e a pergunta sugerida vai
              junto para o campo. */}
          {tiragem ? (
            <ConviteDePergunta
              rotulo={t.drawPersonal}
              convite={t.andYouToday}
              destino={t.openInMultioraculo}
              explica={dict.hero.tagline}
              className="lg:col-span-5"
            />
          ) : (
            <Modulo forte className="p-6 sm:p-7 lg:p-8 lg:col-span-5">
              <Rotulo>{t.drawPersonal}</Rotulo>
              <h2 className="text-white/95 instrument italic text-[23px] sm:text-[25px] leading-snug mt-2.5">
                {t.andYouToday}
              </h2>
              <LinhasCarregando linhas={2} className="mt-6" />
            </Modulo>
          )}
        </div>

        {/* SEGUNDA FILEIRA DE HOJE · o baralho dos arcanos maiores, na largura
            inteira: uma carta que a própria pessoa tira, e que abre grande. */}
        <div className="mt-4 sm:mt-5">
          <EscolhaUmaCarta />
        </div>

        {/* TERCEIRA FILEIRA DE HOJE · o céu e a imagem do dia. O céu de hoje (com a
            Lua e o horóscopo) e o estudo do dia também são "de hoje", e a divisão
            7/5 da primeira fileira se repete aqui, no mesmo eixo. */}
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-12 mt-4 sm:mt-5">
          <Modulo className="p-6 sm:p-7 lg:p-8 lg:col-span-7">
            <CeuDeHoje
              sintese={ceuDoDia}
              ceu={ceu}
              t={t as unknown as Record<string, string>}
              ti={ti as unknown as Record<string, string>}
            />
          </Modulo>

          {/* Era "Para você", e repetia o horóscopo que já está logo ao lado.
              Agora é a porta dos Sonhos: uma imagem simbólica por dia, a mesma
              para todos, com a fonte à vista. As duas chamadas que moravam aqui
              (horóscopo e Interconexões) foram para "O céu de hoje", que é a
              camada a que elas pertencem. */}
          <Modulo className="p-6 sm:p-7 lg:p-8 lg:col-span-5">
            <ImagemDoInconsciente dia={ceu.dia} />
          </Modulo>
        </div>
        </section>

        {/* ── CAPÍTULO SEU DIA · o que é seu ───────────────────────────────
            Metas, frase e diário: as três coisas da Home que a pessoa escreve,
            e não recebe. Vem antes do céu porque a evolução é o que se volta
            para ver. Eram
            três placas independentes e liam como três widgets. Agora são um
            território só: uma faixa contínua, sem borda e sem desfoque, em que o
            espaço e os fios verticais fazem o trabalho das caixas. As três
            colunas começam no mesmo topo (o rótulo de cada uma na mesma linha) e
            seguem a divisão 5/3/4 da grade-mãe. */}
        <section aria-label={t.chapterYourDay} className="mt-12 sm:mt-14">
          <Capitulo titulo={t.chapterYourDay} />
          <div className="rounded-[20px] bg-[rgba(24,9,56,0.10)] lg:grid lg:grid-cols-12 divide-y divide-white/[0.07] lg:divide-y-0">
            <div className="px-6 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8 lg:col-span-5">
              <MarcosHome logado={Boolean(initialUser)} />
            </div>

            <div className="px-6 py-6 sm:px-7 sm:py-7 lg:px-7 lg:py-8 lg:col-span-3 lg:border-l lg:border-white/[0.07]">
              <FraseDePoder />
            </div>

            <div className="px-6 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8 lg:col-span-4 lg:border-l lg:border-white/[0.07]">
              <Rotulo>{t.yourRecord}</Rotulo>
              <div className="mt-4">
                {registro?.hoje ? (
                  <>
                    <p className="text-white/40 text-xs font-light">{t.diaryToday}</p>
                    <p className="text-white/75 text-[15px] leading-relaxed font-light mt-2 line-clamp-2">{registro.titulo}</p>
                    <Chamada href="/diario">{t.diaryContinue}</Chamada>
                  </>
                ) : (
                  <>
                    {/* Uma abertura, não uma pergunta. "O que ficou de hoje?"
                        devolve à pessoa o trabalho de começar, e começar é a
                        parte difícil de escrever. A frase abaixo é só um convite
                        editorial: NADA é gravado por vê-la, e ela chega ao Diário
                        como rascunho, para ser apagada em uma tecla se não
                        servir. Muda com o dia, igual para todos. */}
                    <p className="text-white/70 instrument italic text-[17px] sm:text-[18px] leading-snug">
                      {aberturaDoDia(ceu.dia, dict.home.journalOpenings)}
                    </p>
                    <Chamada href={`/diario?abertura=${indiceDaAbertura(ceu.dia, dict.home.journalOpenings.length)}`}>
                      {t.journalContinue}
                    </Chamada>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
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
  // O VERSO DE CADA CARTA É A INTERPRETAÇÃO INDIVIDUAL DELA, e só ela. A síntese
  // (`tiragem.sintese`) é o cruzamento das duas e mora no bloco abaixo da
  // tiragem: usá-la aqui fazia o verso do Seis de Ouros falar da Raposa.
  // Sem interpretação individual (dia antigo, registro legado, texto que não
  // passou na verificação) o verso mostra só oráculo, nome e orientação. É
  // fallback deliberado: NUNCA cair para a síntese.
  const interpretacaoTarot = tiragem.cartas?.tarot?.interpretation ?? undefined
  const interpretacaoLenormand = tiragem.cartas?.lenormand?.interpretation ?? undefined
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
        items={[{ position: dict.oracles.tarot, name: tarot.nome, orientation: orientacao, meaning: interpretacaoTarot }]}
        hideEmptyMeaning
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
        items={[{ position: dict.oracles.lenormand, name: `${lenormand.indice + 1} · ${nomeLenormand}`, meaning: interpretacaoLenormand }]}
        hideEmptyMeaning
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
function ConviteDePergunta({
  rotulo,
  convite,
  destino,
  explica,
  className = "",
}: {
  rotulo: string
  convite: string
  destino: string
  explica: string
  className?: string
}) {
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
    <Modulo
      href="/"
      onClick={() => guardarPerguntaEscolhida(mostrada)}
      aria={mostrada}
      className={`group p-6 sm:p-7 lg:p-8 flex flex-col overflow-hidden ${className}`}
    >
      <Rotulo>{rotulo}</Rotulo>
      {/* HIERARQUIA DO BLOCO, em três grupos e não em cinco linhas soltas.
          O olho lê [rótulo + convite], depois [o campo da pergunta], depois
          [a frase + o leque]. O que amarra cada grupo é a distância: curta por
          dentro, larga por fora. Antes os cinco respiros eram quase iguais e o
          leque parecia um anexo no rodapé do card. */}
      <h2 className="text-white/95 instrument italic text-[23px] sm:text-[25px] leading-snug mt-2.5 max-w-[22ch]">{convite}</h2>

      {/* O CAMPO. A pergunta voltou a ter lugar próprio dentro da placa: barra
          à esquerda, fundo mais fundo e altura de toque. Sem isso ela virava
          mais um parágrafo, e o lugar onde as perguntas mudam deixava de
          parecer um lugar. */}
      <span className="block mt-6 rounded-xl border-l-2 border-white/20 group-hover:border-white/45 bg-black/[0.16] group-hover:bg-black/[0.22] pl-4 pr-4 py-4 min-h-[76px] transition-colors">
        <span className="flex items-start justify-between gap-4">
          <span className="text-white/70 group-hover:text-white text-[16px] sm:text-[17px] leading-relaxed font-light transition-colors">
            <span
              className="transition-opacity duration-[400ms] motion-reduce:transition-none"
              style={{ opacity: opacidade }}
            >
              {mostrada}
            </span>
          </span>
          {/* SÓ NO DESKTOP, e por breakpoint em vez de some-para-todos.
              Aqui a seta não está junto do texto: o `justify-between` a joga
              para o canto do campo, e no celular, onde o campo é estreito, ela
              vira um ícone genérico pendurado. No desktop há vão suficiente
              para ela ler como parte da composição do campo, e ali fica.

              Sem ela o celular não perde nada: o campo já tem a barra à
              esquerda que acende, o fundo que aprofunda, o texto que vai a
              branco e a linha de destino logo abaixo dizendo para onde vai. E
              o card inteiro é o link, não a seta. */}
          <span className="hidden sm:inline text-white/35 group-hover:text-white/80 text-[16px] shrink-0 mt-1 transition-all duration-200 group-hover:translate-x-0.5">
            ↗
          </span>
        </span>
        <span className="block text-white/35 text-[13px] font-light mt-3">{destino}</span>
      </span>

      {/* o que acontece do outro lado do clique, dito uma vez só e aqui: era
          isto que estava repetido na placa da marca */}
      {/* a largura máxima só a partir de `sm`: no celular o card já é estreito
          e o limite extra quebrava "Uma pergunta. Cinco oráculos. Uma síntese."
          deixando "síntese." sozinha na segunda linha */}
      {/* o par frase + leque desce até a base da placa (mt-auto): assim a pessoal
          termina na mesma linha da coletiva em vez de flutuar no meio */}
      <span className="block text-white/55 text-[14px] leading-relaxed font-light mt-7 lg:mt-auto lg:pt-7 sm:max-w-[32ch]">{explica}</span>

      {/* e o que ele PARECE: as cinco placas num leque que gira. Ilustração,
          não tiragem — sem nome, sem posição, sem significado.

          Colado na frase acima de propósito: "Uma pergunta. Cinco oráculos.
          Uma síntese." e o leque são a mesma afirmação, uma escrita e outra
          desenhada. Com respiro igual ao dos outros blocos, liam como coisas
          separadas. */}
      {/* A margem negativa tira o padding da placa: o leque mede a largura
          inteira dela, vaza um pouco pelas duas bordas e é cortado pelo
          contorno do card (`overflow-hidden` acima), sem tocar o resto da
          página. Embaixo ele desce 16px para sentar mais perto da base. */}
      <span className="block mt-3 -mx-6 sm:-mx-7 lg:-mx-8 -mb-4">
        <LequeOraculos />
      </span>
    </Modulo>
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
 *
 * A frase de indisponível só aparece em `ausente`, que é quando o servidor
 * RESPONDEU que ainda não há síntese. Enquanto a requisição corre, o lugar dela
 * fica reservado; quando a requisição falha, a mensagem é de falha, e não de
 * inexistência.
 *
 * A LUA SAIU DAQUI. Ela era desenhada duas vezes na mesma página, uma no alto
 * com fase e porcentagem e outra aqui com a frase simbólica, e ver duas gibosas
 * minguantes não faz sentido nenhum. Agora existe uma só, no módulo do dia, e
 * ela é a completa.
 */
function CeuDeHoje({
  sintese,
  ceu,
  t,
  ti,
}: {
  sintese: Carregamento<string>
  ceu: Ceu
  t: Record<string, string>
  ti: Record<string, string>
}) {
  return (
    <div>
      <Rotulo>{t.skySection}</Rotulo>
      <h2 className="text-white/90 instrument italic text-[21px] leading-snug mt-2.5">{t.skySameForAll}</h2>

      {/* A MANDALA é a mesma do Horóscopo, pelo mesmo componente, com os mesmos
          dados. Ela vem calculada do servidor: `estadoDoCeu` é função pura, então
          não há requisição nova nem espera — desenha no primeiro quadro, antes
          mesmo de a síntese chegar. É o único conteúdo da Home que não depende de
          rede. */}
      {/* A MANDALA ao lado do texto a partir de lg: o céu era a placa mais alta
          da Home e deixava a imagem do inconsciente com a metade de baixo vazia.
          No celular nada muda: continua empilhado. */}
      <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8 lg:items-start">
      <div className="flex justify-center mt-6 lg:mt-0 text-white/70 lg:justify-start">
        <RodaDoDia ceu={ceu} tamanho={200} />
      </div>

        <div className="min-w-0">
        {sintese.estado === "carregando" && <LinhasCarregando linhas={3} className="mt-6 max-w-xl" />}
        {sintese.estado === "pronto" && (
          <p className="text-white/80 text-[16px] leading-[1.75] font-light mt-4 max-w-xl">{sintese.dado}</p>
        )}
        {sintese.estado === "ausente" && (
          <p className="text-white/35 text-[15px] leading-relaxed font-light mt-4">{t.horoscopeWaiting}</p>
        )}
        {sintese.estado === "erro" && (
          <p className="text-white/35 text-[15px] leading-relaxed font-light mt-4">{t.loadFailed}</p>
        )}

        {/* A LUA MORA AQUI, e em nenhum outro lugar. Ela já foi desenhada duas
            vezes na mesma página, e depois virou a primeira placa do deck, o que
            a transformou na prioridade da Home e apagou o Multioráculo. O lugar
            dela é junto do céu: as duas coisas são o mesmo assunto. */}
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          <MoonToday variante="compacta" />
        </div>

        <Chamada href="/horoscopo">{t.seeFullSky}</Chamada>

        {/* As duas saídas da camada astrológica moram aqui, e não num card
            separado: o horóscopo é este mesmo céu lido por signo, e as
            Interconexões são este mesmo céu lido pelo mapa de quem abre. Estavam
            num terceiro módulo que repetia o assunto com outro título. */}
        <Chamada href="/interconexoes" destino={ti.callFields}>
          {ti.callCta}
        </Chamada>
        </div>
      </div>
    </div>
  )
}

