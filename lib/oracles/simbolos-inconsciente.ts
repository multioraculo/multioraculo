/**
 * "Imagem do inconsciente — Estudo do dia": uma biblioteca simbólica curada,
 * da qual UM estudo é apresentado por dia.
 *
 * O PRINCÍPIO É `fonte → estudo`. Nada aqui nasce de conhecimento geral: cada
 * entrada declara de onde vem, em que capítulo, em que página e se a passagem é
 * texto corrido ou legenda de imagem. Item sem passagem de fonte não compila
 * (`fontes` exige ao menos uma) e `scripts/verify-simbolos.ts` confere cada
 * trecho contra o PDF.
 *
 * NÃO É: arquétipo regente, leitura pessoal, previsão, resultado das outras
 * tiragens, nem associação produzida pelo sistema. Se o estudo do dia combinar
 * com o que o usuário tirou em outro oráculo, é coincidência percebida por ele.
 *
 * FONTE ÚNICA: "O Homem e seus Símbolos" (data/fontes/o_homem_e_seus_simbolos.pdf).
 * Cinco autores, um por capítulo; atribuir ao volume, ou a Jung, o que outro
 * escreveu seria o erro que a rastreabilidade existe para evitar:
 *
 *   I   Jung        pp.   1–158   Chegando ao inconsciente
 *   II  Henderson   pp. 160–249   Os mitos antigos e o homem moderno
 *   III von Franz   pp. 250–390   O processo de individuação
 *   IV  Jaffé       pp. 391–460   O simbolismo nas artes plásticas
 *   V   Jacobi      pp. 461–530   Símbolos em uma análise individual
 *
 * LEGENDA ≠ TEXTO. As legendas das fotos e gravuras do livro não são escritas
 * pelo autor do capítulo (o volume tem coordenação editorial e redação de
 * texto próprias). Por isso cada passagem diz `natureza`, e um símbolo só é
 * "forte" quando sustentado por pelo menos duas passagens de TEXTO em contextos
 * distintos. Legenda só apoia.
 *
 * O QUE VAI PARA A HOME é apenas `texto[locale]`: nome, três âncoras e uma
 * paráfrase curta, em linguagem de possibilidade. Autor, obra, página e citação
 * ficam aqui, para responder "de onde veio este estudo?", e para uma futura
 * página de aprofundamento (`/explorar/imagens/[slug]`, ainda não criada).
 * Quando a formulação for específica da psicologia analítica (anima, animus,
 * persona), a paráfrase a preserva em vez de universalizá-la.
 *
 * Para ENTRAR no repertório um item precisa de fonte que sustente o texto. O
 * que a auditoria excluiu (máscara, cruz, andrógino: só legenda ou menção
 * incidental) e o que ficou sem sustentação (porta, chave, ponte, escada,
 * jardim, lobo) está em docs/auditoria-repertorio-simbolico.md.
 */
import type { Locale } from "@/lib/i18n/config"

export const OBRA = "O Homem e seus Símbolos"

/**
 * Versão exata do PDF contra a qual páginas e trechos foram auditados
 * (2026-10-04). As páginas citadas só valem para este arquivo: outra edição ou
 * outro e-book repagina. `verify:simbolos` compara este hash com o arquivo local.
 */
export const PDF_AUDITADO = {
  arquivo: "data/fontes/o_homem_e_seus_simbolos.pdf",
  sha256: "889549d1c9b56185b27fb2bee1fee127382e7df0857a7d690f1ba657b1d9e49d",
  bytes: 29365955,
  paginas: 557,
} as const

export type ForcaDaEvidencia = "forte" | "utilizavel"

/** Natureza da imagem, quando a fonte permite dizer. */
export type TipoDeImagem =
  | "figura-arquetipica"
  | "animal"
  | "criatura"
  | "elemento-natural"
  | "lugar"
  | "objeto"
  | "forma"
  | "imagem-cosmica"
  | "motivo-recorrente"

export type Passagem = {
  /** o autor DAQUELE CAPÍTULO, não o do volume */
  autor: string
  capitulo: string
  /** página do PDF/e-book em `data/fontes` */
  pagina: number
  natureza: "texto" | "legenda"
  /** trecho literal, no idioma da edição que temos. Só rastreio: não vai à Home. */
  trecho: string
  /** quando o autor do capítulo relata a leitura de outro */
  relato?: string
}

export type TextoDoSimbolo = {
  nome: string
  /** três âncoras, separadas por · na tela */
  ancoras: [string, string, string]
  /** paráfrase editorial curta, em linguagem de possibilidade */
  leitura: string
}

export type SimboloInconsciente = {
  /** identificador estável e futura rota: /explorar/imagens/[slug] */
  slug: string
  tipo: TipoDeImagem
  forca: ForcaDaEvidencia
  /** a primeira é a principal; todas respondem "de onde veio este estudo?" */
  fontes: [Passagem, ...Passagem[]]
  texto: Record<Locale, TextoDoSimbolo>
}

const cap = {
  jung: { autor: "C. G. Jung", capitulo: "I. Chegando ao inconsciente" },
  henderson: { autor: "Joseph L. Henderson", capitulo: "II. Os mitos antigos e o homem moderno" },
  franz: { autor: "M.-L. von Franz", capitulo: "III. O processo de individuação" },
  jaffe: { autor: "Aniela Jaffé", capitulo: "IV. O simbolismo nas artes plásticas" },
  jacobi: { autor: "Jolande Jacobi", capitulo: "V. Símbolos em uma análise individual" },
}

const t = (c: keyof typeof cap, pagina: number, trecho: string, relato?: string): Passagem => ({
  ...cap[c], pagina, natureza: "texto", trecho, ...(relato ? { relato } : {}),
})
const l = (c: keyof typeof cap, pagina: number, trecho: string): Passagem => ({
  ...cap[c], pagina, natureza: "legenda", trecho,
})

