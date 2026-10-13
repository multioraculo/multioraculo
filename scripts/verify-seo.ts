/**
 * Verificador de SEO (fases 1 e 2). Roda no prebuild.
 *
 * Confere, sem rede e sem gastar nada:
 *  - cada rota privada carrega o noindex, e nenhuma pública o carrega;
 *  - as 21 URLs públicas (7 páginas x PT/EN/ES): tabela sem colisão, canonical
 *    autorreferente, hreflang recíproco (pt-BR, en, es, x-default) só para
 *    URLs que existem, sitemap com exatamente elas e suas alternativas;
 *  - a URL manda no idioma: nada de redirect, Accept-Language ou cookie nas
 *    rotas públicas, e cabeçalhos internos blindados contra forja;
 *  - seletor de idioma: a página equivalente de cada URL, e as pessoais ficam
 *    onde estão;
 *  - title/description nos três idiomas, dentro dos limites;
 *  - JSON-LD sem propriedade inventada;
 *  - a guarda de custo do horóscopo (compartilha pedido, esfria falha);
 *  - o middleware não toca em robots/sitemap/manifest/imagem OG.
 *
 * O que exige servidor no ar (status e idioma do HTML de verdade, 404 das URLs
 * inválidas) está em scripts/smoke-seo-i18n.ts.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { dictionaries } from "../lib/i18n/dictionaries"
import { LOCALES, LOCALE_META } from "../lib/i18n/config"
import { ARQUIVOS_NOINDEX, PAGINAS_INDEXAVEIS } from "../lib/seo/paginas"
import { alternativasDeIdioma, paginaPrivada, paginaPublica } from "../lib/seo/metadata"
import { organizationLd, serializarLd, websiteLd } from "../lib/seo/json-ld"
import { urlAbsoluta } from "../lib/seo/site"
import {
  HEADER_LOCALE,
  HEADER_LOCALE_URL,
  ROTAS_PUBLICAS,
  caminhoEquivalente,
  localeDaUrl,
  localeDaUrlDepoisDeMontar,
  localeEfetivo,
  localizarCaminho,
  rotaDoCaminho,
  temPrefixoDeIdioma,
} from "../lib/i18n/rotas"
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
/** Código sem comentários: os comentários citam Accept-Language justamente para explicar que ele NÃO é usado. */
const semComentarios = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
const existe = (rel: string) => existsSync(resolve(process.cwd(), rel))

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
// bloquear página com noindex impede o rastreador de ler o noindex; bloquear /en ou /es esconderia as versões
for (const caminho of ["/home", "/diario", "/marcos", "/sonhos-salvos", "/leituras-salvas", "/leitura", "/admin", "/auth", "/en", "/es"]) {
  ok(!bloqueios.some((b) => b === caminho || b === `${caminho}/`), `robots: não bloqueie ${caminho}`)
}
ok(r.sitemap === urlAbsoluta("/sitemap.xml"), "robots: sitemap ausente ou fora do domínio")

