"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  defaultSort?: { key: string; direction: "asc" | "desc" };
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  searchable = false,
  searchPlaceholder = "Search...",
  sortable = true,
  defaultSort,
  className = "",
  emptyMessage = "No data available",
  onRowClick,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(defaultSort || null);

  const filteredData = useMemo(() => {
    let result = data;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const value = col.render ? col.render(row) : (row as Record<string, unknown>)[col.key];
          return String(value).toLowerCase().includes(term);
        })
      );
    }
    if (sortConfig && sortable) {
      result = [...result].sort((a, b) => {
        const aVal = String((a as Record<string, unknown>)[sortConfig.key] ?? "");
        const bVal = String((b as Record<string, unknown>)[sortConfig.key] ?? "");
        if (aVal === bVal) return 0;
        const direction = sortConfig.direction === "asc" ? 1 : -1;
        return aVal > bVal ? direction : -direction;
      });
    }
    return result;
  }, [data, searchTerm, sortConfig, sortable, columns]);

  const handleSort = (key: string) => {
    if (!sortable) return;
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (filteredData.length === 0) {
    return (
      <div className="rounded-xl border border-tool-border bg-tool-surface p-8 text-center">
        <p className="text-result-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-tool-border ${className}`}>
      {searchable && (
        <div className="p-4 border-b border-tool-border bg-tool-surface">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-lg border border-tool-border bg-tool-bg px-3 py-2 text-sm text-result-primary placeholder:text-result-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            aria-label="Search table"
          />
        </div>
      )}
      <table className="w-full" role="grid">
        <thead>
          <tr className="bg-tool-surface border-b border-tool-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-result-secondary ${col.className || ""}`}
                scope="col"
                style={{ cursor: col.sortable && sortable ? "pointer" : "default" }}
                onClick={() => col.sortable && sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortable && sortConfig?.key === col.key && (
                    sortConfig.direction === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr
              key={keyExtractor(row)}
              className={`border-b border-tool-border/50 hover:bg-tool-surface/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-sm text-result-primary ${col.className || ""}`}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 text-xs text-result-secondary">
        Showing {filteredData.length} of {data.length} rows
      </div>
    </div>
  );
}