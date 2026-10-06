/**
 * O contrato da geração de sinastria: geração → verificador estrutural →
 * (juiz semântico, em sombra) → reparo direcionado, no máximo 2 → molde
 * determinístico.
 *
 * ESTE ARQUIVO NÃO CHAMA MODELO NENHUM. As chamadas entram por funções
 * injetadas, e o desenho é para os testes poderem provar o contrato com
 * respostas escritas à mão.
 *
 * O REPARO FICA DESLIGADO por padrão (`reparoAtivo: false`): a primeira bateria
 * de calibração quer a saída bruta do gerador. Quando ligado, obedece:
 *  - no máximo 2 reparos, num laço com limite fixo (nenhuma recursão, nenhum
 *    "tente até passar"): cada reparo é uma chamada e o laço acaba nelas;
 *  - repara SOMENTE o que o verificador apontou: o que o verificador localiza
 *    (bloco e parágrafo) tem de voltar idêntico fora do apontado, e uma
 *    resposta que mexe no que estava válido é recusada como reparo;
 *  - nunca refaz cálculo nem acrescenta evidência: o payload é o mesmo, e a
 *    resposta reparada só pode citar o que ele já traz;
 *  - se ainda reprova, o molde determinístico, que passa pelo mesmo verificador.
 *
 * O JUIZ SEMÂNTICO só roda em sombra, sobre a resposta que o verificador
 * estrutural aprovou, e nunca muda o resultado nem pede reparo.
 */
import type { Locale } from "@/lib/i18n/config"
import { executarJuizEmSombra, type ChamarJuiz, type RegistroDoJuiz } from "./juiz-semantico-sinastria"
import { BLOCOS, type DinamicaNoPayload, type IdDeBloco, type PayloadSinastria } from "./payload-sinastria"
import { promptSinastria, type SinteseSinastria } from "./prompt-sinastria"
import type { SelecaoSinastria } from "./selecao-sinastria"
import { verificarRespostaSinastria } from "./verificador-resposta-sinastria"

export const LIMITE_DE_REPAROS = 2

// ── o molde determinístico ───────────────────────────────────────────────────

const palavras = (t: string) => t.trim().split(/\s+/).filter(Boolean).length

/** Junta frases até o teto de palavras do parágrafo, sem cortar frase no meio. */
function ate(frases: string[], teto: number): string {
  const saida: string[] = []
  let n = 0
  for (const f of frases) {
    const c = palavras(f)
    if (n + c > teto) break
    saida.push(f)
    n += c
  }
  return saida.join(" ")
}
const fim = (t: string) => (/[.!?]$/.test(t.trim()) ? t.trim() : `${t.trim()}.`)

/**
 * O molde: para quando nem o gerador nem o reparo dão uma resposta válida.
 * Não interpreta nada: cada parágrafo é um fato calculado seguido das frases do
 * repertório que o payload já trouxe, na ordem em que vieram. Só existe em
 * português, que é o idioma da evidência; nos outros devolve nulo.
 */
export function moldeDeterministico(payload: PayloadSinastria): SinteseSinastria | null {
  if (payload.locale !== "pt") return null
  const todas = [...payload.aspectos, ...payload.overlays]
  if (todas.length === 0) return null
  const sintese = Object.fromEntries(BLOCOS.map((b) => [b, null])) as Record<IdDeBloco, SinteseSinastria[IdDeBloco]>
  // a frase do repertório que usa a palavra "compatibilidade" é do livro, mas é vocabulário que o texto de saída não pode ter
  const doTipo = (d: DinamicaNoPayload, tipo: "nucleo" | "tensao") => d.itens.filter((i) => i.tipo === tipo && !/compatibil/i.test(i.texto)).map((i) => fim(i.texto))
  const paragrafo = (d: DinamicaNoPayload, rotulo: string, frases: string[]) => fim(`${rotulo} ${fim(d.fatos[0].texto)} ${ate(frases, 55)}`.trim())

  const topo = (payload.aspectos.length ? payload.aspectos : payload.overlays)[0]
  // o verificador cobra a categoria do ASPECTO citado, e não a valência da frase: o molde escolhe pela categoria
  const harmonica = todas.find((d) => d.categorias.includes("harmonico"))
  const discordante = todas.find((d) => d.categorias.includes("discordante"))

  sintese.sintese_da_relacao = { paragrafos: [{ texto: paragrafo(topo, "Entre os dois mapas:", doTipo(topo, "nucleo").length ? doTipo(topo, "nucleo") : doTipo(topo, "tensao")), evidencias: [topo.id] }] }
  const lados = [harmonica, discordante].filter((d, i, a): d is DinamicaNoPayload => Boolean(d) && a.indexOf(d) === i)
  const alvo = lados.length ? lados : [topo]
  sintese.sintese_final = {
    paragrafos: [
      {
        texto: ate(alvo.map((d) => paragrafo(d, d === discordante && d !== harmonica ? "Em tensão:" : "Em apoio:", d === discordante && d !== harmonica ? doTipo(d, "tensao") : doTipo(d, "nucleo"))), 85),
        evidencias: alvo.map((d) => d.id),
      },
    ],
  }
  return sintese as SinteseSinastria
}

// ── o pedido de reparo ───────────────────────────────────────────────────────

/** Onde o verificador localizou a violação: "bloco[indice]: ..." */
export function localizar(violacao: string): { bloco: IdDeBloco; indice: number } | null {
  const m = /^([a-z_]+)\[(\d+)\]:/.exec(violacao)
  return m && (BLOCOS as readonly string[]).includes(m[1]) ? { bloco: m[1] as IdDeBloco, indice: Number(m[2]) } : null
}

