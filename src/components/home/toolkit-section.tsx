import Link from "next/link";
import { toolkits } from "@/lib/toolkits";

export function ToolkitSection() {
  return (
    <section className="border-t border-surface-200 dark:border-dark-border">
      <div className="container py-16 md:py-24">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
          Browse by Toolkit
        </h2>
        <p className="mt-1 text-surface-600 dark:text-dark-muted">
          Curated collections of tools for every developer workflow
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(toolkits).map((tk) => (
            <Link
              key={tk.slug}
              href={`/toolkits/${tk.slug}`}
              className="group flex flex-col rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
            >
              <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400 transition-colors">
                {tk.name}
              </h3>
              <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                {tk.description}
              </p>
              <span className="mt-3 text-xs font-medium text-surface-600 dark:text-dark-muted">
                {tk.toolCount} tools
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Browse all tools →
          </Link>
        </div>
      </div>
    </section>
  );
}