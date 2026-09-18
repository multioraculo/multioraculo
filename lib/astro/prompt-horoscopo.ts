/**
 * O prompt do horóscopo do dia.
 *
 * O modelo recebe a configuração INTEIRA de cada movimento (planeta, signo,
 * grau, movimento direto ou retrógrado, ângulo real, orbe, aplicativo ou
 * separativo, regência, e os outros aspectos que aqueles corpos fazem hoje) e
 * escreve duas coisas: o foco do dia e, para cada movimento, os termos e a
 * explicação.
 *
 * Duas regras estruturais nasceram de erros medidos:
 *
 *  - cada termo declara DE ONDE veio. Sem isso o modelo completa o segundo
 *    lado por plausibilidade, e foi exatamente assim que apareceu um
 *    "necessidade de ação" que nenhum dado sustentava;
 *  - a forma do card vem do ângulo. Sextil e trígono não viram conflito só
 *    porque o layout tem dois lados; posição não recebe polaridade nenhuma.
 */
import type { Locale } from "@/lib/i18n/config"
import { languageRule } from "@/lib/oracles/language"
import { anguloNominal, type CardMovimento } from "./apresentar"
import { EXPRESSOES_EVITAR, REGRAS_COMUNS } from "./editorial"
import { CORPOS, RETROGRADO, SIGNOS } from "./nomes"
import { LINHA_SIGNO, REGENTE } from "./simbolos"

/** De qual elemento calculado aquele termo saiu. O verificador confere. */
export const ORIGENS = ["planetaA", "signoA", "movimentoA", "planetaB", "signoB", "movimentoB", "regencia"] as const
export type Origem = (typeof ORIGENS)[number]

export type TermoEscrito = { texto: string; origem: Origem }

export type RelacaoEscrita = {
  n: number
  /** dois termos nas formas com dois corpos; nenhum numa posição */
  termos: TermoEscrito[]
  explicacao: string
}

export type Leitura = {
  foco: string
  relacoes: RelacaoEscrita[]
}

const SISTEMA_BASE: Record<Locale, string> = {
  pt: "Responda apenas com JSON válido, sem Markdown. Todo texto destinado ao leitor é escrito em português do Brasil.",
  en: "Respond only with valid JSON, no Markdown. All text addressed to the reader is written in English.",
  es: "Responde solo con JSON válido, sin Markdown. Todo el texto dirigido al lector se escribe en español.",
}

const VETO: Record<Locale, string> = {
  pt: "Nenhum campo pode conter travessão, meia risca, qualquer flexão de \"arquétipo\", nem estas expressões:",
  en: "No field may contain an em dash, an en dash, any form of \"archetype\", or these expressions:",
  es: "Ningún campo puede contener raya, semirraya, ninguna flexión de \"arquetipo\", ni estas expresiones:",
}

/**
 * O veto vai na mensagem de sistema, e não só no corpo do pedido: medido, o
 * modelo continuava escrevendo "à tona" e "destaca a importância" mesmo com a
 * lista repetida duas vezes no fim do prompt.
 */
export const SISTEMA_HOROSCOPO: Record<Locale, string> = {
  pt: `${SISTEMA_BASE.pt} ${VETO.pt} ${EXPRESSOES_EVITAR.pt.map((e) => `"${e}"`).join(", ")}.`,
  en: `${SISTEMA_BASE.en} ${VETO.en} ${EXPRESSOES_EVITAR.en.map((e) => `"${e}"`).join(", ")}.`,
  es: `${SISTEMA_BASE.es} ${VETO.es} ${EXPRESSOES_EVITAR.es.map((e) => `"${e}"`).join(", ")}.`,
}

const NOME_FORMA: Record<string, string> = {
  contraste: "CONTRASTE",
  articulacao: "ARTICULAÇÃO",
  convergencia: "CONVERGÊNCIA",
  posicao: "POSIÇÃO",
}

