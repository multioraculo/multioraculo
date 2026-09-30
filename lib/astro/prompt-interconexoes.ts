/**
 * A síntese pessoal: o céu de hoje encontrando UM mapa.
 *
 * O prompt do horóscopo coletivo está congelado e não é tocado aqui. Este é
 * outro texto, com outro sujeito: lá o assunto é o dia de todo mundo de um
 * signo, aqui é o cruzamento entre o céu de agora e o nascimento de uma pessoa.
 *
 * O QUE MUDA EM RELAÇÃO AO COLETIVO, e é o que justifica prompt próprio:
 *
 *  - cada fato tem DONO. "Urano de hoje sobre o seu Ascendente" só existe para
 *    quem tem aquele Ascendente, e dizer isso a outra pessoa seria inventar;
 *  - as interconexões vêm com `nota`, e a maior manda. Tratar as três como se
 *    dissessem a mesma coisa é o erro mais fácil aqui;
 *  - quando elas apontam para direções diferentes, a divergência FICA. Costurar
 *    tudo numa mensagem harmoniosa é o jeito bonito de mentir.
 *
 * Como no coletivo, cada afirmação declara de qual fato saiu, e o verificador
 * confere. A lista de fatos é fechada: o que não está nela não pode ser dito.
 */
import type { Locale } from "@/lib/i18n/config"
import { languageRule } from "@/lib/oracles/language"
import { EXPRESSOES_EVITAR } from "./editorial"
import type { FatoPessoal } from "./fatos-interconexoes"

export type AfirmacaoEscrita = { texto: string; fato: string }
export type SintesePessoal = { afirmacoes: AfirmacaoEscrita[]; sintese: string }

export const FRASES = { min: 2, max: 5 }
export const AFIRMACOES = { min: 2, max: 4 }
export const PALAVRAS_MAX = 110

const SISTEMA_BASE: Record<Locale, string> = {
  pt: "Responda apenas com JSON válido, sem Markdown. Todo texto destinado ao leitor é escrito em português do Brasil.",
  en: "Respond only with valid JSON, no Markdown. All text addressed to the reader is written in English.",
  es: "Responde solo con JSON válido, sin Markdown. Todo el texto dirigido al lector se escribe en español.",
}

const VETO: Record<Locale, string> = {
  pt: 'Nenhum campo pode conter travessão, meia risca, qualquer flexão de "arquétipo", nem estas expressões:',
  en: 'No field may contain an em dash, an en dash, any form of "archetype", or these expressions:',
  es: 'Ningún campo puede contener raya, semirraya, ninguna flexión de "arquetipo", ni estas expresiones:',
}

export const SISTEMA_INTERCONEXOES: Record<Locale, string> = {
  pt: `${SISTEMA_BASE.pt} ${VETO.pt} ${EXPRESSOES_EVITAR.pt.map((e) => `"${e}"`).join(", ")}.`,
  en: `${SISTEMA_BASE.en} ${VETO.en} ${EXPRESSOES_EVITAR.en.map((e) => `"${e}"`).join(", ")}.`,
  es: `${SISTEMA_BASE.es} ${VETO.es} ${EXPRESSOES_EVITAR.es.map((e) => `"${e}"`).join(", ")}.`,
}

function listar(fatos: FatoPessoal[]): string {
  return fatos.map((f) => `  ${f.id} (${f.tipo}, relevância ${f.nota.toFixed(2)}): ${f.texto}`).join("\n")
}

export function promptInterconexoes(params: { fatos: FatoPessoal[]; locale: Locale }): {
  system: string
  user: string
} {
  const { fatos, locale } = params
  const principais = fatos.filter((f) => f.tipo === "interconexao").slice(0, 3)

  const user = [
    "Escreva a síntese do dia de UMA pessoa, a partir do encontro entre o céu de agora e o mapa do nascimento dela.",
    "",
    "OS FATOS, e não existe nenhum outro:",
    listar(fatos),
    "",
    `AS MAIS RELEVANTES são ${principais.map((f) => f.id).join(", ")}, nesta ordem. A síntese precisa se apoiar nelas.`,
    "",
    "REGRAS:",
    "- toda afirmação sai de um fato da lista, e você declara de qual;",
    "- é proibido citar planeta, signo, casa, aspecto, orbe, direção ou evento que não esteja na lista;",
    "- não diga que algo VAI acontecer: os fatos descrevem um céu, não um futuro;",
    "- não dê conselho, instrução nem recomendação;",
    "- se as interconexões apontam para coisas diferentes, DIGA as duas. Não costure uma harmonia que os fatos não sustentam;",
    "- nada de frase que serviria para qualquer pessoa em qualquer dia;",
    `- de ${AFIRMACOES.min} a ${AFIRMACOES.max} afirmações;`,
    `- a síntese tem de ${FRASES.min} a ${FRASES.max} frases, no máximo ${PALAVRAS_MAX} palavras, e contém todas as afirmações;`,
    // ESTA LINHA JÁ CUSTOU DINHEIRO. Ela dizia "sem nomear a técnica", e o
    // modelo entendeu "sem nomear planeta nenhum": escrevia uma síntese sem um
    // único nome dos fatos, o verificador reprovava por genérica, e TODA
    // geração gastava uma chamada de reparo para só então pôr os nomes de
    // volta. Nomear os corpos é obrigatório; o que não se explica é o método.
    '- fale com a pessoa, em segunda pessoa. NOMEIE os corpos, signos e pontos da lista: são os fatos dela, e uma síntese sem nenhum deles serviria para qualquer pessoa;',
    "- não ensine a técnica: nada de explicar o que é orbe, aspecto, casa ou trânsito.",
    "",
    languageRule(locale),
    "",
    'Devolva JSON: {"afirmacoes": [{"texto": "...", "fato": "f1"}], "sintese": "..."}',
  ].join("\n")

  return { system: SISTEMA_INTERCONEXOES[locale], user }
}

/**
 * O reparo: mesma disciplina do horóscopo. Uma síntese reprovada não é
 * reescrita do zero, é corrigida no ponto apontado, com os mesmos fatos e os
 * motivos exatos da recusa na mão.
 */
export function promptReparoInterconexoes(params: {
  fatos: FatoPessoal[]
  locale: Locale
  reprovada: SintesePessoal
  violacoes: string[]
}): { system: string; user: string } {
  const { fatos, locale, reprovada, violacoes } = params

  const user = [
    "A síntese abaixo foi REPROVADA. Corrija exatamente o que foi apontado, sem reescrever o que não foi.",
    "",
    "OS FATOS, e não existe nenhum outro:",
    listar(fatos),
    "",
    "O QUE FOI ESCRITO E REPROVADO:",
    `  síntese: ${reprovada.sintese || "(vazia)"}`,
    `  afirmações: ${reprovada.afirmacoes.map((a) => `"${a.texto}" (${a.fato})`).join(", ") || "nenhuma"}`,
    "",
    "POR QUE FOI REPROVADO:",
    violacoes.map((v) => `  - ${v}`).join("\n"),
    "",
    "REGRAS: as mesmas de antes. Toda afirmação sai de um fato da lista e declara qual;",
    "é proibido introduzir qualquer coisa fora da lista; sem previsão, sem conselho,",
    `sem frase genérica; de ${FRASES.min} a ${FRASES.max} frases.`,
    "",
    'Devolva JSON: {"afirmacoes": [{"texto": "...", "fato": "f1"}], "sintese": "..."}',
  ].join("\n")

  return { system: SISTEMA_INTERCONEXOES[locale], user }
}
