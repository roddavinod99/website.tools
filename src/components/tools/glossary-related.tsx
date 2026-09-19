"use client";

import Link from "next/link";
import { glossaryTerms } from "@/lib/data/glossary";
import { BookOpen } from "lucide-react";

export function GlossaryRelated({ toolSlug }: { toolSlug: string }) {
  const terms = glossaryTerms.filter((t) => t.relatedTools?.includes(toolSlug));
  if (terms.length === 0) return null;
  return (
    <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:p-6 space-y-3" aria-label="Related glossary terms">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
        <BookOpen className="h-5 w-5 flex-shrink-0 text-blue-700 dark:text-blue-400" aria-hidden="true" />
        Related Terms
      </h2>
      <p className="text-sm text-[var(--color-text-muted)]">Learn the concepts behind this tool.</p>
      <ul className="space-y-2">
        {terms.map((term) => (
          <li key={term.slug}>
            <Link
              href={`/glossary/${term.slug}`}
              className="flex items-start gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 transition-colors hover:border-[var(--color-accent)] hover:bg-blue-50"
            >
              <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-700 dark:text-blue-400" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)]">{term.term}</p>
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{term.definition}</p>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">View in glossary →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/glossary" className="inline-flex text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline underline-offset-4">
        Browse all glossary terms
      </Link>
    </section>
  );
}
