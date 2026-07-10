import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

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
  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  if (origin) {
    try {
      const originHost = new URL(origin).hostname;
      const expectedHost = new URL(request.url).hostname;
      if (originHost !== expectedHost) {
        return NextResponse.json({ error: "Cross-origin requests not accepted" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid origin header" }, { status: 400 });
    }
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
    const { readdir } = await import("fs/promises");
    const files = await readdir(dir);
    entryCount = files.length;
  } catch {}

  if (entryCount > MAX_ENTRIES) {
    const { readdir, unlink } = await import("fs/promises");
    const files = await readdir(dir);
    const sorted = files.sort();
    const toRemove = sorted.slice(0, sorted.length - MAX_ENTRIES);
    for (const f of toRemove) await unlink(join(dir, f)).catch(() => {});
  }

  const submission = {
    type: type as FormType,
    data: sanitize(formData),
    timestamp: new Date().toISOString(),
    ip: "redacted",
  };

  await mkdir(dir, { recursive: true });
  const filename = `${type}-${Date.now()}.json`;
  await writeFile(join(dir, filename), JSON.stringify(submission, null, 2));

  return NextResponse.json({ success: true, message: "Submission received" });
}
