/**
 * Proteção do seletor determinístico de evidência. Roda antes do build
 * (npm run verify:sinastria-selecao).
 *
 * O que trava:
 *  - determinismo, e independência da ordem em que os fatos chegam;
 *  - que o vínculo não entra, e que não existe score, nota nem veredito;
 *  - que todo fato de entrada tem destino (selecionado, reforço ou descartado
 *    com motivo) e nada de fora da entrada aparece;
 *  - o universo: nada indisponível, nenhuma frase dependente de condição natal
 *    não calculada, e as de aspectos só quando a relação tem aspecto discordante;
 *  - a ordem: critérios de fonte e editoriais exatamente como declarados;
 *  - a diversidade sem cota, a deduplicação pela mesma glosa e o orçamento;
 *  - as semelhanças como camada separada.
 *
 * Nenhuma chamada paga. Mapas reais vêm do corpus de validação do motor.
 */
import { readFileSync } from "fs"
import path from "path"
import { glosaDaSemelhanca, glosaDoOverlay, glosasDoAspecto, INTERASPECTOS, OVERLAYS, SEMELHANCAS } from "../lib/astro/davison"
import { camposDeSemelhanca } from "../lib/astro/davison/validar-semelhanca"
import type { Corpo } from "../lib/astro/ceu"
import { grauNoSigno, indiceDoSigno } from "../lib/astro/ceu"
import { CORPOS_MAPA, type CorpoNatal, type MapaNatal } from "../lib/astro/mapa"
import { sinastria, type ResultadoSinastria } from "../lib/astro/sinastria"
import { CRITERIOS, ORCAMENTO_PADRAO, selecionarEvidencia, type SelecaoSinastria } from "../lib/astro/selecao-sinastria"
import { amostra } from "./simular-selecao-sinastria"
import { mapaNatal } from "../lib/astro/mapa"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

function mapa(lons: Partial<Record<Corpo, number>>, o: { hora?: boolean; asc?: number; mc?: number; cusp0?: number } = {}): MapaNatal {
  const hora = o.hora ?? true
  const cusp0 = o.cusp0 ?? 0
  const corpos: CorpoNatal[] = CORPOS_MAPA.map((c, i) => {
    const lon = lons[c] ?? (i * 36 + 7) % 360
    return { corpo: c, lon, signo: indiceDoSigno(lon), grau: grauNoSigno(lon), retrogrado: false, retrogradoEstado: "direto", casa: null, incerteza: 0, signoDefinido: true }
  })
  return {
    tz: "America/Sao_Paulo", tzStatus: "ok", jdUt: 0, horaConhecida: hora, sistemaCasas: hora ? "whole_sign" : "", corpos,
    asc: hora ? (o.asc ?? cusp0) : null, mc: hora ? (o.mc ?? (cusp0 + 270) % 360) : null,
    cusp0: undefined, cuspides: hora ? Array.from({ length: 12 }, (_, i) => (cusp0 + i * 30) % 360) : null, aspectos: [],
  } as unknown as MapaNatal
}

const todosOsIds = (r: ResultadoSinastria) => [...r.aspectos.map((f) => f.id), ...r.overlays.map((f) => f.id), ...r.semelhancas.map((f) => f.id)]
const idsDaSelecao = (s: SelecaoSinastria) => [
  ...s.aspectos.flatMap((d) => [d.principal.id, ...d.reforcos.map((f) => f.id)]),
  ...s.overlays.flatMap((d) => [d.principal.id, ...d.reforcos.map((f) => f.id)]),
  ...s.semelhancas.map((x) => x.fato.id),
  ...s.descartes.map((d) => d.fato),
]
const embaralha = <T,>(xs: T[]): T[] => xs.map((x, i) => [x, (i * 7919) % 13] as const).sort((a, b) => a[1] - b[1] || 0).map((p) => p[0]).reverse()

const LENTOS = ["uranus", "neptune", "pluto"]
const PARES_INDICE = ["moon|sun", "mercury|mercury", "mars|venus"]
const parDe = (a: string, b: string) => [a, b].sort().join("|")

