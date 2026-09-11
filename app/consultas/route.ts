import { NextResponse } from "next/server"
import OpenAI from "openai"
import fs from "fs/promises"
import path from "path"
import https from "https"
import os from "os"
import { drawAll, newSeed, normalizeText, RUNES, type OracleDraw, type OracleKey } from "@/lib/oracles/draw"
import { keywords, selectEvidence, type Chunk, type Evidence } from "@/lib/oracles/evidence"
import { renderDraw, type RenderedDraw } from "@/lib/oracles/localize"
import { tarotCardRef, type TarotCardRef } from "@/lib/oracles/tarot-assets"
import { lenormandId } from "@/lib/oracles/lenormand-assets"
import {
  languageRule,
  ORACLE_FINAL_REMINDER,
  ORACLE_SYSTEM_MESSAGE,
  SAFETY_RESPONSE,
  SYNTHESIS_SYSTEM_MESSAGE,
} from "@/lib/oracles/language"
import { getDictionary, resolveLocale, type Locale } from "@/lib/i18n"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { completeReading, consumeReading, failReading, httpStatusFor } from "@/lib/billing/usage"
import { failPreview, findPendingPreview, reservePreview, storePreviewResult, teaserCut, teaserOf } from "@/lib/billing/preview"
import { purgeExpiredTechnicalResults, storeReadingResult } from "@/lib/billing/results"
import { logEvent } from "@/lib/billing/events"
import { recordAiUsage, type TokenUsage } from "@/lib/ai/usage"
import { createSynthesisFilter, normalizeSynthesisText, synthesisPrompt } from "@/lib/oracles/synthesis"
import { PENDING_READING_COOKIE, serializePendingReadingCookie } from "@/lib/billing/visitor"
import { VISITOR_COOKIE, isVisitorId, newVisitorId, serializeVisitorCookie } from "@/lib/billing/visitor"

export const runtime = "nodejs"
// Netlify impõe 60 s por função (não configurável). Esta rota faz o sorteio e
// a interpretação dos cinco oráculos; a síntese fica em /consultas/sintese.
export const maxDuration = 60

// ---------------------------------------------------------------------------
// Orçamento de tempo. O limite duro do Netlify é 60 s: trabalhamos dentro de
// 50 s para sempre conseguir fechar o stream com uma mensagem em vez de a
// função ser morta no meio. Cada chamada tem teto próprio e nenhuma reserva
// automática de tentativas do SDK.
// ---------------------------------------------------------------------------
const TOTAL_BUDGET_MS = 50_000
const SAFETY_TIMEOUT_MS = 6_000
const ORACLE_TIMEOUT_MS = 25_000
/** só vale tentar de novo se ainda sobrar isto do orçamento total */
const ORACLE_RETRY_MIN_REMAINING_MS = 20_000
const INDEX_TIMEOUT_MS = 10_000
const HEARTBEAT_MS = 8_000

/** Erro com código estável; o texto mostrado à pessoa vem do dicionário do cliente. */
class ConsultaError extends Error {
  constructor(public code: ConsultaErrorCode, message?: string) {
    super(message ?? code)
  }
}
type ConsultaErrorCode = "oracle_failed" | "references_unavailable" | "timeout" | "storage_failed" | "internal"

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
    method: "Mesa 9 cartas (quadro curto) + leitura por posição e combinação",
  },
}

const ORACLE_KEYS: OracleKey[] = ["tarot", "iching", "runas", "buzios", "lenormand"]

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
    /** Runas: nome, glifo e orientação de cada runa, na ordem das posições (para a visualização) */
    runes?: Array<{ name: string; glyph: string; reversed: boolean }>
    /** Tarô: id estável, arcano, naipe/valor e orientação de cada carta, na ordem das posições (para a visualização) */
    cards?: TarotCardRef[]
    /** Lenormand: id estável e número de cada carta, na ordem das 9 posições (para a visualização) */
    lenormandCards?: Array<{ id: string; number: number }>
    /** I Ching: linhas de baixo para cima (1 = yang), mutantes, principal e resultante (para a visualização) */
    hexagram?: { bits: number[]; moving: number[]; primary: number; resulting: number | null; lowerTrigram: number; upperTrigram: number }
  }
  reading: string
  evidence: Evidence[]
}

