import { NextResponse } from "next/server"
import { currentAdmin } from "@/lib/admin/auth"

export const runtime = "nodejs"

/** Só diz se o usuário atual é admin (para mostrar o link do menu). Sem dados. */
export async function GET() {
  const admin = await currentAdmin()
  return NextResponse.json({ admin: Boolean(admin) }, { headers: { "Cache-Control": "no-store" } })
}
