/**
 * Jornada dos Sonhos: prompt, normalização da resposta e verificador.
 *
 * A síntese entre sonhos NÃO resume os resumos individuais. Ela procura a
 * relação simbólica entre os relatos, na escala que o material permite:
 * com dois sonhos são correspondências, contrastes e hipóteses iniciais (nunca
 * "padrão recorrente"); com três ou mais, o que permanece, muda, ganha ou
 * perde força, e o que a leitura anterior precisa rever.
 *
 * O prompt não traz exemplo de texto, de propósito: o modelo copia exemplos.
 * Zero IA, zero rede neste arquivo.
 */

import { TRACOS } from "@/lib/astro/editorial"
import { LOCALE_META, type Locale } from "@/lib/i18n/config"
import { MAX_CHARS_SONHO, TIPOS_EVOLUCAO, type JornadaV2, type SonhoDaJornada, type TipoEvolucao } from "@/lib/dreams/jornada-estado"
import { removerTracos, sobreposicao } from "@/lib/oracles/sonhos-prompt"

export type AnteriorParaPrompt = { integrated: string; connections: string[] }

/** com dois sonhos: as palavras que o verificador barra, ditas no idioma da saída (a regra em português sozinha não chegava ao texto em inglês) */
const PALAVRAS_CONSOLIDADO: Record<Locale, string> = {
  pt: `"recorrente", "recorrência", "sempre", "toda vez", "repetidamente", "consolidado", "tendência"`,
  en: `"recurring", "recurrent", "recurrence", "always", "every time", "repeatedly", "consolidated", "tendency"`,
  es: `"recurrente", "recurrencia", "siempre", "cada vez", "repetidamente", "consolidado", "tendencia"`,
}

