#!/usr/bin/env node

const { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, rmSync, readdirSync, statSync } = await import("fs");
const { join, dirname } = await import("path");
const { fileURLToPath } = await import("url");
const { createHash } = await import("crypto");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const STATE_FILE = join(ROOT, "data", "sitemap-state.json");
const LOG_FILE = join(ROOT, "data", "sitemap-submit.log");

const SITE_URL = process.env.SITE_URL || "https://tools.devstackio.com";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const SUBMISSION_INTERVAL_DAYS = 5;

const SEARCH_ENGINES = [
  {
    name: "Google",
    url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
    active: true,
    coverage: "Worldwide (largest index)",
  },
  {
    name: "Bing",
    url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
    active: true,
    coverage: "Worldwide (also powers Yahoo, DuckDuckGo, AOL)",
  },
  {
    name: "Yandex",
    url: `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
    active: true,
    coverage: "Russia & Eastern Europe",
  },
  {
    name: "Baidu",
    url: `https://www.baidu.com/s?wd=${encodeURIComponent(SITE_URL)}`,
    active: false,
    setup:
      "Requires verified Baidu Webmaster account (ziyuan.baidu.com). Add verification meta tag to <head> then use their API.",
  },
  {
    name: "Naver",
    url: null,
    active: false,
    setup:
      "Requires Naver Search Advisor account (searchadvisor.naver.com). Submit sitemap manually via their web interface.",
  },
  {
    name: "Seznam",
    url: null,
    active: false,
    setup:
      "Requires Seznam Webmaster account (webmaster.seznam.cz). Submit sitemap manually.",
  },
  {
    name: "Sogou",
    url: null,
    active: false,
    setup:
      "Requires Sogou站长平台 account (zhanzhang.sogou.com). Submit sitemap manually.",
  },
  {
    name: "IndexNow",
    url: null,
    active: !!process.env.INDEXNOW_KEY,
    setup:
      !process.env.INDEXNOW_KEY
        ? "Set INDEXNOW_KEY env var to enable. Generate key at indexnow.org and place /{key}.txt on server."
        : "Active — submits sitemap URL via IndexNow API (supported by Bing, Yandex, Seznam, Naver).",
  },
];

function log(...args) {
  const msg = `[${new Date().toISOString()}] ${args.join(" ")}`;
  console.log(msg);
  try {
    mkdirSync(join(ROOT, "data"), { recursive: true });
    appendFileSync(LOG_FILE, msg + "\n");
  } catch {}
}

function normalizeSitemap(xml) {
  return xml
    .replace(/<lastmod>[^<]*<\/lastmod>/gi, "")
    .replace(/<lastmod\s*\/>/gi, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

function computeHash(content) {
  return createHash("sha256").update(content).digest("hex");
}

function loadState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return {
      previousHash: null,
      currentHash: null,
      lastSubmissionDate: null,
      lastCheckedDate: null,
    };
  }
}

