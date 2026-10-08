/**
 * Smoke HTTP do SEO internacional. Bate num servidor de verdade (local ou
 * produção) e confere o que o rastreador receberia em cada uma das 21 URLs.
 *
 *   BASE=http://localhost:3112 npm run smoke:seo-i18n
 *   BASE=https://multioraculo.com npm run smoke:seo-i18n      (só com autorização)
 *
 * Só faz GET de páginas públicas e de URLs inexistentes. Não loga, não gera
 * leitura, não chama OpenAI. Fica FORA do prebuild porque exige servidor no ar.
 *
 * O que as URLs "devem ser" vem de lib/i18n/rotas.ts e dos dicionários, a
 * mesma fonte do código: se alguém mexer num lado só, o smoke acusa.
 */
import { dictionaries } from "../lib/i18n/dictionaries"
import { LOCALES, type Locale } from "../lib/i18n/config"
import { ROTAS_PUBLICAS } from "../lib/i18n/rotas"
import { alternativasDeIdioma } from "../lib/seo/metadata"
import { urlAbsoluta } from "../lib/seo/site"

const BASE = (process.env.BASE ?? "http://localhost:3112").replace(/\/+$/, "")
let falhas = 0
let avisos = 0
function ok(cond: boolean, msg: string) {
  if (!cond) {
    falhas++
    console.error(`FALHOU: ${msg}`)
  }
}

type Resp = { status: number; location: string | null; html: string; setCookie: string }

async function pegar(caminho: string, cabecalhos: Record<string, string> = {}): Promise<Resp> {
  for (let tentativa = 0; ; tentativa++) {
    try {
      // redirect: "manual", porque QUALQUER redirect nestas URLs já é falha
      const r = await fetch(`${BASE}${caminho}`, { redirect: "manual", headers: { "user-agent": "Googlebot/2.1", ...cabecalhos } })
      return { status: r.status, location: r.headers.get("location"), html: await r.text(), setCookie: r.headers.get("set-cookie") ?? "" }
    } catch (e) {
      if (tentativa >= 3) throw e
      await new Promise((res) => setTimeout(res, 1500))
    }
  }
}

const pri = (re: RegExp, s: string) => s.match(re)?.[1]
const decodificar = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
const caminhoDe = (url: string) => new URL(url).pathname
const texto = (html: string) =>
  decodificar(html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ")

/** O que o servidor entregou no HTML inicial, sem JavaScript. */
function inspecionar(html: string) {
  const alternates: Record<string, string> = {}
  for (const m of html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/gi)) alternates[m[1]] = m[2]
  return {
    lang: pri(/<html[^>]*\slang="([^"]+)"/, html),
    title: decodificar(pri(/<title>([^<]*)<\/title>/, html) ?? ""),
    description: decodificar(pri(/<meta name="description" content="([^"]*)"/, html) ?? ""),
    canonical: pri(/<link rel="canonical" href="([^"]+)"/, html),
    robots: pri(/<meta name="robots" content="([^"]+)"/, html) ?? null,
    h1: [...html.matchAll(/<h1[\s>]/g)].length,
    ogLocale: pri(/<meta property="og:locale" content="([^"]+)"/, html),
    ogUrl: pri(/<meta property="og:url" content="([^"]+)"/, html),
    ogTitle: decodificar(pri(/<meta property="og:title" content="([^"]*)"/, html) ?? ""),
    twTitle: decodificar(pri(/<meta name="twitter:title" content="([^"]*)"/, html) ?? ""),
    alternates,
  }
}

const OG_LOCALE: Record<Locale, string> = { pt: "pt_BR", en: "en_US", es: "es_ES" }
/** Marcas que só existem em português: se aparecerem numa página EN/ES, o texto vazou sem tradução. */
const SO_PORTUGUES = /\b(você|vocês|não|também|então|sua|seu|suas|seus)\b|ção\b|ções\b/i

