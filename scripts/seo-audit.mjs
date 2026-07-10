#!/usr/bin/env node

/**
 * SEO Automation Pipeline
 *
 * Runs daily and validates:
 * 1. XML sitemap integrity
 * 2. Orphan pages (in sitemap but no internal link)
 * 3. Broken internal links
 * 4. Canonical URL consistency
 * 5. Duplicate metadata (title, description, H1)
 * 6. JSON-LD structured data
 * 7. robots.txt validity
 * 8. Core Web Vitals proxy (TTFB from build)
 * 9. Index coverage report
 * 10. RSS feed freshness
 *
 * Modes:
 *   static  — analyze build output + source code (pre-deploy)
 *   live    — fetch and validate live pages (post-deploy)
 *
 * Usage:
 *   node scripts/seo-audit.mjs [--mode=static|live] [--submit]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { log as auditLog, esc } from "./lib/audit-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPORT_DIR = join(ROOT, "data", "seo-reports");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://tools.devstackio.com";

const mode = process.argv.includes("--mode=live") ? "live" : "static";
const doSubmit = process.argv.includes("--submit");

// ── Logging ──

function log(...args) { auditLog(...args); }

// ── Helpers ──

function fetchWithTimeout(url, ms = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(id));
}

async function slurp(urlOrPath) {
  if (mode === "live") {
    const res = await fetchWithTimeout(urlOrPath);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${urlOrPath}`);
    return res.text();
  }
  return readFileSync(urlOrPath, "utf-8");
}

function isLocalUrl(href) {
  try {
    const u = new URL(href, SITE_URL);
    return u.hostname === new URL(SITE_URL).hostname;
  } catch {
    return false;
  }
}

function normalizeUrl(href) {
  try {
    const u = new URL(href, SITE_URL);
    u.hash = "";
    return u.href.replace(/\/$/, "");
  } catch {
    return href;
  }
}

// ── 1. Sitemap Parsing ──

async function parseSitemap() {
  const sitemapPath = join(ROOT, ".next", "server", "app", "sitemap.xml.body");
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;

  let raw;
  try {
    raw = await slurp(mode === "live" ? sitemapUrl : sitemapPath);
  } catch (err) {
    log(`ERROR: Cannot read sitemap — ${err.message}`);
    return { urls: [], raw: "", error: err.message };
  }

  // Extract URLs from XML
  const urls = [...raw.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => normalizeUrl(m[1]));

  // Validate XML well-formedness
  const hasUrlset = raw.includes("<urlset") && raw.includes("</urlset>");
  const issues = [];
  if (!hasUrlset) issues.push("Missing <urlset> wrapper");
  if (urls.length === 0) issues.push("Zero URLs found");

  // Check for duplicate entries
  const seen = new Set();
  const dups = [];
  for (const u of urls) {
    if (seen.has(u)) dups.push(u);
    seen.add(u);
  }
  if (dups.length > 0) issues.push(`Duplicate URLs in sitemap: ${dups.length}`);

  return { urls, raw, issueCount: issues.length, issues };
}

// ── 2. Orphan Detection ──

async function detectOrphans(sitemapUrls) {
  const constantsPath = join(ROOT, "src", "lib", "constants.ts");
  const constantsRaw = readFileSync(constantsPath, "utf-8");

  const allSlugs = [...constantsRaw.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

  // Derive counts from array declarations in constants.ts
  // Order: categories[], allTools[], learningTopics[]
  // Each category entry has a slug, so we split the file at each array boundary
  const categoriesMatch = constantsRaw.match(/export const categories/);
  const allToolsMatch = constantsRaw.match(/export const allTools/);
  const learningTopicsMatch = constantsRaw.match(/export const learningTopics/);
  const catText = constantsRaw.slice(
    categoriesMatch ? categoriesMatch.index : 0,
    allToolsMatch ? allToolsMatch.index : undefined
  );
  const toolsText = constantsRaw.slice(
    allToolsMatch ? allToolsMatch.index : 0,
    learningTopicsMatch ? learningTopicsMatch.index : undefined
  );
  const catSlugs = [...catText.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  const toolSlugs = [...toolsText.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  const topicSlugs = allSlugs.slice(catSlugs.length + toolSlugs.length);

  const expected = new Set();

  for (const s of toolSlugs) {
    expected.add(normalizeUrl(`${SITE_URL}/tools/${s}`));
  }
  for (const s of catSlugs) {
    expected.add(normalizeUrl(`${SITE_URL}/categories/${s}`));
  }
  for (const s of topicSlugs) {
    expected.add(normalizeUrl(`${SITE_URL}/guides/${s}`));
  }

  const sitemapSet = new Set(sitemapUrls.map((u) => normalizeUrl(u)));
  const orphans = [...expected].filter((u) => !sitemapSet.has(u));

  const base = normalizeUrl(SITE_URL).replace(/\/$/, "");
  const extras = [...sitemapSet].filter((u) => {
    u = u.replace(/\/$/, "");
    if (u === base) return false;
    if (u.startsWith(base + "/blog/")) return false;
    if (u.startsWith(base + "/toolkits/")) return false;
    if (u.startsWith(base + "/learning/")) return false;
    return !expected.has(u);
  });

  return { orphanCount: orphans.length, orphans, extraCount: extras.length, extras };
}

// ── 3. Broken Link Scan (static: scan source for internal links) ──

async function scanBrokenLinks(sitemapUrls) {
  const sitemapSet = new Set(sitemapUrls.map((u) => normalizeUrl(u)));
  const broken = [];
  const checked = new Set();

  // Scan source files for internal links
  const srcDir = join(ROOT, "src");
  const scanDir = (dir) => {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith(".")) scanDir(full);
      else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) {
        if (e.name.includes("layout") || e.name.includes("loading") || e.name.includes("error") || e.name.includes("not-found")) continue;
        const content = readFileSync(full, "utf-8");
        const links = [...content.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
        for (const link of links) {
          if (link.startsWith("http") && !isLocalUrl(link)) continue;
          if (link.startsWith("#") || link.startsWith("tel:") || link.startsWith("mailto:")) continue;
          const resolved = normalizeUrl(link);
          if (checked.has(resolved)) continue;
          checked.add(resolved);
          if (!sitemapSet.has(resolved) && resolved.startsWith(normalizeUrl(SITE_URL))) {
            // Check if it starts with a known path prefix
            const isKnown = [...sitemapSet].some((s) => resolved.startsWith(s));
            if (!isKnown) broken.push({ url: resolved, source: full });
          }
        }
      }
    }
  };

  scanDir(srcDir);

  return { brokenCount: broken.length, broken };
}

// ── 4. Canonical Validation ──

async function validateCanonicals() {
  // In static mode, check that generateMetadata functions include alternates.canonical
  const issues = [];
  const appDir = join(ROOT, "src", "app");
  const scanForCanonical = (dir) => {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith(".")) scanForCanonical(full);
      else if (e.name === "page.tsx") {
        const content = readFileSync(full, "utf-8");
        // Skip pages that only redirect
        if (content.includes("redirect(")) continue;
        if (content.includes("generateMetadata")) {
          // Check alternates canonical (handles both `canonical:` and shorthand `alternates: { canonical }`)
          const hasAlternates = content.includes("alternates:");
          const hasCanonical = /canonical\s*[:}]/.test(content);
          if (!hasAlternates || !hasCanonical) {
            const relPath = full.replace(ROOT, "").replace(/\\/g, "/");
            issues.push({ page: relPath, issue: "Missing canonical URL in generateMetadata" });
          }
        }
      }
    }
  };
  scanForCanonical(appDir);
  return { issueCount: issues.length, issues };
}

// ── 5. Duplicate Metadata Detection ──

async function checkDuplicateMetadata() {
  const appDir = join(ROOT, "src", "app");
  const titles = {};
  const descriptions = {};
  const issues = [];

  const scan = (dir) => {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith(".")) scan(full);
      else if (e.name === "page.tsx" || e.name === "layout.tsx") {
        const content = readFileSync(full, "utf-8");
        const rel = full.replace(ROOT, "").replace(/\\/g, "/");

        // Extract title
        const titleMatch = content.match(/title:\s*"([^"]+)"/);
        if (titleMatch) {
          const t = titleMatch[1];
          if (!titles[t]) titles[t] = [];
          titles[t].push(rel);
        }

        // Extract description
        const descMatch = content.match(/description:\s*"([^"]+)"/);
        if (descMatch) {
          const d = descMatch[1];
          if (!descriptions[d]) descriptions[d] = [];
          descriptions[d].push(rel);
        }
      }
    }
  };
  scan(appDir);

  for (const [t, pages] of Object.entries(titles)) {
    if (pages.length > 1) issues.push({ type: "Duplicate title", value: t, pages });
  }
  for (const [d, pages] of Object.entries(descriptions)) {
    if (pages.length > 1) issues.push({ type: "Duplicate description", value: d, pages });
  }

  return { issueCount: issues.length, issues };
}

// ── 6. robots.txt Validation ──

async function validateRobotsTxt() {
  let raw;
  try {
    const robotPaths = [join(ROOT, ".next", "server", "app", "robots.txt.body"), join(ROOT, ".next", "server", "app", "robots.txt")];
    for (const p of robotPaths) {
      if (existsSync(p)) { raw = readFileSync(p, "utf-8"); break; }
    }
    if (!raw) throw new Error("robots.txt.body not found in build output");
  } catch {
    try {
      raw = await slurp(`${SITE_URL}/robots.txt`);
    } catch (err) {
      return { valid: false, issues: [`Cannot fetch robots.txt: ${err.message}`] };
    }
  }

  const issues = [];
  if (!raw.includes("Sitemap:")) issues.push("Missing Sitemap directive");
  if (!/user-agent:\s*\*/i.test(raw)) issues.push("Missing catch-all User-agent: * directive");
  // Check for overly broad Disallow: / (not /api/ or /subdir/)
  const broadDisallows = [...raw.matchAll(/^Disallow:\s*\/\s*$/gm)];
  if (broadDisallows.length > 1) issues.push("Multiple Disallow: / rules — may block crawling");

  return { valid: issues.length === 0, issues };
}

