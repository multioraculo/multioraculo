// Gera a arte das cartas que a interface serve: WebP com o hash do conteúdo no
// nome, para o Tarô e para o Lenormand.
//
// POR QUE EXISTE. As gravuras aprovadas moram como PNG de nome fixo
// (public/tarot/art, 23 MB; public/lenormand, 1,1 MB) e eram servidas assim,
// com `max-age=0`: cada visita revalidava cada carta, e a moldura aparecia
// antes da figura. Não dava para travar o cache porque o nome era fixo e a
// arte já foi trocada mantendo o nome mais de uma vez neste projeto.
//
// O QUE FAZ. Lê os PNG aprovados (NÃO roda nenhuma ingestão de novo, ver a
// memória do projeto), gera de cada um WebP com transparência nas larguras
// pedidas, sem nunca ampliar a fonte, e grava em
// <destino>/<id>-<largura>-<hash8>.webp, onde o hash é do próprio conteúdo.
// Trocar a arte de uma carta gera outro nome, e o cache de um ano
// (netlify.toml) deixa de ser risco. O mapa id → { src, srcSet } sai num
// módulo TypeScript por baralho, que *ArtSrc() e *ArtSrcSet() consultam.
//
// POR QUE DUAS LARGURAS. A lâmina tem 92 a 150 px CSS; a vista ampliada, até
// 300. Em tela de densidade 2 a lâmina precisa de 300 px de imagem, e a de
// 600 só serve à ampliação e às telas de densidade 3. O navegador escolhe
// pelo `sizes` do <img>. Fonte menor que a largura pedida (há Lenormand de
// 226 px) gera só o que a fonte tem, e o srcSet declara a largura real.
//
// POR QUE DOIS MODOS. O Tarô é gravura pontilhada com fundo transparente:
// lossy a 75/70 reduz de 23 MB para 17 MB nas duas larguras. O Lenormand é
// traço chapado em marfim: lossy FICOU MAIOR que o PNG (garden: 70 KB → 117 KB)
// e redimensionar também (lossless a 300 px: 117 KB). Para ele, lossless na
// largura da fonte, que dá o tamanho do PNG com zero erro; o ganho ali é só o
// nome com hash e o cache de um ano, que era o objetivo.
//
// POR QUE ESTA QUALIDADE. Medido contra o PNG do Tarô (erro médio por canal,
// com o alfa aplicado): 84/90 dava 1,3 e 297 KB na pior carta; 75/70 dá 1,8 e
// 182 KB. A gravura é traço pontilhado, quase ruído para o codificador, por
// isso qualidade acima disso custa caro e não aparece a 25% de escala. Mudar
// a qualidade muda o hash e, portanto, o nome: é seguro.
//
// Idempotente: roda quantas vezes quiser; só grava o que mudou e apaga do
// destino o que não está mais no manifesto.
//
//   node scripts/cartas-webp.mjs            (os dois baralhos)
//   node scripts/cartas-webp.mjs tarot      (só um)
import { createHash } from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"
import sharp from "sharp"

const QUALIDADE = 75
const QUALIDADE_ALFA = 70
const LARGURAS = [300, 600]

