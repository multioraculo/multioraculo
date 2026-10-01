// scripts/index-pdfs.mjs
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Entradas/saídas
const PDF_DIR = path.join(process.cwd(), "data", "pdfs");
const OUT_DIR = path.join(process.cwd(), "data", "pdfs_index");
const OUT_FILE = path.join(OUT_DIR, "pdfs.index.json");
// âncoras de página, num arquivo separado para o índice aprovado não mudar
const OUT_PAGES = path.join(OUT_DIR, "pdfs.pages.json");

// Assets do pdfjs para fontes/cmaps (evita warnings)
const STANDARD_FONTS_DIR = path.join(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "standard_fonts"
);
const CMAPS_DIR = path.join(process.cwd(), "node_modules", "pdfjs-dist", "cmaps");

const standardFontDataUrl = pathToFileURL(STANDARD_FONTS_DIR + path.sep).href;
const cMapUrl = pathToFileURL(CMAPS_DIR + path.sep).href;

/**
 * Os mesmos trechos de sempre, agora sabendo de que página cada um saiu.
 *
 * O índice guardava só o texto, e por isso uma citação extraída dele não tinha
 * como dizer onde estava no livro. Para um repertório que promete fonte
 * verificável, "está em algum lugar destas 557 páginas" não é fonte.
 *
 * O CORTE NÃO MUDA. As fronteiras dos trechos são exatamente as de antes, e
 * isso importa: o verificador do C-base-min referencia trechos por índice, e
 * recortar diferente deslocaria todos eles. Aqui as páginas chegam separadas em
 * vez de já coladas, as mesmas limpezas são aplicadas, e a única coisa nova é
 * uma lista paralela dizendo de qual página veio a primeira linha de cada
 * trecho. Quem lê `chunks` como antes não percebe diferença nenhuma.
 */
