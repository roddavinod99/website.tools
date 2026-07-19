"use client";

import { useState, useEffect } from "react";
import { ToolInterface } from "@/components/tools/dynamic-tool-loader";
import { ShareButtons } from "@/components/tools/share-buttons";
import { InContentAd } from "@/components/ads";
import { TableOfContents, CollapsibleSection, type TocItem } from "@/components/layout/table-of-contents";
import { ToolCard } from "@/components/ui/tool-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  CircleCheck, CircleAlert,
  Lightbulb, BookOpen, ArrowRight, ChevronRight,
} from "lucide-react";
import { siteConfig } from "@/lib/constants";

interface ToolData {
  id: string;
  name: string;
  description: string;
  category: string;
  slug: string;
  popularity: number;
  featured?: boolean;
  trending?: boolean;
  new?: boolean;
  icon?: string;
}

interface ToolContent {
  whatItDoes: string;
  whyItExists: string;
  whoShouldUse: string;
  useCases: string[];
  instructions: string[];
  examples: string[];
  bestPractices: string[];
  commonMistakes: string[];
  faq: string[];
}

interface ToolClientProps {
  tool: ToolData;
  content: ToolContent;
  sameCategory: ToolData[];
  popularTools: ToolData[];
  specificGuide: { slug: string; title: string; description: string; readTime: string } | null;
  tocItems: TocItem[];
}

function generateTocItems(content: ToolContent): TocItem[] {
  const items: TocItem[] = [];
  
  if (content.whatItDoes || content.whyItExists || content.whoShouldUse || content.useCases.length > 0) {
    items.push({ id: "about", label: "About", level: 1 });
  }
  if (content.instructions.length > 0) {
    items.push({ id: "how-to-use", label: "How to Use", level: 1 });
  }
  if (content.examples.length > 0) {
    items.push({ id: "examples", label: "Examples", level: 1 });
  }
  if (content.bestPractices.length > 0) {
    items.push({ id: "best-practices", label: "Best Practices", level: 1 });
  }
  if (content.commonMistakes.length > 0) {
    items.push({ id: "common-mistakes", label: "Common Mistakes", level: 1 });
  }
  if (content.faq.length > 0) {
    items.push({ id: "faq", label: "FAQ", level: 1 });
  }
  items.push({ id: "learning-resources", label: "Learning Resources", level: 1 });
  items.push({ id: "related-tools", label: "Related Tools", level: 1 });
  
  return items;
}

export function ToolClient({ 
  tool, 
  content, 
  sameCategory, 
  popularTools, 
  specificGuide, 
  tocItems 
}: ToolClientProps) {
  const [activeTocId, setActiveTocId] = useState("");

  useEffect(() => {
    const items = generateTocItems(content);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [content]);

  return (
    <>
      <TableOfContents items={tocItems} activeId={activeTocId} />

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

      <section id="hero" className="border-b border-surface-200 dark:border-dark-border">
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

            <InContentAd className="my-12" slot="3456789012" />
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">About</h2>
            <div className="mt-4 space-y-4 text-surface-600 dark:text-dark-muted">
              <p>{content.whatItDoes}</p>
              <p>{content.whyItExists}</p>
              <p className="text-sm text-surface-400 dark:text-dark-muted">
                This tool is part of the{" "}
                <a href={siteConfig.mainSiteUrl} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 underline">
                  DevStackIO
                </a>{" "}
                platform — a collection of free online developer tools from DevStackIO.
                Browse more free developer resources on{" "}
                <a href={siteConfig.mainSiteUrl} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 underline">
                  DevStackIO
                </a>.
              </p>
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

      <section id="how-to-use" className="border-b border-surface-200 dark:border-dark-border">
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

      <InContentAd className="my-12" slot="5678901234" />

      <section id="examples" className="border-b border-surface-200 dark:border-dark-border">
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

      <section id="best-practices" className="border-b border-surface-200 dark:border-dark-border">
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

      <CollapsibleSection
        title="Common Mistakes"
        icon={CircleAlert}
        defaultOpen={false}
        className="border-b border-surface-200 dark:border-dark-border"
      >
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
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
      </CollapsibleSection>

      <section id="faq" className="border-b border-surface-200 dark:border-dark-border">
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
                    {item.includes(" — ") ? item.split(" — ")[0] : item.split(" | A:")[0]}
                    <ChevronRight className="h-4 w-4 text-surface-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="text-sm text-surface-500 dark:text-dark-muted">{item.includes(" — ") ? item.split(" — ").slice(1).join(" — ") : item.split(" | A:")[1] || ""}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <InContentAd className="my-12" slot="7890123456" />

      <CollapsibleSection
        title="Related Tools"
        defaultOpen={false}
        className="border-b border-surface-200 dark:border-dark-border"
      >
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            {sameCategory.length > 0 && (
              <>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 dark:text-dark-muted">
                  Same Category — {tool.category}
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {sameCategory.map((rt) => (
                    <ToolCard
                      key={rt.id}
                      tool={{
                        id: rt.id,
                        name: rt.name,
                        description: rt.description,
                        category: rt.category,
                        slug: rt.slug,
                        popularity: rt.popularity,
                        featured: rt.featured,
                        trending: rt.trending,
                        new: rt.new,
                        icon: rt.icon,
                      }}
                      variant="related"
                      size="sm"
                    />
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
                    <ToolCard
                      key={rt.id}
                      tool={{
                        id: rt.id,
                        name: rt.name,
                        description: rt.description,
                        category: rt.category,
                        slug: rt.slug,
                        popularity: rt.popularity,
                        featured: rt.featured,
                        trending: rt.trending,
                        new: rt.new,
                        icon: rt.icon,
                      }}
                      variant="related"
                      size="sm"
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Learning Resources"
        icon={BookOpen}
        defaultOpen={false}
        className="border-b border-surface-200 dark:border-dark-border"
      >
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="mt-2 text-surface-500 dark:text-dark-muted">
              Dive deeper with our comprehensive guides and tutorials.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {specificGuide && (
                <Link
                  href={`/guides/${specificGuide.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />
                    <div>
                      <p className="font-medium text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                        {specificGuide.title}
                      </p>
                      <p className="text-xs text-surface-400 dark:text-dark-muted">{specificGuide.readTime} read</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-surface-400" />
                </Link>
              )}
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
      </CollapsibleSection>

      <section className="container py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Share</h2>
          <ShareButtons />
        </div>
      </section>
    </>
  );
}