export const SIMBOLOS: SimboloInconsciente[] = [
  {
    slug: "sombra",
    tipo: "figura-arquetipica",
    forca: "forte",
    fontes: [
      t("jung", 90, "projetavam uma “sombra” muito parecida com a outra mulher"),
      t("henderson", 185, "esse conflito entre a sombra e o ego se exprime pela disputa entre o herói arquetípico e os poderes cósmicos do mal"),
    ],
    texto: {
      pt: {
        nome: "A Sombra",
        ancoras: ["projeção", "o que não se reconhece", "atrito"],
        leitura:
          "A sombra pode aparecer menos como um lado ruim e mais como aquilo que reconhecemos primeiro nos outros. A figura que incomoda num sonho pode estar mais perto de casa do que parece.",
      },
      en: {
        nome: "The Shadow",
        ancoras: ["projection", "what goes unrecognized", "friction"],
        leitura:
          "The shadow may appear less as a bad side and more as what we recognize first in other people. The figure that irritates in a dream may be closer to home than it looks.",
      },
      es: {
        nome: "La Sombra",
        ancoras: ["proyección", "lo que no se reconoce", "roce"],
        leitura:
          "La sombra puede aparecer menos como un lado malo y más como aquello que reconocemos primero en los demás. La figura que molesta en un sueño puede estar más cerca de casa de lo que parece.",
      },
    },
  },
  {
    slug: "anima",
    tipo: "figura-arquetipica",
    forca: "forte",
    fontes: [
      t("jung", 33, "É esse elemento feminino, que há em todo homem, que chamei"),
      t("jung", 33, "uma maneira secundária que o homem tem de se relacionar com o seu ambiente e sobretudo com as mulheres, e que ele esconde tanto das outras pessoas quanto de si mesmo"),
      t("henderson", 190, "o elemento feminino da psique masculina que Goethe chamou de “o Eterno Feminino”"),
      t("franz", 286, "também personificam o aspecto perigoso da anima"),
    ],
    texto: {
      pt: {
        nome: "A Anima",
        ancoras: ["o feminino interior", "modo de se relacionar", "o que se esconde"],
        leitura:
          "Na psicologia analítica, a anima é o elemento feminino do inconsciente do homem: uma maneira secundária de se relacionar com o mundo, sobretudo com as mulheres, que ele pode esconder dos outros e de si mesmo. Pode assumir formas diferentes, da figura sedutora e perigosa a aspectos positivos.",
      },
      en: {
        nome: "The Anima",
        ancoras: ["the inner feminine", "a way of relating", "what stays hidden"],
        leitura:
          "In analytical psychology, the anima is the feminine element in a man's unconscious: a secondary way of relating to the world, especially to women, which he may hide from others and from himself. It can take different forms, from the seductive and dangerous figure to positive aspects.",
      },
      es: {
        nome: "El Ánima",
        ancoras: ["lo femenino interior", "una forma de relacionarse", "lo que se oculta"],
        leitura:
          "En la psicología analítica, el ánima es el elemento femenino del inconsciente del hombre: una manera secundaria de relacionarse con el mundo, sobre todo con las mujeres, que puede ocultar a los demás y a sí mismo. Puede adoptar formas distintas, de la figura seductora y peligrosa a aspectos positivos.",
      },
    },
  },
  {
    slug: "animus",
    tipo: "figura-arquetipica",
    forca: "forte",
    fontes: [
      t("franz", 307, "A personificação masculina do inconsciente na mulher"),
      t("franz", 307, "aparece mais comumente como uma convicção secreta “sagrada”"),
      t("franz", 311, "pode lançar uma ponte para o self por meio da atividade criadora"),
    ],
    texto: {
      pt: {
        nome: "O Animus",
        ancoras: ["convicção", "voz interna", "os dois lados"],
        leitura:
          "Na psicologia analítica, o animus é a personificação masculina do inconsciente na mulher, com aspectos positivos e negativos. Raramente aparece como fantasia ou inclinação erótica; costuma vir como uma convicção secreta, defendida com voz firme. A figura pode evocar tanto o que sustenta quanto o que endurece.",
      },
      en: {
        nome: "The Animus",
        ancoras: ["conviction", "inner voice", "both sides"],
        leitura:
          "In analytical psychology, the animus is the masculine personification of the unconscious in a woman, with both positive and negative aspects. It rarely shows up as fantasy or erotic inclination; it tends to arrive as a secret conviction, defended in a firm voice. The figure may evoke both what upholds and what hardens.",
      },
      es: {
        nome: "El Animus",
        ancoras: ["convicción", "voz interna", "los dos lados"],
        leitura:
          "En la psicología analítica, el animus es la personificación masculina del inconsciente en la mujer, con aspectos positivos y negativos. Rara vez aparece como fantasía o inclinación erótica; suele llegar como una convicción secreta, defendida con voz firme. La figura puede evocar tanto lo que sostiene como lo que endurece.",
      },
    },
  },
  {
    slug: "heroi",
    tipo: "figura-arquetipica",
    forca: "forte",
    fontes: [
      t("henderson", 169, "sua luta triunfante contra as forças do mal, sua falibilidade ante a tentação do orgulho"),
      t("henderson", 185, "a figura do herói é o meio simbólico pelo qual o ego emergente vence a inércia do inconsciente"),
    ],
    texto: {
      pt: {
        nome: "O Herói",
        ancoras: ["subida", "hybris", "queda"],
        leitura:
          "O ciclo do herói não termina na vitória: a falibilidade diante do orgulho faz parte da figura. Uma imagem heroica num sonho pode estar apontando para a queda, e não para a conquista.",
      },
      en: {
        nome: "The Hero",
        ancoras: ["ascent", "hybris", "fall"],
        leitura:
          "The hero's cycle does not end in victory: fallibility before pride belongs to the figure. A heroic image in a dream may be pointing at the fall rather than the conquest.",
      },
      es: {
        nome: "El Héroe",
        ancoras: ["ascenso", "hybris", "caída"],
        leitura:
          "El ciclo del héroe no termina en la victoria: la falibilidad ante el orgullo forma parte de la figura. Una imagen heroica en un sueño puede estar señalando la caída, y no la conquista.",
      },
    },
  },
  {
    slug: "trickster",
    tipo: "figura-arquetipica",
    forca: "forte",
    fontes: [
      t("henderson", 172, "Trickster é um personagem dominado por seus desejos"),
      t("henderson", 180, "o macaco branco parece representar Trickster"),
    ],
    texto: {
      pt: {
        nome: "O Embusteiro",
        ancoras: ["impulso", "o mais antigo", "riso"],
        leitura:
          "Situado no primeiro ciclo do mito do herói, o mais primitivo, ele pode evocar menos malícia do que apetite sem freio, que é outra coisa.",
      },
      en: {
        nome: "The Trickster",
        ancoras: ["impulse", "the oldest", "laughter"],
        leitura:
          "Placed in the first cycle of the hero myth, the most primitive one, he may evoke less malice than unbridled appetite, which is another thing.",
      },
      es: {
        nome: "El Embustero",
        ancoras: ["impulso", "el más antiguo", "risa"],
        leitura:
          "Ubicado en el primer ciclo del mito del héroe, el más primitivo, puede evocar menos malicia que apetito sin freno, que es otra cosa.",
      },
    },
  },
  {
    slug: "serpente",
    tipo: "animal",
    forca: "forte",
    fontes: [
      t("henderson", 244, "Talvez o símbolo onírico mais comum de transcendência seja a serpente"),
      t("jung", 118, "dragões, serpentes, monstros, demônios"),
      l("jung", 115, "uma serpente (símbolo do deus) morde o ombro doente de um homem e o deus o cura"),
      l("henderson", 242, "um “mediador” entre dois modos de vida"),
    ],
    texto: {
      pt: {
        nome: "A Serpente",
        ancoras: ["cura", "entre dois mundos", "transcendência"],
        leitura:
          "A serpente pode aparecer como um dos símbolos oníricos mais comuns de transcendência: criatura do mundo subterrâneo, às vezes figura a passagem entre dois modos de vida. Na Grécia, era também o sinal do deus da cura, a quem os doentes pediam um sonho.",
      },
      en: {
        nome: "The Serpent",
        ancoras: ["healing", "between two worlds", "transcendence"],
        leitura:
          "The serpent may appear as one of the most common dream symbols of transcendence: a creature of the underworld, it sometimes figures the passage between two ways of life. In Greece it was also the sign of the god of healing, from whom the sick asked for a dream.",
      },
      es: {
        nome: "La Serpiente",
        ancoras: ["curación", "entre dos mundos", "trascendencia"],
        leitura:
          "La serpiente puede aparecer como uno de los símbolos oníricos más comunes de trascendencia: criatura del mundo subterráneo, a veces figura el paso entre dos modos de vida. En Grecia era también la señal del dios de la curación, a quien los enfermos pedían un sueño.",
      },
    },
  },
  {
    slug: "animal",
    tipo: "animal",
    forca: "forte",
    fontes: [
      t("jaffe", 403, "O animal em si não é bom nem mau; é parte da natureza"),
      t("henderson", 243, "a vida instintiva é em geral simbolizada por animais"),
    ],
    texto: {
      pt: {
        nome: "O Animal",
        ancoras: ["instinto", "nem bom nem mau", "integração"],
        leitura:
          "O animal que aparece num sonho não precisa ser lido como bom ou mau: pertence à natureza. A vida instintiva costuma ser simbolizada por animais, e o que pode estar em jogo é menos o que o bicho quer dizer e mais o que se faz com o instinto que ele figura.",
      },
      en: {
        nome: "The Animal",
        ancoras: ["instinct", "neither good nor bad", "integration"],
        leitura:
          "The animal in a dream need not be read as good or bad: it belongs to nature. Instinctive life tends to be symbolized by animals, and what may be at stake is less what the creature means and more what one does with the instinct it figures.",
      },
      es: {
        nome: "El Animal",
        ancoras: ["instinto", "ni bueno ni malo", "integración"],
        leitura:
          "El animal que aparece en un sueño no tiene por qué leerse como bueno o malo: pertenece a la naturaleza. La vida instintiva suele simbolizarse con animales, y lo que puede estar en juego es menos lo que el animal quiere decir y más qué se hace con el instinto que figura.",
      },
    },
  },
  {
    slug: "casa",
    tipo: "lugar",
    forca: "forte",
    fontes: [
      t("jung", 73, "A casa, certamente, era o símbolo da minha personalidade"),
      t("franz", 270, "que representa a perspectiva psíquica ainda desconhecida da sua personalidade"),
      l("jung", 116, "O corpo humano é muitas vezes representado como uma casa"),
    ],
    texto: {
      pt: {
        nome: "A Casa",
        ancoras: ["interioridade", "cômodos que não se abrem", "antecipação"],
        leitura:
          "A casa pode figurar a própria personalidade, e uma ala desconhecida pode anunciar um interesse que ainda não existe. Uma casa estranha pode apontar para uma perspectiva da personalidade ainda desconhecida. O que ela contém e como você se move por ela muda a leitura inteira.",
      },
      en: {
        nome: "The House",
        ancoras: ["inwardness", "rooms that stay shut", "anticipation"],
        leitura:
          "The house may stand for one's own personality, and an unknown wing may announce an interest that does not exist yet. A strange house may point to a side of the personality not yet known. What it holds, and how you move through it, changes the whole reading.",
      },
      es: {
        nome: "La Casa",
        ancoras: ["interioridad", "cuartos que no se abren", "anticipación"],
        leitura:
          "La casa puede figurar la propia personalidad, y un ala desconocida puede anunciar un interés que aún no existe. Una casa extraña puede apuntar a una perspectiva de la personalidad todavía desconocida. Lo que contiene y cómo te mueves por ella cambia la lectura entera.",
      },
    },
  },
  {
    slug: "caverna",
    tipo: "lugar",
    forca: "utilizavel",
    fontes: [
      t("henderson", 230, "uma perigosa descida às cavernas da morte"),
      t("henderson", 234, "emergindo desta “morte” para um novo tipo de vida"),
    ],
    texto: {
      pt: {
        nome: "A Caverna",
        ancoras: ["recolhimento", "descida", "passagem"],
        leitura:
          "Num sonho de caverna mortuária, a descida pode evocar um rito de iniciação e o começo de uma transformação, e não um fim. Descer não é necessariamente perder.",
      },
      en: {
        nome: "The Cave",
        ancoras: ["retreat", "descent", "passage"],
        leitura:
          "In a dream of a burial cave, the descent may evoke an initiation rite and the beginning of a transformation rather than an ending. Going down is not necessarily losing.",
      },
      es: {
        nome: "La Caverna",
        ancoras: ["recogimiento", "descenso", "pasaje"],
        leitura:
          "En un sueño de caverna mortuoria, el descenso puede evocar un rito de iniciación y el comienzo de una transformación, y no un final. Bajar no es necesariamente perder.",
      },
    },
  },
  {
    slug: "arvore",
    tipo: "elemento-natural",
    forca: "forte",
    fontes: [
      t("henderson", 243, "uma árvore ou uma planta antigas representam, simbolicamente, o crescimento e o desenvolvimento da vida psíquica"),
      t("franz", 256, "É assim que um pinheiro começa, lentamente, a existir de fato, estabelecendo sua totalidade"),
      l("jung", 139, "pode simbolizar evolução, crescimento físico ou maturidade psicológica"),
    ],
    texto: {
      pt: {
        nome: "A Árvore",
        ancoras: ["crescimento", "vida psíquica", "muitos significados"],
        leitura:
          "A árvore pode aparecer com uma variedade enorme de significados: crescimento, maturidade psicológica, e também sacrifício ou morte. Uma árvore ou planta antiga costuma figurar o desenvolvimento da vida psíquica, enquanto a vida instintiva é em geral simbolizada por animais.",
      },
      en: {
        nome: "The Tree",
        ancoras: ["growth", "psychic life", "many meanings"],
        leitura:
          "The tree may appear with a huge variety of meanings: growth, psychological maturity, and also sacrifice or death. An ancient tree or plant tends to figure the development of psychic life, while instinctive life is usually symbolized by animals.",
      },
      es: {
        nome: "El Árbol",
        ancoras: ["crecimiento", "vida psíquica", "muchos significados"],
        leitura:
          "El árbol puede aparecer con una enorme variedad de significados: crecimiento, madurez psicológica, y también sacrificio o muerte. Un árbol o planta antiguos suelen figurar el desarrollo de la vida psíquica, mientras que la vida instintiva suele simbolizarse con animales.",
      },
    },
  },
  {
    slug: "pedra",
    tipo: "elemento-natural",
    forca: "forte",
    fontes: [
      t("franz", 342, "(a pedra redonda é símbolo do self)"),
      t("franz", 341, "Ao ser polida, a pedra começará a brilhar como um espelho"),
      t("franz", 350, "Talvez cristais e pedras sejam símbolos do self tão adequados devido à “exatidão” da sua natureza"),
    ],
    texto: {
      pt: {
        nome: "A Pedra",
        ancoras: ["dureza", "polimento", "self"],
        leitura:
          "A pedra redonda e polida pode aparecer como símbolo do self, e o polimento como o trabalho de individuação em imagem: o que resiste e o que se desgasta contam a mesma história. Pedras e cristais talvez sirvam tão bem a esse papel pela exatidão da sua natureza.",
      },
      en: {
        nome: "The Stone",
        ancoras: ["hardness", "polishing", "the self"],
        leitura:
          "The round, polished stone may appear as a symbol of the self, and the polishing as the work of individuation made image: what resists and what wears down tell the same story. Stones and crystals may serve this role so well because of the exactness of their nature.",
      },
      es: {
        nome: "La Piedra",
        ancoras: ["dureza", "pulido", "el self"],
        leitura:
          "La piedra redonda y pulida puede aparecer como símbolo del self, y el pulido como el trabajo de individuación hecho imagen: lo que resiste y lo que se desgasta cuentan la misma historia. Piedras y cristales quizá sirvan tan bien a ese papel por la exactitud de su naturaleza.",
      },
    },
  },
  {
    slug: "circulo-mandala",
    tipo: "forma",
    forca: "forte",
    fontes: [
      t("jaffe", 406, "o círculo (ou esfera) como um símbolo do self", "Jaffé relata a leitura de M.-L. von Franz"),
      t("franz", 362, "a forma redonda (o motivo da mandala) quase sempre simboliza uma totalidade natural", "von Franz cita Aniela Jaffé"),
      t("franz", 326, "O objeto redondo, como um sol, que aparece ao fundo é um símbolo quádruplo que caracteriza a integração psicológica"),
    ],
    texto: {
      pt: {
        nome: "O Círculo e a Mandala",
        ancoras: ["totalidade", "centro", "redondo e quadrado"],
        leitura:
          "O círculo pode aparecer como símbolo da totalidade da psique. Na mandala, a forma redonda costuma figurar uma totalidade natural, e a quadrada, o momento em que ela é percebida. A figura reaparece do culto solar às mandalas tibetanas e à planta das cidades.",
      },
      en: {
        nome: "The Circle and the Mandala",
        ancoras: ["wholeness", "centre", "round and square"],
        leitura:
          "The circle may appear as a symbol of the wholeness of the psyche. In the mandala, the round form tends to figure a natural wholeness, and the square one, the moment it is noticed. The figure recurs from sun worship to Tibetan mandalas and city plans.",
      },
      es: {
        nome: "El Círculo y la Mandala",
        ancoras: ["totalidad", "centro", "redondo y cuadrado"],
        leitura:
          "El círculo puede aparecer como símbolo de la totalidad de la psique. En la mandala, la forma redonda suele figurar una totalidad natural, y la cuadrada, el momento en que se la percibe. La figura reaparece del culto solar a las mandalas tibetanas y al trazado de las ciudades.",
      },
    },
  },
  {
    slug: "rio",
    tipo: "elemento-natural",
    forca: "utilizavel",
    fontes: [
      t("franz", 325, "A própria mudança é, muitas vezes, simbolizada pelo ato de atravessar um curso d’água"),
      t("franz", 369, "Quando chegou ao meio do rio, parecia-lhe que"),
    ],
    texto: {
      pt: {
        nome: "O Rio",
        ancoras: ["travessia", "mudança", "peso no meio"],
        leitura:
          "A mudança costuma ser figurada pela travessia de um curso d'água. Na lenda de São Cristóvão, o fardo fica mais pesado justamente no meio do rio, e a imagem pode evocar o peso que uma passagem tem a meio caminho.",
      },
      en: {
        nome: "The River",
        ancoras: ["crossing", "change", "weight midway"],
        leitura:
          "Change is often figured by the crossing of a watercourse. In the legend of Saint Christopher the burden grows heaviest exactly midstream, and the image may evoke the weight a passage carries halfway through.",
      },
      es: {
        nome: "El Río",
        ancoras: ["travesía", "cambio", "peso en medio"],
        leitura:
          "El cambio suele figurarse con la travesía de un curso de agua. En la leyenda de San Cristóbal la carga se vuelve más pesada justo en medio del río, y la imagen puede evocar el peso que tiene un pasaje a mitad de camino.",
      },
    },
  },
  {
    slug: "espelho",
    tipo: "objeto",
    forca: "forte",
    fontes: [
      t("franz", 341, "a alma humana se transforma em um espelho no qual os poderes divinos se reproduzem"),
      t("franz", 364, "O barbeiro com o espelho que desaparece simboliza o dom da reflexão"),
      l("franz", 341, "um espelho pode simbolizar o poder que o inconsciente tem de “refletir” objetivamente o indivíduo"),
    ],
    texto: {
      pt: {
        nome: "O Espelho",
        ancoras: ["reflexo", "ver-se de fora", "reflexão"],
        leitura:
          "Nos sonhos, o espelho pode aparecer como o poder que o inconsciente tem de refletir a pessoa objetivamente, dando-lhe uma visão de si que talvez nunca tenha tido — às vezes uma visão que choca. Também pode figurar o dom da reflexão, que às vezes se perde justamente quando mais faz falta.",
      },
      en: {
        nome: "The Mirror",
        ancoras: ["reflection", "seeing oneself from outside", "reflecting"],
        leitura:
          "In dreams, the mirror may appear as the power the unconscious has to reflect a person objectively, giving a view of oneself one may never have had — sometimes a view that shocks. It may also figure the gift of reflection, which can be lost just when it is most needed.",
      },
      es: {
        nome: "El Espejo",
        ancoras: ["reflejo", "verse desde fuera", "reflexión"],
        leitura:
          "En los sueños, el espejo puede aparecer como el poder que tiene el inconsciente de reflejar a la persona objetivamente, dándole una visión de sí que quizá nunca tuvo — a veces una visión que choca. También puede figurar el don de la reflexión, que a veces se pierde justo cuando más hace falta.",
      },
    },
  },
  {
    slug: "morte-renascimento",
    tipo: "motivo-recorrente",
    forca: "forte",
    fontes: [
      t("jung", 110, "contêm símbolos da criação, da morte e do renascimento"),
      t("henderson", 166, "iniciação na vida sob as mesmas formas arquetípicas que expressam iniciação na morte"),
      t("henderson", 234, "emergindo desta “morte” para um novo tipo de vida"),
    ],
    texto: {
      pt: {
        nome: "A Morte e o Renascimento",
        ancoras: ["iniciação", "passagem", "renascimento"],
        leitura:
          "Em sonhos, a morte pode aparecer junto de símbolos de criação e renascimento, como nos ritos de iniciação. Às vezes figura uma passagem — a pessoa emerge dessa “morte” para um novo tipo de vida —, embora em certos casos acompanhe a aproximação de um fim real.",
      },
      en: {
        nome: "Death and Rebirth",
        ancoras: ["initiation", "passage", "rebirth"],
        leitura:
          "In dreams, death may appear alongside symbols of creation and rebirth, as in initiation rites. Sometimes it figures a passage — the person emerges from that “death” into a new kind of life — though in some cases it accompanies the approach of a real ending.",
      },
      es: {
        nome: "La Muerte y el Renacimiento",
        ancoras: ["iniciación", "pasaje", "renacimiento"],
        leitura:
          "En los sueños, la muerte puede aparecer junto a símbolos de creación y renacimiento, como en los ritos de iniciación. A veces figura un pasaje — la persona emerge de esa «muerte» a un nuevo tipo de vida —, aunque en ciertos casos acompaña la proximidad de un final real.",
      },
    },
  },
  {
    slug: "iniciacao",
    tipo: "motivo-recorrente",
    forca: "forte",
    fontes: [
      t("henderson", 200, "requer um período de transição, expresso nas várias formas do arquétipo de iniciação"),
      t("henderson", 206, "a distinção que se deve fazer entre a iniciação e o mito do herói"),
      t("henderson", 207, "O tema da submissão como uma atitude essencial ao sucesso do rito de iniciação"),
    ],
    texto: {
      pt: {
        nome: "A Iniciação",
        ancoras: ["transição", "submissão", "rito de passagem"],
        leitura:
          "A iniciação pode aparecer como o período de transição entre uma fase da vida e outra, e se distingue do mito do herói: onde o herói afirma força e vontade, a iniciação pede submissão. Pode assumir formas diferentes, de ritos de passagem a sonhos de provas.",
      },
      en: {
        nome: "Initiation",
        ancoras: ["transition", "submission", "rite of passage"],
        leitura:
          "Initiation may appear as the period of transition between one stage of life and another, and it differs from the hero myth: where the hero asserts strength and will, initiation asks for submission. It can take different forms, from rites of passage to dreams of ordeals.",
      },
      es: {
        nome: "La Iniciación",
        ancoras: ["transición", "sumisión", "rito de paso"],
        leitura:
          "La iniciación puede aparecer como el período de transición entre una etapa de la vida y otra, y se distingue del mito del héroe: donde el héroe afirma fuerza y voluntad, la iniciación pide sumisión. Puede adoptar formas distintas, de ritos de paso a sueños de pruebas.",
      },
    },
  },
  {
    slug: "labirinto",
    tipo: "forma",
    forca: "forte",
    fontes: [
      t("henderson", 195, "o labirinto significa uma representação confusa e intrincada do universo da consciência matriarcal"),
      t("franz", 270, "um símbolo bem conhecido do inconsciente e de suas desconhecidas possibilidades"),
      l("franz", 269, "O inconsciente é, muitas vezes, simbolizado por corredores ou labirintos"),
    ],
    texto: {
      pt: {
        nome: "O Labirinto",
        ancoras: ["corredores", "portas sem chave", "o desconhecido"],
        leitura:
          "O labirinto pode aparecer como símbolo do inconsciente e de suas possibilidades desconhecidas: corredores, quartos, portas sem chave. No mito de Teseu, é um universo confuso e intrincado que só atravessa quem está pronto para uma iniciação ao mundo do inconsciente.",
      },
      en: {
        nome: "The Labyrinth",
        ancoras: ["corridors", "doors without keys", "the unknown"],
        leitura:
          "The labyrinth may appear as a symbol of the unconscious and its unknown possibilities: corridors, rooms, doors without keys. In the myth of Theseus it is a confused, intricate universe that only those ready for an initiation into the world of the unconscious can cross.",
      },
      es: {
        nome: "El Laberinto",
        ancoras: ["corredores", "puertas sin llave", "lo desconocido"],
        leitura:
          "El laberinto puede aparecer como símbolo del inconsciente y de sus posibilidades desconocidas: corredores, cuartos, puertas sin llave. En el mito de Teseo es un universo confuso e intrincado que solo atraviesa quien está listo para una iniciación al mundo del inconsciente.",
      },
    },
  },
  {
    slug: "mae-grande",
    tipo: "figura-arquetipica",
    forca: "forte",
    fontes: [
      t("jung", 144, "a imagem primitiva da matéria — a Mãe Grande — que podia conter e expressar todo o profundo sentido emocional da Mãe Terra"),
      t("henderson", 195, "a liberação da anima dos aspectos “devoradores” da imagem materna"),
      t("franz", 320, "uma Mãe Terra ou uma deusa da natureza ou do amor"),
    ],
    texto: {
      pt: {
        nome: "A Mãe Grande",
        ancoras: ["o que contém", "Mãe Terra", "o que devora"],
        leitura:
          "A Mãe Grande é a imagem que antecedeu o conceito seco de matéria e podia conter todo o sentido emocional da Mãe Terra. Como figura, pode aparecer tanto como a que acolhe quanto como a que devora: a imagem materna tem também aspectos “devoradores”.",
      },
      en: {
        nome: "The Great Mother",
        ancoras: ["what contains", "Mother Earth", "what devours"],
        leitura:
          "The Great Mother is the image that preceded the dry concept of matter, and it could hold the whole emotional meaning of Mother Earth. As a figure she may appear both as the one who shelters and the one who devours: the mother image also has “devouring” aspects.",
      },
      es: {
        nome: "La Gran Madre",
        ancoras: ["lo que contiene", "Madre Tierra", "lo que devora"],
        leitura:
          "La Gran Madre es la imagen que precedió al concepto seco de materia y podía contener todo el sentido emocional de la Madre Tierra. Como figura puede aparecer tanto como la que acoge como la que devora: la imagen materna tiene también aspectos «devoradores».",
      },
    },
  },
  {
    slug: "montanha",
    tipo: "elemento-natural",
    forca: "forte",
    fontes: [
      t("jacobi", 497, "a montanha muitas vezes simboliza um lugar de revelação, onde se produzem mudanças e transformações"),
      t("jacobi", 468, "representada na escalada da montanha, simboliza uma ascensão do inconsciente até um ponto de vista mais elevado do ego"),
      t("henderson", 206, "O ato de escalar uma montanha parece sugerir uma prova de força"),
    ],
    texto: {
      pt: {
        nome: "A Montanha",
        ancoras: ["subida", "revelação", "ponto de vista"],
        leitura:
          "A montanha pode aparecer como um lugar de revelação, onde se produzem mudanças e transformações, e a subida como um ponto de vista mais elevado. Também pode sugerir uma prova de força, e nem sempre a escalada se completa de uma vez: em Dante, o viajante é obrigado a descer antes de poder subir de novo.",
      },
      en: {
        nome: "The Mountain",
        ancoras: ["ascent", "revelation", "vantage point"],
        leitura:
          "The mountain may appear as a place of revelation, where changes and transformations take place, and the climb as a higher point of view. It may also suggest a test of strength, and the climb does not always complete at once: in Dante, the traveller is forced down before he can climb again.",
      },
      es: {
        nome: "La Montaña",
        ancoras: ["subida", "revelación", "punto de vista"],
        leitura:
          "La montaña puede aparecer como un lugar de revelación, donde se producen cambios y transformaciones, y la subida como un punto de vista más elevado. También puede sugerir una prueba de fuerza, y la escalada no siempre se completa de una vez: en Dante, el viajero se ve obligado a bajar antes de poder subir de nuevo.",
      },
    },
  },
  {
    slug: "cavalo",
    tipo: "animal",
    forca: "utilizavel",
    fontes: [
      t("franz", 270, "O fato de os cavalos não carregarem cavaleiros mostra"),
      l("franz", 278, "Cavalos selvagens simbolizam, inúmeras vezes, impulsos instintivos incontroláveis"),
      l("jung", 153, "um cavalo branco, um notório símbolo de vida"),
    ],
    texto: {
      pt: {
        nome: "O Cavalo",
        ancoras: ["impulso", "sem cavaleiro", "vida"],
        leitura:
          "O cavalo pode aparecer como impulso instintivo: solto, sem cavaleiro, pode figurar o que escapou da disciplina consciente. Cavalos selvagens simbolizam, muitas vezes, impulsos difíceis de controlar; e no folclore o cavalo branco é um símbolo de vida.",
      },
      en: {
        nome: "The Horse",
        ancoras: ["impulse", "riderless", "life"],
        leitura:
          "The horse may appear as instinctive impulse: loose, without a rider, it may figure what has escaped conscious discipline. Wild horses often symbolize impulses that are hard to control; and in folklore the white horse is a symbol of life.",
      },
      es: {
        nome: "El Caballo",
        ancoras: ["impulso", "sin jinete", "vida"],
        leitura:
          "El caballo puede aparecer como impulso instintivo: suelto, sin jinete, puede figurar lo que escapó de la disciplina consciente. Los caballos salvajes simbolizan a menudo impulsos difíciles de controlar; y en el folclore el caballo blanco es un símbolo de vida.",
      },
    },
  },
  {
    slug: "dragao",
    tipo: "criatura",
    forca: "forte",
    fontes: [
      t("henderson", 185, "poderes cósmicos do mal, personificado por dragões e outros monstros"),
      t("henderson", 195, "Mais tarde precisou vencer o dragão que guardava Andrômeda"),
      t("henderson", 195, "encontrou um dragão — imagem simbólica do aspecto"),
    ],
    texto: {
      pt: {
        nome: "O Dragão",
        ancoras: ["o monstro", "poder cósmico", "o que devora"],
        leitura:
          "O dragão pode aparecer como figura dos poderes cósmicos do mal que o herói precisa enfrentar, e também como imagem do aspecto devorador da mãe. Na mitologia o herói habitualmente vence o monstro, mas há mitos em que cede a ele.",
      },
      en: {
        nome: "The Dragon",
        ancoras: ["the monster", "cosmic power", "what devours"],
        leitura:
          "The dragon may appear as a figure of the cosmic powers of evil the hero has to face, and also as an image of the devouring aspect of the mother. In myth the hero usually wins against the monster, but there are myths in which he yields to it.",
      },
      es: {
        nome: "El Dragón",
        ancoras: ["el monstruo", "poder cósmico", "lo que devora"],
        leitura:
          "El dragón puede aparecer como figura de los poderes cósmicos del mal que el héroe debe enfrentar, y también como imagen del aspecto devorador de la madre. En la mitología el héroe suele vencer al monstruo, pero hay mitos en que cede ante él.",
      },
    },
  },
  {
    slug: "bosque",
    tipo: "lugar",
    forca: "utilizavel",
    fontes: [
      t("jacobi", 476, "O bosque é símbolo de uma área inconsciente, um lugar escuro onde vivem os animais"),
      l("jacobi", 469, "mostra o sonhador penetrando temerosamente num bosque escuro"),
    ],
    texto: {
      pt: {
        nome: "O Bosque",
        ancoras: ["escuro", "área inconsciente", "o desconhecido"],
        leitura:
          "O bosque pode aparecer como símbolo de uma área inconsciente: um lugar escuro onde vivem os animais. Penetrá-lo com receio pode figurar o ingresso no desconhecido.",
      },
      en: {
        nome: "The Wood",
        ancoras: ["dark", "unconscious area", "the unknown"],
        leitura:
          "The wood may appear as a symbol of an unconscious area: a dark place where animals live. Entering it fearfully may figure the step into the unknown.",
      },
      es: {
        nome: "El Bosque",
        ancoras: ["oscuro", "área inconsciente", "lo desconocido"],
        leitura:
          "El bosque puede aparecer como símbolo de un área inconsciente: un lugar oscuro donde viven los animales. Adentrarse con temor puede figurar el ingreso a lo desconocido.",
      },
    },
  },
  {
    slug: "casaco",
    tipo: "objeto",
    forca: "utilizavel",
    fontes: [
      t("jacobi", 484, "Um casaco é, muitas vezes, símbolo de abrigo protetor ou da máscara que o indivíduo apresenta ao mundo"),
      l("jacobi", 486, "Um casaco pode simbolizar, muitas vezes, a máscara exterior ou persona"),
    ],
    texto: {
      pt: {
        nome: "O Casaco",
        ancoras: ["abrigo", "a máscara para o mundo", "persona"],
        leitura:
          "Um casaco pode simbolizar abrigo protetor ou a máscara que a pessoa apresenta ao mundo — o que a psicologia analítica chama de persona. Serve a dois fins: causar certa impressão nos outros e ocultar o que é íntimo.",
      },
      en: {
        nome: "The Coat",
        ancoras: ["shelter", "the mask shown to the world", "persona"],
        leitura:
          "A coat may symbolize protective shelter or the mask a person presents to the world — what analytical psychology calls the persona. It serves two ends: making a certain impression on others and hiding what is intimate.",
      },
      es: {
        nome: "El Abrigo",
        ancoras: ["refugio", "la máscara ante el mundo", "persona"],
        leitura:
          "Un abrigo puede simbolizar refugio protector o la máscara que la persona presenta al mundo — lo que la psicología analítica llama persona. Sirve a dos fines: causar cierta impresión en los demás y ocultar lo íntimo.",
      },
    },
  },
  {
    slug: "sol",
    tipo: "imagem-cosmica",
    forca: "forte",
    fontes: [
      t("jung", 123, "Mungu é, precisamente, o nascer do sol"),
      t("henderson", 185, "simbolizando o suposto trajeto feito pelo Sol do crepúsculo à aurora"),
      t("jacobi", 503, "Mas se são pretos, simbolizam o lado oposto do Sol: algo demoníaco"),
      t("jacobi", 507, "o ciclo de 24 horas aparece com um esquema de totalidade"),
    ],
    texto: {
      pt: {
        nome: "O Sol",
        ancoras: ["o nascer", "o trajeto noturno", "o divino"],
        leitura:
          "O Sol pode aparecer menos como astro e mais como o nascer: numa tribo africana, as pessoas erguem as mãos aos primeiros raios, e o divino está no sol que nasce, não no que está alto. Também pode figurar o trajeto do crepúsculo à aurora, que o herói engolido pela noite percorre como uma espécie de morte.",
      },
      en: {
        nome: "The Sun",
        ancoras: ["the rising", "the night journey", "the divine"],
        leitura:
          "The Sun may appear less as a star and more as the rising: in an African tribe, people raise their hands to the first rays, and the divine lies in the sun that is rising, not the one high overhead. It may also figure the journey from dusk to dawn, which the hero swallowed by the night travels as a kind of death.",
      },
      es: {
        nome: "El Sol",
        ancoras: ["el amanecer", "el trayecto nocturno", "lo divino"],
        leitura:
          "El Sol puede aparecer menos como astro y más como el amanecer: en una tribu africana, las personas alzan las manos a los primeros rayos, y lo divino está en el sol que nace, no en el que está alto. También puede figurar el trayecto del crepúsculo a la aurora, que recorre el héroe tragado por la noche como una especie de muerte.",
      },
    },
  },
  {
    slug: "escaravelho",
    tipo: "animal",
    forca: "utilizavel",
    fontes: [
      t("jacobi", 503, "sagrados que simbolizavam o Sol. Mas se são pretos, simbolizam o lado oposto do Sol: algo demoníaco"),
      l("jacobi", 505, "No Egito, o escaravelho dourado simbolizava o Sol"),
    ],
    texto: {
      pt: {
        nome: "O Escaravelho",
        ancoras: ["sagrado", "o Sol", "o lado oposto"],
        leitura:
          "No Egito, o escaravelho dourado simbolizava o Sol. Mas besouros pretos, como os de um sonho relatado, podem figurar o lado oposto do Sol: algo demoníaco.",
      },
      en: {
        nome: "The Scarab",
        ancoras: ["sacred", "the Sun", "the opposite side"],
        leitura:
          "In Egypt the golden scarab symbolized the Sun. But black beetles, like those in a reported dream, may figure the opposite side of the Sun: something demonic.",
      },
      es: {
        nome: "El Escarabajo",
        ancoras: ["sagrado", "el Sol", "el lado opuesto"],
        leitura:
          "En Egipto el escarabajo dorado simbolizaba el Sol. Pero los escarabajos negros, como los de un sueño relatado, pueden figurar el lado opuesto del Sol: algo demoníaco.",
      },
    },
  },
]

