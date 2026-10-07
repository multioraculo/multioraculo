// Reabrir leitura normal (não preview) pelo seed: prova de posse, só leitura.
import { loadReopenableReading, isReadingOwner, type ReopenClient } from "../lib/billing/results"
import { isPreviewOwner } from "../lib/billing/preview"

let falhas = 0
function ok(cond: boolean, nome: string) {
  if (!cond) {
    falhas++
    console.error("FALHOU:", nome)
  }
}

type Row = Record<string, any>
function fakeDb(tables: Record<string, Row[]>) {
  const calls: string[] = []
  const client: ReopenClient = {
    from(table: string) {
      calls.push(`from:${table}`)
      const filters: Array<[string, unknown]> = []
      const b: any = {
        select() { calls.push("select"); return b },
        eq(col: string, v: unknown) { filters.push([col, v]); return b },
        async maybeSingle() {
          const row = (tables[table] ?? []).find((r) => filters.every(([c, v]) => r[c] === v))
          return { data: row ?? null, error: null }
        },
      }
      // qualquer escrita é registrada e falha: reabrir não pode escrever
      for (const w of ["insert", "update", "upsert", "delete", "rpc"]) {
        b[w] = () => { calls.push(`WRITE:${w}`); throw new Error("escrita proibida") }
      }
      return b
    },
  }
  return { client, calls, tables }
}

const agora = new Date().toISOString()
const SEED = "seed-normal-1"
function mundo(over: { usage?: Row; result?: Row } = {}) {
  return fakeDb({
    reading_usage: [{ seed: SEED, preview: false, status: "completed", ...over.usage }],
    reading_results: [{
      seed: SEED, user_id: null, visitor_id: "vis-A", question: "q", locale: "pt",
      oracles: {}, synthesis: "texto da síntese", created_at: agora, ...over.result,
    }],
  })
}

async function main() {
  // 1) mesmo visitante recupera
  {
    const w = mundo()
    const r = await loadReopenableReading(SEED, null, "vis-A", w.client)
    ok(r?.seed === SEED, "1: mesmo visitante recupera a própria leitura")
  }
  // 2) usuário após OAuth recupera a leitura atribuída
  {
    const w = mundo({ result: { user_id: "user-1" } })
    const r = await loadReopenableReading(SEED, "user-1", "vis-A", w.client)
    ok(r?.seed === SEED, "2: usuário dono recupera após a atribuição")
    const visitanteDepois = await loadReopenableReading(SEED, null, "vis-A", w.client)
    ok(visitanteDepois === null, "2b: depois de atribuída, o cookie sozinho não reabre")
  }
  // 3) outro usuário com o mesmo seed não recupera
  {
    const w = mundo({ result: { user_id: "user-1" } })
    ok((await loadReopenableReading(SEED, "user-2", "vis-A", w.client)) === null, "3: outro usuário não recupera")
    const w2 = mundo()
    ok((await loadReopenableReading(SEED, "user-2", null, w2.client)) === null, "3b: usuário sem atribuição não recupera leitura de visitante")
  }
  // 4) visitante diferente / sem cookie não recupera
  {
    const w = mundo()
    ok((await loadReopenableReading(SEED, null, "vis-B", w.client)) === null, "4: visitante diferente não recupera")
    ok((await loadReopenableReading(SEED, null, null, w.client)) === null, "4b: sem cookie não recupera (seed não é credencial)")
  }
  // 5) e 6) recuperar não escreve nada: nem cota (rpc/update), nem novo reading_result
  {
    const w = mundo()
    const antes = JSON.stringify(w.tables)
    await loadReopenableReading(SEED, null, "vis-A", w.client)
    await loadReopenableReading(SEED, null, "vis-B", w.client)
    ok(!w.calls.some((c) => c.startsWith("WRITE:")), "5: nenhuma escrita/rpc de cota ao reabrir")
    ok(JSON.stringify(w.tables) === antes, "6: nenhuma linha criada ou alterada")
    ok(w.tables.reading_results.length === 1 && w.tables.reading_usage.length === 1, "6b: contagem de linhas igual")
  }
  // 7) preview mantém a regra atual (fora do caminho novo)
  {
    const w = mundo({ usage: { preview: true } })
    ok((await loadReopenableReading(SEED, null, "vis-A", w.client)) === null, "7: preview não passa pelo caminho novo")
    const rec = { user_id: null, visitor_id: "vis-A" } as any
    ok(isPreviewOwner(rec, null, "vis-A") === true, "7b: preview: visitante dono (regra atual)")
    ok(isPreviewOwner(rec, null, "vis-B") === false, "7c: preview: outro visitante (regra atual)")
    ok(isPreviewOwner({ user_id: "u1", visitor_id: null } as any, "u2", null) === false, "7d: preview: outro usuário (regra atual)")
    ok(isReadingOwner(rec, null, "vis-A") === true, "7e: posse igual à do preview")
  }
  // 7f) usage não completed / sem usage / síntese vazia / fora da janela
  {
    ok((await loadReopenableReading(SEED, null, "vis-A", mundo({ usage: { status: "started" } }).client)) === null, "7f: uso não concluído")
    ok((await loadReopenableReading(SEED, null, "vis-A", mundo({ result: { synthesis: "" } }).client)) === null, "7g: síntese vazia")
    const velha = new Date(Date.now() - 25 * 3600 * 1000).toISOString()
    ok((await loadReopenableReading(SEED, null, "vis-A", mundo({ result: { created_at: velha } }).client)) === null, "7h: fora da janela técnica")
  }
  // 8) seed inexistente / inválido
  {
    const w = mundo()
    ok((await loadReopenableReading("nao-existe", null, "vis-A", w.client)) === null, "8: seed inexistente")
    ok((await loadReopenableReading("", null, "vis-A", w.client)) === null, "8b: seed vazio")
    ok((await loadReopenableReading("x".repeat(500), null, "vis-A", w.client)) === null, "8c: seed gigante")
    ok((await loadReopenableReading(undefined as any, null, "vis-A", w.client)) === null, "8d: seed não string")
    ok((await loadReopenableReading("a' or '1'='1", null, "vis-A", w.client)) === null, "8e: seed hostil")
  }

  if (falhas) process.exit(1)
  console.log("verify-reabrir-leitura: ok")
}
main()
