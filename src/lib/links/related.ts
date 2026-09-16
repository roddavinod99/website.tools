import { allTools } from '@/lib/data/tools';
import type { Tool } from '@/types';

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  const inter = [...sa].filter((x) => sb.has(x)).length;
  const uni = new Set([...sa, ...sb]).size;
  return uni === 0 ? 0 : inter / uni;
}

export function getRelatedTools(me: Tool, n = 8): Tool[] {
  const myKeywords = (me.keywords ?? []).map((k) => k.toLowerCase());
  const scored = allTools
    .filter((t) => t.slug !== me.slug)
    .map((t) => {
      const sameCat = t.category === me.category ? 5 : 0;
      const kw = jaccard(myKeywords, (t.keywords ?? []).map((k: string) => k.toLowerCase())) * 10;
      const pop = (t.popularity ?? 0) / 20;
      return { t, score: sameCat + kw + pop };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
  return scored.map((s) => s.t);
}
