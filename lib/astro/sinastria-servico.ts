/**
 * A sinastria como serviço: validação, plano pago, comparação avulsa e o ato
 * explícito de salvar uma pessoa. Sem rede, sem Next, sem modelo de linguagem.
 *
 * As rotas são finas de propósito. Toda a política mora aqui, onde dá para
 * testar com um armazenamento falso, e são três regras que não podem se perder:
 *
 *  1. QUEM NÃO PAGA NÃO CALCULA. O plano é conferido antes de qualquer outra
 *     coisa, e a comparação não toca no mapa de ninguém sem ele.
 *  2. A COMPARAÇÃO NÃO GRAVA NADA. A pessoa B de uma comparação é só um
 *     argumento da função: sai da memória quando a resposta sai. Guardar é um
 *     ato à parte (`salvarPessoa`), pedido por quem usa.
 *  3. O VÍNCULO NÃO ENTRA NO CÁLCULO. Ele é devolvido junto, para a síntese
 *     futura escolher a ênfase, mas `sinastria()` nunca o recebe.
 *
 * Privacidade: o apelido é o único nome que existe, nunca vai a lugar nenhum
 * além do próprio cadastro, e não pode ser um e-mail.
 */
import { hasAstroPessoal, type Plan } from "@/lib/billing/plans"
import { hojeCivil } from "@/lib/marcos"
import { ANOS_ACEITOS, mapaNatal, resolverZona, type DadosNascimento } from "./mapa"
import { sinastria, type ResultadoSinastria } from "./sinastria"

export const VINCULOS = ["romantico", "amizade", "familia", "trabalho", "outro"] as const
export type Vinculo = (typeof VINCULOS)[number]
export const ehVinculo = (v: unknown): v is Vinculo => typeof v === "string" && (VINCULOS as readonly string[]).includes(v)

/** O teto de pessoas guardadas por conta: dado de terceiros não se acumula sem limite. */
export const MAX_PESSOAS = 50

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/
const FORMATO_HORA = /^\d{2}:\d{2}$/

export type NascimentoValidado = DadosNascimento & { tz: string; tzStatus: "ok" | "ambiguous" | "nonexistent" }

export type Validacao<T> = { ok: true; dados: T } | { ok: false; erro: string }

function dataExiste(texto: string): boolean {
  const [a, m, d] = texto.split("-").map(Number)
  const t = new Date(Date.UTC(a, m - 1, d))
  return t.getUTCFullYear() === a && t.getUTCMonth() === m - 1 && t.getUTCDate() === d
}

/**
 * Os dados de nascimento de uma pessoa que veio de fora. As mesmas regras de
 * `/api/mapa`, com as faixas de hora conferidas (o motor não gosta de 99:99),
 * e a zona resolvida pelas coordenadas, nunca pelo que veio escrito.
 */
export function validarNascimento(corpo: unknown, opcoes: { exigirLocal?: boolean; hoje?: string } = {}): Validacao<NascimentoValidado> {
  const c = (corpo ?? {}) as Record<string, unknown>
  const born_on = String(c.born_on ?? "").trim()
  const horaBruta = c.born_at === null || c.born_at === undefined || c.born_at === "" ? null : String(c.born_at).trim()
  const lat = Number(c.lat)
  const lon = Number(c.lon)
  const place_label = String(c.place_label ?? "").trim().slice(0, 120)
  const hoje = opcoes.hoje ?? hojeCivil()

  if (!FORMATO_DATA.test(born_on) || !dataExiste(born_on)) return { ok: false, erro: "Data de nascimento inválida." }
  if (horaBruta !== null) {
    if (!FORMATO_HORA.test(horaBruta)) return { ok: false, erro: "Hora de nascimento inválida." }
    const [h, m] = horaBruta.split(":").map(Number)
    if (h > 23 || m > 59) return { ok: false, erro: "Hora de nascimento inválida." }
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return { ok: false, erro: "Latitude inválida." }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return { ok: false, erro: "Longitude inválida." }
  if (opcoes.exigirLocal && !place_label) return { ok: false, erro: "Cidade de nascimento inválida." }
  if (born_on > hoje) return { ok: false, erro: "A data de nascimento não pode estar no futuro." }
  const limite = `${Number(hoje.slice(0, 4)) - ANOS_ACEITOS}${hoje.slice(4)}`
  if (born_on < limite) return { ok: false, erro: "O motor cobre os últimos cem anos." }

  const dados: DadosNascimento = { born_on, born_at: horaBruta, lat, lon, place_label }
  const zona = resolverZona(dados)
  return { ok: true, dados: { ...dados, tz: zona.tz, tzStatus: zona.status } }
}

/** O apelido: o único nome que a pessoa B tem. Sem e-mail, sem texto de controle. */
export function validarApelido(bruto: unknown): Validacao<string> {
  const apelido = String(bruto ?? "").replace(/\s+/g, " ").trim()
  if (apelido.length < 1 || apelido.length > 40) return { ok: false, erro: "O apelido tem de 1 a 40 caracteres." }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f]/.test(apelido)) return { ok: false, erro: "Apelido inválido." }
  if (apelido.includes("@")) return { ok: false, erro: "Use um apelido, não um e-mail." }
  return { ok: true, dados: apelido }
}

