"use client";

import { useMemo, useState } from "react";

interface TableCell {
  text: string;
  rowspan: number;
  colspan: number;
}

function extractTables(html: string): string[] {
  return html.match(/<table[\s\S]*?<\/table>/gi) ?? [];
}

function parseTable(tableHtml: string): string[][] {
  const rowsMatch = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  const rows: TableCell[][] = [];
  let maxCols = 0;

  for (const rowHtml of rowsMatch) {
    const cells = rowHtml.match(/<(th|td)([\s\S]*?)>([\s\S]*?)<\/(?:th|td)>/gi) ?? [];
    const row: TableCell[] = [];
    for (const cell of cells) {
      const attrs = cell.match(/<t[dh][^>]*>/i)?.[0] ?? "";
      const rowspan = parseInt(attrs.match(/rowspan=["']?(\d+)/i)?.[1] ?? "1", 10);
      const colspan = parseInt(attrs.match(/colspan=["']?(\d+)/i)?.[1] ?? "1", 10);
      const inner = cell.replace(/<\/?[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
      row.push({ text: inner, rowspan, colspan });
    }
    rows.push(row);
    maxCols = Math.max(maxCols, row.reduce((s, c) => s + c.colspan, 0));
  }

  // Expand rowspans/colspans into a dense grid
  const dense: (string | null)[][] = [];
  const pendingSpans: { row: number; col: number; remain: number; text: string }[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row: (string | null)[] = new Array(maxCols).fill(null);
    for (const span of pendingSpans) {
      if (span.row <= r && span.remain > 0) {
        const placeCol = row.indexOf(null);
        if (placeCol >= 0) row[placeCol] = span.text;
      }
    }
    let col = 0;
    for (const cell of rows[r]) {
      while (col < maxCols && row[col] !== null) col++;
      if (col >= maxCols) break;
      row[col] = cell.text;
      for (let k = 1; k < cell.colspan; k++) {
        if (col + k < maxCols && row[col + k] === null) row[col + k] = cell.text;
      }
      if (cell.rowspan > 1) {
        pendingSpans.push({ row: r + 1, col, remain: cell.rowspan - 1, text: cell.text });
      }
      col += cell.colspan;
    }
    dense.push(row);
  }

  return dense.map((r) => r.map((c) => c ?? ""));
}

function convert(html: string, headerFirst: boolean, numeric: boolean): unknown {
  const tables = extractTables(html);
  const results = tables.map((tableHtml) => {
    const grid = parseTable(tableHtml);
    if (grid.length === 0) return [];
    const value = (s: string) => (numeric && /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : s);
    if (headerFirst) {
      const headers = grid[0];
      return grid.slice(1).map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          const key = h || `column_${i + 1}`;
          obj[key] = row[i] !== undefined ? value(row[i]) : "";
        });
        return obj;
      });
    }
    return grid.map((row) => row.map((c) => value(c)));
  });
  return results.length === 1 ? results[0] : results;
}

export function TableToJson() {
  const [html, setHtml] = useState(
    '<table>\n  <tr><th>Name</th><th>Age</th><th>Role</th></tr>\n  <tr><td>Alice</td><td>30</td><td>Engineer</td></tr>\n  <tr><td>Bob</td><td>25</td><td>Designer</td></tr>\n</table>'
  );
  const [headerFirst, setHeaderFirst] = useState(true);
  const [numeric, setNumeric] = useState(false);
  const [pretty, setPretty] = useState(true);
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    try {
      const result = convert(html, headerFirst, numeric);
      return { output: JSON.stringify(result, null, pretty ? 2 : 0), error: null as string | null };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Could not parse the HTML table." };
    }
  }, [html, headerFirst, numeric, pretty]);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-2.5 font-mono text-xs dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-surface-700 dark:text-dark-text mb-1">
          HTML table markup
        </label>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={8}
          spellCheck={false}
          placeholder="<table>…</table>"
          className={inputCls}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-surface-700 dark:text-dark-text">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={headerFirst} onChange={(e) => setHeaderFirst(e.target.checked)} className="h-4 w-4 rounded border-surface-300" />
          First row is header
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={numeric} onChange={(e) => setNumeric(e.target.checked)} className="h-4 w-4 rounded border-surface-300" />
          Convert numeric cells
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)} className="h-4 w-4 rounded border-surface-300" />
          Pretty print
        </label>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div>
        <label className="block text-xs font-medium text-surface-700 dark:text-dark-text mb-1">JSON output</label>
        <textarea
          readOnly
          value={output}
          aria-label="Converted JSON output"
          rows={10}
          className="h-56 w-full rounded-lg border border-surface-200 bg-surface-50 p-2.5 font-mono text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={copy}
          disabled={!output}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button
          onClick={download}
          disabled={!output}
          className="rounded-lg border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
        >
          Download .json
        </button>
      </div>

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        HTML is parsed as data only and never executed. Multiple tables produce one object per table. All processing
        happens locally in your browser.
      </p>
    </div>
  );
}