import { readFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { 
  computeRelease, 
  writeEntriesFile,
} from "./lib/auto-version.mjs";

const __dirname = join(fileURLToPath(import.meta.url), "..");
const ROOT = join(__dirname, "..");

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isVerbose = args.includes("--verbose");
  
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
  const currentVersion = pkg.version || "0.0.0";
  if (isVerbose) {
    console.log(`Current version: ${currentVersion}`);
  }
  
  const result = computeRelease(currentVersion);
  
  if (!result.bumped) {
    console.log(`No release needed: ${result.reason}`);
    return 0;
  }
  
  if (isVerbose) {
    console.log(`Base ref: ${result.baseRef}`);
    console.log(`Release type: ${result.releaseType}`);
    console.log(`Next version: ${result.version}`);
    console.log(`Entries: ${result.entries.length}`);
    for (const e of result.entries) {
      console.log(`  [${e.category}] ${e.description}`);
    }
  }
  
  if (isDryRun) {
    console.log("DRY RUN - no changes made");
    return 0;
  }
  
  const entriesPath = join("data", "auto-release-entries.txt");
  const absoluteEntriesPath = join(ROOT, entriesPath);
  await writeEntriesFile(result.entries, absoluteEntriesPath);
  
  if (isVerbose) {
    console.log(`Entries written to: ${absoluteEntriesPath}`);
  }
  
  const releaseScript = join(ROOT, "scripts", "release.mjs");
  const cmd = `node "${releaseScript}" ${result.releaseType} --file "${entriesPath}"`;
  
  if (isVerbose) {
    console.log(`Running: ${cmd}`);
  }
  
  try {
    execSync(cmd, { encoding: "utf-8", cwd: ROOT, stdio: "inherit" });
  } catch {
    if (existsSync(entriesPath)) unlinkSync(entriesPath);
    throw new Error("Release script failed");
  }
  
  if (existsSync(entriesPath)) unlinkSync(entriesPath);
  
  console.log(`Released version ${result.version}`);
  return 0;
}

main().catch((err) => {
  console.error("Auto-release failed:", err.message);
  process.exit(1);
});