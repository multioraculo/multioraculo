/**
 * Integridade do "Estudo do dia" (Imagem do inconsciente).
 *
 * O que este verificador existe para impedir:
 *
 *  1. item ativo sem fonte, ou "forte" sem duas passagens de TEXTO (legenda de
 *     imagem só apoia: não é escrita pelo autor do capítulo);
 *  2. autor, obra, página ou citação vazando para o que a Home mostra
 *     (`nome`, `ancoras`, `leitura`) e o componente voltando a renderizar fonte,
 *     CTA ou aviso do mecanismo;
 *  3. o sorteio perder as propriedades combinadas: mesma ordem para todos,
 *     cada item uma vez por ciclo, nova ordem a cada ciclo, sem repetição
 *     dentro do ciclo nem na emenda entre ciclos, e independência da ordem em
 *     que o array foi escrito;
 *  4. trecho citado que não existe na página declarada do PDF (só roda quando
 *     `data/fontes/o_homem_e_seus_simbolos.pdf` está presente; o arquivo não vai
 *     ao git, então no deploy esta parte é pulada e dita como pulada).
 *
 * Zero IA, zero rede.
 */
import fs from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { SIMBOLOS, PDF_AUDITADO, CICLO_DE_DIAS, estudoDoDia, ordemDoCiclo, origemDoEstudo } from "../lib/oracles/simbolos-inconsciente"
import { LOCALES } from "../lib/i18n/config"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

// ── 1. toda entrada tem fonte, e "forte" é forte ────────────────────────────
const slugs = SIMBOLOS.map((s) => s.slug)
confere("slugs únicos", new Set(slugs).size === slugs.length)
confere("ciclo = número de itens", CICLO_DE_DIAS === SIMBOLOS.length)
for (const s of SIMBOLOS) {
  confere(`${s.slug}: slug em kebab-case`, /^[a-z]+(-[a-z]+)*$/.test(s.slug))
  confere(`${s.slug}: tem fonte`, s.fontes.length >= 1)
  confere(`${s.slug}: fonte principal é texto, não legenda`, origemDoEstudo(s).natureza === "texto")
  const textos = s.fontes.filter((p) => p.natureza === "texto")
  const contextos = new Set(textos.map((p) => `${p.autor}|${p.pagina}`))
  if (s.forca === "forte") confere(`${s.slug}: forte exige ≥2 passagens de texto em contextos distintos`, contextos.size >= 2, `${contextos.size}`)
  for (const p of s.fontes) {
    confere(`${s.slug}: passagem p.${p.pagina} completa`, !!p.autor && !!p.capitulo && !!p.trecho && p.pagina > 0)
  }
  for (const loc of LOCALES) {
    const tx = s.texto[loc]
    confere(`${s.slug}/${loc}: nome, 3 âncoras e leitura`, !!tx?.nome && tx.ancoras.length === 3 && tx.ancoras.every(Boolean) && tx.leitura.length > 40)
  }
}

// ── 2. o que a Home mostra não traz fonte ───────────────────────────────────
const PROIBIDO = /Jung|Henderson|Franz|Jaff[ée]|Jacobi|junguian|jungian|O Homem e seus|Segundo |According to|Seg[uú]n /i
for (const s of SIMBOLOS) {
  for (const loc of LOCALES) {
    const tx = s.texto[loc]
    for (const campo of [tx.nome, tx.ancoras.join(" "), tx.leitura]) {
      confere(`${s.slug}/${loc}: sem autor/obra na Home`, !PROIBIDO.test(campo), campo.slice(0, 60))
    }
  }
}
const componente = fs.readFileSync(path.join(process.cwd(), "components", "imagem-do-inconsciente.tsx"), "utf8")
const codigo = componente.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
confere("componente não renderiza `fontes`/`origemDoEstudo`", !/fontes|origemDoEstudo|\.autor|\.pagina|\.trecho/.test(codigo))
confere("componente não tem CTA nem aviso", !/next\/link|<Link|symbolCta|symbolAsk|symbolNote|symbolEditorial|Aprofundar/.test(codigo))

// ── 3. o sorteio ────────────────────────────────────────────────────────────
const N = SIMBOLOS.length
const ordenados = [...slugs].sort()
const CICLOS = 400
let emendas = 0
let ordensIguais = 0
for (let c = 0; c < CICLOS; c++) {
  const o = ordemDoCiclo(c)
  confere(`ciclo ${c}: é permutação completa`, o.length === N && [...o].sort().join() === ordenados.join())
  if (c > 0) {
    if (o[0] === ordemDoCiclo(c - 1)[N - 1]) emendas++
    if (o.join() === ordemDoCiclo(c - 1).join()) ordensIguais++
  }
}
confere("nenhuma repetição na emenda entre ciclos", emendas === 0, `${emendas} emendas`)
confere("cada ciclo tem ordem nova", ordensIguais === 0, `${ordensIguais} ciclos repetiram a ordem`)

