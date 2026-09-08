import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import AdminNav from "@/components/admin/nav"
import { currentAdmin } from "@/lib/admin/auth"

export const dynamic = "force-dynamic"

/**
 * Área administrativa. A verificação do papel acontece AQUI, no servidor,
 * para toda rota /admin/*: quem não é admin é redirecionado antes de
 * qualquer dado ser lido. Os endpoints /api/admin/* verificam de novo.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await currentAdmin()
  if (!admin) redirect("/")

  return (
    <ShaderBackground>
      <Header initialUser={admin} />
      <div className="relative z-10 min-h-screen pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-light text-white">Administração</h1>
            <p className="text-white/50 text-sm mt-1">Uso, planos, custos e receita do Multioráculo. Só números agregados: nenhum conteúdo pessoal aparece aqui.</p>
          </div>
          <AdminNav />
          {children}
        </div>
      </div>
    </ShaderBackground>
  )
}