export function montarPromptJornada(
  locale: Locale,
  opts: { n: number; anterior?: AnteriorParaPrompt | null; novosNumeros?: number[] },
): string {
  const { n, anterior, novosNumeros = [] } = opts
  const dois = n === 2

  const escala = dois
    ? `ESCALA: são DOIS sonhos. Esta é uma primeira leitura. Identifique correspondências, contrastes e hipóteses iniciais, com substância e interesse, mas não afirme padrão recorrente, repetição consolidada nem tendência: duas ocorrências não sustentam isso. Fale em "nos dois sonhos", "no primeiro", "no segundo". Não use estas palavras em nenhum campo, nem para descrever uma imagem que aparece nos dois: ${PALAVRAS_CONSOLIDADO[locale]}. Deixe "evolution" como lista vazia.`
    : `ESCALA: são ${n} sonhos. Distinga o que permanece, o que mudou, quais temas ganharam força, quais perderam relevância, quais imagens novas alteram hipóteses anteriores e o que continua incerto. Só registre em "evolution" o que o material sustenta: não é preciso um item de cada tipo, e inventar um tipo para preencher é erro. Uma recorrência só merece esse nome quando aparece em pelo menos três sonhos.`

  const continuidade = anterior
    ? `\n\nLEITURA ANTERIOR (feita antes dos sonhos ${novosNumeros.join(", ") || "novos"}; eles são o material novo). É hipótese a reconsiderar, não verdade estabelecida. Reveja o conjunto inteiro: confirme, ajuste ou abandone cada ponto à luz do que chegou. Não escreva um parágrafo acrescentado ao anterior; reescreva a leitura. Em "evolution", registre como ela mudou.\nLeitura integrada anterior: ${removerTracos(anterior.integrated)}\nConexões anteriores:\n${anterior.connections.map((c) => `- ${removerTracos(c)}`).join("\n")}`
    : ""

  return `Você lê um conjunto de sonhos como material simbólico e arquetípico. Interpreta imagens, não a vida de quem sonhou, e trata toda leitura como hipótese.

O QUE INVESTIGAR (só o que o material sustenta):
- símbolos, imagens e personagens que reaparecem, e como se transformam de um sonho para o outro;
- temas e situações que voltam, e o que muda nas ações e na posição de quem sonha (observa, foge, entra, é conduzido, escolhe);
- semelhanças e diferenças entre os cenários; tensões, contrastes, continuidades possíveis;
- elementos que aparecem uma única vez e mudam a leitura do conjunto.
Estabeleça relações fundamentadas, mesmo quando não óbvias, sempre apoiadas em detalhes que estão nos relatos. Se os sonhos forem diferentes entre si, diga que são diferentes: prefira poucas conexões, ditas como frágeis, a uma conexão fraca apresentada como firme. Nunca crie uma conexão para a narrativa ficar mais interessante.
Quando disser que uma imagem aparece em mais de um sonho, nomeie a imagem exata de CADA sonho e confira nos relatos: imagens parecidas não são a mesma imagem, e uma imagem que falta em um relato não pode ser contada como presente em todos.

${escala}${continuidade}

FORMATO: apenas um objeto JSON com estes campos.
- "timeline": um item por sonho, em ordem cronológica: {"number": número do sonho, "title": título curto e específico da imagem central, "archetypes": as imagens centrais deste sonho separadas por " · ", "summary": 1 a 2 frases sobre a imagem central deste sonho}. Aqui só o sonho isolado; as relações ficam em "connections".
- "connections": lista de ${dois ? "1 a 4" : "3 a 5"} strings simples (não objetos), cada uma uma relação simbólica concreta entre sonhos (2 a 4 frases), citando as imagens e os detalhes dos relatos. Cada texto traz uma relação diferente.
- "evolution": ${dois ? "[]" : `de 2 a 5 itens {"type", "text"} em que type é um de persists, changed, gaining, fading, revised, e text (1 a 2 frases) cita a imagem concreta`}.
- "integrated": a leitura do conjunto em 1 ou 2 parágrafos separados por linha em branco, até 170 palavras, em linguagem de hipótese. Diz o que o conjunto sugere junto, sem repetir as conexões nem os resumos.
- "openQuestions": campo obrigatório, sempre de 2 a 3 itens, nunca vazio, cada item uma string simples. Dizem o que o material ainda não mostra ou o que sonhos futuros poderiam esclarecer. Não são conselhos nem tarefas, e não perguntam sobre a vida desperta da pessoa, nem sobre o que ela sente, nem sobre o que o sonho "significa para ela".

CRITÉRIOS:
- Hipótese simbólica não é fato: "pode sugerir", "uma leitura possível", "parece". Nada de diagnóstico, de previsão, de afirmação categórica sobre a vida da pessoa, nem de "o sonho prova".
- Não reduza os sonhos a ansiedade, medo, bloqueio, trauma ou necessidade de transformação. Não fabrique trajetória de crescimento ou superação que o material não sustenta. Cura e transformação não são garantidas nem necessárias. Descreva mudanças de posição, de ação ou de cenário sem valorá-las: não as chame de progresso, progressão, evolução da pessoa, amadurecimento, avanço, superação nem liberdade crescente.
- Não invente detalhes nem personagens que os relatos não trazem.
- Cada ideia aparece em um campo só. Nada de repetir a mesma coisa com outras palavras.
- Não cite Jung, Freud nem outro autor.
- PONTUAÇÃO: não use travessão nem meia risca em nenhum campo. Use vírgula, dois-pontos ou ponto final.

Idioma de todos os textos do JSON: ${LOCALE_META[locale].promptName}`
}

export function montarMensagemJornada(sonhos: SonhoDaJornada[], locale: Locale): string {
  const lista = sonhos
    .map((d, i) => {
      const data = new Date(d.created_at).toLocaleDateString(LOCALE_META[locale].tag, { day: "2-digit", month: "long", year: "numeric" })
      const texto = d.dream_description.length > MAX_CHARS_SONHO ? `${d.dream_description.slice(0, MAX_CHARS_SONHO)}…` : d.dream_description
      return `Sonho ${i + 1} (${data}):\n"${texto}"`
    })
    .join("\n\n")
  return `Leia estes ${sonhos.length} sonhos em conjunto e devolva o JSON:\n\n${lista}`
}

// ── normalização da resposta do modelo ────────────────────────────────────────

const texto = (v: unknown): string => (typeof v === "string" ? removerTracos(v).trim() : "")
// o modelo às vezes embrulha cada item da lista em {"text": "..."}: aproveita o texto em vez de descartar a resposta
const item = (v: unknown): string => (v && typeof v === "object" ? texto((v as Record<string, unknown>).text) : texto(v))
const lista = (v: unknown, max: number): string[] => (Array.isArray(v) ? v.map(item).filter(Boolean).slice(0, max) : [])

/**
 * Resposta crua do modelo para o formato salvo. Travessão e meia risca são
 * removidos de TODO campo de texto (rede de segurança; o prompt já pede). Os
 * ids dos sonhos vêm do servidor, nunca do modelo. Devolve null quando não há
 * conteúdo aproveitável (a rota trata como falha técnica: não cobra a cota).
 */
