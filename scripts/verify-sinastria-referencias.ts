/**
 * Proteção do repertório relacional do Davison. Roda antes do build
 * (npm run verify:sinastria-referencias) e FALHA se a cobertura, a forma, a
 * ligação com a fonte ou as travas lexicais deixarem de valer.
 *
 * O QUE ELE PROVA
 *  - cobertura: os 55 pares e as 120 leituras de overlay, sem faltar e sem repetir;
 *  - forma: corpos válidos, casas de 1 a 12, páginas dentro do que o livro tem,
 *    nenhum campo essencial vazio, nenhuma entrada sem fonte;
 *  - ligação: cada glosa guarda título, páginas e hash do trecho de onde saiu;
 *  - travas lexicais: nenhuma glosa traz gênero, karma, previsão, prescrição,
 *    julgamento de valor ou diagnóstico nas palavras que dá para detectar.
 *
 * O QUE ELE NÃO PROVA. As travas lexicais são auxiliares, não prova semântica:
 * uma glosa pode violar o espírito sem usar nenhuma palavra da lista, e uma
 * paráfrase pode ser infiel sem que nenhum teste perceba. A fidelidade é
 * conferida por quem lê a auditoria (trecho → núcleo preservado → descarte).
 *
 * A AUDITORIA LITERAL só existe na máquina de quem tem a fonte
 * (`data/fontes/davison/`, fora do repositório). Quando existe, ele a confere a
 * fundo: o hash de cada glosa contra o do extrato, a âncora e cada trecho
 * literal dentro do texto do livro, e a cobertura de TODA frase operacional por
 * um trecho. Quando não existe (o Netlify, por exemplo), diz que pulou e passa
 * nas conferências estruturais.
 */
import fs from "fs"
import path from "path"
import { CASAS, glosaDaSemelhanca, glosaDoFatoOverlay, glosaDoPar, glosasDoAspecto, INTERASPECTOS, itensDe, itensSemCondicaoNatal, OVERLAYS, SEMELHANCAS } from "../lib/astro/davison"
import { camposDeSemelhanca, problemasDeSemelhanca } from "../lib/astro/davison/validar-semelhanca"
import { CORPOS, DIMENSOES, type GlosaDeCasa, type GlosaDeOverlay, type GlosaDePar, type GlosaDeSemelhanca } from "../lib/astro/davison/tipos"
import { camposDeOverlay, camposDePar, condicaoDoTexto, problemasDeAuditoria, problemasDeOverlay, problemasDePar, problemasDeTexto, type Auditoria } from "../lib/astro/davison/validar"
import { sinastria } from "../lib/astro/sinastria"
import type { CorpoNatal, MapaNatal } from "../lib/astro/mapa"
import { indiceDoSigno, grauNoSigno } from "../lib/astro/ceu"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

// ── a cobertura esperada, escrita aqui e não importada ──────────────────────
const PARES_ESPERADOS: string[] = []
for (let i = 0; i < CORPOS.length; i++) for (let j = i; j < CORPOS.length; j++) PARES_ESPERADOS.push(`${CORPOS[i]}-${CORPOS[j]}`)
const OVERLAYS_ESPERADOS: string[] = []
for (const p of CORPOS) for (let c = 1; c <= 12; c++) OVERLAYS_ESPERADOS.push(`${p}@casa${c}`)

function coberturaDe(ids: string[], esperados: string[]): string[] {
  const p: string[] = []
  const vistos = new Set<string>()
  for (const id of ids) {
    if (vistos.has(id)) p.push(`duplicata: ${id}`)
    vistos.add(id)
    if (!esperados.includes(id)) p.push(`fora do esperado: ${id}`)
  }
  for (const e of esperados) if (!vistos.has(e)) p.push(`faltando: ${e}`)
  return p
}

type FonteQualquer = { livro?: string; natureza?: string; secao?: string; pdfPaginaInicio?: number; pdfPaginaFim?: number; hash?: string; edicao?: string }
function problemasDeFonte(f: FonteQualquer | undefined, natureza: string, faixa: [number, number]): string[] {
  const p: string[] = []
  if (!f) return ["sem fonte"]
  if (f.livro !== "davison-synastry") p.push("livro errado")
  if (f.natureza !== natureza) p.push(`natureza "${f.natureza}" em vez de "${natureza}"`)
  if (!f.secao || !f.secao.trim()) p.push("seção vazia")
  const ok = (n: unknown) => Number.isInteger(n) && (n as number) >= faixa[0] && (n as number) <= faixa[1]
  if (!ok(f.pdfPaginaInicio) || !ok(f.pdfPaginaFim)) p.push(`página fora de ${faixa[0]} a ${faixa[1]}`)
  else if ((f.pdfPaginaInicio as number) > (f.pdfPaginaFim as number)) p.push("página inicial depois da final")
  if (!f.hash || !/^[0-9a-f]{16}$/.test(f.hash)) p.push("hash inválido")
  if (!f.edicao || !f.edicao.trim()) p.push("edição ausente")
  const extras = Object.keys(f).filter((k) => !["livro", "edicao", "natureza", "secao", "pdfPaginaInicio", "pdfPaginaFim", "hash"].includes(k))
  if (extras.length) p.push(`campo de fonte fora da rastreabilidade (nada literal vai ao repositório): ${extras.join(",")}`)
  return p
}

