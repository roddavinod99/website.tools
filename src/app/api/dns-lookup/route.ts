import { NextResponse } from "next/server";

const HOSTNAME_RE = /^(?=.{1,253}$)(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,}$/;
const MAX_CACHE = 200;
const TTL_MS = 60_000;

interface CacheEntry {
  data: unknown;
  expires: number;
}

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

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  const type = searchParams.get("type") || "A";

  if (!domain || domain.length > 253) {
    return NextResponse.json({ error: "Valid domain is required" }, { status: 400 });
  }

  if (!HOSTNAME_RE.test(domain)) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  const allowedTypes = new Set(["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "SRV", "PTR"]);
  if (!allowedTypes.has(type)) {
    return NextResponse.json({ error: "Invalid DNS record type" }, { status: 400 });
  }

  const cacheKey = `${domain}:${type}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=60", "X-Cache": "HIT" },
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
      { signal: controller.signal, headers: { Accept: "application/dns-json" } }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream DNS service error" }, { status: 502 });
    }

    const data = await res.json();
    evictStale();
    cache.set(cacheKey, { data, expires: Date.now() + TTL_MS });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=60", "X-Cache": "MISS" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to lookup DNS" }, { status: 500 });
  }
}
