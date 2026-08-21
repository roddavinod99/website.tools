import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowRight, Zap } from "lucide-react";
import { siteConfig, allTools } from "@/lib/constants";
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
    },
    twitter: {
      card: "summary_large_image",
      title: comparison.title,
      description: comparison.description,
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) notFound();
  const canonical = `${siteConfig.url}/compare/${comparison.slug}`;

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
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-muted">
            <Link href="/" className="hover:text-surface-900 dark:hover:text-dark-text">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/compare" className="hover:text-surface-900 dark:hover:text-dark-text">Compare</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-surface-900 dark:text-dark-text">{comparison.title}</span>
          </nav>
        </div>
      </section>
      <article className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-500 dark:text-brand-400">
            {comparison.category}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            {comparison.title}
          </h1>
          <p className="mt-4 text-lg text-surface-500 dark:text-dark-muted">{comparison.intro}</p>

          <div className="mt-10 space-y-10">
            {comparison.sections.map((section, index) => (
              <section key={section.title}>
                <h2 className="flex items-start gap-3 text-2xl font-semibold text-surface-900 dark:text-dark-text">
                  <span className="text-brand-500 dark:text-brand-400">
                    {index + 1}.
                  </span>
                  {section.title}
                </h2>
                <p className="mt-3 leading-relaxed text-surface-600 dark:text-dark-muted">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          {toolLinks.length > 0 && (
            <div className="mt-12 rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-dark-border dark:bg-dark-surface">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-dark-text">
                <Zap className="h-5 w-5 text-brand-500 dark:text-brand-400" />
                Try the tools
              </h2>
              <p className="mt-2 text-sm text-surface-500 dark:text-dark-muted">
                Run these conversions and checks instantly in your browser — no data leaves your device.
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {toolLinks.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group flex items-center justify-between gap-2 rounded-lg border border-surface-200 bg-white px-4 py-3 text-sm font-medium text-surface-700 transition-colors hover:border-brand-500 hover:text-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-brand-400 dark:hover:text-brand-400"
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
              <h2 className="text-2xl font-semibold text-surface-900 dark:text-dark-text">
                Frequently Asked Questions
              </h2>
              <div className="mt-6 space-y-4">
                {comparison.faq.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-lg border border-surface-200 bg-white p-5 dark:border-dark-border dark:bg-dark-surface"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-3 font-medium text-surface-900 dark:text-dark-text">
                      {item.question}
                      <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-surface-600 dark:text-dark-muted">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="mt-12 rounded-xl border border-surface-200 bg-surface-50 p-6 text-center dark:border-dark-border dark:bg-dark-surface">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">
              More comparisons
            </h2>
            <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted">
              Explore side-by-side guides for other developer tools and formats.
            </p>
            <Link
              href="/compare"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 dark:hover:bg-brand-400"
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