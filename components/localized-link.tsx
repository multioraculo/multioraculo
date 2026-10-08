"use client"

import Link from "next/link"
import { forwardRef, type ComponentProps } from "react"
import { useI18n } from "@/components/i18n-provider"

/**
 * <Link> que leva para a versão da página no idioma de quem está lendo:
 * href="/oraculos" vira "/en/oracles" em inglês. Só mexe nas 7 páginas
 * públicas (lib/i18n/rotas.ts); qualquer outro destino, com ou sem query,
 * passa intacto. Mesmas props e mesmo comportamento do Link do Next.
 */
const LocalizedLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(function LocalizedLink(
  { href, ...resto },
  ref,
) {
  const { path } = useI18n()
  return <Link ref={ref} href={typeof href === "string" ? path(href) : href} {...resto} />
})

export default LocalizedLink
