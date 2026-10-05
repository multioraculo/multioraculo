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
 * O MOVIMENTO É A FRASE, EM VEZ DE UM GIRO. Antes as cinco placas rodavam
 * sem parar, e o giro não dizia nada sobre o que o card oferece. Agora o leque
 * CONVERGE: abre em arco (cinco oráculos), fecha numa pilha só (uma síntese) e
 * reabre com outro oráculo à frente, para que cada um passe pelo primeiro
 * lugar. É "Uma pergunta. Cinco oráculos. Uma síntese." acontecendo, devagar,
 * logo abaixo do campo da pergunta.
 *
 * Só transform e opacity, que a GPU resolve sem recalcular layout. Sem vídeo,
 * sem canvas, sem blur grande, sem nada remoto. Com `prefers-reduced-motion` o
 * leque para na primeira composição, que já ilustra a mesma coisa.
 */
import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { RuneObject } from "@/components/runes-spread"
import { BuzioOpen, BuzioClosed } from "@/components/buzios-board"

/**
 * A placa. Uma medida só, para os cinco.
 *
 * Subiu de 62×92 para 76×112, uns 22 % em cada eixo. O leque estava com
 * presença pequena demais dentro da placa, no celular e no desktop: lia como
 * um detalhe no rodapé do card, e ele é assinatura da marca.
 *
 * A LARGURA TOTAL DO LEQUE QUASE NÃO MUDOU, e isso é o ponto. As peças
 * cresceram e os deslocamentos encolheram um pouco, então o conjunto ganhou
 * corpo pela sobreposição, não por ocupar mais espaço. Continua dentro do vão
 * da placa mais estreita da Home, sem encostar nas bordas.
 */
const SLOT = { largura: 76, altura: 112 }

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
  { x: -98, y: 31, giro: -16, escala: 0.66, opacidade: 0.62, plano: 10 },
  { x: -49, y: 11, giro: -8, escala: 0.85, opacidade: 0.86, plano: 30 },
  { x: 0, y: 0, giro: 0, escala: 1, opacidade: 1, plano: 50 },
  { x: 49, y: 11, giro: 8, escala: 0.85, opacidade: 0.86, plano: 30 },
  { x: 98, y: 31, giro: 16, escala: 0.66, opacidade: 0.62, plano: 10 },
]

/**
 * A PILHA: as mesmas cinco posições, recolhidas para o centro.
 *
 * Cada índice corresponde ao da posição do leque que a peça ocupava (0 a 4), e
 * é por isso que o fechamento é um recolher e não um embaralhar: a da frente
 * continua em cima, as vizinhas aparecem logo atrás com uma borda à mostra, e
 * as das pontas por último, mais apagadas. Lê como um baralho recém-juntado.
 */
const PILHA = [
  { x: -9, y: -8, giro: -6, escala: 0.94, opacidade: 0.6, plano: 20 },
  { x: -5, y: -4, giro: -3, escala: 0.97, opacidade: 0.86, plano: 40 },
  { x: 0, y: 0, giro: 0, escala: 1, opacidade: 1, plano: 50 },
  { x: 5, y: -4, giro: 3, escala: 0.97, opacidade: 0.86, plano: 40 },
  { x: 9, y: -8, giro: 6, escala: 0.94, opacidade: 0.6, plano: 20 },
]

/*
 * PESO ENTRE ESCALA E OPACIDADE. A primeira distribuição levava a opacidade das
 * pontas a 0,40, e as pontas sumiam: o fundo da Home é um gradiente que se move,
 * e quando a parte clara passa por baixo do leque, placa translúcida sobre
 * claro não tem com o que contrastar. O leque aparecia com quatro peças, e o
 * bloco é justamente o que promete cinco. A profundidade agora vem mais da
 * escala, que não depende de fundo nenhum, e menos da opacidade.
 */

/**
 * O LEQUE É MAIOR QUE O VÃO DO CARD, E O CARD O CORTA.
 *
 * O componente ocupa a largura inteira da placa em que mora (quem o usa tira o
 * padding com margem negativa, e a placa tem `overflow-hidden`), e a abertura
 * é calculada para as peças das pontas passarem da borda em `SANGRIA` px de
 * cada lado: elas se escondem um pouco para fora do balão, cortadas pelo
 * contorno dele, e o resto da página não é tocado. Fechado, o leque volta ao
 * centro, onde sempre esteve, e a pilha fica inteira dentro da placa.
 *
 * Duas coisas sobem com a largura: a ESCALA das peças (entre 1,3 e 1,75) e o
 * AFASTAMENTO horizontal `kx`, que só é acrescentado ao que falta para a ponta
 * alcançar a sangria. O afastamento não pode dar tudo sozinho, ou o leque
 * viraria uma fileira de placas lado a lado.
 */
