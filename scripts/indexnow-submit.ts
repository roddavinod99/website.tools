/**
 * IndexNow URL submission helper.
 *
 * The canonical submitter is scripts/sitemap-submitter.mjs (wired into
 * `npm run sitemap:submit` and the deploy workflow). It already extracts
 * per-page URLs from the sitemap and POSTs them to the IndexNow aggregator
 * in batches of up to 10,000.
 *
 * This script is a thin shim for on-demand, ad-hoc use — it just spawns
 * the canonical script with INDEXNOW_KEY + SITEMAP_STATE_PATH pointing at
 * a caller-supplied state file so the on-demand run doesn't disturb the
 * persistent deploy state.
 *
 * Usage:
 *   INDEXNOW_KEY=xxx npx tsx scripts/indexnow-submit.ts
 *
 * References:
 *   - https://www.indexnow.org/documentation
 *   - https://www.indexnow.org/faq
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUBMITTER = join(__dirname, "sitemap-submitter.mjs");

function main() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.error("INDEXNOW_KEY is not set. Generate one at https://www.indexnow.org/");
    process.exit(1);
  }
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
    console.error("INDEXNOW_KEY must be 8-128 chars of [A-Za-z0-9-]");
    process.exit(1);
  }

  // Use a temp state file so an ad-hoc run doesn't overwrite the host's
  // persistent state and accidentally reset the next-scheduled-submission
  // window.
  const stateDir = mkdtempSync(join(tmpdir(), "indexnow-"));
  const env = { ...process.env, SITEMAP_STATE_PATH: join(stateDir, "state.json") };

  console.log(`Running ${SUBMITTER} with ephemeral state at ${env.SITEMAP_STATE_PATH}`);
  const result = spawnSync(process.execPath, [SUBMITTER], { stdio: "inherit", env });
  process.exit(result.status ?? 1);
}

main();
