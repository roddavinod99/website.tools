// Post-build script: computes SHA-256 hashes of every inline <script> and
// <style> block in the statically rendered HTML and emits:
//   1. data/csp-hashes.json          - route -> hashes map + per-route CSP
//   2. nginx/csp.generated.conf      - nginx `map $uri $csp` for Nginx CSP
//
// Runs automatically after `next build` (see package.json build script).
// Each route gets its own CSP containing only the hashes it needs, keeping
// each header well under Nginx/browser size limits.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SERVER_APP = join(ROOT, ".next", "server", "app");
const OUT_JSON = join(ROOT, "data", "csp-hashes.json");
const OUT_NGINX = join(ROOT, "nginx", "csp.generated.conf");

// External script sources allowed in script-src (third-party domains)
const EXTERNAL_SCRIPT_SOURCES = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://pagead2.googlesyndication.com",
  "https://googleads.g.doubleclick.net",
  "https://static.cloudflareinsights.com",
  "https://ep1.adtrafficquality.google",
  "https://ep2.adtrafficquality.google",
  "https://tpc.googlesyndication.com",
];

// Runtime script hashes: hashes of inline scripts injected by third-party
// scripts (GTM, GA, AdSense) at runtime. These are NOT present in the
// statically rendered HTML at build time, so they must be explicitly allowed.
// Values obtained from CSP violation reports on production.
const RUNTIME_SCRIPT_HASHES = [
  "'sha256-kRLMUXmOCgzW0BvF6scLq7v833betJPetxeEdIJQY6o='",
  "'sha256-sVHHUBEAsEdwrK4HuoxH+nrITuR2Sp1IGK69vwoVAwU='",
  "'sha256-YLw1nX2ugL49IzuzLvgrgG+JoZre2Z59qpDxGBbEbSk='",
];

const IMG_SOURCES = [
  "data:",
  "blob:",
  "https://www.google-analytics.com",
  "https://www.google.com",
  "https://www.google.co.in",
  "https://pagead2.googlesyndication.com",
  "https://googleads.g.doubleclick.net",
  "https://tpc.googlesyndication.com",
  "https://www.gstatic.com",
  "https://ep1.adtrafficquality.google",
  "https://ep2.adtrafficquality.google",
];

const CONNECT_SOURCES = [
  "https://www.google-analytics.com",
  "https://analytics.google.com",
  "https://pagead2.googlesyndication.com",
  "https://static.cloudflareinsights.com",
  "https://googleads.g.doubleclick.net",
  "https://stats.g.doubleclick.net",
  "https://www.gstatic.com",
  "https://ep1.adtrafficquality.google",
  "https://dns.google",
  "https://ip-api.com",
];

const FRAME_SOURCES = [
  "https://googleads.g.doubleclick.net",
  "https://tpc.googlesyndication.com",
  "https://www.google.com",
  "https://ep1.adtrafficquality.google",
  "https://ep2.adtrafficquality.google",
];

