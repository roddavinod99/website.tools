import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { learningTopics, siteConfig } from "@/lib/constants";

interface GuidesPageProps {
  searchParams: Promise<{ topic?: string }>;
}

export const metadata: Metadata = {
  title: "Guides",
  description: "Free developer guides from DevStackIO covering JSON, JWT, Base64, CSS minification, regex, timestamps, HTML encoding, and more.",
  alternates: { canonical: `${siteConfig.url}/guides` },
  openGraph: {
    title: "Developer Guides — DevStackIO Tools",
    description: "Free developer guides covering JSON, JWT, Base64, CSS minification, regex, timestamps, HTML encoding, and more.",
    url: `${siteConfig.url}/guides`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Guides — DevStackIO Tools",
    description: "Free developer guides from DevStackIO covering JSON, JWT, Base64, and more.",
    images: [siteConfig.ogImage],
  },
};

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const { topic } = await searchParams;
  const activeTopic = topic ? decodeURIComponent(topic) : null;
  const visibleTopics = activeTopic
    ? learningTopics.filter((t) => t.category === activeTopic)
    : learningTopics;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Guides" },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Developer Guides",
    description: "Free developer guides covering JSON, JWT, Base64, CSS minification, regex, timestamps, HTML encoding, and data serialization.",
    url: `${siteConfig.url}/guides`,
    numberOfItems: visibleTopics.length,
    itemListElement: visibleTopics.map((topic, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: topic.title,
      url: `${siteConfig.url}/guides/${topic.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
              Developer Guides
            </h1>
            <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
              In-depth guides to help you master development tools and practices
            </p>

            {activeTopic && (
              <div className="mt-4">
                <Link
                  href="/guides"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  ← Show all guides
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="border-t border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl">
            <div className="grid gap-4">
              {visibleTopics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/guides/${topic.slug}`}
                  className="group flex items-start gap-4 rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                      {topic.title}
                    </h3>
                    <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                      {topic.description}
                    </p>
                    <p className="mt-2 text-xs text-surface-400 dark:text-dark-muted">
                      {topic.category} · {topic.readTime} read
                    </p>
                  </div>
                  <ArrowRight className="mt-2 h-4 w-4 flex-shrink-0 text-surface-400" />
                </Link>
              ))}
            </div>

            {visibleTopics.length === 0 && (
              <div className="mt-8 rounded-xl border border-dashed border-surface-300 p-8 text-center text-sm text-surface-500 dark:border-dark-border dark:text-dark-muted">
                No guides found for this topic.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
