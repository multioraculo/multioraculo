/**
 * O seletor determinístico de evidência da sinastria.
 *
 * Decide QUAIS FATOS entram na síntese e com que evidência do Davison. Não
 * decide se a relação é boa ou ruim, não produz nota, índice nem veredito, e
 * não recebe o vínculo: o vínculo poderá mudar a ênfase da apresentação, nunca
 * quais fatos existem nem a ordem em que eles competem.
 *
 * NÃO HÁ PONTUAÇÃO. A ordem é uma comparação lexicográfica por critérios
 * declarados e rotulados (`CRITERIOS`), cada um `fonte` (o livro o diz, com
 * página) ou `editorial` (decisão do Multioráculo). Dois fatos nunca são
 * somados nem ponderados: um critério só desempata o anterior.
 *
 * O UNIVERSO são só os fatos que o motor calculou e que valem no intervalo
 * inteiro das duas pessoas. Nada indisponível entra, e nenhuma frase do
 * repertório que dependa de condição natal não calculada vira evidência
 * (`condicoesPorItem`). Quando uma frase depende de "aspectos discordantes
 * entre os mapas", ela só vale se a relação tem ao menos um aspecto discordante.
 *
 * TRÊS CAMADAS, que não competem entre si:
 *  - aspectos A↔B (a camada principal: o livro diz que são o fator mais importante);
 *  - overlays e conjunções com Asc/MC (camada secundária, p. 93), cada uma com orçamento próprio;
 *  - semelhanças (pontos em comum), uma camada pequena e separada.
 *
 * DEDUPLICAÇÃO EXATA, não semântica. Fatos que usam a MESMA glosa do livro (a
 * Lua de A com Saturno de B e Saturno de A com a Lua de B são o mesmo par do
 * Davison) viram uma única dinâmica: o mais exato é a evidência principal, e os
 * outros entram como reforço. É o único agrupamento feito, porque é o único que
 * se prova sem interpretar. Agrupar por "tema" seria semântica frágil.
 *
 * DIVERSIDADE sem cota. Dentro do orçamento, escolhe-se pela ordem, mas uma
 * dinâmica que traz algo ainda não coberto (uma dimensão, ou o lado harmônico/
 * discordante) passa na frente de uma redundante. Não existe "dois de cada".
 */
import { glosaDaSemelhanca, glosaDoOverlay, glosasDoAspecto, ressalvasGeraisDeSemelhanca } from "./davison"
import type { CondicaoDoItem, Dimensao, GlosaDeOverlay, GlosaDePar, GlosaDeSemelhanca } from "./davison/tipos"
import { camposDeOverlay } from "./davison/validar"
import type { AspectoSinastria, FatoAspecto, FatoIndisponibilidade, FatoOverlay, FatoSemelhanca, ResultadoSinastria } from "./sinastria"

// ── os critérios, rotulados ─────────────────────────────────────────────────

export type Criterio = {
  id: string
  camada: "aspectos" | "overlays" | "semelhancas" | "geral"
  /** `fonte`: o Davison o afirma. `editorial`: decisão nossa, sem página. */
  origem: "fonte" | "editorial"
  pdfPagina: number | null
  texto: string
}

