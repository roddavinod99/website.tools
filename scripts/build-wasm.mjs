import { spawnSync } from "node:child_process";
import { existsSync, statSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const WASM_DIR = join(ROOT, "wasm");
const PKG_DIR = join(WASM_DIR, "pkg");
const OUT_DIR = join(ROOT, "src", "lib", "wasm", "pkg");
const OUT_WASM = join(OUT_DIR, "website_tools_wasm_bg.wasm");
const FRESH_WASM = join(PKG_DIR, "website_tools_wasm_bg.wasm");

const isWin = process.platform === "win32";
const PATHEXT = isWin ? (process.env.PATHEXT || ".exe;.bat;.cmd;.com;.ps1").toLowerCase().split(";") : [""];

function resolveCommand(command) {
  if (process.platform !== "win32") return command;
  const dirs = (process.env.PATH || "").split(";");
  for (const dir of dirs) {
    if (!dir) continue;
    const base = join(dir, command);
    for (const ext of PATHEXT) {
      const candidate = `${base}${ext}`;
      if (existsSync(candidate)) return candidate;
    }
    if (existsSync(base)) return base;
  }
  return command;
}

function hasCommand(command) {
  if (isWin) return resolveCommand(command) !== command;
  const res = spawnSync(command, ["--version"], { encoding: "utf-8" });
  return res.status === 0 && !res.error;
}

function newestSourceMtime() {
  const sources = [join(WASM_DIR, "src"), join(WASM_DIR, "Cargo.toml"), join(WASM_DIR, "Cargo.lock")];
  let newest = 0;
  const scan = (entry) => {
    if (!existsSync(entry)) return;
    const stat = statSync(entry);
    if (stat.isDirectory()) {
      for (const child of readdirSync(entry)) scan(join(entry, child));
      return;
    }
    newest = Math.max(newest, stat.mtimeMs);
  };
  for (const entry of sources) scan(entry);
  return newest;
}

function isUpToDate() {
  if (!existsSync(OUT_WASM) || !existsSync(FRESH_WASM)) return false;
  return newestSourceMtime() <= statSync(FRESH_WASM).mtimeMs;
}

function copyPkg() {
  if (!existsSync(PKG_DIR)) return;
  mkdirSync(OUT_DIR, { recursive: true });
  for (const file of readdirSync(PKG_DIR)) {
    if (file.endsWith(".gitignore")) continue;
    const src = join(PKG_DIR, file);
    if (statSync(src).isDirectory()) continue;
    copyFileSync(src, join(OUT_DIR, file));
  }
}

function run(command, args) {
  const resolved = isWin ? resolveCommand(command) : command;
  console.log(`[build:wasm] ${resolved} ${args.join(" ")}`);
  const res = isWin
    ? spawnSync(`"${resolved}" ${args.map((a) => `"${a}"`).join(" ")}`, {
        cwd: WASM_DIR,
        stdio: "inherit",
        shell: true,
      })
    : spawnSync(resolved, args, { cwd: WASM_DIR, stdio: "inherit" });
  if (res.status !== 0) {
    console.error(`[build-wasm] Failed: ${command} ${args.join(" ")} (exit ${res.status})`);
    process.exit(res.status ?? 1);
  }
}

const force = process.argv.includes("--force");

if (process.env.SKIP_BUILD_WASM === "1") {
  console.log("[build-wasm] SKIP_BUILD_WASM=1, skipping WASM build.");
  process.exit(0);
}

if (!hasCommand("cargo")) {
  console.warn("[build-wasm] cargo not found, skipping WASM build.");
  process.exit(0);
}

if (!existsSync(join(WASM_DIR, "Cargo.toml"))) {
  console.warn("[build-wasm] wasm/Cargo.toml not found, skipping.");
  process.exit(0);
}

if (!force && isUpToDate()) {
  copyPkg();
  console.log("[build-wasm] WASM output is up to date, copying package.");
  process.exit(0);
}

run("cargo", ["build", "--release", "--target", "wasm32-unknown-unknown"]);

if (!hasCommand("wasm-pack")) {
  console.warn("[build-wasm] wasm-pack not found, package output left as-is.");
  process.exit(0);
}

run("wasm-pack", ["build", "--target", "web", "--release"]);
copyPkg();
console.log(`[build-wasm] Output ready in ${OUT_DIR}`);