// ── A · a amostra real ──────────────────────────────────────────────────────
function parteA() {
  const casos = amostra()
  confere("a amostra tem pares com e sem hora", casos.some((c) => c.b.born_at === null) && casos.some((c) => c.a.born_at !== null))
  const contagens = new Set<number>()
  for (const c of casos) {
    const r = sinastria(mapaNatal(c.a), mapaNatal(c.b))
    const s = selecionarEvidencia(r)
    const rot = c.rotulo

    // determinismo e independência da ordem de chegada
    const igual = JSON.stringify(s) === JSON.stringify(selecionarEvidencia(r))
    confere(`${rot}: mesma entrada, mesma saída`, igual)
    const baralhado: ResultadoSinastria = { ...r, aspectos: embaralha(r.aspectos), overlays: embaralha(r.overlays), semelhancas: embaralha(r.semelhancas), indisponibilidades: embaralha(r.indisponibilidades) }
    confere(`${rot}: a ordem em que os fatos chegam não muda a seleção`, JSON.stringify(s) === JSON.stringify(selecionarEvidencia(baralhado)))

    // todo fato de entrada tem exatamente um destino, e nada de fora aparece
    const entrada = todosOsIds(r)
    const saida = idsDaSelecao(s)
    confere(`${rot}: todo fato tem destino exatamente uma vez`, entrada.length === saida.length && new Set(saida).size === saida.length && entrada.every((id) => saida.includes(id)), `entrada ${entrada.length}, destinos ${saida.length}`)
    confere(`${rot}: nenhum fato aparece que não esteja na entrada`, saida.every((id) => entrada.includes(id)))
    confere(`${rot}: todo descarte tem motivo e detalhe`, s.descartes.every((d) => ["sem_evidencia_interpretativa", "fora_do_orcamento", "geracional"].includes(d.motivo) && d.detalhe.length > 10))

    // universo: indisponíveis passam inteiros; nada indisponível vira evidência
    confere(`${rot}: as indisponibilidades passam inteiras para a síntese`, s.indisponibilidades.length === r.indisponibilidades.length)
    if (c.b.born_at === null) confere(`${rot}: sem hora de B, nenhum overlay com as casas de B`, !s.overlays.some((d) => [d.principal, ...d.reforcos].some((f) => f.tipo === "overlay" && f.donoDaCasa === "B")))
    if (c.a.born_at === null) confere(`${rot}: sem hora de A, nenhum overlay com as casas de A`, !s.overlays.some((d) => [d.principal, ...d.reforcos].some((f) => f.tipo === "overlay" && f.donoDaCasa === "A")))

    // nenhuma frase dependente de condição natal; as de aspectos só se a relação tem discordante
    const temDisc = r.aspectos.some((f) => f.categoria === "discordante")
    for (const d of [...s.aspectos, ...s.overlays]) {
      const g = (d.evidencia?.natureza === "overlay" ? OVERLAYS : INTERASPECTOS).find((x) => x.id === d.evidencia?.glosa)
      for (const i of d.evidencia?.itens ?? []) {
        const cond = g?.condicoesPorItem[i.ref]
        if (cond?.natal) confere(`${rot}: ${d.id} ${i.ref} depende de condição natal e entrou como evidência`, false)
        if (cond?.aspectos && !temDisc) confere(`${rot}: ${d.id} ${i.ref} depende de aspecto discordante que a relação não tem`, false)
      }
    }
    confere(`${rot}: nenhuma frase de condição natal na evidência`, true)

    // ordem: exatamente os critérios declarados, recalculados aqui
    const chave = (d: (typeof s.aspectos)[number]) => {
      const f = d.principal
      if (f.tipo !== "aspecto") return [0]
      return [LENTOS.includes(f.corpoA) && LENTOS.includes(f.corpoB) ? 1 : 0, PARES_INDICE.includes(parDe(f.corpoA, f.corpoB)) ? 0 : 1, ["sun", "moon", "asc", "mc"].includes(f.corpoA) || ["sun", "moon", "asc", "mc"].includes(f.corpoB) ? 0 : 1, f.orbe]
    }
    let ordenado = true
    for (let i = 1; i < s.aspectos.length; i++) {
      const a = chave(s.aspectos[i - 1])
      const b = chave(s.aspectos[i])
      for (let k = 0; k < 4; k++) { if (a[k] < b[k]) break; if (a[k] > b[k]) { ordenado = false; break } }
    }
    confere(`${rot}: a camada de aspectos segue a ordem (geracional por último, índice, central, orbe)`, ordenado)

    // orçamento por camada
    confere(`${rot}: aspectos dentro do orçamento`, s.tokens.aspectos <= ORCAMENTO_PADRAO.aspectos)
    confere(`${rot}: overlays dentro do orçamento`, s.tokens.overlays <= ORCAMENTO_PADRAO.overlays)
    confere(`${rot}: semelhanças dentro do orçamento`, s.tokens.semelhancas <= ORCAMENTO_PADRAO.semelhancas)
    confere(`${rot}: a evidência da sinastria cabe em 5 mil tokens`, s.tokens.total <= 5000, String(s.tokens.total))

    // contradição preservada: se há os dois lados, a seleção os tem
    const cats = new Set(r.aspectos.map((f) => f.categoria))
    const catsSel = new Set(s.aspectos.flatMap((d) => d.categorias))
    if (cats.has("harmonico")) confere(`${rot}: o lado harmônico existia e foi mantido`, catsSel.has("harmonico"))
    if (cats.has("discordante")) confere(`${rot}: o lado discordante existia e foi mantido`, catsSel.has("discordante"))

    // overlay: o id da dinâmica é a glosa do planeta e da casa, e a direção vem no fato
    for (const d of s.overlays) {
      const principal = d.principal
      if (principal.tipo === "overlay") confere(`${rot}: ${d.id} tem a glosa do planeta e da casa certos`, d.id === `${principal.planeta}@casa${principal.casa}`)
      confere(`${rot}: ${d.id} traz a direção em cada fato`, [d.principal, ...d.reforcos].every((f) => f.tipo === "aspecto" || f.direcao === "A_em_B" || f.direcao === "B_em_A"))
    }
    // nenhuma dinâmica sem evidência; e aspecto com Asc/MC só atravessa se for conjunção, e na camada de overlays
    confere(`${rot}: toda dinâmica tem evidência interpretativa`, [...s.aspectos, ...s.overlays].every((d) => d.evidencia.itens.length > 0))
    confere(`${rot}: aspecto com Asc/MC sem glosa não atravessa o seletor`, [...s.aspectos, ...s.overlays].every((d) => [d.principal, ...d.reforcos].every((f) => f.tipo !== "aspecto" || !(["asc", "mc"].includes(f.corpoA) || ["asc", "mc"].includes(f.corpoB)) || (f.aspecto === "conjunction" && d.camada === "overlays"))))
    confere(`${rot}: os barrados constam no diagnóstico e nos descartes`, s.diagnostico.semEvidenciaInterpretativa.every((id) => s.descartes.some((d) => d.fato === id && d.motivo === "sem_evidencia_interpretativa")))
    // o mesmo par só se funde com identidade de leitura: duas dinâmicas do mesmo par nunca repetem frase
    const porGlosa = new Map<string, string[]>()
    for (const d of s.aspectos) porGlosa.set(d.glosaId, [...(porGlosa.get(d.glosaId) ?? []), ...d.evidencia.itens.filter((i) => i.tipo !== "papel").map((i) => i.ref)])
    confere(`${rot}: duas dinâmicas do mesmo par nunca repetem frase`, [...porGlosa.values()].every((refs) => new Set(refs).size === refs.length))
    // conjunção com ângulo vai para a camada de overlays, nunca para a de aspectos
    confere(`${rot}: conjunção com Asc ou MC não está na camada de aspectos`, !s.aspectos.some((d) => [d.principal, ...d.reforcos].some((f) => f.tipo === "aspecto" && f.aspecto === "conjunction" && (["asc", "mc"].includes(f.corpoA) || ["asc", "mc"].includes(f.corpoB)))))

    // semelhanças: nenhuma chega sem material interpretativo do livro
    confere(`${rot}: toda semelhança selecionada tem glosa e evidência`, s.semelhancas.every((x) => x.glosaId.length > 0 && x.itens.length > 0 && glosaDaSemelhanca(x.fato) !== null))
    confere(`${rot}: nenhuma semelhança sem glosa chega à saída`, s.semelhancas.every((x) => glosaDaSemelhanca(x.fato)?.id === x.glosaId))
    confere(`${rot}: o que o livro não interpreta consta como sem evidência interpretativa`, r.semelhancas.filter((f) => !glosaDaSemelhanca(f) && !(f.dimensao === "signo_do_corpo" && f.classe === "geracional")).every((f) => s.descartes.some((d) => d.fato === f.id && d.motivo === "sem_evidencia_interpretativa") && s.diagnostico.semEvidenciaInterpretativa.includes(f.id)))
    // a camada de semelhanças não compete: tirá-la da entrada não muda aspectos nem overlays
    const semSem = selecionarEvidencia({ ...r, semelhancas: [] })
    confere(`${rot}: semelhanças não competem com aspectos e overlays por ranking nem por orçamento`, JSON.stringify(semSem.aspectos) === JSON.stringify(s.aspectos) && JSON.stringify(semSem.overlays) === JSON.stringify(s.overlays))
    confere(`${rot}: as ressalvas gerais só vêm quando há semelhança igual selecionada`, (s.ressalvasDasSemelhancas.length > 0) === s.semelhancas.some((x) => x.fato.tipoDeSemelhanca === "igual"))
    contagens.add(s.aspectos.length * 100 + s.overlays.length)
    // as semelhanças estão separadas
    confere(`${rot}: semelhança não aparece nas camadas de aspecto nem de overlay`, !s.aspectos.concat(s.overlays).some((d) => [d.principal, ...d.reforcos].some((f) => f.tipo === ("semelhanca" as never))))
  }
  confere("não há cota: o número de dinâmicas escolhidas varia de relação para relação", contagens.size > 3, String(contagens.size))
}

