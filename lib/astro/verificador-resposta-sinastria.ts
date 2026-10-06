/**
 * O verificador ESTRUTURAL da resposta de sinastria: tudo o que se pode
 * garantir por código sobre a síntese que o modelo devolveu.
 *
 * Ele não julga se o texto é bom nem se uma frase é fiel à evidência: isso é a
 * camada semântica, desenhada em `docs/sinastria-prompt-e-verificador.md` e
 * ainda não implementada. Aqui só entra o que é verificável sem interpretar.
 *
 * O ESCOPO DA VERIFICAÇÃO É A SELEÇÃO, NÃO O CÁLCULO. O vocabulário que o texto
 * pode usar é o dos fatos que o modelo recebeu: um aspecto que existe no mapa
 * mas o seletor descartou não pode aparecer, porque o modelo não o viu e só
 * poderia tê-lo completado por conta própria.
 *
 * O QUE ELE GARANTE
 *  1. a forma: as nove chaves, cada uma nula ou com parágrafos de texto e ids;
 *  2. nenhum bloco à força: os obrigatórios existem, e os que o código não
 *     liberou ficam nulos; "pontos em comum" só existe com ponto em comum;
 *  3. todo parágrafo cita evidência, e só evidência que o modelo recebeu;
 *  4. cada bloco temático cita evidência que sustenta a dimensão dele, o bloco
 *     de tensão cita tensão e o de encontro cita facilidade;
 *  5. a síntese da relação cita pelo menos uma das dinâmicas mais relevantes;
 *  6. as regras de texto de `verificarSinastria`: aspecto inexistente, dono
 *     trocado, Ascendente e casa sem fato, Lua e retrogradação ambíguas,
 *     veredito, karma, previsão, conselho, condição natal, tensão e facilidade
 *     omitidas;
 *  7. elemento, modo e "mesmo signo" só quando há ponto em comum que os sustente;
 *  8. o vínculo não cria relação: termos de outro vínculo, e de relação
 *     romântica quando ele não é, só se a própria evidência os usa;
 *  9. tamanho: parágrafos, palavras por parágrafo e no total;
 * 11. a síntese final não fecha com condição nem prescrição ("desde que", "se ambos", "para que a relação",
 *     "é importante", "exige atenção para...": HARD, só na `sintese_final`);
 * 12. num parágrafo apoiado só em pontos em comum, "afinidade natural" afirmada é S8 (HARD);
 * 10. semelhança não vira garantia de afinidade, facilidade natural nem compatibilidade, e diferença não vira
 *     incompatibilidade (`promessaDeSemelhanca`, estreita, só nos parágrafos que citam ponto em comum).
 *
 * O QUE ELE NÃO GARANTE
 *  - fidelidade da frase à evidência citada;
 *  - causalidade, fatalismo, promessa ou veredito escritos sem marca;
 *  - que a tensão não foi tratada como defeito e a facilidade como promessa;
 *  - que o vínculo não colorou o conteúdo, só a ênfase.
 */
import type { Locale } from "@/lib/i18n/config"
import { LIMITES_SINASTRIA, type BlocoSinastria, type SinteseSinastria } from "./prompt-sinastria"
import { BLOCOS, BLOCOS_OBRIGATORIOS, DIMENSOES_DO_BLOCO, DONOS, ELEMENTOS, MODOS, sustentaEncontro, sustentaTensao, type DinamicaNoPayload, type IdDeBloco, type PayloadSinastria } from "./payload-sinastria"
import type { SelecaoSinastria } from "./selecao-sinastria"
import type { FatoAspecto, FatoOverlay, FatoSemelhanca, ResultadoSinastria } from "./sinastria"
import { verificarSinastria } from "./verificador-sinastria"

/**
 * `violacoes` reprovam (HARD FAIL: fidelidade, segurança, forma, limite claramente excedido). `avisos` não reprovam
 * (WARNING EDITORIAL: estilo, vocabulário, estouro pequeno de tamanho, fechamento de síntese que merece o olhar do juiz).
 */
