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
 * Três composições, uma fonte só, e a diferença entre elas é o que cada lugar
 * precisa mostrar:
 *
 *  - `compacta`: tudo, em corpo pequeno. É o painel do usuário.
 *  - `cabecalho`: fase, porcentagem e as três palavras, SEM a frase longa. É o
 *    alto da Home, onde a Lua é atmosfera e data, e onde um parágrafo empurraria
 *    a tiragem para fora da primeira dobra.
 *  - `leitura`: o glifo maior, a fase e a frase, SEM repetir porcentagem e
 *    palavras. É a seção do céu, lá embaixo, onde a Lua volta desenvolvida.
 *    Repetir ali o que já foi dito no topo soaria como tela duplicada.
 *
 * Os dados e as frases são os mesmos nas três: se a Lua mudar, todos os lugares
 * mudam juntos, porque só existe esta Lua.
 */
export default function MoonToday({ variante = "compacta" }: { variante?: "compacta" | "cabecalho" | "leitura" }) {
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
  const leitura = variante === "leitura"
  const cabecalho = variante === "cabecalho"

  return (
    <div>
      <div className={`flex items-center ${leitura ? "gap-3.5" : "gap-2.5"}`}>
        <MoonGlyph illumination={moon.illumination} waxing={moon.waxing} size={leitura ? 32 : 22} />
        <p className={leitura ? "text-white/90 text-[15px]" : "text-white/90 text-sm"}>
          {phase.name}
          {!leitura && <span className="text-white/45"> · {fmt(dict.account.illuminated, { pct })}</span>}
        </p>
      </div>

      {!leitura && <p className="text-white/50 tracking-wide text-xs mt-2">{phase.keywords}</p>}

      {!cabecalho && (
        <p className={`text-white/70 leading-relaxed font-light ${leitura ? "text-[13.5px] mt-2.5 max-w-xl" : "text-[13px] mt-1.5"}`}>
          {phase.text}
        </p>
      )}
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
