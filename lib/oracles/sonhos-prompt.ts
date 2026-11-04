/**
 * Interpretação de sonhos: prompt, contenção de pontuação e verificador.
 *
 * Três coisas num lugar só, para a rota e os testes lerem a mesma fonte:
 *
 *  1. `montarPromptSonho`: cada seção tem UMA função (ninguém repete o que a
 *     anterior já disse) e o prompt não contém o caractere proibido nem como
 *     exemplo, porque o modelo copia exemplos.
 *  2. `criarGuardaTracos`: rede de segurança sobre o stream. O prompt reduz,
 *     mas não garante; um texto que já saiu do servidor não volta para
 *     regeneração. Só age sobre o texto gerado, nunca sobre o HTML.
 *  3. `verificarInterpretacaoSonho`: estrutura, travessão e repetição entre
 *     seções. Zero IA, zero rede.
 */

import { TRACOS } from "@/lib/astro/editorial"
import type { Locale } from "@/lib/i18n/config"

export type SecaoSonho = "introducao" | "simbolos" | "dinamica" | "sintese" | "perguntas"

export const ORDEM_SECOES: SecaoSonho[] = ["introducao", "simbolos", "dinamica", "sintese", "perguntas"]

/** Títulos exatos por idioma: o prompt os dita e o verificador os procura. */
export const TITULOS_SONHO: Record<Locale, Record<SecaoSonho, string>> = {
  pt: {
    introducao: "INTRODUÇÃO",
    simbolos: "SÍMBOLOS PRINCIPAIS",
    dinamica: "DINÂMICA PSÍQUICA",
    sintese: "SÍNTESE",
    perguntas: "PERGUNTAS PARA REFLEXÃO",
  },
  en: {
    introducao: "INTRODUCTION",
    simbolos: "MAIN SYMBOLS",
    dinamica: "PSYCHIC DYNAMICS",
    sintese: "SYNTHESIS",
    perguntas: "QUESTIONS FOR REFLECTION",
  },
  es: {
    introducao: "INTRODUCCIÓN",
    simbolos: "SÍMBOLOS PRINCIPALES",
    dinamica: "DINÁMICA PSÍQUICA",
    sintese: "SÍNTESIS",
    perguntas: "PREGUNTAS PARA LA REFLEXIÓN",
  },
}

/** Limites que o prompt pede e o verificador confere. */
export const LIMITES_SONHO = {
  introFrases: 2,
  sinteseMin: 2,
  sinteseMax: 3,
  sintesePalavrasPorPonto: 36,
  perguntas: 2,
  /** fração máxima dos trechos de 4 palavras de uma seção que podem reaparecer em outra */
  repeticaoMax: 0.2,
}

