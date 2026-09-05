import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowRight, Zap } from "lucide-react";
import { guidesTopics, siteConfig, allTools } from "@/lib/data";
import { getGuideContent, getGuideUrl } from "@/lib/guides";
import { markdownToHtml } from "@/lib/markdown";

const guideToBlog: Record<string, { slug: string; title: string }> = {
  "concepts/json-basics": {
    slug: "getting-started-json",
    title: "Getting Started with JSON: A Complete Guide",
  },
  "concepts/jwt-structure": {
    slug: "understanding-jwt",
    title: "Understanding JWT Tokens: How They Work",
  },
  "best-practices/image-optimization": {
    slug: "image-optimization",
    title: "Image Optimization for the Web",
  },
  "best-practices/password-security": {
    slug: "password-security",
    title: "Password Security: Best Practices for 2026",
  },
};

const guideAliases: Record<string, string> = {
  "getting-started-json": "concepts/json-basics",
  "understanding-jwt": "concepts/jwt-structure",
};

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const canonical = guidesTopics.map((topic) => ({
    slug: topic.slug.split("/"),
  }));
  const aliasParams = Object.keys(guideAliases).map((alias) => ({
    slug: alias.split("/"),
  }));
  return [...canonical, ...aliasParams];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  const resolved = guideAliases[fullSlug] ?? fullSlug;
  const topic = guidesTopics.find((t) => t.slug === resolved);
  if (!topic) return {};
  const canonical = getGuideUrl(resolved);
  const dynamicOgImage = `${siteConfig.url}/og/${resolved}`;
  return {
    title: `${topic.title} - Guide`,
    description: topic.description,
    alternates: { canonical },
    openGraph: {
      title: `${topic.title} - Guide`,
      description: topic.description,
      url: canonical,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: topic.published,
      modifiedTime: topic.modified,
      images: [{ url: dynamicOgImage, width: 1200, height: 630, alt: `${topic.title} - DevStackIO Guide` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic.title} - Guide`,
      description: topic.description,
      images: [dynamicOgImage],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  const resolvedSlug = guideAliases[fullSlug] ?? fullSlug;
  const topic = guidesTopics.find((t) => t.slug === resolvedSlug);
  if (!topic) notFound();

  const content = await getGuideContent(resolvedSlug);
  const htmlContent = content ? await markdownToHtml(content) : null;

  const toolLinks = (topic.tools ?? [])
    .map((toolSlug) => allTools.find((t) => t.slug === toolSlug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const canonical = getGuideUrl(resolvedSlug);
  const dynamicOgImage = `${siteConfig.url}/og/${resolvedSlug}`;
  const graphItems = [
    {
      "@type": "TechArticle",
      headline: topic.title,
      description: topic.description,
      url: canonical,
      datePublished: `${topic.published}T00:00:00Z`,
      dateModified: `${topic.modified}T00:00:00Z`,
      image: dynamicOgImage,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      author: {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
      },
      publisher: {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/logo-light.png`,
        },
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${siteConfig.url}/guides` },
        { "@type": "ListItem", position: 3, name: topic.title, item: canonical },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": graphItems,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-[var(--color-border)]">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Link href="/" className="hover:text-[var(--color-text)]">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/guides" className="hover:text-[var(--color-text)]">Guides</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[var(--color-text)]">{topic.title}</span>
          </nav>
        </div>
      </section>
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent)] text-[var(--color-accent)]">
            {topic.category}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            {topic.title}
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-muted)]">
            {topic.description}
          </p>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Updated {topic.modified} &middot; {topic.readTime} read
          </p>

          {htmlContent ? (
            <div className="mt-8 prose prose-surface dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center border-[var(--color-border)] bg-[var(--color-surface)]">
              <p className="text-[var(--color-text-muted)]">Content for this guide is being written. Check back soon.</p>
            </div>
          )}

          {toolLinks.length > 0 && (
            <div className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 border-[var(--color-border)] bg-[var(--color-surface)]">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                <Zap className="h-4 w-4 text-[var(--color-accent)] text-[var(--color-accent)]" />
                Related tools
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {toolLinks.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      {tool.name}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guideToBlog[resolvedSlug] && (
            <div className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 border-[var(--color-border)] bg-[var(--color-surface)]">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Read the full guide
              </h3>
              <Link
                href={`/blog/${guideToBlog[resolvedSlug].slug}`}
                className="group mt-2 flex items-center gap-2 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] text-[var(--color-accent)]"
              >
                <span className="font-medium">{guideToBlog[resolvedSlug].title}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

