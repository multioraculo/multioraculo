/**
 * O vocabulário simbólico do horóscopo: o que cada signo põe em movimento, o
 * que cada planeta faz, e o que cada ângulo estabelece entre duas forças.
 *
 * Tudo aqui é texto NOSSO, escrito uma vez e traduzido, nunca gerado por
 * modelo. A IA recebe estas palavras prontas e escreve apenas a relação entre
 * elas. É o que mantém o vocabulário estável entre os doze signos e impede
 * que a leitura mude de régua de um dia para o outro.
 *
 * Duas escolhas que valem registro:
 *
 *  - a base conceitual é simbólica e de inspiração junguiana, mas a palavra
 *    "arquétipo" não aparece em nada que o usuário lê. A teoria fica na
 *    estrutura, não na tela;
 *  - a tradução do aspecto é DEFINIÇÃO, não interpretação. Por isso mora no
 *    código: ninguém precisa saber astrologia para ler a página, e nenhum
 *    modelo precisa inventar o que oposição significa.
 */
import type { Locale } from "@/lib/i18n/config"
import type { Corpo } from "./ceu"

/**
 * Classes de corpo. Moram aqui, e não junto do motor, porque a tela também
 * precisa delas (para separar o fundo coletivo) e não pode arrastar o motor
 * astronômico para o pacote do navegador.
 */
export const PESSOAIS = new Set<Corpo>(["mercury", "venus", "mars"])
export const LENTOS = new Set<Corpo>(["uranus", "neptune", "pluto"])

/** Regência moderna, que é a chave primária de relevância. */
export const REGENTE: Corpo[] = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "pluto", "jupiter", "saturn", "uranus", "neptune",
]

/** Regência tradicional, secundária. Coincide com a moderna em oito signos. */
export const REGENTE_TRADICIONAL: Corpo[] = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
]

/** 0 fogo, 1 terra, 2 ar, 3 água. */
export const ELEMENTO = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]

/** 0 cardinal, 1 fixo, 2 mutável. */
export const MODO = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2]

/** O que o signo põe em movimento. Não é descrição de personalidade. */
export const LINHA_SIGNO: Record<Locale, string[]> = {
  pt: [
    "Início · impulso · afirmação · coragem do primeiro gesto",
    "Sustentação · valor · raiz · forma do que dura",
    "Ligação · nome · circulação · curiosidade pelo que passa",
    "Acolhimento · memória · pertencimento · cuidado do que é frágil",
    "Centro · criação · presença · gesto que se mostra",
    "Discernimento · ordem · refinamento · cuidado · medida",
    "Relação · equilíbrio · composição · medida do outro",
    "Profundidade · transformação · intensidade · o que não se negocia",
    "Sentido · amplitude · busca · o que excede o dado",
    "Construção · responsabilidade · duração · obra que resiste ao tempo",
    "Distância · ruptura · coletivo · desvio que abre caminho",
    "Dissolução · compaixão · imaginação · o que não tem contorno",
  ],
  en: [
    "Beginning · impulse · assertion · courage of the first move",
    "Holding · worth · root · the form of what lasts",
    "Linking · naming · circulation · curiosity for what passes",
    "Shelter · memory · belonging · care for what is fragile",
    "Centre · creation · presence · the gesture that shows itself",
    "Discernment · order · refinement · care · measure",
    "Relation · balance · composition · the measure of the other",
    "Depth · transformation · intensity · what is not negotiable",
    "Meaning · breadth · search · what exceeds the given",
    "Building · responsibility · duration · work that resists time",
    "Distance · rupture · the collective · the deviation that opens a way",
    "Dissolution · compassion · imagination · what has no outline",
  ],
  es: [
    "Inicio · impulso · afirmación · coraje del primer gesto",
    "Sostén · valor · raíz · forma de lo que dura",
    "Enlace · nombre · circulación · curiosidad por lo que pasa",
    "Acogida · memoria · pertenencia · cuidado de lo frágil",
    "Centro · creación · presencia · gesto que se muestra",
    "Discernimiento · orden · refinamiento · cuidado · medida",
    "Relación · equilibrio · composición · medida del otro",
    "Profundidad · transformación · intensidad · lo que no se negocia",
    "Sentido · amplitud · búsqueda · lo que excede lo dado",
    "Construcción · responsabilidad · duración · obra que resiste al tiempo",
    "Distancia · ruptura · lo colectivo · el desvío que abre camino",
    "Disolución · compasión · imaginación · lo que no tiene contorno",
  ],
}

