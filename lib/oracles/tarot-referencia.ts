/**
 * A referência estruturada do Tarô, carta a carta.
 *
 * POR QUE ELA EXISTE. A auditoria de tom mediu, em 40 leituras reais, que o
 * tarô entregava referência para 3,0 das 10 cartas sorteadas, e que ZERO
 * invertidas tinham qualquer suporte textual sobre o que inversão significa.
 * A fonte indexada, `jung_tarot.pdf`, é um ensaio sobre os Arcanos Maiores:
 * cita 22/22 maiores e 2/56 menores, e não menciona inversão uma única vez.
 * Com ~5 cartas invertidas por tiragem e 7 menores sem texto, o modelo
 * preenchia o vazio com o senso comum de "invertida = versão ruim da carta".
 *
 * O QUE ELA NÃO É. Não é uma tabela de equivalências do tipo
 * "invertida = bloqueio". Ben-Dov recusa isso explicitamente, e aqui cada
 * carta tem a reversão QUE O LIVRO DÁ PARA ELA — inclusive as 16 em que ele
 * diz que a inversão não muda nada.
 *
 * O índice vem de `scripts/extrair-bendov.mjs`, que roda uma vez e grava
 * `data/tarot/bendov.cartas.json`. A extração não entra em `pdfs.index.json` e
 * não passa pelo seletor lexical: o PDF do Ben-Dov compõe os títulos em
 * versalete, e o pdfjs devolve os nomes das cartas como NUL, o que tornaria
 * um índice bruto dele inútil para busca por nome.
 */
import type { Locale } from "@/lib/i18n"
import type { Evidence } from "./evidence"
import type { DrawItem } from "./draw"
import { TAROT_DECK } from "./draw"
import { BENDOV_CARTAS, type FichaDeCarta } from "./bendov-cartas"

type Ficha = FichaDeCarta

const POR_CARTA = new Map<string, Ficha>(BENDOV_CARTAS.map((f) => [f.carta, f]))

/** Quantas cartas o índice cobre. 78 é o esperado; o verificador cobra isso. */
export const CARTAS_COBERTAS = POR_CARTA.size

/**
 * O único nome em que o baralho do motor e a fonte discordam.
 *
 * O Arcano VI é "Os Enamorados" no nosso baralho e "O Amante" no Ben-Dov —
 * singular, porque é assim que o Marselha o nomeia (L'Amoureux), e o autor
 * trata essa diferença como significativa. Os outros 21 Arcanos Maiores e as
 * 56 cartas menores casam exatamente.
 *
 * O apelido vive AQUI, e não nos dois lados que ele liga, porque nenhum dos
 * dois pode ceder: `bendov-cartas.ts` é extração e tem de permanecer fiel à
 * fonte; `TAROT_DECK` é o nome que a pessoa lê na tela e já está em leituras
 * gravadas. Sem isto a carta 6 cairia calada em ~12% das tiragens — foi o
 * verificador que achou, depois de eu medir cobertura em seeds onde ela não
 * caiu.
 */
const APELIDOS: Record<string, string> = {
  "Os Enamorados": "O Amante",
}

export function fichaDaCarta(nome: string): Ficha | undefined {
  return POR_CARTA.get(APELIDOS[nome] ?? nome)
}

/**
 * A LÓGICA GERAL DA REVERSÃO, dita UMA VEZ no material do método.
 *
 * É o resumo do capítulo 3 do livro (p93–98), e está aqui em vez de repetida
 * em cada carta porque é regra de leitura, não significado de símbolo. Os
 * cinco pontos são os que o autor sustenta, e nenhum deles vira fórmula:
 * continua sendo a ficha de cada carta que diz o que aquela inversão é.
 */
export const REVERSAO_METODO: Record<Locale, string> = {
  pt: "Sobre cartas invertidas, segundo a referência: inversão não equivale automaticamente a significado negativo; ela desloca o peso dentro dos sentidos que a própria carta já tem, em vez de trocá-los por outros; pode mudar a leitura visual da imagem e a relação dela com as cartas vizinhas; muitas invertidas numa mesma tiragem podem indicar necessidade de mudar o ponto de vista, e não acúmulo de problemas; e em parte das cartas o sentido permanece semelhante quando invertida.",
  en: "On reversed cards, per the reference: reversal does not automatically mean a negative reading; it shifts weight among the meanings the card already carries, rather than replacing them; it can change how the image reads visually and how it relates to neighbouring cards; many reversals in one spread may point to a needed change of viewpoint rather than an accumulation of problems; and for part of the deck the meaning stays similar when reversed.",
  es: "Sobre cartas invertidas, según la referencia: la inversión no equivale automáticamente a un significado negativo; desplaza el peso entre los sentidos que la propia carta ya tiene, en vez de cambiarlos por otros; puede alterar la lectura visual de la imagen y su relación con las cartas vecinas; muchas invertidas en una misma tirada pueden indicar necesidad de cambiar el punto de vista, y no acumulación de problemas; y en parte de las cartas el sentido permanece similar al invertirse.",
}

