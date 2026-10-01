/**
 * O repertório simbólico da Home: um atlas pequeno, curado à mão.
 *
 * NADA AQUI É GERADO. Cada entrada foi escrita com o livro aberto, e a fonte
 * não é enfeite: é o que separa esta peça de um dicionário pop de sonhos. Por
 * isso cada símbolo declara de onde vem, em que página, e — o mais importante —
 * QUEM ESCREVEU AQUILO.
 *
 * "O Homem e seus Símbolos" tem cinco autores, e só o primeiro capítulo é de
 * Jung. Henderson, von Franz, Jaffé e Jacobi escreveram os outros. Atribuir
 * tudo a "Jung" seria falso, e é o erro mais fácil de cometer aqui: das dez
 * entradas abaixo, quatro são dele e seis não são.
 *
 * O QUE ESTE ARQUIVO NÃO FAZ, e é deliberado:
 *
 *  - não diz que um símbolo SIGNIFICA alguma coisa. O arquétipo não é a imagem.
 *    Uma serpente, uma casa ou uma árvore podem carregar conteúdo arquetípico,
 *    e nenhuma delas equivale a um arquétipo fixo. Todo texto daqui fala em
 *    "pode evocar", "uma associação possível", nunca em "significa que";
 *  - não inventa tradução. A edição que temos é em português, então a citação
 *    literal só existe em `pt`. Em inglês e espanhol o card mostra a leitura
 *    editorial e a referência da obra, sem pôr na boca de ninguém uma frase que
 *    aquela pessoa não escreveu naquele idioma;
 *  - não fala do dia da pessoa. É uma imagem para explorar, e não o arquétipo
 *    de ninguém hoje.
 *
 * O sorteio é determinístico pela data: o mesmo símbolo para todo mundo naquele
 * dia, sem API, sem espera e sem custo. Com dez entradas o ciclo é de dez dias;
 * crescer o repertório é acrescentar entradas aqui, e nada mais.
 */
import type { Locale } from "@/lib/i18n/config"

/** De onde a associação vem, dito sem eufemismo. */
export type BaseDaAssociacao =
  /** a fonte sustenta isto diretamente, e a citação está aqui */
  | "fonte"
  /** leitura editorial nossa, apoiada na fonte mas não escrita nela */
  | "editorial"
  /** associação cultural corrente, que não vem da psicologia analítica */
  | "cultural"

export type Fonte = {
  obra: string
  /** o autor DAQUELE CAPÍTULO, não o do volume */
  autor: string
  pagina: number
  /** citação literal, no idioma da edição que temos. Curta de propósito. */
  trecho: string
}

export type TextoDoSimbolo = {
  nome: string
  /** três palavras-âncora, separadas por · na tela */
  ancoras: [string, string, string]
  /** a leitura, sempre hipotética */
  leitura: string
}

export type SimboloInconsciente = {
  id: string
  base: BaseDaAssociacao
  /** nulo quando a entrada é editorial ou cultural: aí não há o que citar */
  fonte: Fonte | null
  texto: Record<Locale, TextoDoSimbolo>
}

const OBRA = "O Homem e seus Símbolos"

