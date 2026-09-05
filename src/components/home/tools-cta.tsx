import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";

export function ToolsCta() {
  return (
    <section className="border-t border-[var(--color-border)]" aria-labelledby="tools-cta-heading">
      <div className="container py-16 md:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center sm:p-12">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <LayoutGrid className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              All tools
            </p>
            <h2 id="tools-cta-heading" className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
              Explore All Developer Tools
            </h2>
            <p className="mt-3 text-base text-[var(--color-text-muted)] text-pretty">
              Browse the complete DevStackIO toolkit.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-6 text-sm font-medium text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            View All Tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
