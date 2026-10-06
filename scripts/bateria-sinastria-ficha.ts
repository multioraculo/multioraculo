/**
 * Bateria de sinastria, passo 3: monta a ficha de avaliação humana com as 20
 * respostas em ids opacos, na ordem embaralhada da geração, e o material de
 * evidência de cada uma. NÃO lê nada de `lacrado/`: o juiz não aparece.
 *
 *   node --import ./scripts/ts-register.mjs scripts/bateria-sinastria-ficha.ts
 */
import fs from "fs"
import path from "path"
import type { PayloadSinastria } from "../lib/astro/payload-sinastria"

const RAIZ = path.resolve("data/bateria-sinastria")
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const ordem = Object.keys(JSON.parse(fs.readFileSync(path.join(RAIZ, "chave.json"), "utf8")))
const CHAVES = ["sintese_da_relacao", "pontos_em_comum", "onde_se_encontram", "onde_ha_tensao", "comunicacao", "afeto_e_intimidade", "vida_pratica_e_sustentacao", "o_que_a_relacao_mobiliza", "sintese_final"]

function evidenciaHtml(p: PayloadSinastria): string {
  const dinamicas = (titulo: string, ds: PayloadSinastria["aspectos"]) =>
    ds.length === 0
      ? ""
      : `<div><b>${esc(titulo)}</b></div>` +
        ds.map((d) => `<div class="dn"><b>${esc(d.id)}</b>${d.contraponto ? " (entrou como contraponto)" : ""}<ul>${d.fatos.map((f) => `<li><i>fato ${esc(f.id)}:</i> ${esc(f.texto)}</li>`).join("")}</ul><div class="mut">o que o repertório diz:</div><ul>${d.evidencia.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>`).join("")
  const sem = p.semelhancas.length
    ? `<div><b>Pontos em comum</b></div>` + p.semelhancas.map((s) => `<div class="dn"><b>${esc(s.id)}</b>: ${esc(s.fato)}<ul>${s.nucleo.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>`).join("") + (p.ressalvaDasSemelhancas ? `<div class="mut">ressalva: ${esc(p.ressalvaDasSemelhancas)}</div>` : "")
    : `<div><b>Pontos em comum:</b> nenhum com material do livro.</div>`
  return dinamicas("Aspectos entre os dois mapas (em ordem de relevância)", p.aspectos) + dinamicas("Overlays e planetas sobre ângulos", p.overlays) + sem
}

const dados = ordem.map((id) => {
  const r = JSON.parse(fs.readFileSync(path.join(RAIZ, "resultado", `${id}.json`), "utf8"))
  const p: PayloadSinastria = r.payload
  let bruto: string | null = null
  let s: Record<string, { paragrafos?: Array<{ texto: string; evidencias: string[] }> } | null> = {}
  try {
    const parsed = r.sintese ?? JSON.parse(r.geracao.texto)
    if (parsed && typeof parsed === "object") s = parsed
    else bruto = String(r.geracao?.texto ?? "")
  } catch {
    bruto = String(r.geracao?.texto ?? "")
  }
  const blocos = CHAVES.map((chave) => {
    const b = s[chave]
    return b && Array.isArray(b.paragrafos) ? { chave, nulo: false, paragrafos: b.paragrafos.map((x) => ({ texto: String(x.texto), evidencias: (x.evidencias ?? []).map(String) })) } : { chave, nulo: true, paragrafos: [] }
  })
  const escritos = new Set(blocos.filter((b) => !b.nulo).map((b) => b.chave))
  const nulosLiberados = p.blocosElegiveis.filter((b) => !escritos.has(b))
  const citadas = new Set(blocos.flatMap((b) => b.paragrafos.flatMap((x) => x.evidencias)))
  const naoCitadas = [...p.aspectos, ...p.overlays].filter((d) => !citadas.has(d.id) && !d.fatos.some((f) => citadas.has(f.id))).map((d) => d.id)
  return { id, nulosLiberados, naoCitadas, vinculo: r.vinculo, liberados: p.blocosElegiveis, enfase: p.enfase, indisponiveis: p.indisponibilidades, blocos, bruto, evidenciaHtml: evidenciaHtml(p) }
})

const html = fs.readFileSync("scripts/bateria-sinastria-ficha.template.html", "utf8").replace("__DADOS__", () => JSON.stringify(dados).replace(/</g, "\\u003c"))
fs.writeFileSync(path.join(RAIZ, "avaliacao-humana.html"), html)
console.log(`ficha com ${dados.length} respostas → ${path.join(RAIZ, "avaliacao-humana.html")} (${Math.round(html.length / 1024)} KB)`)
