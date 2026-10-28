/**
 * Consumo de cota (server only) — tiragens, sonhos e jornada.
 *
 * Unidade de consumo = uma operação completa que chama o modelo, registrada
 * UMA vez em `reading_usage` (seed + kind). A síntese da tiragem não conta;
 * ela só é liberada para um seed já concluído do mesmo dono, uma vez.
 *
 * Dois caminhos:
 * - Usuário logado: função SQL atômica `consume_reading` (cota do plano por
 *   tipo, trava por usuário). Antes dela, consumos feitos sem login com o
 *   mesmo cookie de visitante são atribuídos à conta, para contarem na cota.
 * - Visitante sem login: uma gratuita de cada tipo experimentável (tiragem,
 *   sonho) por cookie, garantida por índice único no banco. Depois, pede login.
 *
 * Em todos os casos, falha técnica ('failed' ou 'started' abandonada) nunca
 * consome cota.
 */

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { getUserEntitlement, STARTED_WINDOW_MS, type Entitlement } from "./entitlement"
import { SYNTHESIS_LOCK_MS } from "./results"
import { TRIAL_KINDS, type UsageKind } from "./plans"

export type ConsumeCode = "limit_reached" | "plan_required" | "trial_used" | "free_used" | "billing_unavailable"

export type ConsumeResult =
  | { allowed: true; used: number; limit: number | null; remaining: number | null; entitlement: Entitlement; tracked: boolean }
  | { allowed: false; code: ConsumeCode; used: number; limit: number | null; entitlement: Entitlement }

/** HTTP status por código, para as rotas responderem de forma uniforme. */
export function httpStatusFor(code: ConsumeCode): number {
  switch (code) {
    case "trial_used":
      return 401
    case "billing_unavailable":
      return 503
    default:
      return 402
  }
}

/**
 * Sem service role não há como contar nem registrar. Em desenvolvimento o
 * sistema segue aberto (comportamento original); em produção falha fechado
 * para o limite nunca ser silenciosamente desligado.
 */
function billingUnavailableIsFatal(): boolean {
  return process.env.NODE_ENV === "production"
}

/** Janela "para sempre" da primeira Jornada gratuita: conta todos os usos da conta, de qualquer período. */
export const PRIMEIRA_JORNADA_INICIO = "1970-01-01T00:00:00.000Z"
export const PRIMEIRA_JORNADA_FIM = "2100-01-01T00:00:00.000Z"

/**
 * Como um consumo é medido. Regra de produto: a PRIMEIRA Jornada de cada conta
 * é gratuita, uma única vez (não renova por mês); as seguintes seguem o plano.
 * Só muda algo para quem tem limite 0 de Jornada (Free): o mesmo
 * consume_reading, atômico por usuário, passa a contar a vida inteira da conta
 * com limite 1. Quem já usou uma Jornada (paga ou não) não ganha outra.
 * Planos com cota própria (Essencial, Ilimitado) seguem exatamente como antes.
 * Uma geração que falhou não conta (a função só soma 'completed' e 'started' recente).
 */
export function regraDeConsumo(kind: UsageKind, limit: number | null, periodoInicio: string, periodoFim: string) {
  if (limit === 0 && kind === "journey") {
    return { planoNecessario: false, primeiraGratis: true, limit: 1 as number | null, inicio: PRIMEIRA_JORNADA_INICIO, fim: PRIMEIRA_JORNADA_FIM }
  }
  if (limit === 0) return { planoNecessario: true, primeiraGratis: false, limit, inicio: periodoInicio, fim: periodoFim }
  return { planoNecessario: false, primeiraGratis: false, limit, inicio: periodoInicio, fim: periodoFim }
}

/**
 * Consumos feitos sem login com este cookie passam a pertencer à conta.
 * Chamado ao consumir logado, ao abrir a página de assinatura e no status,
 * para que "já usou a gratuita" apareça logo após o login.
 */
export async function attributeVisitorReadings(userId: string, visitorId: string | null): Promise<void> {
  if (!visitorId || !hasAdminClient()) return
  const { error } = await createAdminClient()
    .from("reading_usage")
    .update({ user_id: userId })
    .eq("visitor_id", visitorId)
    .is("user_id", null)
  // 23505: a conta já tinha uma preview pendente própria; a do cookie fica como visitante
  if (error && error.code !== "23505") console.error("[billing] attributeVisitorReadings:", error.message)
  // conteúdo das previews acompanha a atribuição
  const { attributePreviewResults } = await import("./preview")
  await attributePreviewResults(userId, visitorId)
}