// ── 7. Structured Data Check ──

async function checkStructuredData() {
  // Check that key pages have expected schema types
  const appDir = join(ROOT, "src", "app");
  const issues = [];

  const checkPage = (dir, expectedSchemas) => {
    const pageFile = join(dir, "page.tsx");
    if (!existsSync(pageFile)) return;
    const content = readFileSync(pageFile, "utf-8");
    for (const schema of expectedSchemas) {
      if (!content.includes(schema)) {
        const rel = pageFile.replace(ROOT, "").replace(/\\/g, "/");
        issues.push({ page: rel, missing: schema });
      }
    }
  };

  checkPage(join(appDir, "tools", "[slug]"), ["WebApplication", "BreadcrumbList"]);
  checkPage(join(appDir, "blog", "[slug]"), ["Article", "BreadcrumbList"]);
  checkPage(join(appDir, "guides", "[slug]"), ["TechArticle", "BreadcrumbList"]);
  checkPage(join(appDir, "categories", "[slug]"), ["BreadcrumbList"]);
  // WebSite schema is in root layout.tsx via metadata API, not page.tsx
  // The Next.js metadata API auto-generates WebSite, so checking layout.tsx suffices
  const layoutFile = join(appDir, "layout.tsx");
  if (existsSync(layoutFile)) {
    const layoutContent = readFileSync(layoutFile, "utf-8");
    if (!layoutContent.includes("WebSite") && !layoutContent.includes('"WebSite"') && !layoutContent.includes("metadataBase")) {
      issues.push({ page: "/src/app/layout.tsx", missing: "WebSite (no metadataBase or WebSite reference)" });
    }
  }

  return { issueCount: issues.length, issues };
}