const BARALHOS = {
  tarot: {
    origem: "public/tarot/art",
    destino: "public/tarot/arte",
    manifesto: "lib/oracles/tarot-art-manifest.ts",
    constante: "TAROT_ARTE",
    modo: "lossy",
    larguras: LARGURAS,
  },
  lenormand: {
    origem: "public/lenormand",
    destino: "public/lenormand/arte",
    manifesto: "lib/oracles/lenormand-art-manifest.ts",
    constante: "LENORMAND_ARTE",
    modo: "lossless",
    // null = só a largura da fonte (ver POR QUE DOIS MODOS)
    larguras: null,
  },
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`

async function gerar(nome, cfg) {
  const arquivos = (await fs.readdir(cfg.origem)).filter((f) => f.endsWith(".png")).sort()
  if (arquivos.length === 0) throw new Error(`nenhum PNG em ${cfg.origem}`)
  await fs.mkdir(cfg.destino, { recursive: true })
  const publico = `/${cfg.destino.replace(/^public\//, "")}`

  const manifesto = {}
  let antes = 0
  let depois = 0
  let maior = { id: "", bytes: 0 }
  let gravados = 0

  for (const arquivo of arquivos) {
    const id = arquivo.replace(/\.png$/, "")
    const png = await fs.readFile(path.join(cfg.origem, arquivo))
    antes += png.length
    const larguraFonte = (await sharp(png).metadata()).width ?? 0
    const variantes = new Map() // largura real → caminho
    for (const pedida of cfg.larguras ?? [larguraFonte]) {
      const largura = Math.min(pedida, larguraFonte)
      if (variantes.has(largura)) continue
      const webp = await sharp(png)
        .resize({ width: largura, withoutEnlargement: true })
        .webp(cfg.modo === "lossless" ? { lossless: true, effort: 6 } : { quality: QUALIDADE, alphaQuality: QUALIDADE_ALFA, effort: 6 })
        .toBuffer()
      const hash = createHash("sha1").update(webp).digest("hex").slice(0, 8)
      const nomeArq = `${id}-${largura}-${hash}.webp`
      const destino = path.join(cfg.destino, nomeArq)
      try {
        await fs.access(destino)
      } catch {
        await fs.writeFile(destino, webp)
        gravados++
      }
      variantes.set(largura, `${publico}/${nomeArq}`)
      depois += webp.length
      if (webp.length > maior.bytes) maior = { id, bytes: webp.length }
    }
    const ordenadas = [...variantes.entries()].sort((a, b) => a[0] - b[0])
    manifesto[id] = {
      src: ordenadas[ordenadas.length - 1][1],
      srcSet: ordenadas.map(([w, p]) => `${p} ${w}w`).join(", "),
    }
  }

  // limpa versões antigas que ninguém mais referencia
  const vivos = new Set(Object.values(manifesto).flatMap((m) => m.srcSet.split(", ").map((p) => path.basename(p.split(" ")[0]))))
  let removidos = 0
  for (const f of await fs.readdir(cfg.destino)) {
    if (!vivos.has(f)) {
      await fs.unlink(path.join(cfg.destino, f))
      removidos++
    }
  }

  const linhas = Object.keys(manifesto)
    .sort()
    .map((id) => `  "${id}": { src: "${manifesto[id].src}", srcSet: "${manifesto[id].srcSet}" },`)
  const codigo = [
    `// GERADO por scripts/cartas-webp.mjs a partir de ${cfg.origem}. Não edite à mão.`,
    "// Caminho da gravura de cada carta (src = maior largura) e o srcSet com todas",
    "// as larguras, com o hash do conteúdo no nome: é o que permite servir estes",
    "// arquivos com cache de um ano (netlify.toml).",
    `export const ${cfg.constante}: Record<string, { src: string; srcSet: string }> = {`,
    ...linhas,
    "}",
    "",
  ].join("\n")
  await fs.writeFile(cfg.manifesto, codigo)

  console.log(`${nome}: ${arquivos.length} cartas | PNG ${kb(antes)} → WebP ${kb(depois)} | maior: ${maior.id} ${kb(maior.bytes)} | gravados ${gravados}, removidos ${removidos}`)
}

async function main() {
  const pedidos = process.argv.slice(2)
  const nomes = pedidos.length ? pedidos : Object.keys(BARALHOS)
  for (const nome of nomes) {
    const cfg = BARALHOS[nome]
    if (!cfg) throw new Error(`baralho desconhecido: ${nome} (use ${Object.keys(BARALHOS).join(" | ")})`)
    await gerar(nome, cfg)
  }
}

main().catch((e) => {
  console.error("cartas-webp falhou:", e)
  process.exit(1)
})
