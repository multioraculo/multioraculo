/**
 * Proteção do desenho da síntese de sinastria: payload, prompt, schema e
 * verificador estrutural da resposta. Nenhuma chamada paga: as respostas do
 * "modelo" são montadas aqui, à mão, boas e más.
 *
 * Roda antes do build (npm run verify:sinastria-sintese).
 */
import { REVISAO_DE_APLICABILIDADE } from "../lib/astro/davison/aplicabilidade"
import { glosasDoAspecto } from "../lib/astro/davison"
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { selecionarEvidencia, type Dinamica, type SelecaoSinastria } from "../lib/astro/selecao-sinastria"
import { BLOCOS, BLOCOS_OBRIGATORIOS, ENFASE_POR_VINCULO, blocosElegiveisDe, montarPayload, sustentaEncontro, sustentaTensao, type IdDeBloco, type PayloadSinastria } from "../lib/astro/payload-sinastria"
import { LIMITES_SINASTRIA, promptSinastria, type SinteseSinastria } from "../lib/astro/prompt-sinastria"
import { afinidadeNaturalAfirmada, promessaDeSemelhanca, verificarRespostaSinastria } from "../lib/astro/verificador-resposta-sinastria"
import { CAUSAL_ATRIBUIDA, CONDICAO_NATAL, CONDICAO_NATAL_AMBIGUA, DURACAO } from "../lib/astro/verificador-sinastria"
import { VINCULOS, type Vinculo } from "../lib/astro/sinastria-servico"
import { LOCALES } from "../lib/i18n/config"
import { amostra, dados } from "./simular-selecao-sinastria"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

const casos = amostra()
const prepara = (i: number, vinculo: Vinculo = "amizade") => {
  const r = sinastria(mapaNatal(casos[i].a), mapaNatal(casos[i].b))
  const selecao = selecionarEvidencia(r)
  return { r, selecao, payload: montarPayload(selecao, { locale: "pt", vinculo }) }
}


/** Uma resposta que respeita tudo, montada a partir do próprio payload. */
function respostaBoa(selecao: SelecaoSinastria, payload: PayloadSinastria): SinteseSinastria {
  const todas = [...payload.aspectos, ...payload.overlays]
  const top = (payload.aspectos.length ? payload.aspectos : payload.overlays)[0].id
  const encontro = todas.find(sustentaEncontro)
  const tensao = todas.find(sustentaTensao)
  const b = (texto: string, ev: string[]) => ({ paragrafos: [{ texto, evidencias: ev }] })
  const r = Object.fromEntries(BLOCOS.map((x) => [x, null])) as Record<IdDeBloco, null | ReturnType<typeof b>>
  r.sintese_da_relacao = b("Há pontos de apoio e pontos de atrito entre vocês, e as duas coisas existem ao mesmo tempo.", [top, ...(encontro ? [encontro.id] : []), ...(tensao ? [tensao.id] : [])])
  if (encontro && payload.blocosElegiveis.includes("onde_se_encontram")) r.onde_se_encontram = b("Há apoio e reconhecimento mútuo nesta relação.", [encontro.id])
  if (tensao && payload.blocosElegiveis.includes("onde_ha_tensao")) r.onde_ha_tensao = b("Há diferenças que pedem espaço e geram atrito entre vocês.", [tensao.id])
  r.sintese_final = b("A relação reúne apoio e atrito sem que um apague o outro.", [...(encontro ? [encontro.id] : []), ...(tensao ? [tensao.id] : [])])
  return r as unknown as SinteseSinastria
}

const verifica = (resp: unknown, i = 0, vinculo: Vinculo = "amizade") => {
  const { selecao, payload } = prepara(i, vinculo)
  return verificarRespostaSinastria({ bruto: resp, payload, selecao, locale: "pt" })
}
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

