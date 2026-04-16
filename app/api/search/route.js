// app/api/search/route.js
import { NextResponse } from "next/server";
import { hybridSearch } from "../../../lib/hybridSearch.js";

export async function POST(req) {
  try {
    const body = await req.json();
    const query = body?.query || "";
    const topK = body?.topK ?? 8;

    const results = await hybridSearch({ query, topK });
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}