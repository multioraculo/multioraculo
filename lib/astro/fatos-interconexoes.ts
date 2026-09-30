/**
 * Os fatos de UMA pessoa em UM dia, com identificador e relevância.
 *
 * Fonte única para as três coisas que precisam concordar: o prompt, que recebe
 * esta lista e é proibido de sair dela; o verificador, que confere se o texto
 * se apoia nela; e o molde determinístico, que a transforma em frase quando
 * tudo o mais falha. Três fontes diferentes produziriam três verdades sobre o
 * mesmo dia.
 *
 * A `nota` vem do motor, não daqui. `interconexoesDoDia` já calcula relevância
 * a partir de exatidão, papel natal, peso do trânsito e fase, e é ela que
 * decide o que é principal. Reordenar por outro critério seria inventar uma
 * hierarquia que os cálculos não sustentam.
 *
 * Nada aqui interpreta. Cada entrada é uma medida dita em português — ou em
 * inglês, ou em espanhol: ESTAS FRASES SÃO LIDAS PELO LEITOR quando a geração
 * falha e o molde entra, então o idioma tem de ser o dele do começo ao fim.
 * Um fato meio em português dentro de um texto em inglês é um defeito visível.
 */
import type { Locale } from "@/lib/i18n/config"
import type { Interconexao } from "./interconexoes"
import type { MapaNatal } from "./mapa"
import { ASPECTOS, CORPOS, SIGNOS } from "./nomes"

export type TipoFatoPessoal = "interconexao" | "natal" | "ceu"

export type FatoPessoal = {
  /** f1, f2, … O modelo devolve estes ids ao dizer de onde tirou cada afirmação */
  id: string
  tipo: TipoFatoPessoal
  texto: string
  /** relevância do motor; 0 para fatos de contexto */
  nota: number
}

const num = (n: number, locale: Locale) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))
const signoDe = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30)
const grauNo = (lon: number) => (((lon % 360) + 360) % 360) % 30

/**
 * Em português o possessivo concorda com o corpo, e "seu Lua natal" é erro de
 * português numa frase que a pessoa lê. Inglês e espanhol não flexionam o
 * possessivo aqui, então a lista só vale para o português.
 */
const FEMININOS = new Set(["moon", "venus"])

/** Nome de um ponto natal: corpo ou ângulo. */
export function nomeDoPonto(id: string, locale: Locale): string {
  if (id === "asc") return locale === "en" ? "your Ascendant" : locale === "es" ? "tu Ascendente" : "seu Ascendente"
  if (id === "mc") return locale === "en" ? "your Midheaven" : locale === "es" ? "tu Medio Cielo" : "seu Meio do Céu"
  if (id.startsWith("casa")) {
    const n = id.slice(4)
    return locale === "en" ? `your house ${n}` : locale === "es" ? `tu casa ${n}` : `sua casa ${n}`
  }
  const nome = (CORPOS[locale] as Record<string, string>)[id] ?? id
  if (locale === "en") return `your natal ${nome}`
  if (locale === "es") return `tu ${nome} natal`
  return `${FEMININOS.has(id) ? "sua" : "seu"} ${nome} natal`
}

/** As palavras de ligação de cada idioma. O motor mede; isto só narra. */
const LIGACOES: Record<Locale, {
  retrogrado: string
  em: string
  a: string
  faz: string
  com: string
  orbe: (o: string, max: string) => string
  aproximando: string
  afastando: string
  casa: (n: number) => string
  /** a casa DO PONTO NATAL, que é o domínio da vida onde a relação toca */
  naCasa: (n: number) => string
  estaEm: string
  nasceuEm: (corpo: string, signo: string) => string
  semHora: string
}> = {
  pt: {
    retrogrado: "retrógrado",
    em: "em",
    a: "a",
    faz: "faz",
    com: "com",
    orbe: (o, max) => `com orbe de ${o}° (máximo ${max}°)`,
    aproximando: "ainda se aproximando",
    afastando: "já se afastando",
    casa: (n) => `na sua casa ${n}`,
    naCasa: (n) => `na casa ${n}`,
    estaEm: "está em",
    nasceuEm: (corpo, signo) => `${corpo} do seu nascimento está em ${signo}`,
    semHora: "a hora do nascimento não é conhecida, então não há Ascendente, Meio do Céu nem casas",
  },
  en: {
    retrogrado: "retrograde",
    em: "in",
    a: "at",
    faz: "makes a",
    com: "with",
    orbe: (o, max) => `with an orb of ${o}° (maximum ${max}°)`,
    aproximando: "still approaching",
    afastando: "already separating",
    casa: (n) => `in your house ${n}`,
    naCasa: (n) => `in house ${n}`,
    estaEm: "is in",
    nasceuEm: (corpo, signo) => `the ${corpo} of your birth is in ${signo}`,
    semHora: "the time of birth is not known, so there is no Ascendant, Midheaven or houses",
  },
  es: {
    retrogrado: "retrógrado",
    em: "en",
    a: "a",
    faz: "hace",
    com: "con",
    orbe: (o, max) => `con orbe de ${o}° (máximo ${max}°)`,
    aproximando: "aún acercándose",
    afastando: "ya alejándose",
    casa: (n) => `en tu casa ${n}`,
    naCasa: (n) => `en la casa ${n}`,
    estaEm: "está en",
    nasceuEm: (corpo, signo) => `${corpo} de tu nacimiento está en ${signo}`,
    semHora: "la hora de nacimiento no se conoce, así que no hay Ascendente, Medio Cielo ni casas",
  },
}

