import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const ROOT = join(__dirname, "..", "..");

export function log(...args) {
  const msg = `[${new Date().toISOString()}] ${args.join(" ")}`;
  console.log(msg);
  try {
    mkdirSync(join(ROOT, "data"), { recursive: true });
    appendFileSync(join(ROOT, "data", "audit.log"), msg + "\n");
  } catch {}
}

export function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function run(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { cwd: ROOT, stdio: "pipe", timeout: 120000, ...opts });
    return { ok: true, stdout: out.stdout?.toString() || "", stderr: out.stderr?.toString() || "" };
  } catch (err) {
    return { ok: false, stdout: err.stdout?.toString() || "", stderr: err.stderr?.toString() || "", error: err.message };
  }
}

export function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

export function writeJsonReport(dir, name, data) {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${name}-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2));
  writeFileSync(join(dir, "latest.json"), JSON.stringify(data, null, 2));
  log(`JSON report written to ${path}`);
  return path;
}

export function writeHtmlReport(dir, name, title, findingsLists, meta) {
  let html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">';
  html += `<title>${esc(title)}</title><style>`;
  html += '*{margin:0;padding:0;box-sizing:border-box}';
  html += 'body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0a0a0b;color:#e4e4e7;padding:2rem}';
  html += '.container{max-width:960px;margin:0 auto}';
  html += 'h1{font-size:1.5rem;margin-bottom:.5rem}';
  html += '.meta{color:#a1a1aa;font-size:.875rem;margin-bottom:2rem}';
  html += '.score{display:inline-block;font-size:2rem;font-weight:700;padding:.5rem 1rem;border-radius:.5rem;margin-bottom:2rem}';
  html += '.score.good{background:#166534;color:#bbf7d0}';
  html += '.score.ok{background:#854d0e;color:#fef08a}';
  html += '.score.bad{background:#991b1b;color:#fecaca}';
  html += '.sev{display:inline-block;padding:.125rem .5rem;border-radius:.25rem;font-size:.75rem;font-weight:600}';
  html += '.sev.critical{background:#7f1d1d;color:#fecaca}';
  html += '.sev.high{background:#991b1b;color:#fecaca}';
  html += '.sev.medium{background:#713f12;color:#fef08a}';
  html += '.sev.low{background:#1e3a5f;color:#bfdbfe}';
  html += '.sev.info{background:#1a2e1a;color:#bbf7d0}';
  html += '.sev.pass{background:#166534;color:#bbf7d0}';
  html += '.check{border:1px solid #27272a;border-radius:.5rem;padding:1rem;margin-bottom:1rem}';
  html += '.check h2{font-size:1rem;margin-bottom:.5rem;display:flex;align-items:center;gap:.5rem}';
  html += '.check .detail{font-size:.8125rem;color:#a1a1aa;margin-bottom:.5rem}';
  html += '.check ul{list-style:none}';
  html += '.check li{font-size:.8125rem;color:#a1a1aa;padding:.25rem 0}';
  html += '.blocker{display:inline-block;font-size:1.25rem;font-weight:700;padding:.5rem 1rem;border-radius:.5rem;margin-bottom:1rem}';
  html += '.blocker.yes{background:#991b1b;color:#fecaca}';
  html += '.blocker.no{background:#166534;color:#bbf7d0}';
  html += '.summary{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1rem;margin-bottom:2rem}';
  html += '.stat{background:#18181b;border:1px solid #27272a;border-radius:.5rem;padding:1rem;text-align:center}';
  html += '.stat .num{font-size:1.5rem;font-weight:700}';
  html += '.stat .label{font-size:.75rem;color:#a1a1aa;text-transform:uppercase;letter-spacing:.05em}';
  html += '</style></head><body><div class="container">';
  html += `<h1>${esc(title)}</h1>`;
  html += `<div class="meta">${esc(meta.timestamp || new Date().toISOString())}</div>`;

  if (meta.overallScore !== undefined) {
    const scoreClass = meta.overallScore >= 90 ? "good" : meta.overallScore >= 70 ? "ok" : "bad";
    html += `<div class="score ${scoreClass}">${meta.overallScore}/100</div>`;
  }
  if (meta.blocked !== undefined) {
    html += `<div class="blocker ${meta.blocked ? 'yes' : 'no'}">${meta.blocked ? 'DEPLOYMENT BLOCKED' : 'READY FOR DEPLOYMENT'}</div>`;
  }

  html += '<div class="summary">';
  for (const [key, val] of Object.entries(meta)) {
    if (["title", "timestamp", "overallScore", "blocked"].includes(key)) continue;
    html += `<div class="stat"><div class="num">${val}</div><div class="label">${esc(key)}</div></div>`;
  }
  html += '</div>';

  for (const { section, findings } of findingsLists) {
    const critical = findings.filter(f => f.severity === "critical" || f.severity === "high").length;
    const total = findings.length;
    html += `<div class="check"><h2>${esc(section)} (${critical > 0 ? critical + ' blocking, ' : ''}${total} total)</h2>`;
    if (total === 0) {
      html += '<div class="detail">No issues found</div>';
    } else {
      html += '<ul>';
      for (const f of findings) {
        html += `<li><span class="sev ${f.severity}">${f.severity.toUpperCase()}</span> ${esc(f.check)}: ${esc(f.detail)}</li>`;
      }
      html += '</ul>';
    }
    html += '</div>';
  }

  html += '</div></body></html>';
  const htmlPath = join(dir, `${name}-${new Date().toISOString().slice(0, 10)}.html`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(htmlPath, html);
  writeFileSync(join(dir, "latest.html"), html);
  log(`HTML report written to ${htmlPath}`);
  return htmlPath;
}

export const SEVERITY_WEIGHTS = { critical: 30, high: 15, medium: 5, low: 2, info: 0 };

export function computeScore(findings) {
  let penalty = 0;
  for (const f of findings) {
    penalty += SEVERITY_WEIGHTS[f.severity] || 0;
  }
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function isBlocked(findings) {
  const criticalHigh = findings.filter(f => f.severity === "critical" || f.severity === "high");
  const medium = findings.filter(f => f.severity === "medium");
  if (criticalHigh.length > 0) return true;
  if (medium.length >= 3) return true;
  return false;
}
