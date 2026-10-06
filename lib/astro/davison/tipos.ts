/**
 * O repertório relacional extraído do Davison: os tipos, as categorias, e as
 * travas lexicais que a camada operacional tem de respeitar.
 *
 * FONTE → EXTRAÇÃO → PARÁFRASE CURTA E CONTROLADA → (futuramente) SÍNTESE.
 *
 * Este módulo descreve o formato. Os dados estão em `interaspectos.json` e
 * `overlays.json`, e o que existe neles é PARÁFRASE: o trecho literal do livro
 * nunca mora aqui. Ele fica em `data/fontes/davison/` (fora do repositório),
 * ligado a cada glosa por página, título e hash, e é só para auditoria interna.
 *
 * O QUE UMA GLOSA NÃO É. Não é interpretação final nem texto de tela: é o
 * material com o qual uma síntese futura trabalha. Por isso:
 *
 *  - FAVORÁVEL e ADVERSO são a classificação do livro, guardada como
 *    metadado. Não são bom e ruim: uma glosa favorável pode ter excessos, e
 *    uma adversa pode ter possibilidade de elaboração. Nada é inventado para
 *    equilibrar os dois lados: se a fonte não diz, o campo fica vazio.
 *  - A CONDIÇÃO NATAL (dignidade, aflição) é registrada como dependência, não
 *    como fato. O motor de sinastria não a calcula, e a glosa não a supõe.
 *  - O VÍNCULO não existe aqui. O repertório é neutro quanto a ele.
 *  - UMA DIMENSÃO só é atribuída quando o conteúdo de um núcleo ou de uma
 *    tensão a sustenta, e a glosa diz qual. Mercúrio não é "comunicação"
 *    por ser Mercúrio.
 */
import type { AspectoSinastria } from "../sinastria"

export type Corpo = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto"
export const CORPOS: readonly Corpo[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]

export const DIMENSOES = [
  "comunicacao",
  "afeto_intimidade",
  "acao_desejo",
  "sustentacao_compromisso",
  "expansao",
  "limites",
  "identidade",
  "emocional",
  "vida_pratica",
  "transformacao",
] as const
export type Dimensao = (typeof DIMENSOES)[number]

/**
 * O que cada dimensão quer dizer. É a régua para atribuir (e para auditar) uma
 * dimensão: o conteúdo da glosa tem de falar disto.
 */
export const DEFINICAO_DE_DIMENSAO: Record<Dimensao, string> = {
  comunicacao: "troca de ideias, linguagem, escuta, compreensão e mal-entendido entre as pessoas",
  afeto_intimidade: "afeição, atração, carinho, intimidade, confiança íntima, ciúme",
  acao_desejo: "iniciativa, desejo, assertividade, disputa, competição, conflito aberto",
  sustentacao_compromisso: "duração, lealdade, dever assumido, estabilidade, permanência do vínculo",
  expansao: "encorajamento, generosidade, crescimento, otimismo, ampliação, excesso",
  limites: "freio, cautela, restrição, crítica, controle, frustração por contenção",
  identidade: "senso de si, autoestima, orgulho, reconhecimento do valor do outro, liderança, autoexpressão",
  emocional: "sentimento, humor, sensibilidade, empatia, instinto, segurança afetiva, hábito",
  vida_pratica: "dinheiro, recursos, trabalho, rotina, serviço, casa, organização concreta",
  transformacao: "mudança profunda, crise, intensidade, ruptura, revelação, reavaliação, dissolução",
}

/** Por que um trecho do livro NÃO entrou na camada operacional. */
export const CATEGORIAS_DE_DESCARTE = [
  "genero",
  "papel_social",
  "karma",
  "destino",
  "prescricao",
  "previsao",
  "fatalismo",
  "juizo_moral",
  "diagnostico",
  "condicao_natal_nao_modelada",
  "exemplo_historico",
  "tecnica_fora_do_mvp",
  "fora_do_escopo",
] as const
export type CategoriaDeDescarte = (typeof CATEGORIAS_DE_DESCARTE)[number]

/** A obra, por extenso. Vai uma vez aqui, e cada glosa só carrega o identificador `livro`. */
export const OBRA_DAVISON = "Ronald C. Davison, Synastry: Understanding Human Relations Through Astrology"
/** O que se sabe da edição pelo arquivo: o ano, não a casa editorial. */
export const EDICAO_DAVISON = "1977; edição não identificada no arquivo"

