import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const LOG_DIR = join(process.cwd(), "logs");
const REPORT_FILE = join(LOG_DIR, "csp-violations.jsonl");
const HASH_FILE = join(LOG_DIR, "new-csp-hashes.txt");
const MAX_BODY_BYTES = 8192;
const MAX_LOG_BYTES = 5 * 1024 * 1024;
const MAX_LOG_LINES = 5000;

function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "dev-salt";
  return createHash("sha256").update(ip.replace(/::ffff:/, "") + salt).digest("hex").slice(0, 16);
}

function rotateIfNeeded(file: string) {
  try {
    const stat = statSync(file);
    if (stat.size > MAX_LOG_BYTES) {
      const content = readFileSync(file, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);
      const kept = lines.slice(-Math.floor(MAX_LOG_LINES / 2));
      writeFileSync(file, kept.join("\n") + "\n", "utf-8");
    }
  } catch {
    // file doesn't exist yet
  }
}

function extractHashesFromReport(report: Record<string, unknown>): string[] {
  const hashes = new Set<string>();
  const cspReport = report["csp-report"] as Record<string, unknown> | undefined;
  if (!cspReport) return [];

  const sample = cspReport["script-sample"] as string | undefined;
  if (sample) {
    const hashMatches = sample.match(/sha256-[A-Za-z0-9+/=]+/g);
    if (hashMatches) {
      for (const h of hashMatches) hashes.add(`'${h}'`);
    }
  }

  const blockedUri = cspReport["blocked-uri"] as string | undefined;
  if (blockedUri && blockedUri.startsWith("sha256-")) {
    hashes.add(`'${blockedUri}'`);
  }

  const violatedDirective = cspReport["violated-directive"] as string | undefined;
  if (violatedDirective?.includes("script-src")) {
    const documentUri = cspReport["document-uri"] as string | undefined;
    console.log(`[CSP Report] script-src violation on ${documentUri}: ${JSON.stringify(cspReport)}`);
  }

  return [...hashes];
}

export async function POST(request: NextRequest) {
  ensureLogDir();

  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return new NextResponse("Payload too large", { status: 413 });
    }
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return new NextResponse("Payload too large", { status: 413 });
    }
    const report = JSON.parse(raw);

    const newHashes = extractHashesFromReport(report);

    const rawIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: hashIp(rawIp),
      report,
      extractedHashes: newHashes,
    };

    rotateIfNeeded(REPORT_FILE);
    appendFileSync(REPORT_FILE, JSON.stringify(logEntry) + "\n", "utf-8");

    if (newHashes.length > 0) {
      const existing = existsSync(HASH_FILE) ? readFileSync(HASH_FILE, "utf-8") : "";
      const existingHashes = new Set(existing.trim().split("\n").filter(Boolean));
      for (const h of newHashes) existingHashes.add(h);
      writeFileSync(HASH_FILE, [...existingHashes].sort().join("\n") + "\n", "utf-8");
    }

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[CSP Report] Failed to process:", e);
    return new NextResponse("Bad Request", { status: 400 });
  }
}
