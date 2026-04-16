// scripts/embed-pdfs.mjs
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const INDEX_FILE = path.join(process.cwd(), "data", "pdfs_index", "pdfs.index.json");
const OUT_FILE = path.join(process.cwd(), "data", "pdfs_index", "pdfs.embeddings.json");

// modelos bons e baratos p/ embedding (text-embedding-3-small é ótimo custo/benefício)
const EMBED_MODEL = "text-embedding-3-small";

// batching: seguro e rápido
const BATCH_SIZE = 64;

function sha1(s) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

async function readJson(p) {
  return JSON.parse(await fs.readFile(p, "utf8"));
}

async function writeJson(p, obj) {
  await fs.writeFile(p, JSON.stringify(obj, null, 2), "utf8");
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não está definido no ambiente (.env.local).");
  }

  const index = await readJson(INDEX_FILE);

  // carrega existente para incremental (não re-embed tudo toda vez)
  let existing = null;
  try {
    existing = await readJson(OUT_FILE);
  } catch {
    existing = null;
  }

  const existingMap = new Map();
  if (existing?.items?.length) {
    for (const it of existing.items) existingMap.set(it.id, it);
  }

  const items = [];
  for (const doc of index.index) {
    const file = doc.file;
    const chunks = doc.chunks || [];
    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      const id = `${file}::${i}::${sha1(text)}`;
      items.push({
        id,
        file,
        chunkIndex: i,
        text,
      });
    }
  }

  // separa o que já existe
  const todo = items.filter((it) => !existingMap.has(it.id));
  console.log(`Total chunks: ${items.length}`);
  console.log(`Já embeddados: ${existingMap.size}`);
  console.log(`Faltando: ${todo.length}`);

  const outItems = existing?.items?.length ? [...existing.items] : [];

  for (let start = 0; start < todo.length; start += BATCH_SIZE) {
    const batch = todo.slice(start, start + BATCH_SIZE);
    const input = batch.map((b) => b.text);

    const resp = await client.embeddings.create({
      model: EMBED_MODEL,
      input,
    });

    for (let i = 0; i < batch.length; i++) {
      const b = batch[i];
      const emb = resp.data[i].embedding;
      outItems.push({
        id: b.id,
        file: b.file,
        chunkIndex: b.chunkIndex,
        text: b.text,
        embedding: emb,
      });
    }

    console.log(`OK embeddings: ${Math.min(start + BATCH_SIZE, todo.length)}/${todo.length}`);
  }

  const payload = {
    createdAt: new Date().toISOString(),
    model: EMBED_MODEL,
    items: outItems,
  };

  await writeJson(OUT_FILE, payload);
  console.log(`Gerado: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("ERRO:", err?.message || err);
  process.exit(1);
});