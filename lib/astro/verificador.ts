/**
 * O verificador da leitura do dia. Reprovado não é publicado.
 *
 * Ele confere quatro coisas, nesta ordem de importância:
 *
 *  1. VERDADE. Todo planeta, signo e aspecto citado precisa existir nos
 *     movimentos daquele dia. Falar em quadratura num card de oposição, ou
 *     citar Júpiter num dia em que Júpiter não foi selecionado, é afirmação
 *     sem lastro e o texto cai.
 *  2. RASTREABILIDADE. Cada termo interpretativo declara de qual elemento
 *     calculado ele saiu, e a declaração precisa ser possível naquele card:
 *     não se pode alegar retrogradação de um planeta direto, nem regência num
 *     card onde nenhum dos corpos rege o signo do leitor. É o que impede o
 *     modelo de completar o segundo lado por plausibilidade.
 *  3. FORMA. A geometria manda: oposição e quadratura admitem dois termos em
 *     tensão, sextil e trígono dois termos que se somam, posição nenhum. Card
 *     que vem com termo a mais ou a menos é reprovado.
 *  4. REGISTRO. Nada de previsão, conselho, diagnóstico, autor citado,
 *     "arquétipo" ou travessão.
 *
 * É a mesma postura do índice de PDFs da síntese, que lança erro em vez de
 * seguir com material não validado: sem isto, "a IA não inventa posições"
 * seria promessa, não garantia.
 */
import type { Locale } from "@/lib/i18n/config"
import type { CardMovimento } from "./apresentar"
import { PROIBIDAS, TRACOS } from "./editorial"
import { ASPECTOS, CORPOS, SIGNOS } from "./nomes"
import { ORIGENS, type Leitura, type Origem, type TermoEscrito } from "./prompt-horoscopo"

export type Veredito = { ok: true; leitura: Leitura } | { ok: false; violacoes: string[] }

const PALAVRAS_FOCO = { min: 3, max: 10 }
const PALAVRAS_TERMO = { min: 2, max: 7 }
const FRASES_EXPLICACAO = { min: 2, max: 7 }
/** teto de tipos de fato exigidos; um card que ofereça menos exige menos */
const MAX_TIPOS_ANCORA = 3

const semAcento = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const palavras = (texto: string) => texto.trim().split(/\s+/).filter(Boolean).length

const frases = (texto: string) => texto.split(/[.!?]+/).map((f) => f.trim()).filter(Boolean).length

const significativas = (texto: string) =>
  semAcento(texto)
    .split(/[^\p{L}]+/u)
    .filter((p) => p.length >= 4)

/**
 * Este termo devolve ao leitor só o que já está na tela?
 *
 * Um termo que declara vir da função do planeta vai usar as palavras dela, e
 * isso é honesto. O que não pode é o termo ser NADA ALÉM delas: "distinguir e
 * nomear" não acrescenta; "nomear o equilíbrio" situa a função no campo onde
 * ela está. Por isso o corte é total, e não proporcional.
 */
function ecoTotal(texto: string, fonte: string[]): boolean {
  const doTermo = significativas(texto)
  if (!doTermo.length) return false
  const daFonte = new Set(fonte.flatMap(significativas))
  return doTermo.every((p) => daFonte.has(p))
}

/** A glosa do ângulo nunca é termo: aqui basta parecer com ela. */
function ecoParcial(texto: string, fonte: string[]): boolean {
  const doTermo = significativas(texto)
  if (!doTermo.length) return false
  const daFonte = new Set(fonte.flatMap(significativas))
  return doTermo.filter((p) => daFonte.has(p)).length / doTermo.length >= 0.6
}

