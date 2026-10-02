/**
 * A leitura coletiva do céu: o que o dia coloca em evidência, para todo mundo.
 *
 * DUAS CAMADAS, e a separação é o ponto do módulo.
 *
 * A camada factual é a tela: mandala, posições com nome por extenso, aspectos,
 * orbes. Ela é a prova, e fica visível. A camada interpretativa é este texto, e
 * ele NÃO repete nome de planeta, de signo, de aspecto nem de fase. Quem lê não
 * deveria precisar decodificar astrologia para entender a mensagem.
 *
 * Isso não afrouxa a exigência, muda onde ela é cobrada: cada termo declara de
 * qual pedaço de qual fato saiu, e o verificador confere se aquela origem
 * existe, se o termo não é só a base dela repetida, e se um termo que diz vir
 * de uma retrogradação carrega mesmo o movimento de volta.
 *
 * A seleção derruba aspecto entre dois lentos mesmo com orbe pequeno: Netuno a
 * zero grau de Plutão é o fundo de uma geração, não a notícia de hoje.
 */
import { LOCALE_META, type Locale } from "@/lib/i18n/config"
import { ORBE_MAX, ORBE_MAX_LUA, type Ceu, type Corpo } from "./ceu"
import { ASPECTOS, CORPOS, FASES, LUNACOES, SIGNOS } from "./nomes"
import {
  ANGULO_ASPECTO,
  FUNCAO_VERBOS,
  GLOSA_ASPECTO,
  GLOSA_MOVIMENTO,
  LENTOS,
  LINHA_SIGNO,
} from "./simbolos"
import {
  ESFERA_DE_VIDA,
  PROIBIDAS,
  REGRAS_COMUNS,
  TRACOS,
  idiomaDivergente,
  nomesExpostos,
  pedidoDoCeu,
  vocabularioTecnico,
} from "./editorial"

/**
 * Como o termo é gravado.
 *
 * `fato_id` diz QUAL fato sustenta o termo, e é obrigatório em toda geração
 * nova. Fica opcional no tipo por um motivo só: as linhas gravadas antes desta
 * mudança não o têm, e precisam continuar legíveis. A leitura do cache não
 * revalida `termos` — devolve o que está gravado e nunca chama `verificarCeu`
 * — então linha antiga segue servindo sem conversão e sem migration.
 *
 * É metadata interna: `termos` não entra no payload e nunca chega à tela.
 */
export type TermoDoCeu = { texto: string; origem: string; fato_id?: string }
export type SinteseDoCeu = { termos: TermoDoCeu[]; sintese: string }
export type VereditoDoCeu = { ok: true; sintese: SinteseDoCeu } | { ok: false; violacoes: string[] }

export type FatoDoCeu = {
  id: string
  /** o fato inteiro, com todos os nomes: é o que o modelo lê */
  texto: string
  /** como ele aparece na camada factual da tela, curto */
  factual: string
  nota: number
  corpos: Corpo[]
  /**
   * De que pedaços deste fato um termo pode nascer. São ATÔMICAS: "Plutão" e
   * "retrogradação de Plutão" são duas origens, e cada uma sustenta um termo.
   * Sem isso, um termo dizia vir de um planeta retrógrado sem carregar nada da
   * retrogradação.
   */
  origens: string[]
  /** a base simbólica de cada origem, que já existe no produto */
  bases: Record<string, string[]>
}

const numero = (n: number, locale: Locale) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))

const BASE_ASPECTO: Record<string, number> = {
  conjunction: 1,
  opposition: 0.92,
  square: 0.88,
  trine: 0.72,
  sextile: 0.6,
  quincunx: 0.45,
}

/** Sem signo do leitor, o papel é só o que o corpo é para todo mundo. */
const PAPEL: Record<string, number> = {
  sun: 1.35,
  moon: 1.35,
  mercury: 1.1,
  venus: 1.1,
  mars: 1.1,
  jupiter: 0.95,
  saturn: 0.95,
  uranus: 0.75,
  neptune: 0.75,
  pluto: 0.75,
}

export const QUANTOS_FATOS = 3

