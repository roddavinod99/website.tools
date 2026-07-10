import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "DevStackIO blog - developer tutorials, tips, and updates.",
  alternates: { canonical: `${siteConfig.url}/blog` },
};

export default function BlogPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          Blog
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          Tutorials, tips, and industry insights
        </p>

        <div className="mt-8 space-y-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-surface-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
            >
              <div className="flex items-center gap-3 text-xs text-surface-400 dark:text-dark-muted">
                <span>{post.date}</span>
                <span>&middot;</span>
                <span>{post.readTime} read</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
