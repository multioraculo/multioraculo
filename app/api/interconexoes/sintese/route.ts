import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"
import { corposEm, diaDeHoje, estadoDoCeu } from "@/lib/astro/ceu"
import { mapaNatal, type DadosNascimento } from "@/lib/astro/mapa"
import { interconexoesDoDia } from "@/lib/astro/interconexoes"
import { hashDoMapa, sinteseDoDia } from "@/lib/astro/interconexoes-server"
import { getUserEntitlement } from "@/lib/billing/entitlement"
import { isPaidPlan } from "@/lib/billing/plans"
import { recordAiUsage } from "@/lib/ai/usage"
import { getLocale } from "@/lib/i18n/server"

export const runtime = "nodejs"
export const maxDuration = 60

const MODELO = "gpt-4o"

/**
 * POST /api/interconexoes/sintese
 *
 * A leitura escrita do encontro entre o céu de hoje e o mapa de quem pede.
 *
 * É POST e não GET de propósito: esta rota PODE gastar uma chamada paga, e
 * método que gasta não deve ser disparado por prefetch, por bot nem por
 * recarregar a página. A geração só acontece quando alguém clica.
 *
 * A ORDEM DAS TRÊS PRIMEIRAS COISAS É A SEGURANÇA INTEIRA:
 *
 *   1. o usuário vem da SESSÃO, nunca do corpo do pedido. Aceitar user_id do
 *      cliente seria deixar qualquer um ler a síntese de qualquer outro;
 *   2. o plano é conferido ANTES de qualquer coisa custar. Quem não tem plano
 *      recebe 402 e nenhuma chamada à OpenAI acontece — não se gera para depois
 *      esconder atrás do paywall;
 *   3. só então o mapa é lido e a síntese é buscada ou gerada.
 *
 * O cálculo astrológico é o mesmo de /api/mapa, pelas mesmas funções: nada aqui
 * recalcula nada de outro jeito.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "nao_autenticado" }, { status: 401 })

  const entitlement = await getUserEntitlement(user.id)
  if (!isPaidPlan(entitlement.plan)) {
    // sai daqui sem ter tocado na OpenAI
    return NextResponse.json({ error: "plano_necessario", plan: entitlement.plan }, { status: 402 })
  }

  const { data: linha } = await supabase
    .from("birth_data")
    .select("born_on, born_at, tz, tz_status, lat, lon")
    .eq("user_id", user.id)
    .maybeSingle()
  if (!linha) return NextResponse.json({ error: "sem_mapa" }, { status: 404 })

  const locale = await getLocale()
  const dia = diaDeHoje()

  const dados: DadosNascimento = {
    born_on: linha.born_on as string,
    born_at: ((linha.born_at as string | null) ?? null)?.slice(0, 5) ?? null,
    lat: linha.lat as number,
    lon: linha.lon as number,
    place_label: "",
    tz: linha.tz as string,
  }
  const mapa = mapaNatal(dados)
  const ceu = estadoDoCeu(dia)
  // uma hora adiante, exatamente como /api/mapa faz: e o que diz se o angulo
  // fecha ou abre, e as duas rotas precisam concordar
  const { escolhidas } = interconexoesDoDia(mapa, ceu, corposEm(ceu.jdMeio + 1 / 24))

  const mapaHash = hashDoMapa({
    born_on: linha.born_on as string,
    born_at: (linha.born_at as string | null) ?? null,
    tz: linha.tz as string,
    lat: linha.lat as number,
    lon: linha.lon as number,
  })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: "indisponivel" }, { status: 503 })
  const openai = new OpenAI({ apiKey })

  try {
    const r = await sinteseDoDia({
      userId: user.id,
      dia,
      locale,
      mapa,
      mapaHash,
      escolhidas,
      gerar: async ({ system, user: prompt }) => {
        const resposta = await openai.chat.completions.create({
          model: MODELO,
          temperature: 0.7,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        })
        await recordAiUsage({
          operation: "interconexoes",
          model: resposta.model ?? MODELO,
          usage: resposta.usage,
          userId: user.id,
          seed: `${dia}:${locale}`,
        })
        return {
          conteudo: resposta.choices[0]?.message?.content ?? "{}",
          model: resposta.model ?? MODELO,
          usage: resposta.usage,
        }
      },
    })

    if (!r.sintese) return NextResponse.json({ error: "indisponivel" }, { status: 503 })

    // o diagnóstico é material de operação, e não sai no corpo em produção
    const expor = process.env.NODE_ENV !== "production" || process.env.INTERCONEXOES_DIAGNOSTICO === "1"
    return NextResponse.json({
      sintese: r.sintese,
      cache: r.cache,
      ...(expor && r.diagnostico ? { diagnostico: r.diagnostico } : {}),
    })
  } catch (erro) {
    console.error("[interconexoes/sintese]", erro)
    return NextResponse.json({ error: "falhou" }, { status: 500 })
  }
}
