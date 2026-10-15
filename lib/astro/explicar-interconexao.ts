/**
 * O que uma interconexão quer dizer PARA A PESSOA, em linguagem comum.
 *
 * O cartão mostrava definições soltas ("duas forças sem nada em comum", "um
 * tema que volta para revisão"). Eram verdadeiras e não diziam nada a quem não
 * sabe astrologia: faltava ligar o ângulo aos DOIS corpos daquela relação e à
 * vida de quem lê. Aqui a frase é montada com as três peças: o que o céu de
 * hoje traz, o que isso encontra em você e de que jeito encontra.
 *
 * Tudo é texto fixo, escrito uma vez e traduzido. Nada vem de modelo: a mesma
 * relação diz sempre a mesma coisa, e nada aqui afirma acontecimento.
 */
import type { Locale } from "@/lib/i18n/config"
import type { Interconexao } from "./interconexoes"
import { CORPOS, RETROGRADO } from "./nomes"

/** O que o corpo de hoje traz, como substantivo singular: "O céu de hoje traz {…}". */
const TRAZ: Record<Locale, Record<string, string>> = {
  pt: {
    sun: "um pedido de clareza e direção",
    moon: "uma onda de sentimento",
    mercury: "um movimento de ideias e conversas",
    venus: "um desejo de prazer e aproximação",
    mars: "um impulso de agir",
    jupiter: "um sopro de ampliação e confiança",
    saturn: "uma cobrança de limite e responsabilidade",
    uranus: "um impulso de mudança e liberdade",
    neptune: "uma maré de imaginação e sensibilidade",
    pluto: "uma pressão por mudança profunda",
  },
  en: {
    sun: "a call for clarity and direction",
    moon: "a wave of feeling",
    mercury: "a stir of ideas and conversation",
    venus: "a pull toward pleasure and closeness",
    mars: "a push to act",
    jupiter: "a breath of widening and trust",
    saturn: "a demand for limits and responsibility",
    uranus: "a push for change and freedom",
    neptune: "a tide of imagination and sensitivity",
    pluto: "pressure for deep change",
  },
  es: {
    sun: "un pedido de claridad y dirección",
    moon: "una ola de sentimiento",
    mercury: "un movimiento de ideas y conversaciones",
    venus: "un deseo de placer y cercanía",
    mars: "un impulso de actuar",
    jupiter: "un soplo de ampliación y confianza",
    saturn: "una exigencia de límite y responsabilidad",
    uranus: "un impulso de cambio y libertad",
    neptune: "una marea de imaginación y sensibilidad",
    pluto: "una presión por un cambio profundo",
  },
}

/** O que aquele ponto é EM VOCÊ. */
const EM_VOCE: Record<Locale, Record<string, string>> = {
  pt: {
    sun: "o seu centro e a direção que você dá à vida",
    moon: "os seus afetos e a sua necessidade de se sentir seguro",
    mercury: "o seu jeito de pensar e de falar",
    venus: "o que você valoriza e o seu jeito de criar vínculo",
    mars: "a sua vontade de agir e de se afirmar",
    jupiter: "a sua confiança e o sentido que você dá às coisas",
    saturn: "os seus limites e as suas responsabilidades",
    uranus: "a sua necessidade de liberdade",
    neptune: "a sua imaginação e a sua sensibilidade",
    pluto: "a sua intensidade e o que em você precisa mudar de forma",
    asc: "o jeito como você se apresenta ao mundo",
    mc: "a sua carreira e o lugar que você quer ocupar",
  },
  en: {
    sun: "your centre and the direction you give your life",
    moon: "your feelings and your need to feel safe",
    mercury: "the way you think and speak",
    venus: "what you value and the way you bond",
    mars: "your drive to act and assert yourself",
    jupiter: "your trust and the meaning you give things",
    saturn: "your limits and responsibilities",
    uranus: "your need for freedom",
    neptune: "your imagination and sensitivity",
    pluto: "your intensity and what in you needs to change shape",
    asc: "the way you present yourself to the world",
    mc: "your career and the place you want to hold",
  },
  es: {
    sun: "tu centro y la dirección que le das a tu vida",
    moon: "tus afectos y tu necesidad de sentirte a salvo",
    mercury: "tu manera de pensar y de hablar",
    venus: "lo que valoras y tu manera de crear vínculo",
    mars: "tus ganas de actuar y de afirmarte",
    jupiter: "tu confianza y el sentido que le das a las cosas",
    saturn: "tus límites y tus responsabilidades",
    uranus: "tu necesidad de libertad",
    neptune: "tu imaginación y tu sensibilidad",
    pluto: "tu intensidad y lo que en ti necesita cambiar de forma",
    asc: "la manera como te presentas al mundo",
    mc: "tu carrera y el lugar que quieres ocupar",
  },
}