// ── B · entradas construídas ────────────────────────────────────────────────
function parteB() {
  // dedup: só com identidade de leitura (mesma glosa, mesmas frases, mesma valência)
  {
    const r = sinastria(mapa({ sun: 10, moon: 130 }), mapa({ moon: 70, sun: 250 }))
    const ids = r.aspectos.map((f) => f.id)
    confere("o caso de dedup tem os dois fatos", ids.includes("A.sun~B.moon:sextile") && ids.includes("A.moon~B.sun:trine"))
    const s = selecionarEvidencia(r)
    const grupos = s.aspectos.filter((d) => d.glosaId === "sun-moon")
    confere("sextil e trígono do mesmo par usam a MESMA leitura favorável: viram uma dinâmica", grupos.length === 1 && grupos[0].reforcos.length === 1, `${grupos.length} grupos`)
    confere("...cuja evidência não duplica nenhuma frase", (grupos[0]?.evidencia.itens.length ?? 0) > 0 && new Set(grupos[0]?.evidencia.itens.map((i) => i.ref)).size === grupos[0]?.evidencia.itens.length)
    confere("...e o id diz a glosa e a leitura", grupos[0]?.id === "sun-moon:favoravel", grupos[0]?.id)
  }

  // moon-venus: sextil (leitura favorável) e quadratura (leitura adversa) são do mesmo par e NÃO se fundem
  {
    const base = sinastria(mapa({ moon: 10, venus: 100 }), mapa({ venus: 70, moon: 190 }))
    const quer = ["A.moon~B.venus:sextile", "A.venus~B.moon:square"]
    const dois: ResultadoSinastria = { ...base, aspectos: base.aspectos.filter((f) => quer.includes(f.id)), overlays: [], semelhancas: [] }
    confere("o caso moon-venus tem o sextil e a quadratura", dois.aspectos.length === 2, dois.aspectos.map((f) => f.id).join(","))
    const s = selecionarEvidencia(dois)
    const g = s.aspectos.filter((d) => d.glosaId === "moon-venus")
    confere("sextil e quadratura de moon-venus ficam em DUAS dinâmicas", g.length === 2 && g.every((d) => d.reforcos.length === 0), g.map((d) => d.id).join(","))
    confere("...cada uma com a leitura que o livro lhe dá (favorável e adversa)", g.some((d) => d.id === "moon-venus:favoravel") && g.some((d) => d.id.startsWith("moon-venus:adverso")), g.map((d) => d.id).join(","))
    confere("...e as frases de uma não aparecem na outra", (() => { const [a, b] = g; return Boolean(a && b) && a.evidencia.itens.filter((i) => i.tipo !== "papel").every((i) => !b.evidencia.itens.some((j) => j.ref === i.ref)) })())
    confere("o diagnóstico registra o agrupamento desfeito", s.diagnostico.agrupamentosDesfeitos === 1, String(s.diagnostico.agrupamentosDesfeitos))
  }

  // aspecto com Asc/MC sem glosa NÃO atravessa o seletor
  {
    const base = sinastria(mapa({}, { asc: 100, mc: 190 }), mapa({ venus: 220, sun: 250 }))
    const brutos = base.aspectos.filter((f) => f.id === "A.asc~B.venus:trine" || f.id === "A.mc~B.sun:sextile")
    confere("os aspectos com Asc e MC existem como fatos brutos", brutos.length === 2, brutos.map((f) => f.id).join(","))
    const s = selecionarEvidencia({ ...base, aspectos: brutos, overlays: [], semelhancas: [] })
    confere("nenhum aspecto com Asc/MC sem glosa chega às dinâmicas", s.aspectos.length === 0 && s.overlays.length === 0)
    confere("ficam registrados como sem evidência interpretativa", s.diagnostico.semEvidenciaInterpretativa.length === 2 && s.descartes.every((d) => d.motivo === "sem_evidencia_interpretativa"))
    confere("não gastam token de evidência", s.tokens.aspectos === 0 && s.tokens.overlays === 0)
    confere("não contam para a trava de contraponto nem para as categorias", s.diagnostico.contraponto === null && s.aspectos.every((d) => d.categorias.length === 0))
    // e a conjunção com o ângulo, que o livro trata nas casas 1 e 10, continua tratada
    const comConj = sinastria(mapa({}, { asc: 100 }), mapa({ sun: 101 }))
    const sc = selecionarEvidencia({ ...comConj, aspectos: comConj.aspectos.filter((f) => f.id === "A.asc~B.sun:conjunction"), overlays: [], semelhancas: [] })
    confere("a conjunção com o Asc continua sustentada pela leitura da casa 1", sc.overlays.some((d) => d.id === "sun@casa1"))
  }

  // dois lados quando só há harmônicos: o seletor não inventa o outro
  {
    const r = sinastria(mapa({ sun: 10 }), mapa({ moon: 70 }))
    const soHarm: ResultadoSinastria = { ...r, aspectos: r.aspectos.filter((f) => f.categoria === "harmonico") }
    const s = selecionarEvidencia(soHarm)
    confere("só harmônicos na entrada: nenhum discordante na saída", s.aspectos.every((d) => d.categorias.every((c) => c !== "discordante")))
    // e nenhuma frase condicionada a aspecto discordante entra
    const g = (id: string) => INTERASPECTOS.find((x) => x.id === id)
    for (const d of s.aspectos) for (const i of d.evidencia?.itens ?? []) confere(`sem discordante na relação, ${d.id} ${i.ref} não depende de aspecto discordante`, !g(d.id)?.condicoesPorItem[i.ref]?.aspectos)
  }

  // geracional por último, mesmo com orbe exato, quando o orçamento só dá para um
  {
    const r = sinastria(mapa({ uranus: 10, venus: 100, sun: 200 }), mapa({ neptune: 10, sun: 102, moon: 300 }))
    const tem = r.aspectos.some((f) => f.id === "A.uranus~B.neptune:conjunction") && r.aspectos.some((f) => f.id === "A.venus~B.sun:conjunction")
    confere("o caso do geracional tem os dois fatos", tem)
    const s = selecionarEvidencia(r, { orcamento: { aspectos: 420 } })
    confere("com orçamento para pouco, o aspecto geracional não passa à frente do não geracional", s.aspectos.length > 0 && !(LENTOS.includes((s.aspectos[0].principal as { corpoA: string }).corpoA) && LENTOS.includes((s.aspectos[0].principal as { corpoB: string }).corpoB)))
  }

  // o ranking não é mexido por lado nem por dimensão: a ordem de relevância cortada pelo orçamento
  {
    const base = sinastria(mapa({ sun: 10, mars: 200 }), mapa({ moon: 70, venus: 130, saturn: 290 }))
    const quer = ["A.sun~B.moon:sextile", "A.sun~B.venus:trine", "A.mars~B.saturn:square"]
    const tres: ResultadoSinastria = { ...base, aspectos: base.aspectos.filter((f) => quer.includes(f.id)), overlays: [], semelhancas: [] }
    confere("o caso do ranking tem os três fatos", tres.aspectos.length === 3, tres.aspectos.map((f) => f.id).join(","))
    const cheio = selecionarEvidencia(tres, { orcamento: { aspectos: 99999 } })
    const tok = (id: string) => cheio.aspectos.find((d) => d.glosaId === id)?.tokens ?? 0
    confere("ordem de relevância: índice, central, e por último a não central", cheio.aspectos.map((d) => d.glosaId).join(",") === "sun-moon,sun-venus,mars-saturn", cheio.aspectos.map((d) => d.glosaId).join(","))
    // orçamento para as duas primeiras: a discordante, menos relevante, NÃO passa à frente da segunda harmônica
    const s2 = selecionarEvidencia(tres, { orcamento: { aspectos: tok("sun-moon") + tok("sun-venus") } })
    confere("o lado ausente não promove um fato menos relevante: ficam as duas mais relevantes", s2.aspectos.map((d) => d.glosaId).join(",") === "sun-moon,sun-venus", s2.aspectos.map((d) => d.glosaId).join(","))
    confere("a trava de contraponto vê o lado discordante disponível e NÃO o inclui, sem orçamento", s2.diagnostico.contraponto?.lado === "discordante" && s2.diagnostico.contraponto?.incluido === false)
    confere("...e registra 'contraponto disponível mas não selecionado por orçamento'", s2.descartes.some((d) => d.motivo === "fora_do_orcamento" && /contraponto disponível mas não selecionado por orçamento/.test(d.detalhe)))
    confere("nada foi retirado para produzir equilíbrio", s2.aspectos.every((d) => !d.contraponto))
  }

  // a trava inclui o contraponto quando sobra orçamento, sem retirar ninguém
  {
    const base = sinastria(mapa({ sun: 10, mars: 200, venus: 20, jupiter: 300 }), mapa({ moon: 70, saturn: 130, jupiter: 140, pluto: 20 }))
    const quer = ["A.sun~B.moon:sextile", "A.sun~B.saturn:trine", "A.venus~B.jupiter:trine", "A.mars~B.pluto:sextile"]
    const todos: ResultadoSinastria = { ...base, aspectos: base.aspectos.filter((f) => quer.includes(f.id)), overlays: [], semelhancas: [] }
    // acrescenta um discordante pouco relevante e pequeno
    const central = ["sun", "moon", "asc", "mc"]
    const disc = base.aspectos.find((f) => f.categoria === "discordante" && !central.includes(f.corpoA) && !central.includes(f.corpoB) && !LENTOS.includes(f.corpoA) && !LENTOS.includes(f.corpoB))
    const univ: ResultadoSinastria = { ...todos, aspectos: disc ? [...todos.aspectos, disc] : todos.aspectos }
    const cheio = selecionarEvidencia(univ, { orcamento: { aspectos: 99999 } })
    const sd = disc ? cheio.aspectos.find((d) => [d.principal, ...d.reforcos].some((f) => f.id === disc.id)) : undefined
    confere("o caso do contraponto tem um discordante disponível", Boolean(disc && sd))
    if (sd) {
      const harm = cheio.aspectos.filter((d) => d !== sd)
      const gasto = harm.reduce((n, d) => n + d.tokens, 0)
      // o orçamento dá para todas as harmônicas, e sobra o suficiente para o contraponto, mas não mais
      const s = selecionarEvidencia(univ, { orcamento: { aspectos: gasto + sd.tokens } })
      confere("com orçamento sobrando, a seleção contém os dois lados", s.aspectos.some((d) => d.categorias.includes("discordante")))
      // para forçar o caso da trava, tira-se o orçamento do discordante da ordem: ele é o último, então
      // um orçamento só para as harmônicas deixa de fora o discordante, e depois sobra pouco
      const justoAsHarm = selecionarEvidencia(univ, { orcamento: { aspectos: gasto } })
      confere("sem sobra, o discordante fica de fora e a trava registra o contraponto não incluído", justoAsHarm.diagnostico.contraponto?.incluido === false && justoAsHarm.aspectos.every((d) => !d.categorias.includes("discordante")))
    }
  }

  // o corte é um prefixo da ordem: nada menos relevante passa à frente por caber
  {
    const base = sinastria(mapa({ sun: 10, venus: 20 }), mapa({ moon: 70, saturn: 130, jupiter: 140 }))
    const quer = ["A.sun~B.moon:sextile", "A.sun~B.saturn:trine", "A.venus~B.jupiter:trine"]
    const tres: ResultadoSinastria = { ...base, aspectos: base.aspectos.filter((f) => quer.includes(f.id)), overlays: [], semelhancas: [] }
    const cheio = selecionarEvidencia(tres, { orcamento: { aspectos: 99999 } })
    const tok = (id: string) => cheio.aspectos.find((d) => d.glosaId === id)?.tokens ?? 0
    confere("o caso do prefixo tem as três dinâmicas, e a segunda é maior que a terceira", cheio.aspectos.length === 3 && tok("sun-saturn") > tok("venus-jupiter"), `${tok("sun-saturn")} contra ${tok("venus-jupiter")}`)
    const s = selecionarEvidencia(tres, { orcamento: { aspectos: tok("sun-moon") + tok("venus-jupiter") } })
    confere("a segunda não cabe: a terceira, menor, NÃO passa à frente dela", s.aspectos.map((d) => d.glosaId).join(",") === "sun-moon", s.aspectos.map((d) => d.glosaId).join(","))
  }

  // semelhança geracional sai, a rápida fica, e elas são camada própria
  {
    // os demais corpos de B ficam longe dos de A, para só estes dois dividirem signo
    const longe: Partial<Record<Corpo, number>> = {}
    CORPOS_MAPA.forEach((c, i) => { longe[c] = (i * 36 + 7 + 95) % 360 })
    const r = sinastria(mapa({ pluto: 15, venus: 15 }), mapa({ ...longe, pluto: 20, venus: 20 }))
    const s = selecionarEvidencia(r)
    confere("mesmo signo em Plutão é descartado como geracional", s.descartes.some((d) => d.fato === "signo:pluto" && d.motivo === "geracional"))
    confere("mesmo signo em Vênus fica, como semelhança", s.semelhancas.some((x) => x.fato.id === "signo:venus"))
    confere("semelhança não ocupa o orçamento dos aspectos", s.tokens.aspectos <= ORCAMENTO_PADRAO.aspectos)
  }

  // conjunção com o Ascendente: camada de overlays, evidência da casa 1, e vem primeiro
  {
    const r = sinastria(mapa({}, { asc: 100 }), mapa({ sun: 101 }))
    confere("o caso do ângulo tem a conjunção com o Asc", r.aspectos.some((f) => f.id === "A.asc~B.sun:conjunction"))
    const s = selecionarEvidencia(r)
    const d = s.overlays.find((x) => x.id === "sun@casa1")
    confere("conjunção do Sol de B com o Asc de A vira a dinâmica sun@casa1 na camada de overlays", Boolean(d))
    confere("...e é ordenada pelo critério do ângulo da casa", Boolean(d?.porque.includes("angulo_da_casa")))
    confere("...com os fatos de aspecto e de overlay juntos quando ambos existem", Boolean(d) && [d!.principal, ...d!.reforcos].some((f) => f.tipo === "aspecto"))
  }

  // sem hora: nada de ângulo, nada de overlay das casas de quem não tem hora
  {
    const r = sinastria(mapa({}, { hora: false }), mapa({ sun: 101 }, { hora: false }))
    const s = selecionarEvidencia(r)
    confere("os dois sem hora: nenhuma dinâmica de overlay", s.overlays.length === 0)
    confere("os dois sem hora: as indisponibilidades de Asc e MC chegam à síntese", ["A", "B"].every((p) => s.indisponibilidades.some((i) => i.pessoa === p && i.item === "asc")))
  }

  // o orçamento é respeitado até quando é pequeno, e um orçamento zero não seleciona nada
  {
    const r = sinastria(mapaNatal(amostra()[0].a), mapaNatal(amostra()[0].b))
    const s0 = selecionarEvidencia(r, { orcamento: { aspectos: 0, overlays: 0, semelhancas: 0 } })
    confere("orçamento zero: nenhuma dinâmica nem semelhança", s0.aspectos.length === 0 && s0.overlays.length === 0 && s0.semelhancas.length === 0)
    confere("orçamento zero: tudo vira descarte por orçamento, com destino para todos", idsDaSelecao(s0).length === todosOsIds(r).length)
    const sGrande = selecionarEvidencia(r, { orcamento: { aspectos: 99999, overlays: 99999, semelhancas: 99999 } })
    confere("orçamento enorme: nenhum descarte por orçamento", !sGrande.descartes.some((d) => d.motivo === "fora_do_orcamento"))
  }
}

