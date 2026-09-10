/**
 * Prompt da síntese integrada. Vive fora da rota para ser usado pela segunda
 * etapa da consulta (POST /consultas/sintese), que roda em uma função
 * separada para caber no limite de 60 s por função do Netlify.
 *
 * Dois princípios:
 *
 * 1. A síntese INTEGRA, não reinterpreta. Cada oráculo já produziu sua
 *    leitura completa; aqui o trabalho é comparar as cinco, achar onde
 *    convergem e onde divergem. Os símbolos entram apenas como contexto.
 *
 * 2. Os cinco sistemas chegam com o MESMO PESO. A ordem em que aparecem é
 *    um embaralhamento determinístico pelo seed (o mesmo seed dá sempre a
 *    mesma ordem; ao longo de muitas leituras cada sistema ocupa todas as
 *    posições por igual), e cada leitura é condensada pelo mesmo orçamento
 *    de informação, preservando conclusão, tensões, advertências, elementos
 *    centrais e relações — cortando só em fim de frase (salience.ts).
 *
 * A forma do texto também nasce da tiragem: o seed escolhe abertura,
 * movimento e chegada diferentes a cada vez.
 */
import type { OracleKey } from "./draw"
import { condenseReading, SYNTHESIS_ORACLE_BUDGET } from "./salience"
import { languageRule } from "./language"
import type { Locale } from "@/lib/i18n/config"

export type SynthesisOracle = {
  title: string
  draw: {
    items: Array<{ position?: string; name: string; meaning?: string }>
    notes?: string
  }
  /** interpretação completa daquele oráculo (é o que a síntese compara) */
  reading?: string
}

export type SynthesisInput = Record<OracleKey, SynthesisOracle>

export const ORACLE_ORDER: OracleKey[] = ["tarot", "iching", "runas", "buzios", "lenormand"]

// ---------------------------------------------------------------------------
// Variação narrativa determinística por seed
// ---------------------------------------------------------------------------

const OPENINGS = [
  "Comece pela tensão mais forte entre duas leituras que discordam — deixe a contradição aberta antes de qualquer conciliação.",
  "Comece por uma imagem concreta e sensorial que condense o que as leituras mostram, sem explicá-la de imediato.",
  "Comece pelo que está terminando, em tom baixo, quase descritivo, e só depois deixe aparecer o que se move.",
  "Comece pelo ponto onde a pergunta e as leituras não coincidem — o que a pessoa perguntou e o que o campo respondeu são coisas diferentes.",
  "Comece pelo detalhe menor e mais estranho das leituras, aquele que parece não pertencer, e deixe-o organizar o resto.",
  "Comece pelo meio da situação, como quem entra numa conversa já em curso, sem preâmbulo nem apresentação do tema.",
  "Comece pela convergência mais nítida entre as leituras e questione-a: uma unanimidade também esconde algo.",
  "Comece por uma frase curta e afirmativa sobre a pessoa, não sobre a situação, e desdobre a partir dela.",
]

const MOVEMENTS = [
  "Deixe o texto avançar em espiral: volte duas vezes ao mesmo núcleo, cada vez vendo-o de um ângulo diferente.",
  "Construa o texto como um contraponto: duas linhas de força alternando, sem que uma vença a outra.",
  "Avance de forma linear e sóbria, do mais visível ao mais escondido, sem voltas.",
  "Deixe o texto mudar de andamento no meio: um parágrafo denso e lento, depois um mais rápido e cortante, ou o inverso.",
  "Organize o texto ao redor de uma única pergunta interior que as leituras formulam e que o texto não responde por completo.",
  "Deixe que um parágrafo desminta parcialmente o anterior, como uma leitura que se corrige enquanto avança.",
]

