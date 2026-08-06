"use client";

import { useState, useEffect, useCallback } from "react";
import { ToolInterface } from "@/components/tools/dynamic-tool-loader";
import { ShareButtons } from "@/components/tools/share-buttons";
import { InContentAd } from "@/components/ads";
import { TableOfContents, CollapsibleSection, type TocItem } from "@/components/layout/table-of-contents";
import { ToolCard } from "@/components/ui/tool-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CircleCheck, CircleAlert,
  Lightbulb, BookOpen, ArrowRight, ChevronRight,
  Copy, FileText, ExternalLink, FolderOpen,
} from "lucide-react";
import { dispatchToolShortcut, isToolShortcutEvent } from "@/lib/tool-shortcuts";
import { copyText } from "@/lib/clipboard";

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
  features?: string[];
}

interface ToolClientProps {
  tool: ToolData;
  content: ToolContent;
  sameCategory: ToolData[];
  popularTools: ToolData[];
  specificGuide: { slug: string; title: string; description: string; readTime: string } | null;
  tocItems: TocItem[];
  mainSiteUrl: string;
  categorySlug?: string;
}

function generateTocItems(content: ToolContent): TocItem[] {
  const items: TocItem[] = [];
  
  if (content.whatItDoes || content.whyItExists || content.whoShouldUse || content.useCases.length > 0) {
    items.push({ id: "about", label: "About", level: 1 });
  }
  if (content.features && content.features.length > 0) {
    items.push({ id: "features", label: "Key Features", level: 1 });
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

function ToolActions({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-surface-500 dark:text-dark-muted" role="group" aria-label="Tool actions">
      <Button variant="ghost" size="sm" onClick={onCopy} aria-label="Copy output (Ctrl+Shift+C)">
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
        <kbd className="ml-1 hidden lg:inline-flex h-4 items-center gap-1 rounded border border-surface-200 bg-white px-1 text-[10px] text-surface-400 dark:border-dark-border dark:bg-dark-bg">
          <span>Ctrl</span><span>⇧</span><span>C</span>
        </kbd>
      </Button>
    </div>
  );
}

async function copyToolOutput(slug: string): Promise<boolean> {
  const container = document.getElementById(`tool-interface-${slug}`);
  if (!container) return false;

  const output =
    container.querySelector<HTMLElement>('[data-testid="tool-output"]') ??
    container.querySelector<HTMLTextAreaElement>("textarea[readonly]") ??
    container.querySelector<HTMLElement>("pre");

  let text = "";
  if (output instanceof HTMLTextAreaElement) {
    text = output.value;
  } else if (output) {
    text = output.innerText;
  }

  if (text.trim()) {
    return copyText(text);
  }

  const selection = window.getSelection()?.toString() ?? "";
  return selection ? copyText(selection) : false;
}

interface QuickLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
}

function QuickLinks({ tool, specificGuide, categorySlug, mainSiteUrl }: { 
  tool: ToolData; 
  specificGuide: ToolClientProps["specificGuide"]; 
  categorySlug?: string;
  mainSiteUrl: string;
}) {
  const links: QuickLink[] = [
    {
      href: `/tools/${tool.slug}#examples`,
      label: "Examples",
      icon: <FileText className="h-3.5 w-3.5" aria-hidden="true" />,
    },
    {
      href: specificGuide ? `/guides/${specificGuide.slug}` : `/guides`,
      label: specificGuide ? "Guide" : "Guides",
      icon: <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />,
    },
  ];

  if (categorySlug) {
    links.push({
      href: `/categories/${categorySlug}`,
      label: `More ${tool.category}`,
      icon: <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />,
    });
  }

  links.push({
    href: mainSiteUrl,
    label: "DevStackIO",
    icon: <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />,
    external: true,
  });

  return (
    <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm" aria-label="Quick links">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-dark-muted dark:hover:text-dark-text dark:hover:bg-dark-surface transition-colors"
        >
          {link.icon}
          <span>{link.label}</span>
        </a>
      ))}
    </nav>
  );
}

