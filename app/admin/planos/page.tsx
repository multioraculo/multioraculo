import { getFunnel, getOverview } from "@/lib/admin/metrics"
import { Cards, Note, Panel, Section, Stat, Table, fmtDate, fmtInt, fmtPct } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

export default async function AdminPlansPage() {
  const [o, f] = await Promise.all([getOverview(), getFunnel()])
  const freeUsers = o ? Math.max(0, o.users_total - o.subs_active - o.overrides_active - o.admins) : 0

  const steps = f
    ? [
        { label: "Fizeram a 1ª tiragem sem login", value: f.anonymous_first_reading, note: "visitantes distintos (reading_usage)" },
        { label: "Tentaram a 2ª tiragem (preview)", value: f.second_attempt, note: "pessoas distintas" },
        { label: "Entraram na conta depois da tiragem", value: f.login_after_reading, note: "contas distintas" },
        { label: "Viram a página de assinatura", value: f.plans_viewed, note: "pessoas distintas" },
        { label: "Iniciaram o Checkout", value: f.checkout_started, note: "contas distintas" },
        { label: "Concluíram assinatura", value: f.subscribed, note: "contas com assinatura na Stripe" },
      ]
    : []

  return (
    <>
      <Section title="Distribuição por plano" hint="admin, testers e overrides nunca contam como pagantes">
        <Cards>
          <Stat label="Free" value={fmtInt(freeUsers)} sub="cadastrados sem plano pago nem acesso especial" />
          <Stat label="Essencial" value={fmtInt(o?.subs_essential)} tone="accent" />
          <Stat label="Ilimitado" value={fmtInt(o?.subs_unlimited)} tone="accent" />
          <Stat label="Beta testers / admins" value={`${fmtInt(o?.overrides_active)} / ${fmtInt(o?.admins)}`} sub="acesso interno, sem Stripe" />
        </Cards>
      </Section>

      <Section title="Assinaturas">
        <Cards>
          <Stat label="Ativas" value={fmtInt(o?.subs_active)} sub="active, trialing ou past_due" />
          <Stat label="Cancelamento agendado" value={fmtInt(o?.subs_cancel_scheduled)} sub="seguem até o fim do período" tone={o?.subs_cancel_scheduled ? "warn" : "default"} />
          <Stat label="past_due" value={fmtInt(o?.subs_past_due)} sub="cobrança falhou, em nova tentativa" tone={o?.subs_past_due ? "warn" : "default"} />
          <Stat label="Canceladas" value={fmtInt(o?.subs_canceled)} sub="encerradas" />
          <Stat label="Novas no mês" value={fmtInt(o?.subs_new_month)} />
          <Stat label="Cancelamentos no mês" value={fmtInt(o?.subs_canceled_month)} />
        </Cards>
      </Section>

      <Section title="Funil de uso e conversão" hint={f?.since ? `eventos medidos desde ${fmtDate(f.since)}` : "medição começa com esta versão"}>
        <Table
          head={["Etapa", "Pessoas", "Da etapa anterior", "Da 1ª tiragem"]}
          rows={steps.map((s, i) => [
            <span key="l">
              {s.label}
              <span className="block text-white/40 text-[11px]">{s.note}</span>
            </span>,
            fmtInt(s.value),
            i === 0 ? "–" : fmtPct(s.value, steps[i - 1].value),
            i === 0 ? "–" : fmtPct(s.value, steps[0].value),
          ])}
        />
        <Note>
          As etapas usam fontes diferentes e não são estritamente sequenciais (uma pessoa pode ver a página de assinatura sem ter tentado a segunda tiragem). Primeira tiragem sem login vem do consumo de visitantes; as etapas do meio vêm de eventos gravados a partir desta versão; assinatura concluída vem da tabela de assinaturas, desde a ativação do billing. Não há histórico anterior à medição de cada etapa.
        </Note>
      </Section>

      <Section title="Regras vigentes">
        <Panel>
          <ul className="text-white/60 text-xs leading-relaxed space-y-1 list-disc pl-4">
            <li>Free: 1 tiragem e 1 sonho por mês; a primeira de cada sem login. A segunda tiragem gera preview bloqueada.</li>
            <li>Essencial: 8 tiragens, 3 sonhos e 1 Jornada por ciclo. Ilimitado: sem limites.</li>
            <li>Prioridade de acesso: admin ou acesso especial vigente → assinatura paga ativa → Free.</li>
          </ul>
        </Panel>
      </Section>
    </>
  )
}
