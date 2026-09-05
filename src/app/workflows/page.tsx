import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Workflow } from "lucide-react";
import { workflows } from "@/lib/data/workflows";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Workflows — DevStackIO",
  description: "Multi-step tool workflows for common developer tasks: API debugging, frontend dev, security audit, data conversion, finance planning.",
  alternates: { canonical: `${siteConfig.url}/workflows` },
  openGraph: {
    title: "Workflows — DevStackIO",
    description: "Multi-step tool workflows for common developer tasks.",
    url: `${siteConfig.url}/workflows`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Workflows" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Workflows — DevStackIO",
    description: "Multi-step tool workflows for common developer tasks.",
    images: [siteConfig.ogImage],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Developer Workflows",
  description: "Curated multi-step workflows combining free online developer tools.",
  url: `${siteConfig.url}/workflows`,
  numberOfItems: workflows.length,
  itemListElement: workflows.map((w, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: w.title,
    url: `${siteConfig.url}/workflows/${w.slug}`,
  })),
};

export default function WorkflowsIndex() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-[var(--color-border)]">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-sm font-medium text-[var(--color-text-muted)] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]">
              <Workflow className="h-4 w-4" aria-hidden="true" />
              Workflows
            </span>
            <h1 className="mt-4 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
              Multi‑step Developer Workflows
            </h1>
            <p className="mt-3 text-lg text-[var(--color-text-muted)]">
              Combine tools to accomplish common tasks faster. Each workflow guides you through the steps and passes data between tools.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-4xl space-y-6">
            {workflows.map((w) => (
              <article
                key={w.slug}
                className="group rounded-lg border border-[var(--color-border)] bg-white p-6 transition-shadow border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                      <span className="font-medium text-[var(--color-text-muted)]">{w.category}</span>
                    </div>
                    <h2 className="mt-1 text-xl font-bold text-[var(--color-text)]">
                      {w.title}
                    </h2>
                    <p className="mt-2 text-[var(--color-text-muted)]">{w.description}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {w.steps.map((s, idx) => (
                        <li key={s.toolSlug} className="text-xs font-medium text-[var(--color-accent)] text-[var(--color-accent)]">
                          {idx + 1}. {s.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={`/workflows/${w.slug}`}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                    aria-label={`Open ${w.title}`}
                  >
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
