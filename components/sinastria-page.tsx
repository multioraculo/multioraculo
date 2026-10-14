"use client"

/**
 * Sinastria: o mapa de quem lê encontrando o mapa de outra pessoa.
 *
 * A TELA DIZ O QUE A ROTA ENTREGA. `POST /api/sinastria` devolve os FATOS da
 * relação (contatos, casas, pontos em comum e o que não pôde ser calculado),
 * sem texto e sem modelo. Esta página os apresenta; não inventa uma leitura
 * que o produto não escreve. Também não existe nota, porcentagem nem veredito:
 * o cálculo não os produz e a tela não os fabrica.
 *
 * OS ESTADOS SÃO CINCO e nenhum é ambíguo: sem conta, sem plano, sem o próprio
 * mapa registrado, pronto para comparar, e resultado. Listar e apagar pessoas
 * guardadas continua possível sem plano, como a rota garante: dado de terceiros
 * não fica preso atrás de um paywall.
 *
 * O LAYOUT é editorial e não de painel: a abertura à esquerda e o pedido à
 * direita no desktop, em coluna no celular, com o pedido antes da explicação
 * longa. O cálculo é instantâneo, então não há barra de progresso: um traço
 * simples diz que está calculando, e só isso.
 *
 * Nada aqui toca cálculo, seleção, APIs ou regras de acesso.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import type { UsuarioDaSessao } from "@/lib/auth/usuario-header"
import { useI18n } from "@/components/i18n-provider"
import Link from "@/components/localized-link"
import Seta from "@/components/seta"
import SinastriaResultado, { type Comparacao } from "@/components/sinastria-resultado"
import { fmt } from "@/lib/i18n"

type Cidade = { nome: string; regiao: string; pais: string; lat: number; lon: number; rotulo: string }
type Nascimento = { born_on: string; born_at: string | null; lat: number; lon: number; place_label: string }
type Guardada = { id: string; nickname: string; place_label: string; born_on: string }
type Vinculo = "romantico" | "amizade" | "familia" | "trabalho" | "outro"
const VINCULOS: Vinculo[] = ["romantico", "amizade", "familia", "trabalho", "outro"]

type Meu = { place_label: string; born_on: string; born_at: string | null } | null

type Alvo =
  | { origem: "avulsa"; nascimento: Nascimento; apelido: string }
  | { origem: "guardada"; id: string; apelido: string }

type Mostrado = { alvo: Alvo; vinculo: Vinculo; dados: Comparacao; guardadaId?: string }

const campo =
  "w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-3 sm:py-2.5 text-white/85 text-[16px] sm:text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors [color-scheme:dark]"

/** O rótulo que abre uma camada. O mesmo das Interconexões, para o padrão ser aprendido. */
function Rotulo({ children }: { children: ReactNode }) {
  return <p className="text-white/25 text-[12px] uppercase tracking-[0.22em] font-light">{children}</p>
}

function Acao({ children, onClick, disabled = false, tipo = "button" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; tipo?: "button" | "submit" }) {
  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={disabled}
      className="group inline-flex items-center gap-2 py-3 text-white/85 hover:text-white disabled:opacity-35 disabled:hover:text-white/85 text-[16px] font-light cursor-pointer disabled:cursor-default transition-colors"
    >
      {children}
      <span className="text-white/45 group-hover:text-white/85 text-[15px] transition-transform duration-200 group-hover:translate-x-0.5 group-disabled:translate-x-0">
        <Seta tipo="direita" />
      </span>
    </button>
  )
}

