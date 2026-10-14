"use client"

import NextLink from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ComponentProps,
  type MouseEvent,
} from "react"
import { useI18n } from "@/components/i18n-provider"

/**
 * Feedback imediato de navegação.
 *
 * O PROBLEMA, medido em produção no celular: tocar num destino da barra
 * inferior levava 1,6 s até qualquer mudança na tela, e nos primeiros 600 ms
 * nada acontecia. As páginas são dinâmicas e não há `loading.tsx`, então o
 * Link do Next só troca a tela quando o servidor devolve a página inteira. A
 * pessoa achava que não tinha acertado o botão e tocava de novo.
 *
 * O QUE ISTO FAZ: a navegação passa por `router.push` dentro de um
 * `useTransition`, e enquanto a transição está pendente o destino tocado
 * recebe `aria-busy` e uma classe de estado. É o padrão do próprio Next para
 * versões anteriores ao `useLinkStatus` (15.3+); este projeto está no 15.2.
 *
 * O QUE ISTO NÃO FAZ: não encurta a espera pelo servidor. É só a resposta
 * visual que faltava, mais a proteção contra o segundo toque.
 *
 * Limpeza do estado, nesta ordem de garantia:
 *   1. a transição termina (página nova montada, navegação cancelada ou erro);
 *   2. o pathname muda por qualquer caminho (voltar/avançar, troca de idioma);
 *   3. um teto de tempo, para o indicador nunca ficar preso.
 */

type Opcoes = { replace?: boolean }

type NavPendingValue = {
  /** destino (já localizado) cuja navegação está em curso; null quando nada está pendente */
  pendingHref: string | null
  /** inicia a navegação com estado pendente; false quando o mesmo destino já estava em curso */
  navigate: (href: string, opcoes?: Opcoes) => boolean
}

const NavPendingContext = createContext<NavPendingValue | null>(null)

/** teto de segurança: acima do pior tempo medido para uma página fria */
const TETO_MS = 15000

export function NavPendingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  // espelho síncrono: dois toques no mesmo quadro não enxergariam o estado
  const pendingRef = useRef<string | null>(null)

  const limpar = useCallback(() => {
    pendingRef.current = null
    setPendingHref((atual) => (atual === null ? atual : null))
  }, [])

  useEffect(() => {
    if (!isPending) limpar()
  }, [isPending, limpar])

  useEffect(() => {
    limpar()
  }, [pathname, limpar])

  useEffect(() => {
    if (!pendingHref) return
    const t = setTimeout(limpar, TETO_MS)
    return () => clearTimeout(t)
  }, [pendingHref, limpar])

  const navigate = useCallback(
    (href: string, opcoes?: Opcoes) => {
      if (pendingRef.current === href) return false
      pendingRef.current = href
      setPendingHref(href)
      startTransition(() => {
        if (opcoes?.replace) router.replace(href)
        else router.push(href)
      })
      return true
    },
    [router],
  )

  const value = useMemo<NavPendingValue>(() => ({ pendingHref, navigate }), [pendingHref, navigate])

  return <NavPendingContext.Provider value={value}>{children}</NavPendingContext.Provider>
}

export function useNavPending(): NavPendingValue {
  const ctx = useContext(NavPendingContext)
  if (!ctx) throw new Error("useNavPending deve ser usado dentro de <NavPendingProvider>")
  return ctx
}

/** caminho interno do app: começa com uma barra só; sem esquema, sem âncora pura */
function ehInterno(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//")
}

/** clique primário sem modificador: só esse vira navegação no mesmo painel */
function cliqueSimples(e: MouseEvent<HTMLAnchorElement>): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

type NavLinkProps = ComponentProps<typeof NextLink> & {
  /** classe aplicada enquanto a navegação para este destino está pendente */
  pendingClassName?: string
}

/**
 * <Link> localizado (href="/oraculos" vira "/en/oracles" em inglês, como o
 * LocalizedLink) com estado pendente. Nova aba, clique do meio, modificadores,
 * `target`, `download`, destinos externos e cliques que o `onClick` do
 * chamador já cancelou passam intactos para o Link do Next; fora do provider,
 * é um Link comum.
 */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { href, onClick, className, pendingClassName = "nav-pending", target, replace, ...resto },
  ref,
) {
  const { path } = useI18n()
  const ctx = useContext(NavPendingContext)
  const destino = typeof href === "string" ? path(href) : href
  const intercepta = ctx !== null && typeof destino === "string" && ehInterno(destino)
  const pending = intercepta && ctx.pendingHref === destino

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || !intercepta) return
    if (!cliqueSimples(e) || (target && target !== "_self") || resto.download != null) return
    e.preventDefault()
    ctx.navigate(destino as string, { replace })
  }

  return (
    <NextLink
      ref={ref}
      href={destino}
      target={target}
      replace={replace}
      onClick={handleClick}
      aria-busy={pending || undefined}
      data-pending={pending ? "" : undefined}
      className={pending ? `${className ?? ""} ${pendingClassName}`.trim() : className}
      {...resto}
    />
  )
})
