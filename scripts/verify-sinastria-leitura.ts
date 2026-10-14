/**
 * Proteção da leitura relacional da sinastria: o mapa de eixos, o prompt, o
 * verificador e o pipeline de geração. Nenhuma chamada paga: o "modelo" é uma
 * função escrita aqui.
 *
 * Roda antes do build (npm run verify:sinastria-leitura).
 */
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { mapaDeEixos, temaDoContato, corposDoFato, TEMAS, pesoDeAspecto } from "../lib/astro/eixos-sinastria"
import { montarPayload, sustentaEncontro, sustentaTensao, type PayloadSinastria } from "../lib/astro/payload-sinastria"
import { CHAVES_DA_LEITURA, LIMITES_LEITURA, promptLeituraSinastria, type LeituraRelacional } from "../lib/astro/prompt-leitura-sinastria"
import { selecionarEvidencia } from "../lib/astro/selecao-sinastria"
import { verificarLeituraSinastria } from "../lib/astro/verificador-leitura-sinastria"
import { verificarSinastria } from "../lib/astro/verificador-sinastria"
import { DONOS } from "../lib/astro/payload-sinastria"
import { gerarLeituraSinastria, haLeituraParaEscrever, pedidoDeReparoDaLeitura, prepararLeitura } from "../lib/astro/gerar-leitura-sinastria"
import { VINCULOS } from "../lib/astro/sinastria-servico"
import { amostra } from "./simular-selecao-sinastria"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

const casos = amostra()
const prepara = (i: number, vinculo: (typeof VINCULOS)[number] = "amizade", locale: "pt" | "en" | "es" = "pt") => {
  const resultado = sinastria(mapaNatal(casos[i].a), mapaNatal(casos[i].b))
  return { resultado, ...prepararLeitura(resultado, { locale, vinculo }) }
}
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

// ── 1 · o tema de um contato ────────────────────────────────────────────────
confere("tema: Plutão manda sobre Sol", temaDoContato(["sun", "pluto"]) === "intensidade")
confere("tema: Netuno manda sobre Saturno (o mais lento dá o tema)", temaDoContato(["saturn", "neptune"]) === "idealizacao")
confere("tema: Saturno com Lua é segurança", temaDoContato(["moon", "saturn"]) === "seguranca")
confere("tema: Urano com Sol é autonomia", temaDoContato(["sun", "uranus"]) === "autonomia")
confere("tema: Vênus com Marte é atração", temaDoContato(["venus", "mars"]) === "atracao")
confere("tema: Marte com Sol é iniciativa", temaDoContato(["sun", "mars"]) === "iniciativa")
confere("tema: Mercúrio é troca", temaDoContato(["moon", "mercury"]) === "troca")
confere("tema: Lua com Vênus é acolhimento", temaDoContato(["moon", "venus"]) === "acolhimento")
confere("tema: Sol com Lua é reconhecimento", temaDoContato(["sun", "moon"]) === "reconhecimento")
confere("corpos do aspecto", corposDoFato("A.uranus~B.sun:quincunx").join() === "uranus,sun")
confere("corpos do overlay", corposDoFato("A.jupiter@B.casa3").join() === "jupiter")
confere("todo tema tem rótulo e pergunta", Object.values(TEMAS).every((t) => t.rotulo && t.pergunta))
confere("o peso de posição decresce e tem piso", pesoDeAspecto(0) === 1 && pesoDeAspecto(1) < 1 && pesoDeAspecto(30) === 0.25)

