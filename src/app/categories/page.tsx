import type { Metadata } from "next";
import Link from "next/link";
import { categories, siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse developer tools by category.",
  alternates: { canonical: `${siteConfig.url}/categories` },
};

export default function CategoriesPage() {
  return (
    <>
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
              Categories
            </h1>
            <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
              Browse our tools by category
            </p>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group rounded-xl border border-surface-200 bg-white p-6 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
            >
              <h3 className="font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                {cat.name}
              </h3>
              <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted">
                {cat.description}
              </p>
              <p className="mt-2 text-xs text-surface-400 dark:text-dark-muted">
                {cat.toolCount} tools
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
