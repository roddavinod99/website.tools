import type { Metadata } from "next";
import { Suspense } from "react";
import { learningTopics, siteConfig } from "@/lib/constants";
import { GuidesList } from "./guides-list";

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
  numberOfItems: learningTopics.length,
  itemListElement: learningTopics.map((topic, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: topic.title,
    url: `${siteConfig.url}/guides/${topic.slug}`,
  })),
};

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const resolvedParams = await searchParams;
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
          </div>
        </div>
      </div>

      <section className="border-t border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl">
            <GuidesList topics={learningTopics} initialTopic={resolvedParams.topic ?? null} />
          </div>
        </div>
      </section>
    </>
  );
}