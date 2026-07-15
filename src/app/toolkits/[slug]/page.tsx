import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { toolkits } from "@/lib/toolkits";
import { siteConfig } from "@/lib/constants";
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
    </>
  );
}