function saveState(state) {
  mkdirSync(join(ROOT, "data"), { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

async function fetchWithTimeout(url, timeoutMs = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function checkSitemapAccessible() {
  log(`Fetching sitemap: ${SITEMAP_URL}`);
  const res = await fetchWithTimeout(SITEMAP_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const xml = await res.text();
  if (!xml.includes("<urlset") || !xml.includes("</urlset>")) {
    throw new Error("Invalid sitemap: missing <urlset> tags");
  }
  const urlCount = (xml.match(/<url>/g) || []).length;
  const sizeKb = (xml.length / 1024).toFixed(1);
  log(`Sitemap accessible (${urlCount} URLs, ${sizeKb} KB)`);
  return { xml, urlCount };
}

async function submitToSearchEngines(engines) {
  let success = 0;
  let fail = 0;
  const results = [];

  for (const engine of engines) {
    if (!engine.active || !engine.url) {
      results.push({ name: engine.name, status: "skipped", detail: engine.setup || "No public ping endpoint" });
      continue;
    }
    try {
      log(`  Submitting to ${engine.name}...`);
      const res = await fetchWithTimeout(engine.url, 20000);
      if (res.status >= 200 && res.status < 400) {
        log(`  ✓ ${engine.name} accepted (HTTP ${res.status})`);
        results.push({ name: engine.name, status: "accepted", code: res.status });
        success++;
      } else {
        log(`  ✗ ${engine.name} returned HTTP ${res.status}`);
        results.push({ name: engine.name, status: "failed", code: res.status });
        fail++;
      }
    } catch (err) {
      log(`  ✗ ${engine.name} error: ${err.message}`);
      results.push({ name: engine.name, status: "error", detail: err.message });
      fail++;
    }
  }

  return { success, fail, results };
}

async function submitToIndexNow() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    log("  – IndexNow: skipped (no INDEXNOW_KEY set)");
    return { status: "skipped", detail: "No INDEXNOW_KEY env var" };
  }

  const host = new URL(SITE_URL).host;
  const payload = {
    host,
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: [SITEMAP_URL],
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
    "https://searchadvisor.naver.com/indexnow",
    "https://www.seznam.cz/indexnow",
  ];

  let successCount = 0;
  let failCount = 0;
  const results = [];

  for (const endpoint of endpoints) {
    try {
      log(`  → IndexNow (${new URL(endpoint).host})...`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      if (res.status >= 200 && res.status < 400) {
        log(`    ✓ ${new URL(endpoint).host} accepted (HTTP ${res.status})`);
        results.push({ host: new URL(endpoint).host, status: "accepted" });
        successCount++;
      } else {
        log(`    ✗ ${new URL(endpoint).host} returned HTTP ${res.status}`);
        results.push({ host: new URL(endpoint).host, status: "failed", code: res.status });
        failCount++;
      }
    } catch (err) {
      log(`    ✗ IndexNow (${new URL(endpoint).host}) error: ${err.message}`);
      results.push({ host: new URL(endpoint).host, status: "error", detail: err.message });
      failCount++;
    }
  }

  return { successCount, failCount, results };
}

async function triggerISR() {
  log("Triggering ISR revalidation (first fetch)...");
  try {
    const res = await fetchWithTimeout(SITEMAP_URL);
    const age = res.headers.get("age") || "?";
    log(`ISR trigger response: HTTP ${res.status}, Age: ${age}s`);
  } catch (err) {
    log(`ISR trigger warning: ${err.message} (continuing anyway)`);
  }
}

async function cleanCachedSitemap() {
  const cachePaths = [
    join(ROOT, ".next", "server", "app", "sitemap.xml.body"),
    join(ROOT, ".next", "server", "app", "sitemap.xml.meta"),
    join(ROOT, ".next", "server", "app", "sitemap.rsc"),
    join(ROOT, ".next", "server", "app", "sitemap.meta"),
    join(ROOT, ".next", "server", "app", "sitemap.html"),
  ];
  const segDir = join(ROOT, ".next", "server", "app", "sitemap.segments");

  let removed = 0;
  let size = 0;

  for (const fp of cachePaths) {
    if (existsSync(fp)) {
      const { size: fileSize } = statSync(fp);
      rmSync(fp);
      removed++;
      size += fileSize;
    }
  }
  if (existsSync(segDir)) {
    const files = readdirSync(segDir);
    for (const f of files) {
      const fp = join(segDir, f);
      const { size: fileSize } = statSync(fp);
      rmSync(fp);
      removed++;
      size += fileSize;
    }
    rmSync(segDir);
  }

  if (removed > 0) {
    log(`Cleaned ${removed} cached sitemap file(s) (${(size / 1024).toFixed(1)} KB freed)`);
  } else {
    log("No cached sitemap files to clean");
  }
}

async function main() {
  const start = Date.now();
  const bar = "=".repeat(60);

  log("");
  log(bar);
  log(` SMART SITEMAP SUBMITTER — ${new Date().toISOString()}`);
  log(bar);
  log(` Site: ${SITE_URL}`);
  log(` Sitemap: ${SITEMAP_URL}`);

  const state = loadState();

  // With ISR enabled (revalidate: 86400 in sitemap.ts), the sitemap auto-regenerates.
  // First fetch triggers background revalidation if the cached version is stale.
  // We wait a few seconds then fetch again for fresh content.
  await triggerISR();
  log("Waiting 5s for ISR regeneration...");
  await new Promise((r) => setTimeout(r, 5000));

  // Fetch the fresh sitemap
  let xml, urlCount;
  try {
    ({ xml, urlCount } = await checkSitemapAccessible());
  } catch (err) {
    log(`ERROR: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  // Normalize and hash
  const normalized = normalizeSitemap(xml);
  const currentHash = computeHash(normalized);
  const previousHash = state.currentHash || state.previousHash;

  const hasChanged = previousHash ? currentHash !== previousHash : true;

  // Update state
  state.previousHash = previousHash;
  state.currentHash = currentHash;
  state.lastCheckedDate = new Date().toISOString();

  // Decision logic
  const daysSinceLastSubmit = daysSince(state.lastSubmissionDate);
  const shouldSubmit = hasChanged || daysSinceLastSubmit >= SUBMISSION_INTERVAL_DAYS;

  log(bar);
  log(` URLs in sitemap: ${urlCount}`);
  log(` Previous hash: ${previousHash || "(none)"}`);
  log(` Current hash:  ${currentHash}`);
  log(` Content changed: ${hasChanged ? "YES" : "NO"}`);
  log(` Days since last submission: ${daysSinceLastSubmit}`);
  log(` Decision: ${shouldSubmit ? "SUBMITTING" : "SKIPPING (unchanged, <5 days)"}`);

  if (shouldSubmit) {
    log(bar);
    log(` SUBMITTING TO SEARCH ENGINES...`);
    log(bar);

    const activeEngines = SEARCH_ENGINES.filter((e) => e.active && e.name !== "IndexNow");
    const { success, fail, results } = await submitToSearchEngines(activeEngines);

    log(bar);
    log(` INDEXNOW`);
    log(bar);
    const indexNowResult = await submitToIndexNow();

    state.lastSubmissionDate = new Date().toISOString();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    log(bar);
    log(` SUMMARY`);
    log(bar);
    const totalActive = activeEngines.length + (process.env.INDEXNOW_KEY ? 1 : 0);
    const totalSuccess = success + (indexNowResult?.successCount || 0);
    log(`  Engines notified: ${totalSuccess}/${totalActive}`);
    if (fail > 0) log(`  Ping failures: ${fail}`);
    if (indexNowResult?.failCount > 0) log(`  IndexNow failures: ${indexNowResult.failCount}`);
    log(`  Inactive engines: ${SEARCH_ENGINES.filter((e) => !e.active).map((e) => e.name).filter((n) => n !== "IndexNow").join(", ")}`);
    log(`  Time: ${elapsed}s`);

    for (const r of results) {
      log(`  ${r.status === "accepted" ? "✓" : r.status === "skipped" ? "–" : "✗"} ${r.name}: ${r.status}${r.detail ? " (" + r.detail + ")" : ""}${r.code ? " (HTTP " + r.code + ")" : ""}`);
    }
    if (indexNowResult?.results) {
      for (const r of indexNowResult.results) {
        log(`  ${r.status === "accepted" ? "✓" : "✗"} IndexNow (${r.host}): ${r.status}${r.detail ? " (" + r.detail + ")" : ""}${r.code ? " (HTTP " + r.code + ")" : ""}`);
      }
    }
  } else {
    const daysUntilNext = SUBMISSION_INTERVAL_DAYS - daysSinceLastSubmit;
    log(` Next scheduled submission: ~${daysUntilNext} day(s) (or when sitemap content changes)`);
  }

  // Remove cached sitemap files — no need to keep old version on disk after verification
  log(bar);
  log(` CLEANUP`);
  log(bar);
  await cleanCachedSitemap();

  saveState(state);
  log(bar);
  log(` State saved to data/sitemap-state.json`);
  log(` Log saved to data/sitemap-submit.log`);
  log(bar);
  log("");
}

main().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exitCode = 1;
});