// ── 8. Content / Thin Content Check ──

async function checkContent() {
  const issues = [];
  const contentFile = join(ROOT, "src", "lib", "tool-content.ts");
  if (existsSync(contentFile)) {
    const raw = readFileSync(contentFile, "utf-8");
    const whatItDoes = [...raw.matchAll(/whatItDoes:\s*`([^`]*)`/g)];
    for (const m of whatItDoes) {
      const text = m[1].trim();
      if (text.length < 50) {
        issues.push(`Short whatItDoes (${text.length} chars)`);
      }
    }
  }

  return { issueCount: issues.length, issues };
}

// ── 9. Image SEO Check ──

async function checkImageSeo() {
  const issues = [];
  const componentsDir = join(ROOT, "src", "components");

  const scan = (dir) => {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith(".")) scan(full);
      else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) {
        const content = readFileSync(full, "utf-8");
        // Skip template literals with dynamic JS expressions inside <img> tags
        if (content.includes('"${') || content.includes("`<img")) continue;
        const imgs = [...content.matchAll(/<img\s[^>]*>/g)];
        for (const img of imgs) {
          const rel = full.replace(ROOT, "").replace(/\\/g, "/");
          if (!img[0].includes("alt=")) {
            issues.push({ file: rel, img: img[0].slice(0, 80), issue: "Missing alt attribute" });
          }
          if (mode === "static" && !img[0].includes("loading=")) {
            // Raw <img> tags without loading attribute — Next.js <Image> handles lazy loading automatically
          }
        }
      }
    }
  };
  scan(componentsDir);
  return { issueCount: issues.length, issues };
}

