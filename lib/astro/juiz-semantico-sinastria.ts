/**
 * O juiz semântico da sinastria, em MODO SOMBRA.
 *
 * O verificador estrutural (`verificador-resposta-sinastria.ts`) é o único gate.
 * O juiz roda DEPOIS dele, registra as violações que a leitura aponta nas onze
 * regras e NADA MAIS: não bloqueia a resposta, não dispara reparo e não altera
 * nenhum resultado. O que ele registra é para ser comparado, depois, com a
 * avaliação humana (falso positivo, falso negativo por regra). Só depois dessa
 * calibração ele pode virar gate, e essa decisão é humana.
 *
 * ESTE ARQUIVO NÃO CHAMA MODELO NENHUM. Monta o pedido, lê e valida a saída e
 * mede a calibração. Quem chama o modelo entra por `chamar`, injetado.
 *
 * O QUE O JUIZ VÊ: cada parágrafo e SÓ a evidência que ele citou (os fatos, as
 * frases do repertório que o payload trouxe e, nos pontos em comum, a
 * ressalva). Nunca o repertório inteiro, nunca fato fora do payload. Ele julga
 * se o texto diz mais do que a evidência diz, e não se a astrologia está certa.
 *
 * QUEM ELE NÃO PODE SER. Nunca absolve: um "sem violação" dele não vale nada
 * contra o verificador estrutural, e ele só acrescenta registro.
 */
import type { Locale } from "@/lib/i18n/config"
import { BLOCOS, type IdDeBloco, type PayloadSinastria } from "./payload-sinastria"
import type { SinteseSinastria } from "./prompt-sinastria"

export const VERSAO_DO_JUIZ = "juiz-2026-10-b"

export const CONFIG_DO_JUIZ = {
  /** só existe a sombra: virar gate exige calibração contra a avaliação humana */
  modo: "sombra",
  temperatura: 0,
  /** o modelo do juiz deve ser menor que o da geração, para não concordar consigo mesmo */
  modeloMenorQueOGerador: true,
} as const

export type IdDeRegraDoJuiz = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11"

export type RegraDoJuiz = { id: IdDeRegraDoJuiz; nome: string; pergunta: string }

/** As onze regras. A pergunta é o que o juiz responde, parágrafo a parágrafo. */
export const REGRAS_DO_JUIZ: readonly RegraDoJuiz[] = [
  { id: "S1", nome: "fidelidade", pergunta: "Alguma afirmação interpretativa do parágrafo diz mais do que as frases da evidência citada dizem, ou algo que elas não dizem?" },
  { id: "S2", nome: "causalidade", pergunta: "Alguma frase atribui causa ('faz com que', 'por causa de', 'é por isso que') que a evidência não atribui?" },
  { id: "S3", nome: "fatalismo ou promessa", pergunta: "Uma tensão foi apresentada como destino ou sentença, ou uma facilidade como garantia (de afeto, de durabilidade, de êxito)?" },
  { id: "S4", nome: "veredito implícito", pergunta: "O parágrafo conclui algo sobre a relação como um todo (que funciona, que é difícil, que é boa), mesmo sem usar nota, porcentagem ou 'combinam'?" },
  { id: "S5", nome: "prescrição implícita", pergunta: "Há instrução ou conselho disfarçado ('vale observar', 'convém atenção', 'o desafio é aprender a...'), ou indicação de ficar, terminar ou agir?" },
  { id: "S6", nome: "diagnóstico ou rótulo", pergunta: "Alguém foi diagnosticado ou recebeu um traço fixo de personalidade ('é controlador', 'é ansiosa') em vez de uma dinâmica possível?" },
  { id: "S7", nome: "tensão como defeito", pergunta: "Uma pessoa foi culpada, ou a diferença foi tratada como erro ou falta de alguém?" },
  { id: "S8", nome: "semelhança como facilidade", pergunta: "Um ponto em comum foi apresentado como facilidade, afinidade garantida ou compatibilidade, ou uma diferença como incompatibilidade?" },
  { id: "S9", nome: "vínculo criando significado", pergunta: "O vínculo declarado mudou o que a evidência diz, ou o texto supôs uma relação que o vínculo não é (namoro, intimidade sexual, sociedade)?" },
  { id: "S10", nome: "cena inventada", pergunta: "Há episódio, fala, lugar, hora ou data que não está na evidência?" },
  { id: "S11", nome: "contradição escolhida", pergunta: "Numa síntese, o parágrafo escolheu um lado de uma contradição que a evidência deixa aberta, ou costurou uma harmonia que ela não sustenta?" },
]
const IDS_DE_REGRA = new Set<string>(REGRAS_DO_JUIZ.map((r) => r.id))

