import Link from "next/link";

export type Crumb = { name: string; href: string };

/** Inline breadcrumb trail. No background, no border, no card. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="text-[var(--color-text-subtle)]">
                  /
                </span>
              )}
              {last ? (
                <span aria-current="page" className="font-medium text-[var(--color-text)]">
                  {c.name}
                </span>
              ) : (
                <Link href={c.href} className="transition-colors hover:text-[var(--color-text)]">
                  {c.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
