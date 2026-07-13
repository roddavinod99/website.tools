import type { Tool } from "@/types";

/**
 * Calculate relevance score for a tool based on search query.
 * Higher score = more relevant match.
 */
function calculateScore(tool: Tool, query: string): number {
  const name = tool.name.toLowerCase();
  const description = tool.description.toLowerCase();
  const category = tool.category.toLowerCase();

  let score = 0;

  if (name === query) {
    score = 100;
  } else if (name.startsWith(query)) {
    score = 80;
  } else if (` ${name} `.includes(` ${query} `)) {
    score = 60;
  } else if (name.includes(query)) {
    score = 40;
  } else if (description.includes(query)) {
    score = 20;
  } else if (category.includes(query)) {
    score = 10;
  }

  if (score > 0) {
    score += (tool.popularity / 100) * 5;
  }

  return score;
}

/**
 * Search and rank tools by relevance.
 * Returns tools sorted by score (highest first), excluding zero-score matches.
 */
export function searchTools(allTools: Tool[], query: string): Tool[] {
  if (!query) return [];

  const q = query.toLowerCase().trim();

  const scored = allTools
    .map((tool) => ({ tool, score: calculateScore(tool, q) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((item) => item.tool);
}
