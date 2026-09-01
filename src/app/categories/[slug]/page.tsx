import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { categories, allTools, siteConfig } from "@/lib/data";
import { categoryMetas } from "@/lib/data/categories";
import { ToolGridSection } from "@/components/ui/tool-grid-section";
import { ChevronRight, CircleCheck } from "lucide-react";
import { AdBanner } from "@/components/ads";
import { adSlots } from "@/lib/data/ads";
import { breadcrumbList, collectionPage, jsonLdScriptBody } from "@/lib/seo/json-ld";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};
  const canonical = `${siteConfig.url}/categories/${slug}`;
  const dynamicOgImage = `${siteConfig.url}/og/categories/${slug}`;
  return {
    title: `${category.name} Tools`,
    description: category.description,
    alternates: { canonical },
    openGraph: {
      title: `${category.name} Tools - DevStackIO`,
      description: category.description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: dynamicOgImage, width: 1200, height: 630, alt: `${category.name} Tools - DevStackIO` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} Tools - DevStackIO`,
      description: category.description,
      images: [dynamicOgImage],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const tools = allTools.filter((t) => t.category === category.name);
  const categoryUrl = `${siteConfig.url}/categories/${slug}`;

  const breadcrumb = breadcrumbList([
    { name: "Home", url: siteConfig.url },
    { name: "Categories", url: `${siteConfig.url}/categories` },
    { name: category.name },
  ]);
  const collection = collectionPage({
    name: `${category.name} Tools`,
    description: category.description,
    url: categoryUrl,
    items: tools.map((t) => ({
      name: t.name,
      url: `${siteConfig.url}/tools/${t.slug}`,
      description: t.description,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(collection) }}
      />
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-muted">
            <Link href="/" className="hover:text-surface-900 dark:hover:text-dark-text">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/categories" className="hover:text-surface-900 dark:hover:text-dark-text">Categories</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-surface-900 dark:text-dark-text">{category.name}</span>
          </nav>
        </div>
      </section>

      <AdBanner className="my-12" slot={adSlots.categoryTop} />

      <section className="container py-12 md:py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            {category.name} Tools
          </h1>
          <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
            {category.description}
          </p>
          <p className="mt-1 text-sm text-surface-400 dark:text-dark-muted">
            {tools.length} tools available
          </p>
          {(() => {
            const meta = categoryMetas.find((c) => c.slug === slug);
            if (!meta?.seoFeatures?.length) return null;
            return (
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {meta.seoFeatures.slice(0, 6).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-surface-600 dark:text-dark-muted">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      </section>

      <section className="border-t border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
        <div className="container py-16 md:py-24">
          {tools.length > 0 ? (
            <ToolGridSection tools={tools} midAdSlot={adSlots.categoryMid} />
          ) : (
            <div className="text-center">
              <p className="text-surface-500 dark:text-dark-muted">
                No tools in this category yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
