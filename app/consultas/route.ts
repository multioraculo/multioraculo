import { NextResponse } from "next/server"
import OpenAI from "openai"
import fs from "fs/promises"
import path from "path"
import https from "https"
import os from "os"
import { drawAll, newSeed, searchTermsOf, type OracleDraw, type OracleKey } from "@/lib/oracles/draw"
import { renderDraw, type RenderedDraw } from "@/lib/oracles/localize"
import {
  languageRule,
  ORACLE_FINAL_REMINDER,
  ORACLE_SYSTEM_MESSAGE,
  SAFETY_RESPONSE,
} from "@/lib/oracles/language"
import { getDictionary, resolveLocale, type Locale } from "@/lib/i18n"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { completeReading, consumeReading, failReading, httpStatusFor } from "@/lib/billing/usage"
import { VISITOR_COOKIE, isVisitorId, newVisitorId, serializeVisitorCookie } from "@/lib/billing/visitor"

export const runtime = "nodejs"
// Netlify impõe 60 s por função (não configurável). Esta rota faz o sorteio e
// a interpretação dos cinco oráculos; a síntese fica em /consultas/sintese.
export const maxDuration = 60

const INDEX_URL =
  process.env.PDFS_INDEX_URL ||
  "https://github.com/multioraculo/multioraculo/releases/download/v1-data/pdfs.index.json"

const LOCAL_INDEX = path.join(process.cwd(), "data", "pdfs_index", "pdfs.index.json")
const TMP_DIR = os.tmpdir()
const TMP_INDEX = path.join(TMP_DIR, "pdfs.index.json")

const ORACLE_SOURCES: Record<OracleKey, { files: string[]; method: string }> = {
  tarot: {
    files: ["jung_tarot.pdf"],
    method: "Cruz Celta (10 posições) com leitura arquetípica",
  },
  iching: {
    files: ["i_ching_original.pdf"],
    method: "Hexagrama principal + linhas mutantes + hexagrama resultante",
  },
  runas: {
    files: ["futhark_handbook.pdf"],
    method: "Tiragem 9 runas (mapa de forças) com aplicação prática",
  },
  buzios: {
    files: ["jogo_buzios.pdf", "odus_afro_brasileiros.pdf", "umbandadobrasil.pdf"],
    method: "Leitura por Odus (qualidade do tempo, risco, proteção, direção)",
  },
  lenormand: {
    files: ["lenormand_handbook.pdf"],
    method: "Mesa 9 cartas (quadro curto) + confirmadores objetivos",
  },
}

const ORACLE_KEYS: OracleKey[] = ["tarot", "iching", "runas", "buzios", "lenormand"]

type Evidence = { source: string; excerpt: string }

type OracleResult = {
  key: OracleKey
  title: string
  method: string
  /** seed da tiragem: permite reproduzir exatamente os mesmos símbolos */
  seed: string
  /** idioma em que a leitura foi escrita */
  locale: Locale
  draw: {
    items: Array<{ position?: string; name: string; meaning?: string }>
    notes?: string
    /** Búzios: quantidade de conchas abertas em cada queda (para a visualização) */
    shells?: { primary: number; confirmation: number }
  }
  reading: string
  evidence: Evidence[]
}

/** Dados extras de desenho por oráculo, aditivos ao payload (hoje só Búzios). */
function drawExtras(k: OracleKey, draws: ReturnType<typeof drawAll>) {
  if (k !== "buzios") return {}
  return { shells: { primary: draws.buzios.meta.first, confirmation: draws.buzios.meta.second } }
}

const stop = new Set([
  "a","o","os","as","de","do","da","dos","das","e","é","em","no","na","nos","nas",
  "por","para","pra","com","sem","um","uma","uns","umas","que","isso","isto","aqui",
  "agora","hoje","já","não","sim","se","eu","você","vc","me","minha","meu","teu",
  "tua","seu","sua","dela","dele","eles","elas","ao","à","às","é","ser","estar",
  "como","qual","quais","quando","onde","porquê","pq",
  // en
  "the","and","for","with","what","this","that","have","from","are","you","your","about",
  // es
  "que","por","para","con","una","uno","los","las","del","qué","cómo","mis","sus",
])

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

function keywords(q: string) {
  const tokens = normalize(q)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.length >= 3)
    .filter((t) => !stop.has(t))
  return Array.from(new Set(tokens)).slice(0, 18)
}

