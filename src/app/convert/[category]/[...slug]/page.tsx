import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, BookOpen, FileText, Calculator } from "lucide-react"
import { CircleHelp, ChevronDown } from "lucide-react";
import { siteConfig, allTools } from "@/lib/data";
import { LandingToolSection } from "@/components/landing/landing-tool-section";
import { EmbedWidget } from "@/components/embed-widget";
import { TrustBadges } from "@/components/tools/trust-badges";
import { AdBanner } from "@/components/ads";
import { adSlots } from "@/lib/data/ads";
import {
  getLandingPage,
  getCanonicalTool,
  listLandingPageParams,
  landingPageUrl,
  landingPages,
  type LandingPage,
} from "@/lib/seo/landing-pages";
import {
  breadcrumbList,
  faqPageJsonLd,
  webApplicationJsonLd,
  jsonLdScriptBody,
} from "@/lib/seo/json-ld";

interface Props {
  params: Promise<{ category: string; slug: string[] }>;
}

export function generateStaticParams() {
  return listLandingPageParams().map((p) => ({
    category: p.category,
    slug: [p.slug],
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const slugSeg = Array.isArray(slug) ? slug.join("/") : slug;
  const page = getLandingPage(category, slugSeg);
  if (!page) return {};
  const url = landingPageUrl(page, siteConfig.url);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    ...(page.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: `${siteConfig.url}/og/${page.canonicalSlug}`,
          width: 1200,
          height: 630,
          alt: `${page.title} - DevStackIO`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [`${siteConfig.url}/og/${page.canonicalSlug}`],
    },
  };
}

function formatCategoryLabel(category: string): string {
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function ConversionTable({ page }: { page: LandingPage }) {
  const table = page.content?.table;
  if (!table || table.length === 0) return null;
  return (
    <section className="mt-8 rounded-xl border border-surface-200 bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
      <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">
        Conversion table
      </h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 text-left text-xs uppercase tracking-wide text-surface-500 dark:border-dark-border dark:text-dark-muted">
              {table[0]?.label !== undefined && <th className="pb-2 pr-4">Reference</th>}
              <th className="pb-2 pr-4">From</th>
              <th className="pb-2">To</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr
                key={i}
                className="border-b border-surface-100 last:border-b-0 dark:border-dark-border"
              >
                {row.label !== undefined && (
                  <td className="py-2 pr-4 text-surface-600 dark:text-dark-muted">{row.label}</td>
                )}
                <td className="py-2 pr-4 font-mono text-surface-900 dark:text-dark-text">{row.from}</td>
                <td className="py-2 font-mono text-surface-900 dark:text-dark-text">{row.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SeeAlso({ page }: { page: LandingPage }) {
  const refs = page.content?.seeAlso;
  if (!refs || refs.length === 0) return null;
  return (
    <section className="mt-8 rounded-xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-bg">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-surface-500 dark:text-dark-muted">
        See also
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {refs.map((ref) => {
          // Each ref is a "<category>/<slug>" path so cross-references
          // are unambiguous across categories.
          const slashIndex = ref.indexOf("/");
          if (slashIndex === -1) return null;
          const refCategory = ref.slice(0, slashIndex);
          const refSlug = ref.slice(slashIndex + 1);
          const refPage = landingPages.find(
            (p) => p.category === refCategory && p.slug === refSlug && !p.noindex,
          );
          if (!refPage) return null;
          const href = `/convert/${refPage.category}/${refPage.slug}`;
          return (
            <li key={ref}>
              <Link
                href={href}
                className="group flex items-center justify-between gap-2 rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:border-brand-500 hover:text-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-brand-400 dark:hover:text-brand-400"
              >
                {refPage.title}
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FaqList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (faqs.length === 0) return null;
  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <details
          key={i}
          className="group rounded-lg border border-surface-200 bg-white px-4 py-3 dark:border-dark-border dark:bg-dark-surface"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-dark-text">
              <CircleHelp className="h-4 w-4 text-brand-500 dark:text-brand-400" aria-hidden="true" />
              {faq.question}
            </h3>
            <ChevronDown
              className="h-4 w-4 flex-shrink-0 text-surface-400 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-2 pl-6 text-sm text-surface-600 dark:text-dark-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export default async function LandingPageRoute({ params }: Props) {
  const { category, slug } = await params;
  const slugSeg = Array.isArray(slug) ? slug.join("/") : slug;
  const page = getLandingPage(category, slugSeg);
  if (!page) notFound();
  const tool = getCanonicalTool(page);
  if (!tool) notFound();

  const url = landingPageUrl(page, siteConfig.url);
  const categoryLabel = formatCategoryLabel(page.category);
  const toolEntry = allTools.find((t) => t.slug === page.canonicalSlug);
  const examples = (toolEntry as { examples?: string[] } | undefined)?.examples;

  const graphItems = [
    webApplicationJsonLd({
      name: page.title,
      description: page.description,
      url,
      applicationCategory: tool.category ?? "UtilitiesApplication",
      featureList: ["100% client-side", "Instant results", "No account required", "Privacy-first"],
      siteUrl: siteConfig.url,
    }),
    breadcrumbList([
      { name: "Home", url: siteConfig.url },
      { name: "Tools", url: `${siteConfig.url}/tools` },
      { name: categoryLabel, url: `${siteConfig.url}/convert/${page.category}` },
      { name: page.title, url },
    ]),
    ...(page.faq && page.faq.length > 0 ? [faqPageJsonLd(page.faq)] : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody({ "@context": "https://schema.org", "@graph": graphItems }) }}
      />
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-6">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm text-surface-500 dark:text-dark-muted"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-surface-900 dark:hover:text-dark-text">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href="/tools" className="hover:text-surface-900 dark:hover:text-dark-text">
              Tools
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link
              href={`/convert/${page.category}`}
              className="hover:text-surface-900 dark:hover:text-dark-text"
            >
              {categoryLabel}
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-surface-900 dark:text-dark-text">{page.title}</span>
          </nav>
        </div>
      </section>

      <div className="container py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <main>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-500 dark:text-brand-400">
              <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
              {categoryLabel}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
              {page.title}
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-surface-500 dark:text-dark-muted">
              {page.description}
            </p>
            {page.content?.intro && (
              <p className="mt-4 max-w-2xl text-base text-surface-600 dark:text-dark-muted">
                {page.content.intro}
              </p>
            )}

            <div className="mt-6">
              <TrustBadges />
            </div>

            <div className="mt-6 rounded-xl border border-surface-200 bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
              <LandingToolSection
                tool={{ slug: tool.slug, name: tool.name }}
                prefill={page.prefill}
                examples={examples}
              />
            </div>

            {page.content?.formula && (
              <section className="mt-8 rounded-xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-surface-500 dark:text-dark-muted">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Formula
                </h2>
                <p className="mt-2 font-mono text-base text-surface-900 dark:text-dark-text">
                  {page.content.formula}
                </p>
                {page.content.example && (
                  <p className="mt-3 text-sm text-surface-600 dark:text-dark-muted">
                    {page.content.example}
                  </p>
                )}
              </section>
            )}

            <ConversionTable page={page} />
            <SeeAlso page={page} />

            {page.faq && page.faq.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-surface-900 dark:text-dark-text">
                  Frequently asked questions
                </h2>
                <div className="mt-4">
                  <FaqList faqs={page.faq} />
                </div>
              </section>
            )}

            <section className="mt-10">
              <EmbedWidget slug={page.canonicalSlug} title={page.title} />
            </section>

            <AdBanner className="my-10" slot={adSlots.toolInContent1} />
          </main>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-bg">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-surface-500 dark:text-dark-muted">
                <FileText className="h-4 w-4" aria-hidden="true" />
                About this page
              </h3>
              <p className="mt-2 text-sm text-surface-600 dark:text-dark-muted">
                This page wraps the{" "}
                <Link
                  href={`/tools/${tool.slug}`}
                  className="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400"
                >
                  {tool.name}
                </Link>{" "}
                for the most-searched <strong>{page.intent}</strong> variant:{" "}
                <em>{page.title}</em>. The values below are pre-filled so the
                answer is immediately visible; use the tool above to compute
                any other value.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}
