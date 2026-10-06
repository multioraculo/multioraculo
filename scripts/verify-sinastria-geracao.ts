/**
 * Proteção do contrato de geração da sinastria: o juiz semântico em sombra, o
 * reparo limitado, o molde determinístico e o pipeline. Nenhuma chamada paga:
 * o "modelo" e o "juiz" são funções escritas aqui.
 *
 * Roda antes do build (npm run verify:sinastria-geracao).
 */
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { selecionarEvidencia } from "../lib/astro/selecao-sinastria"
import { BLOCOS, montarPayload, sustentaEncontro, sustentaTensao, type IdDeBloco, type PayloadSinastria } from "../lib/astro/payload-sinastria"
import { promptSinastria, type SinteseSinastria } from "../lib/astro/prompt-sinastria"
import { verificarRespostaSinastria } from "../lib/astro/verificador-resposta-sinastria"
import { VINCULOS, type Vinculo } from "../lib/astro/sinastria-servico"
import { CONFIG_DO_JUIZ, REGRAS_DO_JUIZ, calibrar, executarJuizEmSombra, lerSaidaDoJuiz, paragrafosParaOJuiz, pedidoDoJuiz } from "../lib/astro/juiz-semantico-sinastria"
import { LIMITE_DE_REPAROS, conferirReparo, executarPipeline, localizar, moldeDeterministico, pedidoDeReparo } from "../lib/astro/pipeline-sinastria"
import { amostra } from "./simular-selecao-sinastria"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

const casos = amostra()
const prepara = (i: number, vinculo: Vinculo = "amizade", locale: "pt" | "en" | "es" = "pt") => {
  const selecao = selecionarEvidencia(sinastria(mapaNatal(casos[i].a), mapaNatal(casos[i].b)))
  return { selecao, payload: montarPayload(selecao, { locale, vinculo }) }
}
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

