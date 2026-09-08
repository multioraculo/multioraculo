import Link from "next/link"
import { USERS_PAGE_SIZE, listUsers } from "@/lib/admin/metrics"
import { Badge, Note, Section, Table, fmtDate, fmtDateTime, fmtInt } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ q?: string; page?: string }>

const PLAN: Record<string, string> = { unlimited: "Ilimitado", essential: "Essencial", free: "Free" }

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const q = (sp.q ?? "").trim()
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)
  const { rows, total } = await listUsers(q, page)
  const pages = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE))

  const href = (p: number) => `/admin/usuarios?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) }).toString()}`

  return (
    <>
      <Section title="Usuários" hint={`${fmtInt(total)} contas · consumo no mês civil atual`}>
        <form method="get" className="mb-4 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por e-mail"
            className="flex-1 max-w-md rounded-full bg-white/5 border border-white/15 px-4 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/35"
          />
          <button type="submit" className="px-5 rounded-full bg-white/15 border border-white/25 text-white text-sm hover:bg-white/20">Buscar</button>
          {q && (
            <Link href="/admin/usuarios" className="px-4 py-2 text-white/60 text-sm hover:text-white">limpar</Link>
          )}
        </form>

        <Table
          head={["E-mail", "Plano", "Acesso", "Tiragens (mês)", "Sonhos (mês)", "Jornadas (mês)", "Tiragens (total)", "Última atividade", "Cadastro"]}
          rows={rows.map((u) => {
            const access = accessOf(u)
            return [
              <span key="e">
                {u.email}
                {u.role === "admin" && <Badge tone="default">admin</Badge>}
              </span>,
              access.plan,
              <span key="a">
                <Badge tone={access.tone}>{access.label}</Badge>
                {access.sub && <span className="block text-white/40 text-[11px] mt-0.5">{access.sub}</span>}
              </span>,
              fmtInt(u.readings_month),
              fmtInt(u.dreams_month),
              fmtInt(u.journeys_month),
              fmtInt(u.readings_total),
              fmtDateTime(u.last_activity),
              fmtDate(u.created_at),
            ]
          })}
          empty={q ? "Nenhum usuário com esse e-mail." : "Nenhum usuário."}
        />

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
            <span>Página {page} de {pages}</span>
            <div className="flex gap-3">
              {page > 1 && <Link href={href(page - 1)} className="hover:text-white">← anterior</Link>}
              {page < pages && <Link href={href(page + 1)} className="hover:text-white">próxima →</Link>}
            </div>
          </div>
        )}
        <Note>Sem conteúdo: perguntas, respostas, sonhos, diário e notas não são lidos por esta tabela. "Tiragens no mês" usa o mês civil; assinantes têm ciclo próprio de cobrança, então o número aqui pode diferir da cota mostrada a eles.</Note>
      </Section>
    </>
  )
}

function accessOf(u: { role: string; plan: string | null; sub_status: string | null; cancel_at_period_end: boolean | null; current_period_end: string | null; provider: string | null; override_plan: string | null; override_reason: string | null; override_expires_at: string | null }) {
  const subEntitled = u.sub_status ? ["active", "trialing", "past_due"].includes(u.sub_status) && u.plan !== "free" : false
  if (u.role === "admin") return { plan: "Ilimitado", label: "admin", tone: "default" as const, sub: null }
  if (u.override_plan) {
    return { plan: PLAN[u.override_plan] ?? u.override_plan, label: u.override_reason ?? "acesso especial", tone: "default" as const, sub: u.override_expires_at ? `até ${fmtDate(u.override_expires_at)}` : "sem expiração" }
  }
  if (subEntitled) {
    const sub = u.cancel_at_period_end && u.current_period_end ? `cancela em ${fmtDate(u.current_period_end)}` : u.sub_status === "past_due" ? "pagamento pendente" : u.current_period_end ? `renova ${fmtDate(u.current_period_end)}` : null
    return { plan: PLAN[u.plan ?? ""] ?? u.plan ?? "", label: `assinatura ${u.sub_status}`, tone: u.sub_status === "past_due" ? ("warn" as const) : ("ok" as const), sub }
  }
  if (u.sub_status) return { plan: "Free", label: `assinatura ${u.sub_status}`, tone: "muted" as const, sub: "sem direito ao plano pago" }
  return { plan: "Free", label: "free", tone: "muted" as const, sub: null }
}
