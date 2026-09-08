/**
 * Leituras agregadas para o dashboard (server only, service role).
 * Tudo vem das funções SQL admin_* da migration 20260909_admin.sql:
 * o servidor nunca carrega linhas individuais de consultas ou sonhos.
 */

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin"

export type Overview = {
  users_total: number
  users_new_month: number
  users_active_month: number
  readings_today: number
  readings_month: number
  readings_total: number
  reading_users_total: number
  previews_month: number
  previews_total: number
  previews_unlocked: number
  dreams_today: number
  dreams_month: number
  dreams_total: number
  dream_users_total: number
  dream_users_month: number
  dream_repeat_users: number
  journeys_month: number
  journeys_total: number
  saved_readings_total: number
  saved_dreams_total: number
  saved_journeys_total: number
  subs_active: number
  subs_essential: number
  subs_unlimited: number
  subs_past_due: number
  subs_cancel_scheduled: number
  subs_canceled: number
  subs_new_month: number
  subs_canceled_month: number
  overrides_active: number
  admins: number
  ai_cost_today: number
  ai_cost_month: number
  ai_cost_total: number
  ai_calls_month: number
  ai_input_month: number
  ai_output_month: number
  ai_since: string | null
  usage_since: string | null
  events_since: string | null
}

export type MonthlyRow = {
  month: string
  readings: number
  previews: number
  dreams: number
  journeys: number
  active_users: number
  new_users: number
  saved_readings: number
  saved_dreams: number
  saved_users: number
  ai_cost: number
  ai_calls: number
  ai_input: number
  ai_output: number
  new_subs: number
  canceled_subs: number
}

export type AiMonthlyRow = { month: string; operation_type: string; calls: number; input_tokens: number; output_tokens: number; cost: number }
export type EventMonthlyRow = { month: string; event_type: string; total: number; people: number }
export type OracleOpenRow = { month: string; oracle: string; total: number; people: number }
export type Funnel = {
  anonymous_first_reading: number
  second_attempt: number
  login_after_reading: number
  plans_viewed: number
  checkout_started: number
  subscribed: number
  since: string | null
}
export type AdminUserRow = {
  user_id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  role: string
  plan: string | null
  sub_status: string | null
  provider: string | null
  cancel_at_period_end: boolean | null
  current_period_end: string | null
  override_plan: string | null
  override_reason: string | null
  override_expires_at: string | null
  readings_month: number
  dreams_month: number
  journeys_month: number
  readings_total: number
  last_activity: string | null
}
export type OverrideRow = {
  id: string
  user_id: string | null
  email: string
  plan_override: string
  reason: string
  expires_at: string | null
  revoked_at: string | null
  created_at: string
}

function num(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : 0
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T | null> {
  if (!hasAdminClient()) return null
  const { data, error } = await createAdminClient().rpc(fn, args ?? {})
  if (error) {
    console.error(`[admin] ${fn}:`, error.message)
    return null
  }
  return data as T
}

function numify<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) out[k] = typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v) ? num(v) : v
  return out as T
}

export async function getOverview(): Promise<Overview | null> {
  const data = await rpc<Record<string, unknown>>("admin_overview")
  return data ? (numify(data) as unknown as Overview) : null
}

export async function getMonthly(): Promise<MonthlyRow[]> {
  const rows = await rpc<Record<string, unknown>[]>("admin_monthly")
  return (rows ?? []).map((r) => numify(r) as unknown as MonthlyRow)
}

export async function getAiMonthly(): Promise<AiMonthlyRow[]> {
  const rows = await rpc<Record<string, unknown>[]>("admin_ai_monthly")
  return (rows ?? []).map((r) => numify(r) as unknown as AiMonthlyRow)
}

export async function getEventsMonthly(): Promise<EventMonthlyRow[]> {
  const rows = await rpc<Record<string, unknown>[]>("admin_events_monthly")
  return (rows ?? []).map((r) => numify(r) as unknown as EventMonthlyRow)
}

export async function getOracleOpens(): Promise<OracleOpenRow[]> {
  const rows = await rpc<Record<string, unknown>[]>("admin_oracle_opens")
  return (rows ?? []).map((r) => numify(r) as unknown as OracleOpenRow)
}

export async function getFunnel(): Promise<Funnel | null> {
  const data = await rpc<Record<string, unknown>>("admin_funnel")
  return data ? (numify(data) as unknown as Funnel) : null
}

export const USERS_PAGE_SIZE = 50

export async function listUsers(search: string, page: number): Promise<{ rows: AdminUserRow[]; total: number }> {
  const p_search = search.trim().slice(0, 100) || null
  const offset = Math.max(0, page - 1) * USERS_PAGE_SIZE
  const [rows, total] = await Promise.all([
    rpc<Record<string, unknown>[]>("admin_users", { p_search, p_limit: USERS_PAGE_SIZE, p_offset: offset }),
    rpc<number | string>("admin_users_count", { p_search }),
  ])
  return { rows: (rows ?? []).map((r) => numify(r) as unknown as AdminUserRow), total: num(total) }
}

export async function listOverrides(): Promise<OverrideRow[]> {
  if (!hasAdminClient()) return []
  const { data, error } = await createAdminClient()
    .from("access_overrides")
    .select("id, user_id, email, plan_override, reason, expires_at, revoked_at, created_at")
    .order("created_at", { ascending: false })
    .limit(500)
  if (error) {
    console.error("[admin] access_overrides:", error.message)
    return []
  }
  return (data ?? []) as OverrideRow[]
}

export function overrideState(o: OverrideRow, now = Date.now()): "active" | "expired" | "revoked" {
  if (o.revoked_at) return "revoked"
  if (o.expires_at && new Date(o.expires_at).getTime() <= now) return "expired"
  return "active"
}
