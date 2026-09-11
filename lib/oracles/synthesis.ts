/**
 * Prompt da síntese integrada. Vive fora da rota para ser usado pela segunda
 * etapa da consulta (POST /consultas/sintese), que roda em uma função
 * separada para caber no limite de 60 s por função do Netlify.
 *
 * Dois princípios:
 *
 * 1. A síntese INTEGRA, não reinterpreta. Cada oráculo já produziu sua
 *    leitura completa; aqui o trabalho é comparar as cinco, achar onde
 *    convergem e onde divergem. Os símbolos entram apenas como contexto.
 *
 * 2. Os cinco sistemas chegam com o MESMO PESO. A ordem em que aparecem é
 *    um embaralhamento determinístico pelo seed (o mesmo seed dá sempre a
 *    mesma ordem; ao longo de muitas leituras cada sistema ocupa todas as
 *    posições por igual), e cada leitura é condensada pelo mesmo orçamento
 *    de informação, preservando conclusão, tensões, advertências, elementos
 *    centrais e relações — cortando só em fim de frase (salience.ts).
 *
 * 3. A FORMA é fixa, o CONTEÚDO não. São quatro trechos obrigatórios, em
 *    ordem, chamados M1 a M4 apenas no prompt: códigos sem tradução, para
 *    que o modelo não copie um nome de função para dentro do texto. Quatro
 *    parágrafos é o padrão; cinco ou seis só quando a complexidade real da
 *    tiragem pedir, e aí o espaço extra desenvolve um dos quatro trechos.
 *    A estrutura organiza a leitura; ela não decide qual é o movimento.
 *    Nenhum trecho presume encerramento, crise, crescimento ou evolução: se
 *    o conjunto apontar continuidade, estabilidade ou ambivalência, é isso
 *    que o texto diz.
 *
 * O seed varia a LINGUAGEM dentro dessa estrutura (entrada, textura e
 * chegada), nunca a ordem nem a função dos trechos.
 */
import type { OracleKey } from "./draw"
import { condenseReading, SYNTHESIS_ORACLE_BUDGET } from "./salience"
import { languageRule } from "./language"
import type { Locale } from "@/lib/i18n/config"

export type SynthesisOracle = {
  title: string
  draw: {
    items: Array<{ position?: string; name: string; meaning?: string }>
    notes?: string
  }
  /** interpretação completa daquele oráculo (é o que a síntese compara) */
  reading?: string
}

export type SynthesisInput = Record<OracleKey, SynthesisOracle>

// ---------------------------------------------------------------------------
// Segmentação dos parágrafos
// ---------------------------------------------------------------------------

/**
 * Marcador de parágrafo pedido ao modelo.
 *
 * Instrução de "use parágrafos" falhava: em algumas leituras o texto vinha em
 * bloco único, sem nenhuma quebra, e a interface renderizava tudo junto. Um
 * marcador explícito é verificável e não depende de o modelo lembrar de
 * emitir linhas em branco. Ele NUNCA chega ao navegador: vira "\n\n" no
 * servidor, durante o próprio streaming.
 */
export const PARAGRAPH_MARKER = "[[P]]"

/** Aceita o marcador com espaços ou quebras em volta, e variações de caixa. */
const MARKER_RE = /[ \t]*\r?\n?[ \t]*\[\[\s*[Pp]\s*\]\][ \t]*\r?\n?[ \t]*/g

