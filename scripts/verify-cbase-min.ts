/**
 * Proteção de regressão da síntese C-base-min. Roda antes do build
 * (npm run verify:synthesis) e FALHA se o prompt aprovado mudar.
 *
 * Confere, contra scripts/cbase-min.golden.json:
 *  1. itens refeitos pelo seed em seeds conhecidos, incluindo uma leitura real
 *     de produção: mudanças em drawAll/renderDraw quebram leituras antigas;
 *  2. o prompt inteiro com trechos fictícios (pt, en, es): pega qualquer
 *     mudança em synthesisPrompt (regras, estilo por seed, idioma, checagem),
 *     na ordem dos sistemas, nos fatos do método ou no texto do C-base-min;
 *  3. o SHA-256 aprovado do pdfs.index.json registrado no código;
 *  4. se o índice existir localmente: o SHA-256 do arquivo e os seis prompts
 *     aprovados, com os trechos reais, byte a byte.
 *
 * O golden só muda com uma nova versão de prompt aprovada.
 */
import fs from "fs"
import path from "path"
import { APPROVED_PDFS_INDEX_SHA256 } from "../lib/oracles/references"
import { fixturePromptDigest, itemsDigest, realPromptDigest, sha256 } from "./cbase-min-fixtures"

type Golden = {
  pdfsIndexSha256: string
  itens: Array<{ seed: string; locale: "pt" | "en" | "es"; origem: string; sha256: string }>
  promptComTrechosDeTeste: Array<{ pergunta: string; seed: string; locale: "pt" | "en" | "es"; sha256: string }>
  casosAprovados: Array<{ id: number; pergunta: string; seed: string; sha256: string }>
}

const golden = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts", "cbase-min.golden.json"), "utf8")) as Golden
const falhas: string[] = []
let conferidos = 0
const conferir = (nome: string, obtido: string, esperado: string) => {
  conferidos++
  if (obtido !== esperado) falhas.push(`${nome}\n    obtido   ${obtido}\n    esperado ${esperado}`)
}

conferir("SHA-256 do índice registrado em lib/oracles/references.ts", APPROVED_PDFS_INDEX_SHA256, golden.pdfsIndexSha256)
for (const f of golden.itens) conferir(`itens do seed ${f.seed} (${f.locale}, ${f.origem})`, itemsDigest(f.seed, f.locale), f.sha256)
for (const f of golden.promptComTrechosDeTeste) conferir(`prompt com trechos de teste, seed ${f.seed} (${f.locale})`, fixturePromptDigest(f.pergunta, f.seed, f.locale), f.sha256)

async function main() {
  const indiceLocal = path.join(process.cwd(), "data", "pdfs_index", "pdfs.index.json")
  let comIndice = false
  if (fs.existsSync(indiceLocal)) {
    const shaIndice = sha256(fs.readFileSync(indiceLocal))
    conferir("SHA-256 de data/pdfs_index/pdfs.index.json", shaIndice, golden.pdfsIndexSha256)
    if (shaIndice === golden.pdfsIndexSha256) {
      comIndice = true
      for (const c of golden.casosAprovados) conferir(`prompt aprovado do caso ${c.id}`, await realPromptDigest(c.pergunta, c.seed, "pt"), c.sha256)
    }
  }

  if (falhas.length) {
    console.error(`\n[verify:synthesis] C-base-min ALTERADO: ${falhas.length} de ${conferidos} conferências falharam.`)
    console.error("O prompt de síntese aprovado não pode mudar sem nova avaliação. Diferenças:\n")
    for (const f of falhas) console.error(`  - ${f}`)
    process.exit(1)
  }
  console.log(
    `[verify:synthesis] C-base-min íntegro: ${conferidos} conferências` +
      (comIndice ? " (inclui índice local e os seis prompts aprovados)" : " (índice local ausente: prompts com trechos reais não conferidos)")
  )
}

main().catch((err) => {
  console.error("[verify:synthesis] erro ao conferir o C-base-min:", err)
  process.exit(1)
})
