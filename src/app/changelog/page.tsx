import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/data";

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
  feature: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
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
          <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            Changelog
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-muted)]">
            Latest updates and improvements
          </p>
          <p className="mt-4 text-[var(--color-text-muted)]">
            A running record of what&apos;s changed on DevStackIO. This changelog tracks new tools,
            performance improvements, accessibility fixes, and platform updates in reverse chronological
            order. We move fast but transparently &mdash; every notable change is documented here so you always
            know what&apos;s available and what recent updates brought to each tool.
          </p>

          <div className="mt-8 space-y-4">
            {changes.map((change, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] bg-white p-4 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge className={typeStyles[change.type]}>
                      {change.type === "feature" ? "Feature" : "Improvement"}
                    </Badge>
                    <span className="text-xs text-[var(--color-text-muted)]">{change.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">{change.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