// ── A · o payload e o prompt ────────────────────────────────────────────────
function parteA() {
  for (let i = 0; i < casos.length; i++) {
    const { r, selecao, payload } = prepara(i)
    const rot = casos[i].rotulo
    // tudo o que o modelo vê vem da seleção
    const idsDaSelecao = new Set([...selecao.aspectos, ...selecao.overlays].flatMap((d) => [d.id, d.principal.id, ...d.reforcos.map((f) => f.id)]).concat(selecao.semelhancas.map((s) => s.fato.id)))
    confere(`${rot}: todo id citável vem da seleção`, payload.idsCitaveis.every((id) => idsaDaSelecao(id, idsDaSelecao)))
    // o que o seletor descartou não está no payload
    const descartados = selecao.descartes.filter((d) => d.motivo === "fora_do_orcamento" && d.camada === "aspectos").map((d) => d.fato)
    const prompt = promptSinastria(payload).user
    for (const id of descartados) confere(`${rot}: o fato descartado ${id} não aparece no prompt`, !prompt.includes(id))
    // nenhum texto da glosa de um fato descartado vaza para o prompt
    const fatoDescartado = r.aspectos.find((f) => descartados.includes(f.id))
    const g = fatoDescartado ? glosasDoAspecto(fatoDescartado) : null
    const selecionadosTextos = new Set([...selecao.aspectos, ...selecao.overlays].flatMap((d) => d.evidencia.itens.map((x) => x.texto)))
    const unicos = (g?.favoravel?.nucleos ?? g?.adverso?.nucleos ?? g?.gerais[0]?.nucleos ?? []).filter((t) => !selecionadosTextos.has(t))
    for (const t of unicos.slice(0, 2)) confere(`${rot}: o texto de um fato descartado não vaza para o prompt`, !prompt.includes(t))
    // a fronteira: nunca o repertório inteiro
    confere(`${rot}: o prompt tem tamanho de evidência selecionada, não de repertório (menos de 9 mil tokens)`, prompt.length / 3.6 < 9000, String(Math.round(prompt.length / 3.6)))
    // blocos
    confere(`${rot}: os blocos obrigatórios são elegíveis sempre que há evidência`, !(selecao.aspectos.length + selecao.overlays.length > 0) || BLOCOS_OBRIGATORIOS.every((b) => payload.blocosElegiveis.includes(b)))
    confere(`${rot}: pontos em comum é elegível exatamente quando há semelhança com material`, payload.blocosElegiveis.includes("pontos_em_comum") === (selecao.semelhancas.length > 0))
    confere(`${rot}: o prompt manda deixar nulos os blocos não elegíveis`, BLOCOS.filter((b) => !payload.blocosElegiveis.includes(b)).every((b) => new RegExp(`TÊM DE SER null: [^\\n]*\\b${b}\\b`).test(prompt)))
    if (selecao.semelhancas.length === 0) confere(`${rot}: sem ponto em comum, o prompt diz que o bloco é null`, /pontos_em_comum é null/.test(prompt))
    // os donos e a ausência de dados da pessoa
    confere(`${rot}: os fatos dizem 'sua' e 'da outra pessoa'`, /\b(seu|sua) /.test(prompt) && /da outra pessoa/.test(prompt))
    confere(`${rot}: nenhum apelido, data ou local de nascimento no prompt`, !/\d{4}-\d{2}-\d{2}/.test(prompt) && !casos[i].b.place_label.split(",")[0] || !prompt.includes(casos[i].b.place_label))
    // as regras estão todas lá
    for (const trecho of ["REGRA DE OURO", "CITAÇÃO", "DONOS", "O QUE NÃO SE SABE", "NATUREZA DO TEXTO", "INTEGRE, NÃO VOTE", "CONTRADIÇÃO", "FACILIDADE NÃO É PROMESSA", "PONTOS EM COMUM", "DESCREVA, NÃO PRESCREVA", "BLOCOS", "VÍNCULO", "CONCISÃO", "SEM REPETIÇÃO", "SÍNTESE FINAL", "ESTILO"]) confere(`${rot}: regra "${trecho}" presente`, prompt.includes(trecho))
    confere(`${rot}: o prompt pede as nove chaves`, BLOCOS.every((b) => prompt.includes(`${b}:`)))
    // nada pede nota, porcentagem ou veredito
    confere(`${rot}: o prompt proíbe nota, porcentagem e veredito`, /nota, porcentagem ou veredito/.test(prompt))
  }

  // idiomas
  for (const locale of LOCALES) {
    const { selecao } = prepara(0)
    const p = montarPayload(selecao, { locale, vinculo: "outro" })
    const t = promptSinastria(p)
    confere(`${locale}: o prompt tem a regra de idioma de saída, própria da sinastria`, /IDIOMA: escreva/.test(t.user))
    confere(`${locale}: o prompt não herda instrução de idioma de Tarô nem de outro oráculo`, !/(?<![\p{L}])(tar[oô]|tarot|arcano\w*|or[aá]culo\w*|lenormand|runas?|b[úu]zios|i ching)(?![\p{L}])/iu.test(`${t.user} ${t.system}`))
    confere(`${locale}: o sistema pede JSON e veta travessão`, /JSON/.test(t.system) && /dash|travessão|raya/.test(t.system))
    confere(`${locale}: os fatos usam os nomes do idioma`, locale === "pt" ? /Lua|Vênus|Marte|Sol/.test(t.user) : locale === "en" ? /Moon|Venus|Mars|Sun/.test(t.user) : /Luna|Venus|Marte|Sol/.test(t.user))
  }

  // o vínculo: muda ênfase e a aplicabilidade das frases, nunca fato, ordem nem ranking
  for (const [ci, v] of casos.flatMap((_, k) => VINCULOS.map((x) => [k, x] as const))) {
    const { selecao, payload: p } = prepara(ci, v)
    const base = prepara(ci, "outro").selecao
    confere(`vínculo ${v} (${casos[ci].rotulo}): a seleção é a mesma (nada do vínculo entra no seletor)`, JSON.stringify(selecao) === JSON.stringify(base))
    const dins = [...selecao.aspectos, ...selecao.overlays]
    const noPayload = [...p.aspectos, ...p.overlays]
    // a ordem das dinâmicas que ficam é a da seleção
    confere(`vínculo ${v} (${casos[ci].rotulo}): as dinâmicas que ficam seguem a ordem da seleção`, JSON.stringify(noPayload.map((d) => d.id)) === JSON.stringify(dins.filter((d) => !p.omitidasPorVinculo.includes(d.id)).map((d) => d.id)))
    let ok = true
    let detalhe = ""
    for (const d of noPayload) {
      const orig = dins.find((x) => x.id === d.id)!
      const fatosIguais = JSON.stringify(d.fatos.map((f) => f.id)) === JSON.stringify([orig.principal.id, ...orig.reforcos.map((f) => f.id)])
      const porRef = new Map(orig.evidencia.itens.map((i) => [i.ref, i.texto]))
      for (const i of d.itens) {
        const rev = REVISAO_DE_APLICABILIDADE[`${orig.evidencia.glosa}#${i.ref}`]
        const esperado = rev?.classe === "exemplo_contextual" && rev.texto && !rev.mantemEm?.includes(v) ? rev.texto : porRef.get(i.ref)
        if (esperado !== i.texto) { ok = false; detalhe = `${orig.id} ${i.ref}` }
      }
      // o que saiu estava marcado como dependência real de outro vínculo
      for (const [ref] of porRef) {
        if (d.itens.some((i) => i.ref === ref)) continue
        const rev = REVISAO_DE_APLICABILIDADE[`${orig.evidencia.glosa}#${ref}`]
        if (!(rev?.classe === "dependencia_real" && !rev.vinculos.includes(v))) { ok = false; detalhe = `saiu sem dependência: ${orig.id} ${ref}` }
      }
      if (!fatosIguais) { ok = false; detalhe = `fatos de ${orig.id}` }
    }
    confere(`vínculo ${v} (${casos[ci].rotulo}): só saem frases de dependência real de outro vínculo, e só mudam textos de exemplo contextual`, ok, detalhe)
    const proibida = noPayload.flatMap((d) => d.itens.map((i) => ({ d, i }))).filter(({ d, i }) => {
      const rev = REVISAO_DE_APLICABILIDADE[`${dins.find((x) => x.id === d.id)!.evidencia.glosa}#${i.ref}`]
      return rev?.classe === "dependencia_real" && !rev.vinculos.includes(v)
    })
    confere(`vínculo ${v} (${casos[ci].rotulo}): nenhuma frase de dependência real de outro vínculo chega ao prompt`, proibida.length === 0, proibida.map((x) => x.i.ref).join(","))
    confere(`vínculo ${v} (${casos[ci].rotulo}): nenhum texto de exemplo contextual com núcleo neutro vai com o exemplo`, noPayload.every((d) => d.itens.every((i) => { const rev = REVISAO_DE_APLICABILIDADE[`${dins.find((x) => x.id === d.id)!.evidencia.glosa}#${i.ref}`]; return !(rev?.classe === "exemplo_contextual" && rev.texto && !rev.mantemEm?.includes(v) && i.texto === rev.de) })))
    confere(`vínculo ${v} (${casos[ci].rotulo}): as dimensões só encolhem, e os blocos elegíveis vêm das frases que ficaram`, noPayload.every((d) => d.dimensoes.every((x) => dins.find((y) => y.id === d.id)!.evidencia.dimensoes.includes(x))) && JSON.stringify(p.blocosElegiveis) === JSON.stringify(blocosElegiveisDe(selecao, "pt", v)))
    confere(`vínculo ${v} (${casos[ci].rotulo}): uma dinâmica sem nenhuma frase aplicável é omitida, e não vai com fato solto`, p.omitidasPorVinculo.every((id) => !p.idsCitaveis.includes(id)) && noPayload.every((d) => d.itens.length > 0))
    confere(`vínculo ${v} (${casos[ci].rotulo}): a ênfase é só reordenação de blocos elegíveis`, p.enfase.every((b) => p.blocosElegiveis.includes(b) && ENFASE_POR_VINCULO[v].includes(b)))
    confere(`vínculo ${v} (${casos[ci].rotulo}): as semelhanças não mudam`, JSON.stringify(p.semelhancas) === JSON.stringify(prepara(ci, "outro").payload.semelhancas))
  }
  const l1 = promptSinastria(prepara(0, "romantico").payload).user.split("\n")
  const l2 = promptSinastria(prepara(0, "trabalho").payload).user.split("\n")
  confere("o vínculo aparece numa linha só do prompt, e o resto das regras é igual", l1.filter((l) => l.startsWith("VÍNCULO DECLARADO")).length === 1 && l2.filter((l) => l.startsWith("VÍNCULO DECLARADO")).length === 1)
}
const idsaDaSelecao = (id: string, ids: Set<string>) => ids.has(id)

