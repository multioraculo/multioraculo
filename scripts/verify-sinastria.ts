/**
 * Proteção da sinastria determinística. Roda antes do build
 * (npm run verify:sinastria) e FALHA se qualquer regra decidida mudar.
 *
 * As regras que este arquivo trava foram fechadas por decisão, não por
 * descoberta, então os números aparecem AQUI escritos de novo, à mão, e não
 * importados de `sinastria.ts`. Um teste que importa a constante que está
 * testando só prova que ela é igual a si mesma.
 *
 *   orbes:      3° nos cinco maiores · 5° quando há Sol ou Lua · 1,5° no quincunce
 *   ângulos:    3° nos cinco maiores, sem a extensão do luminar · quincunce 1,5°
 *   aspectos:   os seis do projeto, nenhum menor
 *
 * Nenhuma chamada paga, nenhum banco: o armazenamento é um espião em memória.
 */
import { readFileSync } from "fs"
import path from "path"
import { indiceDoSigno, grauNoSigno, type Corpo } from "../lib/astro/ceu"
import { CORPOS_MAPA, mapaNatal, type CorpoNatal, type DadosNascimento, type MapaNatal, type RetrogradoEstado } from "../lib/astro/mapa"
import { sinastria, ASPECTOS_SINASTRIA, type ResultadoSinastria } from "../lib/astro/sinastria"
import {
  compararAvulsa,
  MAX_PESSOAS,
  salvarPessoa,
  validarApelido,
  validarNascimento,
  VINCULOS,
  type LinhaPessoa,
  type PessoasStore,
} from "../lib/astro/sinastria-servico"
import { verificarSinastria } from "../lib/astro/verificador-sinastria"
import { ASPECTOS, CORPOS } from "../lib/astro/nomes"
import { CASOS } from "./astro-fixtures"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

// ── mapas sintéticos: a longitude de cada corpo é a que o teste mandar ──────

const ANGULO: Record<string, number> = { conjunction: 0, opposition: 180, square: 90, trine: 120, sextile: 60, quincunx: 150 }
const seisAspectos = Object.keys(ANGULO)

type Opcoes = {
  hora?: boolean
  asc?: number
  mc?: number
  /** primeira cúspide; as doze são iguais, de 30 em 30 */
  cusp0?: number
  incerteza?: Partial<Record<Corpo, number>>
  retro?: Partial<Record<Corpo, RetrogradoEstado>>
}

function mapa(lons: Partial<Record<Corpo, number>>, o: Opcoes = {}): MapaNatal {
  const hora = o.hora ?? true
  const cusp0 = o.cusp0 ?? 0
  const corpos: CorpoNatal[] = CORPOS_MAPA.map((c, i) => {
    const lon = lons[c] ?? (i * 36 + 7) % 360
    const inc = o.incerteza?.[c] ?? 0
    const definido = inc === 0 || indiceDoSigno(lon - inc / 2) === indiceDoSigno(lon + inc / 2)
    return {
      corpo: c,
      lon,
      signo: indiceDoSigno(lon),
      grau: grauNoSigno(lon),
      retrogrado: o.retro?.[c] === "retrogrado",
      retrogradoEstado: o.retro?.[c] ?? "direto",
      casa: hora ? Math.floor((((lon - cusp0) % 360) + 360) % 360 / 30) + 1 : null,
      incerteza: inc,
      signoDefinido: definido,
    }
  })
  return {
    tz: "America/Sao_Paulo",
    tzStatus: "ok",
    jdUt: 0,
    horaConhecida: hora,
    sistemaCasas: hora ? "whole_sign" : "",
    corpos,
    asc: hora ? (o.asc ?? cusp0) : null,
    mc: hora ? (o.mc ?? (cusp0 + 270) % 360) : null,
    cuspides: hora ? Array.from({ length: 12 }, (_, i) => (cusp0 + i * 30) % 360) : null,
    aspectos: [],
  }
}

const ids = (r: ResultadoSinastria) => new Set(r.aspectos.map((f) => f.id))
const tem = (r: ResultadoSinastria, id: string) => ids(r).has(id)
const separa = (x: number, y: number) => {
  const d = (((x - y) % 360) + 360) % 360
  return d > 180 ? 360 - d : d
}

// ── o que se espera, reescrito a partir da decisão e não do código ──────────

function limiteEsperado(aspecto: string, a: string, b: string): number {
  if (aspecto === "quincunx") return 1.5
  if (a === "asc" || a === "mc" || b === "asc" || b === "mc") return 3
  if (["sun", "moon"].includes(a) || ["sun", "moon"].includes(b)) return 5
  return 3
}

/** Os ids que existiriam entre dois mapas de hora conhecida, calculados de novo. */
function esperados(a: MapaNatal, b: MapaNatal): Set<string> {
  const pontos = (m: MapaNatal) => [
    ...m.corpos.map((c) => ({ id: c.corpo as string, lon: c.lon, angulo: false })),
    ...(m.asc !== null ? [{ id: "asc", lon: m.asc, angulo: true }] : []),
    ...(m.mc !== null ? [{ id: "mc", lon: m.mc, angulo: true }] : []),
  ]
  const saida = new Set<string>()
  for (const x of pontos(a)) {
    for (const y of pontos(b)) {
      if (x.angulo && y.angulo) continue
      for (const asp of seisAspectos) {
        const orbe = Math.abs(separa(x.lon, y.lon) - ANGULO[asp])
        if (orbe <= limiteEsperado(asp, x.id, y.id)) saida.add(`A.${x.id}~B.${y.id}:${asp}`)
      }
    }
  }
  return saida
}

