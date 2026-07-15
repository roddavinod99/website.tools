#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import {
  log, run, loadJson, writeJsonReport, writeHtmlReport,
  computeScore, isBlocked, ROOT as PROJECT_ROOT
} from "./lib/audit-utils.mjs";

const ROOT = PROJECT_ROOT;
const REPORT_DIR = join(ROOT, "data", "production-readiness");

// ── Check Groups ──

function checkBuild() {
  const r = run("npm run build 2>&1");
  if (r.ok) return { severity: "pass", check: "Build", detail: "Build succeeded" };
  const err = r.stderr.split("\n").slice(-3).join("; ").trim();
  return { severity: "critical", check: "Build", detail: err || r.error };
}

function checkTypeScript() {
  const r = run("npx tsc --noEmit 2>&1");
  if (r.ok) return { severity: "pass", check: "TypeScript", detail: "No TS errors" };
  const count = r.stderr.split("\n").filter(l => l.includes("error")).length;
  return { severity: "high", check: "TypeScript", detail: `${count} TS error(s)` };
}

function checkLint() {
  const r = run("npm run lint 2>&1");
  if (r.ok) return { severity: "pass", check: "Lint", detail: "No lint errors" };
  return { severity: "medium", check: "Lint", detail: "Lint warnings/errors found" };
}

function checkDependencies() {
  const r = run("npm audit --audit-level=high 2>&1");
  if (r.ok) return { severity: "pass", check: "Dependencies", detail: "No high/critical vulns" };
  const stdout = r.stdout + r.stderr;
  const critical = (stdout.match(/Critical/g) || []).length;
  const high = (stdout.match(/\bHigh\b/g) || []).length;
  const medium = (stdout.match(/\bMedium\b/g) || []).length;
  if (critical > 0) return { severity: "critical", check: "Dependencies", detail: `${critical} critical, ${high} high, ${medium} medium vulns` };
  if (high > 0) return { severity: "high", check: "Dependencies", detail: `${high} high vulns` };
  return { severity: "medium", check: "Dependencies", detail: `${medium} medium vulns` };
}

function checkBundleSize() {
  const buildDir = join(ROOT, ".next", "static", "chunks");
  if (!existsSync(buildDir)) return { severity: "high", check: "Bundle Size", detail: "Build not found" };

  const manifestPath = join(ROOT, ".next", "build-manifest.json");
  let frameworkFiles = new Set();
  if (existsSync(manifestPath)) {
    try {
      const m = JSON.parse(readFileSync(manifestPath, "utf-8"));
      frameworkFiles = new Set([...(m.polyfillFiles || []), ...(m.rootMainFiles || [])]);
    } catch {}
  }

  let totalJs = 0, totalCss = 0;
  const pageChunks = [];

  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else {
        const size = statSync(full).size;
        const rel = full.replace(join(ROOT, ".next"), ".next").replace(/\\/g, "/");
        if (e.name.endsWith(".js")) {
          totalJs += size;
          const cn = "static/chunks/" + e.name;
          if (!frameworkFiles.has(cn) && size > 500 * 1024) {
            pageChunks.push({ file: rel, size });
          }
        } else if (e.name.endsWith(".css")) {
          totalCss += size;
        }
      }
    }
  }
  walk(buildDir);

  const jsMB = (totalJs / 1024 / 1024).toFixed(2);
  const cssMB = (totalCss / 1024 / 1024).toFixed(2);
  if (pageChunks.length > 0) {
    return {
      severity: "medium",
      check: "Bundle Size",
      detail: `${pageChunks.length} page chunk(s) > 500KB. JS: ${jsMB}MB, CSS: ${cssMB}MB`,
      extra: pageChunks.map(c => `${c.file} (${(c.size / 1024).toFixed(0)}KB)`),
    };
  }
  return { severity: "pass", check: "Bundle Size", detail: `JS: ${jsMB}MB, CSS: ${cssMB}MB, no oversized chunks` };
}

function checkSeoAudit() {
  const r = run("node scripts/seo-audit.mjs 2>&1");
  if (!r.ok) return { severity: "high", check: "SEO Audit", detail: "SEO audit failed to run" };
  const report = loadJson(join(ROOT, "data", "seo-reports", "latest.json"));
  if (!report) return { severity: "high", check: "SEO Audit", detail: "No SEO report produced" };
  const failed = report.failed?.length || 0;
  if (failed > 0) return { severity: "medium", check: "SEO Audit", detail: `${report.score}/100 — ${failed} check(s) failed` };
  return { severity: "pass", check: "SEO Audit", detail: `${report.score}/100 — all checks passed` };
}

function checkA11y() {
  const testFile = join(ROOT, "tests", "a11y.spec.ts");
  if (!existsSync(testFile)) return { severity: "high", check: "Accessibility", detail: "a11y test file missing" };

  const content = readFileSync(testFile, "utf-8");
  const pagePaths = content.match(/"([^"]+)"/g) || [];
  const pathCount = pagePaths.filter(p => p.startsWith('"/') && !p.startsWith('"/api')).length;
  if (pathCount < 5) return { severity: "medium", check: "Accessibility", detail: `Only ${pathCount} pages tested for a11y` };

  return { severity: "pass", check: "Accessibility", detail: `A11y runtime tests cover ${pathCount} pages with @axe-core/playwright` };
}