/** Uma interconexão dita por extenso, com tudo que o motor mediu. */
export function frasearInterconexao(c: Interconexao, locale: Locale): string {
  const L = LIGACOES[locale]
  const transito = (CORPOS[locale] as Record<string, string>)[c.transito] ?? c.transito
  const ponto = nomeDoPonto(c.ponto.id, locale)
  const aspecto = (ASPECTOS[locale] as Record<string, string>)[c.aspecto] ?? c.aspecto
  const ritmo = c.aplicativo ? L.aproximando : L.afastando
  // o retrógrado entra entre vírgulas e JÁ FECHA a sua: quem vem depois não põe
  // outra, ou sai "Netuno, retrógrado,, em Áries"
  const retro = c.retroTransito ? `, ${L.retrogrado},` : ""

  const signo = SIGNOS[locale][signoDe(c.lonTransito)]
  const grau = num(grauNo(c.lonTransito), locale)
  const casa = c.casa !== null ? `, ${L.casa(c.casa)}` : ""

  if (c.tipo === "posicao") {
    return `${transito}${retro} ${L.estaEm} ${signo}, ${L.a} ${grau}°${casa}`
  }

  // A CASA DO PONTO NATAL É O DOMÍNIO DA VIDA em que a relação toca, e é o
  // único fato aqui que permite descer do mecanismo para a experiência sem
  // inventar nada: uma Lua natal na casa 7 não é a mesma coisa que uma Lua
  // natal na casa 4. O motor já calculou essa casa; faltava dizê-la.
  // Ângulo não leva casa: o Ascendente estar na casa 1 não informa ninguém.
  const casaNatal = c.ponto.tipo === "corpo" && c.ponto.casa !== null ? ` ${L.naCasa(c.ponto.casa)}` : ""

  return `${transito}${retro} ${L.em} ${signo} ${L.a} ${grau}°, ${L.faz} ${aspecto} ${L.com} ${ponto}${casaNatal}, ${L.orbe(num(c.orbe, locale), num(c.orbeMax, locale))}, ${ritmo}${casa}`
}

export function fatosPessoais(params: {
  mapa: MapaNatal
  escolhidas: Interconexao[]
  locale: Locale
}): FatoPessoal[] {
  const { mapa, escolhidas, locale } = params
  const L = LIGACOES[locale]
  const fatos: FatoPessoal[] = []
  const põe = (tipo: TipoFatoPessoal, texto: string, nota: number) =>
    fatos.push({ id: `f${fatos.length + 1}`, tipo, texto, nota })

  // as interconexões primeiro, em ordem de relevância: é a ordem que o prompt
  // e o verificador leem como hierarquia
  for (const c of [...escolhidas].sort((a, b) => b.nota - a.nota)) {
    põe("interconexao", frasearInterconexao(c, locale), c.nota)
  }

  // o mapa, só nos pontos que a leitura pode nomear
  for (const corpo of mapa.corpos) {
    if (!["sun", "moon"].includes(corpo.corpo)) continue
    const nome = (CORPOS[locale] as Record<string, string>)[corpo.corpo] ?? corpo.corpo
    põe("natal", L.nasceuEm(nome, SIGNOS[locale][signoDe(corpo.lon)]), 0)
  }
  if (mapa.asc !== null) {
    põe("natal", `${nomeDoPonto("asc", locale)} ${L.estaEm} ${SIGNOS[locale][signoDe(mapa.asc)]}`, 0)
  }
  if (mapa.mc !== null) {
    põe("natal", `${nomeDoPonto("mc", locale)} ${L.estaEm} ${SIGNOS[locale][signoDe(mapa.mc)]}`, 0)
  }

  if (!mapa.horaConhecida) põe("natal", L.semHora, 0)

  return fatos
}
