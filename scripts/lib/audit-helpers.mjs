// @ts-check
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const AUDIT_PATH = path.join(ROOT, 'data', 'tool-audit.json');
export const HISTORY_PATH = path.join(ROOT, 'data', 'tool-audit-history.json');

/**
 * Read the tool registry by parsing src/lib/data/tools.ts. We avoid a TS import
 * to keep this script runnable as a plain .mjs without a build step.
 *
 * Returns: Array<{ id, slug, category, component }>.
 * `component` is derived from `slug` (the codebase convention is
 * src/components/tools/<slug>.tsx).
 *
 * Strategy: match each top-level `{ ... }` object via /\{[^{}]*\}/g (this
 * works because tool records don't contain nested objects), then extract
 * `id`, `slug`, and `category` from each object. Tools missing any of the
 * three fields are skipped.
 */
export async function readTools() {
  const src = await readFile(path.join(ROOT, 'src/lib/data/tools.ts'), 'utf8');
  const tools = [];
  const objRe = /\{[^{}]*\}/g;
  const idRe = /\bid:\s*"([^"]+)"/;
  const slugRe = /\bslug:\s*"([^"]+)"/;
  const catRe = /\bcategory:\s*"([^"]+)"/;
  let m;
  while ((m = objRe.exec(src)) !== null) {
    const obj = m[0];
    const id = obj.match(idRe);
    const slug = obj.match(slugRe);
    const cat = obj.match(catRe);
    if (id && slug && cat) {
      tools.push({ id: id[1], slug: slug[1], category: cat[1], component: slug[1] });
    }
  }
  return tools;
}

export async function loadReport() {
  if (!existsSync(AUDIT_PATH)) return null;
  return JSON.parse(await readFile(AUDIT_PATH, 'utf8'));
}

export async function saveReport(report) {
  await writeFile(AUDIT_PATH, JSON.stringify(report, null, 2) + '\n');
}

export async function appendHistory(report) {
  let history = [];
  if (existsSync(HISTORY_PATH)) {
    history = JSON.parse(await readFile(HISTORY_PATH, 'utf8'));
  }
  history.push({ ...report, timestamp: new Date().toISOString() });
  // Keep last 90 days
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  history = history.filter((r) => new Date(r.timestamp).getTime() > cutoff);
  await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2) + '\n');
}

/**
 * Detect the variant for a given tool slug using the same heuristic as
 * tests/audit/_helpers.ts. Kept in sync deliberately (one source via this
 * module would be better, but Playwright + Node ESM cannot share TS source
 * without a build step).
 */
export function detectVariant(slug) {
  const n = slug.toLowerCase();
  if (n.includes('generator') || n.includes('uuid') || n.includes('password') || n.includes('lorem') || n.includes('random-') || n.includes('ascii') || n.includes('barcode') || n.includes('cron') || n.includes('token') || n.includes('numeronym') || n.startsWith('qr-') || n.endsWith('-qr-generator')) return 'generator';
  if (n.includes('image') || n === 'qr-generator' || n === 'wifi-qr-generator') return 'image';
  if (n.includes('calc') || n.includes('bmi') || n.includes('sip') || n.includes('emi') || n.includes('mortgage') || n.includes('loan') || n.includes('tip') || n.includes('percent')) return 'calculator';
  if (n.includes('convert') || n.includes('encoder') || n.includes('base64') || n.includes('hex') || n.includes('binary')) return 'converter';
  if (n.includes('diff')) return 'diff';
  if (n.includes('format') || n.includes('json') || n.includes('xml') || n.includes('yaml') || n.includes('sql') || n.includes('css') || n.includes('html') || n.includes('minif') || n.includes('beautif') || n.includes('lint') || n.includes('validate') || n.includes('view')) return 'formatter';
  if (n.includes('lookup') || n.includes('dns') || n.includes('whois') || n.includes('ip')) return 'lookup';
  return 'standard';
}