export function pedidoDeReparo(payload: PayloadSinastria, anterior: unknown, violacoes: string[]): { system: string; user: string } {
  const { system, user } = promptSinastria(payload)
  return {
    system,
    user: [
      user,
      "",
      "RESPOSTA ANTERIOR (reprovada pelo verificador):",
      JSON.stringify(anterior),
      "",
      "VIOLAÇÕES APONTADAS:",
      ...violacoes.map((v) => `- ${v}`),
      "",
      "CORREÇÃO: devolva a resposta inteira, com as nove chaves, corrigindo SOMENTE o que as violações apontam. Preserve palavra por palavra tudo o que não foi apontado. Não acrescente evidência nem ids que não estão na lista acima, não refaça nenhum cálculo e não escreva nada que a lista não sustente. Se um parágrafo apontado não puder ser corrigido sem inventar, retire-o (ou ponha null no bloco, se o bloco permitir).",
    ].join("\n"),
  }
}

/**
 * O reparo só vale se não mexeu no que estava válido. Violação sem localização
 * (o total de palavras, uma regra de texto sobre a síntese inteira) libera o
 * texto todo; as localizadas travam o resto.
 */
export function conferirReparo(anterior: unknown, novo: unknown, violacoes: string[]): string[] {
  const locais = violacoes.map(localizar)
  if (locais.some((l) => l === null)) return []
  const apontados = new Set(locais.map((l) => `${l!.bloco}[${l!.indice}]`))
  const a = (anterior ?? {}) as Record<string, { paragrafos?: unknown[] } | null>
  const n = (novo ?? {}) as Record<string, { paragrafos?: unknown[] } | null>
  const problemas: string[] = []
  for (const b of BLOCOS) {
    const antes = a[b]?.paragrafos ?? []
    const depois = n[b]?.paragrafos ?? []
    for (const [i, p] of antes.entries()) {
      if (apontados.has(`${b}[${i}]`)) continue
      if (JSON.stringify(p) !== JSON.stringify(depois[i])) problemas.push(`${b}[${i}]: o reparo alterou um parágrafo que estava válido`)
    }
    if (depois.length > antes.length) problemas.push(`${b}: o reparo acrescentou parágrafo`)
  }
  return problemas
}

// ── o pipeline ───────────────────────────────────────────────────────────────

export type ResultadoDoPipeline =
  | { origem: "geracao" | "reparo"; sintese: SinteseSinastria; reparos: number; juiz: RegistroDoJuiz | null }
  | { origem: "molde"; sintese: SinteseSinastria; reparos: number; juiz: null; violacoesDoGerador: string[] }
  | { origem: "indisponivel"; sintese: null; reparos: number; juiz: null; violacoesDoGerador: string[] }
  /** só com o reparo desligado: a saída bruta reprovada, para observação */
  | { origem: "bruta_reprovada"; sintese: null; reparos: 0; juiz: null; violacoesDoGerador: string[]; bruto: unknown }

export type OpcoesDoPipeline = {
  payload: PayloadSinastria
  selecao: SelecaoSinastria
  locale: Locale
  /** a geração: devolve o JSON já lido */
  gerar: () => Promise<unknown>
  /** o reparo; só é chamado se `reparoAtivo` */
  reparar?: (pedido: { system: string; user: string }) => Promise<unknown>
  reparoAtivo?: boolean
  /** o juiz, em sombra */
  chamarJuiz?: ChamarJuiz
}

export async function executarPipeline(o: OpcoesDoPipeline): Promise<ResultadoDoPipeline> {
  const verificar = (bruto: unknown) => verificarRespostaSinastria({ bruto, payload: o.payload, selecao: o.selecao, locale: o.locale })
  const juizEmSombra = async (sintese: SinteseSinastria) =>
    o.chamarJuiz ? executarJuizEmSombra({ payload: o.payload, sintese, locale: o.locale, chamar: o.chamarJuiz }) : null

  let bruto = await o.gerar()
  let v = verificar(bruto)
  if (v.ok) return { origem: "geracao", sintese: v.sintese, reparos: 0, juiz: await juizEmSombra(v.sintese) }
  const violacoesDoGerador = v.violacoes

  if (!o.reparoAtivo) return { origem: "bruta_reprovada", sintese: null, reparos: 0, juiz: null, violacoesDoGerador, bruto }

  // um laço com limite fixo: no máximo LIMITE_DE_REPAROS chamadas, e ele acaba nelas
  let reparos = 0
  for (let k = 0; k < LIMITE_DE_REPAROS && !v.ok && o.reparar; k++) {
    reparos += 1
    const candidato = await o.reparar(pedidoDeReparo(o.payload, bruto, v.violacoes))
    // a resposta que mexe no que estava válido não é reparo: fica a anterior, e o reparo conta
    if (conferirReparo(bruto, candidato, v.violacoes).length > 0) continue
    bruto = candidato
    v = verificar(bruto)
  }
  if (v.ok) return { origem: "reparo", sintese: v.sintese, reparos, juiz: await juizEmSombra(v.sintese) }

  const molde = moldeDeterministico(o.payload)
  if (molde) {
    const m = verificar(molde)
    if (m.ok) return { origem: "molde", sintese: m.sintese, reparos, juiz: null, violacoesDoGerador }
  }
  return { origem: "indisponivel", sintese: null, reparos, juiz: null, violacoesDoGerador }
}