/** Todo texto da glosa não é vazio, onde um vazio seria uma lacuna silenciosa. */
function vazios(obj: unknown, caminho = ""): string[] {
  if (typeof obj === "string") return obj.trim() === "" ? [caminho] : []
  if (Array.isArray(obj)) return obj.flatMap((x, i) => vazios(x, `${caminho}[${i}]`))
  if (obj && typeof obj === "object") return Object.entries(obj).flatMap(([k, v]) => vazios(v, caminho ? `${caminho}.${k}` : k))
  return []
}

const chavesDe = (obj: unknown): string[] =>
  Array.isArray(obj) ? obj.flatMap(chavesDe) : obj && typeof obj === "object" ? Object.entries(obj).flatMap(([k, v]) => [k, ...chavesDe(v)]) : []

// ── A · cobertura ───────────────────────────────────────────────────────────
function parteA() {
  confere("55 pares", INTERASPECTOS.length === 55, String(INTERASPECTOS.length))
  confere("120 overlays", OVERLAYS.length === 120, String(OVERLAYS.length))
  confere("12 casas", CASAS.length === 12, String(CASAS.length))
  const cp = coberturaDe(INTERASPECTOS.map((g) => g.id), PARES_ESPERADOS)
  confere("pares: cobertura exata, sem duplicata", cp.length === 0, cp.slice(0, 5).join("; "))
  const co = coberturaDe(OVERLAYS.map((g) => g.id), OVERLAYS_ESPERADOS)
  confere("overlays: cobertura exata, sem duplicata", co.length === 0, co.slice(0, 5).join("; "))
  const cc = coberturaDe(CASAS.map((c) => String(c.casa)), Array.from({ length: 12 }, (_, i) => String(i + 1)))
  confere("casas: de 1 a 12, sem duplicata", cc.length === 0, cc.join("; "))

  // o mesmo par nunca aparece em duas ordens
  const canon = INTERASPECTOS.map((g) => [...g.corpos].sort().join("|"))
  confere("pares: nenhuma duplicata por ordem invertida (A/B e B/A)", new Set(canon).size === canon.length)
}

// ── B · forma de cada entrada ───────────────────────────────────────────────
function parteB() {
  for (const g of INTERASPECTOS) {
    const p = problemasDePar(g)
    confere(`par ${g.id}: forma e travas lexicais`, p.length === 0, p.slice(0, 3).join(" | "))
    const f = problemasDeFonte(g.fonte, "interaspecto", [58, 92])
    confere(`par ${g.id}: fonte`, f.length === 0, f.join(" | "))
    const v = vazios(g)
    confere(`par ${g.id}: nenhum campo textual vazio`, v.length === 0, v.join(", "))
    confere(`par ${g.id}: o id aponta para o título do livro`, g.fonte.secao.replace(/\s+/g, "").toLowerCase() === g.corpos.map((c) => c[0].toUpperCase() + c.slice(1)).join("/").toLowerCase(), g.fonte.secao)
    confere(`par ${g.id}: descartes registrados com categoria e motivo`, Array.isArray(g.descartes) && g.descartes.every((d) => d.categoria && d.motivo))
  }
  for (const g of OVERLAYS) {
    const p = problemasDeOverlay(g)
    confere(`overlay ${g.id}: forma e travas lexicais`, p.length === 0, p.slice(0, 3).join(" | "))
    const f = problemasDeFonte(g.fonte, "overlay", [96, 139])
    confere(`overlay ${g.id}: fonte`, f.length === 0, f.join(" | "))
    const v = vazios(g)
    confere(`overlay ${g.id}: nenhum campo textual vazio`, v.length === 0, v.join(", "))
    confere(`overlay ${g.id}: casa de 1 a 12`, g.casa >= 1 && g.casa <= 12)
  }
  for (const c of CASAS) {
    const f = problemasDeFonte(c.fonte as unknown as FonteQualquer, "definicao_de_casa", [94, 95])
    confere(`casa ${c.casa}: fonte`, f.length === 0, f.join(" | "))
    confere(`casa ${c.casa}: campo e temas`, c.campo.length >= 20 && c.temas.length >= 2)
    for (const t of [c.campo, ...c.temas]) {
      const pr = problemasDeTexto(t).filter((x) => !/curto demais/.test(x))
      confere(`casa ${c.casa}: "${t.slice(0, 30)}" passa nas travas`, pr.length === 0, pr.join(" | "))
    }
  }
}

