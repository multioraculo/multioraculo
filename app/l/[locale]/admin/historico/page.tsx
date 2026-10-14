import { getMonthly, getOverview } from "@/lib/admin/metrics"
import { getFinanceReport } from "@/lib/admin/finance"
import { BarsChart, LinesChart } from "@/components/admin/charts"
import { Cards, Note, Panel, Section, Stat, Table, fmtDate, fmtInt, fmtMoney, fmtMonth, fmtUsd } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

export default async function AdminHistoryPage() {
  const [rows, o, fin] = await Promise.all([getMonthly(), getOverview(), getFinanceReport()])
  const revenueByMonth = new Map(fin.monthly.map((m) => [m.month, m.grossCents]))

  const data = rows.map((r) => ({
    label: fmtMonth(r.month),
    readings: r.readings,
    previews: r.previews,
    dreams: r.dreams,
    journeys: r.journeys,
    active: r.active_users,
    newUsers: r.new_users,
    savedReadings: r.saved_readings,
    savedDreams: r.saved_dreams,
    savedUsers: r.saved_users,
    aiCost: Number(r.ai_cost.toFixed(2)),
    newSubs: r.new_subs,
    canceled: r.canceled_subs,
    revenue: revenueByMonth.get(r.month.slice(0, 7)) ?? 0,
  }))

  const totals = rows.reduce(
    (a, r) => ({
      readings: a.readings + r.readings,
      dreams: a.dreams + r.dreams,
      journeys: a.journeys + r.journeys,
      newUsers: a.newUsers + r.new_users,
      aiCost: a.aiCost + r.ai_cost,
      savedReadings: a.savedReadings + r.saved_readings,
      savedDreams: a.savedDreams + r.saved_dreams,
    }),
    { readings: 0, dreams: 0, journeys: 0, newUsers: 0, aiCost: 0, savedReadings: 0, savedDreams: 0 }
  )

  return (
    <>
      <Section title="Acumulado geral">
        <Cards>
          <Stat label="Tiragens" value={fmtInt(totals.readings)} sub={`+ ${fmtInt(totals.savedReadings)} leituras salvas (histórico antigo)`} />
          <Stat label="Sonhos" value={fmtInt(totals.dreams)} sub={`+ ${fmtInt(totals.savedDreams)} sonhos salvos (histórico antigo)`} />
          <Stat label="Usuários cadastrados" value={fmtInt(totals.newUsers)} />
          <Stat label="Custo de IA" value={fmtUsd(totals.aiCost)} sub="estimado" tone="warn" />
        </Cards>
      </Section>

      <Section title="Uso por mês" hint="tiragens e sonhos concluídos; previews à parte">
        <Panel>
          <BarsChart data={data} series={[{ key: "readings", name: "Tiragens" }, { key: "dreams", name: "Sonhos" }, { key: "previews", name: "Previews", color: "#f9a8d4" }]} />
        </Panel>
      </Section>

      <Section title="Pessoas por mês">
        <Panel>
          <LinesChart data={data} series={[{ key: "active", name: "Ativos" }, { key: "newUsers", name: "Novos", color: "#818cf8" }, { key: "savedUsers", name: "Salvaram algo", color: "#f9a8d4" }]} />
        </Panel>
      </Section>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Section title="Assinaturas por mês" hint="novas e canceladas (tabela subscriptions)">
          <Panel>
            <BarsChart data={data} series={[{ key: "newSubs", name: "Novas", color: "#86efac" }, { key: "canceled", name: "Canceladas", color: "#fca5a5" }]} height={180} />
          </Panel>
        </Section>
        <Section title="Receita e custo de IA por mês" hint={fin.configured ? `receita em ${fin.currency.toUpperCase()}, custo em USD` : "Stripe não configurada"}>
          <Panel>
            <LinesChart data={data.map((d) => ({ ...d, revenue: d.revenue / 100 }))} series={[{ key: "revenue", name: `Receita (${fin.currency.toUpperCase()})`, color: "#86efac" }, { key: "aiCost", name: "IA (USD)", color: "#fcd34d" }]} height={180} />
          </Panel>
        </Section>
      </div>

      <Section title="Tabela mensal">
        <Table
          head={["Mês", "Tiragens", "Previews", "Sonhos", "Jornadas", "Ativos", "Novos", "Novas assin.", "Cancel.", "IA (USD)", "Receita"]}
          rows={rows
            .slice()
            .reverse()
            .map((r) => [
              fmtMonth(r.month),
              fmtInt(r.readings),
              fmtInt(r.previews),
              fmtInt(r.dreams),
              fmtInt(r.journeys),
              fmtInt(r.active_users),
              fmtInt(r.new_users),
              fmtInt(r.new_subs),
              fmtInt(r.canceled_subs),
              fmtUsd(r.ai_cost),
              fin.configured ? fmtMoney(revenueByMonth.get(r.month.slice(0, 7)) ?? 0, fin.currency) : "–",
            ])}
        />
        <Note>
          Tiragens e sonhos são completos desde {o?.usage_since ? fmtDate(o.usage_since) : "a contagem existir"}; meses anteriores mostram zero aqui e só têm o histórico de itens salvos (colunas do gráfico de pessoas). Custo de IA existe desde {o?.ai_since ? fmtDate(o.ai_since) : "a instrumentação"}. Novas assinaturas e cancelamentos vêm da tabela de assinaturas (uma linha por usuário): quem assinou, cancelou e assinou de novo aparece uma vez. Receita vem das faturas pagas na Stripe.
        </Note>
      </Section>
    </>
  )
}