// ── 2 · o mapa de eixos, sobre a amostra ────────────────────────────────────
const perfis = new Set<string>()
let comCentral = 0
let coberturaDePerfil = 0
for (let i = 0; i < casos.length; i++) {
  for (const v of VINCULOS) {
    const { payload, mapa } = prepara(i, v)
    const rot = `${casos[i].rotulo} · ${v}`
    const todas = [...payload.aspectos, ...payload.overlays]
    const ids = new Set(todas.map((d) => d.id))
    if (todas.length === 0) {
      confere(`${rot}: sem dinâmica, sem eixo`, mapa.eixos.length === 0 && mapa.centrais.length === 0 && mapa.perfil === "indefinido")
      continue
    }
    perfis.add(mapa.perfil)
    comCentral += mapa.centrais.length > 0 ? 1 : 0
    confere(`${rot}: de um a dois temas centrais`, mapa.centrais.length >= 1 && mapa.centrais.length <= 2, String(mapa.centrais.length))
    confere(`${rot}: toda dinâmica está em exatamente um eixo`, mapa.eixos.flatMap((e) => e.membros.map((m) => m.id)).sort().join() === [...ids].sort().join())
    confere(`${rot}: os ids centrais existem no payload`, mapa.idsCentrais.every((id) => ids.has(id)))
    confere(`${rot}: tema isolado nunca é central`, mapa.eixos.every((e) => e.papel !== "isolado" || !mapa.centrais.includes(e.tema)))
    confere(`${rot}: o eixo isolado tem um membro só`, mapa.eixos.filter((e) => e.papel === "isolado").every((e) => e.membros.length === 1))
    // a primeira dinâmica de aspecto pesa mais que qualquer overlay: um eixo só de overlay nunca é o centro quando há aspecto
    if (payload.aspectos.length > 0) {
      confere(`${rot}: com aspectos, o centro tem aspecto`, mapa.eixos.filter((e) => e.papel === "central").every((e) => e.membros.some((m) => m.camada === "aspectos")))
    }
    // a contradição vai contra o perfil, está no topo e não é do centro
    for (const c of mapa.contradicoes) {
      confere(`${rot}: a contradição ${c.id} é do topo e de aspecto`, c.posicao < 4 && payload.aspectos.some((d) => d.id === c.id))
      confere(`${rot}: a contradição ${c.id} não está no centro`, !mapa.idsCentrais.includes(c.id))
    }
    if (mapa.perfil !== "apoio" && mapa.perfil !== "tensao") confere(`${rot}: perfil ambivalente não tem contradição`, mapa.contradicoes.length === 0)
    // determinismo
    confere(`${rot}: o mapa é determinístico`, JSON.stringify(mapaDeEixos(payload)) === JSON.stringify(mapa))
    coberturaDePerfil += 1
  }
}
confere("a amostra produz mais de um perfil de centro (o mapa distingue relações)", perfis.size >= 3, [...perfis].join())
confere("há centro em toda relação com dinâmica", comCentral === coberturaDePerfil)

// ── 3 · o prompt ────────────────────────────────────────────────────────────
for (const locale of ["pt", "en", "es"] as const) {
  const { payload, prompt, mapa } = prepara(0, "romantico", locale)
  confere(`prompt ${locale}: traz o mapa de eixos`, prompt.user.includes("MAPA DE EIXOS") && prompt.user.includes(`[${mapa.centrais[0]}]`))
  confere(`prompt ${locale}: pede as quatro chaves`, CHAVES_DA_LEITURA.every((k) => prompt.user.includes(`"${k}"`)))
  confere(`prompt ${locale}: veta a palavra arquétipo e o travessão`, /arqu[eé]tipo|archetype|arquetipo/i.test(prompt.system) && /travess|em dash|raya/i.test(prompt.system))
  confere(`prompt ${locale}: tem a regra de idioma`, prompt.user.includes("IDIOMA:"))
  confere(`prompt ${locale}: não pede escolher um lado nem enumerar`, !/sem escolher/i.test(prompt.user))
  confere(`prompt ${locale}: traz o quadro de donos`, prompt.user.includes("QUADRO DE DONOS") && /seus: /.test(prompt.user) && /da outra pessoa: /.test(prompt.user))
  confere(`prompt ${locale}: traz a distribuição dos contatos e pede os dois lados`, /DISTRIBUIÇÃO DOS CONTATOS/.test(prompt.user) && /\d+ contatos: \d+ harmônicos/.test(prompt.user) && /OS DOIS LADOS/.test(prompt.user))
  confere(`prompt ${locale}: proíbe o andaime e a pessoa-planeta`, /SEM ANDAIME/.test(prompt.user) && /representado por/.test(prompt.user))
  confere(`prompt ${locale}: obriga parecer, contradição e significado`, /PARECER/.test(prompt.user) && /CONTRADIÇÃO|contradição/.test(prompt.user) && /SIGNIFICADO/.test(prompt.user))
  confere(`prompt ${locale}: cada id de dinâmica do payload aparece`, [...payload.aspectos, ...payload.overlays].every((d) => prompt.user.includes(`[${d.id}]`)))
}
{
  const a = prepara(2).prompt
  const b = prepara(2).prompt
  confere("o prompt é determinístico", a.user === b.user && a.system === b.system)
}

