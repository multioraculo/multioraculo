"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface UserMenuProps {
  user: { email: string; full_name: string | null }
  onLogout: () => void
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 transition-all duration-200 flex items-center justify-center"
      >
        <span className="text-sm font-medium">{user.email.charAt(0).toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-64 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 space-y-3">
            <div className="border-b border-white/10 pb-3">
              {user.full_name && (
                <p className="text-white text-sm font-medium">{user.full_name}</p>
              )}
              <p className="text-white/60 text-xs">{user.email}</p>
            </div>

            <button
              onClick={() => { setIsOpen(false); router.push("/leituras-salvas") }}
              className="w-full text-left py-2 px-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
            >
              Leituras Salvas
            </button>
            <button
              onClick={() => { setIsOpen(false); router.push("/assinatura") }}
              className="w-full text-left py-2 px-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
            >
              Ver planos
            </button>

            <div className="border-t border-white/10 pt-3">
              <button
                onClick={() => { setIsOpen(false); onLogout() }}
                className="w-full text-left py-2 px-3 text-white/60 hover:text-white/80 hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
