import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAX_ENTRIES = 10_000;

interface RateEntry {
  count: number;
  reset: number;
}

const rateLimitMap = new Map<string, RateEntry>();

function evictStale() {
  if (rateLimitMap.size < MAX_ENTRIES) return;
  const now = Math.floor(Date.now() / 1000);
  const toDelete: string[] = [];
  for (const [key, entry] of rateLimitMap) {
    if (entry.reset < now) toDelete.push(key);
  }
  for (const key of toDelete) rateLimitMap.delete(key);
  if (rateLimitMap.size >= MAX_ENTRIES) {
    let oldest = Infinity;
    let oldestKey: string | null = null;
    for (const [key, entry] of rateLimitMap) {
      if (entry.reset < oldest) { oldest = entry.reset; oldestKey = key; }
    }
    if (oldestKey) rateLimitMap.delete(oldestKey);
  }
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

  const isSubmit = path === "/api/submit";
  const isContact = path === "/api/contact";
  const windowMs = 60;
  const maxRequests = isSubmit ? 5 : isContact ? 3 : 100;

  const key = `${ip}:${path}:${process.env.pm_id || "0"}`;
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

// Report-Only CSP - won't block, only reports violations
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://www.google-analytics.com https://pagead2.googlesyndication.com https://www.googletagmanager.com",
  "frame-src https://www.google.com https://pagead2.googlesyndication.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

function addSecurityHeaders(response: NextResponse) {
  // Report-Only CSP (won't block, only reports violations)
  response.headers.set("Content-Security-Policy-Report-Only", cspReportOnly);

  // Other security headers (enforced)
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "on");

  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (!process.env.DISABLE_RATE_LIMIT && request.nextUrl.pathname.startsWith("/api/")) {
    const retryAfter = isRateLimited(request);
    if (retryAfter) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": retryAfter } }
      );
    }
  }

  // Add security headers to all responses
  return addSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|json|txt)).*)"],
};