// ── 4 · o verificador, com respostas escritas à mão ────────────────────────
/** O primeiro apoio e a primeira tensão da relação: a leitura mostra os dois lados quando existem. */
function ladosDe(payload: PayloadSinastria): string[] {
  const todas = [...payload.aspectos, ...payload.overlays]
  return [todas.find((d) => sustentaEncontro(d) && !sustentaTensao(d)), todas.find((d) => sustentaTensao(d) && !sustentaEncontro(d))].filter((d): d is NonNullable<typeof d> => Boolean(d)).map((d) => d.id)
}

/** Uma leitura que o verificador deve aprovar, escrita a partir do mapa. */
function leituraBoa(payload: PayloadSinastria, i: number): LeituraRelacional {
  const mapa = mapaDeEixos(payload)
  const todas = [...payload.aspectos, ...payload.overlays]
  const centrais = todas.filter((d) => mapa.idsCentrais.includes(d.id))
  const topo = centrais[0]
  const fato = topo.fatos[0].texto.replace(/\s*\(.*\)\s*$/, "")
  const rot = (t: string) => TEMAS[t as keyof typeof TEMAS].rotulo
  const apoio = centrais.filter(sustentaEncontro).map((d) => d.id)
  const tensao = centrais.filter(sustentaTensao).map((d) => d.id)
  const extremos = mapa.perfil === "ambivalente" ? [...new Set([...apoio.slice(0, 1), ...tensao.slice(0, 1), topo.id])] : [topo.id]
  const parecer = {
    texto: `O encontro se organiza em torno de ${rot(mapa.centrais[0])}: ${fato}${mapa.perfil === "ambivalente" ? ", com apoio e tensão nos dois sentidos" : ""}.`,
    evidencias: extremos,
  }
  const meio = [
    {
      texto: `Os contatos do centro se reforçam ou se contradizem entre si, e ${mapa.contradicoes.length ? "o contraponto do topo complica a leitura sem desfazê-la" : "nenhum contraponto forte desfaz a direção"}.`,
      evidencias: [...new Set([...centrais.map((d) => d.id), ...mapa.contradicoes.map((c) => c.id), ...ladosDe(payload)])],
    },
  ]
  const significado = {
    texto: `Em ${rot(mapa.centrais[0])}, cada pessoa traz ao tema um modo próprio de estar, e a outra o desperta ou o desafia de maneira diferente.`,
    evidencias: [topo.id],
  }
  void i
  return { parecer, aproxima_e_tensiona: meio, significado, na_relacao: null }
}
const veredito = (b: unknown, i: number, v: (typeof VINCULOS)[number] = "amizade") => {
  const p = prepara(i, v)
  return verificarLeituraSinastria({ bruto: b, payload: p.payload, selecao: p.selecao, locale: "pt", mapa: p.mapa })
}
const rejeita = (titulo: string, mut: (l: any, p: ReturnType<typeof prepara>) => void, trecho: RegExp, i = 0, v: (typeof VINCULOS)[number] = "amizade") => {
  const p = prepara(i, v)
  const l = clone(leituraBoa(p.payload, i))
  mut(l, p)
  const r = verificarLeituraSinastria({ bruto: l, payload: p.payload, selecao: p.selecao, locale: "pt", mapa: p.mapa })
  confere(`${titulo}: reprova`, !r.ok)
  if (!r.ok) confere(`${titulo}: pelo motivo certo`, r.violacoes.some((x) => trecho.test(x)), r.violacoes.join(" | ").slice(0, 280))
}

let aprovadas = 0
let tentadas = 0
for (let i = 0; i < casos.length; i++) {
  for (const v of VINCULOS) {
    const p = prepara(i, v)
    if (!haLeituraParaEscrever(p)) continue
    tentadas += 1
    const r = verificarLeituraSinastria({ bruto: leituraBoa(p.payload, i), payload: p.payload, selecao: p.selecao, locale: "pt", mapa: p.mapa })
    if (r.ok) aprovadas += 1
    else confere(`${casos[i].rotulo} · ${v}: a leitura boa escrita à mão passa`, false, r.violacoes.join(" | ").slice(0, 300))
  }
}
confere("a leitura boa passa em toda a amostra", aprovadas === tentadas && tentadas > 0, `${aprovadas}/${tentadas}`)

