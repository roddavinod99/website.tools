import { NextResponse } from "next/server";

const HOSTNAME_RE = /^(?=.{1,253}$)(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,}$/;
const MAX_CACHE = 200;
const TTL_MS = 300_000;

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

function extractRegistrar(entities: unknown[]): string | undefined {
  for (const entity of entities) {
    if (!entity || typeof entity !== "object") continue;
    const { roles, vcardArray } = entity as { roles?: string[]; vcardArray?: unknown };
    if (!roles?.includes("registrar") || !Array.isArray(vcardArray) || !Array.isArray(vcardArray[1])) continue;
    for (const entry of vcardArray[1] as unknown[][]) {
      if (Array.isArray(entry) && entry[0] === "fn" && typeof entry[3] === "string") {
        return entry[3];
      }
    }
  }
  return undefined;
}

function findEventDate(events: unknown[], action: string): string | undefined {
  if (!Array.isArray(events)) return undefined;
  const event = events.find((e) => e && typeof e === "object" && (e as { eventAction?: string }).eventAction === action);
  if (!event) return undefined;
  const date = (event as { eventDate?: string }).eventDate;
  return typeof date === "string" ? date : undefined;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain || domain.length > 253) {
    return NextResponse.json({ error: "Valid domain is required" }, { status: 400 });
  }

  const trimmed = domain.trim().toLowerCase();

  if (!HOSTNAME_RE.test(trimmed)) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  const cacheKey = trimmed;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=300", "X-Cache": "HIT" },
    });
  }

  try {
    async function fetchRdap(): Promise<Response> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        return await fetch(`https://rdap.org/domain/${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          headers: { Accept: "application/rdap+json" },
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    // RDAP bootstrap can be slow on a cold connection — retry once on network failure.
    let res: Response;
    try {
      res = await fetchRdap();
    } catch {
      res = await fetchRdap();
    }

    if (res.status === 404) {
      const data = { found: false };
      evictStale();
      cache.set(cacheKey, { data, expires: Date.now() + TTL_MS });
      return NextResponse.json(data, {
        headers: { "Cache-Control": "public, max-age=300", "X-Cache": "MISS" },
      });
    }

    if (!res.ok) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 502 });
    }

    const raw = await res.json();
    const data = {
      found: true,
      registrar: extractRegistrar(Array.isArray(raw.entities) ? raw.entities : []),
      created: findEventDate(raw.events, "registration"),
      updated: findEventDate(raw.events, "last changed"),
      expires: findEventDate(raw.events, "expiration"),
      status: Array.isArray(raw.status) ? raw.status : [],
      nameservers: Array.isArray(raw.nameservers)
        ? raw.nameservers.map((ns: unknown) => {
            const ldhName = ns && typeof ns === "object" ? (ns as { ldhName?: string }).ldhName : undefined;
            return typeof ldhName === "string" ? ldhName : null;
          }).filter((n: string | null): n is string => n !== null)
        : [],
      dnssec: !!(raw.secureDNS && (raw.secureDNS as { delegationSigned?: boolean }).delegationSigned),
    };

    evictStale();
    cache.set(cacheKey, { data, expires: Date.now() + TTL_MS });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=300", "X-Cache": "MISS" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to lookup WHOIS data" }, { status: 500 });
  }
}