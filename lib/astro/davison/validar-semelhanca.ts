/**
 * Validação das glosas de semelhança. Mesma disciplina das glosas de par e de
 * overlay: forma, travas lexicais, condição natal marcada, e (com a fonte local)
 * ligação de cada frase a um trecho do livro.
 */
import { CATEGORIAS_DE_DESCARTE, LIMITES_DE_TEXTO, LIMITES_OPERACIONAIS, type GlosaDeSemelhanca, type NucleoOperacional } from "./tipos"
import { norm, problemasDeCondicao, problemasDeTexto, type Campo } from "./validar"

const PESSOAIS = ["sun", "moon", "mercury", "venus", "mars"]
const DIMENSOES = ["elemento", "modo", "elemento_do_sol", "signo_do_corpo", "semelhanca_geral"]

/** Todas as frases operacionais de uma glosa de semelhança, com o nome pelo qual a auditoria as cita. */
export function camposDeSemelhanca(g: GlosaDeSemelhanca): Campo[] {
  const saida: Campo[] = []
  g.nucleos.forEach((t, i) => saida.push({ ref: `nucleos[${i}]`, texto: t }))
  g.tensoesPossiveis.forEach((t, i) => saida.push({ ref: `tensoesPossiveis[${i}]`, texto: t }))
  g.ressalvas.forEach((t, i) => saida.push({ ref: `ressalvas[${i}]`, texto: t }))
  g.especificos.forEach((e, i) => {
    e.nucleos.forEach((t, j) => saida.push({ ref: `especificos[${i}].nucleos[${j}]`, texto: t }))
    e.ressalvas.forEach((t, j) => saida.push({ ref: `especificos[${i}].ressalvas[${j}]`, texto: t }))
  })
  if (g.papeis) for (const [k, t] of Object.entries(g.papeis)) saida.push({ ref: `papeis.${k}`, texto: t })
  return saida
}

export function problemasDeSemelhanca(g: GlosaDeSemelhanca): string[] {
  const s: string[] = []
  if (!DIMENSOES.includes(g.dimensao)) s.push(`dimensão inválida "${g.dimensao}"`)
  const geral = g.dimensao === "semelhanca_geral"
  if (g.id !== (g.dimensao === "elemento" || g.dimensao === "modo" ? `${g.dimensao}:${g.valor}` : g.dimensao)) s.push(`id "${g.id}" não bate com a dimensão e o valor`)
  if (g.dimensao === "elemento" || g.dimensao === "modo") {
    const partes = g.valor.split("|")
    if (partes.length !== 2 || [...partes].sort().join("|") !== g.valor) s.push("valor deve ser o par em ordem alfabética")
  }
  if (g.simetria === "assimetrico") {
    const chaves = g.valor.split("|")
    if (!g.papeis || chaves.length !== 2 || chaves[0] === chaves[1] || chaves.some((c) => !g.papeis![c])) s.push("assimétrico exige o papel dos dois valores")
  } else if (g.papeis) s.push("simétrico não leva papéis")

  if (geral) {
    if (g.nucleos.length || g.tensoesPossiveis.length) s.push("a glosa geral só tem ressalvas")
    if (g.ressalvas.length === 0) s.push("a glosa geral precisa de ressalvas")
  } else if (g.nucleos.length === 0) s.push("sem núcleo")

  if (g.dimensao === "elemento_do_sol" && (g.aplicaA.tipos.length !== 1 || g.aplicaA.tipos[0] !== "igual")) s.push("o elemento do Sol só tem leitura para o mesmo elemento")
  if (g.dimensao === "signo_do_corpo") {
    if (g.aplicaA.corpos.length === 0 || g.aplicaA.corpos.some((c) => !PESSOAIS.includes(c))) s.push("o mesmo signo só tem leitura para a Lua e os planetas pessoais")
  }
  if ((g.dimensao === "elemento" || g.dimensao === "modo") && (g.aplicaA.tipos.length || g.aplicaA.corpos.length)) s.push("elemento e modo não restringem a que fatos se aplicam")

  for (const [campo, xs] of [["nucleos", g.nucleos], ["tensoesPossiveis", g.tensoesPossiveis], ["ressalvas", g.ressalvas]] as const) {
    if (!Array.isArray(xs)) { s.push(`${campo}: não é lista`); continue }
    if (xs.length > LIMITES_DE_TEXTO.maxItens) s.push(`${campo}: mais de ${LIMITES_DE_TEXTO.maxItens} itens`)
    if (new Set(xs.map((x) => norm(x).toLowerCase())).size !== xs.length) s.push(`${campo}: item repetido`)
  }
  g.especificos.forEach((e, i) => {
    if (e.corpos.length === 0 || e.nucleos.length + e.ressalvas.length === 0) s.push(`especificos[${i}]: vazio`)
    if (e.corpos.some((c) => !PESSOAIS.includes(c))) s.push(`especificos[${i}]: corpo fora dos pessoais`)
  })
  g.dependeDaCondicaoNatal.forEach((d, i) => { if (!d.nota || d.nota.trim().length < 10) s.push(`dependeDaCondicaoNatal[${i}]: nota vazia`) })

  for (const { ref, texto } of camposDeSemelhanca(g)) {
    for (const p of problemasDeTexto(texto)) s.push(`${ref}: ${p}`)
    // semelhança não é compatibilidade: a palavra nem entra no material
    if (/compat[ií]ve|compatibilidade/i.test(texto)) s.push(`${ref}: usa "compatibilidade", e semelhança não é compatibilidade`)
  }
  s.push(...problemasDeCondicao(camposDeSemelhanca(g), g.condicoesPorItem))
  s.push(...problemasDeOperacional(g))
  for (const d of g.descartes ?? []) {
    if (!(CATEGORIAS_DE_DESCARTE as readonly string[]).includes(d.categoria)) s.push(`descarte: categoria inválida "${d.categoria}"`)
    if (!d.motivo || d.motivo.trim().length < 8) s.push("descarte: motivo vazio")
  }
  return s
}

