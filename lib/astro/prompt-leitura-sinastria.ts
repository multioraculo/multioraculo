/**
 * O prompt da LEITURA RELACIONAL da sinastria: a interpretação do encontro, e
 * não a soma de blocos independentes.
 *
 * ESTE ARQUIVO NÃO CHAMA MODELO NENHUM. Monta o texto e descreve a forma da
 * resposta. A geração é injetada por quem chama (`gerar-leitura-sinastria.ts`).
 *
 * POR QUE EXISTE, SE JÁ HAVIA `prompt-sinastria.ts`. O prompt dos nove blocos
 * foi desenhado para NÃO escolher: a síntese final "descreve a configuração
 * que permanece em aberto, sem escolher uma das forças". Para um verificador
 * isso é seguro, e para quem lê é o que produz "há apoio e há atrito", uma frase
 * que serve a qualquer casal. As baterias de calibração mediram exatamente isso:
 * o texto passa nas regras e não diz nada da relação. A leitura relacional
 * inverte o contrato: ela COMPROMETE uma interpretação (o parecer) e a defende
 * com os sinais, e o que a segura contra a invenção é o mapa de eixos, que o
 * código calcula, e o verificador, que confere cada citação.
 *
 * O QUE ESTE PROMPT NÃO MUDA. A regra de ouro (o modelo não completa
 * astrologia), os donos (você / a outra pessoa), o que não é conhecido, as
 * proibições de conselho, previsão, diagnóstico, causalidade, nota e veredito,
 * e a regra de signo, elemento e modo. Todas continuam em vigor, e o
 * verificador as cobra pelo mesmo código que cobra o prompt dos nove blocos.
 *
 * "ARQUÉTIPO" É A BASE, NÃO A PALAVRA. A interpretação simbólica (o que o
 * tema significa para o vínculo) é exigida; a palavra "arquétipo" continua
 * vetada na tela, em qualquer flexão, como em todo o Multioráculo. O leitor
 * recebe a leitura, e não a aula.
 */
import type { Locale } from "@/lib/i18n/config"
import { descreverEixos, mapaDeEixos, TEMAS, type MapaDeEixos } from "./eixos-sinastria"
import { CORPOS } from "./nomes"
import type { PayloadSinastria } from "./payload-sinastria"
import { listarDinamicas, NOME_DO_VINCULO, REGRA_DE_IDIOMA, sistemaSinastria } from "./prompt-sinastria"

// ── o schema da resposta ─────────────────────────────────────────────────────

export type ParagrafoLeitura = {
  texto: string
  /** os ids de dinâmica, de fato ou de semelhança de onde o parágrafo saiu; pelo menos um */
  evidencias: string[]
}

/**
 * A leitura. Tipada e validável: tudo é parágrafo com texto e evidência. `parecer`, `aproxima_e_tensiona` e
 * `significado` sempre existem; `na_relacao` só quando a evidência sustenta um campo concreto.
 */
export type LeituraRelacional = {
  parecer: ParagrafoLeitura
  aproxima_e_tensiona: ParagrafoLeitura[]
  significado: ParagrafoLeitura
  na_relacao: ParagrafoLeitura | null
}

export const CHAVES_DA_LEITURA = ["parecer", "aproxima_e_tensiona", "significado", "na_relacao"] as const

/** Tetos, não metas. */
export const LIMITES_LEITURA = {
  palavrasDoParecer: 65,
  palavrasPorParagrafo: 95,
  paragrafosDeAproxima: 2,
  palavrasNoTotal: 420,
} as const

// ── o texto ──────────────────────────────────────────────────────────────────