/**
 * A rastreabilidade de uma glosa, e SÓ ela: qual obra, qual edição, qual
 * página, qual seção e o hash do trecho de onde saiu. Nenhum trecho literal do
 * livro mora aqui nem em lugar nenhum do repositório: o literal vive na
 * auditoria local, ao lado do PDF, e é conferido contra este hash.
 */
export type FonteRef = {
  livro: "davison-synastry"
  edicao: string
  natureza: "interaspecto" | "overlay" | "semelhanca"
  /** o título da leitura no livro: "Sun/Saturn", "Mars in the 5th" */
  secao: string
  pdfPaginaInicio: number
  pdfPaginaFim: number
  /** hash do texto normalizado da leitura, para provar de qual trecho a glosa saiu */
  hash: string
}

export type DimensaoSustentada = {
  categoria: Dimensao
  /** onde na própria glosa está o conteúdo que a sustenta: "nucleos:0", "tensoesPossiveis:1" */
  sustentadaPor: string[]
  justificativa: string
}

export type DescarteRegistrado = { categoria: CategoriaDeDescarte; motivo: string }

/**
 * DE ONDE VEM A DIVISÃO. O livro nem sempre separa favorável de adverso:
 *
 *  - `separada_pela_fonte`: o livro dá a leitura para o aspecto favorável e a
 *    outra para o adverso; `aplicaA` diz a quais dos nossos aspectos.
 *  - `leitura_geral`: o livro dá uma leitura do contato que vale para qualquer
 *    aspecto. Aplica-se a todos, e não é "favorável" nem "adversa".
 *  - `agrupada_por_tema`: o livro não separa, e quem estruturou agrupou o
 *    conteúdo em dois lados por tema. A divisão é EDITORIAL, não da fonte, e
 *    nenhum aspecto deve ser lido como favorável ou adverso por causa dela.
 *  - `condicao_natal`: a leitura vale quando um dos corpos está debilitado ou
 *    aflito no mapa natal, e não por causa de um aspecto. O motor não calcula
 *    essa condição, então a glosa não se aplica a nenhum aspecto (`aplicaA` vazio).
 *
 * É o que impede um rótulo editorial de passar por classificação do livro.
 */
export type OrigemDaValencia = "separada_pela_fonte" | "leitura_geral" | "agrupada_por_tema" | "condicao_natal"

export type Valencia = {
  /** como o livro chama esta valência, por extenso */
  classeOriginal: string
  origem: OrigemDaValencia
  /** quais dos nossos seis aspectos o livro aplica a esta valência (vazio só em `condicao_natal`) */
  aplicaA: AspectoSinastria[]
  nucleos: string[]
  tensoesPossiveis: string[]
  /** só quando a fonte diz que a facilidade pode ser excedida; nunca inventado */
  excessosPossiveis: string[]
  /** só quando a fonte diz que a dificuldade tem um caminho; nunca inventado */
  elaboracao: string[]
  dimensoes: DimensaoSustentada[]
}

export type Especifico = {
  aspecto: AspectoSinastria
  em: "favoravel" | "adverso" | "ambos"
  nucleos: string[]
  tensoesPossiveis: string[]
}

export type Dependencia = {
  /** de quem é a condição natal da qual a leitura depende */
  de: Corpo | "ambos" | "par"
  nota: string
}

export type GlosaDePar = {
  id: string
  corpos: [Corpo, Corpo]
  /** simétrico: os dois lados são tratados igual; assimétrico: cada corpo faz uma coisa */
  simetria: "simetrico" | "assimetrico"
  /** só quando assimétrico: o que cada corpo faz na interação */
  papeis: Partial<Record<Corpo, string>> | null
  favoravel: Valencia | null
  adverso: Valencia | null
  especificos: Especifico[]
  dependeDaCondicaoNatal: Dependencia[]
  /** de qual condição cada frase condicionada depende; a chave é a referência da frase */
  condicoesPorItem: Record<string, CondicaoDoItem>
  /** o que ficou de fora e que o leitor da glosa precisa saber */
  limitacoes: string[]
  descartes: DescarteRegistrado[]
  fonte: FonteRef
}

/**
 * De que depende uma frase da glosa. O livro condiciona quase toda tensão: "com
 * Saturno aflito e aspectos discordantes, ...". A frase fica como o livro a
 * condiciona (reescrevê-la sem a condição a faria parecer incondicional), e
 * este marcador diz de quê ela depende.
 *
 *  - `natal`: depende da condição natal (aflição, debilidade, dignidade) de um
 *    corpo. O motor de sinastria NÃO a calcula, então a frase não é aplicável
 *    como fato: só como possibilidade, e quem consome não deve tratá-la como
 *    algo que a relação tem.
 *  - `aspectos`: depende de aspectos difíceis entre os dois mapas, que o motor
 *    calcula. A frase só se aplica quando eles existem.
 */
