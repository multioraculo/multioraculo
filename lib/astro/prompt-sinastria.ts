/**
 * O prompt da síntese de sinastria, e o schema da resposta.
 *
 * ESTE ARQUIVO NÃO CHAMA MODELO NENHUM. Só monta o texto e descreve a forma da
 * resposta. A geração real depende de aprovação.
 *
 * O prompt consome EXCLUSIVAMENTE o `PayloadSinastria`: fatos calculados,
 * evidência selecionada e núcleos operacionais. Nunca o repertório inteiro, e
 * nunca um fato que o seletor descartou. O que não está no payload não existe
 * para o texto, e é por isso que a regra de ouro pode ser cobrada.
 *
 * Duas decisões que governam o resto:
 *
 *  - O MODELO NÃO COMPLETA ASTROLOGIA. Nenhum planeta, aspecto, casa, signo,
 *    elemento ou modo pode ser dito se não está na lista, e cada parágrafo
 *    declara de que evidência saiu, para o verificador poder conferir.
 *  - NENHUM BLOCO EXISTE À FORCA. Os blocos temáticos são decididos por código
 *    (`blocosElegiveis`); fora deles a resposta tem `null`. "Pontos em comum"
 *    só existe se houver semelhança com material do livro.
 */
import type { Locale } from "@/lib/i18n/config"
import { EXPRESSOES_EVITAR } from "./editorial"
import { BLOCOS, BLOCOS_OBRIGATORIOS, ENFASE_POR_VINCULO, type DinamicaNoPayload, type IdDeBloco, type PayloadSinastria } from "./payload-sinastria"

// ── o schema da resposta ─────────────────────────────────────────────────────

export type ParagrafoSinastria = {
  texto: string
  /** os ids de dinâmica, de fato ou de semelhança de onde o parágrafo saiu; pelo menos um */
  evidencias: string[]
}
export type BlocoSinastria = { paragrafos: ParagrafoSinastria[] }
/** Todos os nove blocos estão sempre presentes; os que não existem são `null`. */
export type SinteseSinastria = Record<IdDeBloco, BlocoSinastria | null>

export const LIMITES_SINASTRIA = {
  /** parágrafos por bloco; a síntese da relação e a final podem ter um a mais */
  paragrafosPorBloco: 2,
  paragrafosDasSinteses: 3,
  palavrasPorParagrafo: 90,
  palavrasNoTotal: 700,
} as const

/** O que cada bloco é, em uma linha, para o prompt e para a documentação. */
export const DESCRICAO_DOS_BLOCOS: Record<IdDeBloco, string> = {
  sintese_da_relacao: "resumo do padrão geral, a partir das evidências mais relevantes: é um resumo e não um inventário, e o detalhe de cada dinâmica fica para os blocos seguintes",
  pontos_em_comum: "similaridades entre os dois mapas (elemento, modo, mesmo signo), SOMENTE se houver pontos em comum na lista",
  onde_se_encontram: "complementaridades, reconhecimento, apoio e facilidades que as evidências sustentam",
  onde_ha_tensao: "diferenças, atritos e pressões que as evidências sustentam, sem tratar tensão como defeito",
  comunicacao: "só se a evidência fala de troca de ideias, linguagem, escuta ou mal-entendido",
  afeto_e_intimidade: "só se a evidência fala de afeição, atração, intimidade ou vida emocional",
  vida_pratica_e_sustentacao: "só se a evidência fala de rotina, recursos, trabalho, dever, estabilidade ou permanência",
  o_que_a_relacao_mobiliza: "só se a evidência fala de intensidade, crise, revelação ou transformação recorrentes",
  sintese_final: "descreve a configuração que permanece em aberto entre o que converge e o que diverge, sem escolher uma delas e sem dizer como administrá-la",
}

// ── o sistema ────────────────────────────────────────────────────────────────

const SISTEMA_BASE: Record<Locale, string> = {
  pt: "Responda apenas com JSON válido, sem Markdown. Todo texto destinado ao leitor é escrito em português do Brasil.",
  en: "Respond only with valid JSON, no Markdown. All text addressed to the reader is written in English.",
  es: "Responde solo con JSON válido, sin Markdown. Todo el texto dirigido al lector se escribe en español.",
}
const VETO: Record<Locale, string> = {
  pt: 'Nenhum campo pode conter travessão, meia risca, qualquer flexão de "arquétipo", nem estas expressões:',
  en: 'No field may contain an em dash, an en dash, any form of "archetype", or these expressions:',
  es: 'Ningún campo puede contener raya, semirraya, ninguna flexión de "arquetipo", ni estas expresiones:',
}

