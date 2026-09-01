#!/usr/bin/env node
/**
 * Sitemap submitter for DevStackIO.
 *
 * Responsibilities (in order):
 *   1. Fetch the live /sitemap.xml.
 *   2. Normalize it (strip <lastmod> so re-generated timestamps don't force
 *      re-submission; collapse whitespace) and hash with SHA-256.
 *   3. Compare the hash against the last persisted hash. If the sitemap
 *      content changed, or the last submission was more than
 *      SUBMISSION_INTERVAL_DAYS ago, submit.
 *   4. Submit per-URL to the IndexNow aggregator
 *      (https://api.indexnow.org/indexnow) in batches of up to 10,000 URLs.
 *      IndexNow is the only required notification path — Bing, Yandex,
 *      Seznam, Naver, Amazon, and Yep all participate in the protocol and
 *      receive each submission via the aggregator. Google is not part of
 *      IndexNow; register the sitemap manually in Search Console.
 *   5. Verify the IndexNow key file is reachable before posting (fails fast
 *      with a clear error instead of getting HTTP 422 from the aggregator).
 *   6. Persist state (hash + last submission date) to SITEMAP_STATE_PATH
 *      so the next run can skip unchanged sitemaps.
 *   7. Clean stale Next.js build cache for the sitemap route.
 *
 * Spec references:
 *   - https://www.indexnow.org/documentation
 *   - https://www.indexnow.org/faq
 *
 * State persistence:
 *   - Default path: <repo>/data/sitemap-state.json (gitignored).
 *   - Override with SITEMAP_STATE_PATH so the host can keep state across
 *     deploys (e.g. /var/www/tools/data/sitemap-state.json). The deploy
 *     workflow sets this so submissions aren't repeated on every deploy.
 *
 * Required env (only when actually submitting):
 *   - INDEXNOW_KEY  (8-128 chars, [A-Za-z0-9-]) — also auto-generates
 *     public/{KEY}.txt via scripts/prebuild.mjs for key verification.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://tools.devstackio.com";
const SITEMAP_URL = `${SITE_URL.replace(/\/+$/, "")}/sitemap.xml`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_MAX_URLS_PER_REQUEST = 10000;
const SUBMISSION_INTERVAL_DAYS = 5;
const FETCH_TIMEOUT_MS = 20000;
const USER_AGENT = "DevStackIO-SitemapSubmitter/1.0 (+https://tools.devstackio.com)";

const STATE_FILE = process.env.SITEMAP_STATE_PATH
  ? process.env.SITEMAP_STATE_PATH.trim()
  : join(ROOT, "data", "sitemap-state.json");

function log(...args) {
  console.log(...args);
}

function normalizeSitemap(xml) {
  return xml
    .replace(/<lastmod>[^<]*<\/lastmod>/gi, "")
    .replace(/<lastmod\s*\/>/gi, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

function extractUrls(xml) {
  // Tolerate optional attributes on <url> (e.g. <url xmlns="…">) and
  // self-closing <loc/>; only extract <loc>…</loc> bodies.
  const urls = [];
  const re = /<url\b[^>]*>([\s\S]*?)<\/url>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const body = m[1];
    const loc = body.match(/<loc[^>]*>([\s\S]*?)<\/loc>/i);
    if (loc) {
      const u = loc[1].trim();
      if (u) urls.push(u);
    }
  }
  return urls;
}

function computeHash(content) {
  return createHash("sha256").update(content).digest("hex");
}

function loadState() {
  try {
    const raw = readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      previousHash: typeof parsed.previousHash === "string" ? parsed.previousHash : null,
      currentHash: typeof parsed.currentHash === "string" ? parsed.currentHash : null,
      lastSubmissionDate: typeof parsed.lastSubmissionDate === "string" ? parsed.lastSubmissionDate : null,
      lastCheckedDate: typeof parsed.lastCheckedDate === "string" ? parsed.lastCheckedDate : null,
    };
  } catch {
    return { previousHash: null, currentHash: null, lastSubmissionDate: null, lastCheckedDate: null };
  }
}

function saveState(state) {
  const dir = dirname(STATE_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function daysSince(dateStr) {
  if (!dateStr) return Number.POSITIVE_INFINITY;
  const then = new Date(dateStr);
  if (Number.isNaN(then.getTime())) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - then.getTime()) / (1000 * 60 * 60 * 24));
}

async function fetchWithTimeout(url, { timeoutMs = FETCH_TIMEOUT_MS, accept = "*/*" } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: accept },
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function verifyIndexNowKey(key) {
  const keyLocation = `${SITE_URL.replace(/\/+$/, "")}/${key}.txt`;
  try {
    const res = await fetchWithTimeout(keyLocation, { accept: "text/plain" });
    if (!res.ok) {
      return { ok: false, keyLocation, reason: `HTTP ${res.status} ${res.statusText}` };
    }
    const body = (await res.text()).trim();
    if (body !== key) {
      return { ok: false, keyLocation, reason: `key file content mismatch (got ${body.slice(0, 16)}…)` };
    }
    return { ok: true, keyLocation };
  } catch (err) {
    return { ok: false, keyLocation, reason: err.message };
  }
}

