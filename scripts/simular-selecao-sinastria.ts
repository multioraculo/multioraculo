/**
 * Simula o seletor de evidência em pares de mapas reais, para dimensionar o
 * orçamento ANTES de fixá-lo. Não chama modelo nenhum.
 *
 *   node --import ./scripts/ts-register.mjs scripts/simular-selecao-sinastria.ts
 *
 * Os mapas vêm do corpus de validação do motor (40 nascimentos de 1926 a hoje,
 * com horário de verão, latitudes altas e os dois hemisférios), combinados em
 * pares que não escolhi pelo resultado: o par (i, i+7) e o par (i, i+13), mais
 * variantes em que uma ou as duas pessoas não sabem a hora.
 */
import { mapaNatal, type DadosNascimento } from "../lib/astro/mapa"
import { sinastria } from "../lib/astro/sinastria"
import { ORCAMENTO_PADRAO, selecionarEvidencia, tokensSeMandasseTudo, type Orcamento } from "../lib/astro/selecao-sinastria"
import { CASOS } from "./astro-fixtures"

const p2 = (n: number) => String(n).padStart(2, "0")
export function dados(i: number, hora: boolean): DadosNascimento {
  const c = CASOS[i % CASOS.length]
  return { born_on: `${c.year}-${p2(c.month)}-${p2(c.day)}`, born_at: hora ? `${p2(c.hour)}:${p2(c.minute)}` : null, lat: c.lat, lon: c.lon, place_label: c.rotulo, tz: c.zone }
}

export type Caso = { rotulo: string; a: DadosNascimento; b: DadosNascimento }
export function amostra(): Caso[] {
  const casos: Caso[] = []
  for (let i = 0; i < CASOS.length; i += 4) casos.push({ rotulo: `${i}×${(i + 7) % CASOS.length}`, a: dados(i, true), b: dados(i + 7, true) })
  for (let i = 1; i < CASOS.length; i += 9) casos.push({ rotulo: `${i}×${(i + 13) % CASOS.length} (B sem hora)`, a: dados(i, true), b: dados(i + 13, false) })
  for (let i = 2; i < CASOS.length; i += 13) casos.push({ rotulo: `${i}×${(i + 5) % CASOS.length} (os dois sem hora)`, a: dados(i, false), b: dados(i + 5, false) })
  return casos
}

const mediana = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]

export function simular(orcamento?: Partial<Orcamento>) {
  const linhas = amostra().map((c) => {
    const r = sinastria(mapaNatal(c.a), mapaNatal(c.b))
    const tudo = tokensSeMandasseTudo(r)
    const s = selecionarEvidencia(r, { orcamento })
    const cats = new Set(r.aspectos.map((f) => f.categoria))
    const catsSel = new Set(s.aspectos.flatMap((d) => d.categorias))
    const dimsUniverso = new Set<string>()
    const dimsSel = new Set<string>()
    for (const d of [...s.aspectos, ...s.overlays]) for (const x of d.evidencia?.dimensoes ?? []) dimsSel.add(x)
    return {
      rotulo: c.rotulo,
      aspectos: r.aspectos.length,
      overlays: r.overlays.length,
      semelhancas: r.semelhancas.length,
      recusadas: r.recusadas.length,
      indisp: r.indisponibilidades.length,
      filtradas: s.filtradasPorCondicaoNatal,
      tudoTokens: tudo.tokens,
      selTokens: s.tokens.total,
      selAsp: s.aspectos.length,
      selOv: s.overlays.length,
      selSem: s.semelhancas.length,
      descartes: s.descartes.length,
      temDisc: cats.has("discordante"),
      temHarm: cats.has("harmonico"),
      selDisc: catsSel.has("discordante"),
      selHarm: catsSel.has("harmonico"),
      dimsSel: dimsSel.size,
      dimsUniverso: dimsUniverso.size,
      s,
    }
  })
  return linhas
}

if (process.argv[1]?.endsWith("simular-selecao-sinastria.ts")) {
  const linhas = simular()
  console.log(`orçamento: aspectos ${ORCAMENTO_PADRAO.aspectos} · overlays ${ORCAMENTO_PADRAO.overlays} · semelhanças ${ORCAMENTO_PADRAO.semelhancas} tokens\n`)
  console.log("par                              asp ovl sem recus indisp | filtr | tudo → sel tokens | sel asp/ovl/sem | harm disc | dims")
  for (const l of linhas) {
    console.log(`${l.rotulo.padEnd(32)} ${String(l.aspectos).padStart(3)} ${String(l.overlays).padStart(3)} ${String(l.semelhancas).padStart(3)} ${String(l.recusadas).padStart(5)} ${String(l.indisp).padStart(6)} | ${String(l.filtradas).padStart(5)} | ${String(l.tudoTokens).padStart(5)} → ${String(l.selTokens).padStart(4)}       | ${String(l.selAsp).padStart(2)}/${String(l.selOv).padStart(2)}/${String(l.selSem).padStart(2)}        | ${l.temHarm ? (l.selHarm ? "✓" : "✗") : "-"}    ${l.temDisc ? (l.selDisc ? "✓" : "✗") : "-"}   | ${l.dimsSel}`)
  }
  const t = linhas.map((l) => l.tudoTokens)
  const s = linhas.map((l) => l.selTokens)
  console.log(`\n${linhas.length} pares · tokens de tudo: mediana ${mediana(t)}, mín ${Math.min(...t)}, máx ${Math.max(...t)} · selecionados: mediana ${mediana(s)}, mín ${Math.min(...s)}, máx ${Math.max(...s)}`)
  console.log(`aspectos válidos: mediana ${mediana(linhas.map((l) => l.aspectos))} · overlays: mediana ${mediana(linhas.map((l) => l.overlays))} · frases filtradas por condição natal: mediana ${mediana(linhas.map((l) => l.filtradas))}`)
  const ambas = linhas.filter((l) => l.temHarm && l.temDisc)
  console.log(`relações com aspectos harmônicos E discordantes: ${ambas.length}; seleção mantém os dois: ${ambas.filter((l) => l.selHarm && l.selDisc).length}`)
  const comHarm = linhas.filter((l) => l.temHarm)
  const comDisc = linhas.filter((l) => l.temDisc)
  console.log(`seleção perdeu o lado harmônico quando existia: ${comHarm.filter((l) => !l.selHarm).length} · perdeu o discordante quando existia: ${comDisc.filter((l) => !l.selDisc).length}`)
}