/** Os fatos do dia, ordenados, com os dois primeiros já escolhidos por nota. */
export function fatosDoCeu(ceu: Ceu, locale: Locale): { escolhidos: FatoDoCeu[]; todos: FatoDoCeu[] } {
  const signos = SIGNOS[locale]
  const nomes = CORPOS[locale]
  const aspectos = ASPECTOS[locale]
  const onde = (corpo: Corpo) => ceu.posicoes.find((p) => p.corpo === corpo)!
  const candidatos: FatoDoCeu[] = []

  for (const a of ceu.aspectos) {
    if (!BASE_ASPECTO[a.aspecto]) continue
    const orbeMax = a.a === "moon" || a.b === "moon" ? ORBE_MAX_LUA : ORBE_MAX
    const exatidao = 0.55 + 0.45 * (1 - Math.min(a.orbe, orbeMax) / orbeMax)
    const papel = (PAPEL[a.a] + PAPEL[a.b]) / 2
    const geracional = LENTOS.has(a.a) && LENTOS.has(a.b) ? 0.3 : 1
    const tempo = a.orbe < 0.2 ? 1.1 : a.aplicativo ? 1.08 : 0.96
    const pa = onde(a.a)
    const pb = onde(a.b)

    const origens = [nomes[a.a], signos[pa.signo], nomes[a.b], signos[pb.signo], aspectos[a.aspecto]]
    const bases: Record<string, string[]> = {
      [nomes[a.a]]: FUNCAO_VERBOS[locale][a.a],
      [signos[pa.signo]]: [LINHA_SIGNO[locale][pa.signo]],
      [nomes[a.b]]: FUNCAO_VERBOS[locale][a.b],
      [signos[pb.signo]]: [LINHA_SIGNO[locale][pb.signo]],
      [aspectos[a.aspecto]]: [GLOSA_ASPECTO[locale][a.aspecto]],
    }
    for (const [corpo, pos] of [[a.a, pa], [a.b, pb]] as const) {
      if (!pos.retrogrado) continue
      const origem = rotuloRetrogradacao(nomes[corpo], locale)
      origens.push(origem)
      bases[origem] = [GLOSA_MOVIMENTO[locale].retrogrado]
    }

    const retro = (r: boolean) => (r ? `, ${GLOSA_MOVIMENTO[locale].retrogrado.split(",")[0]}` : "")
    candidatos.push({
      id: `aspecto:${a.a}~${a.b}:${a.aspecto}`,
      texto:
        `${nomes[a.a]} ${numero(pa.grau, locale)}° ${signos[pa.signo]}${retro(pa.retrogrado)}` +
        ` / ${aspectos[a.aspecto]} (${ANGULO_ASPECTO[a.aspecto]}°) / ` +
        `${nomes[a.b]} ${numero(pb.grau, locale)}° ${signos[pb.signo]}${retro(pb.retrogrado)}` +
        ` / orbe ${numero(a.orbe, locale)}°`,
      factual: `${nomes[a.a]} ${aspectos[a.aspecto]} ${nomes[a.b]}`,
      nota: BASE_ASPECTO[a.aspecto] * exatidao * papel * geracional * tempo,
      corpos: [a.a, a.b],
      origens,
      bases,
    })
  }

  for (const e of ceu.eventos) {
    const base = e.tipo === "eclipse" ? 2.2 : e.tipo === "lunacao" ? 1.8 : e.tipo === "estacao" ? 1.5 : 1.2
    const corpo: Corpo = e.tipo === "estacao" || e.tipo === "ingresso" ? e.corpo : "moon"
    const origens = [nomes[corpo], signos[e.signo]]
    const bases: Record<string, string[]> = {
      [nomes[corpo]]: FUNCAO_VERBOS[locale][corpo],
      [signos[e.signo]]: [LINHA_SIGNO[locale][e.signo]],
    }
    let texto: string
    if (e.tipo === "lunacao") {
      const fase = LUNACOES[locale][e.fase] ?? e.fase
      texto = `${fase} ${numero(e.grau, locale)}° ${signos[e.signo]}`
      origens.push(fase)
      bases[fase] = [FASES[locale][ceu.faseLua]]
    } else if (e.tipo === "eclipse") {
      texto = `${e.especie === "solar" ? "eclipse solar" : "eclipse lunar"} ${numero(e.grau, locale)}° ${signos[e.signo]}`
    } else if (e.tipo === "estacao") {
      const origem = rotuloRetrogradacao(nomes[e.corpo], locale)
      texto = `${nomes[e.corpo]} ${e.sentido === "direct" ? "direto" : "retrógrado"} ${numero(e.grau, locale)}° ${signos[e.signo]}`
      if (e.sentido !== "direct") {
        origens.push(origem)
        bases[origem] = [GLOSA_MOVIMENTO[locale].retrogrado]
      }
    } else {
      texto = `${nomes[e.corpo]} entra em ${signos[e.signo]}`
    }
    candidatos.push({ id: `evento:${e.tipo}`, texto, factual: texto, nota: base, corpos: [corpo], origens, bases })
  }

  const todos = [...candidatos].sort((x, y) => y.nota - x.nota || (x.id < y.id ? -1 : 1))

  // anti-redundância: uma relação que traz um corpo novo vale mais do que outra
  // que repete os mesmos dois
  const escolhidos: FatoDoCeu[] = []
  const restantes = [...todos]
  while (escolhidos.length < QUANTOS_FATOS && restantes.length) {
    let melhor = 0
    let melhorNota = -1
    restantes.forEach((c, i) => {
      const repetidos = c.corpos.filter((corpo) => escolhidos.some((e) => e.corpos.includes(corpo))).length
      const nota = c.nota * (repetidos === 0 ? 1 : repetidos === 1 ? 0.6 : 0.35)
      if (nota > melhorNota) {
        melhorNota = nota
        melhor = i
      }
    })
    escolhidos.push(restantes.splice(melhor, 1)[0])
  }
  return { escolhidos, todos }
}

function rotuloRetrogradacao(nome: string, locale: Locale): string {
  const palavra = { pt: "retrogradação de", en: "retrogradation of", es: "retrogradación de" }[locale]
  return `${palavra} ${nome}`
}

