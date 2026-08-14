import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";

export function ToolsCta() {
  return (
    <section className="border-t border-surface-200 dark:border-dark-border">
      <div className="container py-16 md:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-surface-200 bg-white p-8 text-center shadow-sm sm:p-12 dark:border-dark-border dark:bg-dark-surface">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <LayoutGrid className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
              Explore All Developer Tools
            </h2>
            <p className="mt-2 text-surface-600 dark:text-dark-muted">
              Browse the complete DevStackIO toolkit.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            View All Tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}