rejeita("chave ausente", (l) => { delete l.significado }, /significado/)
rejeita("chave fora do schema", (l) => { l.extra = 1 }, /fora do schema/)
rejeita("aproxima_e_tensiona vazio", (l) => { l.aproxima_e_tensiona = [] }, /vazio/)
rejeita("parágrafo a mais em aproxima", (l) => { l.aproxima_e_tensiona = [l.aproxima_e_tensiona[0], l.aproxima_e_tensiona[0], l.aproxima_e_tensiona[0]] }, /acima de/)
rejeita("id que não existe", (l) => { l.parecer.evidencias = ["inventado:id"] }, /não está na lista/)
rejeita("parágrafo sem evidência", (l) => { l.significado.evidencias = [] }, /não cita nenhuma evidência/)
rejeita("o parecer cita só tema que não é central", (l, p) => {
  const m = mapaDeEixos(p.payload)
  const fora = [...p.payload.aspectos, ...p.payload.overlays].find((d) => !m.idsCentrais.includes(d.id))!
  l.parecer.evidencias = [fora.id]
}, /nenhuma dinâmica de um eixo central/)
rejeita("o parecer não nomeia nenhum corpo", (l) => { l.parecer.texto = "O encontro se organiza em torno de algo importante entre vocês." }, /não nomeia nenhum planeta/)
rejeita("o significado cita só tema fora do centro", (l, p) => {
  const m = mapaDeEixos(p.payload)
  const fora = [...p.payload.aspectos, ...p.payload.overlays].find((d) => !m.idsCentrais.includes(d.id))!
  l.significado.evidencias = [fora.id]
}, /significado: não cita nenhuma dinâmica de um eixo central/)
rejeita("cita percentual", (l) => { l.significado.texto += " Cerca de 60% dos contatos são harmônicos." }, /percentual/)
{
  // quando a relação tem apoio e tensão, os dois lados aparecem
  let visto = 0
  for (let i = 0; i < casos.length && visto < 4; i++) {
    const p = prepara(i)
    if (!haLeituraParaEscrever(p)) continue
    const lados = ladosDe(p.payload)
    if (lados.length < 2) continue
    visto += 1
    for (const [qual, id] of [["o que favorece", lados[0]], ["o que tensiona", lados[1]]] as const) {
      const l = clone(leituraBoa(p.payload, i))
      for (const par of [l.parecer, ...l.aproxima_e_tensiona, l.significado]) par.evidencias = par.evidencias.filter((e: string) => e !== id)
      for (const par of [l.parecer, ...l.aproxima_e_tensiona, l.significado]) if (par.evidencias.length === 0) par.evidencias = [p.mapa.idsCentrais[0]]
      const r = verificarLeituraSinastria({ bruto: l, payload: p.payload, selecao: p.selecao, locale: "pt", mapa: p.mapa })
      // só é omissão se nenhuma outra dinâmica do mesmo lado continua citada
      const lado = qual === "o que favorece" ? [...p.payload.aspectos, ...p.payload.overlays].filter((d) => sustentaEncontro(d) && !sustentaTensao(d)) : [...p.payload.aspectos, ...p.payload.overlays].filter((d) => sustentaTensao(d) && !sustentaEncontro(d))
      const citadas = new Set([l.parecer, ...l.aproxima_e_tensiona, l.significado].flatMap((x: any) => x.evidencias))
      if (lado.some((d) => citadas.has(d.id))) continue
      confere(`${casos[i].rotulo}: omitir ${qual} reprova`, !r.ok && r.violacoes.some((x) => /omite o que/.test(x)), !r.ok ? r.violacoes.join(" | ").slice(0, 200) : "aprovou")
    }
  }
  confere("a amostra tem relação com os dois lados para exercitar a regra", visto > 0)
}
rejeita("diz eixo (vocabulário do bastidor)", (l) => { l.significado.texto += " O eixo central do vínculo é este." }, /usa "eixo"/)
rejeita("identifica uma pessoa com um planeta", (l) => { l.significado.texto += " Você, representado por Netuno, percebe o outro." }, /identifica uma pessoa com um planeta/)
rejeita("diz arquétipo", (l) => { l.significado.texto += " Isto é um arquétipo da relação." }, /arquétipo/)
rejeita("compatibilidade", (l) => { l.significado.texto += " A compatibilidade entre vocês é alta." }, /compatibilidade|veredito/i)
rejeita("previsão de duração", (l) => { l.aproxima_e_tensiona[0].texto += " Esta relação será duradoura." }, /dura|previs/i)
rejeita("conselho", (l) => { l.aproxima_e_tensiona[0].texto += " Vocês precisam conversar mais." }, /conselho|precisam|prescri/i)
rejeita("fecho condicional", (l) => { l.significado.texto += " Isto funciona desde que ambos tenham paciência." }, /fecha com condição/)
rejeita("bastidor", (l) => { l.significado.texto += " Segundo o repertório, isto é assim." }, /fala do sistema/)
rejeita("vínculo que o payload não tem", (l) => { l.significado.texto += " Como um casal, vocês se veem." }, /termo de relação romantico/, 0, "amizade")
rejeita("parágrafo gigante", (l) => { l.significado.texto = Array(160).fill("palavra").join(" ") }, /palavras, acima de/)
rejeita("parecer gigante", (l) => { l.parecer.texto += " " + Array(90).fill("palavra").join(" ") }, /parecer: \d+ palavras/)

