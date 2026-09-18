/**
 * Pré-geração das doze leituras do dia, todo dia às 00:05 em São Paulo.
 *
 * O horóscopo sempre foi gerado sob demanda: a primeira pessoa daquele signo
 * no dia esperava a chamada ao modelo, e todas as outras liam do banco. Isso
 * mantém o custo colado no uso, e continua sendo o caminho normal. O que ele
 * não resolve é quem chega primeiro: às sete da manhã, alguém espera vinte
 * segundos por uma página que para todo mundo depois abre na hora.
 *
 * Esta função tira essa espera do caminho da pessoa. Ela não substitui nada:
 * se falhar inteira, o dia funciona exatamente como antes.
 *
 * POR QUE POR HTTP, e não chamando o módulo daqui. O teto de 60 s vale para
 * toda função do Netlify, e doze gerações em sequência não cabem. Cada pedido
 * a /api/horoscopo é uma invocação separada, com os seus próprios 60 s, e os
 * doze correm ao mesmo tempo. O tempo total passa a ser o da geração mais
 * lenta, não a soma delas.
 *
 * NÃO DUPLICA. A rota lê o cache antes de gerar, então signo que já tem linha
 * gravada volta sem custar chamada ao modelo. A resposta diz qual foi o caso,
 * e o resumo separa os dois.
 *
 * UM SIGNO NÃO DERRUBA OS OUTROS. Cada pedido é aguardado com allSettled e
 * tem o seu próprio try: erro de rede, 500 ou leitura reprovada entram no
 * resumo e param ali.
 *
 * O HORÁRIO. O cron do Netlify só entende UTC, então 00:05 em São Paulo vira
 * 03:05 UTC. O dia gerado não vem do relógio do cron: vem de diaDeHoje() na
 * rota, que usa o fuso do produto. Se o Brasil voltar a ter horário de verão,
 * o disparo cai em 01:05 local e continua sendo o dia certo.
 */

/** 00:05 em America/Sao_Paulo, escrito em UTC porque é o que o cron aceita. */
export const config = { schedule: "5 3 * * *" }

/**
 * Os idiomas que valem a pré-geração. O céu é o mesmo para todos, mas o texto
 * é um por idioma, e cada um é uma chamada paga: doze signos em três idiomas
 * seriam trinta e seis gerações por dia para atender também quem talvez não
 * apareça. Começa só em português, que é onde estão as pessoas hoje, e se
 * amplia por variável de ambiente, sem deploy:
 *
 *   HOROSCOPO_PREGERAR_LOCALES = pt,en
 *
 * Quem não estiver na lista continua sendo gerado sob demanda, como sempre foi.
 */
const LOCALES_VALIDOS = ["pt", "en", "es"] as const
const LOCALE_PADRAO = "pt"

/** Nome do cookie que a rota lê para saber o idioma. Ver lib/i18n/config.ts. */
const COOKIE_IDIOMA = "locale"

const SIGNOS = 12

/**
 * Quanto esperamos antes de desistir de relatar. Não é um limite para as
 * gerações: cada uma roda na sua própria invocação e segue até o fim mesmo se
 * pararmos de esperar. É só para o resumo sair nos registros em vez de a
 * função ser cortada no meio sem dizer nada.
 */
const ORCAMENTO_MS = 50_000

function idiomas(): string[] {
  const bruto = process.env.HOROSCOPO_PREGERAR_LOCALES
  if (!bruto) return [LOCALE_PADRAO]
  const lista = bruto
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => (LOCALES_VALIDOS as readonly string[]).includes(s))
  return lista.length > 0 ? lista : [LOCALE_PADRAO]
}

function base(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL
  if (!url) return null
  return url.replace(/\/+$/, "")
}

type Resultado = { signo: number; locale: string; estado: "cache" | "gerado" | "sem-leitura" | "erro"; detalhe?: string }

async function pedir(raiz: string, signo: number, locale: string): Promise<Resultado> {
  try {
    const resposta = await fetch(`${raiz}/api/horoscopo?signo=${signo}`, {
      headers: { cookie: `${COOKIE_IDIOMA}=${locale}` },
    })
    if (!resposta.ok) {
      return { signo, locale, estado: "erro", detalhe: `HTTP ${resposta.status}` }
    }
    const corpo = (await resposta.json()) as { leitura: unknown; cache?: boolean; violacoes?: string[] }
    if (!corpo.leitura) {
      return { signo, locale, estado: "sem-leitura", detalhe: corpo.violacoes?.join("; ") || "sem motivo declarado" }
    }
    return { signo, locale, estado: corpo.cache ? "cache" : "gerado" }
  } catch (e) {
    return { signo, locale, estado: "erro", detalhe: (e as Error).message }
  }
}

export default async function pregerar(): Promise<Response> {
  const raiz = base()
  if (!raiz) {
    const erro = "sem NEXT_PUBLIC_SITE_URL nem URL: não há para onde pedir"
    console.error(`[pregerar-horoscopo] ${erro}`)
    return new Response(JSON.stringify({ erro }), { status: 500, headers: { "content-type": "application/json" } })
  }

  const locales = idiomas()
  const pedidos: Array<Promise<Resultado>> = []
  for (const locale of locales) {
    for (let signo = 0; signo < SIGNOS; signo++) pedidos.push(pedir(raiz, signo, locale))
  }

  console.log(`[pregerar-horoscopo] ${pedidos.length} pedido(s): ${SIGNOS} signos x ${locales.join(", ")}`)

  const prazo = new Promise<"prazo">((r) => setTimeout(() => r("prazo"), ORCAMENTO_MS))
  const terminou = await Promise.race([Promise.allSettled(pedidos), prazo])

  if (terminou === "prazo") {
    // as gerações continuam nas suas próprias invocações; só paramos de esperar
    const aviso = `passou de ${ORCAMENTO_MS / 1000}s esperando; o que faltar sai sob demanda ou amanhã`
    console.warn(`[pregerar-horoscopo] ${aviso}`)
    return new Response(JSON.stringify({ parcial: true, aviso, pedidos: pedidos.length }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }

  const resultados = terminou.map((r) => (r.status === "fulfilled" ? r.value : null)).filter((r): r is Resultado => r !== null)
  const conta = (estado: Resultado["estado"]) => resultados.filter((r) => r.estado === estado).length
  const resumo = {
    gerados: conta("gerado"),
    jaEstavam: conta("cache"),
    semLeitura: conta("sem-leitura"),
    erros: conta("erro"),
  }

  console.log(
    `[pregerar-horoscopo] ${resumo.gerados} gerado(s), ${resumo.jaEstavam} já em cache, ` +
      `${resumo.semLeitura} sem leitura, ${resumo.erros} erro(s)`,
  )
  for (const r of resultados) {
    if (r.estado === "erro" || r.estado === "sem-leitura") {
      console.warn(`[pregerar-horoscopo] signo ${r.signo} (${r.locale}) ${r.estado}: ${r.detalhe}`)
    }
  }

  return new Response(JSON.stringify({ ...resumo, locales }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
