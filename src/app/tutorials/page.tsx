import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { guidesTopics, siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tutorials",
  description: "Developer tutorials and how-to guides.",
  alternates: { canonical: `${siteConfig.url}/tutorials` },
};

export default function TutorialsPage() {
  const tutorialTopics = guidesTopics.filter((t) => t.category === "Tutorials");
  return (
    <>
    <div className="border-b border-[var(--color-border)]">
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            Tutorials
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-muted)]">
            Step-by-step tutorials for developers
          </p>
          <p className="mt-4 text-[var(--color-text-muted)]">
            Practical, beginner-friendly tutorials that pair every concept with a usable DevStackIO tool.
            Learn how to format and validate JSON, understand JWT authentication, optimize images for the
            web, and harden your password security &mdash; all explained step by step. Each guide includes
            copy-paste examples and links to the matching online tool so you can apply what you learn
            immediately in your browser.
          </p>
        </div>
      </div>
    </div>

    <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="grid gap-4">
            {tutorialTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/guides/${topic.slug}`}
                className="group flex items-start gap-4 rounded-lg border border-[var(--color-border)] bg-white p-5 transition-all hover:-translate-y-0.5 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] dark:bg-[var(--color-accent-soft)] dark:text-[var(--color-accent)]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] dark:text-[var(--color-text)] dark:group-hover:text-[var(--color-accent)]">
                    {topic.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {topic.description}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    {topic.readTime} read
                  </p>
                </div>
                <ArrowRight className="mt-2 h-4 w-4 flex-shrink-0 text-[var(--color-text-subtle)]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
