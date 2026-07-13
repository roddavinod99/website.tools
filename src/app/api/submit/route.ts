import { NextResponse } from "next/server";
import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const TYPES = ["suggest", "feature-request", "feedback", "report-bug", "newsletter"] as const;
type FormType = typeof TYPES[number];
const MAX_BODY_BYTES = 10_000;
const MAX_FIELD_LENGTH = 2000;
const MAX_ENTRIES = 500;

function sanitize(val: unknown, maxLen = MAX_FIELD_LENGTH): unknown {
  if (typeof val === "string") return val.trim().slice(0, maxLen);
  if (typeof val === "number" || typeof val === "boolean") return val;
  if (val === null) return null;
  if (Array.isArray(val)) return val.map((v) => sanitize(v, maxLen)).slice(0, 20);
  if (typeof val === "object") {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>).slice(0, 20)) {
      obj[sanitize(k, 100) as string] = sanitize(v, maxLen);
    }
    return obj;
  }
  return String(val).slice(0, maxLen);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin || referer;

  if (!source) {
    return NextResponse.json({ error: "Missing origin or referer header" }, { status: 403 });
  }

  try {
    const sourceHost = new URL(source).hostname;
    const expectedHost = new URL(request.url).hostname;
    if (sourceHost !== expectedHost) {
      return NextResponse.json({ error: "Cross-origin requests not accepted" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid origin header" }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || !body || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  const { type, ...formData } = body as Record<string, unknown>;

  if (!type || !TYPES.includes(type as FormType)) {
    return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
  }

  const dir = join(process.cwd(), "data", "submissions");

  let entryCount = 0;
  try {
    const files = await readdir(dir);
    entryCount = files.length;
  } catch {}

  if (entryCount > MAX_ENTRIES) {
    try {
      const files = await readdir(dir);
      const sorted = files.sort();
      const toRemove = sorted.slice(0, sorted.length - MAX_ENTRIES);
      for (const f of toRemove) await unlink(join(dir, f)).catch(() => {});
    } catch {}
  }

  const submission = {
    type: type as FormType,
    data: sanitize(formData),
    timestamp: new Date().toISOString(),
    ip: "redacted",
  };

  try {
    await mkdir(dir, { recursive: true });
    const filename = `${type}-${Date.now()}-${randomUUID().slice(0, 8)}.json`;
    await writeFile(join(dir, filename), JSON.stringify(submission, null, 2));
  } catch {
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Submission received" });
}