export type CondicaoDoItem = { natal: boolean; aspectos: boolean }

export type CondicionanteDeOverlay = {
  tipo: "aspectos_entre_os_mapas" | "condicao_natal_do_planeta" | "tipo_de_relacao" | "idade_ou_contexto"
  nota: string
}

export type GlosaDeOverlay = {
  id: string
  /** o planeta é de quem o traz; a casa é de quem a tem. A direção nunca se inverte. */
  planeta: Corpo
  casa: number
  /** a função que o planeta introduz na vida de quem tem a casa */
  funcaoIntroduzida: string
  /** o campo da vida ativado, tal como esta leitura o recorta */
  campoAtivado: string
  facilidades: string[]
  tensoes: string[]
  excessosPossiveis: string[]
  dimensoes: Array<Omit<DimensaoSustentada, "sustentadaPor"> & { sustentadaPor: string[] }>
  condicionadoPor: CondicionanteDeOverlay[]
  /** de qual condição cada frase condicionada depende; a chave é a referência da frase */
  condicoesPorItem: Record<string, CondicaoDoItem>
  /** o reforço que o livro dá quando o planeta cai sobre o ângulo da casa; sem orbe */
  reforcoPorAngulo: string | null
  limitacoes: string[]
  descartes: DescarteRegistrado[]
  fonte: FonteRef
}

export type GlosaDeCasa = {
  casa: number
  /** o campo da vida da casa, em paráfrase curta */
  campo: string
  temas: string[]
  fonte: Omit<FonteRef, "natureza"> & { natureza: "definicao_de_casa" }
}

// ── as travas lexicais da camada operacional ─────────────────────────────────
//
// TRAVA AUXILIAR, não prova semântica. Pega o que dá para pegar por palavra e
// nada além: uma glosa pode violar o espírito sem usar nenhuma destas palavras.

// A fronteira de palavra é por lookaround com \p{L} e a flag u: o \b do JavaScript é ASCII e
// tratava "máscara" e "mágoas" como se contivessem "má", e deixava passar palavra
// banida que começa ou termina em letra acentuada.
export const PADROES_BANIDOS: Array<{ nome: string; regex: RegExp }> = [
  { nome: "gênero ou papel conjugal", regex: /(?<![\p{L}])(homem|homens|mulher|mulheres|marido|esposa|esposo|noiv[oa]s?|masculin\w*|feminin\w*|viril\w*|virilidade|ele|ela|eles|elas|dele|dela|deles|delas|pai|mãe|pais)(?![\p{L}])/iu },
  { nome: "karma, destino, vidas passadas", regex: /(k[aá]rm\w*|carma|(?<![\p{L}])destino(?![\p{L}])|encarna\w*|vidas? (passadas?|anteriores?)|(?<![\p{L}])deus(?![\p{L}])|divin\w*|(?<![\p{L}])alma(?![\p{L}])|almas)/iu },
  { nome: "previsão de casamento, separação, descendência, morte", regex: /(?<![\p{L}])(casamento|casar|casam|matrimôni\w*|div[óo]rcio|f[ée]rtil\w*|fecund\w*|est[ée]ril\w*|gravidez|morte|morrer|falec\w*|viúv\w*)(?![\p{L}])/iu },
  { nome: "prescrição de conduta", regex: /(?<![\p{L}])(deve|devem|deveria|deveriam|devia|precisa|precisam|é preciso|é necessário|convém|aconselh\w*|recomend\w*|sugere|sugerem|tente|evite|procure|vale a pena|o melhor é|seria melhor)(?![\p{L}])/iu },
  { nome: "futuro e fatalismo", regex: /(?<![\p{L}])(vai|vão|irá|irão|terá|terão|acabará|terminará|inevit[áa]ve\w*|fatal\w*|condenad\w*|fadad\w*|garante\w*|garantia|certamente|infalível)(?![\p{L}])/iu },
  { nome: "julgamento moral ou de valor", regex: /(?<![\p{L}])(culp\w*|pecado|v[íi]cio|imoral|imorais|ilegal|ilegais|criminos\w*|cruel|cruéis|mal[ée]fic\w*|ben[ée]fic\w*|mau|má|maus|más|ruim|ruins|bom|boa|bons|boas|positiv\w*|negativ\w*|pior|melhor)(?![\p{L}])/iu },
  { nome: "diagnóstico psicológico ou clínico", regex: /(neur[óo]tic\w*|paranoi\w*|psic[óo]tic\w*|doen[çc]a\w*|patolog\w*|transtorno\w*|depress\w*|ansiedade|fobia\w*|esquizo\w*|complexo de inferioridade|doente|sa[úu]de mental)/iu },
]