// a conferência de aspecto e dono por oração: dois contatos na mesma frase, ligados por "mas"
{
  const fato = (id: string, corpoA: string, corpoB: string, aspecto: string) => ({ id, tipo: "aspecto", corpoA, corpoB, aspecto })
  const resultado = {
    aspectos: [fato("A.mars~B.venus:sextile", "mars", "venus", "sextile"), fato("A.venus~B.mars:square", "venus", "mars", "square")],
    overlays: [], semelhancas: [], indisponibilidades: [], recusadas: [], versao: "t",
  } as never
  const checa = (texto: string, porOracao: boolean) =>
    verificarSinastria({ texto: { afirmacoes: [{ texto, fatos: ["A.mars~B.venus:sextile"] }], sintese: texto }, resultado, locale: "pt", donos: DONOS.pt, porOracao, verificarContradicao: false })
  const certo = "O sextil entre seu Marte e a Vênus da outra pessoa sugere colaboração, mas a quadratura entre sua Vênus e Marte dela indica atrito."
  const trocado = "O sextil entre seu Marte e a Vênus da outra pessoa sugere colaboração, mas a quadratura entre seu Marte e a Vênus da outra pessoa indica atrito."
  confere("por oração: dois contatos certos na mesma frase passam", checa(certo, true).ok, JSON.stringify((checa(certo, true) as any).violacoes))
  confere("por frase (como era): o mesmo texto certo era reprovado, e é por isso que existe a opção", !checa(certo, false).ok)
  const t = checa(trocado, true)
  confere("por oração: o quadrado que não existe continua reprovado", !t.ok && t.violacoes.some((x) => /square|inexistente/.test(x)), JSON.stringify((t as any).violacoes))
}

// o parecer que escolhe um lado quando o centro é ambivalente
{
  let visto = 0
  for (let i = 0; i < casos.length && visto < 3; i++) {
    const p = prepara(i)
    if (!haLeituraParaEscrever(p) || p.mapa.perfil !== "ambivalente") continue
    visto += 1
    const l = clone(leituraBoa(p.payload, i))
    const direcao = (d: { id: string }) => [...p.payload.aspectos, ...p.payload.overlays].find((x) => x.id === d.id)!
    const soApoio = p.payload.aspectos.filter((d) => p.mapa.idsCentrais.includes(d.id) && sustentaEncontro(d) && !sustentaTensao(d))[0]
    if (!soApoio) continue
    l.parecer.evidencias = [direcao(soApoio).id]
    const r = verificarLeituraSinastria({ bruto: l, payload: p.payload, selecao: p.selecao, locale: "pt", mapa: p.mapa })
    confere(`${casos[i].rotulo}: parecer de um lado só com centro ambivalente reprova`, !r.ok && r.violacoes.some((x) => /ambivalente/.test(x)), !r.ok ? r.violacoes.join(" | ").slice(0, 200) : "aprovou")
  }
  confere("a amostra tem relação ambivalente para exercitar a regra", visto > 0)
}

// a contradição escondida
{
  let visto = 0
  for (let i = 0; i < casos.length; i++) {
    const p = prepara(i)
    if (!haLeituraParaEscrever(p) || p.mapa.contradicoes.length === 0) continue
    visto += 1
    const l = clone(leituraBoa(p.payload, i))
    const escondidas = new Set(p.mapa.contradicoes.map((c) => c.id))
    l.aproxima_e_tensiona = l.aproxima_e_tensiona.map((q: any) => ({ ...q, evidencias: q.evidencias.filter((id: string) => !escondidas.has(id)) }))
    for (const q of l.aproxima_e_tensiona) if (q.evidencias.length === 0) q.evidencias = [p.mapa.idsCentrais[0]]
    const r = verificarLeituraSinastria({ bruto: l, payload: p.payload, selecao: p.selecao, locale: "pt", mapa: p.mapa })
    confere(`${casos[i].rotulo}: esconder a contradição relevante reprova`, !r.ok && r.violacoes.some((x) => /omite a contradição/.test(x)), !r.ok ? r.violacoes.join(" | ").slice(0, 200) : "aprovou")
    if (visto >= 3) break
  }
  confere("a amostra tem relação com contradição para exercitar a regra", visto > 0)
}

