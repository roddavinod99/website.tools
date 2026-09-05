import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/data";
import { getBlogPost, getPostContent, getPostUrl, blogPosts } from "@/lib/blog";
import { markdownToHtml } from "@/lib/markdown";

const blogToGuide: Record<string, { slug: string; title: string }> = {
  "getting-started-json": { slug: "getting-started-json", title: "Getting Started with JSON Guide" },
  "understanding-jwt": { slug: "understanding-jwt", title: "Understanding JWT Tokens Guide" },
  "image-optimization": { slug: "image-optimization-guide", title: "Image Optimization Guide" },
  "password-security": { slug: "password-security", title: "Password Security Best Practices" },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blogPost = getBlogPost(slug);
  if (!blogPost) return {};
  const canonical = getPostUrl(blogPost.slug);
  const dynamicOgImage = `${siteConfig.url}/og/${slug}`;
  return {
    title: blogPost.title,
    description: blogPost.excerpt,
    alternates: { canonical },
    openGraph: {
      title: blogPost.title,
      description: blogPost.excerpt,
      url: canonical,
      siteName: "DevStackIO Tools",
      type: "article",
      publishedTime: blogPost.dateISO,
      images: [{ url: dynamicOgImage, width: 1200, height: 630, alt: `${blogPost.title} - DevStackIO Blog` }],
    },
    twitter: {
      card: "summary_large_image",
      title: blogPost.title,
      description: blogPost.excerpt,
      images: [dynamicOgImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blogPost = getBlogPost(slug);
  if (!blogPost) notFound();
  const content = await getPostContent(slug);
  if (!content) notFound();
  const htmlContent = await markdownToHtml(content);

  const dynamicOgImage = `${siteConfig.url}/og/${slug}`;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: blogPost.title,
            description: blogPost.excerpt,
            url: getPostUrl(blogPost.slug),
            datePublished: blogPost.dateISO,
            dateModified: blogPost.dateISO,
            image: dynamicOgImage,
            wordCount: content.split(/\s+/).length,
            author: {
              "@type": "Organization",
              "@id": `${siteConfig.url}/#organization`,
              name: siteConfig.name,
              url: `${siteConfig.url}/about`,
              logo: {
                "@type": "ImageObject",
                url: `${siteConfig.url}/favicon.svg`,
              },
            },
            publisher: {
              "@type": "Organization",
              "@id": `${siteConfig.url}/#organization`,
              name: siteConfig.name,
              url: siteConfig.url,
              logo: {
                "@type": "ImageObject",
                url: `${siteConfig.url}/favicon.svg`,
              },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": getPostUrl(blogPost.slug) },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
              { "@type": "ListItem", position: 3, name: blogPost.title },
            ],
          }),
        }}
      />
      <section className="border-b border-[var(--color-border)]">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Link href="/" className="hover:text-[var(--color-text)]">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-[var(--color-text)]">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[var(--color-text)]">{blogPost.title}</span>
          </nav>
        </div>
      </section>
      <article className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <Link
              href="/about"
              className="font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] dark:text-[var(--color-text-muted)] dark:hover:text-[var(--color-accent)]"
            >
              {siteConfig.name} Team
            </Link>
            <span>&middot;</span>
            <span>{blogPost.date}</span>
            <span>&middot;</span>
            <span>{blogPost.readTime} read</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            {blogPost.title}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            {blogPost.excerpt}
          </p>
          <div className="mt-8 prose prose-surface dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
          {blogToGuide[blogPost.slug] && (
            <div className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Quick guide
              </h3>
              <Link
                href={`/guides/${blogToGuide[blogPost.slug].slug}`}
                className="mt-2 inline-flex items-center gap-2 font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] dark:text-[var(--color-accent)]"
              >
                {blogToGuide[blogPost.slug].title}
              </Link>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
