/**
 * DETECÇÃO DE TRANSCRIÇÃO: o texto do modelo é uma cópia da referência?
 *
 * POR QUE EXISTE. A leitura individual do Tarô passou a receber a ficha do
 * Ben-Dov por carta (ver app/consultas/route.ts). Isso corrigiu a fidelidade —
 * a ancoragem na fonte subiu de 0,56 para 3,10 palavras por carta — e abriu um
 * defeito novo: na bateria de 25/10, a tiragem com 9 das 10 cartas invertidas
 * devolveu o campo `meanings` como CÓPIA LITERAL da ficha nas dez posições, uma
 * delas com 26 palavras seguidas. `meanings` é o que a pessoa lê em cada carta
 * na tela, então ela receberia texto cru de um livro protegido no lugar de uma
 * interpretação — e sem a informação de orientação, que a cópia perde.
 *
 * O prompt proíbe isso em duas regras, e regra de prompt é pedido, não
 * garantia. Este módulo é a garantia.
 *
 * O QUE NÃO É. Não é um detector de "palavra da fonte no texto". A regra 9 do
 * prompt MANDA usar o termo próprio da tradição quando ela tem um, e a leitura
 * fiel de A Torre é "a ruptura de estruturas sólidas e um progresso repentino
 * após longas preparações" — que empresta da ficha de propósito. O que se mede
 * é QUANTO do texto é cópia, não se há cópia.
 *
 * O LIMIAR É MEDIDO, não escolhido. Em 370 `meanings` de tarô já produzidos
 * (variantes A, C2 e D das baterias de 24 e 25/10), a cobertura se distribui
 * assim:
 *
 *     0%        336 amostras   nenhuma sequência de 5 palavras em comum
 *     1–20%       4
 *    20–40%      17   interpretação fiel que empresta o termo da tradição
 *    40–60%       3   cópia com o nome da carta na frente
 *    60–80%       0   ← a fronteira é vazia
 *    80–100%     10   o despejo da ficha, texto por texto
 *
 * Acima de 40% as treze amostras são cópia, lidas uma a uma. Abaixo, nenhuma é.
 * Entre 60% e 80% não há nada, então o corte não fica em cima de um aglomerado.
 *
 * Módulo puro: sem rede, sem disco, sem estado. É exercitado por
 * scripts/verify-consulta-taro.ts com as 78 fichas e com texto real das
 * baterias.
 */

/** Sequência mínima de palavras para contar como trecho copiado. */
export const MINIMO_DE_PALAVRAS_SEGUIDAS = 5

/** Acima desta fração de palavras copiadas, o texto é transcrição. */
export const COBERTURA_MAXIMA = 0.4

/** Texto curto não tem como ser julgado: poucas palavras batem por acidente. */
export const MINIMO_PARA_JULGAR = 8

const normaliza = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

export type MedidaDeCopia = {
  /** fração das palavras do texto que estão em trechos copiados */
  cobertura: number
  /** a maior sequência de palavras que aparece literal na fonte */
  maiorSequencia: number
  /** palavras de conteúdo medidas */
  palavras: number
}

/**
 * Quanto de `texto` é cópia literal de `fonte`.
 *
 * Marca cada palavra que pertence a uma sequência de pelo menos
 * MINIMO_DE_PALAVRAS_SEGUIDAS que aparece literal na fonte, e devolve a fração
 * marcada. Uma palavra marcada por duas sequências conta uma vez: a cobertura
 * é de palavras do texto, não soma de trechos.
 */
export function medeCopia(texto: string, fonte: string): MedidaDeCopia {
  const palavras = normaliza(texto).split(" ").filter(Boolean)
  const agulheiro = ` ${normaliza(fonte)} `
  if (palavras.length === 0 || agulheiro.trim().length === 0) {
    return { cobertura: 0, maiorSequencia: 0, palavras: palavras.length }
  }
  const copiada = new Array<boolean>(palavras.length).fill(false)
  let maiorSequencia = 0
  for (let inicio = 0; inicio < palavras.length; inicio++) {
    // estende enquanto a sequência continuar existindo na fonte; para no
    // primeiro ponto em que deixa de existir, porque a partir dali nenhuma
    // extensão existe
    let fim = inicio
    for (let tentativa = inicio + 1; tentativa <= palavras.length; tentativa++) {
      if (!agulheiro.includes(` ${palavras.slice(inicio, tentativa).join(" ")} `)) break
      fim = tentativa
    }
    const tamanho = fim - inicio
    if (tamanho > maiorSequencia) maiorSequencia = tamanho
    if (tamanho >= MINIMO_DE_PALAVRAS_SEGUIDAS) {
      for (let i = inicio; i < fim; i++) copiada[i] = true
    }
  }
  return {
    cobertura: copiada.filter(Boolean).length / palavras.length,
    maiorSequencia,
    palavras: palavras.length,
  }
}

/**
 * O texto é transcrição da fonte?
 *
 * Texto com menos de MINIMO_PARA_JULGAR palavras nunca é acusado: uma frase de
 * seis palavras pode coincidir inteira com a fonte sem ser cópia deliberada, e
 * errar aqui apaga interpretação legítima.
 */
export function eTranscricao(texto: string, fonte: string): boolean {
  const m = medeCopia(texto, fonte)
  if (m.palavras < MINIMO_PARA_JULGAR) return false
  return m.cobertura >= COBERTURA_MAXIMA
}

/**
 * A fonte comparável de uma carta: o que o modelo recebeu como material DELA.
 *
 * A reversão entra só quando a carta saiu invertida E a fonte dá uma reversão
 * própria. Quando a fonte diz "Similar.", o que vai no trecho é uma frase
 * NOSSA dizendo que o sentido permanece semelhante — e o prompt quer que o
 * modelo diga isso. Essa frase não pode contar como texto a evitar.
 */
export function fonteDaCarta(base: string, reversao: string | null): string {
  return reversao ? `${base} ${reversao}` : base
}