const REGRAS = [
  "REGRA DE OURO: tudo o que você afirma sai da lista acima. Você não calcula, não corrige e não completa astrologia, e não usa o que sabe de astrologia por conta própria para preencher lacunas. Planeta, aspecto, casa, signo, ângulo, elemento ou modo que não está na lista não existe para este texto.",
  "CITAÇÃO: cada parágrafo declara em `evidencias` os ids (de dinâmica, de fato ou de ponto em comum) de onde saiu, pelo menos um, e só ids que existem na lista. O id do EIXO não é um id citável: cite as dinâmicas dele.",
  "O CENTRO JÁ ESTÁ DECIDIDO: o MAPA DE EIXOS diz qual tema é central, qual é secundário, qual é isolado e qual contradição não pode ser escondida. Você escreve esse mapa, e não o refaz: não eleja outro tema como central, não conte aspectos para decidir, e não transforme um tema isolado no assunto da leitura.",
  "PARECER (primeiro campo): abra com a interpretação central, em uma ou duas frases diretas: o que predomina neste encontro e por quê, apoiado no contato de maior peso do eixo central. Nada de introdução sobre relações ou astrologia, e nada de frase que serviria a qualquer casal ('há apoio e desafios', 'equilíbrio entre facilidades e tensões'). O parecer nomeia o tema do encontro e pelo menos um contato real. Se o perfil é AMBIVALENTE, o parecer diz isso e diz ONDE está a ambivalência: em que tema há aproximação e em que tema há atrito, ou em que ponto o mesmo tema pesa nos dois sentidos.",
  "APROXIMA E TENSIONA: integra os sinais, não os enumera. Mostre o que reforça a mesma dinâmica (e, quando o mapa marca convergência, o que ela acrescenta: a dinâmica se repete em mais de um ponto), o que a contradiz ou complica (a contradição marcada tem de aparecer, dizendo como ela modifica a leitura, sem esconder nem suavizar) e o que só a qualifica (eixos secundários). Um parágrafo para o que aproxima e outro para o que tensiona, ou um só quando os dois são o mesmo movimento. Não percorra aspecto por aspecto e não repita o parecer.",
  "SIGNIFICADO: explique o que o tema central quer dizer para este vínculo, o sentido simbólico do encontro. Diga o que cada pessoa traz ao tema e o que a outra desperta, desafia ou torna visível nela, em termos do tema (a pergunta do eixo), e não de rótulos de personalidade. Construa o sentido a partir dos PAPÉIS que a evidência dá a cada corpo (as linhas 'Sol: ...', 'Lua: ...') e do encaixe ou da tensão entre eles, e formule, em uma frase, a pergunta que este vínculo põe a cada pessoa (por exemplo: como ser visto sem ser corrigido; como firmar uma base sem se sentir contido), sem repetir o nome do tema. Mostre como isso estrutura a relação, e não apenas o defina em abstrato. Diferencie as duas pessoas ('você', 'a outra pessoa') sem presumir que as duas vivem o mesmo contato do mesmo jeito. Não use a palavra 'arquétipo' nem diagnostique ninguém: isto é leitura simbólica de uma combinação, e não verdade oculta sobre quem quer que seja.",
  "OS DOIS LADOS, COM O PESO QUE TÊM: a leitura mostra o que favorece e o que tensiona, cada um com a sua força, e não só o lado para o qual o centro pende. Se o centro pende para a tensão, os apoios mais exatos entram em 'aproxima_e_tensiona' com o mesmo cuidado (o que há de simetria, de reconhecimento, de bem-estar possível no encontro); se pende para o apoio, as tensões mais exatas entram do mesmo jeito. Use a distribuição dos contatos para dizer, com palavras, para onde a combinação tende no conjunto (por exemplo, que a maioria dos contatos é de um tipo), sem tratar isso como nota, veredito ou previsão. Os contatos variáveis (conjunção e quincunce) são pontos em aberto: diga que dependem dos planetas envolvidos, sem classificá-los como apoio nem como tensão. Tendência a conversa mais difícil ou mais fluida descreve a combinação, e não decide a relação.",
  "NA RELAÇÃO (opcional): como o tema pode aparecer na comunicação, na intimidade, na rotina ou nas escolhas, SÓ no campo que a evidência sustenta (se a evidência não fala de comunicação, não fale de comunicação). Sempre como possibilidade ('pode', 'tende'). Sem cena inventada: nada de episódio, fala, lugar, hora ou data. Se a evidência não sustenta nenhum campo concreto, deixe null.",
  "NATUREZA DO TEXTO: você descreve dinâmicas possíveis entre dois mapas, e não a verdade factual da relação. Fale em possibilidade e tendência ('pode', 'tende'), no tempo presente. Não afirme o que a outra pessoa sente, pretende ou fará.",
  "DONOS: 'seu/sua X' é de você, e 'X da outra pessoa' é da outra pessoa; o QUADRO DE DONOS abaixo diz de quem é cada corpo. Ao falar de um contato, use os corpos e os donos exatamente como o fato os diz ('sua Lua em sextil com o Sol da outra pessoa' não vira 'seu Sol em sextil com a Lua da outra pessoa'). Os papéis ('quem tem o Sol', 'quem tem a Lua') são de quem tem aquele corpo NO FATO: você só é 'quem tem Netuno' se o fato diz 'seu Netuno'. Nunca troque os donos nem diga um aspecto entre corpos que a lista não liga, e não atribua a uma pessoa uma característica só porque ela aparece no mapa da outra. Uma pessoa não é um planeta: nada de 'você, representado por Netuno'.",
  "SEM ANDAIME: o mapa de eixos é bastidor. Não escreva 'eixo', 'mapa de eixos', 'perfil do centro' nem 'o tema central é X' repetindo o rótulo do tema como se fosse o assunto: diga o que aquele tema é nesta relação, com as palavras desta relação.",
  "O QUE NÃO SE SABE: o que consta em 'O QUE NÃO É CONHECIDO' não pode ser afirmado nem estimado: nem o signo, nem a retrogradação, nem o Ascendente, o Meio do Céu ou as casas dessa pessoa. Quando essa falta limita o que você diz, diga isso numa frase, NO PONTO em que importa, e siga: a incerteza não neutraliza o resto da leitura.",
  "PESOS: a ordem das dinâmicas é a de relevância. Um fato secundário nunca vira o tema do texto. Facilidade não é promessa e tensão não é condenação: um apoio descreve um apoio possível, e não garante afeto, durabilidade nem êxito; uma tensão descreve um atrito possível, e não é defeito de alguém nem sinal de incompatibilidade.",
  "PONTOS EM COMUM: semelhança não é compatibilidade e diferença não é incompatibilidade. Só mencione elemento, modo ou mesmo signo se constar em PONTOS EM COMUM, e só com o que a lista diz. Para signo, elemento e modo, não infira características próprias deles que não estejam no material.",
  "DESCREVA, NÃO PRESCREVA: nada de conselho, instrução, 'o ideal seria' ou indicação de ficar, terminar ou agir. Nada de previsão de acontecimento, duração, desfecho ou destino; nada de causalidade ('por causa disso ele faz'), nota, porcentagem ou veredito ('combinam', 'não combinam', 'alma gêmea'). Não feche com condição, esforço ou recomendação ('desde que...', 'se ambos...', 'para que a relação...', 'precisam...', 'o desafio está em lidar com...'): o último parágrafo termina no que há, e não no que as pessoas deveriam fazer.",
  "VÍNCULO: ele pode orientar a atenção relativa e o espaço dado a uma dimensão. Não altera nenhum fato, não cria evidência e não autoriza apagar um tema central porque destoa do vínculo. Não presuma uma relação que o vínculo não é: se não é romântico, não suponha namoro nem intimidade sexual.",
  "SEM REPETIÇÃO: cada parágrafo avança uma ideia nova. Não repita o tema central na abertura, no meio e no fim com sinônimos: o parecer o afirma, o meio mostra como os sinais se combinam, o significado explica o que ele quer dizer, e o último campo, se existir, mostra onde pode aparecer.",
  `CONCISÃO: o parecer tem até ${LIMITES_LEITURA.palavrasDoParecer} palavras; cada outro parágrafo, até ${LIMITES_LEITURA.palavrasPorParagrafo}; 'aproxima_e_tensiona' tem até ${LIMITES_LEITURA.paragrafosDeAproxima} parágrafos; o total, até ${LIMITES_LEITURA.palavrasNoTotal} palavras. São TETOS, não metas: prefira o curto.`,
  "ESTILO: fale com você em segunda pessoa e chame a outra pessoa de 'a outra pessoa'. Pode nomear planetas, signos e aspectos, e não ensine a técnica: nada de explicar o que é orbe, aspecto ou casa. Linguagem direta, acessível e relacional; registro adulto, preciso, pouco adjetivado.",
]