/** As duas linhas de fatos que a Home mostra acima da síntese. */
export function camadaFactual(ceu: Ceu, escolhidos: FatoDoCeu[], locale: Locale): string[] {
  const signos = SIGNOS[locale]
  const em = { pt: "em", en: "in", es: "en" }[locale]
  const sol = ceu.posicoes.find((p) => p.corpo === "sun")!
  const lua = ceu.posicoes.find((p) => p.corpo === "moon")!
  const primeira = `${CORPOS[locale].sun} ${em} ${signos[sol.signo]} · ${CORPOS[locale].moon} ${FASES[locale][ceu.faseLua]} ${em} ${signos[lua.signo]}`
  const segunda = escolhidos
    .filter((f) => f.id.startsWith("aspecto:"))
    .map((f) => f.factual)
    .join(" · ")
  return segunda ? [primeira, segunda] : [primeira]
}

// ---------------------------------------------------------------------------
// o prompt
// ---------------------------------------------------------------------------

const IDIOMA: Record<Locale, string> = {
  pt: "Responda apenas com JSON válido, sem Markdown. O texto destinado ao leitor é escrito em português do Brasil.",
  en: "Respond only with valid JSON, no Markdown. The text addressed to the reader is written in English.",
  es: "Responde solo con JSON válido, sin Markdown. El texto dirigido al lector se escribe en español.",
}

/**
 * A MESMA EXIGÊNCIA DE IDIOMA, REPETIDA NO FIM, e por um motivo medido.
 *
 * `IDIOMA` abre o prompt com uma linha pedindo o idioma. Depois dela vêm umas
 * quatrocentas palavras de regras em português, incluindo um exemplo que mostra
 * a FORMA desejada da saída com um texto em português. Em produção o modelo
 * seguiu o exemplo e não a linha: as linhas `en` e `es` de `sky_daily` foram
 * gravadas com síntese em português, enquanto a camada factual, que é cálculo e
 * não geração, saiu corretamente traduzida.
 *
 * Então o fecho faz duas coisas que a abertura não fazia: nomeia as instruções
 * em português COMO instruções, e não como amostra da língua a imitar, e fica
 * na última posição, que é a que o modelo lê por último. Está escrito no
 * próprio idioma pedido, porque uma instrução em inglês é ela mesma um sinal de
 * que a resposta vai em inglês.
 *
 * Isto não muda regra editorial, nem quantidade de fatos, nem tamanho da
 * síntese: só o idioma em que ela sai.
 */
const IDIOMA_FECHO: Record<Locale, string> = {
  pt: 'IDIOMA: as regras acima estão em português porque são instruções para você. O que você devolve, cada "texto" e a "sintese", é escrito em português do Brasil.',
  en: 'LANGUAGE: the rules above are written in Portuguese because they are instructions for you, not a sample of the language to write in. What you return, every "texto" and the "sintese", is written in English, with no Portuguese words.',
  es: 'IDIOMA: las reglas anteriores están en portugués porque son instrucciones para ti, no un ejemplo del idioma en que debes escribir. Lo que devuelves, cada "texto" y la "sintese", se escribe en español, sin palabras en portugués.',
}

const PALAVRAS_MAX = 45
const TERMOS = { min: 3, max: 5 }

/**
 * Todo nome técnico daquele idioma: corpos, signos, aspectos e fases.
 *
 * UMA LISTA SÓ, lida pelo prompt e pelo verificador. Antes a lista existia
 * apenas dentro de `verificarCeu`, e o prompt pedia em abstrato que o texto não
 * nomeasse nada. O modelo era julgado por um critério que não via, e em inglês
 * isso foi fatal: "new" e "full" são nomes de fase, e ele não tinha como
 * adivinhar. Vindo da mesma função, o que se pede é o que se cobra.
 */
export function nomesTecnicos(locale: Locale): string[] {
  return [
    ...Object.values(CORPOS[locale]).filter(Boolean),
    ...SIGNOS[locale],
    ...Object.values(ASPECTOS[locale]),
    ...FASES[locale],
  ]
}

/**
 * A lista de termos técnicos dita ao modelo, no idioma dele, com a licença que
 * o verificador de fato concede: palavra comum que também é termo técnico pode
 * ser usada no sentido comum.
 */
const VOCABULARIO: Record<Locale, (lista: string) => string> = {
  pt: (lista) =>
    `ESTES SÃO OS TERMOS TÉCNICOS, e nenhum deles aparece nomeado na sua síntese:
${lista}.
Alguns também são palavra comum do português. No sentido comum pode: o que não pode é nomear a fase, o aspecto, o signo ou o corpo.`,
  en: (lista) =>
    `THESE ARE THE TECHNICAL TERMS, and none of them appears as a name in your synthesis:
${lista}.
Several are also ordinary English words. Using one in its ordinary sense is fine: what is not allowed is naming the phase, the aspect, the sign or the body.`,
  es: (lista) =>
    `ESTOS SON LOS TÉRMINOS TÉCNICOS, y ninguno aparece nombrado en tu síntesis:
${lista}.
Algunos son también palabra común del español. En el sentido común sí: lo que no se puede es nombrar la fase, el aspecto, el signo o el cuerpo.`,
}

