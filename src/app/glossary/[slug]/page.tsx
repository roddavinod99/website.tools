import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig, allTools } from "@/lib/data";
import { glossaryTerms, getGlossaryTerm } from "@/lib/data/glossary";
import { breadcrumbList, jsonLdScriptBody } from "@/lib/seo/json-ld";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return glossaryTerms.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};
  const url = `${siteConfig.url}/glossary/${term.slug}`;
  return {
    title: `What is ${term.term}? — Glossary | DevStackIO`,
    description: term.definition,
    alternates: { canonical: url },
    openGraph: {
      title: `What is ${term.term}? — Glossary | DevStackIO`,
      description: term.definition,
      url,
      siteName: "DevStackIO Tools",
      type: "website",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: term.term }],
    },
    twitter: {
      card: "summary_large_image",
      title: `What is ${term.term}? — Glossary | DevStackIO`,
      description: term.definition,
      images: [siteConfig.ogImage],
    },
  };
}

const categoryBadgeStyles: Record<string, string> = {
  Encoding: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  Security: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Data Format": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Network: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  Image: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  PDF: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "Developer Tools": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  General: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const termUrl = `${siteConfig.url}/glossary/${term.slug}`;
  const glossaryUrl = `${siteConfig.url}/glossary`;

  const breadcrumb = breadcrumbList([
    { name: "Home", url: siteConfig.url },
    { name: "Glossary", url: glossaryUrl },
    { name: term.term, url: termUrl },
  ]);

  const definedTerm = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": termUrl,
    name: term.term,
    description: term.definition,
    url: termUrl,
    inDefinedTermSet: glossaryUrl,
  };

  const relatedToolsData = (term.relatedTools ?? [])
    .map((s) => allTools.find((t) => t.slug === s))
    .filter(Boolean) as typeof allTools;

  const relatedTermsData = (term.relatedTerms ?? [])
    .map((s) => getGlossaryTerm(s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getGlossaryTerm>>[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(definedTerm) }}
      />

      {/* Breadcrumb nav */}
      <nav aria-label="Breadcrumb" className="border-b border-[var(--color-border)]">
        <div className="container py-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
            <li>
              <Link href="/" className="hover:text-[var(--color-text)] hover:underline underline-offset-4">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/glossary" className="hover:text-[var(--color-text)] hover:underline underline-offset-4">
                Glossary
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-[var(--color-text)]">
              {term.term}
            </li>
          </ol>
        </div>
      </nav>

      <article className="container py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${categoryBadgeStyles[term.category] ?? categoryBadgeStyles.General}`}
            >
              {term.category}
            </span>
            <Link href="/glossary" className="text-sm text-[var(--color-accent)] hover:underline underline-offset-4">
              ← Back to glossary
            </Link>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            What is {term.term}?
          </h1>

          <p className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-lg leading-relaxed text-[var(--color-text)]">
            {term.definition}
          </p>

          {relatedToolsData.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Related tools</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Try these DevStackIO tools for {term.term}:</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {relatedToolsData.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]"
                  >
                    <span className="font-medium text-[var(--color-text)]">{tool.name}</span>
                    <span className="mt-1 block text-sm text-[var(--color-text-muted)] line-clamp-2">{tool.description}</span>
                    <span className="mt-2 inline-block text-xs font-medium text-[var(--color-accent)]">Open tool →</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {relatedTermsData.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Related terms</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {relatedTermsData.map((rt) => (
                  <li key={rt.slug}>
                    <Link
                      href={`/glossary/${rt.slug}`}
                      className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                    >
                      {rt.term}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-10 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">About this glossary</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              Definitions are written in plain language and sourced from MDN Web Docs, W3C
              specifications, and RFCs. Related tools run 100% in your browser — no data leaves
              your device.
            </p>
            <Link href="/glossary" className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline underline-offset-4">
              Browse all 40 terms →
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}
