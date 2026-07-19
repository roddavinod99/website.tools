import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ChangelogEntry, ChangeCategory } from "./types";
import { detectDuplicateChangelogEntry } from "./validation";

const CHANGELOG_FILENAME = "CHANGELOG.md";

function getRoot(): string {
  return process.cwd();
}

function getChangelogPath(): string {
  return join(getRoot(), CHANGELOG_FILENAME);
}

export function readChangelog(): ChangelogEntry[] {
  const path = getChangelogPath();
  try {
    const content = readFileSync(path, "utf-8");
    return parseChangelogContent(content);
  } catch {
    return [];
  }
}

function parseChangelogContent(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = content.split("\n");
  let currentCategory: ChangeCategory | null = null;

  for (const line of lines) {
    const categoryMatch = line.match(/^###\s+(.+)/);
    if (categoryMatch) {
      const categoryName = categoryMatch[1].toLowerCase().trim();
      currentCategory = mapCategoryName(categoryName);
      continue;
    }

    const entryMatch = line.match(/^-\s+(.+)/);
    if (entryMatch && currentCategory) {
      entries.push({
        type: currentCategory,
        description: entryMatch[1].trim(),
      });
    }
  }

  return entries;
}

function mapCategoryName(name: string): ChangeCategory | null {
  const map: Record<string, ChangeCategory> = {
    added: "added",
    changed: "changed",
    deprecated: "deprecated",
    removed: "removed",
    fixed: "fixed",
    security: "security",
    performance: "performance",
    refactored: "refactored",
    infrastructure: "infrastructure",
    seo: "seo",
    accessibility: "accessibility",
    documentation: "documentation",
    dx: "dx",
  };
  return map[name] || null;
}

function categoryToHeading(category: ChangeCategory): string {
  const map: Record<ChangeCategory, string> = {
    added: "Added",
    changed: "Changed",
    deprecated: "Deprecated",
    removed: "Removed",
    fixed: "Fixed",
    security: "Security",
    performance: "Performance",
    refactored: "Refactored",
    infrastructure: "Infrastructure",
    seo: "SEO",
    accessibility: "Accessibility",
    documentation: "Documentation",
    dx: "Developer Experience",
  };
  return map[category];
}

export function appendToChangelog(
  entries: ChangelogEntry[],
  version: string,
  date: string
): { appended: number; skipped: number } {
  const path = getChangelogPath();
  let content: string;
  try {
    content = readFileSync(path, "utf-8");
  } catch {
    content = "# Changelog\n\n";
  }

  const existing = parseChangelogContent(content);

  const grouped = groupEntriesByCategory(entries);
  let newSection = `\n## [${version}] - ${date}\n`;

  let appended = 0;
  let skipped = 0;

  for (const [category, categoryEntries] of Object.entries(grouped)) {
    let added = false;
    for (const entry of categoryEntries) {
      if (detectDuplicateChangelogEntry(existing, entry)) {
        skipped++;
        continue;
      }
      if (!added) {
        newSection += `\n### ${categoryToHeading(category as ChangeCategory)}\n`;
        added = true;
        appended++;
      }
      newSection += `\n- ${entry.description}`;
      appended++;
    }
  }

  if (appended <= 0) return { appended: 0, skipped };

  const templateIndex = content.indexOf("\n## Template");
  const insertPoint = templateIndex >= 0 ? templateIndex : content.length;
  content = content.slice(0, insertPoint) + newSection + content.slice(insertPoint);

  writeFileSync(path, content, "utf-8");
  return { appended, skipped };
}

function groupEntriesByCategory(
  entries: ChangelogEntry[]
): Partial<Record<ChangeCategory, ChangelogEntry[]>> {
  const grouped: Partial<Record<ChangeCategory, ChangelogEntry[]>> = {};
  for (const entry of entries) {
    if (!grouped[entry.type]) {
      grouped[entry.type] = [];
    }
    grouped[entry.type]!.push(entry);
  }
  return grouped;
}

export function generateReleaseNotes(
  version: string,
  entries: ChangelogEntry[]
): string {
  const grouped = groupEntriesByCategory(entries);
  const lines: string[] = [`# Release ${version}\n`];

  const order: ChangeCategory[] = [
    "added", "changed", "fixed", "security", "performance",
    "removed", "refactored", "infrastructure", "seo",
    "accessibility", "dx", "documentation", "deprecated",
  ];

  for (const cat of order) {
    const catEntries = grouped[cat];
    if (!catEntries || catEntries.length === 0) continue;

    lines.push(`## ${categoryToHeading(cat)}\n`);
    for (const entry of catEntries) {
      lines.push(`- ${entry.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