export const SIMBOLOS: SimboloInconsciente[] = [
  {
    id: "sombra",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "C. G. Jung",
      pagina: 90,
      trecho: "os aspectos inconscientes do seu caráter projetavam uma “sombra” muito parecida com a outra mulher",
    },
    texto: {
      pt: {
        nome: "A Sombra",
        ancoras: ["projeção", "o que não se reconhece", "atrito"],
        leitura:
          "Numa leitura junguiana, a sombra pode aparecer menos como um lado ruim e mais como aquilo que reconhecemos primeiro nos outros. A figura que incomoda num sonho pode estar mais perto de casa do que parece.",
      },
      en: {
        nome: "The Shadow",
        ancoras: ["projection", "what goes unrecognized", "friction"],
        leitura:
          "In a Jungian reading, the shadow may appear less as a bad side and more as what we recognize first in other people. The figure that irritates in a dream may be closer to home than it looks.",
      },
      es: {
        nome: "La Sombra",
        ancoras: ["proyección", "lo que no se reconoce", "roce"],
        leitura:
          "En una lectura junguiana, la sombra puede aparecer menos como un lado malo y más como aquello que reconocemos primero en los demás. La figura que molesta en un sueño puede estar más cerca de casa de lo que parece.",
      },
    },
  },
  {
    id: "casa",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "C. G. Jung",
      pagina: 73,
      trecho:
        "A casa, certamente, era o símbolo da minha personalidade e do seu campo consciente de interesses; e a ala desconhecida da residência representava a antecipação de um novo campo de interesse",
    },
    texto: {
      pt: {
        nome: "A Casa",
        ancoras: ["interioridade", "cômodos que não se abrem", "antecipação"],
        leitura:
          "Jung contou um sonho seu em que a casa era a própria personalidade, e uma ala desconhecida anunciava um interesse que ele ainda não tinha. O que a casa contém e como você se move por ela muda a leitura inteira.",
      },
      en: {
        nome: "The House",
        ancoras: ["inwardness", "rooms that stay shut", "anticipation"],
        leitura:
          "Jung recounted a dream of his own in which the house was his personality, and an unknown wing announced an interest he did not yet have. What the house holds, and how you move through it, changes the whole reading.",
      },
      es: {
        nome: "La Casa",
        ancoras: ["interioridad", "cuartos que no se abren", "anticipación"],
        leitura:
          "Jung contó un sueño suyo en el que la casa era su propia personalidad, y un ala desconocida anunciaba un interés que aún no tenía. Lo que la casa contiene y cómo te mueves por ella cambia la lectura entera.",
      },
    },
  },
  {
    id: "serpente",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "C. G. Jung",
      pagina: 115,
      trecho: "uma serpente (símbolo do deus) morde o ombro doente de um homem e o deus o cura",
    },
    texto: {
      pt: {
        nome: "A Serpente",
        ancoras: ["cura", "o que morde", "renovação"],
        leitura:
          "Na Grécia, os doentes pediam a Esculápio um sonho que indicasse a cura, e a serpente era o símbolo do deus. A imagem pode evocar menos ameaça do que costuma sugerir hoje.",
      },
      en: {
        nome: "The Serpent",
        ancoras: ["healing", "what bites", "renewal"],
        leitura:
          "In Greece the sick asked Asclepius for a dream that would point to the cure, and the serpent was the god's own sign. The image may evoke far less threat than it tends to suggest today.",
      },
      es: {
        nome: "La Serpiente",
        ancoras: ["curación", "lo que muerde", "renovación"],
        leitura:
          "En Grecia los enfermos pedían a Esculapio un sueño que indicara la cura, y la serpiente era el símbolo del dios. La imagen puede evocar mucha menos amenaza de la que suele sugerir hoy.",
      },
    },
  },
  {
    id: "mae-grande",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "C. G. Jung",
      pagina: 144,
      trecho:
        "a imagem primitiva da matéria — a Mãe Grande — que podia conter e expressar todo o profundo sentido emocional da Mãe Terra",
    },
    texto: {
      pt: {
        nome: "A Mãe Grande",
        ancoras: ["o que contém", "matéria", "terra"],
        leitura:
          "Jung opõe o conceito seco de matéria à imagem que o antecedeu. Como figura, ela pode tocar tanto o que acolhe quanto o que não deixa sair — e as duas coisas costumam vir juntas.",
      },
      en: {
        nome: "The Great Mother",
        ancoras: ["what contains", "matter", "earth"],
        leitura:
          "Jung sets the dry concept of matter against the image that came before it. As a figure she may touch both what shelters and what will not let go, and the two usually arrive together.",
      },
      es: {
        nome: "La Gran Madre",
        ancoras: ["lo que contiene", "materia", "tierra"],
        leitura:
          "Jung opone el concepto seco de materia a la imagen que lo precedió. Como figura puede tocar tanto lo que acoge como lo que no deja salir, y las dos cosas suelen venir juntas.",
      },
    },
  },
  {
    id: "caverna",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "Joseph L. Henderson",
      pagina: 234,
      trecho:
        "ela estava começando a experimentar uma profunda transformação psíquica, emergindo desta “morte” para um novo tipo de vida",
    },
    texto: {
      pt: {
        nome: "A Caverna",
        ancoras: ["recolhimento", "morte simbólica", "passagem"],
        leitura:
          "Henderson descreve o sonho de uma caverna mortuária como o começo de uma transformação, e não como um fim. Descer não é necessariamente perder.",
      },
      en: {
        nome: "The Cave",
        ancoras: ["retreat", "symbolic death", "passage"],
        leitura:
          "Henderson describes a dream of a burial cave as the beginning of a transformation rather than an ending. Going down is not necessarily losing.",
      },
      es: {
        nome: "La Caverna",
        ancoras: ["recogimiento", "muerte simbólica", "pasaje"],
        leitura:
          "Henderson describe el sueño de una caverna mortuoria como el comienzo de una transformación, y no como un final. Bajar no es necesariamente perder.",
      },
    },
  },
  {
    id: "arvore",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "Joseph L. Henderson",
      pagina: 243,
      trecho:
        "uma árvore ou uma planta antigas representam, simbolicamente, o crescimento e o desenvolvimento da vida psíquica (enquanto a vida instintiva é em geral simbolizada por animais)",
    },
    texto: {
      pt: {
        nome: "A Árvore",
        ancoras: ["crescimento", "raiz", "tempo lento"],
        leitura:
          "A distinção importa: onde o animal costuma figurar o instinto, a planta antiga figura o crescimento — que é outra coisa, e acontece em outro ritmo.",
      },
      en: {
        nome: "The Tree",
        ancoras: ["growth", "root", "slow time"],
        leitura:
          "The distinction matters: where the animal tends to figure instinct, the ancient plant figures growth, which is a different thing and happens at a different pace.",
      },
      es: {
        nome: "El Árbol",
        ancoras: ["crecimiento", "raíz", "tiempo lento"],
        leitura:
          "La distinción importa: donde el animal suele figurar el instinto, la planta antigua figura el crecimiento, que es otra cosa y ocurre a otro ritmo.",
      },
    },
  },
  {
    id: "heroi",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "Joseph L. Henderson",
      pagina: 169,
      trecho:
        "sua luta triunfante contra as forças do mal, sua falibilidade ante a tentação do orgulho (hybris) e seu declínio",
    },
    texto: {
      pt: {
        nome: "O Herói",
        ancoras: ["subida", "hybris", "queda"],
        leitura:
          "O ciclo que Henderson descreve não termina na vitória: a falibilidade diante do orgulho faz parte da figura. Uma imagem heroica num sonho pode estar apontando para a queda, e não para a conquista.",
      },
      en: {
        nome: "The Hero",
        ancoras: ["ascent", "hybris", "fall"],
        leitura:
          "The cycle Henderson describes does not end in victory: fallibility before pride belongs to the figure. A heroic image in a dream may be pointing at the fall rather than the conquest.",
      },
      es: {
        nome: "El Héroe",
        ancoras: ["ascenso", "hybris", "caída"],
        leitura:
          "El ciclo que Henderson describe no termina en la victoria: la falibilidad ante el orgullo forma parte de la figura. Una imagen heroica en un sueño puede estar señalando la caída, y no la conquista.",
      },
    },
  },
  {
    id: "pedra",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "M.-L. von Franz",
      pagina: 342,
      trecho: "o polimento que dão às pedras redondas (a pedra redonda é símbolo do self)",
    },
    texto: {
      pt: {
        nome: "A Pedra",
        ancoras: ["dureza", "polimento", "si-mesmo"],
        leitura:
          "Von Franz lê o polimento da pedra redonda como o trabalho de individuação em imagem. O que resiste e o que se desgasta contam a mesma história.",
      },
      en: {
        nome: "The Stone",
        ancoras: ["hardness", "polishing", "the self"],
        leitura:
          "Von Franz reads the polishing of the round stone as the work of individuation made image. What resists and what wears down tell the same story.",
      },
      es: {
        nome: "La Piedra",
        ancoras: ["dureza", "pulido", "sí-mismo"],
        leitura:
          "Von Franz lee el pulido de la piedra redonda como el trabajo de individuación hecho imagen. Lo que resiste y lo que se desgasta cuentan la misma historia.",
      },
    },
  },
  {
    id: "circulo",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "Aniela Jaffé",
      pagina: 406,
      trecho:
        "o círculo (ou esfera) como um símbolo do self: ele expressa a totalidade da psique em todos os seus aspectos, incluindo o relacionamento entre o homem e a natureza",
    },
    texto: {
      pt: {
        nome: "O Círculo",
        ancoras: ["totalidade", "centro", "sem começo"],
        leitura:
          "Jaffé percorre o círculo do culto solar antigo às mandalas tibetanas e à planta das cidades. A forma reaparece em contextos que não se conhecem entre si.",
      },
      en: {
        nome: "The Circle",
        ancoras: ["wholeness", "centre", "no beginning"],
        leitura:
          "Jaffé follows the circle from ancient sun worship to Tibetan mandalas and city plans. The form reappears in contexts that never met one another.",
      },
      es: {
        nome: "El Círculo",
        ancoras: ["totalidad", "centro", "sin comienzo"],
        leitura:
          "Jaffé recorre el círculo desde el culto solar antiguo hasta las mandalas tibetanas y el trazado de las ciudades. La forma reaparece en contextos que no se conocen entre sí.",
      },
    },
  },
  {
    id: "animal",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "Aniela Jaffé",
      pagina: 403,
      trecho: "O animal em si não é bom nem mau; é parte da natureza e não pode desejar nada que não pertença a ela",
    },
    texto: {
      pt: {
        nome: "O Animal",
        ancoras: ["instinto", "nem bom nem mau", "integração"],
        leitura:
          "A frase desarma a leitura moral do bicho que aparece no sonho. O que Jaffé põe em jogo não é o que ele quer dizer, mas o que se faz com o instinto que ele figura.",
      },
      en: {
        nome: "The Animal",
        ancoras: ["instinct", "neither good nor bad", "integration"],
        leitura:
          "The sentence disarms any moral reading of the creature that shows up in a dream. What Jaffé puts at stake is not what it means, but what one does with the instinct it figures.",
      },
      es: {
        nome: "El Animal",
        ancoras: ["instinto", "ni bueno ni malo", "integración"],
        leitura:
          "La frase desarma la lectura moral del animal que aparece en el sueño. Lo que Jaffé pone en juego no es lo que quiere decir, sino qué se hace con el instinto que figura.",
      },
    },
  },
  {
    id: "animus",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "M.-L. von Franz",
      pagina: 307,
      trecho:
        "a personificação masculina do inconsciente na mulher, o animus, apresenta, tal como a anima no homem, aspectos positivos e negativos",
    },
    texto: {
      pt: { nome: "O Animus", ancoras: ["convicção", "voz interna", "os dois lados"], leitura: "Von Franz nota que ele raramente chega como fantasia, e mais como uma convicção secreta que se defende com voz firme. A figura pode evocar tanto a que sustenta quanto a que endurece." },
      en: { nome: "The Animus", ancoras: ["conviction", "inner voice", "both sides"], leitura: "Von Franz notes that it rarely arrives as fantasy, and more often as a secret conviction defended in a firm voice. The figure may evoke both what upholds and what hardens." },
      es: { nome: "El Animus", ancoras: ["convicción", "voz interna", "los dos lados"], leitura: "Von Franz nota que rara vez llega como fantasía, y más como una convicción secreta que se defiende con voz firme. La figura puede evocar tanto lo que sostiene como lo que endurece." },
    },
  },
  {
    id: "trickster",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "Joseph L. Henderson",
      pagina: 172,
      trecho:
        "Trickster é um personagem dominado por seus desejos",
    },
    texto: {
      pt: { nome: "O Embusteiro", ancoras: ["impulso", "o mais antigo", "riso"], leitura: "Henderson o põe no primeiro ciclo do mito do herói, o mais primitivo. Como imagem, pode evocar menos malícia do que apetite sem freio, que é outra coisa." },
      en: { nome: "The Trickster", ancoras: ["impulse", "the oldest", "laughter"], leitura: "Henderson places him in the first cycle of the hero myth, the most primitive one. As an image he may evoke less malice than unbridled appetite, which is another thing." },
      es: { nome: "El Embustero", ancoras: ["impulso", "el más antiguo", "risa"], leitura: "Henderson lo ubica en el primer ciclo del mito del héroe, el más primitivo. Como imagen puede evocar menos malicia que apetito sin freno, que es otra cosa." },
    },
  },
  {
    id: "morte",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "C. G. Jung",
      pagina: 110,
      trecho:
        "símbolos da criação, da morte e do renascimento, lembrando os ensinamentos ministrados aos adolescentes nos ritos primitivos de iniciação",
    },
    texto: {
      pt: { nome: "A Morte", ancoras: ["iniciação", "fim de uma forma", "renascimento"], leitura: "Jung lê os três juntos, e não em oposição. Numa leitura junguiana a imagem pode tocar o fim de uma forma de viver, e não o fim de uma vida." },
      en: { nome: "Death", ancoras: ["initiation", "end of a form", "rebirth"], leitura: "Jung reads the three together rather than in opposition. In a Jungian reading the image may touch the end of a way of living, not the end of a life." },
      es: { nome: "La Muerte", ancoras: ["iniciación", "fin de una forma", "renacimiento"], leitura: "Jung lee los tres juntos, y no en oposición. En una lectura junguiana la imagen puede tocar el fin de una forma de vivir, y no el fin de una vida." },
    },
  },
  {
    id: "montanha",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "Aniela Jaffé",
      pagina: 497,
      trecho:
        "a montanha muitas vezes simboliza um lugar de revelação, onde se produzem mudanças",
    },
    texto: {
      pt: { nome: "A Montanha", ancoras: ["subida", "distância", "revelação"], leitura: "O que a subida custa faz parte da imagem: ver de longe exige sair de onde se estava. Pode evocar a clareza que só aparece com afastamento." },
      en: { nome: "The Mountain", ancoras: ["ascent", "distance", "revelation"], leitura: "What the climb costs belongs to the image: seeing from afar means leaving where one stood. It may evoke the clarity that only shows up with distance." },
      es: { nome: "La Montaña", ancoras: ["subida", "distancia", "revelación"], leitura: "Lo que cuesta la subida forma parte de la imagen: ver de lejos exige salir de donde se estaba. Puede evocar la claridad que solo aparece con distancia." },
    },
  },
  {
    id: "mandala",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "M.-L. von Franz",
      pagina: 362,
      trecho:
        "a forma redonda (o motivo da mandala) quase sempre simboliza uma totalidade natural, enquanto a forma quadrangular representa a tomada de consciência dessa totalidade",
    },
    texto: {
      pt: { nome: "A Mandala", ancoras: ["centro", "redondo e quadrado", "ordem"], leitura: "A distinção é fina e muda tudo: o redondo é a totalidade que já existe, o quadrado é ela sendo percebida. Uma não substitui a outra." },
      en: { nome: "The Mandala", ancoras: ["centre", "round and square", "order"], leitura: "The distinction is fine and changes everything: the round is the wholeness that already exists, the square is that wholeness being noticed. One does not replace the other." },
      es: { nome: "El Mandala", ancoras: ["centro", "redondo y cuadrado", "orden"], leitura: "La distinción es fina y lo cambia todo: lo redondo es la totalidad que ya existe, lo cuadrado es ella siendo percibida. Una no sustituye a la otra." },
    },
  },
  {
    id: "rio",
    base: "fonte",
    fonte: {
      obra: OBRA,
      autor: "M.-L. von Franz",
      pagina: 369,
      trecho:
        "Quando chegou ao meio do rio, parecia-lhe que carregava o universo inteiro",
    },
    texto: {
      pt: { nome: "O Rio", ancoras: ["travessia", "peso no meio", "corrente"], leitura: "Na lenda de São Cristóvão, o fardo fica mais pesado justamente no meio da travessia. A imagem pode evocar o ponto em que voltar já custa tanto quanto seguir." },
      en: { nome: "The River", ancoras: ["crossing", "weight midway", "current"], leitura: "In the legend of Saint Christopher the burden grows heaviest exactly midstream. The image may evoke the point where turning back costs as much as going on." },
      es: { nome: "El Río", ancoras: ["travesía", "peso en medio", "corriente"], leitura: "En la leyenda de San Cristóbal la carga se vuelve más pesada justo en medio de la travesía. La imagen puede evocar el punto en que volver ya cuesta tanto como seguir." },
    },
  },
  {
    id: "espelho",
    base: "editorial",
    fonte: null,
    texto: {
      pt: { nome: "O Espelho", ancoras: ["reflexo", "o que devolve", "reconhecer-se"], leitura: "No imaginário, o espelho costuma aparecer menos para mostrar do que para devolver. Uma associação possível é a diferença entre a imagem que se tem e a que se encontra." },
      en: { nome: "The Mirror", ancoras: ["reflection", "what returns", "recognising oneself"], leitura: "In the imagination the mirror tends to appear less to show than to return. One possible association is the gap between the image one holds and the one that is found." },
      es: { nome: "El Espejo", ancoras: ["reflejo", "lo que devuelve", "reconocerse"], leitura: "En el imaginario, el espejo suele aparecer menos para mostrar que para devolver. Una asociación posible es la diferencia entre la imagen que se tiene y la que se encuentra." },
    },
  },
  {
    id: "porta",
    base: "editorial",
    fonte: null,
    texto: {
      pt: { nome: "A Porta", ancoras: ["limiar", "dos dois lados", "decisão"], leitura: "Uma porta não é passagem ainda: é a possibilidade dela. No imaginário, pode se aproximar do momento anterior à escolha, que costuma durar mais do que a escolha." },
      en: { nome: "The Door", ancoras: ["threshold", "both sides", "decision"], leitura: "A door is not yet a passage: it is the possibility of one. In the imagination it may come close to the moment before a choice, which usually lasts longer than the choice." },
      es: { nome: "La Puerta", ancoras: ["umbral", "de los dos lados", "decisión"], leitura: "Una puerta todavía no es un pasaje: es su posibilidad. En el imaginario puede acercarse al momento anterior a la elección, que suele durar más que la elección." },
    },
  },
  {
    id: "chave",
    base: "editorial",
    fonte: null,
    texto: {
      pt: { nome: "A Chave", ancoras: ["acesso", "o que estava fechado", "quem guarda"], leitura: "A chave carrega uma pergunta que a porta não faz: quem a tem. Uma associação possível é menos o que se abre e mais de quem depende abrir." },
      en: { nome: "The Key", ancoras: ["access", "what was locked", "who keeps it"], leitura: "The key carries a question the door does not ask: who holds it. One possible association is less about what opens and more about on whom the opening depends." },
      es: { nome: "La Llave", ancoras: ["acceso", "lo que estaba cerrado", "quién la guarda"], leitura: "La llave carga una pregunta que la puerta no hace: quién la tiene. Una asociación posible es menos lo que se abre y más de quién depende abrir." },
    },
  },
  {
    id: "ponte",
    base: "editorial",
    fonte: null,
    texto: {
      pt: { nome: "A Ponte", ancoras: ["ligação", "vão embaixo", "meio caminho"], leitura: "Ponte é a única forma de estar nos dois lugares sem estar em nenhum. No imaginário, pode evocar o intervalo entre deixar e chegar." },
      en: { nome: "The Bridge", ancoras: ["link", "the gap below", "halfway"], leitura: "A bridge is the one way to be in both places while being in neither. In the imagination it may evoke the interval between leaving and arriving." },
      es: { nome: "El Puente", ancoras: ["enlace", "el vacío debajo", "a medio camino"], leitura: "Un puente es la única forma de estar en los dos lugares sin estar en ninguno. En el imaginario puede evocar el intervalo entre salir y llegar." },
    },
  },
  {
    id: "escada",
    base: "editorial",
    fonte: null,
    texto: {
      pt: { nome: "A Escada", ancoras: ["degraus", "uma direção", "esforço"], leitura: "A escada impõe ordem ao movimento: não se pula de um degrau ao quinto. Uma associação possível é o que só se alcança em etapas, com o tempo que elas pedem." },
      en: { nome: "The Stairway", ancoras: ["steps", "one direction", "effort"], leitura: "A stairway imposes order on movement: one does not jump from the first step to the fifth. One possible association is what can only be reached in stages, at the pace they ask for." },
      es: { nome: "La Escalera", ancoras: ["peldaños", "una dirección", "esfuerzo"], leitura: "La escalera impone orden al movimiento: no se salta de un peldaño al quinto. Una asociación posible es lo que solo se alcanza por etapas, con el tiempo que piden." },
    },
  },
  {
    id: "labirinto",
    base: "editorial",
    fonte: null,
    texto: {
      pt: { nome: "O Labirinto", ancoras: ["caminho único", "sem atalho", "centro"], leitura: "Ao contrário do que se diz, um labirinto clássico não tem bifurcação: tem um caminho só, longo. No imaginário, pode se aproximar da sensação de estar perdido dentro de um percurso que existe." },
      en: { nome: "The Labyrinth", ancoras: ["a single path", "no shortcut", "centre"], leitura: "Contrary to what is often said, a classical labyrinth has no forks: it has one long path. In the imagination it may come close to feeling lost inside a route that does exist." },
      es: { nome: "El Laberinto", ancoras: ["camino único", "sin atajo", "centro"], leitura: "Al contrario de lo que se dice, un laberinto clásico no tiene bifurcaciones: tiene un solo camino, largo. En el imaginario puede acercarse a la sensación de estar perdido dentro de un recorrido que existe." },
    },
  },
  {
    id: "jardim",
    base: "editorial",
    fonte: null,
    texto: {
      pt: { nome: "O Jardim", ancoras: ["cuidado", "cercado", "o que se cultiva"], leitura: "Jardim é natureza com limite e com mão dentro. Uma associação possível é aquilo que só continua existindo porque alguém volta para cuidar." },
      en: { nome: "The Garden", ancoras: ["care", "enclosed", "what is tended"], leitura: "A garden is nature with a boundary and a hand inside it. One possible association is what only goes on existing because someone comes back to tend it." },
      es: { nome: "El Jardín", ancoras: ["cuidado", "cercado", "lo que se cultiva"], leitura: "Un jardín es naturaleza con límite y con mano dentro. Una asociación posible es aquello que solo sigue existiendo porque alguien vuelve a cuidarlo." },
    },
  },
  {
    id: "mascara",
    base: "editorial",
    fonte: null,
    texto: {
      pt: { nome: "A Máscara", ancoras: ["o rosto de fora", "papel", "o que cobre"], leitura: "Máscara não é só disfarce: em muitas tradições ela é o que permite falar. No imaginário, pode evocar tanto o que se esconde quanto o que só se diz por trás dela." },
      en: { nome: "The Mask", ancoras: ["the outward face", "role", "what it covers"], leitura: "A mask is not only a disguise: in many traditions it is what makes speech possible. In the imagination it may evoke both what hides and what can only be said from behind it." },
      es: { nome: "La Máscara", ancoras: ["el rostro de fuera", "papel", "lo que cubre"], leitura: "La máscara no es solo disfraz: en muchas tradiciones es lo que permite hablar. En el imaginario puede evocar tanto lo que se esconde como lo que solo se dice detrás de ella." },
    },
  },
  {
    id: "lobo",
    base: "editorial",
    fonte: null,
    texto: {
      pt: { nome: "O Lobo", ancoras: ["fome", "matilha", "o que ronda"], leitura: "O lobo aparece com frequência na borda: fora da casa, à volta do fogo. Uma associação possível é o que se mantém por perto sem entrar, e que não deixa de estar ali." },
      en: { nome: "The Wolf", ancoras: ["hunger", "the pack", "what circles"], leitura: "The wolf tends to appear at the edge: outside the house, around the fire. One possible association is what stays close without coming in, and does not stop being there." },
      es: { nome: "El Lobo", ancoras: ["hambre", "manada", "lo que ronda"], leitura: "El lobo aparece con frecuencia en el borde: fuera de la casa, alrededor del fuego. Una asociación posible es lo que se mantiene cerca sin entrar, y que no deja de estar ahí." },
    },
  },
]

/**
 * O símbolo daquele dia, igual para todo mundo.
 *
 * Determinístico pela data e nada mais: sem sorteio por pessoa, porque isto não
 * é leitura de ninguém. A soma dos códigos da data basta — não há nada a
 * esconder aqui, e um gerador com estado seria complicação sem ganho.
 */
export function simboloDoDia(dia: string): SimboloInconsciente {
  // FNV-1a, e não a soma com 31 que estava aqui antes: aquela devolvia índices
  // VIZINHOS para dias vizinhos, e o repertório aparecia na ordem em que foi
  // escrito, um símbolo por dia, como uma lista sendo percorrida. Determinístico
  // precisa parecer sorteado; caso contrário, quem abre dois dias seguidos
  // percebe a fila e o atlas vira calendário.
  let h = 0x811c9dc5
  for (let i = 0; i < dia.length; i++) {
    h ^= dia.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return SIMBOLOS[Math.abs(h) % SIMBOLOS.length]
}

/** Quantos dias até um símbolo repetir. A tela diz isto em voz baixa. */
export const CICLO_DE_DIAS = SIMBOLOS.length
