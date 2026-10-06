/**
 * Primeira bateria de calibração da sinastria (PAGA), passo 2: gera as 20
 * leituras, uma geração por caso, e grava tudo. Não corrige nada.
 *
 * Cadeia: fatos → evidência selecionada → payload → prompt → geração bruta →
 * verificador estrutural → juiz semântico em sombra. Reparo e fallback
 * DESLIGADOS (`executarPipeline` com `reparoAtivo` falso devolve a saída bruta
 * reprovada). O juiz roda como está implementado: só sobre a resposta que o
 * verificador estrutural aprovou, e nunca altera nada.
 *
 * Configuração: a do restante da síntese do projeto (gpt-4o, temperature 0.7,
 * JSON). O juiz: gpt-4o-mini, temperature 0.
 *
 *   node --import ./scripts/ts-register.mjs scripts/bateria-sinastria.ts
 *
 * A saída do juiz vai para `lacrado/` e NÃO é impressa: só se revela depois que
 * a avaliação humana for congelada.
 */
import crypto from "crypto"
import fs from "fs"
import path from "path"
import OpenAI from "openai"
import { estimateCostUsd } from "../lib/ai/pricing"
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { selecionarEvidencia } from "../lib/astro/selecao-sinastria"
import { montarPayload } from "../lib/astro/payload-sinastria"
import { promptSinastria } from "../lib/astro/prompt-sinastria"
import { executarPipeline } from "../lib/astro/pipeline-sinastria"
import type { RegistroDoJuiz } from "../lib/astro/juiz-semantico-sinastria"
import type { Vinculo } from "../lib/astro/sinastria-servico"
import { dados } from "./simular-selecao-sinastria"

const RAIZ = path.resolve("data/bateria-sinastria")
const MODELO_GERADOR = "gpt-4o"
const MODELO_JUIZ = "gpt-4o-mini"

// a chave vem do .env.local, sem imprimir
for (const linha of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = /^([A-Z_]+)=(.*)$/.exec(linha)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "")
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type Item = { rot: string; a: number; b: number; horaA: boolean; horaB: boolean; vinculo: Vinculo; grupo: "controle" | "diversidade" }
const sha = (x: unknown) => crypto.createHash("sha256").update(typeof x === "string" ? x : JSON.stringify(x)).digest("hex")

const amostra: Array<{ rot: string; a: number; b: number; horaA: boolean; horaB: boolean }> = JSON.parse(fs.readFileSync(path.join(RAIZ, "_amostra.json"), "utf8"))
const VINCULO_DO_CASO: Record<string, Vinculo> = {
  hh_muita_evidencia: "amizade", hh_muito_harmonico: "romantico", hh_muito_discordante: "familia", hh_mistura_forte: "trabalho",
  hh_sem_semelhanca: "outro", hh_muitas_semelhancas: "amizade", hh_overlays_relevantes: "romantico", hs_um_sem_hora: "trabalho",
  sh_um_sem_hora_inverso: "familia", ss_pouca_evidencia: "outro", ss_com_semelhanca: "amizade", afeto: "romantico",
  vida_pratica: "familia", transformacao: "outro", comunicacao: "trabalho",
}
const itens: Item[] = []
for (const x of amostra) {
  if (x.rot === "controle") for (const v of ["romantico", "amizade", "familia", "trabalho", "outro"] as const) itens.push({ ...x, vinculo: v, grupo: "controle" })
  else itens.push({ ...x, vinculo: VINCULO_DO_CASO[x.rot], grupo: "diversidade" })
}
if (itens.length !== 20) throw new Error(`a amostra tem ${itens.length} leituras, e deveriam ser 20`)

// ids opacos e ordem de apresentação embaralhada (a chave fica só em chave.json)
const ordem = itens.map((it, i) => ({ it, i, r: crypto.randomBytes(4).readUInt32BE() })).sort((p, q) => p.r - q.r).map((x) => x.it)
const ids = new Map<Item, string>()
for (const it of ordem) ids.set(it, `L-${crypto.randomBytes(3).toString("hex")}`)

fs.mkdirSync(path.join(RAIZ, "resultado"), { recursive: true })
fs.mkdirSync(path.join(RAIZ, "lacrado"), { recursive: true })

