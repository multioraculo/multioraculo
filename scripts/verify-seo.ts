/**
 * Verificador da fundação de SEO (fase 1). Roda no prebuild.
 *
 * Confere, sem rede e sem gastar nada:
 *  - cada rota privada carrega o noindex, e nenhuma pública o carrega;
 *  - robots.txt e sitemap só falam do que deve: sitemap = as páginas
 *    indexáveis, sem alternates de idioma (não existem /en e /es);
 *  - title/description existem nos três idiomas e cabem nos limites;
 *  - canonical limpo e Open Graph absoluto;
 *  - JSON-LD sem propriedade inventada;
 *  - a guarda de custo do horóscopo (compartilha pedido, esfria falha);
 *  - o middleware não toca em robots/sitemap/manifest/imagem OG.
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { dictionaries } from "../lib/i18n/dictionaries"
import { LOCALES } from "../lib/i18n/config"
import { ARQUIVOS_NOINDEX, PAGINAS_INDEXAVEIS } from "../lib/seo/paginas"
import { paginaPrivada, paginaPublica } from "../lib/seo/metadata"
import { organizationLd, serializarLd, websiteLd } from "../lib/seo/json-ld"
import { urlAbsoluta } from "../lib/seo/site"
import robots from "../app/robots"
import sitemap from "../app/sitemap"
import { criarGuarda } from "../lib/astro/horoscopo-guarda"

let falhas = 0
function ok(condicao: boolean, msg: string) {
  if (!condicao) {
    falhas++
    console.error(`FALHOU: ${msg}`)
  }
}
const ler = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8")

// ── 1 · rotas privadas e públicas ────────────────────────────────────────────
for (const arq of ARQUIVOS_NOINDEX) {
  const src = ler(arq)
  ok(/export const metadata = paginaPrivada\(\)/.test(src), `${arq}: falta "export const metadata = paginaPrivada()"`)
}
for (const p of PAGINAS_INDEXAVEIS) {
  const arq = p.caminho === "/" ? "app/page.tsx" : `app${p.caminho}/page.tsx`
  const src = ler(arq)
  ok(!/paginaPrivada/.test(src), `${arq}: página indexável não pode ser privada`)
  ok(src.includes(`metadataDaRota("${p.chave}")`), `${arq}: falta metadataDaRota("${p.chave}")`)
}
const priv = paginaPrivada().robots as { index?: boolean; follow?: boolean }
ok(priv.index === false && priv.follow === true, "paginaPrivada deve ser noindex, follow")

// /auth/callback não tem HTML: o noindex vai em cabeçalho
const cfg = ler("next.config.mjs")
ok(/source:\s*"\/auth\/callback"/.test(cfg) && /X-Robots-Tag/.test(cfg) && /noindex, follow/.test(cfg), "next.config.mjs: /auth/callback sem X-Robots-Tag noindex, follow")

// ── 2 · robots.txt ──────────────────────────────────────────────────────────
const r = robots()
const regras = Array.isArray(r.rules) ? r.rules : [r.rules]
const bloqueios = regras.flatMap((x) => (Array.isArray(x.disallow) ? x.disallow : x.disallow ? [x.disallow] : []))
ok(bloqueios.includes("/api/"), "robots: /api/ deve estar bloqueada")
// bloquear página com noindex impede o rastreador de ler o noindex
for (const caminho of ["/home", "/diario", "/marcos", "/sonhos-salvos", "/leituras-salvas", "/leitura", "/admin", "/auth"]) {
  ok(!bloqueios.some((b) => b === caminho || b === `${caminho}/`), `robots: não bloqueie ${caminho} (o noindex precisa ser lido)`)
}
ok(r.sitemap === urlAbsoluta("/sitemap.xml"), "robots: sitemap ausente ou fora do domínio")

// ── 3 · sitemap ─────────────────────────────────────────────────────────────
const s = sitemap()
ok(
  JSON.stringify(s.map((e) => e.url).sort()) === JSON.stringify(PAGINAS_INDEXAVEIS.map((p) => urlAbsoluta(p.caminho)).sort()),
  "sitemap deve listar exatamente as páginas indexáveis",
)
for (const e of s) {
  ok(!("alternates" in e), `sitemap: ${e.url} não pode ter alternates (sem /en e /es)`)
  ok(!/[?#]/.test(e.url), `sitemap: ${e.url} deve ser a URL limpa`)
  ok(!/\/(api|admin|auth|leitura|leituras-salvas|diario|marcos|sonhos-salvos|home)(\/|$)/.test(new URL(e.url).pathname), `sitemap: rota privada ${e.url}`)
}

// ── 4 · title e description por idioma ──────────────────────────────────────
for (const loc of LOCALES) {
  const d = dictionaries[loc]
  const titulos = new Set<string>()
  for (const p of PAGINAS_INDEXAVEIS) {
    const seo = d.seo[p.chave]
    ok(Boolean(seo?.title && seo?.description), `${loc}.seo.${p.chave}: faltam title/description`)
    if (!seo) continue
    const total = p.chave === "home" ? seo.title.length : `${seo.title} | Multioráculo`.length
    ok(total <= 62, `${loc}.seo.${p.chave}: título com ${total} caracteres (máx. 62)`)
    ok(seo.description.length >= 70 && seo.description.length <= 165, `${loc}.seo.${p.chave}: description com ${seo.description.length} caracteres (70 a 165)`)
    ok(!titulos.has(seo.title), `${loc}: título repetido em ${p.chave}`)
    titulos.add(seo.title)
  }
  ok(Boolean(d.faq.title) && Boolean(d.oraclesPage.title), `${loc}: faltam os H1 de /faq e /oraculos`)
}
for (const arq of ["app/faq/page.tsx", "app/oraculos/page.tsx"]) {
  ok(/<h1[\s>]/.test(ler(arq)), `${arq}: sem <h1>`)
}

// ── 5 · canonical, Open Graph, sem hreflang ─────────────────────────────────
const m = paginaPublica({ caminho: "/faq", titulo: "Perguntas", descricao: "d", locale: "pt" })
ok((m.alternates as { canonical?: string })?.canonical === "/faq", "canonical deve ser o caminho limpo")
ok(!("languages" in ((m.alternates as object) ?? {})), "sem hreflang enquanto /en e /es não existirem")
const og = m.openGraph as { url?: string; locale?: string; images?: { url: string }[] }
ok(og?.url === urlAbsoluta("/faq"), "og:url deve ser absoluta")
ok(og?.locale === "pt_BR", `og:locale inesperado: ${og?.locale}`)
ok(og?.images?.[0]?.url === urlAbsoluta("/opengraph-image"), "og:image deve ser a imagem do site")
const home = paginaPublica({ caminho: "/", titulo: "Home", descricao: "d", locale: "en", absoluto: true })
ok(JSON.stringify(home.title) === JSON.stringify({ absolute: "Home" }), "título absoluto da Home")

// ── 6 · JSON-LD ─────────────────────────────────────────────────────────────
const proibidas = ["aggregateRating", "review", "author", "offers", "price", "sameAs", "potentialAction", "contactPoint"]
for (const ld of [organizationLd(), websiteLd()]) {
  const texto = JSON.stringify(ld)
  for (const chave of proibidas) ok(!texto.includes(`"${chave}"`), `JSON-LD ${ld["@type"]}: propriedade "${chave}" não pode ser inventada`)
  ok(ld["@context"] === "https://schema.org", "JSON-LD: @context")
  ok(/^https:\/\//.test(ld.url), `JSON-LD ${ld["@type"]}: url não absoluta`)
}
ok(/^https:\/\/.+\.png$/.test(organizationLd().logo), "Organization.logo deve ser URL absoluta de imagem")
ok(!serializarLd({ x: "</script><script>alert(1)" }).includes("<"), "serializarLd deve escapar <")

// ── 7 · middleware não toca em arquivos de metadata ─────────────────────────
const mw = ler("middleware.ts")
const bruto = mw.match(/"(\/\(\(\?!.*?\)\.\*\))"/)
ok(Boolean(bruto), "middleware: matcher não encontrado")
if (bruto) {
  const re = new RegExp(`^${JSON.parse(`"${bruto[1]}"`)}$`)
  for (const caminho of ["/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/opengraph-image", "/favicon.ico"]) {
    ok(!re.test(caminho), `middleware: ${caminho} não deve passar pelo getUser()`)
  }
  for (const caminho of ["/", "/faq", "/leitura/abc", "/auth/callback", "/api/horoscopo", "/home"]) {
    ok(re.test(caminho), `middleware: ${caminho} deve continuar passando pelo middleware`)
  }
}

// ── 8 · guarda de custo do horóscopo ────────────────────────────────────────
async function guarda() {
  let t = 0
  const g = criarGuarda({ esfriamentoMs: 1000, agora: () => t })
  let chamadas = 0
  const boa = async () => ({ leitura: { foco: "x" }, tentativas: 1, n: ++chamadas })
  const falha = async () => ({ leitura: null, tentativas: 3, n: ++chamadas })
  const semGasto = async () => ({ leitura: null, tentativas: 0, n: ++chamadas })

  // pedidos simultâneos iguais compartilham uma geração só
  chamadas = 0
  const lote = await Promise.all([1, 2, 3, 4, 5].map(() => g.executar("a", boa)))
  ok(chamadas === 1, `simultâneos: esperava 1 geração, houve ${chamadas}`)
  ok(lote.every((x) => x.estado === "ok"), "simultâneos: todos devem receber o resultado")

  // chaves diferentes não se misturam
  chamadas = 0
  await Promise.all([g.executar("b1", boa), g.executar("b2", boa)])
  ok(chamadas === 2, "chaves diferentes devem gerar separadamente")

  // geração que tentou e falhou esfria; depois da janela, tenta de novo
  chamadas = 0
  const f1 = await g.executar("c", falha)
  const f2 = await g.executar("c", falha)
  ok(f1.estado === "ok" && f2.estado === "esfriando" && chamadas === 1, "falha paga deve esfriar a chave")
  t = 1001
  const f3 = await g.executar("c", boa)
  ok(f3.estado === "ok" && chamadas === 2, "depois da janela deve tentar de novo")

  // sem tentativa paga (cache fora do ar, sem chave) não esfria
  chamadas = 0
  await g.executar("d", semGasto)
  await g.executar("d", semGasto)
  ok(chamadas === 2, "falha sem gasto não deve esfriar")

  // erro lançado esfria e propaga
  chamadas = 0
  let lancou = false
  try {
    await g.executar("e", async () => {
      chamadas++
      throw new Error("boom")
    })
  } catch {
    lancou = true
  }
  const e2 = await g.executar("e", boa)
  ok(lancou && e2.estado === "esfriando" && chamadas === 1, "erro deve propagar e esfriar a chave")

  // sucesso nunca esfria
  chamadas = 0
  await g.executar("f", boa)
  await g.executar("f", boa)
  ok(chamadas === 2, "leitura boa não esfria (o cache de verdade fica no banco)")
}

guarda().then(() => {
  if (falhas) {
    console.error(`verify-seo: ${falhas} falha(s)`)
    process.exit(1)
  }
  console.log("verify-seo: ok")
})
