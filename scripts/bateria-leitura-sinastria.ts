/**
 * Bateria curta (PAGA) da leitura relacional da sinastria: as MESMAS 6 entradas da bateria 4, uma geração cada, para
 * comparar a leitura nova com a síntese antiga (já gravada em data/bateria-sinastria/bateria4/resultado).
 *
 * NÃO RODA SEM AUTORIZAÇÃO. Sem `--autorizado` ela só mostra o que faria e o custo estimado, sem chamar nada.
 * Reparo LIGADO (no máximo um), porque é assim que o produto o usaria; o relatório registra quando ele foi usado.
 *
 *   node --import ./scripts/ts-register.mjs scripts/bateria-leitura-sinastria.ts             (só mostra)
 *   node --import ./scripts/ts-register.mjs scripts/bateria-leitura-sinastria.ts --autorizado
 */
import crypto from "crypto"
import fs from "fs"
import path from "path"
import OpenAI from "openai"
import { estimateCostUsd } from "../lib/ai/pricing"
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { gerarLeituraSinastria, prepararLeitura } from "../lib/astro/gerar-leitura-sinastria"
import { dados } from "./simular-selecao-sinastria"

const RAIZ = path.resolve("data/bateria-sinastria")
const SAIDA = path.join(RAIZ, "leitura1")
const MODELO = "gpt-4o"
const AUTORIZADO = process.argv.includes("--autorizado")

type Entrada = { a: number; b: number; horaA: boolean; horaB: boolean; vinculo: string }
const chave1: Record<string, Entrada> = JSON.parse(fs.readFileSync(path.join(RAIZ, "chave.json"), "utf8"))
const chave3: Record<string, Entrada> = JSON.parse(fs.readFileSync(path.join(RAIZ, "bateria3", "chave.json"), "utf8"))
const chave4: Record<string, { origem: string }> = JSON.parse(fs.readFileSync(path.join(RAIZ, "bateria4", "chave.json"), "utf8"))
const entradaDe = (origem: string): Entrada => chave3[origem] ?? chave1[origem]

/** A síntese antiga de cada entrada, como a bateria 4 a gravou. */
function antes(origem: string): Record<string, { paragrafos: Array<{ texto: string }> } | null> | null {
  const dir = path.join(RAIZ, "bateria4", "resultado")
  for (const f of fs.readdirSync(dir)) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))
    if (j.origem === origem) {
      try {
        return JSON.parse(j.geracao.texto)
      } catch {
        return null
      }
    }
  }
  return null
}

async function main() {
  const origens = [...new Set(Object.values(chave4).map((c) => c.origem))]
  console.log(`${origens.length} entradas da bateria 4: ${origens.join(", ")}`)
  const preparos = origens.map((o) => {
    const e = entradaDe(o)
    const resultado = sinastria(mapaNatal(dados(e.a, e.horaA)), mapaNatal(dados(e.b, e.horaB)))
    return { origem: o, entrada: e, preparo: prepararLeitura(resultado, { locale: "pt", vinculo: e.vinculo as never }) }
  })
  const tokens = preparos.reduce((s, p) => s + Math.ceil((p.preparo.prompt.system.length + p.preparo.prompt.user.length) / 3.6), 0)
  const custoMax = estimateCostUsd(MODELO, tokens * 2, 600 * preparos.length * 2)
  console.log(`prompt total ~${tokens} tokens de entrada; custo estimado até US$ ${custoMax.toFixed(3)} (com um reparo em cada, o teto)`)
  if (!AUTORIZADO) {
    console.log("SEM --autorizado: nenhuma chamada feita.")
    return
  }

  for (const linha of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = /^([A-Z_]+)=(.*)$/.exec(linha)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "")
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  fs.mkdirSync(path.join(SAIDA, "resultado"), { recursive: true })

  let total = 0
  const md: string[] = ["# Leitura relacional: bateria 1 (6 gerações)", ""]
  for (const { origem, entrada, preparo } of preparos) {
    const id = `R-${crypto.randomBytes(3).toString("hex")}`
    const chamadas: Array<{ entrada: number; saida: number; custo: number; texto: string }> = []
    const r = await gerarLeituraSinastria({
      preparo,
      locale: "pt",
      gerar: async (p) => {
        const resp = await openai.chat.completions.create({
          model: MODELO,
          temperature: 0.7,
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: p.system }, { role: "user", content: p.user }],
        })
        const ent = resp.usage?.prompt_tokens ?? 0
        const sai = resp.usage?.completion_tokens ?? 0
        const texto = resp.choices[0]?.message?.content ?? ""
        chamadas.push({ entrada: ent, saida: sai, custo: estimateCostUsd(resp.model ?? MODELO, ent, sai), texto })
        try {
          return JSON.parse(texto)
        } catch {
          return texto
        }
      },
    })
    const custo = chamadas.reduce((s, c) => s + c.custo, 0)
    total += custo
    fs.writeFileSync(path.join(SAIDA, "resultado", `${id}.json`), JSON.stringify({ id, origem, vinculo: entrada.vinculo, mapa: preparo.mapa, resultado: r, chamadas }, null, 1))

    md.push(`## ${id} (entrada ${origem}, vínculo ${entrada.vinculo})`, "", `Perfil do centro: **${preparo.mapa.perfil}**; centrais: ${preparo.mapa.centrais.join(", ")}; contradições: ${preparo.mapa.contradicoes.map((c) => c.id).join(", ") || "nenhuma"}.`)
    md.push(`Origem: **${r.origem}**, reparos: ${r.reparos}, custo US$ ${custo.toFixed(4)}.`)
    if (r.origem === "indisponivel") md.push("", "Violações:", ...r.violacoes.map((v) => `- ${v}`))
    if (r.avisos.length) md.push("", "Avisos:", ...r.avisos.map((v) => `- ${v}`))
    const a = antes(origem)
    md.push("", "### Antes (síntese final e síntese da relação, bateria 4)")
    for (const k of ["sintese_da_relacao", "sintese_final"]) md.push(`**${k}:** ${a?.[k]?.paragrafos.map((p) => p.texto).join(" ") ?? "(sem resposta)"}`, "")
    md.push("### Depois (leitura relacional)")
    if (r.leitura) {
      md.push(`**Parecer:** ${r.leitura.parecer.texto}`, "", ...r.leitura.aproxima_e_tensiona.map((p) => `**Aproxima e tensiona:** ${p.texto}\n`), `**Significado:** ${r.leitura.significado.texto}`, "")
      if (r.leitura.na_relacao) md.push(`**Na relação:** ${r.leitura.na_relacao.texto}`, "")
    } else md.push("(indisponível: a tela mostraria só os fatos e o resumo)", "")
    console.log(`${id} ${origem}: ${r.origem} reparos=${r.reparos} US$${custo.toFixed(4)}`)
  }
  md.push(`Custo total: US$ ${total.toFixed(4)}`)
  fs.writeFileSync(path.join(SAIDA, "relatorio.md"), md.join("\n"))
  console.log(`custo total US$ ${total.toFixed(4)}; relatório em ${path.join(SAIDA, "relatorio.md")}`)
}
main()
