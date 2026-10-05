/**
 * A síntese curta da tiragem do dia, e o verificador dela.
 *
 * O princípio é o mesmo da síntese das consultas e do horóscopo: o material
 * simbólico vem primeiro, a interpretação depois. A IA não decide o que foi
 * sorteado; recebe as duas cartas já determinadas e escreve o cruzamento
 * entre elas.
 *
 * A exigência central é não convergir. Duas cartas viram facilmente uma moral
 * só ("aceite o momento"), e aí a tiragem deixa de importar: o texto serviria
 * para qualquer outra dupla. Por isso o verificador cobra que as duas apareçam
 * nominalmente, e que o eixo traga uma palavra por carta.
 *
 * A tiragem é a mesma para todo mundo, o que muda o peso da regra contra
 * previsão: uma dupla dura cai em todas as pessoas no mesmo dia.
 */
import type { Locale } from "@/lib/i18n/config"
import { languageRule } from "./language"
import type { TiragemDoDia } from "./tiragem-dia"
import {
  cartasDeJson, materialDoLenormand, materialDoTarot, referenciasCruzadas, REGRA_DE_REVERSAO, type CartasIndividuais,
} from "./cartas-individuais"

export type SinteseDoDia = { eixo: [string, string]; sintese: string }

/** O veredito das interpretações INDIVIDUAIS (o verso de cada carta), separado da síntese. */
export type VereditoCartas = { tarot: string | null; lenormand: string | null; violacoes: string[] }

export type VereditoDia = { ok: true; eixo: [string, string]; sintese: string } | { ok: false; violacoes: string[] }

const PALAVRAS = { min: 30, max: 70 }
/** Interpretação individual: curta, porque cabe no verso da carta. A janela do verificador é mais larga que a do pedido. */
const PALAVRAS_CARTA = { pedido: [25, 55], min: 18, max: 65 }
const PALAVRAS_EIXO = { min: 1, max: 3 }

/** Travessão e meia risca não são usados em nenhum texto do produto. */
const TRACOS = /[—–]/

/**
 * Fórmulas que dispensam a tiragem: se a frase serve para qualquer sorteio,
 * ela não estava lendo estas duas cartas.
 */
const PROIBIDAS: Record<Locale, RegExp[]> = {
  pt: [
    /\b(o universo (pede|conspira|quer)|confie no (processo|universo))\b/i,
    /\bhoje é um dia (para|de)\b/i,
    /\b(novas oportunidades|algo está chegando|grandes mudanças)\b/i,
    /\b(sorte|azar|felizmente|infelizmente)\b/i,
    /\b(energias?|vibe|vibração)\b/i,
    /\bvai (acontecer|dar certo|melhorar|mudar)\b/i,
    /\b(aproveite|evite|procure|permita-se|lembre-se de)\b/i,
    // conselho velado: a leitura descreve o encontro, não instrui quem lê
    /\b(é preciso|é necessário|convém|cabe a você)\b/i,
    /\barquetíp\w*|\barquétipo\w*/i,
    /\b(jung|freud)\b/i,
  ],
  en: [
    /\b(the universe (wants|asks)|trust the process)\b/i,
    /\btoday is a day (to|for)\b/i,
    /\b(new opportunities|something is coming|big changes)\b/i,
    /\b(luck|lucky|fortunately|unfortunately)\b/i,
    /\b(positive|negative|good|bad) energy\b/i,
    /\b(will happen|will work out|will improve)\b/i,
    /\b(make sure|avoid|allow yourself|remember to)\b/i,
    /\barchetyp\w*/i,
    /\b(jung|freud)\b/i,
  ],
  es: [
    /\b(el universo (pide|conspira|quiere)|confía en el proceso)\b/i,
    /\bhoy es un día (para|de)\b/i,
    /\b(nuevas oportunidades|algo está llegando|grandes cambios)\b/i,
    /\b(suerte|afortunadamente|desafortunadamente)\b/i,
    /\benergía (positiva|negativa|buena|mala)\b/i,
    /\bva a (pasar|salir bien|mejorar|cambiar)\b/i,
    /\b(aprovecha|evita|permítete|recuerda)\b/i,
    /\barquetíp\w*|\barquetipo\w*/i,
    /\b(jung|freud)\b/i,
  ],
}

/** As mesmas proibições, em texto, para irem no pedido e na mensagem de sistema. */
const EVITAR: Record<Locale, string[]> = {
  pt: ["energia", "o universo pede", "hoje é um dia para", "novas oportunidades", "confie no processo", "algo está chegando", "sorte", "é preciso"],
  en: ["energy", "the universe wants", "today is a day to", "new opportunities", "trust the process", "something is coming", "luck"],
  es: ["energía", "el universo pide", "hoy es un día para", "nuevas oportunidades", "confía en el proceso", "algo está llegando", "suerte"],
}

