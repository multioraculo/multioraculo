import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import SubscriptionActions, { type SubscriptionActionMode } from "@/components/subscription-actions"
import { getI18n } from "@/lib/i18n/server"
import { fmt, formatDate } from "@/lib/i18n"
import { cookies } from "next/headers"
import { getUserEntitlementWithUsage } from "@/lib/billing/entitlement"
import { attributeVisitorReadings } from "@/lib/billing/usage"
import { PENDING_READING_COOKIE, VISITOR_COOKIE, isVisitorId } from "@/lib/billing/visitor"
import { isPreviewOwner, loadPreview } from "@/lib/billing/preview"
import { logEvent } from "@/lib/billing/events"
import Link from "next/link"
import type { Plan } from "@/lib/billing/plans"
import { metadataDaRota } from "@/lib/seo/rota"

export const generateMetadata = () => metadataDaRota("assinatura")

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ checkout?: string }>

export default async function AssinaturaPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { dict, locale } = await getI18n()
  const t = dict.subscription
  const b = dict.billing
  const { checkout } = await searchParams

  // Tiragem gratuita feita sem login passa a contar na conta assim que a pessoa entra
  if (user) {
    const v = (await cookies()).get(VISITOR_COOKIE)?.value
    await attributeVisitorReadings(user.id, isVisitorId(v) ? v : null)
  }
  const ent = await getUserEntitlementWithUsage(user?.id ?? null)
  const sub = ent.subscription
  const isStripe = sub?.provider === "stripe"
  const entitledPaid = ent.plan !== "free"
  // admin ou acesso especial: plano concedido internamente, sem Stripe
  const internalAccess = ent.access.source === "admin" || ent.access.source === "override"

  // Leitura em preview aguardando desbloqueio (cookie httpOnly com o seed).
  // Só aparece se a leitura existir e pertencer a esta pessoa.
  const pendingSeed = (await cookies()).get(PENDING_READING_COOKIE)?.value
  const pendingReading = pendingSeed ? await loadPreview(pendingSeed) : null
  const visitorCookie = (await cookies()).get(VISITOR_COOKIE)?.value
  // funil: visita à página de planos (só tipo, conta ou visitante e data)
  await logEvent("plans_viewed", { userId: user?.id ?? null, visitorId: isVisitorId(visitorCookie) ? visitorCookie : null })
  const pendingOwned = pendingReading && isPreviewOwner(pendingReading, user?.id ?? null, isVisitorId(visitorCookie) ? visitorCookie : null)
  const pendingUnlockable = Boolean(pendingOwned && (entitledPaid || pendingReading?.unlocked_at))

  // Estado exibido no topo da página
  let banner: { tone: "info" | "warn" | "ok"; text: string } | null = null
  if (sub?.pending || (checkout === "success" && !entitledPaid)) {
    banner = { tone: "info", text: b.statusPending }
  } else if (sub?.paymentProblem) {
    banner = { tone: "warn", text: b.statusPaymentProblem }
  } else if (entitledPaid && sub?.cancelAtPeriodEnd && sub.currentPeriodEnd) {
    banner = { tone: "warn", text: fmt(b.statusCanceling, { date: formatDate(sub.currentPeriodEnd, locale, "long") }) }
  } else if (sub?.ended && checkout !== "cancel") {
    banner = { tone: "info", text: b.statusEnded }
  } else if (checkout === "cancel") {
    banner = { tone: "info", text: b.checkoutCanceled }
  }

  // Ação de cada card, decidida no servidor a partir do entitlement
  function actionFor(plan: "essential" | "unlimited"): { mode: SubscriptionActionMode; label: string } {
    if (!user) return { mode: "login", label: b.loginToSubscribe }
    if (internalAccess) return { mode: "store", label: b.internalAccess }
    if (entitledPaid && sub && !isStripe) return { mode: "store", label: fmt(b.managedElsewhere, { provider: b.providers[sub.provider] }) }
    if (entitledPaid && isStripe) return { mode: "manage", label: ent.plan === plan ? b.manage : b.switchPlan }
    // pagamento pendente com a Stripe: evita segundo checkout, manda ao portal
    if (sub?.pending && isStripe) return { mode: "manage", label: b.manage }
    return { mode: "subscribe", label: plan === "essential" ? t.essential.cta : t.unlimited.cta }
  }

  // Uma linha por tipo de consumo (tiragens, sonhos, jornada)
  const usageLines = (() => {
    if (!user) return [] as string[]
    const r = ent.usage.reading
    const d = ent.usage.dream
    const j = ent.usage.journey
    const lines: string[] = []
    if (!entitledPaid) {
      lines.push(r.remaining && r.remaining > 0 ? b.freeAvailable : b.freeUsed)
      lines.push(d.remaining && d.remaining > 0 ? b.freeDreamAvailable : b.freeDreamUsed)
      return lines
    }
    lines.push(r.limit === null ? b.usageUnlimited : fmt(b.usage, { used: r.used, limit: r.limit }))
    lines.push(d.limit === null ? b.usageDreamsUnlimited : fmt(b.usageDreams, { used: d.used, limit: d.limit }))
    lines.push(j.limit === null ? b.usageJourneyUnlimited : fmt(b.usageJourney, { used: j.used, limit: j.limit }))
    return lines
  })()
  // Assinante: renova no fim do ciclo de cobrança. Free: a cota volta no mês civil seguinte.
  const renewsLine = entitledPaid
    ? sub?.currentPeriodEnd && !sub.cancelAtPeriodEnd
      ? fmt(b.renews, { date: formatDate(sub.currentPeriodEnd, locale, "long") })
      : null
    : user
      ? fmt(b.renews, { date: formatDate(ent.periodEnd, locale, "long") })
      : null

  const planName = (p: Plan) => b.planNames[p]

  const toneClass = {
    info: "border-white/20 bg-white/10 text-white/85",
    warn: "border-amber-300/40 bg-amber-400/10 text-amber-100",
    ok: "border-green-300/40 bg-green-400/10 text-green-100",
  }

  const negativo = /^(Não inclui|Not included|No incluid[oa])$/
  const colunas = [
    { chave: "free" as const, plano: "free" as Plan },
    { chave: "essential" as const, plano: "essential" as Plan },
    { chave: "unlimited" as const, plano: "unlimited" as Plan },
  ]
  const GRADE = "md:grid md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-6"

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 pt-16 sm:pt-24 lg:pt-12 pb-24">
        <div className="max-w-xl lg:max-w-6xl mx-auto px-5 sm:px-8">
          <header className="mb-9 sm:mb-11">
            <h1 className="text-white text-[34px] sm:text-[42px] lg:text-[46px] leading-tight tracking-tight font-light">
              <span className="italic instrument">{dict.common.appName}</span>
              {t.titleSuffix}
            </h1>
            <p className="text-white/65 text-[16px] sm:text-[17px] font-light leading-relaxed mt-3 max-w-2xl">{t.subtitle}</p>
          </header>

          {/* Estado do usuário */}
          {user && (
            <div className="bento p-5 sm:p-6 mb-6 flex flex-wrap items-center gap-x-8 gap-y-3 max-w-3xl">
              <div>
                <p className="text-white/50 text-xs">{b.currentPlan}</p>
                <p className="text-white text-lg font-light">{planName(ent.plan)}</p>
              </div>
              {usageLines.length > 0 && (
                <div className="space-y-0.5">
                  {usageLines.map((line) => (
                    <p key={line} className="text-white/70 text-sm">{line}</p>
                  ))}
                </div>
              )}
              {renewsLine && <p className="text-white/50 text-sm">{renewsLine}</p>}
            </div>
          )}

          {banner && (
            <div className={`backdrop-blur-md border rounded-2xl p-5 mb-8 text-sm leading-relaxed max-w-3xl ${toneClass[banner.tone]}`} role="status">
              {banner.text}
            </div>
          )}

          {/* Leitura pendente: volta à mesma tiragem quando o plano liberar */}
          {pendingOwned && pendingSeed && (
            <div className="backdrop-blur-md border border-white/20 bg-white/10 rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-3 max-w-3xl" role="status">
              <p className="text-white/85 text-sm">{pendingUnlockable ? dict.paywall.unlockedNote : dict.paywall.pendingOnPlans}</p>
              {pendingUnlockable && (
                <Link
                  href={`/leitura/${encodeURIComponent(pendingSeed)}`}
                  className="px-5 py-2 rounded-full bg-white/15 border border-white/30 text-white font-medium text-sm hover:bg-white/20 transition-all duration-200"
                >
                  {dict.paywall.openReading}
                </Link>
              )}
            </div>
          )}

          {/* ── CAPÍTULO 1 · O que é de todos ─────────────────────────────────
              O que já está aberto, sem assinar. Vem primeiro porque é o que a
              pessoa já tem, e porque deixa claro que o plano pago é uma camada
              a mais, e não o ingresso. Sem caixa: o espaço e o fio fazem o
              trabalho, como na Home. */}
          <section aria-label={t.freeTitle}>
            <Capitulo titulo={t.freeTitle} />
            <p className="text-white/55 text-[15px] font-light mb-5 max-w-xl">{t.freeLead}</p>
            <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2 max-w-4xl">
              {t.freeItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/80 text-[15px] font-light leading-relaxed">
                  <span className="text-white/40 mt-[3px]" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            {/* Regra do plano Free, visível para quem não assina */}
            {!entitledPaid && (
              <p className="text-white/45 text-[14px] font-light mt-6 max-w-2xl">
                <span className="text-white/70">{b.planNames.free}:</span> {b.freeDescription}
              </p>
            )}
          </section>

          {/* ── CAPÍTULO 2 · O que muda em cada plano ─────────────────────── */}
          <section aria-label={t.compareTitle} className="mt-14 sm:mt-16">
            <Capitulo titulo={t.compareTitle} />
            <div className="bento p-5 sm:p-7">
              <div className={`hidden ${GRADE} pb-3 border-b border-white/10`}>
                {t.compareHead.map((h, i) => (
                  <p
                    key={h}
                    className={`text-[12px] uppercase tracking-[0.18em] font-light ${i > 0 && colunas[i - 1].plano === ent.plan && user ? "text-white/80" : "text-white/40"}`}
                  >
                    {h}
                  </p>
                ))}
              </div>
              {t.compareRows.map((r) => (
                <div key={r.label} className={`py-4 border-b border-white/[0.07] last:border-0 last:pb-0 ${GRADE} md:items-baseline`}>
                  <p className="text-white/85 text-[15px] font-light leading-snug">{r.label}</p>
                  {/* celular: os três valores lado a lado, cada um com o nome do plano */}
                  <div className="grid grid-cols-3 gap-3 mt-2.5 md:hidden">
                    {colunas.map((c, i) => (
                      <div key={c.chave}>
                        <p className="text-white/35 text-[11px] uppercase tracking-[0.14em]">{t.compareHead[i + 1]}</p>
                        <p className={`text-[13px] font-light mt-0.5 ${negativo.test(r[c.chave]) ? "text-white/35" : "text-white/85"}`}>{r[c.chave]}</p>
                      </div>
                    ))}
                  </div>
                  {colunas.map((c) => (
                    <p
                      key={c.chave}
                      className={`hidden md:block text-[14px] font-light ${negativo.test(r[c.chave]) ? "text-white/30" : "text-white/85"}`}
                    >
                      {r[c.chave]}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* ── CAPÍTULO 3 · Os planos ────────────────────────────────────── */}
          <section aria-label={planName("unlimited")} className="mt-14 sm:mt-16">
            <Capitulo titulo={`${planName("essential")} · ${planName("unlimited")}`} />
            <div className="grid md:grid-cols-2 gap-5">
              {/* Essencial */}
              <div className={`bento p-7 sm:p-8 relative ${ent.plan === "essential" ? "ring-1 ring-white/35" : ""}`}>
                {ent.plan === "essential" && (
                  <span className="!absolute -top-3 left-7 bg-white/20 border border-white/30 text-white text-xs px-3 py-1 rounded-full font-medium backdrop-blur-md">
                    {b.currentPlan}
                  </span>
                )}
                <h2 className="text-xl font-light text-white mb-2">{t.essential.name}</h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-light text-white">{t.essential.price}</span>
                  <span className="text-white/60">{t.perMonth}</span>
                </div>
                <p className="text-white/85 font-medium mb-3">{t.essential.tagline}</p>
                <p className="text-white/65 text-[15px] leading-relaxed mb-6">{t.essential.description}</p>

                <ul className="space-y-3 mb-7">
                  {t.essential.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-white/80 text-sm">
                      <span className="text-green-400/80 mt-0.5" aria-hidden="true">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className="mb-6">
                  <p className="text-white/50 text-xs mb-1.5">{t.forWhom}</p>
                  <p className="text-white/75 text-sm">{t.essential.forWhom}</p>
                </div>

                <SubscriptionActions plan="essential" {...actionFor("essential")} />
              </div>

              {/* Ilimitado */}
              <div className={`bento bento-forte p-7 sm:p-8 relative ${ent.plan === "unlimited" ? "ring-1 ring-white/45" : ""}`}>
                <span className="!absolute -top-3 left-7 bg-white/20 border border-white/30 text-white text-xs px-3 py-1 rounded-full font-medium backdrop-blur-md">
                  {ent.plan === "unlimited" ? b.currentPlan : t.mostPopular}
                </span>
                <h2 className="text-xl font-light text-white mb-2">{t.unlimited.name}</h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-light text-white">{t.unlimited.price}</span>
                  <span className="text-white/60">{t.perMonth}</span>
                </div>
                <p className="text-white/90 font-medium mb-3">{t.unlimited.tagline}</p>
                <p className="text-white/70 text-[15px] leading-relaxed mb-6">{t.unlimited.description}</p>

                <ul className="space-y-3 mb-7">
                  {t.unlimited.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-white/85 text-sm">
                      <span className="text-green-400/80 mt-0.5" aria-hidden="true">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className="mb-6">
                  <p className="text-white/50 text-xs mb-1.5">{t.forWhom}</p>
                  <p className="text-white/80 text-sm">{t.unlimited.forWhom}</p>
                </div>

                <SubscriptionActions plan="unlimited" highlighted {...actionFor("unlimited")} />
              </div>
            </div>
          </section>

          {/* Observações */}
          <div className="mt-12 sm:mt-14 max-w-3xl">
            <h3 className="text-white/70 text-sm font-medium mb-3">{t.notesTitle}</h3>
            <ul className="space-y-2 text-white/55 text-sm font-light leading-relaxed">
              {t.notes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}

/** O microtítulo de um capítulo da página: o mesmo da Home (rótulo + fio até a borda). */
function Capitulo({ titulo }: { titulo: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <p className="shrink-0 text-white/50 text-[12px] uppercase tracking-[0.22em] font-light">{titulo}</p>
      <div className="h-px flex-1 bg-white/[0.12]" aria-hidden="true" />
    </div>
  )
}
