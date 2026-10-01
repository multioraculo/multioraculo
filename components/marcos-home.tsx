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
import Lapis from "@/components/lapis"
import { fmt } from "@/lib/i18n"
import { diasDesde, hojeCivil, type Marco } from "@/lib/marcos"

const QUANTOS_NA_HOME = 2

export default function MarcosHome({ logado }: { logado: boolean }) {
  const { dict, formatDate } = useI18n()
  const t = dict.marcos as unknown as Record<string, string>
  const c = dict.login as unknown as Record<string, string>
  const [marcos, setMarcos] = useState<Marco[] | null>(null)
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState("")
  const [inicio, setInicio] = useState(hojeCivil())
  const [meta, setMeta] = useState("")
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

  // SEM CONTA A PLACA CONTINUA EXISTINDO, com o que Marcos é. Antes ela sumia
  // inteira, e a faixa ficava com um buraco onde deveria estar a coisa que a
  // pessoa mais volta para ver. Não há botão aqui porque criar marco exige
  // conta: quem não tem entra pelo login do cabeçalho, como em todo o resto.
  if (!logado) {
    return (
      <div>
        <p className="text-white/25 text-[12px] uppercase tracking-[0.22em] font-light">{t.title}</p>
        <p className="text-white/55 text-[15px] leading-relaxed font-light mt-4">{t.intro}</p>
        {/* o exemplo também aparece para quem não entrou: era aqui que a placa
            ficava mais vazia, e é a primeira visita de todo mundo. Sem botão,
            porque criar marco exige conta — o que se ganha é entender, de
            relance, o que vai aparecer neste lugar */}
        <ExemploDeMarco t={t} />
        {/* faltava a saída: a placa explicava o recurso e não dizia como
            começar. Criar marco exige conta, e o login aqui é o mesmo modal do
            resto do site — não existe rota /login para onde mandar ninguém */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-login"))}
          className="group flex items-center gap-2 mt-4 py-3 cursor-pointer"
        >
          <span className="text-white/85 group-hover:text-white text-[15px] font-light transition-colors">
            {c.signIn}
          </span>
          <span className="text-white/45 group-hover:text-white/85 text-[16px] transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>
    )
  }

  // placa própria não pode ficar vazia enquanto carrega: antes isto devolvia
  // nulo e o módulo aparecia como um vidro sem nada dentro, que é a mesma
  // mentira de carregamento que saímos consertando no resto da Home
  if (marcos === null) {
    return (
      <div>
        <p className="text-white/25 text-[12px] uppercase tracking-[0.22em] font-light">{t.title}</p>
        <div className="mt-5 space-y-3" aria-hidden="true">
          <div className="h-[1.4em] w-24 rounded-[3px] bg-white/[0.055] animate-pulse motion-reduce:animate-none" />
          <div className="h-[0.9em] w-40 rounded-[3px] bg-white/[0.055] animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    )
  }

  const criar = async () => {
    if (!nome.trim()) return
    setSalvando(true)
    await fetch("/api/marcos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nome.trim(), started_on: inicio, target: meta.trim() === "" ? null : Number(meta) }),
    })
    setNome("")
    setInicio(hojeCivil())
    setMeta("")
    setCriando(false)
    setSalvando(false)
    await carregar()
  }

  const mostrar = marcos.slice(0, QUANTOS_NA_HOME)

  // QUEM AINDA NÃO TEM NENHUM vê sugestões em vez de uma lista vazia. Começar
  // uma contagem exige decidir o que contar, e é aí que se desiste; clicar numa
  // sugestão abre o formulário com o nome dentro, ainda editável, porque o
  // marco é da pessoa e não nosso.
  const sugestoes = marcos.length === 0 ? ((t as unknown as { suggestions?: string[] }).suggestions ?? []).slice(0, 4) : []
  const comecarCom = (nome: string, metaSugerida: number | null = null) => {
    setNome(nome)
    setInicio(hojeCivil())
    setMeta(metaSugerida ? String(metaSugerida) : "")
    setCriando(true)
  }

  return (
    // Marcos tem placa própria agora: sem filete, sem respiro de cima. Quem
    // separa dele o que vem ao lado é o vão da grade
    <div>
      {/* sub-rótulo da camada SEU REGISTRO: quem dá o respiro em volta é a Home,
          para Diário e Marcos ficarem visivelmente no mesmo bloco */}
      <p className="text-white/25 text-[12px] uppercase tracking-[0.22em] font-light">{t.title}</p>

      {mostrar.length > 0 && (
        <div className="mt-4 space-y-5">
          {mostrar.map((marco) => (
            <Link key={marco.id} href="/marcos" className="group block">
              <ContagemDeDias dias={diasDesde(marco.started_on)} t={t} meta={marco.target} />
              <p className="text-white/70 group-hover:text-white/90 text-[16px] font-light transition-colors mt-0.5">
                {marco.name}
              </p>
              <p className="text-white/25 text-[13px] font-light mt-0.5">
                {fmt(t.since, { data: formatDate(`${marco.started_on}T12:00:00`) })}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* UM MARCO DE VERDADE NA TELA, e não a explicação de um recurso.
          Antes esta placa dizia o que Marcos é e ficava visualmente vazia; quem
          nunca criou um não tinha como saber o que ia aparecer ali. Agora há um
          exemplo desenhado exatamente como um marco real, com a palavra
          "exemplo" em cima para ninguém confundir com meta imposta, e com o
          lápis à vista para ficar claro que ele é para ser trocado.

          NADA É GRAVADO. Isto é estado visual: só vira marco quando a pessoa
          edita, confirma e salva. Escrever no banco em nome de alguém para
          preencher um card seria decidir por ela o que ela está acompanhando. */}
      {sugestoes.length > 0 && !criando && (
        <div className="mt-4">
          <ExemploDeMarco t={t} aoEditar={() => comecarCom(t.exampleName, META_DO_EXEMPLO)} />

          <p className="text-white/25 text-[12px] font-light mt-4">{(t as unknown as Record<string, string>).suggestTitle}</p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {sugestoes.map((nome) => (
              <button
                key={nome}
                onClick={() => comecarCom(nome)}
                className="rounded-full border border-white/15 hover:border-white/35 bg-white/[0.04] hover:bg-white/[0.07] px-3 py-1.5 text-white/65 hover:text-white/90 text-[14px] font-light transition-colors cursor-pointer"
              >
                {nome}
              </button>
            ))}
          </div>
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
              className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white/75 text-[15px] focus:outline-none focus:border-white/25 transition-colors [color-scheme:dark]"
            />
            {/* a meta é OPCIONAL, e o campo diz isso: vazio significa contagem
                sem fim, que é o que a maioria dos marcos é */}
            <input
              type="number"
              min={1}
              max={3650}
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              placeholder={t.targetLabel}
              title={t.targetHint}
              className="w-[92px] bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white/75 text-[15px] placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
            />
            <button
              onClick={criar}
              disabled={salvando || !nome.trim()}
              className="text-white/70 hover:text-white text-[14px] disabled:opacity-40 transition-colors"
            >
              {t.save}
            </button>
            <button onClick={() => setCriando(false)} className="text-white/25 hover:text-white/50 text-[14px] transition-colors">
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
            className="group py-3 text-white/85 hover:text-white text-[16px] font-light transition-colors cursor-pointer"
          >
            <span className="text-white/40 group-hover:text-white/70 transition-colors">+</span> {t.add}
          </button>
          {marcos.length > QUANTOS_NA_HOME && (
            <Link href="/marcos" className="group py-3 flex items-center gap-2">
              <span className="text-white/85 group-hover:text-white text-[16px] font-light transition-colors">{t.all}</span>
              <span className="text-white/45 group-hover:text-white/85 text-[15px] transition-all duration-200 group-hover:translate-x-0.5">
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
/**
 * Um marco de mentira desenhado como um de verdade.
 *
 * É estado visual e nada mais: não existe no banco, não pertence a ninguém e
 * some no instante em que a pessoa cria o primeiro marco dela. A palavra
 * "exemplo" fica em cima justamente para ele não ser lido como meta que o
 * aplicativo escolheu, e a borda tracejada diz a mesma coisa sem palavra
 * nenhuma.
 */
function ExemploDeMarco({ t, aoEditar }: { t: Record<string, string>; aoEditar?: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-white/12 px-4 py-4 mt-4">
      <p className="text-white/25 text-[12px] uppercase tracking-[0.2em] font-light">{t.exampleLabel}</p>
      <div className="mt-2.5">
        <ContagemDeDias dias={0} t={t} meta={META_DO_EXEMPLO} />
      </div>
      <p className="text-white/55 text-[16px] font-light mt-1">{t.exampleName}</p>
      {aoEditar && (
        <button
          onClick={aoEditar}
          className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-[14px] font-light mt-3.5 py-1 cursor-pointer transition-colors"
        >
          <Lapis />
          {t.makeMine}
        </button>
      )}
    </div>
  )
}

/** A meta do marco de exemplo. Vinte e um dias é um horizonte que se alcança. */
const META_DO_EXEMPLO = 21

/** Quanto tempo a contagem leva para chegar ao número de verdade. */
const CONTANDO_MS = 1100

/**
 * A contagem, subindo até o número real.
 *
 * O número é a única coisa que interessa nesta placa, e vê-lo SER CONTADO dá a
 * ele o peso do tempo que ele representa: quarenta e dois dias aparecendo de
 * uma vez é um dado; quarenta e dois dias subindo é uma duração.
 *
 * O VALOR CERTO É O ESTADO INICIAL, e não o final. Animação que começa em zero
 * e depende de `requestAnimationFrame` para chegar ao número fica presa no zero
 * em aba oculta, em segundo plano e em captura estática — e aí a placa mente
 * sobre a contagem de alguém. Aqui o zero só é assumido dentro do efeito, e um
 * temporizador de segurança força o número final mesmo que nenhum quadro seja
 * desenhado: `setTimeout` roda onde `requestAnimationFrame` não roda.
 */
export function ContagemDeDias({
  dias,
  t,
  tamanho = "grande",
  meta = null,
}: {
  dias: number
  t: Record<string, string>
  tamanho?: "grande" | "medio"
  /** meta em dias, ou nula quando a contagem não tem fim */
  meta?: number | null
}) {
  const classe = tamanho === "grande" ? "text-[26px]" : "text-[20px]"
  const [mostrado, setMostrado] = useState(dias)

  useEffect(() => {
    setMostrado(dias)
    if (dias <= 1) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return

    let quadro = 0
    const inicio = performance.now()
    setMostrado(0)
    const passo = (agora: number) => {
      const p = Math.min(1, (agora - inicio) / CONTANDO_MS)
      // desacelera no fim: o número chega e pousa, em vez de bater
      setMostrado(Math.round(dias * (1 - Math.pow(1 - p, 3))))
      if (p < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    const rede = window.setTimeout(() => {
      cancelAnimationFrame(quadro)
      setMostrado(dias)
    }, CONTANDO_MS + 700)

    return () => {
      cancelAnimationFrame(quadro)
      clearTimeout(rede)
    }
  }, [dias])

  const numero =
    dias <= 0 ? (
      <p className={`text-white/80 instrument italic ${classe} leading-none`}>{t.zeroDays}</p>
    ) : mostrado === 1 ? (
      <p className={`text-white instrument italic ${classe} leading-none`}>{t.oneDay}</p>
    ) : (
      <p className={`text-white instrument italic ${classe} leading-none tabular-nums`}>{fmt(t.days, { n: mostrado })}</p>
    )

  if (!meta) return numero

  // COM META, o número ganha um horizonte. A barra é um fio, e não um medidor:
  // isto continua sendo um marco pessoal, e não uma barra de tarefa cumprida.
  // Passar de 100% é possível e não é erro — quem fez 30 de uma meta de 21 não
  // voltou a zero nem terminou, então a barra enche e para de crescer.
  const fracao = Math.min(1, Math.max(0, dias) / meta)
  const chegou = dias >= meta
  return (
    <div>
      {numero}
      <div className="flex items-center gap-2.5 mt-2">
        <span className="h-px flex-1 max-w-[120px] bg-white/[0.12] overflow-hidden rounded-full">
          <span
            className={`block h-px ${chegou ? "bg-white/70" : "bg-white/40"}`}
            style={{ width: `${Math.round(fracao * 100)}%` }}
          />
        </span>
        <span className="text-white/30 text-[13px] font-light tabular-nums">
          {fmt(t.ofTarget, { n: meta })}
        </span>
      </div>
    </div>
  )
}
