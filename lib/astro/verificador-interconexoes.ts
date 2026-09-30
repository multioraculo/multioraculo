/**
 * O verificador da síntese pessoal.
 *
 * DELIBERADAMENTE PEQUENO. O do horóscopo tem dezenas de regras porque aquele
 * texto tem estrutura fixa: três relações, termos por forma, origens por lado.
 * Aqui o texto é corrido, e inventar uma gramática inteira para ele criaria um
 * segundo sistema para manter. As regras abaixo são as que impedem o que este
 * texto pode errar de pior, e nada além.
 *
 * O que ele barra, e por que cada coisa:
 *
 *  1. VOCABULÁRIO FECHADO. Citar planeta, signo, casa ou aspecto que não está
 *     nos fatos daquela pessoa naquele dia. É o erro mais grave: o texto é
 *     individual, e uma invenção aqui é uma afirmação falsa sobre a vida de
 *     alguém, não uma imprecisão editorial.
 *  2. AFIRMAÇÃO SEM FATO. Toda afirmação declara de qual fato saiu, e o id tem
 *     de existir. Declarar origem inexistente é o mesmo que não declarar.
 *  3. COBERTURA DO QUE MAIS PESA. A interconexão de maior nota precisa ser
 *     tocada. Uma síntese que ignora o principal e desenvolve o marginal está
 *     lendo outro dia.
 *  4. PREVISÃO. Os fatos descrevem um céu, não um futuro. "Vai acontecer" não
 *     se sustenta em nada que o motor calculou.
 *  5. CONSELHO. O produto inteiro recusa prescrição, e aqui seria pior, porque
 *     o texto é pessoal e pago.
 *  6. GENÉRICO. Frase que serviria para qualquer pessoa em qualquer dia é o
 *     jeito educado de não dizer nada. Mede-se por ausência de qualquer nome
 *     dos fatos.
 *  7. TAMANHO E REGISTRO. Frases, palavras, travessão e as expressões vetadas
 *     que já valem para o resto do produto.
 *  8. MANIFESTAÇÃO SEM LASTRO. O exemplo concreto é a parte mais perigosa do
 *     texto: é ele que faz a leitura parecer sobre a vida de alguém, e é ele
 *     que, solto, vira adivinhação. Quatro exigências, e nenhuma delas julga o
 *     conteúdo do exemplo, só a sua ancoragem: ele pendura numa afirmação que
 *     declara uma INTERCONEXÃO (fato de contexto não sustenta exemplo); é
 *     HIPOTÉTICO, com uma das marcas da lista fechada; APARECE na síntese, ou
 *     é decoração que o leitor nunca vê; e não traz falsa precisão, que é
 *     hora, data ou dia da semana que nenhum cálculo produziu.
 *
 * O que ele NÃO faz: julgar se a interpretação é boa. Isso não é verificável, e
 * fingir que é seria pior do que não tentar.
 */
import type { Locale } from "@/lib/i18n/config"
import { CONSELHO, EXPRESSOES_EVITAR, FALSA_PRECISAO, PREVISAO, PROIBIDAS, TRACOS } from "./editorial"
import { ASPECTOS, CORPOS, SIGNOS } from "./nomes"
import type { FatoPessoal } from "./fatos-interconexoes"
import {
  AFIRMACOES,
  FRASES,
  MANIFESTACOES_MAX,
  MARCAS_MANIFESTACAO,
  PALAVRAS_MAX,
  type SintesePessoal,
} from "./prompt-interconexoes"

export type VereditoPessoal = { ok: true; sintese: SintesePessoal } | { ok: false; violacoes: string[] }

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

