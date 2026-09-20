/**
 * Os quatro estados de um dado que vem de fora, ditos com todas as letras.
 *
 * O defeito que isto existe para impedir: `useState<X | null>(null)` e, mais
 * abaixo, `dado ? <conteúdo> : <"ainda não disponível">`. Nulo ali significa
 * DUAS coisas ao mesmo tempo, "ainda não perguntei" e "perguntei e não existe",
 * e a tela escolhe sempre a segunda. O resultado é a página abrir afirmando que
 * o conteúdo não existe, e se desmentir um segundo depois.
 *
 * São quatro e não dois porque erro e ausência também não são a mesma coisa:
 *
 *   carregando  a requisição está em andamento. NUNCA dizer que não existe.
 *   pronto      chegou, e tem conteúdo.
 *   ausente     a resposta chegou e de fato não há conteúdo. Só aqui cabe a
 *               frase de indisponível.
 *   erro        a requisição falhou. Não é ausência: o dado pode existir e
 *               não termos conseguido buscar.
 *
 * Erro engolido vira carregamento eterno, que é o outro jeito de mentir: um
 * `.catch(() => {})` deixa a tela girando para sempre sobre uma requisição que
 * já morreu. Por isso todo `catch` aqui termina em `erro`, e não em silêncio.
 */
export type Carregamento<T> =
  | { estado: "carregando" }
  | { estado: "pronto"; dado: T }
  | { estado: "ausente" }
  | { estado: "erro" }

export const CARREGANDO = { estado: "carregando" } as const
export const AUSENTE = { estado: "ausente" } as const
export const ERRO = { estado: "erro" } as const

/** Pronto quando há conteúdo, ausente quando a resposta veio vazia. */
export function chegou<T>(dado: T | null | undefined): Carregamento<T> {
  return dado === null || dado === undefined ? AUSENTE : { estado: "pronto", dado }
}

/**
 * `fetch` que respeita os quatro estados: HTTP fora do 2xx e falha de rede
 * viram `erro`, e não ausência nem silêncio.
 *
 * `extrair` recebe o corpo já convertido e devolve o conteúdo, ou nulo quando
 * a resposta é legítima mas não traz nada ainda. É aí que se separa "o
 * servidor respondeu que não há" de "não conseguimos perguntar".
 */
export async function buscar<T>(url: string, extrair: (corpo: any) => T | null): Promise<Carregamento<T>> {
  try {
    const res = await fetch(url)
    if (!res.ok) return ERRO
    return chegou(extrair(await res.json()))
  } catch {
    return ERRO
  }
}
