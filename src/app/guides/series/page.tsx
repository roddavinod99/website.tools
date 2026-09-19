import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/data";
import { seriesList, getSeriesGuides } from "@/lib/data/series";
import { breadcrumbList, jsonLdScriptBody } from "@/lib/seo/json-ld";

const SERIES_URL = `${siteConfig.url}/guides/series`;

export const metadata: Metadata = {
  title: "Learning Paths — DevStackIO Guides",
  description: "Curated learning paths for formatters, security, and image workflows. Follow structured series to master DevStackIO tools.",
  alternates: { canonical: SERIES_URL },
  openGraph: {
    title: "Learning Paths — DevStackIO",
    description: "Curated series for formatters, security, and image workflows.",
    url: SERIES_URL,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Learning Paths" }],
  },
};

export default function SeriesListing() {
  const breadcrumb = breadcrumbList([
    { name: "Home", url: siteConfig.url },
    { name: "Guides", url: `${siteConfig.url}/guides` },
    { name: "Series", url: SERIES_URL },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Learning Paths",
    url: SERIES_URL,
    numberOfItems: seriesList.length,
    itemListElement: seriesList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: s.title,
        description: s.description,
        url: `${SERIES_URL}/${s.slug}`,
        provider: { "@type": "Organization", name: "DevStackIO", url: siteConfig.url },
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(itemList) }} />
      <section className="border-b border-[var(--color-border)]">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">Learning Paths</h1>
            <p className="mt-3 text-lg text-[var(--color-text-muted)]">Follow curated series — formatter mastery, security foundations, image workflows — with linked guides and tools.</p>
          </div>
        </div>
      </section>
      <section className="container py-10 md:py-12">
        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {seriesList.map((s) => {
            const guides = getSeriesGuides(s);
            return (
              <Link key={s.slug} href={`/guides/series/${s.slug}`} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:border-[var(--color-accent)] transition-colors">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">{s.category}</span>
                <h2 className="mt-2 text-lg font-semibold text-[var(--color-text)]">{s.title}</h2>
                <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-3">{s.description}</p>
                <p className="mt-3 text-xs text-[var(--color-text-muted)]">{guides.length} guides</p>
                <span className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)]">View series →</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
