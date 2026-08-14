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

console.log("prepare-standalone: provisioned .next/standalone with static assets.");