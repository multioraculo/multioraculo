// Arte das cartas servida pela interface (Tarô e Lenormand): os manifestos
// gerados por scripts/cartas-webp.mjs cobrem todas as cartas, cada caminho tem
// o hash do conteúdo no nome (condição para o cache de um ano), o arquivo
// existe, tem tamanho de WebP e não de PNG, nada fica órfão nas pastas
// travadas, e a Netlify sabe travá-las sem travar os PNG de nome fixo.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { allTarotCardIds, tarotArtSrc, tarotArtSrcSet } from "../lib/oracles/tarot-assets"
import { LENORMAND_IDS, lenormandArtSrc, lenormandArtSrcSet } from "../lib/oracles/lenormand-assets"
import { TAROT_ARTE } from "../lib/oracles/tarot-art-manifest"
import { LENORMAND_ARTE } from "../lib/oracles/lenormand-art-manifest"

let falhas = 0
function ok(c: boolean, n: string, extra?: unknown) {
  if (!c) {
    falhas++
    console.error("FALHOU:", n, extra ?? "")
  }
}

type Manifesto = Record<string, { src: string; srcSet: string }>
type Baralho = {
  nome: string
  ids: readonly string[]
  manifesto: Manifesto
  pasta: string
  src: (id: string) => string
  srcSet: (id: string) => string
  /** teto por arquivo: alarme de que algo voltou a ser gerado sem compressão */
  tetoBytes: number
}

const BARALHOS: Baralho[] = [
  // maior carta hoje: 217 KB (600 px)
  { nome: "tarot", ids: allTarotCardIds(), manifesto: TAROT_ARTE, pasta: "/tarot/arte", src: tarotArtSrc, srcSet: tarotArtSrcSet, tetoBytes: 240 * 1024 },
  // fontes de 226 a 640 px; maior hoje bem abaixo de 100 KB
  { nome: "lenormand", ids: LENORMAND_IDS, manifesto: LENORMAND_ARTE, pasta: "/lenormand/arte", src: lenormandArtSrc, srcSet: lenormandArtSrcSet, tetoBytes: 160 * 1024 },
]

const toml = readFileSync("netlify.toml", "utf8")
const resumo: string[] = []

for (const b of BARALHOS) {
  const padrao = new RegExp(`^${b.pasta.replace(/\//g, "\\/")}\\/([a-z]+(?:-\\d{2})?)-(\\d{3})-[0-9a-f]{8}\\.webp$`)
  ok(Object.keys(b.manifesto).length === b.ids.length, `${b.nome}: manifesto com ${b.ids.length} cartas`, Object.keys(b.manifesto).length)

  let total = 0
  const referenciados = new Set<string>()
  for (const id of b.ids) {
    const entrada = b.manifesto[id]
    ok(!!entrada, `${b.nome}: manifesto tem ${id}`)
    if (!entrada) continue
    const variantes = entrada.srcSet.split(", ").map((v) => v.split(" "))
    ok(variantes.length >= 1 && variantes.length <= 2, `${b.nome}: ${id} com 1 ou 2 larguras`, entrada.srcSet)
    const larguras = variantes.map(([, w]) => Number(w.replace(/w$/, "")))
    ok(entrada.src === variantes[variantes.length - 1][0] && larguras.every((w, i) => i === 0 || w > larguras[i - 1]), `${b.nome}: ${id} src é a maior largura e o srcSet é crescente`, entrada)
    for (const [caminho, desc] of variantes) {
      const m = caminho.match(padrao)
      ok(!!m && m[1] === id && `${m[2]}w` === desc, `${b.nome}: caminho de ${id} tem id, largura e hash no nome`, caminho)
      const arquivo = path.join("public", caminho)
      const existe = existsSync(arquivo)
      ok(existe, `${b.nome}: arquivo existe: ${arquivo}`)
      referenciados.add(path.basename(caminho))
      if (existe) {
        const bytes = statSync(arquivo).size
        total += bytes
        ok(bytes > 0 && bytes <= b.tetoBytes, `${b.nome}: ${id} dentro do teto (${Math.round(bytes / 1024)} KB)`)
      }
    }
    ok(b.src(id) === entrada.src, `${b.nome}: ${id} src() usa o manifesto`, b.src(id))
    ok(b.srcSet(id) === entrada.srcSet, `${b.nome}: ${id} srcSet() usa o manifesto`, b.srcSet(id))
  }

  const dir = path.join("public", b.pasta)
  const orfaos = (existsSync(dir) ? readdirSync(dir) : []).filter((f) => !referenciados.has(f))
  ok(orfaos.length === 0, `${b.nome}: sem arquivo órfão em ${dir}`, orfaos.join(", "))

  ok(new RegExp(`for = "${b.pasta.replace(/\//g, "\\/")}\\/\\*"[\\s\\S]*?immutable`).test(toml), `netlify.toml: ${b.pasta}/* com cache imutável`)
  resumo.push(`${b.nome} ${b.ids.length} cartas, ${Math.round(total / 1024)} KB`)
}

// os PNG de nome fixo continuam sem cache longo
ok(!/for = "\/tarot\/art\/\*"/.test(toml) && !/for = "\/lenormand\/\*"/.test(toml), "netlify.toml: pastas de PNG de nome fixo sem cache longo")

// a interface não aponta mais para PNG de nome fixo e usa as duas larguras
for (const [arquivo, antigo] of [["components/tarot-spread.tsx", /\/tarot\/art\//], ["components/lenormand-table.tsx", /\/lenormand\/[a-z]+\.png/]] as const) {
  const src = readFileSync(arquivo, "utf8")
  ok(!antigo.test(src), `${arquivo} não referencia PNG de nome fixo`)
  ok(/srcSet=\{/.test(src) && /sizes=/.test(src), `${arquivo} usa srcSet com sizes`)
}

console.log(`verify-cartas-arte: ${falhas === 0 ? "ok" : `${falhas} falha(s)`} | ${resumo.join(" | ")}`)
if (falhas > 0) process.exit(1)
