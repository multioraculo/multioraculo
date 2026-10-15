/**
 * A síntese pessoal escrita sem modelo nenhum, só com os fatos.
 *
 * Último degrau: quando a geração reprova e os reparos também, a pessoa que
 * pagou não pode ficar sem nada. Em vez de entregar nada, entrega-se menos.
 *
 * É DESCRIÇÃO, NÃO INTERPRETAÇÃO. Cada frase diz quais forças o motor mediu se
 * encontrando, com o sentido fixo de cada uma (`NUCLEO`) e a definição fixa do
 * ângulo (`GLOSA_ASPECTO`); as medidas em si ficam nos cartões. Nada de "fase de transformação" nem "momento de crescimento" — essas frases
 * existem justamente para caber em qualquer dia, que é o contrário do que este
 * texto precisa ser.
 *
 * Em compensação ela é curta e verdadeira, e diz de quem é: "o Urano de hoje
 * sobre o seu Ascendente" só vale para quem tem aquele Ascendente.
 *
 * NÃO TEM AUTORIDADE POR SER DETERMINÍSTICA: passa pelo mesmo verificador que
 * o texto gerado, e se reprovar não é usada.
 */
import type { Locale } from "@/lib/i18n/config"
import { nomeDoPonto, type FatoPessoal } from "./fatos-interconexoes"
import type { SintesePessoal } from "./prompt-interconexoes"
import { CORPOS } from "./nomes"
import { GLOSA_ASPECTO, NUCLEO, TERRENO_DA_CASA } from "./simbolos"

const ABERTURA: Record<Locale, string> = {
  pt: "Hoje o céu encontra o seu mapa assim.",
  en: "Today the sky meets your chart like this.",
  es: "Hoy el cielo encuentra tu mapa así.",
}

/**
 * As frases do molde. Falam das forças, como o texto gerado: o que a de hoje
 * traz, o que ela encontra na pessoa e de que natureza é o encontro. Nome de
 * aspecto, signo, casa e grau ficam nos cartões, que é onde o verificador
 * exige que fiquem.
 */
const MOLDE: Record<Locale, {
  liga: string[]
  encontro: (corpo: string, nucleo: string, ponto: string, nucleoPonto: string) => string
  travessia: (corpo: string, nucleo: string, terreno: string) => string
}> = {
  pt: {
    liga: ["", "Ao mesmo tempo,", "E"],
    encontro: (c, n, p, np) => `${c} traz ${n}, e encontra ${p}, que é ${np}`,
    travessia: (c, n, t) => `${c} traz ${n}, e passa pela parte do seu mapa ligada a ${t}`,
  },
  en: {
    liga: ["", "At the same time,", "And"],
    encontro: (c, n, p, np) => `${c} brings ${n}, and meets ${p}, which is ${np}`,
    travessia: (c, n, t) => `${c} brings ${n}, and moves through the part of your chart tied to ${t}`,
  },
  es: {
    liga: ["", "Al mismo tiempo,", "Y"],
    encontro: (c, n, p, np) => `${c} trae ${n}, y encuentra ${p}, que es ${np}`,
    travessia: (c, n, t) => `${c} trae ${n}, y pasa por la parte de tu mapa ligada a ${t}`,
  },
}

/** Primeira letra maiúscula, e ponto final se faltar. */
function frase(texto: string): string {
  const t = texto.trim().replace(/\.$/, "")
  return `${t.charAt(0).toUpperCase()}${t.slice(1)}.`
}

export function sinteseDeterministica(fatos: FatoPessoal[], locale: Locale): SintesePessoal {
  // só as interconexões entram, e em ordem de relevância: os fatos natais são
  // contexto, e repeti-los aqui encheria linguiça com dado que a tela já mostra
  const principais = fatos
    .filter((f) => f.tipo === "interconexao" && f.chaves)
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 3)

  if (principais.length === 0) {
    // sem interconexão relevante, a síntese honesta é dizer isso
    const vazio: Record<Locale, string> = {
      pt: "Hoje nenhum trânsito chega perto o bastante dos pontos do seu mapa para contar como encontro.",
      en: "Today no transit comes close enough to your chart's points to count as a meeting.",
      es: "Hoy ningún tránsito se acerca lo suficiente a los puntos de tu mapa para contar como encuentro.",
    }
    return { afirmacoes: [], sintese: vazio[locale] }
  }

  const M = MOLDE[locale]
  const nomes = CORPOS[locale] as Record<string, string>
  const afirmacoes: SintesePessoal["afirmacoes"] = []
  const partes: string[] = [ABERTURA[locale]]

  principais.forEach((f, i) => {
    const k = f.chaves!
    const corpo = nomes[k.transito] ?? k.transito
    const nucleo = NUCLEO[locale][k.transito] ?? ""
    const miolo = k.ponto.startsWith("casa")
      ? M.travessia(corpo, nucleo, TERRENO_DA_CASA[locale][Number(k.ponto.slice(4)) - 1] ?? "")
      : M.encontro(corpo, nucleo, nomeDoPonto(k.ponto, locale), NUCLEO[locale][k.ponto] ?? "")
    const principal = frase(`${M.liga[i] ?? M.liga[2]} ${miolo}`.trim())
    afirmacoes.push({ texto: principal.replace(/\.$/, ""), fato: f.id })
    partes.push(principal)
    // a natureza do encontro, que é o que o nome do aspecto diria a quem sabe
    if (k.aspecto && GLOSA_ASPECTO[locale][k.aspecto]) partes.push(frase(GLOSA_ASPECTO[locale][k.aspecto]))
  })

  return { afirmacoes, sintese: partes.join(" ") }
}
