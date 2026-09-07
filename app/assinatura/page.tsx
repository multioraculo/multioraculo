import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import SubscriptionActions, { type SubscriptionActionMode } from "@/components/subscription-actions"
import { getI18n } from "@/lib/i18n/server"
import { fmt, formatDate } from "@/lib/i18n"
import { getUserEntitlementWithUsage } from "@/lib/billing/entitlement"
import type { Plan } from "@/lib/billing/plans"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ checkout?: string }>

export default async function AssinaturaPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { dict, locale } = await getI18n()
  const t = dict.subscription
  const b = dict.billing
  const { checkout } = await searchParams

  const ent = await getUserEntitlementWithUsage(user?.id ?? null)
  const sub = ent.subscription
  const isStripe = sub?.provider === "stripe"
  const entitledPaid = ent.plan !== "free"

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
    if (entitledPaid && sub && !isStripe) return { mode: "store", label: fmt(b.managedElsewhere, { provider: b.providers[sub.provider] }) }
    if (entitledPaid && isStripe) return { mode: "manage", label: ent.plan === plan ? b.manage : b.switchPlan }
    // pagamento pendente com a Stripe: evita segundo checkout, manda ao portal
    if (sub?.pending && isStripe) return { mode: "manage", label: b.manage }
    return { mode: "subscribe", label: plan === "essential" ? t.essential.cta : t.unlimited.cta }
  }

  const usageLine = (() => {
    if (!user) return null
    if (ent.monthlyLimit === null) return entitledPaid ? b.usageUnlimited : null
    return fmt(b.usage, { used: ent.used, limit: ent.monthlyLimit })
  })()
  const renewsLine = entitledPaid && sub?.currentPeriodEnd && !sub.cancelAtPeriodEnd
    ? fmt(b.renews, { date: formatDate(sub.currentPeriodEnd, locale, "long") })
    : null

  const planName = (p: Plan) => b.planNames[p]

  const toneClass = {
    info: "border-white/20 bg-white/10 text-white/85",
    warn: "border-amber-300/40 bg-amber-400/10 text-amber-100",
    ok: "border-green-300/40 bg-green-400/10 text-green-100",
  }

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-lg mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl md:leading-tight tracking-tight font-light text-white mb-4">
              <span className="font-medium italic instrument">{dict.common.appName}</span>{t.titleSuffix}
            </h1>

            <p className="text-base sm:text-lg font-light text-white/70 leading-relaxed">{t.subtitle}</p>
          </div>

          {/* Estado do usuário */}
          {user && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <div>
                <p className="text-white/50 text-xs">{b.currentPlan}</p>
                <p className="text-white text-lg font-light">{planName(ent.plan)}</p>
              </div>
              {usageLine && <p className="text-white/70 text-sm">{usageLine}</p>}
              {renewsLine && <p className="text-white/50 text-sm">{renewsLine}</p>}
              {!entitledPaid && <p className="text-white/50 text-sm max-w-md">{b.freeDescription}</p>}
            </div>
          )}

          {banner && (
            <div className={`backdrop-blur-md border rounded-2xl p-5 mb-8 text-sm leading-relaxed ${toneClass[banner.tone]}`} role="status">
              {banner.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Essencial Plan */}
            <div className={`backdrop-blur-md bg-white/10 border rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 relative ${ent.plan === "essential" ? "border-white/40" : "border-white/20"}`}>
              {ent.plan === "essential" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="backdrop-blur-md bg-white/20 border border-white/30 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {b.currentPlan}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-light text-white mb-2">{t.essential.name}</h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-light text-white">{t.essential.price}</span>
                  <span className="text-white/60">{t.perMonth}</span>
                </div>
                <p className="text-white/80 font-medium mb-4">{t.essential.tagline}</p>
                <p className="text-white/70 text-base">{t.essential.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {t.essential.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-white/80 text-sm">
                    <span className="text-green-400 mt-1">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mb-6">
                <p className="text-white/60 text-xs mb-2">{t.forWhom}</p>
                <p className="text-white/80 text-sm">{t.essential.forWhom}</p>
              </div>

              <SubscriptionActions plan="essential" {...actionFor("essential")} />
            </div>

            {/* Ilimitado Plan */}
            <div className={`backdrop-blur-md bg-white/15 border rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 relative ${ent.plan === "unlimited" ? "border-white/50" : "border-white/30"}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="backdrop-blur-md bg-gradient-to-r from-purple-400/80 to-pink-400/80 border border-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {ent.plan === "unlimited" ? b.currentPlan : t.mostPopular}
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-light text-white mb-2">{t.unlimited.name}</h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-light text-white">{t.unlimited.price}</span>
                  <span className="text-white/60">{t.perMonth}</span>
                </div>
                <p className="text-white/80 font-medium mb-4">{t.unlimited.tagline}</p>
                <p className="text-white/70 text-base">{t.unlimited.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {t.unlimited.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-white/80 text-sm">
                    <span className="text-green-400 mt-1">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mb-6">
                <p className="text-white/60 text-xs mb-2">{t.forWhom}</p>
                <p className="text-white/80 text-sm">{t.unlimited.forWhom}</p>
              </div>

              <SubscriptionActions plan="unlimited" highlighted {...actionFor("unlimited")} />
            </div>
          </div>

          {/* Terms */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 mb-16">
            <h3 className="text-white font-medium mb-4">{t.notesTitle}</h3>
            <ul className="space-y-2 text-white/70 text-sm">
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
