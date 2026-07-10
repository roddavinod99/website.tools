import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAX_ENTRIES = 10_000;

interface RateEntry {
  count: number;
  reset: number;
}

// In-memory rate limit map — shared state is per-process only.
// In multi-instance/serverless deployments, each instance has independent state,
// so rate limiting is ineffective. For production with multiple replicas, use a
// reverse proxy (Cloudflare, Nginx) or a shared store (Upstash/Redis) instead.
// Set DISABLE_RATE_LIMIT=true env var to bypass entirely behind a reverse proxy.
const rateLimitMap = new Map<string, RateEntry>();

function evictStale() {
  if (rateLimitMap.size < MAX_ENTRIES) return;
  const now = Math.floor(Date.now() / 1000);
  let oldest = Infinity;
  let oldestKey: string | null = null;
  for (const [key, entry] of rateLimitMap) {
    if (entry.reset < now) { rateLimitMap.delete(key); continue; }
    if (entry.reset < oldest) { oldest = entry.reset; oldestKey = key; }
  }
  if (rateLimitMap.size >= MAX_ENTRIES && oldestKey) rateLimitMap.delete(oldestKey);
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function isRateLimited(request: NextRequest): string | null {
  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;
  const now = Math.floor(Date.now() / 1000);

  const isSubmission = path === "/api/submit";
  const windowMs = isSubmission ? 60 : 60;
  const maxRequests = isSubmission ? 5 : 100;

  const key = `${ip}:${path}`;
  const entry = rateLimitMap.get(key);

  if (!entry || entry.reset < now) {
    evictStale();
    rateLimitMap.set(key, { count: 1, reset: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    return String(entry.reset - now);
  }

  entry.count++;
  return null;
}

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Powered-By", "DevStackIO");

  if (!process.env.DISABLE_RATE_LIMIT && request.nextUrl.pathname.startsWith("/api/")) {
    const retryAfter = isRateLimited(request);
    if (retryAfter) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": retryAfter } }
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|json|txt)).*)"],
};
