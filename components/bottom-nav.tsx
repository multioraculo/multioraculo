"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import ExploreSheet from "@/components/explore-sheet"
import { BookIcon, MoonIcon, MultioraculoIcon, SealIcon, SearchIcon } from "@/components/nav-icons"

/**
 * Navegação principal no celular, fixa no rodapé, iconográfica:
 * Sonhos | Grimório | Multioráculo | Assinatura | Explorar.
 * O Multioráculo é a entrada real do produto e fica no centro, com um pouco
 * mais de presença. "Explorar" abre um painel com Oráculos e FAQ. Existe
 * para quem não fez login também; cada rota mantém as próprias regras.
 * No desktop (sm+) some: o cabeçalho leva os mesmos destinos.
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

  return (
    <>
      <nav className="bnav sm:hidden" aria-label={t.mainNav}>
        {item("/sonhos", t.dreamsShort, MoonIcon)}
        {item("/diario", t.grimoire, BookIcon)}
        {item("/", t.home, MultioraculoIcon, { center: true, onClick: goHome })}
        {item("/assinatura", t.subscription, SealIcon)}
        <button
          type="button"
          onClick={() => setExplore(true)}
          aria-haspopup="dialog"
          aria-expanded={explore}
          className={`bnav-item ${exploreActive ? "is-active" : ""}`}
        >
          <span className="bnav-icon">
            <SearchIcon className="w-[22px] h-[22px]" />
          </span>
          <span className="bnav-label">{t.explore}</span>
        </button>
      </nav>
      <ExploreSheet open={explore} onClose={() => setExplore(false)} />
    </>
  )
}
