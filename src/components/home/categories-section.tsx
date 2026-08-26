"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/data";
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

const TOP_CATEGORIES = [
  "Encoders",
  "Formatters",
  "Generators",
  "Converters",
  "Security Tools",
  "Image Tools",
];

export function CategoriesSection() {
  const topCategories = categories.filter((c) => TOP_CATEGORIES.includes(c.name));

  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
            Tools for Every Task
          </h2>
          <p className="mt-1 text-surface-600 dark:text-dark-muted">
            Browse tools by what you&apos;re trying to accomplish.
          </p>
        </div>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all categories
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topCategories.map((cat) => (
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
    </section>
  );
}
