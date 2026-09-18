"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { fmt } from "@/lib/i18n"
import { moonState, type MoonState } from "@/lib/moon"

/**
 * Bloco "Hoje": fase lunar astronômica real (calculada pela data atual, nunca
 * salva por usuário), porcentagem iluminada, três palavras-chave e uma frase
 * simbólica fixa por fase, do i18n. Sem IA, sem horóscopo, sem previsão.
 * Calculado só no navegador (useEffect) para não divergir do servidor.
 *
 * Duas composições, uma fonte só. O painel do usuário usa a compacta; a Home
 * usa a ampla, com mais respiro. Os dados e as frases são os mesmos: se a Lua
 * mudar, os dois lugares mudam juntos, porque só existe esta Lua.
 */
export default function MoonToday({ variante = "compacta" }: { variante?: "compacta" | "ampla" }) {
  const { dict } = useI18n()
  const [moon, setMoon] = useState<MoonState | null>(null)
  useEffect(() => {
    setMoon(moonState(new Date()))
  }, [])
  // a altura é reservada no lugar de quem chama: aqui só evitamos desenhar
  // antes de o navegador calcular
  if (!moon) return null

  const phase = dict.moon[moon.key]
  const pct = Math.round(moon.illumination * 100)
  const ampla = variante === "ampla"

  return (
    <div>
      <div className={`flex items-center ${ampla ? "gap-4" : "gap-2.5"}`}>
        <MoonGlyph illumination={moon.illumination} waxing={moon.waxing} size={ampla ? 44 : 22} />
        <p className={ampla ? "text-white text-xl instrument italic" : "text-white/90 text-sm"}>
          {phase.name}
          <span className={ampla ? "text-white/40 text-sm not-italic" : "text-white/45"}>
            {" "}· {fmt(dict.account.illuminated, { pct })}
          </span>
        </p>
      </div>
      <p className={`text-white/60 tracking-wide ${ampla ? "text-[13px] mt-3" : "text-xs mt-2"}`}>{phase.keywords}</p>
      <p className={`text-white/80 leading-relaxed font-light ${ampla ? "text-[15px] mt-2 max-w-xl" : "text-[13px] mt-1.5"}`}>
        {phase.text}
      </p>
    </div>
  )
}

/**
 * Pequena representação da fase: disco escuro com a porção iluminada
 * desenhada por um arco elíptico (o terminador). Lado iluminado à direita
 * quando crescente, como nos símbolos usuais.
 */
export function MoonGlyph({ illumination, waxing, size = 22 }: { illumination: number; waxing: boolean; size?: number }) {
  const r = 10
  const k = 2 * illumination - 1 // -1 nova … 0 quarto … 1 cheia
  const rx = Math.abs(k) * r
  const sweep = k >= 0 ? 1 : 0 // gibosa: terminador curva para o lado escuro; crescente: para o claro
  const lit = `M0,${-r} A${r},${r} 0 0 1 0,${r} A${rx},${r} 0 0 ${sweep} 0,${-r} Z`
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true" focusable="false" className="shrink-0">
      <circle r={r} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
      <path d={lit} fill="rgba(255,248,230,0.92)" transform={waxing ? undefined : "scale(-1 1)"} />
    </svg>
  )
}