async function main() {
  console.log(`smoke-seo-i18n em ${BASE}`)

  // ── 1 a 3 · as 21 URLs ────────────────────────────────────────────────────
  const mapas = new Map<string, Record<string, string>>()
  const h1Pt = new Map<string, string>()
  for (const rota of ROTAS_PUBLICAS) {
    for (const locale of LOCALES) {
      const caminho = rota[locale]
      const r = await pegar(caminho)
      const rotulo = `${locale} ${caminho}`
      ok(r.status === 200, `${rotulo}: status ${r.status} (esperado 200, sem redirect${r.location ? `; foi para ${r.location}` : ""})`)
      if (r.status !== 200) continue
      const i = inspecionar(r.html)
      const seo = dictionaries[locale].seo[rota.chave]
      const tituloEsperado = rota.chave === "home" ? seo.title : `${seo.title} | Multioráculo`

      ok(i.lang === locale, `${rotulo}: <html lang="${i.lang}"> (esperado ${locale})`)
      ok(i.title === tituloEsperado, `${rotulo}: title "${i.title}" (esperado "${tituloEsperado}")`)
      ok(i.description === seo.description, `${rotulo}: description diferente da esperada`)
      ok(i.canonical === urlAbsoluta(caminho), `${rotulo}: canonical ${i.canonical} (esperado ${urlAbsoluta(caminho)})`)
      ok(!i.robots || !/noindex/i.test(i.robots), `${rotulo}: página pública com robots "${i.robots}"`)
      ok(i.h1 === 1, `${rotulo}: ${i.h1} <h1> (esperado exatamente 1)`)
      ok(i.ogLocale === OG_LOCALE[locale], `${rotulo}: og:locale ${i.ogLocale}`)
      ok(i.ogUrl === urlAbsoluta(caminho), `${rotulo}: og:url ${i.ogUrl}`)
      ok(i.ogTitle === tituloEsperado && i.twTitle === tituloEsperado, `${rotulo}: og:title/twitter:title incoerentes com o title`)

      // hreflang: as 4 entradas, iguais às esperadas, todas apontando para uma das 21
      const esperadas = alternativasDeIdioma(rota.chave)
      ok(JSON.stringify(i.alternates) === JSON.stringify(esperadas), `${rotulo}: hreflang ${JSON.stringify(i.alternates)} (esperado ${JSON.stringify(esperadas)})`)
      mapas.set(caminho, i.alternates)

      // o texto visível está no idioma da URL, no HTML inicial (sem hidratação)
      const visivel = texto(r.html)
      if (locale !== "pt") {
        const vazou = visivel.match(new RegExp(SO_PORTUGUES.source, "gi")) ?? []
        if (vazou.length) {
          avisos++
          console.warn(`AVISO ${rotulo}: ${vazou.length} palavra(s) só do português no HTML inicial: ${[...new Set(vazou)].slice(0, 8).join(", ")}`)
        }
      }
      const h1 = pri(/<h1[^>]*>([\s\S]*?)<\/h1>/, r.html)?.replace(/<[^>]+>/g, "").trim() ?? ""
      const d = dictionaries[locale]
      const h1Esperado: Partial<Record<typeof rota.chave, string>> = {
        oraculos: d.oraclesPage.title,
        faq: d.faq.title,
        sonhos: d.dreams.title,
        horoscopo: d.horoscope.title,
      }
      const esperado = h1Esperado[rota.chave]
      if (esperado !== undefined) ok(h1 === esperado, `${rotulo}: H1 "${h1}" (esperado "${esperado}")`)
      else if (locale === "pt") h1Pt.set(rota.chave, h1)
      else ok(h1 !== h1Pt.get(rota.chave), `${rotulo}: H1 "${h1}" igual ao do português (não traduzido)`)
    }
  }

  // reciprocidade: toda URL citada num hreflang existe, e a página citada cita as mesmas quatro
  const urlsExistentes = new Set(ROTAS_PUBLICAS.flatMap((r) => LOCALES.map((l) => urlAbsoluta(r[l]))))
  for (const [caminho, alts] of mapas) {
    for (const [codigo, alvo] of Object.entries(alts)) {
      ok(urlsExistentes.has(alvo), `hreflang ${codigo} de ${caminho} aponta para URL que não existe: ${alvo}`)
      const volta = mapas.get(caminhoDe(alvo))
      ok(JSON.stringify(volta) === JSON.stringify(alts), `hreflang não recíproco: ${caminho} → ${alvo}`)
    }
  }

  // ── 6 · a URL manda: cookie e Accept-Language não trocam o idioma, nem redirecionam ──
  for (const rota of ROTAS_PUBLICAS) {
    for (const [dono, outro] of [["pt", "en"], ["en", "es"], ["es", "pt"]] as [Locale, Locale][]) {
      const r = await pegar(rota[dono], { cookie: `locale=${outro}`, "accept-language": `${outro}-XX,${outro};q=0.9` })
      ok(r.status === 200 && !r.location, `${rota[dono]} com cookie/Accept-Language ${outro}: status ${r.status}`)
      ok(inspecionar(r.html).lang === dono, `${rota[dono]} com cookie/Accept-Language ${outro}: idioma trocou para ${inspecionar(r.html).lang}`)
    }
  }
  // a visita a uma URL pública faz o cookie acompanhar a URL (preferência preservada)
  const en = await pegar(ROTAS_PUBLICAS[1].en, { cookie: "locale=pt" })
  ok(/locale=en/.test(en.setCookie), "visitar /en/oracles com cookie pt deveria gravar locale=en")

  // ── URLs inválidas e idiomas inexistentes: 404, nunca página duplicada ─────
  const invalidas = [
    "/en/foo", "/es/foo", "/en/oraculos", "/es/oracles", "/es/faq", "/en/preguntas-frecuentes", "/en/home", "/es/diario",
    "/en/leitura/abc", "/en/api/horoscopo", "/oracles", "/dreams", "/pt", "/pt/oraculos", "/fr", "/fr/faq", "/en/en", "/en/EN/faq", "/EN/faq", "/ES",
  ]
  for (const c of invalidas) {
    const r = await pegar(c)
    ok(r.status === 404, `${c}: status ${r.status} (esperado 404)`)
    ok(/noindex/i.test(inspecionar(r.html).robots ?? ""), `${c}: 404 sem noindex`)
  }
  // barra final: o Next normaliza (308) para a MESMA URL do mesmo idioma, nunca para outro idioma
  const barra = await pegar("/en/oracles/")
  ok(barra.status === 308 && !!barra.location && new URL(barra.location, BASE).pathname === "/en/oracles", `/en/oracles/: ${barra.status} → ${barra.location}`)

  // ── 5 · privadas mantêm noindex, em qualquer idioma do cookie ──────────────
  for (const loc of LOCALES) {
    for (const c of ["/home", "/diario", "/marcos", "/sonhos-salvos"]) {
      const r = await pegar(c, { cookie: `locale=${loc}` })
      ok(r.status === 200 && /noindex, follow/.test(inspecionar(r.html).robots ?? ""), `${c} (cookie ${loc}): noindex, follow ausente (status ${r.status})`)
      ok(inspecionar(r.html).lang === loc, `${c} (cookie ${loc}): página pessoal deve seguir o cookie, veio ${inspecionar(r.html).lang}`)
    }
  }
  const cb = await fetch(`${BASE}/auth/callback`, { redirect: "manual" })
  ok(/noindex, follow/.test(cb.headers.get("x-robots-tag") ?? ""), "/auth/callback sem X-Robots-Tag noindex, follow")

  // ── 4 · sitemap: exatamente as 21 URLs, com as alternativas ────────────────
  const sm = await pegar("/sitemap.xml")
  ok(sm.status === 200, `/sitemap.xml: status ${sm.status}`)
  const blocos = [...sm.html.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1])
  const locs = blocos.map((b) => pri(/<loc>([^<]+)<\/loc>/, b)!)
  ok(blocos.length === 21, `sitemap: ${blocos.length} URLs (esperado 21)`)
  ok(JSON.stringify([...locs].sort()) === JSON.stringify([...urlsExistentes].sort()), "sitemap: lista de URLs diferente das 21 previstas")
  ok(!/<lastmod>/.test(sm.html), "sitemap: não deve ter lastmod inventado")
  for (const b of blocos) {
    const loc = pri(/<loc>([^<]+)<\/loc>/, b)!
    const alts: Record<string, string> = {}
    for (const m of b.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)) alts[m[1]] = m[2]
    ok(JSON.stringify(alts) === JSON.stringify(mapas.get(caminhoDe(loc))), `sitemap: alternativas de ${loc} diferentes das do <head>`)
  }
  ok(!/\/(api|admin|auth|leitura|leituras-salvas|diario|marcos|sonhos-salvos|home)(\/|<)/.test(sm.html), "sitemap: rota privada presente")
  const rb = await pegar("/robots.txt")
  ok(/Disallow: \/api\//.test(rb.html) && !/Disallow: \/(home|en|es)\b/.test(rb.html), "robots.txt alterado de forma indevida")

  console.log(`\n${falhas ? `${falhas} falha(s)` : "tudo certo"}${avisos ? `, ${avisos} aviso(s) de texto` : ""}`)
  if (falhas) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
