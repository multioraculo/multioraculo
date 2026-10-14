"use client"

/**
 * O resultado da Sinastria: os fatos da relação, na ordem em que se lê.
 *
 * É O CÁLCULO, APRESENTADO. A rota devolve contatos entre os mapas, casas,
 * pontos em comum e o que não pôde ser calculado. Não há texto escrito, não há
 * nota, não há porcentagem, e esta tela não inventa nada disso. A única
 * hierarquia é a que o motor já mediu: os contatos vêm do mais exato ao menos
 * exato (`exatidao`, orbe sobre o limite), e os três primeiros ganham tamanho
 * de leitura. Quem quer o resto abre o resto.
 *
 * A CLASSIFICAÇÃO (harmônico, discordante, variável) é a da fonte clássica.
 * Ela aparece em palavra e nunca em cor: tensão e fluidez são tipos de
 * contato, não qualidade da relação, e pintar uma de vermelho e outra de verde
 * diria o contrário.
 *
 * SEM CARTÕES. As seções são separadas por um fio e organizadas em duas
 * colunas no desktop (a marginália à esquerda, o conteúdo à direita), e em
 * coluna única no celular. As linhas de contato têm sempre a mesma forma:
 * um corpo, o aspecto, o outro corpo.
 */
import { useState, type ReactNode } from "react"
import { useI18n } from "@/components/i18n-provider"
import { GlifoPlaneta } from "@/components/astro-wheel"
import Seta from "@/components/seta"
import { ASPECTOS, CORPOS, LIGACAO_ASPECTO, SIGNOS } from "@/lib/astro/nomes"
import { temaDoContato } from "@/lib/astro/temas-sinastria"
import { SIMBOLO_ASPECTO } from "@/lib/astro/simbolos"
import { fmt } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import type { FatoAspecto, FatoOverlay, FatoSemelhanca } from "@/lib/astro/sinastria"
import type { Comparacao } from "@/lib/astro/sinastria-servico"
import type { LeituraRelacional } from "@/lib/astro/prompt-leitura-sinastria"

export type { Comparacao }

type Vinculo = "romantico" | "amizade" | "familia" | "trabalho" | "outro"
type Nascimento = { born_on: string; born_at: string | null; lat: number; lon: number; place_label: string }
type Alvo =
  | { origem: "avulsa"; nascimento: Nascimento; apelido: string }
  | { origem: "guardada"; id: string; apelido: string }
/** `leitura` é a interpretação do encontro, quando existe: sem ela a tela é a dos fatos e do resumo, como sempre foi. */
type Mostrado = { alvo: Alvo; vinculo: Vinculo; dados: Comparacao; guardadaId?: string; leitura?: LeituraRelacional | null }
type Guardada = { id: string; nickname: string; place_label: string; born_on: string }

const DESTAQUE = 3
const PRIMEIROS = 6

function Rotulo({ children }: { children: ReactNode }) {
  return <p className="text-white/45 text-[12px] uppercase tracking-[0.22em] font-light">{children}</p>
}