if (process.argv[1]?.endsWith("simular-selecao-sinastria.ts")) {
  const linhas = simular()
  const soma = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
  const barrados = linhas.map((l) => l.s.diagnostico.semEvidenciaInterpretativa.length)
  const desfeitos = linhas.map((l) => l.s.diagnostico.agrupamentosDesfeitos)
  const acionada = linhas.filter((l) => l.s.diagnostico.contraponto !== null)
  console.log("\n── após as três correções ──")
  console.log(`tokens da seleção: mediana ${mediana(linhas.map((l) => l.selTokens))} (mín ${Math.min(...linhas.map((l) => l.selTokens))}, máx ${Math.max(...linhas.map((l) => l.selTokens))})`)
  console.log(`fatos sem evidência interpretativa barrados: ${soma(barrados)} no total (mediana ${mediana(barrados)} por relação)`)
  console.log(`agrupamentos desfeitos por leitura diferente: ${soma(desfeitos)} no total, em ${desfeitos.filter((n) => n > 0).length} de ${linhas.length} relações`)
  console.log(`trava de contraponto acionada: ${acionada.length} de ${linhas.length} relações · incluído: ${acionada.filter((l) => l.s.diagnostico.contraponto?.incluido).length} · não coube no orçamento: ${acionada.filter((l) => !l.s.diagnostico.contraponto?.incluido).length}`)
  console.log(`relações com os dois lados no universo e na seleção: ${linhas.filter((l) => l.temHarm && l.temDisc && l.selHarm && l.selDisc).length} de ${linhas.filter((l) => l.temHarm && l.temDisc).length}`)
  const reforcos = soma(linhas.map((l) => l.s.aspectos.reduce((n, d) => n + d.reforcos.length, 0)))
  console.log(`reforços (dedup por identidade de leitura): ${reforcos} · dinâmicas de aspecto: ${soma(linhas.map((l) => l.s.aspectos.length))}`)
  const chaves = (o: unknown): string[] => (Array.isArray(o) ? o.flatMap(chaves) : o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => [k, ...chaves(v)]) : [])
  const todas = linhas.flatMap((l) => chaves(l.s)).join(" ")
  console.log(`chaves de score, nota, pontuação ou compatibilidade nas saídas: ${/\b(score|nota|pontuacao|compat\w*|veredito)\b/i.test(todas) ? "ENCONTRADAS" : "nenhuma"}`)
}

if (process.argv[1]?.endsWith("simular-selecao-sinastria.ts")) {
  const linhas = simular()
  const soma = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
  const sem = linhas.flatMap((l) => l.s.descartes.filter((d) => d.camada === "semelhancas"))
  const por = (m: string) => sem.filter((d) => d.motivo === m).length
  const sel = linhas.flatMap((l) => l.s.semelhancas)
  const tok = linhas.map((l) => l.s.tokens.semelhancas)
  const dim: Record<string, number> = {}
  for (const x of sel) dim[x.fato.dimensao] = (dim[x.fato.dimensao] ?? 0) + 1
  console.log("\n── semelhanças ──")
  console.log(`no universo: ${soma(linhas.map((l) => l.semelhancas))} · selecionadas com glosa: ${sel.length} · barradas sem evidência interpretativa: ${por("sem_evidencia_interpretativa")} · geracionais: ${por("geracional")} · fora do orçamento: ${por("fora_do_orcamento")}`)
  console.log(`selecionadas por dimensão: ${JSON.stringify(dim)}`)
  console.log(`tokens da camada: mediana ${[...tok].sort((a, b) => a - b)[Math.floor(tok.length / 2)]}, soma ${soma(tok)} (antes: mediana 105, soma 1715)`)
  console.log(`relações sem nenhum ponto em comum narrável: ${linhas.filter((l) => l.s.semelhancas.length === 0).length} de ${linhas.length}`)
  console.log(`relações com ressalvas gerais anexadas: ${linhas.filter((l) => l.s.ressalvasDasSemelhancas.length > 0).length}`)
  console.log(`tokens totais da seleção: mediana ${[...linhas.map((l) => l.selTokens)].sort((a, b) => a - b)[Math.floor(linhas.length / 2)]} (antes 4038) · máx ${Math.max(...linhas.map((l) => l.selTokens))}`)
}
