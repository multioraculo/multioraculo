/**
 * Os TEMAS da sinastria e a que tema pertence um contato: a parte LEVE do mapa de eixos.
 *
 * Separado de `eixos-sinastria.ts` porque a tela também usa (para agrupar o resumo por tema), e a tela não pode
 * puxar o repertório do Davison que o resto do mapa de eixos importa. Aqui só há tabela e uma função pura.
 * Os rótulos e perguntas são EDITORIAIS e vão ao prompt em português; a tela os traz traduzidos do dicionário.
 */

export type TemaId =
  | "reconhecimento"
  | "acolhimento"
  | "troca"
  | "atracao"
  | "iniciativa"
  | "expansao"
  | "seguranca"
  | "autonomia"
  | "idealizacao"
  | "intensidade"

/**
 * A pergunta simbólica de cada tema. EDITORIAL: é um rótulo do Multioráculo,
 * não uma citação do livro. Vai ao prompt em português, e o modelo o diz no
 * idioma de saída.
 */
export const TEMAS: Record<TemaId, { rotulo: string; pergunta: string }> = {
  reconhecimento: { rotulo: "reconhecimento e complementaridade", pergunta: "o que cada um é e o que cada um precisa, e se um se vê refletido no outro" },
  acolhimento: { rotulo: "acolhimento e necessidades emocionais", pergunta: "como cada um sente, se acalma e se sente seguro, e como o outro responde a isso" },
  troca: { rotulo: "troca e compreensão", pergunta: "como cada um pensa e fala, e se o que um diz chega ao outro como foi dito" },
  atracao: { rotulo: "atração e afeto", pergunta: "o que cada um deseja e valoriza, e como isso aproxima ou desencontra" },
  iniciativa: { rotulo: "iniciativa e confronto", pergunta: "como cada um age e afirma a vontade, e o que acontece quando duas vontades se encontram" },
  expansao: { rotulo: "expansão e estímulo", pergunta: "o que um amplia no outro, e onde o entusiasmo vira excesso" },
  seguranca: { rotulo: "segurança, estrutura e compromisso", pergunta: "o que sustenta o vínculo e o que o contém, entre firmar uma base e sentir-se limitado" },
  autonomia: { rotulo: "autonomia e proximidade", pergunta: "quanto de liberdade, novidade e ruptura o vínculo suporta sem perder a ligação" },
  idealizacao: { rotulo: "idealização e projeção", pergunta: "o que cada um enxerga no outro além do que ele é, e onde o ideal e o real se separam" },
  intensidade: { rotulo: "intensidade, poder e transformação", pergunta: "onde o vínculo toca o que é mais profundo e vulnerável, e como o poder entre os dois se distribui" },
}

/** Os planetas lentos dão o tema ao contato: a pergunta mais lenta é a que estrutura o encontro. Ordem de prioridade. */
const LENTOS: Array<[string, TemaId]> = [
  ["pluto", "intensidade"],
  ["neptune", "idealizacao"],
  ["uranus", "autonomia"],
  ["saturn", "seguranca"],
  ["jupiter", "expansao"],
]

/**
 * A que tema pertence um contato entre corpos. EDITORIAL. Um planeta lento
 * (de Júpiter a Plutão) dá o tema; entre planetas pessoais, quem é de Mercúrio
 * é troca, Vênus e Marte são atração (juntos) ou, Marte sozinho, iniciativa; a
 * Lua que não caiu em nada disso é acolhimento; Sol, Ascendente e Meio do Céu
 * são reconhecimento.
 */
export function temaDoContato(corpos: string[]): TemaId {
  for (const [corpo, tema] of LENTOS) if (corpos.includes(corpo)) return tema
  const tem = (c: string) => corpos.includes(c)
  if (tem("mercury")) return "troca"
  if (tem("venus") && tem("mars")) return "atracao"
  if (tem("mars")) return "iniciativa"
  if (tem("venus")) return tem("moon") ? "acolhimento" : "atracao"
  if (tem("moon") && !tem("sun") && !tem("asc") && !tem("mc")) return "acolhimento"
  return "reconhecimento"
}

/** Os corpos de um fato: "A.uranus~B.sun:quincunx" → [uranus, sun]; "A.jupiter@B.casa3" → [jupiter]. */
export function corposDoFato(id: string): string[] {
  const asp = /^[AB]\.(\w+)~[AB]\.(\w+):/.exec(id)
  if (asp) return [asp[1], asp[2]]
  const ov = /^[AB]\.(\w+)@[AB]\./.exec(id)
  return ov ? [ov[1]] : []
}
