/**
 * Os 22 Arcanos Maiores do balão "Escolha uma carta": o texto do verso de cada um.
 *
 * `fonte → texto`, como no repertório do inconsciente: nada aqui vem de
 * conhecimento geral. Cada arcano declara as passagens de onde saiu, e
 * `scripts/verify-arcanos.ts` confere cada trecho contra o PDF (Nichols) e contra
 * a extração do Ben-Dov.
 *
 * DUAS FONTES, UMA LEITURA:
 *  - Sallie Nichols, "Jung e o Taro: uma jornada arquetípica" (data/pdfs/
 *    jung_tarot.pdf): um capítulo por Arcano Maior, lendo a série como a jornada
 *    de um herói. Dela vem o enquadramento (o que a imagem mostra e o que pode
 *    representar na psique). Páginas = páginas do PDF;
 *  - Yoav Ben-Dov, "O Tarô de Marselha Revelado": o sentido prático e imediato de
 *    cada carta, que entra como o "pode evocar" de cada texto.
 *
 * SÓ DE PÉ. A fonte junguiana não trata inversão, e o Ben-Dov trata a inversão
 * dentro da leitura de uma consulta, não da carta isolada. Este balão não é uma
 * consulta: é uma carta, uma imagem, um significado. Por isso as 22 saem
 * sempre na posição direita.
 *
 * O texto é uma paráfrase curta em linguagem de possibilidade ("pode evocar").
 * Autor, obra e página ficam aqui, para rastreio, e não aparecem na tela. Onde a
 * formulação é específica da psicologia analítica (o impulso religioso como
 * instinto, por exemplo), ela é preservada em vez de universalizada.
 */
import type { Locale } from "@/lib/i18n/config"

export type PassagemArcano = {
  obra: string
  autor: string
  /** página do PDF (Nichols) ou da edição (Ben-Dov) */
  pagina: number
  /** trecho literal, em português. Só rastreio: não vai à tela. */
  trecho: string
}

export type ArcanoMaior = {
  /** índice em TAROT_DECK / MAJOR_ARCANA, 0 a 21 */
  indice: number
  slug: string
  fontes: [PassagemArcano, ...PassagemArcano[]]
  leitura: Record<Locale, string>
}

const NICHOLS = "Jung e o Taro: uma jornada arquetípica"
const BENDOV = "O Tarô de Marselha Revelado"
const nichols = (pagina: number, trecho: string): PassagemArcano => ({ obra: NICHOLS, autor: "Sallie Nichols", pagina, trecho })
const bendov = (pagina: number, trecho: string): PassagemArcano => ({ obra: BENDOV, autor: "Yoav Ben-Dov", pagina, trecho })

