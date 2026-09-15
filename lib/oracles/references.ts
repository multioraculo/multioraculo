/**
 * Índice de trechos das referências e seleção POR ITEM SORTEADO.
 *
 * Movido sem alteração de app/consultas/route.ts para ser usado também pela
 * síntese: as interpretações individuais e a síntese C-base-min escolhem os
 * trechos com a mesma regra (lib/oracles/evidence.ts) e o mesmo índice.
 */
import { createHash } from "crypto"
import fs from "fs/promises"
import path from "path"
import https from "https"
import os from "os"
import { drawAll, normalizeText, type OracleDraw, type OracleKey } from "./draw"
import { keywords, selectEvidence, type Chunk, type Evidence } from "./evidence"
import { renderDraw, type RenderedDraw } from "./localize"
import { ORACLE_ORDER } from "./synthesis"
import { methodFacts, type CBaseMinMaterial } from "./synthesis-cbase-min"
import type { Locale } from "@/lib/i18n"

const INDEX_TIMEOUT_MS = 10_000

/**
 * SHA-256 do pdfs.index.json aprovado junto com a síntese C-base-min (release
 * v1-data, idêntico à cópia local usada nos testes). Os trechos de referência
 * entram no prompt da síntese: outro índice muda o texto que foi avaliado.
 * Trocar o índice exige nova avaliação e atualizar este valor e
 * scripts/cbase-min.golden.json.
 */
export const APPROVED_PDFS_INDEX_SHA256 = "390ea4d85fabfe288e653a465939fd3f479a0b3a128c635602d462093209a173"

const INDEX_URL =
  process.env.PDFS_INDEX_URL ||
  "https://github.com/multioraculo/multioraculo/releases/download/v1-data/pdfs.index.json"

const LOCAL_INDEX = path.join(process.cwd(), "data", "pdfs_index", "pdfs.index.json")
const TMP_DIR = os.tmpdir()
const TMP_INDEX = path.join(TMP_DIR, "pdfs.index.json")

export const ORACLE_SOURCES: Record<OracleKey, { files: string[]; method: string }> = {
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
/** SHA-256 do índice carregado nesta instância (null enquanto não carregou). */
let loadedIndexSha256: string | null = null

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
        const sha = createHash("sha256").update(raw, "utf8").digest("hex")
        loadedIndexSha256 = sha
        if (sha !== APPROVED_PDFS_INDEX_SHA256) {
          // as interpretações individuais seguem; a síntese C-base-min recusa (ver buildCBaseMinMaterial)
          console.error(`[consultas] pdfs.index.json difere do aprovado: sha256 ${sha} (esperado ${APPROVED_PDFS_INDEX_SHA256})`)
        }
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
export async function getEvidenceForOracle(
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
 * Material da síntese C-base-min, refeito a partir do seed: os mesmos itens que
 * a pessoa viu (no idioma da leitura), fatos do método calculados em código e
 * os trechos de referência escolhidos por item. Nenhuma interpretação entra.
 *
 * FAIL-CLOSED: se o índice carregado não for exatamente o aprovado, lança erro
 * antes de montar qualquer material. Com outro índice os trechos deixam de ser
 * os validados, e nenhuma síntese diferente deve ser produzida em silêncio; o
 * erro cai no tratamento de falha já existente de cada rota.
 */
export async function buildCBaseMinMaterial(question: string, seed: string, locale: Locale): Promise<CBaseMinMaterial> {
  await getIndex()
  if (loadedIndexSha256 !== APPROVED_PDFS_INDEX_SHA256) {
    throw new Error(
      `pdfs.index.json não é o aprovado para a síntese C-base-min: sha256 ${loadedIndexSha256} (esperado ${APPROVED_PDFS_INDEX_SHA256})`
    )
  }
  const draws = drawAll(seed)
  const entries = await Promise.all(
    ORACLE_ORDER.map(async (k) => {
      const rendered = renderDraw(draws[k], locale)
      const evidence = await getEvidenceForOracle(draws[k], rendered, question, ORACLE_SOURCES[k].files)
      return [k, { method: ORACLE_SOURCES[k].method, items: rendered.items, facts: methodFacts(k, draws, rendered), evidence }] as const
    })
  )
  return Object.fromEntries(entries) as CBaseMinMaterial
}
