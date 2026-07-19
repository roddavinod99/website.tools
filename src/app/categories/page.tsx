import type { Metadata } from "next";
import { categories, siteConfig } from "@/lib/constants";
import { CategoryCard } from "@/components/ui/category-card";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse free developer tools by category on DevStackIO: encoders, formatters, generators, converters, security tools, image tools, and utilities.",
  alternates: { canonical: `${siteConfig.url}/categories` },
  openGraph: {
    title: "Tool Categories — DevStackIO Tools",
    description: "Browse free developer tools by category: encoders, formatters, generators, converters, security tools, image tools, and utilities.",
    url: `${siteConfig.url}/categories`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Tool Categories" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tool Categories — DevStackIO Tools",
    description: "Browse free developer tools by category on DevStackIO.",
    images: [siteConfig.ogImage],
  },
};

export default function CategoriesPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Categories" },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Developer Tool Categories",
    description: "Browse our free developer tools by category.",
    url: `${siteConfig.url}/categories`,
    numberOfItems: categories.length,
    itemListElement: categories.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat.name,
      url: `${siteConfig.url}/categories/${cat.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
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
            <CategoryCard
              key={cat.id}
              name={cat.name}
              description={cat.description}
              slug={cat.slug}
              toolCount={cat.toolCount}
              icon={cat.icon}
              variant="default"
            />
          ))}
        </div>
      </section>
    </>
  );
}