import Link from "next/link";
import type { Tool } from "@/types";

const RAIL_CATEGORIES = new Set(["Converters", "Encoders"]);

/**
 * Dense text list of common conversion/lookup tasks (spec §3.5). No cards:
 * icon-less rows of name + one-line description, registry-driven by
 * popularity. Two columns on desktop, one on mobile.
 */
export function ConversionsRail({ allTools }: { allTools: Tool[] }) {
  const items = allTools
    .filter((t) => RAIL_CATEGORIES.has(t.category) && !t.noindex)
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, 20);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="conversions-heading" className="container py-12 md:py-16">
      <h2 id="conversions-heading" className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
        Useful conversions &amp; lookups
      </h2>
      <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
        {items.map((t) => (
          <li key={t.slug} className="border-b border-[var(--color-border)] pb-2">
            <Link
              href={`/tools/${t.slug}`}
              className="group flex items-baseline justify-between gap-3"
              aria-label={`${t.name} — ${t.description}`}
            >
              <span className="font-medium text-[var(--color-text)] group-hover:text-blue-700 dark:text-blue-400 group-hover:underline underline-offset-4">
                {t.name}
              </span>
              <span className="truncate text-sm text-[var(--color-text-muted)]">{t.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
