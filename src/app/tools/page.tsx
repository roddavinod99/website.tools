import type { Metadata } from "next";
import Link from "next/link";
import { allTools, categories, siteConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse our complete collection of free online developer tools.",
  alternates: { canonical: `${siteConfig.url}/tools` },
};

export default function ToolsPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All Developer Tools",
    description: "Browse our complete collection of free online developer tools.",
    url: `${siteConfig.url}/tools`,
    numberOfItems: allTools.length,
    itemListElement: allTools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tool.name,
      url: `${siteConfig.url}/tools/${tool.slug}`,
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
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

      <section className="container py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/tools"
            className="rounded-full border border-brand-500 bg-brand-500 px-4 py-1.5 text-sm font-medium text-white"
          >
            All
          </Link>
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="rounded-full border border-surface-200 px-4 py-1.5 text-sm text-surface-600 transition-colors hover:bg-surface-100 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="group rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
            >
              <div className="flex items-start justify-between">
                <Badge variant="default">{tool.category}</Badge>
                <div className="flex gap-1.5">
                  {tool.new && <Badge variant="new">New</Badge>}
                  {tool.trending && <Badge variant="warning">Hot</Badge>}
                </div>
              </div>
              <h3 className="mt-3 font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                {tool.name}
              </h3>
              <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                {tool.description}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-surface-400 dark:text-dark-muted">
                <span>Popularity {tool.popularity}%</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
