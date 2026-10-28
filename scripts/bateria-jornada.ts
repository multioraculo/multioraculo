/**
 * Bateria editorial da Jornada dos Sonhos com o modelo REAL (paga).
 *
 * Usa exatamente o prompt, a mensagem, o modelo e os parâmetros da rota
 * (gpt-4o, temperatura 0.7, max_tokens 2800, JSON), com relatos fictícios
 * controlados. Não toca em banco, em cota nem em usuário.
 *
 *   node --import ./scripts/ts-register.mjs scripts/bateria-jornada.ts            (seco: não chama a OpenAI)
 *   node --import ./scripts/ts-register.mjs scripts/bateria-jornada.ts --executar (chama, com teto de custo)
 *
 * TETO: antes de cada chamada soma o gasto real até ali ao PIOR caso da chamada
 * (entrada estimada + max_tokens inteiros); se passar de US$ 0,10, não chama.
 * Grava o relatório em docs/bateria-jornada-1.md (sem a chave).
 */
import fs from "node:fs"
import path from "node:path"
import OpenAI from "openai"
import { montarMensagemJornada, montarPromptJornada, normalizarJornada, textosDaJornada, verificarJornada } from "../lib/oracles/jornada-sonhos"
import { lerAnalise, type JornadaV2, type SonhoDaJornada } from "../lib/dreams/jornada-estado"
import { estimateCostUsd } from "../lib/ai/pricing"
import type { Locale } from "../lib/i18n/config"

const TETO_USD = 0.1
const MAX_TOKENS = 2800
const MODELO = "gpt-4o"
const executar = process.argv.includes("--executar")

import { D1, D2, E1, E2, R1, R2, R3 } from "./fixtures-bateria-jornada"

type Teste = {
  nome: string
  foco: string
  locale: Locale
  sonhos: SonhoDaJornada[]
  /** usa a saída do teste de índice dado como leitura anterior (como a rota faz) */
  anteriorDe?: number
  /** o que o leitor humano deve procurar */
  esperado: string[]
}
const TESTES: Teste[] = [
  { nome: "1. Dois sonhos relacionados (PT)", foco: "primeira síntese com imagens que se transformam", locale: "pt", sonhos: [R1, R2],
    esperado: ["correspondências e contrastes fundamentados nos detalhes (ponte, rio, porta, barco, avó)", "nenhuma afirmação de padrão recorrente consolidado", "hipóteses, não fatos", "sem diagnóstico nem trajetória de superação"] },
  { nome: "2. Dois sonhos sem relação (PT)", foco: "não forçar padrão onde não há", locale: "pt", sonhos: [D1, D2],
    esperado: ["admitir que os cenários são diferentes", "conexões só onde o material sustenta (ou poucas, declaradas como frágeis)", "nenhum símbolo inventado (sem dinheiro, escola, rio etc. que não estão no relato)"] },
  { nome: "3. Terceiro sonho com leitura anterior (PT)", foco: "evolução: permanece, mudou, hipótese revista", locale: "pt", sonhos: [R1, R2, R3], anteriorDe: 0,
    esperado: ["reescreve a leitura do conjunto (não acrescenta parágrafo)", "evolution distingue o que permanece do que mudou", "revisa uma hipótese anterior à luz do barco/luz/casa", "mantém incertezas"] },
  { nome: "4. Dois sonhos em inglês (EN)", foco: "idioma e escala em inglês", locale: "en", sonhos: [E1, E2],
    esperado: ["tudo em inglês natural, sem português", "sem 'recurring pattern' consolidado", "o envelope e a água como pontos de contato, em hipótese"] },
]

// frases do exemplo ilustrativo do pedido original: não podem vazar para resultados reais
const CONTAMINACAO = [/atravessar um espa[cç]o/i, /a passagem [ée] impedida/i, /conduz a um lugar desconhecido/i]

