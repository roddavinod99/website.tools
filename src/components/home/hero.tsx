"use client";

import { lazy, Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Lock, Zap, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logomark } from "@/components/ui/logomark";
import type { Tool } from "@/types";

const ToolSearch = lazy(() =>
  import("./tool-search").then((m) => ({ default: m.ToolSearch }))
);

const trustPoints = [
  { label: "Free", icon: Check },
  { label: "Client-side", icon: Lock },
  { label: "No account", icon: User },
  { label: "Privacy first", icon: Shield },
  { label: "Fast", icon: Zap },
];

export function Hero({ badgeText, allTools }: { badgeText: string; allTools: Tool[] }) {
  const router = useRouter();
  const trending = useMemo(
    () => [...allTools].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 8),
    [allTools],
  );

  return (
    <section className="relative border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="container relative py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-sm text-[var(--color-text-muted)]">
            <Logomark size="sm" />
            {badgeText}
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[var(--color-text)] text-balance sm:text-5xl lg:text-6xl">
            Free Developer <span className="text-blue-700 dark:text-blue-400 underline decoration-[var(--color-accent)] decoration-2 underline-offset-4">Tools</span> for Everyday Work
          </h1>

          <p className="mt-4 text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto text-pretty">
            Format, convert, generate, validate, encode, decode, and analyze — all in your browser.
          </p>

          <div className="mt-8 mx-auto max-w-2xl">
            <Suspense fallback={
              <div className="h-14 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]" />
            }>
              <ToolSearch allTools={allTools} />
            </Suspense>
          </div>

          <nav aria-label="Trending tools" className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
            {trending.map((t) => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="text-[var(--color-text-muted)] transition-colors hover:text-blue-700 dark:text-blue-400 hover:underline underline-offset-4"
              >
                {t.name}
              </Link>
            ))}
          </nav>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary" size="lg" onClick={() => router.push("/tools")}>
              Browse all tools
            </Button>
            <Button variant="subtle" size="lg" onClick={() => router.push("/search")}>
              Search Tools
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-blue-700 dark:text-blue-400">
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
              <span className="font-medium">{allTools.length}+ tools</span>
            </div>
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.label} className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-blue-700 dark:text-blue-400">
                    <Icon className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className="font-medium">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