function dadosDoCaso(i: number, comHora = true): DadosNascimento {
  const c = CASOS[i]
  const p = (n: number) => String(n).padStart(2, "0")
  return {
    born_on: `${c.year}-${p(c.month)}-${p(c.day)}`,
    born_at: comHora ? `${p(c.hour)}:${p(c.minute)}` : null,
    lat: c.lat,
    lon: c.lon,
    place_label: c.rotulo,
    tz: c.zone,
  }
}

// ── A · orbes, ângulos e aspectos ───────────────────────────────────────────
function parteA() {
  // A↔B não é B↔A: o dono vem antes do corpo
  {
    const a = mapa({ moon: 10, saturn: 100 })
    const b = mapa({ saturn: 191.2, moon: 200 })
    const direto = sinastria(a, b)
    const inverso = sinastria(b, a)
    confere("A↔B: Lua de A em oposição a Saturno de B existe", tem(direto, "A.moon~B.saturn:opposition"))
    confere("A↔B: o inverso (Saturno de A, Lua de B) NÃO existe", !tem(direto, "A.saturn~B.moon:opposition"))
    confere("B↔A: trocar os mapas troca os donos", tem(inverso, "A.saturn~B.moon:opposition") && !tem(inverso, "A.moon~B.saturn:opposition"))
  }

  // luminares: 5° só nos cinco maiores
  for (const asp of ["conjunction", "opposition", "square", "trine", "sextile"]) {
    const base = ANGULO[asp]
    const dentro = sinastria(mapa({ sun: 10 }), mapa({ venus: 10 + base + 4.9 }))
    const fora = sinastria(mapa({ sun: 10 }), mapa({ venus: 10 + base + 5.1 }))
    confere(`luminar: Sol e Vênus em ${asp} a 4,9° entram`, tem(dentro, `A.sun~B.venus:${asp}`))
    confere(`luminar: Sol e Vênus em ${asp} a 5,1° não entram`, !tem(fora, `A.sun~B.venus:${asp}`))
    const lua = sinastria(mapa({ moon: 10 }), mapa({ mars: 10 + base - 4.9 }))
    confere(`luminar: Lua e Marte em ${asp} a 4,9° entram`, tem(lua, `A.moon~B.mars:${asp}`))
    // sem luminar, o teto é 3°
    const s3 = sinastria(mapa({ venus: 10 }), mapa({ mars: 10 + base + 3 }))
    const s31 = sinastria(mapa({ venus: 10 }), mapa({ mars: 10 + base + 3.1 }))
    confere(`sem luminar: Vênus e Marte em ${asp} a 3,0° entram`, tem(s3, `A.venus~B.mars:${asp}`))
    confere(`sem luminar: Vênus e Marte em ${asp} a 3,1° NÃO entram`, !tem(s31, `A.venus~B.mars:${asp}`))
  }

  // quincunce: 1,5°, sem extensão por luminar
  {
    const dentro = sinastria(mapa({ venus: 10 }), mapa({ mars: 10 + 150 + 1.4 }))
    const fora = sinastria(mapa({ venus: 10 }), mapa({ mars: 10 + 150 + 1.6 }))
    confere("quincunce a 1,4° entra", tem(dentro, "A.venus~B.mars:quincunx"))
    confere("quincunce a 1,6° NÃO entra", !tem(fora, "A.venus~B.mars:quincunx"))
    const lum = sinastria(mapa({ sun: 10 }), mapa({ venus: 10 + 150 + 2 }))
    confere("quincunce com o Sol a 2° NÃO entra: luminar não estende o menor", !tem(lum, "A.sun~B.venus:quincunx"))
    const lumDentro = sinastria(mapa({ sun: 10 }), mapa({ venus: 10 + 150 + 1.4 }))
    confere("quincunce com o Sol a 1,4° entra", tem(lumDentro, "A.sun~B.venus:quincunx"))
    const lim = dentro.aspectos.find((f) => f.id === "A.venus~B.mars:quincunx")
    confere("o fato do quincunce diz que o limite é 1,5", lim?.orbeLimite === 1.5)
  }

  // nenhum aspecto menor entra, em qualquer distância
  {
    for (const menor of [30, 45, 135, 72, 144, 36]) {
      const r = sinastria(mapa({ venus: 10 }), mapa({ mars: 10 + menor }))
      const pares = r.aspectos.filter((f) => f.corpoA === "venus" && f.corpoB === "mars")
      confere(`aspecto menor (${menor}°) não vira fato`, pares.length === 0, pares.map((p) => p.id).join(","))
    }
    confere("a lista de aspectos é a dos seis do projeto", ASPECTOS_SINASTRIA.length === 6 && ASPECTOS_SINASTRIA.every((x) => seisAspectos.includes(x)))
  }

  // Asc e MC: 3°, sem a extensão do luminar, e quincunce continua em 1,5°
  {
    const dentro = sinastria(mapa({}, { asc: 100 }), mapa({ sun: 102.9 }))
    const fora = sinastria(mapa({}, { asc: 100 }), mapa({ sun: 103.5 }))
    confere("Asc e Sol a 2,9° entram", tem(dentro, "A.asc~B.sun:conjunction"))
    confere("Asc e Sol a 3,5° NÃO entram: o 5° do luminar não vale para ângulo", !tem(fora, "A.asc~B.sun:conjunction"))
    const f = dentro.aspectos.find((x) => x.id === "A.asc~B.sun:conjunction")
    confere("o aspecto com ângulo é marcado como inferência editorial", f?.inferido === true && f?.grupoDeOrbe === "angulo_inferido" && f?.orbeLimite === 3)
    const mc = sinastria(mapa({ venus: 50 }), mapa({}, { mc: 52.9 }))
    confere("Vênus de A com o MC de B a 2,9° entra", tem(mc, "A.venus~B.mc:conjunction"))
    const q1 = sinastria(mapa({}, { asc: 100 }), mapa({ venus: 100 + 150 + 1.4 }))
    const q2 = sinastria(mapa({}, { asc: 100 }), mapa({ venus: 100 + 150 + 1.6 }))
    confere("quincunce com Asc a 1,4° entra", tem(q1, "A.asc~B.venus:quincunx"))
    confere("quincunce com Asc a 1,6° NÃO entra: ângulo não alarga o menor", !tem(q2, "A.asc~B.venus:quincunx"))
    const aa = sinastria(mapa({}, { asc: 10 }), mapa({}, { asc: 10.5 }))
    confere("Asc de A com Asc de B não é aspecto", !aa.aspectos.some((x) => x.corpoA === "asc" && x.corpoB === "asc"))
  }

  // tudo que entra está dentro do limite, e nada que cabia ficou de fora
  {
    let comparados = 0
    for (let i = 0; i + 7 < CASOS.length; i += 3) {
      const a = mapaNatal(dadosDoCaso(i))
      const b = mapaNatal(dadosDoCaso(i + 7))
      const r = sinastria(a, b)
      const esp = esperados(a, b)
      const got = ids(r)
      comparados += 1
      const faltam = [...esp].filter((x) => !got.has(x))
      const sobram = [...got].filter((x) => !esp.has(x))
      confere(`mapas reais ${CASOS[i].rotulo} × ${CASOS[i + 7].rotulo}: nada fora do orbe, nada que coubesse ficou de fora`, faltam.length === 0 && sobram.length === 0, `faltam ${faltam.slice(0, 3)} sobram ${sobram.slice(0, 3)}`)
      for (const f of r.aspectos) {
        confere(`fato ${f.id}: aspecto é um dos seis`, seisAspectos.includes(f.aspecto))
        confere(`fato ${f.id}: orbe dentro do limite`, f.orbe <= f.orbeLimite + 1e-9 && f.piorOrbe <= f.orbeLimite + 1e-9)
        confere(`fato ${f.id}: sem peso inventado`, f.forca === null && f.direcao === null)
      }
    }
    confere("a varredura de mapas reais comparou pares", comparados >= 10, String(comparados))
  }
}

