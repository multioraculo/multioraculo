// lib/hybridSearch.js
import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBED_MODEL = "text-embedding-3-small";

const INDEX_FILE = path.join(process.cwd(), "data", "pdfs_index", "pdfs.index.json");
const EMB_FILE = path.join(process.cwd(), "data", "pdfs_index", "pdfs.embeddings.json");

let cache = null;

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function tokenize(q) {
  const n = normalize(q);
  // tokens simples, removendo lixo
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

  // score por presença/ocorrência: simples e eficaz
  let score = 0;
  for (const tok of tokens) {
    const re = new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    const matches = t.match(re);
    if (matches) score += Math.min(3, matches.length); // cap
  }

  // bonus se a query inteira aparece (frase)
  return score;
}

async function loadData() {
  const [indexRaw, embRaw] = await Promise.all([
    fs.readFile(INDEX_FILE, "utf8"),
    fs.readFile(EMB_FILE, "utf8"),
  ]);

  const index = JSON.parse(indexRaw);
  const emb = JSON.parse(embRaw);

  // mapa: file -> total chunks
  const chunksByFile = new Map();
  for (const d of index.index) chunksByFile.set(d.file, d.chunks?.length || 0);

  // itens embeddados
  const items = emb.items;

  return { indexMeta: index, chunksByFile, items, model: emb.model };
}

export async function hybridSearch({
  query,
  topK = 8,
  alpha = 0.55, // peso semântico (0..1). 0.55 é um bom default
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não está definido no ambiente.");
  }
  if (!query || !query.trim()) return [];

  if (!cache) cache = await loadData();

  const tokens = tokenize(query);

  // embedding da query
  const qEmbResp = await client.embeddings.create({
    model: EMBED_MODEL,
    input: query,
  });
  const qEmb = qEmbResp.data[0].embedding;

  // 1) pontua tudo
  const scored = cache.items.map((it) => {
    const sem = cosine(qEmb, it.embedding);
    const key = keywordScore(it.text, tokens);

    // normaliza keyword para ficar na mesma escala (grosseiro mas funciona bem)
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

  // 2) pega top, mas evita spam do mesmo PDF/chunk adjacente demais
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