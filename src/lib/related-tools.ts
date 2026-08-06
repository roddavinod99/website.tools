import type { Tool } from "@/types";

const STOPWORDS = new Set([
  "encoder", "decoder", "formatter", "converter", "generator", "minifier",
  "validator", "tool", "online", "free", "checker", "parser", "maker",
]);

function tokenize(value: string): Set<string> {
  const tokens = new Set<string>();
  value
    .toLowerCase()
    .replace(/\//g, " ")
    .replace(/[-_]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .forEach((t) => tokens.add(t));
  return tokens;
}

export function toolTokenSet(tool: Pick<Tool, "name" | "keywords">): Set<string> {
  const tokens = tokenize(tool.name);
  (tool.keywords ?? []).forEach((k) => {
    tokenize(k).forEach((t) => tokens.add(t));
  });
  return tokens;
}

export interface RelatedGroups {
  sameCategory: Tool[];
  related: Tool[];
  popular: Tool[];
}

interface Scored {
  tool: Tool;
  score: number;
  reason: "category" | "keyword";
}

/**
 * Recommends relevant, indexable tools for a given tool page.
 * Scoring:
 *  - same category → strong base weight + popularity
 *  - shared keywords/tokens → keyword weight (supports cross-category linking)
 *  - otherwise popularity
 * Excludes the tool itself and noindex tools so only indexable pages are linked.
 */
export function findRelatedTools(
  tool: Tool,
  allTools: Tool[]
): RelatedGroups {
  const sourceTokens = toolTokenSet(tool);

  const scored: Scored[] = [];
  for (const candidate of allTools) {
    if (candidate.id === tool.id || candidate.noindex) continue;

    const candTokens = toolTokenSet(candidate);
    let overlap = 0;
    candTokens.forEach((t) => {
      if (sourceTokens.has(t) || candidate.name.toLowerCase().includes(t)) overlap++;
    });

    let score = 0;
    let reason: Scored["reason"] = "keyword";

    if (candidate.category === tool.category) {
      score += 40 + Math.min(candidate.popularity, 60);
      reason = "category";
    } else {
      score += Math.min(candidate.popularity, 20);
    }
    if (overlap > 0) score += overlap * 6;

    if (score > 0) scored.push({ tool: candidate, score, reason });
  }

  scored.sort((a, b) => b.score - a.score);

  const sameCategory = scored
    .filter((s) => s.reason === "category")
    .slice(0, 4)
    .map((s) => s.tool);

  const sameCategoryIds = new Set(sameCategory.map((t) => t.id));
  const related = scored
    .filter((s) => !sameCategoryIds.has(s.tool.id) && s.reason === "keyword")
    .slice(0, 6)
    .map((s) => s.tool);

  const usedIds = new Set([
    ...sameCategory.map((t) => t.id),
    ...related.map((t) => t.id),
  ]);
  const popular = allTools
    .filter((t) => t.id !== tool.id && !t.noindex && !usedIds.has(t.id))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 3)
    .map((t) => t);

  return { sameCategory, related, popular };
}