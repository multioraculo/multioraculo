/**
 * Prompt da síntese integrada. Vive fora da rota para ser usado pela segunda
 * etapa da consulta (POST /consultas/sintese), que roda em uma função
 * separada para caber no limite de 60 s por função do Netlify.
 *
 * Princípio: nenhuma estrutura fixa. A forma do texto nasce da tiragem. Para
 * garantir variação real entre leituras, o seed da tiragem escolhe, de modo
 * determinístico, um ponto de partida e um modo de chegada diferentes a cada
 * vez, e o prompt proíbe as fórmulas que se repetiam.
 */
import type { OracleKey } from "./draw"
import { languageRule } from "./language"
import type { Locale } from "@/lib/i18n/config"

export type SynthesisOracle = {
  title: string
  draw: {
    items: Array<{ position?: string; name: string; meaning?: string }>
    notes?: string
  }
}

export type SynthesisInput = Record<OracleKey, SynthesisOracle>

export const ORACLE_ORDER: OracleKey[] = ["tarot", "iching", "runas", "buzios", "lenormand"]

/** Garante a forma mínima dos oráculos recebidos do cliente; devolve null se inválido. */
export function coerceSynthesisInput(raw: unknown): SynthesisInput | null {
  if (!raw || typeof raw !== "object") return null
  const out: Partial<SynthesisInput> = {}
  for (const k of ORACLE_ORDER) {
    const o = (raw as any)[k]
    const items = o?.draw?.items
    if (!o || !Array.isArray(items) || items.length === 0) return null
    out[k] = {
      title: String(o.title || k),
      draw: {
        items: items.slice(0, 12).map((it: any) => ({
          position: it?.position ? String(it.position).slice(0, 80) : undefined,
          name: String(it?.name || "").slice(0, 120),
          meaning: it?.meaning ? String(it.meaning).slice(0, 600) : undefined,
        })),
        notes: o.draw.notes ? String(o.draw.notes).slice(0, 300) : undefined,
      },
    }
  }
  return out as SynthesisInput
}

// ---------------------------------------------------------------------------
// Variação narrativa determinística por seed
// ---------------------------------------------------------------------------

const OPENINGS = [
  "Comece pela tensão mais forte entre dois sistemas que discordam — deixe a contradição aberta antes de qualquer conciliação.",
  "Comece por uma imagem concreta e sensorial que condense o que os símbolos mostram, sem explicá-la de imediato.",
  "Comece pelo que está terminando, em tom baixo, quase descritivo, e só depois deixe aparecer o que se move.",
  "Comece pelo ponto onde a pergunta e a tiragem não coincidem — o que a pessoa perguntou e o que o campo respondeu são coisas diferentes.",
  "Comece pelo detalhe menor e mais estranho da tiragem, aquele que parece não pertencer, e deixe-o organizar o resto.",
  "Comece pelo meio da situação, como quem entra numa conversa já em curso, sem preâmbulo nem apresentação do tema.",
  "Comece pela convergência mais nítida entre os sistemas e questione-a: uma unanimidade também esconde algo.",
  "Comece por uma frase curta e afirmativa sobre a pessoa, não sobre a situação, e desdobre a partir dela.",
]

const MOVEMENTS = [
  "Deixe o texto avançar em espiral: volte duas vezes ao mesmo núcleo, cada vez vendo-o de um ângulo diferente.",
  "Construa o texto como um contraponto: duas linhas de força alternando, sem que uma vença a outra.",
  "Avance de forma linear e sóbria, do mais visível ao mais escondido, sem voltas.",
  "Deixe o texto mudar de andamento no meio: um parágrafo denso e lento, depois um mais rápido e cortante, ou o inverso.",
  "Organize o texto ao redor de uma única pergunta interior que os símbolos formulam e que o texto não responde por completo.",
  "Deixe que um parágrafo desminta parcialmente o anterior, como uma leitura que se corrige enquanto avança.",
]