export const CRITERIOS: readonly Criterio[] = [
  { id: "orbe_menor", camada: "aspectos", origem: "fonte", pdfPagina: 56, texto: "Orbe menor, contato mais significativo (orbe em graus, não relativo ao limite)." },
  { id: "par_de_indice", camada: "aspectos", origem: "fonte", pdfPagina: 59, texto: "Sol/Lua, Mercúrio/Mercúrio e Vênus/Marte são os pares que o livro chama de índice (clássico, principal índice mental, principal indicador físico: p. 59, 71, 74)." },
  { id: "corpo_central", camada: "aspectos", origem: "fonte", pdfPagina: 54, texto: "Planetas e ângulos são o fator principal (p. 54) e os luminares abrem os pares (p. 59): aspecto com Sol, Lua, Asc ou MC vem antes. O livro diz que são centrais; a ordem entre eles e o orbe é nossa." },
  { id: "geracional_por_ultimo", camada: "aspectos", origem: "fonte", pdfPagina: 30, texto: "Aspecto entre dois planetas lentos (Urano, Netuno, Plutão) quase não informa entre contemporâneos (p. 30, 56): vem por último." },
  { id: "overlay_e_secundario", camada: "overlays", origem: "fonte", pdfPagina: 93, texto: "Overlays são camada secundária, depois dos aspectos (p. 93): têm orçamento próprio." },
  { id: "angulo_da_casa", camada: "overlays", origem: "fonte", pdfPagina: 93, texto: "Planeta de um sobre o Asc ou o MC do outro tem efeito evidente (p. 93, e cada leitura de casa o reforça na conjunção): vem primeiro entre os overlays." },
  { id: "varios_na_mesma_casa", camada: "overlays", origem: "fonte", pdfPagina: 96, texto: "Vários planetas de uma pessoa na mesma casa da outra aumentam o envolvimento com os assuntos da casa (p. 96)." },
  { id: "corroboracao_por_aspecto", camada: "overlays", origem: "editorial", pdfPagina: 95, texto: "O livro manda combinar a casa com o par de planetas (p. 95); aqui, overlay de planeta que já está num aspecto selecionado vem antes. A regra de ordem é nossa." },
  { id: "dedup_so_com_identidade_de_leitura", camada: "geral", origem: "editorial", pdfPagina: null, texto: "Só viram principal e reforços os fatos que partilham a mesma glosa, as mesmas frases do livro (logo a mesma valência, a mesma origem metodológica e o mesmo núcleo). Mesmo par planetário não basta: o fato que usa a leitura favorável e o que usa a adversa do mesmo par ficam separados." },
  { id: "corte_pela_ordem", camada: "geral", origem: "editorial", pdfPagina: null, texto: "A escolha é a ordem de relevância cortada pelo orçamento (um prefixo). Nada menos relevante passa à frente de algo mais relevante: nem por tamanho, nem por trazer um lado ou uma dimensão ainda não vistos." },
  { id: "trava_de_contraponto", camada: "aspectos", origem: "editorial", pdfPagina: null, texto: "Trava de anti-omissão, separada da relevância: se o universo tem aspectos harmônicos e discordantes utilizáveis e a seleção ficou só com um lado, o fato mais bem ordenado do lado ausente entra como contraponto, só se sobrar orçamento. Ninguém é retirado, nada é contado, não se busca equilíbrio." },
  { id: "sem_evidencia_nao_atravessa", camada: "geral", origem: "editorial", pdfPagina: null, texto: "Fato sem material interpretativo do livro (por exemplo, aspecto com Asc ou MC que não é conjunção) continua fato bruto e diagnóstico, mas não atravessa o seletor: o modelo nunca recebe um fato astrológico sem evidência e completa-o por conta própria." },
  { id: "orcamento_de_tokens", camada: "geral", origem: "editorial", pdfPagina: null, texto: "Cada camada tem um orçamento de tokens. É alvo de custo, não regra astrológica." },
  { id: "semelhanca_geracional_fora", camada: "semelhancas", origem: "fonte", pdfPagina: 30, texto: "Mesmo signo em Urano, Netuno ou Plutão é a geração, não a relação (p. 30): fora." },
  { id: "semelhanca_separada", camada: "semelhancas", origem: "editorial", pdfPagina: 32, texto: "Pontos em comum não competem com aspectos nem com overlays; o livro os trata como 'apenas um começo' (p. 32). Camada própria, sem pontuação." },
  { id: "vinculo_nao_entra", camada: "geral", origem: "editorial", pdfPagina: null, texto: "O vínculo não entra na seleção: nenhum fato, orbe ou ordem depende dele." },
] as const

/** Orçamento inicial de evidência específica da sinastria, em tokens. Alvo de custo, ajustado por simulação. */
export const ORCAMENTO_PADRAO = { aspectos: 2800, overlays: 1400, semelhancas: 300 } as const
export type Orcamento = { aspectos: number; overlays: number; semelhancas: number }

const CARACTERES_POR_TOKEN = 3.6
const TOKENS_POR_FATO = 28
const TOKENS_POR_REFORCO = 14
const TOKENS_POR_INDISPONIVEL = 12
const tokensDeTexto = (chars: number) => Math.ceil(chars / CARACTERES_POR_TOKEN)

const PARES_DE_INDICE: ReadonlySet<string> = new Set(["moon|sun", "mercury|mercury", "mars|venus"])
const LENTOS: ReadonlySet<string> = new Set(["uranus", "neptune", "pluto"])
const CENTRAIS: ReadonlySet<string> = new Set(["sun", "moon", "asc", "mc"])

// ── tipos de saída ──────────────────────────────────────────────────────────

export type ItemEvidencia = {
  ref: string
  texto: string
  tipo: "nucleo" | "tensao" | "excesso" | "elaboracao" | "papel" | "funcao" | "campo" | "reforco_de_angulo" | "ressalva"
  /** de onde vem a frase na glosa: a valência que o livro separa, a leitura geral, ou o aspecto específico */
  via: "favoravel" | "adverso" | "geral" | "especifico" | "overlay" | "semelhanca"
}

export type Evidencia = {
  glosa: string
  natureza: "interaspecto" | "overlay"
  itens: ItemEvidencia[]
  dimensoes: Dimensao[]
  /** quantas frases aplicáveis ficaram de fora por dependerem de condição natal não calculada */
  filtradasPorCondicaoNatal: number
  tokens: number
}

export type FatoDaDinamica = FatoAspecto | FatoOverlay

export type Dinamica = {
  /** a glosa do livro e a leitura que ela usa: "moon-venus:favoravel" (numerada se houver duas iguais) */
  id: string
  /** a glosa do livro que sustenta a dinâmica */
  glosaId: string
  camada: "aspectos" | "overlays"
  /** o fato mais exato do grupo */
  principal: FatoDaDinamica
  /** os demais fatos que usam a mesma glosa E as mesmas frases */
  reforcos: FatoDaDinamica[]
  /** toda dinâmica tem evidência: o que não tem não atravessa o seletor */
  evidencia: Evidencia
  /** categorias dos aspectos do grupo (nos overlays, vazio) */
  categorias: string[]
  tokens: number
  /** quais critérios a puseram onde está */
  porque: string[]
  /** entrou pela trava de anti-omissão, não pela ordem de relevância */
  contraponto: boolean
}

