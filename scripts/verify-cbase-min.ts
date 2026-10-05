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
import { createSynthesisFilter, normalizeSynthesisText, stripBackstage } from "../lib/oracles/synthesis"
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

/**
 * O FILTRO DE SAÍDA, que é a outra metade da proteção.
 *
 * A regra 10 do prompt proíbe linguagem de bastidor, mas regra de prompt é
 * pedido, não garantia: numa bateria de 12 leituras uma abriu com "O que se
 * repete no material é...". O filtro tira a locução antes de o texto sair do
 * servidor, e estas conferências existem para que ele não volte a deixar passar
 * nem passe a comer frase legítima.
 */
function parteFiltro() {
  const casos: Array<[string, string, string]> = [
    // [rótulo, entrada, saída esperada]
    ["o caso real da bateria", "O que se repete no material é um movimento de busca.", "O que se repete é um movimento de busca."],
    ["trechos", "O que aparece nos trechos é uma hesitação.", "O que aparece é uma hesitação."],
    ["referências intercaladas", "Há, nas referências, um peso antigo.", ""],
    ["en", "What recurs in the material is a search.", "What recurs is a search."],
    ["es", "Lo que se repite en el material es una búsqueda.", "Lo que se repite es una búsqueda."],
    // "referência" não tem uso inocente numa síntese: o complemento NÃO inocenta.
    //
    // E a saída tem de ficar gramatical. Quando a locução sai sozinha e o que
    // resta se sustenta, sai sozinha. Quando sair deixaria oração órfã ("Confiar
    // que você reuniu") ou vírgula regendo o nada ("O que pesa, é a demora"), a
    // FRASE INTEIRA sai. Perder uma frase contaminada é melhor que entregar frase
    // quebrada, e nada é gerado para ocupar o lugar.
    ["dispensável", "Segundo as referências, há um peso.", "Há um peso."],
    ["dispensável em 2ª frase", "Ela hesita. Segundo as referências, há um peso.", "Ela hesita. Há um peso."],
    ["integrada ao predicado", "Confiar nas referências que você reuniu.", ""],
    ["integrada, em contexto", "Ela hesita. Confiar nas referências que você reuniu. Depois segue.", "Ela hesita. Depois segue."],
    ["particípio órfão", "A conclusão aparece nas referências fornecidas.", ""],
    ["intercalada", "O que pesa, nas referências fornecidas, é a demora.", ""],
    ["intercalada, em contexto", "Isso pesa. O que pesa, nas referências fornecidas, é a demora. Depois melhora.", "Isso pesa. Depois melhora."],
    ["aposto", "Há, segundo as referências, um peso antigo.", ""],
    ["aposto, em contexto", "Primeiro isto. Há, segundo as referências, um peso antigo. E depois aquilo.", "Primeiro isto. E depois aquilo."],
    ["integrada en", "Trust in the references that you gathered.", ""],
    ["particípio órfão en", "The conclusion appears in the references provided.", ""],
    ["intercalada en", "This recurs, according to the references, as a doubt.", ""],
    ["intercalada en, em contexto", "He waits. This recurs, according to the references, as a doubt. Then it fades.", "He waits. Then it fades."],
    ["integrada es", "Confiar en las referencias que reuniste.", ""],
    ["integrada es, em contexto", "Ella duda. Confiar en las referencias que reuniste. Luego sigue.", "Ella duda. Luego sigue."],
    ["particípio órfão es", "La conclusión aparece en las referencias proporcionadas.", ""],
    ["intercalada es", "Esto vuelve, según las referencias, como una duda.", ""],
    // começo de texto: a maiúscula volta, não fica "há um peso"
    ["início do texto", "No material, há um peso antigo.", "Há um peso antigo."],
    // o complemento torna a locução legítima na família ambígua: nada é cortado
    ["complemento pt", "Um cuidado no material de trabalho.", "Um cuidado no material de trabalho."],
    ["complemento pt 2", "Atenção aos trechos de estrada que faltam.", "Atenção aos trechos de estrada que faltam."],
    ["complemento en", "A care in the material of the work.", "A care in the material of the work."],
    // substantivos ambíguos continuam intocados
    ["fontes", "Relações podem ser fontes de suporte e solução.", "Relações podem ser fontes de suporte e solução."],
    ["sinais", "Há sinais de que uma nova fase se delineia.", "Há sinais de que uma nova fase se delineia."],
    ["sistemas", "Os sistemas de crença que você herdou pesam.", "Os sistemas de crença que você herdou pesam."],
    // nome de hexagrama em português é palavra corrente: não é lista negra
    ["hexagrama homógrafo", "O contraste entre estagnação e progresso é forte.", "O contraste entre estagnação e progresso é forte."],
    ["hexagrama homógrafo 2", "Há um conflito interno sobre como lidar com isso.", "Há um conflito interno sobre como lidar com isso."],
  ]
  for (const [rotulo, entrada, esperado] of casos) {
    conferir(`filtro · ${rotulo}`, stripBackstage(entrada), esperado)
  }

  // o filtro de streaming tem de dar o MESMO resultado, com o texto chegando
  // picado em qualquer tamanho — inclusive partindo a locução ao meio
  for (const [rotulo, entrada, esperado] of casos) {
    for (const passo of [1, 3, 7, 13]) {
      const f = createSynthesisFilter()
      let saida = ""
      for (let i = 0; i < entrada.length; i += passo) saida += f.push(entrada.slice(i, i + passo))
      saida += f.flush()
      conferir(`filtro em stream (passo ${passo}) · ${rotulo}`, saida, esperado)
    }
  }

  // o marcador de parágrafo continua funcionando como antes
  conferir("filtro · marcador de parágrafo", normalizeSynthesisText("Uma frase.[[P]]Outra frase."), "Uma frase.\n\nOutra frase.")
  const fm = createSynthesisFilter()
  conferir(
    "filtro em stream · marcador partido",
    ["Uma frase.[[", "P]]Outra frase."].map((c) => fm.push(c)).join("") + fm.flush(),
    "Uma frase.\n\nOutra frase."
  )
}

async function main() {
  parteFiltro()
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