export function normalizarJornada(raw: unknown, ctx: { sonhos: SonhoDaJornada[]; locale: Locale }): JornadaV2 | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  const n = ctx.sonhos.length

  const bruto = Array.isArray(r.timeline) ? r.timeline : []
  const timeline = ctx.sonhos.map((_, i) => {
    const t: any = bruto[i] ?? {}
    return { number: i + 1, title: texto(t.title), archetypes: texto(t.archetypes), summary: texto(t.summary) }
  })

  const evolution =
    n >= 3 && Array.isArray(r.evolution)
      ? r.evolution
          .map((e: any) => ({ type: e?.type as TipoEvolucao, text: texto(e?.text) }))
          .filter((e) => TIPOS_EVOLUCAO.includes(e.type) && e.text)
          .slice(0, 5)
      : []

  const connections = lista(r.connections, 5)
  const integrated = texto(r.integrated)
  if (!integrated || connections.length === 0) return null

  return {
    versao: 2,
    locale: ctx.locale,
    dreamIds: ctx.sonhos.map((s) => s.id),
    timeline,
    connections,
    evolution,
    integrated,
    openQuestions: lista(r.openQuestions, 3),
  }
}

// ── verificador ───────────────────────────────────────────────────────────────

const DIAGNOSTICO: Record<Locale, RegExp> = {
  pt: /\b(diagnóstic|transtorno|depress|patolog|síndrome|neurose|psicose|bipolar)\w*/i,
  en: /\b(diagnos|disorder|depress|patholog|syndrome|neurosis|psychosis|bipolar)\w*/i,
  es: /\b(diagnóstic|trastorno|depres|patolog|síndrome|neurosis|psicosis|bipolar)\w*/i,
}
const CATEGORICO: Record<Locale, RegExp> = {
  pt: /\b(prova que|prova de que|comprova|certamente|com certeza|sem dúvida|claramente|obviamente|vai acontecer|acontecerá|você vai)\b/i,
  en: /\b(proves? that|certainly|undoubtedly|clearly|obviously|will happen|you will)\b/i,
  es: /\b(prueba que|ciertamente|sin duda|claramente|obviamente|va a pasar|vas a)\b/i,
}
/** com dois sonhos, estas palavras afirmam o que duas ocorrências não sustentam */
const CONSOLIDADO: Record<Locale, RegExp> = {
  pt: /\b(recorrente|recorrência|sempre|toda vez|repetidamente|consolidad\w*|tendência)\b/i,
  en: /\b(recurring|recurrent|recurrence|always|every time|repeatedly|consolidated|tendency)\b/i,
  es: /\b(recurrente|recurrencia|siempre|cada vez|repetidamente|consolidad\w*|tendencia)\b/i,
}
const REDUCAO: Record<Locale, RegExp> = {
  pt: /\b(ansiedade|medo|bloqueio|trauma|transformação|crescimento|superação|cura)\b/gi,
  en: /\b(anxiety|fear|blockage|trauma|transformation|growth|overcoming|healing)\b/gi,
  es: /\b(ansiedad|miedo|bloqueo|trauma|transformación|crecimiento|superación|curación)\b/gi,
}
const HIPOTESE: Record<Locale, RegExp> = {
  pt: /\b(pode|podem|poderia|talvez|sugere|sugerem|parece|hipótese|possível)\b/i,
  en: /\b(may|might|could|perhaps|suggests?|seems?|hypothesis|possible)\b/i,
  es: /\b(puede|pueden|podría|quizá|sugiere|sugieren|parece|hipótesis|posible)\b/i,
}
/** valorar a mudança como avanço: trajetória de crescimento que o material não sustenta */
const PROGRESSO: Record<Locale, RegExp> = {
  pt: /\b(progress\w*|amadurec\w*|superaç\w*|avanço|evoluç(ão|ões) (na|no|da|do|de|das|dos))/i,
  en: /\b(progress\w*|matur\w*|overcom\w*|advancement|evolution (in|of|toward|towards))/i,
  es: /\b(progres\w*|madur\w*|superaci\w*|avance|evolución (en|de|del|hacia))/i,
}
/** pergunta que puxa a leitura para a vida desperta ou para o sentimento da pessoa */
const VIDA_DESPERTA: Record<Locale, RegExp> = {
  pt: /(vida desperta|vida real|vida cotidiana|na vigília|o que (o sonhador|a pessoa|você) sente|sentimentos? d[oae])/i,
  en: /(waking life|real life|everyday life|dreamer['’]?s (emotions|feelings)|feelings or)/i,
  es: /(vida despierta|vida real|vida cotidiana|vigilia|sentimientos d[eo]l)/i,
}
const AUTORES = /\b(jung|freud|hillman)\b/i

const palavras = (s: string) => s.trim().split(/\s+/).filter(Boolean).length
const raiz = (s: string) =>
  (s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-z]{5,}/g) ?? []).map((w) => w.slice(0, 5))

