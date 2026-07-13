import Link from "next/link";
import { Search, ArrowRight, Home } from "lucide-react";
import { categories, allTools } from "@/lib/constants";

export default function NotFound() {
  const popularTools = [...allTools]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6);

  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-7xl font-bold text-surface-300 dark:text-dark-border">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-surface-900 dark:text-dark-text">
          Page Not Found
        </h2>
        <p className="mt-2 text-surface-500 dark:text-dark-muted max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let us help
          you find what you need.
        </p>

        <div className="mt-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search Tools
          </Link>
          <Link
            href="/"
            className="ml-3 inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-6 py-3 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">
              Browse Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="flex items-center gap-2 text-sm text-surface-600 hover:text-brand-500 dark:text-dark-muted dark:hover:text-brand-400 transition-colors"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">
              Popular Tools
            </h3>
            <ul className="space-y-2">
              {popularTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="flex items-center gap-2 text-sm text-surface-600 hover:text-brand-500 dark:text-dark-muted dark:hover:text-brand-400 transition-colors"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