// ── B · hora desconhecida ───────────────────────────────────────────────────
function parteB() {
  // Asc e MC somem sem hora
  {
    const comHora = sinastria(mapa({}, { asc: 100 }), mapa({ sun: 101 }))
    const semHora = sinastria(mapa({}, { hora: false }), mapa({ sun: 101 }))
    confere("com hora: aspecto com o Asc existe", tem(comHora, "A.asc~B.sun:conjunction"))
    confere("sem hora: nenhum aspecto com Asc ou MC de A (o B tem hora e os seus ângulos continuam)", !semHora.aspectos.some((f) => ["asc", "mc"].includes(f.corpoA)))
    const ambosSem = sinastria(mapa({}, { hora: false }), mapa({ sun: 101 }, { hora: false }))
    confere("os dois sem hora: nenhum aspecto com Asc ou MC de ninguém", !ambosSem.aspectos.some((f) => ["asc", "mc"].includes(f.corpoA) || ["asc", "mc"].includes(f.corpoB)))
    const itens = semHora.indisponibilidades.filter((i) => i.pessoa === "A").map((i) => i.item)
    confere("sem hora: Asc, MC, IC, Desc e casas constam como indisponíveis", ["asc", "mc", "ic", "desc", "casas", "overlays"].every((x) => itens.includes(x as never)), itens.join(","))
    const real = sinastria(mapaNatal(dadosDoCaso(0, false)), mapaNatal(dadosDoCaso(5)))
    confere("mapa real sem hora: nenhum aspecto com ângulo de A", !real.aspectos.some((f) => ["asc", "mc"].includes(f.corpoA)))
  }

  // overlays: direção preservada e somem sem hora
  {
    const a = mapa({ venus: 65 }, { cusp0: 15 })
    const b = mapa({ mars: 125 }, { cusp0: 0 })
    const r = sinastria(a, b)
    // Marte de B em 125° nas casas de A (cúspide 0 em 15°): (125-15)/30 = 3,67 → casa 4
    // Vênus de A em 65° nas casas de B (cúspide 0 em 0°): 65/30 = 2,17 → casa 3
    confere("overlay B→A: Marte de B na casa 4 de A", r.overlays.some((o) => o.id === "B.mars@A.casa4" && o.direcao === "B_em_A" && o.donoDaCasa === "A" && o.donoDoPlaneta === "B"))
    confere("overlay A→B: Vênus de A na casa 3 de B", r.overlays.some((o) => o.id === "A.venus@B.casa3" && o.direcao === "A_em_B" && o.donoDaCasa === "B"))
    confere("o overlay A→B não aparece como B→A", !r.overlays.some((o) => o.id === "A.venus@B.casa3" && o.direcao === "B_em_A"))

    const bSem = sinastria(a, mapa({ mars: 125 }, { hora: false }))
    confere("B sem hora: nenhum overlay A→B (as casas são de B)", !bSem.overlays.some((o) => o.direcao === "A_em_B"))
    confere("B sem hora: o overlay B→A continua (as casas são de A)", bSem.overlays.some((o) => o.direcao === "B_em_A"))
    const aSem = sinastria(mapa({ venus: 65 }, { hora: false }), b)
    confere("A sem hora: nenhum overlay B→A", !aSem.overlays.some((o) => o.direcao === "B_em_A"))
    const ambos = sinastria(mapa({}, { hora: false }), mapa({}, { hora: false }))
    confere("os dois sem hora: nenhum overlay", ambos.overlays.length === 0)
    confere("os dois sem hora: overlays constam como indisponíveis para as duas pessoas", ["A", "B"].every((p) => ambos.indisponibilidades.some((i) => i.pessoa === p && i.item === "overlays")))
    confere("overlay só tem planetas, nunca ângulo", r.overlays.every((o) => CORPOS_MAPA.includes(o.planeta as Corpo)))
    confere("overlay não tem peso nem orbe de cúspide", r.overlays.every((o) => !("forca" in o) && !("proximoDaCuspide" in o)))

    // o planeta com intervalo que cruza uma cúspide não vira overlay firme
    const cruza = sinastria(mapa({ moon: 29 }, { hora: false, incerteza: { moon: 12 } }), mapa({}, { cusp0: 0 }))
    confere("Lua de A cujo intervalo cruza a cúspide: sem overlay firme", !cruza.overlays.some((o) => o.planeta === "moon" && o.donoDoPlaneta === "A"))
    confere("...e consta como indisponível", cruza.indisponibilidades.some((i) => i.pessoa === "A" && i.item === "overlay:moon"))
  }

  // Lua ambígua: nunca vira fato firme
  {
    const b = mapa({ moon: 200 }, { hora: false, incerteza: { moon: 13 } })
    const r = sinastria(mapa({ sun: 200 }), b)
    confere("Lua com intervalo de 13° não forma aspecto firme, nem em exata conjunção no meio", !r.aspectos.some((f) => f.corpoB === "moon"))
    confere("...mas o candidato fica registrado como recusado", r.recusadas.some((x) => x.b === "moon" && x.aspecto === "conjunction"))
    confere("...e a Lua consta como de aspectos duvidosos", r.indisponibilidades.some((i) => i.pessoa === "B" && i.item === "aspectos:moon"))

    const cruza = mapa({ moon: 207 }, { hora: false, incerteza: { moon: 13 } })
    const s = sinastria(mapa({}), cruza)
    confere("Lua que troca de signo: signo lunar indisponível", s.indisponibilidades.some((i) => i.pessoa === "B" && i.item === "signo:moon"))
    const fica = sinastria(mapa({}), mapa({ moon: 195 }, { hora: false, incerteza: { moon: 4 } }))
    confere("Lua que fica no signo: signo utilizável", !fica.indisponibilidades.some((i) => i.item === "signo:moon"))

    // com hora conhecida a Lua aspecta normalmente
    const conhecida = sinastria(mapa({ sun: 200 }), mapa({ moon: 203 }))
    confere("Lua com hora conhecida: aspecto entra", tem(conhecida, "A.sun~B.moon:conjunction"))
  }

  // varredura com o motor de verdade: sem hora, nunca há aspecto lunar
  {
    let semHoraTestados = 0
    let ambiguas = 0
    let firmes = 0
    const ref = mapaNatal(dadosDoCaso(10))
    for (let dia = 1; dia <= 28; dia++) {
      const d: DadosNascimento = { born_on: `2001-03-${String(dia).padStart(2, "0")}`, born_at: null, lat: -23.55, lon: -46.63, place_label: "x", tz: "America/Sao_Paulo" }
      const m = mapaNatal(d)
      const lua = m.corpos.find((c) => c.corpo === "moon") as CorpoNatal
      const r = sinastria(ref, m)
      semHoraTestados += 1
      confere(`motor real, ${d.born_on}: nenhum aspecto firme com a Lua de quem não sabe a hora`, !r.aspectos.some((f) => f.corpoB === "moon"))
      const sinalado = r.indisponibilidades.some((i) => i.pessoa === "B" && i.item === "signo:moon")
      confere(`motor real, ${d.born_on}: signo lunar ambíguo ⇔ indisponível`, sinalado === !lua.signoDefinido)
      if (lua.signoDefinido) firmes += 1
      else ambiguas += 1
    }
    confere("a varredura achou dias de Lua firme e de Lua ambígua", firmes > 0 && ambiguas > 0, `${firmes} firmes, ${ambiguas} ambíguas de ${semHoraTestados}`)
  }
}

