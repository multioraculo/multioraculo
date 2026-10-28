/**
 * Jornada dos Sonhos: elegibilidade, estado da análise salva e persistência.
 *
 * Tudo aqui é puro ou recebe o cliente de banco por parâmetro, de modo que a
 * tela, a rota e os testes leem a MESMA regra. Nada importa servidor nem IA.
 *
 * Persistência: a tabela `journey_analyses` já existe em produção (sem
 * migration neste repositório). Verificado em produção: a coluna da contagem
 * se chama `dreams_count` e é NOT NULL (não existe `dreams_analyzed`), então
 * toda gravação a informa. Não ganhou coluna: a versão nova guarda os ids dos sonhos
 * DENTRO do JSON de `analysis_text`. Linhas antigas (sem `versao`) continuam
 * legíveis e nunca são reescritas; cada geração é uma linha nova, o que dá o
 * histórico.
 */

import type { JourneyData } from "@/lib/types"

/** a primeira síntese vale a partir de dois sonhos */
export const MIN_SONHOS = 2
/** a leitura considera os sonhos mais recentes, para caber no modelo */
export const MAX_SONHOS = 12
/** trecho de cada relato enviado ao modelo */
export const MAX_CHARS_SONHO = 1200

export type SonhoDaJornada = { id: string; dream_description: string; created_at: string }

export type TipoEvolucao = "persists" | "changed" | "gaining" | "fading" | "revised"
export const TIPOS_EVOLUCAO: TipoEvolucao[] = ["persists", "changed", "gaining", "fading", "revised"]

export type JornadaV2 = {
  versao: 2
  locale: string
  /** ids dos sonhos considerados, do mais antigo ao mais recente */
  dreamIds: string[]
  timeline: Array<{ number: number; title: string; archetypes: string; summary: string }>
  /** relações simbólicas entre os sonhos */
  connections: string[]
  /** só com 3+ sonhos: o que permanece, mudou, ganhou ou perdeu força */
  evolution: Array<{ type: TipoEvolucao; text: string }>
  /** leitura integrada, em hipótese */
  integrated: string
  /** o que permanece incerto */
  openQuestions: string[]
}

export type AnaliseLida = { versao: 1; data: JourneyData } | { versao: 2; data: JornadaV2 }

export type LinhaDeJornada = {
  id: string
  analysis_text: string
  /** NOT NULL em produção; linhas antigas podem trazer qualquer valor */
  dreams_count?: number | null
  created_at: string
}

/** lê o JSON salvo; null quando não é JSON da jornada (formato de texto antigo) */
export function lerAnalise(analysisText: string | null | undefined): AnaliseLida | null {
  if (!analysisText) return null
  let o: any
  try {
    o = JSON.parse(analysisText)
  } catch {
    return null
  }
  if (!o || typeof o !== "object") return null
  if (o.versao === 2 && Array.isArray(o.dreamIds) && Array.isArray(o.timeline)) {
    return {
      versao: 2,
      data: {
        versao: 2,
        locale: String(o.locale ?? ""),
        dreamIds: o.dreamIds.map(String),
        timeline: o.timeline,
        connections: Array.isArray(o.connections) ? o.connections : [],
        evolution: Array.isArray(o.evolution) ? o.evolution : [],
        integrated: String(o.integrated ?? ""),
        openQuestions: Array.isArray(o.openQuestions) ? o.openQuestions : [],
      },
    }
  }
  if (Array.isArray(o.timeline) && Array.isArray(o.patterns)) return { versao: 1, data: o as JourneyData }
  return null
}

/** os sonhos que entram na leitura: os mais recentes, em ordem cronológica */
export function janelaDeSonhos<T extends { created_at: string }>(sonhos: T[]): T[] {
  // por instante (formatos de data diferentes não podem desordenar) e, no empate, pelo id
  const ordenados = [...sonhos].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at) || String((a as any).id ?? "").localeCompare(String((b as any).id ?? "")))
  return ordenados.slice(-MAX_SONHOS)
}

export type FaseDaJornada =
  | "nenhum"          // zero sonhos
  | "convite"         // um sonho: convite discreto
  | "pronta"          // 2+ sonhos, nenhuma análise (ou análise ilegível)
  | "atual"           // análise cobre exatamente os sonhos atuais
  | "desatualizada"   // há sonhos mais novos que a análise
  | "sonho_excluido"  // a análise cita sonho que já não existe

