// Arte do Tarô servida pela interface: o manifesto gerado por
// scripts/tarot-webp.mjs cobre as 78 cartas nas duas larguras, cada caminho tem
// o hash do conteúdo no nome (condição para o cache de um ano), o arquivo
// existe, tem tamanho de WebP e não de PNG, e a Netlify sabe travar a pasta.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { allTarotCardIds, tarotArtSrc, tarotArtSrcSet } from "../lib/oracles/tarot-assets"
import { TAROT_ARTE, TAROT_ARTE_LARGURAS } from "../lib/oracles/tarot-art-manifest"

let falhas = 0
function ok(c: boolean, n: string, extra?: unknown) {
  if (!c) {
    falhas++
    console.error("FALHOU:", n, extra ?? "")
  }
}

const ids = allTarotCardIds()
const PASTA = "public/tarot/arte"
const PADRAO = /^\/tarot\/arte\/([a-z]+-\d{2})-(\d{3})-[0-9a-f]{8}\.webp$/
// tetos por largura: a maior carta hoje tem 182 KB (600) e 92 KB (300); o
// alarme dispara se algo voltar a ser gerado sem compressão
const TETO_BYTES: Record<number, number> = { 600: 240 * 1024, 300: 130 * 1024 }

ok(ids.length === 78, "78 ids no baralho", ids.length)
ok(Object.keys(TAROT_ARTE).length === 78, "manifesto com 78 cartas", Object.keys(TAROT_ARTE).length)
ok(TAROT_ARTE_LARGURAS.join(",") === "600,300", "larguras 600 e 300", TAROT_ARTE_LARGURAS.join(","))

const total: Record<number, number> = { 600: 0, 300: 0 }
for (const id of ids) {
  const entrada = TAROT_ARTE[id]
  ok(!!entrada, `manifesto tem ${id}`)
  if (!entrada) continue
  for (const largura of TAROT_ARTE_LARGURAS) {
    const caminho = entrada[largura]
    const m = typeof caminho === "string" ? caminho.match(PADRAO) : null
    ok(!!m && m[1] === id && Number(m[2]) === largura, `caminho de ${id}@${largura} tem id, largura e hash no nome`, caminho)
    const arquivo = path.join("public", caminho ?? "")
    const existe = !!caminho && existsSync(arquivo)
    ok(existe, `arquivo existe: ${arquivo}`)
    if (existe) {
      const bytes = statSync(arquivo).size
      total[largura] += bytes
      ok(bytes > 0 && bytes <= TETO_BYTES[largura], `${id}@${largura} dentro do teto (${Math.round(bytes / 1024)} KB)`)
    }
  }
  ok(tarotArtSrc(id) === entrada[600], `tarotArtSrc(${id}) é a versão de 600 px`, tarotArtSrc(id))
  ok(tarotArtSrcSet(id) === `${entrada[300]} 300w, ${entrada[600]} 600w`, `tarotArtSrcSet(${id}) lista as duas larguras`, tarotArtSrcSet(id))
}

// nada órfão na pasta servida com cache longo
const noDisco = existsSync(PASTA) ? readdirSync(PASTA) : []
const referenciados = new Set(Object.values(TAROT_ARTE).flatMap((e) => Object.values(e).map((p) => path.basename(p))))
const orfaos = noDisco.filter((f) => !referenciados.has(f))
ok(orfaos.length === 0, "sem arquivo órfão em public/tarot/arte", orfaos.join(", "))

// a Netlify trava a pasta por um ano; e NÃO trava a pasta dos PNG de nome fixo
const toml = readFileSync("netlify.toml", "utf8")
ok(/for = "\/tarot\/arte\/\*"[\s\S]*?immutable/.test(toml), "netlify.toml: /tarot/arte/* com cache imutável")
ok(!/for = "\/tarot\/art\/\*"/.test(toml), "netlify.toml: /tarot/art/* (nome fixo) continua sem cache longo")

// a interface não aponta mais para o PNG de nome fixo e usa as duas larguras
const spread = readFileSync("components/tarot-spread.tsx", "utf8")
ok(!/\/tarot\/art\//.test(spread), "tarot-spread.tsx não referencia /tarot/art/ diretamente")
ok(/srcSet=\{tarotArtSrcSet\(/.test(spread) && /sizes=/.test(spread), "tarot-spread.tsx usa srcSet com sizes")

console.log(
  `verify-tarot-arte: ${falhas === 0 ? "ok" : `${falhas} falha(s)`} | 78 cartas, 600 px = ${Math.round(total[600] / 1024)} KB, 300 px = ${Math.round(total[300] / 1024)} KB`,
)
if (falhas > 0) process.exit(1)
