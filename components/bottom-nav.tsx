"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import ExploreSheet from "@/components/explore-sheet"
import RecordsSheet, { RECORD_PATHS } from "@/components/records-sheet"
import { BookIcon, MoonIcon, MultioraculoIcon, RecordsIcon, SearchIcon } from "@/components/nav-icons"

/**
 * Navegação principal no celular, fixa no rodapé, iconográfica:
 * Sonhos | Grimório | Multioráculo | Registros | Explorar.
 * O Multioráculo é a entrada real do produto e fica no centro, com um pouco
 * mais de presença. "Registros" abre o painel pessoal (leituras salvas,
 * sonhos salvos, Grimório); "Explorar" abre o painel público com Oráculos e
 * FAQ. A assinatura vive no painel do avatar. Cada rota mantém as próprias
 * regras. No desktop (sm+) some: o cabeçalho leva os mesmos destinos.
 */
export default function BottomNav() {
  const { dict } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const [explore, setExplore] = useState(false)
  const [records, setRecords] = useState(false)
  const t = dict.nav

  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/leitura") : pathname.startsWith(href))
  const exploreActive = pathname.startsWith("/oraculos") || pathname.startsWith("/faq")
  const recordsActive = RECORD_PATHS.some((p) => pathname.startsWith(p))

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
        {item("/sonhos", t.dreamsShort, MoonIcon)}
        {item("/diario", t.grimoire, BookIcon)}
        {item("/", t.home, MultioraculoIcon, { center: true, onClick: goHome })}
        {sheetButton(t.records, RecordsIcon, recordsActive, records, () => setRecords(true))}
        {sheetButton(t.explore, SearchIcon, exploreActive, explore, () => setExplore(true))}
      </nav>
      <RecordsSheet open={records} onClose={() => setRecords(false)} />
      <ExploreSheet open={explore} onClose={() => setExplore(false)} />
    </>
  )
}
