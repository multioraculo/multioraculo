/**
 * A referência estruturada do I Ching, pela hierarquia que a fonte prescreve.
 *
 * POR QUE ELA EXISTE. A busca lexical cobria 2,0 das ~3,5 unidades sorteadas e
 * 23% das referências citavam hexagramas que não saíram. A causa, medida: o
 * `pdfs.index.json` aprovado guarda, para este arquivo, o prefácio, a
 * introdução acadêmica, o aparato de "Fields of meaning" e a CONCORDÂNCIA
 * final — e a concordância é organizada por palavra-chave inglesa, com cada
 * entrada citando dezenas de coordenadas `NN.La/b` de hexagramas diferentes.
 * Buscar nela devolve material de hexagrama não sorteado por construção.
 *
 * A HIERARQUIA É A DO LIVRO, não nossa. Ele prescreve, nas instruções:
 *   "your answer consists of: • all the sections of your primary hexagram,
 *    except the Transforming Lines section; • in the Transforming Lines
 *    section the texts referring to the specific transforming lines you have
 *    got; • the Image of the Situation and the Outer and Inner Trigram section
 *    of your potential hexagram."
 * Daí: hexagrama inicial → somente as linhas móveis sorteadas → hexagrama
 * resultante. Nenhuma linha não sorteada, nenhum hexagrama vizinho.
 *
 * UMA UNIDADE, NÃO TRÊS VOTOS. As entradas saem rotuladas e na ordem da
 * transformação, para que a síntese leia um movimento e não três opiniões
 * independentes do mesmo sistema.
 *
 * IDIOMA. O texto fica no original (inglês), como a ficha do tarô fica em
 * português e a das runas em inglês; só os rótulos e o nome do hexagrama são
 * localizados, e o nome vem da tabela do produto POR NÚMERO.
 */
import type { Locale } from "@/lib/i18n"
import type { Evidence } from "./evidence"
import type { DrawItem } from "./draw"
import { HEXAGRAMS, HEXAGRAMS_EN } from "./draw"
import { ICHING_FICHAS, ICHING_FONTE, type FichaDeHexagrama } from "./iching-fichas"

const POR_NUMERO = new Map<number, FichaDeHexagrama>(ICHING_FICHAS.map((f) => [f.numero, f]))

/** Quantos dos 64 hexagramas têm ficha. 64 é o esperado. */
export const HEXAGRAMAS_COBERTOS = POR_NUMERO.size
/** Quantas das 384 linhas têm texto. 384 é o esperado. */
export const LINHAS_COBERTAS = ICHING_FICHAS.reduce((a, f) => a + f.linhas.length, 0)

export function fichaDoHexagrama(n: number): FichaDeHexagrama | undefined {
  return POR_NUMERO.get(n)
}

const ROTULO: Record<Locale, { inicial: string; linha: string; resultante: string; semMutacao: string }> = {
  pt: { inicial: "hexagrama inicial", linha: "linha móvel", resultante: "hexagrama resultante", semMutacao: "sem linhas mutantes: não há hexagrama resultante" },
  en: { inicial: "primary hexagram", linha: "transforming line", resultante: "resulting hexagram", semMutacao: "no transforming lines: there is no resulting hexagram" },
  es: { inicial: "hexagrama inicial", linha: "línea móvil", resultante: "hexagrama resultante", semMutacao: "sin líneas móviles: no hay hexagrama resultante" },
}

/** O nome do hexagrama no idioma do produto, por NÚMERO. Nunca por fuzzy match. */
function nomeDoHexagrama(n: number, locale: Locale): string {
  if (locale === "en") return HEXAGRAMS_EN[n - 1]
  // pt e es têm tabelas próprias em localize.ts; aqui basta o nome canônico pt,
  // que é o que o resto do material já usa quando não há tabela específica
  return HEXAGRAMS[n - 1].name
}

const TETO_DO_TRECHO = 320
const limpa = (s: string) => s.replace(/\s+/g, " ").trim()

function porFrases(texto: string, teto: number): string {
  const t = limpa(texto)
  if (t.length <= teto) return t
  const frases = t.split(/(?<=[.;!?])\s+/).filter(Boolean)
  let saida = frases[0] ?? t
  for (const f of frases.slice(1)) {
    if (saida.length + 1 + f.length > teto) break
    saida += " " + f
  }
  return saida
}

/**
 * Uma entrada por UNIDADE SORTEADA, na ordem da transformação.
 *
 * O `itemIndex` segue o dos itens do sorteio, que já vêm nessa ordem:
 * primary, depois uma entrada por linha móvel, depois resulting.
 */
export function referenciaDoIChing(itens: DrawItem[], locale: Locale): Evidence[] {
  const r = ROTULO[locale]
  const saida: Evidence[] = []
  // o hexagrama inicial, para rotular as linhas com o hexagrama a que pertencem
  const primeiro = itens.find((it) => {
    const s = it.sym as { kind?: string; role?: string }
    return s?.kind === "hexagram" && s.role === "primary"
  })
  const nPrimario = primeiro ? (primeiro.sym as { number: number }).number : null

  itens.forEach((item, i) => {
    const sym = item.sym as { kind: string; number?: number; role?: string; n?: number; value?: 6 | 9 }

    if (sym?.kind === "hexagram" && typeof sym.number === "number") {
      const f = fichaDoHexagrama(sym.number)
      if (!f) return
      const papel = sym.role === "resulting" ? r.resultante : r.inicial
      saida.push({
        source: `${ICHING_FONTE}, p. ${f.pagina}`,
        excerpt: porFrases(`${papel} ${f.numero} ${nomeDoHexagrama(f.numero, locale)}: ${f.base}`, TETO_DO_TRECHO),
        itemIndex: i,
      })
      return
    }

    if (sym?.kind === "line" && typeof sym.n === "number" && nPrimario != null) {
      const f = fichaDoHexagrama(nPrimario)
      const l = f?.linhas.find((x) => x.linha === sym.n)
      if (!f || !l) return
      // a linha sorteada tem de ter a polaridade que o sorteio deu: 9 móvel é
      // yang virando yin, 6 móvel é yin virando yang. Se divergir, a ficha não
      // é dessa linha e nada é enviado — melhor lacuna que linha errada.
      if (sym.value !== l.valor) return
      const corpo = l.comentario ? `${l.texto} — ${l.comentario}` : l.texto
      saida.push({
        source: `${ICHING_FONTE}, p. ${l.pagina}`,
        excerpt: porFrases(`${r.linha} ${l.linha} ${l.valor === 9 ? "(nine)" : "(six)"} do hexagrama ${f.numero}: ${corpo}`, TETO_DO_TRECHO),
        itemIndex: i,
      })
    }
  })
  return saida
}

/** Conferência de coerência entre as fichas e a tabela do motor. */
export function divergenciasIChing(): string[] {
  const out: string[] = []
  for (let n = 1; n <= 64; n++) {
    const f = fichaDoHexagrama(n)
    if (!f) { out.push(`hexagrama ${n}: sem ficha`); continue }
    if (f.linhas.length !== 6) out.push(`hexagrama ${n}: ${f.linhas.length} linhas`)
    const nosso = HEXAGRAMS[n - 1].pinyin
    if (f.pinyin !== nosso) out.push(`hexagrama ${n}: ficha diz pinyin "${f.pinyin}", tabela diz "${nosso}"`)
  }
  return out
}
