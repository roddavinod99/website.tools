import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/data";
import { seriesList, getSeries, getSeriesGuides } from "@/lib/data/series";
import { breadcrumbList, jsonLdScriptBody } from "@/lib/seo/json-ld";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return seriesList.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = getSeries(slug);
  if (!series) return {};
  const url = `${siteConfig.url}/guides/series/${series.slug}`;
  return {
    title: `${series.title} — Learning Path | DevStackIO`,
    description: series.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${series.title} — DevStackIO`,
      description: series.description,
      url,
      siteName: "DevStackIO Tools",
      type: "website",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: series.title }],
    },
  };
}

export default async function SeriesDetail({ params }: Props) {
  const { slug } = await params;
  const series = getSeries(slug);
  if (!series) notFound();
  const guides = getSeriesGuides(series);
  const url = `${siteConfig.url}/guides/series/${series.slug}`;

  const breadcrumb = breadcrumbList([
    { name: "Home", url: siteConfig.url },
    { name: "Guides", url: `${siteConfig.url}/guides` },
    { name: "Series", url: `${siteConfig.url}/guides/series` },
    { name: series.title, url },
  ]);

  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: series.title,
    description: series.description,
    url,
    provider: { "@type": "Organization", name: "DevStackIO", url: siteConfig.url },
    hasCourseInstance: guides.map((g) => ({
      "@type": "CourseInstance",
      name: g.title,
      description: g.description,
      url: `${siteConfig.url}/guides/${g.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(course) }} />
      <nav aria-label="Breadcrumb" className="border-b border-[var(--color-border)]">
        <div className="container py-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
            <li><Link href="/" className="hover:text-[var(--color-text)] hover:underline">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/guides" className="hover:text-[var(--color-text)] hover:underline">Guides</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/guides/series" className="hover:text-[var(--color-text)] hover:underline">Series</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-[var(--color-text)]">{series.title}</li>
          </ol>
        </div>
      </nav>
      <section className="border-b border-[var(--color-border)]">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">{series.category}</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">{series.title}</h1>
            <p className="mt-3 text-lg text-[var(--color-text-muted)]">{series.description}</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{guides.length} guides — follow in order</p>
          </div>
        </div>
      </section>
      <section className="container py-10 md:py-12">
        <div className="mx-auto max-w-3xl space-y-4">
          {guides.map((g, idx) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)] transition-colors">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-sm font-semibold text-[var(--color-accent)]">{idx + 1}</span>
                <div className="flex-1">
                  <h2 className="font-medium text-[var(--color-text)]">{g.title}</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{g.description}</p>
                  <span className="mt-2 inline-block text-xs text-[var(--color-text-muted)]">{g.readTime} · {g.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
