/**
 * O verificador ESTRUTURAL da leitura relacional: o que se pode garantir por
 * código sobre a interpretação do encontro.
 *
 * Reaproveita, sem enfraquecer, as regras que já cobram os nove blocos:
 * dono trocado, aspecto e casa inexistentes, Ascendente sem fato, Lua e
 * retrogradação indeterminadas, veredito, previsão, conselho, causalidade,
 * diagnóstico, bastidor, semelhança tratada como garantia, termos de outro
 * vínculo e o fechamento prescritivo. O que é NOVO aqui é o que a leitura
 * promete e o verificador dos blocos não podia cobrar:
 *
 *  1. o PARECER sustenta o centro: cita pelo menos uma dinâmica de um eixo
 *     central, e nomeia um contato real (um parecer sem corpo nenhum serviria a
 *     qualquer casal);
 *  2. se o centro é AMBIVALENTE, o parecer cita apoio e tensão, e não escolhe
 *     um lado que o mapa não escolheu;
 *  3. a CONTRADIÇÃO que o mapa marca como relevante aparece fora do parecer,
 *     onde é explicada: não se esconde o que contraria a tendência;
 *  4. o SIGNIFICADO fala do eixo central, e não de um tema isolado;
 *  5. `na_relacao` só existe quando a evidência sustenta um campo concreto;
 *  6. tamanho: parecer, parágrafo e total, com a mesma tolerância de 10% (aviso)
 *     dos nove blocos.
 *
 * O QUE ELE NÃO GARANTE, e é dito de propósito: que a interpretação é BOA.
 * Que o significado é de fato simbólico e não uma paráfrase, que as duas
 * pessoas foram diferenciadas com justiça, que a leitura acrescenta algo que o
 * resumo dos fatos não diz. Isso é avaliação editorial, e fica na bateria com
 * leitura humana. Aqui entram só as falhas que código pode provar.
 */
import type { Locale } from "@/lib/i18n/config"
import { type MapaDeEixos, mapaDeEixos } from "./eixos-sinastria"
import { CORPOS } from "./nomes"
import { DIMENSOES_DO_BLOCO, DONOS, sustentaEncontro, sustentaTensao, type DinamicaNoPayload, type PayloadSinastria } from "./payload-sinastria"
import { CHAVES_DA_LEITURA, LIMITES_LEITURA, type LeituraRelacional, type ParagrafoLeitura } from "./prompt-leitura-sinastria"
import type { SelecaoSinastria } from "./selecao-sinastria"
import {
  afinidadeNaturalAfirmada,
  BASTIDOR,
  dinamicaPorId,
  FECHAMENTO_BRANDO,
  FECHAMENTO_DURO,
  palavras,
  promessaDeSemelhanca,
  resultadoDaSelecao,
  selecaoVista,
  semAcento,
  TOLERANCIA_DE_TAMANHO,
  violacoesDeSemelhancaEVinculo,
} from "./verificador-resposta-sinastria"
import { verificarSinastria } from "./verificador-sinastria"

export type VereditoLeitura = { ok: true; leitura: LeituraRelacional; avisos: string[] } | { ok: false; violacoes: string[]; avisos: string[] }

const paragrafoDe = (x: unknown): ParagrafoLeitura | null => {
  if (!x || typeof x !== "object" || Array.isArray(x)) return null
  const o = x as { texto?: unknown; evidencias?: unknown }
  return {
    texto: typeof o.texto === "string" ? o.texto.trim() : "",
    evidencias: Array.isArray(o.evidencias) ? o.evidencias.map((e) => String(e)) : [],
  }
}

/** Os nomes de corpo que o texto pode usar, no idioma: o parecer tem de nomear pelo menos um. */
function nomesDeCorpo(locale: Locale): string[] {
  return [...Object.values(CORPOS[locale] as Record<string, string>), locale === "pt" ? "Ascendente" : locale === "en" ? "Ascendant" : "Ascendente", locale === "pt" ? "Meio do Céu" : locale === "en" ? "Midheaven" : "Medio Cielo"].map(semAcento)
}

const GENERICO: RegExp[] = [
  /equilibrio entre (apoio|facilidades?|pontos? de apoio) e (desafios?|tensoes|tensao|dificuldades?)/,
  /(mistura|combinacao|dualidade|mescla) de (apoio|facilidades?|cooperacao|harmonia) e (tensao|tensoes|desafios?|atrito)/,
  /\bha (apoio|facilidades?) e (desafios?|tensoes|atritos?)\b/,
]

const palavrasDeConteudo = (t: string) => new Set(semAcento(t).split(/[^a-z]+/).filter((w) => w.length >= 6))
const jaccard = (a: Set<string>, b: Set<string>) => {
  const inter = [...a].filter((x) => b.has(x)).length
  return a.size + b.size - inter === 0 ? 0 : inter / (a.size + b.size - inter)
}