export function textosDaJornada(j: JornadaV2): string[] {
  return [
    ...j.timeline.flatMap((t) => [t.title, t.archetypes, t.summary]),
    ...j.connections,
    ...j.evolution.map((e) => e.text),
    j.integrated,
    ...j.openQuestions,
  ]
}

export function verificarJornada(j: JornadaV2, sonhos: SonhoDaJornada[], locale: Locale): string[] {
  const v: string[] = []
  const n = sonhos.length
  const todo = textosDaJornada(j).join("\n")

  if (TRACOS.test(todo)) v.push("usa travessão ou meia risca")
  if (j.dreamIds.length !== n || j.dreamIds.some((id, i) => id !== sonhos[i].id)) v.push("ids dos sonhos não batem com o material")
  if (j.timeline.length !== n || j.timeline.some((t) => !t.title || !t.summary)) v.push("linha do tempo incompleta")

  const [cMin, cMax] = n === 2 ? [1, 4] : [3, 5]
  if (j.connections.length < cMin || j.connections.length > cMax) v.push(`${j.connections.length} conexões (esperado de ${cMin} a ${cMax})`)
  if (n === 2 && j.evolution.length > 0) v.push("evolução preenchida com apenas dois sonhos")
  if (n >= 3 && (j.evolution.length < 2 || j.evolution.length > 5)) v.push(`${j.evolution.length} itens de evolução (esperado de 2 a 5)`)
  if (j.openQuestions.length < 2 || j.openQuestions.length > 3) v.push(`${j.openQuestions.length} itens em aberto (esperado de 2 a 3)`)
  if (palavras(j.integrated) > 190) v.push("leitura integrada longa demais")
  if (!HIPOTESE[locale].test(j.integrated)) v.push("leitura integrada sem linguagem de hipótese")

  if (DIAGNOSTICO[locale].test(todo)) v.push("diagnóstico")
  if (CATEGORICO[locale].test(todo)) v.push("afirmação categórica ou previsão")
  if (AUTORES.test(todo)) v.push("cita autor")
  if (n === 2 && CONSOLIDADO[locale].test(todo)) v.push("afirma recorrência ou tendência com apenas dois sonhos")
  if (PROGRESSO[locale].test(todo)) v.push("valora a mudança como progresso ou evolução")
  if (j.openQuestions.some((q) => VIDA_DESPERTA[locale].test(q))) v.push("pergunta em aberto puxa para a vida desperta ou para o sentimento da pessoa")
  if ((todo.match(REDUCAO[locale]) ?? []).length >= 3) v.push("reduz a leitura a medo, bloqueio, trauma ou transformação")

  // repetição entre campos
  const conexoes = j.connections.join("\n")
  const par = (nome: string, a: string, b: string, max: number) => {
    const f = sobreposicao(a, b)
    if (f > max) v.push(`${nome} repete ${(f * 100).toFixed(0)}%`)
  }
  par("leitura integrada contra conexões", j.integrated, conexoes, 0.2)
  par("em aberto contra leitura integrada", j.openQuestions.join("\n"), `${j.integrated}\n${conexoes}`, 0.2)
  j.connections.forEach((c, i) => j.connections.forEach((d, k) => i < k && par(`conexão ${i + 1} contra ${k + 1}`, c, d, 0.3)))
  par("conexões contra resumos", conexoes, j.timeline.map((t) => t.summary).join("\n"), 0.25)

  // ancoragem: cada conexão toca em palavras que estão nos relatos
  const corpo = new Set(raiz(sonhos.map((s) => s.dream_description).join(" ")))
  j.connections.forEach((c, i) => {
    if (!raiz(c).some((r) => corpo.has(r))) v.push(`conexão ${i + 1} sem ancoragem nos relatos`)
  })
  return v
}
