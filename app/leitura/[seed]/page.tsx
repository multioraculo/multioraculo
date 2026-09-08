import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import BuziosCasts from "@/components/buzios-board"
import RunesSpread from "@/components/runes-spread"
import PreviewPaywall from "@/components/preview-paywall"
import SaveReadingButton from "@/components/save-reading-button"
import { createClient } from "@/lib/supabase/server"
import { getI18n } from "@/lib/i18n/server"
import { getUserEntitlement } from "@/lib/billing/entitlement"
import { attributeVisitorReadings } from "@/lib/billing/usage"
import { isPreviewOwner, loadPreview, teaserOf, unlockPreview } from "@/lib/billing/preview"
import { logEvent } from "@/lib/billing/events"
import { VISITOR_COOKIE, isVisitorId } from "@/lib/billing/visitor"

export const dynamic = "force-dynamic"

const ORACLE_ORDER = ["iching", "tarot", "buzios", "lenormand", "runas"] as const

/**
 * Leitura em preview: bloqueada até o entitlement real liberar.
 * O conteúdo completo só sai do servidor depois da verificação. A mesma
 * tiragem é devolvida: nada é sorteado ou gerado de novo.
 */
export default async function LeituraPage({ params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { dict, locale } = await getI18n()
  const t = dict.paywall

  const v = (await cookies()).get(VISITOR_COOKIE)?.value
  const visitorId = isVisitorId(v) ? v : null
  if (user) await attributeVisitorReadings(user.id, visitorId)

  const rec = await loadPreview(seed)
  if (!rec || !isPreviewOwner(rec, user?.id ?? null, visitorId)) notFound()

  const ent = await getUserEntitlement(user?.id ?? null)
  const entitled = ent.plan !== "free"
  const unlocked = Boolean(rec.unlocked_at) || entitled
  if (unlocked && !rec.unlocked_at) await unlockPreview(seed, user?.id ?? null, visitorId)
  if (!unlocked) await logEvent("preview_viewed", { userId: user?.id ?? null, visitorId, seed })

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
          {/* Pergunta */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-white/60 text-sm mb-3">{dict.results.yourQuestion}</h3>
            <p className="text-white text-base leading-relaxed">{rec.question}</p>
          </div>

          {/* Síntese: completa se desbloqueada; só o início se ainda bloqueada */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-white text-lg">{dict.results.yourAnswer}</h3>
              {unlocked && <span className="text-white/50 text-xs">{t.unlockedNote}</span>}
            </div>
            {unlocked ? (
              <div className="space-y-4">
                {rec.synthesis.split(/\n{2,}/).map((para, i) => (
                  <p key={i} className="text-white/80 text-sm leading-relaxed">{para.trim()}</p>
                ))}
              </div>
            ) : (
              <PreviewPaywall teaser={teaserOf(rec.synthesis)} ready />
            )}
          </div>

          {/* Oráculos: só depois do desbloqueio */}
          {unlocked && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 space-y-6">
              <h3 className="text-white text-lg text-center font-light">{dict.results.readByOracle}</h3>
              <div className="space-y-4">
                {ORACLE_ORDER.filter((k) => rec.oracles[k]).map((key) => {
                  const oracle = rec.oracles[key]
                  const items = oracle.draw?.items ?? []
                  return (
                    <div key={key} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 space-y-5">
                      <div>
                        <h4 className="text-white text-base font-light">{dict.oracles[key]}</h4>
                        {oracle.draw?.notes && <p className="text-white/45 text-xs mt-1">{oracle.draw.notes}</p>}
                      </div>
                      {items.length > 0 && (
                        <div>
                          <p className="text-white/25 text-[10px] uppercase tracking-widest mb-3">{dict.results.drawLabel}</p>
                          {key === "buzios" && (
                            <div className="mb-5 pb-5 border-b border-white/10">
                              <BuziosCasts seed={oracle.seed || seed} items={items} shells={oracle.draw?.shells ?? null} />
                            </div>
                          )}
                          {key === "runas" && (
                            <div className="mb-5 pb-5 border-b border-white/10">
                              <RunesSpread items={items} runes={(oracle.draw as any)?.runes ?? null} />
                            </div>
                          )}
                          <div className="space-y-3">
                            {items.map((item, i) => (
                              <div key={i} className="flex gap-3">
                                {item.position && (
                                  <span className="text-white/30 text-[11px] shrink-0 w-20 sm:w-28 pt-0.5 leading-tight">{item.position}</span>
                                )}
                                <div className="min-w-0">
                                  <span className="text-white/85 text-xs font-medium">{item.name}</span>
                                  {item.meaning && <p className="text-white/45 text-xs leading-relaxed mt-0.5">{item.meaning}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {oracle.reading && (
                        <div className={items.length > 0 ? "border-t border-white/10 pt-5" : ""}>
                          {items.length > 0 && (
                            <p className="text-white/25 text-[10px] uppercase tracking-widest mb-3">{dict.results.traditionalReading}</p>
                          )}
                          <div className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{oracle.reading}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <SaveReadingButton question={rec.question} synthesis={rec.synthesis} oracles={rec.oracles} />
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-full bg-white/5 border border-white/15 text-white/80 font-light text-sm hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  {dict.results.newQuestion}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </ShaderBackground>
  )
}
