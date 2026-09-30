"use client"

/**
 * A assinatura animada do Multioráculo: cinco placas num leque que gira.
 *
 * NÃO É UMA TIRAGEM, e a diferença importa. Não há sorteio, semente, pergunta
 * nem leitura: é sempre o mesmo movimento, com as mesmas cinco peças, ilustrando
 * a frase "Uma pergunta. Cinco oráculos. Uma síntese." Por isso nada aqui tem
 * nome, número, posição nem significado — mostrar "Seis de Espadas" ao lado da
 * chamada faria parecer resultado, e resultado só existe depois da pergunta.
 *
 * O QUE ESTE COMPONENTE CONSERTA: antes, os cinco oráculos eram cinco objetos
 * soltos, cada um com a sua proporção e o seu tempo de carregamento. A runa era
 * estreita, os búzios eram quatro conchinhas numa fileira horizontal, o
 * hexagrama era um bloco largo e as cartas dominavam por serem cartas. Pareciam
 * cinco coisas coladas, e a página montava aos poucos.
 *
 * AGORA HÁ UM SISTEMA SÓ, e ele tem três regras:
 *
 *  1. UM PALCO DE ALTURA FIXA, declarada antes de qualquer peça existir. Nada
 *     que carregue depois pode mudar o tamanho do bloco, então não há salto de
 *     layout, venha a imagem quando vier;
 *  2. SLOTS IGUAIS. Toda peça mora numa placa das mesmas medidas. O que muda de
 *     um oráculo para outro é a ESCALA DE DENTRO, ajustada uma a uma para que o
 *     peso visual fique parecido sem distorcer proporção nenhuma. É por isso que
 *     os búzios viram dois pares e não uma fileira: numa placa em pé, fileira
 *     horizontal vira fiapo;
 *  3. GEOMETRIA DE ANEL. As posições saem de um círculo visto quase de frente:
 *     a da frente é maior e mais opaca, as laterais encolhem, e as duas de trás
 *     ficam menores, mais apagadas e mais PARA DENTRO, porque é isso que um
 *     objeto atrás faz. A profundidade vem de escala e opacidade, não de sombra
 *     nem de desfoque, que custam caro e borram a atmosfera.
 *
 * Só transform e opacity, que a GPU resolve sem recalcular layout. Sem vídeo,
 * sem canvas, sem blur grande, sem nada remoto. Com `prefers-reduced-motion` o
 * leque para na primeira composição, que já ilustra a mesma coisa.
 */
import { useEffect, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { RuneObject } from "@/components/runes-spread"
import { BuzioOpen, BuzioClosed } from "@/components/buzios-board"
import { tarotArtSrc } from "@/lib/oracles/tarot-assets"
import { lenormandArtSrc } from "@/lib/oracles/lenormand-assets"

/** A placa. Uma medida só, para os cinco. */
const SLOT = { largura: 62, altura: 92 }

/**
 * As cinco posições do leque, NA ORDEM EM QUE UMA PEÇA AS PERCORRE: entra pela
 * esquerda, cresce até a frente, decresce e sai pela direita.
 *
 * A primeira versão usou geometria de anel, com as duas de trás mais para o
 * centro e quase transparentes. Matematicamente certo, visualmente errado: liam
 * como três objetos e duas sombras, e o pedido é um leque de cinco. Aqui as
 * cinco estão à vista, com tamanho e opacidade caindo para fora, que é o que dá
 * profundidade sem custar sombra nem desfoque.
 */
const POSICOES = [
  { x: -102, y: 26, giro: -16, escala: 0.66, opacidade: 0.62, plano: 10 },
  { x: -51, y: 9, giro: -8, escala: 0.85, opacidade: 0.86, plano: 30 },
  { x: 0, y: 0, giro: 0, escala: 1, opacidade: 1, plano: 50 },
  { x: 51, y: 9, giro: 8, escala: 0.85, opacidade: 0.86, plano: 30 },
  { x: 102, y: 26, giro: 16, escala: 0.66, opacidade: 0.62, plano: 10 },
]

/*
 * PESO ENTRE ESCALA E OPACIDADE. A primeira distribuição levava a opacidade das
 * pontas a 0,40, e as pontas sumiam: o fundo da Home é um gradiente que se move,
 * e quando a parte clara passa por baixo do leque, placa translúcida sobre
 * claro não tem com o que contrastar. O leque aparecia com quatro peças, e o
 * bloco é justamente o que promete cinco. A profundidade agora vem mais da
 * escala, que não depende de fundo nenhum, e menos da opacidade.
 */

/** O índice da ponta: é dela que a peça salta de volta para o começo. */
const SAIDA = POSICOES.length - 1

/** Tempo parado em cada posição, e o quanto demora para chegar na seguinte. */
const PAUSA_MS = 2400
const TRAVESSIA_MS = 1100

/** Uma volta inteira leva cinco pausas: cada oráculo passa pela frente uma vez. */
const CICLO_MS = PAUSA_MS + TRAVESSIA_MS

/**
 * A lâmina de vidro: a moldura igual para os cinco.
 *
 * Mesma matéria das placas da Home, em tamanho de objeto: base violeta por
 * baixo para o conteúdo se sustentar sobre qualquer ponto do fundo, véu branco
 * por cima, e o contorno por `inset` em vez de `border`, que não soma pixel ao
 * tamanho e por isso não briga com a escala.
 */
function Lamina({ children, escala = 1 }: { children: React.ReactNode; escala?: number }) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-[11px]"
      style={{
        width: SLOT.largura,
        height: SLOT.altura,
        background:
          "linear-gradient(158deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.065) 48%, rgba(255,255,255,0.03) 100%), rgba(24,9,56,0.58)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.24), inset 0 0 0 1px rgba(255,255,255,0.13), 0 12px 26px rgba(14,3,48,0.36)",
      }}
    >
      {/* o reflexo do canto, igual ao das placas grandes */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: "radial-gradient(120% 78% at 8% 0%, rgba(255,255,255,0.10), transparent 58%)" }}
      />
      {/* a escala de dentro é o que iguala o peso visual sem distorcer nada */}
      <span className="relative flex items-center justify-center" style={{ transform: `scale(${escala})` }}>
        {children}
      </span>
    </div>
  )
}

