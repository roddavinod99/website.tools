import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowRight, Zap } from "lucide-react";
import { siteConfig, allTools } from "@/lib/data";
import { comparisons, getComparison } from "@/lib/data/comparisons";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return comparisons.map((comparison) => ({ slug: comparison.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) return {};
  const canonical = `${siteConfig.url}/compare/${comparison.slug}`;
  const dynamicOgImage = `${siteConfig.url}/og/${comparison.slug}`;
  return {
    title: comparison.title,
    description: comparison.description,
    alternates: { canonical },
    openGraph: {
      title: comparison.title,
      description: comparison.description,
      url: canonical,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: comparison.published,
      modifiedTime: comparison.modified,
      images: [{ url: dynamicOgImage, width: 1200, height: 630, alt: `${comparison.title} - DevStackIO` }],
    },
    twitter: {
      card: "summary_large_image",
      title: comparison.title,
      description: comparison.description,
      images: [dynamicOgImage],
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) notFound();
  const canonical = `${siteConfig.url}/compare/${comparison.slug}`;
  const dynamicOgImage = `${siteConfig.url}/og/${comparison.slug}`;

  const toolLinks = comparison.tools
    .map((toolSlug) => allTools.find((t) => t.slug === toolSlug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const graphItems = [
    {
      "@type": "TechArticle",
      headline: comparison.title,
      description: comparison.description,
      url: canonical,
      datePublished: comparison.published,
      dateModified: comparison.modified,
      image: dynamicOgImage,
      author: {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/favicon.svg`,
        },
      },
      publisher: {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/favicon.svg`,
        },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Compare", item: `${siteConfig.url}/compare` },
        { "@type": "ListItem", position: 3, name: comparison.title, item: canonical },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: comparison.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": graphItems,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-[var(--color-border)]">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Link href="/" className="hover:text-[var(--color-text)]">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/compare" className="hover:text-[var(--color-text)]">Compare</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[var(--color-text)]">{comparison.title}</span>
          </nav>
        </div>
      </section>
      <article className="prose container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent)] dark:text-[var(--color-accent)]">
            {comparison.category}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            {comparison.title}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">{comparison.intro}</p>

          <div className="mt-10 space-y-10">
            {comparison.sections.map((section, index) => (
              <section key={section.title}>
                <h2 className="flex items-start gap-3 text-2xl font-semibold text-[var(--color-text)]">
                  <span className="text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                    {index + 1}.
                  </span>
                  {section.title}
                </h2>
                <p className="mt-3 leading-relaxed text-[var(--color-text-muted)]">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          {toolLinks.length > 0 && (
            <div className="mt-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
                <Zap className="h-5 w-5 text-[var(--color-accent)] dark:text-[var(--color-accent)]" />
                Try the tools
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Run these conversions and checks instantly in your browser — no data leaves your device.
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {toolLinks.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-[var(--color-text)] dark:hover:border-[var(--color-accent)] dark:hover:text-[var(--color-accent)]"
                    >
                      {tool.name}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {comparison.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                Frequently Asked Questions
              </h2>
              <div className="mt-6 space-y-4">
                {comparison.faq.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-lg border border-[var(--color-border)] bg-white p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-3 font-medium text-[var(--color-text)]">
                      {item.question}
                      <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="mt-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              More comparisons
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Explore side-by-side guides for other developer tools and formats.
            </p>
            <Link
              href="/compare"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] dark:hover:bg-[var(--color-accent)]"
            >
              View all comparisons
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}