"use client"

/**
 * As perguntas sugeridas: uma lista só, uma cadência só.
 *
 * Elas já existiam como placeholder do campo de consulta, trocando a cada oito
 * segundos. A Home passou a mostrar as mesmas, e por isso a rotação saiu de
 * dentro do hero e virou este gancho. A lista continua sendo
 * `dict.hero.placeholders`: quem quiser sugerir uma pergunta em qualquer lugar
 * do produto usa esta, e não outra.
 *
 * A diferença entre os dois lugares é só de estado. No campo, a sugestão é uma
 * dica e para de girar quando alguém escreve ou toca no campo. Na Home ela é
 * clicável, e ao ser escolhida deixa de ser sugestão: atravessa a navegação e
 * chega em "/" como o texto real do campo, editável, com o cursor no fim. A
 * consulta em si continua sendo a mesma, com o mesmo login, a mesma cota e o
 * mesmo paywall.
 *
 * A escolhida viaja pelo sessionStorage e é lida uma vez só: recarregar a
 * página de consulta não traz de volta uma pergunta que a pessoa já apagou, e
 * nenhum texto de ninguém aparece na barra de endereço.
 */
import { useEffect, useState } from "react"
import { useI18n } from "@/components/i18n-provider"

/** de quanto em quanto tempo a sugestão troca, no campo e na Home */
export const INTERVALO_SUGESTAO_MS = 8000

const CHAVE_ESCOLHIDA = "multioraculo:pergunta"

/**
 * A sugestão da vez. `pausada` congela a rotação: no campo de consulta ela
 * para quando há foco ou texto, porque ali a sugestão é só um exemplo.
 */
export function usePerguntaSugerida(pausada: boolean): { pergunta: string; indice: number } {
  const { dict } = useI18n()
  const perguntas = dict.hero.placeholders
  // o contador cresce sem limite e o resto é tirado na leitura: trocar de
  // idioma no meio não precisa reiniciar a rotação
  const [contador, setContador] = useState(0)

  useEffect(() => {
    if (pausada) return
    const id = setInterval(() => setContador((n) => n + 1), INTERVALO_SUGESTAO_MS)
    return () => clearInterval(id)
  }, [pausada])

  const indice = perguntas.length > 0 ? contador % perguntas.length : 0
  return { pergunta: perguntas[indice] ?? "", indice }
}

/** A pergunta escolhida na Home, guardada para o campo de consulta encontrar. */
export function guardarPerguntaEscolhida(pergunta: string): void {
  try {
    sessionStorage.setItem(CHAVE_ESCOLHIDA, pergunta)
  } catch {
    // navegação privada ou armazenamento bloqueado: a consulta abre vazia
  }
}

/** Lê e apaga a pergunta escolhida. Devolve null quando não há nenhuma. */
export function consumirPerguntaEscolhida(): string | null {
  try {
    const pergunta = sessionStorage.getItem(CHAVE_ESCOLHIDA)
    if (pergunta) sessionStorage.removeItem(CHAVE_ESCOLHIDA)
    return pergunta && pergunta.trim() ? pergunta : null
  } catch {
    return null
  }
}
