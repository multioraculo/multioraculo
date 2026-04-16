// lib/hybridSearch.js
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBED_MODEL = "text-embedding-3-small";

// URLs dos assets hospedados no GitHub Release
const INDEX_URL =
  process.env.PDFS_INDEX_URL ||
  "https://github.com/multioraculo/multioraculo/releases/download/v1-data/pdfs.index.json";
const EMB_URL =
  process.env.PDFS_EMB_URL ||
  "https://github.com/multioraculo/multioraculo/releases/download/v1-data/pdfs.embeddings.json";

// Caminhos locais (fallback pra dev e cache em /tmp em prod)
const LOCAL_INDEX = path.join(process.cwd(), "data", "pdfs_index", "pdfs.index.json");
const LOCAL_EMB = path.join(process.cwd(), "data", "pdfs_index", "pdfs.embeddings.json");

// Em ambientes serverless (Vercel), o único lugar gravável é /tmp
const TMP_DIR = path.join(os.tmpdir(), "oracle-data");
const TMP_INDEX = path.join(TMP_DIR, "pdfs.index.json");
const TMP_EMB = path.join(TMP_DIR, "pdfs.embeddings.json");

let cache = null;
let loadPromise = null; // dedupe de downloads concorrentes

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function tokenize(q) {
  const n = normalize(q);
  return n
    .split(/[^a-z0-9]+/g)
    .filter((t) => t.length >= 3)
    .slice(0, 12);
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function norm(a) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}

function cosine(a, b) {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return 0;
  return dot(a, b) / (na * nb);
}

function keywordScore(text, tokens) {
  const t = normalize(text);
  if (!t) return 0;

  let score = 0;
  for (const tok of tokens) {
    const re = new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    const matches = t.match(re);
    if (matches) score += Math.min(3, matches.length);
  }

  return score;
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readFromAnywhere(localPath, tmpPath, remoteUrl, label) {
  // 1) Tenta ler do projeto (dev local com os arquivos no disco)
  if (await fileExists(localPath)) {
    return fs.readFile(localPath, "utf8");
  }

  // 2) Tenta ler do cache em /tmp (já baixamos nesta instância serverless)
  if (await fileExists(tmpPath)) {
    return fs.readFile(tmpPath, "utf8");
  }

  // 3) Baixa da internet (primeira requisição em cold start na Vercel)
  console.log(`[oracle] Baixando ${label} de ${remoteUrl}`);
  const resp = await fetch(remoteUrl);
  if (!resp.ok) {
    throw new Error(
      `Falha ao baixar ${label}: HTTP ${resp.status} ${resp.statusText}`
    );
  }
  const text = await resp.text();

  // Salva em /tmp pra acelerar próximas requisições da mesma instância
  try {
    await fs.mkdir(TMP_DIR, { recursive: true });
    await fs.writeFile(tmpPath, text, "utf8");
  } catch (err) {
    // Se /tmp não for gravável, segue em frente — ainda temos o texto em memória
    console.warn(`[oracle] Não foi possível escrever em ${tmpPath}:`, err?.message);
  }

  return text;
}

async function loadData() {
  const [indexRaw, embRaw] = await Promise.all([
    readFromAnywhere(LOCAL_INDEX, TMP_INDEX, INDEX_URL, "pdfs.index.json"),
    readFromAnywhere(LOCAL_EMB, TMP_EMB, EMB_URL, "pdfs.embeddings.json"),
  ]);

  const index = JSON.parse(indexRaw);
  const emb = JSON.parse(embRaw);

  const chunksByFile = new Map();
  for (const d of index.index) chunksByFile.set(d.file, d.chunks?.length || 0);

  const items = emb.items;

  return { indexMeta: index, chunksByFile, items, model: emb.model };
}

export async function hybridSearch({
  query,
  topK = 8,
  alpha = 0.55,
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não está definido no ambiente.");
  }
  if (!query || !query.trim()) return [];

  // Dedupe de downloads: se já há um loadData em andamento, espera ele
  if (!cache) {
    if (!loadPromise) loadPromise = loadData();
    try {
      cache = await loadPromise;
    } finally {
      loadPromise = null;
    }
  }

  const tokens = tokenize(query);

  const qEmbResp = await client.embeddings.create({
    model: EMBED_MODEL,
    input: query,
  });
  const qEmb = qEmbResp.data[0].embedding;

  const scored = cache.items.map((it) => {
    const sem = cosine(qEmb, it.embedding);
    const key = keywordScore(it.text, tokens);

    const keyNorm = Math.min(1, key / Math.max(1, tokens.length));

    const score = alpha * sem + (1 - alpha) * keyNorm;

    return {
      file: it.file,
      chunkIndex: it.chunkIndex,
      text: it.text,
      score,
      semScore: sem,
      keyScore: keyNorm,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const out = [];
  const seen = new Set();
  for (const r of scored) {
    const key = `${r.file}::${r.chunkIndex}`;
    if (seen.has(key)) continue;

    out.push(r);
    seen.add(key);

    if (out.length >= topK) break;
  }

  return out;
}