function contem(texto: string, termo: string): boolean {
  const t = semAcento(termo).trim()
  if (t.length < 3) return false
  return new RegExp(`(^|[^\\p{L}])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "u").test(semAcento(texto))
}

/** Quantos termos aquela forma admite. */
function termosEsperados(card: CardMovimento): number {
  return card.forma === "posicao" ? 0 : 2
}

/** Os fatos da configuração em que uma frase pode se apoiar. */
export type Ancora = "signo" | "aspecto" | "movimento" | "fase" | "grau" | "regencia" | "contexto" | "evento"

const PALAVRAS_FASE: Record<Locale, string[]> = {
  pt: ["aplicativo", "separativo", "se formando", "se forma", "ponto exato", "já passou", "se fechando", "se afastando", "ainda não chegou"],
  en: ["applying", "separating", "still forming", "exact point", "already passed", "closing in", "moving apart"],
  es: ["aplicativo", "separativo", "formándose", "punto exacto", "ya pasó", "cerrándose", "alejándose"],
}

const PALAVRAS_REGENCIA: Record<Locale, string[]> = {
  pt: ["regente", "rege"],
  en: ["ruler", "rules"],
  es: ["regente", "rige"],
}

/**
 * Em que fatos esta frase se apoia.
 *
 * É o teste de especificidade: se tirarmos os fatos e a frase continuar
 * funcionando para outro signo ou outro dia, ela não estava dizendo nada. Não
 * se proíbe palavra do signo; exige-se que a frase dependa de alguma coisa
 * que só é verdade neste céu.
 */
export function ancorasDaFrase(frase: string, card: CardMovimento, locale: Locale): Ancora[] {
  const achadas = new Set<Ancora>()
  const alvo = semAcento(frase)

  if (contem(frase, card.a.nomeSigno) || (card.b && contem(frase, card.b.nomeSigno))) achadas.add("signo")
  if (card.aspecto && contem(frase, ASPECTOS[locale][card.aspecto] ?? "")) achadas.add("aspecto")
  if ((card.a.retrogrado || card.b?.retrogrado) && alvo.includes("retrograd")) achadas.add("movimento")
  if (PALAVRAS_FASE[locale].some((p) => alvo.includes(semAcento(p)))) achadas.add("fase")
  if (/\d+[.,]?\d*\s*°/.test(frase) || contem(frase, locale === "en" ? "degree" : "grau") || contem(frase, locale === "en" ? "degrees" : "graus")) {
    achadas.add("grau")
  }
  if ((card.a.regente || card.b?.regente) && PALAVRAS_REGENCIA[locale].some((p) => contem(frase, p))) achadas.add("regencia")

  const proprios = new Set([card.a.corpo, card.b?.corpo].filter(Boolean))
  const doContexto = card.mencoes.corpos.filter((c) => !proprios.has(c))
  if (doContexto.some((c) => contem(frase, CORPOS[locale][c]))) achadas.add("contexto")

  // o nome do evento (uma lunação, uma estação) também é fato do dia
  if (card.tipo === "evento" && ecoParcial(card.titulo, [frase])) achadas.add("evento")

  return [...achadas]
}

/**
 * Quantos tipos de fato ESTE card tem para oferecer.
 *
 * Uma lunação não tem ângulo, nem retrogradação, nem regência, nem contexto:
 * cobrar dela os mesmos três fatos de uma oposição seria exigir o impossível,
 * e o modelo ficaria reprovando para sempre sem ter como acertar.
 */
function ancorasDisponiveis(card: CardMovimento): number {
  // o grau não entra na conta: ele existe sempre, mas citar "23,1°" numa
  // frase raramente é o que torna a leitura específica, e cobrá-lo forçaria
  // um texto pedante
  let n = 1 // o signo existe sempre
  if (card.aspecto) n += 2 // o ângulo e a fase dele
  if (card.a.retrogrado || card.b?.retrogrado) n += 1
  if (card.a.regente || card.b?.regente) n += 1
  const proprios = new Set([card.a.corpo, card.b?.corpo].filter(Boolean))
  if (card.mencoes.corpos.some((c) => !proprios.has(c))) n += 1
  if (card.tipo === "evento") n += 1
  return n
}

/**
 * Quais origens são possíveis para o termo daquele lado.
 *
 * Cada polo se sustenta na configuração do SEU corpo: o primeiro termo sai de
 * A, o segundo de B. O ângulo não é origem de termo, porque ele é o que põe os
 * dois em relação e não um dos lados. Sem essa separação, o modelo satisfazia
 * a regra citando a glosa do ângulo como se fosse um polo.
 */
function origensPossiveis(card: CardMovimento, indice: number): Set<Origem> {
  const ok = new Set<Origem>()
  const lado = indice === 0 ? card.a : card.b
  if (!lado) return ok
  if (indice === 0) {
    ok.add("planetaA")
    ok.add("signoA")
    if (card.a.retrogrado) ok.add("movimentoA")
  } else {
    ok.add("planetaB")
    ok.add("signoB")
    if (card.b?.retrogrado) ok.add("movimentoB")
  }
  if (lado.regente) ok.add("regencia")
  return ok
}

export function verificarLeitura(params: {
  bruto: unknown
  cards: CardMovimento[]
  signo: number
  locale: Locale
}): Veredito {
  const { bruto, cards, signo, locale } = params
  const violacoes: string[] = []

  const entrada = bruto as Partial<Leitura>
  const foco = typeof entrada?.foco === "string" ? entrada.foco.trim() : ""
  const brutas = Array.isArray(entrada?.relacoes) ? entrada.relacoes : []

  if (!foco) violacoes.push("foco ausente")
  if (brutas.length !== cards.length) violacoes.push(`esperava ${cards.length} relações, vieram ${brutas.length}`)

  const relacoes = cards.map((_, i) => {
    const achada = brutas.find((r) => Number((r as { n?: unknown })?.n) === i + 1) ?? brutas[i]
    const lista = Array.isArray((achada as { termos?: unknown })?.termos) ? (achada as { termos: unknown[] }).termos : []
    const termos: TermoEscrito[] = lista.map((t) => ({
      texto: String((t as { texto?: unknown })?.texto ?? "").trim(),
      origem: String((t as { origem?: unknown })?.origem ?? "") as Origem,
    }))
    const explicacao = typeof (achada as { explicacao?: unknown })?.explicacao === "string" ? (achada as { explicacao: string }).explicacao.trim() : ""
    return { n: i + 1, termos, explicacao }
  })

  // ── vocabulário permitido: só o que o céu calculado contém ───────────────
  const corposOk = new Set(cards.flatMap((c) => c.mencoes.corpos))
  const signosOk = new Set<number>([signo, ...cards.flatMap((c) => c.mencoes.signos)])
  const aspectosOk = new Set(cards.flatMap((c) => c.mencoes.aspectos))

  const conferirVocabulario = (campo: string, texto: string) => {
    if (!texto) return
    for (const [chave, nome] of Object.entries(CORPOS[locale])) {
      if (corposOk.has(chave as never)) continue
      if (contem(texto, nome)) violacoes.push(`${campo}: cita ${nome}, que não está nos movimentos de hoje`)
    }
    SIGNOS[locale].forEach((nome, indice) => {
      if (signosOk.has(indice)) return
      if (contem(texto, nome)) violacoes.push(`${campo}: cita ${nome}, que não está nos movimentos de hoje`)
    })
    for (const [chave, nome] of Object.entries(ASPECTOS[locale])) {
      if (aspectosOk.has(chave)) continue
      if (contem(texto, nome)) violacoes.push(`${campo}: cita ${nome}, que não é o ângulo de nenhum movimento de hoje`)
    }
  }

  const conferirRegistro = (campo: string, texto: string) => {
    if (!texto) return
    if (TRACOS.test(texto)) violacoes.push(`${campo}: usa travessão ou meia risca`)
    for (const regex of PROIBIDAS[locale]) {
      const achou = texto.match(regex)
      if (achou) violacoes.push(`${campo}: expressão proibida "${achou[0].trim()}"`)
    }
  }

  const semTermosTecnicos = (campo: string, texto: string) => {
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

  const campos: Array<[string, string]> = [
    ["foco", foco],
    ...relacoes.flatMap((r, i): Array<[string, string]> => [
      [`relação ${i + 1}, termos`, r.termos.map((t) => t.texto).join(" | ")],
      [`relação ${i + 1}, explicação`, r.explicacao],
    ]),
  ]
  for (const [campo, texto] of campos) {
    conferirRegistro(campo, texto)
    conferirVocabulario(campo, texto)
  }

  // ── o foco precisa ser legível sozinho ───────────────────────────────────
  if (foco) {
    const n = palavras(foco)
    if (n < PALAVRAS_FOCO.min || n > PALAVRAS_FOCO.max) {
      violacoes.push(`foco com ${n} palavras, fora de ${PALAVRAS_FOCO.min} a ${PALAVRAS_FOCO.max}`)
    }
    semTermosTecnicos("foco", foco)
  }

  // ── cada relação ─────────────────────────────────────────────────────────
  relacoes.forEach((relacao, i) => {
    const card = cards[i]
    const rotulo = `relação ${i + 1}`
    const esperados = termosEsperados(card)

    if (relacao.termos.length !== esperados) {
      violacoes.push(`${rotulo}: forma ${card.forma} pede ${esperados} termo(s), vieram ${relacao.termos.length}`)
    }

    relacao.termos.forEach((termo, j) => {
      const nome = `${rotulo}, termo ${j + 1}`
      if (!termo.texto) {
        violacoes.push(`${nome}: vazio`)
        return
      }
      const n = palavras(termo.texto)
      if (n < PALAVRAS_TERMO.min || n > PALAVRAS_TERMO.max) {
        violacoes.push(`${nome}: ${n} palavra(s), fora de ${PALAVRAS_TERMO.min} a ${PALAVRAS_TERMO.max}`)
      }
      semTermosTecnicos(nome, termo.texto)

      const possiveis = origensPossiveis(card, j)
      if (!ORIGENS.includes(termo.origem)) {
        violacoes.push(`${nome}: origem "${termo.origem}" não existe`)
      } else if (!possiveis.has(termo.origem)) {
        violacoes.push(
          `${nome}: origem "${termo.origem}" não sustenta este lado. Possíveis aqui: ${[...possiveis].join(", ")}`,
        )
      }

      const lado = j === 0 ? card.a : (card.b ?? card.a)
      if (ecoTotal(termo.texto, lado.verbos)) violacoes.push(`${nome}: é só a lista de verbos que já está na tela`)
      if (ecoParcial(termo.texto, [card.glosa])) violacoes.push(`${nome}: só repete a descrição do ângulo`)
    })

    if (relacao.termos.length === 2 && semAcento(relacao.termos[0].texto) === semAcento(relacao.termos[1].texto)) {
      violacoes.push(`${rotulo}: os dois termos são iguais`)
    }

    if (!relacao.explicacao) {
      violacoes.push(`${rotulo}: explicação vazia`)
      return
    }
    const nf = frases(relacao.explicacao)
    if (nf < FRASES_EXPLICACAO.min || nf > FRASES_EXPLICACAO.max) {
      violacoes.push(`${rotulo}: explicação com ${nf} frase(s), fora de ${FRASES_EXPLICACAO.min} a ${FRASES_EXPLICACAO.max}`)
    }
    // a explicação precisa situar cada corpo: nome do corpo e signo onde ele está
    if (!contem(relacao.explicacao, card.a.nome)) violacoes.push(`${rotulo}: explicação não nomeia ${card.a.nome}`)
    if (!contem(relacao.explicacao, card.a.nomeSigno)) {
      violacoes.push(`${rotulo}: explicação não diz em que signo ${card.a.nome} está`)
    }
    // num evento o segundo corpo entra no cálculo (a fase depende do Sol) mas
    // não é assunto do texto: só o aspecto obriga a nomear os dois
    if (card.b && card.tipo === "aspecto") {
      if (!contem(relacao.explicacao, card.b.nome)) violacoes.push(`${rotulo}: explicação não nomeia ${card.b.nome}`)
      if (!contem(relacao.explicacao, card.b.nomeSigno)) {
        violacoes.push(`${rotulo}: explicação não diz em que signo ${card.b.nome} está`)
      }
    }
    if (!contem(relacao.explicacao, SIGNOS[locale][signo])) {
      violacoes.push(`${rotulo}: explicação não diz por que isso vale para ${SIGNOS[locale][signo]}`)
    }

    // especificidade: a frase precisa depender de algum fato desta
    // configuração. Uma frase solta é tolerada (a que fecha o raciocínio);
    // duas ou mais indicam texto que serviria a qualquer céu.
    const doTexto = relacao.explicacao.split(/(?<=[.!?])\s+/).map((f) => f.trim()).filter(Boolean)
    const tipos = new Set<Ancora>()
    const soltas: string[] = []
    for (const f of doTexto) {
      const ancoras = ancorasDaFrase(f, card, locale)
      ancoras.forEach((x) => tipos.add(x))
      if (!ancoras.length) soltas.push(f)
    }
    if (soltas.length > 1) {
      violacoes.push(
        `${rotulo}: ${soltas.length} frases não se apoiam em nenhum fato desta configuração, serviriam a qualquer céu: "${soltas.map((f) => f.slice(0, 60)).join('" / "')}"`,
      )
    }
    const exigidos = Math.min(MAX_TIPOS_ANCORA, ancorasDisponiveis(card))
    if (tipos.size < exigidos) {
      violacoes.push(
        `${rotulo}: explicação apoiada em poucos fatos (${[...tipos].join(", ") || "nenhum"}). Este movimento oferece ${ancorasDisponiveis(card)}; use ao menos ${exigidos}`,
      )
    }

    // uma posição com contexto não pode ser lida como peça isolada: o outro
    // aspecto que aquele corpo faz hoje muda como ele se expressa
    if (card.forma === "posicao" && card.contexto.length) {
      const proprios = new Set([card.a.corpo, card.b?.corpo].filter(Boolean))
      const doContexto = card.mencoes.corpos.filter((c) => !proprios.has(c))
      const citou = doContexto.some((c) => contem(relacao.explicacao, CORPOS[locale][c]))
      if (doContexto.length && !citou) {
        violacoes.push(
          `${rotulo}: ${card.a.nome} não está isolado hoje e a explicação ignora o que ele faz com ${doContexto.map((c) => CORPOS[locale][c]).join(", ")}`,
        )
      }
    }
  })

  if (violacoes.length) return { ok: false, violacoes: [...new Set(violacoes)] }
  return { ok: true, leitura: { foco, relacoes } }
}
