/**
 * Jornada dos Sonhos: a sequência que a rota executa, com as dependências de
 * fora (banco, cobrança, modelo) injetadas. A rota só as monta; os testes as
 * trocam por falsas e provam a sequência sem rede e sem cobrança real.
 *
 * Ordem, e por quê:
 *  1. ler sonhos e a última análise (sempre do usuário autenticado) e decidir;
 *  2. análise em dia: devolve a salva, sem cobrar e sem modelo;
 *  3. outra geração do mesmo usuário em andamento: recusa ANTES de cobrar;
 *  4. cobra (consume_reading, atômico por usuário e tipo);
 *  5. confere de novo se outra geração apareceu entre 3 e 4 e se a análise já
 *     ficou em dia (um pedido que leu o estado antes de outro terminar): em
 *     qualquer caso devolve a cobrança e não gera;
 *  6. gera, normaliza, salva (linha nova) e só então conclui a cobrança.
 */

import type { Locale } from "@/lib/i18n/config"
import {
  carregarSonhosDoUsuario,
  decidirJornada,
  MIN_SONHOS,
  salvarAnalise,
  ultimaAnaliseDoUsuario,
  type ClienteJornada,
  type DecisaoDaJornada,
} from "@/lib/dreams/jornada-estado"
import { montarMensagemJornada, montarPromptJornada, normalizarJornada, verificarJornada } from "@/lib/oracles/jornada-sonhos"

export type ResultadoConsumo = { allowed: true } | { allowed: false; status: number; corpo: Record<string, unknown> }

export type DepsJornada = {
  client: ClienteJornada
  userId: string
  locale: Locale
  novaSeed(): string
  consumir(seed: string): Promise<ResultadoConsumo>
  concluir(seed: string): Promise<void>
  falhar(seed: string): Promise<void>
  /** há outra geração da Jornada deste usuário em curso (que não a de `seed`)? */
  outraEmAndamento(seed: string | null): Promise<boolean>
  modeloDisponivel(): boolean
  gerar(system: string, user: string): Promise<{ raw: unknown; model?: string; usage?: unknown }>
  registrarUso(seed: string, model: string, usage: unknown): Promise<void>
  aviso?(mensagem: string): void
}

export type RespostaJornada = { status: number; corpo: Record<string, unknown> }

const resp = (status: number, corpo: Record<string, unknown>): RespostaJornada => ({ status, corpo })
const EM_ANDAMENTO = resp(409, { error: "Já há uma leitura sendo gerada.", code: "in_progress" })
const INSUFICIENTE = resp(400, { error: `São necessários pelo menos ${MIN_SONHOS} sonhos para a análise.`, code: "not_enough_dreams" })

async function ler(d: DepsJornada) {
  // o id vem da sessão, nunca do corpo do pedido
  const sonhos = await carregarSonhosDoUsuario(d.client, d.userId)
  const salva = await ultimaAnaliseDoUsuario(d.client, d.userId)
  return { salva, decisao: decidirJornada(sonhos, salva) }
}

export async function executarJornada(d: DepsJornada): Promise<RespostaJornada> {
  let lido
  try {
    lido = await ler(d)
  } catch (err: any) {
    return resp(500, { error: err.message ?? "Erro ao ler os sonhos.", code: "read_failed" })
  }
  if (lido.decisao.acao === "insuficiente") return INSUFICIENTE
  if (lido.decisao.acao === "reutilizar") return resp(200, { ok: true, reused: true, journey: lido.salva })

  if (!d.modeloDisponivel()) return resp(500, { error: "OPENAI_API_KEY não configurada.", code: "model_unavailable" })
  // atalho antes de cobrar: se a consulta falhar, segue (a checagem que vale vem depois da cobrança)
  if (await d.outraEmAndamento(null).catch(() => false)) return EM_ANDAMENTO

  const seed = d.novaSeed()
  const consumo = await d.consumir(seed)
  if (!consumo.allowed) return resp(consumo.status, consumo.corpo)

  try {
    // corrida: outra geração começou, ou terminou, entre a primeira leitura e a cobrança
    // esta checagem é a que garante exclusividade: erro de leitura conta como "há outra" (não avança)
    if (await d.outraEmAndamento(seed).catch(() => true)) {
      await d.falhar(seed)
      return EM_ANDAMENTO
    }
    const atual = await ler(d)
    if (atual.decisao.acao !== "gerar") {
      await d.falhar(seed)
      return atual.decisao.acao === "reutilizar"
        ? resp(200, { ok: true, reused: true, journey: atual.salva })
        : INSUFICIENTE
    }
    return await gerarESalvar(d, seed, atual.decisao)
  } catch (err: any) {
    // falha técnica não consome a cota
    await d.falhar(seed).catch(() => {})
    return resp(500, { error: err.message ?? "Erro ao gerar análise.", code: "generation_failed" })
  }
}

async function gerarESalvar(d: DepsJornada, seed: string, decisao: Extract<DecisaoDaJornada, { acao: "gerar" }>): Promise<RespostaJornada> {
  const { sonhos, anterior, novosIds } = decisao
  const novosNumeros = sonhos.flatMap((s, i) => (novosIds.includes(s.id) ? [i + 1] : []))
  const saida = await d.gerar(montarPromptJornada(d.locale, { n: sonhos.length, anterior, novosNumeros }), montarMensagemJornada(sonhos, d.locale))
  await d.registrarUso(seed, saida.model || "gpt-4o", saida.usage)

  const jornada = normalizarJornada(saida.raw, { sonhos, locale: d.locale })
  if (!jornada) throw new Error("Resposta da análise incompleta.")
  const avisos = verificarJornada(jornada, sonhos, d.locale)
  if (avisos.length) d.aviso?.(`avisos editoriais: ${avisos.join("; ")}`)

  // gerou: a cota está paga, então a análise é guardada antes de qualquer outra coisa
  let linha = null
  try {
    linha = await salvarAnalise(d.client, d.userId, jornada)
  } catch (err: any) {
    d.aviso?.(`falha ao salvar: ${err?.message}`)
  }
  await d.concluir(seed)
  return resp(200, { ok: true, reused: false, saved: Boolean(linha), journey: linha, journeyData: jornada })
}