/**
 * O CONTRATO DE `termos`, dito de forma inequívoca e na ordem de execução.
 *
 * O verificador exige que cada `termos[].texto` seja encontrado LITERALMENTE
 * dentro da `sintese`: é um teste de substring, e por isso a lista de termos
 * funciona como índice da síntese, não como resumo dela. A regra está certa
 * para esta arquitetura e não mudou.
 *
 * O que faltava era o modelo saber disso. Nos logs de produção de 2026-10-01,
 * 10 das 13 violações foram `"..." não aparece na síntese`, e os termos
 * recusados eram frases inteiras, do tipo "Investigation meets assertiveness,
 * pushing boundaries of expression." — mini-interpretações novas, não trechos
 * copiados. Quatro termos desse tamanho não cabem numa síntese de duas frases.
 *
 * Daí a ordem explícita, o "copie palavra por palavra" e um exemplo curto
 * mostrando síntese e termos lado a lado. O exemplo é de FORMA, não de
 * conteúdo, e foi conferido contra o verificador inteiro: ele passa limpo em
 * todas as regras, para não ensinar violação nenhuma.
 */
const CONTRATO_TERMOS: Record<Locale, (min: number, max: number) => string> = {
  pt: (min, max) => `COMO MONTAR \`termos\`, e a ordem importa:
1. Escreva a \`sintese\` primeiro.
2. Depois escolha ${min} ou ${max} trechos CURTOS que já existam dentro dela.
3. Copie cada trecho palavra por palavra para \`termos[].texto\`.
4. Nunca parafraseie em \`termos\`.
5. Nunca escreva uma mini-interpretação nova em \`termos\`.
6. Todo \`termos[].texto\` precisa ser encontrado, letra por letra, dentro da \`sintese\`.
7. Cada termo mantém a \`origem\` que o sustenta.
8. A \`sintese\` tem EXATAMENTE duas frases completas, cada uma terminada em ponto. Não uma, não três.
9. Cada termo declara \`fato_id\`, copiado exatamente como aparece no fato de onde ele saiu.
10. A \`origem\` precisa ser uma das ORIGENS DAQUELE fato, e não de outro. Dois fatos podem oferecer a mesma palavra, e aí são origens diferentes: declare o \`fato_id\` certo e pode usar as duas.

Exemplo da FORMA, não do conteúdo de hoje:
  sintese: "Precisão que examina encontra insistência atravessada, enquanto profundidade em revisão acha acordo sem atrito."
  termos:  "precisão que examina" | "insistência atravessada" | "profundidade em revisão" | "acordo sem atrito"
Os quatro aparecem na frase acima, palavra por palavra, e cada um declara o \`fato_id\` do fato de onde saiu.`,
  en: (min, max) => `HOW TO BUILD \`termos\`, and the order matters:
1. Write the \`sintese\` first.
2. Then pick ${min} or ${max} SHORT stretches that already exist inside it.
3. Copy each stretch word for word into \`termos[].texto\`.
4. Never paraphrase in \`termos\`.
5. Never write a new mini-interpretation in \`termos\`.
6. Every \`termos[].texto\` must be findable, letter for letter, inside the \`sintese\`.
7. Each term keeps the \`origem\` that sustains it.
8. The \`sintese\` has EXACTLY two complete sentences, each ending with a period. Not one, not three.
9. Each term declares \`fato_id\`, copied exactly as it appears in the fact it came from.
10. The \`origem\` must be one of THAT fact's ORIGENS, not another fact's. Two facts can offer the same word, and then they are different origins: declare the right \`fato_id\` and you may use both.

Example of the SHAPE, not of today's content:
  sintese: "Examining precision meets crossed insistence, while depth under review finds a frictionless accord."
  termos:  "examining precision" | "crossed insistence" | "depth under review" | "frictionless accord"
All four appear in the sentence above, word for word, and each one declares the \`fato_id\` of the fact it came from.`,
  es: (min, max) => `CÓMO ARMAR \`termos\`, y el orden importa:
1. Escribe la \`sintese\` primero.
2. Después elige ${min} o ${max} fragmentos CORTOS que ya existan dentro de ella.
3. Copia cada fragmento palabra por palabra a \`termos[].texto\`.
4. Nunca parafrasees en \`termos\`.
5. Nunca escribas una mini-interpretación nueva en \`termos\`.
6. Todo \`termos[].texto\` tiene que encontrarse, letra por letra, dentro de la \`sintese\`.
7. Cada término mantiene la \`origem\` que lo sostiene.
8. La \`sintese\` tiene EXACTAMENTE dos frases completas, cada una terminada en punto. No una, no tres.
9. Cada término declara \`fato_id\`, copiado exactamente como aparece en el hecho del que salió.
10. La \`origem\` tiene que ser una de las ORIGENS DE ESE hecho, no de otro. Dos hechos pueden ofrecer la misma palabra, y entonces son orígenes distintos: declara el \`fato_id\` correcto y puedes usar las dos.

Ejemplo de la FORMA, no del contenido de hoy:
  sintese: "Precisión que examina encuentra insistencia cruzada, mientras profundidad en revisión halla fuerzas enfrentadas."
  termos:  "precisión que examina" | "insistencia cruzada" | "profundidad en revisión" | "fuerzas enfrentadas"
Los cuatro aparecen en la frase de arriba, palabra por palabra, y cada uno declara el \`fato_id\` del hecho del que salió.`,
}