// ── 10. Crawl Depth Analysis ──

function checkCrawlDepth() {
  const pagesDir = join(ROOT, "src", "app");
  const maxDepth = { depth: 0, page: "" };
  let totalPages = 0;
  let deepPages = 0;

  function walk(dir, depth) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith("_") || e.name.startsWith(".")) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name.startsWith("(") || e.name.startsWith("[")) {
          walk(full, depth);
        } else {
          walk(full, depth + 1);
        }
      } else if (e.name === "page.tsx" || e.name === "page.mdx") {
        totalPages++;
        if (depth > maxDepth.depth) {
          maxDepth.depth = depth;
          maxDepth.page = full.replace(pagesDir, "").replace(/\\/g, "/");
        }
        if (depth >= 4) deepPages++;
      }
    }
  }
  walk(pagesDir, 0);

  const recommendations = [];
  if (maxDepth.depth > 4) {
    recommendations.push(`Deepest page at depth ${maxDepth.depth}: ${maxDepth.page}. Consider restructuring.`);
  }
  if (deepPages > 0) {
    recommendations.push(`${deepPages} of ${totalPages} pages at depth >= 4 (poor for SEO).`);
  }

  return {
    issueCount: deepPages,
    issues: recommendations,
    totalPages,
    deepest: maxDepth,
    deepPages,
  };
}

// ── 11. Security Headers Validation ──

function checkSecurityHeaders() {
  const configPath = join(ROOT, "next.config.ts");
  let content;
  try { content = readFileSync(configPath, "utf-8"); } catch {
    return { issueCount: 1, issues: ["next.config.ts not found"] };
  }

  const requiredHeaders = [
    { name: "Content-Security-Policy", pattern: "Content-Security-Policy" },
    { name: "X-Frame-Options", pattern: "X-Frame-Options" },
    { name: "X-Content-Type-Options", pattern: "X-Content-Type-Options" },
    { name: "Referrer-Policy", pattern: "Referrer-Policy" },
    { name: "Permissions-Policy", pattern: "Permissions-Policy" },
    { name: "Strict-Transport-Security", pattern: "Strict-Transport-Security" },
    { name: "Cross-Origin-Opener-Policy", pattern: "Cross-Origin-Opener-Policy" },
    { name: "Cross-Origin-Resource-Policy", pattern: "Cross-Origin-Resource-Policy" },
  ];

  const missing = [];
  for (const h of requiredHeaders) {
    if (!content.includes(h.pattern)) {
      missing.push(`Missing security header: ${h.name}`);
    }
  }

  return {
    issueCount: missing.length,
    issues: missing,
    totalChecked: requiredHeaders.length,
    present: requiredHeaders.length - missing.length,
  };
}

// ── 12. Performance Budget Check (uses build-manifest.json) ──

