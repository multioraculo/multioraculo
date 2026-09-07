/**
 * Instruções de idioma para os modelos e textos de servidor que chegam ao
 * usuário. Os prompts em si continuam escritos em português (o modelo
 * entende); o que muda é a ordem explícita sobre o idioma da SAÍDA, escrita
 * NO PRÓPRIO idioma de saída para contrabalançar o viés do prompt e das
 * referências em português, e a terminologia tradicional de cada sistema.
 *
 * Para adicionar um idioma: acrescente uma entrada em cada tabela abaixo.
 */

import type { Locale } from "@/lib/i18n/config"

/** Bloco colado nos prompts dos oráculos e da síntese (escrito no idioma de saída) */
export function languageRule(locale: Locale): string {
  return LANGUAGE_RULE[locale]
}

const LANGUAGE_RULE: Record<Locale, string> = {
  pt: `IDIOMA DA RESPOSTA: escreva TODO o texto destinado ao usuário em português do Brasil, como um falante nativo culto escreveria. Use a terminologia tradicional em português: arcanos, cartas invertidas, hexagrama, linhas mutantes, Julgamento e Imagem, Futhark Antigo, Odu, Orixá, mesa de nove cartas.`,
  en: `OUTPUT LANGUAGE (mandatory): write EVERYTHING addressed to the user in natural, idiomatic English, as an educated native speaker would. The instructions above and the reference excerpts may be in Portuguese; do NOT let a single Portuguese or Spanish sentence, word or expression into your output, and do not translate literally: adapt rhythm and esoteric vocabulary to the English-speaking tradition. Use the standard English terminology of each system: Major/Minor Arcana, reversed cards, Celtic Cross positions, hexagram, moving lines, the Judgment and the Image, Elder Futhark, Odu and Orisha, nine-card spread (Lenormand). Card, rune and hexagram names are given in English in the draw; use them exactly as written.`,
  es: `IDIOMA DE LA RESPUESTA (obligatorio): escribe TODO el texto dirigido al usuario en español natural e idiomático, como lo haría un hablante nativo culto. Las instrucciones anteriores y los fragmentos de referencia pueden estar en portugués; NO dejes pasar ni una sola frase, palabra o expresión en portugués o inglés, y no traduzcas literalmente: adapta el ritmo y el vocabulario esotérico a la tradición hispanohablante. Usa la terminología tradicional en español de cada sistema: arcanos mayores y menores, cartas invertidas, posiciones de la Cruz Celta, hexagrama, líneas mutantes, el Dictamen y la Imagen, Futhark Antiguo, Odu y Orixá, mesa de nueve cartas (Lenormand). Los nombres de cartas, runas y hexagramas ya vienen en español en la tirada; úsalos exactamente como están escritos.`,
}

/** Mensagem de sistema da chamada de cada oráculo (no idioma de saída) */
export const ORACLE_SYSTEM_MESSAGE: Record<Locale, string> = {
  pt: "Responda apenas com JSON válido, sem Markdown. Os campos 'meanings', 'notes' e 'reading' devem ser escritos em português do Brasil. Os símbolos da tiragem já estão definidos e não podem ser alterados.",
  en: "Respond only with valid JSON, no Markdown. The fields 'meanings', 'notes' and 'reading' must be written entirely in English, even though the instructions and reference excerpts may be in Portuguese. The drawn symbols are fixed and must not be changed.",
  es: "Responde solo con JSON válido, sin Markdown. Los campos 'meanings', 'notes' y 'reading' deben estar escritos íntegramente en español, aunque las instrucciones y los fragmentos de referencia estén en portugués. Los símbolos de la tirada ya están definidos y no pueden cambiarse.",
}

/** Lembrete curto colado no fim do prompt de cada oráculo (no idioma de saída) */
export const ORACLE_FINAL_REMINDER: Record<Locale, string> = {
  pt: "LEMBRETE FINAL: 'meanings', 'notes' e 'reading' inteiramente em português do Brasil.",
  en: "FINAL REMINDER: 'meanings', 'notes' and 'reading' entirely in English. Not one sentence in Portuguese, even when the reference excerpts are in Portuguese.",
  es: "RECORDATORIO FINAL: 'meanings', 'notes' y 'reading' íntegramente en español. Ni una frase en portugués, aunque los fragmentos de referencia estén en portugués.",
}

/** Mensagem de sistema da síntese (no idioma de saída) */
export const SYNTHESIS_SYSTEM_MESSAGE: Record<Locale, string> = {
  pt: "Escreva apenas a síntese em texto corrido, sem títulos, sem seções e sem bullets, em português do Brasil.",
  en: "Write only the synthesis as running prose, with no headings, sections or bullet points, entirely in English.",
  es: "Escribe solo la síntesis en prosa continua, sin títulos, sin secciones y sin viñetas, íntegramente en español.",
}

/** Resposta enviada quando o classificador detecta risco real de vida */
export const SAFETY_RESPONSE: Record<Locale, string> = {
  pt: `Preciso pausar aqui.

O que você escreveu me indica que você pode estar num momento de dor muito real — e agora a coisa mais importante não é uma tiragem. É você.

Se você está pensando em se machucar ou em não querer mais estar aqui, por favor entre em contato agora com o CVV: ligue **188** (gratuito, 24 horas, todos os dias). Se estiver em risco imediato, ligue para o **SAMU (192)** ou vá ao pronto-socorro mais próximo.

Você não precisa passar por isso sozinho.`,
  en: `I need to pause here.

What you wrote suggests you may be in a moment of very real pain — and right now the most important thing is not a reading. It is you.

If you are thinking about hurting yourself or about not wanting to be here anymore, please reach out now to a crisis line in your country (in the United States, call or text **988**; in the UK and Ireland, the Samaritans at **116 123**; in Brazil, CVV at **188**). If you are in immediate danger, call your local emergency number or go to the nearest emergency room.

You do not have to go through this alone.`,
  es: `Necesito hacer una pausa aquí.

Lo que escribiste me indica que puedes estar en un momento de dolor muy real — y ahora lo más importante no es una tirada. Eres tú.

Si estás pensando en hacerte daño o en no querer seguir aquí, por favor comunícate ahora con una línea de ayuda en tu país (en España, el **024**; en Argentina, el **135**; en México, la Línea de la Vida **800 911 2000**; en Brasil, el CVV **188**). Si estás en peligro inmediato, llama al número de emergencias local o acude al servicio de urgencias más cercano.

No tienes que pasar por esto en soledad.`,
}
