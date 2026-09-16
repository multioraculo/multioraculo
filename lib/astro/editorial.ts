/**
 * As regras editoriais do horóscopo, e as listas que o verificador usa para
 * conferi-las.
 *
 * Três decisões que governam tudo aqui:
 *
 *  - o texto NÃO atribui nada a ninguém: não cita Jung, não cita autor nenhum,
 *    não invoca escola. A mesma regra já vale, em produção, para o
 *    interpretador de sonhos. O vocabulário simbólico é linguagem, não
 *    citação;
 *  - a palavra "arquétipo" não aparece na tela, em nenhuma flexão. A base
 *    conceitual fica na estrutura do sistema. O leitor recebe uma leitura, não
 *    uma aula;
 *  - travessão e meia risca não são usados. Ponto, vírgula, dois-pontos,
 *    ponto e vírgula e parênteses dão conta.
 */
import type { Locale } from "@/lib/i18n/config"

/** Regras coladas em todo prompt interpretativo do horóscopo. */
export const REGRAS_COMUNS = `REGRAS DA LEITURA

1. Você recebe MOVIMENTOS já calculados, e as palavras de cada planeta, de cada signo e de cada ângulo já vêm definidas. Não calcule, não corrija e não acrescente nenhuma posição, aspecto, grau ou data. O que não está aqui não existe para este texto.
2. Astrologia aqui é linguagem simbólica, não mecanismo causal: nada "influencia", "causa" ou "determina" ninguém. Isso é uma postura, não uma fórmula; não repita "pode simbolizar" a cada frase.
3. Nada de previsão de acontecimento, conselho, diagnóstico, promessa ou frase motivacional. Não invente cena nenhuma da vida do leitor (uma conversa, uma conta que chega, uma viagem, alguém que liga). Descreva o que está em jogo, nunca o que vai acontecer.
4. Tensão não é defeito e facilidade não é sorte. Diga o que cada força quer e o que a outra exige dela.
5. Não cite autor, escola, tradição nem obra. Nenhum nome próprio além dos planetas e signos que aparecem nos movimentos.
6. NUNCA escreva "arquétipo", "arquetípico" ou qualquer flexão dessas palavras. A base conceitual do sistema não aparece na tela.
7. NUNCA use travessão nem meia risca. Use ponto, vírgula, dois-pontos, ponto e vírgula ou parênteses.
8. Registro adulto, contemplativo, preciso, pouco adjetivado. Sem exclamação, sem pergunta retórica fora do campo indicado, sem "universo", sem "energia", sem "vibe".
9. Escreva a leitura, não sobre a leitura. Nada de "trata-se de um momento para", "essa configuração", "essas duas áreas".
10. Nada de traço fixo de personalidade. Não escreva "virginianos são assim" nem "você é uma pessoa que".`

