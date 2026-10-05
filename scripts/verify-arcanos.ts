/**
 * Os 22 Arcanos Maiores do balão "Escolha uma carta".
 *
 * Trava: (1) os 22 estão, uma vez cada, com texto nos três idiomas; (2) o texto
 * que vai à tela não traz autor, obra nem "segundo…"; (3) cada trecho de Ben-Dov
 * existe na ficha extraída daquela carta, e cada trecho do Nichols existe na
 * página declarada do PDF (só quando o PDF está presente; o arquivo não vai ao
 * deploy e a conferência é dita como pulada).
 *
 * Zero IA, zero rede.
 */
import fs from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { ARCANOS_MAIORES, PDF_NICHOLS } from "../lib/oracles/arcanos-maiores"
import { BENDOV_CARTAS } from "../lib/oracles/bendov-cartas"
import { MAJOR_ARCANA } from "../lib/oracles/draw"
import { LOCALES } from "../lib/i18n/config"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}
const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/[“”‘’"'«»]/g, "").replace(/\s+/g, "")

confere("são 22 arcanos", ARCANOS_MAIORES.length === 22)
confere("os índices 0 a 21 aparecem uma vez cada", [...ARCANOS_MAIORES.map((a) => a.indice)].sort((a, b) => a - b).join() === Array.from({ length: 22 }, (_, i) => i).join())
confere("slugs únicos", new Set(ARCANOS_MAIORES.map((a) => a.slug)).size === 22)

const APELIDOS: Record<string, string> = { "Os Enamorados": "O Amante" }
const PROIBIDO = /Nichols|Jung\b|Ben-Dov|Segundo |According to|Seg[uú]n |Taro\b/i
for (const a of ARCANOS_MAIORES) {
  const nome = MAJOR_ARCANA[a.indice]
  for (const loc of LOCALES) {
    const t = a.leitura[loc]
    const n = t.split(/\s+/).length
    confere(`${a.slug}/${loc}: de 35 a 75 palavras`, n >= 35 && n <= 75, String(n))
    confere(`${a.slug}/${loc}: sem autor nem obra`, !PROIBIDO.test(t), t.slice(0, 50))
  }
  confere(`${a.slug}: tem Nichols e Ben-Dov`, a.fontes.some((f) => f.autor === "Sallie Nichols") && a.fontes.some((f) => f.autor === "Yoav Ben-Dov"))
  const ficha = BENDOV_CARTAS.find((c) => c.carta === (APELIDOS[nome] ?? nome))
  for (const f of a.fontes.filter((x) => x.autor === "Yoav Ben-Dov")) {
    confere(`${a.slug}: trecho do Ben-Dov na ficha`, !!ficha && norm(ficha.base).includes(norm(f.trecho)), f.trecho)
  }
}

const PDF = path.join(process.cwd(), PDF_NICHOLS.arquivo)
async function conferirPdf(): Promise<boolean> {
  if (!fs.existsSync(PDF)) return false
  const bytes = fs.readFileSync(PDF)
  confere("o PDF local é a versão auditada (sha256)", createHash("sha256").update(bytes).digest("hex") === PDF_NICHOLS.sha256)
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise
  const cache = new Map<number, string>()
  const pagina = async (n: number) => {
    if (!cache.has(n)) cache.set(n, norm((await (await doc.getPage(n)).getTextContent()).items.map((i: any) => i.str).join(" ")))
    return cache.get(n) as string
  }
  for (const a of ARCANOS_MAIORES) {
    for (const f of a.fontes.filter((x) => x.autor === "Sallie Nichols")) {
      confere(`${a.slug}: trecho achado na p.${f.pagina}`, (await pagina(f.pagina)).includes(norm(f.trecho)), f.trecho.slice(0, 70))
    }
  }
  return true
}

conferirPdf().then((pdf) => {
  if (falhas.length) {
    console.error(`verify:arcanos — ${falhas.length} falha(s) em ${conferidos} conferências:`)
    for (const f of falhas) console.error("  ✗ " + f)
    process.exit(1)
  }
  console.log(`verify:arcanos — ${conferidos} conferências ok. 22 arcanos. ` + (pdf ? "Trechos do Nichols conferidos contra o PDF." : "PDF ausente: conferência dos trechos do Nichols PULADA."))
})
