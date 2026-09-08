/**
 * Preview paywall (server only).
 *
 * Quando alguém sem plano pago já usou a gratuita e pergunta de novo, a
 * tiragem é gerada UMA vez, inteira, e guardada em `reading_results`, uma
 * tabela sem acesso pelo cliente. O navegador recebe só o início real da
 * síntese (teaser). Depois da assinatura confirmada pelo webhook, a mesma
 * leitura é liberada: nenhum sorteio nem geração nova.
 *
 * Regras:
 * - uma preview pendente por pessoa (conta ou cookie de visitante), garantida
 *   por índice único; novas tentativas reabrem a mesma leitura, sem OpenAI;
 * - preview não desbloqueada em 30 dias expira e deixa de existir;
 * - a leitura desbloqueada não consome cota (consume_reading ignora preview).
 */

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"
import { STARTED_WINDOW_MS } from "./entitlement"
import { logEvent } from "./events"

export const PREVIEW_TTL_DAYS = 30
const PREVIEW_TTL_MS = PREVIEW_TTL_DAYS * 24 * 60 * 60 * 1000

/** Limites do teaser, em caracteres: cerca de duas linhas, terminando em frase */
const TEASER_MIN = 80
const TEASER_MAX = 190

export type StoredOracle = {
  key: string
  title: string
  method?: string
  seed?: string
  locale?: string
  draw: { items: Array<{ position?: string; name: string; meaning?: string }>; notes?: string; shells?: { primary: number; confirmation: number } }
  reading: string
  evidence?: Array<{ source: string; excerpt: string }>
}

export type PreviewRecord = {
  seed: string
  user_id: string | null
  visitor_id: string | null
  question: string
  locale: string
  oracles: Record<string, StoredOracle>
  synthesis: string
  created_at: string
  unlocked_at: string | null
}

/**
 * Ponto de corte do teaser em um texto que pode ainda estar crescendo
 * (streaming). Devolve o índice de corte assim que ele for decidível:
 * - o PRIMEIRO fim de frase a partir de TEASER_MIN; ou
 * - se o texto já passou de TEASER_MAX sem fim de frase, o último espaço
 *   antes de TEASER_MAX (ou TEASER_MAX).
 * Devolve null enquanto ainda não dá para decidir (texto curto demais).
 * A mesma regra vale para o texto completo, então o teaser mostrado durante
 * o streaming é idêntico ao calculado depois a partir da síntese salva.
 */
export function teaserCut(text: string): number | null {
  const re = /[.!?…]+(?=\s|$)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const idx = m.index + m[0].length
    if (idx >= TEASER_MIN) return idx <= TEASER_MAX ? idx : null
  }
  if (text.length > TEASER_MAX) {
    const lastSpace = text.lastIndexOf(" ", TEASER_MAX)
    return lastSpace > TEASER_MIN ? lastSpace : TEASER_MAX
  }
  return null
}

/**
 * Início real da síntese: até ~190 caracteres (duas linhas), cortado no
 * primeiro fim de frase depois de 80, senão na última palavra.
 */
export function teaserOf(synthesis: string): string {
  const text = synthesis.trim()
  const cut = teaserCut(text)
  if (cut === null) return text
  const out = text.slice(0, cut).trim()
  return /[.!?…]$/.test(out) ? out : out + "…"
}

function ownerFilter<T extends { eq: any; is: any }>(q: T, userId: string | null, visitorId: string | null): T {
  if (userId) return q.eq("user_id", userId)
  if (visitorId) return q.is("user_id", null).eq("visitor_id", visitorId)
  return q.eq("user_id", "00000000-0000-0000-0000-000000000000") // nunca casa
}

/** Previews não desbloqueadas há mais de 30 dias: marca expiração e apaga o conteúdo. */
export async function expireOldPreviews(): Promise<void> {
  if (!hasAdminClient()) return
  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - PREVIEW_TTL_MS).toISOString()
  const { data, error } = await admin
    .from("reading_usage")
    .update({ expired_at: new Date().toISOString() })
    .eq("preview", true)
    .is("unlocked_at", null)
    .is("expired_at", null)
    .lt("created_at", cutoff)
    .select("seed, user_id, visitor_id")
  if (error) {
    console.warn("[preview] expireOldPreviews:", error.message)
    return
  }
  for (const row of data ?? []) {
    await admin.from("reading_results").delete().eq("seed", row.seed)
    await logEvent("preview_expired", { userId: row.user_id, visitorId: row.visitor_id, seed: row.seed })
  }
}

