/**
 * Bateria de sinastria, controle de vínculo (parte FACTUAL): prova por hash que
 * o cálculo, a seleção e o ranking do par de controle são idênticos nos cinco
 * vínculos, e mostra o que a aplicabilidade fez com cada frase. Não interpreta
 * a narrativa: isso fica para depois da avaliação humana.
 *
 *   node --import ./scripts/ts-register.mjs scripts/bateria-sinastria-controle.ts
 */
import crypto from "crypto"
import fs from "fs"
import path from "path"
import { mapaNatal } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { selecionarEvidencia } from "../lib/astro/selecao-sinastria"
import { montarPayload } from "../lib/astro/payload-sinastria"
import { aplicabilidadeDaFrase, REVISAO_DE_APLICABILIDADE } from "../lib/astro/davison/aplicabilidade"
import { VINCULOS } from "../lib/astro/sinastria-servico"
import { dados } from "./simular-selecao-sinastria"

const RAIZ = path.resolve("data/bateria-sinastria")
const sha = (x: unknown) => crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex").slice(0, 16)
const chave: Record<string, { rot: string; a: number; b: number; horaA: boolean; horaB: boolean; vinculo: string; grupo: string; hashDaSelecao: string }> = JSON.parse(fs.readFileSync(path.join(RAIZ, "chave.json"), "utf8"))
const controle = Object.entries(chave).filter(([, v]) => v.grupo === "controle")
const base = controle[0][1]

const resultado = sinastria(mapaNatal(dados(base.a, base.horaA)), mapaNatal(dados(base.b, base.horaB)))
const selecao = selecionarEvidencia(resultado)
const L: string[] = []
L.push("# Controle de vínculo: o mesmo par nos cinco vínculos (comparação factual)\n")
L.push("Nenhuma interpretação da narrativa aqui; ela só vem depois da avaliação humana.\n")

// 1 · hashes
L.push("## 1. O que é idêntico, provado por hash\n")
L.push("| Vínculo | id | hash do cálculo | hash da seleção (gravado na geração) | hash da seleção (recalculado agora) | hash das dinâmicas e ordem |")
L.push("|---|---|---|---|---|---|")
const hashesSel = new Set<string>()
const hashesOrdem = new Set<string>()
for (const [id, v] of controle) {
  const r = sinastria(mapaNatal(dados(v.a, v.horaA)), mapaNatal(dados(v.b, v.horaB)))
  const s = selecionarEvidencia(r)
  const gravado = v.hashDaSelecao.slice(0, 16)
  const agora = crypto.createHash("sha256").update(JSON.stringify(s)).digest("hex").slice(0, 16)
  const ordem = sha([...s.aspectos, ...s.overlays].map((d) => [d.id, d.principal.id, d.reforcos.map((f) => f.id), d.evidencia.itens.map((i) => `${i.ref}:${i.texto}`)]))
  hashesSel.add(agora); hashesOrdem.add(ordem)
  L.push(`| ${v.vinculo} | ${id} | ${sha(r)} | ${gravado} | ${agora} | ${ordem} |`)
}
const iguais = new Set(controle.map(([, v]) => v.hashDaSelecao)).size === 1 && hashesSel.size === 1 && hashesOrdem.size === 1
L.push(`\n**Resultado: ${iguais ? "IDÊNTICOS nos cinco" : "DIFERENTES (investigar)"}**: um único hash de cálculo, um único hash de seleção (o gravado na hora da geração é o recalculado agora) e uma única ordem de dinâmicas, fatos e frases.\n`)

