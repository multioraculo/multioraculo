import { listOverrides, overrideState } from "@/lib/admin/metrics"
import { OverrideForm, RevokeButton } from "@/components/admin/overrides-form"
import { Badge, Note, Panel, Section, Table, fmtDate } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

const PLAN: Record<string, string> = { unlimited: "Ilimitado", essential: "Essencial", free: "Free" }

export default async function AdminBetaPage() {
  const rows = await listOverrides()
  const active = rows.filter((r) => overrideState(r) === "active")
  const past = rows.filter((r) => overrideState(r) !== "active")

  const render = (list: typeof rows, withAction: boolean) =>
    list.map((r) => {
      const state = overrideState(r)
      return [
        <span key="e">
          {r.email}
          {!r.user_id && <span className="block text-white/40 text-[11px]">conta ainda não criada</span>}
        </span>,
        PLAN[r.plan_override] ?? r.plan_override,
        <Badge key="r" tone={r.reason === "admin" ? "default" : "muted"}>{r.reason}</Badge>,
        r.expires_at ? fmtDate(r.expires_at) : "sem expiração",
        fmtDate(r.created_at),
        state === "active" ? <Badge key="s" tone="ok">ativo</Badge> : state === "expired" ? <Badge key="s" tone="warn">expirado</Badge> : <Badge key="s" tone="muted">revogado</Badge>,
        withAction ? <RevokeButton key="a" id={r.id} email={r.email} /> : "",
      ]
    })

  return (
    <>
      <Section title="Conceder acesso" hint="sem Stripe: não cria cliente, assinatura nem receita">
        <Panel>
          <OverrideForm />
        </Panel>
        <Note>
          O acesso vale pelo e-mail, mesmo antes de a pessoa criar a conta: no primeiro login ele é reconhecido. Motivo livre (ex.: beta_tester, parceria). O papel de admin não é concedido por aqui.
        </Note>
      </Section>

      <Section title="Acessos ativos">
        <Table head={["E-mail", "Plano", "Motivo", "Expira", "Criado", "Estado", ""]} rows={render(active, true)} empty="Nenhum acesso especial ativo." />
      </Section>

      <Section title="Expirados e revogados">
        <Table head={["E-mail", "Plano", "Motivo", "Expira", "Criado", "Estado", ""]} rows={render(past, false)} empty="Nada no histórico." />
      </Section>
    </>
  )
}
