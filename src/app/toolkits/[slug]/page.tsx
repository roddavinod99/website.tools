import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { toolkits, toolkitSlugs } from "@/lib/toolkits";
import { allTools, siteConfig } from "@/lib/constants";
import { DynamicToolkitLoader, type ToolkitSlug } from "@/components/toolkits/dynamic-toolkit-loader";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

const validSlugs: ToolkitSlug[] = [
  "json-toolkit", "encoder-toolkit", "generator-toolkit",
  "security-toolkit", "image-toolkit", "text-toolkit", "dev-toolkit",
];

export async function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tk = toolkits[slug];
  if (!tk) return {};
  const canonical = `${siteConfig.url}/toolkits/${slug}`;
  return {
    title: `${tk.name} - Free Online Developer Tools`,
    description: tk.description,
    alternates: { canonical },
    openGraph: {
      title: `${tk.name} - Free Online Developer Tools`,
      description: tk.description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: `${tk.name} - DevStackIO` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tk.name} - Free Online Developer Tools`,
      description: tk.description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function ToolkitPage({ params }: Props) {
  const { slug } = await params;
  const tk = toolkits[slug];
  if (!tk) notFound();

  if (!validSlugs.includes(slug as ToolkitSlug)) notFound();

  const toolkitToolSlugs = toolkitSlugs[slug] ?? [];
  const toolkitTools = allTools.filter((t) => toolkitToolSlugs.includes(t.slug));

  return (
    <>
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-muted">
            <Link href="/" className="hover:text-surface-900 dark:hover:text-dark-text">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/tools" className="hover:text-surface-900 dark:hover:text-dark-text">Tools</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-surface-900 dark:text-dark-text">{tk.name}</span>
          </nav>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">{tk.name}</h1>
            <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">{tk.description}</p>
          </div>
          <DynamicToolkitLoader slug={slug as ToolkitSlug} />
        </div>
      </section>

      <section className="border-t border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">
              All {tk.name} Tools
            </h2>
            <p className="mt-1 text-surface-600 dark:text-dark-muted">
              Open each tool on its own page for detailed guides, examples, and best practices.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {toolkitTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="group flex flex-col rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
                  >
                    <span className="font-medium text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400 transition-colors">
                      {tool.name}
                    </span>
                    <span className="mt-1 text-xs text-surface-500 dark:text-dark-muted line-clamp-2">
                      {tool.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">
              Explore More Toolkits
            </h2>
            <p className="mt-1 text-surface-600 dark:text-dark-muted">
              Browse other curated collections of developer tools.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(toolkits)
                .filter((t) => t.slug !== tk.slug)
                .map((other) => (
                  <Link
                    key={other.slug}
                    href={`/toolkits/${other.slug}`}
                    className="group flex flex-col rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
                  >
                    <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400 transition-colors">
                      {other.name}
                    </h3>
                    <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                      {other.description}
                    </p>
                    <span className="mt-3 text-xs font-medium text-surface-600 dark:text-dark-muted">
                      {other.toolCount} tools
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
