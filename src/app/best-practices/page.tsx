import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Best Practices",
  description: "Development best practices and guidelines.",
  alternates: { canonical: `${siteConfig.url}/best-practices` },
};

const practices = [
  { title: "JSON Best Practices", description: "Learn how to structure and validate JSON data effectively.", slug: "getting-started-json" },
  { title: "JWT Security Best Practices", description: "Ensure your authentication tokens are secure.", slug: "understanding-jwt" },
  { title: "Image Optimization Best Practices", description: "Optimize images for the web without sacrificing quality.", slug: "image-optimization-guide" },
  { title: "Password Security Best Practices", description: "Create and manage secure passwords.", slug: "password-security" },
];

export default function BestPracticesPage() {
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
              { "@type": "ListItem", position: 2, name: "Best Practices" },
            ],
          }),
        }}
      />
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Best Practices
          </h1>
          <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
            Development guidelines and industry best practices
          </p>

          <div className="mt-8 grid gap-4">
            {practices.map((p) => (
              <Link
                key={p.slug}
                href={`/guides/${p.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                    {p.description}
                  </p>
                </div>
                <ArrowRight className="mt-2 h-4 w-4 flex-shrink-0 text-surface-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