/** Dados extras de desenho por oráculo, aditivos ao payload (Búzios e Runas). */
function drawExtras(k: OracleKey, draws: ReturnType<typeof drawAll>) {
  if (k === "buzios") {
    return { shells: { primary: draws.buzios.meta.first, confirmation: draws.buzios.meta.second } }
  }
  if (k === "tarot") {
    return {
      cards: draws.tarot.items.map((it) => {
        const s = it.sym as { kind: "tarot"; card: number; reversed: boolean }
        return tarotCardRef(s.card, s.reversed)
      }),
    }
  }
  if (k === "lenormand") {
    return {
      lenormandCards: draws.lenormand.items.map((it) => {
        const s = it.sym as { kind: "lenormand"; card: number }
        return { id: lenormandId(s.card), number: s.card + 1 }
      }),
    }
  }
  if (k === "iching") {
    const m = draws.iching.meta
    return { hexagram: { bits: m.bits, moving: m.moving, primary: m.primary, resulting: m.resulting, lowerTrigram: m.lowerTrigram, upperTrigram: m.upperTrigram } }
  }
  if (k === "runas") {
    // nome, glifo e orientação de cada runa, na ordem das posições, direto do sorteio
    return {
      runes: draws.runas.items.map((it) => {
        const sym = it.sym as { kind: "rune"; index: number; reversed: boolean }
        const r = RUNES[sym.index]
        return { name: r.name, glyph: r.glyph, reversed: sym.reversed }
      }),
    }
  }
  return {}
}