/** De quem é cada corpo que aparece nas dinâmicas, tirado dos ids dos fatos. Evita que o modelo reatribua um papel. */
function quadroDeDonos(payload: PayloadSinastria): string[] {
  const seus = new Set<string>()
  const dela = new Set<string>()
  const nome = (id: string) => (CORPOS[payload.locale] as Record<string, string>)[id] ?? id
  for (const d of [...payload.aspectos, ...payload.overlays]) {
    for (const f of d.fatos) {
      for (const m of f.id.matchAll(/([AB])\.(\w+)(?=[~@:]|$)/g)) {
        if (m[2].startsWith("casa")) continue
        ;(m[1] === "A" ? seus : dela).add(nome(m[2]))
      }
    }
  }
  return [`  seus: ${[...seus].join(", ") || "(nenhum)"}`, `  da outra pessoa: ${[...dela].join(", ") || "(nenhum)"}`]
}

function listarSemelhancas(payload: PayloadSinastria): string[] {
  if (!payload.semelhancas.length) return ["  (nenhum ponto em comum com material: não fale de elemento, modo nem mesmo signo)"]
  return [
    ...payload.semelhancas.map((s) => `  [${s.id}] ${s.fato}\n${s.nucleo.map((n) => `    - ${n}`).join("\n")}`),
    ...(payload.ressalvaDasSemelhancas ? [`  ressalva: ${payload.ressalvaDasSemelhancas}`] : []),
  ]
}