// ── C · retrogradação ───────────────────────────────────────────────────────
function parteC() {
  const sp = (born_on: string, born_at: string | null): DadosNascimento => ({ born_on, born_at, lat: -23.55, lon: -46.63, place_label: "x", tz: "America/Sao_Paulo" })
  const pega = (m: MapaNatal, c: Corpo) => m.corpos.find((x) => x.corpo === c) as CorpoNatal

  // os dois casos reproduzidos na auditoria
  const casos: Array<[Corpo, string]> = [
    ["mercury", "2000-02-21"],
    ["mars", "2001-05-11"],
  ]
  for (const [corpo, dia] of casos) {
    const cedo = pega(mapaNatal(sp(dia, "00:01")), corpo)
    const tarde = pega(mapaNatal(sp(dia, "23:59")), corpo)
    const sem = pega(mapaNatal(sp(dia, null)), corpo)
    const meioDia = pega(mapaNatal(sp(dia, "12:00")), corpo)
    confere(`${corpo} em ${dia}: de manhã direto, à noite retrógrado`, cedo.retrogradoEstado === "direto" && tarde.retrogradoEstado === "retrogrado", `${cedo.retrogradoEstado} / ${tarde.retrogradoEstado}`)
    confere(`${corpo} em ${dia}: sem hora é indeterminado`, sem.retrogradoEstado === "indeterminado", sem.retrogradoEstado)
    confere(`${corpo} em ${dia}: o campo antigo continua o do meio-dia (aditivo, nada removido)`, sem.retrogrado === meioDia.retrogrado)
    confere(`${corpo} em ${dia}: com hora, o estado é firme e coerente com o campo antigo`, cedo.retrogradoEstado === (cedo.retrogrado ? "retrogrado" : "direto"))

    // e o fato de sinastria não afirma
    const r = sinastria(mapaNatal(sp("1990-06-15", "10:00")), mapaNatal(sp(dia, null)))
    confere(`${corpo} em ${dia}: constar como retrogradação indisponível na sinastria`, r.indisponibilidades.some((i) => i.pessoa === "B" && i.item === `retrogradacao:${corpo}`))
  }

  // um dia sem estação é firme
  {
    const m = mapaNatal(sp("2001-03-10", null))
    confere("dia sem estação: todos os corpos têm estado firme", m.corpos.every((c) => c.retrogradoEstado !== "indeterminado"))
  }

  // sintético: o aspecto leva o estado do corpo, e o verificador não deixa dizer "retrógrado"
  {
    const b = mapa({ mercury: 50 }, { hora: false, retro: { mercury: "indeterminado" } })
    const r = sinastria(mapa({ sun: 50 }), b)
    const f = r.aspectos.find((x) => x.id === "A.sun~B.mercury:conjunction")
    confere("o fato do aspecto carrega a retrogradação indeterminada", f?.retroB === "indeterminado")
    const v = verificarSinastria({
      texto: { afirmacoes: [{ texto: "Mercúrio de Ana está retrógrado e toca o Sol de você.", fatos: ["A.sun~B.mercury:conjunction"] }], sintese: "Mercúrio de Ana está retrógrado e toca o Sol de você." },
      resultado: r,
      locale: "pt",
      donos: { A: ["você"], B: ["Ana"] },
    })
    confere("verificador: retrogradação indeterminada dita como fato reprova", !v.ok && v.violacoes.some((x) => /retrógrado/.test(x)), JSON.stringify(v))
  }
}