export type SemelhancaSelecionada = {
  fato: FatoSemelhanca
  /** a glosa do livro que a sustenta */
  glosaId: string
  itens: ItemEvidencia[]
  tokens: number
}

export type Descarte = {
  fato: string
  camada: "aspectos" | "overlays" | "semelhancas"
  motivo: "sem_evidencia_interpretativa" | "fora_do_orcamento" | "geracional"
  detalhe: string
}

export type Diagnostico = {
  /** fatos brutos que existem mas não têm material interpretativo: não vão para a síntese */
  semEvidenciaInterpretativa: string[]
  /** pares do livro que viravam uma dinâmica e hoje são várias, por leitura diferente */
  agrupamentosDesfeitos: number
  /** a trava de anti-omissão: acionada quando a seleção ficou só com um lado */
  contraponto: { lado: "harmonico" | "discordante"; dinamica: string; incluido: boolean } | null
  /** só informação: não influencia a seleção */
  dimensoesCobertas: Dimensao[]
}

export type SelecaoSinastria = {
  aspectos: Dinamica[]
  overlays: Dinamica[]
  /** os pontos em comum que têm glosa do livro; nenhum chega sem ela */
  semelhancas: SemelhancaSelecionada[]
  /** as ressalvas do livro sobre semelhança demais, uma vez só, quando alguma semelhança igual foi selecionada */
  ressalvasDasSemelhancas: ItemEvidencia[]
  /** o que o motor não pôde afirmar: passa inteiro, a síntese precisa saber */
  indisponibilidades: FatoIndisponibilidade[]
  descartes: Descarte[]
  orcamento: Orcamento
  tokens: { aspectos: number; overlays: number; semelhancas: number; indisponibilidades: number; total: number }
  /** frases do repertório filtradas por dependerem de condição natal, no total */
  filtradasPorCondicaoNatal: number
  diagnostico: Diagnostico
  versaoDosCriterios: string
}

export const VERSAO_SELECAO = "selecao-2026-10-b"

// ── evidência de um par ─────────────────────────────────────────────────────

type Contexto = { temDiscordante: boolean }

function sobrevive(g: { condicoesPorItem: Record<string, CondicaoDoItem> }, ref: string, ctx: Contexto): "sim" | "natal" | "aspectos" {
  const c = g.condicoesPorItem[ref]
  if (!c) return "sim"
  if (c.natal) return "natal"
  if (c.aspectos && !ctx.temDiscordante) return "aspectos"
  return "sim"
}

const CAMPOS_DA_VALENCIA = [
  ["nucleos", "nucleo"],
  ["tensoesPossiveis", "tensao"],
  ["excessosPossiveis", "excesso"],
  ["elaboracao", "elaboracao"],
] as const

function evidenciaDoPar(par: GlosaDePar, aspectos: ReadonlySet<AspectoSinastria>, ctx: Contexto): Evidencia {
  const itens: ItemEvidencia[] = []
  let filtradas = 0
  const incluidos = new Set<string>()
  const poe = (ref: string, texto: string, tipo: ItemEvidencia["tipo"], via: ItemEvidencia["via"]) => {
    const s = sobrevive(par, ref, ctx)
    if (s === "natal") { filtradas += 1; return }
    if (s === "aspectos") return
    itens.push({ ref, texto, tipo, via })
    incluidos.add(ref)
  }

  for (const lado of ["favoravel", "adverso"] as const) {
    const v = par[lado]
    if (!v || v.origem === "condicao_natal") continue
    const geral = v.origem === "leitura_geral" || v.origem === "agrupada_por_tema"
    const aplica = geral || [...aspectos].some((a) => v.aplicaA.includes(a))
    if (!aplica) continue
    for (const [campo, tipo] of CAMPOS_DA_VALENCIA) v[campo].forEach((t, i) => poe(`${lado}.${campo}[${i}]`, t, tipo, geral ? "geral" : lado))
  }
  par.especificos.forEach((e, i) => {
    if (!aspectos.has(e.aspecto)) return
    e.nucleos.forEach((t, j) => poe(`especificos[${i}].nucleos[${j}]`, t, "nucleo", "especifico"))
    e.tensoesPossiveis.forEach((t, j) => poe(`especificos[${i}].tensoesPossiveis[${j}]`, t, "tensao", "especifico"))
  })
  if (par.papeis) for (const [c, t] of Object.entries(par.papeis)) poe(`papeis.${c}`, t as string, "papel", "geral")

  const dims = new Set<Dimensao>()
  for (const lado of ["favoravel", "adverso"] as const) {
    for (const d of par[lado]?.dimensoes ?? []) {
      if (d.sustentadaPor.some((s) => incluidos.has(refDaDimensao(lado, s)))) dims.add(d.categoria)
    }
  }
  const chars = itens.reduce((n, i) => n + i.texto.length, 0)
  return { glosa: par.id, natureza: "interaspecto", itens, dimensoes: [...dims].sort(), filtradasPorCondicaoNatal: filtradas, tokens: tokensDeTexto(chars) }
}

