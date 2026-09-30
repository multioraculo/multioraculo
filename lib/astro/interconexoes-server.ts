/**
 * A síntese pessoal do dia: cache, impressão digital do mapa e recuperação.
 *
 * Mesmo desenho do horóscopo, porque ele funcionou: gerar uma vez, conferir,
 * reparar o que reprovou e, se nem assim, cair para o molde determinístico. A
 * pessoa que pagou nunca fica sem texto, e o verificador nunca é afrouxado.
 *
 * O QUE MUDA AQUI É O CACHE, e a diferença tem nome: `mapa_hash`. O horóscopo
 * de Virgem é o mesmo para todo mundo de Virgem, mas esta leitura depende de um
 * mapa que a pessoa pode corrigir a qualquer momento. Se ela arrumar a hora de
 * nascimento às três da tarde, a síntese das dez da manhã foi escrita sobre
 * outro céu e não vale mais.
 *
 * Por isso a chave é (user_id, dia, locale) e o hash fica no corpo: ao reler,
 * compara-se o hash gravado com o do mapa de agora, e divergência é tratada
 * como ausência. A linha é substituída, não versionada: duas sínteses do mesmo
 * dia para a mesma pessoa seriam duas verdades sobre o mesmo dia.
 */
import { createHash } from "crypto"
import type { Locale } from "@/lib/i18n/config"
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import type { Interconexao } from "./interconexoes"
import type { MapaNatal } from "./mapa"
import { fatosPessoais, type FatoPessoal } from "./fatos-interconexoes"
import { promptInterconexoes, promptReparoInterconexoes, type SintesePessoal } from "./prompt-interconexoes"
import { verificarSintesePessoal } from "./verificador-interconexoes"
import { sinteseDeterministica } from "./fallback-interconexoes"

export type Resposta = {
  conteudo: string
  model: string
  usage?: { prompt_tokens?: number | null; completion_tokens?: number | null } | null
}
export type Gerar = (p: { system: string; user: string }) => Promise<Resposta>

export type ModoPessoal = "generated" | "repaired" | "fallback"

export type DiagnosticoPessoal = {
  modo: ModoPessoal
  tentativas: number
  violacoes: string[]
  fallback: boolean
  msTotal: number
}

export type SinteseDoDia = {
  sintese: string
  cache: boolean
  model: string | null
  diagnostico?: DiagnosticoPessoal
}

const REPAROS = 2

/**
 * A impressão digital do que determina o mapa.
 *
 * Só entra aqui o que muda o céu do nascimento: data, hora, fuso e
 * coordenadas. O rótulo da cidade fica de fora de propósito — corrigir
 * "Sao Paulo" para "São Paulo, SP" não move nenhum planeta, e invalidar a
 * síntese por causa disso seria cobrar uma geração por um acento.
 */
export function hashDoMapa(n: {
  born_on: string
  born_at: string | null
  tz: string
  lat: number
  lon: number
}): string {
  const bruto = [n.born_on, n.born_at ?? "sem-hora", n.tz, n.lat.toFixed(4), n.lon.toFixed(4)].join("|")
  return createHash("sha256").update(bruto).digest("hex").slice(0, 32)
}

/** Existe onde guardar? Enquanto a migration não rodar, não se gera nada. */
let temOndeGuardar = false
let ultimaPergunta = 0
const VALIDADE_DO_NAO = 60_000

export async function cacheDisponivel(): Promise<boolean> {
  if (temOndeGuardar) return true
  if (ultimaPergunta && Date.now() - ultimaPergunta < VALIDADE_DO_NAO) return false
  ultimaPergunta = Date.now()
  if (!hasAdminClient()) return false
  const { error } = await createAdminClient().from("interconexoes_daily").select("dia").limit(1)
  temOndeGuardar = !error
  if (error) console.warn("[interconexoes] sem tabela de cache, geração desligada:", error.message)
  return temOndeGuardar
}

/** A linha gravada, só se ela for do MESMO mapa. Hash diferente é ausência. */
async function lerCache(userId: string, dia: string, locale: Locale, mapaHash: string): Promise<SinteseDoDia | null> {
  if (!hasAdminClient()) return null
  const { data, error } = await createAdminClient()
    .from("interconexoes_daily")
    .select("sintese, model, mapa_hash")
    .eq("user_id", userId)
    .eq("dia", dia)
    .eq("locale", locale)
    .maybeSingle()
  if (error || !data?.sintese) return null

  if (data.mapa_hash !== mapaHash) {
    console.log(`[interconexoes] mapa mudou, regerando: dia=${dia} locale=${locale}`)
    return null
  }
  return { sintese: String(data.sintese), cache: true, model: (data.model as string) ?? null }
}