// ── B · o verificador da resposta ───────────────────────────────────────────
function parteB() {
  // um par com os dois lados e blocos temáticos
  let i = casos.findIndex((c, k) => { const { selecao } = prepara(k); return selecao.aspectos.some((d) => d.categorias.includes("harmonico")) && selecao.aspectos.some((d) => d.categorias.includes("discordante")) })
  if (i < 0) i = 0
  const { selecao, payload } = prepara(i)
  const boa = respostaBoa(selecao, payload)
  const ok = verificarRespostaSinastria({ bruto: boa, payload, selecao, locale: "pt" })
  confere("a resposta boa passa", ok.ok, JSON.stringify(ok))

  const roda = (muda: (r: Record<string, unknown>) => void) => {
    const r = clone(boa) as unknown as Record<string, unknown>
    muda(r)
    return verificarRespostaSinastria({ bruto: r, payload, selecao, locale: "pt" })
  }
  const recusa = (titulo: string, muda: (r: Record<string, unknown>) => void, padrao: RegExp) => {
    const v = roda(muda)
    confere(titulo, !v.ok && v.violacoes.some((x) => padrao.test(x)), JSON.stringify(v))
  }
  const par = (r: Record<string, unknown>, bloco: string) => (r[bloco] as { paragrafos: Array<{ texto: string; evidencias: string[] }> }).paragrafos[0]

  // a forma
  confere("resposta que não é objeto é recusada", !verificarRespostaSinastria({ bruto: "texto", payload, selecao, locale: "pt" }).ok)
  recusa("chave faltando é recusada", (r) => { delete r.comunicacao }, /falta a chave/)
  recusa("chave fora do schema é recusada", (r) => { r.nota_final = { paragrafos: [] } }, /fora do schema/)
  recusa("bloco obrigatório nulo é recusado", (r) => { r.sintese_final = null }, /obrigatório/)
  recusa("parágrafo sem evidência é recusado", (r) => { par(r, "sintese_da_relacao").evidencias = [] }, /não cita nenhuma evidência/)
  recusa("evidência inventada é recusada", (r) => { par(r, "sintese_da_relacao").evidencias.push("sun-pluto:adverso") }, /não está na lista/)

  // nenhum bloco à força
  const naoElegivel = BLOCOS.find((b) => !payload.blocosElegiveis.includes(b) && !BLOCOS_OBRIGATORIOS.includes(b))
  if (naoElegivel) recusa(`bloco não elegível (${naoElegivel}) escrito é recusado`, (r) => { r[naoElegivel] = { paragrafos: [{ texto: "Algo foi escrito.", evidencias: [payload.idsCitaveis[0]] }] } }, /tem de ser null/)
  if (payload.semelhancas.length === 0) recusa("pontos em comum sem ponto em comum é recusado", (r) => { r.pontos_em_comum = { paragrafos: [{ texto: "Vocês têm algo em comum.", evidencias: [payload.idsCitaveis[0]] }] } }, /não há ponto em comum|tem de ser null/)
  confere("os blocos eleitos pelo código são só os sustentados: a lista tem os obrigatórios", BLOCOS_OBRIGATORIOS.every((b) => payload.blocosElegiveis.includes(b)))
  confere("elegibilidade determinística: mesma seleção, mesmos blocos", JSON.stringify(blocosElegiveisDe(selecao)) === JSON.stringify(payload.blocosElegiveis))

  // tamanho
  const comTexto = (texto: string) => (r: Record<string, unknown>) => { par(r, "sintese_da_relacao").texto = texto }

  // tamanho: até 10% acima do teto é aviso, a partir daí é violação
  const palavrasDe = (n: number) => ("palavra ").repeat(n).trim()
  const T = LIMITES_SINASTRIA.palavrasPorParagrafo
  recusa("parágrafo claramente longo demais (acima de 10% do teto) é recusado", (r) => { par(r, "sintese_da_relacao").texto = palavrasDe(Math.ceil(T * 1.1) + 1) }, /palavras, acima/)
  {
    const v = roda((r) => { par(r, "sintese_da_relacao").texto = palavrasDe(T + 2) })
    confere("parágrafo 2 palavras acima do teto: não reprova, vira aviso", v.ok && v.avisos.some((x) => /palavras, acima/.test(x)), JSON.stringify(v.avisos))
    const v2 = roda((r) => { par(r, "sintese_da_relacao").texto = palavrasDe(Math.floor(T * 1.1)) })
    confere("parágrafo no limite da tolerância (99) ainda é só aviso", v2.ok && v2.avisos.length > 0)
  }
  {
    // o total: todos os blocos escritos no máximo de parágrafos, e cada parágrafo com `w` palavras (sempre abaixo do limite de 99)
    const comTotal = (alvo: number) => {
      const escritos = BLOCOS.filter((b) => (boa as unknown as Record<string, unknown>)[b])
      const maxDe = (b: string) => (BLOCOS_OBRIGATORIOS.includes(b as IdDeBloco) ? LIMITES_SINASTRIA.paragrafosDasSinteses : LIMITES_SINASTRIA.paragrafosPorBloco)
      const n = escritos.reduce((k, b) => k + maxDe(b), 0)
      const w = Math.round(alvo / n)
      const v = roda((r) => { for (const b of escritos) { const base = (r[b] as { paragrafos: Array<{ texto: string; evidencias: string[] }> }).paragrafos[0]; (r[b] as { paragrafos: unknown[] }).paragrafos = Array.from({ length: maxDe(b) }, () => ({ texto: palavrasDe(w), evidencias: [...base.evidencias] })) } })
      return { v, total: n * w, w }
    }
    const aviso = comTotal(735)
    confere("total até 10% acima de 700: só aviso", aviso.total > 700 && aviso.total <= 770 && aviso.v.ok && aviso.v.avisos.some((x) => /no total/.test(x)), JSON.stringify({ total: aviso.total, ok: aviso.v.ok, avisos: aviso.v.avisos }).slice(0, 300))
    const duro = comTotal(800)
    confere("total mais de 10% acima de 700: violação", duro.total > 770 && !duro.v.ok && duro.v.violacoes.some((x) => /no total/.test(x)), JSON.stringify({ total: duro.total, w: duro.w }))
  }

  // hard fail × warning editorial
  const avisa = (titulo: string, texto: string, padrao: RegExp) => {
    const v = roda((r) => { par(r, "sintese_da_relacao").texto = texto })
    confere(titulo, v.ok && v.avisos.some((x) => padrao.test(x)), JSON.stringify({ ok: v.ok, avisos: v.avisos, viol: v.ok ? [] : v.violacoes }).slice(0, 300))
  }
  avisa("'beneficiar' é aviso editorial, não reprova", "Vocês podem se beneficiar do apoio que existe e dos atritos que também existem.", /avaliativo/)
  avisa("'benéfica' é aviso editorial, não reprova", "Há uma troca benéfica entre vocês, e também há atrito.", /avaliativo/)
  avisa("'à tona' é aviso editorial, não reprova", "Há atritos que podem vir à tona, e também há apoio mútuo.", /estilo/)
  avisa("'energia' é aviso editorial, não reprova", "Há uma energia intensa nos atritos, e também apoio mútuo.", /estilo/)
  avisa("travessão é aviso editorial, não reprova", "Há apoio mútuo — e também atrito entre vocês.", /travessão/)
  avisa("'Este aspecto sugere' é aviso editorial, não reprova", "Este aspecto sugere apoio, e há também atrito entre vocês.", /estilo/)
  recusa("diagnóstico continua hard", comTexto("Há um transtorno de ansiedade nessa dinâmica."), /expressão proibida/)
  recusa("previsão continua hard", comTexto("Essa relação vai acontecer de um jeito difícil."), /futuro|proibida/)
  recusa("'sorte' continua hard", comTexto("Vocês têm sorte de terem esse apoio."), /expressão proibida/)
  recusa("autor de bastidor continua hard", comTexto("Segundo Jung, há um atrito aqui."), /expressão proibida/)
  recusa("causalidade afirmada ('é influenciado') continua hard", comTexto("Você é influenciado pelo outro nesse atrito."), /atribui causa/)
  recusa("conselho inequívoco continua hard", comTexto("Vocês precisam conversar mais sobre isso."), /conselho/)
  recusa("karma continua hard", comTexto("Há um vínculo kármico entre vocês."), /vocabulário/)

  // metáfora que vem da evidência não é "precisão inventada", mas horário inventado continua sendo
  {
    const v = roda((r) => { par(r, "sintese_da_relacao").texto = "Há apoio e atrito, como a noite complementa o dia." })
    confere("'a noite' (artigo) não reprova", v.ok, JSON.stringify(v))
    recusa("'às 15h' continua sendo precisão inventada (hard)", comTexto("Há apoio e atrito, sobretudo às 15h de uma terça-feira."), /precisão/)
    recusa("'à noite' (horário) continua sendo precisão inventada (hard)", comTexto("Há apoio e atrito entre vocês, sobretudo à noite."), /precisão/)
  }

  // bastidor
  recusa("fala do repertório/livro é recusada (bastidor)", comTexto("O repertório diz que há apoio e atrito entre vocês."), /fala do sistema/)
  recusa("fala de 'fatos calculados' é recusada (bastidor)", comTexto("Pelos fatos calculados, há apoio e atrito entre vocês."), /fala do sistema/)

  // "omite facilidades" medido sobre a evidência selecionada, e não sobre a categoria do aspecto
  {
    const todas = [...payload.aspectos, ...payload.overlays]
    const enc = todas.filter(sustentaEncontro)
    const ten = todas.filter(sustentaTensao)
    const soConjuncao = enc.find((d) => !d.categorias.includes("harmonico") && (d.categorias.includes("variavel") || d.itens.some((x) => x.via === "favoravel")))
    const naoTensao = (d: (typeof todas)[number]) => !sustentaTensao(d)
    const tensaoPura = ten.find(naoTensao) ?? ten[0]
    if (enc.length && ten.length && soConjuncao && tensaoPura) {
      const v = roda((r) => {
        for (const b of BLOCOS) if (r[b]) for (const p of (r[b] as { paragrafos: Array<{ evidencias: string[] }> }).paragrafos) p.evidencias = [soConjuncao.id, tensaoPura.id]
      })
      confere("facilidade que vem de conjunção ou de valência favorável conta como facilidade: não é 'omite facilidades'", v.ok || !v.violacoes.some((x) => /omite todas as facilidades/.test(x)), JSON.stringify(v))
    }
    if (enc.length && ten.length) {
      const soTen = roda((r) => { for (const b of BLOCOS) if (r[b]) for (const p of (r[b] as { paragrafos: Array<{ evidencias: string[] }> }).paragrafos) p.evidencias = [ten.find((d) => !enc.includes(d))?.id ?? ten[0].id] })
      const dTen = ten.find((d) => !enc.includes(d))
      if (dTen) confere("citar só tensão, quando há facilidade na evidência, continua sendo hard", !soTen.ok && soTen.violacoes.some((x) => /omite todas as facilidades/.test(x)), JSON.stringify(soTen))
      const dEnc = enc.find((d) => !ten.includes(d))
      if (dEnc) {
        const soEnc = roda((r) => { for (const b of BLOCOS) if (r[b]) for (const p of (r[b] as { paragrafos: Array<{ evidencias: string[] }> }).paragrafos) p.evidencias = [dEnc.id] })
        confere("citar só facilidade, quando há tensão na evidência, continua sendo hard", !soEnc.ok && soEnc.violacoes.some((x) => /omite todas as tensões/.test(x)), JSON.stringify(soEnc))
      }
    }
  }

  // fechamento da síntese final: construção inequívoca é HARD (só na síntese final); o ambíguo é aviso
  const fecha = (r: Record<string, unknown>, texto: string) => { par(r, "sintese_final").texto = texto }
  const hardFecha = (v: ReturnType<typeof roda>) => !v.ok && v.violacoes.some((x) => /^sintese_final\[0\]: fecha com condição ou prescrição/.test(x))
  for (const [nome, texto] of [
    ["desde que", "Há apoio e atrito entre vocês, desde que ambos queiram."],
    ["contanto que", "Há apoio e atrito, contanto que as diferenças sejam aceitas."],
    ["se ambos", "Há apoio e atrito, e se ambos quiserem, a relação segue."],
    ["para que a relação", "Há apoio e atrito, para que a relação siga."],
    ["é importante", "Há apoio e atrito, e é importante notar isso."],
    ["o caminho é", "Há apoio e atrito, e o caminho é aceitar."],
    ["encontrar equilíbrio", "Há apoio e atrito, e encontrar equilíbrio ajuda."],
    ["com paciência", "Há apoio e atrito, com paciência, a relação segue."],
    ["com esforço", "Há apoio e atrito; com esforço e compreensão, há potencial."],
    ["exige esforço", "Há apoio e atrito, e isso exige esforço."],
    ["exige atenção para", "Há apoio e atrito, e a diversidade exige atenção para que a relação se desenvolva."],
    ["pedem atenção para evitar", "Há apoio e atrito, e os aspectos pedem atenção para evitar que tensões virem obstáculos."],
    ["depende de como", "Há apoio e atrito, e tudo depende de como forem tratados."],
  ] as const) {
    const v = roda((r) => fecha(r, texto))
    confere(`fechamento "${nome}" na síntese final é HARD`, hardFecha(v), JSON.stringify(v.ok ? v.avisos : v.violacoes).slice(0, 200))
  }
  for (const [nome, texto] of [["precisam", "Há apoio e atrito, e as tensões precisam ser reconhecidas."], ["devem", "Há apoio e atrito, e vocês devem conversar."], ["é necessário", "Há apoio e atrito, e é necessário um trabalho consciente."]] as const) {
    const v = roda((r) => fecha(r, texto))
    confere(`fechamento com "${nome}" reprova na síntese final (conselho)`, !v.ok, JSON.stringify(v.ok ? v.avisos : v.violacoes).slice(0, 200))
  }
  {
    const brando = roda((r) => fecha(r, "Há apoio e atrito, e as tensões exigem atenção."))
    confere("'exigem atenção' sem objetivo é só aviso", brando.ok && brando.avisos.some((x) => /^sintese_final\[0\]: fechamento que pede atenção/.test(x)), JSON.stringify(brando))
    const ben = roda((r) => fecha(r, "Há apoio e atrito, e a relação pode se beneficiar de ambos."))
    confere("'pode se beneficiar' é só aviso", ben.ok && ben.avisos.some((x) => /fechamento que pede atenção/.test(x)), JSON.stringify(ben))
    const certo = roda((r) => fecha(r, "Há apoio e capacidade de cooperação em algumas áreas, enquanto certas diferenças continuam produzindo atrito. As duas tendências permanecem presentes ao mesmo tempo."))
    confere("o fechamento correto do prompt passa sem violação nem aviso de fechamento", certo.ok && !certo.avisos.some((x) => /fechamento/.test(x)), JSON.stringify(certo))
    const errado = roda((r) => fecha(r, "A relação pode funcionar bem desde que ambos tenham paciência e aprendam a lidar com essas diferenças."))
    confere("o fechamento incorreto do prompt é HARD (o exemplo do prompt e o verificador dizem a mesma coisa)", hardFecha(errado), JSON.stringify(errado))
  }
  // fora da síntese final, as mesmas construções NÃO reprovam por esta regra (sem blacklist global)
  for (const bloco of ["sintese_da_relacao", "onde_se_encontram", "onde_ha_tensao"] as const) {
    const v = roda((r) => { if (r[bloco]) par(r, bloco).texto = "Há apoio e atrito, desde que ambos queiram, e é importante notar isso, para que a relação siga." })
    confere(`a mesma construção em ${bloco} não vira violação de fechamento`, v.ok || !v.violacoes.some((x) => /fecha com condição ou prescrição/.test(x)), JSON.stringify(v.ok ? v.avisos : v.violacoes).slice(0, 160))
  }
  {
    const v = roda((r) => fecha(r, "Há apoio e atrito entre vocês, e as duas coisas permanecem em aberto."))
    confere("síntese final que só descreve não gera violação nem aviso de fechamento", v.ok && !v.avisos.some((x) => /fechamento/.test(x)), JSON.stringify(v))
  }
  recusa("parágrafos demais em um bloco são recusados", (r) => { const p = par(r, "sintese_da_relacao"); (r.sintese_da_relacao as { paragrafos: unknown[] }).paragrafos = [p, p, p, p] }, /parágrafos, acima/)

  // proporção
  const topos = (payload.aspectos.length ? payload.aspectos : payload.overlays).slice(0, 2)
  const fora = payload.idsCitaveis.find((id) => !topos.some((d) => d.id === id || d.fatos.some((f) => f.id === id)) && !payload.semelhancas.some((s) => s.id === id))
  if (fora) recusa("síntese que não cita as dinâmicas mais relevantes é recusada", (r) => { par(r, "sintese_da_relacao").evidencias = [fora] }, /mais relevantes/)

  // conteúdo
  recusa("veredito de compatibilidade é recusado", comTexto("Vocês são compatíveis e combinam muito."), /veredito/)
  recusa("porcentagem é recusada", comTexto("A relação tem 80% de afinidade."), /veredito|precisão/)
  recusa("karma como fato é recusado", comTexto("Há um vínculo kármico entre vocês."), /vocabulário/)
  recusa("previsão de duração é recusada", comTexto("Essa relação vai durar para sempre."), /veredito|futuro/)
  recusa("conselho é recusado", comTexto("Vocês deveriam conversar mais."), /conselho/)
  recusa("condição natal não calculada é recusada", comTexto("O Sol está fortalecido nessa relação."), /condição natal/)
  recusa("aspecto inexistente entre dois corpos é recusado", comTexto("Sua Lua faz trígono com Plutão da outra pessoa e isso organiza a relação."), /inexistente|não é um fato/)
  recusa("elemento sem ponto em comum é recusado", comTexto("Os dois têm o elemento água em destaque na relação."), /elemento/)
  recusa("mesmo signo sem ponto em comum é recusado", comTexto("Vocês têm uma coisa no mesmo signo que une os dois."), /mesmo signo/)
  recusa("termo de relação romântica num vínculo de amizade é recusado", comTexto("Esse casal tem muito apoio mútuo."), /relação romantico/)
  if (payload.indisponibilidades.some((x) => /Ascendente/.test(x))) recusa("Ascendente de quem não tem hora é recusado", comTexto("O Ascendente da outra pessoa organiza a relação."), /Ascendente/)

  // o vínculo declarado muda o que é termo proibido, nunca o fato
  const vTrab = prepara(i, "trabalho")
  const rTrab = verificarRespostaSinastria({ bruto: (() => { const r = clone(boa) as unknown as Record<string, unknown>; (r.sintese_da_relacao as { paragrafos: Array<{ texto: string }> }).paragrafos[0].texto = "Essa parceria no trabalho tem apoio e atrito."; return r })(), payload: vTrab.payload, selecao: vTrab.selecao, locale: "pt" })
  confere("num vínculo de trabalho, falar de trabalho é permitido", rTrab.ok || !rTrab.violacoes.some((x) => /relação trabalho/.test(x)), JSON.stringify(rTrab))
  const rRom = verificarRespostaSinastria({ bruto: (() => { const r = clone(boa) as unknown as Record<string, unknown>; (r.sintese_da_relacao as { paragrafos: Array<{ texto: string }> }).paragrafos[0].texto = "Esse casal tem apoio e atrito."; return r })(), payload: prepara(i, "romantico").payload, selecao, locale: "pt" })
  confere("num vínculo romântico, falar de casal é permitido", rRom.ok || !rRom.violacoes.some((x) => /relação romantico/.test(x)), JSON.stringify(rRom))

  // omitir um lado inteiro
  const soTensao = (r: Record<string, unknown>) => {
    const t = [...payload.aspectos, ...payload.overlays].find(sustentaTensao)!
    for (const b of ["sintese_da_relacao", "onde_se_encontram", "sintese_final"]) if (r[b]) for (const p of (r[b] as { paragrafos: Array<{ evidencias: string[] }> }).paragrafos) p.evidencias = [t.id]
  }
  const temAmbos = selecao.aspectos.some((d) => d.categorias.includes("harmonico")) && selecao.aspectos.some((d) => d.categorias.includes("discordante"))
  if (temAmbos) {
    const v = roda((r) => { soTensao(r); r.onde_se_encontram = null })
    confere("citar só o lado discordante quando os dois existem é recusado", !v.ok && v.violacoes.some((x) => /facilidades/.test(x)), JSON.stringify(v))
  }

  // o contrato do schema: o que a resposta boa tem é exatamente o tipo
  confere("a resposta boa tem as nove chaves", BLOCOS.every((b) => b in (boa as unknown as Record<string, unknown>)))
}

