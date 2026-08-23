import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logSecurityEvent } from "@/lib/security-logger";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Force Node.js runtime to access fs for CSP hash map
export const runtime = "nodejs";

// Policy inputs emitted by scripts/postbuild-csp.mjs at build time.
interface CspPolicyInputs {
  externalScriptSources: string[];
  imgSources: string[];
  connectSources: string[];
  frameSources: string[];
  wasmRoutes: string[];
  evalRoutes: string[];
}

interface CspRouteEntry {
  scripts: string[];
  styles: string[];
  csp: string;
}

// CSP hash map (generated at build time by postbuild-csp.mjs)
// Lazy-loaded and cached per process; skipped gracefully if missing (e.g., dev before first build)
let cspMap: { defaultCsp: string; policyInputs?: CspPolicyInputs; perRoute: Record<string, CspRouteEntry> } | null =
  null;

// Fallbacks mirroring scripts/postbuild-csp.mjs, used only if data/csp-hashes.json
// cannot be loaded (e.g., dev before first build).
const FALLBACK_POLICY_INPUTS: CspPolicyInputs = {
  externalScriptSources: [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://pagead2.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
    "https://static.cloudflareinsights.com",
    "https://ep1.adtrafficquality.google",
    "https://ep2.adtrafficquality.google",
    "https://tpc.googlesyndication.com",
  ],
  imgSources: [],
  connectSources: [],
  frameSources: [],
  wasmRoutes: [],
  evalRoutes: [],
};

function loadCspMap(): {
  defaultCsp: string;
  policyInputs?: CspPolicyInputs;
  perRoute: Record<string, CspRouteEntry>;
} | null {
  if (cspMap) return cspMap;
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    // In standalone output the middleware runs from the standalone root (where server.js lives)
    // and the data folder is copied to ./data. In development the compiled middleware lives
    // under .next/server/... and the repo root is two levels up. Try both locations.
    const candidates = [
      join(__dirname, "data", "csp-hashes.json"),          // standalone root / data
      join(__dirname, "..", "..", "data", "csp-hashes.json"), // dev build output
      join(process.cwd(), "data", "csp-hashes.json"),      // fallback to CWD
    ];
    for (const cspPath of candidates) {
      if (existsSync(/* turbopackIgnore: true */ cspPath)) {
        const content = readFileSync(/* turbopackIgnore: true */ cspPath, "utf-8");
        cspMap = JSON.parse(content);
        return cspMap;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Per-request nonce for script-src. Next.js reads the CSP header from the
// request (forwarded below) and automatically applies this nonce to every
// <script> tag it renders — including the streamed RSC bootstrap/payload
// scripts (self.__next_f.push, $RC/$RB runtime) whose content varies per
// request, which a build-time hash allowlist can never cover.
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function normalizeRoutePath(pathname: string): string {
  return pathname.split("?")[0].replace(/\/$/, "") || "/";
}

// Builds a nonce-based CSP. Build-time inline-script hashes are kept as an
// additional allowlist layer; the nonce is what makes hydration work for
// dynamically rendered responses.
function buildNonceCsp(nonce: string, pathname: string): string {
  const map = loadCspMap();
  const normalized = normalizeRoutePath(pathname);
  const route = map?.perRoute[normalized];
  const inputs = map?.policyInputs ?? FALLBACK_POLICY_INPUTS;

  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    ...(route?.scripts ?? []),
    ...inputs.externalScriptSources,
  ];
  if (inputs.wasmRoutes.includes(normalized)) scriptSources.push("'wasm-unsafe-eval'");
  if (inputs.evalRoutes.includes(normalized)) scriptSources.push("'unsafe-eval'");

  // Styles: React 19 hoists/injects <style> elements at runtime whose content
  // cannot be pre-hashed, so style-src allows inline styles. Script execution
  // remains strictly locked down via nonce + hashes; CSS injection cannot run
  // JavaScript, and exfiltration channels are covered by img/connect-src.
  const styleSources = ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"];

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    `style-src ${styleSources.join(" ")}`,
    `img-src 'self' ${inputs.imgSources.join(" ")}`,
    `connect-src 'self' ${inputs.connectSources.join(" ")}`,
    "font-src 'self' https://fonts.gstatic.com",
    `frame-src 'self' ${inputs.frameSources.join(" ")}`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");
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
  "X-Frame-Options": "DENY",
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

  // Add CSP header (skips API routes and static assets via matcher).
  // Skipped in development: Turbopack dev injects inline scripts with unstable
  // content and the nonce would not cover scripts rendered before middleware
  // state is warm, so CSP is only enforced for production builds.
  if (process.env.NODE_ENV !== "development" && !path.startsWith("/api/")) {
    const nonce = generateNonce();
    const csp = buildNonceCsp(nonce, path);

    // Forward the CSP header (and a plain nonce) on the REQUEST so Next.js SSR
    // picks it up and stamps the nonce onto every script it renders. This is
    // the officially supported Next.js CSP pattern.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("content-security-policy", csp);

    const nonceResponse = NextResponse.next({ request: { headers: requestHeaders } });
    nonceResponse.headers.set("Content-Security-Policy", csp);
    addSecurityHeaders(nonceResponse);
    return nonceResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|sw.js|manifest.webmanifest|llms.txt|security.txt|humans.txt).*)",
  ],
};