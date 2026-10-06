/**
 * Validação estrutural das glosas do Davison. Serve a dois momentos:
 *
 *  - `scripts/checar-fatia-davison.ts`, que quem redige uma fatia roda sobre o
 *    próprio rascunho, com a fonte local na mão;
 *  - `scripts/verify-sinastria-referencias.ts`, que roda no build sobre os
 *    dados já montados.
 *
 * É TRAVA, não revisão. Confere forma, cobertura, ligação com a fonte e as
 * palavras que não podem aparecer. Não confere se a paráfrase é fiel: para isso
 * existe a auditoria (trecho → núcleo → descarte), que um leitor lê.
 */
import { ASPECTOS_SINASTRIA } from "../sinastria"
import { CONSELHO, PREVISAO, PROIBIDAS, TRACOS } from "../editorial"
import {
  CATEGORIAS_DE_DESCARTE,
  CORPOS,
  DIMENSOES,
  LIMITES_DE_TEXTO,
  PADROES_BANIDOS,
  type Corpo,
  type GlosaDeOverlay,
  type GlosaDePar,
  type Valencia,
} from "./tipos"

export const norm = (s: string) => s.replace(/\s+/g, " ").trim()

export type Auditoria = {
  /** até 30 palavras literais do começo da leitura; só na auditoria local, nunca no repositório */
  ancora?: string
  trechos: Array<{ ref: string; literal: string; preservado: string }>
  descartes: Array<{ categoria: string; literal: string; motivo: string }>
}

const NOMES_DE_CORPO = /\b(sol|lua|merc[úu]rio|v[êe]nus|marte|j[úu]piter|saturno|urano|netuno|plut[ãa]o)\b/gi

/** O texto passa nas travas da camada operacional? Devolve os motivos de recusa. */
export function problemasDeTexto(texto: string): string[] {
  const p: string[] = []
  if (typeof texto !== "string") return ["não é texto"]
  const t = texto.trim()
  if (t.length < LIMITES_DE_TEXTO.min) p.push(`curto demais (${t.length})`)
  if (t.length > LIMITES_DE_TEXTO.max) p.push(`longo demais (${t.length} > ${LIMITES_DE_TEXTO.max})`)
  for (const { nome, regex } of PADROES_BANIDOS) {
    const m = t.match(regex)
    if (m) p.push(`${nome}: "${m[0]}"`)
  }
  for (const r of [...PROIBIDAS.pt, ...PREVISAO.pt, ...CONSELHO.pt]) {
    const m = t.match(r)
    if (m) p.push(`regra editorial: "${m[0].trim()}"`)
  }
  if (TRACOS.test(t)) p.push("travessão ou meia risca")
  return p
}

export type Campo = { ref: string; texto: string }

/**
 * Condição natal no texto: aflição, debilidade, dignidade. "Aflições" sozinha,
 * no sentido de angústia ("confiar-lhe suas aflições"), não conta.
 */
export const RE_CONDICAO_NATAL = /(afligid\w*|aflit[oa]s?|debilit\w*|dignidade|dignific\w*|exaltad\w*|detriment\w*|sem aflições?|sob aflição|havendo aflições|(fortes|severas|poucas|muitas) aflições)/i
/** Aspectos difíceis entre os dois mapas, como condição de uma frase. */
export const RE_CONDICAO_ASPECTOS = /aspectos?\s+(entre os mapas\s+)?(discordantes|desfavor\w+|dif[íi]ce\w+|adversos?)/i

export function condicaoDoTexto(texto: string): { natal: boolean; aspectos: boolean } {
  return { natal: RE_CONDICAO_NATAL.test(texto), aspectos: RE_CONDICAO_ASPECTOS.test(texto) }
}

/**
 * Toda frase que menciona uma condição tem de estar marcada como condicionada,
 * e nenhuma marca pode apontar para frase que não exista. É o que impede uma
 * possibilidade que depende de condição natal de passar por fato da relação.
 */
export function problemasDeCondicao(campos: Campo[], marcas: Record<string, { natal: boolean; aspectos: boolean }> | undefined): string[] {
  const s: string[] = []
  const m = marcas ?? {}
  for (const c of campos) {
    const real = condicaoDoTexto(c.texto)
    const marca = m[c.ref]
    if (real.natal && !marca?.natal) s.push(`"${c.ref}" depende da condição natal e não está marcada`)
    if (real.aspectos && !marca?.aspectos) s.push(`"${c.ref}" depende de aspectos entre os mapas e não está marcada`)
  }
  for (const k of Object.keys(m)) if (!campos.some((c) => c.ref === k)) s.push(`marca de condição aponta para "${k}", que não existe`)
  return s
}