function descreverLado(rotulo: "A" | "B", lado: CardMovimento["a"], locale: Locale): string {
  const movimento = lado.retrogrado
    ? `${RETROGRADO[locale].retrograde.toUpperCase()} (movimento aparente para trás, um tema que volta para revisão)`
    : "direto"
  return [
    `    ${rotulo} · ${lado.nome}${lado.regente ? ` (${lado.rotuloRegente})` : ""}`,
    `       função: ${lado.funcoes}`,
    `       faz: ${lado.verbos.join(", ")}`,
    `       está em: ${lado.nomeSigno} ${lado.grauTexto}, ${movimento}`,
    `       campo de ${lado.nomeSigno}: ${lado.campo}`,
  ].join("\n")
}

function descreverCard(card: CardMovimento, i: number, locale: Locale): string {
  const linhas: string[] = []
  const nominal = anguloNominal(card.aspecto)
  if (card.forma === "posicao") {
    linhas.push(`[${i + 1}] ${NOME_FORMA.posicao} · ${card.titulo} (${card.detalhe})`)
    linhas.push(`    o que esta posição é: ${card.glosa}`)
    linhas.push(descreverLado("A", card.a, locale))
  } else {
    linhas.push(`[${i + 1}] ${NOME_FORMA[card.forma]} · ${card.a.nome} ${card.titulo.toUpperCase()} ${card.b?.nome}`)
    linhas.push(`    ângulo: ${card.detalhe}${nominal !== null ? ` (o exato deste aspecto é ${nominal}°)` : ""}`)
    linhas.push(`    o que este ângulo estabelece: ${card.glosa}`)
    linhas.push(descreverLado("A", card.a, locale))
    if (card.b) linhas.push(descreverLado("B", card.b, locale))
  }
  if (card.contexto.length) linhas.push(`    também hoje: ${card.contexto.join("; ")}`)
  return linhas.join("\n")
}

