import type { Metadata } from "next";
import Link from "next/link";
import { allTools, siteConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Popular Tools",
  description: "Most used free developer tools on DevStackIO — JSON formatter, JWT decoder, UUID generator, Base64 encoder, and more. Rated by the community.",
  alternates: { canonical: `${siteConfig.url}/popular` },
};

export default function PopularPage() {
  const tools = [...allTools].sort((a, b) => b.popularity - a.popularity);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Popular Tools" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Popular Tools
          </h1>
          <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
            The most used tools by our community
          </p>
          <div className="mt-8 grid gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="flex items-start justify-between">
                  <Badge variant="default">{tool.category}</Badge>
                  <span className="text-xs text-surface-400 dark:text-dark-muted">
                    Popularity {tool.popularity}%
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                  {tool.name}
                </h3>
                <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