/** O teto de itens por lista foi 6 e truncou conteúdo sustentado (moon@casa1 e outros); 10 é o que as leituras mais longas do livro pedem. */
export const LIMITES_DE_TEXTO = { min: 12, max: 240, maxItens: 10 }

// ── semelhanças: os pontos em comum, com material do livro ──────────────────

export type DimensaoDeSemelhanca = "elemento" | "modo" | "elemento_do_sol" | "signo_do_corpo" | "semelhanca_geral"

/**
 * Material interpretativo para uma semelhança que o motor já calculou. É a
 * mesma ideia das outras glosas: parafraseado, curto, com a fonte ligada por
 * página, título e hash, e sem nenhum trecho literal no repositório.
 *
 * O QUE A FONTE SUSTENTA, e o que não:
 *  - `elemento` e `modo`: o livro tem uma leitura para cada par de elementos
 *    dominantes (10) e de modos dominantes (6), p. 42 a 50;
 *  - `elemento_do_sol`: só para Sóis no MESMO elemento (p. 39);
 *  - `signo_do_corpo`: só para Lua e para os planetas pessoais (Sol, Mercúrio,
 *    Vênus, Marte), p. 30. Júpiter e Saturno não são nomeados, e os lentos
 *    (Urano, Netuno, Plutão) são a geração, não a relação;
 *  - `semelhanca_geral`: as ressalvas do livro sobre semelhança demais.
 *
 * Semelhança não é facilidade. A glosa guarda como `ressalvas` só o que o livro
 * diz que limita a leitura, e não inventa um lado positivo ou negativo por
 * simetria: se o livro não diz, o campo fica vazio.
 */
/**
 * O núcleo operacional: o mínimo da glosa completa que a síntese precisa para
 * entender a dinâmica, em poucas frases fiéis. A glosa completa continua sendo o
 * material de auditoria e o que o prompt recebe é o núcleo. Cada frase diz de
 * quais frases da glosa completa ela é condensação (`deRefs`), e não traz nada
 * que a glosa não tenha: o tamanho da glosa não pode decidir se a semelhança
 * chega à síntese.
 */
export type NucleoOperacional = { texto: string; deRefs: string[] }

/** Limites do núcleo operacional, em caracteres (cerca de 3,6 por token). */
export const LIMITES_OPERACIONAIS = { item: 200, total: 400, ressalva: 230 } as const

export type GlosaDeSemelhanca = {
  id: string
  dimensao: DimensaoDeSemelhanca
  /** o valor da leitura: "earth|fire", "cardinal|fixed", ou o id nas gerais */
  valor: string
  /** a que fatos a leitura se aplica, quando ela não vale para todos da dimensão */
  aplicaA: { tipos: string[]; corpos: string[] }
  simetria: "simetrico" | "assimetrico"
  /** só quando assimétrico: o que cada valor faz (chaves: os valores do par) */
  papeis: Record<string, string> | null
  nucleos: string[]
  tensoesPossiveis: string[]
  /** o que o livro diz que limita a leitura (semelhança não é facilidade, depende de outros fatores) */
  ressalvas: string[]
  /** leituras só de alguns corpos (a Lua, em `signo_do_corpo`) */
  especificos: Array<{ corpos: string[]; nucleos: string[]; ressalvas: string[] }>
  /** o que o prompt recebe no lugar da glosa completa (todas as glosas, menos `semelhanca_geral`) */
  nucleoOperacional: NucleoOperacional[]
  /** o equivalente para as leituras de alguns corpos */
  nucleoOperacionalEspecifico?: Array<NucleoOperacional & { corpos: string[] }>
  /** só em `semelhanca_geral`: a ressalva curta, usada no máximo uma vez por leitura */
  ressalvaOperacional?: NucleoOperacional
  dependeDaCondicaoNatal: Dependencia[]
  condicoesPorItem: Record<string, CondicaoDoItem>
  limitacoes: string[]
  descartes: DescarteRegistrado[]
  fonte: FonteRef
}
