"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { upsertProfile } from "@/lib/supabase/queries"
import LoginModal from "@/components/login-modal"
import UserMenu from "@/components/user-menu"

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
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(initialUser)
  const [showLogin, setShowLogin] = useState(false)
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

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success("Sessão encerrada.")
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const circularText = useMemo(() => {
    return "oráculo • síntese multi-oráculo • tarô • i ching • runas • búzios • lenormand • "
  }, [])

  return (
    <>
      <header className="relative z-50 flex items-center justify-between p-6">
        <div className="flex items-center">
          <button onClick={() => router.push("/")} className="relative" aria-label="Voltar ao início">
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
                    {circularText}
                  </textPath>
                </text>
              </motion.svg>
            </div>
          </button>
        </div>

        <nav className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => router.push("/oraculos")}
            className="text-white/80 hover:text-white text-sm font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            Oráculos
          </button>
          <button
            onClick={() => router.push("/assinatura")}
            className="text-white/80 hover:text-white text-sm font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            Assinatura
          </button>
          <button
            onClick={() => router.push("/faq")}
            className="text-white/80 hover:text-white text-sm font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            FAQ
          </button>
        </nav>

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
            className="px-6 py-2 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full font-light text-sm hover:bg-white/15 hover:scale-105 transition-all duration-200"
          >
            Login
          </button>
        )}
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
