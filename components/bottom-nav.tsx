"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import ExploreSheet from "@/components/explore-sheet"
import { MoonIcon, MultioraculoIcon, SearchIcon, SolIcon, StarIcon } from "@/components/nav-icons"

/**
 * Navegação principal no celular, fixa no rodapé, iconográfica:
 * Home | Sonhos | Multioráculo | Horóscopo | Explorar.
 *
 * A Home é o Sol, e o Multioráculo fica no centro geométrico da barra, com
 * um pouco mais de presença, porque é a entrada real do produto. Com cinco
 * itens o centro é a terceira posição, e é lá que ele está. "Explorar" abre o painel
 * público com Oráculos, planos e FAQ.
 *
 * Registros não está aqui: ele é conteúdo pessoal, e conteúdo pessoal mora no
 * painel do avatar, junto com a conta. Tirá-lo daqui também devolveu espaço
 * aos cinco que sobraram, que no celular estreito já estavam truncando.
 *
 * No desktop (sm+) esta barra some: o cabeçalho leva os mesmos destinos.
 */
export default function BottomNav() {
  const { dict } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const [explore, setExplore] = useState(false)
  const t = dict.nav

  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/leitura") : pathname.startsWith(href))
  const exploreActive = pathname.startsWith("/oraculos") || pathname.startsWith("/faq")

  const goHome = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent("reset-hero"))
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push("/")
    }
  }

  const item = (href: string, label: string, Icon: typeof MoonIcon, opts?: { center?: boolean; onClick?: (e: React.MouseEvent) => void }) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        onClick={opts?.onClick}
        aria-current={active ? "page" : undefined}
        className={`bnav-item ${active ? "is-active" : ""} ${opts?.center ? "is-center" : ""}`}
      >
        <span className="bnav-icon">
          <Icon className={opts?.center ? "w-7 h-7" : "w-[22px] h-[22px]"} />
        </span>
        <span className="bnav-label">{label}</span>
      </Link>
    )
  }

  const sheetButton = (label: string, Icon: typeof MoonIcon, active: boolean, open: boolean, onOpen: () => void) => (
    <button type="button" onClick={onOpen} aria-haspopup="dialog" aria-expanded={open} className={`bnav-item ${active ? "is-active" : ""}`}>
      <span className="bnav-icon">
        <Icon className="w-[22px] h-[22px]" />
      </span>
      <span className="bnav-label">{label}</span>
    </button>
  )

  return (
    <>
      <nav className="bnav sm:hidden" aria-label={t.mainNav}>
        {item("/home", t.home, SolIcon)}
        {item("/sonhos", t.dreamsShort, MoonIcon)}
        {item("/", t.consult, MultioraculoIcon, { center: true, onClick: goHome })}
        {item("/horoscopo", t.horoscope, StarIcon)}
        {sheetButton(t.explore, SearchIcon, exploreActive, explore, () => setExplore(true))}
      </nav>
      <ExploreSheet open={explore} onClose={() => setExplore(false)} />
    </>
  )
}
