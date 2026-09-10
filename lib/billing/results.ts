/**
 * Persistência técnica da consulta (server only).
 *
 * As cinco interpretações são guardadas em `reading_results` ASSIM QUE
 * terminam, antes da síntese. Isso existe por três motivos, todos técnicos:
 *   1. integridade — a síntese lê os cinco resultados daqui, nunca do cliente;
 *   2. recuperação — recarregar a página não perde a tiragem já paga;
 *   3. nova tentativa da síntese sem refazer sorteio nem interpretação.
 *
 * Isto NÃO é "Leitura Salva". O salvamento pessoal continua sendo uma ação
 * explícita da pessoa e vive em outra tabela (`consultations`, is_saved).
 * As três situações são distinguíveis no banco:
 *   preview             → reading_usage.preview = true
 *   persistência técnica → reading_usage.preview = false + reading_results
 *   leitura salva        → consultations.is_saved = true
 *
 * Retenção: linhas técnicas (não preview, não desbloqueadas) são apagadas
 * depois de TECHNICAL_TTL_HOURS. Previews seguem a própria regra de 30 dias
 * em `preview.ts`. Guardar pergunta e interpretação por necessidade técnica
 * não justifica guardá-las para sempre.
 */

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"

/** Janela de recuperação da consulta corrente (refresh e nova tentativa da síntese). */
export const TECHNICAL_TTL_HOURS = 24
const TECHNICAL_TTL_MS = TECHNICAL_TTL_HOURS * 60 * 60 * 1000

/** Uma geração de síntese em andamento expira depois disto e pode ser retomada. */
export const SYNTHESIS_LOCK_MS = 2 * 60 * 1000

export type StoredOracleResult = {
  key: string
  title: string
  method?: string
  seed?: string
  locale?: string
  draw: { items: Array<{ position?: string; name: string; meaning?: string }>; notes?: string; [k: string]: unknown }
  reading: string
  evidence?: Array<{ source: string; excerpt: string }>
}

export type StoredReading = {
  seed: string
  user_id: string | null
  visitor_id: string | null
  question: string
  locale: string
  oracles: Record<string, StoredOracleResult>
  synthesis: string
  created_at: string
}

/**
 * Guarda os cinco resultados completos. A síntese entra vazia e é preenchida
 * depois por `storeSynthesis`. Devolve false se não deu para guardar — nesse
 * caso a consulta é tratada como incompleta e não consome cota.
 */
/**
 * Fallback de desenvolvimento. Sem SUPABASE_SERVICE_ROLE_KEY não há banco
 * para guardar a leitura; em vez de derrubar a consulta, ela fica na memória
 * do processo, o que faz o fluxo local funcionar de ponta a ponta.
 *
 * Isto nunca entra em produção: sem service role, `consumeReading` já falha
 * fechado antes de chegar aqui (billingUnavailableIsFatal).
 */
// no modo de desenvolvimento cada rota tem seu próprio grafo de módulos, então
// o mapa precisa viver no escopo global para as duas rotas verem a mesma leitura
const devStore: Map<string, StoredReading> =
  ((globalThis as { __multioraculoDevReadings?: Map<string, StoredReading> }).__multioraculoDevReadings ??= new Map())

/**
 * O fallback em memória é PROIBIDO em produção.
 *
 * Em produção, sem service role a consulta já é recusada antes de chegar aqui
 * (consumeReading falha fechado). Esta checagem é a segunda tranca: mesmo que
 * alguém chame estas funções por engano, nada é guardado em memória — a
 * gravação falha e a consulta é tratada como incompleta, sem consumir cota.
 */
function devFallbackAllowed(): boolean {
  return process.env.NODE_ENV !== "production"
}

