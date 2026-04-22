"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"

// SSR-safe: avoids hydration mismatch with WebGL
const PulsingBorder = dynamic(
  async () => {
    const mod = await import("@paper-design/shaders-react")
    return mod.PulsingBorder as any
  },
  { ssr: false }
)

type PrayerItem = { type: "line"; text: string } | { type: "break" }

const PRAYER: PrayerItem[] = [
  { type: "line", text: "Eu me abro ao que precisa ser visto." },
  { type: "break" },
  { type: "line", text: "Que se tornem visíveis as forças que já estão em movimento." },
  { type: "break" },
  { type: "line", text: "Peço clareza para perceber o que se mostra." },
  { type: "break" },
  { type: "line", text: "Peço serenidade para receber o que me cabe." },
  { type: "break" },
  { type: "line", text: "Peço humildade para integrar o que se revela." },
  { type: "break" },
  { type: "line", text: "Que minha pergunta encontre presença" },
  { type: "line", text: "e que haja entendimento no que agora se revela." },
  { type: "break" },
  { type: "line", text: "Assim seja." },
]

// Time each line is shown before the next appears; breaks add extra pause
// 8 lines × 2200ms + 6 breaks × 1600ms ≈ 27s total
const LINE_DELAY = 2200
const BREAK_EXTRA = 1600
// Maximum lines visible simultaneously in the teleprompter window
const MAX_VISIBLE = 2

type ScheduledLine = { id: number; text: string; showAt: number }

function buildSchedule(): { lines: ScheduledLine[]; total: number } {
  const scheduled: ScheduledLine[] = []
  let t = 500
  let id = 0
  for (const item of PRAYER) {
    if (item.type === "line") {
      scheduled.push({ id: id++, text: item.text, showAt: t })
      t += LINE_DELAY
    } else {
      t += BREAK_EXTRA
    }
  }
  return { lines: scheduled, total: t + 1200 }
}

const { lines: SCHEDULE, total: TOTAL } = buildSchedule()

type ActiveLine = { id: number; text: string }

type Props = {
  isLoading: boolean
  onComplete: () => void
}

export default function PrayerLoader({ isLoading, onComplete }: Props) {
  const [activeLines, setActiveLines] = useState<ActiveLine[]>([])
  const [exiting, setExiting] = useState(false)

  const isLoadingRef = useRef(isLoading)
  const prayerEndedRef = useRef(false)
  const exitingRef = useRef(false)

  function triggerExit() {
    if (exitingRef.current) return
    exitingRef.current = true
    setExiting(true)
    setTimeout(onComplete, 950)
  }

  useEffect(() => {
    isLoadingRef.current = isLoading
    if (!isLoading && prayerEndedRef.current) triggerExit()
  }, [isLoading])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Schedule each line to appear in the teleprompter window
    SCHEDULE.forEach(({ id, text, showAt }) => {
      timers.push(
        setTimeout(() => {
          setActiveLines((prev) => [...prev, { id, text }].slice(-MAX_VISIBLE))
        }, showAt)
      )
    })

    // Mark prayer as finished; if API already returned, begin exit transition
    timers.push(
      setTimeout(() => {
        prayerEndedRef.current = true
        if (!isLoadingRef.current) triggerExit()
      }, TOTAL)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div
      className="relative flex flex-col items-center justify-center py-5"
      style={{ opacity: exiting ? 0 : 1, transition: "opacity 0.95s ease" }}
    >
      {/* Living orb — same shader family as the logo, more vibrant */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <div style={{ width: "min(240px, 80vw)", height: "min(240px, 80vw)", filter: "blur(20px)", opacity: 0.65 }}>
          <PulsingBorder
            style={{ width: "100%", height: "100%", borderRadius: "50%" }}
            colors={["#e040fb", "#c084fc", "#7c3aed", "#a855f7", "#818cf8", "#f0abfc"]}
            colorBack="#00000000"
            speed={1.9}
            roundness={1}
            thickness={0.65}
            softness={0.3}
            intensity={8}
            spotSize={0.55}
            pulse={0.7}
            smoke={0.65}
            smokeSize={2.2}
            scale={0.88}
            rotation={0}
          />
        </div>
      </div>

      {/* Teleprompter window: at most MAX_VISIBLE lines at once */}
      <div className="relative z-10 w-full text-center px-6" style={{ minHeight: "54px" }}>
        <AnimatePresence mode="popLayout">
          {activeLines.map((line, idx) => {
            const isCurrent = idx === activeLines.length - 1
            return (
              <motion.p
                key={line.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: isCurrent ? 0.85 : 0.28, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="text-base font-light leading-relaxed text-white"
              >
                {line.text}
              </motion.p>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
