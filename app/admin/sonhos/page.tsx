import { getMonthly, getOverview } from "@/lib/admin/metrics"
import { BarsChart } from "@/components/admin/charts"
import { Cards, Note, Panel, Section, Stat, Table, fmtDate, fmtInt, fmtMonth } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

export default async function AdminDreamsPage() {
  const [o, rows] = await Promise.all([getOverview(), getMonthly()])
  const perUser = o && o.dream_users_total > 0 ? o.dreams_total / o.dream_users_total : null
  const data = rows.map((r) => ({ label: fmtMonth(r.month), dreams: r.dreams, journeys: r.journeys, saved: r.saved_dreams }))

  return (
    <>
      <Section title="Interpretações de sonhos" hint={o?.usage_since ? `contagem completa desde ${fmtDate(o.usage_since)}` : undefined}>
        <Cards>
          <Stat label="Hoje" value={fmtInt(o?.dreams_today)} />
          <Stat label="Neste mês" value={fmtInt(o?.dreams_month)} sub={`${fmtInt(o?.dream_users_month)} pessoas`} />
          <Stat label="Total histórico" value={fmtInt(o?.dreams_total)} />
          <Stat label="Sonhos salvos" value={fmtInt(o?.saved_dreams_total)} sub="histórico antigo incluído" />
        </Cards>
      </Section>

      <Section title="Pessoas">
        <Cards>
          <Stat label="Usaram Sonhos" value={fmtInt(o?.dream_users_total)} sub="contas ou visitantes distintos" />
          <Stat label="Média por pessoa" value={perUser !== null ? perUser.toFixed(1).replace(".", ",") : "–"} sub="interpretações" />
          <Stat label="Recorrentes" value={fmtInt(o?.dream_repeat_users)} sub="contas com mais de uma interpretação" />
          <Stat label="Jornadas oníricas" value={fmtInt(o?.journeys_total)} sub={`${fmtInt(o?.journeys_month)} neste mês`} />
        </Cards>
      </Section>

      <Section title="Evolução mensal">
        <Panel>
          <BarsChart data={data} series={[{ key: "dreams", name: "Interpretações" }, { key: "journeys", name: "Jornadas", color: "#818cf8" }, { key: "saved", name: "Salvos", color: "#f9a8d4" }]} />
        </Panel>
        <div className="mt-4">
          <Table
            head={["Mês", "Interpretações", "Jornadas", "Sonhos salvos"]}
            rows={rows.slice().reverse().map((r) => [fmtMonth(r.month), fmtInt(r.dreams), fmtInt(r.journeys), fmtInt(r.saved_dreams)])}
          />
        </div>
        <Note>Só contagens e datas. Texto dos sonhos, interpretações, diário e notas nunca são lidos por esta área. Meses anteriores à contagem de consumo só têm a coluna de sonhos salvos.</Note>
      </Section>
    </>
  )
}
