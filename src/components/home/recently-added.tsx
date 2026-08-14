import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Tool } from "@/types";

export function RecentlyAdded({ allTools }: { allTools: Tool[] }) {
  const newTools = allTools.filter((t) => t.new);

  if (newTools.length === 0) return null;

  return (
    <section className="border-t border-surface-200 dark:border-dark-border">
      <div className="container py-16 md:py-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
              Recently Added
            </h2>
            <p className="mt-1 text-surface-600 dark:text-dark-muted">
              The latest tools shipped to the platform
            </p>
          </div>
          <Link
            href="/new"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all new tools <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newTools.slice(0, 6).map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="group rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  New
                </span>
                <span className="text-xs text-surface-500 dark:text-dark-muted">
                  {tool.category}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400 transition-colors">
                {tool.name}
              </h3>
              <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/new"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all new tools <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}