/** Uma chamada ao modelo. Repete só em falha de transporte (timeout, 5xx, 429), nunca por qualidade da resposta. */
async function chamar(modelo: string, temperatura: number, system: string, user: string) {
  const t0 = Date.now()
  let ultima: unknown
  for (let k = 0; k < 3; k++) {
    try {
      const r = await openai.chat.completions.create({
        model: modelo,
        temperature: temperatura,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      })
      const ent = r.usage?.prompt_tokens ?? 0
      const sai = r.usage?.completion_tokens ?? 0
      return { texto: r.choices[0]?.message?.content ?? "", entrada: ent, saida: sai, custo: estimateCostUsd(r.model ?? modelo, ent, sai), latenciaMs: Date.now() - t0, modeloReal: r.model ?? modelo, tentativasDeTransporte: k + 1 }
    } catch (e) {
      ultima = e
      const status = (e as { status?: number }).status
      if (status && status < 500 && status !== 429) break
      await new Promise((ok) => setTimeout(ok, 2000 * (k + 1)))
    }
  }
  throw ultima
}

async function main() {
  const chave: Record<string, unknown> = {}
  const lacre: Record<string, string> = {}
  for (const it of ordem) {
    const id = ids.get(it)!
    const selecao = selecionarEvidencia(sinastria(mapaNatal(dados(it.a, it.horaA)), mapaNatal(dados(it.b, it.horaB))))
    const payload = montarPayload(selecao, { locale: "pt", vinculo: it.vinculo })
    const { system, user } = promptSinastria(payload)
    let geracao: Awaited<ReturnType<typeof chamar>> | null = null
    let juizUso: Awaited<ReturnType<typeof chamar>> | null = null
    let erroDeGeracao: string | null = null

    const resultado = await executarPipeline({
      payload, selecao, locale: "pt",
      reparoAtivo: false,
      gerar: async () => {
        try {
          geracao = await chamar(MODELO_GERADOR, 0.7, system, user)
        } catch (e) {
          erroDeGeracao = e instanceof Error ? e.message : String(e)
          return null
        }
        try { return JSON.parse(geracao.texto) } catch { return geracao.texto }
      },
      chamarJuiz: async (p) => {
        juizUso = await chamar(MODELO_JUIZ, p.temperatura, p.system, p.user)
        return juizUso.texto
      },
    })

    const g = geracao as Awaited<ReturnType<typeof chamar>> | null
    const j = juizUso as Awaited<ReturnType<typeof chamar>> | null
    const registro = {
      id, vinculo: it.vinculo, grupo: it.grupo,
      prompt: { chars: system.length + user.length, tokensEstimados: Math.round((system.length + user.length) / 3.6), system, user },
      geracao: g && { modelo: g.modeloReal, entrada: g.entrada, saida: g.saida, custoUsd: g.custo, latenciaMs: g.latenciaMs, tentativasDeTransporte: g.tentativasDeTransporte, texto: g.texto },
      erroDeGeracao,
      estrutural: resultado.origem === "geracao" ? { ok: true, violacoes: [] as string[] } : { ok: false, violacoes: "violacoesDoGerador" in resultado ? resultado.violacoesDoGerador : [erroDeGeracao ?? "sem resposta"] },
      origem: resultado.origem,
      sintese: resultado.sintese,
      payload,
    }
    fs.writeFileSync(path.join(RAIZ, "resultado", `${id}.json`), JSON.stringify(registro, null, 1))
    const juizArquivo = path.join(RAIZ, "lacrado", `juiz-${id}.json`)
    const juizJson = JSON.stringify({ id, registro: resultado.juiz as RegistroDoJuiz | null, uso: j && { modelo: j.modeloReal, entrada: j.entrada, saida: j.saida, custoUsd: j.custo, latenciaMs: j.latenciaMs }, saidaBruta: j?.texto ?? null }, null, 1)
    fs.writeFileSync(juizArquivo, juizJson)
    lacre[`juiz-${id}.json`] = sha(juizJson)
    chave[id] = { rot: it.rot, a: it.a, b: it.b, horaA: it.horaA, horaB: it.horaB, vinculo: it.vinculo, grupo: it.grupo, hashDaSelecao: sha(selecao) }
    console.log(`${id} ${it.vinculo.padEnd(9)} ${resultado.origem.padEnd(15)} entrada ${g?.entrada ?? "-"} saída ${g?.saida ?? "-"} ${g ? (g.latenciaMs / 1000).toFixed(1) + "s" : ""} estrutural ${resultado.origem === "geracao" ? "ok" : "REPROVADO"}`)
  }
  fs.writeFileSync(path.join(RAIZ, "chave.json"), JSON.stringify(chave, null, 1))
  fs.writeFileSync(path.join(RAIZ, "lacre-do-juiz.json"), JSON.stringify({ geradoEm: new Date().toISOString(), observacao: "hash de cada arquivo do juiz, gravado antes de qualquer leitura; o juiz só é revelado depois que a avaliação humana for congelada", sha256: lacre }, null, 1))
  console.log("fim")
}
main().catch((e) => { console.error(e); process.exit(1) })
