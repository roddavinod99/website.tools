import { execSync } from 'node:child_process';
import { TOOL_LASTMOD } from '@/lib/seo/__generated__/tool-lastmod';

export function getLastModified(slug: string, kind: 'tool' | 'guide' | 'blog'): string {
  if (kind === 'tool' && TOOL_LASTMOD[slug]) {
    return new Date(TOOL_LASTMOD[slug]!).toISOString();
  }
  const path = kind === 'tool'
    ? `src/content/tools/${slug}.json`
    : kind === 'guide'
      ? `src/content/guides/${slug}.md`
      : `src/content/blog/${slug}.md`;
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${path}"`, { encoding: 'utf8' }).trim();
    return iso || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}