const semNumero = (nome: string) => nome.replace(/^\d{1,2}\s*[—–-]\s*/, "")

export const SISTEMA_TIRAGEM_DIA: Record<Locale, string> = {
  pt: "Responda apenas com JSON válido, sem Markdown. Os campos 'eixo', 'interpretation' e 'sintese' são escritos em português do Brasil.",
  en: "Respond only with valid JSON, no Markdown. The fields 'eixo', 'interpretation' and 'sintese' are written in English.",
  es: "Responde solo con JSON válido, sin Markdown. Los campos 'eixo', 'interpretation' y 'sintese' se escriben en español.",
}

export function promptTiragemDia(tiragem: TiragemDoDia, locale: Locale): { system: string; user: string } {
  // o nome do Lenormand vem numerado do motor; o número é da mesa, não do texto
  const nomeLenormand = semNumero(tiragem.lenormand.nome)
  const material = [
    `TARÔ: ${tiragem.tarot.nome}${tiragem.tarot.invertida ? " (saiu invertida, e isso é fato do sorteio)" : ""}`,
    `LENORMAND: ${nomeLenormand}`,
  ].join("\n")

  const materialTarot = materialDoTarot(tiragem)
  const materialLenormand = materialDoLenormand(tiragem)
  const [pmin, pmax] = PALAVRAS_CARTA.pedido
  const blocoMaterial = `MATERIAL DE CADA CARTA (é tudo o que você pode usar para dizer o que cada uma significa)

TARÔ, ${tiragem.tarot.nome}:
${materialTarot ?? "(sem material: devolva interpretation null para o Tarô)"}

LENORMAND, ${nomeLenormand}:
${materialLenormand ?? "(sem material: devolva interpretation null para o Lenormand)"}`

  const user = `Duas cartas foram tiradas hoje, uma de cada baralho, e ficam lado a lado. O sorteio já aconteceu e não se discute. Esta é a tiragem do dia de TODAS as pessoas, não de alguém em particular.

${material}

${blocoMaterial}

O QUE ESCREVER

1. "eixo": duas palavras, uma por carta, na ordem acima. A primeira responde pela carta de Tarô, a segunda pela de Lenormand. Substantivos, em minúsculas, sem nome de carta.
2. "cartas": a interpretação INDIVIDUAL de cada carta, que vai no verso dela. "cartas.tarot.interpretation" e "cartas.lenormand.interpretation", de ${pmin} a ${pmax} palavras cada, dois períodos.
3. "sintese": de ${PALAVRAS.min} a ${PALAVRAS.max} palavras, dois ou três períodos, sobre o CRUZAMENTO das duas.

São TRÊS camadas que não se misturam: o que foi sorteado, o que cada carta significa SOZINHA, e a síntese entre as duas. As interpretações individuais não dizem nada sobre a outra carta; a relação entre elas existe só na síntese.

REGRAS DA SÍNTESE

1. Escreva os DOIS NOMES no texto, como estão acima ("${tiragem.tarot.nome}" e "${nomeLenormand}"). Não troque o nome por uma paráfrase do que ele significa: sem os nomes, o leitor não sabe do que você está falando. As duas continuam distintas ao longo da frase. Não dissolva as duas numa moral única: se a frase serviria para outra dupla, está errada.
2. O assunto é o encontro. Diga o que cada carta traz e o que acontece quando uma atravessa a outra.
3. Carta invertida é fato do sorteio e participa da leitura quando existe.
4. Isto é lido por muita gente ao mesmo tempo: nada de acontecimento anunciado. Uma dupla dura não vira aviso de desgraça; descreva a qualidade do encontro, nunca um destino.
5. Linguagem simbólica, não causal. Nada "vai acontecer", nada "influencia" ninguém.
6. Sem previsão, sem conselho, sem diagnóstico, sem frase motivacional, sem cena inventada da vida de quem lê.
7. Sem travessão e sem meia risca. Sem a palavra "arquétipo". Sem citar autor.
8. Registro adulto e contemplativo, pouco adjetivado. Sem exclamação.

9. Nenhum destes termos, em campo nenhum: ${EVITAR[locale].map((e) => `"${e}"`).join(", ")}.

REGRAS DAS INTERPRETAÇÕES INDIVIDUAIS ("cartas")

I1. Cada interpretação fala SOMENTE da própria carta, dentro do próprio oráculo. Use apenas o material dela, acima: não acrescente significados que ele não traga e não preencha lacunas com o que você sabe de outras fontes.
I2. PROIBIDO relacionar. O texto do Tarô não cita a carta "${nomeLenormand}", nem a palavra "Lenormand". O texto do Lenormand não cita a carta "${tiragem.tarot.nome}", nem as palavras "Tarô" ou "Tarot". Nenhum dos dois cita outro oráculo (I Ching, Runas, Búzios), a outra carta, "a outra", "as duas", nem as ideias de síntese, conjunto, cruzamento, convergência ou combinação. Esse tipo de relação pertence exclusivamente à "sintese".
I3. Dois períodos, linguagem simbólica e descritiva. Sem previsão, sem conselho, sem diagnóstico, sem frase motivacional. Valem as mesmas expressões proibidas, a regra do travessão e o registro da síntese.
I4. O material do Tarô está em português e o do Lenormand em inglês: reescreva com as suas palavras, no idioma pedido. Não copie listas, não cite autor, não transcreva.
I5. Tarô invertida: diga o que a inversão desloca NESTA carta, segundo a reversão do material. Se o material diz que o sentido permanece semelhante, diga isso. Inversão não é "versão negativa". Regra geral da fonte: ${REGRA_DE_REVERSAO("pt")}
I6. O Lenormand não tem carta invertida.

${languageRule(locale)}

Devolva JSON exatamente assim:
{"eixo": ["...", "..."], "cartas": {"tarot": {"interpretation": "..."}, "lenormand": {"interpretation": "..."}}, "sintese": "..."}`

  return { system: SISTEMA_TIRAGEM_DIA[locale], user }
}

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