// ── C · o "amizade firme" que vazava para os outros vínculos (bateria 1) ───────
function parteC() {
  const sel = selecionarEvidencia(sinastria(mapaNatal(dados(18, true)), mapaNatal(dados(35, true))))
  const base = [...sel.aspectos, ...sel.overlays].find((d) => d.id.startsWith("sun-pluto"))
  confere("o par que vazou na bateria 1 traz Sol e Plutão na seleção", Boolean(base))
  if (!base) return
  for (const v of VINCULOS) {
    const p = montarPayload(sel, { locale: "pt", vinculo: v })
    const d = [...p.aspectos, ...p.overlays].find((x) => x.id === base.id)
    const texto = (d?.evidencia ?? []).join(" ")
    if (v === "amizade") confere("amizade: a frase original fica ('amizade firme')", /amizade firme/.test(texto))
    else confere(`${v}: 'amizade firme' vira 'laço firme', com o núcleo preservado`, !/amizade/.test(texto) && /reconhecimento de um vínculo em nível profundo pode favorecer a formação de um laço firme/.test(texto), texto.slice(0, 200))
  }
  // a fonte não muda: a glosa continua com a frase original
  confere("a glosa Davison continua com a frase original", base.evidencia.itens.some((i) => /amizade firme/.test(i.texto)))
  // 'duradoura' não vem da fonte, e a camada de aplicabilidade não o toca
  confere("a revisão não toca em 'duradoura' (problema de geração, não de evidência)", Object.values(REVISAO_DE_APLICABILIDADE).every((r) => !(r.classe === "exemplo_contextual" && r.texto && /duradour/.test(r.texto))))
}

