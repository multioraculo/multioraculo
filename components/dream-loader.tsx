"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"

// SSR-safe: same pattern as prayer-loader.tsx
const PulsingBorder = dynamic(
  async () => {
    const mod = await import("@paper-design/shaders-react")
    return mod.PulsingBorder as any
  },
  { ssr: false }
)

const MESSAGES = [
  "Interpretando símbolos...",
  "Revelando significados...",
  "Conectando arquétipos...",
  "Ouvindo o inconsciente...",
]

export default function DreamLoader() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center py-10">
      {/* Pulsing orb — identical to PrayerLoader */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <div
          style={{
            width: "min(200px, 70vw)",
            height: "min(200px, 70vw)",
            filter: "blur(20px)",
            opacity: 0.6,
          }}
        >
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

      {/* Cycling message */}
      <div className="relative z-10 text-center" style={{ minHeight: "28px" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.75, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="text-base font-light text-white"
          >
            {MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
