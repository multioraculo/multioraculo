/**
 * Os fatos de um movimento, um a um, com identificador.
 *
 * Existe para duas coisas que precisam concordar: o prompt de reparo, que
 * recebe esta lista e é proibido de usar qualquer coisa fora dela, e o
 * fallback determinístico, que monta o texto a partir dela. Fossem duas fontes
 * diferentes, o reparo poderia citar um fato que o fallback não conhece, e a
 * mesma relação diria coisas diferentes conforme o caminho.
 *
 * Nada aqui é interpretação. Cada entrada é uma medida do motor dita em
 * português: o signo em que um corpo está, o grau, o ângulo, o orbe, a
 * regência, o que mais aquele corpo faz hoje. O que significa é problema de
 * quem escreve, e é o verificador quem julga.
 *
 * O `tipo` é a mesma taxonomia de âncora que o verificador usa para exigir
 * cobertura. É por isso que ele é nomeado e não livre: contar tipos é como se
 * mede se uma explicação está apoiada em fato ou flutuando.
 */
import type { Locale } from "@/lib/i18n/config"
import type { CardMovimento } from "./apresentar"
import { SIGNOS } from "./nomes"

export type TipoDeFato = "signo" | "grau" | "movimento" | "angulo" | "regencia" | "contexto" | "evento"

export type Fato = {
  /** estável dentro de um card: f1, f2, … O modelo devolve estes ids ao citar */
  id: string
  tipo: TipoDeFato
  texto: string
}

const numero = (n: number, locale: Locale) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","))

export function fatosDoCard(card: CardMovimento, signoLeitor: number, locale: Locale): Fato[] {
  const fatos: Fato[] = []
  const põe = (tipo: TipoDeFato, texto: string) => fatos.push({ id: `f${fatos.length + 1}`, tipo, texto })
  const signoDoLeitor = SIGNOS[locale][signoLeitor]

  for (const lado of [card.a, card.b]) {
    if (!lado) continue
    põe("signo", `${lado.nome} está em ${lado.nomeSigno}`)
    põe("grau", `${lado.nome} está a ${lado.grauTexto} de ${lado.nomeSigno}`)
    if (lado.retrogrado) põe("movimento", `${lado.nome} está retrógrado, refazendo caminho já andado`)
    if (lado.regente) põe("regencia", `${lado.nome} rege ${signoDoLeitor}`)
  }

  if (card.aspecto && card.b && card.anguloReal !== null) {
    põe("angulo", `${card.a.nome} e ${card.b.nome} estão a ${numero(card.anguloReal, locale)} graus um do outro`)
    if (card.orbe !== null) {
      const ritmo = card.aplicativo ? "ainda se aproximando" : "já se afastando"
      põe("angulo", `o orbe é de ${numero(card.orbe, locale)} graus, ${ritmo}`)
    }
  }

  if (card.tipo === "evento" && card.tituloSemSigno) põe("evento", card.tituloSemSigno)

  for (const linha of card.contexto) põe("contexto", linha)

  return fatos
}

/** Quantos TIPOS distintos de fato este card oferece. O verificador exige cobertura proporcional. */
export function tiposDisponiveis(fatos: Fato[]): TipoDeFato[] {
  return [...new Set(fatos.map((f) => f.tipo))]
}