// ── D · semelhança não é compatibilidade e não garante facilidade (bateria 1: L-2fa549) ──
function parteD() {
  // o texto real da bateria 1 (L-2fa549, síntese final), que a avaliação marcou S3 e S8 e o estrutural deixava passar
  const real = "A relação entre vocês é uma mistura de harmonia e desafio. Enquanto há uma forte base de compreensão e comunicação facilitada, as tensões indicam áreas que exigem cuidado e paciência. As semelhanças nos elementos e signos garantem uma afinidade natural, mas as diferenças nos aspectos planetários mostram que, apesar da facilidade em alguns aspectos, há desafios a serem superados para manter a amizade em equilíbrio."
  confere("o texto real da bateria 1 (garantem uma afinidade natural) é pego", promessaDeSemelhanca(real)?.regra === "garantia")
  const pega = (titulo: string, texto: string, regra: string) => confere(titulo, promessaDeSemelhanca(texto)?.regra === regra, JSON.stringify(promessaDeSemelhanca(texto)))
  pega("garantia de compreensão", "Os Sóis no mesmo elemento garantem compreensão entre vocês.", "garantia")
  pega("asseguramento de harmonia", "O mesmo signo assegura harmonia entre os dois.", "garantia")
  pega("facilidade natural", "A semelhança traz facilidade natural entre vocês.", "facilidade natural")
  pega("naturalmente fácil", "Entre vocês, a comunicação é naturalmente fácil por causa do elemento comum.", "facilidade natural")
  pega("semelhança implica afinidade", "A semelhança no elemento implica afinidade entre vocês.", "implica ou significa")
  pega("mesmo signo significa facilidade", "Ter o mesmo signo significa facilidade de entendimento.", "implica ou significa")
  pega("diferença impede", "As diferenças de modo impedem a cooperação entre os dois.", "diferença como incompatibilidade")
  pega("diferença torna incompatível", "A diferença nos elementos torna os dois incompatíveis.", "diferença como incompatibilidade")
  // o que NÃO é promessa: descrição que a fonte sustenta, possibilidade, negação
  const limpa = (titulo: string, texto: string) => confere(titulo, promessaDeSemelhanca(texto) === null, JSON.stringify(promessaDeSemelhanca(texto)))
  limpa("'afinidade teórica' (a fonte) passa", "Ambos compartilham o elemento terra para seus Sóis, o que sugere uma afinidade teórica e um entendimento instintivo de como lidar um com o outro.")
  limpa("'pode trazer uma compreensão instintiva' (possibilidade) passa", "Ambos têm o Sol no elemento água, o que pode trazer uma compreensão instintiva das reações emocionais um do outro.")
  limpa("'afinidade natural' descrita em tom de possibilidade passa", "Ambos têm o Sol no mesmo elemento, o que pode gerar uma afinidade natural e um entendimento instintivo.")
  limpa("negação ('não garante facilidade') passa", "A semelhança não garante facilidade, e a competição pode substituir a cooperação.")
  limpa("negação com advérbio ('nem sempre garante') passa", "O mesmo signo nem sempre garante compreensão entre vocês.")
  limpa("diferença que 'pode levar a atritos' passa", "A diferença no modo dominante pode levar a atritos e a uma parceria muito ativa.")
  limpa("a ressalva do livro passa", "Semelhança grande demais pode deixar um mapa sem complementar o outro, e a competição pode substituir a cooperação.")
  limpa("descrição neutra de elemento e modo passa", "Você tem o elemento terra dominante e a outra pessoa o ar; seu modo é mutável e o dela, cardinal.")
  // a limitação conhecida, registrada: a formulação cautelosa do L-ee5f90 (S1 e S8 do avaliador) NÃO é pega, porque tem o mesmo formato da descrição sustentada
  limpa("limitação conhecida: 'Mercúrio no mesmo signo pode trazer uma compreensão mútua das ideias' não é pego", "Mercúrio no mesmo signo de Peixes pode trazer uma compreensão mútua das ideias e pensamentos, mas também pode resultar em dificuldades devido à falta de contraste.")

  // integrado: só vale nos parágrafos que citam ponto em comum, e no bloco de pontos em comum
  const k = casos.findIndex((_, j) => prepara(j).payload.semelhancas.length > 0)
  confere("há um par com ponto em comum para o teste integrado", k >= 0)
  if (k < 0) return
  const { selecao, payload } = prepara(k)
  const boa = respostaBoa(selecao, payload)
  const semId = payload.semelhancas[0].id
  const roda = (muda: (r: Record<string, unknown>) => void) => { const r = clone(boa) as unknown as Record<string, unknown>; muda(r); return verificarRespostaSinastria({ bruto: r, payload, selecao, locale: "pt" }) }
  const par = (r: Record<string, unknown>, bloco: string) => (r[bloco] as { paragrafos: Array<{ texto: string; evidencias: string[] }> }).paragrafos[0]
  const v1 = roda((r) => { const p = par(r, "sintese_final"); p.texto = "Há apoio e atrito entre vocês. As semelhanças nos elementos garantem uma afinidade natural."; p.evidencias = [...p.evidencias, semId] })
  confere("síntese que cita o ponto em comum e promete afinidade é HARD", !v1.ok && v1.violacoes.some((x) => /garantia, facilidade natural ou incompatibilidade/.test(x)), JSON.stringify(v1))
  const v2 = roda((r) => { const p = par(r, "sintese_final"); p.texto = "Há apoio e atrito entre vocês. As semelhanças nos elementos garantem uma afinidade natural." })
  confere("a proteção é estreita: sem citar ponto em comum e fora do bloco de pontos em comum, não age", v2.ok || !v2.violacoes.some((x) => /garantia, facilidade natural/.test(x)))
  if (payload.blocosElegiveis.includes("pontos_em_comum")) {
    const v3 = roda((r) => { r.pontos_em_comum = { paragrafos: [{ texto: "Os Sóis no mesmo elemento garantem compreensão entre vocês.", evidencias: [semId] }] } })
    confere("no bloco de pontos em comum a promessa é HARD", !v3.ok && v3.violacoes.some((x) => /^pontos_em_comum\[0\]: semelhança/.test(x)), JSON.stringify(v3))
    const v4 = roda((r) => { r.pontos_em_comum = { paragrafos: [{ texto: "Os Sóis no mesmo elemento sugerem uma afinidade teórica, e a competição pode substituir a cooperação.", evidencias: [semId] }] } })
    confere("no bloco de pontos em comum a descrição sustentada passa", v4.ok || !v4.violacoes.some((x) => /semelhança ou diferença tratada/.test(x)), JSON.stringify(v4))
  }
}