/** Expressões que reprovam o texto. */
export const PROIBIDAS: Record<Locale, RegExp[]> = {
  pt: [
    /\barquetíp\w*/i,
    /\barquétipo\w*/i,
    /\bvai (acontecer|dar certo|melhorar|mudar)\b/i,
    /\b(sorte|azar|infelizmente|felizmente)\b/i,
    /\b(energia|vibe|vibração) (positiva|negativa|boa|ruim|do dia)\b/i,
    /\b(universo conspira|confie no universo|tudo vai ficar bem)\b/i,
    /\b(diagnóstic|transtorno|depressão|ansiedade|doença|cura)\w*/i,
    /\b(jung|freud|greene|tarnas|hillman)\b/i,
    /\b(configuração celeste|jornada interior|mergulho interior|autoconhecimento)\b/i,
    /à tona\b/i,
    // sem \b no começo: em JavaScript ele é ASCII, e "é" não é caractere de
    // palavra, então /\bé fundamental/ nunca casaria
    /(^|[^\p{L}])(trata-se de um momento|é um (dia|momento) que pede|o dia pede|momento de (observar|refletir))/iu,
    /\b(paz interior|equilíbrio interior)\b/i,
    /(^|[^\p{L}])(um convite para|pedem? atenção especial|é fundamental|destaca a importância|ressalta a necessidade)/iu,
    /\b(virginian|arian|taurin|gemini|canceri|leonin|libria|escorpian|sagitarian|capricornian|aquarian|piscian)\w*\s+(são|tendem|costumam)\b/i,
  ],
  en: [
    /\barchetyp\w*/i,
    /\b(will happen|will improve|will change)\b/i,
    /\b(luck|lucky|unlucky|fortunately|unfortunately)\b/i,
    /\b(positive|negative|good|bad) energy\b/i,
    /\b(the universe wants|trust the universe|everything will be fine)\b/i,
    /\b(diagnos|disorder|depression|anxiety|disease|cure)\w*/i,
    /\b(jung|freud|greene|tarnas|hillman)\b/i,
    /\b(celestial configuration|inner journey|self-knowledge)\b/i,
    /\b(brings? to the surface|this is a moment to|this configuration)\b/i,
    /\b(inner peace|inner balance)\b/i,
    /\b(virgos|aries people|taureans|geminis|cancerians|leos|librans|scorpios|sagittarians|capricorns|aquarians|pisceans) (are|tend)\b/i,
  ],
  es: [
    /\barquetíp\w*/i,
    /\barquetipo\w*/i,
    /\bva a (pasar|mejorar|cambiar|salir bien)\b/i,
    /\b(suerte|mala suerte|afortunadamente|desafortunadamente)\b/i,
    /\benergía (positiva|negativa|buena|mala)\b/i,
    /\b(el universo conspira|confía en el universo|todo estará bien)\b/i,
    /\b(diagnóstic|trastorno|depresión|ansiedad|enfermedad|cura)\w*/i,
    /\b(jung|freud|greene|tarnas|hillman)\b/i,
    /\b(configuración celeste|viaje interior|autoconocimiento)\b/i,
    /\b(saca[rn]? a la superficie|se trata de un momento|esta configuración)\b/i,
    /\b(paz interior|equilibrio interior)\b/i,
    /\b(los virgo|los aries|los tauro|los géminis|los cáncer|los leo|los libra|los escorpio|los sagitario|los capricornio|los acuario|los piscis) (son|suelen)\b/i,
  ],
}

/**
 * As mesmas proibições, em texto, para irem no prompt.
 *
 * Sem isto o modelo descobre cada proibição sendo reprovado, e gasta as três
 * tentativas trocando um clichê por outro. O teste de regressão confere que
 * toda expressão desta lista é de fato pega por PROIBIDAS: a lista pode ser
 * menor que os regex, nunca dizer ao modelo algo que não é verdade.
 */
export const EXPRESSOES_EVITAR: Record<Locale, string[]> = {
  pt: [
    "à tona",
    "destaca a importância",
    "ressalta a necessidade",
    "é fundamental",
    "um convite para",
    "pede atenção especial",
    "o dia pede",
    "trata-se de um momento",
    "paz interior",
    "autoconhecimento",
    "jornada interior",
    "configuração celeste",
    "sorte",
    "felizmente",
  ],
  en: [
    "brings to the surface",
    "this is a moment to",
    "this configuration",
    "inner journey",
    "self-knowledge",
    "inner peace",
    "luck",
    "fortunately",
  ],
  es: [
    "saca a la superficie",
    "se trata de un momento",
    "esta configuración",
    "viaje interior",
    "autoconocimiento",
    "paz interior",
    "suerte",
    "afortunadamente",
  ],
}

/**
 * Começos de frase que transformam as duas linhas finais em conselho. Elas
 * descrevem o que a configuração oferece e o que ela cobra; no imperativo,
 * viram receita.
 */
export const IMPERATIVOS: Record<Locale, RegExp> = {
  pt: /^\s*(aproveite|evite|procure|tente|faça|busque|permita|deixe|observe|reconheça|aceite|confie|cuide|lembre|use|aprenda|mantenha|pare|comece)\b/i,
  en: /^\s*(take advantage|avoid|try|make|seek|allow|let|observe|acknowledge|accept|trust|care|remember|use|learn|keep|stop|start)\b/i,
  es: /^\s*(aprovecha|evita|intenta|haz|busca|permite|deja|observa|reconoce|acepta|confía|cuida|recuerda|usa|aprende|mantén|para|empieza)\b/i,
}

/** Travessão e meia risca, proibidos em qualquer campo gerado. */
export const TRACOS = /[—–]/