/** A passagem principal: a resposta curta para "de onde veio este estudo?". */
export function origemDoEstudo(s: SimboloInconsciente): Passagem {
  return s.fontes[0]
}

// ── o sorteio: um embaralhamento determinístico por ciclo ───────────────────
//
// O ciclo tem tamanho N = número de itens do repertório. Dentro de um ciclo
// cada item aparece UMA vez, na ordem de um embaralhamento semeado pelo número
// do ciclo; ao terminar, nasce uma nova ordem. Mesma ordem para todo mundo, sem
// reroll, sem API, sem relação com nenhum dos cinco oráculos.
//
// Por que não o hash independente da data: com hash por dia, o mesmo item cai
// duas vezes na mesma semana (medido: 21% das janelas de 7 dias com N=25) e a
// contagem anual de um item oscila de 10 a 19. O embaralhamento garante que
// ninguém vê repetição antes de ver o repertório inteiro.

function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** PRNG pequeno e estável (mulberry32). */
function semente(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Dias inteiros desde 1970-01-01 para "AAAA-MM-DD"; nulo se o formato não for esse. */
function indiceDoDia(dia: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia)
  if (!m) return null
  return Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86_400_000)
}

/**
 * A ordem dos itens num ciclo. Parte de slugs em ordem alfabética, para que
 * reordenar o array acima não mude a ordem sorteada.
 */
