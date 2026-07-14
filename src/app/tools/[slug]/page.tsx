import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allTools, siteConfig } from "@/lib/constants";
import { getToolContent } from "@/lib/tool-content";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ToolInterface } from "@/components/tools/tool-interface";
import { ShareButtons } from "@/components/tools/share-buttons";
import Link from "next/link";
import {
  CircleCheck, CircleAlert,
  Lightbulb, BookOpen, ArrowRight, ChevronRight,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allTools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = allTools.find((t) => t.slug === slug);
  if (!tool) return {};
  const canonical = `${siteConfig.url}/tools/${tool.slug}`;
  return {
    title: tool.name,
    description: tool.description,
    alternates: { canonical },
    openGraph: {
      title: `${tool.name} - Free Online Tool`,
      description: tool.description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: `${tool.name} - DevStackIO` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} - Free Online Tool`,
      description: tool.description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = allTools.find((t) => t.slug === slug);
  if (!tool) notFound();

  const content = await getToolContent(slug);
  if (!content) notFound();

  const sameCategory = allTools
    .filter((t) => t.category === tool.category && t.id !== tool.id)
    .slice(0, 4);

  const popularTools = allTools
    .filter((t) => t.id !== tool.id && !sameCategory.find((st) => st.id === t.id))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: tool.name,
            url: `${siteConfig.url}/tools/${tool.slug}`,
            description: tool.description,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "All",
            browserRequirements: "Modern browser with JavaScript enabled",
            image: `${siteConfig.url}${siteConfig.ogImage}`,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
              { "@type": "ListItem", position: 2, name: "Tools", item: `${siteConfig.url}/tools` },
              { "@type": "ListItem", position: 3, name: tool.name },
            ],
          }),
        }}
      />
      {content.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: content.faq.map((item) => {
                const q = item.includes(" — ") ? item.split(" — ")[0] : item.split(" | A:")[0];
                const a = item.includes(" — ") ? item.split(" — ").slice(1).join(" — ") : item.split(" | A:")[1] || "";
                return {
                  "@type": "Question",
                  name: q,
                  acceptedAnswer: { "@type": "Answer", text: a },
                };
              }),
            }),
          }}
        />
      )}
      {content.instructions.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: `How to use ${tool.name}`,
              description: `Step-by-step guide to using ${tool.name} for ${tool.description.split(" ").slice(0, 8).join(" ").toLowerCase()}.`,
              image: `${siteConfig.url}${siteConfig.ogImage}`,
              totalTime: "PT5M",
              step: content.instructions.map((instruction, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                name: instruction.split(".")[0] || `Step ${index + 1}`,
                text: instruction,
              })),
            }),
          }}
        />
      )}
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-muted">
            <Link href="/" className="hover:text-surface-900 dark:hover:text-dark-text">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/tools" className="hover:text-surface-900 dark:hover:text-dark-text">Tools</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-surface-900 dark:text-dark-text">{tool.name}</span>
          </nav>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <Badge variant="default">{tool.category}</Badge>
              {tool.trending && <Badge variant="warning">Trending</Badge>}
              {tool.new && <Badge variant="new">New</Badge>}
            </div>
            <h1 className="mt-4 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
              {tool.name}
            </h1>
            <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
              {tool.description}
            </p>

            <div className="mt-8 rounded-xl border border-surface-200 bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
              <ToolInterface slug={tool.slug} name={tool.name} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">About</h2>
            <div className="mt-4 space-y-4 text-surface-600 dark:text-dark-muted">
              <p>{content.whatItDoes}</p>
              <p>{content.whyItExists}</p>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Who should use this tool?</h3>
                <p className="mt-1">{content.whoShouldUse}</p>
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Common use cases</h3>
                <ul className="mt-2 space-y-1">
                  {content.useCases.map((uc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                      <span>{uc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">How to Use</h2>
            <div className="mt-6 space-y-4">
              {content.instructions.map((inst, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-surface-600 dark:text-dark-muted">{inst}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Examples</h2>
            <div className="mt-6 space-y-4">
              {content.examples.map((ex, i) => (
                <Card key={i}>
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-50 p-3 text-sm dark:bg-dark-bg">
                    <code>{ex}</code>
                  </pre>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Best Practices</h2>
            <ul className="mt-6 space-y-3">
              {content.bestPractices.map((bp, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                  <span className="text-surface-600 dark:text-dark-muted">{bp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Common Mistakes</h2>
            <ul className="mt-6 space-y-3">
              {content.commonMistakes.map((cm, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <span className="text-surface-600 dark:text-dark-muted">{cm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">FAQ</h2>
            <div className="mt-6 space-y-3">
              {content.faq.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium text-surface-900 dark:text-dark-text">
                    {item.includes(' — ') ? item.split(' — ')[0] : item.split(' | A:')[0]}
                    <ChevronRight className="h-4 w-4 text-surface-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="text-sm text-surface-500 dark:text-dark-muted">{item.includes(' — ') ? item.split(' — ').slice(1).join(' — ') : item.split(' | A:')[1] || ''}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Related Tools</h2>
            {sameCategory.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-surface-400 dark:text-dark-muted">
                  Same Category — {tool.category}
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {sameCategory.map((rt) => (
                    <Link
                      key={rt.id}
                      href={`/tools/${rt.slug}`}
                      className="group rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                    >
                      <h3 className="font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                        {rt.name}
                      </h3>
                      <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                        {rt.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </>
            )}
            {popularTools.length > 0 && (
              <>
                <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-surface-400 dark:text-dark-muted">
                  Popular Tools
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {popularTools.map((rt) => (
                    <Link
                      key={rt.id}
                      href={`/tools/${rt.slug}`}
                      className="group rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                    >
                      <h3 className="font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                        {rt.name}
                      </h3>
                      <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                        {rt.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Learning Resources</h2>
            <p className="mt-2 text-surface-500 dark:text-dark-muted">
              Dive deeper with our comprehensive guides and tutorials.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { title: `${tool.name} - Beginner's Guide`, read: "5 min read" },
                { title: `${tool.name} Advanced Techniques`, read: "8 min read" },
              ].map((resource) => (
                <Link
                  key={resource.title}
                  href="/learning"
                  className="group flex items-center justify-between rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />
                    <div>
                      <p className="font-medium text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                        {resource.title}
                      </p>
                      <p className="text-xs text-surface-400 dark:text-dark-muted">{resource.read}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-surface-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Share</h2>
          <ShareButtons />
        </div>
      </section>
    </>
  );
}
