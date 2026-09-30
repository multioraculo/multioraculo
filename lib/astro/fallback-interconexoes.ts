/**
 * A síntese pessoal escrita sem modelo nenhum, só com os fatos.
 *
 * Último degrau: quando a geração reprova e os reparos também, a pessoa que
 * pagou não pode ficar sem nada. Em vez de entregar nada, entrega-se menos.
 *
 * É DESCRIÇÃO, NÃO INTERPRETAÇÃO. Cada frase põe em português uma medida que o
 * motor já fez: o trânsito, o ponto natal, o ângulo, o orbe, a direção, a casa.
 * Nada de "fase de transformação" nem "momento de crescimento" — essas frases
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
import type { FatoPessoal } from "./fatos-interconexoes"
import type { SintesePessoal } from "./prompt-interconexoes"

const ABERTURA: Record<Locale, string> = {
  pt: "Hoje o céu encontra o seu mapa assim:",
  en: "Today the sky meets your chart like this:",
  es: "Hoy el cielo encuentra tu mapa así:",
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
    .filter((f) => f.tipo === "interconexao")
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

  const afirmacoes = principais.map((f) => ({ texto: frase(f.texto).replace(/\.$/, ""), fato: f.id }))
  const sintese = [ABERTURA[locale], ...principais.map((f) => frase(f.texto))].join(" ")

  return { afirmacoes, sintese }
}