function contem(texto: string, termo: string): boolean {
  const t = semAcento(termo)
  if (!t) return false
  return new RegExp(`(^|[^\\p{L}])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "u").test(semAcento(texto))
}

/**
 * A ideia chegou ao texto que o leitor lê?
 *
 * A pergunta que importa é essa, e não se o modelo repetiu a mesma cadeia de
 * caracteres. Medir por prefixo exato reprovava texto CORRETO: a afirmação
 * dizia "Urano toca seu Ascendente" e a síntese escrevia "Urano, retrógrado,
 * chega ao seu Ascendente", que é o que prosa faz. Três mapas de teste caíram
 * inteiros no molde por isso, com o texto certo na mão.
 *
 * Então mede-se sobreposição de conteúdo: quanto das palavras da afirmação
 * reaparece na síntese. Palavras de até três letras ficam de fora porque "de",
 * "com" e "que" estão em qualquer frase e só inflariam a conta. Continua sendo
 * uma exigência de presença, e não de forma: uma afirmação ausente não chega
 * nem perto do piso.
 */
const PISO_DE_PRESENCA = 0.6

function chegouNaSintese(trecho: string, sintese: string): boolean {
  const alvo = semAcento(sintese)
  const palavras = semAcento(trecho)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((p) => p.length >= 4)
  if (palavras.length === 0) return true
  return palavras.filter((p) => alvo.includes(p)).length / palavras.length >= PISO_DE_PRESENCA
}

const palavras = (t: string) => t.trim().split(/\s+/).filter(Boolean).length
const frases = (t: string) => t.split(/(?<=[.!?])\s+/).map((f) => f.trim()).filter(Boolean).length

export function verificarSintesePessoal(params: {
  bruto: unknown
  fatos: FatoPessoal[]
  locale: Locale
}): VereditoPessoal {
  const { bruto, fatos, locale } = params
  const violacoes: string[] = []

  const entrada = bruto as Partial<SintesePessoal>
  const sintese = typeof entrada?.sintese === "string" ? entrada.sintese.trim() : ""
  const afirmacoes = (Array.isArray(entrada?.afirmacoes) ? entrada.afirmacoes : []).map((a) => {
    const bruta = (a as { manifestacoes?: unknown })?.manifestacoes
    return {
      texto: String((a as { texto?: unknown })?.texto ?? "").trim(),
      fato: String((a as { fato?: unknown })?.fato ?? "").trim(),
      manifestacoes: (Array.isArray(bruta) ? bruta : []).map((m) => String(m ?? "").trim()).filter(Boolean),
    }
  })
  const todasManifestacoes = afirmacoes.flatMap((a) => a.manifestacoes)

  if (!sintese) violacoes.push("síntese vazia")

  // ── 1 · vocabulário fechado ───────────────────────────────────────────────
  const tudoDosFatos = semAcento(fatos.map((f) => f.texto).join(" "))
  const citaNosFatos = (nome: string) => tudoDosFatos.includes(semAcento(nome))
  // os exemplos entram aqui: vocabulário fechado, previsão, conselho, travessão
  // e expressões vetadas valem para eles exatamente como para o resto
  const todoTexto = [sintese, ...afirmacoes.map((a) => a.texto), ...todasManifestacoes].join(" ")

  for (const nome of Object.values(CORPOS[locale])) {
    if (contem(todoTexto, nome) && !citaNosFatos(nome)) {
      violacoes.push(`cita ${nome}, que não está nos seus fatos de hoje`)
    }
  }
  for (const nome of SIGNOS[locale]) {
    if (contem(todoTexto, nome) && !citaNosFatos(nome)) {
      violacoes.push(`cita ${nome}, que não está nos seus fatos de hoje`)
    }
  }
  for (const nome of Object.values(ASPECTOS[locale])) {
    if (contem(todoTexto, nome) && !citaNosFatos(nome)) {
      violacoes.push(`cita ${nome}, que não é ângulo de nenhuma interconexão sua hoje`)
    }
  }

  // os nomes que ESTES fatos contêm: é a única lista de coisas que o texto pode
  // nomear, e serve tanto para a regra do genérico quanto para ancorar exemplos
  const nomesDosFatos = [
    ...Object.values(CORPOS[locale]),
    ...SIGNOS[locale],
    ...Object.values(ASPECTOS[locale]),
  ].filter((n) => citaNosFatos(n))

  // ── 2 · toda afirmação declara um fato que existe ─────────────────────────
  if (afirmacoes.length < AFIRMACOES.min || afirmacoes.length > AFIRMACOES.max) {
    violacoes.push(`${afirmacoes.length} afirmação(ões), fora de ${AFIRMACOES.min} a ${AFIRMACOES.max}`)
  }
  const ids = new Set(fatos.map((f) => f.id))
  for (const [i, a] of afirmacoes.entries()) {
    if (!a.texto) violacoes.push(`afirmação ${i + 1}: vazia`)
    if (!ids.has(a.fato)) violacoes.push(`afirmação ${i + 1}: declara o fato "${a.fato}", que não existe`)
    // a afirmação precisa aparecer na síntese, senão ela é decoração
    if (a.texto && !chegouNaSintese(a.texto, sintese)) {
      violacoes.push(`afirmação ${i + 1}: não aparece na síntese`)
    }
  }

  // ── 3 · o que mais pesa precisa ser tocado ────────────────────────────────
  const principais = fatos.filter((f) => f.tipo === "interconexao").sort((a, b) => b.nota - a.nota)
  if (principais.length > 0) {
    const usados = new Set(afirmacoes.map((a) => a.fato))
    if (!usados.has(principais[0].id)) {
      violacoes.push(`a interconexão mais relevante (${principais[0].id}) não sustenta nenhuma afirmação`)
    }
  }

  // ── 4, 5 · previsão e conselho ────────────────────────────────────────────
  for (const r of PREVISAO[locale]) {
    const achou = todoTexto.match(r)
    if (achou) violacoes.push(`afirma futuro: "${achou[0].trim()}". Os fatos descrevem um céu, não um acontecimento`)
  }
  for (const r of CONSELHO[locale]) {
    const achou = todoTexto.match(r)
    if (achou) violacoes.push(`dá conselho: "${achou[0].trim()}"`)
  }

  // ── 6 · genérico: a síntese precisa nomear algo dos fatos ─────────────────
  if (sintese && !nomesDosFatos.some((n) => contem(sintese, n))) {
    violacoes.push("a síntese não nomeia nada dos seus fatos: serviria para qualquer pessoa")
  }

  // ── 8 · a manifestação concreta, medida onde o leitor a lê ────────────────
  //
  // A primeira versão desta regra exigia o exemplo em DOIS lugares: num campo
  // declarado e dentro da síntese, batendo nos dois. Custou três mapas de
  // teste caindo inteiros no molde com o texto certo na mão, porque prosa
  // reescreve e a comparação nunca fechava. A duplicação era minha, não do
  // modelo.
  //
  // Agora há um texto só. Toda passagem hipotética da síntese é um exemplo, e
  // dela se exige o que de fato protege quem lê: que a frase (ou a que vem
  // logo antes dela, quando o exemplo segue a interpretação) NOMEIE algo dos
  // fatos, senão o exemplo não é de ninguém; e que não haja precisão que
  // nenhum cálculo produziu. O resto já é conferido no texto inteiro:
  // vocabulário fechado, previsão, conselho e expressões vetadas.
  const marcas = MARCAS_MANIFESTACAO[locale]
  const sentencas = sintese.split(/(?<=[.!?])\s+/).map((f) => f.trim()).filter(Boolean)
  let exemplos = 0

  for (const [i, frase] of sentencas.entries()) {
    const marca = marcas.find((m) => semAcento(frase).includes(semAcento(m)))
    if (!marca) continue
    exemplos += 1

    // a frase do exemplo, ou a anterior, precisa dizer de qual relação ele sai
    const ancorada = [frase, sentencas[i - 1] ?? ""].some((f) => nomesDosFatos.some((n) => contem(f, n)))
    if (!ancorada) {
      violacoes.push(`exemplo ${exemplos}: não se liga a nenhum fato seu, então serviria para qualquer pessoa`)
    }

    const trecho = frase.slice(semAcento(frase).indexOf(semAcento(marca)))
    for (const r of FALSA_PRECISAO[locale]) {
      const achou = trecho.match(r)
      if (achou) violacoes.push(`exemplo ${exemplos}: "${achou[0].trim()}" é uma precisão que nenhum cálculo produziu`)
    }
  }

  const teto = MANIFESTACOES_MAX * Math.max(1, principais.length)
  if (exemplos > teto) violacoes.push(`${exemplos} exemplos concretos, acima de ${teto}`)

  // e nenhuma hora, data ou dia da semana em lugar nenhum do texto: o motor
  // calcula um céu, e céu não marca hora para a vida de ninguém
  for (const r of FALSA_PRECISAO[locale]) {
    const achou = sintese.match(r)
    if (achou) violacoes.push(`a síntese diz "${achou[0].trim()}", que nenhum cálculo produziu`)
  }

  // ── 7 · tamanho e registro ────────────────────────────────────────────────
  if (sintese) {
    const nf = frases(sintese)
    if (nf < FRASES.min || nf > FRASES.max) violacoes.push(`${nf} frase(s), fora de ${FRASES.min} a ${FRASES.max}`)
    const np = palavras(sintese)
    if (np > PALAVRAS_MAX) violacoes.push(`${np} palavras, acima de ${PALAVRAS_MAX}`)
  }
  if (TRACOS.test(todoTexto)) violacoes.push("usa travessão ou meia risca")
  for (const regex of PROIBIDAS[locale]) {
    const achou = todoTexto.match(regex)
    if (achou) violacoes.push(`expressão proibida "${achou[0].trim()}"`)
  }
  for (const e of EXPRESSOES_EVITAR[locale]) {
    if (contem(todoTexto, e)) violacoes.push(`expressão evitada "${e}"`)
  }

  if (violacoes.length) return { ok: false, violacoes: [...new Set(violacoes)] }
  return { ok: true, sintese: { afirmacoes, sintese } }
}
