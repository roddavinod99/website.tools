import type { Tool } from "@/types";

export type ToolSort = "default" | "alpha" | "popular" | "newest" | "category";

export const TOOL_SORTS: ReadonlyArray<{ key: ToolSort; label: string }> = [
  { key: "default", label: "Featured" },
  { key: "alpha", label: "A–Z" },
  { key: "popular", label: "Most popular" },
  { key: "newest", label: "Newest" },
  { key: "category", label: "By category" },
];

export const DEFAULT_SORT: ToolSort = "default";

function isToolSort(value: string | string[] | undefined): value is ToolSort {
  return typeof value === "string" && TOOL_SORTS.some((s) => s.key === value);
}

export function parseSortParam(value: string | string[] | undefined): ToolSort {
  return isToolSort(value) ? value : DEFAULT_SORT;
}

export function sortTools(tools: Tool[], sort: ToolSort): Tool[] {
  switch (sort) {
    case "alpha":
      return [...tools].sort((a, b) => a.name.localeCompare(b.name));
    case "popular":
      return [...tools].sort((a, b) => b.popularity - a.popularity);
    case "newest":
      return [...tools].sort((a, b) => Number(Boolean(b.new)) - Number(Boolean(a.new)));
    case "category":
      return [...tools].sort(
        (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
      );
    case "default":
    default:
      return tools;
  }
}