/** Texto final: marcadores viram parágrafos, sem linhas em branco sobrando. */
export function normalizeSynthesisText(raw: string): string {
  return raw
    .replace(MARKER_RE, "\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim()
}

/**
 * Filtro incremental para o streaming: troca o marcador por parágrafo sem
 * nunca deixar um marcador partido escapar para o navegador. Segura só o
 * pedaço final que ainda pode ser começo de marcador (no máximo 4 caracteres),
 * então não há atraso perceptível.
 */
export function createSynthesisFilter() {
  let buf = ""
  /** quantos caracteres do fim ainda podem ser um marcador incompleto */
  const holdBack = (s: string): number => {
    const max = Math.min(PARAGRAPH_MARKER.length - 1, s.length)
    for (let n = max; n > 0; n--) {
      const tail = s.slice(s.length - n)
      if (PARAGRAPH_MARKER.startsWith(tail) || "[[ p ]]".startsWith(tail)) return n
    }
    return 0
  }
  return {
    /** parte já segura do texto, com marcadores resolvidos */
    push(chunk: string): string {
      buf += chunk
      const keep = holdBack(buf)
      const ready = buf.slice(0, buf.length - keep)
      buf = buf.slice(buf.length - keep)
      return ready.replace(MARKER_RE, "\n\n")
    },
    /** o que sobrou no fim do stream */
    flush(): string {
      const rest = buf.replace(MARKER_RE, "\n\n")
      buf = ""
      return rest
    },
  }
}

export const ORACLE_ORDER: OracleKey[] = ["tarot", "iching", "runas", "buzios", "lenormand"]

// ---------------------------------------------------------------------------
// Variação narrativa determinística por seed
// ---------------------------------------------------------------------------

/**
 * Entrada do primeiro trecho (M1): por onde o texto entra na dinâmica que o
 * conjunto sustenta. Nenhuma opção diz QUAL é ela — isso vem da tiragem.
 */
const ENTRIES = [
  "Entre pelo movimento em si, nomeado de forma direta, antes de qualquer explicação.",
  "Entre por uma imagem concreta e sensorial que dê forma ao movimento, sem explicá-la de imediato.",
  "Entre pelo detalhe mais específico do material sobre esse movimento, e deixe-o abrir o resto.",
  "Entre pelo ponto em que a pergunta encontra o movimento em curso, ainda que de lado.",
  "Entre por uma frase curta e afirmativa, e desdobre a partir dela.",
  "Entre pelo que já estava em curso antes desta consulta, em tom baixo e descritivo.",
  "Entre pelo que se repete no material, dito sem ênfase, como constatação.",
  "Entre pelo aspecto em que o material é mais preciso, e só depois amplie.",
]

/** Textura dos quatro parágrafos: ritmo e tamanho relativo. Nunca reordena. */
const TEXTURES = [
  "Parágrafos de tamanhos desiguais: o primeiro e o terceiro mais longos, o segundo e o quarto mais contidos.",
  "Parágrafos de tamanhos desiguais: o segundo mais longo, os outros três mais curtos.",
  "Frases longas no primeiro e no terceiro parágrafo, curtas no segundo e no quarto.",
  "Cada parágrafo abre com uma frase curta e depois se alonga.",
  "Tom baixo e descritivo do começo ao fim, sem elevação de registro em nenhum parágrafo.",
  "Alterne o andamento: um parágrafo denso e lento, o seguinte mais rápido e cortante.",
]

/** Chegada da última frase. Nenhuma opção impõe valência positiva nem negativa. */
const CLOSINGS = [
  "Termine em uma imagem, não em uma conclusão.",
  "Termine nomeando a ambiguidade que permanece, sem resolvê-la.",
  "Termine em um detalhe pequeno e concreto, quase banal, que carregue o peso do todo.",
  "Termine sem fechar: a última frase deixa a leitura em aberto, como uma porta entreaberta.",
  "Termine com uma constatação seca, de uma linha, sem consolo e sem convocação.",
  "Termine voltando à primeira frase do texto, agora com outro sentido.",
  "Termine pelo que permanece de pé enquanto o resto se move, dito sem ênfase.",
]

function hash32(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** PRNG pequeno e determinístico (mulberry32), só para forma e ordem. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Ordem de apresentação dos cinco oráculos: embaralhamento completo
 * (Fisher–Yates) semeado pelo seed. Mesmo seed → mesma ordem; ao longo de
 * muitos seeds, cada sistema ocupa cada posição com a mesma frequência.
 * Nenhum sistema fica sempre em primeiro nem sempre em último.
 */
export function synthesisOrder(seed: string): OracleKey[] {
  const rand = mulberry32(hash32(`${seed}:synthesis-order`))
  const out = ORACLE_ORDER.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Onde o espaço extra vai QUANDO a leitura já tiver justificado mais de quatro
 * parágrafos. Quem decide SE há expansão é o conteúdo; o seed decide apenas
 * como esse espaço se distribui.
 */
const SPACING = [
  "dê o espaço extra a M3, abrindo a divergência num parágrafo próprio",
  "dê o espaço extra a M3, separando as duas forças simultâneas em parágrafos distintos",
  "dê o espaço extra a M1, distinguindo o sinal principal do secundário",
  "dê o espaço extra a M2, separando o que se rearranja do que apenas continua",
  "dê o espaço extra a M4, distinguindo o fecho do conflito que o antecede",
]

/**
 * Variação de linguagem por seed. Mesmo seed → mesmas escolhas. O seed nunca
 * altera tendência, sentido, peso entre sistemas, conclusão nem a ordem dos
 * quatro movimentos: só entrada, textura, chegada e a distribuição do espaço
 * extra quando o conteúdo já pediu esse espaço.
 */
export function narrativeHints(seed: string) {
  const h = hash32(seed)
  return {
    entry: ENTRIES[h % ENTRIES.length],
    texture: TEXTURES[(h >>> 8) % TEXTURES.length],
    closing: CLOSINGS[(h >>> 16) % CLOSINGS.length],
    spacing: SPACING[(h >>> 24) % SPACING.length],
  }
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

/** Bloco de um oráculo: leitura condensada por saliência + símbolos como contexto. */
function oracleBlock(r: SynthesisOracle, n: number): string {
  const symbols = r.draw.items.slice(0, 12).map((it) => it.name)
  const context = r.draw.items
    .slice(0, 12)
    .map((it) => (it.position ? `${it.position}: ${it.name}` : it.name))
    .join(" · ")
  const notes = r.draw.notes ? ` [${r.draw.notes}]` : ""
  const reading = (r.reading ?? "").trim()
  const body = reading
    ? condenseReading(reading, { budget: SYNTHESIS_ORACLE_BUDGET, symbols })
    : // sem leitura (leitura antiga): usa os significados por item, mesmo orçamento
      condenseReading(
        r.draw.items
          .slice(0, 12)
          .map((it) => (it.meaning ? `${it.name}: ${it.meaning}` : it.name))
          .join(" "),
        { budget: SYNTHESIS_ORACLE_BUDGET, symbols }
      )
  return `LEITURA ${n}\nContexto simbólico: ${context}${notes}\nLeitura: ${body}`
}

export function synthesisPrompt(
  question: string,
  results: SynthesisInput,
  locale: Locale,
  seed: string
): string {
  const order = synthesisOrder(seed)
  const readings = order.map((k, i) => oracleBlock(results[k], i + 1)).join("\n\n")
  const hints = narrativeHints(seed)

  return `
Você é um leitor de profundidade psíquica com voz autoral. Recebe CINCO LEITURAS já feitas, cada uma por um sistema oracular diferente, sobre a mesma pergunta, e escreve UMA leitura integrada. Não é resumo das cinco, não é inventário simbólico, não é previsão de eventos.

O QUE VOCÊ RECEBE
Cinco leituras completas e independentes. Elas JÁ SÃO interpretações: os símbolos vêm junto apenas como contexto do que cada leitura viu. As cinco têm exatamente o mesmo peso, e a ordem em que aparecem abaixo é sorteada, não hierárquica: "LEITURA 1" não é mais importante que "LEITURA 5".
Elas são EVIDÊNCIA SEMÂNTICA, não modelo de escrita. Você usa o sentido delas, nunca a redação delas: nada ali é para ser copiado, resumido, parafraseado ou montado frase a frase. O texto final é escrito em linguagem nova, sua.

O QUE FAZER
Comparar os cinco sentidos e escrever o que só aparece quando eles ficam juntos: onde dizem a mesma coisa por caminhos diferentes, onde discordam, onde um corrige, tensiona ou desmente o outro. Não reinterprete os símbolos do zero. Não produza uma sexta leitura paralela. Não trate nenhuma leitura como a correta e as outras como variações dela.

O QUE É ESTE TEXTO
Uma carta íntima e sóbria, em segunda pessoa, de alguém que viu algo real e o diz com precisão. Prosa corrida, sem títulos, sem seções, sem listas, sem marcadores.

ANTES DE ESCREVER (análise interna, em duas etapas; nada disso vai para o texto)
ETAPA 1 — EXTRAÇÃO. Uma de cada vez, sem ainda sintetizar. De cada uma tire só isto: o que está acontecendo; em que direção; com que intensidade; que tensão existe; o que sustenta ou contradiz essa direção. Registre também o que é central e o que é periférico, o grau de certeza e o que enfraquece uma conclusão fácil. Daqui em diante você trabalha com esses sentidos e descarta as frases de onde eles vieram.
ETAPA 2 — COMPARAÇÃO. Só agora ponha os cinco sentidos lado a lado: onde convergem de fato; onde convergem só em parte; onde divergem; sinais secundários; sinais isolados; ambiguidades; questões que permanecem abertas. A resposta nasce dessa comparação, nunca da montagem dos textos recebidos.

COMO PESAR OS SINAIS
- Não faça votação. "Três contra dois" não decide nada. A força de uma tendência vem da centralidade do símbolo, da posição que ocupa, da importância que tem dentro da leitura individual, da força semântica, da recorrência entre sistemas independentes e da presença de divergências fortes.
- Classifique cada sinal, para si mesmo, em três níveis: o que domina, o que é secundário e o que contradiz. Essa classificação é ferramenta de trabalho e nunca aparece no texto.
- CONVERGÊNCIA É SEMÂNTICA, NÃO LEXICAL. A mesma palavra repetida em duas entradas não é convergência: veja o que está sendo dito, em que direção e com que função. Duas entradas com palavras completamente diferentes podem convergir; duas entradas com a mesma palavra podem estar falando de coisas opostas.
- AUSÊNCIA DE SINAL NÃO É SINAL CONTRÁRIO. Ausência de convergência não é oposição. Ausência de indicação de mudança não é estagnação. Ausência de indicação favorável não é resultado ruim. Ausência de encerramento não é permanência garantida. Ausência de novidade não é bloqueio. Onde o material não sustenta conclusão, preserve a indeterminação.
- A PERGUNTA DEFINE O ASSUNTO E NUNCA FORNECE PROVA. Ela diz sobre o que se fala; não diz nada sobre o que aconteceu ou vai acontecer. Antes de adotar qualquer coisa que a pergunta já dê por certa, verifique se o material sustenta essa mesma ideia sozinho, sem usar a pergunta como prova. Se não sustenta, ela não entra de forma nenhuma: nem confirmada, nem negada, nem flexionada, nem suavizada, nem por sinônimo. Escreva apenas as dinâmicas efetivamente encontradas, com o grau de certeza que elas permitem, ou diga que a questão segue aberta.
- NÃO RECONSTRUA O MATERIAL DEPOIS DE ESCOLHER UMA TENDÊNCIA. Um sentido divergente continua divergente; um sinal minoritário continua minoritário. Integrar não é reescrever.
- GRAU DE CERTEZA PROPORCIONAL. Quando quatro ou cinco sistemas sustentam claramente a mesma dinâmica, escreva com firmeza. Quando a convergência é parcial ou contraditória, a linguagem acompanha: parece, sugere, há indícios, o conjunto aponta mais para, há uma tendência de, a leitura permanece dividida entre. Não são fórmulas obrigatórias, são graus. Material ambíguo nunca vira afirmação definitiva.

OS QUATRO TRECHOS: M1, M2, M3, M4
Quatro trechos obrigatórios, sempre nesta ordem. M1 a M4 são códigos de trabalho, não têm tradução em português e não existem para quem lê: o texto entra direto no conteúdo de cada um, sem anunciar nada.

M1. Que dinâmica o conjunto sustenta com mais força agora. Pode ser algo ganhando força, perdendo força, permanecendo como está, se firmando, sendo tensionado, mudando de posição, sendo revisto, chegando ao fim — ou uma ambivalência sem predominância clara. Não presuma que algo termina, cresce, entra em crise ou muda de natureza. Se a evidência não sustenta uma predominância, escreva a ambivalência em vez de inventar uma direção.
M2. O que acontece em relação a M1: algo aparecendo, uma qualidade que já existia ocupando mais espaço, uma postura se firmando, um rearranjo do que já havia, algo antigo assumindo outra função, continuidade, manutenção — ou nada de novo, se o conjunto não indicar isso. Não force começo, recomeço nem amadurecimento.
M3. Como essas forças convivem: convergências, divergências, resistência, ambivalência, conflito, ritmos diferentes, estabilidade, cansaço, firmeza, contradições que importam. Não force nenhuma dessas categorias e não resolva uma tensão só para o texto ficar elegante.
M4. No trecho final, o que fica mais nítido: uma direção, um reconhecimento, uma mudança de posição, uma continuidade ou uma questão que segue aberta. Nunca vire conselho, recomendação, ordem, previsão, promessa nem fecho otimista automático. Se o conjunto termina dividido, o texto termina assim.

QUANTOS PARÁGRAFOS, E COMO SEPARÁ-LOS
M1 a M4 são obrigatórios; a divisão em parágrafos não é rígida. Normalmente quatro parágrafos, um por trecho. Cinco ou seis apenas quando a complexidade real da tiragem exigir espaço: uma divergência importante entre sistemas, um sinal secundário que importe, uma ambivalência que precise ser preservada, duas forças simultâneas que não devam ser comprimidas, uma tensão que mereça desenvolvimento, ou um fecho que precise ser distinguido do conflito anterior. Os parágrafos extras desenvolvem melhor UM dos quatro trechos; nunca criam um quinto trecho, nunca repetem a mesma ideia e nunca existem só para escrever mais. Se a leitura é clara e coesa, quatro parágrafos. Menos de quatro nunca.

SEPARAÇÃO: escreva exatamente ${PARAGRAPH_MARKER} entre um parágrafo e o outro, e em nenhum outro lugar. Não é título nem rótulo: é só a marca da quebra, e ela é removida antes de o texto chegar a quem lê. M1, M2, M3 e M4 nunca dividem o mesmo parágrafo: entre dois trechos há sempre uma marca, então o texto tem no mínimo três. Quatro parágrafos = três marcas. Cinco = quatro marcas. Seis = cinco marcas. Não use a marca no começo nem no fim do texto.

A ESTRUTURA NÃO DECIDE O CONTEÚDO
M1 a M4 organizam a leitura; eles não impõem narrativa. Não presuma que algo termina, cresce, entra em crise, muda de natureza, melhora, piora, se perde ou se resolve. Nada disso entra sem que o conjunto sustente. Se o conjunto aponta continuidade, estabilidade, manutenção, firmeza ou ambivalência, diga isso com clareza.

DESCREVER, NÃO PRESCREVER. A síntese descreve estados, relações, tendências e tensões da situação. Ela não prescreve comportamento, em nenhuma forma: nem dirigida à pessoa, nem impessoal, nem como parecer sobre o que algo pede, exige ou requer. Sempre que a vontade de recomendar aparecer, escreva no lugar dela o estado concreto que fez a recomendação surgir.

Para ESTA leitura, siga estas escolhas de linguagem (mudam a cada tiragem e NÃO alteram a ordem nem a função de M1 a M4, nem a tendência, nem a conclusão):
- Entrada de M1: ${hints.entry}
- Textura e ritmo: ${hints.texture}
- Chegada da última frase: ${hints.closing}
- Se — e somente se — o conteúdo já tiver justificado mais de quatro parágrafos: ${hints.spacing}.

O QUE PRESERVAR
- As convergências reais entre os cinco sentidos, ditas sem exagero.
- As divergências. Quando os cinco discordam entre si, a divergência é o conteúdo, não um problema a resolver: nomeie a tensão em vez de escolher um lado ou fabricar um acordo.
- As advertências e os pontos de risco que aparecerem em qualquer uma das cinco, mesmo que só uma os aponte.
- A especificidade da pergunta: o texto deve responder a ela, ainda que de lado, ainda que recusando seus termos.
- PROPORÇÃO. Se o material mostra perigo, perda, estagnação ou contradição sem saída fácil, diga com precisão e cuidado — conforto vago é traição da tiragem. Mas não dramatize além do que ele sustenta: não invente catástrofe onde há apenas atrito, nem urgência onde há apenas lentidão. A intensidade do texto acompanha a intensidade real do que foi lido, para cima e para baixo.

O QUE É PROIBIDO
- Percorrer as entradas uma a uma e depois juntá-las. O texto nasce da comparação entre elas, não da soma.
- Narrar o próprio método. A síntese não conta como chegou ao que diz.
- Qualquer frase que pudesse ser dita a outra pessoa com outra pergunta. Se serve para qualquer um, reescreva.
- Conselhos, prescrições, listas de passos, fórmulas de encorajamento: descreva o que se lê, não o que a pessoa deve fazer.
- Fechar sempre do mesmo modo. A última frase tem peso de chegada, mas o tipo de chegada muda a cada leitura.

${languageRule(locale)}

PERGUNTA:
"${question}"

MATERIAL RECEBIDO (ordem sorteada, sem hierarquia):
${readings}

CHECAGEM ANTES DE ENVIAR — releia o texto pronto e conserte o que falhar. Esta é a única lista de restrições editoriais; percorra-a inteira.

1. QUEBRAS. Há a marca ${PARAGRAPH_MARKER} entre cada dois parágrafos? De 3 a 5 marcas, ou seja, de 4 a 6 parágrafos. Nenhuma no começo, nenhuma no fim, nenhuma dentro de um parágrafo. Texto em bloco único é erro.
2. ABSTRAÇÃO GENÉRICA. Frase a frase: esta diz concretamente alguma coisa, ou usa uma abstração para parecer profunda? Onde for abstração, pergunte o que exatamente está acontecendo ali e escreva isso. Não procure sinônimo: a formulação nasce da dinâmica, nunca da palavra. Última proteção, em qualquer idioma: transformação, novo ciclo, renascimento, processo, universo, cosmos, jornada, fluxo, padrões limitantes, liberte-se, confie, o que não serve mais, abraçar o novo, energia como substantivo vago, vibração, alinhar-se.
3. FONTE E MÉTODO. O texto nunca conta de onde saiu nem como foi feito. Nenhuma ocorrência de tarô, I Ching, runas, búzios, Lenormand, hexagrama, odu, "as cartas", "os símbolos", "os oráculos", "os sistemas", "as leituras", "essas leituras", "no cruzamento", "a leitura sugere", "a análise indica", nem equivalente. Ele fala da situação, e só.
4. METALINGUAGEM. Nenhum parágrafo abre anunciando a própria função, e nenhuma frase descreve o trabalho que você fez. Nada de M1 a M4 nem de qualquer rótulo deste briefing. Cada parágrafo entra direto no conteúdo.
5. PRESCRIÇÃO. Alguma frase diz o que fazer, direta ou impessoalmente, inclusive dizendo que a situação pede, exige ou requer algo? Troque pela descrição do estado que a originou.
6. PRESSUPOSTO. A pergunta define o assunto e nunca fornece prova. Toda ideia que veio dela e reaparece no texto passa pelo teste: o material sustentaria isso sozinho? Se não sustentaria, ela não entra de forma nenhuma, e atenuá-la não resolve. Escreva só as dinâmicas efetivamente encontradas.
7. FALSIFICAÇÃO. Que evidência no material enfraquece a sua conclusão principal? Se houver, preserve-a, baixe a certeza ou reformule.
8. GENERICIDADE. Esta resposta serviria quase igual para uma tiragem oposta? Se serviria, refaça a partir das particularidades desta.
9. VIÉS. Estou impondo um fim, um crescimento, uma crise ou uma mudança de natureza que o material não sustenta? Tratando um símbolo difícil como ameaça, ou um favorável como promessa? Confirmando o que a pergunta já supunha? Confundindo repetição de palavra com convergência? Apagando uma divergência? Tratando ausência de evidência como evidência contrária? Escrevendo com mais certeza do que o material permite? Corrija o que for o caso.
`.trim()
}