export function sistemaSinastria(locale: Locale): string {
  return `${SISTEMA_BASE[locale]} ${VETO[locale]} ${EXPRESSOES_EVITAR[locale].map((e) => `"${e}"`).join(", ")}.`
}

// ── o texto do usuário ───────────────────────────────────────────────────────

const NOME_DO_VINCULO: Record<string, string> = {
  romantico: "romântico",
  amizade: "amizade",
  familia: "família",
  trabalho: "trabalho",
  outro: "outro",
}

function listarDinamicas(ds: DinamicaNoPayload[]): string {
  return ds
    .map((d) => {
      const fatos = d.fatos.map((f) => `    fato ${f.id}: ${f.texto}`).join("\n")
      const evid = d.evidencia.map((e) => `    - ${e}`).join("\n")
      const marca = d.contraponto ? "  (entrou como contraponto: o outro lado da relação)\n" : ""
      return `  [${d.id}]\n${marca}${fatos}\n  o que o repertório diz sobre isto:\n${evid}`
    })
    .join("\n\n")
}

/**
 * O idioma de saída. Regra própria da sinastria, sem nada herdado de outros oráculos: a evidência está em
 * português, e para en e es o modelo a diz no idioma de saída sem acrescentar nada. O verificador confere
 * os fatos pelos ids, e não pelas palavras.
 */
const REGRA_DE_IDIOMA: Record<Locale, string> = {
  pt: "IDIOMA: escreva em português do Brasil. A evidência já está em português: use-a normalmente.",
  en: "IDIOMA: escreva todo o texto destinado ao leitor em inglês. A evidência acima está em português: diga o que ela diz em inglês, sem ampliar o sentido, sem acrescentar nada que ela não diga e sem trazer terminologia de fora dela. Os nomes de planetas, signos e aspectos vão em inglês. As chaves do JSON e os ids em `evidencias` não mudam.",
  es: "IDIOMA: escreva todo o texto destinado ao leitor em espanhol. A evidência acima está em português: diga o que ela diz em espanhol, sem ampliar o sentido, sem acrescentar nada que ela não diga e sem trazer terminologia de fora dela. Os nomes de planetas, signos e aspectos vão em espanhol. As chaves do JSON e os ids em `evidencias` não mudam.",
}

