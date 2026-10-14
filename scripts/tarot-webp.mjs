// Gera a arte do Tarô que a interface serve: WebP com o hash do conteúdo no nome.
//
// POR QUE EXISTE. As gravuras aprovadas moram em public/tarot/art como PNG de
// 600×992 (260 KB a 1,3 MB cada, 23 MB no total) e eram servidas assim, com
// `max-age=0`: cada visita revalidava cada carta, e a moldura aparecia antes da
// figura. Não dava para travar o cache porque o nome era fixo e a arte já foi
// trocada mantendo o nome mais de uma vez neste projeto.
//
// O QUE FAZ. Lê os PNG aprovados (NÃO roda a ingestão de novo, ver a memória
// do projeto), gera de cada um dois WebP com transparência, em 600 e 300 px de
// largura, e grava em public/tarot/arte/<id>-<largura>-<hash8>.webp, onde o
// hash é do próprio conteúdo. Trocar a arte de uma carta gera outro nome, e o
// cache de um ano (netlify.toml) deixa de ser risco. O mapa id → caminhos sai
// em lib/oracles/tarot-art-manifest.ts, que tarotArtSrc() e tarotArtSrcSet()
// consultam.
//
// POR QUE DUAS LARGURAS. A lâmina tem 118 a 150 px CSS; a vista ampliada, 300.
// Em tela de densidade 2 a lâmina precisa de 300 px de imagem, e a de 600 só
// serve à ampliação e às telas de densidade 3. O navegador escolhe pelo
// `sizes` do <img>.
//
// POR QUE ESTA QUALIDADE. Medido contra o PNG (erro médio por canal, com o
// alfa aplicado): 84/90 dava 1,3 e 297 KB na pior carta; 75/70 dá 1,8 e
// 182 KB. A gravura é traço pontilhado, quase ruído para o codificador, por
// isso o ganho de qualidade acima disso custa caro e não aparece a 25% de
// escala. Mudar a qualidade muda o hash e, portanto, o nome: é seguro.
//
// Idempotente: roda quantas vezes quiser; só grava o que mudou e apaga de
// public/tarot/arte o que não está mais no manifesto.
//
//   node scripts/tarot-webp.mjs
import { createHash } from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"
import sharp from "sharp"

const ORIGEM = "public/tarot/art"
const DESTINO = "public/tarot/arte"
const MANIFESTO = "lib/oracles/tarot-art-manifest.ts"
const LARGURAS = [600, 300]
const QUALIDADE = 75
const QUALIDADE_ALFA = 70

const kb = (n) => `${(n / 1024).toFixed(0)} KB`

async function main() {
  const arquivos = (await fs.readdir(ORIGEM)).filter((f) => f.endsWith(".png")).sort()
  if (arquivos.length === 0) throw new Error(`nenhum PNG em ${ORIGEM}`)
  await fs.mkdir(DESTINO, { recursive: true })

  const manifesto = {}
  let antes = 0
  const depois = Object.fromEntries(LARGURAS.map((w) => [w, 0]))
  const maior = Object.fromEntries(LARGURAS.map((w) => [w, { id: "", bytes: 0 }]))
  let gravados = 0

  for (const arquivo of arquivos) {
    const id = arquivo.replace(/\.png$/, "")
    const png = await fs.readFile(path.join(ORIGEM, arquivo))
    antes += png.length
    manifesto[id] = {}
    for (const largura of LARGURAS) {
      const webp = await sharp(png)
        .resize({ width: largura })
        .webp({ quality: QUALIDADE, alphaQuality: QUALIDADE_ALFA, effort: 6 })
        .toBuffer()
      const hash = createHash("sha1").update(webp).digest("hex").slice(0, 8)
      const nome = `${id}-${largura}-${hash}.webp`
      const destino = path.join(DESTINO, nome)
      try {
        await fs.access(destino)
      } catch {
        await fs.writeFile(destino, webp)
        gravados++
      }
      manifesto[id][largura] = `/${DESTINO.replace(/^public\//, "")}/${nome}`
      depois[largura] += webp.length
      if (webp.length > maior[largura].bytes) maior[largura] = { id, bytes: webp.length }
    }
  }

  // limpa versões antigas que ninguém mais referencia
  const vivos = new Set(Object.values(manifesto).flatMap((m) => Object.values(m).map((p) => path.basename(p))))
  let removidos = 0
  for (const f of await fs.readdir(DESTINO)) {
    if (!vivos.has(f)) {
      await fs.unlink(path.join(DESTINO, f))
      removidos++
    }
  }

  const linhas = Object.keys(manifesto)
    .sort()
    .map((id) => `  "${id}": { ${LARGURAS.map((w) => `${w}: "${manifesto[id][w]}"`).join(", ")} },`)
  const codigo = [
    "// GERADO por scripts/tarot-webp.mjs a partir de public/tarot/art. Não edite à mão.",
    "// Caminho da gravura de cada carta, por largura, com o hash do conteúdo no",
    "// nome: é o que permite servir estes arquivos com cache de um ano (netlify.toml).",
    `export const TAROT_ARTE_LARGURAS = [${LARGURAS.join(", ")}] as const`,
    "export type TarotArteLargura = (typeof TAROT_ARTE_LARGURAS)[number]",
    "export const TAROT_ARTE: Record<string, Record<TarotArteLargura, string>> = {",
    ...linhas,
    "}",
    "",
  ].join("\n")
  await fs.writeFile(MANIFESTO, codigo)

  console.log(`tarot-webp: ${arquivos.length} cartas | PNG ${kb(antes)}`)
  for (const w of LARGURAS) console.log(`  ${w} px: ${kb(depois[w])} no total | maior: ${maior[w].id} ${kb(maior[w].bytes)}`)
  console.log(`gravados agora: ${gravados} | removidos: ${removidos} | manifesto: ${MANIFESTO}`)
}

main().catch((e) => {
  console.error("tarot-webp falhou:", e)
  process.exit(1)
})