export async function storeReadingResult(input: {
  seed: string
  userId: string | null
  visitorId: string | null
  question: string
  locale: string
  oracles: Record<string, StoredOracleResult>
}): Promise<boolean> {
  if (!hasAdminClient()) {
    if (!devFallbackAllowed()) {
      console.error("[results] produção sem SUPABASE_SERVICE_ROLE_KEY: leitura NÃO guardada")
      return false
    }
    devStore.set(input.seed, {
      seed: input.seed,
      user_id: input.userId,
      visitor_id: input.userId ? null : input.visitorId,
      question: input.question,
      locale: input.locale,
      oracles: input.oracles,
      synthesis: "",
      created_at: new Date().toISOString(),
    })
    return true
  }
  const { error } = await createAdminClient().from("reading_results").insert({
    seed: input.seed,
    user_id: input.userId,
    visitor_id: input.userId ? null : input.visitorId,
    question: input.question,
    locale: input.locale,
    oracles: input.oracles,
    synthesis: "",
  })
  if (error) {
    // 23505: já existe (nova tentativa da mesma consulta) — segue válido
    if (error.code === "23505") return true
    console.error("[results] storeReadingResult:", error.code, error.message)
    return false
  }
  return true
}

/** Leitura guardada deste seed, apenas para o dono (conta ou cookie de visitante). */
export async function loadOwnedReading(
  seed: string,
  userId: string | null,
  visitorId: string | null
): Promise<StoredReading | null> {
  if (!seed) return null
  if (!hasAdminClient()) {
    if (!devFallbackAllowed()) return null
    const dev = devStore.get(seed)
    if (!dev) return null
    const owned = userId ? dev.user_id === userId : Boolean(visitorId) && !dev.user_id && dev.visitor_id === visitorId
    return owned ? dev : null
  }
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("reading_results")
    .select("seed, user_id, visitor_id, question, locale, oracles, synthesis, created_at")
    .eq("seed", seed)
    .maybeSingle()
  if (error || !data) return null
  const rec = data as StoredReading
  const owned = userId ? rec.user_id === userId : Boolean(visitorId) && !rec.user_id && rec.visitor_id === visitorId
  if (!owned) return null
  // fora da janela de recuperação, a linha técnica não é mais servida
  if (Date.now() - new Date(rec.created_at).getTime() > TECHNICAL_TTL_MS) return null
  return rec
}

/** Grava a síntese na leitura já guardada. */
export async function storeSynthesis(seed: string, synthesis: string): Promise<void> {
  if (!hasAdminClient()) {
    if (!devFallbackAllowed()) return
    const dev = devStore.get(seed)
    if (dev) dev.synthesis = synthesis
    return
  }
  const { error } = await createAdminClient().from("reading_results").update({ synthesis }).eq("seed", seed)
  if (error) console.error("[results] storeSynthesis:", error.message)
}

/** No máximo uma limpeza a cada 30 min por instância, e no máximo 500 por vez. */
const PURGE_EVERY_MS = 30 * 60 * 1000
const PURGE_BATCH = 500
let lastPurgeAt = 0

/**
 * Apaga leituras guardadas só por necessidade técnica que já passaram da
 * janela de recuperação.
 *
 * Não toca em previews (têm regra própria de 30 dias em preview.ts) nem em
 * `consultations` (leitura salva pela pessoa é outra tabela e outra cópia:
 * apagar aqui não a afeta).
 *
 * Onde roda: em POST /consultas, disparada sem `await` logo depois de
 * reservar a tiragem, enquanto o modelo trabalha. Ou seja, o gatilho é o
 * próprio uso do produto — não depende de cron, worker ou processo externo,
 * que em serverless simplesmente não existiriam.
 *
 * Best-effort por construção: nunca lança, nunca é aguardada e nunca entra no
 * caminho da resposta. Se falhar, a consulta segue normalmente e a limpeza
 * tenta de novo na próxima consulta depois do intervalo.
 */
export async function purgeExpiredTechnicalResults(): Promise<void> {
  try {
    if (!hasAdminClient()) return
    const now = Date.now()
    if (now - lastPurgeAt < PURGE_EVERY_MS) return
    lastPurgeAt = now

    const admin = createAdminClient()
    const cutoff = new Date(now - TECHNICAL_TTL_MS).toISOString()
    const { data, error } = await admin
      .from("reading_usage")
      .select("seed")
      .eq("preview", false)
      .lt("created_at", cutoff)
      .limit(PURGE_BATCH)
    if (error || !data || data.length === 0) return
    const seeds = data.map((r: { seed: string }) => r.seed)
    const { error: delError } = await admin.from("reading_results").delete().in("seed", seeds)
    if (delError) console.warn("[results] purge:", delError.message)
  } catch (err) {
    console.warn("[results] purge:", err)
  }
}