const CLOSINGS = [
  "Termine em uma imagem, não em uma conclusão.",
  "Termine com a ambiguidade mais honesta da tiragem, nomeada sem resolvê-la.",
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

export function synthesisPrompt(
  question: string,
  results: SynthesisInput,
  locale: Locale,
  seed: string
): string {
  const rawSymbols = ORACLE_ORDER.map((k) => {
    const r = results[k]
    const items = r.draw.items
      .slice(0, 12)
      .map((it) => {
        let s = it.name
        if (it.position) s = `${it.position}: ${s}`
        if (it.meaning) s += ` (${it.meaning})`
        return s
      })
      .join(" · ")
    const notes = r.draw.notes ? ` [${r.draw.notes}]` : ""
    return `${r.title} — ${items}${notes}`
  }).join("\n")

  const hints = narrativeHints(seed)

  return `
Você é um leitor de profundidade psíquica com voz autoral. Recebe os símbolos brutos de uma consulta a cinco oráculos e escreve UMA leitura integrada, escrita para esta pergunta, para esta combinação de símbolos e para as tensões particulares entre eles. Não é resumo dos oráculos, não é inventário simbólico, não é previsão de eventos.

O QUE É ESTE TEXTO
Uma carta íntima e sóbria, em segunda pessoa, de alguém que viu algo real no campo simbólico e o diz com precisão. Prosa corrida, dividida em parágrafos quando o pensamento pede. Sem títulos, sem seções, sem listas, sem marcadores.

COMO A FORMA NASCE
Cada leitura tem uma forma própria, ditada pelo material. Não existe ordem obrigatória de ideias. A tensão central pode abrir o texto, aparecer no meio ou só se revelar no fim. O que termina, o que emerge, o clima da travessia e o que é pedido podem aparecer ou não, misturados, fora de ordem, ou implícitos — nunca como blocos, nunca como etapas, nunca anunciados. A conclusão nasce do percurso do próprio texto; não precisa ser convocação, conselho, chamado à ação nem resolução.

Para ESTA leitura, siga estas escolhas de forma (são diferentes a cada tiragem):
- Abertura: ${hints.opening}
- Movimento: ${hints.movement}
- Chegada: ${hints.closing}
- Extensão: ${hints.paragraphs} parágrafos, de tamanhos desiguais.

O QUE PRESERVAR
- As nuances, ambiguidades e contradições entre os cinco sistemas. Quando eles divergem, a divergência é o conteúdo, não um problema a resolver.
- As convergências reais, ditas sem exagero.
- A especificidade da pergunta: o texto deve responder a ela, ainda que de lado, ainda que recusando seus termos.
- O peso real do que saiu: se os símbolos mostram perigo, perda, estagnação, contradição sem saída fácil, diga com precisão e cuidado. Conforto vago é traição da tiragem. Leituras não precisam ser positivas nem conclusivas.

O QUE É PROIBIDO
- Interpretar cada oráculo em sequência e depois juntá-los. Os sistemas se atravessam; o texto nasce do cruzamento.
- Nomear os sistemas oraculares ou os símbolos (cartas, hexagramas, runas, odus). Traduza-os em estados, tensões, gestos, imagens.
- Qualquer frase que pudesse ser dita a outra pessoa com outra pergunta. Se serve para qualquer um, reescreva.
- Abrir com "nesta temporada", "neste momento", "sua alma" ou variações; abrir descrevendo o que "está emergindo"; usar "clima psíquico", "convocação", "o que está terminando" como rótulos ou marcadores de parágrafo.
- Vocabulário gasto: transformação, novo ciclo, renascimento, processo, universo, cosmos, jornada, fluxo, padrões limitantes, liberte-se, confie, o que não serve mais, abraçar o novo, energia (como substantivo vago), vibração, alinhar-se.
- Conselhos, prescrições, listas de passos, fórmulas de encorajamento.
- Fechar sempre do mesmo modo. A última frase tem peso de chegada, mas o tipo de chegada muda a cada leitura.

${languageRule(locale)}

PERGUNTA:
"${question}"

CAMPO SIMBÓLICO (use apenas estes dados; não repita os nomes dos símbolos no texto):
${rawSymbols}

VERIFICAÇÃO FINAL antes de responder: (1) o texto não contém o nome de nenhum sistema oracular (tarô, I Ching, runas, búzios, Lenormand, "as cartas", "os símbolos", "os oráculos") nem de nenhum símbolo sorteado, em nenhum idioma; (2) o texto não usa o vocabulário gasto listado acima nem seus equivalentes no idioma da resposta; (3) todo o texto está no idioma pedido.
`.trim()
}
