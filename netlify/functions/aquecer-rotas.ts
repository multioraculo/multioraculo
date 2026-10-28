/**
 * Aquecimento das rotas dinâmicas, a cada cinco minutos.
 *
 * POR QUE EXISTE. Tudo que não é página estática roda numa função da Netlify:
 * uma só, o servidor do Next, que carrega o código de cada rota na primeira
 * vez em que ela é pedida. Depois de alguns minutos sem ninguém, a instância é
 * descartada, e a próxima pessoa paga o arranque frio. Medido em produção em
 * 28/10/2026: a Home levou 5,9 s no primeiro pedido e 1,1 s nos seguintes; a
 * tiragem do dia, 5,8 s e depois 0,8 s. Num site de visitas espaçadas, quase
 * toda visita era a primeira, e foi assim que um visitante novo viu a página
 * demorar e chegar sem as cartas.
 *
 * O QUE FAZ. A cada cinco minutos pede, em paralelo, as páginas dinâmicas por
 * onde uma visita começa e as duas rotas que a Home chama. Cada pedido segue o
 * caminho de um visitante anônimo (middleware incluído), e o corpo é lido até
 * o fim: é durante a renderização que o Next carrega o código da rota, não no
 * primeiro byte.
 *
 * O QUE NÃO FAZ. Não garante instância quente para todo mundo. A função
 * atende um pedido por vez, e duas pessoas chegando juntas ainda podem acordar
 * uma segunda instância fria. O que ela garante é que a primeira pessoa depois
 * de um intervalo vazio não paga o arranque, que é o caso medido. Também não
 * gera nada que a primeira visita não geraria: as duas rotas de API leem do
 * banco o que já está gravado e, logo depois da meia-noite, o primeiro pedido
 * do dia gera a tiragem e o céu (uma geração de cada, em português), que de
 * outro modo o primeiro visitante esperaria.
 *
 * CUSTO. Seis pedidos a cada cinco minutos são cerca de 1 700 invocações por
 * dia, 52 mil por mês, mais 8 600 da própria agenda. Cabe no plano gratuito
 * (125 mil), mas não é desprezível, e por isso há a chave abaixo.
 *
 * CHAVE. Ligada por padrão, porque o custo é só de invocação. Para desligar
 * sem deploy:
 *
 *   AQUECER_ROTAS = 0
 *
 * Apagar a variável religa. A agenda continua registrada nos dois casos.
 */

/** A cada cinco minutos. Mais espaçado que isso e a instância já pode ter sido descartada. */
export const config = { schedule: "*/5 * * * *" }

const DESLIGADA = process.env.AQUECER_ROTAS === "0"

/**
 * O que é aquecido. Páginas: as dinâmicas por onde uma visita começa (as
 * estáticas, como /oraculos e /faq, saem do CDN e não têm o que aquecer).
 * APIs: as duas que a Home chama quando o dia ainda não está no HTML.
 * scripts/verify-aquecer.ts confere que cada caminho existe e é dinâmico.
 */
export const ROTAS_AQUECIDAS = [
  "/",
  "/home",
  "/horoscopo",
  "/sonhos",
  "/api/tiragem-dia?locale=pt",
  "/api/ceu-dia?locale=pt",
] as const

/** Para separar estes pedidos dos de pessoas nos registros e nas métricas. */
const USER_AGENT = "Multioraculo-Aquecedor/1 (funcao agendada da Netlify)"

/**
 * Quanto esperamos antes de desistir de relatar. Cada pedido roda na sua
 * própria invocação do servidor e segue até o fim mesmo se pararmos de
 * esperar; o prazo é só para o resumo sair nos registros.
 */
const ORCAMENTO_MS = 50_000

function base(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL
  if (!url) return null
  return url.replace(/\/+$/, "")
}

type Resultado = { rota: string; estado: "ok" | "erro"; ms: number; detalhe?: string }

async function pedir(raiz: string, rota: string): Promise<Resultado> {
  const inicio = Date.now()
  try {
    const resposta = await fetch(`${raiz}${rota}`, {
      headers: { "user-agent": USER_AGENT, accept: rota.startsWith("/api/") ? "application/json" : "text/html" },
      cache: "no-store",
    })
    // lê até o fim: a renderização é que carrega o código da rota
    await resposta.arrayBuffer()
    const ms = Date.now() - inicio
    if (!resposta.ok) return { rota, estado: "erro", ms, detalhe: `HTTP ${resposta.status}` }
    return { rota, estado: "ok", ms }
  } catch (e) {
    return { rota, estado: "erro", ms: Date.now() - inicio, detalhe: (e as Error).message }
  }
}

export default async function aquecer(): Promise<Response> {
  if (DESLIGADA) {
    console.log("[aquecer-rotas] desligada (AQUECER_ROTAS = 0); as rotas acordam sob demanda")
    return new Response(JSON.stringify({ desligada: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }

  const raiz = base()
  if (!raiz) {
    const erro = "sem NEXT_PUBLIC_SITE_URL nem URL: não há para onde pedir"
    console.error(`[aquecer-rotas] ${erro}`)
    return new Response(JSON.stringify({ erro }), { status: 500, headers: { "content-type": "application/json" } })
  }

  const pedidos = ROTAS_AQUECIDAS.map((rota) => pedir(raiz, rota))
  const prazo = new Promise<"prazo">((r) => setTimeout(() => r("prazo"), ORCAMENTO_MS))
  const terminou = await Promise.race([Promise.allSettled(pedidos), prazo])

  if (terminou === "prazo") {
    const aviso = `passou de ${ORCAMENTO_MS / 1000}s esperando; o que faltar acorda sob demanda`
    console.warn(`[aquecer-rotas] ${aviso}`)
    return new Response(JSON.stringify({ parcial: true, aviso, rotas: ROTAS_AQUECIDAS.length }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }

  const resultados = terminou.map((r) => (r.status === "fulfilled" ? r.value : null)).filter((r): r is Resultado => r !== null)
  const erros = resultados.filter((r) => r.estado === "erro")
  // o tempo por rota é o diagnóstico: acima de alguns segundos, a instância estava fria
  console.log(`[aquecer-rotas] ${resultados.map((r) => `${r.rota} ${r.ms}ms${r.estado === "erro" ? " ERRO" : ""}`).join(" | ")}`)
  for (const r of erros) console.warn(`[aquecer-rotas] ${r.rota}: ${r.detalhe}`)

  return new Response(JSON.stringify({ rotas: resultados }), {
    status: erros.length === resultados.length ? 500 : 200,
    headers: { "content-type": "application/json" },
  })
}