export async function consumeReading(input: {
  userId: string | null
  visitorId: string | null
  seed: string
  locale: string
  kind?: UsageKind
}): Promise<ConsumeResult> {
  const kind: UsageKind = input.kind ?? "reading"
  const entitlement = await getUserEntitlement(input.userId)
  const limit = entitlement.limits[kind]

  if (!hasAdminClient()) {
    if (billingUnavailableIsFatal()) {
      console.error("[billing] SUPABASE_SERVICE_ROLE_KEY ausente em produção: consumo bloqueado")
      return { allowed: false, code: "billing_unavailable", used: 0, limit, entitlement }
    }
    console.warn("[billing] SUPABASE_SERVICE_ROLE_KEY ausente: consumo liberado sem registro (dev)")
    return { allowed: true, used: 0, limit, remaining: null, entitlement, tracked: false }
  }

  const admin = createAdminClient()

  // ------------------------------------------------------------------------
  // Visitante sem login: uma gratuita por tipo experimentável, por cookie.
  // ------------------------------------------------------------------------
  if (!input.userId) {
    if (!TRIAL_KINDS.includes(kind) || !input.visitorId) {
      return { allowed: false, code: "trial_used", used: 0, limit, entitlement }
    }

    // tentativa abandonada (queda/timeout) não bloqueia a gratuita
    const windowStart = new Date(Date.now() - STARTED_WINDOW_MS).toISOString()
    await admin
      .from("reading_usage")
      .update({ status: "failed" })
      .eq("visitor_id", input.visitorId)
      .eq("kind", kind)
      .eq("status", "started")
      .lt("created_at", windowStart)

    const { error } = await admin
      .from("reading_usage")
      .insert({ user_id: null, visitor_id: input.visitorId, seed: input.seed, status: "started", locale: input.locale, kind })

    if (error) {
      // índice único reading_usage_visitor_trial_idx: já existe gratuita deste tipo para o visitante
      if (error.code === "23505") {
        return { allowed: false, code: "trial_used", used: 1, limit, entitlement }
      }
      console.error("[billing] falha ao registrar gratuita de visitante:", error.message)
      return { allowed: false, code: "billing_unavailable", used: 0, limit, entitlement }
    }
    return { allowed: true, used: 1, limit: 1, remaining: 0, entitlement, tracked: true }
  }

  // ------------------------------------------------------------------------
  // Usuário logado: atribui a gratuita feita antes do login e consome no plano.
  // ------------------------------------------------------------------------
  await attributeVisitorReadings(input.userId, input.visitorId)

  const regra = regraDeConsumo(kind, limit, entitlement.periodStart, entitlement.periodEnd)
  // tipo não incluído no plano
  if (regra.planoNecessario) {
    return { allowed: false, code: "plan_required", used: 0, limit, entitlement }
  }

  const { data, error } = await admin.rpc("consume_reading", {
    p_user_id: input.userId,
    p_seed: input.seed,
    p_limit: regra.limit,
    p_period_start: regra.inicio,
    p_period_end: regra.fim,
    p_locale: input.locale,
    p_kind: kind,
  })

  if (error) {
    console.error("[billing] consume_reading falhou:", error.message)
    return { allowed: false, code: "billing_unavailable", used: 0, limit, entitlement }
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row?.allowed) {
    // a primeira Jornada gratuita já foi usada: o resto é do plano
    if (regra.primeiraGratis) return { allowed: false, code: "free_used", used: Number(row?.used ?? 1), limit: 1, entitlement }
    return { allowed: false, code: "limit_reached", used: Number(row?.used ?? 0), limit, entitlement }
  }
  return {
    allowed: true,
    used: Number(row.used ?? 0),
    limit,
    remaining: row.remaining === null || row.remaining === undefined ? null : Number(row.remaining),
    entitlement,
    tracked: true,
  }
}

export async function completeReading(seed: string): Promise<void> {
  if (!hasAdminClient()) return
  const { error } = await createAdminClient()
    .from("reading_usage")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("seed", seed)
    .eq("status", "started")
  if (error) console.error("[billing] completeReading:", error.message)
}

/** Consumo que falhou não conta na cota (nem na gratuita do visitante). */
export async function failReading(seed: string): Promise<void> {
  if (!hasAdminClient()) return
  const { error } = await createAdminClient()
    .from("reading_usage")
    .update({ status: "failed" })
    .eq("seed", seed)
    .eq("status", "started")
  if (error) console.error("[billing] failReading:", error.message)
}

/**
 * Reserva a vaga de geração da síntese de uma tiragem concluída.
 *
 * A dona da leitura já foi verificada antes (loadOwnedReading, por seed). Aqui
 * a regra é só de concorrência: uma geração por vez, e uma tentativa anterior
 * que morreu no meio libera a vaga sozinha depois de SYNTHESIS_LOCK_MS, para
 * que a pessoa possa tentar de novo — sem novo sorteio, sem reinterpretação e
 * sem consumir outra leitura.
 */
