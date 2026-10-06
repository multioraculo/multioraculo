/**
 * Monta as glosas do Davison a partir das fatias redigidas.
 *
 *   node --import ./scripts/ts-register.mjs scripts/montar-glosas-davison.ts
 *
 * LÊ     data/fontes/davison/trabalho/{par,ov}-*.json  (rascunhos, fora do repositório)
 *        data/fontes/davison/extrato.json              (o texto do livro, fora do repositório)
 * GRAVA  lib/astro/davison/interaspectos.ts            (paráfrase estruturada, vai ao repositório)
 *        lib/astro/davison/overlays.ts                 (idem)
 *        data/fontes/davison/auditoria.json            (trechos literais e descartes, fora do repositório)
 *
 * O QUE FAZ ALÉM DE JUNTAR. Preenche `fonte` (título, páginas, hash) a partir do
 * extrato, e não a partir do que o redator escreveu: a ligação entre glosa e
 * fonte é do extrator, nunca de quem parafraseou. Copia para a glosa só a
 * CATEGORIA e o MOTIVO de cada descarte, sem o trecho literal, que fica na
 * auditoria interna. E recusa tudo o que não passa nas mesmas travas do
 * verificador, ou seja, nada de problema entra no repositório.
 */
import fs from "fs"
import path from "path"
import {
  camposDeOverlay,
  camposDePar,
  problemasDeAuditoria,
  problemasDeOverlay,
  problemasDePar,
  type Auditoria,
} from "../lib/astro/davison/validar"
import { EDICAO_DAVISON, type FonteRef, type GlosaDeOverlay, type GlosaDePar, type GlosaDeSemelhanca } from "../lib/astro/davison/tipos"
import { camposDeSemelhanca, problemasDeSemelhanca } from "../lib/astro/davison/validar-semelhanca"

const RAIZ = process.cwd()
const TRABALHO = path.join(RAIZ, "data", "fontes", "davison", "trabalho")
const extrato = JSON.parse(fs.readFileSync(path.join(RAIZ, "data", "fontes", "davison", "extrato.json"), "utf8")) as {
  pares: Array<{ id: string; secao: string; pdfPaginaInicio: number; pdfPaginaFim: number; texto: string; hash: string }>
  overlays: Array<{ id: string; secao: string; pdfPaginaInicio: number; pdfPaginaFim: number; texto: string; hash: string }>
  semelhancas: Array<{ id: string; secao: string; pdfPaginaInicio: number; pdfPaginaFim: number; texto: string; hash: string }>
}

type Entrada = { glosa: Record<string, unknown>; auditoria: Auditoria }
const lerFatias = (prefixo: string): Entrada[] =>
  fs
    .readdirSync(TRABALHO)
    .filter((f) => f.startsWith(prefixo) && f.endsWith(".json"))
    .sort()
    .flatMap((f) => JSON.parse(fs.readFileSync(path.join(TRABALHO, f), "utf8")) as Entrada[])

const falhas: string[] = []
const auditoria: Record<string, Auditoria> = {}

function montar<T extends GlosaDePar | GlosaDeOverlay | GlosaDeSemelhanca>(entradas: Entrada[], fontes: typeof extrato.pares, natureza: FonteRef["natureza"], campos: (g: T) => Array<{ ref: string; texto: string }>, problemas: (g: T) => string[]): T[] {
  const saida: T[] = []
  const vistos = new Set<string>()
  for (const e of entradas) {
    const g = e.glosa as unknown as T & { fonte: { ancora?: string } }
    const fonte = fontes.find((x) => x.id === g.id)
    if (!fonte) { falhas.push(`${g.id}: não existe no extrato`); continue }
    if (vistos.has(g.id)) { falhas.push(`${g.id}: repetido`); continue }
    vistos.add(g.id)

    const ancora = String(g.fonte?.ancora ?? "")
    const lista = [...problemas(g), ...problemasDeAuditoria(e.auditoria, campos(g), fonte.texto, ancora)]
    if (lista.length) { falhas.push(`${g.id}: ${lista.join(" | ")}`); continue }

    // a âncora literal vai SÓ para a auditoria local; a glosa carrega apenas a rastreabilidade
    const completa: FonteRef = { livro: "davison-synastry", edicao: EDICAO_DAVISON, natureza, secao: fonte.secao, pdfPaginaInicio: fonte.pdfPaginaInicio, pdfPaginaFim: fonte.pdfPaginaFim, hash: fonte.hash }
    const descartes = e.auditoria.descartes.map((d) => ({ categoria: d.categoria, motivo: d.motivo }))
    saida.push({ ...(g as object), descartes, fonte: completa } as unknown as T)
    auditoria[g.id] = { ancora, ...e.auditoria }
  }
  return saida
}

