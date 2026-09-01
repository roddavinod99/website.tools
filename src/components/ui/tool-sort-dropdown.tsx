"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TOOL_SORTS, type ToolSort } from "@/lib/sort-tools";

interface ToolSortDropdownProps {
  className?: string;
  ariaLabel?: string;
}

export function ToolSortDropdown({ className, ariaLabel = "Sort tools" }: ToolSortDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = useMemo<ToolSort>(() => {
    const value = searchParams?.get("sort");
    return (TOOL_SORTS.find((s) => s.key === value)?.key as ToolSort | undefined) ?? "default";
  }, [searchParams]);

  const handleChange = useCallback(
    (next: ToolSort) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (next === "default") {
        params.delete("sort");
      } else {
        params.set("sort", next);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <label className={className}>
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value as ToolSort)}
        className="h-10 rounded-lg border border-surface-200 bg-white px-3 pr-8 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted"
      >
        {TOOL_SORTS.map((s) => (
          <option key={s.key} value={s.key}>
            Sort: {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