/** A arte de uma carta, encaixada na lâmina sem esticar. */
function Arte({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      decoding="async"
      // as cinco peças existem desde o primeiro render e nunca trocam: carregar
      // cedo evita o pop, e o slot de tamanho fixo garante que o atraso não
      // mexa em nada de qualquer jeito
      loading="eager"
      className="block h-[74px] w-auto max-w-[50px] object-contain"
      style={{ filter: "drop-shadow(0 2px 6px rgba(12,2,40,0.35))" }}
      onError={(ev) => {
        ev.currentTarget.style.visibility = "hidden"
      }}
    />
  )
}

/** Seis linhas em pé, ocupando a altura da lâmina como uma carta ocupa. */
function Hexagrama() {
  const padrao = [1, 0, 1, 1, 0, 1]
  return (
    <span className="flex w-[34px] flex-col-reverse gap-[8px] text-white/80" aria-hidden="true">
      {padrao.map((yang, i) =>
        yang ? (
          <span key={i} className="h-[4px] w-full rounded-[1px] bg-current" />
        ) : (
          <span key={i} className="flex gap-[6px]">
            <span className="h-[4px] flex-1 rounded-[1px] bg-current" />
            <span className="h-[4px] flex-1 rounded-[1px] bg-current" />
          </span>
        ),
      )}
    </span>
  )
}

/** Quatro búzios em dois pares: numa lâmina em pé, fileira vira fiapo. */
function Buzios() {
  return (
    <span className="grid grid-cols-2 gap-x-[9px] gap-y-[7px] text-white/85" aria-hidden="true">
      <BuzioOpen size={19} />
      <BuzioClosed size={19} />
      <BuzioClosed size={19} />
      <BuzioOpen size={19} />
    </span>
  )
}

/**
 * As cinco peças, cada uma com a escala que a põe no mesmo peso das outras.
 *
 * Os números não são arbitrários: a runa é estreita e sobe; os búzios são
 * pequenos e sobem mais; as cartas já nascem no tamanho da lâmina e ficam onde
 * estão. Mexer aqui é mexer em quanto cada oráculo pesa na composição.
 */