// ── o pedido ─────────────────────────────────────────────────────────────────

/** O id estável de um parágrafo: "sintese_da_relacao:0", "onde_ha_tensao:1". É o único elo entre o pedido e a resposta do juiz. */
export const idDoParagrafo = (bloco: IdDeBloco, indice: number) => `${bloco}:${indice}`

export type ParagrafoParaOJuiz = {
  paragraph_id: string
  bloco: IdDeBloco
  indice: number
  texto: string
  /** o que o parágrafo citou, como o modelo recebeu: fatos e frases do repertório */
  evidenciaCitada: string[]
}

/** As frases que cada id citado traz, tal como o gerador as viu. */
function evidenciaDeId(payload: PayloadSinastria, id: string): string[] {
  for (const d of [...payload.aspectos, ...payload.overlays]) {
    if (d.id === id || d.fatos.some((f) => f.id === id)) {
      return [`[${d.id}]`, ...d.fatos.map((f) => `fato: ${f.texto}`), ...d.evidencia.map((e) => `repertório: ${e}`)]
    }
  }
  const s = payload.semelhancas.find((x) => x.id === id)
  if (s) return [`[${s.id}]`, `fato: ${s.fato}`, ...s.nucleo.map((n) => `repertório: ${n}`), ...(payload.ressalvaDasSemelhancas ? [`ressalva: ${payload.ressalvaDasSemelhancas}`] : [])]
  return []
}

export function paragrafosParaOJuiz(payload: PayloadSinastria, sintese: SinteseSinastria): ParagrafoParaOJuiz[] {
  const saida: ParagrafoParaOJuiz[] = []
  for (const bloco of BLOCOS) {
    for (const [indice, p] of (sintese[bloco]?.paragrafos ?? []).entries()) {
      const vistos = new Set<string>()
      const evidenciaCitada: string[] = []
      for (const id of p.evidencias) for (const linha of evidenciaDeId(payload, id)) if (!vistos.has(linha)) { vistos.add(linha); evidenciaCitada.push(linha) }
      saida.push({ paragraph_id: idDoParagrafo(bloco, indice), bloco, indice, texto: p.texto, evidenciaCitada })
    }
  }
  return saida
}

const SISTEMA_DO_JUIZ =
  "Você é um revisor editorial. Recebe parágrafos de uma leitura de sinastria e, para cada um, a ÚNICA evidência em que ele deveria se apoiar. " +
  "Você só aponta violações das regras dadas: nunca reescreve, nunca elogia e nunca julga se a astrologia está certa. " +
  "Julgue só pelo que está escrito, comparado com a evidência. Na dúvida entre violação e não violação, aponte e explique em uma frase. " +
  "Cada parágrafo chega com um paragraph_id, e a sua resposta tem de devolver exatamente esse id, uma vez por parágrafo, sem inventar nem omitir nenhum. " +
  "Responda apenas com JSON válido, sem Markdown."

export function pedidoDoJuiz(payload: PayloadSinastria, sintese: SinteseSinastria): { system: string; user: string; paragrafos: ParagrafoParaOJuiz[] } {
  const paragrafos = paragrafosParaOJuiz(payload, sintese)
  const user = [
    `VÍNCULO DECLARADO: ${payload.vinculo}.`,
    "",
    "REGRAS (cada violação cita o id da regra):",
    ...REGRAS_DO_JUIZ.map((r) => `${r.id} ${r.nome}: ${r.pergunta}`),
    "",
    "PARÁGRAFOS (cada um com o seu paragraph_id):",
    ...paragrafos.map((p) => `--- paragraph_id: ${p.paragraph_id}\ntexto: ${p.texto}\nevidência citada:\n${p.evidenciaCitada.length ? p.evidenciaCitada.map((l) => `  ${l}`).join("\n") : "  (nenhuma)"}`),
    "",
    `IDS QUE VOCÊ TEM DE DEVOLVER, um item para cada: ${paragrafos.map((p) => p.paragraph_id).join(", ")}.`,
    'Devolva JSON: {"paragrafos": [{"paragraph_id": "<um dos ids acima, exatamente>", "violacoes": [{"regra": "S1", "trecho": "trecho exato do parágrafo", "motivo": "uma frase"}]}]}. "violacoes" vazio quando o parágrafo não tem nenhuma. Nenhum outro campo de identificação.',
  ].join("\n")
  return { system: SISTEMA_DO_JUIZ, user, paragrafos }
}