export type VereditoResposta = { ok: true; sintese: SinteseSinastria; avisos: string[] } | { ok: false; violacoes: string[]; avisos: string[] }

/** Folga sobre o teto de palavras: até 10% acima é aviso, a partir daí é violação. */
export const TOLERANCIA_DE_TAMANHO = 1.1

/**
 * Conteúdo de bastidor: o texto fala do sistema (do repertório, dos fatos calculados, do livro), e não da relação.
 * HARD FAIL.
 */
const BASTIDOR = /(^|[^\p{L}])(repert[óo]rio|payload|davison|synastry|json|o livro|segundo o material|a lista acima|fatos calculados|o seletor|o prompt|evid[êe]ncias? (selecionadas?|citadas?)|pontos? em comum com material)($|[^\p{L}])/iu

/**
 * FECHAMENTO PRESCRITIVO DA SÍNTESE FINAL. A síntese final descreve a configuração em aberto; não condiciona o
 * sucesso da relação a uma ação nem ensina a administrá-la. Só na `sintese_final`, nunca como lista global.
 *
 * HARD FAIL: as construções inequívocas, as que condicionam ("desde que", "se ambos", "para que a relação",
 * "depende de como"), recomendam ("é importante", "o caminho é", "encontrar equilíbrio", "com paciência ou esforço",
 * "exige esforço") ou mandam observar para evitar algo ("exige atenção para...", "pedem atenção para evitar...").
 * "precisam", "devem" e "é necessário" já são hard em qualquer bloco, por `verificarSinastria`.
 *
 * WARNING: o que sozinho é ambíguo, "exigem atenção" sem objetivo e "pode se beneficiar", que descrevem tanto quanto
 * prescrevem. Medidos, não reprovados.
 */
const FECHAMENTO_VERBO = String.raw`(exige|exigem|exigir|exigindo|requer|requerem|requerer|requerendo|demanda|demandam|demandar|demandando|pede|pedem)`
const FECHAMENTO_DURO = new RegExp(
  [
    String.raw`desde que`,
    String.raw`contanto que`,
    String.raw`se (ambos|vocês|as duas pessoas|cada um|ambas)`,
    String.raw`para que (a relação|o vínculo|a amizade|a parceria|vocês|ambos|ambas)`,
    String.raw`(é|são) importantes?`,
    String.raw`o caminho (é|passa|está)`,
    String.raw`encontrar (um |o )?(equilíbrio|harmonia)`,
    String.raw`com (compreensão|paciência|esforço|cuidado|empatia|diálogo|respeito|abertura|flexibilidade|comunicação)`,
    // requerer paciência, exigir esforço, demandar compreensão: construção prescritiva em qualquer flexão do verbo
    String.raw`${FECHAMENTO_VERBO} (mais )?(esforço|paciência|compreensão|cuidado|equilíbrio)`,
    // exigir atenção PARA..., demandar atenção para evitar/alcançar/permitir: a atenção tem um objetivo, e então é recomendação
    String.raw`${FECHAMENTO_VERBO} (mais )?(atenção|cuidado)[^.!?]{0,80}(?<![\p{L}])para(?![\p{L}])`,
    String.raw`dependendo de como`,
    String.raw`depende de como`,
    // prescrição reescrita: "o desafio está em lidar com os atritos ... para fortalecer o vínculo". Só a construção
    // "<o desafio/o trabalho/o segredo...> está em <ação de manejo>"; "desafio" e "para" soltos NÃO reprovam
    String.raw`(o|um|esse|este)\s+(desafio|trabalho|segredo|ponto|caminho)\s+(est[áa]|consiste|reside|passa)\s+(em|por)\s+(lidar|administrar|gerir|manejar|equilibrar|aproveitar|aprender|conciliar|superar|saber|cuidar|trabalhar|respeitar|aceitar|integrar|valorizar|reconhecer|negociar|cultivar|fortalecer|preservar|manter|buscar|encontrar|transformar|acolher)`,
    String.raw`aprend(er|a|am|em|endo)\s+a\s+(lidar|administrar|conviver|manejar|conciliar)`,
    // o sucesso condicionado a uma ação: "pode ser enriquecedora se as facilidades forem valorizadas"
    String.raw`se\s+(\p{L}+\s+){0,3}(forem|for|sejam|seja)\s+(valorizad|respeitad|reconhecid|trabalhad|aceit|cuidad|cultivad|integrad|alimentad|equilibrad)\p{L}*`,
  ].map((x) => `(${x})`).join("|"),
  "iu",
)
const FECHAMENTO_BRANDO = new RegExp(
  [`${FECHAMENTO_VERBO} (mais )?atenção`, String.raw`(pode|podem) se beneficiar`].map((x) => `(${x})`).join("|"),
  "iu",
)

