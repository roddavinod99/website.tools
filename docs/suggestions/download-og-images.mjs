// Downloads OG preview images for tools, guides, blogs, categories, comparisons,
// workflows, and toolkits from the local standalone server so they can be
// reviewed visually. Outputs to docs/suggestions/og-images/.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "og-images");
mkdirSync(OUT_DIR, { recursive: true });

const BASE = process.env.OG_BASE || "http://localhost:3000";

const TARGETS = [
  // Tools (sample across categories)
  { kind: "tool", slug: "json-formatter" },
  { kind: "tool", slug: "uuid-generator" },
  { kind: "tool", slug: "base64" },
  { kind: "tool", slug: "qr-generator" },
  { kind: "tool", slug: "jwt-decoder" },
  { kind: "tool", slug: "loan-emi-calculator" },
  { kind: "tool", slug: "markdown-to-html" },
  { kind: "tool", slug: "contrast-checker" },
  { kind: "tool", slug: "safelink-decoder" },
  { kind: "tool", slug: "prompt-improver" },
  { kind: "tool", slug: "currency-converter" },
  { kind: "tool", slug: "iban-validator" },
  { kind: "tool", slug: "base64-decoder" },
  { kind: "tool", slug: "mortgage-payoff" },
  { kind: "tool", slug: "cagr-calculator" },

  // Guides (catch-all route, so slug is category/name)
  { kind: "guide", slug: "concepts/json-basics" },
  { kind: "guide", slug: "concepts/jwt-structure" },
  { kind: "guide", slug: "concepts/base64-encoding" },
  { kind: "guide", slug: "best-practices/image-optimization" },
  { kind: "guide", slug: "best-practices/password-security" },
  { kind: "guide", slug: "best-practices/jwt-security" },
  { kind: "guide", slug: "references/color-models" },
  { kind: "guide", slug: "references/json-schema" },
  { kind: "guide", slug: "tutorials/qr-code-generation" },

  // Blog
  { kind: "blog", slug: "how-to-format-json-online" },
  { kind: "blog", slug: "understanding-jwt" },
  { kind: "blog", slug: "image-optimization" },

  // Compare
  { kind: "compare", slug: "json-vs-yaml-vs-xml-vs-toml" },
  { kind: "compare", slug: "md5-vs-sha-256-vs-sha-512" },
  { kind: "compare", slug: "base64-vs-url-encoding" },

  // Categories
  { kind: "category", slug: "formatters" },
  { kind: "category", slug: "generators" },
  { kind: "category", slug: "security" },
  { kind: "category", slug: "encoders" },
  { kind: "category", slug: "converters" },
  { kind: "category", slug: "image-tools" },
  { kind: "category", slug: "utilities" },
  { kind: "category", slug: "finance" },
];

async function fetchOg(target) {
  const ogUrl = `${BASE}/og/${target.slug}`;
  const safeName = `${target.kind}__${target.slug.replace(/\//g, "_")}.png`;
  const outPath = join(OUT_DIR, safeName);
  try {
    const res = await fetch(ogUrl);
    if (!res.ok) {
      return { target, ok: false, status: res.status, url: ogUrl };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(outPath, buf);
    return { target, ok: true, status: res.status, bytes: buf.length, outPath, url: ogUrl };
  } catch (e) {
    return { target, ok: false, error: e.message, url: ogUrl };
  }
}

const results = await Promise.all(TARGETS.map(fetchOg));
const summary = {
  base: BASE,
  fetched: results.length,
  success: results.filter((r) => r.ok).length,
  failed: results.filter((r) => !r.ok).length,
  results,
};
writeFileSync(join(OUT_DIR, "_summary.json"), JSON.stringify(summary, null, 2));

console.log(`OG images downloaded: ${summary.success}/${summary.fetched}`);
console.log(`Output: ${OUT_DIR}`);
if (summary.failed > 0) {
  console.log("Failed:");
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  ${r.target.kind}/${r.target.slug} -> ${r.status || r.error}`);
  }
}