async function download(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fetchUrl = (targetUrl: string) => {
      https
        .get(targetUrl, (res) => {
          // Segue redirects 301/302
          if (res.statusCode === 301 || res.statusCode === 302) {
            const redirectUrl = res.headers.location
            if (!redirectUrl) {
              reject(new Error(`Redirect sem location header de ${targetUrl}`))
              return
            }
            fetchUrl(redirectUrl)
            return
          }

          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} from ${targetUrl}`))
            return
          }

          const chunks: Buffer[] = []
          res.on("data", (chunk) => chunks.push(chunk))
          res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
        })
        .on("error", reject)
    }
    fetchUrl(url)
  })
}

async function readFromAnywhere(
  localPath: string,
  tmpPath: string,
  url: string,
  label: string
): Promise<string> {
  try {
    return await fs.readFile(localPath, "utf8")
  } catch {}

  try {
    return await fs.readFile(tmpPath, "utf8")
  } catch {}

  console.log(`[consultas] downloading ${label} from ${url}`)
  const content = await download(url)
  await fs.writeFile(tmpPath, content, "utf8").catch(() => {})
  return content
}

let indexPromise: Promise<Map<string, string[]>> | null = null

function getIndex(): Promise<Map<string, string[]>> {
  if (!indexPromise) {
    indexPromise = readFromAnywhere(
      LOCAL_INDEX,
      TMP_INDEX,
      INDEX_URL,
      "pdfs.index.json"
    ).then((raw) => {
      const data = JSON.parse(raw) as {
        index: Array<{ file: string; chunks: string[] }>
      }
      const map = new Map<string, string[]>()
      for (const entry of data.index) {
        map.set(entry.file, entry.chunks)
      }
      return map
    })
  }
  return indexPromise
}

/**
 * Busca trechos de referência para os SÍMBOLOS SORTEADOS.
 *
 * A pontuação é dominada pelos nomes dos símbolos (peso 3). As palavras da
 * pergunta entram só como desempate (peso 1), para que os trechos ajudem a
 * aplicar o símbolo à situação sem jamais influenciar qual símbolo saiu —
 * o sorteio já aconteceu antes desta função ser chamada.
 */
async function getEvidenceForOracle(
  draw: OracleDraw,
  question: string,
  files: string[]
): Promise<Evidence[]> {
  const index = await getIndex()
  const symbolTerms = searchTermsOf(draw)
  const questionKeys = keywords(question)
  const scored: Array<Evidence & { score: number }> = []

  for (const f of files) {
    const chunks = index.get(f) ?? []
    for (const ch of chunks) {
      const c = normalize(ch)
      let score = 0
      for (const t of symbolTerms) if (c.includes(t)) score += 3
      if (score === 0) continue
      for (const k of questionKeys) if (c.includes(k)) score += 1
      score += Math.min(2, Math.floor(ch.length / 600))
      scored.push({ source: f, excerpt: ch, score })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 6).map(({ source, excerpt }) => ({
    source,
    excerpt: excerpt.slice(0, 800),
  }))

  if (top.length === 0) {
    const fallback: Evidence[] = []
    for (const f of files) {
      const chunks = index.get(f) ?? []
      for (const ch of chunks.slice(0, 2)) {
        fallback.push({ source: f, excerpt: ch.slice(0, 800) })
      }
    }
    return fallback
  }

  return top
}

/**
 * Mantém apenas citações do modelo que existem de fato nos trechos
 * fornecidos. Se nenhuma sobreviver, devolve os próprios trechos.
 */
function validateEvidence(candidate: unknown, provided: Evidence[]): Evidence[] {
  if (!Array.isArray(candidate)) return provided
  const haystack = provided.map((e) => ({ source: e.source, text: normalize(e.excerpt) }))
  const kept: Evidence[] = []
  for (const e of candidate.slice(0, 8)) {
    const excerpt = String(e?.excerpt || "").trim()
    const source = String(e?.source || "")
    const needle = normalize(excerpt)
    if (needle.length < 15) continue
    const hit = haystack.find((h) => h.text.includes(needle))
    if (!hit) continue
    kept.push({ source: hit.source === source ? source : hit.source, excerpt })
  }
  return kept.length > 0 ? kept : provided.slice(0, 6).map((e) => ({ ...e, excerpt: e.excerpt.slice(0, 300) }))
}

const SYSTEM_GUIDES: Record<OracleKey, string> = {
  tarot: `TARÔ — Cruz Celta (10 posições).
meanings[i]: significado tradicional da carta i na posição i (invertida quando indicado), aplicado à pergunta — 1-2 frases técnicas, sem floreio.
notes: padrão geral em uma frase (ex.: predominância de um naipe e o que isso indica), coerente com as cartas listadas.
reading: leitura carta a carta — para cada uma, o que ela diz sobre a pergunta naquela posição, fiel ao simbolismo do Tarô de Marselha.`,

  iching: `I CHING — Hexagrama principal + linhas mutantes + hexagrama resultante.
meanings[0] (hexagrama principal): "Trigrama inferior: [nome] ([atributo]). Trigrama superior: [nome] ([atributo]). Julgamento: [texto clássico resumido]".
meanings das linhas mutantes: o texto clássico dessa linha, breve, e o que a mutação modifica.
meanings do hexagrama resultante (se houver): Julgamento resumido.
notes: "Hex. [número]: [nome]" (mais o resultante, se houver).
reading: interprete o hexagrama aplicado à pergunta — o que os trigramas revelam sobre a dinâmica da situação, o que as linhas mutantes alteram na trajetória, e (se houver) o que a transformação para o hexagrama resultante indica. Fiel ao texto clássico. Se não houver linhas mutantes, diga isso e leia apenas o Julgamento e a Imagem.`,

  runas: `RUNAS — Mapa de 9 forças futhárquicas.
meanings[i]: domínio tradicional da runa i + como se aplica à pergunta nessa posição (invertida quando indicado) — 1-2 frases.
notes: síntese do mapa em uma frase.
reading: leia o mapa runa a runa — nome, símbolo, domínio clássico no Futhark Antigo, e como responde à pergunta naquela posição. Fiel à tradição rúnica nórdica.`,

  buzios: `BÚZIOS — Odu principal + segunda queda.
meanings[0] (Odu principal): "Orixá(s) regente(s): [nome(s) dos Orixás que regem esse Odu na tradição — o Orixá NÃO é o nome do Odu]. [Qualidade energética fundamental do odu em 1-2 frases, baseado na tradição e nas referências]".
meanings[1] (segunda queda): como esse odu confirma, tempera ou contradiz o principal.
notes: nome do odu principal com número de búzios.
reading: descrição técnica — nome completo do odu e variantes conhecidas, orixá regente, o que esse odu indica sobre o campo energético da pergunta, qualidade do tempo (expansão, cautela, ruptura, transformação), proteções e riscos tradicionais associados, orientação prática que o odu indica. Fiel à tradição Nagô-Iorubá e às referências fornecidas.`,

  lenormand: `LENORMAND — Mesa de 9 cartas (quadrado 3×3).
meanings[i]: significado tradicional da carta i na posição i aplicado à pergunta — 1 frase.
notes: carta central + principal combinação identificada entre as cartas listadas.
reading: leitura sistemática — carta central como tema dominante, cruz horizontal (linha do tempo) e vertical (forças acima/abaixo), combinações entre adjacentes quando significativas, e os confirmadores objetivos: eventos concretos e verificáveis que podem se manifestar em 24-72h.`,
}

function oraclePrompt(
  key: OracleKey,
  label: string,
  method: string,
  question: string,
  rendered: RenderedDraw,
  evidence: Evidence[],
  locale: Locale
) {
  const ev = evidence
    .map((e, i) => `Fonte ${i + 1} (${e.source}): ${e.excerpt}`)
    .join("\n\n")

  const numbered = rendered.items
    .map((it, i) => `${i + 1}. ${it.position}: ${it.name}`)
    .join("\n")

  return `
Você é um especialista em leitura simbólica de ${label}. A tiragem JÁ FOI REALIZADA por sorteio aleatório, em código, antes desta mensagem. Seu trabalho é INTERPRETAR exatamente os símbolos abaixo para a pergunta do usuário.

Regras importantes:
1) NÃO altere, substitua, acrescente ou omita nenhum símbolo. Não invente posições. Interprete o que saiu, na ordem em que saiu.
2) Siga o método: ${method}.
3) Seja específico e útil, evitando generalidades.
4) Use os trechos de referência abaixo como base de linguagem e coerência com a tradição. Seja fiel ao sentido, mas reescreva com sua voz. Os trechos podem estar em outro idioma; a resposta não.
5) Retorne JSON válido no formato indicado, sem texto fora do JSON.
6) Inclua "evidence" com 3 a 6 itens, citando LITERALMENTE pequenos trechos (curtos, copiados palavra por palavra, no idioma original do trecho) dos trechos de referência, cada um com source e excerpt. Não invente citações nem páginas. Use apenas o nome do arquivo como source.
7) FIDELIDADE À TIRAGEM: Seja fiel ao resultado real dos símbolos. Não suavize indicações negativas, não force otimismo, não neutralize tensão, sombra, ruptura ou dificuldade revelada pelo campo simbólico. Se a tradição aponta conflito, perigo, contradição ou verdade dolorosa, expresse isso com clareza e responsabilidade. Conforto fácil é uma traição à tiragem.