/** Todas as frases operacionais de uma glosa de par, com o nome pelo qual a auditoria as cita. */
export function camposDePar(g: GlosaDePar): Campo[] {
  const saida: Campo[] = []
  const lista = (prefixo: string, nome: string, xs: string[]) => xs.forEach((x, i) => saida.push({ ref: `${prefixo}${nome}[${i}]`, texto: x }))
  for (const lado of ["favoravel", "adverso"] as const) {
    const v = g[lado]
    if (!v) continue
    lista(`${lado}.`, "nucleos", v.nucleos)
    lista(`${lado}.`, "tensoesPossiveis", v.tensoesPossiveis)
    lista(`${lado}.`, "excessosPossiveis", v.excessosPossiveis)
    lista(`${lado}.`, "elaboracao", v.elaboracao)
  }
  g.especificos.forEach((e, i) => {
    lista(`especificos[${i}].`, "nucleos", e.nucleos)
    lista(`especificos[${i}].`, "tensoesPossiveis", e.tensoesPossiveis)
  })
  if (g.papeis) for (const [c, t] of Object.entries(g.papeis)) saida.push({ ref: `papeis.${c}`, texto: t as string })
  return saida
}

export function camposDeOverlay(g: GlosaDeOverlay): Campo[] {
  const saida: Campo[] = [
    { ref: "funcaoIntroduzida", texto: g.funcaoIntroduzida },
    { ref: "campoAtivado", texto: g.campoAtivado },
  ]
  g.facilidades.forEach((x, i) => saida.push({ ref: `facilidades[${i}]`, texto: x }))
  g.tensoes.forEach((x, i) => saida.push({ ref: `tensoes[${i}]`, texto: x }))
  g.excessosPossiveis.forEach((x, i) => saida.push({ ref: `excessosPossiveis[${i}]`, texto: x }))
  if (g.reforcoPorAngulo) saida.push({ ref: "reforcoPorAngulo", texto: g.reforcoPorAngulo })
  return saida
}

function validarDimensoes(rotulo: string, dims: Array<{ categoria: string; sustentadaPor: string[]; justificativa: string }>, tamanhos: Record<string, number>, saida: string[]) {
  if (!Array.isArray(dims) || dims.length === 0) {
    saida.push(`${rotulo}: nenhuma dimensão sustentada`)
    return
  }
  const vistas = new Set<string>()
  for (const d of dims) {
    if (!(DIMENSOES as readonly string[]).includes(d.categoria)) saida.push(`${rotulo}: dimensão inválida "${d.categoria}"`)
    if (vistas.has(d.categoria)) saida.push(`${rotulo}: dimensão repetida "${d.categoria}"`)
    vistas.add(d.categoria)
    if (!Array.isArray(d.sustentadaPor) || d.sustentadaPor.length === 0) saida.push(`${rotulo}/${d.categoria}: sem o conteúdo que a sustenta`)
    for (const s of d.sustentadaPor ?? []) {
      const m = /^([a-zA-Z]+):(\d+)$/.exec(s)
      if (!m || !(m[1] in tamanhos) || Number(m[2]) >= tamanhos[m[1]]) saida.push(`${rotulo}/${d.categoria}: "${s}" não aponta para conteúdo existente`)
    }
    const j = String(d.justificativa ?? "")
    const semPlaneta = j.replace(NOMES_DE_CORPO, " ").trim()
    if (j.length < 25 || semPlaneta.split(/\s+/).filter((w) => w.length > 2).length < 4) {
      saida.push(`${rotulo}/${d.categoria}: justificativa não diz que conteúdo sustenta a dimensão (atribuir por planeta não vale)`)
    }
  }
}