/** "nucleos:0" dentro de uma valência vira a referência da glosa: "favoravel.nucleos[0]". */
const refDaDimensao = (lado: string, s: string) => {
  const [campo, i] = s.split(":")
  return `${lado}.${campo}[${i}]`
}

function evidenciaDoOverlay(g: GlosaDeOverlay, ctx: Contexto, comAngulo: boolean): Evidencia {
  const itens: ItemEvidencia[] = []
  let filtradas = 0
  const incluidos = new Set<string>()
  for (const c of camposDeOverlay(g)) {
    if (c.ref === "reforcoPorAngulo" && !comAngulo) continue
    const s = sobrevive(g, c.ref, ctx)
    if (s === "natal") { filtradas += 1; continue }
    if (s === "aspectos") continue
    const tipo: ItemEvidencia["tipo"] = c.ref === "funcaoIntroduzida" ? "funcao" : c.ref === "campoAtivado" ? "campo" : c.ref === "reforcoPorAngulo" ? "reforco_de_angulo" : c.ref.startsWith("facilidades") ? "nucleo" : c.ref.startsWith("tensoes") ? "tensao" : "excesso"
    itens.push({ ref: c.ref, texto: c.texto, tipo, via: "overlay" })
    incluidos.add(c.ref)
  }
  const dims = new Set<Dimensao>()
  for (const d of g.dimensoes) if (d.sustentadaPor.some((s) => incluidos.has(s.replace(/^(\w+):(\d+)$/, "$1[$2]")))) dims.add(d.categoria)
  const chars = itens.reduce((n, i) => n + i.texto.length, 0)
  return { glosa: g.id, natureza: "overlay", itens, dimensoes: [...dims].sort(), filtradasPorCondicaoNatal: filtradas, tokens: tokensDeTexto(chars) }
}

// ── evidência de uma semelhança ─────────────────────────────────────────────

const TOKENS_DE_FATO_DE_SEMELHANCA = 35

/**
 * O que a síntese recebe de uma glosa de semelhança: o NÚCLEO OPERACIONAL, não a glosa completa. A completa
 * continua guardada como material de auditoria. Assim o tamanho do texto do livro não decide se a semelhança
 * chega à síntese: o núcleo tem tamanho limitado e cada frase diz de quais frases da glosa completa ela vem.
 * A elegibilidade é a de antes (existe glosa e sobra evidência): só o tamanho do que se manda mudou.
 */
function itensDeSemelhanca(g: GlosaDeSemelhanca, f: FatoSemelhanca | null, ctx: Contexto): { itens: ItemEvidencia[]; filtradas: number; tokens: number } {
  const itens: ItemEvidencia[] = []
  let filtradas = 0
  const corpo = f?.dimensao === "signo_do_corpo" ? f.padraoA.split(":")[0] : null
  // uma frase operacional herda a condição das frases de que é condensação
  const poe = (ref: string, texto: string, tipo: ItemEvidencia["tipo"], via: ItemEvidencia["via"], deRefs: string[]) => {
    const estados = deRefs.map((r) => sobrevive(g, r, ctx))
    if (estados.includes("natal")) { filtradas += 1; return }
    if (estados.includes("aspectos")) return
    itens.push({ ref, texto, tipo, via })
  }
  g.nucleoOperacional.forEach((o, i) => poe(`nucleoOperacional[${i}]`, o.texto, "nucleo", "semelhanca", o.deRefs))
  g.nucleoOperacionalEspecifico?.forEach((o, i) => {
    if (corpo && o.corpos.includes(corpo)) poe(`nucleoOperacionalEspecifico[${i}]`, o.texto, "nucleo", "especifico", o.deRefs)
  })
  if (g.ressalvaOperacional) poe("ressalvaOperacional", g.ressalvaOperacional.texto, "ressalva", "semelhanca", g.ressalvaOperacional.deRefs)
  return { itens, filtradas, tokens: tokensDeTexto(itens.reduce((n, i) => n + i.texto.length, 0)) }
}

// ── comparação e escolha ────────────────────────────────────────────────────

type Lado = "harmonico" | "discordante" | null

type Grupo = {
  id: string
  glosaId: string
  camada: "aspectos" | "overlays"
  fatos: FatoDaDinamica[]
  evidencia: Evidencia
  tokens: number
  chave: Array<number | string>
  porque: string[]
  /** harmônico ou discordante quando TODOS os aspectos do grupo são do mesmo lado; senão, nenhum */
  lado: Lado
}

const par = (a: string, b: string) => [a, b].sort().join("|")
const ehAngulo = (id: string) => id === "asc" || id === "mc"