/** A seção: marginália à esquerda, conteúdo à direita, um fio em cima. Sem moldura. */
function Secao({ id, rotulo, titulo, lead, children }: { id: string; rotulo: string; titulo: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mt-8 sm:mt-10 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-sm p-5 sm:p-8">
      <div className="pb-6 mb-6 border-b border-white/15">
        <Rotulo>{rotulo}</Rotulo>
        <h3 className="text-white instrument italic text-[25px] sm:text-[29px] leading-snug mt-2">{titulo}</h3>
        {lead && <p className="text-white/55 text-[15px] leading-relaxed font-light mt-2.5 max-w-xl">{lead}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export default function SinastriaResultado({
  mostrado,
  guardadas,
  aoVoltar,
  aoGuardar,
  aoApagar,
  temPlano,
}: {
  mostrado: Mostrado
  guardadas: Guardada[] | null
  aoVoltar: () => void
  aoGuardar: (id: string, apelido: string) => void
  aoApagar: (id: string) => void
  temPlano: boolean
}) {
  const { dict, locale, formatDate } = useI18n()
  const s = dict.sinastria
  const { alvo, vinculo, dados } = mostrado

  const nomes = CORPOS[locale] as Record<string, string>
  const aspectos = ASPECTOS[locale] as Record<string, string>
  const signos = SIGNOS[locale]
  const nomeB = alvo.apelido || s.otherPerson
  const corpo = (id: string) => (id === "asc" ? dict.interconexoes.asc : id === "mc" ? dict.interconexoes.mc : (nomes[id] ?? id))
  const decimal = (n: number) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))

  const ordenados = [...dados.aspectos].sort((a, b) => a.exatidao - b.exatidao)
  const overlaysAB = dados.overlays.filter((o) => o.direcao === "A_em_B")
  const overlaysBA = dados.overlays.filter((o) => o.direcao === "B_em_A")
  const ordemDosCorpos = Object.keys(nomes)
  const porCorpo = (a: FatoOverlay, b: FatoOverlay) => ordemDosCorpos.indexOf(a.planeta) - ordemDosCorpos.indexOf(b.planeta) || a.casa - b.casa

  const limites = limitesDe(dados, s, nomes, nomeB)
  const temLimites = limites.length > 0

  const resumo = resumoDe(dados, ordenados, overlaysAB, overlaysBA, s, corpo, aspectos, nomeB, decimal, temLimites, locale)
  const secoes = [
    { id: "resumo", rotulo: s.navSummary },
    { id: "contatos", rotulo: s.navContacts },
    { id: "casas", rotulo: s.navHouses },
    { id: "emcomum", rotulo: s.navCommon },
    ...(temLimites ? [{ id: "limites", rotulo: s.navLimits }] : []),
  ]

  return (
    <div>
      {/* o cabeçalho do resultado: quem, vínculo, e o caminho entre as seções */}
      <header>
        <h2 className="text-white instrument italic text-[30px] sm:text-[38px] leading-tight">
          {alvo.apelido ? fmt(s.resultWith, { nome: alvo.apelido }) : s.resultWithout}
        </h2>
        <p className="text-white/35 text-[14px] font-light mt-2.5 tabular-nums">
          {[fmt(s.resultMeta, { vinculo: s.bonds[vinculo] }), alvo.origem === "avulsa" ? formatDate(`${alvo.nascimento.born_on}T12:00:00`) : null].filter(Boolean).join(" · ")}
        </p>
        <nav aria-label={s.title} className="flex flex-wrap gap-x-6 gap-y-1 mt-6 -ml-1">
          {secoes.map((x) => (
            <a key={x.id} href={`#${x.id}`} className="py-2 px-1 text-white/45 hover:text-white/85 text-[14px] font-light transition-colors">
              {x.rotulo}
            </a>
          ))}
        </nav>
      </header>

      {/* ── resumo: começa pelo que foi calculado ───────────────────────── */}
      <Secao id="resumo" rotulo={s.navSummary} titulo={s.summaryTitle} lead={s.summaryLead}>
        <Resumo r={resumo} leitura={mostrado.leitura ?? null} s={s} />
      </Secao>

      {/* ── contatos ────────────────────────────────────────────────────── */}
      <Secao id="contatos" rotulo={s.navContacts} titulo={s.contactsTitle} lead={s.contactsLead}>
        <Contatos
          fatos={ordenados}
          nomeB={nomeB}
          corpo={corpo}
          aspectos={aspectos}
          decimal={decimal}
          s={s}
        />
      </Secao>

      {/* ── casas ───────────────────────────────────────────────────────── */}
      <Secao id="casas" rotulo={s.navHouses} titulo={s.housesTitle} lead={s.housesLead}>
        {overlaysAB.length + overlaysBA.length === 0 ? (
          <p className="text-white/45 text-[15px] leading-relaxed font-light max-w-lg">{s.noHouses}</p>
        ) : (
          <>
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            {overlaysAB.length > 0 && (
              <GrupoDeCasas titulo={fmt(s.housesAB, { nome: nomeB })} fatos={[...overlaysAB].sort(porCorpo)} corpo={corpo} s={s} />
            )}
            {overlaysBA.length > 0 && (
              <GrupoDeCasas titulo={fmt(s.housesBA, { nome: nomeB })} fatos={[...overlaysBA].sort(porCorpo)} corpo={corpo} s={s} />
            )}
          </div>
          <p className="text-white/35 text-[13px] font-light mt-4">{s.housesTap}</p>
          </>
        )}
      </Secao>

      {/* ── em comum ────────────────────────────────────────────────────── */}
      <Secao id="emcomum" rotulo={s.navCommon} titulo={s.commonTitle} lead={s.commonLead}>
        <EmComum fatos={dados.semelhancas} nomeB={nomeB} nomes={nomes} signos={signos} s={s} />
      </Secao>

      {/* ── limites ─────────────────────────────────────────────────────── */}
      {temLimites && (
        <Secao id="limites" rotulo={s.navLimits} titulo={s.limitsTitle} lead={s.limitsLead}>
          <ul className="space-y-3">
            {limites.map((l) => (
              <li key={l} className="flex gap-3 text-white/55 text-[15px] leading-relaxed font-light">
                <span className="text-white/25 shrink-0">·</span>
                {l}
              </li>
            ))}
          </ul>
        </Secao>
      )}

      {/* ── o que fazer com isto ────────────────────────────────────────── */}
      <div className="mt-8 sm:mt-10">
        <div>
          {alvo.origem === "avulsa" && temPlano && !mostrado.guardadaId && (
            <Guardar alvo={alvo} cheia={(guardadas?.length ?? 0) >= 50} aoGuardar={aoGuardar} s={s} />
          )}
          {mostrado.guardadaId && <p className="text-white/40 text-[14px] font-light mb-6">{s.savedDone}</p>}
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            <button
              type="button"
              onClick={aoVoltar}
              className="group inline-flex items-center gap-2 py-3 text-white/85 hover:text-white text-[16px] font-light cursor-pointer transition-colors"
            >
              {s.again}
              <span className="text-white/45 group-hover:text-white/85 text-[15px] transition-transform duration-200 group-hover:translate-x-0.5">
                <Seta tipo="direita" />
              </span>
            </button>
            <button
              type="button"
              onClick={aoVoltar}
              className="py-3 text-white/30 hover:text-white/60 text-[14px] font-light cursor-pointer transition-colors"
            >
              {s.editData}
            </button>
          </div>
          {alvo.origem === "guardada" && (
            <ApagarGuardada id={alvo.id} apelido={alvo.apelido} aoApagar={(id) => { aoApagar(id); aoVoltar() }} s={s} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── contatos ────────────────────────────────────────────────────────────────

type S = ReturnType<typeof useI18n>["dict"]["sinastria"]

function Contatos({
  fatos,
  nomeB,
  corpo,
  aspectos,
  decimal,
  s,
}: {
  fatos: FatoAspecto[]
  nomeB: string
  corpo: (id: string) => string
  aspectos: Record<string, string>
  decimal: (n: number) => string
  s: S
}) {
  const [filtro, setFiltro] = useState<"todos" | FatoAspecto["categoria"]>("todos")
  const [todos, setTodos] = useState(false)

  if (fatos.length === 0) return <p className="text-white/45 text-[15px] leading-relaxed font-light max-w-lg">{s.noContacts}</p>

  const lista = fatos.filter((f) => filtro === "todos" || f.categoria === filtro || (filtro === "variavel" && f.tambemVariavel))
  const visiveis = todos ? lista : lista.slice(0, PRIMEIROS)
  const filtros: Array<{ id: "todos" | FatoAspecto["categoria"]; rotulo: string }> = [
    { id: "todos", rotulo: s.filterAll },
    { id: "harmonico", rotulo: s.harmonic },
    { id: "discordante", rotulo: s.discordant },
    { id: "variavel", rotulo: s.variable },
  ]

  return (
    <div>
      <div role="radiogroup" aria-label={s.contactsTitle} className="flex flex-wrap gap-x-5 gap-y-1 -mt-2 mb-2">
        {filtros.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={filtro === f.id}
            onClick={() => {
              setFiltro(f.id)
              setTodos(false)
            }}
            className={`py-2 text-[14px] font-light border-b transition-colors cursor-pointer ${
              filtro === f.id ? "text-white/90 border-white/45" : "text-white/35 border-transparent hover:text-white/65"
            }`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <p className="text-white/40 text-[15px] font-light py-6">{s.noContactsFilter}</p>
      ) : (
        <div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-6 pb-3 border-b border-white/20 text-[12px] uppercase tracking-[0.18em] font-light text-white/60">
            <span className="truncate">{s.colYou}</span>
            <span className="w-14 sm:w-20" aria-hidden="true" />
            <span className="truncate text-right">{nomeB}</span>
          </div>
        <ol>
          {visiveis.map((f, i) => (
            <Contato key={f.id} f={f} destaque={i < DESTAQUE} nomeB={nomeB} corpo={corpo} aspectos={aspectos} decimal={decimal} s={s} />
          ))}
        </ol>
        </div>
      )}

      {lista.length > PRIMEIROS && (
        <button
          type="button"
          onClick={() => setTodos((v) => !v)}
          aria-expanded={todos}
          className="group flex items-center gap-2 mt-4 py-3 text-white/60 hover:text-white/90 text-[15px] font-light cursor-pointer transition-colors"
        >
          {todos ? s.closest : `${s.allContacts} (${lista.length})`}
          <span className={`text-white/35 group-hover:text-white/70 text-[14px] transition-transform duration-200 ${todos ? "rotate-180" : ""}`}>
            <Seta tipo="chevron" />
          </span>
        </button>
      )}

      <p className="text-white/25 text-[13px] leading-relaxed font-light mt-6 max-w-md">{s.categoryNote}</p>
    </div>
  )
}

function Contato({
  f,
  destaque,
  nomeB,
  corpo,
  aspectos,
  decimal,
  s,
}: {
  f: FatoAspecto
  destaque: boolean
  nomeB: string
  corpo: (id: string) => string
  aspectos: Record<string, string>
  decimal: (n: number) => string
  s: S
}) {
  const categoria = f.categoria === "harmonico" ? s.catHarmonic : f.categoria === "discordante" ? s.catDiscordant : s.catVariable
  const detalhe = [
    fmt(s.orb, { orbe: decimal(f.orbe), limite: decimal(f.orbeLimite) }),
    f.categoria !== "variavel" && f.tambemVariavel ? `${categoria}, ${s.alsoVariable}` : categoria,
  ].join(" · ")

  return (
    <li className={`border-b border-white/10 ${destaque ? "py-6 sm:py-7" : "py-4"}`}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-6">
        <Ponta id={f.corpoA} nome={corpo(f.corpoA)} dono="" retro={f.retroA === "retrogrado"} destaque={destaque} lado="esquerda" s={s} />
        <div className="text-center pt-0.5 w-14 sm:w-20">
          <span className={`block text-white/65 leading-none ${destaque ? "text-[26px]" : "text-[20px]"}`} aria-hidden="true">
            {SIMBOLO_ASPECTO[f.aspecto]}
          </span>
          <span className="block text-white/45 text-[10px] sm:text-[12px] uppercase tracking-[0.12em] sm:tracking-[0.16em] font-light mt-2">{aspectos[f.aspecto]}</span>
        </div>
        <Ponta id={f.corpoB} nome={corpo(f.corpoB)} dono="" retro={f.retroB === "retrogrado"} destaque={destaque} lado="direita" s={s} />
      </div>
      <p className="text-white/35 text-[13px] font-light mt-3 text-center tabular-nums">{detalhe}</p>
      {destaque && <p className="text-white/55 text-[14px] font-light leading-relaxed mt-1.5 text-center max-w-lg mx-auto">{glosaDoContato(f, s)}</p>}
    </li>
  )
}

function Ponta({ id, nome, dono, retro, destaque, lado, s }: { id: string; nome: string; dono: string; retro: boolean; destaque: boolean; lado: "esquerda" | "direita"; s: S }) {
  return (
    <div className={`min-w-0 ${lado === "direita" ? "text-right" : "text-left"}`}>
      <div className={`flex items-center gap-2 text-white/40 ${lado === "direita" ? "justify-end" : ""}`}>
        <GlifoPlaneta id={id} tamanho={destaque ? 17 : 14} />
        <span
          className={`${destaque ? "instrument italic text-white/95 text-[22px] sm:text-[26px]" : "text-white/85 text-[16px] font-light"} leading-tight truncate`}
        >
          {nome}
          {retro && (
            <span className="text-white/35 text-[13px] ml-1.5 not-italic" title={s.retrograde}>
              ℞
            </span>
          )}
        </span>
      </div>
      {dono && <p className="text-white/30 text-[13px] font-light mt-1 truncate">{dono}</p>}
    </div>
  )
}

// ── casas ───────────────────────────────────────────────────────────────────

function GrupoDeCasas({ titulo, fatos, corpo, s }: { titulo: string; fatos: FatoOverlay[]; corpo: (id: string) => string; s: S }) {
  const [aberta, setAberta] = useState<string | null>(null)
  const significados = s.houseMeaning as Record<string, { area: string; effect: string }>
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4 sm:p-5">
      <p className="text-white/70 text-[14px] font-light pb-3 border-b border-white/20">{titulo}</p>
      <ul>
        {fatos.map((f) => {
          const m = significados[String(f.casa)]
          const aberto = aberta === f.id
          return (
            <li key={f.id} className="border-b border-white/10 last:border-b-0">
              {/* a casa se abre ao toque: a área da vida aparece sempre, e o que o planeta faz ali, ao abrir */}
              <button
                type="button"
                aria-expanded={aberto}
                onClick={() => setAberta(aberto ? null : f.id)}
                className="group w-full flex items-center gap-3 py-3 text-left cursor-pointer"
              >
                <span className="text-white/40 w-4 shrink-0">
                  <GlifoPlaneta id={f.planeta} tamanho={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-white/85 text-[16px] font-light">{corpo(f.planeta)}</span>
                  {m && <span className="block text-white/45 text-[13px] font-light leading-snug mt-0.5">{m.area}</span>}
                </span>
                <span className="text-white/70 instrument italic text-[18px] tabular-nums shrink-0">{fmt(s.houseOf, { n: f.casa })}</span>
                <span className={`text-white/35 group-hover:text-white/70 text-[13px] shrink-0 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}>
                  <Seta tipo="chevron" />
                </span>
              </button>
              {aberto && m && <p className="text-white/65 text-[14.5px] font-light leading-relaxed pb-4 pl-7 pr-2">{m.effect}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── em comum ────────────────────────────────────────────────────────────────

function EmComum({ fatos, nomeB, nomes, signos, s }: { fatos: FatoSemelhanca[]; nomeB: string; nomes: Record<string, string>; signos: string[]; s: S }) {
  if (fatos.length === 0) return <p className="text-white/45 text-[15px] leading-relaxed font-light max-w-lg">{s.commonNone}</p>

  const elemento = (k: string) => (s.elements as Record<string, string>)[k] ?? k
  const modo = (k: string) => (s.modes as Record<string, string>)[k] ?? k
  const tipo = (k: string) => (s.kinds as Record<string, string>)[k] ?? k
  const algumaIgual = fatos.some((f) => f.ressalvaDaFonte !== null)

  const linhas = fatos.map((f) => {
    if (f.dimensao === "elemento") return { f, rotulo: s.dimElement, valor: `${s.whoYou}: ${elemento(f.padraoA)} · ${nomeB}: ${elemento(f.padraoB)}` }
    if (f.dimensao === "modo") return { f, rotulo: s.dimMode, valor: `${s.whoYou}: ${modo(f.padraoA)} · ${nomeB}: ${modo(f.padraoB)}` }
    if (f.dimensao === "elemento_do_sol") return { f, rotulo: s.dimSunElement, valor: `${s.whoYou}: ${elemento(f.padraoA)} · ${nomeB}: ${elemento(f.padraoB)}` }
    const [c, i] = f.padraoA.split(":")
    return { f, rotulo: fmt(s.dimSign, { corpo: nomes[c] ?? c }), valor: signos[Number(i)] ?? "" }
  })

  return (
    <div>
      <ul>
        {linhas.map(({ f, rotulo, valor }) => (
          <li key={f.id} className="py-4 border-b border-white/[0.06] first:pt-0 sm:flex sm:items-baseline sm:gap-6">
            <span className="block sm:w-48 shrink-0 text-white/35 text-[12px] uppercase tracking-[0.18em] font-light">{rotulo}</span>
            <span className="block flex-1 mt-1.5 sm:mt-0">
              <span className="block text-white/90 text-[16px] font-light">{valor}</span>
              <span className="block text-white/30 text-[13px] font-light mt-1">
                {[tipo(f.tipoDeSemelhanca), f.classe === "geracional" ? s.generational : null, f.condicional ? s.conditional : null].filter(Boolean).join(" · ")}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {algumaIgual && <p className="text-white/50 instrument italic text-[17px] leading-snug mt-7 max-w-md">{s.similarityNote}</p>}
    </div>
  )
}

// ── limites ─────────────────────────────────────────────────────────────────

/** O que o cálculo não alcançou, em frases, agrupado: a falta da hora é uma frase só por pessoa. */
function limitesDe(dados: Comparacao, s: S, nomes: Record<string, string>, nomeB: string): string[] {
  const quem = (p: "A" | "B") => (p === "A" ? s.whoYou : nomeB)
  const saida: string[] = []
  const dominantes: string[] = []
  const semHora = new Set<"A" | "B">()
  const HORA = ["asc", "mc", "ic", "desc", "casas", "overlays", "grupos_de_casa", "hemisferios"]

  // um corpo, uma linha: o que não se sabe dele, junto
  const porCorpo = new Map<string, string[]>()
  const nota = (corpo: string, p: "A" | "B", frase: string) => {
    const k = `${corpo} (${quem(p)})`
    porCorpo.set(k, [...(porCorpo.get(k) ?? []), frase])
  }
  for (const i of dados.indisponibilidades) {
    const item = String(i.item)
    const [tipo, alvo] = item.split(":")
    const corpo = nomes[alvo] ?? alvo
    if (HORA.includes(item)) semHora.add(i.pessoa)
    else if (tipo === "signo") nota(corpo, i.pessoa, s.limSign)
    else if (tipo === "retrogradacao") nota(corpo, i.pessoa, s.limRetro)
    else if (tipo === "aspectos") nota(corpo, i.pessoa, s.limAspects)
    else if (tipo === "overlay") nota(corpo, i.pessoa, s.limOverlay)
    else if (item === "elemento_dominante") dominantes.push(fmt(s.limDominant, { coisa: s.limElement, quem: quem(i.pessoa) }))
    else if (item === "modo_dominante") dominantes.push(fmt(s.limDominant, { coisa: s.limMode, quem: quem(i.pessoa) }))
  }
  for (const [k, frases] of porCorpo) saida.push(`${k}: ${frases.join("; ")}.`)
  saida.push(...dominantes)

  const horas: string[] = []
  if (semHora.has("A")) horas.push(s.limNoTimeYou)
  if (semHora.has("B")) horas.push(fmt(s.limNoTimeOther, { nome: nomeB }))

  const tz = dados.pessoas.B.tzStatus
  const fusos = tz === "ambiguous" ? [fmt(s.tzAmbiguous, { quem: nomeB })] : tz === "nonexistent" ? [fmt(s.tzNonexistent, { quem: nomeB })] : []
  return [...new Set([...horas, ...saida, ...fusos])]
}

// ── guardar e apagar ────────────────────────────────────────────────────────

function Guardar({
  alvo,
  cheia,
  aoGuardar,
  s,
}: {
  alvo: Extract<Alvo, { origem: "avulsa" }>
  cheia: boolean
  aoGuardar: (id: string, apelido: string) => void
  s: S
}) {
  const [apelido, setApelido] = useState(alvo.apelido)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const guardar = async () => {
    if (!apelido.trim()) {
      setErro(s.nickHint)
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      const res = await fetch("/api/sinastria/pessoas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apelido: apelido.trim(), nascimento: alvo.nascimento }),
      })
      const corpo = await res.json().catch(() => null)
      if (res.ok && corpo?.id) {
        aoGuardar(String(corpo.id), apelido.trim())
        return
      }
      setErro(res.status === 409 || corpo?.error === "limite_de_pessoas" ? s.errLimit : res.status === 402 ? s.errPlan : s.errSave)
    } catch {
      setErro(s.errSave)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="mb-10 max-w-md">
      <Rotulo>{s.saveTitle}</Rotulo>
      <p className="text-white/40 text-[14px] leading-relaxed font-light mt-2.5">{s.saveBody}</p>
      <div className="flex items-end gap-4 mt-4">
        <div className="flex-1 min-w-0">
          <label htmlFor="sin-guardar" className="sr-only">
            {s.fieldNick}
          </label>
          <input
            id="sin-guardar"
            value={apelido}
            maxLength={40}
            onChange={(e) => setApelido(e.target.value)}
            placeholder={s.fieldNick}
            autoComplete="off"
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-3 sm:py-2.5 text-white/85 text-[16px] sm:text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={() => void guardar()}
          disabled={salvando || cheia}
          className="shrink-0 py-3 text-white/80 hover:text-white disabled:opacity-35 text-[15px] font-light cursor-pointer disabled:cursor-default transition-colors"
        >
          {salvando ? `${s.saving}...` : s.save}
        </button>
      </div>
      {(erro || cheia) && (
        <p role="alert" className="text-white/70 text-[14px] leading-relaxed mt-3">
          {erro ?? s.errLimit}
        </p>
      )}
    </div>
  )
}

function ApagarGuardada({ id, apelido, aoApagar, s }: { id: string; apelido: string; aoApagar: (id: string) => void; s: S }) {
  const [confirmando, setConfirmando] = useState(false)
  const [apagando, setApagando] = useState(false)
  const [erro, setErro] = useState(false)

  const apagar = async () => {
    setApagando(true)
    setErro(false)
    try {
      const res = await fetch(`/api/sinastria/pessoas?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (res.ok || res.status === 404) aoApagar(id)
      else setErro(true)
    } catch {
      setErro(true)
    } finally {
      setApagando(false)
    }
  }

  return (
    <div className="mt-6">
      {confirmando ? (
        <div>
          <p className="text-white/45 text-[13px] font-light">{fmt(s.deleteConfirm, { nome: apelido })}</p>
          <div className="flex gap-6 mt-1">
            <button type="button" onClick={() => void apagar()} disabled={apagando} className="py-2 text-white/75 hover:text-white text-[14px] font-light cursor-pointer disabled:opacity-40">
              {apagando ? `${s.deleting}...` : s.deleteYes}
            </button>
            <button type="button" onClick={() => setConfirmando(false)} className="py-2 text-white/30 hover:text-white/55 text-[14px] font-light cursor-pointer">
              {s.deleteNo}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmando(true)} className="py-2 text-white/25 hover:text-white/55 text-[13px] font-light cursor-pointer transition-colors">
          {s.delete}
        </button>
      )}
      {erro && (
        <p role="alert" className="text-white/70 text-[14px] mt-2">
          {s.errDelete}
        </p>
      )}
    </div>
  )
}

// ── resumo ──────────────────────────────────────────────────────────────────

/** Um grupo do resumo, curto: onde o tipo se concentra e o contato mais exato dele. */
type Grupo = { id: "harmonico" | "discordante" | "variavel"; titulo: string; lead: string; foco: string; melhor: string }
type Resumo = {
  /** a resposta em uma frase quando não há leitura escrita */
  manchete: string
  /** a proporção de contatos por tipo, em inteiros que somam 100 */
  partes: Array<{ id: "harmonico" | "discordante" | "variavel"; rotulo: string; n: number; pct: number }>
  /** os mais exatos de cada tipo, com o mesmo espaço: pontos fortes, pontos de tensão e pontos em aberto */
  grupos: Grupo[]
  linhas: string[]
}

/** Percentuais inteiros que somam 100 (maiores restos): a proporção de contatos por tipo, e não uma nota. */
function percentuais(ns: number[]): number[] {
  const total = ns.reduce((a, b) => a + b, 0)
  if (total === 0) return ns.map(() => 0)
  const brutos = ns.map((n) => (n / total) * 100)
  const base = brutos.map(Math.floor)
  let falta = 100 - base.reduce((a, b) => a + b, 0)
  const ordem = brutos.map((b, i) => ({ i, resto: b - Math.floor(b) })).sort((x, y) => y.resto - x.resto || x.i - y.i)
  for (const { i } of ordem) {
    if (falta <= 0) break
    base[i] += 1
    falta -= 1
  }
  return base
}

/**
 * O resumo é só aritmética sobre os fatos que a rota já devolveu: quantos
 * contatos, de que tipo, quais os mais exatos, onde os planetas se
 * concentram. Não pondera, não pontua e não conclui sobre a relação.
 */
const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

/** Uma linha que diz o que o contato quer dizer: o que cada corpo representa e como o aspecto os põe em relação. */
function glosaDoContato(f: FatoAspecto, s: S): string {
  const papel = (id: string) => (s.bodyRole as Record<string, string>)[id] ?? id
  const asp = (s.aspectGloss as Record<string, string>)[f.aspecto] ?? ""
  return `${maiuscula(papel(f.corpoA))} × ${papel(f.corpoB)}: ${asp}`
}

function resumoDe(
  dados: Comparacao,
  ordenados: FatoAspecto[],
  ab: FatoOverlay[],
  ba: FatoOverlay[],
  s: S,
  corpo: (id: string) => string,
  aspectos: Record<string, string>,
  nomeB: string,
  decimal: (n: number) => string,
  temLimites: boolean,
  locale: Locale,
): Resumo {
  const h = ordenados.filter((f) => f.categoria === "harmonico").length
  const d = ordenados.filter((f) => f.categoria === "discordante").length
  const v = ordenados.filter((f) => f.categoria === "variavel").length
  const n = ordenados.length

  const contagem = n === 0 ? fmt(s.summaryNone, { nome: nomeB }) : n === 1 ? fmt(s.summaryCountOne, { nome: nomeB }) : fmt(s.summaryCountMany, { n, h, d, v, nome: nomeB })
  const equilibrio = h + d === 0 ? null : h > d ? s.summaryMoreHarmonic : d > h ? s.summaryMoreDiscordant : s.summaryBalanced

  const pct = percentuais([h, d, v])
  const partes: Resumo["partes"] = [
    { id: "harmonico", rotulo: s.harmonic, n: h, pct: pct[0] },
    { id: "discordante", rotulo: s.discordant, n: d, pct: pct[1] },
    { id: "variavel", rotulo: s.variable, n: v, pct: pct[2] },
  ]
  const temas = s.themes as Record<string, { name: string; meaning: string }>
  const papel = (id: string) => (s.bodyRole as Record<string, string>)[id] ?? id
  const contato = (f: FatoAspecto) =>
    fmt(s.contactPhrase, { a: corpo(f.corpoA), quem: s.whoYou, aspecto: aspectos[f.aspecto], liga: LIGACAO_ASPECTO[locale][f.aspecto] ?? "", b: corpo(f.corpoB), nome: nomeB })
  const trecho = (f: FatoAspecto, modelo: string) =>
    fmt(modelo, { contato: contato(f), a: papel(f.corpoA), b: papel(f.corpoB), gloss: (s.aspectGloss as Record<string, string>)[f.aspecto] ?? "" })
  /** Os temas de um tipo de contato, do que tem o contato mais exato ao que tem o menos exato. */
  const temasDe = (categoria: Grupo["id"]) => {
    const porTema = new Map<string, FatoAspecto[]>()
    for (const f of ordenados.filter((x) => x.categoria === categoria)) {
      const t = temaDoContato([f.corpoA, f.corpoB])
      porTema.set(t, [...(porTema.get(t) ?? []), f])
    }
    return [...porTema.entries()]
  }
  /** Curto, de propósito: os temas onde o tipo se concentra, e o contato mais exato dele, com o que ele quer dizer. */
  const grupo = (id: Grupo["id"], titulo: string, lead: string): Grupo => {
    const temasDoTipo = temasDe(id)
    const melhor = ordenados.find((f) => f.categoria === id)
    return {
      id,
      titulo,
      lead,
      foco: temasDoTipo.length ? fmt(s.proseFocus, { temas: temasDoTipo.slice(0, 3).map(([t]) => temas[t].name.toLowerCase()).join("; ") }) : "",
      melhor: melhor ? trecho(melhor, s.proseBest) : "",
    }
  }
  const grupos = [grupo("harmonico", s.summaryStrong, s.summaryStrongLead), grupo("discordante", s.summaryWeak, s.summaryWeakLead), grupo("variavel", s.summaryOpen, s.summaryOpenLead)].filter((g) => g.melhor)
  const topo = ordenados[0] ? temas[temaDoContato([ordenados[0].corpoA, ordenados[0].corpoB])].name.toLowerCase() : null
  const manchete = n === 0 ? contagem : [equilibrio, topo ? fmt(s.encounterTopTheme, { tema: topo }) : null].filter(Boolean).join(" ")

  const linhas: string[] = []
  const concentracao = (fatos: FatoOverlay[], modelo: string) => {
    if (fatos.length < 3) return
    const por = new Map<number, number>()
    for (const f of fatos) por.set(f.casa, (por.get(f.casa) ?? 0) + 1)
    const [casa, k] = [...por.entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0])[0]
    if (k >= 3 && k / fatos.length >= 0.3) linhas.push(fmt(modelo, { n: casa, k, t: fatos.length, nome: nomeB }))
  }
  concentracao(ab, s.summaryHousesAB)
  concentracao(ba, s.summaryHousesBA)

  const comum = dados.semelhancas.length
  if (comum > 0) linhas.push(comum === 1 ? s.summaryCommonOne : fmt(s.summaryCommonMany, { n: comum }))
  if (temLimites) linhas.push(s.summaryLimits)

  return { manchete, partes, grupos, linhas }
}

/**
 * O encontro: uma resposta só, em camadas. Em cima, a frase que responde "como é este encontro" (a do parecer da leitura
 * quando existe, ou a que o cálculo sustenta); depois a proporção de contatos por tipo; depois os pontos fortes, de
 * tensão e em aberto, cada um em duas frases; e, por último, a interpretação completa, recolhida. Resumo e leitura
 * respondem à mesma pergunta, e por isso não são duas seções.
 */
function Resumo({ r, leitura, s }: { r: Resumo; leitura: LeituraRelacional | null; s: S }) {
  const [aberta, setAberta] = useState(false)
  return (
    <div className="max-w-2xl">
      <p className="text-white instrument italic text-[23px] sm:text-[27px] leading-snug">{leitura ? leitura.parecer.texto : r.manchete}</p>

      {r.partes.some((p) => p.n > 0) && (
        <div className="mt-7">
          {/* a barra mostra a proporção; o tipo é dito em palavra, e a diferença entre eles é de preenchimento, e não de cor */}
          <div className="flex h-2.5 rounded-full overflow-hidden border border-white/20" role="img" aria-label={r.partes.map((p) => `${p.rotulo} ${p.pct}%`).join(", ")}>
            {r.partes.map((p) => (
              <span
                key={p.id}
                style={{ width: `${p.pct}%` }}
                className={p.id === "harmonico" ? "bg-white/75" : p.id === "discordante" ? "bg-white/30" : "bg-white/10"}
              />
            ))}
          </div>
          <ul className="grid grid-cols-3 gap-3 mt-3">
            {r.partes.map((p) => (
              <li key={p.id}>
                <span className="block text-white/90 text-[22px] instrument italic tabular-nums leading-none">{p.pct}%</span>
                <span className="block text-white/50 text-[13px] font-light mt-1.5">
                  {p.rotulo} <span className="text-white/30 tabular-nums">({p.n})</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-white/30 text-[13px] leading-relaxed font-light mt-3">{s.summaryShareNote}</p>
        </div>
      )}

      {r.grupos.map((g) => (
        <div key={g.id} className="mt-6 pt-5 border-t border-white/15">
          <h4 className="text-white instrument italic text-[20px] leading-snug">{g.titulo}</h4>
          <p className="text-white/80 text-[15.5px] leading-[1.7] font-light mt-2">
            {g.foco} {g.melhor}
          </p>
        </div>
      ))}

      {r.linhas.length > 0 && (
        <ul className="mt-6 space-y-2">
          {r.linhas.map((l) => (
            <li key={l} className="flex gap-3 text-white/60 text-[14.5px] leading-relaxed font-light">
              <span className="text-white/30 shrink-0">·</span>
              {l}
            </li>
          ))}
        </ul>
      )}

      {leitura && (
        <div className="mt-7 pt-5 border-t border-white/15">
          <button
            type="button"
            aria-expanded={aberta}
            onClick={() => setAberta((v) => !v)}
            className="group flex items-center gap-2 py-2 text-white/80 hover:text-white text-[15px] font-light cursor-pointer transition-colors"
          >
            {aberta ? s.readingLess : s.readingMore}
            <span className={`text-white/45 group-hover:text-white/80 text-[14px] transition-transform duration-200 ${aberta ? "rotate-180" : ""}`}>
              <Seta tipo="chevron" />
            </span>
          </button>
          {aberta && <Leitura l={leitura} s={s} />}
        </div>
      )}
    </div>
  )
}

// ── leitura ─────────────────────────────────────────────────────────────────

/**
 * A interpretação do encontro. O parecer abre, em corpo grande: é a resposta à pergunta de quem veio. O resto
 * desenvolve, cada parte com o seu rótulo, e `na_relacao` só aparece quando existe. Texto puro: nada aqui é
 * calculado nem reformatado, e nenhum parágrafo mostra os ids de evidência, que servem ao verificador.
 */
function Leitura({ l, s }: { l: LeituraRelacional; s: S }) {
  const Bloco = ({ rotulo, paragrafos }: { rotulo: string; paragrafos: string[] }) => (
    <div className="mt-8">
      <Rotulo>{rotulo}</Rotulo>
      <div className="mt-3 space-y-4 max-w-2xl">
        {paragrafos.map((t) => (
          <p key={t} className="text-white/80 text-[16px] leading-[1.75] font-light">
            {t}
          </p>
        ))}
      </div>
    </div>
  )
  return (
    <div>
      <Bloco rotulo={s.readingBring} paragrafos={l.aproxima_e_tensiona.map((p) => p.texto)} />
      <Bloco rotulo={s.readingMeaning} paragrafos={[l.significado.texto]} />
      {l.na_relacao && <Bloco rotulo={s.readingAppear} paragrafos={[l.na_relacao.texto]} />}
      <p className="text-white/30 text-[13px] leading-relaxed font-light mt-8 max-w-xl">{s.readingNote}</p>
    </div>
  )
}