function embaralhar(slugs: string[], ciclo: number): string[] {
  const a = [...slugs].sort()
  const rnd = semente(fnv1a(`estudo-do-dia:${ciclo}`))
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Ordem de um ciclo, sem item repetido na emenda com o ciclo anterior. */
export function ordemDoCiclo(ciclo: number, slugs: string[] = SIMBOLOS.map((s) => s.slug)): string[] {
  const ordem = embaralhar(slugs, ciclo)
  if (slugs.length > 2) {
    // O último do ciclo anterior nunca é tocado por esta correção (ela só mexe
    // nas posições 0 e 1), então não há recursão: basta olhar o embaralhamento
    // bruto do ciclo anterior.
    const ultimoAnterior = embaralhar(slugs, ciclo - 1)[slugs.length - 1]
    if (ordem[0] === ultimoAnterior) [ordem[0], ordem[1]] = [ordem[1], ordem[0]]
  }
  return ordem
}

/** O estudo daquele dia, igual para todo mundo. */
export function estudoDoDia(dia: string): SimboloInconsciente {
  const n = SIMBOLOS.length
  const idx = indiceDoDia(dia)
  // Formato inesperado: cai num índice estável pela própria string, em vez de
  // quebrar a Home. Não acontece com `ceu.dia`, que é AAAA-MM-DD.
  const i = idx ?? fnv1a(dia)
  const ciclo = Math.floor(i / n)
  const slug = ordemDoCiclo(ciclo)[((i % n) + n) % n]
  return SIMBOLOS.find((s) => s.slug === slug) as SimboloInconsciente
}

/** Dias do ciclo: um estudo por dia, sem repetir até o fim. */
export const CICLO_DE_DIAS = SIMBOLOS.length
