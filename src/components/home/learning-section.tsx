import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { guidesTopics } from "@/lib/data";

export function LearningSection() {
  return (
    <section className="container py-16 md:py-24" aria-labelledby="learning-heading">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Learning
          </p>
          <h2 id="learning-heading" className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
            Learn While You Build
          </h2>
          <p className="mt-2 text-base text-[var(--color-text-muted)] text-pretty">
            Understand the technologies behind the tools
          </p>
        </div>
        <Link
          href="/guides"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
        >
          View all guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guidesTopics.slice(0, 6).map((topic) => (
          <Link
            key={topic.slug}
            href={`/guides/${topic.slug}`}
            className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-all hover:border-[var(--color-border-strong)] hover:shadow-sm"
          >
            <h3 className="font-semibold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">
              {topic.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-2">
              {topic.description}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--color-text-subtle)]">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {topic.readTime} read
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
