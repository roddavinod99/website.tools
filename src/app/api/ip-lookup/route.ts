import { NextResponse } from "next/server";
import { isIPv4 } from "net";

const MAX_CACHE = 200;
const TTL_MS = 300_000;

const PRIVATE_RANGES = [
  { start: ipToInt("10.0.0.0"), end: ipToInt("10.255.255.255") },
  { start: ipToInt("127.0.0.0"), end: ipToInt("127.255.255.255") },
  { start: ipToInt("169.254.0.0"), end: ipToInt("169.254.255.255") },
  { start: ipToInt("172.16.0.0"), end: ipToInt("172.31.255.255") },
  { start: ipToInt("192.168.0.0"), end: ipToInt("192.168.255.255") },
  { start: ipToInt("0.0.0.0"), end: ipToInt("0.255.255.255") },
  { start: ipToInt("100.64.0.0"), end: ipToInt("100.127.255.255") },
  { start: ipToInt("198.18.0.0"), end: ipToInt("198.19.255.255") },
  { start: ipToInt("240.0.0.0"), end: ipToInt("255.255.255.255") },
];

function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function isPrivateIP(ip: string): boolean {
  const int = ipToInt(ip);
  return PRIVATE_RANGES.some((r) => int >= r.start && int <= r.end);
}

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
  const ip = searchParams.get("ip");

  if (!ip || ip.length > 45) {
    return NextResponse.json({ error: "IP address is required" }, { status: 400 });
  }

  const trimmed = ip.trim();

  if (!isIPv4(trimmed)) {
    return NextResponse.json({ error: "Invalid IPv4 address format" }, { status: 400 });
  }

  if (isPrivateIP(trimmed)) {
    return NextResponse.json({ error: "Private IP addresses are not supported" }, { status: 400 });
  }

  const cacheKey = trimmed;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=300", "X-Cache": "HIT" },
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://ip-api.com/json/${encodeURIComponent(trimmed)}?fields=status,message,country,regionName,city,zip,lat,lon,isp,org,as,query`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream IP service error" }, { status: 502 });
    }

    const data = await res.json();
    evictStale();
    cache.set(cacheKey, { data, expires: Date.now() + TTL_MS });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=300", "X-Cache": "MISS" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to lookup IP" }, { status: 500 });
  }
}
