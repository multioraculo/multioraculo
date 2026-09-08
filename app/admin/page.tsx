import { getOverview } from "@/lib/admin/metrics"
import { getFinanceReport } from "@/lib/admin/finance"
import { Cards, Note, Panel, Section, Stat, fmtDate, fmtInt, fmtMoney, fmtUsd } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

export default async function AdminOverviewPage() {
  const [o, fin] = await Promise.all([getOverview(), getFinanceReport()])

  if (!o) {
    return (
      <Panel>
        <p className="text-white/80 text-sm">Sem acesso aos dados agregados. Verifique a service role e se a migration 20260909_admin.sql foi executada.</p>
      </Panel>
    )
  }

  const avgReadingCost = o.readings_month > 0 ? o.ai_cost_month / o.readings_month : null
  const readingsPerUser = o.users_active_month > 0 ? o.readings_month / o.users_active_month : null
  const dreamsPerUser = o.dream_users_month > 0 ? o.dreams_month / o.dream_users_month : null
  // Receita em centavos na moeda da Stripe; custo de IA em USD. Não somamos
  // moedas diferentes: a margem só é mostrada quando a moeda é USD, e caso
  // contrário os dois valores aparecem lado a lado.
  const sameCurrency = fin.configured && fin.currency.toLowerCase() === "usd"
  const marginUsd = sameCurrency ? fin.receivedMonthCents / 100 - o.ai_cost_month : null

  return (
    <>
      <Section title="Pessoas">
        <Cards>
          <Stat label="Usuários cadastrados" value={fmtInt(o.users_total)} />
          <Stat label="Novos no mês" value={fmtInt(o.users_new_month)} />
          <Stat label="Ativos no mês" value={fmtInt(o.users_active_month)} sub="com pelo menos um consumo concluído" />
          <Stat label="Beta testers ativos" value={fmtInt(o.overrides_active)} sub={`${fmtInt(o.admins)} admin`} />
        </Cards>
      </Section>

      <Section title="Tiragens" hint={o.usage_since ? `contagem completa desde ${fmtDate(o.usage_since)}` : undefined}>
        <Cards>
          <Stat label="Hoje" value={fmtInt(o.readings_today)} />
          <Stat label="Neste mês" value={fmtInt(o.readings_month)} sub={readingsPerUser !== null ? `${readingsPerUser.toFixed(1).replace(".", ",")} por usuário ativo` : undefined} />
          <Stat label="Total histórico" value={fmtInt(o.readings_total)} sub={`${fmtInt(o.saved_readings_total)} leituras salvas`} />
          <Stat label="Previews (2ª tiragem)" value={fmtInt(o.previews_month)} sub={`${fmtInt(o.previews_unlocked)} desbloqueadas no total`} />
        </Cards>
      </Section>

      <Section title="Sonhos">
        <Cards>
          <Stat label="Hoje" value={fmtInt(o.dreams_today)} />
          <Stat label="Neste mês" value={fmtInt(o.dreams_month)} sub={dreamsPerUser !== null ? `${dreamsPerUser.toFixed(1).replace(".", ",")} por pessoa` : undefined} />
          <Stat label="Total histórico" value={fmtInt(o.dreams_total)} sub={`${fmtInt(o.saved_dreams_total)} sonhos salvos`} />
          <Stat label="Jornadas no mês" value={fmtInt(o.journeys_month)} sub={`${fmtInt(o.journeys_total)} no total`} />
        </Cards>
      </Section>

      <Section title="Assinaturas e receita" hint="só pagamentos reais na Stripe; admin e testers não contam">
        <Cards>
          <Stat label="Assinaturas ativas" value={fmtInt(o.subs_active)} sub={`${fmtInt(o.subs_essential)} Essencial · ${fmtInt(o.subs_unlimited)} Ilimitado`} tone="accent" />
          <Stat label="MRR" value={fin.configured ? fmtMoney(fin.mrrCents, fin.currency) : "–"} sub="recorrente contratado" />
          <Stat label="Recebido no mês" value={fin.configured ? fmtMoney(fin.receivedMonthCents, fin.currency) : "–"} sub={fin.configured ? `líquido ${fmtMoney(fin.netMonthCents, fin.currency)}` : "Stripe não configurada"} />
          <Stat label="Custo de IA no mês" value={fmtUsd(o.ai_cost_month)} sub={avgReadingCost !== null ? `≈ ${fmtUsd(avgReadingCost, 3)} por tiragem` : "estimativa"} tone="warn" />
        </Cards>
        <Note>
          {marginUsd !== null
            ? `Margem simplificada do mês (recebido − IA): ${fmtUsd(marginUsd)}. `
            : fin.configured
              ? `Receita em ${fin.currency.toUpperCase()} e custo de IA em USD: veja a comparação em Financeiro. `
              : ""}
          Isso não é lucro contábil: não inclui impostos, hospedagem, ferramentas, desenvolvimento nem taxas não capturadas.
        </Note>
      </Section>

      <Section title="Sobre estes números">
        <Panel>
          <ul className="text-white/60 text-xs leading-relaxed space-y-1 list-disc pl-4">
            <li>Tiragens, sonhos e jornadas contam consumos concluídos em <code className="text-white/80">reading_usage</code>. Antes de {o.usage_since ? fmtDate(o.usage_since) : "a contagem existir"} só há o que as pessoas salvaram (leituras e sonhos salvos), mostrado à parte.</li>
            <li>Uma tiragem é a consulta completa aos cinco oráculos, contada uma vez. Previews da segunda tiragem ficam separadas e não entram nas cotas.</li>
            <li>Custo de IA é estimado a partir dos tokens de cada chamada, com a tabela de preços vigente na hora; existe desde {o.ai_since ? fmtDate(o.ai_since) : "a instrumentação entrar no ar"}.</li>
            <li>Usuário ativo = conta com pelo menos um consumo concluído no mês. Dia e mês seguem o fuso de São Paulo.</li>
          </ul>
        </Panel>
      </Section>
    </>
  )
}