export function montarPromptSonho(locale: Locale): string {
  const t = TITULOS_SONHO[locale]
  const L = LIMITES_SONHO
  return `Você é um intérprete de simbolismo onírico de orientação arquetípica. Trata o sonho como um drama psíquico: cada figura, lugar e objeto é personagem ou cenário de uma cena interior. Toda imagem é lida em DOIS PLANOS ao mesmo tempo:
- o plano UNIVERSAL: o papel que esse motivo costuma ter em mitos, contos, rituais e na imaginação coletiva (o traidor, o mensageiro, o duplo, o rival, o limiar, a água, a casa, o animal ferido, o guia, a sombra, a ferida);
- o plano PARTICULAR: o que a imagem faz NESTE sonho, no detalhe relatado.
Interpretar é deixar um plano iluminar o outro. A leitura é hipótese simbólica, nunca prova de nada sobre a vida da pessoa.

Quando o relato for uma fala transcrita, com hesitações e repetições, ignore o ruído e leia as imagens e as ações.

FORMATO: Markdown, com exatamente estas cinco seções, nesta ordem, com estes títulos (já no idioma da resposta):

## ${t.introducao}
## ${t.simbolos}
## ${t.dinamica}
## ${t.sintese}
## ${t.perguntas}

Cada seção cumpre uma função diferente. Uma ideia aparece em UMA seção só; nas demais ela pode ser apenas pressuposta, nunca repetida com outras palavras.

## ${t.introducao}
Até ${L.introFrases} frases. Apresente o conflito ou a imagem central ESPECÍFICA deste sonho. Não antecipe as conclusões da análise.

## ${t.simbolos}
De 3 a 5 símbolos, só os que aparecem no relato (figuras, lugares, objetos, ações). Numere-os na ordem em que aparecem, cada título em negrito numa linha própria: **1. nome do símbolo**, depois **2. nome do símbolo**, e assim por diante (escreva os números de verdade). Sob cada título, 3 a 4 frases: primeiro o plano universal (que papel esse motivo costuma ter no imaginário coletivo, dito em uma frase viva, não como verbete), depois o plano particular (como ele aparece AQUI e o que o detalhe muda), e, se houver, a ambiguidade que fica. Objetos modernos (rede social, celular, tela) leem-se pela função que cumprem na cena (olhar, espelho, janela, mensageiro), nunca como comentário sobre a época. Não retome a ideia central da introdução.

## ${t.dinamica}
É a parte mais funda do texto. Uma linha em negrito com um subtítulo descritivo e depois 2 a 3 parágrafos. Analise a RELAÇÃO entre as imagens: a sequência dos acontecimentos, as tensões, o momento em que algo muda. Nomeie o movimento psíquico em termos arquetípicos (descida, limiar, confronto com a sombra, ferida, perda de uma projeção, retorno, separação, encontro com um duplo, entre outros que o sonho sustentar). Não redefina símbolos já tratados: parta deles e mostre o que acontece entre eles.

## ${t.sintese}
Só uma lista de ${L.sinteseMin} a ${L.sinteseMax} pontos, uma frase cada. Cada ponto NOMEIA um motivo ou movimento arquetípico do sonho e diz o que ele faz ali; não é uma moral nem uma lição. Não recapitule a introdução, a dinâmica nem os significados individuais. Sem parágrafo, sem frase de abertura.

## ${t.perguntas}
Exatamente ${L.perguntas} perguntas, em lista, sobre as IMAGENS e sobre o que o sonho deixa em aberto (o que uma figura quer, o que um objeto esconde, o que a cena não resolve). Cada uma cita ou depende de um detalhe do sonho. Escreva-as sem se dirigir à pessoa: nada de "você", "seu", "sua", "para você". Proibido perguntar sobre a vida da pessoa, sobre como ela "lida" com algo, sobre sua relação com alguém, sobre suas experiências ou sobre o que o sonho "revela sobre ela". Não repita a síntese e não escreva parágrafo de fechamento.

CRITÉRIOS:
- Hipótese simbólica ("pode", "sugere", "uma leitura possível"), nunca fato sobre a vida da pessoa. Não diagnostique, não diga que o sonho prova algo, não diga o que a pessoa "precisa" fazer.
- Não atribua sentimentos, motivos ou intenções que o relato não traz. Se o relato diz o que a pessoa sentiu ou pensou, você pode usar; do contrário, descreva só o que as imagens fazem.
- Fale do sonho e das figuras dele ("no sonho", "a figura do marido"). Para nomear quem sonha, use "quem sonha". Nunca "a protagonista", "o sonhador" nem "a personagem".
- Cura, transformação ou crescimento não são garantidos nem necessários: não os prometa e não diga que um passo é necessário, essencial ou importante para o crescimento, a cura, a individuação ou o autoconhecimento.
- Não invente detalhes. Se algo é ambíguo, diga que é ambíguo.
- Profundo e específico: entre 800 e 1100 palavras no total.
- Não cite Jung, Freud nem outro autor. O vocabulário arquetípico é bem-vindo; a citação de autoria não.
- PONTUAÇÃO: não use travessão nem meia risca em nenhum lugar do texto. Para separar um aposto ou uma pausa use vírgula, dois-pontos ou ponto final. Em listas, use hífen simples.`
}

// ── rede de segurança sobre o stream ──────────────────────────────────────────

/**
 * Troca travessão e meia risca por vírgula (ou nada, no começo de linha),
 * respeitando o espaço em volta, mesmo quando o caractere e os espaços chegam
 * em pedaços diferentes do stream. Entre dígitos (2–3) vira hífen.
 * Chame `empurrar(pedaço)` a cada chunk e `encerrar()` no fim.
 */
export function criarGuardaTracos() {
  // cauda do chunk anterior (espaços e/ou um traço), retida até saber o que vem depois
  let retido = ""
  let ultimo = "\n" // último caractere emitido ("\n" = começo de texto)

  const normalizar = (texto: string, antesDoTexto: string): string =>
    texto.replace(new RegExp(`[ \\t]*(?:${TRACOS.source})[ \\t]*`, "g"), (m, off: number, todo: string) => {
      const antes = off === 0 ? antesDoTexto : todo[off - 1]
      const depois = todo[off + m.length]
      if (/\d/.test(antes) && depois && /\d/.test(depois)) return "-"
      if (antes === "\n") return ""
      return ", "
    })

  function empurrar(chunk: string): string {
    let texto = retido + chunk
    const cauda = texto.match(new RegExp(`[ \\t]*(?:${TRACOS.source})?[ \\t]*$`))![0]
    retido = cauda
    texto = texto.slice(0, texto.length - cauda.length)
    const saida = normalizar(texto, ultimo)
    if (saida) ultimo = saida[saida.length - 1]
    return saida
  }

  function encerrar(): string {
    const resto = retido
    retido = ""
    // traço pendurado no fim do texto não tem o que separar: some
    return TRACOS.test(resto) ? "" : resto
  }

  return { empurrar, encerrar }
}