${languageRule(locale)}

Pergunta do usuário:
"${question}"

TIRAGEM REALIZADA (${label}):
${rendered.description}

Itens a interpretar, nesta ordem exata (o array "meanings" deve ter exatamente ${rendered.items.length} elementos, um por item):
${numbered}

Trechos de referência:
${ev}

FORMATO JSON (obrigatório):
{
  "meanings": [string, ...],   // exatamente ${rendered.items.length} strings, na ordem dos itens acima
  "notes": string,
  "reading": string,
  "evidence": [{"source": string, "excerpt": string}]
}

Instruções específicas do sistema:
${SYSTEM_GUIDES[key]}

${ORACLE_FINAL_REMINDER[locale]}
`.trim()
}

const SAFETY_CLASSIFIER_PROMPT = `
Você é um detector de risco de segurança. Avalie a mensagem do usuário (em qualquer idioma) e decida se ela contém sinais claros de risco real e imediato de suicídio, automutilação grave, ou crise aguda de saúde mental com perigo de vida.

REGRA CRÍTICA: Responda SAFE para qualquer pergunta difícil, sombria, triste, existencial, de luto, de dor, de vazio, de dúvida ou de angústia que NÃO envolva risco real de vida. Essas perguntas merecem uma leitura honesta do oráculo, não uma interrupção.