export type NegadoPorPlano = { ok: false; status: 402; erro: "plano_necessario" }
const negado = (): NegadoPorPlano => ({ ok: false, status: 402, erro: "plano_necessario" })

export type Comparacao = ResultadoSinastria & {
  /** devolvido para a síntese escolher a ênfase; o cálculo nunca o viu */
  vinculo: Vinculo
  pessoas: {
    A: { horaConhecida: boolean; sistemaDeCasas: string }
    B: { horaConhecida: boolean; sistemaDeCasas: string; tzStatus: NascimentoValidado["tzStatus"] }
  }
}

/**
 * Compara dois mapas e devolve os fatos. Não lê nem escreve em lugar nenhum.
 * `a` é o mapa de quem pede, já lido pelo chamador; `b` é um argumento e some
 * com a chamada.
 */
export function compararAvulsa(params: {
  plano: Plan
  a: DadosNascimento
  b: NascimentoValidado
  vinculo: Vinculo
}): ({ ok: true } & Comparacao) | NegadoPorPlano {
  const { plano, a, b, vinculo } = params
  if (!hasAstroPessoal(plano)) return negado()

  const mapaA = mapaNatal(a)
  const mapaB = mapaNatal(b)
  const resultado = sinastria(mapaA, mapaB)
  return {
    ok: true,
    ...resultado,
    vinculo,
    pessoas: {
      A: { horaConhecida: mapaA.horaConhecida, sistemaDeCasas: mapaA.sistemaCasas },
      B: { horaConhecida: mapaB.horaConhecida, sistemaDeCasas: mapaB.sistemaCasas, tzStatus: b.tzStatus },
    },
  }
}

export type LinhaPessoa = {
  nickname: string
  born_on: string
  born_at: string | null
  tz: string
  tz_status: "ok" | "ambiguous" | "nonexistent"
  lat: number
  lon: number
  place_label: string
}

/** O que o armazenamento precisa saber fazer. Quem implementa é o Supabase, com RLS. */
export type PessoasStore = {
  contar(ownerId: string): Promise<number>
  inserir(ownerId: string, linha: LinhaPessoa): Promise<{ id: string }>
  obter(ownerId: string, id: string): Promise<(LinhaPessoa & { id: string }) | null>
  listar(ownerId: string): Promise<Array<{ id: string; nickname: string; place_label: string; born_on: string }>>
  apagar(ownerId: string, id: string): Promise<boolean>
}

/**
 * O ato explícito de guardar uma pessoa. É a ÚNICA função que escreve, e só é
 * chamada por uma rota própria, a pedido de quem usa.
 */
export async function salvarPessoa(params: {
  store: PessoasStore
  ownerId: string
  plano: Plan
  apelido: unknown
  nascimento: unknown
}): Promise<{ ok: true; id: string } | { ok: false; status: number; erro: string }> {
  const { store, ownerId, plano } = params
  if (!hasAstroPessoal(plano)) return negado()

  const apelido = validarApelido(params.apelido)
  if (!apelido.ok) return { ok: false, status: 400, erro: apelido.erro }
  const nasc = validarNascimento(params.nascimento, { exigirLocal: true })
  if (!nasc.ok) return { ok: false, status: 400, erro: nasc.erro }

  if ((await store.contar(ownerId)) >= MAX_PESSOAS) {
    return { ok: false, status: 409, erro: "limite_de_pessoas" }
  }
  const d = nasc.dados
  const { id } = await store.inserir(ownerId, {
    nickname: apelido.dados,
    born_on: d.born_on,
    born_at: d.born_at,
    tz: d.tz as string,
    tz_status: d.tzStatus,
    lat: d.lat,
    lon: d.lon,
    place_label: d.place_label,
  })
  return { ok: true, id }
}