function sha256Base64(content) {
  return createHash("sha256").update(content, "utf8").digest("base64");
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (entry.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

const INLINE_SCRIPT_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const STYLE_RE = /<style[^>]*>([\s\S]*?)<\/style>/gi;

function extractHashes(html) {
  const scripts = new Set();
  const styles = new Set();
for (const match of html.matchAll(INLINE_SCRIPT_RE)) {
    scripts.add(`'sha256-${sha256Base64(match[1])}'`);
  }
  for (const match of html.matchAll(STYLE_RE)) {
    styles.add(`'sha256-${sha256Base64(match[1])}'`);
  }
  return { scripts: [...scripts].sort(), styles: [...styles].sort() };
}

// Routes whose client code compiles WebAssembly at runtime (wasm-bindgen via
// dynamic import). Compiling .wasm requires 'wasm-unsafe-eval'.
const WASM_ROUTES = new Set([
  "/tools/hash-generator",
  "/tools/md5-generator",
  "/tools/sha256-generator",
  "/tools/checksum",
  "/tools/file-checksum",
  "/toolkits/security-toolkit",
]);

// Routes whose client code uses JS eval() or new Function() at runtime.
// Currently only benchmark-builder uses new Function() in a Web Worker.
const EVAL_ROUTES = new Set([
  "/tools/benchmark-builder",
]);

function buildCsp(scriptHashes, styleHashes, includeWasm, includeEval) {
  const scriptSources = ["'self'", "'strict-dynamic'", ...scriptHashes, ...RUNTIME_SCRIPT_HASHES];
  if (includeWasm) scriptSources.push("'wasm-unsafe-eval'");
  if (includeEval) scriptSources.push("'unsafe-eval'");
  scriptSources.push(...EXTERNAL_SCRIPT_SOURCES);

  // Inline styles are allowed (React 19 injects runtime <style> elements that
  // cannot be pre-hashed); script-src remains strictly hash/nonce-locked.
  // 'strict-dynamic' allows nonce-validated scripts to load additional scripts
  // (e.g., Next.js RSC payload) without requiring their hashes in the policy.
  const styleSources = ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"];

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    `style-src ${styleSources.join(" ")}`,
    `img-src 'self' ${IMG_SOURCES.join(" ")}`,
    `connect-src 'self' ${CONNECT_SOURCES.join(" ")}`,
    "font-src 'self' https://fonts.gstatic.com",
    `frame-src 'self' ${FRAME_SOURCES.join(" ")}`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");
}

function toRouteKey(htmlPath) {
  let rel = relative(SERVER_APP, htmlPath).replace(/\\/g, "/");
  rel = rel.replace(/^index\.html$/, "").replace(/\/page\.html$/, "").replace(/\.html$/, "");
  return `/${rel}`.replace(/\/$/, "") || "/";
}

const htmlFiles = walk(SERVER_APP);

if (htmlFiles.length === 0) {
  console.error(
    "[postbuild-csp] ERROR: no static HTML files found in " +
      SERVER_APP +
      ". The build produced no statically rendered pages. " +
      "Confirm the root layout no longer depends on request headers."
  );
  process.exit(1);
}

const perRoute = {};
const allScripts = new Set();
const allStyles = new Set();

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf-8");
  const { scripts, styles } = extractHashes(html);
  const key = toRouteKey(file);
  const csp = buildCsp(scripts, styles, WASM_ROUTES.has(key), EVAL_ROUTES.has(key));
  perRoute[key] = { scripts, styles, csp };
  for (const s of scripts) allScripts.add(s);
  for (const s of styles) allStyles.add(s);
}

// Default CSP: covers error/not-found pages only (small), so any unknown URI
// that falls through to Node still renders its error page with working scripts.
const errorKeys = Object.keys(perRoute).filter(
  (k) => k.includes("_error") || k.includes("not-found") || k === "/_not-found"
);
const errorScripts = new Set();
const errorStyles = new Set();
for (const k of errorKeys) {
  for (const s of perRoute[k].scripts) errorScripts.add(s);
  for (const s of perRoute[k].styles) errorStyles.add(s);
}
const defaultCsp = buildCsp([...errorScripts].sort(), [...errorStyles].sort(), false, false);

const sortedScripts = [...allScripts].sort();
const sortedStyles = [...allStyles].sort();

// ─── nginx map $uri $csp ───
const mapLines = [
  "# AUTO-GENERATED by scripts/postbuild-csp.mjs — DO NOT EDIT.",
  `# Generated: ${new Date().toISOString()}`,
  `# Routes: ${htmlFiles.length} | script hashes: ${sortedScripts.length} | style hashes: ${sortedStyles.length}`,
  "# Per-route CSP keeps each header small; only WASM-using routes allow wasm-unsafe-eval.",
  "map $uri $csp {",
  `    default "${defaultCsp}";`,
  ...Object.keys(perRoute)
    .sort()
    .map((route) => `    "${route}" "${perRoute[route].csp}";`),
  "}",
  "",
];

mkdirSync(dirname(OUT_NGINX), { recursive: true });
mkdirSync(dirname(OUT_JSON), { recursive: true });

writeFileSync(OUT_NGINX, mapLines.join("\n"), "utf-8");
writeFileSync(
  OUT_JSON,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      routeCount: htmlFiles.length,
      scriptHashCount: sortedScripts.length,
      styleHashCount: sortedStyles.length,
      // Directive source lists consumed by src/middleware.ts to compose the
      // per-request nonce-based CSP (single source of truth lives here).
      policyInputs: {
        externalScriptSources: EXTERNAL_SCRIPT_SOURCES,
        imgSources: IMG_SOURCES,
        connectSources: CONNECT_SOURCES,
        frameSources: FRAME_SOURCES,
        wasmRoutes: [...WASM_ROUTES].sort(),
        evalRoutes: [...EVAL_ROUTES].sort(),
        runtimeScriptHashes: RUNTIME_SCRIPT_HASHES,
      },
      defaultCsp,
      perRoute,
    },
    null,
    2
  ),
  "utf-8"
);

const maxLen = Math.max(...Object.values(perRoute).map((r) => r.csp.length));
console.log(`[postbuild-csp] Scanned ${htmlFiles.length} static HTML files`);
console.log(`[postbuild-csp] ${sortedScripts.length} unique inline script hashes (global union)`);
console.log(`[postbuild-csp] ${sortedStyles.length} unique inline style hashes (global union)`);
console.log(`[postbuild-csp] Per-route CSP max length: ${maxLen} bytes (safe < 8KB limit)`);
console.log(`[postbuild-csp] Default (error pages) CSP length: ${defaultCsp.length} bytes`);
console.log(`[postbuild-csp] Wrote ${relative(ROOT, OUT_JSON)}`);
console.log(`[postbuild-csp] Wrote ${relative(ROOT, OUT_NGINX)}`);