function checkSecurity() {
  const issues = [];
  // next.config.ts headers
  try {
    const nc = readFileSync(join(ROOT, "next.config.ts"), "utf-8");
    const required = ["frame-ancestors", "form-action", "base-uri",
      "Cross-Origin-Opener-Policy", "Cross-Origin-Resource-Policy",
      "X-Frame-Options", "Strict-Transport-Security", "Permissions-Policy"];
    for (const h of required) {
      if (!nc.includes(h)) issues.push(`Missing: ${h}`);
    }
  } catch { issues.push("Cannot read next.config.ts"); }
  // DOMPurify restricted tags
  try {
    const s = readFileSync(join(ROOT, "src", "lib", "sanitize.ts"), "utf-8");
    if (!s.includes("ALLOWED_TAGS")) issues.push("DOMPurify ALLOWED_TAGS not found");
  } catch { issues.push("sanitize.ts not found"); }
  // .gitignore
  try {
    const gi = readFileSync(join(ROOT, ".gitignore"), "utf-8");
    if (!gi.includes(".env")) issues.push(".env* not in .gitignore");
  } catch { issues.push("Cannot read .gitignore"); }
  // npm outdated
  const outdated = run("npm outdated --long 2>&1");
  const outdatedLines = (outdated.stdout || "").split("\n").filter(l => l.includes("node_modules"));
  if (outdatedLines.length > 5) issues.push(`${outdatedLines.length} outdated deps — run npm update`);

  if (issues.length === 0) return { severity: "pass", check: "Security", detail: "All security checks passed" };
  const sev = issues.length > 3 ? "high" : issues.length > 1 ? "medium" : "low";
  return { severity: sev, check: "Security", detail: `${issues.length} issue(s): ${issues.join("; ")}` };
}

function checkHealthEndpoint() {
  const r = run(`node -e "fetch('http://localhost:3000/api/health').then(r=>r.json()).then(d=>console.log(JSON.stringify(d))).catch(()=>console.log('DOWN'))" 2>&1`, { timeout: 10000 });
  if (r.ok && r.stdout && !r.stdout.includes("DOWN")) {
    return { severity: "pass", check: "Health Endpoint", detail: "Health endpoint responding" };
  }
  return { severity: "low", check: "Health Endpoint", detail: "Not reachable (start server for live check)" };
}

function checkDeploymentConfig() {
  const items = [];
  const checks = [
    ["PM2 config", () => existsSync(join(ROOT, "ecosystem.config.js"))],
    [".env.local", () => existsSync(join(ROOT, ".env.local"))],
    [".gitignore", () => existsSync(join(ROOT, ".gitignore"))],
    ["Standalone output", () => {
      try {
        return readFileSync(join(ROOT, "next.config.ts"), "utf-8").includes("standalone");
      } catch { return false; }
    }],
  ];
  for (const [label, fn] of checks) {
    items.push(fn() ? `✓ ${label}` : `✗ ${label}`);
  }
  const missing = items.filter(i => i.includes("✗"));
  if (missing.length === 0) return { severity: "pass", check: "Deployment Config", detail: items.join(" | ") };
  return { severity: "low", check: "Deployment Config", detail: `${missing.length} missing: ${items.join(" | ")}` };
}

// ── Main ──

async function main() {
  const start = Date.now();

  console.log("");
  console.log("=".repeat(60));
  console.log(" PRODUCTION READINESS REPORT");
  console.log(` ${new Date().toISOString()}`);
  console.log("=".repeat(60));

  log("Running production readiness checks...");

  const findings = [
    checkBuild(),
    checkTypeScript(),
    checkLint(),
    checkDependencies(),
    checkBundleSize(),
    checkSeoAudit(),
    checkA11y(),
    checkSecurity(),
    checkHealthEndpoint(),
    checkDeploymentConfig(),
  ];

  const score = computeScore(findings);
  const blocked = isBlocked(findings);
  const passed = findings.filter(f => f.severity === "pass").length;
  const warned = findings.filter(f => f.severity !== "pass" && !["critical", "high"].includes(f.severity)).length;
  const failed = findings.filter(f => ["critical", "high"].includes(f.severity)).length;

  console.log("");
  for (const f of findings) {
    const icon = f.severity === "pass" ? "✓" : f.severity === "critical" || f.severity === "high" ? "✗" : "⚠";
    const detail = f.severity === "pass" ? `PASS — ${f.detail}` : `${f.severity.toUpperCase()} — ${f.detail}`;
    console.log(` ${icon} ${f.check}: ${detail}`);
    if (f.extra && f.extra.length > 0) {
      for (const line of f.extra) console.log(`     ${line}`);
    }
  }

  const duration = `${((Date.now() - start) / 1000).toFixed(1)}s`;

  console.log("");
  console.log("=".repeat(60));
  console.log(` Score: ${score}/100`);
  console.log(` Passed: ${passed}  Warned: ${warned}  Failed: ${failed}`);
  console.log(` Deployment: ${blocked ? "BLOCKED" : "READY"}`);
  console.log(` Time: ${duration}`);
  console.log("=".repeat(60));

  const report = {
    timestamp: new Date().toISOString(),
    score,
    blocked,
    passed,
    warned,
    failed,
    duration,
    findings,
  };

  writeJsonReport(REPORT_DIR, "readiness", report);

  const findingsLists = [{
    section: "All Checks",
    findings: findings.map(f => ({
      severity: f.severity,
      check: f.check,
      detail: f.detail,
    })),
  }];

  const meta = {
    timestamp: new Date().toISOString(),
    overallScore: score,
    blocked,
    passed: `${passed}`,
    warned: `${warned}`,
    failed: `${failed}`,
    duration,
  };

  writeHtmlReport(REPORT_DIR, "readiness", "Production Readiness Report", findingsLists, meta);

  process.exitCode = blocked ? 1 : 0;
}

main().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exitCode = 1;
});
