/**
 * O prompt de REPARO: uma relação só, e nada além dos fatos que ela tem.
 *
 * Existe porque reprovar uma relação não deveria custar a reescrita das três.
 * O modelo recebe aqui o trecho reprovado, os motivos exatos do verificador e a
 * lista FECHADA de fatos daquele movimento, cada um com identificador. Usar
 * fato fora da lista é o erro que este prompt mais tenta impedir, porque é
 * justamente ele que produz texto plausível sem sustentação — que foi o que
 * derrubou a relação em primeiro lugar.
 *
 * `evidencias` é estrutura interna e não chega a ninguém: obriga o modelo a
 * dizer, para cada afirmação, em que fato ela se apoia. O efeito buscado não é
 * a lista em si, é o modelo ter de encarar a pergunta antes de escrever. O
 * verificador continua decidindo sozinho se o texto passa, e não lê isto.
 *
 * Mora em arquivo separado de propósito: o prompt da leitura inteira está
 * congelado e não deve ser tocado por causa de reparo.
 */
import type { Locale } from "@/lib/i18n/config"
import type { CardMovimento } from "./apresentar"
import { SISTEMA_HOROSCOPO, type RelacaoEscrita } from "./prompt-horoscopo"
import { SIGNOS } from "./nomes"
import type { Fato } from "./fatos-do-card"

export type RespostaReparo = {
  termos?: Array<{ texto?: unknown; origem?: unknown }>
  explicacao?: unknown
  /** só para forçar o modelo a ancorar; ninguém lê */
  evidencias?: Array<{ claim?: unknown; supporting_fact_ids?: unknown }>
}

export function promptReparo(params: {
  card: CardMovimento
  posicao: number
  signo: number
  locale: Locale
  reprovada: RelacaoEscrita
  violacoes: string[]
  fatos: Fato[]
  quantosTermos: number
}): { system: string; user: string } {
  const { card, posicao, signo, locale, reprovada, violacoes, fatos, quantosTermos } = params
  const signoNome = SIGNOS[locale][signo]

  const listaFatos = fatos.map((f) => `  ${f.id} (${f.tipo}): ${f.texto}`).join("\n")
  const termosAtuais = reprovada.termos.map((t) => `"${t.texto}" (origem: ${t.origem})`).join(", ") || "nenhum"
  const motivos = violacoes.map((v) => `  - ${v}`).join("\n")

  const regraTermos =
    quantosTermos === 0
      ? "esta forma NAO leva termo nenhum: devolva a lista vazia"
      : `escreva exatamente ${quantosTermos} termos, de 2 a 7 palavras cada, diferentes entre si`

  const user = [
    "Uma parte de uma leitura foi REPROVADA. Reescreva SOMENTE esta parte.",
    "",
    `MOVIMENTO ${posicao + 1}, para quem e de ${signoNome}:`,
    `  forma: ${card.forma}`,
    `  ${card.titulo}${card.detalhe ? ` (${card.detalhe})` : ""}`,
    "",
    "FATOS DISPONIVEIS, e nao existe nenhum outro:",
    listaFatos,
    "",
    "O QUE FOI ESCRITO E REPROVADO:",
    `  termos: ${termosAtuais}`,
    `  explicacao: ${reprovada.explicacao || "(vazia)"}`,
    "",
    "POR QUE FOI REPROVADO:",
    motivos,
    "",
    "REGRAS:",
    "- corrija exatamente o que foi apontado, sem reescrever o que nao foi;",
    "- toda afirmacao precisa se apoiar em pelo menos um fato da lista acima;",
    "- e proibido introduzir qualquer fato que nao esteja na lista;",
    `- ${regraTermos};`,
    "- a explicacao tem de 2 a 7 frases.",
    "",
    "Devolva JSON:",
    '{"termos": [{"texto": "...", "origem": "..."}], "explicacao": "...", "evidencias": [{"claim": "...", "supporting_fact_ids": ["f1"]}]}',
  ].join("\n")

  return { system: SISTEMA_HOROSCOPO[locale], user }
}
