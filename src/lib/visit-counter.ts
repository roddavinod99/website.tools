import { appendFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

const DEFAULT_SESSION_MINUTES = 30;
const DEFAULT_BURST_WINDOW_MS = 3000;

export const VISIT_COOKIE = "_dsio_visit";

export function resolveLogPath(): string {
  const configured = process.env.VISIT_COUNTER_PATH;
  if (configured && configured.trim()) return configured.trim();
  return join(process.cwd(), "data", "visit-counter", "visits.jsonl");
}

const LOG_PATH = resolveLogPath();

let cache: { count: number; size: number } | null = null;

function fileSize(): number {
  try {
    return statSync(/*turbopackIgnore: true*/ LOG_PATH).size;
  } catch {
    return 0;
  }
}

function countLines(): number {
  try {
    const data = readFileSync(/*turbopackIgnore: true*/ LOG_PATH, "utf8");
    let count = 0;
    for (const char of data) {
      if (char === "\n") count++;
    }
    return count;
  } catch {
    return 0;
  }
}

/**
 * Total number of recorded visits. Cached in memory and reconciled against
 * the file size so concurrent appends from other processes are picked up.
 */
export function getVisitCount(): number {
  const size = fileSize();
  if (cache && cache.size === size) return cache.count;
  const count = countLines();
  cache = { count, size };
  return count;
}

/**
 * Append one visit to the log (atomic O_APPEND write) and return the new total.
 * Safe to call concurrently from multiple PM2 cluster processes: each line is a
 * single write() so lines never interleave, and the cached total is invalidated
 * whenever another process appends while we write.
 */
export function recordVisit(): number {
  const line = `{"ts":"${new Date().toISOString()}"}\n`;
  const before = fileSize();
  mkdirSync(dirname(LOG_PATH), { recursive: true });
  appendFileSync(/*turbopackIgnore: true*/ LOG_PATH, line, "utf8");
  const after = fileSize();
  if (cache && cache.size === before && after - before === Buffer.byteLength(line, "utf8")) {
    cache = { count: cache.count + 1, size: after };
  } else {
    cache = null;
  }
  return getVisitCount();
}

export function getSessionMinutes(): number {
  const raw = process.env.VISIT_SESSION_MINUTES;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SESSION_MINUTES;
}

export function getBurstWindowMs(): number {
  const raw = process.env.VISIT_BURST_MS;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_BURST_WINDOW_MS;
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * In-memory anti-double-count window for simultaneous new visits from the same
 * IP (e.g. several tabs opened at once before the session cookie is set).
 * Transient and never persisted or logged.
 */
const recentNewVisits = new Map<string, number>();

export function isBurstDuplicate(key: string, now = Date.now()): boolean {
  const windowMs = getBurstWindowMs();
  if (windowMs <= 0) return false;
  const last = recentNewVisits.get(key);
  if (last !== undefined && now - last < windowMs) return true;
  recentNewVisits.set(key, now);
  if (recentNewVisits.size > 500) {
    for (const [k, t] of recentNewVisits) {
      if (now - t > windowMs) recentNewVisits.delete(k);
    }
  }
  return false;
}

/**
 * Multi-layer bot detection. Never counts requests from crawlers, scrapers,
 * headless browsers, or scripted clients while still allowing them to load pages.
 */
const BOT_UA_PATTERN =
  /(bot|crawler|spider|scraper|crawl|headless|selenium|playwright|puppeteer|phantom|curl|wget|python-requests|axios|httpclient|okhttp|googlebot|adsbot|bingbot|bingpreview|facebookexternalhit|twitterbot|semrushbot|ahrefsbot|mj12bot|dotbot|yandexbot|baiduspider)/i;

export function isBotRequest(userAgent: string, headers?: Headers): boolean {
  const ua = (userAgent || "").trim();
  if (!ua) return true;
  if (BOT_UA_PATTERN.test(ua)) return true;
  if (headers) {
    const fetchSite = headers.get("sec-fetch-site");
    if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite.toLowerCase())) {
      return true;
    }
  }
  return false;
}