/** Os três substantivos que aparecem sob o nome do planeta no card. */
export const FUNCAO_NOMES: Record<Locale, Record<Corpo, string>> = {
  pt: {
    sun: "centro · direção · consciência",
    moon: "ritmo · afeto · memória",
    mercury: "pensamento · linguagem · distinção",
    venus: "valor · escolha · vínculo",
    mars: "ação · impulso · afirmação",
    jupiter: "sentido · amplitude · confiança",
    saturn: "limite · estrutura · forma",
    uranus: "ruptura · súbito · liberdade",
    neptune: "dissolução · imaginação · entrega",
    pluto: "profundidade · transformação · intensidade",
  },
  en: {
    sun: "centre · direction · awareness",
    moon: "rhythm · feeling · memory",
    mercury: "thought · language · distinction",
    venus: "worth · choice · bond",
    mars: "action · drive · assertion",
    jupiter: "meaning · breadth · trust",
    saturn: "limit · structure · form",
    uranus: "rupture · suddenness · freedom",
    neptune: "dissolution · imagination · surrender",
    pluto: "depth · transformation · intensity",
  },
  es: {
    sun: "centro · dirección · conciencia",
    moon: "ritmo · afecto · memoria",
    mercury: "pensamiento · lenguaje · distinción",
    venus: "valor · elección · vínculo",
    mars: "acción · impulso · afirmación",
    jupiter: "sentido · amplitud · confianza",
    saturn: "límite · estructura · forma",
    uranus: "ruptura · súbito · libertad",
    neptune: "disolución · imaginación · entrega",
    pluto: "profundidad · transformación · intensidad",
  },
}

/** Os três verbos da coluna: é neles que o contraste do card fica visível. */
export const FUNCAO_VERBOS: Record<Locale, Record<Corpo, string[]>> = {
  pt: {
    sun: ["orientar", "dar direção", "tornar consciente"],
    moon: ["sentir", "embalar", "guardar"],
    mercury: ["distinguir", "examinar", "nomear"],
    venus: ["escolher", "dar valor", "vincular"],
    mars: ["agir", "avançar", "afirmar"],
    jupiter: ["ampliar", "significar", "confiar"],
    saturn: ["delimitar", "estruturar", "concluir"],
    uranus: ["romper", "desprender", "surpreender"],
    neptune: ["dissolver", "imaginar", "entregar"],
    pluto: ["aprofundar", "expor", "transformar"],
  },
  en: {
    sun: ["orient", "give direction", "make conscious"],
    moon: ["feel", "hold", "remember"],
    mercury: ["distinguish", "examine", "name"],
    venus: ["choose", "value", "bond"],
    mars: ["act", "advance", "assert"],
    jupiter: ["widen", "give meaning", "trust"],
    saturn: ["limit", "structure", "conclude"],
    uranus: ["break", "detach", "surprise"],
    neptune: ["dissolve", "imagine", "surrender"],
    pluto: ["deepen", "expose", "transform"],
  },
  es: {
    sun: ["orientar", "dar dirección", "hacer consciente"],
    moon: ["sentir", "acunar", "guardar"],
    mercury: ["distinguir", "examinar", "nombrar"],
    venus: ["elegir", "dar valor", "vincular"],
    mars: ["actuar", "avanzar", "afirmar"],
    jupiter: ["ampliar", "significar", "confiar"],
    saturn: ["delimitar", "estructurar", "concluir"],
    uranus: ["romper", "desprender", "sorprender"],
    neptune: ["disolver", "imaginar", "entregar"],
    pluto: ["profundizar", "exponer", "transformar"],
  },
}

