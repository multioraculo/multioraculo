/**
 * A geração da leitura relacional: payload → mapa de eixos → prompt →
 * geração → verificador → (um reparo, no máximo) → ou a leitura, ou nada.
 *
 * ESTE ARQUIVO NÃO CHAMA MODELO NENHUM. A chamada entra por função injetada,
 * para os testes provarem o contrato com respostas escritas à mão, e para a
 * rota decidir quando uma chamada paga acontece.
 *
 * SEM MOLDE. Os nove blocos tinham um molde determinístico para quando tudo
 * falhava. Uma leitura relacional de molde seria exatamente o que esta camada
 * existe para não ser (um resumo de fatos com cara de interpretação), então,
 * quando a geração e o único reparo reprovam, o resultado é `indisponivel`, e
 * a tela mostra o que sempre mostrou: os fatos e o resumo deles. Uma camada a
 * mais nunca custa a tela de ninguém.
 *
 * O REPARO É UM SÓ, e direcionado: a resposta anterior e as violações vão
 * junto, com o mesmo payload e o mesmo mapa. Não há "tente até passar".
 */
import type { Locale } from "@/lib/i18n/config"
import { mapaDeEixos, type MapaDeEixos } from "./eixos-sinastria"
import { montarPayload, type PayloadSinastria } from "./payload-sinastria"
import { promptLeituraSinastria, type DistribuicaoDosContatos, type LeituraRelacional } from "./prompt-leitura-sinastria"
import { selecionarEvidencia, type SelecaoSinastria } from "./selecao-sinastria"
import type { ResultadoSinastria } from "./sinastria"
import type { Vinculo } from "./sinastria-servico"
import { verificarLeituraSinastria } from "./verificador-leitura-sinastria"

export const LIMITE_DE_REPAROS_DA_LEITURA = 1

export type ResultadoDaLeitura =
  | { origem: "geracao" | "reparo"; leitura: LeituraRelacional; avisos: string[]; reparos: number }
  | { origem: "indisponivel"; leitura: null; violacoes: string[]; avisos: string[]; reparos: number }

export type Preparo = { selecao: SelecaoSinastria; payload: PayloadSinastria; mapa: MapaDeEixos; distribuicao: DistribuicaoDosContatos; prompt: { system: string; user: string } }

/** Do cálculo à entrada do modelo. Determinístico: o mesmo cálculo dá sempre o mesmo prompt. */
export function prepararLeitura(resultado: ResultadoSinastria, opcoes: { locale: Locale; vinculo: Vinculo }): Preparo {
  const selecao = selecionarEvidencia(resultado)
  const payload = montarPayload(selecao, opcoes)
  const mapa = mapaDeEixos(payload)
  const conta = (c: string) => resultado.aspectos.filter((f) => f.categoria === c).length
  const distribuicao: DistribuicaoDosContatos = { total: resultado.aspectos.length, harmonico: conta("harmonico"), discordante: conta("discordante"), variavel: conta("variavel") }
  return { selecao, payload, mapa, distribuicao, prompt: promptLeituraSinastria(payload, mapa, distribuicao) }
}

/** Há o que interpretar? Sem dinâmica selecionada não há eixo, e não se gera nada (nem se gasta nada). */
export const haLeituraParaEscrever = (p: Preparo) => p.payload.aspectos.length + p.payload.overlays.length > 0

/** Os fatos como existem, com os donos, para o reparo de um dono trocado: dizer "o que existe é o inverso" sem mostrar o fato não corrige. */
function fatosExatos(payload: PayloadSinastria): string[] {
  return [...payload.aspectos, ...payload.overlays].flatMap((d) => d.fatos.map((f) => `- ${f.texto.replace(/\s*\(.*\)\s*$/, "")}`))
}

export function pedidoDeReparoDaLeitura(prompt: { system: string; user: string }, anterior: unknown, violacoes: string[], payload?: PayloadSinastria): { system: string; user: string } {
  return {
    system: prompt.system,
    user: [
      prompt.user,
      "",
      "RESPOSTA ANTERIOR (reprovada pelo verificador):",
      JSON.stringify(anterior),
      "",
      "VIOLAÇÕES APONTADAS:",
      ...violacoes.map((x) => `- ${x}`),
      ...(payload && violacoes.some((x) => /dono|inverso/.test(x)) ? ["", "OS CONTATOS, DITOS EXATAMENTE COMO EXISTEM (use esta ordem e estes donos):", ...fatosExatos(payload)] : []),
      "",
      "CORREÇÃO: devolva a resposta inteira, com as quatro chaves, corrigindo o que as violações apontam e preservando o resto. Não acrescente evidência nem ids que não estão na lista acima, não refaça nenhum cálculo e não escreva nada que a lista não sustente. Se um parágrafo não puder ser corrigido sem inventar, retire a parte que inventa.",
    ].join("\n"),
  }
}

export async function gerarLeituraSinastria(o: {
  preparo: Preparo
  locale: Locale
  /** a geração: devolve o JSON já lido */
  gerar: (prompt: { system: string; user: string }) => Promise<unknown>
  reparoAtivo?: boolean
}): Promise<ResultadoDaLeitura> {
  const { preparo, locale } = o
  const verificar = (bruto: unknown) => verificarLeituraSinastria({ bruto, payload: preparo.payload, selecao: preparo.selecao, locale, mapa: preparo.mapa })

  let bruto = await o.gerar(preparo.prompt)
  let v = verificar(bruto)
  if (v.ok) return { origem: "geracao", leitura: v.leitura, avisos: v.avisos, reparos: 0 }

  let reparos = 0
  for (let k = 0; k < LIMITE_DE_REPAROS_DA_LEITURA && !v.ok && o.reparoAtivo !== false; k++) {
    reparos += 1
    bruto = await o.gerar(pedidoDeReparoDaLeitura(preparo.prompt, bruto, v.violacoes, preparo.payload))
    v = verificar(bruto)
  }
  if (v.ok) return { origem: "reparo", leitura: v.leitura, avisos: v.avisos, reparos }
  return { origem: "indisponivel", leitura: null, violacoes: v.violacoes, avisos: v.avisos, reparos }
}
