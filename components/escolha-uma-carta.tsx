"use client"

/**
 * "Escolha uma carta": o baralho dos 22 Arcanos Maiores, virado para baixo, na
 * largura inteira do balão.
 *
 * O GESTO: as cartas entram em cena (uma a uma, em leque), a pessoa toca numa, e
 * ela sai do baralho e abre grande no centro da tela. Um segundo toque a vira e
 * mostra o significado; o terceiro a devolve. Quem faz a parte grande (sair da
 * mesa, virar, o verso de texto) é o FocusCard que já existia, o mesmo das
 * tiragens: aqui ele só é chamado.
 *
 * É UM SORTEIO DE VERDADE. No primeiro quadro no cliente o baralho é embaralhado
 * com crypto.getRandomValues, e a carta escolhida é a que estava naquela
 * posição: não é a data, não é a pessoa, e não vai ao servidor. Depois de cada
 * carta o baralho se embaralha de novo.
 *
 * SÓ OS 22 MAIORES, SEMPRE DE PÉ. O texto do verso vem de lib/oracles/
 * arcanos-maiores.ts, com a fonte rastreável lá. Nada aqui é gerado, nada vai à
 * rede e nada é gravado.
 *
 * O MOVIMENTO: só transform e opacity. A entrada sai de um IntersectionObserver
 * (acontece quando o balão chega à tela, e não quando a página carrega, que seria
 * fora de vista). Com prefers-reduced-motion as cartas já nascem no lugar.
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import FocusCard, { useFocusCard } from "@/components/focus-card"
import { TarotCapsule } from "@/components/tarot-spread"
import { tarotCardRef } from "@/lib/oracles/tarot-assets"
import { renderSym } from "@/lib/oracles/localize"
import { ARCANO_POR_INDICE } from "@/lib/oracles/arcanos-maiores"

const TOTAL = 22
const LARGURA = 84
const ALTURA = 134
/** a distância mínima entre as cartas: abaixo disso a fileira rola em vez de apertar */
const PASSO_MIN = 34
const PASSO_MAX = 64

function embaralhar(): number[] {
  const a = Array.from({ length: TOTAL }, (_, i) => i)
  const r = new Uint32Array(TOTAL)
  crypto.getRandomValues(r)
  for (let i = a.length - 1; i > 0; i--) {
    const j = r[i] % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** O verso de uma carta: a mesma matéria das lâminas de vidro da Home, com o M da marca. */
function Verso() {
  return (
    <span
      className="relative block overflow-hidden rounded-[10px]"
      style={{
        width: LARGURA,
        height: ALTURA,
        background:
          "linear-gradient(158deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 46%, rgba(255,255,255,0.03) 100%), rgba(34,16,84,0.78)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.26), inset 0 0 0 1px rgba(255,255,255,0.16), 0 10px 22px rgba(14,3,48,0.34)",
      }}
    >
      {/* a moldura interna: o que faz a lâmina ler como CARTA e não como botão */}
      <span aria-hidden="true" className="absolute inset-[6px] rounded-[6px] border border-white/20" />
      <span aria-hidden="true" className="absolute inset-[11px] rounded-[4px] border border-white/10" />
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: "radial-gradient(70% 50% at 50% 50%, rgba(255,255,255,0.10), transparent 70%)" }}
      >
        <img
          src="/brand/fixo/multioraculo-m-240.png"
          alt=""
          width={36}
          height={36}
          draggable={false}
          className="opacity-70"
          style={{ width: 36, height: "auto" }}
        />
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 78% at 8% 0%, rgba(255,255,255,0.12), transparent 58%)" }}
      />
    </span>
  )
}