/**
 * A retrogradação, dita no idioma pedido e com as palavras que a função aceita.
 *
 * O "não serve" em inglês é literalmente o termo que reprovou em produção, e
 * está ali de propósito: o contraexemplo real ensina mais que a regra abstrata.
 */
const CONTRATO_RETROGRADACAO: Record<Locale, (palavras: string) => string> = {
  pt: (palavras) => `QUANDO A ORIGEM FOR UMA RETROGRADAÇÃO, o termo precisa trazer o movimento de volta: algo em revisão, retomada, retorno, algo que ainda está sendo revisto. Nomear o tema que está sendo revisto não basta.
Palavras que servem: ${palavras}.
Serve: "profundidade em revisão". Não serve: "transformação profunda", que nomeia o tema e perde a volta.`,
  en: (palavras) => `WHEN THE ORIGIN IS A RETROGRADATION, the term must carry the movement back: something under review, revisited, returned to, gone over again. Naming the theme being reviewed is not enough.
Words that work: ${palavras}.
Works: "depth under review". Does not work: "deep transformation", which names the theme and loses the return.`,
  es: (palavras) => `CUANDO EL ORIGEN SEA UNA RETROGRADACIÓN, el término tiene que traer el movimiento de vuelta: algo en revisión, retomada, retorno, algo que todavía se está revisando. Nombrar el tema que se revisa no basta.
Palabras que sirven: ${palavras}.
Sirve: "profundidad en revisión". No sirve: "transformación profunda", que nombra el tema y pierde la vuelta.`,
}

/**
 * A regra do ângulo, agora no idioma pedido.
 *
 * Ela vivia solta no corpo do prompt, em português, e para EN e ES chegava
 * sem tradução. A regra em si não muda: ao menos um termo vem de um ângulo.
 */
const CONTRATO_ANGULO: Record<Locale, string> = {
  pt: "PELO MENOS UM TERMO VEM DE UM ÂNGULO. O que mudou hoje é a relação entre os corpos, não a qualidade de cada um isolado.",
  en: "AT LEAST ONE TERM COMES FROM AN ANGLE. What changed today is the relation between the bodies, not the quality of each one on its own.",
  es: "AL MENOS UN TÉRMINO VIENE DE UN ÁNGULO. Lo que cambió hoy es la relación entre los cuerpos, no la cualidad de cada uno por separado.",
}

/** Marca, no idioma pedido, quais origens daquele fato são retrogradação. */
const AVISO_RETROGRADACAO: Record<Locale, string> = {
  pt: "São retrogradação, e o termo precisa trazer a volta",
  en: "These are retrogradations, and the term must carry the return",
  es: "Son retrogradación, y el término tiene que traer la vuelta",
}

/**
 * `minimo` é o do DIA, e não a constante.
 *
 * Isto era uma contradição entre o prompt e o verificador, do mesmo tipo da que
 * já custou geração nesta base: o prompt pedia "de 3 a 5" porque usava
 * `TERMOS.min`, enquanto `verificarCeu` cobrava `minimoDeTermos`, que é 4 em
 * dia com dois ângulos ou mais. Em 2026-10-01 duas das quatro tentativas em
 * inglês entregaram exatamente 3 termos e foram reprovadas por isso: o modelo
 * obedeceu o que estava escrito.
 *
 * O mínimo não mudou. O que mudou foi o prompt passar a dizer a verdade.
 */
