import type { Metadata } from "next";
import Link from "next/link";
import { allTools, categories, siteConfig, guidesTopics } from "@/lib/data";
import { toolkits } from "@/lib/toolkits";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Sitemap",
  description: `Complete sitemap for ${siteConfig.name} - all tools, categories, guides, and pages.`,
  alternates: { canonical: `${siteConfig.url}/sitemap` },
};

const staticPages = [
  { title: "Home", href: "/" },
  { title: "All Tools", href: "/tools" },
  { title: "Categories", href: "/categories" },
  { title: "Popular Tools", href: "/popular" },
  { title: "Recently Added", href: "/new" },
  { title: "Guides", href: "/guides" },
  { title: "Tutorials", href: "/tutorials" },
  { title: "Blog", href: "/blog" },
  { title: "Best Practices", href: "/best-practices" },
  { title: "API", href: "/api" },
  { title: "Toolkits", href: "/toolkits" },
  { title: "About", href: "/about" },
  { title: "Roadmap", href: "/roadmap" },
  { title: "Changelog", href: "/changelog" },
  { title: "Status", href: "/status" },
  { title: "Feature Request", href: "/feature-request" },
  { title: "Report Bug", href: "/report-bug" },
  { title: "Feedback", href: "/feedback" },
  { title: "Suggest a Tool", href: "/suggest" },
  { title: "Support", href: "/support" },
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms of Service", href: "/terms" },
  { title: "Search", href: "/search" },
];

export default function SitemapPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-8">
          <Link href="/" className="hover:text-[var(--color-text)]">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[var(--color-text)]">Sitemap</span>
        </nav>

        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          Sitemap
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          Complete overview of all pages and tools on {siteConfig.name}.
        </p>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 mb-4">
              Pages
            </h2>
            <ul className="space-y-2">
              {staticPages.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 mb-4">
              Categories
            </h2>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="text-lg font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 mb-4 mt-8">
              Toolkits
            </h2>
            <ul className="space-y-2">
              {Object.values(toolkits).map((tk) => (
                <li key={tk.slug}>
                  <Link
                    href={`/toolkits/${tk.slug}`}
                    className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {tk.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

<div>
            <h2 className="text-lg font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 mb-4">
              Guides & Learning
            </h2>
            <ul className="space-y-2">
              {guidesTopics.map((topic) => (
                <li key={topic.slug}>
                  <Link
                    href={`/guides/${topic.slug}`}
                    className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {topic.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 mb-4">
            All Tools by Category
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const tools = allTools.filter((t) => t.category === cat.name);
              return (
                <div key={cat.id}>
                  <h3 className="font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="hover:text-[var(--color-accent)] transition-colors"
                    >
                      {cat.name}
                    </Link>
                    <span className="text-xs text-[var(--color-text-muted)]">({tools.length})</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {tools.map((tool) => (
                      <li key={tool.id}>
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                        >
                          {tool.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            XML Sitemap
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            View the XML sitemap for search engines:
          </p>
          <Link
            href="/sitemap.xml"
            className="mt-2 inline-block text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] text-[var(--color-accent)] font-mono underline"
          >
            /sitemap.xml
          </Link>
        </div>
      </div>
    </div>
  );
}
