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
 * A CAMADA DE MANIFESTAÇÃO existe porque "expansão emocional" e "novas
 * perspectivas" são verdadeiras e inúteis: cabem em qualquer dia de qualquer
 * pessoa. Depois de interpretar uma relação, o texto pode dizer como aquilo
 * poderia aparecer na experiência de quem lê. O que impede isso de virar
 * adivinhação são três coisas ao mesmo tempo:
 *
 *  1. a manifestação sai de um fato declarado, e a CASA NATAL do ponto tocado é
 *     o que escolhe o domínio da vida. É por isso que a casa entrou na lista de
 *     fatos: sem ela, qualquer exemplo concreto seria chute;
 *  2. ela é obrigatoriamente hipotética, com uma das marcas desta lista. Frase
 *     concreta sem hipótese é previsão, e o verificador recusa;
 *  3. ela é opcional. Quando os fatos não sustentam um exemplo, não há exemplo.
 *
 * Como no coletivo, cada afirmação declara de qual fato saiu, e o verificador
 * confere. A lista de fatos é fechada: o que não está nela não pode ser dito.
 */
import type { Locale } from "@/lib/i18n/config"
import { languageRule } from "@/lib/oracles/language"
import { EXPRESSOES_EVITAR } from "./editorial"
import type { FatoPessoal } from "./fatos-interconexoes"

export type AfirmacaoEscrita = { texto: string; fato: string; manifestacoes?: string[] }
export type SintesePessoal = { afirmacoes: AfirmacaoEscrita[]; sintese: string }

// O mínimo continua 2 e NÃO sobe junto com o máximo: o molde determinístico
// de uma pessoa com uma só interconexão tem duas frases, e subir o piso faria
// o último degrau da recuperação reprovar justamente em quem tem menos fatos.
export const FRASES = { min: 2, max: 10 }
export const AFIRMACOES = { min: 2, max: 4 }
export const PALAVRAS_MAX = 210
/** por afirmação. Três exemplos para a mesma relação viram lista de horóscopo */
export const MANIFESTACOES_MAX = 2

/**
 * As marcas de hipótese, e são só estas.
 *
 * O verificador exige uma delas em toda manifestação, então a lista é a mesma
 * dos dois lados: se o prompt oferecesse uma forma que o verificador não
 * conhece, o modelo seria reprovado por obedecer.
 */
export const MARCAS_MANIFESTACAO: Record<Locale, string[]> = {
  pt: [
    "pode aparecer",
    "pode se manifestar",
    "pode surgir",
    "pode ser percebido",
    "pode ser sentido",
    "uma forma possível de perceber",
  ],
  en: [
    "may appear as",
    "may show up as",
    "may surface as",
    "may be felt as",
    "one possible way to notice",
  ],
  es: [
    "puede aparecer",
    "puede manifestarse",
    "puede surgir",
    "puede percibirse",
    "una forma posible de percibir",
  ],
}

/**
 * A lógica editorial das casas: o domínio da vida de cada uma.
 *
 * Isto é RACIOCÍNIO, não texto. Serve para o modelo escolher em que terreno o
 * exemplo acontece quando a casa está no fato, e nada aqui deve ser copiado
 * como frase. Sem esta orientação o exemplo concreto vira sorteio; com ela,
 * uma Lua natal na casa 7 puxa vínculo próximo e uma Lua natal na casa 4 puxa
 * casa e família, que é o que a tradição de fato sustenta.
 */
const CASAS: Record<Locale, string> = {
  pt: [
    "1 presença, corpo, jeito de se colocar; 2 recursos, o que se tem e se valoriza;",
    "3 conversa, trajeto curto, irmãos; 4 casa, família, vida privada; 5 criação, prazer, filhos;",
    "6 rotina, trabalho diário, saúde prática; 7 parceria, vínculo a dois; 8 o que é partilhado,",
    "intimidade, o que termina; 9 estudo, distância, sentido; 10 trabalho visível, posição;",
    "11 grupo, amizade, projeto coletivo; 12 recolhimento, o que fica em segundo plano.",
  ].join(" "),
  en: [
    "1 presence, body, how one shows up; 2 resources, what one has and values;",
    "3 conversation, short trips, siblings; 4 home, family, private life; 5 making things, pleasure, children;",
    "6 routine, daily work, practical health; 7 partnership, one-to-one bonds; 8 what is shared,",
    "intimacy, what ends; 9 study, distance, meaning; 10 visible work, standing;",
    "11 groups, friendship, collective projects; 12 retreat, what stays in the background.",
  ].join(" "),
  es: [
    "1 presencia, cuerpo, manera de colocarse; 2 recursos, lo que se tiene y se valora;",
    "3 conversación, trayecto corto, hermanos; 4 casa, familia, vida privada; 5 creación, placer, hijos;",
    "6 rutina, trabajo diario, salud práctica; 7 pareja, vínculo de a dos; 8 lo compartido,",
    "intimidad, lo que termina; 9 estudio, distancia, sentido; 10 trabajo visible, posición;",
    "11 grupo, amistad, proyecto colectivo; 12 recogimiento, lo que queda en segundo plano.",
  ].join(" "),
}

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

