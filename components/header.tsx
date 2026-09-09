"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { upsertProfile } from "@/lib/supabase/queries"
import LoginModal from "@/components/login-modal"
import UserMenu from "@/components/user-menu"
import LocaleSwitcher from "@/components/locale-switcher"
import { RecordsIcon, SearchIcon } from "@/components/nav-icons"
import { RecordsLoginPrompt, recordLinks } from "@/components/records-sheet"
import { useI18n } from "@/components/i18n-provider"

const PulsingBorder = dynamic(
  async () => {
    const mod = await import("@paper-design/shaders-react")
    return mod.PulsingBorder
  },
  { ssr: false }
)

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
  const pathId = useId()

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
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="relative w-[60px] h-[60px]">
                <PulsingBorder
                  className="absolute inset-0"
                  colors={["#BEECFF", "#E77EDC", "#FF4C3E", "#00FF88", "#FFD700", "#FF6B35", "#8A2BE2"]}
                  colorBack="#00000000"
                  speed={1.5}
                  roundness={1}
                  thickness={0.1}
                  softness={0.2}
                  intensity={5}
                  spotSize={0.1}
                  pulse={0.1}
                  smoke={0.5}
                  smokeSize={4}
                  scale={0.65}
                  rotation={0}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                  <div className="text-[10px] leading-none text-white/85 tracking-wide">MULTI</div>
                  <div className="text-[12px] leading-none text-white font-semibold tracking-wide">ORÁCULO</div>
                </div>
              </div>

              <motion.svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 22,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{ transform: "scale(1.6)" }}
              >
                <defs>
                  <path
                    id={`circle-${pathId}`}
                    d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                  />
                </defs>
                <text className="text-[8px] fill-white/75 instrument">
                  <textPath href={`#circle-${pathId}`} startOffset="0%">
                    {dict.header.circularText}
                  </textPath>
                </text>
              </motion.svg>
            </div>
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
                <RecordsIcon className="w-4 h-4" />
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
