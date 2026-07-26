import { rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const CLEANUP_DIRS = [
  "wasm/target",
  ".next/dev",
  ".next/cache",
  "test-results",
  "playwright-report",
];

function getSize(path) {
  if (!existsSync(path)) return 0;
  const stats = statSync(path);
  if (stats.isFile()) return stats.size;
  let total = 0;
  for (const entry of readdirSync(path)) {
    total += getSize(join(path, entry));
  }
  return total;
}

function formatSize(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(2)} ${units[unit]}`;
}

console.log("[cleanup] Starting build artifact cleanup...\n");

let totalFreed = 0;

for (const dir of CLEANUP_DIRS) {
  const fullPath = join(ROOT, dir);
  if (existsSync(fullPath)) {
    const size = getSize(fullPath);
    console.log(`[cleanup] Removing ${dir} (${formatSize(size)})`);
    rmSync(fullPath, { recursive: true, force: true });
    totalFreed += size;
  } else {
    console.log(`[cleanup] Skipping ${dir} (not found)`);
  }
}

console.log(`\n[cleanup] Done. Freed ${formatSize(totalFreed)}`);