/**
 * A/B do prompt de interpretação de sonhos com o modelo REAL (paga, teto US$ 0,10).
 *
 *   A = prompt antigo (extraído do git, antes do commit e3f2a71)
 *   B = prompt atual (montarPromptSonho)
 *   C = candidato v2 (montarPromptSonhoV2)
 *
 * Mesma configuração da rota: temperatura 0.7, mesma mensagem de usuário, mesmo
 * sufixo de idioma. Só se chama com --executar; antes de cada chamada confere
 * gasto + pior caso <= teto. Relatório: docs/ab-sonhos-1.md.
 */
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import OpenAI from "openai"
import { montarPromptSonho, verificarInterpretacaoSonho } from "../lib/oracles/sonhos-prompt"
import { estimateCostUsd } from "../lib/ai/pricing"
import { LOCALE_META } from "../lib/i18n/config"

const TETO = 0.1
const executar = process.argv.includes("--executar")

const ANTIGO = (() => {
  const src = execSync("git show e3f2a71~1:app/api/sonhos/interpret/route.ts", { encoding: "utf8" })
  const m = src.replace(/\r\n/g, "\n").match(/const SYSTEM_PROMPT = `([\s\S]*?)`\n/)
  if (!m) throw new Error("prompt antigo não encontrado no git")
  return m[1]
})()

const SUFIXO = `\n\nIDIOMA DA RESPOSTA: escreva toda a resposta, inclusive os títulos das seções, em ${LOCALE_META.pt.promptName}, com naturalidade de falante nativo.`

const SONHOS: Record<string, string> = {
  transcricao: "Sonhei que meu marido estava me traindo. Foi assim. Eu entrei no alguém próximo me contou. Acho que foi meu irmão que me contou. E daí ele falou não, tem um está, é, é, parece que o menino chama Carlos. Carlos Mendonça ou Carlos Merinda, alguma coisa assim. Ele fala dos dois nomes. E e aí eu fui, procurei no Instagram do do meu marido e vi, achei o Carlos e olhei a foto do menino e eu lembro que eu eu pensei assim. Nossa, até que ele é bonitinho, pelo menos pegou um bonitinho. E E aí foi isso.",
  rio: "Eu estava na margem de um rio largo e escuro. Havia uma ponte de madeira, mas faltavam várias tábuas no meio. Minha avó, já falecida, estava do outro lado, de vestido azul, e acenava devagar. Tentei atravessar a nado e a correnteza me empurrava de volta. Acordei cansada, com a sensação de ter ficado a um passo.",
  porao: "Eu morava numa casa com um porão que eu nunca tinha visto. Desci uma escada estreita e encontrei um cachorro preto deitado, ferido na pata. Ele me olhou sem medo. Peguei uma toalha branca e enrolei a pata dele; a toalha ficou vermelha, mas ele não chorou. Lá em cima alguém me chamava pelo meu nome de infância e eu não consegui decidir se subia ou ficava.",
}

type Execucao = { prompt: "A" | "B" | "C"; sonho: keyof typeof SONHOS; modelo: string }
const PLANO: Execucao[] = [
  ...(["transcricao", "rio", "porao"] as const).flatMap((sonho) => (["A", "B", "C"] as const).map((prompt) => ({ prompt, sonho, modelo: "gpt-4o-mini" }))),
  { prompt: "C", sonho: "transcricao", modelo: "gpt-4o" },
  { prompt: "C", sonho: "porao", modelo: "gpt-4o" },
]

const system = (p: "A" | "B" | "C") => (p === "A" ? ANTIGO : montarPromptSonho("pt")) + SUFIXO
const MAX_TOKENS = 2600

// vocabulário simbólico/arquetípico (pt) e marcas do defeito apontado
const ARQ = /(arquétip\w*|sombra|limiar|duplo|ferida|mito\w*|figura de guia|guia\b|descida|travessia|projeção|psíquic\w*|imaginário coletivo|motivo)/gi
const PSICOLOGIZA = /(você lida|em sua vida|sua vida|revela sobre (você|como)|sua relação|protagonista|sonhador|a personagem)/gi
const SENTIMENTO = /(raiva|ciúme\w*|racionaliza\w*|defensiv\w*|insegurança\w*|medo\w*)/gi

function carregarEnv() {
  const arq = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(arq)) return
  for (const l of fs.readFileSync(arq, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}
const conta = (re: RegExp, t: string) => (t.match(re) ?? []).length
const palavras = (t: string) => t.trim().split(/\s+/).length

async function main() {
  carregarEnv()
  let gasto = 0
  const linhas: string[] = []
  const doc: string[] = ["# A/B do prompt de sonhos 1", "", "A = antigo (git, antes de e3f2a71). B = atual. C = candidato v2. Mesmos parâmetros da rota; max_tokens 2600.", ""]
  for (const e of PLANO) {
    const sys = system(e.prompt)
    const user = `Sonho:\n"${SONHOS[e.sonho]}"`
    const entrada = Math.ceil((sys.length + user.length) / 3)
    const pior = estimateCostUsd(e.modelo, entrada, MAX_TOKENS)
    const rotulo = `${e.prompt} | ${e.sonho} | ${e.modelo}`
    if (!executar) { linhas.push(`${rotulo}: entrada ≈ ${entrada} tokens, pior caso ≈ US$ ${pior.toFixed(4)}`); continue }
    if (gasto + pior > TETO) { linhas.push(`${rotulo}: NÃO EXECUTADO (teto)`); continue }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const c = await openai.chat.completions.create({ model: e.modelo, temperature: 0.7, max_tokens: MAX_TOKENS, messages: [{ role: "system", content: sys }, { role: "user", content: user }] })
    const texto = c.choices[0]?.message?.content ?? ""
    const custo = estimateCostUsd(c.model || e.modelo, c.usage?.prompt_tokens ?? 0, c.usage?.completion_tokens ?? 0)
    gasto += custo
    const estrutura = e.prompt === "A" ? "(formato antigo)" : verificarInterpretacaoSonho(texto, "pt").join("; ") || "ok"
    const m = `palavras ${palavras(texto)}, travessões ${conta(/[—–]/g, texto)}, vocabulário arquetípico ${conta(ARQ, texto)}, psicologizante ${conta(PSICOLOGIZA, texto)}, sentimentos ${conta(SENTIMENTO, texto)}, truncou ${c.choices[0]?.finish_reason === "length"}, estrutura: ${estrutura}, US$ ${custo.toFixed(4)}`
    linhas.push(`${rotulo}: ${m}`)
    doc.push(`## ${rotulo}`, "", `Medidas: ${m}`, "", texto, "")
  }
  doc.push("## Resumo", "", ...linhas.map((l) => `- ${l}`), "", executar ? `Gasto estimado: US$ ${gasto.toFixed(4)} (teto ${TETO})` : "Execução seca.")
  console.log(linhas.join("\n"))
  console.log(executar ? `\nGasto estimado: US$ ${gasto.toFixed(4)} (teto ${TETO})` : "\nExecução seca: nada foi chamado.")
  if (executar) fs.writeFileSync(path.join(process.cwd(), "docs", "ab-sonhos-1.md"), doc.join("\n"), "utf8")
}
main().catch((e) => { console.error("ERRO:", e?.message ?? e); process.exit(1) })