export const ARCANOS_MAIORES: ArcanoMaior[] = [
  {
    indice: 0,
    slug: "louco",
    fontes: [
      nichols(35, "O LOUCO é um andarilho, enérgico, ubíquo e imortal."),
      nichols(35, "O Coringa liga dois mundos"),
      bendov(439, "Liberdade com relação a convenções e normas."),
    ],
    leitura: {
      pt: "O Louco é um andarilho sem número fixo, livre para viajar e perturbar a ordem estabelecida. Pode aparecer como o impulso profundo de buscar, a liberdade diante das convenções, a espontaneidade e as opções mantidas em aberto, ligando o mundo de todos os dias à terra da imaginação.",
      en: "The Fool is a wanderer with no fixed number, free to travel and disturb the established order. It may appear as the deep impulse to seek, freedom from convention, spontaneity and options kept open, linking everyday life to the land of imagination.",
      es: "El Loco es un caminante sin número fijo, libre para viajar y perturbar el orden establecido. Puede aparecer como el impulso profundo de buscar, la libertad frente a las convenciones, la espontaneidad y las opciones abiertas, uniendo la vida cotidiana con la tierra de la imaginación.",
    },
  },
  {
    indice: 1,
    slug: "mago",
    fontes: [
      nichols(57, "o Mago simboliza um fator em nós que dirige essa energia e ajuda a humanizá-la"),
      bendov(433, "Criar a realidade com poder da mente."),
    ],
    leitura: {
      pt: "O Mago simboliza um fator em nós que dirige a energia do impulso de buscar e ajuda a humanizá-la. Com os instrumentos sobre a mesa e prestes a agir, pode evocar um começo, a improvisação, o treino de habilidades práticas e o poder de criar a realidade com a mente.",
      en: "The Magician symbolizes a factor in us that directs the energy of the impulse to seek and helps humanize it. With his tools on the table and about to act, he may evoke a beginning, improvisation, the training of practical skills and the power to create reality with the mind.",
      es: "El Mago simboliza un factor en nosotros que dirige la energía del impulso de buscar y ayuda a humanizarla. Con sus instrumentos sobre la mesa y a punto de actuar, puede evocar un comienzo, la improvisación, el entrenamiento de habilidades prácticas y el poder de crear la realidad con la mente.",
    },
  },
  {
    indice: 2,
    slug: "papisa",
    fontes: [
      nichols(83, "Ela é o vaso da transformação."),
      bendov(433, "Segredos, algo oculto, mistério."),
    ],
    leitura: {
      pt: "A Papisa nunca existiu na história, mas a lenda dela guarda uma verdade interior: é através da mulher que o espírito se faz carne, o vaso da transformação. Pode evocar a sabedoria que une intelecto e intuição, o que permanece oculto e uma resposta que ainda não pode ser definitiva.",
      en: "The High Priestess never existed in history, yet her legend holds an inner truth: it is through the feminine that spirit becomes flesh, the vessel of transformation. She may evoke wisdom joining intellect and intuition, what stays hidden, and an answer that cannot yet be definitive.",
      es: "La Papisa nunca existió en la historia, pero su leyenda guarda una verdad interior: es a través de la mujer que el espíritu se hace carne, el vaso de la transformación. Puede evocar la sabiduría que une intelecto e intuición, lo que permanece oculto y una respuesta que aún no puede ser definitiva.",
    },
  },
  {
    indice: 3,
    slug: "imperatriz",
    fontes: [
      nichols(98, "Essa capacidade de ligar o céu à Terra, o espírito à carne é, com efeito, um dos principais atributos da Imperatriz"),
      bendov(433, "Abundância, crescimento, produtividade."),
    ],
    leitura: {
      pt: "A Imperatriz parece irmã da Papisa: dois lados do princípio feminino. O cetro dela liga o orbe da terra à cruz do espírito, e essa capacidade de ligar o céu à Terra é um dos seus atributos. Pode evocar abundância, crescimento, proteção e cuidado.",
      en: "The Empress looks like the High Priestess's sister: two sides of the feminine principle. Her sceptre joins the orb of the earth to the cross of spirit, and this power to link heaven and earth is one of her attributes. She may evoke abundance, growth, protection and care.",
      es: "La Emperatriz parece hermana de la Papisa: dos aspectos del principio femenino. Su cetro une el orbe de la tierra con la cruz del espíritu, y esa capacidad de unir el cielo con la Tierra es uno de sus atributos. Puede evocar abundancia, crecimiento, protección y cuidado.",
    },
  },
  {
    indice: 4,
    slug: "imperador",
    fontes: [
      nichols(112, "o Imperador é obviamente mais humano e, portanto, mais acessível à consciência do que ela"),
      bendov(433, "Autoridade e controle."),
    ],
    leitura: {
      pt: "O Imperador é um poder arquetípico mais humano e mais acessível à consciência: um líder prático, sentado à vontade e sem armadura, seguro da própria autoridade. Pode evocar conquistas práticas, comando e a figura paterna que protege.",
      en: "The Emperor is an archetypal power that is more human and more accessible to consciousness: a practical leader, seated at ease and unarmoured, secure in his own authority. He may evoke practical achievement, command and the protective father figure.",
      es: "El Emperador es un poder arquetípico más humano y más accesible a la conciencia: un líder práctico, sentado con naturalidad y sin armadura, seguro de su propia autoridad. Puede evocar logros prácticos, mando y la figura paterna que protege.",
    },
  },
  {
    indice: 5,
    slug: "papa",
    fontes: [
      nichols(129, "como a personificação exteriorizada da luta do homem pela conexão com a divindade"),
      nichols(129, "o impulso religioso visa a unir os opostos"),
      bendov(434, "Educação e conhecimento."),
    ],
    leitura: {
      pt: "O Papa pode aparecer como a luta exteriorizada do ser humano pela conexão com o divino: na psicologia analítica, o impulso por significado é um instinto próprio da psique e busca unir os opostos. Em outro plano, evoca o professor, o conselheiro e o conhecimento transmitido.",
      en: "The Hierophant may appear as the outward form of the human struggle to connect with the divine: in analytical psychology the drive toward meaning is an instinct of the psyche in its own right, and it seeks to unite opposites. On another level he evokes the teacher, the counsellor and handed-down knowledge.",
      es: "El Papa puede aparecer como la lucha exteriorizada del ser humano por conectarse con lo divino: en la psicología analítica, el impulso hacia el sentido es un instinto propio de la psique y busca unir los opuestos. En otro plano, evoca al maestro, al consejero y al conocimiento transmitido.",
    },
  },
  {
    indice: 6,
    slug: "enamorados",
    fontes: [
      nichols(139, "Podemos ver nesse moço a personificação do jovem e vigoroso ego"),
      bendov(434, "Necessidade de fazer uma escolha"),
    ],
    leitura: {
      pt: "Os Enamorados mostram um moço entre duas mulheres. Pela primeira vez a figura central é um ser humano comum, sem nenhuma autoridade a quem recorrer, e a carta marca um passo rumo à percepção individual. Pode evocar o jovem ego diante de uma escolha e o envolvimento emocional.",
      en: "The Lovers show a young man between two women. For the first time the central figure is an ordinary human being with no authority to turn to, and the card marks a step toward individual awareness. It may evoke the young ego facing a choice, and emotional involvement.",
      es: "Los Enamorados muestran a un joven entre dos mujeres. Por primera vez la figura central es un ser humano común, sin ninguna autoridad a quien acudir, y la carta marca un paso hacia la percepción individual. Puede evocar al joven ego ante una elección y el involucramiento emocional.",
    },
  },
  {
    indice: 7,
    slug: "carro",
    fontes: [
      nichols(150, "o carro é um veículo de poder e conquista"),
      bendov(434, "Ambição, energia, motivação para seguir em frente."),
    ],
    leitura: {
      pt: "O Carro é um veículo de poder e conquista com que o herói viaja pela vida, explorando suas potencialidades e testando seus limites. Num sentido psicológico, a jornada exterior também pode ser o veículo do autodescobrimento, com ambição, energia e o risco da desorientação.",
      en: "The Chariot is a vehicle of power and conquest in which the hero travels through life, exploring his potential and testing his limits. In a psychological sense the outer journey may also be the vehicle of self-discovery, with ambition, energy and the risk of disorientation.",
      es: "El Carro es un vehículo de poder y conquista con el que el héroe viaja por la vida, explorando sus potencialidades y poniendo a prueba sus límites. En un sentido psicológico, el viaje exterior también puede ser el vehículo del autodescubrimiento, con ambición, energía y el riesgo de la desorientación.",
    },
  },
  {
    indice: 8,
    slug: "justica",
    fontes: [
      nichols(164, "os pratos da sua balança não pesarão olho contra olho"),
      bendov(435, "Julgamento justo e equilibrado."),
    ],
    leitura: {
      pt: "A Justiça não distribui recompensa e castigo de forma mecânica: os pratos da balança não pesam olho contra olho, e a espada serve a mais do que punir. Pode evocar a necessidade de se reconciliar com um mundo desigual, e também lei, julgamento equilibrado e consciência desenvolvida.",
      en: "Justice does not hand out reward and punishment mechanically: the pans of her scale do not weigh eye against eye, and her sword serves more than punishment. She may evoke the need to reconcile oneself with an unequal world, and also law, balanced judgement and a developed conscience.",
      es: "La Justicia no reparte premio y castigo de forma mecánica: los platos de su balanza no pesan ojo contra ojo, y su espada sirve para algo más que castigar. Puede evocar la necesidad de reconciliarse con un mundo desigual, y también ley, juicio equilibrado y conciencia desarrollada.",
    },
  },
  {
    indice: 9,
    slug: "eremita",
    fontes: [
      nichols(175, "ele não olha por cima do ombro"),
      bendov(435, "Concentrar-se num propósito claro."),
    ],
    leitura: {
      pt: "O Eremita é um andante de passo mais calmo que o do Louco: não olha por cima do ombro, porque assimilou o passado, e leva uma pequena lâmpada, símbolo da introvisão individual. Pode evocar uma iluminação ao alcance de qualquer pessoa e a busca de um propósito claro.",
      en: "The Hermit is a walker with a calmer step than the Fool's: he does not look over his shoulder, because he has absorbed the past, and he carries a small lamp, a symbol of individual insight. He may evoke an illumination within anyone's reach and the search for a clear purpose.",
      es: "El Ermitaño es un caminante de paso más sereno que el del Loco: no mira por encima del hombro, porque ha asimilado el pasado, y lleva una pequeña lámpara, símbolo de la visión interior individual. Puede evocar una iluminación al alcance de cualquier persona y la búsqueda de un propósito claro.",
    },
  },
  {
    indice: 10,
    slug: "roda-da-fortuna",
    fontes: [
      nichols(190, "Estará tentando o Taro dizer-nos que nós, como esses animais, estamos presos"),
      bendov(435, "Ciclos da vida, fechamento de círculos."),
    ],
    leitura: {
      pt: "Na Roda da Fortuna dois animais giram, um subindo e outro caindo, e a roda continua girando, de modo que quem cai voltará ao topo. A carta pergunta se estamos presos nesse ciclo ou se há outra mensagem, mais cheia de esperança. Pode evocar mudança de posição e os ciclos da vida.",
      en: "On the Wheel of Fortune two animals turn, one rising and one falling, and the wheel keeps turning, so the one who falls will return to the top. The card asks whether we are trapped in this cycle or whether there is another, more hopeful message. It may evoke a change of position and the cycles of life.",
      es: "En la Rueda de la Fortuna dos animales giran, uno subiendo y otro cayendo, y la rueda sigue girando, de modo que quien cae volverá a la cima. La carta pregunta si estamos atrapados en ese ciclo o si hay otro mensaje, más lleno de esperanza. Puede evocar un cambio de posición y los ciclos de la vida.",
    },
  },
  {
    indice: 11,
    slug: "forca",
    fontes: [
      nichols(214, "Aqui, pela primeira vez, uma mulher mortal aparece como figura central do drama"),
      bendov(435, "Poder e coragem para enfrentar desafios."),
    ],
    leitura: {
      pt: "Com a Força, o interesse passa do mundo externo para o interno: as energias da adaptação começam a servir o crescimento interior, e pela primeira vez uma mulher mortal é a figura central. Pode evocar coragem para enfrentar desafios e a expressão controlada de impulsos e desejos.",
      en: "With Strength, interest shifts from the outer world to the inner: the energies of adaptation begin to serve inner growth, and for the first time a mortal woman is the central figure. It may evoke courage in facing challenges and the controlled expression of impulses and desires.",
      es: "Con la Fuerza, el interés pasa del mundo exterior al interior: las energías de la adaptación empiezan a servir al crecimiento interno, y por primera vez una mujer mortal es la figura central. Puede evocar valor para enfrentar desafíos y la expresión controlada de impulsos y deseos.",
    },
  },
  {
    indice: 12,
    slug: "enforcado",
    fontes: [
      nichols(228, "Para o homem ocidental é difícil tolerar a inatividade forçada"),
      bendov(436, "Aceitação da realidade"),
    ],
    leitura: {
      pt: "O Enforcado mostra a cabeça, sede do pensar racional, rebaixada, e um repouso quase afável depois da revolta. É difícil tolerar a inatividade forçada, e a carta pode evocar um crescimento que acontece abaixo da percepção consciente, um período de autoexame e a aceitação da realidade.",
      en: "The Hanged Man shows the head, seat of rational thought, lowered, and an almost gentle rest after the revolt. Forced inactivity is hard to bear, and the card may evoke growth happening below conscious awareness, a period of self-examination and acceptance of reality.",
      es: "El Colgado muestra la cabeza, sede del pensar racional, rebajada, y un reposo casi afable después de la rebelión. Es difícil tolerar la inactividad forzada, y la carta puede evocar un crecimiento que ocurre por debajo de la percepción consciente, un período de autoexamen y la aceptación de la realidad.",
    },
  },
  {
    indice: 13,
    slug: "morte",
    fontes: [
      nichols(240, "O rei está morto; viva o rei."),
      bendov(436, "O fim de algo cuja hora chegou."),
    ],
    leitura: {
      pt: "A Morte pode marcar o fim de algo cuja hora chegou, e a imagem já traz vida nova: rebentos brotam e o que ainda é vivo na velha ordem é incorporado à nova. Pode evocar uma renovação mais psíquica do que externa: o rei está morto, viva o rei.",
      en: "Death may mark the end of something whose time has come, and the image already carries new life: shoots sprout and what is still alive in the old order is taken into the new. It may evoke a renewal that is more psychic than external: the king is dead, long live the king.",
      es: "La Muerte puede marcar el fin de algo cuya hora ha llegado, y la imagen ya trae vida nueva: brotan retoños y lo que aún está vivo en el viejo orden se incorpora al nuevo. Puede evocar una renovación más psíquica que externa: el rey ha muerto, viva el rey.",
    },
  },
  {
    indice: 14,
    slug: "temperanca",
    fontes: [
      nichols(260, "não é vermelho nem azul, senão branco puro"),
      bendov(436, "Integração de opostos."),
    ],
    leitura: {
      pt: "A Temperança mistura opostos, como espírito e carne, consciente e inconsciente, e o líquido que corre entre os jarros não é vermelho nem azul, e sim branco puro, uma essência. Dois opostos como o fogo e a água não podem se confrontar de frente: pode evocar integração lenta, paciência e aperfeiçoamento.",
      en: "Temperance blends opposites, such as spirit and flesh, conscious and unconscious, and the liquid that flows between the jugs is neither red nor blue but pure white, an essence. Two opposites like fire and water cannot confront each other head on: it may evoke slow integration, patience and self-improvement.",
      es: "La Templanza mezcla opuestos, como espíritu y carne, consciente e inconsciente, y el líquido que corre entre las jarras no es rojo ni azul, sino blanco puro, una esencia. Dos opuestos como el fuego y el agua no pueden confrontarse de frente: puede evocar integración lenta, paciencia y perfeccionamiento.",
    },
  },
  {
    indice: 15,
    slug: "diabo",
    fontes: [
      nichols(275, "essa estranha fera interior, que projetamos no Diabo é, afinal de contas, Lúcifer, o Portador da Luz"),
      nichols(276, "Enquanto nos recusarmos a virar-nos e a enfrentar nossas sombras"),
      bendov(437, "Paradoxos e contradições."),
    ],
    leitura: {
      pt: "O Diabo pode aparecer como a estranha fera interior que projetamos fora: Lúcifer, o Portador da Luz, um anjo caído e, ainda assim, mensageiro. Enquanto nos recusarmos a enfrentar nossas sombras, não somos nem inteiramente humanos nem inteiramente livres. Pode evocar paradoxo, impulso e criatividade.",
      en: "The Devil may appear as the strange inner beast we project outward: Lucifer, the Light-Bearer, a fallen angel and yet a messenger. As long as we refuse to face our shadows, we are neither fully human nor fully free. It may evoke paradox, impulse and creativity.",
      es: "El Diablo puede aparecer como la extraña bestia interior que proyectamos hacia fuera: Lucifer, el Portador de la Luz, un ángel caído y aun así un mensajero. Mientras nos neguemos a enfrentar nuestras sombras, no somos ni del todo humanos ni del todo libres. Puede evocar paradoja, impulso y creatividad.",
    },
  },
  {
    indice: 16,
    slug: "torre",
    fontes: [
      nichols(295, "está sendo quebrada e aberta para libertar as duas"),
      nichols(298, "Todas as mudanças psíquicas importantes são experimentadas como atos de violência."),
      bendov(437, "Livrar-se de um confinamento."),
    ],
    leitura: {
      pt: "Na Torre, a construção rígida é quebrada como a casca de uma noz para libertar as duas sementes vivas, que caem rumo ao solo, onde podem criar raízes. Toda mudança psíquica importante é vivida como um ato de violência. Pode evocar o fim de um confinamento e um progresso repentino.",
      en: "In the Tower the rigid structure is cracked open like the shell of a nut to free the two living seeds, which fall toward the ground, where they may take root. Every important psychic change is felt as an act of violence. It may evoke the end of a confinement and sudden progress.",
      es: "En la Torre la estructura rígida se rompe como la cáscara de una nuez para liberar las dos semillas vivas, que caen hacia el suelo, donde pueden echar raíces. Todo cambio psíquico importante se vive como un acto de violencia. Puede evocar el fin de un encierro y un progreso repentino.",
    },
  },
  {
    indice: 17,
    slug: "estrela",
    fontes: [
      nichols(306, "o mundo desdobrará novas vistas sob um amplo céu estrelado"),
      bendov(437, "Pureza, honestidade."),
    ],
    leitura: {
      pt: "Depois da Torre, a Estrela abre uma nova dimensão de compreensão: o mundo deixa de ser visto pelas estreitas aberturas da torre e ganha novas vistas sob um amplo céu estrelado. A figura ajoelhada relaciona o acontecimento externo à situação interna. Pode evocar abertura, pureza e orientação intuitiva.",
      en: "After the Tower, the Star opens a new dimension of understanding: the world is no longer seen through the tower's narrow openings but gains new vistas under a wide starry sky. The kneeling figure relates the outer event to the inner situation. It may evoke openness, purity and intuitive guidance.",
      es: "Después de la Torre, la Estrella abre una nueva dimensión de comprensión: el mundo ya no se ve por las estrechas aberturas de la torre, sino que gana nuevas vistas bajo un amplio cielo estrellado. La figura arrodillada relaciona el acontecimiento externo con la situación interna. Puede evocar apertura, pureza y orientación intuitiva.",
    },
  },
  {
    indice: 18,
    slug: "lua",
    fontes: [
      nichols(326, "Este é o momento mais desolado da sua jornada."),
      bendov(437, "Ansiar por algo inacessível."),
    ],
    leitura: {
      pt: "A Lua pinta o momento mais desolado da jornada: um deserto sem estrela-guia, com plantas de ouro inacessíveis ao longe. Os pares (dois cães, duas torres, duas plantas) assinalam novas essências emergindo do inconsciente, e a travessia exige coragem. Pode evocar emoções profundas e o anseio por algo ainda inacessível.",
      en: "The Moon paints the most desolate moment of the journey: a desert with no guiding star and golden plants out of reach in the distance. The pairs (two dogs, two towers, two plants) mark new essences emerging from the unconscious, and the crossing takes courage. It may evoke deep emotions and longing for something still out of reach.",
      es: "La Luna pinta el momento más desolado del viaje: un desierto sin estrella guía, con plantas de oro inalcanzables a lo lejos. Los pares (dos perros, dos torres, dos plantas) señalan nuevas esencias que emergen del inconsciente, y la travesía exige valor. Puede evocar emociones profundas y el anhelo de algo todavía inalcanzable.",
    },
  },
  {
    indice: 19,
    slug: "sol",
    fontes: [
      nichols(339, "Quando esse novo sol nasce dentro de nós, faz que todo o espectro da realidade externa brilhe para nós com maior clareza do que nunca."),
      bendov(438, "Cura emocional ou física."),
    ],
    leitura: {
      pt: "Quando o sol nasce dentro de nós, toda a realidade externa passa a brilhar com mais clareza do que nunca, e o caminho para isso pode ser o jogo imaginativo. O Sol pode evocar luz, calor, cura, confiança e parceria, além do toque brincalhão de uma criança.",
      en: "When the sun rises within us, all outer reality shines more clearly than ever, and the way there can be imaginative play. The Sun may evoke light, warmth, healing, trust and partnership, along with the playful touch of a child.",
      es: "Cuando el sol nace dentro de nosotros, toda la realidad exterior brilla con más claridad que nunca, y el camino hacia eso puede ser el juego imaginativo. El Sol puede evocar luz, calor, curación, confianza y compañerismo, junto con el toque juguetón de un niño.",
    },
  },
  {
    indice: 20,
    slug: "julgamento",
    fontes: [
      nichols(349, "Dão as boas-vindas àquele que estava morto"),
      bendov(438, "Revelação, esclarecimento, um novo entendimento."),
    ],
    leitura: {
      pt: "No Julgamento, o som da trombeta convoca e a terra se contorce como num trabalho de parto, enquanto um homem e uma mulher dão as boas-vindas a quem estava morto, sepultado no inconsciente, e volta a uma vida nova. Pode evocar revelação, um novo entendimento e o nascimento de algo.",
      en: "In Judgement, the sound of the trumpet calls and the earth heaves as if in labour, while a man and a woman welcome the one who was dead, buried in the unconscious, returning to new life. It may evoke revelation, a new understanding and the birth of something.",
      es: "En el Juicio, el sonido de la trompeta convoca y la tierra se contorsiona como en un parto, mientras un hombre y una mujer dan la bienvenida a quien estaba muerto, sepultado en el inconsciente, y vuelve a una vida nueva. Puede evocar revelación, una nueva comprensión y el nacimiento de algo.",
    },
  },
  {
    indice: 21,
    slug: "mundo",
    fontes: [
      nichols(360, "Chegamos à culminação da longa jornada."),
      bendov(438, "Conclusão de um processo."),
    ],
    leitura: {
      pt: "O Mundo é a culminação da longa jornada: uma dançarina andrógina, que reúne em si o masculino e o feminino, com dois bastões, os polos da energia, dentro de uma grinalda viva de natureza consciente e inconsciente. Pode evocar conclusão, harmonia entre planos e a dança da vida.",
      en: "The World is the culmination of the long journey: an androgynous dancer who joins the masculine and the feminine within herself, holding two wands, the poles of energy, inside a living wreath of conscious and unconscious nature. It may evoke completion, harmony between planes and the dance of life.",
      es: "El Mundo es la culminación del largo viaje: una bailarina andrógina que reúne en sí lo masculino y lo femenino, con dos varas, los polos de la energía, dentro de una guirnalda viva de naturaleza consciente e inconsciente. Puede evocar conclusión, armonía entre planos y la danza de la vida.",
    },
  },
]

export const ARCANO_POR_INDICE = new Map(ARCANOS_MAIORES.map((a) => [a.indice, a]))

/** A versão exata do PDF do Nichols contra a qual páginas e trechos foram conferidos. */
export const PDF_NICHOLS = {
  arquivo: "data/pdfs/jung_tarot.pdf",
  sha256: "d409d4221cc97b0f81ed09e4805cf3807c63ad1591da968590ff64dfdb220eaa",
  paginas: 396,
} as const
