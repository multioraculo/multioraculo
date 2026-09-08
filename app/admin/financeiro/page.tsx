import { getAiMonthly, getOverview } from "@/lib/admin/metrics"
import { currentMonthKey, getFinanceReport } from "@/lib/admin/finance"
import { BarsChart } from "@/components/admin/charts"
import { Cards, Note, Panel, Section, Stat, Table, fmtDate, fmtDateTime, fmtInt, fmtMoney, fmtMonth, fmtUsd } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

const OPS: Record<string, string> = { safety: "Triagem de segurança", oracle: "Oráculos", synthesis: "Síntese", dream: "Sonhos", journey: "Jornada" }

export default async function AdminFinancePage() {
  const [fin, o, ai] = await Promise.all([getFinanceReport(), getOverview(), getAiMonthly()])
  const cur = currentMonthKey()
  const c = fin.currency

  // custo de IA por grupo (oráculos = triagem + oráculos + síntese)
  const aiByMonth = new Map<string, { oracles: number; dreams: number; calls: number; input: number; output: number }>()
  const aiByOp = new Map<string, { calls: number; input: number; output: number; cost: number }>()
  for (const r of ai) {
    const k = r.month.slice(0, 7)
    const m = aiByMonth.get(k) ?? { oracles: 0, dreams: 0, calls: 0, input: 0, output: 0 }
    if (r.operation_type === "dream" || r.operation_type === "journey") m.dreams += r.cost
    else m.oracles += r.cost
    m.calls += r.calls
    m.input += r.input_tokens
    m.output += r.output_tokens
    aiByMonth.set(k, m)
    const op = aiByOp.get(r.operation_type) ?? { calls: 0, input: 0, output: 0, cost: 0 }
    op.calls += r.calls
    op.input += r.input_tokens
    op.output += r.output_tokens
    op.cost += r.cost
    aiByOp.set(r.operation_type, op)
  }
  const aiMonth = aiByMonth.get(cur)
  const readingCost = (aiByOp.get("safety")?.cost ?? 0) + (aiByOp.get("oracle")?.cost ?? 0) + (aiByOp.get("synthesis")?.cost ?? 0)
  const avgReading = o && o.readings_total > 0 && o.ai_since ? readingCost / Math.max(1, readingsSince(o)) : null
  const avgDream = o && o.dreams_total > 0 ? (aiByOp.get("dream")?.cost ?? 0) / Math.max(1, o.dreams_total) : null

  const payingUsers = o?.subs_active ?? 0
  const sameCurrency = fin.configured && c.toLowerCase() === "usd"
  const marginUsd = sameCurrency && o ? fin.receivedMonthCents / 100 - o.ai_cost_month : null

  const monthKeys = [...new Set([...fin.monthly.map((m) => m.month), ...aiByMonth.keys()])].sort()
  const chart = monthKeys.map((k) => {
    const m = fin.monthly.find((x) => x.month === k)
    return { label: fmtMonth(k), gross: (m?.grossCents ?? 0) / 100, net: (m?.netCents ?? 0) / 100, ai: Number(((aiByMonth.get(k)?.oracles ?? 0) + (aiByMonth.get(k)?.dreams ?? 0)).toFixed(2)) }
  })

  return (
    <>
      {!fin.configured && (
        <Panel className="mb-6">
          <p className="text-white/80 text-sm">Stripe não configurada neste ambiente. Os valores de receita aparecem quando as variáveis da Stripe existirem no servidor.</p>
        </Panel>
      )}
      {fin.error && (
        <Panel className="mb-6">
          <p className="text-amber-100 text-sm">Falha ao consultar a Stripe: {fin.error}</p>
        </Panel>
      )}

      <Section title="Receita" hint={fin.configured ? `Stripe, atualizado ${fmtDateTime(fin.fetchedAt)} (cache de 5 min)` : undefined}>
        <Cards>
          <Stat label="MRR" value={fin.configured ? fmtMoney(fin.mrrCents, c) : "–"} sub="recorrente mensal contratado" tone="accent" />
          <Stat label="Recebido no mês" value={fin.configured ? fmtMoney(fin.receivedMonthCents, c) : "–"} sub="faturas pagas (bruto)" />
          <Stat label="Líquido no mês" value={fin.configured ? fmtMoney(fin.netMonthCents, c) : "–"} sub="após taxas da Stripe" />
          <Stat label="Recebido histórico" value={fin.configured ? fmtMoney(fin.receivedTotalCents, c) : "–"} sub={fin.configured ? `líquido ${fmtMoney(fin.netTotalCents, c)} · taxas ${fmtMoney(fin.feeTotalCents, c)}` : undefined} />
          <Stat label="Assinaturas ativas" value={fmtInt(o?.subs_active)} sub={`${fmtInt(fin.activeByPlan.essential)} Essencial · ${fmtInt(fin.activeByPlan.unlimited)} Ilimitado`} />
          <Stat label="Novas / canceladas no mês" value={`${fmtInt(o?.subs_new_month)} / ${fmtInt(o?.subs_canceled_month)}`} />
          <Stat label="Pagamentos falhos" value={fin.configured ? fmtInt(fin.failedPayments) : "–"} sub={`${fmtInt(o?.subs_past_due)} assinaturas past_due`} tone={fin.failedPayments || o?.subs_past_due ? "warn" : "default"} />
          <Stat label="Cancelamentos agendados" value={fmtInt(o?.subs_cancel_scheduled)} tone={o?.subs_cancel_scheduled ? "warn" : "default"} />
        </Cards>
        <Note>
          MRR = assinaturas vigentes × preço do plano (recorrente contratado). Receita recebida = faturas efetivamente pagas. Líquido = recebido menos taxas, pelas transações de saldo da Stripe. Reembolsos no histórico: {fin.configured ? fmtMoney(fin.refundTotalCents, c) : "–"}.{fin.truncated ? " A listagem da Stripe foi cortada no teto de segurança; os totais podem estar incompletos." : ""}
        </Note>
      </Section>

      <Section title="Receita por mês e por plano">
        <Panel>
          <BarsChart data={chart} series={[{ key: "gross", name: `Bruto (${c.toUpperCase()})`, color: "#86efac" }, { key: "net", name: `Líquido (${c.toUpperCase()})`, color: "#4ade80" }, { key: "ai", name: "IA (USD)", color: "#fcd34d" }]} />
        </Panel>
        <div className="mt-4">
          <Table
            head={["Mês", "Faturas", "Bruto", "Essencial", "Ilimitado", "Taxas", "Reembolsos", "Líquido"]}
            rows={fin.monthly
              .slice()
              .reverse()
              .map((m) => [fmtMonth(m.month), fmtInt(m.invoices), fmtMoney(m.grossCents, c), fmtMoney(m.essentialCents, c), fmtMoney(m.unlimitedCents, c), fmtMoney(m.feeCents, c), fmtMoney(m.refundCents, c), fmtMoney(m.netCents, c)])}
            empty={fin.configured ? "Nenhuma fatura paga ainda." : "Stripe não configurada."}
          />
        </div>
      </Section>

      <Section title="Custo de IA" hint={o?.ai_since ? `estimado por tokens, medido desde ${fmtDate(o.ai_since)}` : "medição começa com esta versão"}>
        <Cards>
          <Stat label="Hoje" value={fmtUsd(o?.ai_cost_today)} tone="warn" />
          <Stat label="Neste mês" value={fmtUsd(o?.ai_cost_month)} sub={`${fmtInt(o?.ai_calls_month)} chamadas`} tone="warn" />
          <Stat label="Histórico" value={fmtUsd(o?.ai_cost_total)} />
          <Stat label="Tokens no mês" value={fmtInt((o?.ai_input_month ?? 0) + (o?.ai_output_month ?? 0))} sub={`${fmtInt(o?.ai_input_month)} entrada · ${fmtInt(o?.ai_output_month)} saída`} />
          <Stat label="Oráculos no mês" value={fmtUsd(aiMonth?.oracles ?? 0)} sub="triagem + 5 oráculos + síntese" />
          <Stat label="Sonhos no mês" value={fmtUsd(aiMonth?.dreams ?? 0)} sub="interpretações + jornadas" />
          <Stat label="Custo médio por tiragem" value={avgReading !== null ? fmtUsd(avgReading, 3) : "–"} sub="desde a medição" />
          <Stat label="Custo médio por sonho" value={avgDream !== null ? fmtUsd(avgDream, 3) : "–"} sub="desde a medição" />
        </Cards>
        <div className="mt-4">
          <Table
            head={["Operação", "Chamadas", "Tokens entrada", "Tokens saída", "Custo"]}
            rows={[...aiByOp.entries()].map(([op, v]) => [OPS[op] ?? op, fmtInt(v.calls), fmtInt(v.input), fmtInt(v.output), fmtUsd(v.cost, 3)])}
            empty="Nenhuma chamada registrada ainda."
          />
        </div>
        <Note>Valores estimados com a tabela de preços vigente no momento de cada chamada (versão gravada por linha). A fatura real é a da OpenAI. Nenhum prompt ou resposta é guardado para isso.</Note>
      </Section>

      <Section title="Margem simplificada">
        <Cards>
          <Stat label="Recebido − IA no mês" value={marginUsd !== null ? fmtUsd(marginUsd) : fin.configured ? `${fmtMoney(fin.receivedMonthCents, c)} − ${fmtUsd(o?.ai_cost_month)}` : "–"} tone="accent" />
          <Stat label="IA / receita no mês" value={fin.configured && fin.receivedMonthCents > 0 && sameCurrency ? `${(((o?.ai_cost_month ?? 0) / (fin.receivedMonthCents / 100)) * 100).toFixed(1)}%` : "–"} sub={sameCurrency ? undefined : "moedas diferentes"} />
          <Stat label="Receita média por pagante" value={fin.configured && payingUsers > 0 ? fmtMoney(Math.round(fin.receivedMonthCents / payingUsers), c) : "–"} sub="no mês" />
          <Stat label="Custo de IA por pagante" value={payingUsers > 0 ? fmtUsd((o?.ai_cost_month ?? 0) / payingUsers) : "–"} sub="no mês, custo total ÷ pagantes" />
        </Cards>
        <Note>Isso não é lucro contábil. Não inclui impostos, hospedagem, ferramentas externas, desenvolvimento, taxas não capturadas nem outros custos. Receita na moeda da Stripe; IA em dólares.</Note>
      </Section>
    </>
  )
}

/** Tiragens concluídas desde o início da medição de IA (aproximação: total, porque a medição começa junto com esta versão). */
function readingsSince(o: { readings_total: number }): number {
  return o.readings_total
}