function chaveDoAspecto(f: FatoAspecto): { chave: Array<number | string>; porque: string[] } {
  const geracional = LENTOS.has(f.corpoA) && LENTOS.has(f.corpoB)
  const indice = PARES_DE_INDICE.has(par(f.corpoA, f.corpoB))
  const central = CENTRAIS.has(f.corpoA) || CENTRAIS.has(f.corpoB)
  const porque: string[] = []
  if (indice) porque.push("par_de_indice")
  if (central) porque.push("corpo_central")
  if (geracional) porque.push("geracional_por_ultimo")
  porque.push("orbe_menor")
  return { chave: [geracional ? 1 : 0, indice ? 0 : 1, central ? 0 : 1, f.orbe, f.id], porque }
}

function compara(a: Array<number | string>, b: Array<number | string>): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === b[i]) continue
    return a[i] < b[i] ? -1 : 1
  }
  return 0
}

/**
 * A escolha É A ORDEM DE RELEVÂNCIA, cortada pelo orçamento: um prefixo. Para
 * quando a próxima não cabe, e NÃO pula para uma menos relevante que caberia.
 * Assim nenhuma dinâmica menos relevante passa à frente de uma mais relevante,
 * por nenhuma razão: nem por tamanho, nem por trazer um lado ou uma dimensão
 * ainda não vista. O que sobra de orçamento só serve à trava de contraponto.
 */
function escolher(grupos: Grupo[], orcamento: number): { escolhidos: Grupo[]; fora: Grupo[]; gasto: number } {
  const ordenados = [...grupos].sort((x, y) => compara(x.chave, y.chave))
  const escolhidos: Grupo[] = []
  let gasto = 0
  let i = 0
  for (; i < ordenados.length; i++) {
    if (gasto + ordenados[i].tokens > orcamento) break
    escolhidos.push(ordenados[i])
    gasto += ordenados[i].tokens
  }
  return { escolhidos, fora: ordenados.slice(i), gasto }
}

const porExatidao = (a: FatoDaDinamica, b: FatoDaDinamica) => {
  const oa = "orbe" in a ? a.orbe : 0
  const ob = "orbe" in b ? b.orbe : 0
  return oa - ob || (a.id < b.id ? -1 : 1)
}

function emDinamica(g: Grupo, contraponto = false): Dinamica {
  const fatos = [...g.fatos].sort(porExatidao)
  return {
    id: g.id,
    glosaId: g.glosaId,
    camada: g.camada,
    principal: fatos[0],
    reforcos: fatos.slice(1),
    evidencia: g.evidencia,
    categorias: [...new Set(fatos.filter((f): f is FatoAspecto => f.tipo === "aspecto").map((f) => f.categoria))].sort(),
    tokens: g.tokens,
    porque: g.porque,
    contraponto,
  }
}

/** A que leitura do livro a evidência pertence: a valência que ela usa, sem contar os papéis, que são comuns. */
const leituraDe = (e: Evidencia) => [...new Set(e.itens.filter((i) => i.tipo !== "papel").map((i) => i.via))].sort().join("+") || "papeis"

// ── a seleção ───────────────────────────────────────────────────────────────

