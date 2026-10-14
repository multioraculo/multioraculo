/**
 * Os EIXOS da sinastria: o degrau que faltava entre "uma lista de dinâmicas"
 * e "uma leitura do encontro".
 *
 * O PROBLEMA QUE ISTO RESOLVE. O payload entrega ao modelo uma lista de
 * dinâmicas, cada uma com as frases do repertório, em ordem de relevância. Sem
 * mais nada, a única síntese possível é a que as baterias mostraram: "há apoio e
 * há atrito", que vale para qualquer casal. O modelo não tem como saber quais
 * dinâmicas dizem a MESMA coisa, quais se contradizem e quais pesam, porque
 * essa informação não está na lista. Pedir que ele "integre" sem dar isso é
 * pedir que invente a integração.
 *
 * O QUE ESTE ARQUIVO FAZ. Agrupa as dinâmicas selecionadas por TEMA (uma
 * pergunta que o encontro põe: reconhecimento, troca, atração, segurança,
 * autonomia, idealização, intensidade...), mede a POLARIDADE de cada uma
 * (apoio, tensão, ou as duas) com os mesmos critérios que o verificador já
 * usa, e decide, POR CÓDIGO, quais temas são centrais, quais são secundários,
 * quais se contradizem e quais são isolados demais para definir o vínculo. O
 * modelo escreve a leitura; ele não decide o que é central.
 *
 * O QUE É DO LIVRO E O QUE É EDITORIAL. Tudo o que as dinâmicas dizem continua
 * vindo da evidência (Davison, parafraseado). Este arquivo acrescenta DUAS
 * coisas editoriais, e as rotula como tais: (1) a tabela `TEMA_DO_CORPO`, que
 * diz a que pergunta simbólica cada planeta pertence (Saturno: segurança e
 * limite; Urano: autonomia; Netuno: idealização; Plutão: intensidade e poder),
 * e (2) os pesos, que vêm da ORDEM DE RELEVÂNCIA que o seletor já calculou.
 * Nenhuma das duas cria evidência: o tema é um nome para o que a dinâmica já
 * diz, e o verificador continua exigindo que cada afirmação cite uma dinâmica
 * real.
 *
 * NÃO É CONTAGEM. O peso de um tema é a soma do peso de posição das suas
 * dinâmicas (a primeira vale 1, e cada posição a menos vale menos, com piso), e
 * a camada de overlays, que é secundária, vale pouco. Três dinâmicas do fim da
 * lista não pesam o que pesa uma do topo. A CONVERGÊNCIA (duas ou mais
 * dinâmicas diferentes, na mesma direção, no mesmo tema) é registrada à parte,
 * porque é ela que autoriza dizer "isto se repete em mais de um ponto".
 *
 * NÃO TOCA O CÁLCULO. Consome só o `PayloadSinastria` já montado, sem alterar
 * o seletor, os orçamentos nem os critérios.
 */
import { sustentaEncontro, sustentaTensao, type DinamicaNoPayload, type PayloadSinastria } from "./payload-sinastria"

import { TEMAS, corposDoFato, temaDoContato, type TemaId } from "./temas-sinastria"

export { TEMAS, corposDoFato, temaDoContato, type TemaId }

// ── os pesos ─────────────────────────────────────────────────────────────────

/** O peso de posição: a ordem de relevância que o seletor já calculou. Não é pontuação da relação. */
export const pesoDeAspecto = (posicao: number) => Math.max(0.25, 1 - 0.14 * posicao)
/** Os overlays são a camada secundária: pesam pouco, e nunca definem sozinhos o centro do vínculo. */
export const PESO_DE_OVERLAY = 0.2

export type Membro = {
  id: string
  posicao: number
  camada: "aspectos" | "overlays"
  apoio: boolean
  tensao: boolean
  peso: number
}

export type Eixo = {
  tema: TemaId
  rotulo: string
  membros: Membro[]
  pesoApoio: number
  pesoTensao: number
  peso: number
  papel: "central" | "secundario" | "isolado"
  /** duas dinâmicas diferentes, na mesma direção, no mesmo tema */
  convergeApoio: boolean
  convergeTensao: boolean
  /** apoio e tensão pesam, os dois, de forma relevante neste tema */
  ambivalente: boolean
}

export type Contradicao = {
  /** a dinâmica do topo que vai contra o perfil do centro */
  id: string
  /** apoio ou tensão: o sentido em que ela contraria */
  sentido: "apoio" | "tensao"
  posicao: number
}

export type MapaDeEixos = {
  eixos: Eixo[]
  /** de um a dois temas: o que o encontro mais põe em jogo */
  centrais: TemaId[]
  /** "apoio" e "tensao" quando uma direção domina o centro; "ambivalente" quando as duas pesam, ou "indefinido" sem dinâmica */
  perfil: "apoio" | "tensao" | "ambivalente" | "indefinido"
  /** dinâmicas bem posicionadas que contrariam o perfil do centro: não podem ser escondidas */
  contradicoes: Contradicao[]
  /** os ids de dinâmica de cada papel, para o verificador */
  idsCentrais: string[]
}