// ── C · ligação com a fonte, quando a fonte local existe ────────────────────
function parteC() {
  const dir = path.join(process.cwd(), "data", "fontes", "davison")
  const extratoPath = path.join(dir, "extrato.json")
  const auditoriaPath = path.join(dir, "auditoria.json")
  if (!fs.existsSync(extratoPath) || !fs.existsSync(auditoriaPath)) {
    console.log("  (auditoria literal pulada: a fonte local não está nesta máquina; só as conferências estruturais valeram)")
    return
  }
  const extrato = JSON.parse(fs.readFileSync(extratoPath, "utf8")) as {
    pares: Array<{ id: string; secao: string; pdfPaginaInicio: number; pdfPaginaFim: number; texto: string; hash: string }>
    overlays: Array<{ id: string; secao: string; pdfPaginaInicio: number; pdfPaginaFim: number; texto: string; hash: string }>
    casas: Array<{ casa: number; hash: string; texto: string }>
    semelhancas: Array<{ id: string; secao: string; pdfPaginaInicio: number; pdfPaginaFim: number; texto: string; hash: string }>
  }
  const aud = (JSON.parse(fs.readFileSync(auditoriaPath, "utf8")) as { entradas: Record<string, Auditoria> }).entradas

  const confereLista = (rotulo: string, glosas: Array<GlosaDePar | GlosaDeOverlay>, fontes: typeof extrato.pares, campos: (g: never) => Array<{ ref: string; texto: string }>) => {
    for (const g of glosas) {
      const f = fontes.find((x) => x.id === g.id)
      confere(`${rotulo} ${g.id}: existe no extrato`, Boolean(f))
      if (!f) continue
      confere(`${rotulo} ${g.id}: hash igual ao do trecho no livro`, g.fonte.hash === f.hash)
      confere(`${rotulo} ${g.id}: título e páginas iguais aos do extrato`, g.fonte.secao === f.secao && g.fonte.pdfPaginaInicio === f.pdfPaginaInicio && g.fonte.pdfPaginaFim === f.pdfPaginaFim)
      const a = aud[g.id]
      confere(`${rotulo} ${g.id}: tem auditoria`, Boolean(a))
      if (!a) continue
      const p = problemasDeAuditoria(a, (campos as (g: unknown) => Array<{ ref: string; texto: string }>)(g), f.texto, a.ancora ?? "")
      confere(`${rotulo} ${g.id}: toda frase tem trecho que a sustente, e todo trecho está no livro`, p.length === 0, p.slice(0, 3).join(" | "))
      confere(`${rotulo} ${g.id}: descartes da auditoria batem com os da glosa`, a.descartes.length === g.descartes.length && a.descartes.every((d, i) => d.categoria === g.descartes[i].categoria))
    }
  }
  confereLista("par", INTERASPECTOS, extrato.pares, camposDePar as never)
  confereLista("overlay", OVERLAYS, extrato.overlays, camposDeOverlay as never)
  for (const g of SEMELHANCAS) {
    const f = extrato.semelhancas.find((x) => x.id === g.id)
    confere(`semelhança ${g.id}: existe no extrato`, Boolean(f))
    if (!f) continue
    confere(`semelhança ${g.id}: hash, título e páginas iguais aos do extrato`, g.fonte.hash === f.hash && g.fonte.secao === f.secao && g.fonte.pdfPaginaInicio === f.pdfPaginaInicio && g.fonte.pdfPaginaFim === f.pdfPaginaFim)
    const a = aud[g.id]
    confere(`semelhança ${g.id}: tem auditoria`, Boolean(a))
    if (!a) continue
    const p = problemasDeAuditoria(a, camposDeSemelhanca(g), f.texto, a.ancora ?? "")
    confere(`semelhança ${g.id}: toda frase tem trecho que a sustente, e todo trecho está no livro`, p.length === 0, p.slice(0, 3).join(" | "))
    confere(`semelhança ${g.id}: descartes da auditoria batem com os da glosa`, a.descartes.length === g.descartes.length && a.descartes.every((d, i) => d.categoria === g.descartes[i].categoria))
  }
  for (const c of CASAS) {
    const f = extrato.casas.find((x) => x.casa === c.casa)
    confere(`casa ${c.casa}: hash igual ao do livro`, f?.hash === c.fonte.hash)
    const ancoraDaCasa = (JSON.parse(fs.existsSync(path.join(dir, "auditoria-casas.json")) ? fs.readFileSync(path.join(dir, "auditoria-casas.json"), "utf8") : "{}") as Record<string, string>)[String(c.casa)]
    confere(`casa ${c.casa}: âncora local está no livro`, Boolean(f && ancoraDaCasa && f.texto.replace(/\s+/g, " ").includes(ancoraDaCasa.replace(/\s+/g, " "))))
  }
  // nenhum trecho do livro foi copiado para o repositório: nenhuma sequência de 8 palavras
  // do extrato aparece em texto de glosa (as glosas são paráfrase em português)
  const palavras = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean)
  const gramas = new Set<string>()
  for (const f of [...extrato.pares, ...extrato.overlays, ...extrato.casas, ...extrato.semelhancas]) {
    const w = palavras(f.texto)
    for (let i = 0; i + 8 <= w.length; i++) gramas.add(w.slice(i, i + 8).join(" "))
  }
  const copiadas: string[] = []
  const todosTextos = [...INTERASPECTOS.flatMap((g) => camposDePar(g)), ...OVERLAYS.flatMap((g) => camposDeOverlay(g)), ...CASAS.flatMap((c) => [{ ref: `casa${c.casa}`, texto: c.campo }]), ...SEMELHANCAS.flatMap((g) => camposDeSemelhanca(g))]
  for (const c of todosTextos) {
    const w = palavras(c.texto)
    for (let i = 0; i + 8 <= w.length; i++) if (gramas.has(w.slice(i, i + 8).join(" "))) { copiadas.push(c.ref); break }
  }
  confere("nenhuma glosa copia 8 palavras seguidas do livro", copiadas.length === 0, copiadas.slice(0, 3).join(","))
  confere("a auditoria não tem entrada sem glosa", Object.keys(aud).every((id) => INTERASPECTOS.some((g) => g.id === id) || OVERLAYS.some((g) => g.id === id) || SEMELHANCAS.some((g) => g.id === id)))
}