/** As regras, iguais para qualquer relação. */
const REGRAS = [
  "REGRA DE OURO: tudo o que você afirma sai da lista acima. Você não calcula, não corrige e não completa astrologia, e não usa o que sabe de astrologia por conta própria para preencher lacunas. Planeta, aspecto, casa, signo, ângulo, elemento ou modo que não está na lista não existe para este texto. Toda afirmação interpretativa tem de poder apontar para um id em `evidencias`.",
  "CITAÇÃO: cada parágrafo declara em `evidencias` os ids (de dinâmica, de fato ou de ponto em comum) de onde saiu, pelo menos um, e só ids que existem na lista. Um parágrafo sem lastro não é escrito.",
  "NATUREZA DO TEXTO: você descreve dinâmicas possíveis entre dois mapas, e não a verdade factual da relação. Fale em possibilidade e tendência ('pode', 'tende'), no tempo presente, e nunca como relato do que acontece entre as duas pessoas.",
  "DONOS: 'seu/sua X' é de você, e 'X da outra pessoa' é da outra pessoa. Nunca troque os donos nem diga um aspecto entre corpos que a lista não liga.",
  "O QUE NÃO SE SABE: o que consta em 'O QUE NÃO É CONHECIDO' não pode ser afirmado nem estimado: nem o signo, nem a retrogradação, nem o Ascendente, o Meio do Céu ou as casas dessa pessoa.",
  "INTEGRE, NÃO VOTE: a ordem das dinâmicas é a de relevância. As primeiras pesam mais, e um fato secundário nunca vira o tema do texto. Não conte e não faça placar: três facilidades e duas tensões não são um resultado.",
  "CONTRADIÇÃO: facilidade e tensão podem existir na mesma relação, e quando a lista traz as duas, as duas aparecem. Não se costura uma harmonia que a evidência não sustenta, e não se resolve uma contradição que ela deixa em aberto.",
  "FACILIDADE NÃO É PROMESSA, TENSÃO NÃO É CONDENAÇÃO: uma facilidade descreve um apoio possível, e não garante afeto, durabilidade nem êxito; uma tensão descreve um atrito possível, e não é defeito de alguém nem sentença sobre a relação.",
  "PONTOS EM COMUM: semelhança não é compatibilidade, e diferença não é incompatibilidade. Escreva a semelhança só no bloco `pontos_em_comum`, só com o que a lista diz, e use a ressalva quando houver. Se a lista não tem pontos em comum, esse bloco é null: não invente um.",
  "SIGNO, ELEMENTO E MODO: para as evidências de signo (`signo:*`), de elemento e de modo, não infira características, personalidade ou estilo próprios daquele signo, elemento ou modo, a não ser que estejam explicitamente no material enviado. Não complete astrologia de memória: diga só o que a evidência diz.",
  "DESCREVA, NÃO PRESCREVA: nada de conselho, instrução ou 'o ideal seria', e nenhuma indicação de ficar, terminar ou agir. Nada de previsão de acontecimento, duração, desfecho ou destino. Karma e destino não são fatos. Nada de diagnóstico nem rótulo de personalidade. Nada de causalidade ('por causa disso ele faz'), de nota, porcentagem ou veredito de compatibilidade ('combinam', 'não combinam', 'alma gêmea').",
  "SEM CENA INVENTADA: não escreva episódios, falas, lugares, horas ou datas.",
  "BLOCOS: escreva só os blocos que você PODE escrever e deixe null todos os outros. Nenhum bloco existe à força, nem para manter simetria: se um bloco ficaria só repetindo outro, ou se a evidência dele é fina, deixe null. `sintese_da_relacao` e `sintese_final` sempre existem.",
  "VÍNCULO: ele pode orientar a ordem em que você apresenta, a atenção relativa, a escolha entre os blocos que você pode escrever e o espaço dado a uma dimensão. Ele não altera nenhum fato, não cria evidência, não transforma o que a evidência diz e não autoriza apagar uma dinâmica central porque ela destoa do vínculo. Não presuma uma relação que o vínculo não é: se não é romântico, não suponha namoro nem intimidade sexual.",
  `CONCISÃO: ${LIMITES_SINASTRIA.paragrafosPorBloco} parágrafos por bloco (${LIMITES_SINASTRIA.paragrafosDasSinteses} nas duas sínteses), ${LIMITES_SINASTRIA.palavrasPorParagrafo} palavras por parágrafo e ${LIMITES_SINASTRIA.palavrasNoTotal} palavras no total são TETOS, não metas. Prefira o curto: se a evidência sustenta 350 palavras, escreva 350, e não expanda para chegar perto do teto.`,
  "SEM REPETIÇÃO: a síntese da relação apresenta o padrão geral, os blocos temáticos o desenvolvem e a síntese final integra as contradições e encerra. Não repita a mesma dinâmica nos três só para preencher espaço: cada uma aparece onde tem o que acrescentar.",
  "SÍNTESE FINAL: descreve a configuração que permanece em aberto; não prescreve a maneira de administrá-la. Integra as forças presentes, preserva a contradição, não decide o destino da relação e não transforma a conclusão em conselho. Não feche com condição, esforço ou recomendação: nada de 'desde que...', 'se ambos...', 'para que a relação...', 'precisam...', 'devem...', 'é importante...', 'o caminho é...', 'encontrar equilíbrio...', 'com compreensão, paciência ou esforço...', nem equivalente em outras palavras (qualquer frase que diga o que as duas pessoas deveriam fazer ou de que o resultado dependeria). Termine na descrição: o que há, e o que fica em aberto. Correto = descreve a configuração que existe e deixa a tensão em aberto, sem ensinar como administrá-la: pode mostrar coexistência, contraste, tensão não resolvida ou áreas que funcionam de modos diferentes. Incorreto = prescreve como administrar a relação ou condiciona o seu sucesso a uma ação, por exemplo: 'A relação pode funcionar bem desde que ambos tenham paciência e aprendam a lidar com essas diferenças.' Isso mostra a diferença funcional; não há frase pronta para imitar, e cada fechamento deve ser escrito com o que esta relação tem.",
  "SÍNTESE DA RELAÇÃO: é um resumo do padrão geral, e não um inventário: não percorra os aspectos um a um (isso é dos blocos seguintes). Diga o que atravessa a relação em poucas frases e deixe o detalhe para onde ele cabe.",
  "ESTILO: fale com você em segunda pessoa e chame a outra pessoa de 'a outra pessoa'. Pode nomear planetas, signos e aspectos, e não ensine a técnica: nada de explicar o que é orbe, aspecto ou casa. Registro adulto, preciso, pouco adjetivado.",
]