/** O nome do símbolo aparece no texto? Basta a parte que o identifica. */
function citado(texto: string, nome: string): boolean {
  const limpo = semAcento(nome)
    .replace(/\(.*?\)/g, "")
    .replace(/\b(invertida|invertido|reversed|invertid[ao]s)\b/g, "")
    .replace(/^\d{1,2}\s*[.—–-]\s*/, "")
    .trim()
  if (!limpo) return false
  const nucleo = limpo.replace(/^(o|a|os|as|the|el|la|los|las)\s+/, "")
  return semAcento(texto).includes(nucleo)
}

export function verificarSintese(params: { bruto: unknown; tiragem: TiragemDoDia; locale: Locale }): VereditoDia {
  const { bruto, tiragem, locale } = params
  const violacoes: string[] = []
  const sintese = typeof (bruto as { sintese?: unknown })?.sintese === "string" ? (bruto as { sintese: string }).sintese.trim() : ""

  const eixoBruto = (bruto as { eixo?: unknown })?.eixo
  const eixo: [string, string] = Array.isArray(eixoBruto)
    ? [String(eixoBruto[0] ?? "").trim(), String(eixoBruto[1] ?? "").trim()]
    : ["", ""]

  if (!sintese) return { ok: false, violacoes: ["síntese ausente"] }

  // o eixo é uma palavra por carta: se um termo repete o nome da carta, ele
  // devolve o rótulo em vez de dizer o que ela traz
  eixo.forEach((termo, i) => {
    const quantas = termo.split(/\s+/).filter(Boolean).length
    if (!termo) violacoes.push(`eixo: termo ${i + 1} vazio`)
    else if (quantas < PALAVRAS_EIXO.min || quantas > PALAVRAS_EIXO.max) {
      violacoes.push(`eixo: termo ${i + 1} com ${quantas} palavra(s), fora de ${PALAVRAS_EIXO.min} a ${PALAVRAS_EIXO.max}`)
    }
  })
  if (eixo[0] && semAcento(eixo[0]) === semAcento(eixo[1])) violacoes.push("eixo: os dois termos são iguais")
  for (const termo of eixo) {
    if (termo && (citado(termo, tiragem.tarot.nome) || citado(termo, tiragem.lenormand.nome))) {
      violacoes.push("eixo: um termo repete o nome da carta em vez de dizer o que ela traz")
    }
  }

  const n = sintese.trim().split(/\s+/).filter(Boolean).length
  if (n < PALAVRAS.min || n > PALAVRAS.max) violacoes.push(`${n} palavras, fora de ${PALAVRAS.min} a ${PALAVRAS.max}`)

  if (TRACOS.test(sintese)) violacoes.push("usa travessão ou meia risca")
  for (const regex of PROIBIDAS[locale]) {
    const achou = sintese.match(regex)
    if (achou) violacoes.push(`expressão proibida "${achou[0].trim()}"`)
  }

  // as duas precisam sobreviver: a que não é nomeada não estava sendo lida
  if (!citado(sintese, tiragem.tarot.nome)) violacoes.push(`não cita a carta de Tarô (${tiragem.tarot.nome})`)
  if (!citado(sintese, tiragem.lenormand.nome)) violacoes.push(`não cita a carta de Lenormand (${tiragem.lenormand.nome})`)

  if (violacoes.length) return { ok: false, violacoes }
  return { ok: true, eixo, sintese }
}

