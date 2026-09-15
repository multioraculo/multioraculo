"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { upsertProfile } from "@/lib/supabase/queries"
import LoginModal from "@/components/login-modal"
import UserMenu from "@/components/user-menu"
import LocaleSwitcher from "@/components/locale-switcher"
import { SearchIcon } from "@/components/nav-icons"
import { RecordsLoginPrompt, recordLinks } from "@/components/records-sheet"
import { useI18n } from "@/components/i18n-provider"
import BrandLogo from "@/components/brand-logo"

type HeaderProps = {
  initialUser: User | null
}

export default function Header({ initialUser }: HeaderProps) {
  const router = useRouter()
  const { dict } = useI18n()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(initialUser)
  const [showLogin, setShowLogin] = useState(false)
  // Menus leves do desktop: "Registros" (pessoal) e "Explorar" (Oráculos e
  // FAQ). No celular os mesmos destinos vivem na barra inferior.
  const [openMenu, setOpenMenu] = useState<"records" | "explore" | null>(null)
  const menusRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!openMenu) return
    const close = (e: MouseEvent | TouchEvent) => {
      if (menusRef.current && !menusRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("touchstart", close)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("touchstart", close)
    }
  }, [openMenu])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (event === "SIGNED_IN" && session?.user) {
        await upsertProfile(supabase, {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name ?? null,
          avatar_url: session.user.user_metadata?.avatar_url ?? null,
        })
        router.refresh()
      }

      if (event === "SIGNED_OUT") {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  // Outras partes do site (página de assinatura, bloqueio por login) pedem o
  // modal de login por evento, sem duplicar o formulário.
  useEffect(() => {
    const open = () => setShowLogin(true)
    window.addEventListener("open-login", open)
    return () => window.removeEventListener("open-login", open)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success(dict.header.sessionEnded)
    setUser(null)
    router.push("/")
    router.refresh()
  }

  function handleLogoClick() {
    window.dispatchEvent(new CustomEvent("reset-hero"))
    router.push("/")
  }

  // Destinos principais (os mesmos da barra inferior no celular). O
  // Multioráculo é a entrada real do produto; não existe "Início" à parte.
  const navItems = [
    { href: "/", label: dict.nav.home, onClick: handleLogoClick },
    { href: "/sonhos", label: dict.nav.dreamsShort },
    { href: "/diario", label: dict.nav.grimoire },
  ]
  const exploreLinks = [
    { href: "/oraculos", label: dict.nav.oracles, hint: dict.nav.exploreOracles },
    { href: "/assinatura", label: dict.nav.plans, hint: dict.nav.explorePlans },
    { href: "/faq", label: dict.nav.faq, hint: dict.nav.exploreFaq },
  ]
  const menuButtonClass = "text-white/80 hover:text-white text-sm font-light transition-colors duration-200 flex items-center gap-1.5"
  const menuPanelClass = "absolute left-1/2 -translate-x-1/2 top-9 z-50 w-60 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-1.5 space-y-0.5"
  const menuLinks = (links: { href: string; label: string; hint: string }[]) =>
    links.map((it) => (
      <Link key={it.href} href={it.href} role="menuitem" onClick={() => setOpenMenu(null)} className="block rounded-lg px-3 py-2 hover:bg-white/8 transition-colors">
        <span className="block text-white/90 text-sm">{it.label}</span>
        <span className="block text-white/45 text-xs">{it.hint}</span>
      </Link>
    ))

  return (
    <>
      <header className="relative z-50 flex items-center gap-2 p-4 sm:p-6">
        <div className="flex items-center shrink-0">
          <button onClick={handleLogoClick} className="relative" aria-label={dict.header.backToStart}>
            <BrandLogo size={80} />
          </button>
        </div>

        {/* Celular: sem links de texto no topo; a navegação principal fica no rodapé (BottomNav). */}

        {/* Desktop: os mesmos destinos da barra inferior, centralizados */}
        <nav className="hidden sm:flex items-center gap-6 absolute left-1/2 -translate-x-1/2" aria-label={dict.nav.mainNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.onClick}
              className="text-white/80 hover:text-white text-sm font-light transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
          <div className="contents" ref={menusRef}>
            {/* Registros: área pessoal; sem login, convida a entrar */}
            <div className="relative">
              <button type="button" onClick={() => setOpenMenu((m) => (m === "records" ? null : "records"))} aria-haspopup="menu" aria-expanded={openMenu === "records"} className={menuButtonClass}>
                {dict.nav.records}
              </button>
              {openMenu === "records" && (
                <div role="menu" className={menuPanelClass}>
                  {user ? menuLinks(recordLinks(dict)) : <RecordsLoginPrompt compact onLogin={() => { setOpenMenu(null); setShowLogin(true) }} />}
                </div>
              )}
            </div>
            <div className="relative">
              <button type="button" onClick={() => setOpenMenu((m) => (m === "explore" ? null : "explore"))} aria-haspopup="menu" aria-expanded={openMenu === "explore"} className={menuButtonClass}>
                <SearchIcon className="w-4 h-4" />
                {dict.nav.explore}
              </button>
              {openMenu === "explore" && (
                <div role="menu" className={menuPanelClass}>
                  {menuLinks(exploreLinks)}
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="ml-auto shrink-0 flex items-center gap-2">
          <LocaleSwitcher />
          {user ? (
            <UserMenu
              user={{
                email: user.email ?? "",
                full_name: user.user_metadata?.full_name ?? null,
              }}
              onLogout={handleSignOut}
            />
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="h-10 px-4 sm:px-6 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full font-light text-sm hover:bg-white/15 hover:scale-105 transition-all duration-200"
            >
              {dict.common.login}
            </button>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false)
          router.refresh()
        }}
      />
    </>
  )
}