/** Uma resposta que o verificador estrutural aprova, escrita à mão. */
function respostaBoa(payload: PayloadSinastria): SinteseSinastria {
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

// ── o molde ─────────────────────────────────────────────────────────────────
let moldes = 0
for (let i = 0; i < casos.length; i++) {
  for (const v of VINCULOS) {
    const { selecao, payload } = prepara(i, v)
    const m = moldeDeterministico(payload)
    const rot = `${casos[i].rotulo} · ${v}`
    if ((payload.aspectos.length + payload.overlays.length) === 0) { confere(`${rot}: sem dinâmica, sem molde`, m === null); continue }
    confere(`${rot}: há molde`, m !== null)
    if (!m) continue
    const ver = verificarRespostaSinastria({ bruto: m, payload, selecao, locale: "pt" })
    confere(`${rot}: o molde passa no verificador estrutural`, ver.ok, ver.ok ? "" : ver.violacoes.join(" | ").slice(0, 300))
    moldes += 1
    // só o que o payload trouxe
    const citados = new Set(BLOCOS.flatMap((b) => (m[b]?.paragrafos ?? []).flatMap((p) => p.evidencias)))
    confere(`${rot}: o molde só cita ids do payload`, [...citados].every((id) => payload.idsCitaveis.includes(id)))
  }
}
confere("o molde não existe fora do português", moldeDeterministico(prepara(0, "amizade", "en").payload) === null && moldeDeterministico(prepara(0, "amizade", "es").payload) === null)

// ── o juiz em sombra e o pipeline (assíncronos) ──────────────────────────────
async function principal() {
{
  confere("o juiz tem as onze regras", REGRAS_DO_JUIZ.length === 11 && REGRAS_DO_JUIZ.map((r) => r.id).join(",") === "S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11")
  confere("o juiz só existe em sombra, a temperatura 0", CONFIG_DO_JUIZ.modo === "sombra" && CONFIG_DO_JUIZ.temperatura === 0)

  const { payload } = prepara(0)
  const resp = respostaBoa(payload)
  const pedido = pedidoDoJuiz(payload, resp)
  confere("o pedido do juiz traz as onze regras", REGRAS_DO_JUIZ.every((r) => pedido.user.includes(`${r.id} ${r.nome}`)))
  confere("o pedido do juiz traz um item por parágrafo", pedido.paragrafos.length === BLOCOS.reduce((n, b) => n + (resp[b]?.paragrafos.length ?? 0), 0))

  // o juiz só vê a evidência que o parágrafo citou
  const todas = [...payload.aspectos, ...payload.overlays]
  const citadas = new Set(BLOCOS.flatMap((b) => (resp[b]?.paragrafos ?? []).flatMap((p) => p.evidencias)))
  const naoCitada = todas.find((d) => !citadas.has(d.id) && !d.fatos.some((f) => citadas.has(f.id)))
  if (naoCitada) {
    confere("o juiz não recebe a evidência de dinâmica que ninguém citou", !pedido.user.includes(naoCitada.fatos[0].texto))
  }
  confere("o pedido do juiz traz o vínculo e a evidência citada com os fatos", pedido.user.includes("VÍNCULO DECLARADO: amizade") && pedido.paragrafos.every((p) => p.evidenciaCitada.length > 0))

  // o id estável de cada parágrafo, que é o único elo entre o pedido e a resposta
  const ids = pedido.paragrafos.map((p) => p.paragraph_id)
  confere("os ids dos parágrafos são 'bloco:indice', únicos e estáveis", ids.every((i) => /^[a-z_]+:\d+$/.test(i)) && new Set(ids).size === ids.length && ids.includes("sintese_da_relacao:0") && JSON.stringify(ids) === JSON.stringify(pedidoDoJuiz(payload, resp).paragrafos.map((p) => p.paragraph_id)))
  confere("o pedido rotula cada parágrafo com o paragraph_id e manda devolvê-lo", ids.every((i) => pedido.user.includes(`--- paragraph_id: ${i}`)) && pedido.user.includes("IDS QUE VOCÊ TEM DE DEVOLVER") && /paragraph_id/.test(pedido.system))
  confere("o pedido não rotula mais por 'bloco[indice]'", !/--- [a-z_]+\[\d+\]/.test(pedido.user))

  // leitura da saída: ESTRITA
  const p0 = pedido.paragrafos[0]
  const resposta = (itens: unknown[]) => ({ paragrafos: itens })
  const todosVazios = () => ids.map((id) => ({ paragraph_id: id, violacoes: [] as unknown[] }))
  const ok = lerSaidaDoJuiz(resposta(todosVazios()), pedido.paragrafos)
  confere("todos os ids devolvidos, sem violação: ok com zero violações (este é o único caminho para isso)", ok.status === "ok" && ok.violacoes.length === 0 && ok.problemas.length === 0 && ok.paragrafosEnviados === ids.length)
  const comViolacao = lerSaidaDoJuiz(resposta(todosVazios().map((x, k) => (k === 0 ? { ...x, violacoes: [{ regra: "S4", trecho: p0.texto.slice(0, 10), motivo: "x" }] } : x))), pedido.paragrafos)
  confere("a violação fica ligada ao paragraph_id, ao bloco e ao índice", comViolacao.status === "ok" && comViolacao.violacoes.length === 1 && comViolacao.violacoes[0].paragraph_id === p0.paragraph_id && comViolacao.violacoes[0].bloco === p0.bloco && comViolacao.violacoes[0].indice === p0.indice && comViolacao.violacoes[0].trechoNoTexto)

  const erro = (nome: string, bruto: unknown, trecho: RegExp) => {
    const r = lerSaidaDoJuiz(bruto, pedido.paragrafos)
    confere(`contrato inválido (${nome}) vira judge_error, nunca ok`, r.status === "judge_error" && r.causa === "contrato" && r.violacoes.length === 0 && r.problemas.some((x) => trecho.test(x)), r.problemas.join(" | ").slice(0, 160))
  }
  // o que aconteceu de verdade na bateria: o juiz pôs o TEXTO no campo `bloco` e numerou à parte
  erro("o texto do parágrafo no campo bloco, sem paragraph_id", resposta(pedido.paragrafos.map((p, k) => ({ bloco: p.texto, indice: k, violacoes: [{ regra: "S4", trecho: "x", motivo: "y" }] }))), /sem paragraph_id/)
  erro("id ausente", resposta(todosVazios().slice(1)), /id ausente/)
  erro("id duplicado", resposta([...todosVazios(), { paragraph_id: ids[0], violacoes: [] }]), /id duplicado/)
  erro("id desconhecido", resposta([...todosVazios(), { paragraph_id: "inventado:9", violacoes: [] }]), /id desconhecido/)
  erro("id trocado pelo texto do parágrafo", resposta(todosVazios().map((x, k) => (k === 0 ? { ...x, paragraph_id: p0.texto } : x))), /id desconhecido/)
  erro("regra desconhecida", resposta(todosVazios().map((x, k) => (k === 0 ? { ...x, violacoes: [{ regra: "S99", trecho: "", motivo: "x" }] } : x))), /regra desconhecida/)
  erro("violações que não são lista", resposta(todosVazios().map((x, k) => (k === 0 ? { ...x, violacoes: "nenhuma" } : x))), /não é uma lista/)
  erro("trecho que não é texto", resposta(todosVazios().map((x, k) => (k === 0 ? { ...x, violacoes: [{ regra: "S1", trecho: 3, motivo: "x" }] } : x))), /trecho ou motivo/)
  erro("item que não é objeto", resposta([...todosVazios(), "lixo"]), /não é um objeto/)
  erro("sem a lista de parágrafos", { x: 1 }, /lista `paragrafos`/)
  confere("saída nula é judge_error, sem lançar", lerSaidaDoJuiz(null, pedido.paragrafos).status === "judge_error")
  // nada de julgamento parcial: uma violação válida num registro com contrato inválido não é aproveitada
  const parcial = lerSaidaDoJuiz(resposta(todosVazios().slice(1).map((x) => x).concat([{ paragraph_id: ids[0], violacoes: [{ regra: "S1", trecho: "t", motivo: "m" }] }, { paragraph_id: "inventado:9", violacoes: [] }])), pedido.paragrafos)
  confere("um contrato inválido descarta o registro inteiro, mesmo com violação válida dentro", parcial.status === "judge_error" && parcial.violacoes.length === 0)

  const comJuiz = async (texto: string | Error) => executarJuizEmSombra({ payload, sintese: resp, locale: "pt", chamar: async () => { if (texto instanceof Error) throw texto; return texto } })
  const r1 = await comJuiz(new Error("fora do ar"))
  confere("juiz que falha vira judge_error (chamada_falhou), não exceção", r1.status === "judge_error" && r1.causa === "chamada_falhou" && r1.modo === "sombra")
  const r2 = await comJuiz("isto não é json")
  confere("juiz que não devolve JSON vira judge_error (nao_json)", r2.status === "judge_error" && r2.causa === "nao_json")
  const r3 = await comJuiz(JSON.stringify(resposta(todosVazios().map((x, k) => (k === 0 ? { ...x, violacoes: [{ regra: "S2", trecho: "", motivo: "causa" }] } : x)))))
  confere("juiz que aponta violação a registra", r3.status === "ok" && r3.violacoes.length === 1 && r3.violacoes[0].regra === "S2")
  const r4 = await comJuiz(JSON.stringify({ paragrafos: [] }))
  confere("lista vazia quando havia parágrafos é judge_error, e não 'ok sem violações'", r4.status === "judge_error" && r4.problemas.length === ids.length)
  let chamadas = 0
  await executarJuizEmSombra({ payload, sintese: resp, locale: "pt", chamar: async () => { chamadas += 1; return "{}" } })
  confere("uma chamada só, sem nova tentativa", chamadas === 1)

  // calibração
  const cal = calibrar([
    { juiz: { ...r3, violacoes: [{ ...r3.violacoes[0], bloco: "sintese_final", indice: 0, regra: "S2" }, { ...r3.violacoes[0], bloco: "sintese_final", indice: 0, regra: "S4" }] }, humano: [{ bloco: "sintese_final", indice: 0, regra: "S2" }, { bloco: "sintese_final", indice: 0, regra: "S7" }] },
  ])
  const c = (id: string) => cal.find((x) => x.regra === id)!
  confere("calibração: verdadeiro positivo, falso positivo e falso negativo por regra", c("S2").verdadeiroPositivo === 1 && c("S4").falsoPositivo === 1 && c("S7").falsoNegativo === 1 && c("S2").precisao === 1 && c("S7").recall === 0 && c("S1").precisao === null)
}

// ── o pipeline ──────────────────────────────────────────────────────────────
{
  const { selecao, payload } = prepara(0)
  const boa = respostaBoa(payload)
  const ruim = clone(boa)
  ruim.sintese_da_relacao!.paragrafos[0].evidencias = ["id-que-nao-existe"]
  const verificar = (b: unknown) => verificarRespostaSinastria({ bruto: b, payload, selecao, locale: "pt" })
  confere("a resposta boa passa e a ruim reprova", verificar(boa).ok && !verificar(ruim).ok)
  const juizVazio = async () => JSON.stringify({ paragrafos: pedidoDoJuiz(payload, boa).paragrafos.map((p) => ({ paragraph_id: p.paragraph_id, violacoes: [] })) })
  const base = { payload, selecao, locale: "pt" as const }

  // geração válida: sem reparo, juiz em sombra
  let reparosChamados = 0
  const reparar = async (_: { system: string; user: string }) => { reparosChamados += 1; return clone(boa) }
  const r0 = await executarPipeline({ ...base, gerar: async () => clone(boa), reparar, reparoAtivo: true, chamarJuiz: juizVazio })
  confere("geração válida: origem geração, nenhum reparo, juiz registrado", r0.origem === "geracao" && r0.reparos === 0 && reparosChamados === 0 && r0.juiz?.status === "ok")

  // o juiz em sombra nunca muda o resultado
  const semJuiz = await executarPipeline({ ...base, gerar: async () => clone(boa) })
  confere("juiz DESLIGADO por padrão: sem `chamarJuiz` nenhuma chamada é feita e o registro do juiz é nulo", semJuiz.origem === "geracao" && semJuiz.juiz === null)
  const bruta0 = await executarPipeline({ ...base, gerar: async () => clone(ruim) })
  confere("juiz desligado também quando a geração é reprovada: nada é chamado, nada é reparado", bruta0.origem === "bruta_reprovada" && bruta0.juiz === null && bruta0.reparos === 0)
  const juizAcusa = async () => JSON.stringify({ paragrafos: pedidoDoJuiz(payload, boa).paragrafos.map((p) => ({ paragraph_id: p.paragraph_id, violacoes: REGRAS_DO_JUIZ.map((r) => ({ regra: r.id, trecho: "", motivo: "x" })) })) })
  const comJuizAcusando = await executarPipeline({ ...base, gerar: async () => clone(boa), reparar, reparoAtivo: true, chamarJuiz: juizAcusa })
  confere("o juiz acusando tudo não bloqueia, não repara e não muda a síntese", comJuizAcusando.origem === "geracao" && comJuizAcusando.reparos === 0 && reparosChamados === 0 && JSON.stringify(comJuizAcusando.sintese) === JSON.stringify(semJuiz.sintese) && (comJuizAcusando.juiz?.violacoes.length ?? 0) > 0)
  const juizQuebra = await executarPipeline({ ...base, gerar: async () => clone(boa), chamarJuiz: async () => { throw new Error("x") } })
  confere("o juiz que quebra não derruba a geração", juizQuebra.origem === "geracao" && juizQuebra.juiz?.status === "judge_error" && juizQuebra.juiz?.causa === "chamada_falhou")

  // o juiz só roda sobre o que o estrutural aprovou
  let juizChamado = 0
  await executarPipeline({ ...base, gerar: async () => clone(ruim), chamarJuiz: async () => { juizChamado += 1; return "{}" } })
  confere("o juiz não roda sobre resposta reprovada pelo estrutural", juizChamado === 0)

  // reparo desligado: a saída bruta fica para observação
  reparosChamados = 0
  const bruta = await executarPipeline({ ...base, gerar: async () => clone(ruim), reparar, chamarJuiz: juizVazio })
  confere("reparo desligado: saída bruta reprovada, sem reparo e sem molde", bruta.origem === "bruta_reprovada" && reparosChamados === 0 && bruta.violacoesDoGerador.length > 0)

  // reparo ligado, e que funciona
  reparosChamados = 0
  const reparado = await executarPipeline({ ...base, gerar: async () => clone(ruim), reparar, reparoAtivo: true })
  confere("reparo que corrige: origem reparo, uma chamada", reparado.origem === "reparo" && reparado.reparos === 1 && reparosChamados === 1)

  // reparo que nunca corrige: no máximo 2, depois o molde
  reparosChamados = 0
  const nuncaCorrige = await executarPipeline({ ...base, gerar: async () => clone(ruim), reparar: async () => { reparosChamados += 1; return clone(ruim) }, reparoAtivo: true })
  confere(`reparo que nunca corrige: exatamente ${LIMITE_DE_REPAROS} chamadas, e cai no molde`, reparosChamados === LIMITE_DE_REPAROS && nuncaCorrige.reparos === LIMITE_DE_REPAROS && nuncaCorrige.origem === "molde")
  confere("o limite de reparos é 2", LIMITE_DE_REPAROS === 2)

  // sem função de reparo, não há laço
  const semReparador = await executarPipeline({ ...base, gerar: async () => clone(ruim), reparoAtivo: true })
  confere("reparo ligado sem reparador: vai direto ao molde, sem laço", semReparador.origem === "molde" && semReparador.reparos === 0)

  // o reparo que mexe no que estava válido é recusado: uma violação localizada, e o reparo mexe em outro parágrafo
  let alvo = -1
  for (let k = 0; k < casos.length && alvo < 0; k++) {
    const t = prepara(k).payload
    const r = respostaBoa(t)
    if (r.onde_se_encontram && r.sintese_final) alvo = k
  }
  const { payload: pa, selecao: sa } = prepara(alvo)
  const boaA = respostaBoa(pa)
  const duasViolacoes = clone(boaA)
  duasViolacoes.onde_se_encontram!.paragrafos[0].texto = Array(105).fill("palavra").join(" ")
  const mexeEmTudo = clone(boaA)
  mexeEmTudo.sintese_final!.paragrafos[0].texto = "Texto novo no parágrafo que estava válido."
  const verA = verificarRespostaSinastria({ bruto: duasViolacoes, payload: pa, selecao: sa, locale: "pt" })
  confere("a violação do parágrafo longo é só uma, e localizada", !verA.ok && verA.violacoes.length >= 1 && verA.violacoes.every((x) => localizar(x) !== null), verA.ok ? "" : verA.violacoes.join(" | "))
  reparosChamados = 0
  const recusado = await executarPipeline({ payload: pa, selecao: sa, locale: "pt", gerar: async () => clone(duasViolacoes), reparar: async () => { reparosChamados += 1; return clone(mexeEmTudo) }, reparoAtivo: true })
  confere("reparo que altera parágrafo válido é recusado: nada dele é adotado", reparosChamados === LIMITE_DE_REPAROS && recusado.origem === "molde")
  const corrigido = clone(boaA)
  const aceito = await executarPipeline({ payload: pa, selecao: sa, locale: "pt", gerar: async () => clone(duasViolacoes), reparar: async () => clone(corrigido), reparoAtivo: true })
  confere("reparo que corrige só o apontado é adotado", aceito.origem === "reparo" && aceito.reparos === 1)
  confere("conferirReparo aponta o parágrafo alterado", conferirReparo(duasViolacoes, mexeEmTudo, ["onde_se_encontram[0]: x"]).some((p) => p.startsWith("sintese_final[0]")))
  confere("conferirReparo aceita o parágrafo apontado corrigido", conferirReparo(duasViolacoes, boaA, ["onde_se_encontram[0]: x"]).length === 0)
  confere("violação sem localização libera o texto todo", conferirReparo(duasViolacoes, mexeEmTudo, ["800 palavras no total, acima de 700"]).length === 0)
  confere("localizar lê 'bloco[i]:' e recusa o resto", localizar("onde_ha_tensao[1]: x")?.indice === 1 && localizar("700 palavras no total") === null && localizar("chave_qualquer[0]: x") === null)

  // o pedido de reparo não traz nada de fora do payload
  const pr = pedidoDeReparo(payload, ruim, ["sintese_da_relacao[0]: cita \"x\""])
  confere("o pedido de reparo restringe a correção ao apontado e proíbe evidência nova", /SOMENTE o que as violações apontam/.test(pr.user) && /não acrescente evidência/i.test(pr.user) && /não refaça nenhum cálculo/i.test(pr.user))
  confere("o pedido de reparo traz o mesmo prompt de geração, sem repertório a mais", pr.user.includes(promptSinastria(payload).user) && !/INSTRUCOES|extrato/.test(pr.user))

  // en e es: molde não existe, e o pipeline diz que está indisponível
  const en = prepara(0, "amizade", "en")
  const indisponivel = await executarPipeline({ payload: en.payload, selecao: en.selecao, locale: "en", gerar: async () => ({}), reparoAtivo: true })
  confere("en sem resposta válida e sem molde: indisponível, sem lançar", indisponivel.origem === "indisponivel")

  // um parágrafo sem nenhum erro nunca é entregue sem passar pelo estrutural
  confere("nenhuma origem entrega síntese sem o verificador estrutural ter aprovado", [r0, reparado, nuncaCorrige].every((r) => r.sintese !== null && verificar(r.sintese).ok) && recusado.sintese !== null && verificarRespostaSinastria({ bruto: recusado.sintese, payload: pa, selecao: sa, locale: "pt" }).ok)
  confere("o juiz está registrado só nas origens geração e reparo", nuncaCorrige.juiz === null && recusado.juiz === null)
  void paragrafosParaOJuiz
}

}

principal().then(() => {
  if (falhas.length) {
    console.error(`O contrato de geração da sinastria falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas.slice(0, 40)) console.error(`  ${f}`)
    if (falhas.length > 40) console.error(`  ... e mais ${falhas.length - 40}`)
    process.exit(1)
  }
  console.log(`sinastria-geração: ${conferidos} conferências (juiz em sombra, reparo limitado, molde, pipeline; nenhuma chamada paga; ${moldes} moldes verificados)`)
})