const CLOSINGS = [
  "Termine em uma imagem, não em uma conclusão.",
  "Termine com a ambiguidade mais honesta do conjunto, nomeada sem resolvê-la.",
  "Termine em um detalhe pequeno e concreto, quase banal, que carregue o peso do todo.",
  "Termine sem fechar: a última frase deve deixar a leitura em aberto, como uma porta entreaberta.",
  "Termine com uma constatação seca, de uma linha, sem consolo e sem convocação.",
  "Termine voltando à primeira frase do texto, agora com outro sentido.",
  "Termine com o que a pessoa provavelmente não quer ouvir, dito com cuidado e sem suavizar.",
]

function hash32(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** PRNG pequeno e determinístico (mulberry32), só para forma e ordem. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Ordem de apresentação dos cinco oráculos: embaralhamento completo
 * (Fisher–Yates) semeado pelo seed. Mesmo seed → mesma ordem; ao longo de
 * muitos seeds, cada sistema ocupa cada posição com a mesma frequência.
 * Nenhum sistema fica sempre em primeiro nem sempre em último.
 */
export function synthesisOrder(seed: string): OracleKey[] {
  const rand = mulberry32(hash32(`${seed}:synthesis-order`))
  const out = ORACLE_ORDER.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function narrativeHints(seed: string) {
  const h = hash32(seed)
  return {
    opening: OPENINGS[h % OPENINGS.length],
    movement: MOVEMENTS[(h >>> 8) % MOVEMENTS.length],
    closing: CLOSINGS[(h >>> 16) % CLOSINGS.length],
    paragraphs: 2 + ((h >>> 24) % 3), // 2, 3 ou 4
  }
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

/** Bloco de um oráculo: leitura condensada por saliência + símbolos como contexto. */
function oracleBlock(r: SynthesisOracle, n: number): string {
  const symbols = r.draw.items.slice(0, 12).map((it) => it.name)
  const context = r.draw.items
    .slice(0, 12)
    .map((it) => (it.position ? `${it.position}: ${it.name}` : it.name))
    .join(" · ")
  const notes = r.draw.notes ? ` [${r.draw.notes}]` : ""
  const reading = (r.reading ?? "").trim()
  const body = reading
    ? condenseReading(reading, { budget: SYNTHESIS_ORACLE_BUDGET, symbols })
    : // sem leitura (leitura antiga): usa os significados por item, mesmo orçamento
      condenseReading(
        r.draw.items
          .slice(0, 12)
          .map((it) => (it.meaning ? `${it.name}: ${it.meaning}` : it.name))
          .join(" "),
        { budget: SYNTHESIS_ORACLE_BUDGET, symbols }
      )
  return `LEITURA ${n}\nContexto simbólico: ${context}${notes}\nLeitura: ${body}`
}

export function synthesisPrompt(
  question: string,
  results: SynthesisInput,
  locale: Locale,
  seed: string
): string {
  const order = synthesisOrder(seed)
  const readings = order.map((k, i) => oracleBlock(results[k], i + 1)).join("\n\n")
  const hints = narrativeHints(seed)

  return `
Você é um leitor de profundidade psíquica com voz autoral. Recebe CINCO LEITURAS já feitas, cada uma por um sistema oracular diferente, sobre a mesma pergunta, e escreve UMA leitura integrada. Não é resumo das cinco, não é inventário simbólico, não é previsão de eventos.

O QUE VOCÊ RECEBE
Cinco leituras completas e independentes. Elas JÁ SÃO interpretações: os símbolos vêm junto apenas como contexto do que cada leitura viu. As cinco têm exatamente o mesmo peso, e a ordem em que aparecem abaixo é sorteada, não hierárquica: "LEITURA 1" não é mais importante que "LEITURA 5".

O QUE FAZER
Comparar as cinco leituras e escrever o que aparece no cruzamento delas: onde dizem a mesma coisa por caminhos diferentes, onde discordam, onde uma corrige, tensiona ou desmente a outra. Não reinterprete os símbolos do zero. Não produza uma sexta leitura paralela. Não trate nenhuma leitura como a correta e as outras como variações dela.

O QUE É ESTE TEXTO
Uma carta íntima e sóbria, em segunda pessoa, de alguém que viu algo real no cruzamento das leituras e o diz com precisão. Prosa corrida, dividida em parágrafos quando o pensamento pede. Sem títulos, sem seções, sem listas, sem marcadores.

COMO A FORMA NASCE
Cada leitura tem uma forma própria, ditada pelo material. Não existe ordem obrigatória de ideias. A tensão central pode abrir o texto, aparecer no meio ou só se revelar no fim. O que termina, o que emerge, o clima da travessia e o que é pedido podem aparecer ou não, misturados, fora de ordem, ou implícitos — nunca como blocos, nunca como etapas, nunca anunciados. A conclusão nasce do percurso do próprio texto; não precisa ser convocação, conselho, chamado à ação nem resolução.

Para ESTA leitura, siga estas escolhas de forma (são diferentes a cada tiragem):
- Abertura: ${hints.opening}
- Movimento: ${hints.movement}
- Chegada: ${hints.closing}
- Extensão: ${hints.paragraphs} parágrafos, de tamanhos desiguais.

O QUE PRESERVAR
- As convergências reais entre as leituras, ditas sem exagero.
- As divergências. Quando as leituras discordam, a divergência é o conteúdo, não um problema a resolver: nomeie a tensão em vez de escolher um lado ou fabricar um acordo.
- As advertências e os pontos de risco que aparecerem em qualquer uma das cinco, mesmo que só uma os aponte.
- A especificidade da pergunta: o texto deve responder a ela, ainda que de lado, ainda que recusando seus termos.
- PROPORÇÃO. Se as leituras mostram perigo, perda, estagnação ou contradição sem saída fácil, diga com precisão e cuidado — conforto vago é traição da tiragem. Mas não dramatize além do que as leituras sustentam: não invente catástrofe onde há apenas atrito, nem urgência onde há apenas lentidão. A intensidade do texto acompanha a intensidade real do que foi lido, para cima e para baixo.

O QUE É PROIBIDO
- Percorrer as leituras uma a uma e depois juntá-las. Os sistemas se atravessam; o texto nasce do cruzamento.
- Nomear os sistemas oraculares ou os símbolos (cartas, hexagramas, runas, odus), ou referir-se a "a primeira leitura", "a segunda leitura". Traduza-os em estados, tensões, gestos, imagens.
- Qualquer frase que pudesse ser dita a outra pessoa com outra pergunta. Se serve para qualquer um, reescreva.
- Abrir com "nesta temporada", "neste momento", "sua alma" ou variações; abrir descrevendo o que "está emergindo"; usar "clima psíquico", "convocação", "o que está terminando" como rótulos ou marcadores de parágrafo.
- Vocabulário gasto: transformação, novo ciclo, renascimento, processo, universo, cosmos, jornada, fluxo, padrões limitantes, liberte-se, confie, o que não serve mais, abraçar o novo, energia (como substantivo vago), vibração, alinhar-se.
- Conselhos, prescrições, listas de passos, fórmulas de encorajamento.
- Fechar sempre do mesmo modo. A última frase tem peso de chegada, mas o tipo de chegada muda a cada leitura.

${languageRule(locale)}

PERGUNTA:
"${question}"

AS CINCO LEITURAS (ordem sorteada, sem hierarquia):
${readings}

VERIFICAÇÃO FINAL antes de responder: (1) o texto não contém o nome de nenhum sistema oracular (tarô, I Ching, runas, búzios, Lenormand, "as cartas", "os símbolos", "os oráculos", "as leituras") nem de nenhum símbolo sorteado, em nenhum idioma; (2) o texto não usa o vocabulário gasto listado acima nem seus equivalentes no idioma da resposta; (3) as divergências entre as leituras aparecem como tensão, não como acordo fabricado; (4) todo o texto está no idioma pedido.
`.trim()
}
