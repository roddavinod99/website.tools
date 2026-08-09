import { NextResponse } from "next/server";

const MAX_CACHE = 5;
const TTL_MS = 600_000;
const FALLBACK_URL = "https://api.frankfurter.app/latest?from=USD";
const PRIMARY_URL = "https://open.er-api.com/v6/latest/USD";

interface CacheEntry {
  data: unknown;
  expires: number;
}

// Exchange rates are global and change slowly, so all currencies are cached
// together for 10 minutes and shared across every request. This is the one
// approved exception to the browser-only rule (see AGENTS.md).
const cache = new Map<string, CacheEntry>();

function evictStale() {
  if (cache.size < MAX_CACHE) return;
  const now = Date.now();
  let oldest = Infinity;
  let oldestKey: string | null = null;
  for (const [key, entry] of cache) {
    if (entry.expires < now) { cache.delete(key); continue; }
    if (entry.expires < oldest) { oldest = entry.expires; oldestKey = key; }
  }
  if (cache.size >= MAX_CACHE && oldestKey) cache.delete(oldestKey);
}

async function fetchRates(): Promise<CacheEntry> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  const parse = (url: string): Promise<{ rates?: Record<string, number>; base_code?: string; base?: string }> =>
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      });

  try {
    const body = (await parse(PRIMARY_URL).catch(() => null)) ?? (await parse(FALLBACK_URL));
    const rates = body?.rates ?? {};
    const base = (body?.base_code ?? body?.base ?? "USD") as string;
    if (Object.keys(rates).length === 0) throw new Error("empty rates");

    return {
      data: { base, rates, updatedAt: new Date().toISOString() },
      expires: Date.now() + TTL_MS,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "public, max-age=600", "X-Cache": "MISS" };

export async function GET() {
  const cacheKey = "all";
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=600", "X-Cache": "HIT" },
    });
  }

  try {
    const entry = await fetchRates();
    evictStale();
    cache.set(cacheKey, entry);
    return NextResponse.json(entry.data, { headers });
  } catch {
    return NextResponse.json({ error: "Failed to load currency rates" }, { status: 502 });
  }
}