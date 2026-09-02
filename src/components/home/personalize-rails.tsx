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
  title,
  subtitle,
  viewAllHref,
  viewAllLabel,
  empty,
  tools,
  pinnedIcon,
}: {
  icon: LucideIcon;
  iconClass: string;
  badgeClass: string;
  title: string;
  subtitle: string;
  viewAllHref: string;
  viewAllLabel: string;
  empty: string;
  tools: Tool[];
  pinnedIcon: React.ReactNode;
}) {
  if (tools.length === 0) {
    return (
      <section className="border-t border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface">
        <div className="container py-10 md:py-12">
          <div className="flex items-center gap-3 text-sm text-surface-500 dark:text-dark-muted">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {empty}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface">
      <div className="container py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
                {title}
              </h2>
              <p className="mt-1 text-surface-600 dark:text-dark-muted">{subtitle}</p>
            </div>
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.slice(0, 4).map((tool) => (
            <ToolLink
              key={tool.id}
              slug={tool.slug}
              className="group relative flex flex-col rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}>
                  <Bookmark className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}>
                  {pinnedIcon}
                  {title.split(" ")[0]}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-surface-900 dark:text-dark-text group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {tool.name}
              </h3>
              <p className="mt-1 flex-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                {tool.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-surface-600 dark:text-dark-muted">{tool.category}</span>
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
      iconClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      badgeClass="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      title="Your pinned tools"
      subtitle="Tools you've bookmarked for quick access"
      viewAllHref="/tools"
      viewAllLabel="View all tools"
      empty="No pinned tools yet — click the bookmark icon on any tool to add it here."
      tools={resolveTools(pinned, bySlug)}
      pinnedIcon={<Bookmark className="h-2.5 w-2.5" aria-hidden="true" />}
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
      iconClass="bg-surface-100 text-surface-600 dark:bg-dark-border dark:text-dark-muted"
      badgeClass="bg-surface-100 text-surface-600 dark:bg-dark-border dark:text-dark-muted"
      title="Recently used"
      subtitle="Pick up where you left off"
      viewAllHref="/tools"
      viewAllLabel="View all tools"
      empty="Your recently used tools will appear here once you start exploring."
      tools={resolveTools(recent, bySlug)}
      pinnedIcon={<History className="h-2.5 w-2.5" aria-hidden="true" />}
    />
  );
}