/**
 * "em" e "de" diante de artigo contraem em português: "no seu centro", "do seu
 * centro". Sem isto a frase sai "em o seu centro", que ninguém escreve.
 */
function contrai(prep: "em" | "de", v: string): string {
  const m = v.match(/^(o|a|os|as)\s/)
  if (!m) return `${prep} ${v}`
  const junto = (prep === "em" ? "n" : "d") + m[1]
  return `${junto}${v.slice(m[1].length)}`
}

/** Como o que chega encontra o que é seu, por ângulo. */
const ENCONTRO: Record<Locale, Record<string, (traz: string, voce: string) => string>> = {
  pt: {
    conjunction: (t, v) => `O céu de hoje traz ${t} que cai bem em cima ${contrai("de", v)}: as duas coisas se misturam, e fica difícil separar uma da outra.`,
    opposition: (t, v) => `O céu de hoje traz ${t} que fica de frente para ${v}: uma coisa puxa para um lado e a outra para o lado oposto, e é nesse confronto que você enxerga o que está faltando.`,
    square: (t, v) => `O céu de hoje traz ${t} que esbarra ${contrai("em", v)}: dá atrito, e é desse atrito que alguma coisa se mexe.`,
    trine: (t, v) => `O céu de hoje traz ${t} que reforça ${v} sem esforço: as coisas fluem, e o risco é só deixar passar sem perceber.`,
    sextile: (t, v) => `O céu de hoje traz ${t} que combina com ${v}, mas só rende se você fizer a ponte entre as duas coisas.`,
    quincunx: (t, v) => `O céu de hoje traz ${t} que não encaixa direito ${contrai("em", v)}: não é briga, é desajuste, como duas peças de jogos diferentes que precisam de um ajuste para caber.`,
  },
  en: {
    conjunction: (t, v) => `Today's sky brings ${t} that lands right on ${v}: the two blend, and it is hard to tell one from the other.`,
    opposition: (t, v) => `Today's sky brings ${t} that stands opposite ${v}: one pulls one way and the other the opposite way, and that face-off shows you what is missing.`,
    square: (t, v) => `Today's sky brings ${t} that runs into ${v}: there is friction, and that friction is what gets something moving.`,
    trine: (t, v) => `Today's sky brings ${t} that supports ${v} without effort: things flow, and the only risk is letting it pass unnoticed.`,
    sextile: (t, v) => `Today's sky brings ${t} that goes well with ${v}, but it only pays off if you build the bridge between them.`,
    quincunx: (t, v) => `Today's sky brings ${t} that does not quite fit ${v}: it is not a fight, it is a mismatch, like two pieces from different puzzles that need adjusting to fit.`,
  },
  es: {
    conjunction: (t, v) => `El cielo de hoy trae ${t} que cae justo sobre ${v}: las dos cosas se mezclan, y cuesta separar una de la otra.`,
    opposition: (t, v) => `El cielo de hoy trae ${t} que queda frente a ${v}: una cosa tira hacia un lado y la otra hacia el opuesto, y en ese enfrentamiento ves lo que falta.`,
    square: (t, v) => `El cielo de hoy trae ${t} que choca con ${v}: hay fricción, y de esa fricción algo se mueve.`,
    trine: (t, v) => `El cielo de hoy trae ${t} que refuerza ${v} sin esfuerzo: las cosas fluyen, y el único riesgo es dejarlo pasar sin notarlo.`,
    sextile: (t, v) => `El cielo de hoy trae ${t} que combina con ${v}, pero solo rinde si tú haces el puente entre las dos cosas.`,
    quincunx: (t, v) => `El cielo de hoy trae ${t} que no encaja bien en ${v}: no es pelea, es desajuste, como dos piezas de juegos distintos que necesitan un ajuste para caber.`,
  },
}