// ── C · sem score, sem vínculo, critérios declarados ────────────────────────
function parteC() {
  const r = sinastria(mapaNatal(amostra()[0].a), mapaNatal(amostra()[0].b))
  const s = selecionarEvidencia(r)
  const chaves = (o: unknown): string[] => (Array.isArray(o) ? o.flatMap(chaves) : o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => [k, ...chaves(v)]) : [])
  const ks = chaves(s).join(" ")
  confere("nenhuma chave de score, nota, pontuação, compatibilidade ou veredito na saída", !/\b(score|nota|pontuacao|compatibilidade|compat|veredito|match|ranking_geral)\b/i.test(ks), ks.match(/\b(score|nota|pontuacao|compat\w*|veredito|match)\b/i)?.[0])
  confere("'forca' continua nula onde aparece", chaves(s).filter((k) => k === "forca").length === 0 || JSON.stringify(s).includes('"forca":null'))
  confere("a função não recebe o vínculo", selecionarEvidencia.length <= 2)
  const fonte = readFileSync(path.join(process.cwd(), "lib", "astro", "selecao-sinastria.ts"), "utf8")
  const semComentario = fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
  const textosDeCriterio = semComentario.replace(/texto: "[^"]*"/g, "").replace(/id: "vinculo_nao_entra"/g, "")
  confere("o código do seletor não usa vínculo nem tipo de relação", !/v[ií]nculo|vinculo|romantico|amizade|familia|trabalho/i.test(textosDeCriterio))

  // critérios rotulados
  const ids = CRITERIOS.map((c) => c.id)
  confere("critérios com id único", new Set(ids).size === ids.length)
  confere("todo critério de fonte cita a página do livro", CRITERIOS.filter((c) => c.origem === "fonte").every((c) => typeof c.pdfPagina === "number"))
  confere("há critérios de fonte e editoriais, separados", CRITERIOS.some((c) => c.origem === "fonte") && CRITERIOS.some((c) => c.origem === "editorial"))
  const usados = new Set([...s.aspectos, ...s.overlays].flatMap((d) => d.porque))
  confere("todo critério que a seleção cita existe na lista declarada", [...usados].every((u) => ids.includes(u)), [...usados].filter((u) => !ids.includes(u)).join(","))
  confere("o vínculo está declarado como fora da seleção", CRITERIOS.some((c) => c.id === "vinculo_nao_entra"))
}

