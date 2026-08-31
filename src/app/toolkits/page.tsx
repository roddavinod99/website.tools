import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Braces,
  FileCode,
  Wand2,
  Shield,
  Image as ImageIcon,
  Hash,
  Wrench,
  Boxes,
} from "lucide-react";
import { toolkits } from "@/lib/toolkits";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Toolkits — DevStackIO",
  description: "Curated collections of related developer tools. JSON, encoders, generators, security, image, text, and developer essentials — grouped to help you finish tasks faster.",
  alternates: { canonical: `${siteConfig.url}/toolkits` },
  openGraph: {
    title: "Toolkits — DevStackIO",
    description: "Curated collections of related developer tools, grouped to help you finish tasks faster.",
    url: `${siteConfig.url}/toolkits`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Toolkits" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolkits — DevStackIO",
    description: "Curated collections of related developer tools, grouped to help you finish tasks faster.",
    images: [siteConfig.ogImage],
  },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>> = {
  Braces,
  FileCode,
  Wand2,
  Shield,
  Image: ImageIcon,
  Hash,
  Wrench,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Developer Toolkits",
  description: "Curated collections of related developer tools from DevStackIO.",
  url: `${siteConfig.url}/toolkits`,
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: Object.values(toolkits).map((tk, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tk.name,
      url: `${siteConfig.url}/toolkits/${tk.slug}`,
    })),
  },
};

export default function ToolkitsIndex() {
  const list = Object.values(toolkits);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1 text-sm font-medium text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <Boxes className="h-4 w-4" aria-hidden="true" />
              Toolkits
            </span>
            <h1 className="mt-4 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
              Curated Developer Toolkits
            </h1>
            <p className="mt-3 text-lg text-surface-600 dark:text-dark-muted">
              Hand-picked groups of tools for common tasks. Open a toolkit to see its tools, or jump straight to a single tool.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
        <div className="container py-16 md:py-24">
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((tk) => {
              const Icon = ICON_MAP[tk.icon] ?? Boxes;
              return (
                <article
                  key={tk.slug}
                  className="group flex flex-col rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tk.color} text-white`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <Link
                      href={`/toolkits/${tk.slug}`}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600"
                      aria-label={`Open ${tk.name}`}
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-surface-900 dark:text-dark-text">
                    <Link
                      href={`/toolkits/${tk.slug}`}
                      className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {tk.name}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-surface-600 dark:text-dark-muted line-clamp-3">
                    {tk.description}
                  </p>
                  <span className="mt-4 text-xs font-medium text-surface-500 dark:text-dark-muted">
                    {tk.toolCount} {tk.toolCount === 1 ? "tool" : "tools"}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