// ── D · as travas recusam o que devem (controles negativos) ─────────────────
function parteD() {
  const par = INTERASPECTOS[0]
  const ov = OVERLAYS[0]
  const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

  confere("controle: cobertura acusa duplicata", coberturaDe([...INTERASPECTOS.map((g) => g.id), INTERASPECTOS[0].id], PARES_ESPERADOS).some((x) => /duplicata/.test(x)))
  confere("controle: cobertura acusa par faltando", coberturaDe(INTERASPECTOS.slice(1).map((g) => g.id), PARES_ESPERADOS).some((x) => /faltando/.test(x)))
  confere("controle: cobertura acusa overlay faltando", coberturaDe(OVERLAYS.slice(1).map((g) => g.id), OVERLAYS_ESPERADOS).some((x) => /faltando/.test(x)))

  const semFonte = problemasDeFonte(undefined, "interaspecto", [58, 92])
  confere("controle: entrada sem fonte é recusada", semFonte.length > 0)
  confere("controle: página inválida é recusada", problemasDeFonte({ ...par.fonte, pdfPaginaFim: 500 }, "interaspecto", [58, 92]).length > 0)
  confere("controle: fonte com âncora literal é recusada", problemasDeFonte({ ...par.fonte, ancora: "frase do livro" } as never, "interaspecto", [58, 92]).some((x) => /fora da rastreabilidade/.test(x)))
  confere("controle: hash inválido é recusado", problemasDeFonte({ ...par.fonte, hash: "xyz" }, "interaspecto", [58, 92]).length > 0)

  const comGenero = clone(par)
  if (comGenero.favoravel) comGenero.favoravel.nucleos[0] = "Ela admira o que ele faz e deve procurar o casamento."
  confere("controle: gênero, prescrição e previsão são recusados", problemasDePar(comGenero).length >= 3)

  const corpoRuim = clone(par) as unknown as { corpos: string[] }
  corpoRuim.corpos = ["sun", "terra"]
  confere("controle: corpo inválido é recusado", problemasDePar(corpoRuim as unknown as GlosaDePar).some((x) => /inválido/.test(x)))

  const semNucleo = clone(par)
  if (semNucleo.favoravel) semNucleo.favoravel.nucleos = []
  confere("controle: valência sem núcleo é recusada", problemasDePar(semNucleo).some((x) => /sem núcleo/.test(x)))

  const porPlaneta = clone(par)
  const v = porPlaneta.favoravel ?? porPlaneta.adverso
  if (v) v.dimensoes = [{ categoria: "comunicacao", sustentadaPor: ["nucleos:0"], justificativa: "É Mercúrio e Vênus" }]
  confere("controle: dimensão atribuída pelo planeta é recusada", problemasDePar(porPlaneta).some((x) => /justificativa/.test(x)))

  const dimInvalida = clone(par)
  const v2 = dimInvalida.favoravel ?? dimInvalida.adverso
  if (v2) v2.dimensoes = [{ categoria: "felicidade" as never, sustentadaPor: ["nucleos:0"], justificativa: "nucleo fala de felicidade compartilhada entre as pessoas" }]
  confere("controle: dimensão fora da lista é recusada", problemasDePar(dimInvalida).some((x) => /dimensão inválida/.test(x)))

  const apontaPraNada = clone(par)
  const v3 = apontaPraNada.favoravel ?? apontaPraNada.adverso
  if (v3) v3.dimensoes = [{ categoria: "emocional", sustentadaPor: ["nucleos:99"], justificativa: "o núcleo trata do sentimento compartilhado entre as pessoas" }]
  confere("controle: dimensão que aponta para conteúdo inexistente é recusada", problemasDePar(apontaPraNada).some((x) => /não aponta/.test(x)))

  const origemRuim = clone(par)
  const vo = origemRuim.favoravel ?? origemRuim.adverso
  if (vo) vo.origem = "inventada" as never
  confere("controle: origem inválida é recusada", problemasDePar(origemRuim).some((x) => /origem/.test(x)))
  const geralSemTodos = clone(par)
  const vg = geralSemTodos.favoravel ?? geralSemTodos.adverso
  if (vg) { vg.origem = "leitura_geral"; vg.aplicaA = ["trine"] }
  confere("controle: leitura geral que vale para um só aspecto é recusada", problemasDePar(geralSemTodos).some((x) => /seis aspectos/.test(x)))
  const condicaoComAspecto = clone(par)
  const vc = condicaoComAspecto.favoravel ?? condicaoComAspecto.adverso
  if (vc) { vc.origem = "condicao_natal"; vc.aplicaA = ["square"] }
  confere("controle: leitura por condição natal aplicada a aspecto é recusada", problemasDePar(condicaoComAspecto).some((x) => /condição natal/.test(x)))

  const assimSemPapel = clone(par)
  assimSemPapel.simetria = "assimetrico"
  assimSemPapel.papeis = null
  confere("controle: assimétrico sem papéis é recusado", problemasDePar(assimSemPapel).some((x) => /papel/.test(x)))

  const ovRuim = clone(ov)
  ovRuim.casa = 13
  ovRuim.tensoes = ["Pode vir uma doença e a morte do parceiro, o que é inevitável."]
  confere("controle: overlay com casa 13, doença, morte e fatalismo é recusado", problemasDeOverlay(ovRuim).length >= 3)

  const ovVazio = clone(ov)
  ovVazio.facilidades = []
  ovVazio.tensoes = []
  confere("controle: overlay sem facilidade nem tensão é recusado", problemasDeOverlay(ovVazio).some((x) => /nem facilidade nem tensão/.test(x)))

  confere("controle: texto com travessão é recusado", problemasDeTexto("Uma frase — com travessão no meio dela.").length > 0)
  confere("controle: causalidade e energia são recusadas", problemasDeTexto("A energia dessa posição influencia a outra pessoa.").length > 0)
  confere("controle: texto limpo passa", problemasDeTexto("Quem tem Saturno firma o pensamento de quem tem Mercúrio.").length === 0)

  const aud: Auditoria = { trechos: [], descartes: [] }
  confere("controle: glosa sem nenhum trecho de auditoria é recusada", problemasDeAuditoria(aud, camposDePar(par), "texto qualquer do livro", "texto").length > 0)
  const fantasma: Auditoria = { trechos: [{ ref: "favoravel.nucleos[0]", literal: "frase que o livro não tem", preservado: "alguma coisa preservada" }], descartes: [] }
  confere("controle: trecho que não está no livro é recusado", problemasDeAuditoria(fantasma, camposDePar(par), "texto qualquer do livro", "texto").some((x) => /não está na fonte/.test(x)))
}

