import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { allTools, categories, siteConfig, TOOL_COUNT } from "@/lib/constants";
import { featuresBySlug } from "@/lib/data/tool-features";
import { ToolCard } from "@/components/ui/tool-card";
import { Search } from "lucide-react";
import { AdBanner } from "@/components/ads";

const toolCountText = `${TOOL_COUNT} free online developer tools`;

export const metadata: Metadata = {
  title: "All Tools",
  description: `Browse ${toolCountText} from DevStackIO. JSON formatters, JWT decoders, UUID generators, image compressors, and more — all client-side.`,
  alternates: { canonical: `${siteConfig.url}/tools` },
  openGraph: {
    title: "All Developer Tools — DevStackIO",
    description: `Browse ${toolCountText} from DevStackIO. Format, encode, generate, and analyze data entirely in your browser.`,
    url: `${siteConfig.url}/tools`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Developer Tools — DevStackIO",
    description: `Browse ${toolCountText} from DevStackIO. Format, encode, generate, and analyze data entirely in your browser.`,
    images: [siteConfig.ogImage],
  },
};

export default function ToolsPage() {
  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Developer Tools",
    description: "Browse our complete collection of free online developer tools. JSON formatter, JWT decoder, UUID generator, Base64 encoder, and more — all client-side, privacy-first.",
    url: `${siteConfig.url}/tools`,
    mainEntity: {
      "@type": "ItemList",
      name: "All Developer Tools",
      description: "Browse our complete collection of free online developer tools. JSON formatter, JWT decoder, UUID generator, Base64 encoder, and more — all client-side, privacy-first.",
      url: `${siteConfig.url}/tools`,
      numberOfItems: allTools.length,
      itemListElement: allTools.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: tool.name,
        url: `${siteConfig.url}/tools/${tool.slug}`,
      })),
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Tools" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
              All Tools
            </h1>
            <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
              {allTools.length} free tools. No login required.
            </p>
            <p className="mt-4 text-surface-600 dark:text-dark-muted">
              DevStackIO offers a growing library of free online developer tools that run entirely in your
              browser. Format and validate JSON, decode JWT tokens, generate UUIDs, encode and decode
              Base64, compress images, and much more &mdash; all without uploading your data or creating an
              account. Every utility processes locally on your device to keep your information private. Use
              the search box or category filters below to find the right tool for the task.
            </p>
            <form action="/search" method="GET" className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
              <input
                name="q"
                placeholder="Search tools..."
                className="flex h-12 w-full rounded-lg border border-surface-200 bg-white pl-10 pr-4 text-base text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
              />
            </form>
          </div>
        </div>
      </section>

      <AdBanner className="my-12" slot="4567890123" />

      <section className="container py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/tools"
            className="rounded-full border border-brand-primary bg-brand-primary px-4 py-1.5 text-sm font-medium text-white"
          >
            All
          </Link>
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="rounded-full border border-surface-200 px-4 py-1.5 text-sm text-surface-600 transition-colors hover:bg-surface-200 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allTools.map((tool, index) => (
            <Fragment key={tool.id}>
              {index === Math.floor(allTools.length / 2) && (
                <div className="col-span-full">
                  <AdBanner className="my-8" slot="5678901234" />
                </div>
              )}
              <ToolCard
                tool={{
                  id: tool.id,
                  name: tool.name,
                  description: tool.description,
                  category: tool.category,
                  slug: tool.slug,
                  popularity: tool.popularity,
                  featured: tool.featured,
                  trending: tool.trending,
                  new: tool.new,
                  icon: tool.icon,
                  features: featuresBySlug[tool.slug],
                }}
                variant="default"
                size="md"
              />
            </Fragment>
          ))}
        </div>
      </section>
    </>
  );
}