// ── a leitura da saída ───────────────────────────────────────────────────────

export type ViolacaoDoJuiz = { paragraph_id: string; bloco: IdDeBloco; indice: number; regra: IdDeRegraDoJuiz; trecho: string; motivo: string; trechoNoTexto: boolean }

/**
 * `ok`: o juiz respondeu dentro do contrato, e as violações (possivelmente nenhuma) são as dele.
 * `judge_error`: o contrato foi violado ou a chamada falhou. Nunca existe registro `ok` em que o juiz não tenha
 * respondido um item por parágrafo: o erro é explícito, com a causa e a lista de problemas.
 */
export type RegistroDoJuiz = {
  versao: string
  modo: "sombra"
  status: "ok" | "judge_error"
  causa: null | "contrato" | "nao_json" | "chamada_falhou"
  /** cada problema de contrato, por extenso: ids ausentes, duplicados, desconhecidos, regra desconhecida, campo faltando */
  problemas: string[]
  paragrafosEnviados: number
  violacoes: ViolacaoDoJuiz[]
}

const erroDoJuiz = (n: number, causa: NonNullable<RegistroDoJuiz["causa"]>, problemas: string[]): RegistroDoJuiz => ({ versao: VERSAO_DO_JUIZ, modo: "sombra", status: "judge_error", causa, problemas, paragrafosEnviados: n, violacoes: [] })

/**
 * Lê a saída do juiz, ESTRITAMENTE. Só aceita ids que o pedido enviou e nunca casa por texto. Qualquer desvio (id
 * ausente, duplicado ou desconhecido, item que não é objeto, violações que não são lista, regra desconhecida, trecho
 * ou motivo que não são texto) torna o registro inteiro `judge_error`: um julgamento parcial não vale como julgamento.
 */
export function lerSaidaDoJuiz(bruto: unknown, paragrafos: ParagrafoParaOJuiz[]): RegistroDoJuiz {
  const n = paragrafos.length
  const lista = (bruto as { paragrafos?: unknown } | null)?.paragrafos
  if (!Array.isArray(lista)) return erroDoJuiz(n, "contrato", ["a saída não traz a lista `paragrafos`"])

  const enviados = new Map(paragrafos.map((p) => [p.paragraph_id, p]))
  const vistos = new Set<string>()
  const problemas: string[] = []
  const violacoes: ViolacaoDoJuiz[] = []
  lista.forEach((item, k) => {
    const o = item as { paragraph_id?: unknown; violacoes?: unknown } | null
    if (!o || typeof o !== "object" || Array.isArray(o)) { problemas.push(`item ${k}: não é um objeto`); return }
    if (typeof o.paragraph_id !== "string") { problemas.push(`item ${k}: sem paragraph_id`); return }
    const p = enviados.get(o.paragraph_id)
    if (!p) { problemas.push(`id desconhecido: "${String(o.paragraph_id).slice(0, 60)}"`); return }
    if (vistos.has(o.paragraph_id)) { problemas.push(`id duplicado: ${o.paragraph_id}`); return }
    vistos.add(o.paragraph_id)
    if (!Array.isArray(o.violacoes)) { problemas.push(`${o.paragraph_id}: \`violacoes\` não é uma lista`); return }
    o.violacoes.forEach((v, j) => {
      const x = v as { regra?: unknown; trecho?: unknown; motivo?: unknown } | null
      if (!x || typeof x !== "object") { problemas.push(`${o.paragraph_id}[${j}]: violação não é um objeto`); return }
      if (typeof x.regra !== "string" || !IDS_DE_REGRA.has(x.regra)) { problemas.push(`${o.paragraph_id}[${j}]: regra desconhecida "${String(x.regra)}"`); return }
      if (typeof x.trecho !== "string" || typeof x.motivo !== "string") { problemas.push(`${o.paragraph_id}[${j}]: trecho ou motivo não é texto`); return }
      violacoes.push({ paragraph_id: p.paragraph_id, bloco: p.bloco, indice: p.indice, regra: x.regra as IdDeRegraDoJuiz, trecho: x.trecho, motivo: x.motivo, trechoNoTexto: x.trecho.length > 0 && p.texto.includes(x.trecho) })
    })
  })
  for (const id of enviados.keys()) if (!vistos.has(id)) problemas.push(`id ausente na resposta: ${id}`)
  if (problemas.length > 0) return erroDoJuiz(n, "contrato", problemas)
  return { versao: VERSAO_DO_JUIZ, modo: "sombra", status: "ok", causa: null, problemas: [], paragrafosEnviados: n, violacoes }
}

