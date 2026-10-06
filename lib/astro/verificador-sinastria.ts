/**
 * O verificador ESTRUTURAL da sinastria.
 *
 * Confere o que dá para garantir por código sobre um texto que fala de dois
 * mapas, e só isso. Não existe ainda prompt nem síntese: o formato abaixo é o
 * mínimo para o verificador trabalhar (afirmações com os ids dos fatos que as
 * sustentam, mais o texto corrido), e muda quando a síntese for decidida.
 *
 * O QUE ELE GARANTE
 *  1. toda afirmação declara fatos que existem;
 *  2. nenhum aspecto inexistente entre dois corpos citados na mesma frase, e
 *     nenhum dono trocado (a Lua de A com Saturno de B não é Saturno de A com a
 *     Lua de B);
 *  3. vocabulário fechado para ângulos e casas: Ascendente, Meio do Céu e
 *     "casa N" só aparecem se um fato os sustenta, o que elimina qualquer
 *     menção quando a hora é desconhecida;
 *  4. a Lua de quem tem signo ambíguo e o corpo de retrogradação indeterminada
 *     não são ditos como certos;
 *  5. nenhuma condição natal (dignidade, aflição) é afirmada: o motor não a
 *     calcula;
 *  6. nenhum veredito, índice, previsão, conselho, karma nem "benéfico";
 *  7. quando existem aspectos harmônicos E discordantes, o texto cita pelo menos
 *     um de cada. É presença, não votação: a contagem nunca decide nada.
 *
 * O QUE ELE NÃO GARANTE, e só um leitor (ou uma segunda leitura) pega:
 *  - fatalismo escrito sem verbo no futuro ("essa relação carrega um atrito de
 *    base");
 *  - promessa escrita sem marca ("esse trígono garante afeto");
 *  - causalidade sem "porque" ("a Lua dela quadra Saturno dele e ele a faz
 *    sentir-se criticada");
 *  - compatibilidade global dita de outro jeito ("é uma relação que funciona");
 *  - frase com mais de dois corpos: a regra 2 só confere frases com exatamente
 *    dois, porque com três não dá para saber qual par a frase afirma;
 *  - a qualidade da interpretação.
 */
import type { Locale } from "@/lib/i18n/config"
import { CONSELHO, FALSA_PRECISAO, PREVISAO, PROIBIDAS, TRACOS } from "./editorial"
import { ASPECTOS, CORPOS, SIGNOS } from "./nomes"
import { CORPOS_MAPA } from "./mapa"
import type { ResultadoSinastria } from "./sinastria"

export type AfirmacaoSinastria = { texto: string; fatos: string[] }
export type TextoSinastria = { afirmacoes: AfirmacaoSinastria[]; sintese: string }

/**
 * Duas categorias. `violacoes` são HARD FAIL: fidelidade e segurança (dono trocado, aspecto que não existe, veredito,
 * previsão, conselho inequívoco, diagnóstico). `avisos` são WARNING EDITORIAL: preferência de estilo ou de vocabulário,
 * sem risco semântico. Só as violações reprovam.
 */
export type VereditoSinastria = { ok: true; avisos: string[] } | { ok: false; violacoes: string[]; avisos: string[] }

/** Como o texto chama cada pessoa. Sem isso o dono não é verificável e a regra 2 confere só o par. */
export type Donos = { A: string[]; B: string[] }

const ANGULOS: Record<Locale, Record<string, string>> = {
  pt: { asc: "Ascendente", mc: "Meio do Céu" },
  en: { asc: "Ascendant", mc: "Midheaven" },
  es: { asc: "Ascendente", mc: "Medio Cielo" },
}

