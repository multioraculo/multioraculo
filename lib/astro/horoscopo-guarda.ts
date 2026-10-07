/**
 * Trava de custo do /api/horoscopo.
 *
 * A rota é aberta de propósito (o horóscopo é a porta de entrada do módulo) e
 * o resultado BOM já é guardado: são no máximo 12 signos x 3 idiomas = 36
 * gerações pagas por dia, e depois todo mundo lê do banco. O que sobrava sem
 * trava eram dois caminhos de repetição:
 *
 *  1. LEITURA QUE FALHA. Quando a geração não passa no verificador, nada é
 *     gravado, e o pedido seguinte tenta de novo, pagando outra rodada de até
 *     várias chamadas ao modelo. Um rastreador ou um script batendo na mesma
 *     URL repetiria esse gasto a cada requisição.
 *  2. PEDIDOS SIMULTÂNEOS. Antes do primeiro terminar e gravar, todos os
 *     outros também veem "cache vazio" e geram.
 *
 * Esta guarda fecha os dois, sem tabela nova e sem mudar o que o leitor vê:
 *
 *  - um pedido igual em andamento é COMPARTILHADO (uma geração, vários
 *    leitores);
 *  - uma geração que tentou e falhou ESFRIA aquela chave por alguns minutos;
 *    nesse tempo a rota devolve o céu calculado sem texto, que é o mesmo que
 *    ela já devolve quando a geração falha.
 *
 * LIMITE HONESTO: a memória é a da instância (função serverless). Duas
 * instâncias frias ainda podem gerar a mesma chave ao mesmo tempo. Um teto
 * global exigiria gravar o estado no banco (migration + service role), o que
 * é decisão à parte. Para o risco real, crawler ou script repetindo a mesma
 * URL, a guarda por instância já reduz a repetição de "toda requisição" para
 * "uma tentativa por janela".
 *
 * Falha por infraestrutura (cache indisponível, sem chave da OpenAI) NÃO
 * esfria: não houve tentativa paga, e esfriar atrasaria a recuperação.
 */

export type ResultadoGuardado = { leitura: unknown; tentativas: number }

export type RespostaDaGuarda<T> = { estado: "ok"; resultado: T } | { estado: "esfriando" }

export const ESFRIAMENTO_PADRAO_MS = 5 * 60_000
const LIMITE_DE_CHAVES = 500

export function criarGuarda(opcoes: { esfriamentoMs?: number; agora?: () => number } = {}) {
  const esfriamentoMs = opcoes.esfriamentoMs ?? ESFRIAMENTO_PADRAO_MS
  const agora = opcoes.agora ?? Date.now
  const emAndamento = new Map<string, Promise<unknown>>()
  const esfriaAte = new Map<string, number>()

  function podar() {
    if (esfriaAte.size <= LIMITE_DE_CHAVES) return
    const t = agora()
    for (const [chave, ate] of esfriaAte) if (ate <= t) esfriaAte.delete(chave)
  }

  async function executar<T extends ResultadoGuardado>(
    chave: string,
    gerar: () => Promise<T>,
  ): Promise<RespostaDaGuarda<T>> {
    const ate = esfriaAte.get(chave)
    if (ate !== undefined) {
      if (agora() < ate) return { estado: "esfriando" }
      esfriaAte.delete(chave)
    }

    const andamento = emAndamento.get(chave) as Promise<T> | undefined
    if (andamento) return { estado: "ok", resultado: await andamento }

    const promessa = gerar()
    emAndamento.set(chave, promessa)
    try {
      const resultado = await promessa
      // tentou gastar e não saiu leitura: esfria. Sem tentativa (cache fora do
      // ar, sem chave) não houve gasto, então não esfria.
      if (resultado.leitura === null && resultado.tentativas > 0) {
        esfriaAte.set(chave, agora() + esfriamentoMs)
        podar()
      }
      return { estado: "ok", resultado }
    } catch (erro) {
      esfriaAte.set(chave, agora() + esfriamentoMs)
      podar()
      throw erro
    } finally {
      emAndamento.delete(chave)
    }
  }

  return { executar }
}

/** Guarda única da rota. Vive o quanto a instância viver. */
export const guardaDoHoroscopo = criarGuarda()