export function promptHoroscopo(params: {
  dia: string
  signo: number
  cards: CardMovimento[]
  locale: Locale
}): { system: string; user: string } {
  const { dia, signo, cards, locale } = params
  const nomeSigno = SIGNOS[locale][signo]
  const regente = CORPOS[locale][REGENTE[signo]]
  const lista = cards.map((card, i) => descreverCard(card, i, locale)).join("\n\n")

  const formas = cards
    .map((card, i) => {
      if (card.forma === "contraste") return `[${i + 1}] dois termos em tensão real, um de cada lado`
      if (card.forma === "articulacao") return `[${i + 1}] dois termos que SE SOMAM. Não invente conflito: este ângulo não é conflito`
      if (card.forma === "convergencia") return `[${i + 1}] dois termos operando no mesmo ponto, sem oposição entre eles`
      return `[${i + 1}] NENHUM termo. Só a explicação`
    })
    .join("\n")

  const user = `Escreva a leitura do dia ${dia} para quem é de ${nomeSigno}.

O SIGNO DO LEITOR
${nomeSigno}: ${LINHA_SIGNO[locale][signo]}
Regente: ${regente}.

OS MOVIMENTOS SELECIONADOS
Calculados, com a configuração inteira. Não existe nada além do que está aqui.

${lista}

${REGRAS_COMUNS}
11. Estas expressões reprovam o texto inteiro. Não use nenhuma delas, em campo nenhum: ${EXPRESSOES_EVITAR[locale].map((e) => `"${e}"`).join(", ")}.

COMO RACIOCINAR, ANTES DE ESCREVER

Para cada movimento, nesta ordem:
1. Como a função de A se expressa DENTRO DO CAMPO em que A está? Não é "Mercúrio é pensamento". É o que distinguir e nomear se torna no campo daquele signo, naquele grau, com aquele movimento.
2. O mesmo para B, quando houver B.
3. O que este ângulo faz entre essas duas expressões já situadas? Use o ângulo real, o orbe e o fato de estar se fechando ou se afastando.
4. Qual dimensão do signo do leitor ISTO ativa? Pergunte o que este céu específico toca em ${nomeSigno}, e não como encaixar a configuração na característica mais conhecida do signo. Se a configuração não ativa o excesso conhecido de ${nomeSigno}, não o mencione.
5. Se o movimento tiver linha "também hoje", ela participa: o corpo não está isolado, e o outro aspecto muda como ele se expressa. Num movimento de POSIÇÃO isso é obrigatório: a explicação precisa dizer o que aquele outro aspecto faz com a expressão do corpo, nomeando o outro planeta.

O QUE VOCÊ ESCREVE

1. "relacoes": EXATAMENTE ${cards.length} entradas, uma por movimento, na ordem, cada uma com o número dela. Nenhum movimento pode ficar de fora.

   "termos": conforme a forma de cada movimento:
${formas}
   Cada termo tem de duas a seis palavras, em linguagem comum, sem nome de planeta, de signo ou de aspecto.
   Um termo é a função SITUADA, nunca a função solta. Dois verbos da lista colados ("sentir e guardar", "distinguir e nomear") são reprovados automaticamente, porque devolvem ao leitor o que ele já está lendo na coluna ao lado. Acrescente o campo, o grau ou o movimento: "guardar o que ainda não tem nome", "nomear no outro", "rever a forma já dada".

   "origem": cada termo declara de qual elemento calculado ele saiu:
     planetaA, planetaB      a função do corpo
     signoA, signoB          o campo do signo onde o corpo está
     movimentoA, movimentoB  a retrogradação daquele corpo (só existe se ele estiver retrógrado)
     regencia                o fato daquele corpo reger ${nomeSigno}
   O PRIMEIRO termo sai do corpo A e o SEGUNDO sai do corpo B: cada lado se sustenta na configuração do seu próprio corpo. O ângulo NÃO é origem de termo, porque ele é o que põe os dois em relação, e não um dos lados. Copiar a frase que descreve o ângulo não é um termo.
   Se um termo não puder ser rastreado a um destes, ele não existe: escreva outro termo. Nunca complete um lado por plausibilidade.

   "explicacao": de três a cinco frases, seguindo o raciocínio acima.
   ESPECIFICIDADE, a regra mais importante: cada frase precisa depender de algum fato desta configuração. São fatos o signo onde o corpo está, a retrogradação, o tipo de ângulo, o grau, o orbe, estar se fechando ou se afastando, a regência, e o outro aspecto que aparece em "também hoje". Teste cada frase assim: se eu apagar os fatos, ela continua valendo para outro signo ou outro dia? Então ela está genérica e não serve.
   A explicação inteira precisa tocar pelo menos três fatos diferentes, e no máximo uma frase pode ficar sem nenhum.
   Cite os planetas pelo nome e diga em que signo cada um está. A última frase responde por que isto importa a ${nomeSigno} hoje, e também precisa se apoiar em fato.
   Não escreva "busca por harmonia", "novas conexões e entendimentos", "encontrar equilíbrio", "típico de ${nomeSigno}", "${nomeSigno} sente a necessidade de", "este aspecto pede". Não troque essas expressões por sinônimos: reconstrua a frase a partir do dado.

${languageRule(locale)}

2. "foco": escrito POR ÚLTIMO, depois das ${cards.length} relações, condensando o que elas têm em comum. De três a dez palavras, imediatamente compreensível, sem nome de planeta, de signo ou de aspecto. Não é resumo abstrato: se a frase continuar valendo com outros planetas em outro dia, está errada. Pode ser afirmação ou pergunta, como você preferir.

Devolva JSON exatamente nesta ordem, com "relacoes" ANTES de "foco", porque o foco só existe depois delas:
{"relacoes": [{"n": 1, "termos": [{"texto": "...", "origem": "signoA"}, {"texto": "...", "origem": "movimentoB"}], "explicacao": "..."}], "foco": "..."}

LEMBRETE FINAL: nenhum travessão, nenhuma forma da palavra "arquétipo", e nenhuma das expressões proibidas da regra 11.`

  return { system: SISTEMA_HOROSCOPO[locale], user }
}
