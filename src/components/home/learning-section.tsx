import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { learningTopics } from "@/lib/constants";

export function LearningSection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
            Learning Center
          </h2>
          <p className="mt-1 text-surface-500 dark:text-dark-muted">
            Tutorials, guides, and best practices
          </p>
        </div>
        <Link
          href="/learning"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {learningTopics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/learning/${topic.slug}`}
            className="group rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
          >
            <h3 className="font-semibold text-surface-900 transition-colors group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
              {topic.title}
            </h3>
            <p className="mt-2 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
              {topic.description}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-surface-400 dark:text-dark-muted">
              <Clock className="h-3 w-3" />
              {topic.readTime} read
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