async function download(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fetchUrl = (targetUrl: string) => {
      const req = https
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
      // rede parada não pode segurar a função até o limite do Netlify
      req.setTimeout(INDEX_TIMEOUT_MS, () => req.destroy(new Error(`timeout ao baixar ${targetUrl}`)))
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

/**
 * Índice de trechos das referências, carregado uma vez por instância.
 *
 * Se a carga falhar, o cache é ESQUECIDO: sem isso uma única falha de rede
 * deixava a promessa rejeitada em memória e derrubava todas as consultas
 * seguintes daquela instância até ela ser reciclada.
 */
function getIndex(): Promise<Map<string, string[]>> {
  if (!indexPromise) {
    indexPromise = readFromAnywhere(LOCAL_INDEX, TMP_INDEX, INDEX_URL, "pdfs.index.json")
      .then((raw) => {
        const data = JSON.parse(raw) as {
          index: Array<{ file: string; chunks: string[] }>
        }
        const map = new Map<string, string[]>()
        for (const entry of data.index) {
          map.set(entry.file, entry.chunks)
        }
        return map
      })
      .catch((err) => {
        indexPromise = null // permite nova tentativa na próxima consulta
        throw err
      })
  }
  return indexPromise
}

/** Trechos normalizados por arquivo, reaproveitados entre consultas da instância. */
const normalizedCache = new Map<string, Array<{ raw: string; norm: string }>>()

async function chunksOf(file: string): Promise<Array<{ raw: string; norm: string }>> {
  const cached = normalizedCache.get(file)
  if (cached) return cached
  const index = await getIndex()
  const built = (index.get(file) ?? []).map((raw) => ({ raw, norm: normalizeText(raw) }))
  normalizedCache.set(file, built)
  return built
}

/**
 * Trechos de referência deste oráculo, escolhidos POR ITEM SORTEADO. A regra
 * de seleção vive em lib/oracles/evidence.ts (módulo puro, coberto por
 * testes); aqui só montamos o conjunto de trechos vindos do índice.
 */
async function getEvidenceForOracle(
  draw: OracleDraw,
  rendered: RenderedDraw,
  question: string,
  files: string[]
): Promise<Evidence[]> {
  const pool: Chunk[] = []
  for (const f of files) {
    const chunks = await chunksOf(f)
    chunks.forEach((c, i) => pool.push({ source: f, id: `${f}#${i}`, raw: c.raw, norm: c.norm }))
  }
  return selectEvidence(
    draw.items,
    rendered.items.map((it) => it.name),
    keywords(question),
    pool
  )
}

/**
 * Mantém apenas citações do modelo que existem de fato nos trechos
 * fornecidos. Se nenhuma sobreviver, devolve os próprios trechos.
 */
function validateEvidence(candidate: unknown, provided: Evidence[]): Evidence[] {
  if (!Array.isArray(candidate)) return provided
  const haystack = provided.map((e) => ({ source: e.source, text: normalizeText(e.excerpt) }))
  const kept: Evidence[] = []
  for (const e of candidate.slice(0, 8)) {
    const excerpt = String(e?.excerpt || "").trim()
    const source = String(e?.source || "")
    const needle = normalizeText(excerpt)
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
reading: leitura sistemática — carta central como tema dominante, cruz horizontal (linha do tempo) e vertical (forças acima/abaixo), combinações entre adjacentes quando significativas, e o que a mesa indica de concreto na situação. Não faça previsão de eventos nem dê prazos.`,
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
  const hasEvidence = evidence.length > 0
  const ev = hasEvidence
    ? evidence
        .map((e, i) => `Fonte ${i + 1}${e.about ? ` — sobre "${e.about}"` : ""} (${e.source}): ${e.excerpt}`)
        .join("\n\n")
    : "(Nenhum trecho específico sobre estes símbolos foi encontrado nas referências.)"

  const evidenceRule = hasEvidence
    ? `6) Inclua "evidence" com 3 a 6 itens, citando LITERALMENTE pequenos trechos (curtos, copiados palavra por palavra, no idioma original do trecho) dos trechos de referência acima, cada um com source e excerpt. Não invente citações nem páginas. Use apenas o nome do arquivo como source. Cada trecho indica a que símbolo se refere: não use um trecho de um símbolo para justificar outro.`
    : `6) Não há trechos de referência para esta tiragem. Interprete pela tradição clássica do sistema e devolva "evidence": []. Não invente citações, fontes nem páginas.`

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
${evidenceRule}
7) FIDELIDADE À TIRAGEM: Seja fiel ao resultado real dos símbolos. Não suavize indicações negativas, não force otimismo, não neutralize tensão, sombra, ruptura ou dificuldade revelada pelo campo simbólico. Se a tradição aponta conflito, perigo, contradição ou verdade dolorosa, expresse isso com clareza e responsabilidade. Conforto fácil é uma traição à tiragem.
8) PROPORÇÃO: a intensidade do texto acompanha a intensidade real do símbolo naquela posição, para cima e para baixo. Não suavize o que é difícil, mas também não dramatize além do que o símbolo e a tradição sustentam: não transforme atrito em catástrofe, hesitação em ruptura, nem lentidão em urgência. Um símbolo ameno é lido como ameno; um símbolo grave, como grave.
9) CONCRETUDE: Prefira descrever concretamente a dinâmica indicada pelos símbolos a resumir a leitura em abstrações genéricas. Quando houver mudança, diga o que perde força, o que ganha espaço, o que se reorganiza ou o que permanece. Termos abstratos só devem aparecer quando acrescentarem significado real sustentado pelo símbolo ou pela referência. Esta regra é de linguagem, nunca de conteúdo: não altera o significado tradicional de nenhum símbolo, não suaviza símbolo difícil, não escurece símbolo favorável e não remove conceito da tradição. Se a tradição ou a referência usa um termo próprio, use-o. Fidelidade ao símbolo vem antes da preferência de linguagem.
10) DESCREVER, NÃO PRESCREVER: a interpretação descreve o que os símbolos, suas posições e as referências indicam, e nunca converte essa indicação em instrução de comportamento para o consulente. Onde a tradição aponta cautela, nomeie o que está em jogo naquele símbolo: risco, hesitação, contenção, instabilidade, uma decisão em aberto, o que for. Regra de forma, não de conteúdo: advertência, perigo, conflito, perda, resistência e necessidade simbólica de decidir continuam aparecendo com a mesma força, apenas ditos como o que há na situação, e não como ordem a quem pergunta.
11) A PERGUNTA CONTEXTUALIZA E NÃO PROVA: ela informa a área da vida e o objeto da consulta, e é por isso que você a lê. Mas nada que ela dê por certo vira fato sem sustentação independente dos símbolos sorteados: perguntar não estabelece que aquilo ocorreu, ocorre ou vai ocorrer. Verifique o que os símbolos sustentam sozinhos. Se não sustentam o pressuposto, não o confirme por associação; se sustentam algo próximo mas diferente, descreva concretamente o que aparece em vez de reaproveitar a palavra da pergunta.

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

async function classifyForSafety(openai: OpenAI, question: string, meta?: { seed: string; userId: string | null }): Promise<boolean> {
  try {
    const result = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 5,
        messages: [
          { role: "system", content: SAFETY_CLASSIFIER_PROMPT },
          { role: "user", content: question },
        ],
      },
      { timeout: SAFETY_TIMEOUT_MS, maxRetries: 0 }
    )
    await recordAiUsage({ operation: "safety", model: result.model || "gpt-4o-mini", usage: result.usage, seed: meta?.seed, userId: meta?.userId })
    const verdict = (result.choices?.[0]?.message?.content || "SAFE").trim().toUpperCase()
    return verdict === "RISK"
  } catch {
    return false
  }
}

/** Resposta do modelo aceitável: JSON com leitura e a lista de significados. */
function isUsable(parsed: any): boolean {
  return Boolean(parsed) && typeof parsed.reading === "string" && parsed.reading.trim().length > 0 && Array.isArray(parsed.meanings)
}

/**
 * Interpreta os cinco oráculos para um sorteio já feito. Usado tanto no fluxo
 * normal (resultado vai ao navegador) quanto no preview (resultado fica só no
 * servidor). A lógica é exatamente a mesma.
 *
 * Regra dura: ou os CINCO terminam, ou a consulta é incompleta. Um oráculo
 * que falha (timeout, JSON inválido, resposta vazia) é tentado uma segunda
 * vez se ainda houver orçamento; se falhar de novo, a consulta inteira é
 * abortada com `oracle_failed` e a cota não é consumida. Nunca entregamos
 * uma leitura com quatro oráculos.
 */
async function interpretAll(
  openai: OpenAI,
  question: string,
  seed: string,
  draws: ReturnType<typeof drawAll>,
  rendered: Record<OracleKey, RenderedDraw>,
  locale: Locale,
  labels: Record<OracleKey, string>,
  deadline: number,
  userId: string | null = null
): Promise<Record<OracleKey, OracleResult>> {
  const remaining = () => deadline - Date.now()

  const oracleEntries = await Promise.all(
    ORACLE_KEYS.map(async (k) => {
      const meta = ORACLE_SOURCES[k]
      const draw = draws[k]
      const r = rendered[k]

      let evidence: Evidence[]
      try {
        evidence = await getEvidenceForOracle(draw, r, question, meta.files)
      } catch (err) {
        console.error("[consultas] índice de referências indisponível", err)
        throw new ConsultaError("references_unavailable")
      }

      const prompt = oraclePrompt(k, labels[k], meta.method, question, r, evidence, locale)

      const attempt = async (): Promise<any> => {
        const timeout = Math.min(ORACLE_TIMEOUT_MS, Math.max(4_000, remaining()))
        const completion = await openai.chat.completions.create(
          {
            model: "gpt-4o-mini",
            temperature: 0.6,
            max_tokens: 1600,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: ORACLE_SYSTEM_MESSAGE[locale] },
              { role: "user", content: prompt },
            ],
          },
          { timeout, maxRetries: 0 }
        )
        await recordAiUsage({ operation: "oracle", model: completion.model || "gpt-4o-mini", usage: completion.usage, seed, userId })
        return JSON.parse(completion.choices?.[0]?.message?.content || "")
      }

      let parsed: any = null
      try {
        parsed = await attempt()
      } catch (err) {
        console.error(`[consultas] ${k}: falha na interpretação`, err)
      }

      if (!isUsable(parsed) && remaining() > ORACLE_RETRY_MIN_REMAINING_MS) {
        try {
          parsed = await attempt()
        } catch (err) {
          console.error(`[consultas] ${k}: falha na segunda tentativa`, err)
        }
      }

      if (!isUsable(parsed)) {
        throw new ConsultaError(remaining() <= 0 ? "timeout" : "oracle_failed", `oráculo ${k} não concluiu`)
      }

      // draw.items vem SEMPRE do sorteio; o modelo só contribui o "meaning"
      const meanings: unknown[] = parsed.meanings
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

      const result: OracleResult = {
        key: k,
        title: labels[k],
        method: meta.method,
        seed,
        locale,
        draw: { items, notes, ...drawExtras(k, draws) },
        reading: parsed.reading.trim(),
        evidence: validateEvidence(parsed?.evidence, evidence),
      }

      return [k, result] as const
    })
  )
  return Object.fromEntries(oracleEntries) as Record<OracleKey, OracleResult>
}

/**
 * Síntese em streaming no modo preview: os tokens vão ao navegador só até o
 * ponto de corte do teaser; a partir daí o servidor continua consumindo o
 * stream da OpenAI sem repassar nada, acumula e devolve o texto completo
 * para ser guardado. Emite "preview_locked" no corte.
 */
async function synthesizeStreamingPreview(
  openai: OpenAI,
  question: string,
  results: Record<OracleKey, OracleResult>,
  locale: Locale,
  seed: string,
  send: (obj: object) => void,
  deadline: number,
  userId: string | null = null
): Promise<{ synthesis: string; teaser: string }> {
  const stream = await openai.chat.completions.create(
    {
      model: "gpt-4o",
      temperature: 0.85,
      max_tokens: 900,
      presence_penalty: 0.3,
      stream: true,
      stream_options: { include_usage: true },
      messages: [
        { role: "system", content: SYNTHESIS_SYSTEM_MESSAGE[locale] },
        { role: "user", content: synthesisPrompt(question, results, locale, seed) },
      ],
    },
    { timeout: Math.max(8_000, deadline - Date.now()), maxRetries: 0 }
  )

  let acc = ""
  let sent = 0 // quantos caracteres já foram ao navegador
  let locked = false
  let teaser = ""

  const lockAt = (cut: number) => {
    // repassa o que falta até o corte e tranca; nada além disso sai do servidor
    if (cut > sent) send({ type: "delta", text: acc.slice(sent, cut) })
    sent = cut
    locked = true
    teaser = acc.slice(0, cut).trim()
    send({ type: "preview_locked", seed, teaser })
  }

  let usage: TokenUsage = null
  let model = "gpt-4o"
  // o marcador de parágrafo vira quebra antes de qualquer coisa: o teaser e o
  // texto guardado já saem prontos, e nada do andaime chega ao navegador
  const filter = createSynthesisFilter()
  for await (const chunk of stream) {
    if (chunk.usage) usage = chunk.usage
    if (chunk.model) model = chunk.model
    const raw = chunk.choices[0]?.delta?.content || ""
    if (!raw) continue
    const delta = filter.push(raw)
    if (!delta) continue
    acc += delta
    if (locked) continue // consome sem repassar

    const cut = teaserCut(acc)
    if (cut !== null) {
      lockAt(cut)
    } else if (acc.length < TEASER_SAFE_STREAM) {
      // abaixo do mínimo do teaser é seguro escrever ao vivo
      send({ type: "delta", text: acc.slice(sent) })
      sent = acc.length
    }
    // entre o mínimo e o corte: segura no servidor até decidir o corte
  }

  acc += filter.flush()
  await recordAiUsage({ operation: "synthesis", model, usage, seed, userId })
  const synthesis = normalizeSynthesisText(acc)
  if (!synthesis) throw new ConsultaError("internal", "síntese vazia")
  if (!locked) {
    // síntese curta: o teaser é o que a regra final decidir (talvez tudo)
    const cut = teaserCut(synthesis)
    lockAt(cut === null ? synthesis.length : cut)
  }
  return { synthesis, teaser: teaserOf(synthesis) }
}

/** Abaixo disto o texto ainda vai ao navegador em tempo real (< TEASER_MIN). */
const TEASER_SAFE_STREAM = 80

/** Código estável de erro para o cliente; nada da OpenAI chega ao navegador. */
function codeOf(err: unknown): ConsultaErrorCode {
  if (err instanceof ConsultaError) return err.code
  return "internal"
}

export async function POST(req: Request) {
  const deadline = Date.now() + TOTAL_BUDGET_MS
  const body = await req.json().catch(() => ({}))
  const question = String(body?.question || "").trim()
  const locale = resolveLocale(body?.locale)
  const labels = getDictionary(locale).oracles

  if (!question) {
    return NextResponse.json({ code: "no_question" }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ code: "internal" }, { status: 500 })
  }

  // ------------------------------------------------------------------------
  // ENTITLEMENT (server-side). Quem é o usuário, qual plano tem e se ainda
  // cabe uma tiragem no período. O seed é gerado aqui porque ele é a chave
  // da unidade de consumo: uma consulta completa = uma linha em reading_usage.
  // Chamadas diretas à API passam pela mesma verificação que a interface.
  // ------------------------------------------------------------------------
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  // Cookie de visitante: normalmente já vem do middleware; na primeiríssima
  // requisição pode faltar, então geramos aqui e devolvemos no Set-Cookie.
  const cookieStore = await cookies()
  const existingVisitor = cookieStore.get(VISITOR_COOKIE)?.value
  const visitorId = isVisitorId(existingVisitor) ? existingVisitor : newVisitorId()
  const setVisitorCookie = visitorId !== existingVisitor

  const baseHeaders: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
  }
  const cookieHeaders: string[] = []
  if (setVisitorCookie) cookieHeaders.push(serializeVisitorCookie(visitorId))

  const seed = newSeed()
  const consume = await consumeReading({ userId, visitorId, seed, locale })

  // limpeza das leituras guardadas só por necessidade técnica, fora da janela
  // de recuperação; roda em paralelo e nunca atrasa a consulta
  void purgeExpiredTechnicalResults().catch(() => {})

  // ------------------------------------------------------------------------
  // PREVIEW PAYWALL. Sem plano pago e sem cota: a tiragem acontece mesmo
  // assim, inteira, mas fica só no servidor; o navegador recebe o início real
  // da síntese. Assinantes que esgotaram o plano continuam recebendo o aviso.
  // ------------------------------------------------------------------------
  const previewMode =
    !consume.allowed &&
    consume.entitlement.plan === "free" &&
    (consume.code === "limit_reached" || consume.code === "trial_used")

  if (!consume.allowed && !previewMode) {
    const status = httpStatusFor(consume.code)
    return NextResponse.json(
      {
        error: "Limite de tiragens do período atingido.",
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

  if (previewMode) {
    // Já existe uma leitura esperando por esta pessoa? Reabre, sem sortear
    // nem chamar a OpenAI de novo.
    const pending = await findPendingPreview(userId, visitorId)
    if (pending) {
      await logEvent("preview_reopened", { userId, visitorId, seed: pending.seed })
      cookieHeaders.push(serializePendingReadingCookie(pending.seed))
      const lines =
        JSON.stringify({ type: "start", locale, preview: true }) + "\n" +
        JSON.stringify({ type: "delta", text: pending.teaser }) + "\n" +
        JSON.stringify({ type: "preview_locked", seed: pending.seed, teaser: pending.teaser, pending: true }) + "\n" +
        JSON.stringify({ type: "preview_ready", seed: pending.seed }) + "\n"
      return new Response(lines, { headers: withCookies(baseHeaders, cookieHeaders) })
    }

    const reserved = await reservePreview({ userId, visitorId, seed, locale })
    if (reserved === "exists") {
      // corrida: outra requisição acabou de reservar; devolve a pendente dela
      const again = await findPendingPreview(userId, visitorId)
      if (again) {
        const lines =
          JSON.stringify({ type: "start", locale, preview: true }) + "\n" +
          JSON.stringify({ type: "delta", text: again.teaser }) + "\n" +
          JSON.stringify({ type: "preview_locked", seed: again.seed, teaser: again.teaser, pending: true }) + "\n" +
          JSON.stringify({ type: "preview_ready", seed: again.seed }) + "\n"
        return new Response(lines, { headers: withCookies(baseHeaders, cookieHeaders) })
      }
    }
    if (reserved !== "reserved") {
      return NextResponse.json({ code: "billing_unavailable" }, { status: 503 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        let closed = false
        const send = (obj: object) => {
          if (closed) return
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"))
        }
        const beat = setInterval(() => send({ type: "ping" }), HEARTBEAT_MS)
        try {
          send({ type: "start", locale, preview: true })

          const isHighRisk = await classifyForSafety(openai, question, { seed, userId })
          if (isHighRisk) {
            await failPreview(seed)
            send({ type: "complete", question, seed: "", locale, synthesis: SAFETY_RESPONSE[locale], oracles: null, isSafetyOverride: true })
            return
          }

          // Sorteio + cinco oráculos + síntese, tudo no servidor. Nada dos
          // símbolos ou interpretações vai ao navegador neste modo.
          const draws = drawAll(seed)
          const rendered = Object.fromEntries(ORACLE_KEYS.map((k) => [k, renderDraw(draws[k], locale)])) as Record<OracleKey, RenderedDraw>
          send({ type: "stage", stage: "oracles" })
          const results = await interpretAll(openai, question, seed, draws, rendered, locale, labels, deadline, userId)
          send({ type: "stage", stage: "synthesis" })
          // A síntese começa a ser escrita ao vivo; no corte do teaser o
          // navegador recebe "preview_locked" e o resto fica só aqui.
          const { synthesis } = await synthesizeStreamingPreview(openai, question, results, locale, seed, send, deadline, userId)

          const stored = await storePreviewResult({ seed, userId, visitorId, question, locale, oracles: results, synthesis })
          if (!stored) throw new ConsultaError("storage_failed")

          await logEvent("preview_created", { userId, visitorId, seed })
          // leitura completa salva: só o aviso, sem conteúdo
          send({ type: "preview_ready", seed })
        } catch (err: any) {
          // falha técnica: libera a vaga, não há paywall falso
          console.error("[consultas] preview", seed, err)
          await failPreview(seed).catch(() => {})
          send({ type: "error", code: codeOf(err) })
        } finally {
          clearInterval(beat)
          closed = true
          controller.close()
        }
      },
    })

    cookieHeaders.push(serializePendingReadingCookie(seed))
    return new Response(stream, { headers: withCookies(baseHeaders, cookieHeaders) })
  }

  // ------------------------------------------------------------------------
  // FLUXO NORMAL (com cota): sorteio, oráculos ao navegador, síntese em
  // streaming pela rota /consultas/sintese.
  // ------------------------------------------------------------------------
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false
      const send = (obj: object) => {
        if (closed) return
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"))
      }
      // sinal de vida enquanto o modelo trabalha: sem isso, 20 a 40 s de
      // silêncio derrubam a conexão em redes móveis e proxies
      const beat = setInterval(() => send({ type: "ping" }), HEARTBEAT_MS)

      try {
        // Primeiro byte imediato: mantém a conexão de streaming aberta
        // enquanto o classificador e os oráculos trabalham.
        send({ type: "start", locale })

        const isHighRisk = await classifyForSafety(openai, question, { seed, userId })
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
          return
        }

        // 1) SORTEIO. Em código, para os cinco oráculos ao mesmo tempo, com um
        //    seed criptográfico. A pergunta e o idioma não participam.
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

        // 2) INTERPRETAÇÃO. Cada oráculo vai ao modelo separadamente.
        const results = await interpretAll(openai, question, seed, draws, rendered, locale, labels, deadline, userId)

        // 3) PERSISTÊNCIA. Os cinco resultados completos ficam no servidor
        //    ANTES da síntese: é daqui que /consultas/sintese vai lê-los, e é
        //    isto que permite tentar a síntese de novo sem refazer nada.
        const persisted = await storeReadingResult({ seed, userId, visitorId, question, locale, oracles: results as any })
        if (!persisted) throw new ConsultaError("storage_failed")

        // Tiragem completa e guardada: agora conta na cota.
        await completeReading(seed)

        send({ type: "oracles", question, seed, locale, oracles: results })

        // A síntese é pedida pelo cliente em seguida, via POST /consultas/sintese.
        send({ type: "done" })
      } catch (err: any) {
        // falha do servidor não consome a cota do usuário
        console.error("[consultas]", seed, err)
        await failReading(seed).catch(() => {})
        send({ type: "error", code: codeOf(err) })
      } finally {
        clearInterval(beat)
        closed = true
        controller.close()
      }
    },
  })

  return new Response(stream, { headers: withCookies(baseHeaders, cookieHeaders) })
}

/** Headers + um ou mais Set-Cookie (a Headers API permite repetir o nome). */
function withCookies(base: Record<string, string>, cookies: string[]): Headers {
  const h = new Headers(base)
  for (const c of cookies) h.append("Set-Cookie", c)
  return h
}