const palavras = (t: string) => t.trim().split(/\s+/).filter(Boolean).length
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

/** Termos de cada tipo de relação: só aparecem se o vínculo declarado é aquele ou se a evidência os usa. */
const TERMOS_DE_VINCULO: Record<string, RegExp> = {
  romantico: /\b(casal|namor\w*|romanc\w*|romantic\w*|amoros\w*|paixao|apaixon\w*|casad\w*|esposa|marido|couple|dating|romantic|lovers?|pareja|noviazgo|enamorad\w*)\b/i,
  familia: /\b(irmao|irma|irmaos|pais|filhos?|filhas?|parentes?|familia\w*|siblings?|parents?|family|hermanos?|padres|hijos?|familiar\w*)\b/i,
  trabalho: /\b(colegas?|chefe|patrao|empregad\w*|empresa|socios?|profission\w*|coworkers?|boss|employ\w*|business partners?|colegas|jefe|empresa)\b/i,
}

const ID_DO_VINCULO: Record<string, keyof typeof TERMOS_DE_VINCULO | null> = { romantico: "romantico", familia: "familia", trabalho: "trabalho", amizade: null, outro: null }

/** O resultado que o modelo "viu": os fatos da seleção, e nada mais. */
export function resultadoDaSelecao(sel: SelecaoSinastria): ResultadoSinastria {
  const aspectos: FatoAspecto[] = []
  const overlays: FatoOverlay[] = []
  for (const d of [...sel.aspectos, ...sel.overlays]) {
    for (const f of [d.principal, ...d.reforcos]) {
      if (f.tipo === "aspecto") aspectos.push(f)
      else overlays.push(f)
    }
  }
  return { versao: sel.versaoDosCriterios, aspectos, overlays, semelhancas: sel.semelhancas.map((s) => s.fato), indisponibilidades: sel.indisponibilidades, recusadas: [] }
}

/**
 * Que dinâmica cada id citável aponta (o id da dinâmica ou o de um dos seus fatos), COMO O MODELO A RECEBEU:
 * com as frases que o vínculo deixou e as dimensões que elas ainda sustentam.
 */
function dinamicaPorId(payload: PayloadSinastria): Map<string, DinamicaNoPayload> {
  const m = new Map<string, DinamicaNoPayload>()
  for (const d of [...payload.aspectos, ...payload.overlays]) {
    m.set(d.id, d)
    for (const f of d.fatos) m.set(f.id, d)
  }
  return m
}

/** A seleção que o modelo viu: sem as dinâmicas cuja evidência inteira não se aplicava ao vínculo. */
function selecaoVista(sel: SelecaoSinastria, payload: PayloadSinastria): SelecaoSinastria {
  const omitidas = new Set(payload.omitidasPorVinculo)
  return { ...sel, aspectos: sel.aspectos.filter((d) => !omitidas.has(d.id)), overlays: sel.overlays.filter((d) => !omitidas.has(d.id)) }
}

