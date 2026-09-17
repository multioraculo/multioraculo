/**
 * O prompt do horóscopo do dia. Recebe os movimentos já calculados e já
 * traduzidos em palavras nossas, e devolve instruções.
 *
 * O modelo escreve quatro coisas e mais nada: a pergunta do dia, a polaridade
 * de cada relação, a explicação de cada relação e as tendências do fim. Nome
 * de planeta, grau, orbe, símbolo e tradução do ângulo já chegam prontos.
 * Nenhuma posição astrológica nasce aqui.
 *
 * Os movimentos vão numerados, não por id: modelo copiando string longa erra
 * (mediu-se: truncava `aspecto:venus~pluto:square` em `aspecto:venus~pluto`).
 * Ele cita números, e o código traduz de volta.
 */
import type { Locale } from "@/lib/i18n/config"
import { languageRule } from "@/lib/oracles/language"
import type { CardMovimento } from "./apresentar"
import { EXPRESSOES_EVITAR, REGRAS_COMUNS } from "./editorial"
import { CORPOS, SIGNOS } from "./nomes"
import { LINHA_SIGNO, REGENTE, SOMBRA_SIGNO } from "./simbolos"

export type RelacaoEscrita = { n: number; polaridade: [string, string]; explicacao: string }

export type Leitura = {
  foco: string
  relacoes: RelacaoEscrita[]
  tendencias: { texto: string; disponivel: string; emJogo: string }
}

export const SISTEMA_HOROSCOPO: Record<Locale, string> = {
  pt: "Responda apenas com JSON válido, sem Markdown. Todo texto destinado ao leitor é escrito em português do Brasil.",
  en: "Respond only with valid JSON, no Markdown. All text addressed to the reader is written in English.",
  es: "Responde solo con JSON válido, sin Markdown. Todo el texto dirigido al lector se escribe en español.",
}