// ── D · os 7 casos agrupados por tema continuam gerais ──────────────────────
function parteD() {
  const casos: Array<[string, "favoravel" | "adverso"]> = [
    ["moon-mars", "adverso"], ["mercury-pluto", "favoravel"], ["mercury-pluto", "adverso"], ["mars-saturn", "favoravel"],
    ["mars-neptune", "favoravel"], ["mars-neptune", "adverso"], ["neptune-pluto", "adverso"],
  ]
  const agrupadas = INTERASPECTOS.flatMap((g) => [g.favoravel, g.adverso].map((v, i) => ({ g, lado: i === 0 ? "favoravel" : "adverso", v }))).filter((x) => x.v?.origem === "agrupada_por_tema")
  confere("existem exatamente 7 valências agrupadas por tema", agrupadas.length === 7, String(agrupadas.length))
  confere("são as sete decididas", casos.every(([id, lado]) => agrupadas.some((a) => a.g.id === id && a.lado === lado)))
  for (const { g, lado } of agrupadas) {
    for (const asp of ["conjunction", "opposition", "square", "trine", "sextile", "quincunx"] as const) {
      const [a, b] = g.corpos
      const r = glosasDoAspecto({ corpoA: a, corpoB: b, aspecto: asp })
      const v = g[lado as "favoravel" | "adverso"]
      confere(`${g.id}.${lado} (${asp}): volta como geral e nunca como ${lado}`, Boolean(r) && r!.gerais.includes(v!) && r!.favoravel !== v && r!.adverso !== v)
    }
  }
  // a evidência selecionada as traz como via "geral"
  const r = sinastria(mapa({ mercury: 10 }), mapa({ pluto: 70 }))
  const s = selecionarEvidencia(r)
  const d = s.aspectos.find((x) => x.glosaId === "mercury-pluto")
  confere("mercury-pluto selecionado: toda frase da valência agrupada vem como 'geral'", Boolean(d) && d!.evidencia.itens.filter((i) => i.ref.startsWith("favoravel") || i.ref.startsWith("adverso")).every((i) => i.via === "geral"))
}