/** Quantos contatos de cada tipo a relação tem, entre TODOS os calculados (não só os selecionados). */
export type DistribuicaoDosContatos = { total: number; harmonico: number; discordante: number; variavel: number }

function distribuicaoComoTexto(d: DistribuicaoDosContatos): string {
  if (d.total === 0) return "  (nenhum contato calculado)"
  return `  ${d.total} contatos: ${d.harmonico} harmônicos, ${d.discordante} discordantes e ${d.variavel} variáveis (conjunção e quincunce, que o livro não separa em apoio ou tensão). Descreva a proporção SÓ com palavras ('a maioria', 'cerca de metade', 'poucos'), nunca com número nem percentual. É a proporção de tipos de contato, e não uma nota da relação.`
}

export function promptLeituraSinastria(
  payload: PayloadSinastria,
  mapa: MapaDeEixos = mapaDeEixos(payload),
  distribuicao: DistribuicaoDosContatos | null = null,
): { system: string; user: string } {
  const { locale, vinculo } = payload
  const partes: string[] = [
    "Escreva a LEITURA INTEGRADA de uma RELAÇÃO entre duas pessoas: o que emerge quando os dois mapas se encontram, e não a explicação de cada aspecto. O texto é para a primeira pessoa (você); a outra é 'a outra pessoa'. Os fatos astrológicos já estão calculados e o centro do encontro já está decidido (MAPA DE EIXOS): sua tarefa é interpretá-lo, com clareza e sem inventar.",
    "",
    `VÍNCULO DECLARADO: ${NOME_DO_VINCULO[vinculo]}. O vínculo não muda nenhum fato abaixo.`,
    "",
    "ASPECTOS ENTRE OS DOIS MAPAS (em ordem de relevância; cada dinâmica traz os fatos e o que o repertório diz):",
    payload.aspectos.length ? listarDinamicas(payload.aspectos) : "  (nenhum)",
    "",
    "OVERLAYS E PLANETAS SOBRE ÂNGULOS (camada secundária; 'quem tem o planeta' e 'quem tem a casa' são as duas pessoas, na direção dita no fato):",
    payload.overlays.length ? listarDinamicas(payload.overlays) : "  (nenhum)",
    "",
    "QUADRO DE DONOS (de quem é cada corpo nos fatos acima):",
    ...quadroDeDonos(payload),
    "",
    "PONTOS EM COMUM (semelhanças entre os mapas; não são aspectos e não significam facilidade):",
    ...listarSemelhancas(payload),
    "",
    "O QUE NÃO É CONHECIDO:",
    payload.indisponibilidades.length ? payload.indisponibilidades.map((i) => `  - ${i}`).join("\n") : "  (nada: as duas horas de nascimento são conhecidas)",
    "",
    ...(distribuicao ? ["DISTRIBUIÇÃO DOS CONTATOS (todos os calculados, e não só os selecionados):", distribuicaoComoTexto(distribuicao), ""] : []),
    "MAPA DE EIXOS (decidido por código, a partir da ordem de relevância; você o escreve, não o refaz):",
    descreverEixos(mapa),
    "",
    "REGRAS:",
    ...REGRAS.map((r, i) => `${i + 1}. ${r}`),
    "",
    REGRA_DE_IDIOMA[locale],
    "",
    "Devolva JSON, com TODAS as quatro chaves; `na_relacao` vale null quando não há campo concreto sustentado:",
    '{"parecer": {"texto": "...", "evidencias": ["id"]}, "aproxima_e_tensiona": [{"texto": "...", "evidencias": ["id"]}], "significado": {"texto": "...", "evidencias": ["id"]}, "na_relacao": null}',
  ]
  return { system: sistemaLeitura(locale), user: partes.join("\n") }
}

export function sistemaLeitura(locale: Locale): string {
  return sistemaSinastria(locale)
}

/** Para a documentação: o que cada eixo pergunta. */
export const PERGUNTAS_DOS_EIXOS = Object.fromEntries(Object.entries(TEMAS).map(([k, v]) => [k, v.pergunta]))