export type EstadoDaJornada = {
  fase: FaseDaJornada
  total: number
  /** ids da janela que a análise ainda não considerou */
  novos: string[]
  /** ids que a análise considerou e que foram excluídos */
  excluidos: string[]
  /** ids que fundamentam a análise e ainda existem */
  fundamentos: string[]
}

export function estadoDaJornada(sonhos: SonhoDaJornada[], salva: LinhaDeJornada | null): EstadoDaJornada {
  const total = sonhos.length
  const vazio = { total, novos: [], excluidos: [], fundamentos: [] }
  if (total === 0) return { fase: "nenhum", ...vazio }
  if (total < MIN_SONHOS) return { fase: "convite", ...vazio }

  const lida = salva ? lerAnalise(salva.analysis_text) : null
  if (!salva || !lida) return { fase: "pronta", ...vazio }

  const janela = janelaDeSonhos(sonhos).map((s) => s.id)

  if (lida.versao === 2) {
    const existentes = new Set(sonhos.map((s) => s.id))
    const usados = lida.data.dreamIds
    const excluidos = usados.filter((id) => !existentes.has(id))
    const novos = janela.filter((id) => !usados.includes(id))
    const fundamentos = usados.filter((id) => existentes.has(id))
    const fase: FaseDaJornada = excluidos.length ? "sonho_excluido" : novos.length ? "desatualizada" : "atual"
    return { fase, total, novos, excluidos, fundamentos }
  }

  // formato antigo: não há ids, só a contagem (dreams_count; se faltar, os itens
  // da linha do tempo, um por sonho). Mais sonhos que antes = há novos; menos =
  // algum foi excluído
  const antes = salva.dreams_count ?? lida.data.timeline.length
  const alvo = Math.min(total, MAX_SONHOS)
  if (antes > total) return { fase: "sonho_excluido", total, novos: [], excluidos: [], fundamentos: [] }
  if (antes < alvo) return { fase: "desatualizada", total, novos: janela.slice(antes), excluidos: [], fundamentos: janela.slice(0, antes) }
  return { fase: "atual", total, novos: [], excluidos: [], fundamentos: janela }
}

export type DecisaoDaJornada =
  | { acao: "insuficiente" }
  | { acao: "reutilizar" }
  | { acao: "gerar"; sonhos: SonhoDaJornada[]; anterior: JornadaV2 | null; novosIds: string[] }

/**
 * O que a rota faz com o pedido. Reutilizar vem ANTES de qualquer cobrança:
 * análise em dia nunca chama o modelo nem consome cota. A análise anterior só
 * volta ao prompt se todos os sonhos dela ainda existem (nada de conteúdo
 * excluído indo ao modelo).
 */
export function decidirJornada(sonhos: SonhoDaJornada[], salva: LinhaDeJornada | null): DecisaoDaJornada {
  const estado = estadoDaJornada(sonhos, salva)
  if (estado.fase === "nenhum" || estado.fase === "convite") return { acao: "insuficiente" }
  if (estado.fase === "atual") return { acao: "reutilizar" }
  const lida = salva ? lerAnalise(salva.analysis_text) : null
  const anterior = lida?.versao === 2 && estado.excluidos.length === 0 ? lida.data : null
  return { acao: "gerar", sonhos: janelaDeSonhos(sonhos), anterior, novosIds: estado.novos }
}

// ── banco: sempre filtrado pelo usuário autenticado ────────────────────────────

/** o pedaço do cliente Supabase que estas funções usam (facilita o teste) */
export type ClienteJornada = { from: (tabela: string) => any }

export async function carregarSonhosDoUsuario(client: ClienteJornada, userId: string): Promise<SonhoDaJornada[]> {
  const { data, error } = await client
    .from("dreams")
    .select("id, dream_description, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as SonhoDaJornada[]
}

export async function ultimaAnaliseDoUsuario(client: ClienteJornada, userId: string): Promise<LinhaDeJornada | null> {
  const { data, error } = await client
    .from("journey_analyses")
    .select("id, analysis_text, dreams_count, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data ?? null) as LinhaDeJornada | null
}

/** sempre insere uma linha nova: o histórico fica, nada é reescrito */
export async function salvarAnalise(client: ClienteJornada, userId: string, jornada: JornadaV2): Promise<LinhaDeJornada> {
  const { data, error } = await client
    .from("journey_analyses")
    .insert({ user_id: userId, analysis_text: JSON.stringify(jornada), dreams_count: jornada.dreamIds.length })
    .select("id, analysis_text, dreams_count, created_at")
    .single()
  if (error) throw new Error(error.message)
  return data as LinhaDeJornada
}
