import type { Metadata } from "next";
import Link from "next/link";
import { allTools, siteConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "New Tools",
  description: "Recently added developer tools on DevStackIO.",
  alternates: { canonical: `${siteConfig.url}/new` },
};

export default function NewToolsPage() {
  const newTools = allTools.filter((t) => t.new);
  const others = allTools.filter((t) => !t.new);

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          New Tools
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          Recently added tools and updates
        </p>

        {newTools.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Latest Additions</h2>
            <div className="mt-4 grid gap-4">
              {newTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="flex items-start justify-between">
                    <Badge variant="new">New</Badge>
                    <Badge variant="default">{tool.category}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">All Tools</h2>
          <div className="mt-4 grid gap-4">
            {others.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
              >
                <Badge variant="default">{tool.category}</Badge>
                <h3 className="mt-3 font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                  {tool.name}
                </h3>
                <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