// ── 3 · sitemap: 21 URLs, cada uma com as 4 alternativas ────────────────────
const s21 = sitemap()
const esperadas21 = ROTAS_PUBLICAS.flatMap((rota) => LOCALES.map((l) => urlAbsoluta(rota[l])))
ok(JSON.stringify(s21.map((e) => e.url).sort()) === JSON.stringify([...esperadas21].sort()), "sitemap deve listar exatamente as 21 URLs públicas")
ok(s21.length === 21 && new Set(s21.map((e) => e.url)).size === 21, "sitemap: 21 URLs distintas")
for (const e of s21) {
  const rota = rotaDoCaminho(new URL(e.url).pathname)
  ok(Boolean(rota), `sitemap: ${e.url} não é uma rota pública conhecida`)
  if (!rota) continue
  const langs = (e.alternates as { languages?: Record<string, string> } | undefined)?.languages
  ok(JSON.stringify(langs) === JSON.stringify(alternativasDeIdioma(rota.chave)), `sitemap: alternativas de ${e.url} incorretas`)
  ok(!("lastModified" in e), `sitemap: ${e.url} não pode ter lastmod inventado`)
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
// um mesmo texto não pode servir a dois idiomas (título e descrição traduzidos de verdade)
for (const p of PAGINAS_INDEXAVEIS) {
  const ts = LOCALES.map((l) => dictionaries[l].seo[p.chave].title)
  const ds = LOCALES.map((l) => dictionaries[l].seo[p.chave].description)
  ok(new Set(ts).size === 3, `seo.${p.chave}: title igual em dois idiomas`)
  ok(new Set(ds).size === 3, `seo.${p.chave}: description igual em dois idiomas`)
}
for (const arq of ["app/faq/page.tsx", "app/oraculos/page.tsx"]) {
  ok(/<h1[\s>]/.test(ler(arq)), `${arq}: sem <h1>`)
}

// ── 5 · canonical, hreflang e Open Graph por idioma ─────────────────────────
for (const rota of ROTAS_PUBLICAS) {
  const conjuntos: string[] = []
  for (const l of LOCALES) {
    const m = paginaPublica({ chave: rota.chave, titulo: "T", descricao: "d", locale: l, absoluto: rota.chave === "home" })
    const alt = m.alternates as { canonical?: string; languages?: Record<string, string> }
    ok(alt.canonical === rota[l], `canonical de ${rota.chave}/${l} deve ser o próprio caminho (${alt.canonical})`)
    ok(!/[?#]/.test(alt.canonical ?? ""), "canonical sem parâmetros")
    const langs = alt.languages ?? {}
    ok(Object.keys(langs).join() === "pt-BR,en,es,x-default", `hreflang de ${rota.chave}/${l}: chaves ${Object.keys(langs).join()}`)
    ok(langs["pt-BR"] === urlAbsoluta(rota.pt) && langs.en === urlAbsoluta(rota.en) && langs.es === urlAbsoluta(rota.es), "hreflang aponta para o endereço errado")
    ok(langs["x-default"] === urlAbsoluta(rota.pt), "x-default deve ser a versão em português")
    for (const url of Object.values(langs)) ok(Boolean(rotaDoCaminho(new URL(url).pathname)), `hreflang para URL inexistente: ${url}`)
    conjuntos.push(JSON.stringify(langs))
    const og = m.openGraph as { url?: string; locale?: string; alternateLocale?: string[]; images?: { url: string }[] }
    ok(og?.url === urlAbsoluta(rota[l]), `og:url de ${rota.chave}/${l}`)
    ok(og?.locale === LOCALE_META[l].tag.replace("-", "_"), `og:locale de ${rota.chave}/${l}: ${og?.locale}`)
    ok(og?.alternateLocale?.length === 2 && !og.alternateLocale.includes(og.locale ?? ""), "og:locale:alternate deve listar os outros dois idiomas")
    ok(og?.images?.[0]?.url === urlAbsoluta("/opengraph-image"), "og:image deve ser a imagem do site")
  }
  // reciprocidade: as três versões declaram exatamente o mesmo conjunto
  ok(new Set(conjuntos).size === 1, `hreflang de ${rota.chave} não é recíproco entre os idiomas`)
}
const home = paginaPublica({ chave: "home", titulo: "Home", descricao: "d", locale: "en", absoluto: true })
ok(JSON.stringify(home.title) === JSON.stringify({ absolute: "Home" }), "título absoluto da Home")

// ── 5b · tabela de rotas: sem colisão, sem duplicata, tudo existe ───────────
const todos = ROTAS_PUBLICAS.flatMap((rota) => LOCALES.map((l) => rota[l]))
ok(todos.length === 21 && new Set(todos).size === 21, "as 21 URLs devem ser distintas")
ok(ROTAS_PUBLICAS.every((rota) => rota.pt === "/" || !temPrefixoDeIdioma(rota.pt)), "português não pode ter prefixo")
ok(ROTAS_PUBLICAS.every((rota) => rota.en === "/en" || rota.en.startsWith("/en/")), "inglês deve ter o prefixo /en")
ok(ROTAS_PUBLICAS.every((rota) => rota.es === "/es" || rota.es.startsWith("/es/")), "espanhol deve ter o prefixo /es")
// colisão com o App Router: nenhuma pasta app/en ou app/es, e cada página-base existe
ok(!existe("app/en") && !existe("app/es"), "colisão: existe app/en ou app/es")
for (const rota of ROTAS_PUBLICAS) {
  const arq = rota.pt === "/" ? "app/page.tsx" : `app${rota.pt}/page.tsx`
  ok(existe(arq), `página-base de ${rota.chave} não existe: ${arq}`)
}
const pastasDeApp = readdirSync(resolve(process.cwd(), "app"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
ok(!pastasDeApp.includes("en") && !pastasDeApp.includes("es"), "pasta de rota colide com prefixo de idioma")
// resolução e equivalência (o que o seletor de idioma usa)
for (const rota of ROTAS_PUBLICAS) {
  for (const l of LOCALES) {
    const achada = rotaDoCaminho(rota[l])
    ok(achada?.chave === rota.chave && achada.locale === l, `rotaDoCaminho(${rota[l]})`)
    ok(rota[l] === "/" || rotaDoCaminho(rota[l] + "/")?.chave === rota.chave, `barra final em ${rota[l]}`)
    ok(localeDaUrl(rota[l]) === l, `localeDaUrl(${rota[l]})`)
    for (const alvo of LOCALES) {
      ok(caminhoEquivalente(rota[l], alvo) === rota[alvo], `seletor: ${rota[l]} para ${alvo} deveria ser ${rota[alvo]}`)
      ok(localizarCaminho(rota.pt, alvo) === rota[alvo], `localizarCaminho(${rota.pt}, ${alvo})`)
    }
  }
}
ok(localizarCaminho("/assinatura?checkout=ok#x", "en") === "/en/subscription?checkout=ok#x", "localizarCaminho preserva query e hash")
for (const privado of ["/home", "/diario", "/leitura/abc", "/leituras-salvas/1", "/admin", "/auth/callback", "/api/horoscopo", "/sonhos-salvos"]) {
  ok(localizarCaminho(privado, "en") === privado, `localizarCaminho não pode mexer em ${privado}`)
  ok(caminhoEquivalente(privado, "en") === null, `${privado} não tem equivalente por idioma (segue o cookie)`)
  ok(localeDaUrl(privado) === null, `${privado}: o idioma não vem da URL`)
}
// inexistentes: nada de rota "parecida"
for (const x of ["/en/oraculos", "/es/oracles", "/es/faq", "/en/home", "/en/en", "/pt", "/pt/oraculos", "/fr", "/EN", "/en/oracles/x", "/oracles", "/en/Oracles"]) {
  ok(rotaDoCaminho(x) === null, `${x} não pode ser rota pública`)
}
ok(temPrefixoDeIdioma("/en") && temPrefixoDeIdioma("/es/foo") && !temPrefixoDeIdioma("/entrada") && !temPrefixoDeIdioma("/espaco"), "temPrefixoDeIdioma deve casar segmento inteiro")

// ── 5c · a URL manda: sem redirect, sem Accept-Language, cabeçalhos blindados ─
const mwSrc = ler("middleware.ts")
const sessaoSrc = ler("lib/supabase/middleware.ts")
const srvSrc = ler("lib/i18n/server.ts")
ok(!/NextResponse\.redirect|redirect\(/.test(mwSrc), "middleware não pode redirecionar por idioma")
ok(!/NextResponse\.redirect/.test(sessaoSrc), "updateSession não pode redirecionar")
ok(!/accept-language/i.test(semComentarios(mwSrc + sessaoSrc + srvSrc)), "Accept-Language não pode decidir idioma")
ok(srvSrc.includes("HEADER_LOCALE_URL") && srvSrc.includes("HEADER_LOCALE"), "getLocale deve ler o idioma da URL pelo cabeçalho interno")
// toda chamada de updateSession define (ou esvazia) os cabeçalhos de idioma: o cliente não os forja
const chamadas = mwSrc.match(/updateSession\(request/g) ?? []
const comCabecalhos = mwSrc.match(/\[HEADER_LOCALE\]:/g) ?? []
ok(chamadas.length === 3 && comCabecalhos.length === 3, `toda chamada de updateSession deve definir os cabeçalhos de idioma (${chamadas.length} chamadas, ${comCabecalhos.length} definições)`)
ok(HEADER_LOCALE === "x-locale" && HEADER_LOCALE_URL === "x-locale-url", "nomes dos cabeçalhos internos")

// ── 5d · seletor e provider usam a tabela de rotas ──────────────────────────
const provSrc = ler("components/i18n-provider.tsx")
ok(provSrc.includes("caminhoEquivalente") && provSrc.includes("localeDaUrl") && provSrc.includes("usePathname"), "provider: o idioma deve derivar da URL e o seletor ir à página equivalente")
ok(/!localeDaUrl\(window\.location\.pathname\)/.test(provSrc), "provider: restauração de preferência não pode sobrepor a URL pública")
// REGRESSÃO (produção, Netlify): no SSR o pathname que o React vê pode ser o da reescrita interna
// (/sonhos em vez de /en/dreams). Antes de montar, o idioma é o que o servidor decidiu (initialLocale).
for (const rota of ROTAS_PUBLICAS) {
  for (const l of ["en", "es"] as const) {
    ok(localeEfetivo(l, rota.pt, false) === l, `antes de montar, pathname interno ${rota.pt} não pode sobrescrever initialLocale ${l}`)
    ok(localeEfetivo(l, rota[l], false) === l, `antes de montar, ${rota[l]} mantém initialLocale ${l}`)
    ok(localeDaUrlDepoisDeMontar(rota.pt, false) === null, "antes de montar a URL não decide o idioma")
    // depois de montar, a navegação suave acompanha a URL do navegador
    ok(localeEfetivo("pt", rota[l], true) === l, `depois de montar, ${rota[l]} deve valer ${l}`)
  }
  ok(localeEfetivo("en", rota.pt, true) === "pt", `depois de montar, ${rota.pt} deve valer pt`)
}
ok(localeEfetivo("es", "/home", true) === "es" && localeEfetivo("en", "/leitura/abc", true) === "en", "páginas pessoais seguem o idioma escolhido")
ok(localeEfetivo("en", null, true) === "en" && localeEfetivo("es", undefined, true) === "es", "pathname ausente não pode quebrar")
ok(localeEfetivo("en", "/es/faq", true) === "en", "URL inexistente não decide idioma")
ok(/useState\(false\)/.test(provSrc) && /localeEfetivo\(escolhido, pathname, montado\)/.test(provSrc), "provider deve calcular o idioma com localeEfetivo e só depois de montar")
ok(!/localeDaUrl\(pathname\)/.test(provSrc), "provider não pode usar o pathname cru no primeiro render")
ok(!/from "next\/link"/.test(ler("components/header.tsx")) && !/from "next\/link"/.test(ler("components/bottom-nav.tsx")), "navegação principal deve usar o Link localizado")

// ── 6 · JSON-LD ─────────────────────────────────────────────────────────────
const proibidas = ["aggregateRating", "review", "author", "offers", "price", "sameAs", "potentialAction", "contactPoint"]
for (const loc of LOCALES) {
  for (const ld of [organizationLd(), websiteLd(dictionaries[loc].seo.home.description)]) {
    const texto = JSON.stringify(ld)
    for (const chave of proibidas) ok(!texto.includes(`"${chave}"`), `JSON-LD ${ld["@type"]}: propriedade "${chave}" não pode ser inventada`)
    ok(ld["@context"] === "https://schema.org", "JSON-LD: @context")
    ok(/^https:\/\//.test(ld.url), `JSON-LD ${ld["@type"]}: url não absoluta`)
  }
  ok(websiteLd(dictionaries[loc].seo.home.description).description === dictionaries[loc].seo.home.description, `JSON-LD WebSite: description deve estar em ${loc}`)
}
ok(/^https:\/\/.+\.png$/.test(organizationLd().logo), "Organization.logo deve ser URL absoluta de imagem")
ok(!serializarLd({ x: "</script><script>alert(1)" }).includes("<"), "serializarLd deve escapar <")

// ── 7 · middleware não toca em arquivos de metadata, e vê as URLs por idioma ─
const bruto = mwSrc.match(/"(\/\(\(\?!.*?\)\.\*\))"/)
ok(Boolean(bruto), "middleware: matcher não encontrado")
if (bruto) {
  const re = new RegExp(`^${JSON.parse(`"${bruto[1]}"`)}$`)
  for (const caminho of ["/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/opengraph-image", "/favicon.ico"]) {
    ok(!re.test(caminho), `middleware: ${caminho} não deve passar pelo getUser()`)
  }
  for (const caminho of ["/", "/faq", "/leitura/abc", "/auth/callback", "/api/horoscopo", "/home", ...todos, "/en/foo", "/es/qualquer"]) {
    ok(re.test(caminho), `middleware: ${caminho} deve passar pelo middleware (idioma e sessão)`)
  }
}

// ── 8 · guarda de custo do horóscopo ────────────────────────────────────────
async function guarda() {
  let t = 0
  const g = criarGuarda({ esfriamentoMs: 1000, agora: () => t })
  let chamadasGuarda = 0
  const boa = async () => ({ leitura: { foco: "x" }, tentativas: 1, n: ++chamadasGuarda })
  const falha = async () => ({ leitura: null, tentativas: 3, n: ++chamadasGuarda })
  const semGasto = async () => ({ leitura: null, tentativas: 0, n: ++chamadasGuarda })

  // pedidos simultâneos iguais compartilham uma geração só
  chamadasGuarda = 0
  const lote = await Promise.all([1, 2, 3, 4, 5].map(() => g.executar("a", boa)))
  ok(chamadasGuarda === 1, `simultâneos: esperava 1 geração, houve ${chamadasGuarda}`)
  ok(lote.every((x) => x.estado === "ok"), "simultâneos: todos devem receber o resultado")

  // chaves diferentes não se misturam
  chamadasGuarda = 0
  await Promise.all([g.executar("b1", boa), g.executar("b2", boa)])
  ok(chamadasGuarda === 2, "chaves diferentes devem gerar separadamente")

  // geração que tentou e falhou esfria; depois da janela, tenta de novo
  chamadasGuarda = 0
  const f1 = await g.executar("c", falha)
  const f2 = await g.executar("c", falha)
  ok(f1.estado === "ok" && f2.estado === "esfriando" && chamadasGuarda === 1, "falha paga deve esfriar a chave")
  t = 1001
  const f3 = await g.executar("c", boa)
  ok(f3.estado === "ok" && chamadasGuarda === 2, "depois da janela deve tentar de novo")

  // sem tentativa paga (cache fora do ar, sem chave) não esfria
  chamadasGuarda = 0
  await g.executar("d", semGasto)
  await g.executar("d", semGasto)
  ok(chamadasGuarda === 2, "falha sem gasto não deve esfriar")

  // erro lançado esfria e propaga
  chamadasGuarda = 0
  let lancou = false
  try {
    await g.executar("e", async () => {
      chamadasGuarda++
      throw new Error("boom")
    })
  } catch {
    lancou = true
  }
  const e2 = await g.executar("e", boa)
  ok(lancou && e2.estado === "esfriando" && chamadasGuarda === 1, "erro deve propagar e esfriar a chave")

  // sucesso nunca esfria
  chamadasGuarda = 0
  await g.executar("f", boa)
  await g.executar("f", boa)
  ok(chamadasGuarda === 2, "leitura boa não esfria (o cache de verdade fica no banco)")
}

guarda().then(() => {
  if (falhas) {
    console.error(`verify-seo: ${falhas} falha(s)`)
    process.exit(1)
  }
  console.log("verify-seo: ok")
})
