import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { learningTopics, siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Learning Center",
  description: "Developer tutorials, guides, and best practices.",
  alternates: { canonical: `${siteConfig.url}/learning` },
};

const categories = [
  { name: "JSON", count: 4 },
  { name: "JWT & Security", count: 3 },
  { name: "Image Optimization", count: 2 },
  { name: "Web Performance", count: 3 },
  { name: "Data Formats", count: 5 },
];

export default function LearningPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          Learning Center
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          Tutorials, guides, and best practices for developers
        </p>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            Latest Guides
          </h2>
          <div className="mt-4 grid gap-4">
            {learningTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/guides/${topic.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                    {topic.title}
                  </h3>
                  <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                    {topic.description}
                  </p>
                  <p className="mt-2 text-xs text-surface-400 dark:text-dark-muted">
                    {topic.readTime} read
                  </p>
                </div>
                <ArrowRight className="mt-2 h-4 w-4 flex-shrink-0 text-surface-400" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            Topics
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/guides?topic=${cat.name.toLowerCase()}`}
                className="rounded-full border border-surface-200 px-4 py-1.5 text-sm text-surface-600 transition-colors hover:bg-surface-100 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"
              >
                {cat.name} ({cat.count})
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
