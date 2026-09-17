/**
 * O verificador da leitura do dia. Reprovado não é publicado.
 *
 * Ele confere três coisas, nesta ordem de importância:
 *
 *  1. VERDADE. Todo planeta, signo e aspecto citado no texto precisa existir
 *     nos movimentos que o céu daquele dia entregou. Se a leitura falar em
 *     quadratura num card de oposição, ou citar Júpiter num dia em que Júpiter
 *     não foi selecionado, é afirmação sem lastro e o texto cai.
 *  2. CLAREZA. A polaridade precisa ter dois lados legíveis, e a explicação
 *     precisa nomear os planetas e o signo. Sem isso o leitor teria de
 *     adivinhar por que duas palavras foram postas em tensão.
 *  3. REGISTRO. Nada de previsão, conselho, diagnóstico, autor citado,
 *     "arquétipo" ou travessão.
 *
 * É a mesma postura do índice de PDFs da síntese, que lança erro em vez de
 * seguir com material não validado: sem isto, "a IA não inventa posições"
 * seria promessa, não garantia.
 */
import type { Locale } from "@/lib/i18n/config"
import type { CardMovimento } from "./apresentar"
import { IMPERATIVOS, PROIBIDAS, TRACOS } from "./editorial"
import { ASPECTOS, CORPOS, SIGNOS } from "./nomes"
import type { Leitura } from "./prompt-horoscopo"

export type Veredito = { ok: true; leitura: Leitura } | { ok: false; violacoes: string[] }

const PALAVRAS_FOCO = { min: 3, max: 10 }
const PALAVRAS_LADO = { min: 2, max: 7 }
const PALAVRAS_TENDENCIA = { min: 45, max: 130 }
const PALAVRAS_LINHA = { min: 3, max: 20 }
const FRASES_EXPLICACAO = { min: 2, max: 7 }

const semAcento = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const palavras = (texto: string) => texto.trim().split(/\s+/).filter(Boolean).length

const frases = (texto: string) => texto.split(/[.!?]+/).map((f) => f.trim()).filter(Boolean).length

/** Palavras que carregam sentido: as curtas são ligação, não conteúdo. */
const significativas = (texto: string) =>
  semAcento(texto)
    .split(/[^\p{L}]+/u)
    .filter((p) => p.length >= 4)

/** Este lado da polaridade é só a lista de verbos daquele planeta? */
function eco(lado: string, verbos: string[]): boolean {
  const palavrasDoLado = significativas(lado)
  if (!palavrasDoLado.length) return false
  const doPlaneta = new Set(verbos.flatMap(significativas))
  const repetidas = palavrasDoLado.filter((p) => doPlaneta.has(p)).length
  return repetidas / palavrasDoLado.length >= 0.6
}

