/**
 * Eventos mínimos de produto (funil), sem conteúdo pessoal.
 * Best-effort: nunca derruba a requisição se o registro falhar.
 *
 * Guarda só tipo, conta ou visitante, seed (quando há) e data. Serve ao
 * dashboard administrativo; nenhum evento carrega pergunta, sonho ou texto.
 */

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"

export type ProductEvent =
  // preview paywall (segunda tiragem)
  | "preview_created"
  | "preview_reopened"
  | "preview_viewed"
  | "login_after_preview"
  | "preview_unlocked"
  | "preview_expired"
  // funil de assinatura
  | "plans_viewed"
  | "checkout_started"
  // interface: qual cartão de oráculo a pessoa abriu na tela de resultado
  | "oracle_opened"

export async function logEvent(
  type: ProductEvent,
  ctx: { userId?: string | null; visitorId?: string | null; seed?: string | null; meta?: Record<string, string | number | boolean> }
): Promise<void> {
  if (!hasAdminClient()) return
  try {
    const { error } = await createAdminClient().from("product_events").insert({
      event_type: type,
      user_id: ctx.userId ?? null,
      visitor_id: ctx.visitorId ?? null,
      seed: ctx.seed ?? null,
      meta: ctx.meta ?? {},
    })
    if (error) console.warn("[events]", type, error.message)
  } catch (err) {
    console.warn("[events]", type, err)
  }
}