function chunkPorPagina(paginas, maxChars = 900) {
  const linhas = []
  paginas.forEach((texto, i) => {
    const limpo = (texto || "")
      .replace(/\u0000/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
    if (!limpo) return
    for (const l of limpo.split(/\r?\n/).map((x) => x.trim()).filter((x) => x.length >= 10)) {
      linhas.push({ texto: l, pagina: i + 1 })
    }
  })

  const chunks = []
  const deQualPagina = []
  let buf = ""
  let paginaDoBuf = 0

  for (const { texto, pagina } of linhas) {
    const proximo = buf ? `${buf} ${texto}` : texto
    if (proximo.length > maxChars) {
      if (buf.trim()) {
        chunks.push(buf.trim())
        deQualPagina.push(paginaDoBuf)
      }
      buf = texto
      paginaDoBuf = pagina
    } else {
      if (!buf) paginaDoBuf = pagina
      buf = proximo
    }
  }
  if (buf.trim()) {
    chunks.push(buf.trim())
    deQualPagina.push(paginaDoBuf)
  }

  return { chunks, paginas: deQualPagina }
}

function chunkText(text, maxChars = 900) {
  const cleaned = (text || "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned) return [];

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 10);

  const chunks = [];
  let buf = "";

  for (const l of lines) {
    const next = buf ? `${buf} ${l}` : l;
    if (next.length > maxChars) {
      if (buf.trim()) chunks.push(buf.trim());
      buf = l;
    } else {
      buf = next;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());

  // fallback se vier tudo sem quebras úteis
  if (chunks.length === 0) {
    for (let i = 0; i < cleaned.length; i += maxChars) {
      chunks.push(cleaned.slice(i, i + maxChars).trim());
    }
  }

  return chunks;
}

async function ensureDirExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    throw new Error(`Não encontrei a pasta: ${dirPath}`);
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function extractTextWithPdfjs(buf) {
  // Buffer é Uint8Array, mas o pdfjs pode reclamar se for Buffer.
  const data = Buffer.isBuffer(buf)
    ? new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    : buf instanceof Uint8Array
      ? buf
      : new Uint8Array(buf);

  const loadingTask = pdfjsLib.getDocument({
    data,
    standardFontDataUrl,
    cMapUrl,
    cMapPacked: true,
    disableFontFace: true,
  });

  const doc = await loadingTask.promise;

  let fullText = "";
  // as páginas também saem separadas, para cada trecho saber de onde veio
  const porPagina = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((it) => (typeof it.str === "string" ? it.str : ""))
      .join(" ")
      .replace(/[ \t]+/g, " ")
      .trim();

    porPagina.push(pageText);
    if (pageText) fullText += (fullText ? "\n\n" : "") + pageText;
  }

  return { text: fullText, pages: doc.numPages, porPagina };
}

async function main() {
  await ensureDirExists(PDF_DIR);
  await ensureDir(OUT_DIR);

  const all = await fs.readdir(PDF_DIR);
  const pdfFiles = all
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b));

  if (pdfFiles.length === 0) {
    throw new Error(`Nenhum PDF encontrado em: ${PDF_DIR}`);
  }

  const index = [];
  const ancoras = [];

  for (const file of pdfFiles) {
    const fullPath = path.join(PDF_DIR, file);
    const buffer = await fs.readFile(fullPath);

    const { text, pages, porPagina } = await extractTextWithPdfjs(buffer);
    const { chunks, paginas } = chunkPorPagina(porPagina, 900);

    index.push({
      file,
      path: `data/pdfs/${file}`,
      bytes: buffer.length,
      pages,
      chars: text.length,
      chunks,
    });

    // As páginas vão num arquivo À PARTE, e isso não é organização: é
    // segurança. `pdfs.index.json` é conferido por SHA-256 em dois lugares — o
    // portão verify:synthesis e o próprio `references.ts`, que se RECUSA a
    // montar a síntese C-base-min quando o arquivo não é o aprovado. Um campo
    // novo dentro dele mudaria o hash e derrubaria a síntese em produção por
    // causa de um metadado. Aqui o índice sai byte a byte igual ao de sempre.
    ancoras.push({ file, paginas });

    console.log(
      `OK: ${file} | pages=${pages} | chunks=${chunks.length} | chars=${text.length}`
    );
  }

  const payload = {
    createdAt: new Date().toISOString(),
    pdfDir: "data/pdfs",
    outDir: "data/pdfs_index",
    count: index.length,
    index,
  };

  // ── a trava ───────────────────────────────────────────────────────────────
  //
  // `pdfs.index.json` NÃO é um cache: é um artefato aprovado. O golden do
  // C-base-min fixa o SHA-256 dele, e `references.ts` se recusa a montar a
  // síntese quando o hash não bate. Como o arquivo grava um `createdAt`, ele
  // não pode ser reproduzido: rodar este script por cima do índice aprovado o
  // destrói PARA SEMPRE, e ele é ignorado pelo git, então não há de onde
  // restaurar. Já aconteceu uma vez, e só não virou prejuízo porque havia
  // backup.
  //
  // Daqui em diante é preciso dizer `--forcar` em voz alta.
  const golden = JSON.parse(await fs.readFile(path.join(process.cwd(), "scripts", "cbase-min.golden.json"), "utf8"));
  let existente = null;
  try {
    existente = createHash("sha256").update(await fs.readFile(OUT_FILE)).digest("hex");
  } catch {}

  if (existente && existente === golden.pdfsIndexSha256 && !process.argv.includes("--forcar")) {
    console.error(
      `\nPARADO: ${OUT_FILE} é o índice APROVADO da síntese C-base-min.\n` +
        `Ele grava um createdAt, então não dá para reproduzi-lo: sobrescrever é perder.\n` +
        `Faça uma cópia antes e rode de novo com --forcar se for mesmo isso que você quer.\n`
    );
    process.exitCode = 1;
    return;
  }

  await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2), "utf8");
  console.log(`\nGerado: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("\nERRO:", err?.message || err);
  process.exit(1);
});