function carregarEnv() {
  const arq = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(arq)) return
  for (const l of fs.readFileSync(arq, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}

const estimaEntrada = (s: string) => Math.ceil(s.length / 3) // conservador: ~3 caracteres por token

async function main() {
  carregarEnv()
  let gasto = 0
  const saidas: Array<JornadaV2 | null> = []
  const relatorio: string[] = [`# Bateria editorial da Jornada dos Sonhos 1`, ``, `Modelo ${MODELO}, mesmos prompt e parâmetros da rota. Relatos fictícios controlados. Gerado em ${new Date().toISOString()}.`, ``]
  const resumo: string[] = []

  for (let i = 0; i < TESTES.length; i++) {
    const t = TESTES[i]
    const anterior = t.anteriorDe !== undefined ? saidas[t.anteriorDe] : null
    if (t.anteriorDe !== undefined && !anterior && executar) {
      resumo.push(`${t.nome}: PULADO (depende do teste ${t.anteriorDe + 1}, que não gerou saída)`)
      saidas.push(null)
      continue
    }
    const novos = t.anteriorDe !== undefined ? t.sonhos.map((_, k) => k + 1).slice(TESTES[t.anteriorDe].sonhos.length) : []
    const system = montarPromptJornada(t.locale, {
      n: t.sonhos.length,
      anterior: anterior ? { integrated: anterior.integrated, connections: anterior.connections } : t.anteriorDe !== undefined ? { integrated: "(leitura anterior do teste 1, gerada em execução real)", connections: ["(conexões do teste 1)"] } : null,
      novosNumeros: novos,
    })
    const user = montarMensagemJornada(t.sonhos, t.locale)
    const entrada = estimaEntrada(system + user)
    const piorCaso = estimateCostUsd(MODELO, entrada, MAX_TOKENS)

    if (!executar) {
      resumo.push(`${t.nome}: entrada ≈ ${entrada} tokens, pior caso ≈ US$ ${piorCaso.toFixed(4)}`)
      saidas.push(null)
      continue
    }
    if (gasto + piorCaso > TETO_USD) {
      resumo.push(`${t.nome}: NÃO EXECUTADO (gasto US$ ${gasto.toFixed(4)} + pior caso US$ ${piorCaso.toFixed(4)} passaria do teto de US$ ${TETO_USD})`)
      saidas.push(null)
      continue
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const ini = Date.now()
    const c = await openai.chat.completions.create({
      model: MODELO, temperature: 0.7, max_tokens: MAX_TOKENS, response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    })
    const ms = Date.now() - ini
    const bruto = c.choices?.[0]?.message?.content ?? "{}"
    const custo = estimateCostUsd(c.model || MODELO, c.usage?.prompt_tokens ?? 0, c.usage?.completion_tokens ?? 0)
    gasto += custo
    const tracosNoBruto = (bruto.match(/[—–]/g) ?? []).length
    let raw: unknown = {}
    try { raw = JSON.parse(bruto) } catch { /* normalizar devolve null */ }
    const chaves = raw && typeof raw === "object" ? Object.keys(raw as object).join(",") : "(não é objeto)"
    const j = normalizarJornada(raw, { sonhos: t.sonhos, locale: t.locale })
    saidas.push(j)
    const avisos = j ? verificarJornada(j, t.sonhos, t.locale) : ["resposta não aproveitável"]
    const vazou = j ? textosDaJornada(j).join("\n") : ""
    const contaminou = CONTAMINACAO.filter((r) => r.test(vazou)).map(String)
    const truncou = c.choices?.[0]?.finish_reason === "length"

    resumo.push(`${t.nome}: ${c.usage?.prompt_tokens} + ${c.usage?.completion_tokens} tokens, US$ ${custo.toFixed(4)} (acumulado ${gasto.toFixed(4)}), ${ms} ms, chaves: ${chaves}, travessões no bruto: ${tracosNoBruto}, truncou: ${truncou}, avisos: ${avisos.length ? avisos.join(" | ") : "nenhum"}, contaminação: ${contaminou.length ? contaminou.join(",") : "nenhuma"}`)
    relatorio.push(`## ${t.nome}`, ``, `Foco: ${t.foco}. Idioma: ${t.locale}.`, ``, `**Relatos**`, ...t.sonhos.map((s, k) => `${k + 1}. (${s.created_at.slice(0, 10)}) ${s.dream_description}`), ``,
      `**O que procurar:** ${t.esperado.join("; ")}.`, ``,
      `**Medidas:** ${c.usage?.prompt_tokens} tokens de entrada, ${c.usage?.completion_tokens} de saída, US$ ${custo.toFixed(4)}; travessões no texto bruto do modelo (antes do filtro): ${tracosNoBruto}; finish_reason: ${c.choices?.[0]?.finish_reason}; avisos do verificador: ${avisos.length ? avisos.join("; ") : "nenhum"}; contaminação pelo exemplo do pedido: ${contaminou.length ? contaminou.join(", ") : "nenhuma"}.`, ``)
    if (j) {
      relatorio.push(`**Linha do tempo**`, ...j.timeline.map((x) => `- ${x.number}. ${x.title} (${x.archetypes}): ${x.summary}`), ``, `**Conexões**`, ...j.connections.map((x) => `- ${x}`), ``)
      if (j.evolution.length) relatorio.push(`**Evolução**`, ...j.evolution.map((e) => `- [${e.type}] ${e.text}`), ``)
      relatorio.push(`**Leitura do conjunto**`, ``, j.integrated, ``, `**Em aberto**`, ...j.openQuestions.map((x) => `- ${x}`), ``)
      // o mesmo JSON passa pelo leitor de análises salvas, como na rota
      if (lerAnalise(JSON.stringify(j))?.versao !== 2) relatorio.push(`(AVISO: a análise não é lida de volta como v2)`, ``)
    } else {
      relatorio.push(`Resposta bruta (não aproveitável):`, "```", bruto.slice(0, 1500), "```", ``)
    }
  }

  relatorio.push(`## Custo`, ``, executar ? `Gasto estimado total: US$ ${gasto.toFixed(4)} (teto US$ ${TETO_USD}).` : `Execução seca: nada foi chamado.`, ``, `## Resumo`, ``, ...resumo.map((r) => `- ${r}`))
  console.log(resumo.join("\n"))
  console.log(executar ? `\nGasto estimado total: US$ ${gasto.toFixed(4)} (teto US$ ${TETO_USD})` : `\nExecução seca: nada foi chamado. Use --executar para chamar o modelo.`)
  if (executar) {
    fs.writeFileSync(path.join(process.cwd(), "docs", "bateria-jornada-1.md"), relatorio.join("\n"), "utf8")
    console.log("Relatório: docs/bateria-jornada-1.md")
  }
}
main().catch((e) => { console.error("ERRO:", e?.message ?? e); process.exit(1) })