const LIGA: Record<Locale, {
  ondeAparece: (area: string, n: number) => string
  travessia: (traz: string, n: number, area: string) => string
  aplicativo: string
  separativo: string
  retrogrado: (corpo: string, palavra: string) => string
}> = {
  pt: {
    ondeAparece: (a, n) => `Isso tende a aparecer em ${a}, porque esse ponto do seu mapa fica na casa ${n}.`,
    travessia: (t, n, a) => `O céu de hoje traz ${t} que passa pela casa ${n} do seu mapa, a área de ${a}: é ali que isso tende a aparecer.`,
    aplicativo: "Ainda está se aproximando do ponto exato, então tende a ganhar força.",
    separativo: "Já passou do ponto exato, então tende a perder força aos poucos.",
    retrogrado: (c, p) => `${c} está ${p}: visto daqui, parece andar para trás no céu. Por isso o que ele traz tende a ser revisão de algo que você já conhece, mais do que novidade.`,
  },
  en: {
    ondeAparece: (a, n) => `This tends to show up in ${a}, because that point of your chart sits in house ${n}.`,
    travessia: (t, n, a) => `Today's sky brings ${t} that moves through house ${n} of your chart, the area of ${a}: that is where it tends to show up.`,
    aplicativo: "It is still approaching the exact point, so it tends to grow stronger.",
    separativo: "It has already passed the exact point, so it tends to fade little by little.",
    retrogrado: (c, p) => `${c} is ${p}: seen from here, it seems to move backwards in the sky. So what it brings tends to be a review of something you already know, more than something new.`,
  },
  es: {
    ondeAparece: (a, n) => `Esto tiende a aparecer en ${a}, porque ese punto de tu carta está en la casa ${n}.`,
    travessia: (t, n, a) => `El cielo de hoy trae ${t} que pasa por la casa ${n} de tu carta, el área de ${a}: es ahí donde tiende a aparecer.`,
    aplicativo: "Todavía se está acercando al punto exacto, así que tiende a ganar fuerza.",
    separativo: "Ya pasó el punto exacto, así que tiende a perder fuerza poco a poco.",
    retrogrado: (c, p) => `${c} está ${p}: visto desde aquí, parece andar hacia atrás en el cielo. Por eso lo que trae tiende a ser revisión de algo que ya conoces, más que novedad.`,
  },
}

const minuscula = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)

export type Explicacao = {
  /** o que o encontro quer dizer para quem lê, e onde ele tende a aparecer */
  sentido: string
  /** se ganha ou perde força, e o retrógrado quando houver */
  momento: string
}

/**
 * @param areaDaCasa o nome da área de cada casa, do dicionário (`houseMeaning`),
 * para o cartão e o guia das casas dizerem a mesma coisa
 */
export function explicarInterconexao(
  c: Interconexao,
  locale: Locale,
  areaDaCasa: (n: number) => string | undefined,
): Explicacao {
  const L = LIGA[locale]
  const traz = TRAZ[locale][c.transito] ?? ""
  const partes: string[] = []

  if (c.tipo === "posicao" && c.casa !== null) {
    partes.push(L.travessia(traz, c.casa, minuscula(areaDaCasa(c.casa) ?? "")))
  } else {
    const voce = EM_VOCE[locale][c.ponto.id] ?? ""
    const encontro = ENCONTRO[locale][c.aspecto]
    if (encontro) partes.push(encontro(traz, voce))
    const casa = c.ponto.tipo === "corpo" ? c.ponto.casa : null
    const area = casa !== null ? areaDaCasa(casa) : undefined
    if (casa !== null && area) partes.push(L.ondeAparece(minuscula(area), casa))
  }

  const momento: string[] = []
  if (c.tipo === "aspecto") momento.push(c.aplicativo ? L.aplicativo : L.separativo)
  if (c.retroTransito) {
    const nome = (CORPOS[locale] as Record<string, string>)[c.transito] ?? c.transito
    momento.push(L.retrogrado(nome, RETROGRADO[locale].retrograde))
  }

  return { sentido: partes.join(" "), momento: momento.join(" ") }
}
