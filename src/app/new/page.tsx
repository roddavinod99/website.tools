import type { Metadata } from "next";
import Link from "next/link";
import { allTools, siteConfig } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "New Tools",
  description: "Recently added free developer tools on DevStackIO. Discover the latest additions to our collection of browser-based utilities.",
  alternates: { canonical: `${siteConfig.url}/new` },
};

export default function NewToolsPage() {
  const newTools = allTools.filter((t) => t.new);
  const others = allTools.filter((t) => !t.new);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "New Tools" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="border-b border-[var(--color-border)]">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
              New Tools
            </h1>
            <p className="mt-2 text-lg text-[var(--color-text-muted)]">
              Recently added tools and updates
            </p>
            <p className="mt-4 text-[var(--color-text-muted)]">
              The newest additions to our collection of free, browser-based developer utilities. We ship
              tools frequently &mdash; from data generators and encoders to security helpers and formatters.
              Every tool processes data locally on your device, keeping your information private by design.
              Check back regularly to see what&apos;s new, or browse the{" "}
              <a href="/popular" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">most popular tools</a>{" "}
              our community uses daily.
            </p>
          </div>
        </div>
      </div>

      {newTools.length > 0 && (
        <section>
          <div className="container py-16 md:py-24">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">Latest Additions</h2>
              <div className="mt-6 grid gap-4">
                {newTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                  >
                    <div className="flex items-start justify-between">
                      <Badge variant="new">New</Badge>
                      <Badge variant="default">{tool.category}</Badge>
                    </div>
                    <h3 className="mt-3 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                      {tool.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">All Tools</h2>
            <div className="mt-6 grid gap-4">
              {others.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                >
                  <Badge variant="default">{tool.category}</Badge>
                  <h3 className="mt-3 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