export function sistemaDoCeu(locale: Locale, minimo: number = TERMOS.min): string {
  return `${IDIOMA[locale]}

Você escreve a leitura coletiva do céu de hoje no Multioráculo. Ela vale para todas as pessoas, sem exceção: não é horóscopo de signo e não é leitura pessoal.

${REGRAS_COMUNS}

DUAS CAMADAS, E VOCÊ ESCREVE SÓ A SEGUNDA
A tela já mostra a configuração com todos os nomes, logo acima do seu texto: os planetas, os signos, os graus, os aspectos e os orbes. A prova já está dada ali.

Por isso a sua síntese NÃO REPETE NOME NENHUM: nem de planeta, nem de signo, nem de aspecto, nem de fase. Quem lê não deveria precisar decodificar astrologia para entender a mensagem.

${VOCABULARIO[locale](vocabularioTecnico(nomesTecnicos(locale)))}

Em vez de "Mercúrio em Libra em oposição a Saturno retrógrado em Áries marca um confronto entre comunicação e estrutura", escreva algo como "Pensamento e limite ficam frente a frente, e comparação e definição entram no mesmo movimento".

ISSO NÃO AUTORIZA GENERALIZAR
Cada TERMO nasce de um pedaço declarado de um fato, e você declara qual. O que não pode é um termo que caberia em qualquer outro dia.

O TERMO PRECISA CARREGAR O QUE É ESPECÍFICO DA ORIGEM
As origens são atômicas, e cada uma sustenta um termo só. Um planeta e a retrogradação dele são origens diferentes: se você declarar a retrogradação, o termo precisa trazer o movimento de volta, como revisão, retomada, retorno ou algo que ainda está sendo revisto. E o termo nunca é apenas a base da origem repetida: ele situa aquilo no que está acontecendo hoje.

${CONTRATO_RETROGRADACAO[locale](EXEMPLOS_RETROGRADACAO[locale].join(", "))}

${CONTRATO_ANGULO[locale]}

O MOVIMENTO PRIMEIRO, O ENCONTRO DEPOIS. A primeira frase nomeia o que está sendo mobilizado hoje. A segunda nomeia o que esse movimento encontra: o que o sustenta, o que o atravessa, o que o revisa.

VOCÊ NÃO SABE NADA SOBRE QUEM LÊ. Não nomeie esfera nenhuma da vida: nem relações, vínculos, afetos, trabalho, dinheiro ou saúde.

NÃO ESCREVA CONSELHO NEM PEDIDO. O céu não exige, não pede, não demanda, não convida, não favorece, não sugere e não desafia ninguém. Escreva no indicativo o que está posto, o que se aproxima, o que se separa, o que fica em tensão.

O QUE DEVOLVER
- termos: ${minimo} ou ${TERMOS.max} entradas com texto, fato_id e origem. A origem é exatamente uma das ORIGENS listadas naquele fato.
- sintese: DUAS frases, no máximo ${PALAVRAS_MAX} palavras somadas, contendo todos os termos.

${CONTRATO_TERMOS[locale](minimo, TERMOS.max)}

Devolva JSON: {"termos": [{"texto": "...", "fato_id": "...", "origem": "..."}], "sintese": "..."}

${IDIOMA_FECHO[locale]}`
}

export function promptCeuDoDia(ceu: Ceu, escolhidos: FatoDoCeu[], locale: Locale): { system: string; user: string } {
  const signos = SIGNOS[locale]
  const sol = ceu.posicoes.find((p) => p.corpo === "sun")!
  const lua = ceu.posicoes.find((p) => p.corpo === "moon")!
  const retro = ceu.posicoes.filter((p) => p.retrogrado).map((p) => CORPOS[locale][p.corpo])

  const linhas = [
    `DIA: ${ceu.dia}`,
    "",
    "O CÉU, EM GERAL",
    `Sol ${numero(sol.grau, locale)}° ${signos[sol.signo]}.`,
    `Lua ${numero(lua.grau, locale)}° ${signos[lua.signo]}, fase ${FASES[locale][ceu.faseLua]}.`,
    retro.length ? `Retrógrados hoje: ${retro.join(", ")}.` : "Nenhum planeta retrógrado hoje.",
    "",
    "FATOS DO DIA (escreva só sobre estes)",
  ]
  escolhidos.forEach((f, i) => {
    linhas.push(`${i + 1}. ${f.texto}`)
    // o identificador estável do fato, para o termo dizer de qual fato veio.
    // Sem ele a origem é ambígua: "oposição" pode pertencer a dois fatos no
    // mesmo dia, e em 2026-10-02 pertencia.
    linhas.push(`   fato_id: ${f.id}`)
    linhas.push(`   ORIGENS possíveis deste fato: ${f.origens.join(" | ")}`)
    // a exigência da retrogradação dita no ponto em que a origem é escolhida,
    // e não só trezentas palavras antes. Em 2026-10-01 o modelo declarou duas
    // origens de retrogradação e escreveu termos sem volta nenhuma nas duas.
    //
    // EM LINHA SEPARADA, e não colada no nome da origem: o verificador compara
    // `termos[].origem` com a string exata, e um marcador grudado ali seria
    // copiado para dentro da origem e reprovaria por "origem que não existe".
    const retro = f.origens.filter((o) => ehRetrogradacao(o, locale))
    if (retro.length) linhas.push(`   ${AVISO_RETROGRADACAO[locale]}: ${retro.join(" | ")}`)
  })
  return { system: sistemaDoCeu(locale, minimoDeTermos(escolhidos)), user: linhas.join("\n") }
}

// ---------------------------------------------------------------------------
// verificador
// ---------------------------------------------------------------------------

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const significativas = (texto: string) =>
  semAcento(texto)
    .split(/[^\p{L}]+/u)
    .filter((p) => p.length >= 4)

/** O termo é NADA ALÉM da base da origem? Repetir a base não interpreta nada. */
function ecoTotal(texto: string, base: string[]): boolean {
  const doTermo = significativas(texto)
  if (!doTermo.length) return false
  const daBase = new Set(base.flatMap(significativas))
  return doTermo.every((p) => daBase.has(p))
}

/**
 * Noções que sustentam uma retrogradação, derivadas da glosa do próprio
 * produto ("um tema que volta para revisão"). São raízes e não palavras
 * obrigatórias: revisto, revisão, retomada, retorno, volta e refazer passam.
 */
const NOCOES_RETROGRADACAO: Record<Locale, string[]> = {
  pt: ["revis", "rever", "reve", "retom", "retorn", "volt", "refaz", "reexam", "atras"],
  en: ["revis", "review", "return", "back", "redo", "reexam", "again"],
  es: ["revis", "retom", "retorn", "vuelt", "volv", "rehac", "reexam", "atras"],
}

