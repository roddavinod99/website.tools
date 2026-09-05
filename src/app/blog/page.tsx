import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/data";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Developer tutorials, tips, and industry insights on web development, API design, security, and DevOps. Free guides from DevStackIO.",
  alternates: { canonical: `${siteConfig.url}/blog` },
  openGraph: {
    title: "Blog — DevStackIO Tools",
    description: "Developer tutorials, tips, and industry insights from DevStackIO. Free guides on web development, API design, security, and DevOps.",
    url: `${siteConfig.url}/blog`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — DevStackIO Tools",
    description: "Developer tutorials, tips, and industry insights from DevStackIO.",
    images: [siteConfig.ogImage],
  },
};

export default function BlogPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Blog" },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DevStackIO Blog",
    description: "Developer tutorials, tips, and industry insights on web development, API design, security, and DevOps.",
    url: `${siteConfig.url}/blog`,
    numberOfItems: blogPosts.length,
    itemListElement: blogPosts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: post.title,
      url: `${siteConfig.url}/blog/${post.slug}`,
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
      <div className="border-b border-[var(--color-border)]">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
              Blog
            </h1>
            <p className="mt-2 text-lg text-[var(--color-text-muted)]">
              Tutorials, tips, and industry insights
            </p>
          </div>
        </div>
      </div>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-6">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-lg border border-[var(--color-border)] bg-white p-6 transition-all hover:-translate-y-0.5 border-[var(--color-border)] bg-[var(--color-surface)]"
                >
                  <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                    <span>{post.date}</span>
                    <span>&middot;</span>
                    <span>{post.readTime} read</span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {post.excerpt}
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
