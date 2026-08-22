import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logSecurityEvent } from "@/lib/security-logger";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Force Node.js runtime to access fs for CSP hash map
export const runtime = "nodejs";

// CSP hash map (generated at build time by postbuild-csp.mjs)
// Lazy-loaded and cached per process; skipped gracefully if missing (e.g., dev before first build)
let cspMap: { defaultCsp: string; perRoute: Record<string, { csp: string }> } | null = null;

function loadCspMap(): { defaultCsp: string; perRoute: Record<string, { csp: string }> } | null {
  if (cspMap) return cspMap;
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const root = join(__dirname, "..", ".."); // from src/middleware.ts to repo root
    const cspPath = join(root, "data", "csp-hashes.json");
    if (!existsSync(cspPath)) return null;
    const content = readFileSync(cspPath, "utf-8");
    cspMap = JSON.parse(content);
    return cspMap;
  } catch {
    return null;
  }
}

function getCspForPath(pathname: string): string | null {
  const map = loadCspMap();
  if (!map) return null;
  // Skip CSP for API routes (they return JSON, not HTML)
  if (pathname.startsWith("/api/")) return null;
  // Normalize: strip query, strip trailing slash (except root)
  const normalized = pathname.split("?")[0].replace(/\/$/, "") || "/";
  return map.perRoute[normalized]?.csp ?? map.defaultCsp ?? null;
}

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

function addSecurityHeaders(response: NextResponse): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
}

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const path = getPath(request);
  const ua = request.headers.get("user-agent") || "";

  const response = NextResponse.next();

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
    addSecurityHeaders(retryResponse);
    return retryResponse;
  }

  addSecurityHeaders(response);

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin || referer;
  if (source) {
    try {
      const sourceHost = new URL(source).hostname;
      const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host");
      let expectedHost = "";
      if (hostHeader) {
        try {
          expectedHost = new URL(`http://${hostHeader}`).hostname;
        } catch {
          // fall through to request.url
        }
      }
      if (!expectedHost) {
        expectedHost = new URL(request.url).hostname;
      }
      if (sourceHost !== expectedHost && path.startsWith("/api/")) {
        await logSecurityEvent("invalid_origin", ip, path, `Cross-origin: ${sourceHost}`);
        const crossOriginResponse = new NextResponse(JSON.stringify({ error: "Request not allowed." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
        addSecurityHeaders(crossOriginResponse);
        return crossOriginResponse;
      }
    } catch {
      await logSecurityEvent("invalid_origin", ip, path, "Malformed origin header");
    }
  }

  // Add CSP header from generated hash map (skips API routes and static assets via matcher)
  const csp = getCspForPath(path);
  if (csp) {
    response.headers.set("Content-Security-Policy", csp);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|sw.js|manifest.webmanifest|llms.txt|security.txt|humans.txt).*)",
  ],
};