const pares = montar<GlosaDePar>(lerFatias("par-"), extrato.pares, "interaspecto", camposDePar, problemasDePar)
const overlays = montar<GlosaDeOverlay>(lerFatias("ov-"), extrato.overlays, "overlay", camposDeOverlay, problemasDeOverlay)
const semelhancas = montar<GlosaDeSemelhanca>(lerFatias("sem-"), extrato.semelhancas, "semelhanca", camposDeSemelhanca, problemasDeSemelhanca)

// a ordem do livro, para o diff ser legível
const ordemPares = extrato.pares.map((p) => p.id)
const ordemOverlays = extrato.overlays.map((p) => p.id)
pares.sort((a, b) => ordemPares.indexOf(a.id) - ordemPares.indexOf(b.id))
overlays.sort((a, b) => ordemOverlays.indexOf(a.id) - ordemOverlays.indexOf(b.id))
const ordemSem = extrato.semelhancas.map((p) => p.id)
semelhancas.sort((a, b) => ordemSem.indexOf(a.id) - ordemSem.indexOf(b.id))

const faltamPares = ordemPares.filter((id) => !pares.some((p) => p.id === id))
const faltamOverlays = ordemOverlays.filter((id) => !overlays.some((p) => p.id === id))
if (faltamPares.length) falhas.push(`pares sem glosa: ${faltamPares.join(", ")}`)
if (faltamOverlays.length) falhas.push(`overlays sem glosa: ${faltamOverlays.join(", ")}`)
const faltamSem = ordemSem.filter((id) => !semelhancas.some((p) => p.id === id))
if (faltamSem.length) falhas.push(`semelhanças sem glosa: ${faltamSem.join(", ")}`)

if (falhas.length) {
  console.error(`\nA montagem falhou em ${falhas.length} ponto(s); nada foi gravado:\n`)
  for (const f of falhas.slice(0, 60)) console.error(`  ${f}`)
  process.exit(1)
}

const cabecalho = (nome: string, tipo: string) =>
  [
    "/**",
    " * GERADO por scripts/montar-glosas-davison.ts. Não edite à mão: refaça as fatias e monte de novo.",
    " *",
    " * Paráfrase estruturada do Davison (Synastry, 1977). O trecho literal do livro NÃO está",
    " * aqui: cada glosa guarda página, título e hash do trecho de onde saiu, e o literal vive",
    " * só na auditoria interna, fora do repositório.",
    " */",
    `import type { ${tipo} } from "./tipos"`,
    "",
    `export const ${nome}: ${tipo}[] = `,
  ].join("\n")
fs.writeFileSync(path.join(RAIZ, "lib", "astro", "davison", "interaspectos.ts"), cabecalho("INTERASPECTOS_DAVISON", "GlosaDePar") + JSON.stringify(pares, null, 1) + "\n")
fs.writeFileSync(path.join(RAIZ, "lib", "astro", "davison", "overlays.ts"), cabecalho("OVERLAYS_DAVISON", "GlosaDeOverlay") + JSON.stringify(overlays, null, 1) + "\n")
fs.writeFileSync(path.join(RAIZ, "lib", "astro", "davison", "semelhancas.ts"), cabecalho("SEMELHANCAS_DAVISON", "GlosaDeSemelhanca") + JSON.stringify(semelhancas, null, 1) + "\n")
fs.writeFileSync(
  path.join(RAIZ, "data", "fontes", "davison", "auditoria.json"),
  JSON.stringify({ aviso: "Trechos literais do livro. Material interno de auditoria: nunca vai ao repositório nem à tela.", entradas: auditoria }, null, 1),
)
console.log(`montado: ${pares.length} pares, ${overlays.length} overlays, ${semelhancas.length} semelhanças`)
