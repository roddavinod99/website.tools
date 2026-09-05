"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bookmark, History, type LucideIcon } from "lucide-react";
import { ToolLink } from "@/components/ui/tool-link";
import { usePinnedTools, useRecentTools } from "@/lib/personalize";
import type { Tool } from "@/types";

interface RailProps {
  tools: Tool[];
}

function resolveTools(slugs: string[], bySlug: Map<string, Tool>): Tool[] {
  const out: Tool[] = [];
  for (const slug of slugs) {
    const t = bySlug.get(slug);
    if (t) out.push(t);
  }
  return out;
}

function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);
  return mounted;
}

function RailShell({
  icon: Icon,
  iconClass,
  badgeClass,
  eyebrow,
  title,
  subtitle,
  titleId,
  viewAllHref,
  viewAllLabel,
  empty,
  tools,
  pinnedIcon,
  badgeLabel,
}: {
  icon: LucideIcon;
  iconClass: string;
  badgeClass: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  titleId: string;
  viewAllHref: string;
  viewAllLabel: string;
  empty: string;
  tools: Tool[];
  pinnedIcon: React.ReactNode;
  badgeLabel: string;
}) {
  if (tools.length === 0) {
    return (
      <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)]" aria-labelledby={titleId}>
        <div className="container py-10 md:py-12">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {empty}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)]" aria-labelledby={titleId}>
      <div className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              {eyebrow}
            </p>
            <h2 id={titleId} className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
              {title}
            </h2>
            <p className="mt-2 text-base text-[var(--color-text-muted)] text-pretty">{subtitle}</p>
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.slice(0, 4).map((tool) => (
            <ToolLink
              key={tool.id}
              slug={tool.slug}
              className="group relative flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-all hover:border-[var(--color-border-strong)] hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-md ${iconClass}`}>
                  <Bookmark className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}>
                  {pinnedIcon}
                  {badgeLabel}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                {tool.name}
              </h3>
              <p className="mt-1 flex-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                {tool.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">{tool.category}</span>
              </div>
            </ToolLink>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PinnedRail({ tools }: RailProps) {
  const mounted = useMounted();
  const { pinned } = usePinnedTools();
  if (!mounted) return null;
  const bySlug = new Map(tools.map((t) => [t.slug, t] as const));
  return (
    <RailShell
      icon={Bookmark}
      iconClass="bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
      badgeClass="border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)]"
      eyebrow="For you"
      title="Your pinned tools"
      subtitle="Tools you've bookmarked for quick access"
      titleId="pinned-heading"
      viewAllHref="/tools"
      viewAllLabel="View all tools"
      empty="No pinned tools yet — click the bookmark icon on any tool to add it here."
      tools={resolveTools(pinned, bySlug)}
      pinnedIcon={<Bookmark className="h-2.5 w-2.5" aria-hidden="true" />}
      badgeLabel="Pinned"
    />
  );
}

export function RecentRail({ tools }: RailProps) {
  const mounted = useMounted();
  const { recent } = useRecentTools();
  if (!mounted) return null;
  const bySlug = new Map(tools.map((t) => [t.slug, t] as const));
  return (
    <RailShell
      icon={History}
      iconClass="bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
      badgeClass="border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
      eyebrow="Recently used"
      title="Recently used"
      subtitle="Pick up where you left off"
      titleId="recent-rail-heading"
      viewAllHref="/tools"
      viewAllLabel="View all tools"
      empty="Your recently used tools will appear here once you start exploring."
      tools={resolveTools(recent, bySlug)}
      pinnedIcon={<History className="h-2.5 w-2.5" aria-hidden="true" />}
      badgeLabel="Recent"
    />
  );
}
