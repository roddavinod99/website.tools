import { siteConfig } from '@/lib/data/site-config';

type Tool = { slug: string; name: string; description: string };

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}

export function buildToolMetadata(tool: Tool) {
  // Extract action verb for title per spec §12.1 — fallback to description excerpt
  const actionMatch = tool.description.match(/^\s*(format|convert|generate|calculate|encode|decode|validate|hash|compress|beautify|minify|parse|render|sign|verify|encrypt|decrypt|lookup|sort|transform|create|extract|split|join|merge|compare|diff|translate|shorten|expand|measure|estimate|compute)\b/i);
  const titleRaw = actionMatch
    ? `${tool.name} — ${tool.description.slice(0, 30)} | DevStackIO`
    : `${tool.name} — ${truncate(tool.description, 30)} | DevStackIO`;
  const safeTitle = truncate(titleRaw, 60);
  const description = truncate(tool.description, 160);
  const canonical = `${siteConfig.url}/tools/${tool.slug}`;
  const ogImage = `${siteConfig.url}/og/${tool.slug}`;
  return {
    title: safeTitle,
    description,
    canonical,
    openGraph: {
      title: safeTitle,
      description,
      url: canonical,
      type: 'website' as const,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${tool.name} - DevStackIO` }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: safeTitle,
      description,
      images: [ogImage],
    },
  };
}