// dias reais: 3 anos corridos a partir de 2026-01-01, e a prova de não-repetição dentro do ciclo
const dias: string[] = []
for (let t = Date.UTC(2026, 0, 1); t < Date.UTC(2029, 0, 1); t += 86_400_000) dias.push(new Date(t).toISOString().slice(0, 10))
const dia0 = Math.floor(Date.UTC(2026, 0, 1) / 86_400_000)
const porCiclo = new Map<number, string[]>()
dias.forEach((d, i) => {
  const ciclo = Math.floor((dia0 + i) / N)
  porCiclo.set(ciclo, [...(porCiclo.get(ciclo) ?? []), estudoDoDia(d).slug])
})
let repetidoNoCiclo = 0
for (const [ciclo, lista] of porCiclo) if (new Set(lista).size !== lista.length) repetidoNoCiclo++
confere("nenhum item repete dentro de um ciclo (3 anos de datas)", repetidoNoCiclo === 0, `${repetidoNoCiclo} ciclos`)
const completos = [...porCiclo.values()].filter((l) => l.length === N)
confere("ciclos completos mostram os N itens exatamente uma vez", completos.length > 0 && completos.every((l) => [...l].sort().join() === ordenados.join()))
let mesmoNoDiaSeguinte = 0
for (let i = 1; i < dias.length; i++) if (estudoDoDia(dias[i]).slug === estudoDoDia(dias[i - 1]).slug) mesmoNoDiaSeguinte++
confere("o mesmo item nunca aparece em dias seguidos", mesmoNoDiaSeguinte === 0, `${mesmoNoDiaSeguinte}`)
confere("determinístico: a mesma data dá o mesmo estudo", estudoDoDia("2026-10-04").slug === estudoDoDia("2026-10-04").slug)
const contagem = new Map<string, number>()
dias.slice(0, 364).forEach((d) => contagem.set(estudoDoDia(d).slug, (contagem.get(estudoDoDia(d).slug) ?? 0) + 1))
const [minAno, maxAno] = [Math.min(...contagem.values()), Math.max(...contagem.values())]
// 364 dias não fecham um número inteiro de ciclos: a diferença vem só do ciclo
// parcial no fim, e nunca passa de 2 (com hash independente chegava a 10..19)
confere("uso anual equilibrado (diferença ≤ 2 entre o mais e o menos visto)", maxAno - minAno <= 2, `${minAno}..${maxAno}`)
confere("data fora do formato não quebra a Home", !!estudoDoDia("não é data").slug)

// independência da ordem em que o array foi escrito
const invertido = [...slugs].reverse()
confere("a ordem sorteada não depende da ordem do array", ordemDoCiclo(7, invertido).join() === ordemDoCiclo(7, slugs).join())

// ── 4. os trechos existem nas páginas declaradas do PDF ─────────────────────
const PDF = path.join(process.cwd(), "data", "fontes", "o_homem_e_seus_simbolos.pdf")
async function conferirPdf(): Promise<boolean> {
  if (!fs.existsSync(PDF)) return false
  const bytes = fs.readFileSync(PDF)
  const sha = createHash("sha256").update(bytes).digest("hex")
  confere("o PDF local é a versão auditada (sha256)", sha === PDF_AUDITADO.sha256, sha)
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(PDF)), useSystemFonts: true }).promise
  const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/[“”‘’"'«»]/g, "").replace(/\s+/g, "")
  const cache = new Map<number, string>()
  const pagina = async (n: number) => {
    if (!cache.has(n)) cache.set(n, norm((await (await doc.getPage(n)).getTextContent()).items.map((i: any) => i.str).join(" ")))
    return cache.get(n) as string
  }
  for (const s of SIMBOLOS) {
    for (const p of s.fontes) {
      confere(`${s.slug}: trecho achado na p.${p.pagina}`, (await pagina(p.pagina)).includes(norm(p.trecho)), p.trecho.slice(0, 70))
    }
  }
  return true
}

conferirPdf().then((pdfVerificado) => {
if (falhas.length) {
  console.error(`verify:simbolos — ${falhas.length} falha(s) em ${conferidos} conferências:`)
  for (const f of falhas) console.error("  ✗ " + f)
  process.exit(1)
}
console.log(
  `verify:simbolos — ${conferidos} conferências ok. ${N} estudos (${SIMBOLOS.filter((s) => s.forca === "forte").length} fortes, ` +
    `${SIMBOLOS.filter((s) => s.forca === "utilizavel").length} utilizáveis), ciclo de ${N} dias. ` +
    (pdfVerificado ? "Trechos conferidos contra o PDF." : "PDF ausente: conferência dos trechos PULADA."),
)
})
