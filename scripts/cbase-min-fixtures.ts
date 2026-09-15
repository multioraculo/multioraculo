/**
 * Peças compartilhadas pela proteção de regressão da síntese C-base-min
 * (scripts/verify-cbase-min.ts) e pela geração de scripts/cbase-min.golden.json.
 */
import { createHash } from "crypto"
import { drawAll } from "../lib/oracles/draw"
import { renderDraw } from "../lib/oracles/localize"
import { ORACLE_ORDER } from "../lib/oracles/synthesis"
import { cbaseMinSynthesisPrompt, methodFacts, type CBaseMinMaterial } from "../lib/oracles/synthesis-cbase-min"
import { buildCBaseMinMaterial, ORACLE_SOURCES } from "../lib/oracles/references"
import type { Locale } from "../lib/i18n"

export const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex")

/** Itens (posição e nome) dos cinco oráculos para um seed, como a pessoa vê. */
export function renderedItems(seed: string, locale: Locale) {
  const draws = drawAll(seed)
  return ORACLE_ORDER.map((k) => [k, renderDraw(draws[k], locale).items.map((it) => [it.position ?? null, it.name])])
}

export const itemsDigest = (seed: string, locale: Locale) => sha256(JSON.stringify(renderedItems(seed, locale)))

/**
 * Material com trechos de referência fictícios: exercita todo o prompt
 * (regras de synthesisPrompt, ordem, estilo por seed, idioma, fatos do método,
 * formatação dos trechos e as duas linhas do C-base-min) sem precisar do índice.
 */
export function fixtureMaterial(seed: string, locale: Locale): CBaseMinMaterial {
  const draws = drawAll(seed)
  return Object.fromEntries(
    ORACLE_ORDER.map((k) => {
      const rendered = renderDraw(draws[k], locale)
      const evidence = [
        ...rendered.items.slice(0, 3).map((it, i) => ({ source: "fixture.pdf", excerpt: `trecho\n de   teste ${i}: ${it.name}`, itemIndex: i })),
        { source: "fixture.pdf", excerpt: "trecho sem item" },
      ]
      return [k, { method: ORACLE_SOURCES[k].method, items: rendered.items, facts: methodFacts(k, draws, rendered), evidence }]
    })
  ) as CBaseMinMaterial
}

export const fixturePromptDigest = (question: string, seed: string, locale: Locale) =>
  sha256(cbaseMinSynthesisPrompt(question, fixtureMaterial(seed, locale), locale, seed))

/** Prompt com os trechos reais do índice (exige data/pdfs_index/pdfs.index.json). */
export async function realPromptDigest(question: string, seed: string, locale: Locale) {
  return sha256(cbaseMinSynthesisPrompt(question, await buildCBaseMinMaterial(question, seed, locale), locale, seed))
}