/**
 * SEMELHANÇA NÃO É COMPATIBILIDADE, E NÃO GARANTE FACILIDADE. Proteção determinística e ESTREITA (HARD FAIL) sobre
 * os parágrafos que citam um ponto em comum (os ids de `payload.semelhancas`: elemento, modo, elemento_do_sol,
 * signo:*) e sobre o bloco `pontos_em_comum`. Pega só a conclusão indevida:
 *  - garantia ou asseguramento de afinidade, compreensão, facilidade, harmonia ("as semelhanças garantem uma afinidade");
 *  - facilidade natural afirmada como fato ("naturalmente fácil", "facilidade natural");
 *  - semelhança que "implica", "significa" ou "resulta em" afinidade ou facilidade;
 *  - diferença como impedimento ou incompatibilidade ("as diferenças impedem...").
 * ("compatibilidade" como palavra já é veredito, em `verificarSinastria`.)
 *
 * NÃO proíbe a descrição que a fonte sustenta, em tom de possibilidade ("sugere uma afinidade teórica", "pode trazer
 * uma compreensão instintiva", "afinidade natural") nem a negação ("semelhança não garante facilidade"). Não decide se
 * a descrição está certa: isso é fidelidade, e fidelidade fina não se faz com expressão regular.
 */
const FACILIDADE = String.raw`(afinidade|compreens[ãa]o|entendimento|facilidade|harmonia|sintonia|conex[ãa]o|coopera[çc][ãa]o)`
const NEGACAO_ANTES = /(^|[^\p{L}])(n[ãa]o|nem|sem|nunca|jamais)\s+(\p{L}+\s+){0,3}$/iu
const PROMESSA_DE_SEMELHANCA: Array<{ nome: string; regex: RegExp }> = [
  { nome: "garantia", regex: new RegExp(String.raw`(garant\p{L}*|assegur\p{L}*)[^.!?]{0,60}${FACILIDADE}|${FACILIDADE}[^.!?]{0,40}(garant\p{L}*|assegur\p{L}*)`, "iu") },
  { nome: "facilidade natural", regex: /(facilidade\s+natural|naturalmente\s+(f[áa]cil|facilita\p{L}*|se\s+(entendem|compreendem))|flu\p{L}*\s+naturalmente)/iu },
  { nome: "implica ou significa", regex: new RegExp(String.raw`(semelhan\p{L}+|mesm[oa]s?\s+(signo|elemento|modo)|elementos?\s+(iguais|em\s+comum))[^.!?]{0,80}(implic\p{L}+|significa\p{L}*|resulta\p{L}*\s+em)[^.!?]{0,40}${FACILIDADE}`, "iu") },
  { nome: "diferença como incompatibilidade", regex: /(diferen[çc]as?|contrastes?)[^.!?]{0,80}(impedem?|inviabiliza\p{L}*|impossibilita\p{L}*|tornam?\s+(\p{L}+\s+){0,3}(imposs[ií]ve(l|is)|invi[áa]ve(l|is)|incompat[ií]ve(l|is))|incompatibiliza\p{L}*)/iu },
]

/** A primeira frase do texto que promete facilidade ou compatibilidade a partir de semelhança, e a regra que a pegou. */
export function promessaDeSemelhanca(texto: string): { regra: string; trecho: string } | null {
  for (const frase of texto.split(/(?<=[.!?])\s+/)) {
    for (const { nome, regex } of PROMESSA_DE_SEMELHANCA) {
      const m = regex.exec(frase)
      if (!m) continue
      // "a semelhança não garante facilidade" é o contrário de uma promessa
      const verbo = frase.search(/garant|assegur|implic|significa|resulta/i)
      if (verbo >= 0 && NEGACAO_ANTES.test(frase.slice(0, verbo))) continue
      return { regra: nome, trecho: frase.trim().slice(0, 140) }
    }
  }
  return null
}