export function promptSinastria(payload: PayloadSinastria): { system: string; user: string } {
  const { locale, vinculo } = payload
  const nulos = BLOCOS.filter((b) => !payload.blocosElegiveis.includes(b))

  const partes: string[] = [
    "Escreva a leitura de uma RELAÇÃO entre duas pessoas, a partir dos fatos astrológicos já calculados abaixo. O texto é para a primeira pessoa (você); a outra é 'a outra pessoa'.",
    "",
    `VÍNCULO DECLARADO: ${NOME_DO_VINCULO[vinculo]}.${payload.enfase.length ? ` Ênfase sugerida, se houver lastro: ${payload.enfase.join(", ")}.` : ""} O vínculo não muda nenhum fato abaixo.`,
    "",
    "ASPECTOS ENTRE OS DOIS MAPAS (em ordem de relevância; cada dinâmica traz os fatos e o que o repertório diz):",
    payload.aspectos.length ? listarDinamicas(payload.aspectos) : "  (nenhum)",
    "",
    "OVERLAYS E PLANETAS SOBRE ÂNGULOS (camada secundária; 'quem tem o planeta' e 'quem tem a casa' são as duas pessoas, na direção dita no fato):",
    payload.overlays.length ? listarDinamicas(payload.overlays) : "  (nenhum)",
    "",
    "PONTOS EM COMUM (semelhanças entre os mapas; não são aspectos e não significam facilidade):",
    payload.semelhancas.length
      ? payload.semelhancas.map((s) => `  [${s.id}] ${s.fato}\n${s.nucleo.map((n) => `    - ${n}`).join("\n")}`).join("\n")
      : "  (nenhum ponto em comum com material: o bloco pontos_em_comum é null)",
    ...(payload.ressalvaDasSemelhancas ? [`  ressalva: ${payload.ressalvaDasSemelhancas}`] : []),
    "",
    "O QUE NÃO É CONHECIDO:",
    payload.indisponibilidades.length ? payload.indisponibilidades.map((i) => `  - ${i}`).join("\n") : "  (nada: as duas horas de nascimento são conhecidas)",
    "",
    `BLOCOS QUE VOCÊ PODE ESCREVER: ${payload.blocosElegiveis.join(", ")}.`,
    `BLOCOS QUE TÊM DE SER null: ${nulos.length ? nulos.join(", ") : "nenhum"}.`,
    "",
    "O QUE CADA BLOCO É:",
    ...BLOCOS.map((b) => `  ${b}: ${DESCRICAO_DOS_BLOCOS[b]}`),
    "",
    "REGRAS:",
    ...REGRAS.map((r, i) => `${i + 1}. ${r}`),
    "",
    REGRA_DE_IDIOMA[locale],
    "",
    "Devolva JSON, com TODAS as nove chaves; as que não existem valem null:",
    '{"sintese_da_relacao": {"paragrafos": [{"texto": "...", "evidencias": ["id"]}]}, "pontos_em_comum": null, "onde_se_encontram": {"paragrafos": [...]}, "onde_ha_tensao": {"paragrafos": [...]}, "comunicacao": null, "afeto_e_intimidade": null, "vida_pratica_e_sustentacao": null, "o_que_a_relacao_mobiliza": null, "sintese_final": {"paragrafos": [...]}}',
  ]
  return { system: sistemaSinastria(locale), user: partes.join("\n") }
}

/** Para a documentação e para os testes: quais blocos existem sempre. */
export const OBRIGATORIOS = BLOCOS_OBRIGATORIOS
export { ENFASE_POR_VINCULO }
