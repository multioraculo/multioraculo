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
    /\b(energias?|vibe|vibração)\b/i,
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
    // Construções que serviriam a qualquer céu. O problema nunca é a palavra
    // do signo repetida quando o dado a sustenta; é a frase que continuaria
    // valendo se os planetas fossem outros.
    /\b(busca por (harmonia|equilíbrio)|encontrar (harmonia|equilíbrio)|novas conexões|novos entendimentos)\b/i,
    /\btípic[oa]s? d[eo]\b/i,
    // o signo como sujeito de um verbo de vontade. O olhar para trás evita o
    // falso positivo de "Mercúrio em Libra busca", onde quem busca é o planeta
    /(?<!\b(?:em|de|do|da|no|na)\s)\b(áries|touro|gêmeos|câncer|leão|virgem|libra|escorpião|sagitário|capricórnio|aquário|peixes)\s+(sente|precisa|busca|deve|quer|tende)\b/i,
    /\b(este|esse|essa|esta)\s+(aspecto|configuração|posição|movimento)\s+(pede|sugere|indica|traz|convida)\b/i,
    /\bsugerindo (um |uma )?(potencial|possibilidade)/i,
    // a regra 2 diz que nada influencia ninguém: aqui ela passa a ser cobrada
    /\b(influenci|impact)\w+/i,
    /\b(causa|causando|determina|determinando) (o|a|os|as|que)\b/i,
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
    "energia",
    "busca por harmonia",
    "encontrar equilíbrio",
    "novas conexões",
    "típico de",
    "este aspecto pede",
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

/** Travessão e meia risca, proibidos em qualquer campo gerado. */
export const TRACOS = /[—–]/

/**
 * As marcas de hipótese: o único jeito de o produto escrever algo concreto.
 *
 * Uma frase que desce do mecanismo para a vida ("uma conversa que volta", "o
 * espaço de casa") é a parte mais útil de uma leitura e a mais fácil de virar
 * adivinhação. A diferença entre as duas é uma palavra: dita como hipótese, é
 * leitura; dita como fato, é previsão. Por isso a lista é FECHADA e é a mesma
 * para todos os textos do produto — prompt e verificador leem daqui, e nenhum
 * dos dois pode conhecer uma forma que o outro desconhece.
 */
