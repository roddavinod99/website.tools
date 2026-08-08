import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logSecurityEvent } from "@/lib/security-logger";

const ATTACK_PATHS = [
  "/.env",
  "/.git",
  "/.htaccess",
  "/wp-admin",
  "/wp-login",
  "/phpmyadmin",
  "/adminer",
  "/config.php",
  "/.well-known",
  "/server-status",
];

const ALLOWED_WELL_KNOWN_PATHS = ["/.well-known/security.txt", "/.well-known/ai-plugin.json"];

const TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /%2e%2e/i,
  /\.\.%2f/i,
  /\.\.%5c/i,
];

const BOT_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /zap/i,
  /burp/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
];

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function getPath(request: NextRequest): string {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "unknown";
  }
}

function isAttackPath(path: string): boolean {
  const lower = path.toLowerCase();
  return ATTACK_PATHS.some((p) => lower.includes(p.toLowerCase()));
}

function hasPathTraversal(path: string): boolean {
  return TRAVERSAL_PATTERNS.some((p) => p.test(path));
}

function isSuspiciousUserAgent(ua: string): boolean {
  return BOT_UA_PATTERNS.some((p) => p.test(ua));
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

const RATE_LIMIT_CONFIG = {
  "/api/contact": { limit: 3, window: 60_000 },
  "/api/submit": { limit: 5, window: 60_000 },
  "/api/": { limit: 60, window: 60_000 },
  default: { limit: 100, window: 60_000 },
};

const rateLimitStore = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string, path: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const config = Object.entries(RATE_LIMIT_CONFIG).find(([key]) => path.startsWith(key))?.[1] || RATE_LIMIT_CONFIG.default;
  const key = `${ip}:${path}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.reset) {
    rateLimitStore.set(key, { count: 1, reset: now + config.window });
    return { allowed: true };
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.reset - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

function addSecurityHeaders(response: NextResponse, nonce: string): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://static.cloudflareinsights.com https://ep1.adtrafficquality.google https://tpc.googlesyndication.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "img-src 'self' data: blob: https://www.google-analytics.com https://www.google.com https://www.google.co.in https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.gstatic.com",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://static.cloudflareinsights.com https://googleads.g.doubleclick.net https://stats.g.doubleclick.net https://www.gstatic.com https://ep1.adtrafficquality.google https://dns.google https://ip-api.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
}

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const path = getPath(request);
  const ua = request.headers.get("user-agent") || "";
  const nonce = generateNonce();

  const response = NextResponse.next();
  response.headers.set("x-middleware-nonce", nonce);

  const isAllowedWellKnown = ALLOWED_WELL_KNOWN_PATHS.some((p) => path === p);

  if (!isAllowedWellKnown && isAttackPath(path)) {
    logSecurityEvent("path_traversal_attempt", ip, path, "Attack path blocked");
    return new NextResponse("Not Found", { status: 404 });
  }

  if (hasPathTraversal(path)) {
    await logSecurityEvent("path_traversal_attempt", ip, path, "Path traversal attempt");
    return new NextResponse("Bad Request", { status: 400 });
  }

  if (isSuspiciousUserAgent(ua)) {
    await logSecurityEvent("malicious_request", ip, path, `Suspicious UA: ${ua}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  const rateLimit = checkRateLimit(ip, path);
  if (!rateLimit.allowed) {
    await logSecurityEvent("rate_limit_violation", ip, path, "Rate limit exceeded");
    const retryResponse = new NextResponse(JSON.stringify({ error: "Too many requests. Please try again later." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
    if (rateLimit.retryAfter) {
      retryResponse.headers.set("Retry-After", String(rateLimit.retryAfter));
    }
    addSecurityHeaders(retryResponse, nonce);
    return retryResponse;
  }

  addSecurityHeaders(response, nonce);

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin || referer;
  if (source) {
    try {
      const sourceHost = new URL(source).hostname;
      const expectedHost = new URL(request.url).hostname;
      if (sourceHost !== expectedHost && path.startsWith("/api/")) {
        await logSecurityEvent("invalid_origin", ip, path, `Cross-origin: ${sourceHost}`);
        const crossOriginResponse = new NextResponse(JSON.stringify({ error: "Request not allowed." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
        addSecurityHeaders(crossOriginResponse, nonce);
        return crossOriginResponse;
      }
    } catch {
      await logSecurityEvent("invalid_origin", ip, path, "Malformed origin header");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|sw.js|manifest.webmanifest|llms.txt|security.txt|humans.txt).*)",
  ],
};