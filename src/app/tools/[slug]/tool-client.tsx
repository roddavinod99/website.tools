"use client";

import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { ToolInterface } from "@/components/tools/dynamic-tool-loader";
import { ShareButtons } from "@/components/tools/utilities/share-buttons";
import { FinanceDisclaimer } from "@/components/tools/finance/finance-disclaimer";
import { InContentAd, SidebarAd } from "@/components/ads";
import { adSlots } from "@/lib/data/ads";
import { TableOfContents, type TocItem } from "@/components/layout/table-of-contents";
import { ToolCard } from "@/components/ui/tool-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeatureBadgesGroup } from "@/components/ui/feature-badge";
import { NextStepCTA } from "@/components/ui/next-step-cta";
import { TryExamples } from "@/components/ui/try-examples";
import Link from "next/link";
import {
  CircleCheck, CircleAlert,
  Lightbulb, BookOpen, ArrowRight, ChevronRight,
  Copy, FileText, ExternalLink, FolderOpen, Keyboard,
  ShieldCheck, EyeOff, Lock, Activity, type LucideIcon,
} from "lucide-react";
import { dispatchToolShortcut, isToolShortcutEvent } from "@/lib/tool-shortcuts";
import { copyText } from "@/lib/clipboard";
import { parseFaqItem } from "@/lib/faq";
import { dispatchLoadExample } from "@/lib/load-example";
import { useNetworkRequestCount } from "@/lib/network-monitor";
import { siteConfig } from "@/lib/data";
import { recordToolView } from "@/lib/personalize";

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
  examples?: string[];
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
  references?: { label: string; url: string }[];
}

interface ToolClientProps {
  tool: ToolData;
  content: ToolContent;
  sameCategory: ToolData[];
  related: ToolData[];
  popularTools: ToolData[];
  specificGuide: { slug: string; title: string; description: string; readTime: string } | null;
  tocItems: TocItem[];
  mainSiteUrl: string;
  categorySlug?: string;
  nextSteps?: { tool: string; label: string }[];
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
  if (content.references && content.references.length > 0) {
    items.push({ id: "references", label: "References", level: 1 });
  }
  items.push({ id: "learning-resources", label: "Learning Resources", level: 1 });
  items.push({ id: "related-tools", label: "Related Tools", level: 1 });

  return items;
}