export function ToolClient({ 
  tool, 
  content, 
  sameCategory, 
  popularTools, 
  specificGuide, 
  tocItems,
  mainSiteUrl,
  categorySlug,
}: ToolClientProps) {
  const [activeTocId, setActiveTocId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const ok = await copyToolOutput(tool.slug);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [tool.slug]);

  useEffect(() => {
    const onShortcut = (e: KeyboardEvent) => {
      if (isToolShortcutEvent(e, "Enter", false)) {
        e.preventDefault();
        dispatchToolShortcut("run");
      } else if (isToolShortcutEvent(e, "C", true)) {
        e.preventDefault();
        handleCopy();
      } else if (isToolShortcutEvent(e, "M", true)) {
        e.preventDefault();
        dispatchToolShortcut("minify");
      } else if (isToolShortcutEvent(e, "V", true)) {
        e.preventDefault();
        dispatchToolShortcut("validate");
      }
    };
    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  }, [handleCopy]);

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

      {/* Breadcrumb */}
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-surface-900 dark:hover:text-dark-text transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            <Link href="/tools" className="hover:text-surface-900 dark:hover:text-dark-text transition-colors">Tools</Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            <span className="text-surface-900 dark:text-dark-text font-medium">{tool.name}</span>
          </nav>
        </div>
      </section>

      {/* Hero with Tool Interface */}
      <section id="hero" className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8 md:py-10">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="default">{tool.category}</Badge>
              {tool.trending && <Badge variant="warning">Trending</Badge>}
              {tool.new && <Badge variant="new">New</Badge>}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
              {tool.name}
            </h1>
            <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted max-w-prose">
              {tool.description}
            </p>

            {/* Tool Interface Card */}
            <div id={`tool-interface-${tool.slug}`} className="mt-6 rounded-xl border border-surface-200 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface">
              <ToolInterface slug={tool.slug} name={tool.name} />
            </div>

            {/* Tool Actions - immediately accessible */}
            <ToolActions copied={copied} onCopy={() => handleCopy()} />

            {/* Quick Links */}
            <QuickLinks tool={tool} specificGuide={specificGuide} categorySlug={categorySlug} mainSiteUrl={mainSiteUrl} />

            <InContentAd className="my-6" slot="3456789012" />
          </div>
        </div>
      </section>

      {/* Key Features */}
      {content.features && content.features.length > 0 && (
        <section id="features" className="border-b border-surface-200 dark:border-dark-border">
          <div className="container py-8 md:py-10">
            <div className="mx-auto max-w-3xl prose">
              <h2 className="text-xl font-bold text-surface-900 dark:text-dark-text">Key Features</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {content.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 rounded-lg border border-surface-200 bg-white p-2.5 dark:border-dark-border dark:bg-dark-surface">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                    <span className="text-sm text-surface-600 dark:text-dark-muted">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section id="about" className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8 md:py-10">
          <div className="mx-auto max-w-3xl prose">
            <h2 className="text-xl font-bold text-surface-900 dark:text-dark-text">About</h2>
            <div className="mt-4 space-y-4 text-surface-600 dark:text-dark-muted">
              <p>{content.whatItDoes}</p>
              <p>{content.whyItExists}</p>
              <p className="text-sm text-surface-400 dark:text-dark-muted">
                This tool is part of the{" "}
                <a href={mainSiteUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 underline">
                  DevStackIO
                </a>{" "}
                platform — a collection of free online developer tools from DevStackIO.
                Browse more free developer resources on{" "}
                <a href={mainSiteUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 underline">
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
                      <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                      <span>{uc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section id="how-to-use" className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8 md:py-10">
          <div className="mx-auto max-w-3xl prose">
            <h2 className="text-xl font-bold text-surface-900 dark:text-dark-text">How to Use</h2>
            <div className="mt-4 space-y-3">
              {content.instructions.map((inst, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-sm font-semibold dark:bg-brand-900/30 dark:text-brand-400">
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

      <InContentAd className="my-4" slot="5678901234" />

      {/* Examples */}
      <section id="examples" className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8 md:py-10">
          <div className="mx-auto max-w-3xl prose">
            <h2 className="text-xl font-bold text-surface-900 dark:text-dark-text">Examples</h2>
            <div className="mt-4 space-y-3">
              {content.examples.map((ex, i) => (
                <Card key={i} variant="outlined" padding="sm">
                  <pre tabIndex={0} className="overflow-x-auto whitespace-pre-wrap rounded-md bg-surface-50 p-2.5 text-xs dark:bg-dark-bg">
                    <code>{ex}</code>
                  </pre>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8 md:py-10">
          <div className="mx-auto max-w-3xl prose">
            <h2 className="text-xl font-bold text-surface-900 dark:text-dark-text">Best Practices</h2>
            <ul className="mt-4 space-y-2">
              {content.bestPractices.map((bp, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" aria-hidden="true" />
                  <span className="text-surface-600 dark:text-dark-muted">{bp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <CollapsibleSection
        title="Common Mistakes"
        icon={CircleAlert}
        defaultOpen={true}
        className="border-b border-surface-200 dark:border-dark-border"
      >
        <div className="container py-8 md:py-10">
          <div className="mx-auto max-w-3xl prose">
            <ul className="mt-4 space-y-2">
              {content.commonMistakes.map((cm, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true" />
                  <span className="text-surface-600 dark:text-dark-muted">{cm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      {/* FAQ */}
      <section id="faq" className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8 md:py-10">
          <div className="mx-auto max-w-3xl prose">
            <h2 className="text-xl font-bold text-surface-900 dark:text-dark-text">FAQ</h2>
            <div className="mt-4 space-y-2">
              {content.faq.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium text-surface-900 dark:text-dark-text">
                    {item.includes(" — ") ? item.split(" — ")[0] : item.split(" | A:")[0]}
                    <ChevronRight className="h-4 w-4 text-surface-400 transition-transform group-open:rotate-90" aria-hidden="true" />
                  </summary>
                  <div className="px-4 pb-3">
                    <p className="text-sm text-surface-500 dark:text-dark-muted">{item.includes(" — ") ? item.split(" — ").slice(1).join(" — ") : item.split(" | A:")[1] || ""}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <InContentAd className="my-4" slot="7890123456" />

      {/* Related Tools */}
      <CollapsibleSection
        title="Related Tools"
        defaultOpen={true}
        className="border-b border-surface-200 dark:border-dark-border"
      >
        <div className="container py-8 md:py-10">
          <div className="mx-auto max-w-3xl prose">
            {sameCategory.length > 0 && (
              <>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 dark:text-dark-muted">
                  Same Category — {tool.category}
                </h3>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                  {sameCategory.slice(0, 6).map((rt) => (
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
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-surface-400 dark:text-dark-muted">
                  Popular Tools
                </h3>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                  {popularTools.slice(0, 6).map((rt) => (
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

      {/* Learning Resources */}
      <CollapsibleSection
        title="Learning Resources"
        icon={BookOpen}
        defaultOpen={true}
        className="border-b border-surface-200 dark:border-dark-border"
      >
        <div className="container py-8 md:py-10">
          <div className="mx-auto max-w-3xl prose">
            <p className="mt-2 text-surface-500 dark:text-dark-muted">
              Dive deeper with our comprehensive guides and tutorials.
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {specificGuide && (
                <Link
                  href={`/guides/${specificGuide.slug}`}
                  className="group flex items-center justify-between rounded-lg border border-surface-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="flex items-start gap-2.5">
                    <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400 text-sm">
                        {specificGuide.title}
                      </p>
                      <p className="text-xs text-surface-400 dark:text-dark-muted">{specificGuide.readTime} read</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-surface-400" aria-hidden="true" />
                </Link>
              )}
              {categorySlug && (
                <Link
                  href={`/categories/${categorySlug}`}
                  className="group flex items-center justify-between rounded-lg border border-surface-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="flex items-start gap-2.5">
                    <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400 text-sm">
                        More {tool.category} Tools
                      </p>
                      <p className="text-xs text-surface-400 dark:text-dark-muted">Browse the full category</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-surface-400" aria-hidden="true" />
                </Link>
              )}
              <Link
                href="/guides"
                className="group flex items-center justify-between rounded-lg border border-surface-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="flex items-start gap-2.5">
                  <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400 text-sm">
                      Developer Guides
                    </p>
                    <p className="text-xs text-surface-400 dark:text-dark-muted">In-depth tutorials and best practices</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-surface-400" aria-hidden="true" />
              </Link>
              <Link
                href="/learning"
                className="group flex items-center justify-between rounded-lg border border-surface-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="flex items-start gap-2.5">
                  <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400 text-sm">
                      Learning Center
                    </p>
                    <p className="text-xs text-surface-400 dark:text-dark-muted">Core concepts and fundamentals</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-surface-400" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Share */}
      <section className="container py-8 md:py-10">
        <div className="mx-auto max-w-3xl prose">
          <h2 className="text-xl font-bold text-surface-900 dark:text-dark-text">Share</h2>
          <ShareButtons />
        </div>
      </section>
    </>
  );
}