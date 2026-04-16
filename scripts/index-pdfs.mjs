// scripts/index-pdfs.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Entradas/saídas
const PDF_DIR = path.join(process.cwd(), "data", "pdfs");
const OUT_DIR = path.join(process.cwd(), "data", "pdfs_index");
const OUT_FILE = path.join(OUT_DIR, "pdfs.index.json");

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
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((it) => (typeof it.str === "string" ? it.str : ""))
      .join(" ")
      .replace(/[ \t]+/g, " ")
      .trim();

    if (pageText) fullText += (fullText ? "\n\n" : "") + pageText;
  }

  return { text: fullText, pages: doc.numPages };
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

  for (const file of pdfFiles) {
    const fullPath = path.join(PDF_DIR, file);
    const buffer = await fs.readFile(fullPath);

    const { text, pages } = await extractTextWithPdfjs(buffer);
    const chunks = chunkText(text, 900);

    index.push({
      file,
      path: `data/pdfs/${file}`,
      bytes: buffer.length,
      pages,
      chars: text.length,
      chunks,
    });

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

  await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2), "utf8");
  console.log(`\nGerado: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("\nERRO:", err?.message || err);
  process.exit(1);
});