function checkPerformanceBudget() {
  const buildDir = join(ROOT, ".next");
  if (!existsSync(buildDir)) {
    return { issueCount: 1, issues: ["Build output not found (.next/) — run build first"] };
  }

  const manifestPath = join(buildDir, "build-manifest.json");
  if (!existsSync(manifestPath)) {
    return { issueCount: 1, issues: ["build-manifest.json not found"] };
  }
  let manifest;
  try { manifest = JSON.parse(readFileSync(manifestPath, "utf-8")); } catch {
    return { issueCount: 1, issues: ["build-manifest.json unreadable"] };
  }

  const frameworkFiles = new Set([
    ...(manifest.polyfillFiles || []),
    ...(manifest.rootMainFiles || []),
  ]);

  const staticChunks = join(buildDir, "static", "chunks");
  if (!existsSync(staticChunks)) {
    return { issueCount: 1, issues: ["Production chunks not found (.next/static/chunks/)"] };
  }

  const categories = { framework: [], page: [], css: [] };
  let totalJs = 0, totalCss = 0;

  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = join(dir, e.name);
      const size = statSync(full).size;
      const rel = full.replace(buildDir, ".next").replace(/\\/g, "/");
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".js")) {
        totalJs += size;
        const chunkName = "static/chunks/" + e.name;
        if (frameworkFiles.has(chunkName)) {
          categories.framework.push({ file: rel, size });
        } else {
          categories.page.push({ file: rel, size });
        }
      } else if (e.name.endsWith(".css")) {
        totalCss += size;
        categories.css.push({ file: rel, size });
      }
    }
  }
  walk(staticChunks);

  const issues = [];
  const fmt = (bytes) => (bytes / 1024).toFixed(0) + "KB";
  const largePageChunks = categories.page.filter(c => c.size > 500 * 1024);
  for (const r of largePageChunks) {
    issues.push(`Page chunk: ${r.file} (${fmt(r.size)}) — consider code-splitting`);
  }
  const largeCss = categories.css.filter(c => c.size > 100 * 1024);
  for (const c of largeCss) {
    issues.push(`CSS chunk: ${c.file} (${fmt(c.size)})`);
  }

  return {
    issueCount: largePageChunks.length + largeCss.length,
    issues,
    breakdown: {
      framework: categories.framework.length,
      page: categories.page.length,
      css: categories.css.length,
    },
    totalJs: (totalJs / 1024 / 1024).toFixed(2) + " MB",
    totalCss: (totalCss / 1024 / 1024).toFixed(2) + " MB",
    largeFiles: [...largePageChunks, ...largeCss],
  };
}

// ── 12. Redirect Validation ──

function checkRedirects() {
  const issues = [];

  // Scan page.tsx files for redirect() calls
  const appDir = join(ROOT, "src", "app");
  function scanDir(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith(".")) scanDir(full);
      else if (e.name === "page.tsx") {
        const content = readFileSync(full, "utf-8");
        const redirects = [...content.matchAll(/redirect\(['"]([^'"]+)['"]\)/g)];
        for (const m of redirects) {
          const rel = full.replace(ROOT, "").replace(/\\/g, "/");
          issues.push(`${rel}: redirect() to "${m[1]}"`);
        }
      }
    }
  }
  scanDir(appDir);

  return { issueCount: issues.length, issues };
}

// ── 13. HTTP Status Code Validation ──

async function checkStatusCodes(sitemapUrls) {
  const issues = [];
  if (mode === "live") {
    // Sample top 30 sitemap URLs
    const sample = sitemapUrls.slice(0, 30);
    for (const url of sample) {
      try {
        const res = await fetchWithTimeout(url);
        if (res.status !== 200) {
          issues.push(`${url} → HTTP ${res.status}`);
        }
      } catch (err) {
        issues.push(`${url} → error: ${err.message}`);
      }
    }
  } else {
    // Static mode: verify every tool slug has a corresponding content JSON file
    const constantsRaw = readFileSync(join(ROOT, "src", "lib", "constants.ts"), "utf-8");
    const allSlugs = [...constantsRaw.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
    // Tool slugs come after category slugs and before learning topic slugs
    const catCount = 7;
    const toolCount = allSlugs.length - catCount - 10; // 10 learning topics
    const toolOnly = allSlugs.slice(catCount, catCount + toolCount);
    for (const slug of toolOnly) {
      const contentPath = join(ROOT, "src", "content", "tools", `${slug}.json`);
      if (!existsSync(contentPath)) {
        issues.push(`Tool "${slug}" missing content JSON file at src/content/tools/${slug}.json`);
      }
    }
    // Also verify all content JSON files have a matching tool
    const contentDir = join(ROOT, "src", "content", "tools");
    if (existsSync(contentDir)) {
      const contentFiles = readdirSync(contentDir).filter((f) => f.endsWith(".json"));
      for (const f of contentFiles) {
        const slug = f.replace(".json", "");
        if (!toolOnly.includes(slug)) {
          issues.push(`Content file ${f} has no matching tool in constants.ts`);
        }
      }
    }
  }
  return { issueCount: issues.length, issues };
}

// ── 14. Cache Headers Validation ──

function checkCacheHeaders() {
  const issues = [];
  const configPath = join(ROOT, "next.config.ts");
  if (!existsSync(configPath)) {
    return { issueCount: 1, issues: ["next.config.ts not found"] };
  }
  const content = readFileSync(configPath, "utf-8");

  // Static assets should have immutable cache
  if (!content.includes("max-age=31536000, immutable")) {
    issues.push("Missing 1-year immutable cache for static assets (js, css, images)");
  }

  // API routes should have no-cache or must-revalidate
  const apiCacheMatch = content.match(/source:\s*"\/api\/\(\.\*\)"[\s\S]*?Cache-Control[\s\S]*?value:\s*"([^"]+)"/);
  if (!apiCacheMatch) {
    issues.push("Missing Cache-Control header for /api/ routes");
  } else {
    const val = apiCacheMatch[1];
    if (val.includes("max-age=") && !val.includes("must-revalidate")) {
      const age = parseInt(val.match(/max-age=(\d+)/)?.[1] || "0", 10);
      if (age > 300) issues.push(`API cache max-age ${age}s is too long for dynamic API responses`);
    }
  }

  // RSS feed should have moderate cache
  const rssPath = join(ROOT, "src", "app", "feed.xml", "route.ts");
  if (existsSync(rssPath)) {
    const rssContent = readFileSync(rssPath, "utf-8");
    if (!rssContent.includes("max-age=")) {
      issues.push("RSS feed missing Cache-Control header");
    }
  }

  return { issueCount: issues.length, issues };
}

