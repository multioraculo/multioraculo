"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/historico", label: "Histórico" },
  { href: "/admin/oraculos", label: "Oráculos" },
  { href: "/admin/sonhos", label: "Sonhos" },
  { href: "/admin/planos", label: "Planos" },
  { href: "/admin/financeiro", label: "Financeiro" },
  { href: "/admin/beta", label: "Beta testers" },
  { href: "/admin/usuarios", label: "Usuários" },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="mb-8 -mx-4 px-4 overflow-x-auto oracle-scroll" aria-label="Seções do admin">
      <ul className="flex gap-1 min-w-max">
        {TABS.map((t) => {
          const active = t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href)
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`block rounded-full px-4 py-2 text-sm transition-colors ${
                  active ? "bg-white/15 text-white border border-white/20" : "text-white/65 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {t.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
