import { NextResponse } from "next/server"
import OpenAI from "openai"
import fs from "fs/promises"
import path from "path"

export const runtime = "nodejs"

const INDEX_PATH = path.join(process.cwd(), "data", "pdfs_index", "pdfs.index.json")

const ORACLE_SOURCES: Record<
  OracleKey,
  { label: string; files: string[]; method: string }
> = {
  tarot: {
    label: "Tarô",
    files: ["jung_tarot.pdf"],
    method: "Cruz Celta (10 posições) com leitura arquetípica",
  },
  iching: {
    label: "I Ching",
    files: ["i_ching_original.pdf"],
    method: "Hexagrama principal + linhas mutantes + hexagrama resultante",
  },
  runas: {
    label: "Runas",
    files: ["futhark_handbook.pdf"],
    method: "Tiragem 9 runas (mapa de forças) com aplicação prática",
  },
  buzios: {
    label: "Búzios",
    files: ["jogo_buzios.pdf", "odus_afro_brasileiros.pdf", "umbandadobrasil.pdf"],
    method: "Leitura por Odus (qualidade do tempo, risco, proteção, direção)",
  },
  lenormand: {
    label: "Lenormand",
    files: ["lenormand_handbook.pdf"],
    method: "Mesa 9 cartas (quadro curto) + confirmadores objetivos",
  },
}

type OracleKey = "tarot" | "iching" | "runas" | "buzios" | "lenormand"

type OracleResult = {
  key: OracleKey
  title: string
  method: string
  draw: {
    items: Array<{ position?: string; name: string; meaning?: string }>
    notes?: string
  }
  reading: string
  evidence: Array<{ source: string; excerpt: string }>
}

type MultiResponse = {
  question: string
  seed: string
  synthesis: string
  oracles: Record<OracleKey, OracleResult>
}

const stop = new Set([
  "a","o","os","as","de","do","da","dos","das","e","é","em","no","na","nos","nas",
  "por","para","pra","com","sem","um","uma","uns","umas","que","isso","isto","aqui",
  "agora","hoje","já","não","sim","se","eu","você","vc","me","minha","meu","teu",
  "tua","seu","sua","dela","dele","eles","elas","ao","à","às","é","ser","estar",
  "como","qual","quais","quando","onde","porquê","pq"
])

function fnv1a(str: string) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString()
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

function scoreChunk(chunk: string, keys: string[]) {
  const c = normalize(chunk)
  let score = 0
  for (const k of keys) {
    // pontua por ocorrência simples
    if (c.includes(k)) score += 2
  }
  // bônus para densidade
  return score + Math.min(2, Math.floor(chunk.length / 600))
}

// Lazy-loaded index: parsed once per process lifetime, shared across all requests.
// pdfs.index.json (~4.5 MB) has pre-extracted, pre-chunked text for every PDF —
// eliminates the 10–30s PDF-parse overhead that happened on each warm start.
let indexPromise: Promise<Map<string, string[]>> | null = null