export function selecionarEvidencia(resultado: ResultadoSinastria, opcoes: { orcamento?: Partial<Orcamento> } = {}): SelecaoSinastria {
  const orcamento: Orcamento = { ...ORCAMENTO_PADRAO, ...opcoes.orcamento }
  const descartes: Descarte[] = []
  const semEvidenciaInterpretativa: string[] = []
  let filtradasTotal = 0

  // a entrada em ordem estável: o resultado não pode depender da ordem em que os fatos chegam
  const aspectos = [...resultado.aspectos].sort((a, b) => (a.id < b.id ? -1 : 1))
  const overlays = [...resultado.overlays].sort((a, b) => (a.id < b.id ? -1 : 1))
  const ctx: Contexto = { temDiscordante: aspectos.some((f) => f.categoria === "discordante") }
  const barra = (f: FatoAspecto | FatoOverlay, detalhe: string) => {
    semEvidenciaInterpretativa.push(f.id)
    descartes.push({ fato: f.id, camada: f.tipo === "aspecto" ? "aspectos" : "overlays", motivo: "sem_evidencia_interpretativa", detalhe })
  }

  // ── camada de aspectos ────────────────────────────────────────────────────
  // O agrupamento só junta fatos que partilham a MESMA glosa, as MESMAS frases do livro (logo a mesma
  // valência, a mesma origem metodológica e o mesmo núcleo). Fato que usa a leitura favorável e fato que
  // usa a adversa do mesmo par ficam separados, porque a fonte lhes dá leituras diferentes.
  const gruposDeAspecto = new Map<string, { glosaId: string; fatos: FatoAspecto[]; evidencia: Evidencia }>()
  const parGrupos = new Map<string, Set<string>>()
  const gruposDeOverlay = new Map<string, FatoDaDinamica[]>()
  const poeOverlay = (glosa: string, f: FatoDaDinamica) => gruposDeOverlay.set(glosa, [...(gruposDeOverlay.get(glosa) ?? []), f])

  for (const f of aspectos) {
    const angulo = ehAngulo(f.corpoA) || ehAngulo(f.corpoB)
    if (angulo && f.aspecto === "conjunction") {
      // o livro trata o planeta sobre o ângulo dentro da casa 1 (Asc) ou 10 (MC) de quem o tem
      const [corpo, ang] = ehAngulo(f.corpoA) ? [f.corpoB, f.corpoA] : [f.corpoA, f.corpoB]
      poeOverlay(`${corpo}@casa${ang === "asc" ? 1 : 10}`, f)
      continue
    }
    if (angulo) {
      // aspecto com Asc/MC que não é conjunção: o livro não tem leitura para ele. Continua um fato bruto,
      // mas não atravessa o seletor: o modelo nunca recebe um fato astrológico sem material interpretativo.
      barra(f, "aspecto com Asc ou MC que não é conjunção: o livro só trata o ângulo dentro das casas 1 e 10")
      continue
    }
    const glosa = glosasDoAspecto(f)
    const evidencia = glosa ? evidenciaDoPar(glosa.par, new Set([f.aspecto]), ctx) : null
    if (evidencia) filtradasTotal += evidencia.filtradasPorCondicaoNatal
    if (!glosa || !evidencia || evidencia.itens.length === 0) {
      barra(f, !glosa ? "o livro não tem glosa para este par" : "toda a evidência do par depende de condição natal não calculada")
      continue
    }
    const assinatura = `${glosa.par.id}|${evidencia.itens.map((i) => i.ref).join(",")}`
    const g = gruposDeAspecto.get(assinatura) ?? { glosaId: glosa.par.id, fatos: [], evidencia }
    g.fatos.push(f)
    gruposDeAspecto.set(assinatura, g)
    parGrupos.set(glosa.par.id, (parGrupos.get(glosa.par.id) ?? new Set()).add(assinatura))
  }
  // quantos pares do livro que antes viravam UMA dinâmica agora são várias, por leitura diferente
  const agrupamentosDesfeitos = [...parGrupos.values()].filter((s) => s.size > 1).length

  const candidatosDeAspecto: Grupo[] = []
  // o id de uma dinâmica é a glosa do livro e a leitura que ela usa; se duas têm a mesma, numera-se
  const porIdBase = new Map<string, string[]>()
  for (const [assinatura, g] of gruposDeAspecto) {
    const base = `${g.glosaId}:${leituraDe(g.evidencia)}`
    porIdBase.set(base, [...(porIdBase.get(base) ?? []), assinatura].sort())
  }
  for (const [assinatura, g] of gruposDeAspecto) {
    const principal = [...g.fatos].sort(porExatidao)[0]
    const { chave: ordem, porque } = chaveDoAspecto(principal)
    const cats = new Set(g.fatos.map((f) => f.categoria))
    const base = `${g.glosaId}:${leituraDe(g.evidencia)}`
    const irmaos = porIdBase.get(base) ?? []
    candidatosDeAspecto.push({
      id: irmaos.length > 1 ? `${base}#${irmaos.indexOf(assinatura) + 1}` : base,
      glosaId: g.glosaId,
      camada: "aspectos",
      fatos: g.fatos,
      evidencia: g.evidencia,
      tokens: g.evidencia.tokens + TOKENS_POR_FATO + TOKENS_POR_REFORCO * (g.fatos.length - 1),
      chave: ordem,
      porque,
      lado: cats.size === 1 && cats.has("harmonico") ? "harmonico" : cats.size === 1 && cats.has("discordante") ? "discordante" : null,
    })
  }
  const { escolhidos: aspEsc, fora: aspFora, gasto: gastoAsp } = escolher(candidatosDeAspecto, orcamento.aspectos)

  // ── a trava de anti-omissão (não é balanceamento) ─────────────────────────
  // Se o universo tem material harmônico e discordante utilizável e a seleção ficou só com um lado,
  // o fato mais bem ordenado do lado ausente entra como contraponto, SE houver orçamento sobrando.
  // Ninguém é retirado, nada é contado, e não se busca equilíbrio: só se evita apagar um lado inteiro.
  const ladosDoUniverso = new Set(candidatosDeAspecto.map((g) => g.lado).filter(Boolean))
  const ladosEscolhidos = new Set(aspEsc.map((g) => g.lado).filter(Boolean))
  let contraponto: Diagnostico["contraponto"] = null
  const contrapontoEscolhido: Grupo[] = []
  if (ladosDoUniverso.has("harmonico") && ladosDoUniverso.has("discordante") && ladosEscolhidos.size === 1) {
    const ausente: Lado = ladosEscolhidos.has("harmonico") ? "discordante" : "harmonico"
    const melhor = aspFora.find((g) => g.lado === ausente)
    if (melhor) {
      const cabe = gastoAsp + melhor.tokens <= orcamento.aspectos
      contraponto = { lado: ausente as "harmonico" | "discordante", dinamica: melhor.id, incluido: cabe }
      if (cabe) contrapontoEscolhido.push(melhor)
    }
  }
  const foraFinal = aspFora.filter((g) => !contrapontoEscolhido.includes(g))
  for (const g of foraFinal) {
    const ehContraponto = contraponto && !contraponto.incluido && g.id === contraponto.dinamica
    for (const f of g.fatos) {
      descartes.push({
        fato: f.id,
        camada: "aspectos",
        motivo: "fora_do_orcamento",
        detalhe: ehContraponto ? `contraponto disponível mas não selecionado por orçamento (lado ${contraponto!.lado}, dinâmica ${g.id})` : `a dinâmica ${g.id} não coube nos ${orcamento.aspectos} tokens da camada`,
      })
    }
  }

  // ── camada de overlays ────────────────────────────────────────────────────
  for (const o of overlays) poeOverlay(`${o.planeta}@casa${o.casa}`, o)
  const todosEscolhidosDeAspecto = [...aspEsc, ...contrapontoEscolhido]
  const corpos = new Set(todosEscolhidosDeAspecto.flatMap((d) => d.fatos.flatMap((f) => (f.tipo === "aspecto" ? [f.corpoA, f.corpoB] : []))))
  const ocupacao = (o: FatoOverlay) => overlays.filter((x) => x.donoDoPlaneta === o.donoDoPlaneta && x.donoDaCasa === o.donoDaCasa && x.casa === o.casa).length

  const candidatosDeOverlay: Grupo[] = []
  for (const [glosaId, fatos] of [...gruposDeOverlay].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const g = glosaDoOverlay(glosaId.split("@")[0], Number(glosaId.split("casa")[1]))
    const comAngulo = fatos.some((f) => f.tipo === "aspecto")
    const evidencia = g ? evidenciaDoOverlay(g, ctx, comAngulo) : null
    if (evidencia) filtradasTotal += evidencia.filtradasPorCondicaoNatal
    if (!g || !evidencia || evidencia.itens.length === 0) {
      for (const f of fatos) barra(f, "sem glosa utilizável para este overlay")
      continue
    }
    const multi = Math.max(0, ...fatos.filter((f): f is FatoOverlay => f.tipo === "overlay").map(ocupacao))
    const corrobora = corpos.has(g.planeta)
    const porque: string[] = []
    if (comAngulo) porque.push("angulo_da_casa")
    if (multi >= 2) porque.push("varios_na_mesma_casa")
    if (corrobora) porque.push("corroboracao_por_aspecto")
    candidatosDeOverlay.push({
      id: glosaId,
      glosaId,
      camada: "overlays",
      fatos,
      evidencia,
      tokens: evidencia.tokens + TOKENS_POR_FATO + TOKENS_POR_REFORCO * (fatos.length - 1),
      chave: [comAngulo ? 0 : 1, -multi, corrobora ? 0 : 1, glosaId],
      porque,
      lado: null,
    })
  }
  const { escolhidos: ovEsc, fora: ovFora } = escolher(candidatosDeOverlay, orcamento.overlays)
  for (const g of ovFora) for (const f of g.fatos) descartes.push({ fato: f.id, camada: "overlays", motivo: "fora_do_orcamento", detalhe: `a dinâmica ${g.id} não coube nos ${orcamento.overlays} tokens da camada` })

  // ── semelhanças: camada própria, sem competir com as outras ───────────────
  // Calculável não é interpretável: uma semelhança só atravessa se o livro tem material para ela. As que
  // não têm continuam fatos brutos, vão ao diagnóstico, não gastam orçamento e não são "ponto em comum"
  // narrável. A ordem e o corte da camada são os de antes.
  const semelhancas: SemelhancaSelecionada[] = []
  let gastoSem = 0
  const geral = ressalvasGeraisDeSemelhanca()
  const itensGerais: ItemEvidencia[] = geral ? itensDeSemelhanca(geral, null, ctx).itens : []
  const custoGeral = tokensDeTexto(itensGerais.reduce((n, i) => n + i.texto.length, 0))
  let geraisIncluidas = false
  // ordem da camada (editorial): elemento, elemento do Sol, modo, e depois o mesmo corpo no mesmo
  // signo, com os rápidos antes dos intermediários. Sem ela o orçamento cortaria por ordem alfabética.
  const rankDim: Record<string, number> = { elemento: 0, elemento_do_sol: 1, modo: 2, signo_do_corpo: 3 }
  const rankClasse: Record<string, number> = { rapido: 0, intermediario: 1, geracional: 2 }
  const ordemSem = (s: FatoSemelhanca) => [rankDim[s.dimensao] ?? 9, rankClasse[s.classe ?? ""] ?? 0, s.id] as Array<number | string>
  for (const s of [...resultado.semelhancas].sort((a, b) => compara(ordemSem(a), ordemSem(b)))) {
    if (s.dimensao === "signo_do_corpo" && s.classe === "geracional") {
      descartes.push({ fato: s.id, camada: "semelhancas", motivo: "geracional", detalhe: "o mesmo signo num planeta lento é a geração, não a relação" })
      continue
    }
    const glosa = glosaDaSemelhanca(s)
    const ev = glosa ? itensDeSemelhanca(glosa, s, ctx) : null
    if (ev) filtradasTotal += ev.filtradas
    if (!glosa || !ev || ev.itens.length === 0) {
      semEvidenciaInterpretativa.push(s.id)
      descartes.push({
        fato: s.id,
        camada: "semelhancas",
        motivo: "sem_evidencia_interpretativa",
        detalhe: !glosa ? "o livro não tem leitura para esta semelhança: é calculável, não interpretável" : "toda a leitura do livro para esta semelhança depende de condição natal não calculada",
      })
      continue
    }
    const custo = TOKENS_DE_FATO_DE_SEMELHANCA + ev.tokens + (s.tipoDeSemelhanca === "igual" && !geraisIncluidas ? custoGeral : 0)
    if (gastoSem + custo > orcamento.semelhancas) {
      descartes.push({ fato: s.id, camada: "semelhancas", motivo: "fora_do_orcamento", detalhe: `não coube nos ${orcamento.semelhancas} tokens da camada` })
      continue
    }
    if (s.tipoDeSemelhanca === "igual") geraisIncluidas = true
    semelhancas.push({ fato: s, glosaId: glosa.id, itens: ev.itens, tokens: custo })
    gastoSem += custo
  }

  // a saída segue a ordem de relevância; o contraponto fica marcado
  const aspectosFinais = [...aspEsc.map((g) => emDinamica(g)), ...contrapontoEscolhido.map((g) => emDinamica(g, true))].sort((x, y) => {
    const gx = [...aspEsc, ...contrapontoEscolhido].find((g) => g.id === x.id)!
    const gy = [...aspEsc, ...contrapontoEscolhido].find((g) => g.id === y.id)!
    return compara(gx.chave, gy.chave)
  })
  const overlaysFinais = ovEsc.map((g) => emDinamica(g))
  const indisponibilidades = [...resultado.indisponibilidades].sort((a, b) => (`${a.pessoa}${a.item}` < `${b.pessoa}${b.item}` ? -1 : 1))
  const tokens = {
    aspectos: aspectosFinais.reduce((n, d) => n + d.tokens, 0),
    overlays: overlaysFinais.reduce((n, d) => n + d.tokens, 0),
    semelhancas: gastoSem,
    indisponibilidades: indisponibilidades.length * TOKENS_POR_INDISPONIVEL,
    total: 0,
  }
  tokens.total = tokens.aspectos + tokens.overlays + tokens.semelhancas + tokens.indisponibilidades

  const dimensoesCobertas = [...new Set([...aspectosFinais, ...overlaysFinais].flatMap((d) => d.evidencia.dimensoes))].sort()
  return {
    aspectos: aspectosFinais,
    overlays: overlaysFinais,
    semelhancas,
    ressalvasDasSemelhancas: geraisIncluidas ? itensGerais : [],
    indisponibilidades,
    descartes,
    orcamento,
    tokens,
    filtradasPorCondicaoNatal: filtradasTotal,
    diagnostico: { semEvidenciaInterpretativa: semEvidenciaInterpretativa.sort(), agrupamentosDesfeitos, contraponto, dimensoesCobertas },
    versaoDosCriterios: VERSAO_SELECAO,
  }
}