export default function EscolhaUmaCarta() {
  const { dict, locale } = useI18n()
  const t = dict.home as unknown as Record<string, string>
  const foco = useFocusCard()
  const raiz = useRef<HTMLDivElement>(null)
  const fileira = useRef<HTMLDivElement>(null)
  // `null` até o cliente embaralhar: o primeiro render não depende de sorteio
  const [ordem, setOrdem] = useState<number[] | null>(null)
  const [posicao, setPosicao] = useState<number | null>(null)
  const [largura, setLargura] = useState(0)
  const [entrou, setEntrou] = useState(false)
  const [parado, setParado] = useState(false)

  useEffect(() => {
    setOrdem(embaralhar())
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setParado(true)
      setEntrou(true)
    }
  }, [])

  // a largura útil da fileira decide o passo entre as cartas
  useEffect(() => {
    const el = fileira.current
    if (!el) return
    setLargura(el.clientWidth)
    const ro = new ResizeObserver(([e]) => setLargura(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // a entrada acontece quando o balão chega à tela
  useEffect(() => {
    if (entrou) return
    const el = raiz.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setEntrou(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setEntrou(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [entrou])

  // a carta devolvida volta ao baralho, que se embaralha de novo
  useEffect(() => {
    if (foco.state === null && posicao !== null) {
      setPosicao(null)
      setOrdem(embaralhar())
    }
  }, [foco.state, posicao])

  const escolher = useCallback(
    (pos: number) => {
      if (!ordem) return
      setPosicao(pos)
      foco.open(0)
    },
    [ordem, foco],
  )

  const arcano = posicao !== null && ordem ? ordem[posicao] : null
  const nome = arcano !== null ? renderSym({ kind: "tarot", card: arcano, reversed: false }, locale) : ""
  const leitura = arcano !== null ? ARCANO_POR_INDICE.get(arcano)?.leitura[locale] : undefined

  const livre = Math.max(0, largura - LARGURA)
  const passo = Math.min(PASSO_MAX, Math.max(PASSO_MIN, Math.floor(livre / (TOTAL - 1))))
  const larguraTotal = LARGURA + passo * (TOTAL - 1)
  // quando cabe, centraliza; quando não cabe, a fileira rola a partir da esquerda
  const cabe = larguraTotal <= largura

  return (
    <div ref={raiz} className="bento bento-forte overflow-hidden p-6 sm:p-7 lg:p-8">
      <div className="sm:flex sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="text-white/25 text-[12px] uppercase tracking-[0.22em] font-light">{t.pullLabel}</p>
          <h2 className="text-white/95 instrument italic text-[23px] sm:text-[25px] leading-snug mt-2.5">{t.pullTitle}</h2>
        </div>
        <p className="text-white/40 text-[14px] font-light mt-2 sm:mt-0 sm:pb-1">{t.pullHint}</p>
      </div>

      {/* A FILEIRA. Altura fixa (cartas + o espaço da elevação), declarada antes
          de qualquer carta existir: nada que entre depois mexe no layout. */}
      <div
        ref={fileira}
        className={`mt-7 -mx-3 px-3 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${cabe ? "flex justify-center" : ""}`}
        style={{ height: ALTURA + 38 }}
        role="list"
      >
        <div className="relative shrink-0" style={{ width: larguraTotal, height: ALTURA + 38 }}>
          {Array.from({ length: TOTAL }).map((_, i) => {
            const meio = (TOTAL - 1) / 2
            const d = i - meio
            // o leque: uma rotação leve e uma curva suave, de modo que o baralho
            // pareça aberto sobre a mesa e não uma régua de retângulos
            const giro = d * 0.8
            const arco = d * d * 0.07
            const escolhida = posicao === i && foco.focusedIndex === 0
            return (
              <div
                key={i}
                role="listitem"
                className="absolute top-[24px]"
                style={{
                  left: i * passo,
                  width: LARGURA,
                  zIndex: i,
                  transform: entrou
                    ? `translateY(${arco}px) rotate(${giro}deg)`
                    : `translateY(${arco + 46}px) rotate(${giro * 2.4}deg) scale(0.9)`,
                  opacity: entrou ? (escolhida ? 0.14 : 1) : 0,
                  transition: parado
                    ? "none"
                    : `transform 760ms cubic-bezier(0.22, 0.9, 0.3, 1) ${i * 42}ms, opacity 520ms ease ${i * 42}ms`,
                  willChange: entrou ? undefined : "transform, opacity",
                }}
              >
                <button
                  type="button"
                  disabled={!ordem}
                  onClick={() => escolher(i)}
                  aria-label={`${t.pullCardAria} ${i + 1}`}
                  className="group block w-full rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-3 group-focus-visible:-translate-y-3 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                    <Verso />
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <FocusCard
        state={foco.state}
        items={[{ position: dict.oracles.tarot, name: nome, meaning: leitura }]}
        renderFront={() =>
          arcano !== null ? (
            <TarotCapsule card={tarotCardRef(arcano, false)} name={nome} label={nome} width={300} />
          ) : null
        }
        onAdvance={foco.advance}
        onClose={foco.close}
        width="min(78vw, 300px, 31vh)"
        aspect="92 / 178"
      />
    </div>
  )
}
