import { allTools } from '@/lib/data/tools';
import { COMPARISON_HINTS } from './comparison-hints';

export type CompareData = {
  canonical: string;
  left: { slug: string; name: string; description: string; category: string };
  right: { slug: string; name: string; description: string; category: string };
  rows: Array<{ label: string; a: string; b: string }>;
  aWhen: string;
  bWhen: string;
  verdict: string;
};

function canonicalPair(a: string, b: string): { canonical: string; left: string; right: string } {
  const [lo, hi] = [a, b].sort();
  return { canonical: `${lo}-vs-${hi}`, left: lo, right: hi };
}

export function buildCompare(a: string, b: string): CompareData | null {
  const ta = allTools.find(t => t.slug === a);
  const tb = allTools.find(t => t.slug === b);
  if (!ta || !tb) return null;
  const pair = canonicalPair(a, b);
  const hint = COMPARISON_HINTS[`${ta.slug}|${tb.slug}`] ?? COMPARISON_HINTS[`${tb.slug}|${ta.slug}`];
  const rows = [
    { label: 'Description', a: ta.description, b: tb.description },
    { label: 'Category', a: ta.category, b: tb.category },
    { label: 'Works offline', a: 'Yes', b: 'Yes' },
    { label: 'Popularity', a: String(ta.popularity ?? 0), b: String(tb.popularity ?? 0) },
  ];
  return {
    canonical: `/compare/${pair.canonical}`,
    left: { slug: ta.slug, name: ta.name, description: ta.description, category: ta.category },
    right: { slug: tb.slug, name: tb.name, description: tb.description, category: tb.category },
    rows,
    aWhen: hint?.a ?? `Use ${ta.name} for ${ta.category.toLowerCase()}.`,
    bWhen: hint?.b ?? `Use ${tb.name} for ${tb.category.toLowerCase()}.`,
    verdict: hint?.verdict ?? 'Both are useful — pick based on your stack.',
  };
}