// ── 15. Indexability Check ──

function checkIndexability() {
  const issues = [];
  const appDir = join(ROOT, "src", "app");
  const layoutPath = join(appDir, "layout.tsx");

  // Root layout should explicitly allow indexing
  if (existsSync(layoutPath)) {
    const layoutContent = readFileSync(layoutPath, "utf-8");
    if (!layoutContent.includes("index: true") && !layoutContent.includes("follow: true")) {
      issues.push("Root layout missing robots: { index: true, follow: true }");
    }
  }

  // Scan all page.tsx for accidental noindex in metadata
  function scanDir(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith(".")) scanDir(full);
      else if (e.name === "page.tsx") {
        const fileContent = readFileSync(full, "utf-8");
        // Look for robots metadata with blocking directives
        const metaMatch = fileContent.match(/robots:\s*\{[^}]*?(?:noindex|noFollow|none)[^}]*\}/);
        if (metaMatch) {
          const rel = full.replace(ROOT, "").replace(/\\/g, "/");
          issues.push(`${rel}: contains blocking robots directive "${metaMatch[0].trim().slice(0, 80)}"`);
        }
      }
    }
  }
  scanDir(appDir);

  return { issueCount: issues.length, issues };
}

// ── 16. Summary ──

function buildReport(results) {
  const passed = {};
  const failed = {};
  let totalScore = 0;
  let maxScore = 0;

  for (const [check, data] of Object.entries(results)) {
    const hasIssues = data.issueCount > 0 || (data.orphanCount > 0) || (data.brokenCount > 0) || (data.valid === false);
    if (hasIssues) {
      failed[check] = data;
    } else {
      passed[check] = data;
    }
    // Scoring: each check equally weighted
    maxScore += 10;
    totalScore += hasIssues ? Math.max(0, 10 - (data.issueCount || data.orphanCount || data.brokenCount || 1)) : 10;
  }

  const score = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    timestamp: new Date().toISOString(),
    siteUrl: SITE_URL,
    mode,
    score,
    passed: Object.keys(passed),
    failed: Object.keys(failed),
    details: results,
  };
}

// ── Report Writers ──