/**
 * S8, "AFINIDADE NATURAL". Num parágrafo apoiado SOMENTE em pontos em comum (elemento, elemento_do_sol, modo, signo:*),
 * a afirmação direta de "afinidade natural" é a semelhança convertida em afinidade factual, mesmo sem verbo de
 * promessa ("vocês têm uma afinidade natural, evidenciada pela predominância do elemento terra"). Semelhança pode ser
 * descrita como semelhança, base comum formal ou afinidade teórica, e a possibilidade ("pode trazer uma afinidade
 * natural") não é afirmação direta. NÃO é blacklist de "afinidade".
 */
const AFINIDADE_NATURAL: Record<Locale, RegExp> = {
  pt: /afinidade\s+natural/iu,
  en: /natural\s+affinity/iu,
  es: /afinidad\s+natural/iu,
}
const CAUTELA: Record<Locale, RegExp> = {
  pt: /(?<![\p{L}])(pode|podem|poderia|poderiam|sugere|sugerem|sugerindo|talvez|possivelmente|tende|tendem|não)(?![\p{L}])/iu,
  en: /(?<![\p{L}])(can|could|may|might|suggests?|tends?|perhaps|possibly|not)(?![\p{L}])/iu,
  es: /(?<![\p{L}])(puede|pueden|podría|podrían|sugiere|sugieren|tal vez|posiblemente|tiende|tienden|no)(?![\p{L}])/iu,
}
export function afinidadeNaturalAfirmada(texto: string, locale: Locale = "pt"): string | null {
  for (const frase of texto.split(/(?<=[.!?])\s+/)) {
    if (AFINIDADE_NATURAL[locale].test(frase) && !CAUTELA[locale].test(frase)) return frase.trim().slice(0, 140)
  }
  return null
}