/** As regras da camada concreta, iguais na geração e no reparo. */
function regrasDaManifestacao(locale: Locale): string[] {
  const marcas = MARCAS_MANIFESTACAO[locale].map((m) => `"${m}"`).join(", ")
  if (locale === "en") {
    return [
      "CONCRETE LAYER (optional, at most 2 per statement):",
      "- after interpreting a relation, you may say how it COULD show up in the person's day;",
      `- every example must open with one of these exact marks: ${marcas};`,
      "- the example goes INSIDE the synthesis, in the same sentence that names the relation or the next one;",
    "- the example comes from the declared fact, and the NATAL HOUSE in it chooses the area of life.",
      `  House meanings, as reasoning only, never copied as phrasing: ${CASAS.en}`,
      "- no named people, no places, no hours, no dates, no numbers of things;",
      "- if the facts do not support a concrete example, leave it out. Forcing one is guessing.",
    ]
  }
  if (locale === "es") {
    return [
      "CAPA CONCRETA (opcional, hasta 2 por afirmación):",
      "- después de interpretar una relación, puedes decir cómo PODRÍA aparecer en el día de la persona;",
      `- todo ejemplo abre con una de estas marcas exactas: ${marcas};`,
      "- el ejemplo va DENTRO de la síntesis, en la misma frase que nombra la relación o en la siguiente;",
    "- el ejemplo sale del hecho declarado, y la CASA NATAL que está en él elige el terreno de la vida.",
      `  Sentido de las casas, solo como razonamiento, nunca copiado como frase: ${CASAS.es}`,
      "- sin nombres de personas, sin lugares, sin horas, sin fechas, sin cantidades;",
      "- si los hechos no sostienen un ejemplo concreto, no lo pongas. Forzarlo es adivinar.",
    ]
  }
  return [
    "CAMADA CONCRETA (opcional, no máximo 2 por relação):",
    "- depois de interpretar uma relação, você PODE dizer como ela poderia aparecer no dia da pessoa;",
    "- o exemplo vai DENTRO DA SÍNTESE, que é o texto que a pessoa lê. Na mesma frase que nomeia a",
    "  relação, ou na frase logo seguinte: é essa vizinhança que mostra de qual relação ele saiu;",
    `- todo exemplo abre com uma destas marcas exatas: ${marcas};`,
    "- o exemplo sai do fato declarado, e a CASA NATAL que está nele escolhe o terreno da vida.",
    `  Sentido das casas, só como raciocínio, nunca copiado como frase: ${CASAS.pt}`,
    "- em NENHUM lugar do texto: hora, data, dia da semana, mês ou período do dia. O céu de hoje não",
    "  marca hora para a vida de ninguém, e escrever isso é inventar precisão;",
    "- sem nome de pessoa, sem lugar, sem quantidade de coisas;",
    "- exemplo é hipótese, nunca acontecimento. Não escreva o que a pessoa vai fazer nem o que vai receber;",
    "- frase concreta SEM uma das marcas acima é proibida: ou é hipótese declarada, ou não entra;",
    "- se os fatos não sustentam um exemplo concreto, não ponha. Forçar é adivinhar.",
  ]
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
    `- a síntese tem de ${FRASES.min} a ${FRASES.max} frases, no máximo ${PALAVRAS_MAX} palavras, e contém todas as afirmações e todos os exemplos;`,
    // ESTA LINHA JÁ CUSTOU DINHEIRO. Ela dizia "sem nomear a técnica", e o
    // modelo entendeu "sem nomear planeta nenhum": escrevia uma síntese sem um
    // único nome dos fatos, o verificador reprovava por genérica, e TODA
    // geração gastava uma chamada de reparo para só então pôr os nomes de
    // volta. Nomear os corpos é obrigatório; o que não se explica é o método.
    "- fale com a pessoa, em segunda pessoa. NOMEIE os corpos, signos e pontos da lista: são os fatos dela, e uma síntese sem nenhum deles serviria para qualquer pessoa;",
    "- não ensine a técnica: nada de explicar o que é orbe, aspecto, casa ou trânsito.",
    "",
    ...regrasDaManifestacao(locale),
    "",
    languageRule(locale),
    "",
    'Devolva JSON: {"afirmacoes": [{"texto": "...", "fato": "f1", "manifestacoes": ["..."]}], "sintese": "..."}',
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

  const escrita = reprovada.afirmacoes
    .map((a) => {
      const ex = a.manifestacoes?.length ? ` [exemplos: ${a.manifestacoes.map((m) => `"${m}"`).join("; ")}]` : ""
      return `"${a.texto}" (${a.fato})${ex}`
    })
    .join(", ")

  const user = [
    "A síntese abaixo foi REPROVADA. Corrija exatamente o que foi apontado, sem reescrever o que não foi.",
    "",
    "OS FATOS, e não existe nenhum outro:",
    listar(fatos),
    "",
    "O QUE FOI ESCRITO E REPROVADO:",
    `  síntese: ${reprovada.sintese || "(vazia)"}`,
    `  afirmações: ${escrita || "nenhuma"}`,
    "",
    "POR QUE FOI REPROVADO:",
    violacoes.map((v) => `  - ${v}`).join("\n"),
    "",
    "REGRAS: as mesmas de antes. Toda afirmação sai de um fato da lista e declara qual;",
    "é proibido introduzir qualquer coisa fora da lista; sem previsão, sem conselho,",
    `sem frase genérica; de ${FRASES.min} a ${FRASES.max} frases.`,
    "Um exemplo concreto que não se sustente nos fatos deve ser RETIRADO, não reescrito.",
    "",
    ...regrasDaManifestacao(locale),
    "",
    'Devolva JSON: {"afirmacoes": [{"texto": "...", "fato": "f1", "manifestacoes": ["..."]}], "sintese": "..."}',
  ].join("\n")

  return { system: SISTEMA_INTERCONEXOES[locale], user }
}