function validarValencia(rotulo: string, v: Valencia, saida: string[]) {
  if (!v.classeOriginal || v.classeOriginal.trim().length < 5) saida.push(`${rotulo}: classe original ausente`)
  if (!["separada_pela_fonte", "leitura_geral", "agrupada_por_tema", "condicao_natal"].includes(v.origem)) saida.push(`${rotulo}: origem inválida "${v.origem}"`)
  if (!Array.isArray(v.aplicaA) || v.aplicaA.some((a) => !(ASPECTOS_SINASTRIA as readonly string[]).includes(a))) saida.push(`${rotulo}: aplicaA inválido`)
  else if (v.origem === "condicao_natal") {
    if (v.aplicaA.length !== 0) saida.push(`${rotulo}: leitura por condição natal não se aplica a aspecto algum`)
  } else if (v.origem === "leitura_geral") {
    if (v.aplicaA.length !== 6) saida.push(`${rotulo}: leitura geral vale para os seis aspectos`)
  } else if (v.aplicaA.length === 0) saida.push(`${rotulo}: aplicaA vazio`)
  if (!Array.isArray(v.nucleos) || v.nucleos.length === 0) saida.push(`${rotulo}: sem núcleo`)
  for (const campo of ["nucleos", "tensoesPossiveis", "excessosPossiveis", "elaboracao"] as const) {
    const xs = v[campo]
    if (!Array.isArray(xs)) { saida.push(`${rotulo}.${campo}: não é lista`); continue }
    if (xs.length > LIMITES_DE_TEXTO.maxItens) saida.push(`${rotulo}.${campo}: mais de ${LIMITES_DE_TEXTO.maxItens} itens`)
    if (new Set(xs.map((x) => norm(x).toLowerCase())).size !== xs.length) saida.push(`${rotulo}.${campo}: item repetido`)
  }
  validarDimensoes(rotulo, v.dimensoes, { nucleos: v.nucleos?.length ?? 0, tensoesPossiveis: v.tensoesPossiveis?.length ?? 0, excessosPossiveis: v.excessosPossiveis?.length ?? 0, elaboracao: v.elaboracao?.length ?? 0 }, saida)
}

/** A forma da glosa de um par, sem olhar para a fonte. */
export function problemasDePar(g: GlosaDePar): string[] {
  const s: string[] = []
  const [a, b] = g.corpos ?? []
  if (!CORPOS.includes(a as Corpo) || !CORPOS.includes(b as Corpo)) s.push("corpos inválidos")
  if (g.id !== `${a}-${b}`) s.push(`id "${g.id}" não bate com os corpos`)
  if (g.simetria !== "simetrico" && g.simetria !== "assimetrico") s.push("simetria inválida")
  if (g.simetria === "assimetrico") {
    if (a === b) s.push("par do mesmo corpo não pode ser assimétrico")
    if (!g.papeis || !g.papeis[a as Corpo] || !g.papeis[b as Corpo]) s.push("assimétrico exige o papel dos dois corpos")
  } else if (g.papeis) s.push("simétrico não leva papéis")

  for (const lado of ["favoravel", "adverso"] as const) {
    const v = g[lado]
    if (v === null) {
      if (!g.limitacoes?.some((l) => l.toLowerCase().includes(lado === "favoravel" ? "favor" : "advers"))) s.push(`${lado} ausente sem limitação que o explique`)
    } else validarValencia(lado, v, s)
  }
  if (!g.favoravel && !g.adverso) s.push("nenhuma valência")

  g.especificos?.forEach((e, i) => {
    if (!(ASPECTOS_SINASTRIA as readonly string[]).includes(e.aspecto)) s.push(`especificos[${i}]: aspecto inválido`)
    if (!["favoravel", "adverso", "ambos"].includes(e.em)) s.push(`especificos[${i}]: "em" inválido`)
    if (e.nucleos.length + e.tensoesPossiveis.length === 0) s.push(`especificos[${i}]: vazio`)
  })
  g.dependeDaCondicaoNatal?.forEach((d, i) => {
    if (!d.nota || d.nota.trim().length < 10) s.push(`dependeDaCondicaoNatal[${i}]: nota vazia`)
    if (![...CORPOS, "ambos", "par"].includes(d.de as string)) s.push(`dependeDaCondicaoNatal[${i}]: "de" inválido`)
  })
  for (const { ref, texto } of camposDePar(g)) for (const p of problemasDeTexto(texto)) s.push(`${ref}: ${p}`)
  s.push(...problemasDeCondicao(camposDePar(g), g.condicoesPorItem))
  for (const d of g.descartes ?? []) {
    if (!(CATEGORIAS_DE_DESCARTE as readonly string[]).includes(d.categoria)) s.push(`descarte: categoria inválida "${d.categoria}"`)
    if (!d.motivo || d.motivo.trim().length < 8) s.push("descarte: motivo vazio")
  }
  return s
}

