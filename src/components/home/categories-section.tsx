"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/constants";
import { CategoryCard } from "@/components/ui/category-card";

const categoryBlurbs: Record<string, string> = {
  "Encoders": "Format, encode, decode, and escape data.",
  "Formatters": "Clean, format, validate, and compare structured data.",
  "Generators": "Generate UUIDs, passwords, QR codes, tokens, and more.",
  "Converters": "Convert data between common formats.",
  "Security Tools": "Analyze tokens, hashes, certificates, and security data.",
  "Image Tools": "Compress, resize, inspect, and optimize images.",
  "Utilities": "Work with IP addresses, DNS, HTTP, regex, Git, timestamps, and more.",
};

export function CategoriesSection() {
  const developerCategories = categories.filter((c) => c.name !== "Finance");
  const financeCategory = categories.find((c) => c.name === "Finance");

  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
          Developer Tools for Every Task
        </h2>
        <p className="mt-2 text-surface-600 dark:text-dark-muted">
          Browse tools by what you&apos;re trying to accomplish.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {developerCategories.map((cat) => (
          <CategoryCard
            key={cat.id}
            name={cat.name}
            description={categoryBlurbs[cat.name] ?? cat.description}
            slug={cat.slug}
            toolCount={cat.toolCount}
            icon={cat.icon}
            variant="default"
          />
        ))}
      </div>

      {financeCategory && (
        <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Finance Calculators
              </p>
              <h3 className="mt-2 text-xl font-bold text-surface-900 dark:text-dark-text">
                Plan savings, loans, and investments
              </h3>
              <p className="mt-1 text-sm text-surface-600 dark:text-dark-muted">
                Separate from the developer toolkit — SIPs, EMIs, CAGR, ROI,
                retirement, currency conversion, and more. All calculations run
                privately in your browser.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <CategoryCard
                name={financeCategory.name}
                description={financeCategory.description}
                slug={financeCategory.slug}
                toolCount={financeCategory.toolCount}
                icon={financeCategory.icon}
                variant="home"
              />
              <Link
                href={`/categories/${financeCategory.slug}`}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:bg-dark-surface dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all categories →
        </Link>
      </div>
    </section>
  );
}