export const SIMBOLO_ASPECTO: Record<string, string> = {
  conjunction: "☌",
  opposition: "☍",
  square: "□",
  trine: "△",
  sextile: "⚹",
  quincunx: "⚻",
}

export const ANGULO_ASPECTO: Record<string, number> = {
  conjunction: 0,
  opposition: 180,
  square: 90,
  trine: 120,
  sextile: 60,
  quincunx: 150,
}

/**
 * O que o ângulo estabelece entre duas forças, em linguagem comum. Ninguém
 * precisa saber o que é uma quadratura para ler a página.
 */
export const GLOSA_ASPECTO: Record<Locale, Record<string, string>> = {
  pt: {
    conjunction: "duas forças no mesmo ponto: agem juntas, sem distância para observar uma da outra",
    opposition: "duas forças frente a frente: cada uma mostra o que falta na outra",
    square: "duas forças que se atravessam: nenhuma avança sem que a outra ceda",
    trine: "duas forças do mesmo tipo: passam uma pela outra sem atrito, e por isso podem virar automatismo",
    sextile: "duas forças que combinam quando alguém as coloca em contato: não acontece sozinho",
    quincunx: "duas forças sem nada em comum: não se contradizem, mas também não se ajustam sozinhas",
  },
  en: {
    conjunction: "two forces at the same point: they act together, with no distance to see one from the other",
    opposition: "two forces face to face: each one shows what the other lacks",
    square: "two forces that cross each other: neither moves on unless the other gives way",
    trine: "two forces of the same kind: they pass through each other without friction, and can turn into automatism",
    sextile: "two forces that combine when someone puts them in contact: it does not happen on its own",
    quincunx: "two forces with nothing in common: they do not contradict each other, but they do not adjust on their own either",
  },
  es: {
    conjunction: "dos fuerzas en el mismo punto: actúan juntas, sin distancia para observarse",
    opposition: "dos fuerzas frente a frente: cada una muestra lo que a la otra le falta",
    square: "dos fuerzas que se cruzan: ninguna avanza sin que la otra ceda",
    trine: "dos fuerzas del mismo tipo: pasan una por la otra sin fricción, y por eso pueden volverse automatismo",
    sextile: "dos fuerzas que combinan cuando alguien las pone en contacto: no ocurre solo",
    quincunx: "dos fuerzas sin nada en común: no se contradicen, pero tampoco se ajustan solas",
  },
}

/** Os modificadores que, sem tradução, o leitor não teria como entender. */
export const GLOSA_MOVIMENTO: Record<Locale, { aplicativo: string; separativo: string; retrogrado: string }> = {
  pt: {
    aplicativo: "o encontro ainda está se formando, o ponto exato vem adiante",
    separativo: "o ponto exato já passou, e o que ele moveu segue em curso",
    retrogrado: "movimento aparente para trás, um tema que volta para revisão",
  },
  en: {
    aplicativo: "the meeting is still forming, the exact point is ahead",
    separativo: "the exact point has passed, and what it set in motion is still running",
    retrogrado: "apparent backward motion, a theme that comes back for review",
  },
  es: {
    aplicativo: "el encuentro todavía se está formando, el punto exacto viene adelante",
    separativo: "el punto exacto ya pasó, y lo que movió sigue en curso",
    retrogrado: "movimiento aparente hacia atrás, un tema que vuelve para revisión",
  },
}

export const ROTULO_REGENTE: Record<Locale, (signo: string) => string> = {
  pt: (signo) => "regente de " + signo,
  en: (signo) => "ruler of " + signo,
  es: (signo) => "regente de " + signo,
}