// ── E · semelhanças: só o que o livro interpreta ────────────────────────────
function parteE() {
  const longe = (desloc: number): Partial<Record<Corpo, number>> => {
    const l: Partial<Record<Corpo, number>> = {}
    CORPOS_MAPA.forEach((c, i) => { l[c] = (i * 36 + 7 + desloc) % 360 })
    return l
  }
  const GRANDE = { aspectos: 0, overlays: 0, semelhancas: 99999 }

  // elemento dominante: selecionado com glosa e evidência
  {
    // dez corpos em signos de fogo (Áries, Leão, Sagitário) nos dois mapas
    const fogo = (d: number): Partial<Record<Corpo, number>> => ({ sun: 5 + d, moon: 125 + d, mercury: 245 + d, venus: 15 + d, mars: 135 + d, jupiter: 255 + d, saturn: 25 + d, uranus: 145 + d, neptune: 265 + d, pluto: 35 + d })
    const r = sinastria(mapa(fogo(0)), mapa(fogo(3)))
    const s = selecionarEvidencia(r, { orcamento: GRANDE })
    const el = s.semelhancas.find((x) => x.fato.id === "elemento")
    confere("elemento dominante selecionado tem glosa e evidência", Boolean(el) && el!.glosaId === "elemento:fire|fire" && el!.itens.length > 0, el?.glosaId)
    confere("...e a glosa é a do par de elementos, em qualquer ordem", glosaDaSemelhanca({ dimensao: "elemento", padraoA: "water", padraoB: "fire", tipoDeSemelhanca: "polaridade_oposta" })?.id === glosaDaSemelhanca({ dimensao: "elemento", padraoA: "fire", padraoB: "water", tipoDeSemelhanca: "polaridade_oposta" })?.id)
    confere("as ressalvas do livro sobre semelhança demais acompanham a semelhança igual", s.ressalvasDasSemelhancas.length > 0 && s.ressalvasDasSemelhancas.every((i) => i.tipo === "ressalva"))
    confere("...e nenhuma frase fala de compatibilidade", ![...s.ressalvasDasSemelhancas, ...s.semelhancas.flatMap((x) => x.itens)].some((i) => /compat[ií]ve|compatibilidade/i.test(i.texto)))
  }

  // modo dominante: selecionado com glosa e evidência
  {
    // dez corpos em signos cardinais (Áries, Câncer, Libra, Capricórnio)
    const card = (d: number): Partial<Record<Corpo, number>> => ({ sun: 5 + d, moon: 95 + d, mercury: 185 + d, venus: 275 + d, mars: 15 + d, jupiter: 105 + d, saturn: 195 + d, uranus: 285 + d, neptune: 25 + d, pluto: 115 + d })
    const r = sinastria(mapa(card(0)), mapa(card(4)))
    const s = selecionarEvidencia(r, { orcamento: GRANDE })
    const mo = s.semelhancas.find((x) => x.fato.id === "modo")
    confere("modo dominante selecionado tem glosa e evidência", Boolean(mo) && mo!.glosaId === "modo:cardinal|cardinal" && mo!.itens.length > 0, mo?.glosaId)
  }

  // elemento do Sol: só no mesmo elemento
  {
    const igual = selecionarEvidencia(sinastria(mapa({ sun: 5 }), mapa({ ...longe(95), sun: 125 })), { orcamento: GRANDE })
    confere("Sóis no mesmo elemento: selecionado com glosa", igual.semelhancas.some((x) => x.fato.id === "elemento_do_sol" && x.glosaId === "elemento_do_sol" && x.itens.length > 0))
    const diferente = selecionarEvidencia(sinastria(mapa({ sun: 5 }), mapa({ ...longe(95), sun: 65 })), { orcamento: GRANDE })
    const f = diferente.descartes.find((d) => d.fato === "elemento_do_sol")
    confere("Sóis em elementos diferentes (mesma polaridade): o livro não interpreta, e é barrado", Boolean(f) && f!.motivo === "sem_evidencia_interpretativa" && !diferente.semelhancas.some((x) => x.fato.id === "elemento_do_sol"))
  }

  // mesmo corpo no mesmo signo: só Lua e planetas pessoais
  {
    const A = { ...longe(0), jupiter: 15, saturn: 15, venus: 15, moon: 15, mars: 15 }
    const B = { ...longe(95), jupiter: 20, saturn: 20, venus: 20, moon: 20, mars: 20 }
    const r = sinastria(mapa(A), mapa(B))
    const s = selecionarEvidencia(r, { orcamento: GRANDE })
    for (const c of ["jupiter", "saturn"]) {
      const d = s.descartes.find((x) => x.fato === `signo:${c}`)
      confere(`mesmo signo em ${c}: o livro não o nomeia, e é barrado como sem evidência interpretativa`, Boolean(d) && d!.motivo === "sem_evidencia_interpretativa" && s.diagnostico.semEvidenciaInterpretativa.includes(`signo:${c}`))
      confere(`mesmo signo em ${c}: não chega à saída nem gasta orçamento`, !s.semelhancas.some((x) => x.fato.id === `signo:${c}`))
    }
    for (const c of ["venus", "moon", "mars"]) confere(`mesmo signo em ${c}: o livro o interpreta, e entra com glosa`, s.semelhancas.some((x) => x.fato.id === `signo:${c}` && x.glosaId === "signo_do_corpo" && x.itens.length > 0))
    const lua = s.semelhancas.find((x) => x.fato.id === "signo:moon")
    const venus = s.semelhancas.find((x) => x.fato.id === "signo:venus")
    confere("a observação específica da Lua vale só para a Lua", Boolean(lua && venus) && lua!.itens.length > venus!.itens.length, `${lua?.itens.length} contra ${venus?.itens.length}`)
    // planeta geracional continua descartado como geração
    const g = selecionarEvidencia(sinastria(mapa({ pluto: 15 }), mapa({ ...longe(95), pluto: 20 })), { orcamento: GRANDE })
    confere("o mesmo signo em Plutão continua descartado como geracional", g.descartes.some((d) => d.fato === "signo:pluto" && d.motivo === "geracional"))
  }

  // o orçamento da camada vale com a evidência dentro, e a camada não gasta o das outras
  {
    const casos = amostra()
    for (const c of casos) {
      const r = sinastria(mapaNatal(c.a), mapaNatal(c.b))
      const s = selecionarEvidencia(r)
      confere(`${c.rotulo}: o custo de cada semelhança inclui a evidência dela (recalculado aqui)`, s.semelhancas.every((x) => x.tokens >= 35 + Math.ceil(x.itens.reduce((n, i) => n + i.texto.length, 0) / 3.6)))
      confere(`${c.rotulo}: a camada de semelhanças respeita os ~300 tokens, contando a evidência`, s.tokens.semelhancas <= ORCAMENTO_PADRAO.semelhancas && s.tokens.semelhancas >= s.semelhancas.reduce((n, x) => n + x.tokens, 0))
    }
    confere("o orçamento de semelhanças é o mesmo de antes (300)", ORCAMENTO_PADRAO.semelhancas === 300)
  }

  // núcleo operacional: o tamanho da glosa não decide a seleção
  {
    const ordemDeclarada = (f: { dimensao: string; classe?: string; id: string }) => {
      const dim: Record<string, number> = { elemento: 0, elemento_do_sol: 1, modo: 2, signo_do_corpo: 3 }
      const cl: Record<string, number> = { rapido: 0, intermediario: 1, geracional: 2 }
      return [dim[f.dimensao] ?? 9, cl[f.classe ?? ""] ?? 0, f.id] as const
    }
    const menor = (a: readonly (number | string)[], b: readonly (number | string)[]) => { for (let i = 0; i < a.length; i++) { if (a[i] === b[i]) continue; return a[i] < b[i] ? -1 : 1 } return 0 }
    let elementos = 0
    for (const c of amostra()) {
      const r = sinastria(mapaNatal(c.a), mapaNatal(c.b))
      const s = selecionarEvidencia(r)
      const sel = s.semelhancas.map((x) => x.fato)
      // a ordem relativa do que foi selecionado é a ordem declarada, sem promoção por categoria nem por tipo
      const esperada = [...sel].sort((a, b) => menor(ordemDeclarada(a), ordemDeclarada(b))).map((f) => f.id)
      confere(`${c.rotulo}: as semelhanças selecionadas seguem a ordem declarada`, sel.map((f) => f.id).join(",") === esperada.join(","))
      // com orçamento enorme entra tudo que é elegível, na ordem declarada: a elegibilidade não mudou
      const tudo = selecionarEvidencia(r, { orcamento: { aspectos: 0, overlays: 0, semelhancas: 99999 } })
      const elegiveis = r.semelhancas.filter((f) => glosaDaSemelhanca(f) !== null && !(f.dimensao === "signo_do_corpo" && f.classe === "geracional")).sort((a, b) => menor(ordemDeclarada(a), ordemDeclarada(b))).map((f) => f.id)
      confere(`${c.rotulo}: com orçamento enorme entram exatamente as elegíveis, na ordem declarada`, tudo.semelhancas.map((x) => x.fato.id).join(",") === elegiveis.join(","), `${tudo.semelhancas.length} contra ${elegiveis.length}`)
      confere(`${c.rotulo}: os mesmos fatos barrados: só os que o livro não interpreta`, r.semelhancas.filter((f) => !glosaDaSemelhanca(f) && !(f.dimensao === "signo_do_corpo" && f.classe === "geracional")).every((f) => tudo.descartes.some((d) => d.fato === f.id && d.motivo === "sem_evidencia_interpretativa")) && tudo.descartes.filter((d) => d.camada === "semelhancas" && d.motivo === "sem_evidencia_interpretativa").length === r.semelhancas.filter((f) => !glosaDaSemelhanca(f) && !(f.dimensao === "signo_do_corpo" && f.classe === "geracional")).length)
      // o prompt recebe o núcleo operacional, nunca a glosa completa
      confere(`${c.rotulo}: só núcleo operacional chega à saída, nunca a glosa completa`, s.semelhancas.every((x) => x.itens.every((i) => /^(nucleoOperacional|ressalvaOperacional)/.test(i.ref))) && s.ressalvasDasSemelhancas.every((i) => i.ref === "ressalvaOperacional"))
      confere(`${c.rotulo}: o custo de uma semelhança fica no máximo em ~210 tokens, seja qual for a glosa`, s.semelhancas.every((x) => x.tokens <= 35 + 112 + 64))
      elementos += s.semelhancas.filter((x) => x.fato.dimensao === "elemento").length
    }
    confere("na amostra, o elemento deixou de ser barrado pelo tamanho: entra quando a ordem permite", elementos > 0, String(elementos))
    // elemento sozinho, com o orçamento padrão: entra, porque é o primeiro da ordem
    const fogo = (d: number): Partial<Record<Corpo, number>> => ({ sun: 5 + d, moon: 125 + d, mercury: 245 + d, venus: 15 + d, mars: 135 + d, jupiter: 255 + d, saturn: 25 + d, uranus: 145 + d, neptune: 265 + d, pluto: 35 + d })
    const e = selecionarEvidencia(sinastria(mapa(fogo(0)), mapa(fogo(3))), { orcamento: { aspectos: 0, overlays: 0 } })
    confere("o elemento fogo com fogo entra com o orçamento padrão de 300 tokens", e.semelhancas.some((x) => x.fato.id === "elemento" && x.glosaId === "elemento:fire|fire"))
    // o núcleo é mais curto que a glosa completa, para todas
    const g = (id: string) => SEMELHANCAS.find((x) => x.id === id)!
    confere("todo núcleo operacional é mais curto que a glosa completa", SEMELHANCAS.filter((x) => x.dimensao !== "semelhanca_geral").every((x) => x.nucleoOperacional.reduce((n, o) => n + o.texto.length, 0) < camposDeSemelhanca(x).reduce((n, c) => n + c.texto.length, 0)))
    confere("a glosa completa continua inteira ao lado do núcleo", SEMELHANCAS.every((x) => camposDeSemelhanca(x).length >= x.nucleoOperacional.length) && g("elemento:fire|fire").tensoesPossiveis.length === 5)
  }

  // sem score
  {
    const r = sinastria(mapaNatal(amostra()[0].a), mapaNatal(amostra()[0].b))
    const s = selecionarEvidencia(r)
    const chaves = (o: unknown): string[] => (Array.isArray(o) ? o.flatMap(chaves) : o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => [k, ...chaves(v)]) : [])
    confere("a camada de semelhanças não tem score, nota nem compatibilidade", !/\b(score|nota|pontuacao|compat\w*|veredito)\b/i.test(chaves(s.semelhancas).join(" ")))
  }
}

parteA()
parteB()
parteC()
parteD()
parteE()

if (falhas.length) {
  console.error(`\nO seletor falhou em ${falhas.length} ponto(s):\n`)
  for (const f of falhas.slice(0, 40)) console.error(`  ${f}`)
  if (falhas.length > 40) console.error(`  ... e mais ${falhas.length - 40}`)
  console.error("")
  process.exit(1)
}
console.log(`sinastria-seleção: ${conferidos} conferências (determinismo, destino de cada fato, universo, ordem, dedup, orçamento, sem score nem vínculo)`)
