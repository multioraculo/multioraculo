/**
 * Síntese C-base-min.
 *
 * A síntese lê o RESULTADO BRUTO dos cinco sorteios (itens, posições,
 * orientação, fatos do método e trechos de referência por item), nunca as
 * interpretações individuais. É o prompt C-base da fase de testes, copiado
 * literalmente, com as duas linhas aprovadas no teste de variância: nomes
 * técnicos fora do texto final e a checagem 10 (nomes e bastidor).
 *
 * TEXTO CONGELADO. Qualquer mudança aqui, inclusive de espaço ou pontuação,
 * muda o prompt que foi avaliado. As regras editoriais (pesos, M1–M4,
 * escolhas de estilo por seed, idioma e checagem 1–9) continuam vindo de
 * synthesisPrompt, recortadas como no teste.
 */
import { synthesisOrder, synthesisPrompt, type SynthesisInput } from "./synthesis"
import type { AllDraws, OracleKey } from "./draw"
import type { RenderedDraw } from "./localize"
import type { Evidence } from "./evidence"
import type { Locale } from "@/lib/i18n"

export type CBaseMinMaterial = Record<
  OracleKey,
  { method: string; items: Array<{ position?: string; name: string }>; facts: Record<string, unknown>; evidence: Evidence[] }
>

// method_facts: só o que o sorteio diz, calculado em código
const SUITS = ["Copas", "Espadas", "Paus", "Ouros"]
export function methodFacts(k: OracleKey, d: AllDraws, r: RenderedDraw): Record<string, unknown> {
  if (k === "tarot") return { cartas: r.items.length, arcanos_maiores: d.tarot.meta.majors, invertidas: d.tarot.meta.reversed, naipe_dominante: d.tarot.meta.dominantSuit == null ? null : SUITS[d.tarot.meta.dominantSuit] }
  if (k === "iching") return { hexagrama_principal: d.iching.meta.primary, linhas_mutantes: d.iching.meta.moving, hexagrama_resultante: d.iching.meta.resulting, sem_mutacao: d.iching.meta.moving.length === 0 }
  if (k === "runas") return { runas: r.items.length, invertidas: d.runas.meta.reversed }
  if (k === "buzios") return { primeira_queda_abertos: d.buzios.meta.first, segunda_queda_abertos: d.buzios.meta.second, mesmo_odu_nas_duas: d.buzios.meta.first === d.buzios.meta.second }
  return { carta_central: r.items[4]?.name ?? null, cartas: r.items.length }
}
const factsText = (f: Record<string, unknown>) => Object.entries(f).map(([a, b]) => `${a}: ${Array.isArray(b) ? `[${b.join(", ")}]` : b}`).join(" · ")

/** Regras editoriais e checagem 1–9 do prompt de síntese, recortadas como no teste. */
function sharedRules(question: string, material: CBaseMinMaterial, locale: Locale, seed: string) {
  // o recorte não inclui leituras: basta um material mínimo para montar o texto
  const dummy = Object.fromEntries(
    Object.entries(material).map(([k, m]) => [k, { title: k, draw: { items: m.items }, reading: "" }])
  ) as unknown as SynthesisInput
  const full = synthesisPrompt(question, dummy, locale, seed)
  const regras = full.slice(full.indexOf("COMO PESAR OS SINAIS"), full.indexOf("PERGUNTA:"))
  const checagem = full.slice(full.indexOf("CHECAGEM ANTES DE ENVIAR"))
  return { regras, checagem }
}

const NAME_TAG = (i: number) => `SISTEMA ${i}`

/** Linha acrescentada à checagem (C-base-min). */
const CHECK_NAMES_AND_BACKSTAGE =
  "\n10. NOMES E BASTIDOR. O texto cita algum sistema, carta, runa, hexagrama ou número de hexagrama, Odu, Orixá ou posição? Repete ou adapta alguma instrução deste pedido, fala de si mesmo, da sua estrutura ou da pergunta como objeto, ou atribui o que diz a leituras, sinais, símbolos, sorteio ou material? Reescreva afirmando só a situação."

export function cbaseMinSynthesisPrompt(question: string, material: CBaseMinMaterial, locale: Locale, seed: string): string {
  const { regras, checagem } = sharedRules(question, material, locale, seed)
  const order = synthesisOrder(seed)
  const blocks = order.map((k, i) => {
    const c = material[k]
    const refs = c.evidence
      .filter((e) => typeof e.itemIndex === "number")
      .slice(0, 10)
      .map((e) => `  [item ${(e.itemIndex as number) + 1}] (${e.source}) ${e.excerpt.replace(/\s+/g, " ").slice(0, 320)}`)
    return [
      NAME_TAG(i + 1),
      `método: ${c.method}`,
      `itens (posição: símbolo, orientação quando houver):`,
      ...c.items.map((it, j) => `  ${j + 1}. ${it.position}: ${it.name}`),
      `fatos do método: ${factsText(c.facts)}`,
      refs.length ? `trechos de referência associados aos itens:\n${refs.join("\n")}` : "trechos de referência: nenhum encontrado para estes itens",
    ].join("\n")
  }).join("\n\n")
  return `
Você é um leitor de profundidade psíquica com voz autoral e domínio técnico de cinco sistemas oraculares. Recebe o RESULTADO BRUTO de cinco sorteios independentes sobre a mesma pergunta e escreve UMA leitura integrada. Não é resumo, não é inventário simbólico, não é previsão de eventos.

O QUE VOCÊ RECEBE
Para cada sistema: os itens efetivamente sorteados, suas posições e orientação, fatos objetivos do método e trechos das referências tradicionais associados a cada item. Você NÃO recebe nenhuma interpretação pronta. Os cinco sistemas têm o mesmo peso; a ordem é sorteada. Os nomes dos sistemas, das cartas, runas, hexagramas (e seus números), Odus, Orixás e posições são material de trabalho e não aparecem no texto final.

ANTES DE ESCREVER (análise interna, em duas etapas; nada disso vai para o texto)
ETAPA 1 — O QUE CADA SORTEIO SUSTENTA. Um sistema de cada vez, sem ainda sintetizar e sem usar a pergunta como prova. A partir apenas dos itens, posições, orientação, fatos do método, trechos de referência e do sentido tradicional de cada símbolo naquele método, identifique: a dinâmica central que o sorteio sustenta; se ela ganha força, perde força, permanece, se reorganiza, encerra, começa, se divide ou não indica direção; a tensão, se houver; o que no próprio sorteio enfraquece essa dinâmica, se houver; e quão diretamente cada coisa é sustentada (sentido central do símbolo, combinação, ou inferência). Não force tensão, contra-sinal nem direção que o sorteio não mostre. Registre também se o que a pergunta dá por certo é sustentado, contradito ou simplesmente não abordado pelos itens.
ETAPA 2 — COMPARAÇÃO. Só agora ponha os cinco lado a lado: onde convergem de fato, onde em parte, onde divergem, o que é secundário, o que fica em aberto. A resposta nasce dessa comparação.

${regras}
PERGUNTA (CONTEXTO — NÃO É EVIDÊNCIA):
"${question}"

MATERIAL RECEBIDO (ordem sorteada, sem hierarquia):
${blocks}

${checagem}`.trim() + CHECK_NAMES_AND_BACKSTAGE
}
