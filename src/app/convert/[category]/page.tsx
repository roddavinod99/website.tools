import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calculator } from "lucide-react";
import { siteConfig } from "@/lib/data";
import { landingPages, listIndexableLandingPages, landingPageUrl } from "@/lib/seo/landing-pages";
import { breadcrumbList, collectionPage, jsonLdScriptBody } from "@/lib/seo/json-ld";

/**
 * /convert/[category] — category hub for long-tail pages.
 *
 * Google's guidance: "A page in a sitemap is a suggestion. A page linked
 * from your site navigation is a priority signal." Orphan pages (0 internal
 * links) stay in "Discovered – currently not indexed". This hub ensures
 * every /convert/* landing page is ≤2 clicks from /convert.
 *
 * Per https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 * we list only canonical, 200, indexable URLs here.
 */

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  // One hub per distinct base category (including nested like voltage-drop after fix)
  const cats = new Set(listIndexableLandingPages().map((p) => p.category));
  return Array.from(cats).map((category) => ({ category }));
}

function formatLabel(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const pages = listIndexableLandingPages().filter((p) => p.category === category);
  if (pages.length === 0) return {};
  const canonical = `${siteConfig.url}/convert/${category}`;
  const title = `${formatLabel(category)} Conversions & Calculations`;
  const description = `Browse ${pages.length} ${formatLabel(category).toLowerCase()} calculation pages — each pre-fills the browser-first tool with formula, table, and FAQ. 100% client-side.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} — DevStackIO`,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ConvertCategoryHub({ params }: Props) {
  const { category } = await params;
  const pages = listIndexableLandingPages().filter((p) => p.category === category);
  if (pages.length === 0) notFound();

  // Dedupe by slug for stable rendering
  const sorted = [...pages].sort((a, b) => a.slug.localeCompare(b.slug));
  const hubUrl = `${siteConfig.url}/convert/${category}`;
  const label = formatLabel(category);

  const breadcrumb = breadcrumbList([
    { name: "Home", url: siteConfig.url },
    { name: "Tools", url: `${siteConfig.url}/tools` },
    { name: "Convert", url: `${siteConfig.url}/convert` },
    { name: label, url: hubUrl },
  ]);

  const collection = collectionPage({
    name: `${label} Conversions`,
    description: `All ${pages.length} ${label.toLowerCase()} pages: pre-filled, browser-first, privacy-safe.`,
    url: hubUrl,
    items: sorted.map((p) => ({
      name: p.title,
      url: landingPageUrl(p, siteConfig.url),
      description: p.description,
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(collection) }} />

      <section className="border-b border-[var(--color-border)]">
        <div className="container py-6">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-text)]">Home</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href="/tools" className="hover:text-[var(--color-text)]">Tools</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href="/convert" className="hover:text-[var(--color-text)]">Convert</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-[var(--color-text)]">{label}</span>
          </nav>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-400">
            <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </div>
          <h1 className="mt-3 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">{label} conversions</h1>
          <p className="mt-2 text-lg text-[var(--color-text-muted)]">
            {pages.length} pre-filled pages for the most-searched {label.toLowerCase()} queries. Each page wraps the{" "}
            {sorted[0] && (() => {
              const toolSlug = sorted[0].canonicalSlug;
              return (
                <Link href={`/tools/${toolSlug}`} className="font-medium text-blue-700 dark:text-blue-400 underline">
                  {toolSlug.replace(/-/g, " ")}
                </Link>
              );
            })()}{" "}
            so the answer is visible immediately.
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Internal linking hub per Google crawl-budget guidance: every page below is linked from here and from{" "}
            <Link href="/convert" className="font-medium text-blue-700 dark:text-blue-400 underline">
              /convert
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => (
            <li key={`${p.category}/${p.slug}`}>
              <Link
                href={`/convert/${p.category}/${p.slug}`}
                className="flex h-full flex-col justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]"
              >
                <span className="font-medium text-[var(--color-text)]">{p.title}</span>
                <span className="mt-1 line-clamp-2 text-xs text-[var(--color-text-muted)]">{p.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