/** Trava equivalente em memória, só quando não há banco (desenvolvimento). */
const devSynthesisLocks: Map<string, number> =
  ((globalThis as { __multioraculoDevLocks?: Map<string, number> }).__multioraculoDevLocks ??= new Map())

export async function claimSynthesisSlot(seed: string): Promise<boolean> {
  if (!hasAdminClient()) {
    if (billingUnavailableIsFatal()) return false
    const now = Date.now()
    const at = devSynthesisLocks.get(seed) ?? 0
    if (now - at < SYNTHESIS_LOCK_MS) return false
    devSynthesisLocks.set(seed, now)
    return true
  }
  const stale = new Date(Date.now() - SYNTHESIS_LOCK_MS).toISOString()
  const { data, error } = await createAdminClient()
    .from("reading_usage")
    .update({ synthesized_at: new Date().toISOString() })
    .eq("seed", seed)
    .eq("kind", "reading")
    .eq("status", "completed")
    .or(`synthesized_at.is.null,synthesized_at.lt.${stale}`)
    .select("id")
  if (error) {
    console.error("[billing] claimSynthesisSlot:", error.message)
    return false
  }
  return Array.isArray(data) && data.length === 1
}

/** Devolve a vaga quando a geração falha, para permitir nova tentativa. */
export async function releaseSynthesisSlot(seed: string): Promise<void> {
  if (!hasAdminClient()) {
    devSynthesisLocks.delete(seed)
    return
  }
  const { error } = await createAdminClient()
    .from("reading_usage")
    .update({ synthesized_at: null })
    .eq("seed", seed)
  if (error) console.warn("[billing] releaseSynthesisSlot:", error.message)
}

/** Lê o cookie de visitante de um jar do Next (cookies()). */
export function visitorIdFrom(value: string | undefined): string | null {
  return typeof value === "string" && /^[0-9a-f-]{20,64}$/i.test(value) ? value : null
}

/**
 * Quanto tempo uma geração da Jornada pode ficar 'started' antes de a trava
 * ser considerada abandonada. A rota tem maxDuration de 60 s, então 2 minutos
 * cobrem qualquer geração viva; uma instância que morreu no meio libera a
 * pessoa em no máximo isto (nenhuma trava permanente).
 */
export const JORNADA_TRAVA_MS = 2 * 60 * 1000

/** o pedaço do cliente que a consulta usa (facilita o teste com banco falso) */
type ClienteUso = { from: (tabela: string) => any }

/**
 * Há outra geração da Jornada deste usuário em curso (linha 'started' recente
 * de kind 'journey' que não seja a de `seed`)?
 *
 * POR QUE ISTO BASTA ENTRE INSTÂNCIAS: a linha 'started' nasce dentro de
 * consume_reading, que serializa por (usuário, tipo) com pg_advisory_xact_lock
 * e só devolve depois do commit. Logo, de duas gerações concorrentes, a que
 * insere depois SEMPRE enxerga a linha da que inseriu antes quando faz esta
 * consulta (statement novo, READ COMMITTED), e recua. A que inseriu primeiro
 * pode enxergar a outra e recuar também: nunca avançam as duas. A linha só
 * sai de 'started' DEPOIS de a análise ser salva, então quem chega depois
 * encontra a análise pronta e a reutiliza. Lança em caso de erro: o chamador
 * decide, e na checagem pós-cobrança erro significa "não avance".
 */
export async function consultarJornadaEmAndamento(
  client: ClienteUso,
  userId: string,
  seed: string | null,
  agora: number = Date.now(),
): Promise<boolean> {
  const janela = Math.min(STARTED_WINDOW_MS, JORNADA_TRAVA_MS)
  let q = client
    .from("reading_usage")
    .select("seed")
    .eq("user_id", userId)
    .eq("kind", "journey")
    .eq("status", "started")
    .gte("created_at", new Date(agora - janela).toISOString())
  if (seed) q = q.neq("seed", seed)
  const { data, error } = await q.limit(1)
  if (error) throw new Error(error.message)
  return Array.isArray(data) && data.length > 0
}

/** Versão de produção: service role. Sem ela (desenvolvimento) devolve false e a rota usa a trava em memória. */
export async function jornadaEmAndamento(userId: string, seed: string | null): Promise<boolean> {
  if (!hasAdminClient()) return false
  return consultarJornadaEmAndamento(createAdminClient(), userId, seed)
}