export function verificarLeituraSinastria(params: {
  bruto: unknown
  payload: PayloadSinastria
  selecao: SelecaoSinastria
  locale: Locale
  mapa?: MapaDeEixos
}): VereditoLeitura {
  const { bruto, payload, locale } = params
  const mapa = params.mapa ?? mapaDeEixos(payload)
  const selecao = selecaoVista(params.selecao, payload)
  const avisos: string[] = []
  const v: string[] = []

  // ── 1 · a forma ─────────────────────────────────────────────────────────────
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return { ok: false, violacoes: ["a resposta não é um objeto"], avisos }
  const obj = bruto as Record<string, unknown>
  for (const k of Object.keys(obj)) if (!(CHAVES_DA_LEITURA as readonly string[]).includes(k)) v.push(`chave fora do schema: "${k}"`)
  for (const k of CHAVES_DA_LEITURA) if (!(k in obj)) v.push(`falta a chave "${k}"`)

  const parecer = paragrafoDe(obj.parecer)
  const significado = paragrafoDe(obj.significado)
  const naRelacao = obj.na_relacao === null || obj.na_relacao === undefined ? null : paragrafoDe(obj.na_relacao)
  const aproximaBruto = obj.aproxima_e_tensiona
  const aproxima = Array.isArray(aproximaBruto) ? aproximaBruto.map(paragrafoDe) : null
  if (!parecer) v.push("parecer: ausente ou sem a forma {texto, evidencias}")
  if (!significado) v.push("significado: ausente ou sem a forma {texto, evidencias}")
  if (obj.na_relacao !== null && obj.na_relacao !== undefined && !naRelacao) v.push("na_relacao: sem a forma {texto, evidencias}")
  if (!aproxima) v.push("aproxima_e_tensiona: tem de ser uma lista de parágrafos")
  else if (aproxima.length === 0) v.push("aproxima_e_tensiona: vazio")
  else if (aproxima.length > LIMITES_LEITURA.paragrafosDeAproxima) v.push(`aproxima_e_tensiona: ${aproxima.length} parágrafos, acima de ${LIMITES_LEITURA.paragrafosDeAproxima}`)
  if (aproxima?.some((p) => p === null)) v.push("aproxima_e_tensiona: parágrafo sem a forma {texto, evidencias}")
  if (v.length > 0 || !parecer || !significado || !aproxima) return { ok: false, violacoes: [...new Set(v)], avisos }

  const meio = aproxima.filter((p): p is ParagrafoLeitura => p !== null)
  const todos: Array<{ rotulo: string; p: ParagrafoLeitura }> = [
    { rotulo: "parecer", p: parecer },
    ...meio.map((p, i) => ({ rotulo: `aproxima_e_tensiona[${i}]`, p })),
    { rotulo: "significado", p: significado },
    ...(naRelacao ? [{ rotulo: "na_relacao", p: naRelacao }] : []),
  ]

  // ── 2 · evidência citada, bastidor e tamanho ────────────────────────────────
  const citaveis = new Set(payload.idsCitaveis)
  const dinamicas = dinamicaPorId(payload)
  const semelhancaIds = new Set(payload.semelhancas.map((s) => s.id))
  const dinamicasDe = (p: ParagrafoLeitura) => p.evidencias.map((id) => dinamicas.get(id)).filter((d): d is DinamicaNoPayload => Boolean(d))
  let total = 0
  for (const { rotulo, p } of todos) {
    if (!p.texto) v.push(`${rotulo}: texto vazio`)
    if (BASTIDOR.test(p.texto)) v.push(`${rotulo}: fala do sistema (repertório, fatos calculados, livro), e não da relação`)
    if (p.evidencias.length === 0) v.push(`${rotulo}: não cita nenhuma evidência`)
    for (const id of p.evidencias) if (!citaveis.has(id)) v.push(`${rotulo}: cita "${id}", que não está na lista de evidências recebida`)
    const n = palavras(p.texto)
    total += n
    const teto = rotulo === "parecer" ? LIMITES_LEITURA.palavrasDoParecer : LIMITES_LEITURA.palavrasPorParagrafo
    if (n > teto) (n > teto * TOLERANCIA_DE_TAMANHO ? v : avisos).push(`${rotulo}: ${n} palavras, acima de ${teto}`)
  }
  if (total > LIMITES_LEITURA.palavrasNoTotal) (total > LIMITES_LEITURA.palavrasNoTotal * TOLERANCIA_DE_TAMANHO ? v : avisos).push(`${total} palavras no total, acima de ${LIMITES_LEITURA.palavrasNoTotal}`)

  // ── 3 · o parecer sustenta o centro ─────────────────────────────────────────
  const centrais = new Set(mapa.idsCentrais)
  const citadasDoParecer = dinamicasDe(parecer)
  if (mapa.idsCentrais.length > 0 && !citadasDoParecer.some((d) => centrais.has(d.id))) {
    v.push("parecer: não cita nenhuma dinâmica de um eixo central; um tema secundário ou isolado não pode ser a interpretação central")
  }
  const nomes = nomesDeCorpo(locale)
  const textoDoParecer = semAcento(parecer.texto)
  if (!nomes.some((n) => new RegExp(`(^|[^a-z])${n}($|[^a-z])`).test(textoDoParecer))) {
    v.push("parecer: não nomeia nenhum planeta nem ângulo; um parecer sem contato real serviria a qualquer casal")
  }
  if (GENERICO.some((re) => re.test(textoDoParecer))) avisos.push("parecer: usa a fórmula genérica de apoio e desafio, que vale para qualquer relação")

  // ── 4 · ambivalência e contradição: nada de lado que o mapa não escolheu ────
  if (mapa.perfil === "ambivalente" && citadasDoParecer.length > 0) {
    const cita = (f: (d: DinamicaNoPayload) => boolean) => citadasDoParecer.some(f)
    if (!(cita(sustentaEncontro) && cita(sustentaTensao))) {
      v.push("parecer: o centro do encontro é ambivalente (apoio e tensão pesam), e o parecer não cita as duas direções")
    }
  }
  const citadasForaDoParecer = new Set([...meio, significado, ...(naRelacao ? [naRelacao] : [])].flatMap((p) => dinamicasDe(p).map((d) => d.id)))
  for (const c of mapa.contradicoes) {
    if (!citadasForaDoParecer.has(c.id)) v.push(`omite a contradição relevante "${c.id}" (${c.sentido === "tensao" ? "tensão" : "apoio"}, posição ${c.posicao + 1}): ela vai contra o perfil do centro e tem de ser explicada`)
  }

  // ── 4b · os dois lados aparecem: o que favorece e o que tensiona, quando a relação tem os dois ──
  const todasCitadas = new Set([parecer, ...meio, significado, ...(naRelacao ? [naRelacao] : [])].flatMap((p) => dinamicasDe(p).map((d) => d.id)))
  const dinamicasDoPayload = [...payload.aspectos, ...payload.overlays]
  const soApoio = dinamicasDoPayload.filter((d) => sustentaEncontro(d) && !sustentaTensao(d))
  const soTensao = dinamicasDoPayload.filter((d) => sustentaTensao(d) && !sustentaEncontro(d))
  if (soApoio.length > 0 && soTensao.length > 0) {
    if (!soApoio.some((d) => todasCitadas.has(d.id))) v.push("omite o que favorece: nenhuma dinâmica de apoio é citada, e a relação as tem; a leitura mostra os dois lados")
    if (!soTensao.some((d) => todasCitadas.has(d.id))) v.push("omite o que tensiona: nenhuma dinâmica de tensão é citada, e a relação as tem; a leitura mostra os dois lados")
  }

  // ── 5 · o significado fala do eixo central ──────────────────────────────────
  const citadasDoSignificado = dinamicasDe(significado)
  if (mapa.idsCentrais.length > 0 && !citadasDoSignificado.some((d) => centrais.has(d.id))) {
    v.push("significado: não cita nenhuma dinâmica de um eixo central")
  }
  const eixoConverge = mapa.eixos.some((e) => e.papel === "central" && (e.convergeApoio || e.convergeTensao))
  if (eixoConverge && new Set([...citadasDoParecer, ...citadasDoSignificado].filter((d) => centrais.has(d.id)).map((d) => d.id)).size < 2) {
    avisos.push("o eixo central tem convergência (mais de uma dinâmica), e a leitura cita só uma dinâmica dele")
  }

  // ── 6 · na_relacao só com campo concreto sustentado ─────────────────────────
  if (naRelacao) {
    const dims = (["comunicacao", "afeto_e_intimidade", "vida_pratica_e_sustentacao", "o_que_a_relacao_mobiliza"] as const).flatMap((b) => DIMENSOES_DO_BLOCO[b] ?? [])
    if (!dinamicasDe(naRelacao).some((d) => d.dimensoes.some((x) => dims.includes(x)))) {
      v.push("na_relacao: não cita evidência que sustente um campo concreto (comunicação, intimidade, rotina ou transformação); sem ela, o campo tem de ser null")
    }
  }

  // ── 7 · as regras de texto, as mesmas dos nove blocos ───────────────────────
  const resultado = resultadoDaSelecao(selecao)
  const afirmacoes = todos.map(({ p }) => ({
    texto: p.texto,
    fatos: p.evidencias.flatMap((id) => {
      const d = dinamicas.get(id)
      if (d) return id === d.id ? d.fatos.map((f) => f.id) : [id]
      return citaveis.has(id) ? [id] : []
    }),
  }))
  const corrido = afirmacoes.map((a) => a.texto).join(" ")
  const textoDaEvidencia = [...payload.aspectos, ...payload.overlays]
    .flatMap((d) => [...d.fatos.map((f) => f.texto), ...d.evidencia])
    .concat(payload.semelhancas.flatMap((x) => [x.fato, ...x.nucleo]), payload.ressalvaDasSemelhancas ?? "")
    .join(" ")
  const ver = verificarSinastria({
    texto: { afirmacoes: afirmacoes.filter((a) => a.fatos.length > 0), sintese: corrido },
    resultado,
    locale,
    donos: DONOS[locale],
    evidencia: textoDaEvidencia,
    verificarContradicao: false,
    porOracao: true,
  })
  if (!ver.ok) v.push(...ver.violacoes)
  avisos.push(...ver.avisos)

  for (const { rotulo, p } of todos) {
    if (p.evidencias.some((id) => semelhancaIds.has(id))) {
      const m = promessaDeSemelhanca(p.texto)
      if (m) v.push(`${rotulo}: semelhança ou diferença tratada como garantia, facilidade natural ou incompatibilidade (${m.regra}): "${m.trecho}"`)
    }
    if (p.evidencias.length > 0 && p.evidencias.every((id) => semelhancaIds.has(id))) {
      const m = afinidadeNaturalAfirmada(p.texto, locale)
      if (m) v.push(`${rotulo}: semelhança convertida em afinidade natural (S8): "${m}"`)
    }
  }
  v.push(...violacoesDeSemelhancaEVinculo({ texto: corrido, selecao, payload, locale }))

  // o fechamento: o último parágrafo descreve; não condiciona nem prescreve
  const ultimo = todos[todos.length - 1]
  const duro = ultimo.p.texto.match(FECHAMENTO_DURO)
  if (duro) v.push(`${ultimo.rotulo}: fecha com condição ou prescrição ("${duro[0]}"): o último parágrafo descreve, e não ensina a administrar a relação`)
  else {
    const brando = ultimo.p.texto.match(FECHAMENTO_BRANDO)
    if (brando) avisos.push(`${ultimo.rotulo}: fechamento que pede atenção ou benefício ("${brando[0]}")`)
  }

  // a proporção se diz em palavra: número e percentual viram nota, e nota é veredito
  if (/\d+\s*(%|por cento)|percentual|percentagem/iu.test(corrido)) v.push("cita número ou percentual de contatos: a proporção se diz com palavras, e nunca como nota")

  // o andaime não aparece na tela: "eixo", "mapa de eixos" e "perfil do centro" são do bastidor, e a pessoa não é o planeta
  if (/(^|[^\p{L}])(eixos?|mapa de eixos|perfil do centro)($|[^\p{L}])/iu.test(corrido)) v.push('usa "eixo" (ou "mapa de eixos"): é vocabulário do bastidor, e o leitor não o conhece')
  const reduz = /(representad[oa]s?|simbolizad[oa]s?|personificad[oa]s?|encarnad[oa]s?)\s+(por|pel[oa])\s+(o\s+|a\s+)?(sol|lua|merc[úu]rio|v[êe]nus|marte|j[úu]piter|saturno|urano|netuno|plut[ãa]o)/iu.exec(corrido)
  if (reduz) v.push(`identifica uma pessoa com um planeta ("${reduz[0]}"): o planeta é um ponto do mapa, e a pessoa não é ele; e esta forma costuma trocar o dono`)

  // a base conceitual não aparece na tela: nem a palavra "arquétipo" em qualquer flexão, nem travessão
  if (/arqu[eé]tip|archetyp/i.test(corrido)) v.push('usa "arquétipo" (ou flexão): a leitura é simbólica, e a palavra não aparece na tela')
  if (/[—–]/.test(corrido)) avisos.push("usa travessão ou meia risca")

  // ── 8 · repetição: o parecer não volta nos outros parágrafos ────────────────
  for (let i = 0; i < todos.length; i++) {
    for (let j = i + 1; j < todos.length; j++) {
      const s = jaccard(palavrasDeConteudo(todos[i].p.texto), palavrasDeConteudo(todos[j].p.texto))
      if (s >= 0.5) avisos.push(`${todos[i].rotulo} e ${todos[j].rotulo} repetem as mesmas palavras (${Math.round(s * 100)}% de sobreposição)`)
    }
  }

  const unicos = (l: string[]) => [...new Set(l)]
  if (v.length) return { ok: false, violacoes: unicos(v), avisos: unicos(avisos) }
  return { ok: true, leitura: { parecer, aproxima_e_tensiona: meio, significado, na_relacao: naRelacao }, avisos: unicos(avisos) }
}