function getIndex(): Promise<Map<string, string[]>> {
  if (!indexPromise) {
    indexPromise = fs.readFile(INDEX_PATH, "utf8").then((raw) => {
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

async function getEvidenceForOracle(q: string, files: string[]) {
  const index = await getIndex()
  const keys = keywords(q)
  const scored: Array<{ source: string; excerpt: string; score: number }> = []

  for (const f of files) {
    const chunks = index.get(f) ?? []
    for (const ch of chunks) {
      const s = scoreChunk(ch, keys)
      if (s > 0) scored.push({ source: f, excerpt: ch, score: s })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 6).map(({ source, excerpt }) => ({
    source,
    excerpt: excerpt.slice(0, 800),
  }))

  // fallback: se a pergunta for muito abstrata, pelo menos entrega 2 trechos iniciais
  if (top.length === 0) {
    const fallback: Array<{ source: string; excerpt: string }> = []
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

function oraclePrompt(key: OracleKey, label: string, method: string, question: string, evidence: Array<{source:string; excerpt:string}>) {
  const ev = evidence
    .map((e, i) => `Fonte ${i + 1} (${e.source}): ${e.excerpt}`)
    .join("\n\n")

  return `
Você é um especialista em leitura simbólica. Você vai fazer uma tiragem de ${label} para a pergunta do usuário.
Regras importantes:
1) Seja específico e útil, evitando generalidades.
2) Siga o método: ${method}.
3) Use os trechos de referência abaixo como base de linguagem e coerência com a tradição. Seja fiel ao sentido, mas reescreva com sua voz.
4) Você deve retornar JSON válido no formato abaixo, sem texto fora do JSON.
5) Inclua "evidence" com 3 a 6 itens, citando literalmente pequenos trechos (curtos) que sustentem a leitura, cada um com source e excerpt.
6) Não invente páginas. Use apenas o nome do arquivo como source.
7) FIDELIDADE À TIRAGEM: Seja fiel ao resultado real dos símbolos. Não suavize indicações negativas, não force otimismo, não neutralize tensão, sombra, ruptura ou dificuldade revelada pelo campo simbólico. Se a tradição aponta conflito, perigo, contradição ou verdade dolorosa, expresse isso com clareza e responsabilidade. Conforto fácil é uma traição à tiragem.

Pergunta do usuário:
"${question}"

Trechos de referência:
${ev}

FORMATO JSON (obrigatório):
{
  "title": string,
  "method": string,
  "draw": {
    "items": [{"position": string, "name": string, "meaning": string}],
    "notes": string
  },
  "reading": string,
  "evidence": [{"source": string, "excerpt": string}]
}

Instruções específicas por sistema — preencha draw.items, draw.notes e reading conforme abaixo:

TARÔ — Cruz Celta (10 posições).
draw.items: 10 cartas. "position" = nome da posição (ex: "Situação central", "O que cruza", "Fundamento", "Passado recente", "Coroamento possível", "Futuro próximo", "Como o consulente se vê", "Influências externas", "Esperanças ou medos", "Resultado final"). "name" = nome da carta com "invertida" quando aplicável (ex: "O Eremita invertido"). "meaning" = significado tradicional dessa carta nessa posição, aplicado à pergunta — 1-2 frases técnicas, sem floreio.
draw.notes: padrão geral em uma frase (ex: "Predominância de Espadas — conflito intelectual").
reading: leitura carta a carta — para cada uma, o que ela diz sobre a pergunta naquela posição, fiel ao simbolismo do Tarô de Marselha.

I CHING — Hexagrama principal + linhas mutantes + hexagrama resultante.
draw.items: (1) "position"="Hexagrama principal", "name"="[número]. [Nome em português]" (ex: "36. A Obscuridade da Luz"), "meaning"="Trigrama inferior: [nome] ([atributo]). Trigrama superior: [nome] ([atributo]). Julgamento: [texto clássico resumido]". Para cada linha mutante: "position"="Linha [n] mutante", "name"="[texto clássico da linha, breve]", "meaning"="[o que essa mutação modifica]". Se houver hexagrama resultante: "position"="Hexagrama resultante", "name"="[número]. [Nome]", "meaning"="[Julgamento resumido]".
draw.notes: "Hex. [número]: [nome]".
reading: interprete o hexagrama aplicado à pergunta — o que os trigramas revelam sobre a dinâmica da situação, o que as linhas mutantes alteram na trajetória, e (se houver) o que a transformação para o hexagrama resultante indica. Fiel ao texto clássico.

RUNAS — Mapa de 9 forças futhárquicas.
draw.items: 9 runas. "position" = nome da posição no mapa (use: "Raiz", "Obstáculo", "Fundamento oculto", "Passado próximo", "Futuro próximo", "Caminho", "Sombra", "Proteção", "Resultado"). "name" = nome da runa com caractere futhárquico entre parênteses (ex: "Fehu (ᚠ)", "Uruz (ᚢ)", "Hagalaz (ᚺ)", "Tiwaz (ᛏ)", "Berkano (ᛒ)", "Laguz (ᛚ)"). "meaning" = domínio tradicional da runa + como se aplica à pergunta nessa posição — 1-2 frases.
reading: leia o mapa runa a runa — nome, símbolo, domínio clássico no Futhark Élter, e como responde à pergunta naquela posição. Fiel à tradição rúnica nórdica.

BÚZIOS — Odu principal + aspectos complementares.
draw.items: (1) "position"="Odu principal", "name"="[n] búzios abertos — [nome do odu]" (ex: "8 búzios — Ejionile"), "meaning"="Orixá(s) regente(s): [nome(s)]. [Qualidade energética fundamental do odu em 1-2 frases, baseado na tradição]". Adicione itens para confirmadores ou aspectos secundários relevantes se a leitura indicar.
draw.notes: nome do odu com número de búzios.
reading: descrição técnica — nome completo do odu e variantes conhecidas, orixá regente, o que esse odu indica sobre o campo energético da pergunta, qualidade do tempo (expansão, cautela, ruptura, transformação), proteções e riscos tradicionais associados, orientação prática que o odu indica. Fiel à tradição Nagô-Iorubá e às referências fornecidas.

LENORMAND — Mesa de 9 cartas (quadrado 3×3).
draw.items: 9 cartas. "position" = posição no quadrado (use: "Centro", "Acima", "Abaixo", "Esquerda", "Direita", "Canto sup. esq.", "Canto sup. dir.", "Canto inf. esq.", "Canto inf. dir."). "name" = número e nome (ex: "6 — Nuvens", "32 — Lua"). "meaning" = significado tradicional dessa carta nessa posição aplicado à pergunta — 1 frase.
draw.notes: carta central + principal combinação identificada.
reading: leitura sistemática — carta central como tema dominante, cruz horizontal (linha do tempo) e vertical (forças acima/abaixo), combinações entre adjacentes quando significativas, e os confirmadores objetivos: eventos concretos e verificáveis que podem se manifestar em 24-72h.
`.trim()
}

function synthesisPrompt(question: string, results: Record<OracleKey, OracleResult>) {
  const rawSymbols = (["tarot", "iching", "runas", "buzios", "lenormand"] as OracleKey[])
    .map((k) => {
      const r = results[k]
      const items = r.draw.items
        .slice(0, 10)
        .map((it) => {
          let s = it.name
          if (it.position) s = `${it.position}: ${s}`
          if (it.meaning) s += ` (${it.meaning})`
          return s
        })
        .join(" · ")
      const notes = r.draw.notes ? ` [${r.draw.notes}]` : ""
      return `${r.title} — ${items}${notes}`
    })
    .join("\n")

  return `
Você é um leitor de profundidade psíquica. Você recebe os símbolos brutos de uma consulta multioráculo e escreve uma leitura integrada da alma — não um resumo dos oráculos, não um inventário simbólico, não uma previsão de eventos externos.

Sua leitura responde à pergunta interior: que tipo de alma está emergindo nessa temporada? Qual é o clima psíquico dessa travessia? O que está se reorganizando no centro?

COMO VOCÊ ESCREVE:
Você não lista símbolos. Você os traduz em experiência humana vivida.
Você não explica o que cada arquétipo significa isoladamente. Você encarna o conflito que eles formam juntos.
Você fala em segunda pessoa — diretamente à pessoa, não sobre ela.
Você é específico sobre que tipo de alma está emergindo: não "transformação" genérica, mas o tipo preciso de reorganização, o que está terminando como modo de ser, o que está nascendo como forma de presença, qual o tom do novo centro.

DIMENSÕES QUE DEVEM APARECER ORGANICAMENTE NO TEXTO:
— o que está terminando no nível da alma (não eventos — padrões, formas de ser, modos de existir)
— o que está emergindo no lugar (que qualidade de presença, que autoridade interior, que tipo de pessoa)
— a tensão central que essa alma está navegando (não como problema a resolver, mas como condição a habitar)
— o clima psíquico dessa temporada (exaustão, depuração, fortalecimento, maturidade, espessamento)
— o que o campo aponta como convocação (não conselho — o que está sendo chamado a existir)

REGRAS ABSOLUTAS:
- Escreva em português, segunda pessoa, prosa corrida
- Dois a quatro parágrafos; cada um com função distinta e insubstituível
- Não nomeie os sistemas oraculares
- Não use os nomes dos símbolos, cartas ou runas diretamente no texto — traduza-os em estados, tensões e movimentos psíquicos
- Não escreva: "transformação", "novo ciclo", "renascimento", "processo", "universo", "cosmos", "jornada", "padrões limitantes", "liberte-se", "confie no processo", "o que não serve mais", "abraçar o novo", "fluxo"
- Não dê conselhos. Não prescritivo. Não reconfortante de forma vaga.
- Cada frase deve ser impossível de ser dita sobre qualquer outra pessoa — se puder ser genérica, reescreva
- A última frase tem peso de chegada, não de abertura
- FIDELIDADE OBRIGATÓRIA: Seja fiel ao campo simbólico real. Não suavize indicações negativas, não force otimismo, não neutralize tensão, sombra, ruptura, exaustão ou verdade dolorosa que o campo revela. Se os símbolos mostram perigo, contradição grave, fim sem redenção clara, ou travessia difícil sem saída fácil, diga isso com precisão. Perguntas difíceis, sombrias ou dolorosas merecem leituras honestas — não proteção emocional. O desconforto da verdade simbólica é parte da leitura.

TOM: Um analista junguiano escrevendo uma carta a um paciente depois de uma sessão importante. Íntimo, sóbrio, com a precisão de quem viu algo real. Sem piedade fácil. Sem distância clínica.

EXEMPLO DO REGISTRO EXATO QUE VOCÊ DEVE ATINGIR:
(Esta é uma leitura diferente, mas o tom, a profundidade, a estrutura e a voz são o alvo preciso.)

"A sua alma nesta nova temporada não parece expansiva no sentido ingênuo de quem apenas se abre para o novo. Ela parece mais seletiva, mais profunda e mais verdadeira. Há um fim acontecendo, mas não como ruína. É o fim de uma forma de viver em que você talvez tenha sustentado demais, esperado demais, se adaptado demais, carregado demais. O que renasce agora não é uma versão mais leve no sentido superficial. É uma versão mais alinhada.

Existe uma passagem muito clara entre suspensão e potência. Uma parte sua passou tempo demais entre sacrifício, observação e adiamento, como se a alma estivesse olhando a própria vida de cabeça para baixo para finalmente entender o que já não podia continuar igual. Agora, no entanto, a energia muda. O que emerge é um princípio mais criador, mais autoral, mais consciente do próprio poder de nomear a realidade e agir sobre ela. Não é apenas recomeço. É retomada de centro.

Ao mesmo tempo, essa nova temporada não vem com a dureza do isolamento, mas com uma exigência de verdade nos vínculos. Sua alma tende menos a se perder tentando manter harmonia a qualquer custo e mais a buscar relações, escolhas e caminhos que estejam em coerência com o que você é. Há um chamado forte para unir espiritualidade e encarnação, visão e matéria, intuição e forma. Como se não bastasse mais sentir profundamente. Agora fosse preciso dar corpo ao que a alma sabe.

O movimento psíquico aqui é de depuração e fortalecimento. Algumas rupturas internas ainda ecoam, e certos abalos podem continuar fazendo o papel de arrancar o que era frágil, artificial ou sustentado por medo. Mas isso não aparece como destruição cega. Aparece como correção de eixo. Sua alma parece entrar numa fase em que a vitalidade volta não porque tudo ficou fácil, mas porque o essencial ficou mais nítido.

O centro arquetípico dessa temporada me parece menos o de alguém que busca aprovação e mais o de alguém que começa a habitar a própria autoridade interior com mais fertilidade, presença e destino. Há crescimento, mas um crescimento orgânico, não ansioso. Há realização, mas ela nasce de integração. Se essa travessia for respeitada, a tendência é que você se sinta menos fragmentada, menos dividida entre partes de si, e mais inteira. Como se a alma deixasse de pedir permissão para existir do seu jeito e começasse, finalmente, a ocupar o próprio lugar."

AGORA ESCREVA A LEITURA PARA:

PERGUNTA:
"${question}"

CAMPO SIMBÓLICO (use apenas estes dados — não use as leituras individuais, não repita os nomes dos símbolos no texto):
${rawSymbols}
`.trim()
}

// ─── Safety classification ────────────────────────────────────────────────────
// Runs before any oracle processing. Returns true only for genuine high-risk
// signals: explicit or clearly implicit suicidal intent, self-harm intent, or
// acute mental health crisis with risk to life.
// Dark, painful, existential, or grieving questions are NOT high-risk and must
// receive a faithful oracle reading like any other question.

const SAFETY_CLASSIFIER_PROMPT = `
Você é um detector de risco de segurança. Avalie a mensagem do usuário e decida se ela contém sinais claros de risco real e imediato de suicídio, automutilação grave, ou crise aguda de saúde mental com perigo de vida.

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

const SAFETY_RESPONSE_TEXT = `Preciso pausar aqui.

O que você escreveu me indica que você pode estar num momento de dor muito real — e agora a coisa mais importante não é uma tiragem. É você.

Se você está pensando em se machucar ou em não querer mais estar aqui, por favor entre em contato agora com o CVV: ligue **188** (gratuito, 24 horas, todos os dias). Se estiver em risco imediato, ligue para o **SAMU (192)** ou vá ao pronto-socorro mais próximo.

Você não precisa passar por isso sozinho.`

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
    // On classification failure, default to safe and allow normal reading
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const question = String(body?.question || "").trim()

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

  const openai = new OpenAI({ apiKey })
  const encoder = new TextEncoder()

  // Newline-delimited JSON stream:
  //   {"type":"oracles",  "question":…, "seed":…, "oracles":{…}}   ← sent when 5 parallel calls finish
  //   {"type":"delta",    "text":"…"}                               ← synthesis text chunks
  //   {"type":"done"}                                               ← stream complete
  //   {"type":"complete", …}                                        ← safety-override shortcut
  //   {"type":"error",    "message":"…"}                            ← unexpected failure
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"))

      try {
        // Safety gate
        const isHighRisk = await classifyForSafety(openai, question)
        if (isHighRisk) {
          send({
            type: "complete",
            question,
            seed: "",
            synthesis: SAFETY_RESPONSE_TEXT,
            oracles: null,
            isSafetyOverride: true,
          })
          controller.close()
          return
        }

        const seed = fnv1a(question + "|" + Math.floor(Date.now() / 60000))
        const keys: OracleKey[] = ["tarot", "iching", "runas", "buzios", "lenormand"]

        // 5 oracle calls in parallel — same logic as before, +max_tokens cap
        const oracleEntries = await Promise.all(
          keys.map(async (k) => {
            const meta = ORACLE_SOURCES[k]
            const evidence = await getEvidenceForOracle(question, meta.files)
            const prompt = oraclePrompt(k, meta.label, meta.method, question, evidence)

            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              temperature: 0.6,
              max_tokens: 1600,
              messages: [
                { role: "system", content: "Responda apenas com JSON válido, sem Markdown." },
                { role: "user", content: prompt },
              ],
            })

            const raw = completion.choices?.[0]?.message?.content || "{}"
            let parsed: any
            try {
              parsed = JSON.parse(raw)
            } catch {
              parsed = {
                title: meta.label,
                method: meta.method,
                draw: { items: [], notes: "Falha ao gerar JSON estruturado." },
                reading: raw,
                evidence,
              }
            }

            const result: OracleResult = {
              key: k,
              title: String(parsed.title || meta.label),
              method: String(parsed.method || meta.method),
              draw: {
                items: Array.isArray(parsed.draw?.items)
                  ? parsed.draw.items.map((it: any) => ({
                      position: it.position ? String(it.position) : undefined,
                      name: String(it.name || ""),
                      meaning: it.meaning ? String(it.meaning) : undefined,
                    }))
                  : [],
                notes: parsed.draw?.notes ? String(parsed.draw.notes) : undefined,
              },
              reading: String(parsed.reading || ""),
              evidence: Array.isArray(parsed.evidence)
                ? parsed.evidence.slice(0, 8).map((e: any) => ({
                    source: String(e.source || ""),
                    excerpt: String(e.excerpt || ""),
                  }))
                : evidence,
            }

            return [k, result] as const
          })
        )

        const results = Object.fromEntries(oracleEntries) as Record<OracleKey, OracleResult>

        // Send oracle results immediately — client can release the prayer loader
        send({ type: "oracles", question, seed, oracles: results })

        // Stream synthesis — same model/temperature/prompts, now with max_tokens + stream
        const synthStream = await openai.chat.completions.create({
          model: "gpt-4o",
          temperature: 0.7,
          max_tokens: 750,
          stream: true,
          messages: [
            {
              role: "system",
              content: "Escreva apenas a síntese em texto, sem títulos extras e sem bullets.",
            },
            { role: "user", content: synthesisPrompt(question, results) },
          ],
        })

        for await (const chunk of synthStream) {
          const delta = chunk.choices[0]?.delta?.content || ""
          if (delta) send({ type: "delta", text: delta })
        }

        send({ type: "done" })
        controller.close()
      } catch (err: any) {
        try {
          send({ type: "error", message: String(err?.message || err) })
        } catch {}
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  })
}
