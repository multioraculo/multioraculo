/**
 * O repertório relacional do Davison, carregado e consultável.
 *
 * Só dados. Nada aqui gera texto, escolhe o que dizer ou pesa um fato contra o
 * outro: isso é a síntese, que ainda não existe. A consulta apenas liga um fato
 * de sinastria à glosa que a fonte tem para ele.
 */
import type { AspectoSinastria, FatoAspecto, FatoOverlay, FatoSemelhanca } from "../sinastria"
import { CASAS_DAVISON } from "./casas"
import { INTERASPECTOS_DAVISON } from "./interaspectos"
import { OVERLAYS_DAVISON } from "./overlays"
import { SEMELHANCAS_DAVISON } from "./semelhancas"
import type { CondicaoDoItem, Corpo, Especifico, GlosaDeCasa, GlosaDeOverlay, GlosaDePar, GlosaDeSemelhanca, Valencia } from "./tipos"
import { camposDeOverlay, camposDePar } from "./validar"

export const INTERASPECTOS: GlosaDePar[] = INTERASPECTOS_DAVISON
export const OVERLAYS: GlosaDeOverlay[] = OVERLAYS_DAVISON
export const CASAS: GlosaDeCasa[] = CASAS_DAVISON
export const SEMELHANCAS: GlosaDeSemelhanca[] = SEMELHANCAS_DAVISON

const porPar = new Map<string, GlosaDePar>()
for (const g of INTERASPECTOS) porPar.set([...g.corpos].sort().join("|"), g)
const porOverlay = new Map<string, GlosaDeOverlay>()
for (const g of OVERLAYS) porOverlay.set(`${g.planeta}|${g.casa}`, g)

/** A glosa do par, em qualquer ordem: o livro trata cada par uma vez só. */
export function glosaDoPar(a: string, b: string): GlosaDePar | null {
  return porPar.get([a, b].sort().join("|")) ?? null
}

export function glosaDoOverlay(planeta: string, casa: number): GlosaDeOverlay | null {
  return porOverlay.get(`${planeta}|${casa}`) ?? null
}

export type GlosasDoAspecto = {
  par: GlosaDePar
  /** a leitura que o livro separa como favorável para ESTE aspecto, se separa */
  favoravel: Valencia | null
  /** a leitura que o livro separa como adversa para ESTE aspecto, se separa */
  adverso: Valencia | null
  /**
   * leituras que valem para qualquer aspecto (o livro não separa) ou cuja
   * divisão em dois lados é editorial. Nunca são "favoráveis" nem "adversas".
   */
  gerais: Valencia[]
  /** leituras que dependem da condição natal, que o motor não calcula: não se aplicam */
  dependentesDeCondicao: Valencia[]
  /** leituras que o livro dá só para este aspecto */
  especificos: Especifico[]
  /** o que cada corpo faz, resolvido para os corpos de A e de B, quando o par é assimétrico */
  papelDeA: string | null
  papelDeB: string | null
}

/**
 * Liga um fato de aspecto de sinastria à glosa do par. A orientação (qual corpo
 * é de A e qual é de B) é preservada: o papel de cada corpo vai para a pessoa
 * certa, nunca é trocado.
 */
export function glosasDoAspecto(f: Pick<FatoAspecto, "corpoA" | "corpoB" | "aspecto">): GlosasDoAspecto | null {
  const par = glosaDoPar(f.corpoA, f.corpoB)
  if (!par) return null
  const valencias = [par.favoravel, par.adverso].filter((v): v is Valencia => v !== null)
  const aplica = (v: Valencia | null) => (v && v.origem === "separada_pela_fonte" && v.aplicaA.includes(f.aspecto as AspectoSinastria) ? v : null)
  return {
    par,
    favoravel: aplica(par.favoravel),
    adverso: aplica(par.adverso),
    gerais: valencias.filter((v) => v.origem === "leitura_geral" || v.origem === "agrupada_por_tema"),
    dependentesDeCondicao: valencias.filter((v) => v.origem === "condicao_natal"),
    especificos: par.especificos.filter((e) => e.aspecto === f.aspecto),
    papelDeA: par.papeis?.[f.corpoA as Corpo] ?? null,
    papelDeB: par.papeis?.[f.corpoB as Corpo] ?? null,
  }
}

/** A glosa do overlay, com a casa definida. A direção já está no fato; a glosa não a inverte. */
export function glosaDoFatoOverlay(f: Pick<FatoOverlay, "planeta" | "casa">): { glosa: GlosaDeOverlay; casa: GlosaDeCasa } | null {
  const glosa = glosaDoOverlay(f.planeta, f.casa)
  const casa = CASAS.find((c) => c.casa === f.casa)
  return glosa && casa ? { glosa, casa } : null
}

export type ItemDeGlosa = { ref: string; texto: string; condicao: CondicaoDoItem }

/** Todas as frases operacionais de uma glosa, cada uma com a condição de que depende. */
export function itensDe(g: GlosaDePar | GlosaDeOverlay): ItemDeGlosa[] {
  const campos = "planeta" in g ? camposDeOverlay(g) : camposDePar(g)
  return campos.map((c) => ({ ...c, condicao: g.condicoesPorItem[c.ref] ?? { natal: false, aspectos: false } }))
}

/**
 * As frases que NÃO dependem da condição natal. É o que se pode usar como algo
 * que a relação tem: as demais são possibilidades condicionadas a uma aflição
 * ou debilidade que o motor de sinastria não calcula.
 */
export function itensSemCondicaoNatal(g: GlosaDePar | GlosaDeOverlay): ItemDeGlosa[] {
  return itensDe(g).filter((i) => !i.condicao.natal)
}

const porSemelhanca = new Map<string, GlosaDeSemelhanca>()
for (const g of SEMELHANCAS) porSemelhanca.set(g.id, g)

/**
 * A glosa do livro para uma semelhança que o motor calculou, ou nada.
 *
 * Calculável não é interpretável. O livro só sustenta:
 *  - o elemento e o modo DOMINANTES de cada pessoa, para cada par (p. 42 a 50);
 *  - o elemento do Sol quando é o MESMO nos dois (p. 39);
 *  - o mesmo signo na Lua e nos planetas pessoais (p. 30).
 * Todo o resto devolve nulo, e quem consome não deve narrar como ponto em comum.
 */
export function glosaDaSemelhanca(f: Pick<FatoSemelhanca, "dimensao" | "padraoA" | "padraoB" | "tipoDeSemelhanca">): GlosaDeSemelhanca | null {
  if (f.dimensao === "elemento" || f.dimensao === "modo") return porSemelhanca.get(`${f.dimensao}:${[f.padraoA, f.padraoB].sort().join("|")}`) ?? null
  if (f.dimensao === "elemento_do_sol") return f.tipoDeSemelhanca === "igual" ? (porSemelhanca.get("elemento_do_sol") ?? null) : null
  if (f.dimensao === "signo_do_corpo") {
    const g = porSemelhanca.get("signo_do_corpo")
    const corpo = f.padraoA.split(":")[0]
    return g && g.aplicaA.corpos.includes(corpo) ? g : null
  }
  return null
}

/** As ressalvas do livro sobre semelhança demais, que acompanham toda semelhança igual. */
export function ressalvasGeraisDeSemelhanca(): GlosaDeSemelhanca | null {
  return porSemelhanca.get("semelhanca_geral") ?? null
}