function contem(texto: string, termo: string): boolean {
  const t = semAcento(termo).trim()
  if (t.length < 3) return false
  return new RegExp(`(^|[^\\p{L}])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "u").test(semAcento(texto))
}

export function verificarLeitura(params: {
  bruto: unknown
  cards: CardMovimento[]
  signo: number
  locale: Locale
}): Veredito {
  const { bruto, cards, signo, locale } = params
  const violacoes: string[] = []

  const leitura = bruto as Partial<Leitura>
  const foco = typeof leitura?.foco === "string" ? leitura.foco.trim() : ""
  const relacoesBrutas = Array.isArray(leitura?.relacoes) ? leitura.relacoes : []
  const tend = (leitura?.tendencias ?? {}) as Partial<Leitura["tendencias"]>
  const tendencias = {
    texto: typeof tend.texto === "string" ? tend.texto.trim() : "",
    disponivel: typeof tend.disponivel === "string" ? tend.disponivel.trim() : "",
    emJogo: typeof tend.emJogo === "string" ? tend.emJogo.trim() : "",
  }

  // ── forma ────────────────────────────────────────────────────────────────
  if (!foco) violacoes.push("foco ausente")
  if (relacoesBrutas.length !== cards.length) {
    violacoes.push(`esperava ${cards.length} relações, vieram ${relacoesBrutas.length}`)
  }
  if (!tendencias.texto) violacoes.push("tendências sem texto")
  if (!tendencias.disponivel) violacoes.push("tendências sem a linha do que está disponível")
  if (!tendencias.emJogo) violacoes.push("tendências sem a linha do que está em jogo")

  const relacoes = cards.map((_, i) => {
    const achada = relacoesBrutas.find((r) => Number((r as { n?: unknown })?.n) === i + 1) ?? relacoesBrutas[i]
    const lados = Array.isArray((achada as { polaridade?: unknown })?.polaridade)
      ? ((achada as { polaridade: unknown[] }).polaridade.map((x) => String(x ?? "").trim()) as string[])
      : []
    return {
      n: i + 1,
      polaridade: [lados[0] ?? "", lados[1] ?? ""] as [string, string],
      explicacao: typeof (achada as { explicacao?: unknown })?.explicacao === "string" ? (achada as { explicacao: string }).explicacao.trim() : "",
    }
  })

  // ── vocabulário permitido: só o que o céu calculado contém ───────────────
  const corposOk = new Set(cards.flatMap((c) => c.mencoes.corpos))
  const signosOk = new Set<number>([signo, ...cards.flatMap((c) => c.mencoes.signos)])
  const aspectosOk = new Set(cards.flatMap((c) => c.mencoes.aspectos))

  const todosCorpos = Object.entries(CORPOS[locale]) as Array<[string, string]>
  const todosAspectos = Object.entries(ASPECTOS[locale]) as Array<[string, string]>

  const conferirVocabulario = (campo: string, texto: string) => {
    if (!texto) return
    for (const [chave, nome] of todosCorpos) {
      if (corposOk.has(chave as never)) continue
      if (contem(texto, nome)) violacoes.push(`${campo}: cita ${nome}, que não está nos movimentos de hoje`)
    }
    SIGNOS[locale].forEach((nome, indice) => {
      if (signosOk.has(indice)) return
      if (contem(texto, nome)) violacoes.push(`${campo}: cita ${nome}, que não está nos movimentos de hoje`)
    })
    for (const [chave, nome] of todosAspectos) {
      if (aspectosOk.has(chave)) continue
      if (contem(texto, nome)) violacoes.push(`${campo}: cita ${nome}, que não é o ângulo de nenhum movimento de hoje`)
    }
  }

  const conferirRegistro = (campo: string, texto: string) => {
    if (!texto) return
    if (TRACOS.test(texto)) violacoes.push(`${campo}: usa travessão ou meia risca`)
    for (const regex of PROIBIDAS[locale]) {
      const achou = texto.match(regex)
      if (achou) violacoes.push(`${campo}: expressão proibida "${achou[0]}"`)
    }
  }

  const campos: Array<[string, string]> = [
    ["foco", foco],
    ["tendências", tendencias.texto],
    ["disponível", tendencias.disponivel],
    ["em jogo", tendencias.emJogo],
    ...relacoes.flatMap((r, i): Array<[string, string]> => [
      [`relação ${i + 1}, polaridade`, r.polaridade.join(" | ")],
      [`relação ${i + 1}, explicação`, r.explicacao],
    ]),
  ]
  for (const [campo, texto] of campos) {
    conferirRegistro(campo, texto)
    conferirVocabulario(campo, texto)
  }

  // ── o título do dia precisa ser legível sozinho ──────────────────────────
  if (foco) {
    const n = palavras(foco)
    if (n < PALAVRAS_FOCO.min || n > PALAVRAS_FOCO.max) violacoes.push(`foco com ${n} palavras, fora de ${PALAVRAS_FOCO.min} a ${PALAVRAS_FOCO.max}`)
    conferirSemTermos("foco", foco)
  }

  // ── cada relação ─────────────────────────────────────────────────────────
  relacoes.forEach((relacao, i) => {
    const card = cards[i]
    const rotulo = `relação ${i + 1}`

    for (const [lado, texto] of [["lado A", relacao.polaridade[0]], ["lado B", relacao.polaridade[1]]] as Array<[string, string]>) {
      if (!texto) {
        violacoes.push(`${rotulo}: ${lado} vazio`)
        continue
      }
      const n = palavras(texto)
      if (n < PALAVRAS_LADO.min || n > PALAVRAS_LADO.max) {
        violacoes.push(`${rotulo}: ${lado} com ${n} palavra(s), fora de ${PALAVRAS_LADO.min} a ${PALAVRAS_LADO.max}`)
      }
      conferirSemTermos(`${rotulo}, ${lado}`, texto)
    }
    if (relacao.polaridade[0] && semAcento(relacao.polaridade[0]) === semAcento(relacao.polaridade[1])) {
      violacoes.push(`${rotulo}: os dois lados da polaridade são iguais`)
    }

    // os verbos dos dois planetas já estão na tela, na coluna acima da
    // polaridade. Repetir os dois lados devolve ao leitor o que ele acabou de
    // ler, sem dizer o que a relação exige dele
    if (card.b && eco(relacao.polaridade[0], card.a.verbos) && eco(relacao.polaridade[1], card.b.verbos)) {
      violacoes.push(`${rotulo}: a polaridade só repete os verbos dos dois planetas`)
    }

    if (!relacao.explicacao) {
      violacoes.push(`${rotulo}: explicação vazia`)
      return
    }
    const nf = frases(relacao.explicacao)
    if (nf < FRASES_EXPLICACAO.min || nf > FRASES_EXPLICACAO.max) {
      violacoes.push(`${rotulo}: explicação com ${nf} frase(s), fora de ${FRASES_EXPLICACAO.min} a ${FRASES_EXPLICACAO.max}`)
    }
    if (!contem(relacao.explicacao, card.a.nome)) violacoes.push(`${rotulo}: explicação não nomeia ${card.a.nome}`)
    if (card.b && !contem(relacao.explicacao, card.b.nome)) violacoes.push(`${rotulo}: explicação não nomeia ${card.b.nome}`)
    if (!contem(relacao.explicacao, SIGNOS[locale][signo])) {
      violacoes.push(`${rotulo}: explicação não diz por que isso vale para ${SIGNOS[locale][signo]}`)
    }
  })

  // ── o fecho ──────────────────────────────────────────────────────────────
  if (tendencias.texto) {
    const n = palavras(tendencias.texto)
    if (n < PALAVRAS_TENDENCIA.min || n > PALAVRAS_TENDENCIA.max) {
      violacoes.push(`tendências com ${n} palavras, fora de ${PALAVRAS_TENDENCIA.min} a ${PALAVRAS_TENDENCIA.max}`)
    }
  }
  for (const [campo, texto] of [["disponível", tendencias.disponivel], ["em jogo", tendencias.emJogo]] as Array<[string, string]>) {
    if (!texto) continue
    const n = palavras(texto)
    if (n < PALAVRAS_LINHA.min || n > PALAVRAS_LINHA.max) {
      violacoes.push(`${campo}: ${n} palavra(s), fora de ${PALAVRAS_LINHA.min} a ${PALAVRAS_LINHA.max}`)
    }
    if (IMPERATIVOS[locale].test(texto)) violacoes.push(`${campo}: começa no imperativo, virou conselho`)
  }

  if (violacoes.length) return { ok: false, violacoes: [...new Set(violacoes)] }
  return { ok: true, leitura: { foco, relacoes, tendencias } }

  /** O foco e as polaridades falam sem jargão: nenhum nome técnico neles. */
  function conferirSemTermos(campo: string, texto: string) {
    for (const nome of Object.values(CORPOS[locale])) {
      if (contem(texto, nome)) violacoes.push(`${campo}: contém o termo técnico ${nome}`)
    }
    for (const nome of SIGNOS[locale]) {
      if (contem(texto, nome)) violacoes.push(`${campo}: contém o termo técnico ${nome}`)
    }
    for (const nome of Object.values(ASPECTOS[locale])) {
      if (contem(texto, nome)) violacoes.push(`${campo}: contém o termo técnico ${nome}`)
    }
  }
}
