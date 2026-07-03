import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { categories, allTools, siteConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

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
  return {
    title: `${category.name} Tools`,
    description: category.description,
    alternates: { canonical: `${siteConfig.url}/categories/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const tools = allTools.filter((t) => t.category === category.name);

  return (
    <>
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
            {tools.map((tool) => (
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
