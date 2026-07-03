import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog",
  description: "DevStackIO blog - developer tutorials, tips, and updates.",
  alternates: { canonical: `${siteConfig.url}/blog` },
};

const posts = [
  { title: "Getting Started with JSON: A Complete Guide", excerpt: "Learn everything you need to know about JSON, from basic syntax to advanced use cases in modern web development.", date: "June 28, 2026", readTime: "5 min", slug: "getting-started-json" },
  { title: "Understanding JWT Tokens: How They Work", excerpt: "A deep dive into JSON Web Tokens, including structure, signing algorithms, and security best practices.", date: "June 25, 2026", readTime: "8 min", slug: "understanding-jwt" },
  { title: "Image Optimization for the Web", excerpt: "Best practices for optimizing images to improve page load times without sacrificing quality.", date: "June 20, 2026", readTime: "6 min", slug: "image-optimization" },
  { title: "Password Security: Best Practices for 2026", excerpt: "How to create and manage secure passwords, plus common pitfalls to avoid.", date: "June 15, 2026", readTime: "4 min", slug: "password-security" },
  { title: "The Ultimate Guide to UUIDs", excerpt: "Everything developers need to know about UUIDs, including v4 vs v7, use cases, and best practices.", date: "June 10, 2026", readTime: "7 min", slug: "guide-to-uuids" },
];

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
          {posts.map((post) => (
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