const ROTULO: Record<Locale, { invertida: string; semelhante: string }> = {
  pt: { invertida: "invertida", semelhante: "a fonte diz que invertida o sentido permanece semelhante" },
  en: { invertida: "reversed", semelhante: "the source says the meaning stays similar when reversed" },
  es: { invertida: "invertida", semelhante: "la fuente dice que invertida el sentido permanece similar" },
}

/**
 * ORÇAMENTO POR CAMPO. Por que isto existe.
 *
 * O montador do prompt corta CADA trecho em 320 caracteres. A base nunca
 * chega perto disso (máx 279 nas 78 fichas), então o corte nunca a atingia;
 * quem era cortada era sempre a reversão, por estar no fim da string — e a
 * reversão é justamente o dado que esta camada existe para entregar. Medido
 * na bateria dos 40 seeds: 61 das 212 invertidas (29%) chegavam ao modelo
 * com a reversão truncada no meio de uma frase.
 *
 * A correção não aumenta o envelope: ela o REPARTE. Cada campo recebe teto
 * próprio e é cortado só em fronteira de frase, nunca no meio. Quando os dois
 * caberem inteiros, nada é cortado (36 das 62 fichas com reversão própria).
 */
const TETO_DO_TRECHO = 320

const limpa1 = (s: string) => s.replace(/\s+/g, " ").trim()

/**
 * Corta em fronteira de frase. A primeira frase vai inteira mesmo que estoure
 * o teto do campo: nas 78 fichas ela tem no máximo 95 chars na base e 122 na
 * reversão, e 95 + rótulo + 122 continua abaixo de 320 — então o envelope
 * aguenta o pior caso, e o verificador cobra isso.
 */
function porFrases(texto: string, teto: number): string {
  const t = limpa1(texto)
  if (t.length <= teto) return t
  const frases = t.split(/(?<=[.;!?])\s+/).filter(Boolean)
  let saida = frases[0] ?? t
  for (const f of frases.slice(1)) {
    if (saida.length + 1 + f.length > teto) break
    saida += " " + f
  }
  return saida
}

/**
 * Reparte `total` entre os dois campos sem deixar nenhum passar fome: quem é
 * mais curto que a metade leva o que precisa e devolve a sobra ao outro
 * (max-min fair). Só quando os dois são longos é que ambos ficam na metade.
 */
function reparte(base: number, inv: number, total: number): [number, number] {
  if (base + inv <= total) return [base, inv]
  const justo = Math.floor(total / 2)
  if (base < justo) return [base, total - base]
  if (inv < justo) return [total - inv, inv]
  return [justo, total - justo]
}

const SEP = " · "

/**
 * O trecho de uma carta, com cada campo no seu orçamento.
 *
 * Carta de pé: só a base, e ela cabe sempre inteira (máx 279 < 320).
 * Carta invertida: base e a reversão específica, repartindo o que resta do
 * envelope depois do separador e do rótulo. Quando a fonte diz "Similar.", a
 * frase curta vai inteira e o resto do envelope fica com a base.
 */
export function trechoDaCarta(ficha: Ficha, invertida: boolean, locale: Locale): string {
  const r = ROTULO[locale]
  const base = limpa1(ficha.base)
  if (!invertida) return porFrases(base, TETO_DO_TRECHO)

  const prefixo = `${SEP}${r.invertida}: `
  if (ficha.invertida_similar) {
    // a frase de "Similar." é curta e fixa: vai inteira, e o resto é da base
    const orcBase = TETO_DO_TRECHO - prefixo.length - r.semelhante.length
    return `${porFrases(base, orcBase)}${prefixo}${r.semelhante}`
  }
  const inv = limpa1(ficha.invertida)
  const [orcBase, orcInv] = reparte(base.length, inv.length, TETO_DO_TRECHO - prefixo.length)
  return `${porFrases(base, orcBase)}${prefixo}${porFrases(inv, orcInv)}`
}

/**
 * Uma entrada de referência por CARTA SORTEADA, na ordem das posições.
 *
 * Carta normal recebe só a base. Carta invertida recebe base e a reversão
 * específica daquela carta — que é o dado que faltava inteiramente.
 */
export function referenciaDoTarot(itens: DrawItem[], locale: Locale): Evidence[] {
  const saida: Evidence[] = []
  itens.forEach((item, i) => {
    const sym = item.sym as { kind: "tarot"; card: number; reversed: boolean }
    if (sym?.kind !== "tarot") return
    const ficha = fichaDaCarta(TAROT_DECK[sym.card].name)
    if (!ficha) return
    saida.push({
      source: `${ficha.fonte}, p. ${ficha.pagina}`,
      excerpt: trechoDaCarta(ficha, sym.reversed, locale),
      itemIndex: i,
    })
  })
  return saida
}