/** Leitura pendente (gerada, bloqueada, dentro da validade) desta pessoa, se houver. */
export async function findPendingPreview(
  userId: string | null,
  visitorId: string | null
): Promise<{ seed: string; createdAt: string; teaser: string } | null> {
  if (!hasAdminClient()) return null
  await expireOldPreviews()
  const admin = createAdminClient()
  let q = admin
    .from("reading_usage")
    .select("seed, created_at, status")
    .eq("kind", "reading")
    .eq("preview", true)
    .is("unlocked_at", null)
    .is("expired_at", null)
    .in("status", ["started", "completed"])
    .order("created_at", { ascending: false })
    .limit(1)
  q = ownerFilter(q as any, userId, visitorId)
  const { data } = await q
  const row = data?.[0]
  if (!row) return null

  if (row.status === "started") {
    // geração em andamento ou abandonada
    const age = Date.now() - new Date(row.created_at).getTime()
    if (age > STARTED_WINDOW_MS) {
      await admin.from("reading_usage").update({ status: "failed" }).eq("seed", row.seed).eq("status", "started")
      return null
    }
    return null
  }

  const { data: res } = await admin.from("reading_results").select("synthesis").eq("seed", row.seed).maybeSingle()
  if (!res) return null
  return { seed: row.seed, createdAt: row.created_at, teaser: teaserOf(res.synthesis) }
}

/**
 * Reserva a vaga de preview desta pessoa (linha 'started'). Devolve
 * "exists" se o índice único indicar que já há uma pendente.
 */
export async function reservePreview(input: {
  userId: string | null
  visitorId: string | null
  seed: string
  locale: string
}): Promise<"reserved" | "exists" | "unavailable"> {
  if (!hasAdminClient()) return "unavailable"
  const { error } = await createAdminClient().from("reading_usage").insert({
    user_id: input.userId,
    visitor_id: input.userId ? null : input.visitorId,
    seed: input.seed,
    kind: "reading",
    status: "started",
    locale: input.locale,
    preview: true,
  })
  if (!error) return "reserved"
  if (error.code === "23505") return "exists"
  console.error("[preview] reservePreview:", error.message)
  return "unavailable"
}

/** Guarda o conteúdo completo no servidor e fecha a linha de uso como concluída. */
export async function storePreviewResult(input: {
  seed: string
  userId: string | null
  visitorId: string | null
  question: string
  locale: string
  oracles: Record<string, StoredOracle>
  synthesis: string
}): Promise<boolean> {
  if (!hasAdminClient()) return false
  const admin = createAdminClient()
  const { error } = await admin.from("reading_results").insert({
    seed: input.seed,
    user_id: input.userId,
    visitor_id: input.userId ? null : input.visitorId,
    question: input.question,
    locale: input.locale,
    oracles: input.oracles,
    synthesis: input.synthesis,
  })
  if (error) {
    console.error("[preview] storePreviewResult:", error.message)
    return false
  }
  const now = new Date().toISOString()
  await admin
    .from("reading_usage")
    .update({ status: "completed", completed_at: now, synthesized_at: now })
    .eq("seed", input.seed)
  return true
}

/** Preview que falhou na geração: libera a vaga (não conta, não bloqueia). */
export async function failPreview(seed: string): Promise<void> {
  if (!hasAdminClient()) return
  await createAdminClient().from("reading_usage").update({ status: "failed" }).eq("seed", seed).eq("status", "started")
}

export async function loadPreview(seed: string): Promise<PreviewRecord | null> {
  if (!hasAdminClient() || !seed) return null
  const admin = createAdminClient()
  const { data: usage } = await admin
    .from("reading_usage")
    .select("seed, expired_at, status")
    .eq("seed", seed)
    .eq("preview", true)
    .maybeSingle()
  if (!usage || usage.expired_at || usage.status !== "completed") return null
  const { data } = await admin.from("reading_results").select("*").eq("seed", seed).maybeSingle()
  return (data as PreviewRecord | null) ?? null
}

export function isPreviewOwner(rec: PreviewRecord, userId: string | null, visitorId: string | null): boolean {
  if (userId && rec.user_id === userId) return true
  if (!rec.user_id && visitorId && rec.visitor_id === visitorId) return true
  return false
}

/** Libera a leitura (idempotente). Não consome cota: consume_reading ignora linhas de preview. */
export async function unlockPreview(seed: string, userId: string | null, visitorId: string | null): Promise<void> {
  if (!hasAdminClient()) return
  const admin = createAdminClient()
  const now = new Date().toISOString()
  await admin.from("reading_usage").update({ unlocked_at: now }).eq("seed", seed).eq("preview", true).is("unlocked_at", null)
  await admin.from("reading_results").update({ unlocked_at: now }).eq("seed", seed).is("unlocked_at", null)
  await logEvent("preview_unlocked", { userId, visitorId, seed })
}

/** Ao entrar, a preview do cookie passa para a conta (junto com a atribuição de uso). */
export async function attributePreviewResults(userId: string, visitorId: string | null): Promise<void> {
  if (!visitorId || !hasAdminClient()) return
  const admin = createAdminClient()
  const { data } = await admin
    .from("reading_results")
    .update({ user_id: userId })
    .eq("visitor_id", visitorId)
    .is("user_id", null)
    .select("seed")
  if (data && data.length > 0) await logEvent("login_after_preview", { userId, visitorId, seed: data[0].seed })
}
