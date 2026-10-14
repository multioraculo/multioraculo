import { getOracleOpens, getOverview } from "@/lib/admin/metrics"
import { BarsChart } from "@/components/admin/charts"
import { Cards, Note, Panel, Section, Stat, Table, fmtDate, fmtInt, fmtMonth, fmtPct } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

const ORACLES: Array<{ key: string; name: string }> = [
  { key: "tarot", name: "Tarô" },
  { key: "iching", name: "I Ching" },
  { key: "runas", name: "Runas" },
  { key: "buzios", name: "Búzios" },
  { key: "lenormand", name: "Lenormand" },
]

export default async function AdminOraclesPage() {
  const [o, opens] = await Promise.all([getOverview(), getOracleOpens()])

  const totalByOracle = new Map<string, { total: number; people: number }>()
  const months = new Map<string, Record<string, number>>()
  for (const r of opens) {
    const t = totalByOracle.get(r.oracle) ?? { total: 0, people: 0 }
    t.total += r.total
    t.people += r.people
    totalByOracle.set(r.oracle, t)
    const m = months.get(r.month) ?? {}
    m[r.oracle] = (m[r.oracle] ?? 0) + r.total
    months.set(r.month, m)
  }
  const grandTotal = [...totalByOracle.values()].reduce((a, b) => a + b.total, 0)
  const monthKeys = [...months.keys()].sort()
  const chart = monthKeys.map((k) => ({ label: fmtMonth(k), ...Object.fromEntries(ORACLES.map((oc) => [oc.key, months.get(k)?.[oc.key] ?? 0])) }))

  return (
    <>
      <Section title="Consultas Multioráculo">
        <Cards>
          <Stat label="Consultas completas no mês" value={fmtInt(o?.readings_month)} />
          <Stat label="Total histórico" value={fmtInt(o?.readings_total)} />
          <Stat label="Pessoas que consultaram" value={fmtInt(o?.reading_users_total)} sub="contas ou visitantes distintos" />
          <Stat label="Leituras salvas" value={fmtInt(o?.saved_readings_total)} />
        </Cards>
        <Note>
          O que está sendo contado: <strong className="text-white/80">consultas completas</strong>. Cada consulta consulta os cinco sistemas (Tarô, I Ching, Runas, Búzios e Lenormand) de uma vez, então não existe "uso do Tarô" separado do uso dos outros. O que varia entre os oráculos é qual cartão as pessoas abrem na tela de resultado, medido abaixo.
        </Note>
      </Section>

      <Section title="Cartões abertos por oráculo" hint={o?.events_since ? `medido desde ${fmtDate(o.events_since)}` : "medição começa com esta versão"}>
        <Cards>
          {ORACLES.map((oc) => {
            const t = totalByOracle.get(oc.key)
            return <Stat key={oc.key} label={oc.name} value={fmtInt(t?.total ?? 0)} sub={`${fmtPct(t?.total ?? 0, grandTotal)} das aberturas · ${fmtInt(t?.people ?? 0)} pessoas`} />
          })}
        </Cards>
        <div className="mt-4">
          <Panel>
            <BarsChart data={chart} series={ORACLES.map((oc) => ({ key: oc.key, name: oc.name }))} />
          </Panel>
        </div>
        <div className="mt-4">
          <Table
            head={["Mês", ...ORACLES.map((oc) => oc.name), "Total"]}
            rows={monthKeys
              .slice()
              .reverse()
              .map((k) => {
                const m = months.get(k) ?? {}
                const tot = ORACLES.reduce((a, oc) => a + (m[oc.key] ?? 0), 0)
                return [fmtMonth(k), ...ORACLES.map((oc) => fmtInt(m[oc.key] ?? 0)), fmtInt(tot)]
              })}
            empty="Nenhuma abertura registrada ainda."
          />
        </div>
        <Note>Uma abertura = a pessoa tocou no ícone do oráculo para ler a interpretação daquele sistema. A mesma pessoa pode abrir vários oráculos na mesma consulta. Não há histórico anterior a esta medição.</Note>
      </Section>
    </>
  )
}