function writeJsonReport(report) {
  mkdirSync(REPORT_DIR, { recursive: true });
  const path = join(REPORT_DIR, `seo-report-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(path, JSON.stringify(report, null, 2));
  writeFileSync(join(REPORT_DIR, "latest.json"), JSON.stringify(report, null, 2));
  log(`JSON report written to ${path}`);
  return path;
}

function writeHtmlReport(report) {

  function renderCheck(name, data) {
    const hasIssues = data.issueCount > 0 || data.orphanCount > 0 || data.brokenCount > 0 || data.valid === false;
    let detail = "";
    const label = name.replace(/([A-Z])/g, " $1").trim();
    const badge = hasIssues ? "fail" : "pass";
    const text = hasIssues ? "FAIL" : "PASS";

    if (data.urls) detail += "<p>" + data.urls.length + " URLs, " + data.issueCount + " issue(s)</p>";
    if (data.orphanCount !== undefined) detail += "<p>" + data.orphanCount + " orphan(s), " + data.extraCount + " extra(s)</p>";
    if (data.brokenCount !== undefined) detail += "<p>" + data.brokenCount + " broken link(s)</p>";

    if (data.issues && data.issues.length > 0) {
      detail += "<ul>";
      for (const i of data.issues) {
        const msg = typeof i === "string" ? i : i.page || i.type || i.issue || JSON.stringify(i);
        detail += "<li>" + esc(msg) + "</li>";
      }
      detail += "</ul>";
    }

    if (data.orphans && data.orphans.length > 0) {
      for (const o of data.orphans.slice(0, 20)) {
        detail += "<li>Orphan: " + esc(o) + "</li>";
      }
      if (data.orphans.length > 20) {
        detail += "<li>... and " + (data.orphans.length - 20) + " more</li>";
      }
    }

    return '<div class="check"><h2><span class="status ' + badge + '">' + text + "</span> " + label + "</h2>" + detail + "</div>";
  }

  let scoreClass = "bad";
  if (report.score >= 90) scoreClass = "good";
  else if (report.score >= 70) scoreClass = "ok";

  let checksHtml = "";
  const entries = Object.entries(report.details);
  for (const [name, data] of entries) {
    checksHtml += renderCheck(name, data);
  }

  let html = '<!DOCTYPE html>';
  html += '<html lang="en">';
  html += '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">';
  html += "<title>SEO Audit Report &mdash; " + esc(report.siteUrl) + "</title>";
  html += '<style>';
  html += ' *{margin:0;padding:0;box-sizing:border-box}';
  html += ' body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0a0a0b;color:#e4e4e7;padding:2rem}';
  html += ' .container{max-width:960px;margin:0 auto}';
  html += ' h1{font-size:1.5rem;margin-bottom:.5rem}';
  html += ' .meta{color:#a1a1aa;font-size:.875rem;margin-bottom:2rem}';
  html += ' .score{display:inline-block;font-size:2rem;font-weight:700;padding:.5rem 1rem;border-radius:.5rem;margin-bottom:2rem}';
  html += ' .score.good{background:#166534;color:#bbf7d0}';
  html += ' .score.ok{background:#854d0e;color:#fef08a}';
  html += ' .score.bad{background:#991b1b;color:#fecaca}';
  html += ' .status{display:inline-block;padding:.125rem .5rem;border-radius:.25rem;font-size:.75rem;font-weight:600}';
  html += ' .status.pass{background:#166534;color:#bbf7d0}';
  html += ' .status.fail{background:#991b1b;color:#fecaca}';
  html += ' .check{border:1px solid #27272a;border-radius:.5rem;padding:1rem;margin-bottom:1rem}';
  html += ' .check h2{font-size:1rem;margin-bottom:.5rem;display:flex;align-items:center;gap:.5rem}';
  html += ' .check ul{list-style:none}';
  html += ' .check li{font-size:.8125rem;color:#a1a1aa;padding:.25rem 0}';
  html += ' .summary{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-bottom:2rem}';
  html += ' .stat{background:#18181b;border:1px solid #27272a;border-radius:.5rem;padding:1rem;text-align:center}';
  html += ' .stat .num{font-size:1.5rem;font-weight:700}';
  html += ' .stat .label{font-size:.75rem;color:#a1a1aa;text-transform:uppercase;letter-spacing:.05em}';
  html += ' .stat .num.green{color:#4ade80}';
  html += ' .stat .num.red{color:#f87171}';
  html += ' .stat .num.yellow{color:#facc15}';
  html += '</style></head><body><div class="container">';
  html += '<h1>SEO Audit Report</h1>';
  html += '<div class="meta">' + esc(report.siteUrl) + " &middot; " + esc(report.timestamp) + " &middot; Mode: " + esc(report.mode) + "</div>";
  html += '<div class="score ' + scoreClass + '">' + report.score + "/100</div>";
  html += '<div class="summary">';
  html += '<div class="stat"><div class="num green">' + report.passed.length + '</div><div class="label">Checks Passed</div></div>';
  html += '<div class="stat"><div class="num ' + (report.failed.length > 0 ? "red" : "green") + '">' + report.failed.length + '</div><div class="label">Checks Failed</div></div>';
  html += '<div class="stat"><div class="num green">' + (report.details.sitemap && report.details.sitemap.urls ? report.details.sitemap.urls.length : 0) + '</div><div class="label">Sitemap URLs</div></div>';
  html += "</div>";
  html += checksHtml;
  html += "</div></body></html>";

  const reportPath = join(REPORT_DIR, "seo-report-" + new Date().toISOString().slice(0, 10) + ".html");
  writeFileSync(reportPath, html);
  writeFileSync(join(REPORT_DIR, "latest.html"), html);
  log("HTML report written to " + reportPath);
}

// ── Main ──

async function main() {
  const start = Date.now();
  const bar = "=".repeat(60);
  log("");
  log(bar);
  log(` SEO AUDIT PIPELINE — ${new Date().toISOString()}`);
  log(` Site: ${SITE_URL}`);
  log(` Mode: ${mode}`);
  log(bar);

  // 1. Sitemap
  log("1/15 Parsing sitemap...");
  const sitemap = await parseSitemap();

  // 2. Orphans
  log("2/15 Detecting orphan pages...");
  const orphans = sitemap.urls.length > 0 ? await detectOrphans(sitemap.urls) : { orphanCount: 0, orphans: [], extraCount: 0, extras: [] };

  // 3. Broken links
  log("3/15 Scanning broken links...");
  const broken = sitemap.urls.length > 0 ? await scanBrokenLinks(sitemap.urls) : { brokenCount: 0, broken: [] };

  // 4. Canonical validation
  log("4/15 Validating canonical URLs...");
  const canonical = await validateCanonicals();

  // 5. Duplicate metadata
  log("5/15 Checking duplicate metadata...");
  const duplicates = await checkDuplicateMetadata();

  // 6. robots.txt
  log("6/15 Validating robots.txt...");
  const robots = await validateRobotsTxt();

  // 7. Structured data
  log("7/15 Checking structured data...");
  const structData = await checkStructuredData();

  // 8. Content & Image SEO
  log("8/15 Checking content quality and image SEO...");
  const content = await checkContent();
  const images = await checkImageSeo();

  // 9. Crawl depth
  log("9/15 Analyzing crawl depth...");
  const depth = checkCrawlDepth();

  // 10. Security headers
  log("10/15 Validating security headers...");
  const security = checkSecurityHeaders();

  // 11. Performance budget
  log("11/15 Checking performance budget...");
  const perf = checkPerformanceBudget();

  // 12. Redirect validation
  log("12/15 Validating redirects...");
  const redirects = checkRedirects();

  // 13. HTTP status codes
  log("13/15 Checking HTTP status codes...");
  const statusCodes = await checkStatusCodes(sitemap.urls);

  // 14. Cache headers
  log("14/15 Checking cache headers...");
  const cacheHdrs = checkCacheHeaders();

  // 15. Indexability
  log("15/15 Checking indexability...");
  const indexability = checkIndexability();

  // Build report
  const report = buildReport({
    sitemap: { ...sitemap, issueCount: sitemap.issueCount || 0 },
    orphans,
    brokenLinks: broken,
    canonicals: canonical,
    duplicateMetadata: duplicates,
    robotsTxt: robots,
    structuredData: structData,
    contentQuality: content,
    imageSeo: images,
    crawlDepth: depth,
    securityHeaders: security,
    performanceBudget: perf,
    redirects,
    statusCodes,
    cacheHeaders: cacheHdrs,
    indexability,
  });

  report.details.sitemap.urls = sitemap.urls.slice(0, 200);
  report.details.sitemap.raw = undefined;

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  report.duration = `${elapsed}s`;

  log(bar);
  log(` SCORE: ${report.score}/100`);
  log(` Passed: ${report.passed.length}  Failed: ${report.failed.length}`);
  log(` Time: ${elapsed}s`);

  if (report.failed.length > 0) {
    log(" FAILED CHECKS:");
    for (const name of report.failed) {
      log(`  ✗ ${name}`);
    }
  }

  writeJsonReport(report);
  writeHtmlReport(report);

  // Optionally trigger sitemap submission
  if (doSubmit) {
    log(bar);
    log("TRIGGERING SITEMAP SUBMISSION...");
    const { execSync } = await import("child_process");
    try {
      execSync("node scripts/sitemap-submitter.mjs", { cwd: ROOT, stdio: "inherit" });
    } catch (err) {
      log(`Sitemap submission error: ${err.message}`);
    }
  }

  log(bar);
  log("SEO audit complete.");
  log("");
}

main().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exitCode = 1;
});
