/**
 * GET /api/cidades?q=sao+paulo → até oito cidades que respondem à busca
 *
 * A base inteira fica no servidor: o navegador nunca baixa 34 mil cidades
 * para achar uma. Devolve coordenadas porque é delas que o fuso é resolvido
 * na hora de salvar, e não do que a pessoa digitou.
 */
import { NextResponse } from "next/server"
import { buscarCidades, rotuloDaCidade } from "@/lib/astro/cidades"

export async function GET(request: Request) {
  const consulta = new URL(request.url).searchParams.get("q") ?? ""
  const cidades = buscarCidades(consulta).map((cidade) => ({
    nome: cidade.nome,
    regiao: cidade.regiao,
    pais: cidade.pais,
    lat: cidade.lat,
    lon: cidade.lon,
    rotulo: rotuloDaCidade(cidade),
  }))
  return NextResponse.json({ cidades })
}