function ToolActions({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-surface-500 dark:text-dark-muted" role="group" aria-label="Tool actions">
      <Button variant="ghost" size="sm" onClick={onCopy} aria-label="Copy output (Ctrl+Shift+C)">
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
        <kbd
          className="ml-1 inline-flex h-5 items-center gap-0.5 rounded border border-surface-200 bg-white px-1.5 font-mono text-[10px] font-medium text-surface-500 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted"
          aria-hidden="true"
        >
          <span>Ctrl</span>
          <span className="text-surface-300 dark:text-dark-border">+</span>
          <span>Shift</span>
          <span className="text-surface-300 dark:text-dark-border">+</span>
          <span>C</span>
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
  icon: ReactNode;
  external?: boolean;
}

function QuickLinks({ tool, specificGuide, categorySlug, mainSiteUrl, toolsRepo }: {
  tool: ToolData;
  specificGuide: ToolClientProps["specificGuide"];
  categorySlug?: string;
  mainSiteUrl: string;
  toolsRepo?: string;
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

  // Open-source transparency: link to the tool's source file in the public
  // repo via GitHub's code search, so the privacy/auditability promise is
  // verifiable in one click. The search URL is stable even when files
  // move between subdirectories (formatters/, crypto/, utilities/, ...).
  // We only render the link if a toolsRepo is configured in siteConfig.
  if (toolsRepo) {
    links.push({
      href: `${toolsRepo}/search?q=${encodeURIComponent(`"${tool.slug}" path:src/components/tools`)}&type=code`,
      label: "View source",
      icon: <Copy className="h-3.5 w-3.5" aria-hidden="true" />,
      external: true,
    });
  }

  return (
    <nav className="mt-3 flex flex-wrap items-center gap-2 text-sm" aria-label="Quick links">
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

function SectionHeading({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold text-surface-900 dark:text-dark-text">
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />}
      {children}
    </h2>
  );
}

function CollapsibleSection({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <details
      id={id}
      className="group rounded-xl border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <h2 className="flex items-center gap-2 text-xl font-bold text-surface-900 dark:text-dark-text">
          {Icon && <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />}
          {title}
        </h2>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-surface-400 transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

export function ToolClient({
  tool,
  content,
  sameCategory,
  related,
  popularTools,
  specificGuide,
  tocItems,
  mainSiteUrl,
  categorySlug,
  nextSteps = [],
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

  const handleLoadExample = useCallback(
    (text: string) => {
      dispatchLoadExample(tool.slug, text);
    },
    [tool.slug],
  );

  const { count: requestCount, recent: recentRequests } = useNetworkRequestCount();

  // Record this tool as "recently used" once on mount. SSR-safe: hooks only
  // fire on the client, so the localStorage write never runs on the server.
  useEffect(() => {
    recordToolView(tool.slug);
  }, [tool.slug]);

  const networkPillTitle = useMemo(() => {
    if (requestCount === 0) {
      return "This page has made 0 outbound network requests since it loaded. Your tool input never leaves the browser.";
    }
    const paths = recentRequests.map((r) => {
      try {
        return new URL(r.url, window.location.href).pathname;
      } catch {
        return r.url;
      }
    });
    const list = paths.length ? `\nRecent: ${paths.join(", ")}` : "";
    return `This page has made ${requestCount} outbound network request(s) since it loaded — none of them carried your tool input.${list}`;
  }, [requestCount, recentRequests]);

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

  const relatedList = [...sameCategory, ...related, ...popularTools].slice(0, 8);

  return (
    <>
      <TableOfContents items={tocItems} activeId={activeTocId} />

      <div className="container py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-surface-500 dark:text-dark-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-surface-900 dark:hover:text-dark-text transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <Link href="/tools" className="hover:text-surface-900 dark:hover:text-dark-text transition-colors">Tools</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span className="text-surface-900 dark:text-dark-text font-medium">{tool.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          {/* Main column */}
          <div className="max-w-3xl space-y-8">
            {/* Hero with Tool Interface */}
            <section id="hero">
              {/* Trust badges - above the tool so users see the privacy promise before they engage */}
              <div
                className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-surface-500 dark:text-dark-muted"
                role="list"
                aria-label="Tool guarantees"
              >
                <span className="inline-flex items-center gap-1.5" role="listitem">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" aria-hidden="true" />
                  100% Client-Side
                </span>
                <span className="inline-flex items-center gap-1.5" role="listitem">
                  <EyeOff className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" aria-hidden="true" />
                  Your Data Stays Local
                </span>
                <span className="inline-flex items-center gap-1.5" role="listitem">
                  <Lock className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" aria-hidden="true" />
                  No Account Required
                </span>
                <span
                  className="inline-flex items-center gap-1.5"
                  role="listitem"
                  title={networkPillTitle}
                >
                  <Activity
                    className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400"
                    aria-hidden="true"
                  />
                  <span data-testid="network-request-count">
                    {requestCount === 0
                      ? "0 network requests"
                      : `${requestCount} network request${requestCount === 1 ? "" : "s"}`}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">{tool.category}</Badge>
                {tool.trending && <Badge variant="warning">Trending</Badge>}
                {tool.new && <Badge variant="new">New</Badge>}
              </div>
              <h1 className="mt-2 text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
                {tool.name}
              </h1>
              <p className="mt-1.5 text-base text-surface-500 dark:text-dark-muted max-w-prose">
                {tool.description}
              </p>

              {/* Feature Badges - Key capabilities at a glance */}
              {content.features && content.features.length > 0 && (
                <div className="mt-3" aria-label="Key features">
                  <FeatureBadgesGroup features={content.features} maxVisible={5} variant="brand" size="sm" />
                </div>
              )}

              {/* Tool Interface Card */}
              <div id={`tool-interface-${tool.slug}`} className="mt-5 rounded-xl border border-surface-200 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface">
                <ToolInterface slug={tool.slug} name={tool.name} />
              </div>

              {/* Load-example affordance - lets a first-time user try the tool instantly */}
              {tool.examples && tool.examples.length > 0 && (
                <TryExamples
                  examples={tool.examples}
                  onExampleSelect={handleLoadExample}
                  label="Load example"
                />
              )}

              {/* Next Step CTA */}
              {nextSteps && nextSteps.length > 0 && (
                <NextStepCTA suggestions={nextSteps} />
              )}

              {/* Tool Actions - immediately accessible */}
              <ToolActions copied={copied} onCopy={() => handleCopy()} />

              {/* Keyboard shortcut hint - tells power users the ? modal is reachable */}
              <p className="mt-2 flex items-center gap-1.5 text-xs text-surface-500 dark:text-dark-muted">
                <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  Press <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-surface-200 bg-white px-1 font-mono text-[10px] text-surface-600 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted" aria-hidden="true">?</kbd>{" "}
                  for keyboard shortcuts
                </span>
              </p>

              {/* Quick Links */}
              <QuickLinks tool={tool} specificGuide={specificGuide} categorySlug={categorySlug} mainSiteUrl={mainSiteUrl} toolsRepo={siteConfig.links.toolsRepo} />
            </section>

            <InContentAd className="my-2" slot={adSlots.toolInContent1} />

            {/* Finance Disclaimer - only on financial tool pages */}
            {tool.category === "Finance" && <FinanceDisclaimer />}

            {/* About */}
            {content.whatItDoes || content.whyItExists || content.whoShouldUse ? (
              <section id="about" className="space-y-3">
                <SectionHeading>About</SectionHeading>
                <div className="space-y-3 text-surface-600 dark:text-dark-muted">
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
                  {content.useCases.length > 0 && (
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
                  )}
                </div>
              </section>
            ) : null}

            {/* Key Features */}
            {content.features && content.features.length > 0 && (
              <section id="features" className="space-y-3">
                <SectionHeading>Key Features</SectionHeading>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {content.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 rounded-lg border border-surface-200 bg-white p-2.5 dark:border-dark-border dark:bg-dark-surface">
                      <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                      <span className="text-sm text-surface-600 dark:text-dark-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* How to Use */}
            {content.instructions.length > 0 && (
              <section id="how-to-use" className="space-y-3">
                <SectionHeading>How to Use</SectionHeading>
                <div className="space-y-2.5">
                  {content.instructions.map((inst, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-sm font-semibold dark:bg-brand-900/30 dark:text-brand-400">
                        {i + 1}
                      </div>
                      <p className="text-surface-600 dark:text-dark-muted">{inst}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Examples */}
            {content.examples.length > 0 && (
              <section id="examples" className="space-y-3">
                <SectionHeading>Examples</SectionHeading>
                <div className="space-y-2.5">
                  {content.examples.map((ex, i) => (
                    <Card key={i} variant="outlined" padding="sm">
                      <pre tabIndex={0} className="overflow-x-auto whitespace-pre-wrap rounded-md bg-surface-50 p-2.5 text-xs dark:bg-dark-bg">
                        <code>{ex}</code>
                      </pre>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Best Practices */}
            {content.bestPractices.length > 0 && (
              <CollapsibleSection id="best-practices" title="Best Practices" icon={Lightbulb}>
                <ul className="space-y-2">
                  {content.bestPractices.map((bp, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" aria-hidden="true" />
                      <span className="text-sm text-surface-600 dark:text-dark-muted">{bp}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}

            {/* Common Mistakes */}
            {content.commonMistakes.length > 0 && (
              <CollapsibleSection id="common-mistakes" title="Common Mistakes" icon={CircleAlert}>
                <ul className="space-y-2">
                  {content.commonMistakes.map((cm, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true" />
                      <span className="text-sm text-surface-600 dark:text-dark-muted">{cm}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}

            {/* FAQ */}
            {content.faq.length > 0 && (
              <section id="faq" className="space-y-3">
                <SectionHeading>FAQ</SectionHeading>
                <div className="space-y-2">
                  {content.faq.map((item, i) => {
                    const { question, answer } = parseFaqItem(item);
                    return (
                      <div key={i} className="rounded-lg border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface">
                        <p className="px-4 pt-3 font-medium text-surface-900 dark:text-dark-text">
                          {question}
                        </p>
                        <p className="px-4 pb-3 text-sm text-surface-500 dark:text-dark-muted">
                          {answer}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* References */}
            {content.references && content.references.length > 0 && (
              <CollapsibleSection id="references" title="References" icon={BookOpen}>
                <p className="mb-3 text-sm text-surface-500 dark:text-dark-muted">
                  Authoritative specifications, standards, and in-depth reading for {tool.name}.
                </p>
                <ul className="space-y-2">
                  {content.references.map((ref) => {
                    const isInternal = ref.url.startsWith("/");
                    if (isInternal) {
                      return (
                        <li key={`${ref.label}-${ref.url}`} className="flex items-start gap-2.5">
                          <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                          <Link href={ref.url} className="text-sm text-surface-600 hover:text-brand-600 dark:text-dark-muted dark:hover:text-brand-400 underline">
                            {ref.label}
                          </Link>
                        </li>
                      );
                    }
                    return (
                      <li key={`${ref.label}-${ref.url}`} className="flex items-start gap-2.5">
                        <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-600 hover:text-brand-700 underline dark:text-brand-400"
                        >
                          {ref.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </CollapsibleSection>
            )}

            <InContentAd className="my-2" slot={adSlots.toolInContent2} />

            {/* Share */}
            <section className="space-y-3">
              <SectionHeading>Share</SectionHeading>
              <ShareButtons />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="mt-8 space-y-6 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
            {/* Related Tools */}
            <section id="related-tools" className="space-y-3">
              <SectionHeading>Related Tools</SectionHeading>
              <div className="space-y-2">
                {relatedList.map((rt) => (
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
                    variant="compact"
                    size="sm"
                    showPopularity={false}
                  />
                ))}
              </div>
            </section>

            {/* Learning Resources */}
            <section id="learning-resources" className="space-y-3">
              <SectionHeading icon={BookOpen}>Learning Resources</SectionHeading>
              <div className="space-y-2">
                {specificGuide && (
                  <Link
                    href={`/guides/${specificGuide.slug}`}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-surface-200 bg-white p-2.5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                  >
                    <div className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400">
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
                    className="group flex items-center justify-between gap-2 rounded-lg border border-surface-200 bg-white p-2.5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                  >
                    <div className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400">
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
                  className="group flex items-center justify-between gap-2 rounded-lg border border-surface-200 bg-white p-2.5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="flex items-start gap-2">
                    <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400">
                        Developer Guides
                      </p>
                      <p className="text-xs text-surface-400 dark:text-dark-muted">In-depth tutorials and best practices</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-surface-400" aria-hidden="true" />
                </Link>
                <Link
                  href="/guides"
                  className="group flex items-center justify-between gap-2 rounded-lg border border-surface-200 bg-white p-2.5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="flex items-start gap-2">
                    <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-surface-900 group-hover:text-brand-600 dark:text-dark-text dark:group-hover:text-brand-400">
                        Developer Guides
                      </p>
                      <p className="text-xs text-surface-400 dark:text-dark-muted">In-depth guides and tutorials</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-surface-400" aria-hidden="true" />
                </Link>
              </div>
            </section>

            <SidebarAd slot={adSlots.toolSidebar} />
          </aside>
        </div>
      </div>
    </>
  );
}