import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { getBlogPost, getPostContent, getPostUrl, blogPosts } from "@/lib/blog";

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
  return {
    title: blogPost.title,
    description: blogPost.excerpt,
    alternates: { canonical },
    openGraph: {
      title: blogPost.title,
      description: blogPost.excerpt,
      url: canonical,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: blogPost.dateISO,
    },
    twitter: {
      card: "summary_large_image",
      title: blogPost.title,
      description: blogPost.excerpt,
    },
  };
}

function renderContent(text: string) {
  return text.split("\n\n").map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return <h2 key={i} className="mt-8 text-xl font-bold text-surface-900 dark:text-dark-text">{trimmed.slice(3)}</h2>;
    }
    if (trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").map((line) => line.replace(/^- /, ""));
      return (
        <ul key={i} className="mt-2 space-y-1 list-disc pl-5 text-surface-600 dark:text-dark-muted">
          {items.map((item, j) => <li key={j}>{item}</li>)}
        </ul>
      );
    }
    return <p key={i} className="mt-4 text-surface-600 dark:text-dark-muted leading-relaxed">{trimmed}</p>;
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blogPost = getBlogPost(slug);
  if (!blogPost) notFound();
  const content = await getPostContent(slug);
  if (!content) notFound();

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
            datePublished: blogPost.date,
            dateModified: blogPost.date,
            image: `${siteConfig.url}${siteConfig.ogImage}`,
            wordCount: content.split(/\s+/).length,
            author: { "@type": "Person", name: siteConfig.name, url: `${siteConfig.url}/about` },
            publisher: {
              "@type": "Organization",
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
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-muted">
            <Link href="/" className="hover:text-surface-900 dark:hover:text-dark-text">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-surface-900 dark:hover:text-dark-text">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-surface-900 dark:text-dark-text">{blogPost.title}</span>
          </nav>
        </div>
      </section>
      <article className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 text-sm text-surface-400 dark:text-dark-muted">
            <span>{blogPost.date}</span>
            <span>&middot;</span>
            <span>{blogPost.readTime} read</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            {blogPost.title}
          </h1>
          <p className="mt-4 text-lg text-surface-500 dark:text-dark-muted">
            {blogPost.excerpt}
          </p>
          <div className="mt-8 prose prose-surface dark:prose-invert max-w-none">
            {renderContent(content)}
          </div>
        </div>
      </article>
    </>
  );
}
