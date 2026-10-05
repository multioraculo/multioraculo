/**
 * A referência estruturada dos búzios, um Odu por queda.
 *
 * POR QUE ELA EXISTE. A busca lexical devolvia uma janela de página: em média
 * 2,6 Odus por trecho, dos quais ~1,6 não tinham sido sorteados. E cobria mal:
 * em 16 de 40 leituras as duas quedas deram Odus DIFERENTES e só um recebeu
 * referência; em 5 leituras nenhuma das duas recebeu nada. A ficha resolve as
 * duas coisas de uma vez, porque é indexada pelo número de búzios abertos —
 * que é exatamente o que o sorteio produz.
 *
 * O QUE ELA NÃO É. Não é interpretação nova. Os dois polos são os da fonte,
 * recortados por número de Odu; o nome e o Orixá vêm da segunda tabela do
 * mesmo arquivo, que é chaveada por quantidade de búzios. Os campos temáticos
 * dessa segunda tabela (Amor, Trabalho, Dinheiro, Família, Espiritual) ficam
 * de fora de propósito: entrariam como conteúdo novo.
 *
 * O índice vem de `scripts/extrair-odus.mjs`, que roda uma vez. A extração não
 * entra em `pdfs.index.json` — ela LÊ o índice aprovado e grava um módulo.
 */
import type { Locale } from "@/lib/i18n"
import type { Evidence } from "./evidence"
import type { DrawItem } from "./draw"
import { ODUS_FICHAS, ODUS_FONTE, type FichaDeOdu } from "./odus-fichas"

const POR_ABERTOS = new Map<number, FichaDeOdu>(ODUS_FICHAS.map((f) => [f.abertos, f]))

/** Quantos dos 17 resultados possíveis (0..16 búzios abertos) têm ficha. */
export const ODUS_COBERTOS = POR_ABERTOS.size

/**
 * LACUNA CONHECIDA: o resultado 0 (nenhum búzio aberto, "Oyaku" na fonte) não
 * tem ficha. A tabela existe para ele, mas é a última linha e a fonte não
 * marca ali a fronteira entre os dois polos — o recorte engoliria o cabeçalho
 * do documento e a tabela seguinte. Em vez de inventar a separação, o material
 * fica sem ficha e o verificador registra a lacuna. Probabilidade do caso:
 * (1/2)^16 por queda, cerca de 1 em 65.536.
 */
export const ODUS_SEM_FICHA = [0] as const

export function fichaDoOdu(abertos: number): FichaDeOdu | undefined {
  return POR_ABERTOS.get(abertos)
}

const ROTULO: Record<Locale, { positivo: string; negativo: string; orixa: string; duas: string; queda: string }> = {
  pt: { positivo: "polo positivo", negativo: "polo negativo", orixa: "Orixá", duas: "saiu nas duas quedas", queda: "queda" },
  en: { positivo: "positive pole", negativo: "negative pole", orixa: "Orixá", duas: "came up in both throws", queda: "throw" },
  es: { positivo: "polo positivo", negativo: "polo negativo", orixa: "Orixá", duas: "salió en las dos tiradas", queda: "tirada" },
}

/**
 * Uma entrada por ODU DISTINTO sorteado, e não por queda.
 *
 * Duas quedas diferentes dão duas fichas. Duas quedas no mesmo Odu dão UMA,
 * marcada como tal — repetir o mesmo texto não acrescenta informação e daria
 * ao Odu repetido o dobro do volume dos outros sem nenhuma razão.
 */
export function referenciaDosBuzios(itens: DrawItem[], locale: Locale): Evidence[] {
  const r = ROTULO[locale]
  const saida: Evidence[] = []
  const jaPosto = new Map<number, number>() // abertos -> itemIndex da ficha já emitida
  itens.forEach((item, i) => {
    const sym = item.sym as { kind: "odu"; open: number }
    if (sym?.kind !== "odu") return
    if (jaPosto.has(sym.open)) {
      // mesmo Odu numa queda anterior: marca a repetição na entrada que já existe
      const idx = jaPosto.get(sym.open)!
      const alvo = saida.find((e) => e.itemIndex === idx)
      if (alvo && !alvo.excerpt.includes(r.duas)) alvo.excerpt = `${alvo.excerpt} · ${r.duas}`
      return
    }
    const ficha = fichaDoOdu(sym.open)
    if (!ficha) return
    jaPosto.set(sym.open, i)
    saida.push({
      source: `${ODUS_FONTE}, ${ficha.abertos} búzios abertos`,
      excerpt: `${ficha.odu} (${r.orixa}: ${ficha.orixa}) · ${r.positivo}: ${ficha.positivo} · ${r.negativo}: ${ficha.negativo}`,
      itemIndex: i,
    })
  })
  return saida
}
