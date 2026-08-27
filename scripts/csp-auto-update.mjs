#!/usr/bin/env node
// scripts/csp-auto-update.mjs
// Automatically extracts new CSP hashes from violation reports and updates postbuild-csp.mjs
// Run via cron or manually: node scripts/csp-auto-update.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = join(fileURLToPath(import.meta.url), "..");
const ROOT = join(__dirname, "..");
const HASH_FILE = join(ROOT, "logs", "new-csp-hashes.txt");
const POSTBUILD_FILE = join(ROOT, "scripts", "postbuild-csp.mjs");

function main() {
  if (!existsSync(HASH_FILE)) {
    console.log("[csp-auto-update] No new hashes file found. Nothing to do.");
    return;
  }

  const newHashesContent = readFileSync(HASH_FILE, "utf-8").trim();
  if (!newHashesContent) {
    console.log("[csp-auto-update] No new hashes to process.");
    return;
  }

  const newHashes = newHashesContent.split("\n").filter(Boolean);
  console.log(`[csp-auto-update] Found ${newHashes.length} new hash(es) to add:`);
  for (const h of newHashes) console.log(`  ${h}`);

  const postbuildContent = readFileSync(POSTBUILD_FILE, "utf-8");

  const runtimeHashesMatch = postbuildContent.match(
    /const RUNTIME_SCRIPT_HASHES = \[([\s\S]*?)\n\];/
  );
  if (!runtimeHashesMatch) {
    console.error("[csp-auto-update] Could not find RUNTIME_SCRIPT_HASHES in postbuild-csp.mjs");
    process.exit(1);
  }

  const existingHashesBlock = runtimeHashesMatch[1];
  const existingHashes = new Set(
    existingHashesBlock
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("'sha256-"))
      .map((line) => line.replace(/,$/, "").trim())
  );

  let addedCount = 0;
  for (const h of newHashes) {
    if (!existingHashes.has(h)) {
      existingHashes.add(h);
      addedCount++;
    }
  }

  if (addedCount === 0) {
    console.log("[csp-auto-update] All hashes already present. Clearing new-hashes file.");
    writeFileSync(HASH_FILE, "", "utf-8");
    return;
  }

  const sortedHashes = [...existingHashes].sort();
  const newHashesBlock = sortedHashes.map((h) => `  ${h},`).join("\n");

  const updatedContent = postbuildContent.replace(
    /const RUNTIME_SCRIPT_HASHES = \[[\s\S]*?\n\];/,
    `const RUNTIME_SCRIPT_HASHES = [\n${newHashesBlock}\n];`
  );

  writeFileSync(POSTBUILD_FILE, updatedContent, "utf-8");
  writeFileSync(HASH_FILE, "", "utf-8");

  console.log(`[csp-auto-update] Added ${addedCount} new hash(es) to postbuild-csp.mjs`);
  console.log("[csp-auto-update] Run 'npm run build' to regenerate CSP hashes.");
}

main();