const LIMIAR_CENTRAL = 0.8
/** as dinâmicas depois da melhor somam esta fração do peso delas */
const FRACAO_DOS_DEMAIS = 0.3
const TETO_DOS_OVERLAYS = 0.15
/** o segundo tema também é central quando chega perto do primeiro */
const PROXIMIDADE_DO_SEGUNDO = 0.8
/** uma direção é "relevante" no tema quando pesa ao menos isto da outra */
const AMBIVALENCIA = 0.4
/** as quatro primeiras posições: o que não pode ser omitido quando contraria o centro */
const TOPO = 4

export function mapaDeEixos(payload: Pick<PayloadSinastria, "aspectos" | "overlays">): MapaDeEixos {
  const membrosPorTema = new Map<TemaId, Membro[]>()
  const todas: Array<{ d: DinamicaNoPayload; posicao: number }> = [
    ...payload.aspectos.map((d, i) => ({ d, posicao: i })),
    ...payload.overlays.map((d, i) => ({ d, posicao: payload.aspectos.length + i })),
  ]
  for (const { d, posicao } of todas) {
    const corpos = [...new Set(d.fatos.flatMap((f) => corposDoFato(f.id)))]
    const tema = temaDoContato(d.camada === "aspectos" ? corposDoFato(d.fatos[0].id) : corpos)
    const peso = d.camada === "aspectos" ? pesoDeAspecto(posicao) : PESO_DE_OVERLAY
    const m: Membro = { id: d.id, posicao, camada: d.camada, apoio: sustentaEncontro(d), tensao: sustentaTensao(d), peso }
    membrosPorTema.set(tema, [...(membrosPorTema.get(tema) ?? []), m])
  }

  /**
   * O peso de um conjunto de dinâmicas: a MELHOR posição manda, e as outras só somam uma fração dela. É isto que
   * impede a contagem: três dinâmicas do fim da lista não chegam ao que pesa uma do topo. Os overlays somam pouco e
   * têm teto.
   */
  const agrega = (itens: Array<{ peso: number; camada: Membro["camada"] }>) => {
    const asp = itens.filter((i) => i.camada === "aspectos").map((i) => i.peso).sort((a, b) => b - a)
    const ov = itens.filter((i) => i.camada === "overlays").length
    const base = asp.length ? asp[0] + FRACAO_DOS_DEMAIS * asp.slice(1).reduce((s, x) => s + x, 0) : 0
    return base + Math.min(TETO_DOS_OVERLAYS, PESO_DE_OVERLAY * ov * 0.5)
  }
  const eixos: Eixo[] = [...membrosPorTema.entries()].map(([tema, membros]) => {
    // uma dinâmica que traz apoio e tensão divide o peso entre as duas direções
    const lado = (l: "apoio" | "tensao") => agrega(membros.filter((m) => m[l]).map((m) => ({ peso: m.peso / (m.apoio && m.tensao ? 2 : 1), camada: m.camada })))
    const pesoApoio = lado("apoio")
    const pesoTensao = lado("tensao")
    const soApoio = membros.filter((m) => m.apoio && !m.tensao).length
    const soTensao = membros.filter((m) => m.tensao && !m.apoio).length
    const maior = Math.max(pesoApoio, pesoTensao)
    const menor = Math.min(pesoApoio, pesoTensao)
    return {
      tema,
      rotulo: TEMAS[tema].rotulo,
      membros,
      pesoApoio,
      pesoTensao,
      peso: agrega(membros),
      papel: "secundario",
      convergeApoio: soApoio >= 2,
      convergeTensao: soTensao >= 2,
      ambivalente: menor > 0 && menor >= AMBIVALENCIA * maior,
    }
  })

  eixos.sort((a, b) => b.peso - a.peso || Math.min(...a.membros.map((m) => m.posicao)) - Math.min(...b.membros.map((m) => m.posicao)))

  const centrais: TemaId[] = []
  if (eixos[0] && eixos[0].peso >= LIMIAR_CENTRAL) {
    eixos[0].papel = "central"
    centrais.push(eixos[0].tema)
    const segundo = eixos[1]
    if (segundo && segundo.peso >= LIMIAR_CENTRAL && segundo.peso >= PROXIMIDADE_DO_SEGUNDO * eixos[0].peso) {
      segundo.papel = "central"
      centrais.push(segundo.tema)
    }
  } else if (eixos[0]) {
    // nenhum tema chega ao limiar: o de maior peso ainda é o centro, mas fino
    eixos[0].papel = "central"
    centrais.push(eixos[0].tema)
  }
  for (const e of eixos) {
    if (e.papel === "central") continue
    // um único contato, de baixa posição ou de overlay, não define o vínculo
    if (e.membros.length === 1 && (e.membros[0].camada === "overlays" || e.membros[0].posicao >= TOPO)) e.papel = "isolado"
  }

  const centrosAbertos = eixos.filter((e) => e.papel === "central")
  const apoio = centrosAbertos.reduce((s, e) => s + e.pesoApoio, 0)
  const tensao = centrosAbertos.reduce((s, e) => s + e.pesoTensao, 0)
  const perfil: MapaDeEixos["perfil"] =
    centrosAbertos.length === 0
      ? "indefinido"
      : centrosAbertos.some((e) => e.ambivalente) || Math.min(apoio, tensao) >= AMBIVALENCIA * Math.max(apoio, tensao)
        ? "ambivalente"
        : apoio > tensao
          ? "apoio"
          : "tensao"

  // a contradição: o que está no topo da lista e vai contra a direção do centro
  const contradicoes: Contradicao[] = []
  if (perfil === "apoio" || perfil === "tensao") {
    const contra = perfil === "apoio" ? "tensao" : "apoio"
    const centraisIds = new Set(centrosAbertos.flatMap((e) => e.membros.map((m) => m.id)))
    for (const { d, posicao } of todas) {
      if (posicao >= TOPO || d.camada !== "aspectos") continue
      const vai = contra === "tensao" ? sustentaTensao(d) && !sustentaEncontro(d) : sustentaEncontro(d) && !sustentaTensao(d)
      if (vai && !centraisIds.has(d.id)) contradicoes.push({ id: d.id, sentido: contra, posicao })
    }
  }

  return {
    eixos,
    centrais,
    perfil,
    contradicoes,
    idsCentrais: centrosAbertos.flatMap((e) => e.membros.map((m) => m.id)),
  }
}

