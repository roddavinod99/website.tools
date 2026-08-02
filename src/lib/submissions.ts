import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SUBMISSIONS_DIR = join(process.cwd(), "data", "submissions");

export interface PersistedSubmission {
  type: string;
  data: unknown;
  timestamp: string;
}

export function ensureSubmissionsDir(): void {
  mkdirSync(SUBMISSIONS_DIR, { recursive: true });
}

/**
 * Append a sanitized submission to a JSONL file so form submissions are
 * actually retained (not silently discarded). Content is JSON-serialized,
 * so no user data can break the file format or inject path traversal.
 */
export function persistSubmission(
  type: string,
  data: unknown,
  timestamp = new Date().toISOString()
): string {
  ensureSubmissionsDir();
  // `type` must come from a fixed allowlist at the call site; normalize to a
  // safe filename segment just in case.
  const safeType = type.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "submission";
  const file = join(SUBMISSIONS_DIR, `${safeType}.jsonl`);
  const entry: PersistedSubmission = { type: safeType, data, timestamp };
  appendFileSync(file, JSON.stringify(entry) + "\n", "utf8");
  return file;
}

/** Write an initial marker so the directory is present even before the first submission. */
export function ensureSubmissionIndex(): void {
  ensureSubmissionsDir();
  const indexFile = join(SUBMISSIONS_DIR, "README.md");
  try {
    writeFileSync(
      indexFile,
      "# Submissions\n\nJSONL files in this directory store sanitized form submissions (suggestions, feedback, contact messages, newsletter signups) so they are retained for review. Files never contain secrets, and IP addresses are redacted at the route layer.\n",
      { encoding: "utf8", flag: "wx" }
    );
  } catch {
    // File already exists — fine.
  }
}