const PECAS = [
  // a lâmina do tarô é escolhida por PESO e por LEITURA, não por significado:
  // "O Mago" tem 1,3 MB e é uma gravura cheia de detalhe que vira borrão em
  // 41 px; "A Estrela" tem 293 KB e abre com estrelas de oito pontas, que se
  // reconhecem de longe. Um bloco decorativo não justifica um megabyte.
  { chave: "tarot", escala: 1, conteudo: <Arte src={tarotArtSrc("major-17")} /> },
  { chave: "iching", escala: 1, conteudo: <Hexagrama /> },
  { chave: "runas", escala: 1.25, conteudo: <RuneObject name="Fehu" glyph="ᚠ" reversed={false} index={0} width={38} height={50} /> },
  { chave: "buzios", escala: 1.18, conteudo: <Buzios /> },
  // a carta do lenormand é escolhida pelo DESENHO, não pelo significado: num
  // slot de 62 px a 44 % de opacidade, a gravura de "Estrelas" é pontinhos
  // esparsos e some. "Chave" tem silhueta cheia e lê de relance
  { chave: "lenormand", escala: 1, conteudo: <Arte src={lenormandArtSrc("key")} /> },
] as const

export default function LequeOraculos({ className = "" }: { className?: string }) {
  const { dict } = useI18n()
  const o = dict.oracles as unknown as Record<string, string>
  const [passo, setPasso] = useState(0)
  const [parado, setParado] = useState(false)

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setParado(true)
      return
    }
    const id = setInterval(() => setPasso((p) => (p + 1) % PECAS.length), CICLO_MS)
    return () => clearInterval(id)
  }, [])

  /**
   * A peça que acabou de dar a volta.
   *
   * Num leque de cinco, alguém tem de sair pela direita e voltar pela esquerda.
   * Deslizar atravessaria a composição inteira na diagonal, então ela CORTA: só
   * o deslocamento dela não é animado, e ela reaparece na ponta de fora, que é o
   * ponto mais apagado do leque e exatamente onde uma carta entraria numa mão
   * real.
   *
   * TENTEI SUAVIZAR ESSE CORTE DUAS VEZES, e as duas fracassaram do mesmo jeito.
   * Um quadro transparente controlado por requestAnimationFrame, e depois uma
   * animação CSS de entrada: as duas dependem de o navegador estar animando, e
   * em aba oculta, em segundo plano ou numa captura estática ele não está. A
   * peça ficava presa em opacidade 0 e o leque aparecia com quatro. Para um
   * bloco que é identidade da marca, sumir uma peça é pior do que cortar: o
   * corte custa um instante, a ausência custa a composição inteira.
   */
  const voltando = (POSICOES.length - passo) % POSICOES.length

  return (
    // A ALTURA É DECLARADA AQUI E NÃO MUDA MAIS. É o que reserva o espaço antes
    // de qualquer peça carregar, e o que impede o bloco de empurrar a página.
    <div
      className={`relative h-[124px] w-full overflow-hidden sm:h-[150px] ${className}`}
      role="img"
      aria-label={`${o.tarot} · ${o.iching} · ${o.runas} · ${o.buzios} · ${o.lenormand}`}
    >
      {/* No celular o leque encolhe em vez de estreitar: a composição é a mesma
          em qualquer largura, e a altura do palco continua sendo a declarada
          acima. A redução é pequena de propósito — em 0,74 a gravura do tarô
          ficava com 30 px e virava borrão, e uma peça ilegível no leque é uma
          peça a menos. O leque inteiro mede 246 px, e a placa mais estreita da
          Home tem 279 px de vão. */}
      <div className="absolute inset-0 scale-[0.92] sm:scale-100">
        {PECAS.map((peca, i) => {
          const p = POSICOES[(i + passo) % POSICOES.length]
          const saltou = i === voltando
          return (
            <div
              key={peca.chave}
              className="absolute left-1/2 top-1/2"
              style={{
                // o -50% tira a peça do canto e a põe no centro do palco; tudo
                // o mais é deslocamento a partir daí
                transform: `translate(-50%, -50%) translate(${p.x}px, ${p.y}px) rotate(${p.giro}deg) scale(${p.escala})`,
                opacity: p.opacidade,
                zIndex: p.plano,
                // quem saltou não anima o deslocamento, que atravessaria a
                // composição inteira na diagonal; anima só o acender
                transition: parado
                  ? "none"
                  : saltou
                    ? `opacity ${TRAVESSIA_MS}ms ease`
                    : `transform ${TRAVESSIA_MS}ms cubic-bezier(0.32, 0.72, 0.24, 1), opacity ${TRAVESSIA_MS}ms ease`,
                willChange: "transform, opacity",
              }}
            >
              <Lamina escala={peca.escala}>{peca.conteudo}</Lamina>
            </div>
          )
        })}
      </div>
    </div>
  )
}
