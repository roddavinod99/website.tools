import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/data";
import { comparisons } from "@/lib/data/comparisons";

export const metadata: Metadata = {
  title: "Compare Developer Tools",
  description: "Side-by-side comparisons of developer tools and formats: Base64 vs URL encoding, JSON vs YAML vs XML vs TOML, MD5 vs SHA-256, bcrypt vs Argon2, and more.",
  alternates: { canonical: `${siteConfig.url}/compare` },
  openGraph: {
    title: "Compare Developer Tools — DevStackIO Tools",
    description: "Side-by-side comparisons of developer tools and formats to help you choose the right one.",
    url: `${siteConfig.url}/compare`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Comparisons" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Developer Tools — DevStackIO Tools",
    description: "Side-by-side comparisons of developer tools and formats.",
    images: [siteConfig.ogImage],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
    { "@type": "ListItem", position: 2, name: "Compare" },
  ],
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Compare Developer Tools",
  description: "Side-by-side comparisons of developer tools and formats.",
  url: `${siteConfig.url}/compare`,
  publisher: {
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
  },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: comparisons.map((comparison, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: comparison.title,
      description: comparison.description,
      url: `${siteConfig.url}/compare/${comparison.slug}`,
    })),
  },
};

const categories = [...new Set(comparisons.map((c) => c.category))];

export default function ComparePage() {
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
      <div className="border-b border-[var(--color-border)]">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Link href="/" className="hover:text-[var(--color-text)]">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[var(--color-text)]">Compare</span>
            </nav>
            <h1 className="mt-6 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
              Compare Developer Tools
            </h1>
            <p className="mt-3 text-lg text-[var(--color-text-muted)]">
              Side-by-side guides to help you choose the right encoding, hash, encryption, or data format for the job.
            </p>
          </div>
        </div>
      </div>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl space-y-12">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  {category}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {comparisons
                    .filter((c) => c.category === category)
                    .map((comparison) => (
                      <Link
                        key={comparison.slug}
                        href={`/compare/${comparison.slug}`}
                        className="group flex flex-col rounded-lg border border-[var(--color-border)] bg-white p-5 transition-colors hover:border-[var(--color-accent)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:hover:border-[var(--color-accent)]"
                      >
                        <h3 className="font-semibold text-[var(--color-text)]">
                          {comparison.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm text-[var(--color-text-muted)]">
                          {comparison.description}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                          Read comparison
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