const VEREDITO: Record<Locale, RegExp> = {
  pt: /(compatibilidade|compat[ií]ve(l|is)|incompat[ií]ve(l|is)|n[ãa]o combinam|combinam|\bmatch\b|alma g[êe]mea|almas g[êe]meas|feitos? um para o outro|rela[çc][ãa]o perfeita|\d+\s?%|por cento|para sempre|vai durar|n[ãa]o vai durar)/i,
  en: /(compatib\w*|incompatib\w*|a match|meant to be|soul ?mates?|perfect relationship|\d+\s?%|per ?cent|forever|will last|won't last)/i,
  es: /(compatibilidad|compatibles?|incompatibles?|no combinan|combinan|alma gemela|almas gemelas|hechos el uno para el otro|relaci[óo]n perfecta|\d+\s?%|por ciento|para siempre|va a durar|no va a durar)/i,
}

/** Conselho escrito com verbo de dever, que a lista editorial não cobre. */
const CONSELHO_EXTRA: Record<Locale, RegExp> = {
  pt: /(^|[^\p{L}])(deveria|deveriam|devia|devem|deve|precisam?|é preciso|é necessário|o ideal (seria|é)|o melhor (seria|é)|vale a pena|convém|tente|tentem|evite|evitem|procure|procurem)($|[^\p{L}])/iu,
  en: /\b(should|ought to|need to|needs to|it is best to|the best (thing )?is|try to|avoid|make sure)\b/i,
  es: /(^|[^\p{L}])(deber[ií]a|deber[ií]an|deben|debe|necesitan?|es necesario|lo ideal (ser[ií]a|es)|lo mejor (ser[ií]a|es)|conviene|intenta|intenten|evita|eviten|procura|procuren)($|[^\p{L}])/iu,
}

/** Karma e vidas passadas: o produto não afirma isso como fato. HARD. */
const KARMA: Record<Locale, RegExp> = {
  pt: /(k[aá]rm\w*|carma|encarna\w*|vidas? passadas?)/i,
  en: /(k[aá]rm\w*|reincarnat\w*|past lives?)/i,
  es: /(k[aá]rm\w*|carma|encarna\w*|vidas? pasadas?)/i,
}

/** Vocabulário avaliativo herdado (benéfico, maléfico, "beneficiar"): preferência editorial, sem risco semântico. WARNING. */
const AVALIATIVO: Record<Locale, RegExp> = {
  pt: /(ben[ée]fic\w*|mal[ée]fic\w*)/i,
  en: /(benefic\w*|malefic\w*)/i,
  es: /(ben[ée]fic\w*|mal[ée]fic\w*)/i,
}

/**
 * Entre as expressões de `PROIBIDAS`, as que são só clichê ou preferência de estilo, herdadas dos outros oráculos.
 * Casaram aqui, viram WARNING. O que não casa (previsão, sorte e azar, diagnóstico, autores, estereótipo de signo,
 * causalidade) continua HARD. Na dúvida, fica HARD: a lista só cresce com expressão sem risco semântico.
 */
const EDITORIAL_LEVE: Record<Locale, RegExp> = {
  pt: /^(arqu[ée]tip\w*|[àa] tona|energias?|vibe|vibra[çc][ãa]o|autoconhecimento|jornada interior|mergulho interior|configura[çc][ãa]o celeste|paz interior|equil[íi]brio interior|um convite para|pedem? aten[çc][ãa]o especial|[ée] fundamental|destaca a import[âa]ncia|ressalta a necessidade|trata-se de um momento|o dia pede|[ée] um (dia|momento) que pede|momento de (observar|refletir)|busca por (harmonia|equil[íi]brio)|encontrar (harmonia|equil[íi]brio)|novas conex[õo]es|novos entendimentos|t[íi]pic[oa]s? d[eo]|(este|esse|essa|esta) (aspecto|configura[çc][ãa]o|posi[çc][ãa]o|movimento) (pede|sugere|indica|traz|convida)|sugerindo (um |uma )?(potencial|possibilidade)|felizmente|infelizmente)$/iu,
  en: /^(archetyp\w*|(positive|negative|good|bad) energy|inner journey|self-knowledge|celestial configuration|brings? to the surface|this is a moment to|this configuration|inner peace|inner balance|fortunately|unfortunately)$/i,
  es: /^(arquet[íi]p\w*|energ[íi]a (positiva|negativa|buena|mala)|viaje interior|autoconocimiento|configuraci[óo]n celeste|saca[rn]? a la superficie|se trata de un momento|esta configuraci[óo]n|paz interior|equilibrio interior|afortunadamente|desafortunadamente)$/i,
}


/**
 * CAUSALIDADE INVENTADA (HARD). O que reprova é a atribuição causal afirmada: o verbo no indicativo ("Saturno
 * influencia o humor dela"), a voz passiva que faz de alguém efeito de outra coisa ("você é influenciado por terra"),
 * e "por causa de X acontece Y". NÃO reprova o verbo que descreve efeito relacional em tom de possibilidade ("isso pode
 * influenciar a dinâmica"), nem o substantivo ("um impacto maior", "amortecer o impacto"). "X causa Y" e "X determina Y"
 * continuam em `PROIBIDAS`. Não é lista de palavras permitidas: é a forma da afirmação.
 */
export const CAUSAL_ATRIBUIDA: Record<Locale, RegExp[]> = {
  pt: [
    /(?<![\p{L}])(é|são|foi|foram|está|estão|fica|ficam)\s+(influenciad|impactad)\p{L}*/iu,
    /(?<![\p{L}])(influencia|influenciam|influenciou|influenciaram|impacta|impactam|impactou|impactaram)(?![\p{L}])/iu,
    /por causa d[eoa]s?(?![\p{L}])[^.!?]{0,80}(?<![\p{L}])(acontece|ocorre|surge|resulta|faz|fazem|leva|levam)(?![\p{L}])/iu,
  ],
  en: [
    /(?<![\p{L}])(is|are|was|were)\s+(influenced|impacted)(?![\p{L}])/iu,
    /(?<![\p{L}])(influences|impacts)(?![\p{L}])/iu,
    /because of[^.!?]{0,80}(?<![\p{L}])(happens|occurs|arises|results|makes|leads)(?![\p{L}])/iu,
  ],
  es: [
    /(?<![\p{L}])(es|eres|son|fue|fueron|está|estás|están)\s+(influenciad|impactad)\p{L}*/iu,
    /(?<![\p{L}])(influye|influyen|influyó|impacta|impactan|impactó)(?![\p{L}])/iu,
    /por causa de[^.!?]{0,80}(?<![\p{L}])(sucede|ocurre|surge|resulta|hace|hacen|lleva|llevan)(?![\p{L}])/iu,
  ],
}

/**
 * PREVISÃO DE DURAÇÃO OU PERMANÊNCIA DA RELAÇÃO (HARD). O produto não prevê duração, e dizer que a relação é
 * "duradoura", "permanente" ou "de longo prazo" é prever. Vale para o TEXTO FINAL, ainda que a evidência de origem
 * fale de continuidade: a evidência descreve uma dinâmica, e o texto não pode transformá-la em previsão de que a
 * relação vai durar. Estreita: só estas formas.
 */
export const DURACAO: Record<Locale, RegExp> = {
  pt: /(?<![\p{L}])(duradour\p{L}*|durabilidade|perdur\p{L}*|permanentes?|(?:de|a|em|no) longo prazo|para toda a vida)(?![\p{L}])/iu,
  en: /(?<![\p{L}])(lasting|long[- ]term|long[- ]lasting|everlasting|enduring|permanent(?:ly)?|durable|for life)(?![\p{L}])/iu,
  es: /(?<![\p{L}])(duradero|duradera|duraderos|duraderas|perdurable|permanentes?|a largo plazo|de largo plazo|para toda la vida)(?![\p{L}])/iu,
}

/**
 * Condição natal: o motor não calcula dignidade nem aflição, então o texto não pode afirmá-las. Estes termos só
 * existem como condição técnica, e valem em qualquer contexto.
 */
export const CONDICAO_NATAL: Record<Locale, RegExp> = {
  pt: /(dignidade|dignificad\w*|debilitad\w*|exaltad\w*|em queda|em detrimento|afligid\w*|aflição)/i,
  en: /(dignit\w*|debilitat\w*|exalted|exaltation|in detriment|in fall|afflict\w*)/i,
  es: /(dignidad|dignificad\w*|debilitad\w*|exaltad\w*|en ca[ií]da|en detrimento|afligid\w*|aflicci[óo]n)/i,
}

/**
 * "Fortalecido" e "enfraquecido" também são adjetivos comuns ("a relação é fortalecida por um entendimento mútuo").
 * Só são a condição técnica quando qualificam um CORPO: "Vênus está fortalecida", "o Sol da outra pessoa fortalecido",
 * "Saturno enfraquecido". O corpo vem antes do adjetivo, a poucas palavras, sem pontuação no meio e sem que "a
 * relação" (ou o vínculo) seja o sujeito do adjetivo. Dependem do contexto técnico, não da flexão.
 */
const SUJEITO_RELACIONAL = String.raw`(?!(?:relação|vínculo|parceria|amizade|conexão|ligação|laço|convivência|colaboração|cooperação|relationship|bond|partnership|friendship|connection|relación|vinculo|amistad|conexión)(?![\p{L}]))`
const CORPO_E_ADJETIVO = (corpos: string, adjetivos: string) =>
  new RegExp(String.raw`(?<![\p{L}])(?:${corpos})(?![\p{L}])(?:\s+${SUJEITO_RELACIONAL}\p{L}+){0,3}\s+(?:${adjetivos})`, "iu")
export const CONDICAO_NATAL_AMBIGUA: Record<Locale, RegExp> = {
  pt: CORPO_E_ADJETIVO("Sol|Lua|Mercúrio|Vênus|Marte|Júpiter|Saturno|Urano|Netuno|Plutão|planetas?|luminares?", String.raw`fortalecid\p{L}*|enfraquecid\p{L}*`),
  en: CORPO_E_ADJETIVO("Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|planets?|luminar(?:y|ies)", String.raw`strengthened|weakened`),
  es: CORPO_E_ADJETIVO("Sol|Luna|Mercurio|Venus|Marte|Júpiter|Saturno|Urano|Neptuno|Plutón|planetas?|luminares?", String.raw`fortalecid\p{L}*|debilitad\p{L}*`),
}

const RETRO: Record<Locale, RegExp> = {
  pt: /retr[óo]grad\w*/i,
  en: /retrograde/i,
  es: /retr[óo]grad\w*/i,
}

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const escapa = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

function acha(texto: string, termo: string): number[] {
  const t = semAcento(termo)
  if (!t) return []
  const re = new RegExp(`(^|[^\\p{L}])(${escapa(t)})(?=$|[^\\p{L}])`, "gu")
  const base = semAcento(texto)
  const posicoes: number[] = []
  for (const m of base.matchAll(re)) posicoes.push((m.index ?? 0) + m[1].length)
  return posicoes
}

type Mencao = { id: string; pos: number; dono: "A" | "B" | null }

function donoDe(frase: string, pos: number, tamanho: number, donos: Donos): "A" | "B" | null {
  const base = semAcento(frase)
  const depois = base.slice(pos + tamanho, pos + tamanho + 40).split(/\s+/).slice(0, 5).join(" ")
  const antes = base.slice(Math.max(0, pos - 30), pos).split(/\s+/).slice(-3).join(" ")
  // o dono é o nome MAIS PRÓXIMO do corpo, e não o primeiro da lista: numa
  // frase com os dois nomes, "a Lua de você faz trígono com Saturno de Ana"
  // tem de dar a Lua para um e Saturno para o outro
  let melhor: { pessoa: "A" | "B"; dist: number } | null = null
  for (const pessoa of ["A", "B"] as const) {
    for (const nome of donos[pessoa]) {
      const n = semAcento(nome)
      if (!n) continue
      const m = new RegExp(`(^|[^\\p{L}])${escapa(n)}($|[^\\p{L}])`, "u").exec(depois)
      if (m && (!melhor || m.index < melhor.dist)) melhor = { pessoa, dist: m.index }
      if (new RegExp(`${escapa(n)}'s\\s*$`, "u").test(antes) && (!melhor || -1 < melhor.dist)) melhor = { pessoa, dist: -1 }
      // o possessivo ou o rótulo logo ANTES do corpo: "sua Lua", "your Moon", "tu Luna"
      const duasAntes = antes.split(/\s+/).slice(-2).join(" ")
      if (new RegExp(`(^|[^\\p{L}])${escapa(n)}\\s*$`, "u").test(duasAntes) && (!melhor || -1 < melhor.dist)) melhor = { pessoa, dist: -1 }
    }
  }
  return melhor?.pessoa ?? null
}

function mencoesDe(frase: string, locale: Locale, donos: Donos): Mencao[] {
  const nomes: Array<[string, string]> = [
    ...CORPOS_MAPA.map((c) => [c as string, (CORPOS[locale] as Record<string, string>)[c]] as [string, string]),
    ["asc", ANGULOS[locale].asc],
    ["mc", ANGULOS[locale].mc],
  ]
  const saida: Mencao[] = []
  for (const [id, nome] of nomes) {
    for (const pos of acha(frase, nome)) saida.push({ id, pos, dono: donoDe(frase, pos, semAcento(nome).length, donos) })
  }
  return saida.sort((a, b) => a.pos - b.pos)
}

const frases = (t: string) => t.split(/(?<=[.!?])\s+/).map((f) => f.trim()).filter(Boolean)

export function verificarSinastria(params: {
  texto: TextoSinastria
  resultado: ResultadoSinastria
  locale: Locale
  donos?: Donos
  /** o texto da evidência que o modelo recebeu: uma metáfora que vem dela não é precisão inventada */
  evidencia?: string
  /** `false` quando quem chama faz a checagem de tensão e facilidade sobre a evidência selecionada (o verificador da resposta) */
  verificarContradicao?: boolean
}): VereditoSinastria {
  const { texto, resultado, locale } = params
  const donos = params.donos ?? { A: [], B: [] }
  const violacoes: string[] = []
  const avisos: string[] = []
  const evidenciaNorm = semAcento(params.evidencia ?? "")

  const sintese = String(texto?.sintese ?? "").trim()
  const afirmacoes = (Array.isArray(texto?.afirmacoes) ? texto.afirmacoes : []).map((a) => ({
    texto: String(a?.texto ?? "").trim(),
    fatos: (Array.isArray(a?.fatos) ? a.fatos : []).map((f) => String(f)),
  }))
  const corrido = [sintese, ...afirmacoes.map((a) => a.texto)].join(" ")
  if (!sintese) violacoes.push("síntese vazia")

  // ── 1 · afirmações com fatos que existem ──────────────────────────────────
  const porId = new Map<string, "aspecto" | "overlay" | "semelhanca">()
  for (const f of resultado.aspectos) porId.set(f.id, "aspecto")
  for (const f of resultado.overlays) porId.set(f.id, "overlay")
  for (const f of resultado.semelhancas) porId.set(f.id, "semelhanca")
  for (const [i, a] of afirmacoes.entries()) {
    if (!a.texto) violacoes.push(`afirmação ${i + 1}: vazia`)
    if (a.fatos.length === 0) violacoes.push(`afirmação ${i + 1}: não declara nenhum fato`)
    for (const id of a.fatos) {
      if (!porId.has(id)) violacoes.push(`afirmação ${i + 1}: declara o fato "${id}", que não existe`)
    }
  }

  // ── 2 · aspecto inexistente e dono trocado ────────────────────────────────
  const nomesAspecto = Object.entries(ASPECTOS[locale])
  for (const frase of frases(corrido)) {
    const aspectosNaFrase = nomesAspecto.filter(([, nome]) => acha(frase, nome).length > 0).map(([id]) => id)
    const mencoes = mencoesDe(frase, locale, donos)
    const distintos = [...new Set(mencoes.map((m) => m.id))]
    if (aspectosNaFrase.length === 0 || distintos.length !== 2) continue

    const [x, y] = distintos.map((id) => mencoes.find((m) => m.id === id) as Mencao)
    for (const aspecto of aspectosNaFrase) {
      const deste = resultado.aspectos.filter((f) => f.aspecto === aspecto)
      const noPar = deste.filter(
        (f) => (f.corpoA === x.id && f.corpoB === y.id) || (f.corpoA === y.id && f.corpoB === x.id),
      )
      if (noPar.length === 0) {
        violacoes.push(`aspecto inexistente: ${x.id} e ${y.id} em ${aspecto} não é um fato desta relação`)
        continue
      }
      // com os dois donos resolvidos, a orientação tem de bater: A.x~B.y
      if (x.dono && y.dono) {
        if (x.dono === y.dono) {
          violacoes.push(`dois corpos do mesmo dono (${x.dono}) em ${aspecto}: a sinastria só tem aspectos entre os dois mapas`)
        } else if (!noPar.some((f) => (x.dono === "A" ? f.corpoA === x.id && f.corpoB === y.id : f.corpoA === y.id && f.corpoB === x.id))) {
          violacoes.push(`dono trocado: ${aspecto} entre ${x.id} de ${x.dono} e ${y.id} de ${y.dono} não existe, o que existe é o inverso`)
        }
      }
    }
  }

  // ── 3 · ângulos e casas só com fato que os sustente ───────────────────────
  for (const id of ["asc", "mc"] as const) {
    const cita = acha(corrido, ANGULOS[locale][id]).length > 0
    const sustentado = resultado.aspectos.some((f) => f.corpoA === id || f.corpoB === id)
    if (cita && !sustentado) violacoes.push(`cita ${ANGULOS[locale][id]}, que não está nos fatos desta relação`)
  }
  const casasNoTexto = [...semAcento(corrido).matchAll(/\b(?:casa|house)\s+(\d{1,2})\b/g)].map((m) => Number(m[1]))
  for (const n of new Set(casasNoTexto)) {
    if (!resultado.overlays.some((o) => o.casa === n)) violacoes.push(`cita a casa ${n}, que nenhum overlay desta relação sustenta`)
  }
  // overlay: o planeta, a casa e o dono do planeta
  for (const frase of frases(corrido)) {
    const casas = [...semAcento(frase).matchAll(/\b(?:casa|house)\s+(\d{1,2})\b/g)].map((m) => Number(m[1]))
    const mencoes = mencoesDe(frase, locale, donos).filter((m) => m.id !== "asc" && m.id !== "mc")
    const distintos = [...new Set(mencoes.map((m) => m.id))]
    if (casas.length !== 1 || distintos.length !== 1) continue
    const m = mencoes[0]
    const candidatos = resultado.overlays.filter((o) => o.planeta === m.id && o.casa === casas[0])
    if (candidatos.length === 0) {
      violacoes.push(`overlay inexistente: ${m.id} na casa ${casas[0]} não é um fato desta relação`)
    } else if (m.dono && !candidatos.some((o) => o.donoDoPlaneta === m.dono)) {
      violacoes.push(`overlay com dono trocado: ${m.id} de ${m.dono} na casa ${casas[0]} existe só com o planeta do outro`)
    }
  }

  // ── 4 · Lua ambígua e retrogradação indeterminada ─────────────────────────
  const indisponiveis = (item: string) => resultado.indisponibilidades.filter((i) => i.item === item).map((i) => i.pessoa)
  const nomesSigno = SIGNOS[locale]
  for (const frase of frases(corrido)) {
    const mencoes = mencoesDe(frase, locale, donos)
    const comSigno = nomesSigno.some((s) => acha(frase, s).length > 0)
    const luas = mencoes.filter((m) => m.id === "moon")
    if (comSigno && luas.length > 0) {
      const quem = indisponiveis("signo:moon")
      const afetada = luas.some((l) => (l.dono ? quem.includes(l.dono) : quem.length > 0))
      if (afetada) violacoes.push("diz o signo da Lua de quem tem o signo lunar ambíguo (a hora de nascimento não é conhecida)")
    }
    if (RETRO[locale].test(frase)) {
      for (const m of mencoes) {
        const quem = indisponiveis(`retrogradacao:${m.id}`)
        if (m.dono ? quem.includes(m.dono) : quem.length > 0) {
          violacoes.push(`diz que ${m.id} está retrógrado, e a retrogradação dele é indeterminada neste dia`)
        }
      }
    }
  }

  // ── 5 · condição natal que o motor não calculou ───────────────────────────
  const natal = corrido.match(CONDICAO_NATAL[locale]) ?? corrido.match(CONDICAO_NATAL_AMBIGUA[locale])
  if (natal) violacoes.push(`afirma condição natal ("${natal[0]}"), que o motor de sinastria não calcula`)

  // ── 6 · veredito, índice, previsão, conselho, karma ───────────────────────
  const veredito = corrido.match(VEREDITO[locale])
  if (veredito) violacoes.push(`veredito ou índice de compatibilidade ("${veredito[0]}")`)
  const karma = corrido.match(KARMA[locale])
  if (karma) violacoes.push(`vocabulário que o produto não usa ("${karma[0]}")`)
  const avaliativo = corrido.match(AVALIATIVO[locale])
  if (avaliativo) avisos.push(`vocabulário avaliativo ("${avaliativo[0]}")`)
  for (const r of PREVISAO[locale]) {
    const achou = corrido.match(r)
    if (achou) violacoes.push(`afirma futuro: "${achou[0].trim()}"`)
  }
  for (const r of CONSELHO[locale]) {
    const achou = corrido.match(r)
    if (achou) violacoes.push(`dá conselho: "${achou[0].trim()}"`)
  }
  const conselhoExtra = corrido.match(CONSELHO_EXTRA[locale])
  if (conselhoExtra) violacoes.push(`dá conselho: "${conselhoExtra[0].trim()}"`)
  for (const r of PROIBIDAS[locale]) {
    // "influenci*" e "impact*" saem da lista lexical: causalidade é a forma da afirmação, e é conferida abaixo
    if (/influenci/.test(r.source)) continue
    const achou = corrido.match(r)
    if (!achou) continue
    const m = achou[0].trim()
    if (EDITORIAL_LEVE[locale].test(m)) avisos.push(`expressão de estilo "${m}"`)
    else violacoes.push(`expressão proibida "${m}"`)
  }
  for (const r of CAUSAL_ATRIBUIDA[locale]) {
    const achou = corrido.match(r)
    if (achou) violacoes.push(`atribui causa que a evidência não sustenta: "${achou[0].trim()}"`)
  }
  const duracao = corrido.match(DURACAO[locale])
  if (duracao) violacoes.push(`afirma duração ou permanência da relação ("${duracao[0].trim()}"): o produto não prevê duração`)
  for (const r of FALSA_PRECISAO[locale]) {
    const achou = corrido.match(r)
    if (!achou) continue
    const m = achou[0].trim()
    // "a noite complementa o dia" é o artigo, e não "à noite"; e o que a evidência mesma diz não foi inventado
    if (/^a (noite|tarde)$/i.test(m) || (evidenciaNorm && evidenciaNorm.includes(semAcento(m)))) continue
    violacoes.push(`"${m}" é uma precisão que nenhum cálculo produziu`)
  }
  if (TRACOS.test(corrido)) avisos.push("usa travessão ou meia risca")

  // ── 7 · tensão e facilidade: presença, nunca votação ──────────────────────
  const categoriasCitadas = new Set<string>()
  for (const a of afirmacoes) {
    for (const id of a.fatos) {
      const f = resultado.aspectos.find((x) => x.id === id)
      if (f) categoriasCitadas.add(f.categoria)
    }
  }
  const existem = new Set(resultado.aspectos.map((f) => f.categoria))
  if (params.verificarContradicao !== false && existem.has("discordante") && existem.has("harmonico")) {
    if (!categoriasCitadas.has("discordante")) violacoes.push("omite todas as tensões, e a relação tem aspectos discordantes")
    if (!categoriasCitadas.has("harmonico")) violacoes.push("omite todas as facilidades, e a relação tem aspectos harmônicos")
  }

  const unicos = (l: string[]) => [...new Set(l)]
  return violacoes.length ? { ok: false, violacoes: unicos(violacoes), avisos: unicos(avisos) } : { ok: true, avisos: unicos(avisos) }
}
