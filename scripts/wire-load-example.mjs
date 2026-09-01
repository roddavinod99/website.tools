// One-off script: wire useLoadExample into the top text-input tools.
// Run with: node scripts/wire-load-example.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const tools = [
  ["json-formatter", "src/components/tools/formatters/json-formatter.tsx", "useLoadExample(\"json-formatter\", (text) => handleChange(text));"],
  ["base64-encoder", "src/components/tools/encoders/base64-encoder.tsx", "useLoadExample(\"base64-encoder\", (text) => setInput(text));"],
  ["base64-decoder", "src/components/tools/encoders/base64-decoder.tsx", "useLoadExample(\"base64-decoder\", (text) => setInput(text));"],
  ["jwt-decoder", "src/components/tools/crypto/jwt-decoder.tsx", "useLoadExample(\"jwt-decoder\", (text) => setInput(text));"],
  ["sql-formatter", "src/components/tools/formatters/sql-formatter.tsx", "useLoadExample(\"sql-formatter\", (text) => setInput(text));"],
  ["json-to-csv", "src/components/tools/converters/json-to-csv.tsx", "useLoadExample(\"json-to-csv\", (text) => setInput(text));"],
  ["csv-to-json", "src/components/tools/converters/csv-to-json.tsx", "useLoadExample(\"csv-to-json\", (text) => setInput(text));"],
  ["json-to-typescript", "src/components/tools/json/json-to-typescript.tsx", "useLoadExample(\"json-to-typescript\", (text) => setInput(text));"],
  ["css-formatter", "src/components/tools/formatters/css-formatter.tsx", "useLoadExample(\"css-formatter\", (text) => setInput(text));"],
  ["html-formatter", "src/components/tools/formatters/html-formatter.tsx", "useLoadExample(\"html-formatter\", (text) => setInput(text));"],
  ["js-minifier", "src/components/tools/formatters/js-minifier.tsx", "useLoadExample(\"js-minifier\", (text) => setInput(text));"],
  ["markdown-to-html", "src/components/tools/formatters/markdown-to-html.tsx", "useLoadExample(\"markdown-to-html\", (text) => { setInput(text); setExample(\"custom\"); });"],
  ["hash-generator", "src/components/tools/crypto/hash-generator.tsx", "useLoadExample(\"hash-generator\", (text) => setInput(text));"],
  ["word-counter", "src/components/tools/utilities/word-counter.tsx", "useLoadExample(\"word-counter\", (text) => setText(text));"],
  ["timestamp-converter", "src/components/tools/utilities/timestamp-converter.tsx", "useLoadExample(\"timestamp-converter\", (text) => setInput(text));"],
  ["case-converter", "src/components/tools/utilities/case-converter.tsx", "useLoadExample(\"case-converter\", (text) => setInput(text));"],
  ["url-encoder", "src/components/tools/utilities/url-encoder.tsx", "useLoadExample(\"url-encoder\", (text) => setInput(text));"],
  ["color-converter", "src/components/tools/image/color-converter.tsx", "useLoadExample(\"color-converter\", (text) => setInput(text));"],
];

const IMPORT_LINE = 'import { useLoadExample } from "@/lib/load-example";';

let count = 0;
let skipped = 0;
let failed = 0;

for (const [slug, rel, hookLine] of tools) {
  const full = join(ROOT, rel);
  if (!existsSync(full)) {
    console.log("MISSING", rel);
    failed++;
    continue;
  }
  let src = readFileSync(full, "utf-8");
  if (src.includes("useLoadExample")) {
    console.log("skip (already wired)", slug);
    skipped++;
    continue;
  }
  if (!src.includes(IMPORT_LINE)) {
    const importRegex = /^(import[^\n]+\n)/gm;
    const matches = [...src.matchAll(importRegex)];
    if (matches.length === 0) {
      console.log("NO IMPORTS", slug);
      failed++;
      continue;
    }
    const last = matches[matches.length - 1];
    const pos = last.index + last[0].length;
    src = src.slice(0, pos) + IMPORT_LINE + "\n" + src.slice(pos);
  }
  if (!src.includes(hookLine)) {
    const lines = src.split("\n");
    let inserted = false;
    // Insert the hook after the LAST useState/useReducer that defines the
    // setter referenced by the hook. That way the setter is in scope and
    // any forward declarations (e.g. handleChange) are also defined.
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes("useState(") && (lines[i].includes("setInput") || lines[i].includes("setText"))) {
        lines.splice(i + 1, 0, "  " + hookLine);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      console.log("NO useState FOUND", slug);
      failed++;
      continue;
    }
    src = lines.join("\n");
  }
  writeFileSync(full, src, "utf-8");
  count++;
}
console.log({ count, skipped, failed });