async function postIndexNowBatch({ key, keyLocation, host, urls }) {
  const payload = { host, key, keyLocation, urlList: urls };
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } finally {
    clearTimeout(id);
  }
}

async function submitToIndexNow({ key, urls }) {
  const host = new URL(SITE_URL).host;
  const verification = await verifyIndexNowKey(key);
  if (!verification.ok) {
    return {
      skipped: true,
      reason: `key verification failed at ${verification.keyLocation}: ${verification.reason}`,
      batches: [],
    };
  }
  const keyLocation = verification.keyLocation;
  log(`  ✓ Key file verified at ${keyLocation}`);

  const batches = [];
  for (let i = 0; i < urls.length; i += INDEXNOW_MAX_URLS_PER_REQUEST) {
    batches.push(urls.slice(i, i + INDEXNOW_MAX_URLS_PER_REQUEST));
  }
  log(`  Submitting ${urls.length} URL(s) in ${batches.length} batch(es)…`);

  const results = [];
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const start = Date.now();
    try {
      const res = await postIndexNowBatch({ key, keyLocation, host, urls: batch });
      const ms = Date.now() - start;
      const accepted = res.status === 200 || res.status === 202;
      const body = await res.text().catch(() => "");
      const code = res.status;
      const note = code === 202 ? "accepted (key verification pending)" : res.statusText;
      if (accepted) {
        log(`    ✓ Batch ${i + 1}/${batches.length}: ${batch.length} URLs → HTTP ${code} (${ms}ms)${code === 202 ? ` — ${note}` : ""}`);
      } else {
        log(`    ✗ Batch ${i + 1}/${batches.length}: HTTP ${code} ${note} — ${body.slice(0, 200)}`);
      }
      results.push({ batch: i + 1, count: batch.length, code, accepted, ms });
    } catch (err) {
      const ms = Date.now() - start;
      log(`    ✗ Batch ${i + 1}/${batches.length}: ${err.message} (${ms}ms)`);
      results.push({ batch: i + 1, count: batch.length, code: 0, accepted: false, error: err.message, ms });
    }
    if (i + 1 < batches.length) {
      // Be polite to the aggregator; <10s pause is well below the documented
      // 429 threshold and gives the API room to breathe between batches.
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  const acceptedBatches = results.filter((r) => r.accepted).length;
  return {
    skipped: false,
    keyLocation,
    batches: results,
    totalUrls: urls.length,
    acceptedBatches,
    failedBatches: results.length - acceptedBatches,
  };
}

async function fetchSitemap() {
  // The query param only bypasses any HTTP cache between us and the origin.
  // Next.js App Router still serves the ISR-cached version (revalidate=86400),
  // so the hash check uses whatever the origin reports at the moment of
  // submission. If you need to force regeneration, trigger revalidation via
  // /api/revalidate before running this script.
  const cacheBusted = `${SITEMAP_URL}?cb=${Date.now()}`;
  log(`Fetching sitemap: ${SITEMAP_URL}`);
  const res = await fetchWithTimeout(cacheBusted, { accept: "application/xml,text/xml,*/*" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  if (!xml.includes("<urlset") || !xml.includes("</urlset>")) {
    throw new Error("Invalid sitemap: missing <urlset> tags");
  }
  const urlCount = (xml.match(/<url>/g) || []).length;
  const sizeKb = (xml.length / 1024).toFixed(1);
  log(`Sitemap fetched (${urlCount} <url> entries, ${sizeKb} KB)`);
  return { xml, urlCount };
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
    const entries = readdirSync(segDir);
    for (const entry of entries) {
      const fp = join(segDir, entry);
      const { size: fileSize } = statSync(fp);
      rmSync(fp, { recursive: true, force: true });
      removed++;
      size += fileSize;
    }
    rmSync(segDir, { recursive: true, force: true });
  }

  if (removed > 0) {
    log(`Cleaned ${removed} cached sitemap file(s) (${(size / 1024).toFixed(1)} KB freed)`);
  } else {
    log("No cached sitemap files to clean");
  }
}

function describeSkip(state, previousHash, currentHash, daysSinceLastSubmit) {
  if (!previousHash) return "first run";
  if (currentHash !== previousHash) return "content changed";
  if (daysSinceLastSubmit >= SUBMISSION_INTERVAL_DAYS) return `≥${SUBMISSION_INTERVAL_DAYS} days since last submission`;
  return `unchanged and only ${daysSinceLastSubmit} day(s) since last submission`;
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
  log(` State file: ${STATE_FILE}`);

  const state = loadState();

  let xml;
  let urlCount;
  try {
    ({ xml, urlCount } = await fetchSitemap());
  } catch (err) {
    log(`ERROR fetching sitemap: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const normalized = normalizeSitemap(xml);
  const currentHash = computeHash(normalized);
  const previousHash = state.currentHash || state.previousHash || null;
  const hasChanged = previousHash ? currentHash !== previousHash : true;

  // Preserve prior hash so we can render a stable diff; advance on save.
  state.previousHash = previousHash;
  state.currentHash = currentHash;
  state.lastCheckedDate = new Date().toISOString();

  const daysSinceLastSubmit = daysSince(state.lastSubmissionDate);
  const shouldSubmit = hasChanged || daysSinceLastSubmit >= SUBMISSION_INTERVAL_DAYS;

  log(bar);
  log(` URLs in sitemap: ${urlCount}`);
  log(` Previous hash: ${previousHash || "(none)"}`);
  log(` Current hash:  ${currentHash}`);
  log(` Content changed: ${hasChanged ? "YES" : "NO"}`);
  if (Number.isFinite(daysSinceLastSubmit)) {
    log(` Days since last submission: ${daysSinceLastSubmit}`);
  } else {
    log(` Days since last submission: never`);
  }
  log(` Decision: ${shouldSubmit ? "SUBMITTING" : `SKIPPING (${describeSkip(state, previousHash, currentHash, daysSinceLastSubmit)})`}`);

  if (shouldSubmit) {
    log(bar);
    log(` INDEXNOW (PRIMARY)`);
    log(bar);

    const key = process.env.INDEXNOW_KEY;
    let indexNowResult;
    if (!key) {
      log("  – IndexNow: skipped (set INDEXNOW_KEY to enable)");
      log("    Generate a key at https://www.indexnow.org/ (8-128 chars, [A-Za-z0-9-])");
      log("    prebuild.mjs will publish /<KEY>.txt for ownership verification");
      log("    The aggregator at api.indexnow.org forwards to Bing, Yandex, Seznam, Naver, Amazon, Yep");
      indexNowResult = { skipped: true, reason: "no INDEXNOW_KEY env var" };
    } else if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
      log(`  ✗ IndexNow: INDEXNOW_KEY is malformed (must be 8-128 chars of [A-Za-z0-9-])`);
      indexNowResult = { skipped: true, reason: "malformed INDEXNOW_KEY" };
    } else {
      const urls = extractUrls(xml);
      if (urls.length === 0) {
        log("  ✗ IndexNow: no <loc> URLs extracted from sitemap");
        indexNowResult = { skipped: true, reason: "no URLs" };
      } else if (urls.length !== urlCount) {
        // Continue but warn — usually a sign of malformed XML that survived
        // the <urlset> sanity check.
        log(`  ! Warning: extracted ${urls.length} <loc> URLs but counted ${urlCount} <url> entries`);
        indexNowResult = await submitToIndexNow({ key, urls });
      } else {
        indexNowResult = await submitToIndexNow({ key, urls });
      }
    }

    if (!indexNowResult.skipped) {
      state.lastSubmissionDate = new Date().toISOString();
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    log(bar);
    log(` SUMMARY`);
    log(bar);
    if (indexNowResult.skipped) {
      log(`  IndexNow: skipped (${indexNowResult.reason})`);
    } else {
      log(`  IndexNow: ${indexNowResult.acceptedBatches}/${indexNowResult.batches.length} batch(es) accepted (${indexNowResult.totalUrls} URL(s))`);
      if (indexNowResult.failedBatches > 0) {
        log(`  IndexNow failures: ${indexNowResult.failedBatches}`);
      }
    }
    log(`  Google: register sitemap manually at https://search.google.com/search-console`);
    log(`  Time: ${elapsed}s`);
  } else {
    const daysUntilNext = Number.isFinite(daysSinceLastSubmit)
      ? Math.max(0, SUBMISSION_INTERVAL_DAYS - daysSinceLastSubmit)
      : 0;
    log(` Next scheduled submission: ~${daysUntilNext} day(s) (or when sitemap content changes)`);
  }

  log(bar);
  log(` CLEANUP`);
  log(bar);
  await cleanCachedSitemap();

  saveState(state);
  log(bar);
  log(` State saved to ${STATE_FILE}`);
  log("");
}

main().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exitCode = 1;
});
