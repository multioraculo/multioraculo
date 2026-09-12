"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Barra de luz que acompanha a leitura, do envio da pergunta até o texto final.
 *
 * A progressão é ancorada nos eventos REAIS do fluxo, não no relógio. O que o
 * servidor já manda hoje, em ordem:
 *
 *   POST /consultas          start → draw → (interpretação) → oracles → done
 *   POST /consultas/sintese  start → delta… → done
 *
 * Entre `draw` e `oracles` não existe evento por oráculo: `interpretAll`
 * resolve os cinco de uma vez. Nesse trecho, o único do percurso sem sinal
 * real, a barra caminha sozinha em direção a um teto e vai desacelerando, de
 * modo que nunca chega lá antes do evento verdadeiro. Na síntese o sinal volta
 * a ser real: cada `delta` traz texto, e o avanço acompanha o que já chegou.
 *
 * Regras: a barra nunca anda para trás, nunca reinicia na mesma consulta e
 * nunca fecha em 100% antes do fim real. Em nova tentativa da síntese ela
 * continua de onde estava.
 */

/** Marcos reais do fluxo e o quanto cada um vale na barra. */
const MARCO = {
  enviou: 0.04,
  conexao: 0.08,
  sorteio: 0.2,
  oraculos: 0.74,
  sinteseAbriu: 0.8,
  pronto: 1,
} as const

/** Teto até onde a barra pode caminhar sozinha em cada trecho sem evento. */
const TETO = {
  enviou: 0.13,
  conexao: 0.17,
  sorteio: 0.7,
  oraculos: 0.78,
  sintese: 0.95,
} as const

/** quanto do vão restante a barra cobre por quadro; baixo = macio e lento */
const PASSO = 0.012
/** caracteres de síntese que valem a faixa inteira de escrita */
const TEXTO_CHEIO = 2000

export type LeituraProgresso = ReturnType<typeof useReadingProgress>

export function useReadingProgress() {
  const [valor, setValor] = useState(0)
  const [ativa, setAtiva] = useState(false)
  const tetoRef = useRef(0)
  const valorRef = useRef(0)
  const quadro = useRef<number | null>(null)

  const aplicar = useCallback((v: number) => {
    // monotônica: uma nova tentativa ou um evento fora de ordem não puxa a
    // barra para trás
    const novo = Math.max(valorRef.current, Math.min(1, v))
    valorRef.current = novo
    setValor(novo)
  }, [])

  const parar = useCallback(() => {
    if (quadro.current != null) cancelAnimationFrame(quadro.current)
    quadro.current = null
  }, [])

  const animar = useCallback(() => {
    parar()
    const passo = () => {
      const alvo = tetoRef.current
      if (valorRef.current < alvo) aplicar(valorRef.current + (alvo - valorRef.current) * PASSO)
      quadro.current = requestAnimationFrame(passo)
    }
    quadro.current = requestAnimationFrame(passo)
  }, [aplicar, parar])

  /** começa a barra; o valor só cresce a partir daqui */
  const iniciar = useCallback(() => {
    valorRef.current = 0
    setValor(0)
    tetoRef.current = TETO.enviou
    aplicar(MARCO.enviou)
    setAtiva(true)
    animar()
  }, [animar, aplicar])

  /** marca um ponto real do fluxo e abre o teto do trecho seguinte */
  const marcar = useCallback(
    (marco: keyof typeof MARCO, teto?: keyof typeof TETO) => {
      aplicar(MARCO[marco])
      if (teto) tetoRef.current = TETO[teto]
    },
    [aplicar]
  )

  /** avanço pelo texto de síntese já recebido: sinal real, não relógio */
  const porTexto = useCallback(
    (caracteres: number) => {
      const fatia = Math.min(1, caracteres / TEXTO_CHEIO)
      aplicar(MARCO.sinteseAbriu + (TETO.sintese - MARCO.sinteseAbriu) * fatia)
    },
    [aplicar]
  )

  /** fecha em 100% e some quando a leitura entra na tela; a espera cobre a
   * transição de largura, para o fecho ser visto e não cortado */
  const concluir = useCallback(() => {
    parar()
    aplicar(MARCO.pronto)
    window.setTimeout(() => setAtiva(false), 780)
  }, [aplicar, parar])

  /** erro definitivo: a barra sai junto com o tratamento de erro */
  const cancelar = useCallback(() => {
    parar()
    setAtiva(false)
  }, [parar])

  useEffect(() => parar, [parar])

  return { valor, ativa, iniciar, marcar, porTexto, concluir, cancelar }
}

/**
 * A barra em si. Trilho quase invisível, preenchimento violeta que clareia até
 * a ponta, brilho contido e um reflexo lento atravessando. Altura de 2 px, a
 * largura do bloco onde estiver.
 */
export default function ReadingProgress({ progresso }: { progresso: LeituraProgresso }) {
  if (!progresso.ativa) return null
  const pct = Math.round(progresso.valor * 1000) / 10
  return (
    <div
      className="rp-trilho"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progresso.valor * 100)}
    >
      <div className="rp-luz" style={{ width: `${pct}%` }}>
        <span className="rp-ponta" aria-hidden="true" />
      </div>
    </div>
  )
}
