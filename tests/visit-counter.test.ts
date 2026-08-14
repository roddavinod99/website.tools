import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let dir: string;
let logPath: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "visit-counter-"));
  logPath = join(dir, "visits.jsonl");
  process.env.VISIT_COUNTER_PATH = logPath;
  process.env.VISIT_BURST_MS = "3000";
  delete process.env.VISIT_SESSION_MINUTES;
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

async function load() {
  vi.resetModules();
  return await import("@/lib/visit-counter");
}

const HUMAN_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

describe("visit counter storage", () => {
  it("returns 0 for a missing or empty file", async () => {
    const m = await load();
    expect(m.getVisitCount()).toBe(0);
  });

  it("recordVisit increments and returns the new total", async () => {
    const m = await load();
    expect(m.recordVisit()).toBe(1);
    expect(m.recordVisit()).toBe(2);
    expect(m.getVisitCount()).toBe(2);
  });

  it("persists across module reloads (survives a restart)", async () => {
    const m1 = await load();
    m1.recordVisit();
    m1.recordVisit();
    expect(m1.getVisitCount()).toBe(2);

    const m2 = await load();
    expect(m2.getVisitCount()).toBe(2);
  });

  it("picks up appends made by another process", async () => {
    const m = await load();
    expect(m.recordVisit()).toBe(1);

    writeFileSync(logPath, '{"ts":"2026-08-14T00:00:00.000Z"}\n', { flag: "a" });
    expect(m.getVisitCount()).toBe(2);
  });

  it("does not lose updates when two module instances append alternately", async () => {
    const a = await load();
    const b = await load();

    for (let i = 0; i < 10; i++) {
      a.recordVisit();
      b.recordVisit();
    }

    const fresh = await load();
    expect(fresh.getVisitCount()).toBe(20);
  });

  it("writes one JSON line per visit", async () => {
    const m = await load();
    m.recordVisit();
    m.recordVisit();
    const data = readFileSync(logPath, "utf8").trim().split("\n");
    expect(data).toHaveLength(2);
    for (const line of data) {
      const parsed = JSON.parse(line) as { ts: string };
      expect(typeof parsed.ts).toBe("string");
      expect(Number.isNaN(Date.parse(parsed.ts))).toBe(false);
    }
  });

  it("session length defaults to 30 minutes and honors the env var", async () => {
    const m = await load();
    expect(m.getSessionMinutes()).toBe(30);
    process.env.VISIT_SESSION_MINUTES = "45";
    expect(m.getSessionMinutes()).toBe(45);
    process.env.VISIT_SESSION_MINUTES = "abc";
    expect(m.getSessionMinutes()).toBe(30);
  });
});

describe("burst duplicate detection", () => {
  it("deduplicates new visits from the same key within the window", async () => {
    const m = await load();
    expect(m.isBurstDuplicate("k", 1000)).toBe(false);
    expect(m.isBurstDuplicate("k", 2000)).toBe(true);
    expect(m.isBurstDuplicate("k", 5000)).toBe(false);
  });

  it("is disabled when the window is zero", async () => {
    process.env.VISIT_BURST_MS = "0";
    const m = await load();
    expect(m.isBurstDuplicate("k", 1)).toBe(false);
    expect(m.isBurstDuplicate("k", 1)).toBe(false);
  });
});

describe("bot detection", () => {
  it("flags crawlers, scrapers and scripted clients", async () => {
    const m = await load();
    const bots = [
      "",
      "curl/8.5.0",
      "Wget/1.21.4",
      "python-requests/2.31.0",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "Mozilla/5.0 (compatible; SemrushBot/7.0; +http://www.semrush.com/bot.html)",
      "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
      "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/126.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 Selenium/4.0",
    ];
    for (const ua of bots) {
      expect(m.isBotRequest(ua)).toBe(true);
    }
  });

  it("accepts a normal browser user agent", async () => {
    const m = await load();
    expect(m.isBotRequest(HUMAN_UA)).toBe(false);
  });

  it("flags cross-site fetch traffic and accepts same-origin", async () => {
    const m = await load();
    const crossSite = new Headers({ "sec-fetch-site": "cross-site" });
    const sameOrigin = new Headers({ "sec-fetch-site": "same-origin" });
    expect(m.isBotRequest(HUMAN_UA, crossSite)).toBe(true);
    expect(m.isBotRequest(HUMAN_UA, sameOrigin)).toBe(false);
    expect(m.isBotRequest(HUMAN_UA)).toBe(false);
  });
});

describe("log file handling", () => {
  it("creates the data directory on first write", async () => {
    const m = await load();
    expect(existsSync(dir)).toBe(true);
    expect(existsSync(logPath)).toBe(false);
    m.recordVisit();
    expect(existsSync(logPath)).toBe(true);
  });
});