// ── E · último ajuste: flexões do fechamento, causalidade, duração, signo ─────────
function parteE() {
  const k = casos.findIndex((_, j) => { const p = prepara(j).payload; return p.aspectos.length > 1 })
  const { selecao, payload } = prepara(k)
  const boa = respostaBoa(selecao, payload)
  const roda = (muda: (r: Record<string, unknown>) => void) => { const r = clone(boa) as unknown as Record<string, unknown>; muda(r); return verificarRespostaSinastria({ bruto: r, payload, selecao, locale: "pt" }) }
  const par = (r: Record<string, unknown>, bloco: string) => (r[bloco] as { paragrafos: Array<{ texto: string; evidencias: string[] }> }).paragrafos[0]
  const viol = (v: ReturnType<typeof roda>) => (v.ok ? [] : v.violacoes)
  const final = (texto: string) => roda((r) => { par(r, "sintese_final").texto = texto })
  const hardFecha = (v: ReturnType<typeof roda>) => viol(v).some((x) => /^sintese_final\[0\]: fecha com condição ou prescrição/.test(x))

  // 1 · o fechamento prescritivo, em todas as flexões do verbo
  for (const [nome, texto] of [
    ["requerer paciência", "Há apoio e atrito, e os obstáculos podem requerer paciência e compreensão contínuas."],
    ["requer esforço", "Há apoio e atrito, e isso requer esforço."],
    ["requerem compreensão", "Há apoio e atrito, e as diferenças requerem compreensão."],
    ["requerendo cuidado", "Há apoio e atrito, requerendo cuidado de ambos."],
    ["demandar paciência", "Há apoio e atrito, e isso pode demandar paciência."],
    ["demandam esforço", "Há apoio e atrito, e as tensões demandam esforço."],
    ["demandando compreensão", "Há apoio e atrito, demandando compreensão."],
    ["exigir esforço", "Há apoio e atrito, e vai exigir esforço."],
    ["exigindo paciência", "Há apoio e atrito, exigindo paciência."],
    ["exigindo atenção para que", "As duas tendências permanecem presentes ao mesmo tempo, exigindo atenção para que cada uma possa se manifestar de forma produtiva."],
    ["demandando atenção para evitar", "Há apoio e atrito, demandando atenção para evitar conflitos."],
    ["demandar atenção para alcançar", "Há apoio e atrito, e é preciso demandar atenção para alcançar harmonia."],
    ["demandam atenção para permitir", "Há apoio e atrito, e as tensões demandam atenção para permitir que a relação cresça."],
    ["exigir atenção para que", "Há apoio e atrito, e o desafio vai exigir atenção para que a relação se desenvolva."],
    ["requerer atenção para", "Há apoio e atrito, o que pode requerer atenção para que ambos se entendam."],
  ] as const) confere(`fechamento "${nome}" é HARD na síntese final`, hardFecha(final(texto)), JSON.stringify(viol(final(texto))).slice(0, 160))

  // as regressões reais da bateria 3
  confere("N-e2c35a ('podem requerer paciência e compreensão contínuas') é hard agora", hardFecha(final("Há um potencial para uma comunicação rica e empática, mas também apresentando obstáculos que podem requerer paciência e compreensão contínuas.")))
  confere("N-008490 ('exigindo atenção para que cada uma possa se manifestar') é hard", hardFecha(final("As duas tendências permanecem presentes ao mesmo tempo, exigindo atenção para que cada uma possa se manifestar de forma produtiva.")))
  const avisoSo = (titulo: string, texto: string) => { const v = final(texto); confere(titulo, v.ok && v.avisos.some((x) => /^sintese_final\[0\]: fechamento que pede atenção/.test(x)), JSON.stringify(v.ok ? v.avisos : v.violacoes).slice(0, 200)) }
  avisoSo("resíduo N-383686 ('tensão que exigem atenção') segue só aviso", "As forças de cooperação e entendimento coexistem com áreas de tensão que exigem atenção.")
  avisoSo("resíduo N-bfa037 ('demandando atenção às diferenças') segue só aviso", "Há apoio e atrito, mas também demandando atenção às diferenças que podem surgir.")
  avisoSo("'requerem atenção' sem objetivo segue só aviso", "Há apoio e atrito, e as tensões requerem atenção.")

  // nada disso é global: uma dinâmica pode ser descrita como exigente
  for (const bloco of ["sintese_da_relacao", "onde_se_encontram", "onde_ha_tensao"] as const) {
    const v = roda((r) => { if (r[bloco]) par(r, bloco).texto = "Há apoio e atrito entre vocês, e a combinação é exigente: requer esforço, demanda paciência e exige atenção para que a relação seja entendida." })
    confere(`'requer/demanda/exige' descrevendo uma dinâmica exigente em ${bloco} não vira violação de fechamento`, !viol(v).some((x) => /fecha com condição ou prescrição/.test(x)), JSON.stringify(viol(v)).slice(0, 200))
  }
  confere("'exige' sem objeto prescritivo na síntese final não é hard", !hardFecha(final("A configuração é exigente e permanece em aberto entre apoio e atrito.")))
  confere("'requer espaço' (objeto que não é prescritivo) não é hard", !hardFecha(final("Há apoio e atrito, e a dinâmica requer espaço próprio para cada um dos lados.")))

  // 2 · causalidade: a forma da afirmação, e não o verbo
  const semCausal = (titulo: string, bloco: string, texto: string) => {
    const v = roda((r) => { if (r[bloco]) par(r, bloco).texto = texto; else r[bloco] = { paragrafos: [{ texto, evidencias: [payload.idsCitaveis[0]] }] } })
    confere(titulo, !viol(v).some((x) => /atribui causa|expressão proibida/.test(x)), JSON.stringify(viol(v)).slice(0, 200))
  }
  // os três falsos positivos da bateria 3, exatamente
  semCausal("FP 1 da bateria 3 ('podem ter um impacto maior do que essa semelhança')", "sintese_da_relacao", "Ainda assim, é importante considerar que choques entre outros planetas podem ter um impacto maior do que essa semelhança.")
  semCausal("FP 2 da bateria 3 ('amortecer o impacto')", "sintese_da_relacao", "As reações podem ficar defensivas, especialmente se não houver um interesse emocional mais profundo para amortecer o impacto.")
  semCausal("FP 3 da bateria 3 ('podem influenciar a dinâmica')", "sintese_da_relacao", "As divergências de valores continuam presentes e podem influenciar a dinâmica.")
  semCausal("'isso pode influenciar a dinâmica' não é causalidade inventada", "sintese_da_relacao", "Isso pode influenciar a dinâmica entre vocês.")
  semCausal("'tende a influenciar' (infinitivo) não é causalidade afirmada", "sintese_da_relacao", "A diferença de modos tende a influenciar o ritmo da relação.")
  // a causalidade realmente inventada continua hard
  const comCausal = (titulo: string, texto: string) => { const v = roda((r) => { par(r, "sintese_da_relacao").texto = texto }); confere(titulo, viol(v).some((x) => /atribui causa|expressão proibida/.test(x)), JSON.stringify(viol(v)).slice(0, 200)) }
  comCausal("'você é influenciado por terra' continua hard", "Há apoio e atrito, e você é influenciado por terra, enquanto a outra pessoa é guiada por fogo.")
  comCausal("'Saturno influencia o humor' (indicativo) é hard", "Há apoio e atrito, e o Saturno da outra pessoa influencia o seu humor.")
  comCausal("'impacta' (indicativo) é hard", "Há apoio e atrito, e o Marte dela impacta a sua rotina.")
  comCausal("'X causa Y' continua hard", "Há apoio e atrito, e o Sol causa o conflito entre vocês.")
  comCausal("'por causa de X acontece Y' é hard", "Há apoio e atrito, e por causa do Marte dela acontece a discussão.")
  comCausal("'é impactado por' é hard", "Há apoio e atrito, e você é impactado pelo Plutão dela.")

  // 3 · duração e permanência da relação
  const duracao = (titulo: string, texto: string, bloco = "sintese_da_relacao") => {
    const v = roda((r) => { if (r[bloco]) par(r, bloco).texto = texto })
    confere(titulo, viol(v).some((x) => /afirma duração ou permanência/.test(x)), JSON.stringify(viol(v)).slice(0, 200))
  }
  duracao("'cooperação duradoura' é hard", "Seu Sol em trígono com Saturno da outra pessoa sugere uma cooperação duradoura.")
  duracao("'relação duradoura e responsável' é hard (na síntese final)", "Há potencial para uma relação duradoura e responsável, e também há atrito.", "sintese_final")
  duracao("'colaboração duradoura' é hard", "Há um vínculo que pode trazer estabilidade, possibilitando uma colaboração duradoura.")
  duracao("'durabilidade' é hard", "O trígono proporciona continuidade e durabilidade à parceria.")
  duracao("'duradouro' é hard", "Há apoio e atrito, e o vínculo pode ser duradouro.")
  duracao("'de longo prazo' como previsão é hard", "Há apoio e atrito, e a relação pode ser pensada de longo prazo.")
  duracao("'permanente' é hard", "Há apoio e atrito, e o vínculo é permanente.")
  const limpoDuracao = (titulo: string, texto: string) => { const v = roda((r) => { par(r, "sintese_da_relacao").texto = texto }); confere(titulo, !viol(v).some((x) => /afirma duração/.test(x)), JSON.stringify(viol(v)).slice(0, 160)) }
  limpoDuracao("'continuidade' e 'ao longo do tempo' não são previsão de duração", "Seu Sol em trígono com Saturno da outra pessoa sugere responsabilidade e continuidade, que pode sustentar a relação ao longo do tempo.")
  limpoDuracao("descrição de estabilidade sem previsão passa", "Há apoio e estabilidade em algumas áreas, e atrito em outras.")
  // o texto final é que não pode: a evidência de origem mencionar duração não autoriza
  const comEvidenciaDeDuracao = casos.findIndex((_, j) => /duradour|durabilidade/i.test(JSON.stringify(prepara(j).payload.aspectos.map((d) => d.evidencia))))
  if (comEvidenciaDeDuracao >= 0) {
    const t = prepara(comEvidenciaDeDuracao)
    const r = clone(respostaBoa(t.selecao, t.payload)) as unknown as Record<string, unknown>
    ;(r.sintese_da_relacao as { paragrafos: Array<{ texto: string }> }).paragrafos[0].texto = "Há apoio e atrito, e a relação é duradoura."
    const v = verificarRespostaSinastria({ bruto: r, payload: t.payload, selecao: t.selecao, locale: "pt" })
    confere("a evidência que fala de duração não autoriza o texto a prever duração", !v.ok && v.violacoes.some((x) => /afirma duração ou permanência/.test(x)))
  }
  // EN e ES (o padrão, direto)
  const en = ["a lasting relationship", "a long-term bond", "a permanent connection", "an enduring partnership"]
  const es = ["una relación duradera", "un vínculo a largo plazo", "una conexión permanente"]
  for (const t of en) confere(`EN: "${t}" é duração prevista`, DURACAO.en.test(t))
  for (const t of es) confere(`ES: "${t}" é duração prevista`, DURACAO.es.test(t))
  confere("EN e ES: descrição sem previsão passa", !DURACAO.en.test("support and friction exist in different areas") && !DURACAO.es.test("hay apoyo y fricción en áreas distintas"))
  confere("EN e ES: causalidade afirmada é hard e 'can influence' não", CAUSAL_ATRIBUIDA.en.some((r) => r.test("you are influenced by earth")) && !CAUSAL_ATRIBUIDA.en.some((r) => r.test("this can influence the dynamic")) && CAUSAL_ATRIBUIDA.es.some((r) => r.test("tú eres influenciado por la tierra")) && !CAUSAL_ATRIBUIDA.es.some((r) => r.test("esto puede influir en la dinámica")))

  // 4 · o prompt: sem molde, com a regra de signo, elemento e modo
  const p = promptSinastria(payload).user
  const segFinal = p.slice(p.indexOf("SÍNTESE FINAL:"), p.indexOf("SÍNTESE DA RELAÇÃO:"))
  confere("o prompt NÃO traz mais o exemplo positivo literal", !/Há apoio e capacidade de cooperação|duas tendências permanecem presentes/.test(p))
  confere("o contrato de síntese final traz só o exemplo incorreto, entre aspas, e a explicação abstrata do correto", (segFinal.match(/'[A-ZÀ-Ú][^']{40,}\.'/g) ?? []).length === 1 && /desde que ambos tenham paciência/.test(segFinal) && /Correto = descreve a configuração que existe e deixa a tensão em aberto, sem ensinar como administrá-la/.test(segFinal) && /coexistência, contraste, tensão não resolvida/.test(segFinal) && /não há frase pronta para imitar/.test(segFinal))
  confere("o prompt mantém a regra funcional da síntese final", /não prescreve a maneira de administrá-la/.test(segFinal) && /não decide o destino da relação/.test(segFinal))
  confere("o prompt não obriga duas frases nem estrutura lexical", !/duas frases|exatamente (uma|duas)/i.test(segFinal))
  confere("o prompt traz a regra curta de signo, elemento e modo, sem lista de adjetivos", /SIGNO, ELEMENTO E MODO/.test(p) && /não infira características, personalidade ou estilo próprios daquele signo, elemento ou modo/.test(p) && /explicitamente no material enviado/.test(p) && /Não complete astrologia de memória/.test(p) && !/assertiv|direto|impulsiv|prátic[oa] e|teimos/i.test(p.slice(p.indexOf("SIGNO, ELEMENTO E MODO"), p.indexOf("SIGNO, ELEMENTO E MODO") + 400)))
}

// ── F · congelamento: prescrição reescrita, afinidade natural, "fortalecida" ───────
function parteF() {
  const k = casos.findIndex((_, j) => { const p = prepara(j).payload; return p.aspectos.length > 1 && p.semelhancas.length > 0 })
  confere("há um par com ponto em comum para os testes de congelamento", k >= 0)
  if (k < 0) return
  const { selecao, payload } = prepara(k)
  const boa = respostaBoa(selecao, payload)
  const semIds = payload.semelhancas.map((s) => s.id)
  const roda = (muda: (r: Record<string, unknown>) => void) => { const r = clone(boa) as unknown as Record<string, unknown>; muda(r); return verificarRespostaSinastria({ bruto: r, payload, selecao, locale: "pt" }) }
  const par = (r: Record<string, unknown>, bloco: string) => (r[bloco] as { paragrafos: Array<{ texto: string; evidencias: string[] }> }).paragrafos[0]
  const viol = (v: ReturnType<typeof roda>) => (v.ok ? [] : v.violacoes)
  const final = (texto: string) => roda((r) => { par(r, "sintese_final").texto = texto })
  const hardFecha = (v: ReturnType<typeof roda>) => viol(v).some((x) => /^sintese_final\[0\]: fecha com condição ou prescrição/.test(x))

  // 1 · prescrição reescrita: "o desafio está em <manejo> ... para <resultado>"
  const p30 = "A relação entre vocês apresenta um equilíbrio entre apoio e desafio, com potencial para crescimento mútuo e aprendizado. Há uma clara coexistência de forças que promovem um entendimento profundo e de tensões que podem trazer à tona diferenças significativas. O desafio está em lidar com os atritos enquanto aproveitam as áreas de apoio e cooperação para fortalecer o vínculo."
  confere("P-30b6f3 ('o desafio está em lidar com os atritos ... para fortalecer o vínculo') é HARD", hardFecha(final(p30)), JSON.stringify(viol(final(p30))).slice(0, 200))
  for (const [nome, texto] of [
    ["o desafio está em administrar", "Há apoio e atrito, e o desafio está em administrar as diferenças para que a relação siga."],
    ["o trabalho consiste em equilibrar", "Há apoio e atrito, e o trabalho consiste em equilibrar as duas forças."],
    ["o segredo está em aceitar", "Há apoio e atrito, e o segredo está em aceitar as diferenças."],
    ["aprendam a lidar", "Há apoio e atrito, e é preciso que aprendam a lidar com isso."],
    ["pode ser enriquecedora se ... forem valorizadas", "A convivência pode ser enriquecedora se as facilidades forem valorizadas sem ignorar os desafios."],
  ] as const) confere(`fechamento "${nome}" é HARD`, hardFecha(final(texto)), JSON.stringify(viol(final(texto))).slice(0, 160))
  // "desafio" e "para" soltos NÃO reprovam
  for (const [nome, texto] of [
    ["desafio como substantivo", "Há apoio em algumas áreas, e os desafios aparecem na comunicação."],
    ["o desafio permanece", "O desafio permanece em aberto entre o apoio e o atrito."],
    ["para sem prescrição", "O apoio existe para algumas áreas e o atrito para outras, e as duas coisas permanecem."],
    ["desafios para ambos", "Há desafios para ambos, e áreas de cooperação ao lado deles."],
    ["a configuração em aberto", "As áreas de apoio e as de atrito coexistem e a configuração permanece em aberto."],
  ] as const) confere(`'${nome}' na síntese final não é hard de fechamento`, !hardFecha(final(texto)), JSON.stringify(viol(final(texto))).slice(0, 160))
  confere("a mesma construção fora da síntese final não reprova por esta regra", !viol(roda((r) => { par(r, "sintese_da_relacao").texto = "Há apoio e atrito, e o desafio está em lidar com os atritos para fortalecer o vínculo." })).some((x) => /fecha com condição ou prescrição/.test(x)))

  // 2 · S8: "afinidade natural" afirmada, só em parágrafo apoiado em semelhança
  const p66 = "Vocês dois têm uma afinidade natural, evidenciada pela predominância do elemento terra em ambos os mapas e a presença dos sóis no mesmo elemento. Essa semelhança sugere que há um respeito mútuo pelo senso prático e uma capacidade de construir uma relação firme."
  const noPontos = (texto: string) => roda((r) => { r.pontos_em_comum = { paragrafos: [{ texto, evidencias: [semIds[0]] }] } })
  const s8 = (v: ReturnType<typeof roda>) => viol(v).some((x) => /semelhança convertida em afinidade natural \(S8\)/.test(x))
  if (payload.blocosElegiveis.includes("pontos_em_comum")) {
    confere("P-66bdb2 ('Vocês dois têm uma afinidade natural') é HARD S8 mesmo sem verbo de promessa", s8(noPontos(p66)), JSON.stringify(viol(noPontos(p66))).slice(0, 200))
    confere("'afinidade natural' direta em frase curta também é HARD S8", s8(noPontos("Os Sóis no mesmo elemento mostram uma afinidade natural entre vocês.")))
    confere("a possibilidade ('pode trazer uma afinidade natural') não é afirmação direta", !s8(noPontos("O elemento comum pode trazer uma afinidade natural e uma compreensão instintiva.")))
    confere("'sugere uma afinidade natural' (cautela) não é afirmação direta", !s8(noPontos("Os Sóis no mesmo elemento sugerem uma afinidade natural.")))
    confere("'afinidade teórica' (sustentada pela fonte) passa", !s8(noPontos("Ambos compartilham o elemento terra para seus Sóis, o que sugere uma afinidade teórica e um entendimento instintivo.")))
    confere("semelhança descrita como semelhança, base comum formal, passa", !s8(noPontos("Vocês compartilham o elemento terra como base comum formal, e a semelhança pode deixar um mapa sem complementar o outro.")))
    confere("a negação ('não há afinidade natural garantida') passa", !s8(noPontos("A semelhança de elemento não significa afinidade natural entre vocês.")))
  }
  // não é blacklist de "afinidade": só "afinidade natural", só apoiada em semelhança
  confere("'afinidade' sozinha não é S8", !s8(noPontos("Há uma afinidade entre os elementos dos dois Sóis.")))
  const comAspecto = roda((r) => { const p = par(r, "sintese_final"); p.texto = "Há apoio e atrito, e entre vocês existe uma afinidade natural."; p.evidencias = [...p.evidencias, semIds[0]] })
  confere("em parágrafo que também cita aspecto, 'afinidade natural' não vira S8 por esta regra", !s8(comAspecto))
  confere("EN e ES: 'natural affinity' e 'afinidad natural' diretas são pegas; a cautela não", afinidadeNaturalAfirmada("You have a natural affinity.", "en") !== null && afinidadeNaturalAfirmada("Tienen una afinidad natural.", "es") !== null && afinidadeNaturalAfirmada("This may bring a natural affinity.", "en") === null && afinidadeNaturalAfirmada("Esto puede traer una afinidad natural.", "es") === null)

  // 3 · "fortalecida": condição técnica de um corpo, e não a flexão
  const p335 = "A relação é fortalecida por um entendimento mútuo e apoio genuíno."
  confere("P-335cc5 ('A relação é fortalecida por um entendimento mútuo') deixa de ser falso positivo", !viol(roda((r) => { par(r, "sintese_da_relacao").texto = p335 })).some((x) => /condição natal/.test(x)), JSON.stringify(viol(roda((r) => { par(r, "sintese_da_relacao").texto = p335 }))))
  for (const t of ["O vínculo fica fortalecido por um apoio mútuo.", "A amizade é fortalecida pelo Sol em trígono com Saturno.", "Seu Sol em trígono com Saturno deixa a parceria fortalecida.", "A relação sai enfraquecida quando a comunicação falha."]) confere(`"${t}" não é condição natal`, !viol(roda((r) => { par(r, "sintese_da_relacao").texto = `Há apoio e atrito. ${t}` })).some((x) => /condição natal/.test(x)))
  // os casos verdadeiros continuam hard
  const natal = (titulo: string, t: string) => confere(titulo, viol(roda((r) => { par(r, "sintese_da_relacao").texto = t })).some((x) => /condição natal/.test(x)))
  natal("'Vênus está fortalecida' continua hard", "Vênus está fortalecida nesse encontro.")
  natal("'O Sol está fortalecido' continua hard", "O Sol está fortalecido nessa relação.")
  natal("'Sol da outra pessoa fortalecido' continua hard", "Há apoio, e o Sol da outra pessoa fortalecido sustenta a relação.")
  natal("'Saturno enfraquecido' continua hard", "Há apoio, e Saturno enfraquecido pesa nessa relação.")
  natal("'Marte está enfraquecido' continua hard", "Marte está enfraquecido e isso pesa.")
  natal("'dignidade' continua hard", "Há apoio, e a dignidade de Vênus é alta.")
  natal("'debilitado' continua hard", "Há apoio, e Marte está debilitado.")
  natal("'exaltado' continua hard", "Há apoio, e o Sol está exaltado.")
  natal("'afligido' continua hard", "Há apoio, e o Saturno afligido pesa.")
  natal("'em queda' continua hard", "Há apoio, e Vênus em queda pesa.")
  confere("EN e ES: condição técnica de corpo é hard e o adjetivo comum não", CONDICAO_NATAL_AMBIGUA.en.test("Venus is strengthened here") && !CONDICAO_NATAL_AMBIGUA.en.test("The relationship is strengthened by mutual understanding") && CONDICAO_NATAL_AMBIGUA.es.test("Venus está fortalecida aquí") && !CONDICAO_NATAL_AMBIGUA.es.test("La relación es fortalecida por el entendimiento mutuo") && CONDICAO_NATAL.en.test("Mars is debilitated") && CONDICAO_NATAL.es.test("Marte está afligido"))
}

parteA()
parteB()
parteC()
parteD()
parteE()
parteF()

if (falhas.length) {
  console.error(`\nA síntese de sinastria (desenho) falhou em ${falhas.length} ponto(s):\n`)
  for (const f of falhas.slice(0, 40)) console.error(`  ${f}`)
  if (falhas.length > 40) console.error(`  ... e mais ${falhas.length - 40}`)
  console.error("")
  process.exit(1)
}
console.log(`sinastria-síntese: ${conferidos} conferências (payload, prompt, schema, verificador estrutural da resposta; nenhuma chamada paga)`)