Responda RISK apenas se houver sinais explícitos ou claramente implícitos de:
- Intenção ou plano de se matar
- Pedido de métodos de suicídio ou automutilação grave
- Despedida combinada com intenção declarada de não continuar vivo
- Crise com sinais claros de risco de vida imediato

Exemplos de SAFE (não interromper):
- Luto, perda, solidão, tristeza profunda
- Fim de relacionamentos, ciclos, sentido de vida
- Vazio existencial, esgotamento, exaustão
- Linguagem simbólica ou metafórica sobre "morrer" sem intenção real
- Qualquer pergunta emocional ou dolorosa sem risco de vida

Exemplos de RISK (interromper, resposta de segurança):
- "quero me matar", "vou me machucar", "como posso acabar com tudo"
- Descrição de método combinada com intenção
- Despedida explícita com intenção de não continuar

Responda APENAS com uma palavra: SAFE ou RISK
`.trim()

async function classifyForSafety(openai: OpenAI, question: string): Promise<boolean> {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 5,
      messages: [
        { role: "system", content: SAFETY_CLASSIFIER_PROMPT },
        { role: "user", content: question },
      ],
    })
    const verdict = (result.choices?.[0]?.message?.content || "SAFE").trim().toUpperCase()
    return verdict === "RISK"
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const question = String(body?.question || "").trim()
  const locale = resolveLocale(body?.locale)
  const labels = getDictionary(locale).oracles

  if (!question) {
    return NextResponse.json({ error: "Pergunta ausente." }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY não configurada no .env.local" },
      { status: 500 }
    )
  }

  // ------------------------------------------------------------------------
  // ENTITLEMENT (server-side). Quem é o usuário, qual plano tem e se ainda
  // cabe uma tiragem no período. O seed é gerado aqui porque ele é a chave
  // da unidade de consumo: uma consulta completa = uma linha em reading_usage.
  // Chamadas diretas à API passam pela mesma verificação que a interface.
  // ------------------------------------------------------------------------
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Cookie de visitante: normalmente já vem do middleware; na primeiríssima
  // requisição pode faltar, então geramos aqui e devolvemos no Set-Cookie.
  const cookieStore = await cookies()
  const existingVisitor = cookieStore.get(VISITOR_COOKIE)?.value
  const visitorId = isVisitorId(existingVisitor) ? existingVisitor : newVisitorId()
  const setVisitorCookie = visitorId !== existingVisitor

  const seed = newSeed()
  const consume = await consumeReading({ userId: user?.id ?? null, visitorId, seed, locale })
  if (!consume.allowed) {
    const status = httpStatusFor(consume.code)
    return NextResponse.json(
      {
        error: consume.code === "trial_used" ? "Tiragem gratuita já utilizada. Entre para continuar." : "Limite de tiragens do período atingido.",
        code: consume.code,
        plan: consume.entitlement.plan,
        used: consume.used,
        limit: consume.limit,
        periodEnd: consume.entitlement.periodEnd,
      },
      { status, headers: setVisitorCookie ? { "Set-Cookie": serializeVisitorCookie(visitorId) } : undefined }
    )
  }

  const openai = new OpenAI({ apiKey })
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"))

      try {
        // Primeiro byte imediato: mantém a conexão de streaming aberta
        // enquanto o classificador e os oráculos trabalham.
        send({ type: "start", locale })

        const isHighRisk = await classifyForSafety(openai, question)
        if (isHighRisk) {
          // resposta de segurança não é uma tiragem: não conta na cota
          await failReading(seed)
          send({
            type: "complete",
            question,
            seed: "",
            locale,
            synthesis: SAFETY_RESPONSE[locale],
            oracles: null,
            isSafetyOverride: true,
          })
          controller.close()
          return
        }

        // ------------------------------------------------------------------
        // 1) SORTEIO. Acontece aqui, em código, para os cinco oráculos ao
        //    mesmo tempo, com um seed criptográfico. A pergunta e o idioma
        //    não participam; o idioma só muda como os símbolos são nomeados.
        // ------------------------------------------------------------------
        const draws = drawAll(seed)
        const rendered = Object.fromEntries(
          ORACLE_KEYS.map((k) => [k, renderDraw(draws[k], locale)])
        ) as Record<OracleKey, RenderedDraw>

        // Os símbolos sorteados vão ao cliente já, antes de qualquer
        // interpretação: o usuário vê a tiragem enquanto o modelo trabalha.
        send({
          type: "draw",
          seed,
          locale,
          draws: Object.fromEntries(
            ORACLE_KEYS.map((k) => [
              k,
              { title: labels[k], notes: rendered[k].notes, items: rendered[k].items, ...drawExtras(k, draws) },
            ])
          ),
        })

        // ------------------------------------------------------------------
        // 2) INTERPRETAÇÃO. Cada oráculo vai ao modelo separadamente, com os
        //    símbolos já fixados e trechos de referência buscados por eles.
        // ------------------------------------------------------------------
        const oracleEntries = await Promise.all(
          ORACLE_KEYS.map(async (k) => {
            const meta = ORACLE_SOURCES[k]
            const draw = draws[k]
            const r = rendered[k]
            const evidence = await getEvidenceForOracle(draw, question, meta.files)
            const prompt = oraclePrompt(k, labels[k], meta.method, question, r, evidence, locale)

            let parsed: any = null
            let rawText = ""
            try {
              const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                temperature: 0.6,
                max_tokens: 1600,
                response_format: { type: "json_object" },
                messages: [
                  {
                    role: "system",
                    content: ORACLE_SYSTEM_MESSAGE[locale],
                  },
                  { role: "user", content: prompt },
                ],
              })
              rawText = completion.choices?.[0]?.message?.content || ""
              parsed = JSON.parse(rawText)
            } catch (err) {
              console.error(`[consultas] ${k}: falha na interpretação`, err)
              parsed = null
            }

            // draw.items vem SEMPRE do sorteio; o modelo só contribui o "meaning"
            const meanings: unknown[] = Array.isArray(parsed?.meanings) ? parsed.meanings : []
            const items = r.items.map((it, i) => {
              const m = meanings[i]
              return {
                position: it.position,
                name: it.name,
                meaning: typeof m === "string" && m.trim() ? m.trim() : undefined,
              }
            })

            const modelNotes = typeof parsed?.notes === "string" ? parsed.notes.trim() : ""
            const notes = modelNotes ? `${r.notes} — ${modelNotes}` : r.notes

            const reading =
              typeof parsed?.reading === "string" && parsed.reading.trim()
                ? parsed.reading.trim()
                : rawText || ""

            const result: OracleResult = {
              key: k,
              title: labels[k],
              method: meta.method,
              seed,
              locale,
              draw: { items, notes, ...drawExtras(k, draws) },
              reading,
              evidence: validateEvidence(parsed?.evidence, evidence),
            }

            return [k, result] as const
          })
        )

        const results = Object.fromEntries(oracleEntries) as Record<OracleKey, OracleResult>

        // Tiragem completa: agora conta na cota e libera a síntese para este seed.
        await completeReading(seed)

        send({ type: "oracles", question, seed, locale, oracles: results })

        // A síntese é pedida pelo cliente em seguida, via POST /consultas/sintese.
        send({ type: "done" })
        controller.close()
      } catch (err: any) {
        // falha do servidor não consome a cota do usuário
        await failReading(seed).catch(() => {})
        try {
          send({ type: "error", message: String(err?.message || err) })
        } catch {}
        controller.close()
      }
    },
  })

  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
  }
  if (setVisitorCookie) headers["Set-Cookie"] = serializeVisitorCookie(visitorId)

  return new Response(stream, { headers })
}
