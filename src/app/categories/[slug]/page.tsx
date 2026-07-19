import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { categories, allTools, siteConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { AdBanner } from "@/components/ads";

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
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: `${category.name} Tools - DevStackIO` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} Tools - DevStackIO`,
      description: category.description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const tools = allTools.filter((t) => t.category === category.name);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
              { "@type": "ListItem", position: 2, name: "Categories", item: `${siteConfig.url}/categories` },
              { "@type": "ListItem", position: 3, name: category.name },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${category.name} Tools`,
            description: category.description,
            url: `${siteConfig.url}/categories/${slug}`,
            numberOfItems: tools.length,
            itemListElement: tools.map((tool, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: tool.name,
              url: `${siteConfig.url}/tools/${tool.slug}`,
              description: tool.description,
            })),
          }),
        }}
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

      <AdBanner className="my-12" slot="4567890123" />

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
        </div>

        {tools.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => (
              <>
                {index === Math.floor(tools.length / 2) && (
                  <div className="col-span-full">
                    <AdBanner className="my-8" slot="5678901234" />
                  </div>
                )}
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="flex items-start justify-between">
                    <Badge variant="default">{tool.category}</Badge>
                    {tool.trending && <Badge variant="warning">Trending</Badge>}
                  </div>
                  <h3 className="mt-3 font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                    {tool.description}
                  </p>
                </Link>
              </>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-surface-500 dark:text-dark-muted">
              No tools in this category yet. Check back soon.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
