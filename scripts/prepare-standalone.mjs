import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const nextDir = join(root, ".next");
const standaloneDir = join(nextDir, "standalone");
const standaloneNext = join(standaloneDir, ".next");

if (!existsSync(join(standaloneDir, "server.js"))) {
  console.error("prepare-standalone: missing .next/standalone/server.js. Run `npm run build` first.");
  process.exit(1);
}

const staticSrc = join(nextDir, "static");
if (!existsSync(staticSrc)) {
  console.error("prepare-standalone: missing .next/static. Run `npm run build` first.");
  process.exit(1);
}

mkdirSync(standaloneNext, { recursive: true });
cpSync(staticSrc, join(standaloneNext, "static"), { recursive: true });

const publicDir = join(root, "public");
if (existsSync(publicDir)) {
  cpSync(publicDir, join(standaloneDir, "public"), { recursive: true });
}

// The middleware serves per-route CSP hashes from ./data/csp-hashes.json
// (see src/middleware.ts). Copy the fresh build artifact so the standalone
// server enforces hashes matching the HTML it serves — a stale copy blocks
// hydration scripts and leaves every tool stuck on "Loading tool...".
const cspHashes = join(root, "data", "csp-hashes.json");
if (existsSync(cspHashes)) {
  mkdirSync(join(standaloneDir, "data"), { recursive: true });
  cpSync(cspHashes, join(standaloneDir, "data", "csp-hashes.json"));
}

console.log("prepare-standalone: provisioned .next/standalone with static assets.");