export const MARCAS_HIPOTESE: Record<Locale, string[]> = {
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
 * Precisão que nenhum cálculo do produto produz. O céu de hoje não diz a que
 * horas nem em que dia da semana nada acontece: um texto que diz isso inventou.
 */
export const FALSA_PRECISAO: Record<Locale, RegExp[]> = {
  pt: [
    /\b\d{1,2}\s*(h|horas)\b/i,
    /\b\d{1,2}:\d{2}\b/,
    /\b(segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado|domingo)(-feira)?\b/i,
    /\b(janeiro|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/i,
    // sem \b no começo: em JavaScript ele é ASCII, e entre um espaço e "à" não
    // existe fronteira de palavra nenhuma
    /(^|[^\p{L}])(de manh[ãa]|[àa] tarde|[àa] noite|de madrugada)/iu,
  ],
  en: [
    /\b\d{1,2}\s*(am|pm|o'clock)\b/i,
    /\b\d{1,2}:\d{2}\b/,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
    /\b(in the morning|in the afternoon|at night)\b/i,
  ],
  es: [
    /\b\d{1,2}\s*(h|horas)\b/i,
    /\b\d{1,2}:\d{2}\b/,
    /\b(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo)\b/i,
    /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i,
    /\b(por la ma[ñn]ana|por la tarde|por la noche)\b/i,
  ],
}

/**
 * Futuro afirmado. O motor mede um céu, não anuncia um acontecimento, e a
 * distância entre as duas coisas é a honestidade inteira do produto.
 */
export const PREVISAO: Record<Locale, RegExp[]> = {
  pt: [
    /\bvai (acontecer|surgir|chegar|trazer|mudar)\b/i,
    /\bvoc[êe] (vai|ir[áa])\b/i,
    /\bacontecer[áa]\b/i,
    /\bser[áa] um (dia|momento|per[íi]odo)\b/i,
  ],
  en: [/\bwill (happen|bring|change|arrive)\b/i, /\byou will\b/i, /\bis going to\b/i],
  es: [/\bva a (pasar|llegar|traer|cambiar)\b/i, /\bvas a\b/i, /\bocurrir[áa]\b/i],
}

/** Prescrição. O produto não aconselha em lugar nenhum. */
export const CONSELHO: Record<Locale, RegExp[]> = {
  pt: [
    /\b(procure|evite|tente|busque|aproveite|cuidado com|permita-se|lembre-se de|e importante que voce)\b/i,
    /\b(voce deve|voce precisa|e hora de)\b/i,
  ],
  en: [/\b(try to|avoid|seek|allow yourself|remember to|you should|you need to|it is time to)\b/i],
  es: [/\b(procura|evita|intenta|busca|permitete|recuerda|debes|necesitas|es hora de)\b/i],
}

/**
 * O CÉU COMO AGENTE QUE PEDE. Regra diferente de `CONSELHO`, e as duas existem.
 *
 * `CONSELHO` pega o imperativo dirigido ao leitor: "procure", "evite", "você
 * deve". Esta pega a outra metade da mesma recusa, com o céu no lugar do
 * sujeito: ele não exige, não pede, não demanda, não convida, não favorece, não
 * sugere e não desafia ninguém. É a cobrança da regra que o prompt do céu
 * enuncia, e por isso tem nome próprio em vez de virar mais uma entrada em
 * `CONSELHO`, onde mudaria o sentido das duas.
 *
 * O PT é exatamente a lista que vivia dentro de `verificarCeu`, movida para cá
 * sem alteração. EN e ES são os equivalentes dela, um a um: exigir/require e
 * demand, pedir/ask, demandar/demand, convidar/invite, favorecer/favor,
 * desafiar/challenge, propor/propose, sugerir/suggest, aconselhar/advise.
 * Nenhum verbo novo entrou em nenhum dos três.
 *
 * EN E ES LISTAM FORMAS VERBAIS, E COM FRONTEIRA DE PALAVRA, porque é isso que
 * o PT faz. A primeira tradução usou radicais soltos e ficou mais restritiva
 * que o original: "ask" casava dentro de "task" e "mask", "propos" pegava
 * "proposition", "suggest" pegava "suggestion" e "favou?r" pegava "favorable".
 * O PT não pega nenhum equivalente desses: "propõe" não alcança "proposta",
 * "sugere" não alcança "sugestão" e "favorec" não alcança "favorável". Ele mira
 * o verbo conjugado, e agora os outros dois também.
 */
export const PEDIDO: Record<Locale, RegExp[]> = {
  // `desafia` e não `desafi`: o radical curto alcançava o SUBSTANTIVO "desafio"
  // e "desafios", que não são o céu pedindo nada. "desafia" mais `\w*` cobre
  // desafia, desafiam, desafiando, desafiar e desafiaria, e deixa o
  // substantivo passar. Medido: `Comunicação encontra desafios assertivos`
  // era reprovado, e não devia. O resto da lista está intacto.
  pt: [
    /(exig|ped(e|indo)|demand|convid|favorec|propõe|sugere|aconselha)\w*/gi,
    // DESAFIAR SAIU DA ALTERNAÇÃO ACIMA, e o motivo é que o `\w*` dela vale
    // para todos os ramos. Com `desafia` ali dentro, "desafiadora" casava, e
    // em 2026-10-02 uma tentativa foi reprovada por `fala como conselho:
    // "desafiadora"` — que é adjetivo, não o céu pedindo nada. Trocar `desafi`
    // por `desafia` fechou o substantivo "desafios" e deixou o adjetivo
    // aberto: correção incompleta.
    //
    // Aqui as formas verbais são explícitas e com fronteira, como o espanhol
    // já fazia. Passam "desafiador", "desafiadora" e "desafios"; continuam
    // reprovando "desafia", "desafiam", "desafiando", "desafiar" e "desafiará".
    /\b(desafia|desafiam|desafiar|desafiando|desafiará|desafiarão|desafiaria|desafiariam)\b/gi,
  ],
  // `challenges?` saiu daqui e foi para HOMOGRAFOS: em inglês a grafia do
  // verbo na 3ª pessoa e a do substantivo plural são a MESMA, e nenhuma regra
  // de forma separa as duas. Precisa de contexto.
  en: [
    /\b(requires?|requiring|demands?|demanding|asks?|asking|invites?|inviting|favou?rs?|favou?ring|proposes?|proposing|suggests?|suggesting|advises?|advising)\b/gi,
  ],
  // O espanhol já estava correto, e por isso não muda: as formas verbais são
  // explícitas, e `desafía` simplesmente não alcança o substantivo "desafíos".
  // Foi ele que mostrou a forma certa para os outros dois.
  es: [
    /\b(exige[n]?|exigiendo|pide[n]?|pidiendo|demanda[n]?|demandando|invita[n]?|invitando|favorece[n]?|favoreciendo|desafía[n]?|desafia[n]?|desafiando|propone[n]?|proponiendo|sugiere[n]?|sugiriendo|aconseja[n]?|aconsejando)\b/gi,
  ],
}

/**
 * HOMÓGRAFOS: a mesma grafia serve de verbo e de substantivo.
 *
 * Em inglês "challenges" é a 3ª pessoa do verbo E o plural do substantivo,
 * caractere por caractere. Nenhuma regra de forma separa as duas, ao contrário
 * do português ("desafia" contra "desafios") e do espanhol ("desafía" contra
 * "desafíos"), onde a flexão já resolve. Então em inglês, e só em inglês,
 * precisa de contexto.
 *
 * Medido nos logs de produção: `Communication meets assertive challenges` foi
 * reprovado como conselho, e ali "challenges" é substantivo. O céu não estava
 * pedindo nada.
 */
const HOMOGRAFOS: Record<Locale, RegExp[]> = {
  pt: [],
  en: [/\bchallenges?\b/gi],
  es: [],
}

/**
 * Marcas de que o homógrafo está como SUBSTANTIVO. Testadas contra o texto que
 * vem antes dele, e todas de classe fechada ou de sufixo, sem nada de análise
 * sintática: determinante ou possessivo ("the challenges"), adjetivo comum ou
 * com sufixo adjetival ("assertive challenges", "deep challenges"), ou início
 * de frase, porque uma declarativa inglesa não começa por verbo finito.
 *
 * SEM `-ent` E SEM `-ant` na lista de sufixos, e o motivo foi medido: "ent"
 * casa o final de "movement", "element", "statement" e "moment", que são
 * substantivos, e com eles `This movement challenges you to reconsider`
 * escapava como se "challenges" fosse substantivo. O sufixo nominal `-ment`
 * termina em "ent", e separar os dois por regex não vale o que custa.
 *
 * LIMITE CONHECIDO, e deliberado: um substantivo em `-ing` ou `-ed` antes do
 * homógrafo é lido como adjetivo, então "the crossing challenges you" escapa.
 * É uma falha para o lado de deixar passar, que é o lado certo aqui: o defeito
 * que se corrige é a recusa do substantivo, e as formas verbais claras
 * continuam pegas.
 */
const ADJETIVOS_CURTOS =
  "deep|new|old|great|strong|quiet|clear|sharp|hard|soft|bold|firm|vast|open|wide|long|short|high|low|real|true|same|other|further|inner|outer|mere|sheer"
const DETERMINANTES = "a|an|the|this|that|these|those|its|their|his|her|our|your|my|some|any|no|few|many|several|both|each"

const COMO_SUBSTANTIVO: Record<Locale, RegExp> = {
  pt: /.^/,
  en: new RegExp(`(^|[.!?]["')\\]]?\\s+)$|\\b(${DETERMINANTES}|${ADJETIVOS_CURTOS}|\\w+(ive|ous|al|ic|ful|less|ary|ed|ing))\\s+$`, "i"),
  es: /.^/,
}

/**
 * As palavras em que o texto fala como pedido, já descontado o homógrafo em
 * uso de substantivo.
 */
export function pedidoDoCeu(sintese: string, locale: Locale): string[] {
  const achados: string[] = []
  for (const re of PEDIDO[locale]) {
    for (const m of sintese.matchAll(re)) achados.push(m[0])
  }
  for (const re of HOMOGRAFOS[locale]) {
    for (const m of sintese.matchAll(re)) {
      const antes = sintese.slice(0, m.index ?? 0)
      if (!COMO_SUBSTANTIVO[locale].test(antes)) achados.push(m[0])
    }
  }
  return achados
}

/**
 * ESFERA DA VIDA QUE O TEXTO NÃO PODE SABER.
 *
 * A leitura do céu vale para todas as pessoas, e quem a escreve não sabe nada
 * sobre quem lê: nomear relações, trabalho, dinheiro ou saúde é inventar um
 * destinatário. Não existia versão multilíngue desta regra em lugar nenhum do
 * projeto; o PT é a lista que vivia dentro de `verificarCeu`, intacta, e EN e
 * ES são a tradução dos mesmos domínios.
 *
 * "affection" e "affective", e não "affect": em inglês "affects" é verbo neutro
 * e comum, e pegá-lo tornaria o verificador mais restritivo em EN do que é em
 * PT, onde "afetiv" e "afeto" nomeiam o domínio afetivo e não a ação de afetar.
 *
 * O MESMO CUIDADO VALE PARA O ALCANCE DE CADA RADICAL. Em português os termos
 * deste domínio são acentuados ou longos, e por isso não se esconderam dentro
 * de palavra nenhuma: "família" não alcança "familiar", "vínculo" não alcança
 * "vincular", "trabalh" não existe dentro de outra palavra. A primeira tradução
 * perdeu isso e ficou mais restritiva que o original: "famil" pegava
 * "familiar", "work" pegava "network" e "framework", "love" pegava "lovely",
 * "bond" pegava "bonding". Agora EN e ES listam as palavras do domínio com
 * fronteira, que é o alcance que o PT tem de fato.
 */
export const ESFERA_DE_VIDA: Record<Locale, RegExp[]> = {
  pt: [/(afetiv|afeto|amoros|relaç|relacionament|vínculo|trabalh|carreir|financ|dinheiro|saúde|família)\w*/gi],
  en: [
    /\b(affection|affections|affective|romance|romantic|loves?|relationships?|bonds?|works?|working|jobs?|careers?|financial|finances|money|health|family|families)\b/gi,
  ],
  es: [
    /\b(afectivo|afectiva|afectivos|afectivas|afectos?|amoroso|amorosa|romance|relación|relaciones|vínculos?|trabajos?|carreras?|financiero|financiera|finanzas|dinero|salud|familias?)\b/gi,
  ],
}

// ---------------------------------------------------------------------------
// nome técnico exposto, contra palavra corrente
// ---------------------------------------------------------------------------

/**
 * NOMES QUE TAMBÉM SÃO PALAVRA CORRENTE DO IDIOMA.
 *
 * A regra de não nomear astrologia comparava a síntese contra a lista de nomes
 * de corpos, signos, aspectos e fases, exigindo que nenhum aparecesse. A
 * intenção é que o texto não exponha nomenclatura técnica. O efeito, em
 * inglês, era proibir palavras comuníssimas da língua.
 *
 * Medido em produção em 2026-10-01: a geração em inglês reprovou nas quatro
 * tentativas e devolveu `sintese: null`. "new" e "full" são nomes de fase da
 * Lua em inglês, e são também duas das palavras mais frequentes do idioma;
 * "square" e "opposition" são nomes de aspecto e prosa comum.
 *
 * PORTUGUÊS E ESPANHOL ESCAPAVAM POR ACIDENTE, de dois jeitos:
 *
 *  - por flexão: a comparação é de palavra exata, e "nova" não alcança
 *    "novas", nem "nueva" alcança "nuevas". A prosa flexiona e passa. O inglês
 *    não flexiona, então "new" é a própria forma usada no texto;
 *  - por jargão: "quadratura" e "cuadratura" não são palavra de uso corrente,
 *    enquanto "square" é.
 *
 * Por isso as listas abaixo não são traduções uma da outra, e isso é o certo:
 * em cada idioma entra o que de fato é palavra corrente naquele idioma. O
 * resultado é o mesmo grau de exigência nos três, que é o objetivo.
 *
 * FICAM DE FORA, de propósito:
 *
 *  - os corpos ("Sol", "Lua", "Sun", "Moon"). Numa leitura do céu, escrever
 *    "a lua" É nomear o corpo, e é exatamente o que a separação de camadas
 *    recusa. Seguem proibidos sem condição, nos três idiomas;
 *  - os signos, mesmo os que são palavra comum, e há vários: "Touro",
 *    "Gêmeos", "Leão", "Virgem", "Peixes", "Aquário" e "Câncer" em português,
 *    "Cancer" e "Leo" em inglês, "Tauro", "Acuario" e "Piscis" em espanhol.
 *    Uma síntese de 45 palavras sobre movimentos abstratos não usa nenhum
 *    deles no sentido comum, e afrouxar a proteção dos signos custaria mais do
 *    que resolve;
 *  - as fases de duas palavras e os aspectos de jargão ("quarto crescente",
 *    "waning gibbous", "trígono", "quincunx"), que não são ambíguos em idioma
 *    nenhum.
 */
const NOMES_AMBIGUOS: Record<Locale, string[]> = {
  pt: ["nova", "cheia", "oposição", "conjunção"],
  en: ["new", "full", "square", "opposition", "conjunction"],
  es: ["nueva", "llena", "oposición", "conjunción"],
}

/**
 * Palavras que marcam discurso astrológico em volta do termo. Quando uma
 * dessas está perto, o termo ambíguo está sendo usado como nomenclatura.
 */
const MARCA_TECNICA: Record<Locale, RegExp> = {
  pt: /(^|[^\p{L}])(aspectos?|fases?|signos?|graus?|orbes?|retrógrad\p{L}*|trânsitos?|zodíaco|lunar|lua|sol|planetas?|mapa)([^\p{L}]|$)/iu,
  en: /(^|[^\p{L}])(aspects?|phases?|signs?|degrees?|orbs?|retrograde|transits?|zodiac|lunar|moon|sun|planets?|chart)([^\p{L}]|$)/iu,
  es: /(^|[^\p{L}])(aspectos?|fases?|signos?|grados?|orbes?|retrógrad\p{L}*|tránsitos?|zodíaco|lunar|luna|sol|planetas?|carta)([^\p{L}]|$)/iu,
}

/**
 * Formas em que o termo ambíguo é nomenclatura sem precisar de contexto: "lua
 * nova", "new moon", "square aspect", "in square with". Em inglês entram
 * "square" e "conjunction" no uso relacional, que só existe em astrologia;
 * "opposition" não entra, porque "in opposition to" é inglês comum.
 */
const FRASE_TECNICA: Record<Locale, RegExp[]> = {
  pt: [/\blua\s+(nova|cheia)\b/giu, /\b(nova|cheia)\s+lua\b/giu, /\b(aspecto|fase)\s+de\s+(oposição|conjunção)\b/giu],
  en: [
    /\b(new|full)\s+moon\b/giu,
    /\bmoon\s+is\s+(new|full)\b/giu,
    /\b(square|opposition|conjunction)\s+(aspect|phase)\b/giu,
    /\b(aspect|phase)\s+of\s+(square|opposition|conjunction)\b/giu,
    /\bin\s+(square|conjunction)\s+(with|to)\b/giu,
  ],
  es: [/\bluna\s+(nueva|llena)\b/giu, /\b(nueva|llena)\s+luna\b/giu, /\b(aspecto|fase)\s+de\s+(oposición|conjunción)\b/giu],
}

/** Quantos caracteres de cada lado contam como "perto" do termo. */
const JANELA = 40

const escaparRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Os nomes técnicos que a síntese expõe, já descontado o uso corrente.
 *
 * Nome não ambíguo é proibido sem condição, como sempre foi. Nome ambíguo só
 * conta como exposição quando aparece em forma inequivocamente técnica ou perto
 * de uma marca de discurso astrológico. "new perspectives" passa, "new moon"
 * não; "the town square" passa, "square aspect" não.
 */
export function nomesExpostos(sintese: string, locale: Locale, proibidos: string[]): string[] {
  const ambiguos = new Set(NOMES_AMBIGUOS[locale].map((n) => n.toLowerCase()))
  const expostos: string[] = []

  for (const nome of proibidos) {
    const ocorrencias = [...sintese.matchAll(new RegExp(`(^|[^\\p{L}])(${escaparRegex(nome)})([^\\p{L}]|$)`, "giu"))]
    if (!ocorrencias.length) continue

    if (!ambiguos.has(nome.toLowerCase())) {
      expostos.push(nome)
      continue
    }

    // o termo ambíguo precisa de contexto técnico para contar
    const tecnico = ocorrencias.some((m) => {
      const inicio = (m.index ?? 0) + m[1].length
      const fim = inicio + m[2].length

      // forma técnica que contenha esta própria ocorrência
      for (const frase of FRASE_TECNICA[locale]) {
        for (const f of sintese.matchAll(frase)) {
          const fi = f.index ?? 0
          if (fi <= inicio && fi + f[0].length >= fim) return true
        }
      }

      const janela = sintese.slice(Math.max(0, inicio - JANELA), fim + JANELA)
      return MARCA_TECNICA[locale].test(janela)
    })
    if (tecnico) expostos.push(nome)
  }

  return expostos
}

/**
 * Os nomes técnicos daquele idioma que o modelo precisa evitar, em texto para
 * entrar no prompt.
 *
 * Existe porque o prompt pedia em abstrato ("não repita nome de planeta, de
 * signo, de aspecto nem de fase") e o modelo era julgado por uma lista que não
 * via. Escrevendo em inglês ele não tinha como adivinhar que "new" e "full"
 * estavam nela. Isto não acrescenta exigência nenhuma: enuncia a que já existe.
 */
export function vocabularioTecnico(nomes: string[]): string {
  return [...new Set(nomes.filter(Boolean))].join(", ")
}

// ---------------------------------------------------------------------------
// idioma da saída
// ---------------------------------------------------------------------------

/**
 * PALAVRAS DE FUNÇÃO, e não de assunto.
 *
 * Artigos, preposições, conjunções e pronomes são classe fechada: aparecem em
 * qualquer texto, não dependem do tema e não mudam com o dia. É o oposto de
 * procurar uma palavra específica, que falharia no primeiro texto que não a
 * usasse.
 *
 * SÓ ENTRA O QUE NÃO COLIDE entre os três idiomas, e aqui isso exigiu cuidado,
 * porque português e espanhol compartilham muito. Ficaram os pares que de fato
 * separam: "com" contra "con", "uma" contra "una", "e" contra "y", "do" e "da"
 * contra "del" e "al", "mais" contra "más", "não" contra "no". Saíram os que os
 * dois idiomas escrevem igual, como "que", "entre" e "está", e as de uma letra
 * que o inglês também usa, como "a" e "o".
 */
const GRAMATICAIS: Record<Locale, string[]> = {
  pt: ["não", "uma", "um", "com", "do", "da", "dos", "das", "é", "são", "também", "já", "mais", "e", "os", "ao", "essa", "esse", "isso", "enquanto", "seu", "sua", "pelo", "pela", "em", "muito"],
  en: ["the", "and", "of", "to", "in", "is", "with", "that", "this", "these", "for", "an", "their", "they", "where", "while", "into", "from", "by", "are", "its", "her", "his"],
  es: ["y", "el", "la", "los", "las", "un", "una", "con", "más", "del", "al", "pero", "su", "sus", "lo", "este", "esta", "mientras", "hacia", "muy", "en"],
}

/**
 * Marcas de ortografia, que não dependem de vocabulário nenhum: "ção" e "lh"
 * não existem em espanhol, "ñ" e "ción" não existem em português, e o inglês
 * não usa acento. Valem 2 pontos porque uma só já decide, enquanto uma palavra
 * de função isolada pode ser coincidência.
 */
/**
 * SÓ SINAIS QUE NÃO SE ESCONDEM DENTRO DE PALAVRA DOS OUTROS IDIOMAS.
 *
 * A primeira versão tinha dois ramos que faziam exatamente isso, e os dois
 * eram meus:
 *
 *   `ll[aeiou]` no espanhol casava em "cha(lle)nges", "a(llo)w", "fo(llo)w",
 *   "co(lle)ct", "ste(lla)r", "para(lle)l" — inglês comuníssimo. Como a marca
 *   vale 2 pontos e a margem do detector é 2, uma frase inglesa curta e pobre
 *   em palavras de função era acusada de espanhol. Medido:
 *   `Communication meets assertive challenges.` dava "es";
 *
 *   `nh` no português casava em "e(nh)ance", "i(nh)ale", "u(nh)appy".
 *
 * Os dois saíram. `ç` e `ão` sustentam o português sem ajuda, e `ñ` e `ción`
 * sustentam o espanhol: nenhum dos quatro existe em inglês, e nenhum deles
 * aparece dentro de palavra do outro idioma latino. `lh` saiu junto por ser
 * redundante, e não por ser perigoso.
 *
 * A direção do erro importa: sem evidência suficiente o detector devolve nulo,
 * em vez de acusar idioma errado.
 */
const ORTOGRAFIA: Record<Locale, RegExp[]> = {
  pt: [/ção|ções|ão|ões|ç/i],
  en: [],
  es: [/ñ|ción|ciones|¿|¡/i],
}

/**
 * A folga exigida para reprovar. Com 2, um texto curto e pobre em palavras de
 * função empata e PASSA, em vez de queimar uma tentativa paga por engano. A
 * assimetria é de propósito: reprovar à toa custa dinheiro, e o caso que esta
 * regra existe para pegar não é o texto ambíguo, é o parágrafo inteiro no
 * idioma errado, que aparece com 6 a 23 pontos contra 0.
 */
const MARGEM_DE_IDIOMA = 2

function pontosDeIdioma(texto: string, locale: Locale): number {
  const palavras = texto.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean)
  const alvo = new Set(GRAMATICAIS[locale])
  let pontos = palavras.filter((p) => alvo.has(p)).length
  for (const re of ORTOGRAFIA[locale]) if (re.test(texto)) pontos += 2
  return pontos
}

/**
 * O idioma em que o texto está, quando NÃO é o pedido. Devolve nulo quando
 * confere, e também quando não há evidência suficiente para afirmar o
 * contrário.
 *
 * Existe porque o sistema conseguiu gravar uma síntese em português dentro de
 * `locale=en` e `locale=es`: o prompt pedia o idioma numa linha e demonstrava a
 * forma desejada com um exemplo em português, e nada conferia a língua da
 * saída. Não é detector de idioma de uso geral: é o bastante para barrar o caso
 * óbvio antes de ele ser gravado.
 */
export function idiomaDivergente(texto: string, esperado: Locale): Locale | null {
  const placar: Record<Locale, number> = {
    pt: pontosDeIdioma(texto, "pt"),
    en: pontosDeIdioma(texto, "en"),
    es: pontosDeIdioma(texto, "es"),
  }
  const melhor = (Object.keys(placar) as Locale[]).reduce((a, b) => (placar[b] > placar[a] ? b : a))
  if (melhor === esperado) return null
  return placar[melhor] >= placar[esperado] + MARGEM_DE_IDIOMA ? melhor : null
}