/**
 * O quanto custaria mandar TUDO que tem evidência: cada fato com a sua evidência, sem agrupar nem
 * escolher. Os fatos sem evidência interpretativa não contam, porque nunca seriam mandados. Só serve
 * de comparação com a seleção. Mesmo contador de tokens.
 */
export function tokensSeMandasseTudo(resultado: ResultadoSinastria): { tokens: number; fatos: number } {
  const ctx: Contexto = { temDiscordante: resultado.aspectos.some((f) => f.categoria === "discordante") }
  let tokens = 0
  let fatos = 0
  for (const f of resultado.aspectos) {
    const angulo = ehAngulo(f.corpoA) || ehAngulo(f.corpoB)
    if (angulo) {
      if (f.aspecto !== "conjunction") continue
      const [corpo, ang] = ehAngulo(f.corpoA) ? [f.corpoB, f.corpoA] : [f.corpoA, f.corpoB]
      const g = glosaDoOverlay(corpo, ang === "asc" ? 1 : 10)
      if (!g) continue
      fatos += 1
      tokens += TOKENS_POR_FATO + evidenciaDoOverlay(g, ctx, true).tokens
      continue
    }
    const glosa = glosasDoAspecto(f)
    if (!glosa) continue
    const e = evidenciaDoPar(glosa.par, new Set([f.aspecto]), ctx)
    if (e.itens.length === 0) continue
    fatos += 1
    tokens += TOKENS_POR_FATO + e.tokens
  }
  for (const o of resultado.overlays) {
    const g = glosaDoOverlay(o.planeta, o.casa)
    if (!g) continue
    fatos += 1
    tokens += TOKENS_POR_FATO + evidenciaDoOverlay(g, ctx, false).tokens
  }
  for (const f of resultado.semelhancas) {
    if (f.dimensao === "signo_do_corpo" && f.classe === "geracional") continue
    const g = glosaDaSemelhanca(f)
    if (!g) continue
    const ev = itensDeSemelhanca(g, f, ctx)
    if (ev.itens.length === 0) continue
    fatos += 1
    tokens += TOKENS_DE_FATO_DE_SEMELHANCA + ev.tokens
  }
  tokens += resultado.indisponibilidades.length * TOKENS_POR_INDISPONIVEL
  return { tokens, fatos }
}
