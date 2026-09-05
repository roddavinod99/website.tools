import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Tool } from "@/types";

export function RecentlyAdded({ allTools }: { allTools: Tool[] }) {
  const newTools = allTools.filter((t) => t.new);

  if (newTools.length === 0) return null;

  return (
    <section className="border-t border-[var(--color-border)]" aria-labelledby="recent-heading">
      <div className="container py-16 md:py-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              Just shipped
            </p>
            <h2 id="recent-heading" className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
              Recently Added
            </h2>
            <p className="mt-2 text-base text-[var(--color-text-muted)] text-pretty">
              The latest tools shipped to the platform
            </p>
          </div>
          <Link
            href="/new"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            View all new tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newTools.slice(0, 6).map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-all hover:border-[var(--color-border-strong)] hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  New
                </span>
                <span className="text-xs text-[var(--color-text-subtle)]">
                  {tool.category}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                {tool.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/new"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            View all new tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