/**
 * Palavras que SATISFAZEM `carregaRetrogradacao`, para o prompt citar.
 *
 * Existem porque o prompt e a função descreviam contratos diferentes. O prompt
 * dizia "como revisão, retomada, retorno ou algo que ainda está sendo revisto",
 * em português, e mandava o modelo inferir o equivalente no idioma dele.
 * Metade das traduções naturais desses exemplos reprova na função: "resumption"
 * e "retaking" para retomada, "reconsidered" e "rethought" para "algo
 * revisto". O modelo podia acertar a semântica e falhar na lista de raízes.
 *
 * Em 2026-10-01 a geração em inglês caiu exatamente aqui, com dois termos:
 * "deep transformation" de "retrogradation of Pluto" e "unusual perspectives"
 * de "retrogradation of Uranus". Nenhum dos dois traz a volta.
 *
 * Cada palavra desta lista é conferida contra `carregaRetrogradacao` no
 * verificador. Se alguém acrescentar aqui algo que a função recusa, ou tirar
 * uma raiz de `NOCOES_RETROGRADACAO` que uma destas usava, o build para. É o
 * que impede os dois contratos de divergirem de novo.
 */
export const EXEMPLOS_RETROGRADACAO: Record<Locale, string[]> = {
  pt: ["revisão", "revisto", "retomada", "retorno", "volta", "refazer", "reexame"],
  en: ["review", "revisiting", "revisited", "returning", "return", "back", "again"],
  es: ["revisión", "retomada", "retorno", "vuelta", "rehacer", "reexamen"],
}

export function carregaRetrogradacao(texto: string, locale: Locale): boolean {
  const t = semAcento(texto)
  return NOCOES_RETROGRADACAO[locale].some((raiz) => t.includes(raiz))
}