/** O mapa de eixos como o prompt o lê: decidido por código, e só escrito pelo modelo. */
export function descreverEixos(mapa: MapaDeEixos): string {
  if (mapa.eixos.length === 0) return "  (nenhuma dinâmica: não há eixo)"
  const dir = (m: Membro) => (m.apoio && m.tensao ? "apoio e tensão" : m.apoio ? "apoio" : m.tensao ? "tensão" : "neutra")
  const linha = (e: Eixo) =>
    `    [${e.tema}] ${e.rotulo} (${TEMAS[e.tema].pergunta})\n      dinâmicas: ${e.membros.map((m) => `${m.id} (${dir(m)}, posição ${m.posicao + 1}${m.camada === "overlays" ? ", camada secundária" : ""})`).join("; ")}` +
    `${e.convergeApoio ? "\n      convergência: mais de uma dinâmica aponta apoio neste tema" : ""}` +
    `${e.convergeTensao ? "\n      convergência: mais de uma dinâmica aponta tensão neste tema" : ""}` +
    `${e.ambivalente ? "\n      ambivalente: apoio e tensão pesam aqui, os dois" : ""}`
  const por = (papel: Eixo["papel"]) => mapa.eixos.filter((e) => e.papel === papel)
  const perfil =
    mapa.perfil === "ambivalente"
      ? "AMBIVALENTE: o centro do encontro reúne apoio e tensão com peso parecido. O parecer tem de dizer isso e dizer ONDE está a ambivalência."
      : mapa.perfil === "apoio"
        ? "O centro do encontro pende para o APOIO. O parecer afirma isso, e a tensão relevante entra como contraponto, sem apagar o que pende."
        : mapa.perfil === "tensao"
          ? "O centro do encontro pende para a TENSÃO. O parecer afirma isso, e o apoio relevante entra como contraponto, sem apagar o que pende."
          : "sem perfil"
  const partes = [`  PERFIL DO CENTRO: ${perfil}`, "", "  EIXO(S) CENTRAL(IS) (o parecer e o significado falam daqui):", ...por("central").map(linha)]
  const secundarios = por("secundario")
  if (secundarios.length) partes.push("", "  EIXOS SECUNDÁRIOS (qualificam o centro; não o substituem):", ...secundarios.map(linha))
  const isolados = por("isolado")
  if (isolados.length) partes.push("", "  TEMAS ISOLADOS (um contato só, sem força para definir o vínculo; mencione no máximo de passagem, ou omita):", ...isolados.map(linha))
  if (mapa.contradicoes.length)
    partes.push(
      "",
      `  CONTRADIÇÃO QUE NÃO PODE SER ESCONDIDA (dinâmica bem posicionada que vai contra o perfil do centro): ${mapa.contradicoes.map((c) => `${c.id} (${c.sentido === "tensao" ? "tensão" : "apoio"}, posição ${c.posicao + 1})`).join("; ")}`,
    )
  return partes.join("\n")
}
