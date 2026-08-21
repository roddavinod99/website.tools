#!/usr/bin/env node
/**
 * SEO content audit for tool pages.
 *
 * Scans every src/content/tools/*.json file, computes content-depth
 * metrics, and flags "thin" tool pages — pages whose on-page copy is too
 * shallow to support a featured snippet or long-tail ranking.
 *
 * Usage:
 *   node scripts/seo-content-audit.mjs            # full report (all tools)
 *   node scripts/seo-content-audit.mjs --thin     # only thin tools
 *   node scripts/seo-content-audit.mjs --top 40   # only the N thinnest by popularity weight
 */

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "..", "src", "content", "tools");
const toolsFile = path.join(__dirname, "..", "src", "lib", "data", "tools.ts");

const args = new Set(process.argv.slice(2));
const topOnly = args.has("--top");
const topN = Number(process.argv[process.argv.indexOf("--top") + 1] ?? 40);
const thinOnly = args.has("--thin");

function words(str) {
  if (!str) return 0;
  return String(str).trim().split(/\s+/).filter(Boolean).length;
}

function parseTools() {
  const src = readFileSync(toolsFile, "utf-8");
  const tools = [];
  const entryRegex = /\{\s*id:\s*"[^"]+",\s*name:\s*"[^"]+",[^}]*slug:\s*"([^"]+)",[^}]*popularity:\s*(\d+)/g;
  let match;
  while ((match = entryRegex.exec(src)) !== null) {
    tools.push({ slug: match[1], popularity: Number(match[2]) });
  }
  return tools;
}

function readToolContent(slug) {
  const file = path.join(contentDir, `${slug}.json`);
  try {
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch {
    return null;
  }
}

function summarize(content) {
  if (!content) return null;
  const sections = {
    whatItDoes: words(content.whatItDoes),
    whyItExists: words(content.whyItExists),
    whoShouldUse: words(content.whoShouldUse),
    useCases: (content.useCases ?? []).reduce((n, x) => n + words(x), 0),
    instructions: (content.instructions ?? []).reduce((n, x) => n + words(x), 0),
    examples: (content.examples ?? []).reduce((n, x) => n + words(x), 0),
    bestPractices: (content.bestPractices ?? []).reduce((n, x) => n + words(x), 0),
    commonMistakes: (content.commonMistakes ?? []).reduce((n, x) => n + words(x), 0),
    faq: (content.faq ?? []).reduce((n, x) => n + words(x), 0),
  };
  const total = Object.values(sections).reduce((n, x) => n + x, 0);
  const faqCount = (content.faq ?? []).length;
  return { sections, total, faqCount };
}

const slugs = parseTools();
const rows = [];

for (const { slug, popularity } of slugs) {
  const content = readToolContent(slug);
  const summary = summarize(content);
  if (!summary) continue;
  const score = summary.total;
  rows.push({
    slug,
    popularity,
    total: score,
    faqCount: summary.faqCount,
    useCases: summary.sections.useCases,
    instructions: summary.sections.instructions,
    examples: summary.sections.examples,
    bestPractices: summary.sections.bestPractices,
    commonMistakes: summary.sections.commonMistakes,
    faq: summary.sections.faq,
  });
}

rows.sort((a, b) => a.total - b.total);

const isThin = (r) =>
  r.total < 280 ||
  r.useCases < 40 ||
  r.instructions < 40 ||
  r.examples < 20 ||
  r.bestPractices < 40 ||
  r.commonMistakes < 40 ||
  r.faq < 40 ||
  r.faqCount < 3;

let report = rows;
if (thinOnly) report = report.filter(isThin);
if (topOnly) report = report.slice(0, topN);

console.log("Total tool content files:", rows.length);
console.log("Thin tools:", rows.filter(isThin).length);
console.log("");
console.log("slug | total_words | popularity | faq_count | use_cases | instructions | examples | best_practices | common_mistakes | faq_words");
console.log("-----|-------------|------------|-----------|-----------|--------------|----------|----------------|-----------------|----------");
for (const r of report) {
  console.log(
    [r.slug, r.total, r.popularity, r.faqCount, r.useCases, r.instructions, r.examples, r.bestPractices, r.commonMistakes, r.faq].join(" | ")
  );
}

console.log("");
console.log("--- THIN LIST RANKED BY POPULARITY (highest-value thin pages) ---");
const thinByValue = rows.filter(isThin).sort((a, b) => b.popularity - a.popularity);
for (const r of thinByValue) {
  console.log(
    `${r.slug}: pop=${r.popularity} total=${r.total} faq=${r.faqCount} useCases=${r.useCases} instr=${r.instructions} examples=${r.examples} bp=${r.bestPractices} mistakes=${r.commonMistakes} faqWords=${r.faq}`
  );
}