// na_relacao só com campo concreto
{
  const p = prepara(0)
  const l = clone(leituraBoa(p.payload, 0)) as LeituraRelacional
  const topo = (p.payload.aspectos[0] ?? p.payload.overlays[0]).id
  const semCampo = [...p.payload.aspectos, ...p.payload.overlays].find((d) => !d.dimensoes.some((x) => ["comunicacao", "afeto_intimidade", "emocional", "vida_pratica", "sustentacao_compromisso", "transformacao"].includes(x)))
  if (semCampo) {
    l.na_relacao = { texto: "Isto pode aparecer na convivência.", evidencias: [semCampo.id] }
    const r = verificarLeituraSinastria({ bruto: l, payload: p.payload, selecao: p.selecao, locale: "pt", mapa: p.mapa })
    confere("na_relacao sem campo concreto sustentado reprova", !r.ok && r.violacoes.some((x) => /na_relacao/.test(x)), !r.ok ? "" : "aprovou")
  } else {
    confere("(amostra sem dinâmica sem campo; regra de na_relacao conferida só pelo outro lado)", true)
  }
  void topo
}

// resposta que não é objeto
confere("resposta nula reprova", !veredito(null, 0).ok)
confere("resposta em texto reprova", !veredito("texto solto", 0).ok)

// ── 5 · o pipeline, com modelo escrito à mão ───────────────────────────────
void (async () => {
  const p = prepara(0, "amizade")
  const boa = leituraBoa(p.payload, 0)
  const ruim = { ...clone(boa), significado: { texto: "Isto vale desde que ambos tenham paciência.", evidencias: boa.significado.evidencias } }

  let chamadas = 0
  const r1 = await gerarLeituraSinastria({ preparo: p, locale: "pt", gerar: async () => (chamadas += 1, boa) })
  confere("pipeline: resposta boa vale e custa uma chamada", r1.origem === "geracao" && chamadas === 1 && r1.reparos === 0)

  chamadas = 0
  const prompts: string[] = []
  const r2 = await gerarLeituraSinastria({
    preparo: p,
    locale: "pt",
    gerar: async (pedido) => {
      chamadas += 1
      prompts.push(pedido.user)
      return chamadas === 1 ? ruim : boa
    },
  })
  confere("pipeline: um reparo recupera", r2.origem === "reparo" && chamadas === 2 && r2.reparos === 1, `${r2.origem} ${chamadas}`)
  confere("pipeline: o reparo leva a resposta anterior e as violações", prompts[1].includes("RESPOSTA ANTERIOR") && prompts[1].includes("VIOLAÇÕES APONTADAS") && prompts[1].includes("fecha com condição"))

  chamadas = 0
  const r3 = await gerarLeituraSinastria({ preparo: p, locale: "pt", gerar: async () => (chamadas += 1, ruim) })
  confere("pipeline: dois fracassos, indisponível, e nunca mais de duas chamadas (sem molde)", r3.origem === "indisponivel" && r3.leitura === null && chamadas === 2, `${r3.origem} ${chamadas}`)

  chamadas = 0
  const r4 = await gerarLeituraSinastria({ preparo: p, locale: "pt", reparoAtivo: false, gerar: async () => (chamadas += 1, ruim) })
  confere("pipeline: reparo desligado faz uma chamada só", r4.origem === "indisponivel" && chamadas === 1)

  const pedido = pedidoDeReparoDaLeitura(p.prompt, ruim, ["x: y"])
  confere("o reparo mantém o system do prompt", pedido.system === p.prompt.system)

  confere("sem dinâmica não há o que escrever", !haLeituraParaEscrever({ ...p, payload: { ...p.payload, aspectos: [], overlays: [] } }))

  const total = conferidos
  if (falhas.length) {
    console.error(`sinastria-leitura: ${falhas.length} falha(s) em ${total} conferências`)
    for (const f of falhas.slice(0, 40)) console.error(` - ${f}`)
    process.exit(1)
  }
  console.log(`sinastria-leitura: ${total} conferências (mapa de eixos, prompt, verificador, pipeline; nenhuma chamada paga)`)
})()
void LIMITES_LEITURA
void montarPayload
void selecionarEvidencia