const SANGRIA = 24
/** meia largura da peça da ponta (76 × 0,66 / 2), na escala 1 */
const MEIA_PONTA = 25.1
const ESCALA_MIN = 1.3
const ESCALA_MAX = 1.75
/** a altura útil do arco, na escala 1: da carta da frente até a base das pontas */
const ALTURA_ARCO = 128

function geometria(largura: number) {
  const s = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, largura / 260))
  const alvo = largura / 2 + SANGRIA
  const kx = Math.max(1, (alvo / s - MEIA_PONTA) / POSICOES[POSICOES.length - 1].x)
  return { s, kx, altura: Math.round(ALTURA_ARCO * s) }
}

/**
 * Os tempos de uma volta (≈ 10 s), lentos de propósito: o movimento acompanha
 * a leitura do card, não compete com ela.
 *
 *   aberto   6,4 s: 1,7 s para abrir + o resto parado, em leque
 *   fechado  4,0 s: 1,7 s para recolher + o resto parado, em pilha
 */
const TRAVESSIA_MS = 1700
const ABERTO_MS = 6400
const FECHADO_MS = 4000

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
      className="relative flex items-center justify-center overflow-hidden rounded-[13px]"
      style={{
        width: SLOT.largura,
        height: SLOT.altura,
        background:
          "linear-gradient(158deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.065) 48%, rgba(255,255,255,0.03) 100%), rgba(24,9,56,0.58)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.24), inset 0 0 0 1px rgba(255,255,255,0.13), 0 14px 30px rgba(14,3,48,0.36)",
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

/**
 * A arte de uma carta, encaixada na lâmina sem esticar.
 *
 * `tom` é um tratamento de cor LOCAL, só para este uso no leque. A arte
 * oficial do baralho não muda, e nenhuma outra tela do produto é afetada:
 * quem recebe o tratamento é a tag `img` deste componente, não o arquivo.
 */
function Arte({ src, tom = "" }: { src: string; tom?: string }) {
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
      className="block h-[90px] w-auto max-w-[61px] object-contain"
      style={{ filter: `${tom} drop-shadow(0 2px 6px rgba(12,2,40,0.35))`.trim() }}
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
    <span className="flex w-[42px] flex-col-reverse gap-[10px] text-white/80" aria-hidden="true">
      {padrao.map((yang, i) =>
        yang ? (
          <span key={i} className="h-[5px] w-full rounded-[1px] bg-current" />
        ) : (
          <span key={i} className="flex gap-[7px]">
            <span className="h-[5px] flex-1 rounded-[1px] bg-current" />
            <span className="h-[5px] flex-1 rounded-[1px] bg-current" />
          </span>
        ),
      )}
    </span>
  )
}

/** Quatro búzios em dois pares: numa lâmina em pé, fileira vira fiapo. */
function Buzios() {
  return (
    <span className="grid grid-cols-2 gap-x-[11px] gap-y-[9px] text-white/85" aria-hidden="true">
      <BuzioOpen size={23} />
      <BuzioClosed size={23} />
      <BuzioClosed size={23} />
      <BuzioOpen size={23} />
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
  // A LÂMINA É A MESMA ARTE, no tamanho em que ela aparece. "A Estrela" original
  // tem 293 KB e 600 px de largura para ser exibida com 50: aqui entra a versão
  // de 222 px de altura, com 63 KB, que é exatamente o que uma tela de 3x usa.
  // Pixel a pixel é a mesma gravura; o que some é o que nunca foi desenhado.
  //
  // Elas moram em /brand/fixo porque são identidade, e não a arte do oráculo: o
  // leque sempre mostra estas duas, não dependem do sorteio, e com o tamanho no
  // nome podem ficar um ano na borda sem risco de servir arte velha.
  { chave: "tarot", escala: 1, conteudo: <Arte src="/brand/fixo/leque-tarot-222.png" /> },
  { chave: "iching", escala: 1, conteudo: <Hexagrama /> },
  { chave: "runas", escala: 1.25, conteudo: <RuneObject name="Fehu" glyph="ᚠ" reversed={false} index={0} width={46} height={61} /> },
  { chave: "buzios", escala: 1.18, conteudo: <Buzios /> },
  // a carta do lenormand é escolhida pelo DESENHO, não pelo significado: numa
  // placa pequena e meio translúcida, gravura de traço esparso vira pontinhos e
  // some. O critério é silhueta cheia, que lê de relance.
  //
  // Era a "Chave", e passou a ser o "Sol": a chave tinha silhueta cheia mas um
  // objeto de contorno duro, que destoava das outras quatro peças. O sol é
  // radial, tem a mesma temperatura de desenho do resto do leque e mantém o
  // critério — e ainda pesa 15 KB contra 27 KB.
  //
  // Nome novo no arquivo, e não substituição: `/brand/fixo` é servido com cache
  // de um ano e `immutable`, então trocar o conteúdo sob o mesmo nome deixaria
  // a arte velha na borda por meses.
  //
  // E ele entra DESSATURADO, por tratamento local. Medindo a cor média das
  // artes do leque, o problema não era o matiz e sim a saturação:
  //
  //     tarô            hsl(18,  8%, 67%)   <- a referência do conjunto
  //     sol, cru        hsl(30, 66%, 75%)   <- oito vezes mais saturado
  //     chave, antes    hsl(22, 46%, 72%)
  //
  // Dourado a 66 % num leque onde tudo mais é creme quase cinza lê como peça
  // de outro jogo. `saturate` puxa para perto do conjunto e `hue-rotate` tira
  // os poucos graus que separavam o laranja do creme do tarô. A silhueta não
  // depende de cor nenhuma: ela é radial e cheia, e continua lendo de relance.
  { chave: "lenormand", escala: 1, conteudo: <Arte src="/brand/fixo/leque-lenormand-sol-222.png" tom="saturate(0.35) hue-rotate(-8deg)" /> },
] as const

export default function LequeOraculos({ className = "" }: { className?: string }) {
  const { dict } = useI18n()
  const o = dict.oracles as unknown as Record<string, string>
  // `passo` é quem está à frente; só avança quando o leque REABRE, para
  // cada oráculo ter a sua vez sem ninguém atravessar a composição.
  const [passo, setPasso] = useState(0)
  const [fechado, setFechado] = useState(false)
  const [parado, setParado] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  // 340 até medir: é a largura de um celular comum, e evita um quadro sem geometria
  const [largura, setLargura] = useState(340)

  useEffect(() => {
    const el = raiz.current
    if (!el) return
    setLargura(el.clientWidth || 340)
    const ro = new ResizeObserver(([e]) => setLargura(Math.round(e.contentRect.width) || 340))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setParado(true)
  }, [])

  // a volta inteira: abre → fecha → reabre (com outra peça à frente). Uma
  // máquina de dois estados com um temporizador só, e nada roda em segundo
  // plano além dele.
  useEffect(() => {
    if (parado) return
    const id = setTimeout(
      () => {
        if (!fechado) setFechado(true)
        else {
          setFechado(false)
          setPasso((p) => (p + 1) % PECAS.length)
        }
      },
      fechado ? FECHADO_MS : ABERTO_MS,
    )
    return () => clearTimeout(id)
  }, [fechado, parado])

  const { s: escalaDoLeque, kx, altura } = geometria(largura)

  return (
    // A ALTURA SAI DA GEOMETRIA (sobe com a escala) e é aplicada no primeiro
    // render, antes de qualquer peça carregar: não há salto de layout.
    <div
      ref={raiz}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: altura }}
      role="img"
      aria-label={`${o.tarot} · ${o.iching} · ${o.runas} · ${o.buzios} · ${o.lenormand}`}
    >
      {/* O palco inteiro cresce em torno do centro. As posições do leque aberto
          ganham o afastamento `kx`; as da pilha não, porque a pilha é o leque
          recolhido e fica no centro, inteira, dentro da placa. */}
      <div className="absolute inset-0" style={{ scale: escalaDoLeque, translate: `0 ${-6 * escalaDoLeque}px` }}>
        {PECAS.map((peca, i) => {
          const lugar = (i + passo) % POSICOES.length
          const base = (fechado ? PILHA : POSICOES)[lugar]
          const p = fechado ? base : { ...base, x: base.x * kx }
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
                transition: parado
                  ? "none"
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