// 2 · o que a aplicabilidade fez
const dins = [...selecao.aspectos, ...selecao.overlays]
const total = dins.reduce((n, d) => n + d.evidencia.itens.length, 0)
L.push("## 2. A aplicabilidade por vínculo\n")
L.push(`A seleção entrega ${dins.length} dinâmicas com ${total} frases do repertório. A aplicabilidade só age depois, na montagem do prompt.\n`)
L.push("| Vínculo | frases que vão | removidas (dependência real de outro vínculo) | trocadas pelo núcleo geral | dinâmicas omitidas | blocos liberados | ênfase sugerida |")
L.push("|---|---|---|---|---|---|---|")
const linhas: Record<string, Array<{ chave: string; estado: string }>> = {}
for (const v of VINCULOS) {
  const p = montarPayload(selecao, { locale: "pt", vinculo: v })
  let vao = 0, rem = 0, neut = 0
  linhas[v] = []
  for (const d of dins) {
    for (const i of d.evidencia.itens) {
      const a = aplicabilidadeDaFrase(d.evidencia.glosa, i.ref, v)
      const k = `${d.evidencia.glosa}#${i.ref}`
      if (!REVISAO_DE_APLICABILIDADE[k]) { vao += 1; continue }
      if (!a.aplica) { rem += 1; linhas[v].push({ chave: k, estado: "removida" }) }
      else if (a.texto) { vao += 1; neut += 1; linhas[v].push({ chave: k, estado: "trocada" }) }
      else { vao += 1; linhas[v].push({ chave: k, estado: "mantida" }) }
    }
  }
  L.push(`| ${v} | ${vao} | ${rem} | ${neut} | ${p.omitidasPorVinculo.length} | ${p.blocosElegiveis.length} (${p.blocosElegiveis.join(", ")}) | ${p.enfase.join(", ") || "nenhuma"} |`)
}
L.push("\n### Frases da revisão presentes neste par, e o estado em cada vínculo\n")
const chaves = [...new Set(Object.values(linhas).flatMap((l) => l.map((x) => x.chave)))].sort()
if (chaves.length === 0) L.push("Nenhuma frase revisada aparece na seleção deste par.")
else {
  L.push("| Frase | romântico | amizade | família | trabalho | outro |\n|---|---|---|---|---|---|")
  for (const k of chaves) {
    const r = REVISAO_DE_APLICABILIDADE[k]
    const estado = (v: string) => linhas[v].find((x) => x.chave === k)?.estado ?? "?"
    L.push(`| \`${k}\` (${r.classe === "dependencia_real" ? "dependência real" : "exemplo contextual"}) · ${r.de.slice(0, 90)}… | ${["romantico", "amizade", "familia", "trabalho", "outro"].map(estado).join(" | ")} |`)
  }
}

// 3 · as respostas, só estrutura
L.push("\n## 3. A estrutura das cinco respostas (contagens, sem juízo)\n")
L.push("| Vínculo | id | estrutural | blocos escritos | blocos null | palavras | ids de evidência citados (únicos) |\n|---|---|---|---|---|---|---|")
const citadosPorVinculo: Record<string, Set<string>> = {}
for (const [id, v] of controle) {
  const r = JSON.parse(fs.readFileSync(path.join(RAIZ, "resultado", `${id}.json`), "utf8"))
  const s = (r.sintese ?? JSON.parse(r.geracao.texto)) as Record<string, { paragrafos: Array<{ texto: string; evidencias: string[] }> } | null>
  const escritos = Object.entries(s).filter(([, b]) => b).map(([k]) => k)
  const nulos = Object.entries(s).filter(([, b]) => !b).map(([k]) => k)
  const palavras = Object.values(s).flatMap((b) => b?.paragrafos ?? []).reduce((n, p) => n + p.texto.trim().split(/\s+/).length, 0)
  const cit = new Set(Object.values(s).flatMap((b) => (b?.paragrafos ?? []).flatMap((p) => p.evidencias)))
  citadosPorVinculo[v.vinculo] = cit
  L.push(`| ${v.vinculo} | ${id} | ${r.estrutural.ok ? "ok" : "reprovado"} | ${escritos.length} | ${nulos.join(", ") || "nenhum"} | ${palavras} | ${cit.size} |`)
}
const todos = new Set(Object.values(citadosPorVinculo).flatMap((c) => [...c]))
const emTodos = [...todos].filter((x) => Object.values(citadosPorVinculo).every((c) => c.has(x)))
L.push(`\nDinâmicas e fatos citados nos cinco: ${emTodos.length} de ${todos.size} ids distintos. Citados só em alguns vínculos:\n`)
L.push("| id | " + VINCULOS.join(" | ") + " |\n|---|" + VINCULOS.map(() => "---").join("|") + "|")
for (const x of [...todos].filter((y) => !emTodos.includes(y)).sort()) L.push(`| ${x} | ${VINCULOS.map((v) => (citadosPorVinculo[v]?.has(x) ? "sim" : "—")).join(" | ")} |`)

fs.writeFileSync(path.join(RAIZ, "controle-vinculo-factual.md"), L.join("\n") + "\n")
console.log(iguais ? "idênticos" : "DIFERENTES", "→ controle-vinculo-factual.md")