// ── D · pontos em comum ─────────────────────────────────────────────────────
function parteD() {
  // dez corpos em signos de fogo e terra, tudo definido
  const fogo = { sun: 5, moon: 125, mercury: 245, venus: 15, mars: 135, jupiter: 255, saturn: 25, uranus: 145, neptune: 265, pluto: 35 }
  const a = mapa(fogo)
  const b = mapa({ ...fogo, sun: 8 })
  const r = sinastria(a, b)
  const el = r.semelhancas.find((x) => x.id === "elemento")
  confere("elemento dominante igual vira fato de semelhança", el?.tipoDeSemelhanca === "igual" && el?.padraoA === "fire")
  confere("semelhança igual leva a ressalva: parecer não é facilitar", el?.ressalvaDaFonte === "semelhanca_nao_implica_facilidade")
  confere("semelhança fica fora dos aspectos A↔B", !r.aspectos.some((x) => x.id === "elemento"))

  // ── desempate de elementos: só o que a fonte dá e o que já calculamos ──────
  // quatro de fogo, quatro de terra, dois de ar (o Sol num deles)
  const fogoTerra = { sun: 65, moon: 125, mercury: 245, venus: 15, mars: 5, jupiter: 35, saturn: 155, uranus: 275, neptune: 40, pluto: 70 }
  //   fogo: lua, mercúrio, vênus, marte (4) · terra: júpiter, saturno, urano, netuno (4) · ar: sol, plutão (2)
  const elementoDe = (m: MapaNatal) => sinastria(m, m).semelhancas.find((x) => x.id === "elemento")
  const motivosDe = (r: ResultadoSinastria) => r.indisponibilidades.filter((i) => i.item === "elemento_dominante").map((i) => `${i.pessoa}:${i.motivo}`)

  // Asc em fogo (entre os empatados): desempata pelo Ascendente
  const porAsc = elementoDe(mapa(fogoTerra, { asc: 10 }))
  confere("empate: o Ascendente entre os empatados decide", porAsc?.padraoA === "fire" && porAsc?.desempateA === "ascendente", JSON.stringify(porAsc))
  // Asc em água, Sol no ar (fora dos empatados): a fonte pede o regente, que não existe aqui
  const aguaSolAr = sinastria(mapa(fogoTerra, { asc: 95 }), mapa(fogoTerra, { asc: 95 }))
  confere("empate com o Sol FORA dos empatados: não há dominante", !aguaSolAr.semelhancas.some((x) => x.id === "elemento"))
  confere("...e o motivo é o regente do Ascendente, que ainda não está implementado", motivosDe(aguaSolAr).every((m) => /empate_exige_regente_do_ascendente/.test(m)) && motivosDe(aguaSolAr).length === 2, motivosDe(aguaSolAr).join())
  // Asc fora, mas o Sol entre os empatados: segundo critério da própria fonte (p. 40)
  const solEntre = elementoDe(mapa({ ...fogoTerra, sun: 8, mars: 75 }, { asc: 95 }))
  confere("empate com o Sol entre os empatados: segundo critério da fonte, com hora", solEntre?.desempateA === "sol" && solEntre?.padraoA === "fire", JSON.stringify(solEntre))
  // SEM HORA o Sol não substitui o Ascendente
  const semAsc = sinastria(mapa({ ...fogoTerra, sun: 8, mars: 75 }, { hora: false }), mapa({ ...fogoTerra, sun: 8, mars: 75 }, { hora: false }))
  confere("empate sem hora: NÃO desempata pelo Sol", !semAsc.semelhancas.some((x) => x.id === "elemento"))
  confere("...e o motivo é a falta do Ascendente", motivosDe(semAsc).length === 2 && motivosDe(semAsc).every((m) => /empate_sem_ascendente/.test(m)), motivosDe(semAsc).join())
  // contagem sem empate não precisa de desempate, com ou sem hora
  const limpo = sinastria(mapa(fogo, { hora: false }), mapa(fogo, { hora: false }))
  confere("sem empate, sem hora: o dominante vem da contagem", limpo.semelhancas.find((x) => x.id === "elemento")?.desempateA === "contagem")
  // modos: a fonte não dá desempate
  const modosEmpatados = mapa({ sun: 5, moon: 15, mercury: 25, venus: 35, mars: 45, jupiter: 55, saturn: 65, uranus: 125, neptune: 155, pluto: 185 })
  // cardinal: áries, câncer? (0,90,180,270) — aqui 5 cardinais (sun, moon, mercury, uranus?) e fixos: montados abaixo
  const m2 = sinastria(modosEmpatados, modosEmpatados)
  const modoItens = m2.indisponibilidades.filter((i) => i.item === "modo_dominante").map((i) => i.motivo)
  confere("modos empatados: motivo é a falta de critério na fonte, nunca o Sol", modoItens.every((m) => m === "sem_criterio_na_fonte"), modoItens.join())

  // Lua indefinida pode mudar o dominante: não há dominante firme
  const duvida = mapa({ ...fogo, moon: 207 }, { hora: false, incerteza: { moon: 13 } })
  const s = sinastria(mapa(fogo), duvida)
  const pode = s.indisponibilidades.some((i) => i.pessoa === "B" && (i.item === "elemento_dominante" || i.item === "modo_dominante")) || (s.semelhancas.find((x) => x.id === "elemento")?.condicional ?? false)
  confere("corpo com signo indefinido: o dominante ou é condicional ou é indisponível", pode)

  // mesmo corpo no mesmo signo
  const mesmoSigno = sinastria(mapa({ venus: 15 }), mapa({ venus: 20 }))
  confere("mesmo corpo no mesmo signo vira fato", mesmoSigno.semelhancas.some((x) => x.id === "signo:venus"))
  const geracional = sinastria(mapa({ pluto: 15 }), mapa({ pluto: 20 }))
  confere("Plutão no mesmo signo é marcado como geracional", geracional.semelhancas.find((x) => x.id === "signo:pluto")?.classe === "geracional")
  const outroSigno = sinastria(mapa({ venus: 15 }), mapa({ venus: 45 }))
  confere("signos diferentes: não há fato", !outroSigno.semelhancas.some((x) => x.id === "signo:venus"))

  // padrões de Jones não existem aqui
  confere("nenhum padrão de Jones", !r.semelhancas.some((x) => /bowl|bucket|bundle|locomotive|see-?saw|splash|splay/i.test(x.id + x.padraoA)))
}

