"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { categories } from "@/lib/data";
import { allTools } from "@/lib/data/tools";

export function CategoriesMegaMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(t) && buttonRef.current && !buttonRef.current.contains(t)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const counts = allTools.reduce<Record<string, number>>((acc, t) => {
    const c = (t as { category: string }).category;
    if (c) acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});
  const top = (categories as Array<{ slug: string; name: string; description: string; toolCount?: number }>)
    .map((c) => ({ ...c, count: (c.toolCount ?? counts[c.name] ?? 0) }))
    .filter((c) => c.count > 0)
    .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
    .slice(0, 8);

  return (
    <div
      className="relative"
      ref={containerRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Browse categories"
        className="hidden md:flex items-center gap-1.5 h-10 px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] rounded-md touch-target"
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
      >
        Categories <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Categories"
          className="absolute top-full left-0 mt-1 w-[640px] p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md z-dropdown"
          style={{ boxShadow: "var(--shadow-overlay)" }}
        >
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3" role="none">
            {top.map((c: { slug: string; name: string; description: string; count: number }) => (
              <li key={c.slug} role="menuitem">
                <Link
                  href={`/categories/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="block group"
                >
                  <span className="text-sm font-medium group-hover:text-blue-700 dark:text-blue-400">{c.name}</span>
                  <span className="text-xs text-[var(--color-text-muted)] font-mono ml-2">({c.count})</span>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{c.description}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-sm">
            <Link href="/categories" onClick={() => setOpen(false)} className="text-blue-700 dark:text-blue-400 hover:text-blue-800 hover:underline">
              View all categories →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