/** A forma da glosa de um overlay, sem olhar para a fonte. */
export function problemasDeOverlay(g: GlosaDeOverlay): string[] {
  const s: string[] = []
  if (!CORPOS.includes(g.planeta)) s.push("planeta inválido")
  if (!Number.isInteger(g.casa) || g.casa < 1 || g.casa > 12) s.push("casa fora de 1 a 12")
  if (g.id !== `${g.planeta}@casa${g.casa}`) s.push(`id "${g.id}" não bate com planeta e casa`)
  if (!g.funcaoIntroduzida) s.push("função introduzida ausente")
  if (!g.campoAtivado) s.push("campo ativado ausente")
  if (g.facilidades.length + g.tensoes.length === 0) s.push("nem facilidade nem tensão")
  for (const campo of ["facilidades", "tensoes", "excessosPossiveis"] as const) {
    const xs = g[campo]
    if (!Array.isArray(xs)) { s.push(`${campo}: não é lista`); continue }
    if (xs.length > LIMITES_DE_TEXTO.maxItens) s.push(`${campo}: mais de ${LIMITES_DE_TEXTO.maxItens} itens`)
    if (new Set(xs.map((x) => norm(x).toLowerCase())).size !== xs.length) s.push(`${campo}: item repetido`)
  }
  validarDimensoes("overlay", g.dimensoes, { facilidades: g.facilidades.length, tensoes: g.tensoes.length, excessosPossiveis: g.excessosPossiveis.length }, s)
  g.condicionadoPor?.forEach((c, i) => {
    if (!["aspectos_entre_os_mapas", "condicao_natal_do_planeta", "tipo_de_relacao", "idade_ou_contexto"].includes(c.tipo)) s.push(`condicionadoPor[${i}]: tipo inválido`)
    if (!c.nota || c.nota.trim().length < 10) s.push(`condicionadoPor[${i}]: nota vazia`)
  })
  for (const { ref, texto } of camposDeOverlay(g)) for (const p of problemasDeTexto(texto)) s.push(`${ref}: ${p}`)
  s.push(...problemasDeCondicao(camposDeOverlay(g), g.condicoesPorItem))
  for (const d of g.descartes ?? []) {
    if (!(CATEGORIAS_DE_DESCARTE as readonly string[]).includes(d.categoria)) s.push(`descarte: categoria inválida "${d.categoria}"`)
    if (!d.motivo || d.motivo.trim().length < 8) s.push("descarte: motivo vazio")
  }
  return s
}

/**
 * A auditoria de uma entrada: todo trecho citado existe na fonte, e TODA frase
 * operacional da glosa tem pelo menos um trecho que a sustenta. É a ligação
 * inequívoca entre glosa e fonte.
 */
export function problemasDeAuditoria(auditoria: Auditoria, campos: Campo[], textoDaFonte: string, ancora: string): string[] {
  const s: string[] = []
  const fonte = norm(textoDaFonte)
  if (!ancora || ancora.split(/\s+/).length > 30 || !fonte.includes(norm(ancora))) s.push("âncora ausente, longa demais ou não encontrada na fonte")

  const cobertos = new Set<string>()
  for (const t of auditoria?.trechos ?? []) {
    if (!campos.some((c) => c.ref === t.ref)) s.push(`auditoria cita "${t.ref}", que não existe na glosa`)
    if (!t.literal || !fonte.includes(norm(t.literal))) s.push(`trecho de "${t.ref}" não está na fonte`)
    if (t.literal && t.literal.length > 900) s.push(`trecho de "${t.ref}" longo demais`)
    if (!t.preservado || t.preservado.trim().length < 8) s.push(`"${t.ref}" sem o núcleo preservado`)
    cobertos.add(t.ref)
  }
  for (const c of campos) if (!cobertos.has(c.ref)) s.push(`"${c.ref}" não tem trecho da fonte que a sustente`)

  for (const d of auditoria?.descartes ?? []) {
    if (!(CATEGORIAS_DE_DESCARTE as readonly string[]).includes(d.categoria)) s.push(`descarte: categoria inválida "${d.categoria}"`)
    if (!d.literal || !fonte.includes(norm(d.literal))) s.push(`descarte "${d.categoria}": trecho não está na fonte`)
    if (!d.motivo || d.motivo.trim().length < 8) s.push(`descarte "${d.categoria}": motivo vazio`)
  }
  return s
}