/**
 * O VERSO DE CADA CARTA. Verificado à parte da síntese, com a regra oposta: a
 * síntese PRECISA nomear as duas; a interpretação individual NÃO PODE citar a
 * outra, nem outro oráculo, nem a ideia de conjunto.
 *
 * Sai `null` no texto que não passa, e a UI mostra só nome e orientação: é
 * fallback deliberado, nunca a síntese no lugar.
 */
export function verificarCartas(params: { bruto: unknown; tiragem: TiragemDoDia; locale: Locale }): VereditoCartas {
  const { bruto, tiragem, locale } = params
  const violacoes: string[] = []
  const cartas = (bruto as { cartas?: unknown })?.cartas as
    | { tarot?: { interpretation?: unknown }; lenormand?: { interpretation?: unknown } }
    | undefined

  const avalia = (oraculo: "tarot" | "lenormand", material: string | null): string | null => {
    const rotulo = `cartas.${oraculo}`
    if (!material) return null // sem material, não se interpreta: é o fallback, não é falha
    const cru = cartas?.[oraculo]?.interpretation
    const texto = typeof cru === "string" ? cru.trim() : ""
    if (!texto) {
      violacoes.push(`${rotulo}: interpretação ausente`)
      return null
    }
    const antes = violacoes.length
    const n = texto.split(/\s+/).filter(Boolean).length
    if (n < PALAVRAS_CARTA.min || n > PALAVRAS_CARTA.max) {
      violacoes.push(`${rotulo}: ${n} palavras, fora de ${PALAVRAS_CARTA.min} a ${PALAVRAS_CARTA.max}`)
    }
    if (TRACOS.test(texto)) violacoes.push(`${rotulo}: usa travessão ou meia risca`)
    for (const regex of PROIBIDAS[locale]) {
      const achou = texto.match(regex)
      if (achou) violacoes.push(`${rotulo}: expressão proibida "${achou[0].trim()}"`)
    }
    const cruzadas = referenciasCruzadas(texto, {
      oraculo,
      propria: oraculo === "tarot" ? tiragem.tarot.nome : tiragem.lenormand.nome,
      outra: oraculo === "tarot" ? tiragem.lenormand.nome : tiragem.tarot.nome,
      locale,
    })
    for (const c of cruzadas) violacoes.push(`${rotulo}: referência cruzada, ${c}. O verso de uma carta não fala de outra; isso é da síntese`)
    return violacoes.length === antes ? texto : null
  }

  const tarot = avalia("tarot", materialDoTarot(tiragem))
  const lenormand = avalia("lenormand", materialDoLenormand(tiragem))
  return { tarot, lenormand, violacoes }
}

/**
 * O que fazer com UMA resposta do modelo. Função pura, para o servidor e para os
 * testes com respostas simuladas usarem a mesma decisão.
 *
 * A síntese e os dois versos são unidades SEPARADAS e são julgadas
 * separadamente:
 *
 *  - JSON inválido ou síntese reprovada  → refazer (única razão de refazer);
 *  - síntese aprovada                    → gravar SEMPRE, com cada verso que
 *    passou e `null` em cada verso que não passou, de forma independente.
 *
 * Verso reprovado NUNCA dispara nova chamada: reprovou → `null`, e a UI mostra
 * só oráculo, nome e orientação. As travas de referência cruzada continuam
 * decidindo se um `interpretation` pode ser gravado; o que mudou é só o
 * destino de quem reprova. Nunca se grava texto cruzado e nunca se usa a
 * síntese como verso.
 */
export type Avaliacao =
  | { acao: "refazer"; violacoes: string[] }
  | { acao: "gravar"; eixo: [string, string]; sintese: string; cartas: CartasIndividuais | null; violacoes: string[] }

export function avaliarGeracao(params: { conteudo: string; tiragem: TiragemDoDia; locale: Locale }): Avaliacao {
  const { conteudo, tiragem, locale } = params
  let bruto: unknown
  try {
    bruto = JSON.parse(conteudo)
  } catch {
    return { acao: "refazer", violacoes: ["a resposta não era JSON válido"] }
  }
  const veredito = verificarSintese({ bruto, tiragem, locale })
  if (!veredito.ok) return { acao: "refazer", violacoes: veredito.violacoes }

  const individuais = verificarCartas({ bruto, tiragem, locale })
  const cartas = cartasDeJson({
    tarot: { interpretation: individuais.tarot },
    lenormand: { interpretation: individuais.lenormand },
  })
  // `violacoes` aqui é informativo (por que algum verso ficou nulo); não gera retry
  return { acao: "gravar", eixo: veredito.eixo, sintese: veredito.sintese, cartas, violacoes: individuais.violacoes }
}

export type { CartasIndividuais }
