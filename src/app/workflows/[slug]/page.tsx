import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
import { workflows } from "@/lib/data/workflows";
import { siteConfig } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return workflows.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const workflow = workflows.find((w) => w.slug === slug);
  if (!workflow) return {};
  const canonical = `${siteConfig.url}/workflows/${workflow.slug}`;
  return {
    title: workflow.title,
    description: workflow.description,
    alternates: { canonical },
    openGraph: {
      title: workflow.title,
      description: workflow.description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: workflow.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: workflow.title,
      description: workflow.description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function WorkflowPage({ params }: Props) {
  const { slug } = await params;
  const workflow = workflows.find((w) => w.slug === slug);
  if (!workflow) notFound();

  const canonical = `${siteConfig.url}/workflows/${workflow.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: workflow.title,
    description: workflow.description,
    url: canonical,
    step: workflow.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.label,
      text: s.description,
      url: `${siteConfig.url}/tools/${s.toolSlug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-[var(--color-border)]">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-text)]">Home</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href="/workflows" className="hover:text-[var(--color-text)]">Workflows</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-[var(--color-text)]">{workflow.title}</span>
          </nav>
        </div>
      </section>

      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <header className="mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-sm font-medium text-[var(--color-text-muted)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-[var(--color-text)]">
              {workflow.category}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
              {workflow.title}
            </h1>
            <p className="mt-3 text-lg text-[var(--color-text-muted)]">
              {workflow.description}
            </p>
          </header>

          <ol className="space-y-6" role="list" aria-label={`${workflow.title} steps`}>
            {workflow.steps.map((step, index) => (
              <li key={step.toolSlug} className="group relative flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-lg font-bold dark:bg-[var(--color-accent-soft)] dark:text-[var(--color-accent)]">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      {step.label}
                    </h3>
                    <Link
                      href={`/tools/${step.toolSlug}`}
                      className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] dark:text-[var(--color-accent)] dark:hover:text-[var(--color-accent)]"
                    >
                      Open tool
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                  <p className="text-[var(--color-text-muted)]">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Run the full workflow</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Open the first tool with the workflow context; each step will pass its output to the next.
            </p>
            <Link
              href={`/tools/${workflow.steps[0].toolSlug}?workflow=${workflow.slug}&step=1`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              Start workflow
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}