// ── E · o repertório é neutro, e se liga aos fatos de sinastria ─────────────
function parteE() {
  const chaves = chavesDe([...INTERASPECTOS, ...OVERLAYS]).join(" ")
  confere("nenhum campo fala de vínculo: o repertório é neutro", !/vinculo|romantic|amizade|familia|trabalho/i.test(chaves))
  confere("nenhuma glosa tem peso ou score", !/\bforca\b|\bscore\b|\bpeso\b|\bpontuacao\b/i.test(chaves))
  // o rótulo da fonte (classeOriginal) pode dizer "debilitado"; o texto operacional não pode afirmá-lo
  const operacionais = [...INTERASPECTOS.flatMap((g) => camposDePar(g)), ...OVERLAYS.flatMap((g) => camposDeOverlay(g))]
  // frase que cita condição natal é possibilidade condicionada, não fato: tem de estar marcada
  const naoMarcadas = [...INTERASPECTOS, ...OVERLAYS].flatMap((g) => itensDe(g).filter((i) => condicaoDoTexto(i.texto).natal && !i.condicao.natal).map((i) => `${g.id} ${i.ref}`))
  confere("toda frase que depende de condição natal está marcada como tal", naoMarcadas.length === 0, naoMarcadas.slice(0, 3).join(" | "))
  const aposFiltro = [...INTERASPECTOS, ...OVERLAYS].flatMap((g) => itensSemCondicaoNatal(g)).filter((i) => condicaoDoTexto(i.texto).natal)
  confere("o filtro de itens sem condição natal nunca devolve frase que dependa dela", aposFiltro.length === 0)
  const marcadas = [...INTERASPECTOS, ...OVERLAYS].flatMap((g) => itensDe(g).filter((i) => i.condicao.natal)).length
  confere("há frases condicionadas à condição natal, e o repertório as distingue das demais", marcadas > 0 && marcadas < operacionais.length, String(marcadas))

  // a consulta é por par, em qualquer ordem, e leva o papel para a pessoa certa
  const assim = INTERASPECTOS.find((g) => g.simetria === "assimetrico")
  if (assim) {
    const [x, y] = assim.corpos
    const a = glosasDoAspecto({ corpoA: x, corpoB: y, aspecto: "square" })
    const b = glosasDoAspecto({ corpoA: y, corpoB: x, aspecto: "square" })
    confere("consulta: o par é achado nas duas ordens", glosaDoPar(x, y)?.id === glosaDoPar(y, x)?.id && Boolean(a) && Boolean(b))
    confere("consulta: o papel de cada corpo vai para a pessoa certa", a?.papelDeA === assim.papeis?.[x] && a?.papelDeB === assim.papeis?.[y] && b?.papelDeA === assim.papeis?.[y] && b?.papelDeB === assim.papeis?.[x])
    confere("consulta: A↔B não vira B↔A (os papéis trocam de dono quando os mapas trocam)", a?.papelDeA !== b?.papelDeA)
  }
  // origem da valência: o que o livro não separa nunca vira favorável nem adverso
  const mj = glosasDoAspecto({ corpoA: "moon", corpoB: "jupiter", aspecto: "square" })
  confere("origem: leitura que depende de condição natal não se aplica a nenhum aspecto", Boolean(mj) && mj?.adverso === null && (mj?.dependentesDeCondicao.length ?? 0) === 1)
  const pp = glosasDoAspecto({ corpoA: "pluto", corpoB: "pluto", aspecto: "sextile" })
  confere("origem: leitura geral volta como geral, nunca como favorável", Boolean(pp) && pp?.favoravel === null && (pp?.gerais.length ?? 0) === 1)
  const mp = glosasDoAspecto({ corpoA: "mercury", corpoB: "pluto", aspecto: "trine" })
  confere("origem: divisão editorial (agrupada por tema) volta como geral, nunca como favorável", Boolean(mp) && mp?.favoravel === null && mp?.adverso === null && (mp?.gerais.length ?? 0) === 2)
  const origens = new Set(INTERASPECTOS.flatMap((g) => [g.favoravel?.origem, g.adverso?.origem]).filter(Boolean))
  confere("toda valência declara de onde vem a divisão", INTERASPECTOS.every((g) => [g.favoravel, g.adverso].every((v) => v === null || Boolean(v.origem))) && origens.size >= 3, [...origens].join(","))
  const sq = glosasDoAspecto({ corpoA: "sun", corpoB: "saturn", aspecto: "square" })
  confere("consulta: quadratura Sol e Saturno recebe a valência adversa e não a favorável", Boolean(sq?.adverso) && !sq?.favoravel)
  const tr = glosasDoAspecto({ corpoA: "sun", corpoB: "saturn", aspecto: "trine" })
  confere("consulta: trígono Sol e Saturno recebe a valência favorável e não a adversa", Boolean(tr?.favoravel) && !tr?.adverso)

  // um resultado real de sinastria: todo fato de aspecto e de overlay tem glosa
  const mapa = (lons: Record<string, number>, hora: boolean): MapaNatal => ({
    tz: "America/Sao_Paulo", tzStatus: "ok", jdUt: 0, horaConhecida: hora, sistemaCasas: hora ? "whole_sign" : "",
    corpos: CORPOS.map((c, i): CorpoNatal => { const lon = lons[c] ?? (i * 37 + 11) % 360; return { corpo: c, lon, signo: indiceDoSigno(lon), grau: grauNoSigno(lon), retrogrado: false, retrogradoEstado: "direto", casa: null, incerteza: 0, signoDefinido: true } }),
    asc: hora ? 10 : null, mc: hora ? 280 : null, cuspides: hora ? Array.from({ length: 12 }, (_, i) => i * 30) : null, aspectos: [],
  })
  const r = sinastria(mapa({}, true), mapa({ sun: 100, moon: 200, venus: 310 }, true))
  const semGlosa = r.aspectos.filter((f) => !["asc", "mc"].includes(f.corpoA) && !["asc", "mc"].includes(f.corpoB) && !glosasDoAspecto(f))
  confere("todo aspecto entre corpos de um resultado de sinastria tem glosa de par", semGlosa.length === 0, semGlosa.map((f) => f.id).join(","))
  const ovSemGlosa = r.overlays.filter((o) => !glosaDoFatoOverlay(o))
  confere("todo overlay de um resultado de sinastria tem glosa e definição de casa", ovSemGlosa.length === 0 && r.overlays.length > 0)
  const angulo = r.aspectos.find((f) => ["asc", "mc"].includes(f.corpoA) || ["asc", "mc"].includes(f.corpoB))
  confere("aspecto com Asc ou MC NÃO tem glosa de par: o livro só os trata dentro das casas 1 e 10", !angulo || glosasDoAspecto(angulo) === null)
}