export function verificarRespostaSinastria(params: { bruto: unknown; payload: PayloadSinastria; selecao: SelecaoSinastria; locale: Locale }): VereditoResposta {
  const avisos: string[] = []
  const { bruto, payload, locale } = params
  const selecao = selecaoVista(params.selecao, payload)
  const v: string[] = []

  // ── 1 · a forma ─────────────────────────────────────────────────────────────
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return { ok: false, violacoes: ["a resposta não é um objeto"], avisos }
  const obj = bruto as Record<string, unknown>
  for (const k of Object.keys(obj)) if (!(BLOCOS as readonly string[]).includes(k)) v.push(`chave fora do schema: "${k}"`)
  for (const b of BLOCOS) if (!(b in obj)) v.push(`falta a chave "${b}" (os blocos que não existem valem null)`)

  const blocos: Partial<Record<IdDeBloco, BlocoSinastria | null>> = {}
  for (const b of BLOCOS) {
    const x = obj[b]
    if (x === null || x === undefined) { blocos[b] = null; continue }
    const ps = (x as { paragrafos?: unknown })?.paragrafos
    if (!Array.isArray(ps)) { v.push(`${b}: sem a lista de parágrafos`); continue }
    const limpos = ps.map((p) => ({
      texto: typeof (p as { texto?: unknown })?.texto === "string" ? ((p as { texto: string }).texto).trim() : "",
      evidencias: Array.isArray((p as { evidencias?: unknown })?.evidencias) ? ((p as { evidencias: unknown[] }).evidencias).map((e) => String(e)) : [],
    }))
    blocos[b] = { paragrafos: limpos }
  }

  // ── 2 · nenhum bloco à força ────────────────────────────────────────────────
  for (const b of BLOCOS) {
    const bloco = blocos[b]
    if (BLOCOS_OBRIGATORIOS.includes(b)) {
      if (!bloco || bloco.paragrafos.length === 0) v.push(`${b}: é obrigatório e está vazio`)
    } else if (bloco && !payload.blocosElegiveis.includes(b)) {
      v.push(`${b}: a evidência selecionada não sustenta este bloco, e ele tem de ser null`)
    }
  }
  if (blocos.pontos_em_comum && payload.semelhancas.length === 0) v.push("pontos_em_comum: não há ponto em comum com material, e o bloco foi escrito mesmo assim")

  // ── 3 e 9 · evidência citada, e tamanho ─────────────────────────────────────
  const citaveis = new Set(payload.idsCitaveis)
  const dinamicas = dinamicaPorId(payload)
  const semelhancaIds = new Set(payload.semelhancas.map((s) => s.id))
  let total = 0
  for (const b of BLOCOS) {
    const bloco = blocos[b]
    if (!bloco) continue
    const limite = BLOCOS_OBRIGATORIOS.includes(b) ? LIMITES_SINASTRIA.paragrafosDasSinteses : LIMITES_SINASTRIA.paragrafosPorBloco
    if (bloco.paragrafos.length > limite) v.push(`${b}: ${bloco.paragrafos.length} parágrafos, acima de ${limite}`)
    for (const [i, p] of bloco.paragrafos.entries()) {
      const rotulo = `${b}[${i}]`
      if (!p.texto) v.push(`${rotulo}: texto vazio`)
      const n = palavras(p.texto)
      total += n
      if (n > LIMITES_SINASTRIA.palavrasPorParagrafo) {
        const msg = `${rotulo}: ${n} palavras, acima de ${LIMITES_SINASTRIA.palavrasPorParagrafo}`
        ;(n > LIMITES_SINASTRIA.palavrasPorParagrafo * TOLERANCIA_DE_TAMANHO ? v : avisos).push(msg)
      }
      if (BASTIDOR.test(p.texto)) v.push(`${rotulo}: fala do sistema (repertório, fatos calculados, livro), e não da relação`)
      if (p.evidencias.length === 0) v.push(`${rotulo}: não cita nenhuma evidência`)
      for (const id of p.evidencias) if (!citaveis.has(id)) v.push(`${rotulo}: cita "${id}", que não está na lista de evidências recebida`)

      // ── 4 · o bloco cita evidência que o sustenta ──────────────────────────
      const dins = p.evidencias.map((id) => dinamicas.get(id)).filter((d): d is DinamicaNoPayload => Boolean(d))
      if (b === "pontos_em_comum") {
        if (!p.evidencias.every((id) => semelhancaIds.has(id))) v.push(`${rotulo}: pontos em comum só cita pontos em comum`)
      } else if (b === "onde_ha_tensao") {
        if (!dins.some(sustentaTensao)) v.push(`${rotulo}: o bloco de tensão não cita nenhuma evidência de tensão`)
      } else if (b === "onde_se_encontram") {
        if (!dins.some(sustentaEncontro)) v.push(`${rotulo}: o bloco de encontro não cita nenhuma evidência de facilidade ou apoio`)
      } else if (DIMENSOES_DO_BLOCO[b]) {
        const dims = DIMENSOES_DO_BLOCO[b]!
        if (!dins.some((d) => d.dimensoes.some((x) => dims.includes(x)))) v.push(`${rotulo}: não cita evidência que sustente a dimensão deste bloco`)
      } else if (!BLOCOS_OBRIGATORIOS.includes(b)) {
        v.push(`${rotulo}: bloco desconhecido`)
      }
    }
  }
  if (total > LIMITES_SINASTRIA.palavrasNoTotal) {
    const msg = `${total} palavras no total, acima de ${LIMITES_SINASTRIA.palavrasNoTotal}`
    ;(total > LIMITES_SINASTRIA.palavrasNoTotal * TOLERANCIA_DE_TAMANHO ? v : avisos).push(msg)
  }

  // ── 5 · proporção: a síntese cita o que pesa mais ───────────────────────────
  const principais = (payload.aspectos.length ? payload.aspectos : payload.overlays).slice(0, 2)
  const citadasNaSintese = new Set((blocos.sintese_da_relacao?.paragrafos ?? []).flatMap((p) => p.evidencias))
  if (principais.length > 0 && !principais.some((d) => citadasNaSintese.has(d.id) || d.fatos.some((f) => citadasNaSintese.has(f.id)))) {
    v.push("sintese_da_relacao: não cita nenhuma das dinâmicas mais relevantes; um fato secundário não pode ser o tema")
  }

  // ── 6 · as regras de texto, sobre os fatos que o modelo recebeu ─────────────
  const resultado = resultadoDaSelecao(selecao)
  const afirmacoes = BLOCOS.flatMap((b) => (blocos[b]?.paragrafos ?? []).map((p) => ({
    texto: p.texto,
    fatos: p.evidencias.flatMap((id) => {
      const d = dinamicas.get(id)
      if (d) return id === d.id ? d.fatos.map((f) => f.id) : [id]
      return citaveis.has(id) ? [id] : []
    }),
  })))
  const sintese = afirmacoes.map((a) => a.texto).join(" ")
  const textoDaEvidencia = [...payload.aspectos, ...payload.overlays].flatMap((d) => [...d.fatos.map((f) => f.texto), ...d.evidencia]).concat(payload.semelhancas.flatMap((x) => [x.fato, ...x.nucleo]), payload.ressalvaDasSemelhancas ?? "").join(" ")
  const ver = verificarSinastria({ texto: { afirmacoes: afirmacoes.filter((a) => a.fatos.length > 0), sintese }, resultado, locale, donos: DONOS[locale], evidencia: textoDaEvidencia, verificarContradicao: false })
  if (!ver.ok) v.push(...ver.violacoes)
  avisos.push(...ver.avisos)

  // tensão e facilidade: presença, medida sobre a evidência que o modelo recebeu e não sobre a categoria do aspecto.
  // Conjunção, facilidade de overlay e frase de valência favorável também são facilidade.
  const todasAsDinamicas = [...payload.aspectos, ...payload.overlays]
  const citouDinamica = (d: DinamicaNoPayload) => afirmacoes.some((a) => a.fatos.some((f) => d.fatos.some((x) => x.id === f)))
  const temEncontro = todasAsDinamicas.some(sustentaEncontro)
  const temTensao = todasAsDinamicas.some(sustentaTensao)
  if (temEncontro && temTensao) {
    if (!todasAsDinamicas.filter(sustentaEncontro).some(citouDinamica)) v.push("omite todas as facilidades: nenhuma dinâmica que sustenta apoio ou facilidade é citada, e a relação as tem")
    if (!todasAsDinamicas.filter(sustentaTensao).some(citouDinamica)) v.push("omite todas as tensões: nenhuma dinâmica que sustenta tensão é citada, e a relação as tem")
  }

  // o fechamento da síntese final que condiciona ou prescreve: HARD; o ambíguo, aviso
  for (const [i, p] of (blocos.sintese_final?.paragrafos ?? []).entries()) {
    const duro = p.texto.match(FECHAMENTO_DURO)
    if (duro) v.push(`sintese_final[${i}]: fecha com condição ou prescrição ("${duro[0]}"): a síntese final descreve a configuração em aberto, e não a maneira de administrá-la`)
    else {
      const brando = p.texto.match(FECHAMENTO_BRANDO)
      if (brando) avisos.push(`sintese_final[${i}]: fechamento que pede atenção ou benefício ("${brando[0]}")`)
    }
  }

  // ── 6b · semelhança não é compatibilidade e não garante facilidade ──────────
  for (const b of BLOCOS) {
    for (const [i, p] of (blocos[b]?.paragrafos ?? []).entries()) {
      if (!(b === "pontos_em_comum" || p.evidencias.some((id) => semelhancaIds.has(id)))) continue
      const m = promessaDeSemelhanca(p.texto)
      if (m) v.push(`${b}[${i}]: semelhança ou diferença tratada como garantia, facilidade natural ou incompatibilidade (${m.regra}): "${m.trecho}"`)
    }
  }

  for (const b of BLOCOS) {
    for (const [i, p] of (blocos[b]?.paragrafos ?? []).entries()) {
      // apoiado SOMENTE em pontos em comum: tudo o que o parágrafo cita é ponto em comum
      if (p.evidencias.length === 0 || !p.evidencias.every((id) => semelhancaIds.has(id))) continue
      const m = afinidadeNaturalAfirmada(p.texto, locale)
      if (m) v.push(`${b}[${i}]: semelhança convertida em afinidade natural (S8): "${m}"`)
    }
  }

  // ── 7 · elemento, modo e mesmo signo só com ponto em comum ──────────────────
  const todo = semAcento(sintese)
  const sem: FatoSemelhanca[] = selecao.semelhancas.map((s) => s.fato)
  const temElemento = sem.some((s) => s.dimensao === "elemento" || s.dimensao === "elemento_do_sol")
  const temModo = sem.some((s) => s.dimensao === "modo")
  const temSigno = sem.some((s) => s.dimensao === "signo_do_corpo")
  // elemento e modo só com o valor que o ponto em comum traz: "elemento água" sem água nos fatos é invenção
  const valoresDe = (dims: string[]) => new Set(sem.filter((s) => dims.includes(s.dimensao)).flatMap((s) => [s.padraoA, s.padraoB]))
  const palavra = (tabela: Record<string, string>, valores: Set<string>) => new Set([...valores].map((x) => semAcento(tabela[x] ?? x)))
  const elementosOk = palavra(ELEMENTOS[locale], valoresDe(["elemento", "elemento_do_sol"]))
  const modosOk = palavra(MODOS[locale], valoresDe(["modo"]))
  const reElemento = new RegExp(String.raw`\b(?:elemento|element)\s+(?:de\s+|of\s+)?(${Object.values(ELEMENTOS[locale]).map(semAcento).join("|")})\b`, "g")
  for (const m of todo.matchAll(reElemento)) if (!elementosOk.has(m[1])) v.push(`fala do elemento ${m[1]}, e os pontos em comum da evidência não o trazem`)
  const reModo = new RegExp(String.raw`\b(?:modo|mode)\s+(${Object.values(MODOS[locale]).map(semAcento).join("|")})\b`, "g")
  for (const m of todo.matchAll(reModo)) if (!modosOk.has(m[1])) v.push(`fala do modo ${m[1]}, e os pontos em comum da evidência não o trazem`)
  if (/(mesmo signo|same sign|mismo signo)/.test(todo) && !temSigno) v.push("fala de mesmo signo, e não há ponto em comum de signo na evidência")
  if (/(mesmo elemento|same element|mismo elemento)/.test(todo) && !temElemento) v.push("fala de mesmo elemento, e não há ponto em comum de elemento na evidência")

  // ── 8 · o vínculo não cria relação ──────────────────────────────────────────
  const evidenciaTexto = semAcento([...payload.aspectos, ...payload.overlays].flatMap((d) => d.evidencia).concat(payload.semelhancas.flatMap((s) => s.nucleo)).join(" "))
  const declarado = ID_DO_VINCULO[payload.vinculo]
  for (const [tipo, regex] of Object.entries(TERMOS_DE_VINCULO)) {
    if (tipo === declarado) continue
    const m = todo.match(regex)
    if (m && !regex.test(evidenciaTexto)) v.push(`usa "${m[0]}", termo de relação ${tipo} que o vínculo declarado (${payload.vinculo}) e a evidência não trazem`)
  }

  const unicos = (l: string[]) => [...new Set(l)]
  if (v.length) return { ok: false, violacoes: unicos(v), avisos: unicos(avisos) }
  return { ok: true, sintese: blocos as SinteseSinastria, avisos: unicos(avisos) }
}
