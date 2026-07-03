import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { learningTopics, siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tutorials",
  description: "Developer tutorials and how-to guides.",
  alternates: { canonical: `${siteConfig.url}/tutorials` },
};

export default function TutorialsPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          Tutorials
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          Step-by-step tutorials for developers
        </p>

        <div className="mt-8 grid gap-4">
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
    </div>
  );
}