function relatorio() {
  const dims = new Map<string, number>()
  for (const g of INTERASPECTOS) for (const lado of [g.favoravel, g.adverso]) for (const d of lado?.dimensoes ?? []) dims.set(d.categoria, (dims.get(d.categoria) ?? 0) + 1)
  for (const g of OVERLAYS) for (const d of g.dimensoes) dims.set(d.categoria, (dims.get(d.categoria) ?? 0) + 1)
  console.log(`  dimensões (valência/overlay): ${DIMENSOES.map((d) => `${d} ${dims.get(d) ?? 0}`).join(" · ")}`)
  console.log(`  pares assimétricos: ${INTERASPECTOS.filter((g) => g.simetria === "assimetrico").length} · sem favorável: ${INTERASPECTOS.filter((g) => !g.favoravel).length} · sem adverso: ${INTERASPECTOS.filter((g) => !g.adverso).length}`)
  console.log(`  dependem da condição natal: ${INTERASPECTOS.filter((g) => g.dependeDaCondicaoNatal.length).length} pares · ${OVERLAYS.filter((g) => g.condicionadoPor.some((c) => c.tipo === "condicao_natal_do_planeta")).length} overlays`)
}

// ── F · semelhanças: material para os pontos em comum ───────────────────────
function parteSemelhancas() {
  const ELEM = ["air", "earth", "fire", "water"]
  const MODOS = ["cardinal", "fixed", "mutable"]
  const esperados: string[] = []
  for (let i = 0; i < ELEM.length; i++) for (let j = i; j < ELEM.length; j++) esperados.push(`elemento:${ELEM[i]}|${ELEM[j]}`)
  for (let i = 0; i < MODOS.length; i++) for (let j = i; j < MODOS.length; j++) esperados.push(`modo:${MODOS[i]}|${MODOS[j]}`)
  esperados.push("signo_do_corpo", "elemento_do_sol", "semelhanca_geral")

  const cob = coberturaDe(SEMELHANCAS.map((g) => g.id), esperados)
  confere("semelhanças: os 10 pares de elementos, os 6 de modos e as 3 gerais, sem duplicata", SEMELHANCAS.length === 19 && cob.length === 0, cob.slice(0, 4).join("; "))

  for (const g of SEMELHANCAS) {
    const p = problemasDeSemelhanca(g)
    confere(`semelhança ${g.id}: forma e travas lexicais`, p.length === 0, p.slice(0, 3).join(" | "))
    const f = problemasDeFonte(g.fonte, "semelhanca", [30, 50])
    confere(`semelhança ${g.id}: fonte`, f.length === 0, f.join(" | "))
    const v = vazios(g)
    confere(`semelhança ${g.id}: nenhum campo textual vazio`, v.length === 0, v.join(", "))
  }

  // o que cada glosa pode dizer
  const g = (id: string) => SEMELHANCAS.find((x) => x.id === id)
  confere("elemento_do_sol só se aplica a Sóis no mesmo elemento", JSON.stringify(g("elemento_do_sol")?.aplicaA.tipos) === JSON.stringify(["igual"]))
  confere("signo_do_corpo só se aplica à Lua e aos planetas pessoais, e não a Júpiter nem a Saturno", (g("signo_do_corpo")?.aplicaA.corpos ?? []).every((c) => ["sun", "moon", "mercury", "venus", "mars"].includes(c)) && !(g("signo_do_corpo")?.aplicaA.corpos ?? []).some((c) => ["jupiter", "saturn", "uranus", "neptune", "pluto"].includes(c)))
  confere("semelhanca_geral só tem ressalvas", (g("semelhanca_geral")?.nucleos.length ?? 1) === 0 && (g("semelhanca_geral")?.ressalvas.length ?? 0) > 0)
  confere("nenhuma glosa de semelhança fala de compatibilidade", SEMELHANCAS.every((x) => camposDeSemelhanca(x).every((c) => !/compat[ií]ve|compatibilidade/i.test(c.texto))))

  // a consulta: calculável não é interpretável
  confere("consulta: elemento de dois valores acha a glosa em qualquer ordem", glosaDaSemelhanca({ dimensao: "elemento", padraoA: "fire", padraoB: "water", tipoDeSemelhanca: "polaridade_oposta" })?.id === "elemento:fire|water" && glosaDaSemelhanca({ dimensao: "elemento", padraoA: "water", padraoB: "fire", tipoDeSemelhanca: "polaridade_oposta" })?.id === "elemento:fire|water")
  confere("consulta: modo acha a glosa", glosaDaSemelhanca({ dimensao: "modo", padraoA: "fixed", padraoB: "mutable", tipoDeSemelhanca: "diferente" })?.id === "modo:fixed|mutable")
  confere("consulta: elemento do Sol diferente não tem glosa", glosaDaSemelhanca({ dimensao: "elemento_do_sol", padraoA: "fire", padraoB: "air", tipoDeSemelhanca: "mesma_polaridade" }) === null)
  confere("consulta: elemento do Sol igual tem glosa", glosaDaSemelhanca({ dimensao: "elemento_do_sol", padraoA: "fire", padraoB: "fire", tipoDeSemelhanca: "igual" })?.id === "elemento_do_sol")
  for (const c of ["sun", "moon", "mercury", "venus", "mars"]) confere(`consulta: mesmo signo em ${c} tem glosa`, glosaDaSemelhanca({ dimensao: "signo_do_corpo", padraoA: `${c}:3`, padraoB: `${c}:3`, tipoDeSemelhanca: "igual" })?.id === "signo_do_corpo")
  for (const c of ["jupiter", "saturn", "uranus", "neptune", "pluto"]) confere(`consulta: mesmo signo em ${c} NÃO tem glosa`, glosaDaSemelhanca({ dimensao: "signo_do_corpo", padraoA: `${c}:3`, padraoB: `${c}:3`, tipoDeSemelhanca: "igual" }) === null)

  // controles negativos
  const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
  const base = clone(g("elemento:fire|fire") as GlosaDeSemelhanca)
  const comCompat = clone(base)
  comCompat.nucleos[0] = "Os dois são compatíveis e a compatibilidade é alta entre eles."
  confere("controle: a palavra compatibilidade é recusada", problemasDeSemelhanca(comCompat).some((x) => /compatibilidade/.test(x)))
  const comGenero = clone(base)
  comGenero.nucleos[0] = "Ela admira o que ele faz e deve procurar o casamento."
  confere("controle: gênero, prescrição e previsão são recusados", problemasDeSemelhanca(comGenero).length >= 3)
  const solErrado = clone(g("elemento_do_sol") as GlosaDeSemelhanca)
  solErrado.aplicaA = { tipos: ["igual", "mesma_polaridade"], corpos: [] }
  confere("controle: elemento do Sol aplicado a elementos diferentes é recusado", problemasDeSemelhanca(solErrado).some((x) => /mesmo elemento/.test(x)))
  const signoJupiter = clone(g("signo_do_corpo") as GlosaDeSemelhanca)
  signoJupiter.aplicaA = { tipos: [], corpos: ["sun", "jupiter"] }
  confere("controle: mesmo signo aplicado a Júpiter é recusado", problemasDeSemelhanca(signoJupiter).some((x) => /pessoais/.test(x)))
  const geralComNucleo = clone(g("semelhanca_geral") as GlosaDeSemelhanca)
  geralComNucleo.nucleos = ["Uma frase de núcleo que a glosa geral não deve ter."]
  confere("controle: a glosa geral com núcleo é recusada", problemasDeSemelhanca(geralComNucleo).some((x) => /só tem ressalvas/.test(x)))
  const semNucleo = clone(base)
  semNucleo.nucleos = []
  confere("controle: semelhança sem núcleo é recusada", problemasDeSemelhanca(semNucleo).some((x) => /sem núcleo/.test(x)))
  // núcleo operacional: tamanho, fidelidade e traço até a glosa completa
  const longo = clone(base)
  longo.nucleoOperacional[0] = { texto: base.nucleoOperacional[0].texto.repeat(5), deRefs: base.nucleoOperacional[0].deRefs }
  confere("controle: núcleo operacional acima do limite é recusado", problemasDeSemelhanca(longo).some((x) => /acima de/.test(x)))
  const semTraco = clone(base)
  semTraco.nucleoOperacional[0] = { texto: base.nucleoOperacional[0].texto, deRefs: [] }
  confere("controle: núcleo que não diz de que frases vem é recusado", problemasDeSemelhanca(semTraco).some((x) => /condensação/.test(x)))
  const refFalsa = clone(base)
  refFalsa.nucleoOperacional[0] = { texto: base.nucleoOperacional[0].texto, deRefs: ["nucleos[99]"] }
  confere("controle: referência para frase que não existe é recusada", problemasDeSemelhanca(refFalsa).some((x) => /não existe/.test(x)))
  const assuntoNovo = clone(base)
  assuntoNovo.nucleoOperacional[0] = { texto: "Parceria financeira duradoura com herança familiar compartilhada.", deRefs: base.nucleoOperacional[0].deRefs }
  confere("controle: núcleo com assunto que a glosa completa não tem é recusado", problemasDeSemelhanca(assuntoNovo).some((x) => /palavras de conteúdo/.test(x)))
  const compatOp = clone(base)
  compatOp.nucleoOperacional[0] = { texto: "A compatibilidade entre as duas pessoas de fogo é grande.", deRefs: base.nucleoOperacional[0].deRefs }
  confere("controle: compatibilidade no núcleo é recusada", problemasDeSemelhanca(compatOp).some((x) => /compatibilidade/.test(x)))
  const geralSemRessalva = clone(g("semelhanca_geral") as GlosaDeSemelhanca)
  delete (geralSemRessalva as { ressalvaOperacional?: unknown }).ressalvaOperacional
  confere("controle: a glosa geral sem ressalva operacional é recusada", problemasDeSemelhanca(geralSemRessalva).some((x) => /ressalva operacional/.test(x)))
  confere("todas as glosas de semelhança têm núcleo operacional (ou, na geral, ressalva operacional)", SEMELHANCAS.every((x) => x.dimensao === "semelhanca_geral" ? Boolean(x.ressalvaOperacional) : x.nucleoOperacional.length > 0))
  const natalNaoMarcada = clone(base)
  natalNaoMarcada.ressalvas = [...natalNaoMarcada.ressalvas, "Quando o elemento tem só planetas aflitos, a leitura muda bastante."]
  confere("controle: frase de condição natal sem marca é recusada", problemasDeSemelhanca(natalNaoMarcada).some((x) => /condição natal/.test(x)))
}

parteA()
parteB()
parteC()
parteD()
parteE()
parteSemelhancas()

if (falhas.length) {
  console.error(`\nO repertório do Davison falhou em ${falhas.length} ponto(s):\n`)
  for (const f of falhas.slice(0, 40)) console.error(`  ${f}`)
  if (falhas.length > 40) console.error(`  ... e mais ${falhas.length - 40}`)
  console.error("")
  process.exit(1)
}
relatorio()
console.log(`sinastria-referências: ${conferidos} conferências (55 pares, 120 overlays, 12 casas, fonte, travas, controles negativos)`)