export type ChamarJuiz = (pedido: { system: string; user: string; temperatura: number }) => Promise<string>

/**
 * Roda o juiz em sombra. NUNCA lança e NUNCA devolve nada que altere a resposta: o resultado é só um registro. Uma
 * única chamada, sem nova tentativa. Falha de chamada e saída que não é JSON também são `judge_error`.
 */
export async function executarJuizEmSombra(params: { payload: PayloadSinastria; sintese: SinteseSinastria; locale: Locale; chamar: ChamarJuiz }): Promise<RegistroDoJuiz> {
  const { system, user, paragrafos } = pedidoDoJuiz(params.payload, params.sintese)
  if (paragrafos.length === 0) return { versao: VERSAO_DO_JUIZ, modo: "sombra", status: "ok", causa: null, problemas: [], paragrafosEnviados: 0, violacoes: [] }
  let texto: string
  try {
    texto = await params.chamar({ system, user, temperatura: CONFIG_DO_JUIZ.temperatura })
  } catch (e) {
    return erroDoJuiz(paragrafos.length, "chamada_falhou", [e instanceof Error ? e.message : "a chamada falhou"])
  }
  let bruto: unknown
  try {
    bruto = JSON.parse(texto)
  } catch {
    return erroDoJuiz(paragrafos.length, "nao_json", ["a saída não é JSON"])
  }
  return lerSaidaDoJuiz(bruto, paragrafos)
}

// ── a calibração contra a avaliação humana ───────────────────────────────────

/** O que uma pessoa marcou ao ler o mesmo parágrafo. */
export type MarcaHumana = { bloco: IdDeBloco; indice: number; regra: IdDeRegraDoJuiz }

export type CalibracaoPorRegra = { regra: IdDeRegraDoJuiz; verdadeiroPositivo: number; falsoPositivo: number; falsoNegativo: number; precisao: number | null; recall: number | null }

/**
 * Compara o registro do juiz com a avaliação humana, regra a regra, no nível
 * de (parágrafo, regra). Não altera nenhuma nota humana: só conta.
 */
export function calibrar(registros: Array<{ juiz: RegistroDoJuiz; humano: MarcaHumana[] }>): CalibracaoPorRegra[] {
  const cont = new Map<IdDeRegraDoJuiz, { vp: number; fp: number; fn: number }>(REGRAS_DO_JUIZ.map((r) => [r.id, { vp: 0, fp: 0, fn: 0 }]))
  registros.forEach(({ juiz, humano }, k) => {
    const chave = (b: string, i: number, r: string) => `${k}|${b}[${i}]|${r}`
    const j = new Set(juiz.violacoes.map((v) => chave(v.bloco, v.indice, v.regra)))
    const h = new Set(humano.map((v) => chave(v.bloco, v.indice, v.regra)))
    for (const c of j) { const r = c.split("|")[2] as IdDeRegraDoJuiz; cont.get(r)![h.has(c) ? "vp" : "fp"] += 1 }
    for (const c of h) if (!j.has(c)) cont.get(c.split("|")[2] as IdDeRegraDoJuiz)!.fn += 1
  })
  return REGRAS_DO_JUIZ.map((r) => {
    const { vp, fp, fn } = cont.get(r.id)!
    return { regra: r.id, verdadeiroPositivo: vp, falsoPositivo: fp, falsoNegativo: fn, precisao: vp + fp ? vp / (vp + fp) : null, recall: vp + fn ? vp / (vp + fn) : null }
  })
}