const semAcento = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
const radicais = (t: string) => new Set(semAcento(t).split(/[^a-z0-9]+/).filter((w) => w.length >= 5).map((w) => w.slice(0, 5)))

/**
 * Trava AUXILIAR de fidelidade: a fração das palavras de conteúdo do núcleo
 * operacional cujo radical aparece nas frases da glosa completa que ele diz
 * condensar. Não prova que a paráfrase é fiel; pega o texto que trouxe assunto
 * novo.
 */
export function fidelidadeLexical(op: NucleoOperacional, g: GlosaDeSemelhanca): number {
  const campos = camposDeSemelhanca(g)
  const fonte = radicais(op.deRefs.map((r) => campos.find((c) => c.ref === r)?.texto ?? "").join(" "))
  const proprias = [...radicais(op.texto)]
  if (proprias.length === 0) return 1
  return proprias.filter((r) => fonte.has(r)).length / proprias.length
}

const PISO_DE_FIDELIDADE = 0.5

function problemasDeOperacional(g: GlosaDeSemelhanca): string[] {
  const s: string[] = []
  const geral = g.dimensao === "semelhanca_geral"
  const campos = camposDeSemelhanca(g)
  const confere = (rotulo: string, op: NucleoOperacional, maximo: number) => {
    if (!op || typeof op.texto !== "string" || op.texto.trim().length < 12) { s.push(`${rotulo}: texto ausente`); return }
    if (op.texto.length > maximo) s.push(`${rotulo}: ${op.texto.length} caracteres, acima de ${maximo}`)
    for (const p of problemasDeTexto(op.texto)) s.push(`${rotulo}: ${p}`)
    if (/compat[ií]ve|compatibilidade/i.test(op.texto)) s.push(`${rotulo}: usa "compatibilidade"`)
    if (!Array.isArray(op.deRefs) || op.deRefs.length === 0) { s.push(`${rotulo}: não diz de que frases da glosa completa é condensação`); return }
    for (const r of op.deRefs) if (!campos.some((c) => c.ref === r)) s.push(`${rotulo}: "${r}" não existe na glosa completa`)
    const soma = op.deRefs.reduce((n, r) => n + (campos.find((c) => c.ref === r)?.texto.length ?? 0), 0)
    if (op.texto.length > soma) s.push(`${rotulo}: é mais longo que as frases que condensa`)
    if (/\d/.test(op.texto) && !/\d/.test(op.deRefs.map((r) => campos.find((c) => c.ref === r)?.texto ?? "").join(" "))) s.push(`${rotulo}: traz número que a glosa não tem`)
    const f = fidelidadeLexical(op, g)
    if (f < PISO_DE_FIDELIDADE) s.push(`${rotulo}: só ${Math.round(f * 100)}% das palavras de conteúdo vêm das frases que condensa (piso ${PISO_DE_FIDELIDADE * 100}%)`)
  }
  if (geral) {
    if (g.nucleoOperacional.length) s.push("a glosa geral não tem núcleo operacional, só a ressalva operacional")
    if (!g.ressalvaOperacional) s.push("a glosa geral precisa de ressalva operacional")
    else confere("ressalvaOperacional", g.ressalvaOperacional, LIMITES_OPERACIONAIS.ressalva)
    return s
  }
  if (g.ressalvaOperacional) s.push("só a glosa geral tem ressalva operacional")
  if (!Array.isArray(g.nucleoOperacional) || g.nucleoOperacional.length < 1 || g.nucleoOperacional.length > 3) s.push("o núcleo operacional tem de 1 a 3 frases")
  g.nucleoOperacional?.forEach((op, i) => confere(`nucleoOperacional[${i}]`, op, LIMITES_OPERACIONAIS.item))
  const total = (g.nucleoOperacional ?? []).reduce((n, o) => n + (o.texto?.length ?? 0), 0)
  if (total > LIMITES_OPERACIONAIS.total) s.push(`o núcleo operacional tem ${total} caracteres, acima de ${LIMITES_OPERACIONAIS.total}`)
  g.nucleoOperacionalEspecifico?.forEach((op, i) => {
    confere(`nucleoOperacionalEspecifico[${i}]`, op, LIMITES_OPERACIONAIS.item)
    if (!op.corpos?.length) s.push(`nucleoOperacionalEspecifico[${i}]: sem corpos`)
  })
  return s
}
