import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Changelog",
  description: "DevStackIO product updates and changelog.",
  alternates: { canonical: `${siteConfig.url}/changelog` },
};

const changes = [
  { date: "July 1, 2026", type: "feature" as const, text: "Added Prompt Generator and Prompt Improver tools" },
  { date: "June 28, 2026", type: "improvement" as const, text: "Improved JSON Formatter performance for large files" },
  { date: "June 25, 2026", type: "feature" as const, text: "Launched Learning Center with developer guides" },
  { date: "June 20, 2026", type: "improvement" as const, text: "Dark mode refinements and accessibility improvements" },
  { date: "June 15, 2026", type: "feature" as const, text: "Added QR Code Generator with custom colors" },
  { date: "June 10, 2026", type: "feature" as const, text: "Initial launch with 20+ developer tools" },
];

const typeStyles = {
  feature: "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200",
  improvement: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200",
};

export default function ChangelogPage() {
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
              { "@type": "ListItem", position: 2, name: "Changelog" },
            ],
          }),
        }}
      />
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Changelog
          </h1>
          <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
            Latest updates and improvements
          </p>

          <div className="mt-8 space-y-4">
            {changes.map((change, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge className={typeStyles[change.type]}>
                      {change.type === "feature" ? "Feature" : "Improvement"}
                    </Badge>
                    <span className="text-xs text-surface-400 dark:text-dark-muted">{change.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-surface-700 dark:text-dark-muted">{change.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