async function gravar(linha: {
  userId: string
  dia: string
  locale: Locale
  mapaHash: string
  sintese: string
  fatos: FatoPessoal[]
  diagnostico: DiagnosticoPessoal
  model: string
}): Promise<boolean> {
  if (!hasAdminClient()) return false
  try {
    // upsert SUBSTITUI: nunca duas sínteses do mesmo dia para a mesma pessoa
    const { error } = await createAdminClient().from("interconexoes_daily").upsert(
      {
        user_id: linha.userId,
        dia: linha.dia,
        locale: linha.locale,
        mapa_hash: linha.mapaHash,
        sintese: linha.sintese,
        fatos: linha.fatos,
        diagnostico: linha.diagnostico,
        model: linha.model,
      },
      { onConflict: "user_id,dia,locale" },
    )
    if (error) throw error
    return true
  } catch (erro) {
    console.warn(`[interconexoes] falha ao gravar: dia=${linha.dia} locale=${linha.locale}`, (erro as Error)?.message)
    return false
  }
}

/**
 * A síntese do dia daquela pessoa. Lê o cache; só chama o modelo quando não há
 * linha válida para o mapa atual.
 *
 * Quem chama já verificou sessão e plano: esta função não sabe nada de
 * autorização e não deve ser o lugar onde isso é decidido.
 */
export async function sinteseDoDia(params: {
  userId: string
  dia: string
  locale: Locale
  mapa: MapaNatal
  mapaHash: string
  escolhidas: Interconexao[]
  gerar: Gerar
}): Promise<SinteseDoDia> {
  const { userId, dia, locale, mapa, mapaHash, escolhidas, gerar } = params
  const t0 = Date.now()

  if (!(await cacheDisponivel())) {
    return { sintese: "", cache: false, model: null }
  }

  const guardada = await lerCache(userId, dia, locale, mapaHash)
  if (guardada) return guardada

  const fatos = fatosPessoais({ mapa, escolhidas, locale })
  let tentativas = 0
  let model = ""
  // por que cada tentativa reprovou. Sem isto, uma síntese que cai no molde em
  // produção só diz que caiu, e o motivo se perde justamente no caso em que ele
  // é a única coisa que interessa
  const historico: string[] = []

  const chamar = async (p: { system: string; user: string }): Promise<unknown | null> => {
    tentativas += 1
    try {
      const r = await gerar(p)
      model = r.model
      if (!r.conteudo || r.conteudo.trim() === "" || r.conteudo.trim() === "{}") return null
      return JSON.parse(r.conteudo)
    } catch {
      return null
    }
  }

  // ── 1 · uma geração ───────────────────────────────────────────────────────
  let bruto = await chamar(promptInterconexoes({ fatos, locale }))
  let v = verificarSintesePessoal({ bruto: bruto ?? {}, fatos, locale })
  if (!v.ok) historico.push(...v.violacoes.map((x) => `geração: ${x}`))

  // ── 2 · reparo dirigido ───────────────────────────────────────────────────
  for (let n = 1; n <= REPAROS && !v.ok; n++) {
    const reprovada: SintesePessoal = {
      afirmacoes: ((bruto as Partial<SintesePessoal>)?.afirmacoes ?? []) as SintesePessoal["afirmacoes"],
      sintese: String((bruto as Partial<SintesePessoal>)?.sintese ?? ""),
    }
    bruto = await chamar(promptReparoInterconexoes({ fatos, locale, reprovada, violacoes: v.violacoes }))
    v = verificarSintesePessoal({ bruto: bruto ?? {}, fatos, locale })
    if (!v.ok) historico.push(...v.violacoes.map((x) => `reparo ${n}: ${x}`))
  }

  // ── 3 · molde determinístico ──────────────────────────────────────────────
  let fallback = false
  if (!v.ok) {
    fallback = true
    const molde = sinteseDeterministica(fatos, locale)
    v = verificarSintesePessoal({ bruto: molde, fatos, locale })
    // o molde também é conferido; se nem ele passar, entrega-se o texto dele
    // mesmo assim, porque ele é só descrição de fato medido e o risco de estar
    // errado é menor do que o de não haver leitura nenhuma para quem pagou
    if (!v.ok) {
      const diagnostico: DiagnosticoPessoal = {
        modo: "fallback",
        tentativas,
        violacoes: [...new Set([...historico, ...v.violacoes.map((x) => `molde: ${x}`)])].slice(0, 12),
        fallback: true,
        msTotal: Date.now() - t0,
      }
      console.warn(`[interconexoes] nem o molde passou: dia=${dia} ${v.violacoes.join(" | ")}`)
      await gravar({ userId, dia, locale, mapaHash, sintese: molde.sintese, fatos, diagnostico, model: model || "molde" })
      return { sintese: molde.sintese, cache: false, model: model || "molde", diagnostico }
    }
  }

  const modo: ModoPessoal = fallback ? "fallback" : tentativas > 1 ? "repaired" : "generated"
  const diagnostico: DiagnosticoPessoal = {
    modo,
    tentativas,
    violacoes: [...new Set(historico)].slice(0, 12),
    fallback,
    msTotal: Date.now() - t0,
  }

  console.log(
    `[interconexoes] dia=${dia} locale=${locale} modo=${modo} tentativas=${tentativas} ms=${diagnostico.msTotal}`,
  )

  await gravar({
    userId,
    dia,
    locale,
    mapaHash,
    sintese: v.sintese.sintese,
    fatos,
    diagnostico,
    model: model || "molde",
  })

  return { sintese: v.sintese.sintese, cache: false, model: model || "molde", diagnostico }
}