// ── E · nada de score, nada de peso, nada de dignidade ──────────────────────
function parteE() {
  const r = sinastria(mapaNatal(dadosDoCaso(0)), mapaNatal(dadosDoCaso(9)))
  const chaves = Object.keys(r).sort().join(",")
  confere("o resultado tem só as chaves previstas", chaves === "aspectos,indisponibilidades,overlays,recusadas,semelhancas,versao", chaves)
  const bruto = JSON.stringify(r)
  confere("nenhum score, nota, porcentagem ou compatibilidade no resultado", !/score|compat|match|porcent|nota"|"forca":\d/i.test(bruto))
  confere("toda força é nula", r.aspectos.every((f) => f.forca === null))
  confere("nenhum fato fala de dignidade ou aflição", !/dignid|aflic|afflic|debilit|exalt/i.test(bruto))
  confere("todo fato de aspecto cita a fonte", r.aspectos.every((f) => f.fonte.regra.length > 0 && f.fonte.pdfPagina > 0))
}

// ── F · vínculo ─────────────────────────────────────────────────────────────
function parteF() {
  confere("sinastria() não recebe o vínculo: só dois mapas", sinastria.length === 2)

  const a = dadosDoCaso(0)
  const v = validarNascimento({ born_on: "1991-08-20", born_at: "07:30", lat: -22.91, lon: -43.17, place_label: "Rio" }, { hoje: "2026-10-04" })
  confere("a pessoa B de teste é válida", v.ok)
  if (!v.ok) return
  const sem = (x: unknown) => {
    const { vinculo: _v, ...resto } = x as Record<string, unknown>
    return JSON.stringify(resto)
  }
  const base = compararAvulsa({ plano: "unlimited", a, b: v.dados, vinculo: "romantico" })
  confere("a comparação com o plano Ilimitado funciona", base.ok)
  const essencial = compararAvulsa({ plano: "essential", a, b: v.dados, vinculo: "romantico" })
  confere("o plano Essencial não inclui a sinastria: 402, sem cálculo", !essencial.ok && essencial.status === 402)
  if (!base.ok) return
  for (const vinculo of VINCULOS) {
    const r = compararAvulsa({ plano: "unlimited", a, b: v.dados, vinculo })
    confere(`vínculo ${vinculo}: aspectos, orbes, overlays e semelhanças idênticos`, r.ok && sem(r) === sem(base))
    confere(`vínculo ${vinculo}: é devolvido para a síntese escolher a ênfase`, r.ok && r.vinculo === vinculo)
  }

  // e o arquivo do cálculo não menciona o vínculo fora de comentário
  const fonte = readFileSync(path.join(process.cwd(), "lib", "astro", "sinastria.ts"), "utf8")
  const semComentario = fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
  confere("sinastria.ts não usa vínculo em código", !/v[ií]nculo|vinculo|romantico|amizade/i.test(semComentario))
}

// ── G · a pessoa B não é persistida sem ação explícita ──────────────────────
async function parteG() {
  const escritas: string[] = []
  const store: PessoasStore = {
    async contar() { return escritas.filter((x) => x === "inserir").length },
    async inserir(_o: string, _l: LinhaPessoa) { escritas.push("inserir"); return { id: "p1" } },
    async obter() { escritas.push("obter"); return null },
    async listar() { escritas.push("listar"); return [] },
    async apagar() { escritas.push("apagar"); return true },
  }
  const nasc = { born_on: "1991-08-20", born_at: null, lat: -22.91, lon: -43.17, place_label: "Rio de Janeiro" }
  const v = validarNascimento(nasc, { hoje: "2026-10-04" })
  if (!v.ok) { confere("nascimento de teste válido", false, v.erro); return }

  // comparar não tem acesso a armazenamento algum: não há por onde gravar
  compararAvulsa({ plano: "unlimited", a: dadosDoCaso(0), b: v.dados, vinculo: "amizade" })
  confere("comparar não toca no armazenamento", escritas.length === 0, escritas.join(","))
  const rota = readFileSync(path.join(process.cwd(), "app", "api", "sinastria", "route.ts"), "utf8")
  confere("a rota de comparação não escreve em lugar nenhum", !/\.(insert|upsert|update|delete)\(|salvarPessoa|\.rpc\(/.test(rota))
  confere("a rota de comparação não chama modelo de linguagem", !/openai|OPENAI/i.test(rota))

  // sem plano pago, nada
  const gratis = compararAvulsa({ plano: "free", a: dadosDoCaso(0), b: v.dados, vinculo: "amizade" })
  confere("plano gratuito: 402, sem cálculo", !gratis.ok && gratis.status === 402)
  const semPlano = await salvarPessoa({ store, ownerId: "u1", plano: "free", apelido: "Ana", nascimento: nasc })
  confere("plano gratuito não salva pessoa", !semPlano.ok && semPlano.status === 402 && escritas.length === 0)

  // salvar é um ato à parte, e escreve uma vez
  const salvou = await salvarPessoa({ store, ownerId: "u1", plano: "unlimited", apelido: "  Ana   Clara ", nascimento: nasc })
  confere("salvar escreve exatamente uma vez", salvou.ok && escritas.filter((x) => x === "inserir").length === 1, escritas.join(","))

  // apelido: sem e-mail, sem vazio, sem comprimento exagerado
  confere("apelido com @ é recusado", !validarApelido("ana@exemplo.com").ok)
  confere("apelido vazio é recusado", !validarApelido("   ").ok)
  confere("apelido de 41 caracteres é recusado", !validarApelido("x".repeat(41)).ok)
  confere("apelido comum é aceito e normalizado", (() => { const r = validarApelido("  Ana   Clara "); return r.ok && r.dados === "Ana Clara" })())

  // o salvar não aceita hora fora de faixa nem cidade vazia
  const ruim = await salvarPessoa({ store, ownerId: "u1", plano: "unlimited", apelido: "Beto", nascimento: { ...nasc, place_label: "" } })
  confere("salvar exige a cidade", !ruim.ok && ruim.status === 400)
  confere("hora 99:99 é recusada", !validarNascimento({ ...nasc, born_at: "99:99" }, { hoje: "2026-10-04" }).ok)
  confere("data inexistente é recusada", !validarNascimento({ ...nasc, born_on: "1991-02-31" }, { hoje: "2026-10-04" }).ok)

  // o teto
  const cheio: PessoasStore = { ...store, async contar() { return MAX_PESSOAS } }
  const lotado = await salvarPessoa({ store: cheio, ownerId: "u1", plano: "unlimited", apelido: "Caio", nascimento: nasc })
  confere("no teto de pessoas, não salva", !lotado.ok && lotado.status === 409)

  // a rota de pessoas: apagar e listar não exigem plano
  const pessoas = readFileSync(path.join(process.cwd(), "app", "api", "sinastria", "pessoas", "route.ts"), "utf8")
  const delete_ = pessoas.slice(pessoas.indexOf("export async function DELETE"))
  confere("apagar uma pessoa não depende de plano pago", !/getUserEntitlement|isPaidPlan/.test(delete_))
}

// ── H · o verificador estrutural ────────────────────────────────────────────
function parteH() {
  const a = mapaNatal(dadosDoCaso(2))
  const b = mapaNatal(dadosDoCaso(14))
  const r = sinastria(a, b)
  const donos = { A: ["você"], B: ["Ana"] }
  const nome = (c: string) => (CORPOS.pt as Record<string, string>)[c]
  const harm = r.aspectos.find((f) => f.categoria === "harmonico")
  const disc = r.aspectos.find((f) => f.categoria === "discordante")
  confere("o par de teste tem aspecto harmônico e discordante", Boolean(harm && disc))
  if (!harm || !disc) return

  const verifica = (sintese: string, fatos: string[], resultado = r) =>
    verificarSinastria({ texto: { afirmacoes: [{ texto: sintese, fatos }], sintese }, resultado, locale: "pt", donos })
  const bom = verifica("Há um ponto de apoio e um ponto de atrito entre vocês.", [harm.id, disc.id])
  confere("texto neutro com as duas categorias passa", bom.ok, JSON.stringify(bom))

  // aspecto inexistente
  let invent: { x: string; y: string; asp: string } | null = null
  for (const x of CORPOS_MAPA) for (const y of CORPOS_MAPA) for (const asp of ["trine", "square", "sextile"]) {
    if (!invent && x !== y && !r.aspectos.some((f) => f.aspecto === asp && ((f.corpoA === x && f.corpoB === y) || (f.corpoA === y && f.corpoB === x)))) invent = { x, y, asp }
  }
  const aspPt = ASPECTOS.pt as Record<string, string>
  if (invent) {
    const v = verifica(`${nome(invent.x)} de você faz ${aspPt[invent.asp]} com ${nome(invent.y)} de Ana.`, [harm.id, disc.id])
    confere("verificador: aspecto inexistente reprova", !v.ok && v.violacoes.some((x) => /inexistente/.test(x)), JSON.stringify(v))
  }

  // dono trocado
  const real = r.aspectos.find((f) => f.corpoA !== f.corpoB && f.corpoA !== "asc" && f.corpoA !== "mc" && f.corpoB !== "asc" && f.corpoB !== "mc" && !r.aspectos.some((g) => g.aspecto === f.aspecto && g.corpoA === f.corpoB && g.corpoB === f.corpoA))
  if (real) {
    const certo = verifica(`${nome(real.corpoA)} de você faz ${aspPt[real.aspecto] ?? real.aspecto} com ${nome(real.corpoB)} de Ana.`, [harm.id, disc.id])
    confere("verificador: o aspecto na ordem certa não reprova por dono", !(certo.ok === false && certo.violacoes.some((x) => /dono trocado/.test(x))), JSON.stringify(certo))
    const trocado = verifica(`${nome(real.corpoB)} de você faz ${aspPt[real.aspecto] ?? real.aspecto} com ${nome(real.corpoA)} de Ana.`, [harm.id, disc.id])
    confere("verificador: trocar A e B reprova", !trocado.ok && trocado.violacoes.some((x) => /dono trocado/.test(x)), JSON.stringify(trocado))
  } else {
    confere("havia um aspecto não simétrico para testar a troca de dono", false)
  }

  // sem hora: Ascendente e casas
  const semHora = sinastria(mapaNatal(dadosDoCaso(2, false)), mapaNatal(dadosDoCaso(14, false)))
  const h1 = verifica("O Ascendente de Ana sustenta o que vocês têm em comum.", [harm.id, disc.id], semHora)
  confere("verificador: Ascendente sem hora reprova", !h1.ok && h1.violacoes.some((x) => /Ascendente/.test(x)), JSON.stringify(h1))
  const h2 = verifica("Vênus de Ana está na casa 7 de você.", [harm.id, disc.id], semHora)
  confere("verificador: casa sem overlay reprova", !h2.ok && h2.violacoes.some((x) => /casa 7/.test(x)), JSON.stringify(h2))

  // Lua ambígua
  let ambigua: { dia: string } | null = null
  for (let d = 1; d <= 28 && !ambigua; d++) {
    const dia = `2001-03-${String(d).padStart(2, "0")}`
    const m = mapaNatal({ born_on: dia, born_at: null, lat: -23.55, lon: -46.63, place_label: "x", tz: "America/Sao_Paulo" })
    if (!(m.corpos.find((c) => c.corpo === "moon") as CorpoNatal).signoDefinido) ambigua = { dia }
  }
  if (ambigua) {
    const rr = sinastria(a, mapaNatal({ born_on: ambigua.dia, born_at: null, lat: -23.55, lon: -46.63, place_label: "x", tz: "America/Sao_Paulo" }))
    const v = verifica("A Lua de Ana está em Touro e acolhe o que há de comum.", [harm.id, disc.id], rr)
    confere("verificador: signo da Lua ambígua dito como certo reprova", !v.ok && v.violacoes.some((x) => /Lua/.test(x)), JSON.stringify(v))
    const ok = verifica("A Lua de você está em Touro e acolhe o que há de comum.", [harm.id, disc.id], rr)
    confere("verificador: o signo da Lua de quem tem hora conhecida não reprova", ok.ok || !ok.violacoes.some((x) => /Lua/.test(x)), JSON.stringify(ok))
  } else {
    confere("havia um dia de Lua ambígua para testar", false)
  }

  // vocabulário vetado
  confere("verificador: veredito reprova", !verifica("Vocês são compatíveis.", [harm.id, disc.id]).ok)
  confere("verificador: porcentagem reprova", !verifica("A relação tem 80% de afinidade.", [harm.id, disc.id]).ok)
  confere("verificador: alma gêmea reprova", !verifica("São almas gêmeas.", [harm.id, disc.id]).ok)
  confere("verificador: previsão reprova", !verifica("Essa relação vai dar certo.", [harm.id, disc.id]).ok)
  confere("verificador: karma reprova", !verifica("Há um vínculo kármico entre vocês.", [harm.id, disc.id]).ok)
  confere("verificador: dignidade não calculada reprova", !verifica("Vênus está fortalecida nesse encontro.", [harm.id, disc.id]).ok)

  // fatos
  const semFato = verificarSinastria({ texto: { afirmacoes: [{ texto: "Algo se encontra.", fatos: ["zzz"] }], sintese: "Algo se encontra." }, resultado: r, locale: "pt", donos })
  confere("verificador: fato inexistente reprova", !semFato.ok && semFato.violacoes.some((x) => /não existe/.test(x)))
  const nenhum = verificarSinastria({ texto: { afirmacoes: [{ texto: "Algo se encontra.", fatos: [] }], sintese: "Algo se encontra." }, resultado: r, locale: "pt", donos })
  confere("verificador: afirmação sem fato reprova", !nenhum.ok)

  // presença de tensão e de facilidade, sem votação
  const soHarm = verifica("Há um ponto de apoio entre vocês.", [harm.id])
  confere("verificador: omitir todas as tensões reprova", !soHarm.ok && soHarm.violacoes.some((x) => /tensões/.test(x)), JSON.stringify(soHarm))
  const soDisc = verifica("Há um ponto de atrito entre vocês.", [disc.id])
  confere("verificador: omitir todas as facilidades reprova", !soDisc.ok && soDisc.violacoes.some((x) => /facilidades/.test(x)), JSON.stringify(soDisc))
  // citar UM de cada basta, não importa quantos existam de cada lado
  confere("verificador: um de cada passa, sem contar", verifica("Há apoio e há atrito entre vocês.", [harm.id, disc.id]).ok)
}

async function main() {
  parteA()
  parteB()
  parteC()
  parteD()
  parteE()
  parteF()
  await parteG()
  parteH()

  if (falhas.length) {
    console.error(`\nA sinastria falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas.slice(0, 40)) console.error(`  ${f}`)
    if (falhas.length > 40) console.error(`  ... e mais ${falhas.length - 40}`)
    console.error("")
    process.exit(1)
  }
  console.log(`sinastria: ${conferidos} conferências (orbes, ângulos, hora desconhecida, retrogradação, overlays, vínculo, persistência, verificador)`)
}

main()