export default function SinastriaPage({ initialUser, temPlano }: { initialUser: UsuarioDaSessao | null; temPlano: boolean }) {
  const { dict, formatDate } = useI18n()
  const s = dict.sinastria

  const [carregando, setCarregando] = useState(Boolean(initialUser))
  const [meu, setMeu] = useState<Meu>(null)
  const [guardadas, setGuardadas] = useState<Guardada[] | null>(null)
  const [erroLista, setErroLista] = useState(false)
  const [resultado, setResultado] = useState<Mostrado | null>(null)
  const topo = useRef<HTMLDivElement>(null)

  const carregar = useCallback(async () => {
    if (!initialUser) return
    const [mapa, pessoas] = await Promise.all([
      fetch("/api/mapa").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/sinastria/pessoas").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
    const n = mapa?.nascimento as Nascimento | null | undefined
    setMeu(n ? { place_label: n.place_label, born_on: n.born_on, born_at: n.born_at } : null)
    setGuardadas(pessoas?.pessoas ? (pessoas.pessoas as Guardada[]) : null)
    setErroLista(!pessoas?.pessoas)
    setCarregando(false)
  }, [initialUser])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const mostrar = (m: Mostrado) => {
    setResultado(m)
    requestAnimationFrame(() => topo.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }

  return (
    <div ref={topo} className="scroll-mt-20">
      {resultado ? (
        <SinastriaResultado
          mostrado={resultado}
          guardadas={guardadas}
          aoVoltar={() => setResultado(null)}
          aoGuardar={(id, apelido) => {
            setResultado((r) => (r ? { ...r, guardadaId: id } : r))
            setGuardadas((l) => {
              const n = resultado.alvo.origem === "avulsa" ? resultado.alvo.nascimento : null
              return n ? [{ id, nickname: apelido, place_label: n.place_label, born_on: n.born_on }, ...(l ?? [])] : l
            })
          }}
          aoApagar={(id) => setGuardadas((l) => (l ?? []).filter((p) => p.id !== id))}
          temPlano={temPlano}
        />
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-14">
          {/* a abertura: o que é, curto, antes do pedido */}
          <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1 max-w-xl">
            <h2 className="text-white instrument italic text-[25px] sm:text-[29px] leading-snug">{s.lead}</h2>
            <p className="text-white/65 text-[15.5px] leading-relaxed font-light mt-5">{s.whatItDoes}</p>
          </div>

          {/* o pedido: à direita no desktop, logo depois da promessa no celular */}
          <div className="mt-10 lg:mt-0 lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:row-span-2">
            {carregando ? (
              <div className="space-y-3" aria-live="polite" aria-label={s.loading}>
                <div className="h-5 w-40 rounded bg-white/[0.05] animate-pulse motion-reduce:animate-none" />
                <div className="h-24 rounded bg-white/[0.04] animate-pulse motion-reduce:animate-none" />
              </div>
            ) : !initialUser ? (
              <Porta>
                <p className="text-white/55 text-[15px] leading-relaxed font-light max-w-md">{s.signInBody}</p>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-login"))}
                  className="group inline-flex items-center gap-2 mt-3 py-2 text-white/85 hover:text-white text-[16px] font-light cursor-pointer transition-colors"
                >
                  {s.signIn}
                  <span className="text-white/45 group-hover:text-white/85 text-[15px] transition-transform duration-200 group-hover:translate-x-0.5">
                    <Seta tipo="direita" />
                  </span>
                </button>
              </Porta>
            ) : !temPlano ? (
              <>
                <Porta>
                  <p className="text-white/70 instrument italic text-[20px] leading-snug">{s.planLocked}</p>
                  <p className="text-white/35 text-[14px] leading-relaxed font-light mt-2 max-w-md">{s.planLockedBody}</p>
                  <Link
                    href="/assinatura"
                    className="group inline-flex items-center gap-2 mt-3 py-2 text-white/85 hover:text-white text-[16px] font-light transition-colors"
                  >
                    {s.plans}
                    <span className="text-white/45 group-hover:text-white/85 text-[15px] transition-transform duration-200 group-hover:translate-x-0.5">
                      <Seta tipo="direita" />
                    </span>
                  </Link>
                </Porta>
                {/* quem deixou de pagar continua vendo e apagando o que guardou */}
                {guardadas && guardadas.length > 0 && (
                  <div className="mt-12">
                    <Rotulo>{s.modeSaved}</Rotulo>
                    <ListaGuardadas
                      pessoas={guardadas}
                      aoApagar={(id) => setGuardadas((l) => (l ?? []).filter((p) => p.id !== id))}
                      formatDate={formatDate}
                    />
                  </div>
                )}
              </>
            ) : !meu ? (
              <Porta>
                <h3 className="text-white/90 instrument italic text-xl">{s.noChartTitle}</h3>
                <p className="text-white/45 text-[15px] leading-relaxed font-light mt-2 max-w-md">{s.noChartBody}</p>
                <Link
                  href="/interconexoes"
                  className="group inline-flex items-center gap-2 mt-3 py-2 text-white/85 hover:text-white text-[16px] font-light transition-colors"
                >
                  {s.noChartCta}
                  <span className="text-white/45 group-hover:text-white/85 text-[15px] transition-transform duration-200 group-hover:translate-x-0.5">
                    <Seta tipo="direita" />
                  </span>
                </Link>
              </Porta>
            ) : (
              <Pedido
                meu={meu}
                guardadas={guardadas}
                erroLista={erroLista}
                aoRecarregar={() => void carregar()}
                aoApagar={(id) => setGuardadas((l) => (l ?? []).filter((p) => p.id !== id))}
                aoMostrar={mostrar}
              />
            )}
          </div>

          {/* o que vem depois, e o que não existe: depois do pedido no celular */}
          <div className="mt-12 lg:mt-9 lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-start max-w-xl">
            <div className="h-px bg-white/[0.07]" />
            <Rotulo>
              <span className="block mt-7">{s.youWillSee}</span>
            </Rotulo>
            <ul className="mt-4 space-y-2">
              {s.sees.map((linha) => (
                <li key={linha} className="flex gap-3 text-white/50 text-[15px] leading-relaxed font-light">
                  <span className="text-white/25 shrink-0">·</span>
                  {linha}
                </li>
              ))}
            </ul>
            <p className="text-white/85 instrument italic text-[19px] leading-snug mt-8">{s.noScore}</p>
            <p className="text-white/35 text-[14px] leading-relaxed font-light mt-4">{s.factsNote}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/** O lugar de uma porta fechada: sem moldura, só o que falta e o caminho. */
function Porta({ children }: { children: ReactNode }) {
  return <div className="border-l border-white/10 pl-5 sm:pl-6 py-1">{children}</div>
}

// ── o pedido: os dados da outra pessoa ──────────────────────────────────────

function Pedido({
  meu,
  guardadas,
  erroLista,
  aoRecarregar,
  aoApagar,
  aoMostrar,
}: {
  meu: NonNullable<Meu>
  guardadas: Guardada[] | null
  erroLista: boolean
  aoRecarregar: () => void
  aoApagar: (id: string) => void
  aoMostrar: (m: Mostrado) => void
}) {
  const { dict, formatDate } = useI18n()
  const s = dict.sinastria

  const [vinculo, setVinculo] = useState<Vinculo>("outro")
  const [modo, setModo] = useState<"nova" | "guardada">("nova")
  const [data, setData] = useState("")
  const [hora, setHora] = useState("")
  const [semHora, setSemHora] = useState(false)
  const [cidade, setCidade] = useState<Cidade | null>(null)
  const [apelido, setApelido] = useState("")
  const [escolhida, setEscolhida] = useState<string | null>(null)
  const [calculando, setCalculando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const podeEscolher = (guardadas?.length ?? 0) > 0

  const validar = (): string | null => {
    if (modo === "guardada") return escolhida ? null : s.errPerson
    if (!data) return s.errDate
    if (!semHora && !hora) return s.errTime
    if (!cidade) return s.errCity
    return null
  }

  const mensagem = (status: number, codigo: unknown): string => {
    if (status === 401) return s.errAuth
    if (status === 402) return s.errPlan
    if (codigo === "sem_mapa") return s.errNoChart
    if (codigo === "pessoa_nao_encontrada") return s.errNotFound
    if (status === 400) return s.errValidation
    return s.errGeneric
  }

  const comparar = async () => {
    const invalido = validar()
    if (invalido) {
      setErro(invalido)
      return
    }
    setErro(null)
    setCalculando(true)
    const guardada = modo === "guardada" ? guardadas?.find((p) => p.id === escolhida) : undefined
    const nascimento: Nascimento | null =
      modo === "nova" && cidade
        ? { born_on: data, born_at: semHora ? null : hora, lat: cidade.lat, lon: cidade.lon, place_label: cidade.rotulo }
        : null
    try {
      const res = await fetch("/api/sinastria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guardada ? { vinculo, pessoaId: guardada.id } : { vinculo, pessoa: nascimento }),
      })
      const corpo = await res.json().catch(() => null)
      if (!res.ok || !corpo || !Array.isArray(corpo.aspectos)) {
        setErro(mensagem(res.status, corpo?.error))
        if (corpo?.error === "pessoa_nao_encontrada") aoRecarregar()
        return
      }
      aoMostrar({
        vinculo,
        dados: corpo as Comparacao,
        alvo: guardada
          ? { origem: "guardada", id: guardada.id, apelido: guardada.nickname }
          : { origem: "avulsa", nascimento: nascimento as Nascimento, apelido: apelido.trim() },
      })
    } catch {
      setErro(s.errGeneric)
    } finally {
      setCalculando(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void comparar()
      }}
      noValidate
    >
      {/* você: o que já está guardado, dito em uma linha */}
      <Rotulo>{s.you}</Rotulo>
      <p className="text-white/90 instrument italic text-[20px] sm:text-[22px] leading-snug mt-2.5">{meu.place_label}</p>
      <p className="text-white/35 text-[14px] font-light mt-1 tabular-nums">
        {formatDate(`${meu.born_on}T12:00:00`)}
        {meu.born_at ? ` · ${meu.born_at.slice(0, 5)}` : ` · ${s.timeUnknownShort}`}
      </p>

      <div className="h-px bg-white/[0.07] my-8" />

      {/* a outra pessoa */}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <Rotulo>{s.other}</Rotulo>
        {podeEscolher && (
          <div role="radiogroup" aria-label={s.other} className="flex gap-5 ml-auto">
            {(["nova", "guardada"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={modo === m}
                onClick={() => {
                  setModo(m)
                  setErro(null)
                }}
                className={`py-1.5 text-[14px] font-light border-b whitespace-nowrap transition-colors cursor-pointer ${
                  modo === m ? "text-white/90 border-white/45" : "text-white/35 border-transparent hover:text-white/60"
                }`}
              >
                {m === "nova" ? s.modeNew : s.modeSaved}
              </button>
            ))}
          </div>
        )}
      </div>

      {erroLista && !podeEscolher && (
        <p className="text-white/35 text-[13px] font-light mt-3">
          {s.errList}{" "}
          <button type="button" onClick={aoRecarregar} className="underline underline-offset-4 hover:text-white/60 cursor-pointer">
            {s.retry}
          </button>
        </p>
      )}

      {modo === "guardada" && podeEscolher ? (
        <div className="mt-5">
          <p className="text-white/35 text-[13px] font-light mb-2">{s.savedHint}</p>
          <ListaGuardadas
            pessoas={guardadas as Guardada[]}
            escolhida={escolhida}
            aoEscolher={(id) => {
              setEscolhida(id)
              setErro(null)
            }}
            aoApagar={(id) => {
              if (escolhida === id) setEscolhida(null)
              aoApagar(id)
            }}
            formatDate={formatDate}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="sin-data" className="block text-white/35 text-[12px] uppercase tracking-widest mb-2">
              {s.fieldDate}
            </label>
            <input id="sin-data" type="date" value={data} onChange={(e) => setData(e.target.value)} className={campo} />
          </div>

          <div>
            <label htmlFor="sin-hora" className="block text-white/35 text-[12px] uppercase tracking-widest mb-2">
              {s.fieldTime}
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              <input
                id="sin-hora"
                type="time"
                value={hora}
                disabled={semHora}
                onChange={(e) => setHora(e.target.value)}
                className={`${campo} !w-auto disabled:opacity-30`}
              />
              <label className="flex items-center gap-2 py-2 text-white/45 hover:text-white/70 text-[14px] font-light cursor-pointer transition-colors">
                <input type="checkbox" checked={semHora} onChange={(e) => setSemHora(e.target.checked)} className="accent-white/70 w-4 h-4" />
                {s.timeUnknown}
              </label>
            </div>
            {semHora && <p className="text-white/35 text-[13px] leading-relaxed font-light mt-2 max-w-md">{s.timeUnknownNote}</p>}
          </div>

          <CampoCidade cidade={cidade} aoEscolher={setCidade} />

          <div>
            <label htmlFor="sin-apelido" className="block text-white/35 text-[12px] uppercase tracking-widest mb-2">
              {s.fieldNick}
            </label>
            <input
              id="sin-apelido"
              value={apelido}
              maxLength={40}
              onChange={(e) => setApelido(e.target.value)}
              autoComplete="off"
              className={campo}
            />
            <p className="text-white/30 text-[13px] font-light mt-2">{s.nickHint}</p>
          </div>
        </div>
      )}

      <div className="h-px bg-white/[0.07] my-8" />

      {/* o vínculo: uma escolha de palavra, sem moldura */}
      <Rotulo>{s.bondTitle}</Rotulo>
      <div role="radiogroup" aria-label={s.bondTitle} className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
        {VINCULOS.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={vinculo === v}
            onClick={() => setVinculo(v)}
            className={`py-2 text-[16px] font-light border-b transition-colors cursor-pointer ${
              vinculo === v ? "text-white/95 border-white/45" : "text-white/40 border-transparent hover:text-white/70"
            }`}
          >
            {s.bonds[v]}
          </button>
        ))}
      </div>
      <p className="text-white/30 text-[13px] font-light mt-2">{s.bondNote}</p>

      {erro && (
        <p role="alert" className="text-white/75 text-[14.5px] leading-relaxed mt-7">
          {erro}
        </p>
      )}

      <div className="mt-6">
        <Acao tipo="submit" disabled={calculando}>
          {calculando ? `${s.comparing}...` : s.compare}
        </Acao>
      </div>
    </form>
  )
}

/** As pessoas que a pessoa escolheu guardar: escolher, ou (sem escolher) só ver e apagar. */
function ListaGuardadas({
  pessoas,
  escolhida,
  aoEscolher,
  aoApagar,
  formatDate,
}: {
  pessoas: Guardada[]
  escolhida?: string | null
  aoEscolher?: (id: string) => void
  aoApagar: (id: string) => void
  formatDate: (iso: string) => string
}) {
  const { dict } = useI18n()
  const s = dict.sinastria
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [apagando, setApagando] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const apagar = async (id: string) => {
    setApagando(id)
    setErro(null)
    try {
      const res = await fetch(`/api/sinastria/pessoas?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (res.ok || res.status === 404) {
        aoApagar(id)
        setConfirmando(null)
      } else {
        setErro(s.errDelete)
      }
    } catch {
      setErro(s.errDelete)
    } finally {
      setApagando(null)
    }
  }

  return (
    <div className="mt-3">
      <ul>
        {pessoas.map((p) => {
          const ativa = escolhida === p.id
          return (
            <li key={p.id} className="border-b border-white/[0.06] last:border-b-0">
              <div className="flex items-center gap-3">
                {aoEscolher ? (
                  <button
                    type="button"
                    onClick={() => aoEscolher(p.id)}
                    aria-pressed={ativa}
                    className="flex-1 min-w-0 text-left py-3.5 cursor-pointer group"
                  >
                    <span className={`block text-[16px] font-light truncate transition-colors ${ativa ? "text-white" : "text-white/70 group-hover:text-white/90"}`}>
                      {ativa && <span className="text-white/55 mr-2">·</span>}
                      {p.nickname}
                    </span>
                    <span className="block text-white/30 text-[13px] leading-snug font-light tabular-nums">
                      {p.place_label} · {formatDate(`${p.born_on}T12:00:00`)}
                    </span>
                  </button>
                ) : (
                  <div className="flex-1 min-w-0 py-3.5">
                    <span className="block text-white/70 text-[16px] font-light truncate">{p.nickname}</span>
                    <span className="block text-white/30 text-[13px] leading-snug font-light tabular-nums">
                      {p.place_label} · {formatDate(`${p.born_on}T12:00:00`)}
                    </span>
                  </div>
                )}
                {confirmando === p.id ? (
                  <div className="flex items-center gap-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => void apagar(p.id)}
                      disabled={apagando === p.id}
                      className="text-white/75 hover:text-white text-[14px] font-light py-2 cursor-pointer disabled:opacity-40"
                    >
                      {apagando === p.id ? `${s.deleting}...` : s.deleteYes}
                    </button>
                    <button type="button" onClick={() => setConfirmando(null)} className="text-white/30 hover:text-white/55 text-[14px] font-light py-2 cursor-pointer">
                      {s.deleteNo}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmando(p.id)}
                    className="shrink-0 text-white/25 hover:text-white/55 text-[13px] font-light py-2 px-1 cursor-pointer transition-colors"
                  >
                    {s.delete}
                  </button>
                )}
              </div>
              {confirmando === p.id && (
                <p className="text-white/45 text-[13px] font-light pb-3 -mt-1">{fmt(s.deleteConfirm, { nome: p.nickname })}</p>
              )}
            </li>
          )
        })}
      </ul>
      {erro && (
        <p role="alert" className="text-white/70 text-[14px] mt-3">
          {erro}
        </p>
      )}
    </div>
  )
}

/** A cidade é escolhida de uma lista, nunca digitada solta: o que vale são as coordenadas. */
function CampoCidade({ cidade, aoEscolher }: { cidade: Cidade | null; aoEscolher: (c: Cidade | null) => void }) {
  const { dict } = useI18n()
  const s = dict.sinastria
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
    const res = await fetch(`/api/cidades?q=${encodeURIComponent(q)}`).catch(() => null)
    const corpo = res ? await res.json().catch(() => ({ cidades: [] })) : { cidades: [] }
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
      <label htmlFor="sin-cidade" className="block text-white/35 text-[12px] uppercase tracking-widest mb-2">
        {s.fieldCity}
      </label>
      <input
        id="sin-cidade"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          aoEscolher(null)
        }}
        placeholder={s.cityPlaceholder}
        autoComplete="off"
        className={campo}
      />

      {!cidade && achadas !== null && (
        <div className="mt-2 space-y-0.5">
          {achadas.length === 0 && !procurando && <p className="text-white/30 text-[14px] font-light px-1 py-1">{s.cityNone}</p>}
          {achadas.map((c) => (
            <button
              type="button"
              key={`${c.rotulo}-${c.lat}-${c.lon}`}
              onClick={() => {
                aoEscolher(c)
                setTexto(c.rotulo)
                setAchadas(null)
              }}
              className="block w-full text-left px-2.5 py-3 sm:py-2 rounded text-white/60 hover:text-white hover:bg-white/[0.06] text-[15px] font-light transition-colors cursor-pointer"
            >
              {c.rotulo}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