export function promptHoroscopo(params: {
  dia: string
  signo: number
  cards: CardMovimento[]
  locale: Locale
}): { system: string; user: string } {
  const { dia, signo, cards, locale } = params
  const nomeSigno = SIGNOS[locale][signo]
  const regente = CORPOS[locale][REGENTE[signo]]

  const lista = cards
    .map((card, i) => {
      const linhas = [`[${i + 1}] ${card.titulo.toUpperCase()} (${card.detalhe})`]
      linhas.push(`    ${card.a.nome}: ${card.a.funcoes}${card.a.regente ? ` (${card.a.rotuloRegente})` : ""}`)
      linhas.push(`    o que ${card.a.nome} faz: ${card.a.verbos.join(", ")}`)
      if (card.b) {
        linhas.push(`    ${card.b.nome}: ${card.b.funcoes}${card.b.regente ? ` (${card.b.rotuloRegente})` : ""}`)
        linhas.push(`    o que ${card.b.nome} faz: ${card.b.verbos.join(", ")}`)
      }
      linhas.push(`    o que esta relação estabelece: ${card.glosa}`)
      return linhas.join("\n")
    })
    .join("\n\n")

  const user = `Escreva a leitura do dia ${dia} para quem é de ${nomeSigno}.

O SIGNO
${nomeSigno}: ${LINHA_SIGNO[locale][signo]}
Excesso possível, quando essa força passa do ponto: ${SOMBRA_SIGNO[locale][signo]}. Isso não é defeito de ninguém e não se diz ao leitor como rótulo; é o outro lado da mesma qualidade.
Regente: ${regente}. Quando o regente aparece nos movimentos, a leitura passa por ele com mais peso.

OS MOVIMENTOS DO CÉU DE HOJE
Calculados. Não existe nada além destes, e as palavras de cada planeta e de cada ângulo já estão definidas: use essas, não outras.

${lista}

${REGRAS_COMUNS}
11. Estas expressões reprovam o texto inteiro. Não use nenhuma delas, em campo nenhum: ${EXPRESSOES_EVITAR[locale].map((e) => `"${e}"`).join(", ")}.

O QUE VOCÊ ESCREVE

1. "foco": de três a dez palavras, nascido do CONJUNTO dos movimentos. Prefira uma pergunta. Precisa ser entendida por quem não sabe nada de astrologia e precisa ser específica deste céu: se serve para qualquer dia, está errada. Rótulo abstrato não serve ("Equilíbrio entre pensamento e estrutura" não diz o que está em jogo); a pergunta que aquele conflito faz, sim ("Até onde continuar refinando?"). Não pode conter nome de planeta, de signo nem de aspecto.

2. "relacoes": uma entrada para cada movimento, na ordem, com o número dele.
   - "polaridade": dois lados, cada um de duas a seis palavras, em linguagem comum. Cada lado é uma AÇÃO ou uma EXIGÊNCIA, não um rótulo: dá para ver o que aquele lado quer fazer. O primeiro diz o que uma força quer; o segundo, o que a outra exige dela. Dois conceitos abstratos em oposição não servem ("Profundidade emocional × escolhas racionais" são dois rótulos, não duas forças); o que serve é do tipo "Continuar analisando × chegar a uma conclusão", em que se enxerga o conflito. Sem nome de planeta, de signo ou de aspecto. E não repita os verbos dos dois planetas: eles já estão na tela, na coluna logo acima da polaridade. "Distinguir e examinar × Delimitar e concluir" devolve ao leitor o que ele acabou de ler; a polaridade precisa dizer o que essa relação exige de quem é deste signo.
     Num movimento de POSIÇÃO não há duas forças em ângulo, e por isso a polaridade não pode sair de duas palavras quaisquer: a tensão está entre o que aquele planeta traz ao atravessar o signo e o excesso do próprio signo, listado acima. É de lá que sai o segundo lado.
   - "explicacao": de três a cinco frases, respondendo quatro coisas na ordem natural: o que o primeiro planeta faz aqui; o que o segundo faz (quando houver dois); o que este ângulo estabelece entre os dois; por que isso ganha esse sentido ao passar por ${nomeSigno}, usando as palavras que definem o signo. Cite os planetas pelo nome e o signo pelo nome. A tradução do ângulo já está na tela logo acima da sua explicação: não a parafraseie, parta dela. A última frase é a mais importante: ela nomeia a tensão concreta que isso cria neste signo, com as palavras do próprio signo. Não termine com "destaca a importância de", "ressalta a necessidade de" nem "sublinha o valor de": isso não diz nada.

3. "tendencias": o fecho da página.
   - "texto": um parágrafo de 60 a 100 palavras que reúne os movimentos numa leitura só, mostrando o que eles têm em comum. Não repita as explicações nem a pergunta do foco; diga o que os três formam juntos. Cuidado com a descrição do ângulo: oposição não é dois planetas "trabalhando juntos". Nada de "o céu convida", "pede atenção especial", "é fundamental": descreva, não exorte.
   - "disponivel": de quatro a dezoito palavras. O que esta configuração torna disponível.
   - "emJogo": de quatro a dezoito palavras. O que ela cobra. Precisa ser diferente da linha anterior, não a mesma ideia com outras palavras.
   As duas últimas descrevem, não aconselham: nada de verbo no imperativo, nada de "aproveite", "evite", "procure".

${languageRule(locale)}

LEMBRETE FINAL: nenhuma destas expressões pode aparecer em campo nenhum, nem no meio de uma frase: ${EXPRESSOES_EVITAR[locale].map((e) => `"${e}"`).join(", ")}. Nenhum travessão. Nenhuma forma da palavra "arquétipo".

Devolva JSON exatamente nesta forma:
{"foco": "...", "relacoes": [{"n": 1, "polaridade": ["...", "..."], "explicacao": "..."}], "tendencias": {"texto": "...", "disponivel": "...", "emJogo": "..."}}`

  return { system: SISTEMA_HOROSCOPO[locale], user }
}