/** Atalho para texto inteiro (testes e dados já gravados). */
export function removerTracos(texto: string): string {
  const g = criarGuardaTracos()
  return g.empurrar(texto) + g.encerrar()
}

// ── verificador ───────────────────────────────────────────────────────────────

const PALAVRAS = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-z0-9]+/g) ?? []

/** trechos de 4 palavras consecutivas, para medir repetição de frase, não de vocabulário */
function trechos(s: string, n = 4): Set<string> {
  const p = PALAVRAS(s)
  const out = new Set<string>()
  for (let i = 0; i + n <= p.length; i++) out.add(p.slice(i, i + n).join(" "))
  return out
}

/** fração dos trechos de `a` que também existem em `b` */
export function sobreposicao(a: string, b: string): number {
  const ta = trechos(a)
  if (ta.size === 0) return 0
  const tb = trechos(b)
  let n = 0
  for (const x of ta) if (tb.has(x)) n++
  return n / ta.size
}

export function dividirSecoes(texto: string, locale: Locale): Partial<Record<SecaoSonho, string>> {
  const out: Partial<Record<SecaoSonho, string>> = {}
  const partes = texto.split(/^##\s+/m).slice(1)
  for (const parte of partes) {
    const nl = parte.indexOf("\n")
    const titulo = (nl < 0 ? parte : parte.slice(0, nl)).trim()
    const corpo = nl < 0 ? "" : parte.slice(nl + 1).trim()
    const chave = ORDEM_SECOES.find((k) => TITULOS_SONHO[locale][k] === titulo)
    if (chave) out[chave] = corpo
  }
  return out
}

const frases = (s: string) => s.split(/[.!?…]+(?:\s+|$)/).map((x) => x.trim()).filter(Boolean)
const itens = (s: string) => s.split("\n").filter((l) => /^\s*[-*•]\s+/.test(l)).map((l) => l.replace(/^\s*[-*•]\s+/, "").trim())

// ── registro arquetípico e defeitos da versão rasa (pegos na comparação com o modelo real) ──
const SEGUNDA_PESSOA: Record<Locale, RegExp> = {
  pt: /(^|[^\p{L}])(você|vocês|teu|tua|teus|tuas)(?![\p{L}])/iu,
  en: /(^|[^\p{L}])(you|your|yours)(?![\p{L}])/iu,
  es: /(^|[^\p{L}])(tú|usted|ustedes|tu|tus)(?![\p{L}])/iu,
}
const VIDA_DA_PESSOA: Record<Locale, RegExp> = {
  pt: /(lida|lidar|em sua vida|na vida|revela sobre|relação com|experiências)/i,
  en: /(cope|deal with|in life|reveal about|relationship with|experiences)/i,
  es: /(lidia|lidiar|afrontar|en la vida|revela sobre|relación con|experiencias)/i,
}
const TERCEIRA_PESSOA: Record<Locale, RegExp> = {
  pt: /(^|[^\p{L}])(a protagonista|o protagonista|o sonhador|a sonhadora|a personagem)(?![\p{L}])/iu,
  en: /(^|[^\p{L}])(the protagonist|the character)(?![\p{L}])/iu,
  es: /(^|[^\p{L}])(la protagonista|el protagonista|el soñador|la soñadora|el personaje)(?![\p{L}])/iu,
}
const CRESCIMENTO_NECESSARIO: Record<Locale, RegExp> = {
  pt: /(necessári[oa]|essencial|fundamental|importante) para (o |a )?(crescimento|autoconhecimento|cura|individuação|integração)/i,
  en: /(necessary|essential|crucial|important) for (personal )?(growth|self-knowledge|healing|individuation|integration)/i,
  es: /(necesari[oa]|esencial|fundamental|importante) para (el |la )?(crecimiento|autoconocimiento|curación|individuación|integración)/i,
}
/** palavras que marcam a leitura simbólica em termos de motivo universal; o prompt as pede */
const VOCABULARIO_ARQUETIPICO: Record<Locale, RegExp> = {
  pt: /(arquétip\w*|sombra|limiar|duplo|mito\w*|imaginário coletivo|imaginação coletiva|figura de guia|mensageir\w*|rival|projeção|descida|travessia|psíquic\w*)/gi,
  en: /(archetyp\w*|shadow|threshold|double|myth\w*|collective imagination|collective imaginary|guide|messenger|rival|projection|descent|crossing|psychic)/gi,
  es: /(arquetíp\w*|sombra|umbral|doble|mito\w*|imaginario colectivo|imaginación colectiva|figura de guía|mensajer\w*|rival|proyección|descenso|travesía|psíquic\w*)/gi,
}
const MIN_VOCABULARIO_ARQUETIPICO = 3

export function verificarInterpretacaoSonho(texto: string, locale: Locale): string[] {
  const v: string[] = []
  const L = LIMITES_SONHO

  if (TRACOS.test(texto)) v.push("usa travessão ou meia risca")

  const titulos = (texto.match(/^##\s+.+$/gm) ?? []).map((l) => l.replace(/^##\s+/, "").trim())
  const esperado = ORDEM_SECOES.map((k) => TITULOS_SONHO[locale][k])
  if (titulos.join("|") !== esperado.join("|")) {
    v.push(`seções fora do formato (esperado: ${esperado.join(" > ")})`)
    return v
  }
  const s = dividirSecoes(texto, locale) as Record<SecaoSonho, string>

  if (frases(s.introducao).length > L.introFrases) v.push(`introdução com mais de ${L.introFrases} frases`)

  // títulos em negrito numa linha própria (a numeração é pedida, mas o modelo pequeno às vezes a omite)
  const simbolos = (s.simbolos.match(/^\*\*[^*\n]+\*\*\s*$/gm) ?? []).length
  if (simbolos < 3 || simbolos > 5) v.push(`símbolos principais: ${simbolos} (esperado de 3 a 5)`)

  if (!/^\*\*[^*]+\*\*\s*$/m.test(s.dinamica)) v.push("dinâmica sem subtítulo em negrito")

  const pontos = itens(s.sintese)
  if (pontos.length < L.sinteseMin || pontos.length > L.sinteseMax) v.push(`síntese com ${pontos.length} pontos (esperado ${L.sinteseMin} a ${L.sinteseMax})`)
  if (s.sintese.split("\n").some((l) => l.trim() && !/^\s*[-*•]\s+/.test(l))) v.push("síntese com texto fora da lista de pontos")
  if (pontos.some((p) => PALAVRAS(p).length > L.sintesePalavrasPorPonto)) v.push("ponto da síntese longo demais")

  const perguntas = itens(s.perguntas)
  if (perguntas.length !== L.perguntas) v.push(`${perguntas.length} perguntas (esperado ${L.perguntas})`)
  if (perguntas.some((p) => !/[?]$/.test(p))) v.push("pergunta que não termina em interrogação")
  if (perguntas.some((p) => SEGUNDA_PESSOA[locale].test(p))) v.push("pergunta dirigida à pessoa (você, seu, sua)")
  if (perguntas.some((p) => VIDA_DA_PESSOA[locale].test(p))) v.push("pergunta sobre a vida ou a relação da pessoa")
  if (TERCEIRA_PESSOA[locale].test(texto)) v.push("fala de quem sonha como protagonista, sonhador ou personagem")
  if (CRESCIMENTO_NECESSARIO[locale].test(texto)) v.push("diz que um passo é necessário para crescimento, cura ou autoconhecimento")
  const corpoSimbolico = [s.simbolos, s.dinamica, s.sintese].join("\n")
  const arq = (corpoSimbolico.match(VOCABULARIO_ARQUETIPICO[locale]) ?? []).length
  if (arq < MIN_VOCABULARIO_ARQUETIPICO) v.push(`vocabulário arquetípico insuficiente (${arq}, esperado ao menos ${MIN_VOCABULARIO_ARQUETIPICO})`)
  if (s.perguntas.split("\n").some((l) => l.trim() && !/^\s*[-*•]\s+/.test(l))) v.push("perguntas com texto fora da lista (parágrafo de fechamento)")

  // repetição: cada seção contra todo o resto
  for (const k of ORDEM_SECOES) {
    const resto = ORDEM_SECOES.filter((o) => o !== k).map((o) => s[o]).join("\n")
    const f = sobreposicao(s[k], resto)
    if (f > L.repeticaoMax) v.push(`"${TITULOS_SONHO[locale][k]}" repete ${(f * 100).toFixed(0)}% de outras seções`)
  }
  return v
}
