"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"

/**
 * Vidro do preview, integrado ao streaming: o início real da síntese foi
 * escrito ao vivo e, no corte, o vidro sobe sobre as últimas linhas enquanto
 * parágrafos de linhas fictícias vão surgindo, como se a resposta continuasse
 * a ser escrita por baixo. Quando a leitura completa está salva no servidor,
 * entra o convite. Nenhum token bloqueado existe no DOM.
 */

// parágrafos fictícios: larguras das linhas (em %), fixas para o desenho ser estável
const GHOST_PARAGRAPHS: number[][] = [
  [96, 91, 88],
  [94, 72, 86, 90],
  [89, 58],
]
const GHOST_TOTAL = GHOST_PARAGRAPHS.flat().length

export default function PreviewPaywall({ teaser, ready }: { teaser: string; ready: boolean }) {
  const { dict } = useI18n()
  const t = dict.paywall
  const shown = teaser.replace(/[.!?…]+$/, "").trimEnd() + "…"

  // o vidro e as linhas entram progressivamente depois do corte
  const [mounted, setMounted] = useState(false)
  const [visibleLines, setVisibleLines] = useState(ready ? GHOST_TOTAL : 0)
  useEffect(() => {
    const t0 = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(t0)
  }, [])
  useEffect(() => {
    if (ready) {
      setVisibleLines(GHOST_TOTAL)
      return
    }
    // enquanto a leitura completa é escrita no servidor, uma linha a cada 700 ms
    const id = setInterval(() => setVisibleLines((n) => Math.min(GHOST_TOTAL, n + 1)), 700)
    return () => clearInterval(id)
  }, [ready])

  let lineIndex = 0

  return (
    <div className="relative">
      {/* início real da resposta; as últimas palavras perdem contraste sob o vidro */}
      <p
        className="text-white/80 text-sm leading-relaxed m-0 transition-all duration-700"
        style={{
          WebkitMaskImage: mounted ? "linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0.4) 100%)" : undefined,
          maskImage: mounted ? "linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0.4) 100%)" : undefined,
        }}
      >
        {shown}
      </p>
      <span className="sr-only">{t.hiddenForScreenReader}</span>

      {/* continuação fictícia: parágrafos de linhas sem texto, fora da árvore acessível */}
      <div
        aria-hidden="true"
        className="relative mt-3 select-none pointer-events-none transition-opacity duration-700"
        style={{ height: 196, opacity: mounted ? 1 : 0 }}
      >
        <div className="space-y-4">
          {GHOST_PARAGRAPHS.map((lines, p) => (
            <div key={p} className="space-y-[9px]">
              {lines.map((w) => {
                const i = lineIndex++
                const on = i < visibleLines
                return (
                  <div
                    key={i}
                    className="h-[9px] rounded-full bg-white/[0.28] transition-opacity duration-500"
                    style={{ width: `${w}%`, opacity: on ? Math.max(0.1, 0.7 - i * 0.07) : 0 }}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* vidro: desfoque suave sobre as linhas, com um véu leve que se
            intensifica só onde o convite fica legível */}
        <div
          className="absolute inset-x-0 bottom-0 top-0 pointer-events-auto"
          style={{
            background:
              "linear-gradient(to bottom, rgba(40,22,78,0) 0%, rgba(40,22,78,0.28) 35%, rgba(40,22,78,0.52) 70%, rgba(40,22,78,0.6) 100%)",
            backdropFilter: "blur(7px) saturate(115%)",
            WebkitBackdropFilter: "blur(7px) saturate(115%)",
          }}
        >
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center px-4 pb-1" aria-live="polite">
            <h4 className="text-white text-lg font-light instrument italic leading-tight mb-1">{t.title}</h4>
            {ready ? (
              <>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-sm mb-3">{t.text}</p>
                <Link
                  href="/assinatura"
                  className="inline-block px-5 py-2 rounded-full bg-white/12 border border-white/30 text-white font-light text-sm hover:bg-white/18 hover:border-white/45 hover:scale-[1.03] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  style={{ boxShadow: "0 8px 24px rgba(20,5,60,0.35)" }}
                >
                  {t.cta}
                </Link>
                <p className="text-white/40 text-[11px] mt-2">{t.secondary}</p>
              </>
            ) : (
              // estado intermediário discreto: a leitura completa ainda está sendo escrita
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed max-w-sm mb-2 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                {t.writing}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