export function verificarCeu(params: {
  bruto: unknown
  escolhidos: FatoDoCeu[]
  locale: Locale
  /** mínimo de termos; cai para 3 em dia com menos de dois ângulos */
  minimoTermos?: number
}): VereditoDoCeu {
  const { bruto, escolhidos, locale } = params
  const violacoes: string[] = []

  const termosBrutos = (bruto as { termos?: unknown })?.termos
  // `fato_id` NÃO entra no filtro: termo sem ele produz uma violação com nome,
  // que o reparo pode corrigir, em vez de desaparecer da contagem em silêncio.
  const termos: Array<{ texto: string; origem: string; fato_id: string }> = Array.isArray(termosBrutos)
    ? termosBrutos
        .map((t) => ({
          texto: String((t as TermoDoCeu)?.texto ?? "").trim(),
          origem: String((t as TermoDoCeu)?.origem ?? "").trim(),
          fato_id: String((t as TermoDoCeu)?.fato_id ?? "").trim(),
        }))
        .filter((t) => t.texto && t.origem)
    : []
  const sintese = typeof (bruto as { sintese?: unknown })?.sintese === "string" ? (bruto as { sintese: string }).sintese.trim() : ""
  if (!sintese) return { ok: false, violacoes: ["síntese ausente"] }

  // 0. o idioma pedido, e esta vem antes das outras porque sustenta todas.
  // Com a língua errada o resto confere o texto errado: as listas de nomes e de
  // expressões proibidas são as do locale pedido, e nenhuma delas casa com um
  // parágrafo em outro idioma. Foi assim que uma síntese em português entrou
  // numa linha `en` e numa linha `es` sem nenhuma violação.
  const outroIdioma = idiomaDivergente(sintese, locale)
  if (outroIdioma) {
    violacoes.push(`a síntese está em ${LOCALE_META[outroIdioma].promptName} e precisa estar em ${LOCALE_META[locale].promptName}`)
  }

  // 1. a superfície não nomeia astrologia.
  //
  // `nomesExpostos` qualifica o nome ambíguo pelo contexto, em vez de proibir a
  // string. A regra cobra nomenclatura exposta, e não a palavra do idioma que
  // por acaso também é termo técnico: "new perspectives" passa, "new moon" não.
  for (const nome of nomesExpostos(sintese, locale, nomesTecnicos(locale))) {
    violacoes.push(`a síntese nomeia "${nome}"`)
  }

  // 2. cada termo declara QUAL FATO o sustenta, e uma origem DAQUELE fato.
  //
  // A IDENTIDADE DA ORIGEM É COMPOSTA, e isso foi medido. A string sozinha não
  // identifica nada: em 2026-10-02 havia 17 origens expostas e só 14 strings
  // distintas, porque "Marte" e "Leão" aparecem no quadrado e na oposição de
  // Plutão, e "oposição" aparece em DOIS fatos diferentes (Sol~Saturno e
  // Marte~Plutão).
  //
  // O código anterior resolvia origem -> fato pelo primeiro fato que a
  // continha, e isso errava nos dois sentidos, os dois reproduzidos em teste:
  //
  //   um termo para cada uma das duas oposições era recusado como "origem
  //   usada por mais de um termo", sendo que são dois pares diferentes e o
  //   comportamento estava correto;
  //
  //   quatro termos do MESMO fato passavam, porque "Marte" era atribuído ao
  //   quadrado e "oposição" a Sol~Saturno, e a regra de abrangência contava
  //   três fatos que não existiam.
  //
  // Agora o termo diz o fato, tudo é resolvido DENTRO dele, e `fatoDaOrigem`
  // deixou de existir.
  const porFato = new Map<string, FatoDoCeu>()
  for (const f of escolhidos) porFato.set(f.id, f)

  const minimo = params.minimoTermos ?? TERMOS.min
  if (termos.length < minimo || termos.length > TERMOS.max) {
    violacoes.push(`${termos.length} termos (queremos de ${minimo} a ${TERMOS.max})`)
  }

  const angulos = new Set(Object.values(ASPECTOS[locale]))
  const usadas = new Set<string>()
  const fatosCobertos = new Set<string>()
  let termoDeAngulo = false

  for (const t of termos) {
    const fato = porFato.get(t.fato_id)
    if (!fato) {
      violacoes.push(`"${t.texto}" declara fato_id "${t.fato_id || "(vazio)"}", que não está entre os fatos de hoje`)
      continue
    }
    if (!fato.origens.includes(t.origem)) {
      violacoes.push(`"${t.texto}" declara origem "${t.origem}", que não é uma das origens de "${t.fato_id}"`)
      continue
    }

    // unicidade pelo PAR, e não pela string: a mesma palavra em dois fatos
    // diferentes são duas origens diferentes
    const par = `${t.fato_id}\u0000${t.origem}`
    if (usadas.has(par)) violacoes.push(`a origem "${t.origem}" de "${t.fato_id}" foi usada por mais de um termo`)
    usadas.add(par)
    fatosCobertos.add(t.fato_id)
    if (angulos.has(t.origem)) termoDeAngulo = true

    if (!semAcento(sintese).includes(semAcento(t.texto))) violacoes.push(`"${t.texto}" não aparece na síntese`)
    if (ecoTotal(t.texto, fato.bases[t.origem] ?? [])) {
      violacoes.push(`"${t.texto}" é só a base de "${t.origem}", não interpreta nada`)
    }
    if (ehRetrogradacao(t.origem, locale) && !carregaRetrogradacao(t.texto, locale)) {
      violacoes.push(`"${t.texto}" vem de "${t.origem}" mas não carrega o movimento de volta`)
    }
  }

  // abrangência pelo fato DECLARADO, nunca por inferência
  if (fatosCobertos.size < 2) violacoes.push("todos os termos vêm do mesmo fato")

  // o ângulo é a notícia: sem ele a síntese vira lista de qualidades soltas
  const temAngulo = escolhidos.some((f) => f.origens.some((o) => angulos.has(o)))
  if (temAngulo && !termoDeAngulo) {
    violacoes.push("nenhum termo vem de um ângulo: a relação entre os corpos ficou de fora")
  }

  // 3. as regras editoriais que já valem no resto do produto
  for (const proibida of PROIBIDAS[locale]) {
    const achou = sintese.match(proibida)
    if (achou) violacoes.push(`expressão proibida: "${achou[0].trim()}"`)
  }
  if (TRACOS.test(sintese)) violacoes.push("usa travessão")
  if (/arquetíp|arquétip/i.test(sintese)) violacoes.push('usa a palavra "arquétipo"')

  // As duas regras abaixo moraram aqui como regex em português só, e por isso
  // valiam apenas para PT: as listas de EN e ES simplesmente não existiam.
  // Enquanto toda saída vinha em português isso não aparecia. Agora que a
  // síntese sai no idioma pedido, elas estão em `editorial.ts` com as três
  // versões, e o PT é a mesma lista de antes, sem um verbo a mais nem a menos.
  for (const achou of pedidoDoCeu(sintese, locale)) violacoes.push(`fala como conselho: "${achou}"`)
  for (const re of ESFERA_DE_VIDA[locale]) {
    for (const achou of sintese.matchAll(re)) violacoes.push(`inventa esfera de vida: "${achou[0]}"`)
  }

  const frases = sintese.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (frases.length !== 2) violacoes.push(`${frases.length} frases (queremos 2)`)
  const palavras = sintese.trim().split(/\s+/).length
  if (palavras > PALAVRAS_MAX) violacoes.push(`${palavras} palavras, acima de ${PALAVRAS_MAX}`)

  return violacoes.length ? { ok: false, violacoes } : { ok: true, sintese: { termos, sintese } }
}

function ehRetrogradacao(origem: string, locale: Locale): boolean {
  const palavra = { pt: "retrogradação de", en: "retrogradation of", es: "retrogradación de" }[locale]
  return origem.startsWith(palavra)
}

/**
 * Quantos termos exigir hoje. Em dia cheio pedimos quatro, porque três deixam
 * a leitura curta demais para o que os fatos ofereciam. Em dia com menos de
 * dois ângulos, três é o que dá para sustentar sem forçar.
 */
export function minimoDeTermos(escolhidos: FatoDoCeu[]): number {
  const angulos = escolhidos.filter((f) => f.id.startsWith("aspecto:")).length
  return angulos >= 2 ? 4 : 3
}
