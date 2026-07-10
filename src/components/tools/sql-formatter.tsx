"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Copy, Download, RefreshCw, Minimize, ShieldCheck, Trash2 } from "lucide-react";

type KeywordCase = "upper" | "lower" | "capitalize" | "preserve";
type Indent = "2" | "4" | "8";
type CommaPos = "before" | "after";
type Dialect = "generic" | "mysql" | "postgresql" | "sqlserver" | "oracle" | "sqlite" | "mariadb" | "db2" | "bigquery" | "redshift" | "snowflake" | "spark" | "hive" | "trino" | "n1ql" | "singlestore" | "standard";

const INDENT_MAP: Record<Indent, string> = { "2": "  ", "4": "    ", "8": "        " };

const KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET",
  "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "CROSS JOIN", "FULL JOIN",
  "ON", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE", "ALTER TABLE",
  "DROP TABLE", "CREATE INDEX", "DROP INDEX", "TRUNCATE TABLE", "MERGE INTO",
  "UNION", "UNION ALL", "INTERSECT", "EXCEPT",
  "DISTINCT", "CASE", "WHEN", "THEN", "ELSE", "END", "AS", "IN", "BETWEEN", "LIKE",
  "IS NULL", "IS NOT NULL", "NOT", "EXISTS", "WITH", "RECURSIVE",
  "COUNT", "SUM", "AVG", "MIN", "MAX", "COALESCE", "NULLIF", "CAST",
  "TOP", "FETCH FIRST", "ROWS", "ROW", "WINDOW", "OVER", "PARTITION BY",
  "RETURNING", "USING", "NATURAL", "LATERAL", "QUALIFY",
  "ARRAY", "STRUCT", "UNNEST", "PIVOT", "UNPIVOT", "MATCH_RECOGNIZE",
  "SAMPLE", "TABLESAMPLE", "LATERAL VIEW", "EXPLODE", "POSEXPLODE",
  "USE", "DATABASE", "SCHEMA", "SHOW", "DESCRIBE", "EXPLAIN",
];

const DIALECT_LABELS: Record<Dialect, string> = {
  generic: "Standard SQL", mysql: "MySQL", postgresql: "PostgreSQL", sqlserver: "SQL Server T-SQL",
  oracle: "Oracle PL/SQL", sqlite: "SQLite", mariadb: "MariaDB", db2: "DB2",
  bigquery: "BigQuery", redshift: "Redshift", snowflake: "Snowflake",
  spark: "Spark SQL", hive: "Hive QL", trino: "Trino", n1ql: "N1QL",
  singlestore: "SingleStore", standard: "Standard SQL",
};

function applyCase(word: string, kc: KeywordCase): string {
  if (kc === "upper") return word.toUpperCase();
  if (kc === "lower") return word.toLowerCase();
  if (kc === "capitalize") return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  return word;
}

function highlightKeywords(sql: string, kc: KeywordCase): string {
  const pattern = new RegExp(`\\b(${KEYWORDS.map((k) => k.replace(/\s+/g, "\\s+")).join("|")})\\b`, "gi");
  return sql.replace(pattern, (m) => applyCase(m, kc));
}

function extractTables(sql: string): string[] {
  const tables: string[] = [];
  const patterns = [
    /(?:FROM|JOIN|INTO|UPDATE|TABLE|FROM\s+)\s+[`"']?(\w+)[`"']?(?:\s+(?:AS\s+)?(\w+))?/gi,
    /(?:FROM|JOIN)\s+[`"']?(\w+(?:\.\w+)?)[`"']?(?:\s+(?:AS\s+)?(\w+))?/gi,
  ];
  for (const pat of patterns) {
    let m: RegExpExecArray | null;
    while ((m = pat.exec(sql)) !== null) {
      if (m[1] && !KEYWORDS.includes(m[1].toUpperCase())) tables.push(m[1]);
    }
  }
  return [...new Set(tables)];
}

function extractFunctions(sql: string): string[] {
  const funcs: string[] = [];
  const funcRe = /\b([A-Za-z_]\w*)\s*\(/g;
  let m: RegExpExecArray | null;
  const ignore = new Set(["CASE", "WHEN", "THEN", "ELSE", "END", "IN", "BETWEEN", "LIKE", "IS", "NOT", "AND", "OR", "ON", "AS", "TOP"]);
  while ((m = funcRe.exec(sql)) !== null) {
    const upper = m[1].toUpperCase();
    if (!ignore.has(upper) && !KEYWORDS.includes(upper) && upper !== "SELECT" && upper !== "FROM" && upper !== "WHERE") {
      funcs.push(m[1]);
    }
  }
  return [...new Set(funcs)];
}

function countKeywords(sql: string): number {
  const pattern = new RegExp(`\\b(${KEYWORDS.map((k) => k.replace(/\s+/g, "\\s+")).join("|")})\\b`, "gi");
  const matches = sql.match(pattern);
  return matches ? matches.length : 0;
}

export function SQLFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [indentW, setIndentW] = useState<Indent>("2");
  const [lineWidth, setLineWidth] = useState(80);
  const [commaPos, setCommaPos] = useState<CommaPos>("after");
  const [newLineDistinct, setNewLineDistinct] = useState(false);
  const [logicalNewline, setLogicalNewline] = useState(false);
  const [trailingCommas, setTrailingCommas] = useState(false);
  const [dialect, setDialect] = useState<Dialect>("generic");
  const [linesBetweenQueries, setLinesBetweenQueries] = useState<number>(1);
  const [operatorSpacing, setOperatorSpacing] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const format = useCallback(() => {
    try {
      const sql = input.trim();
      if (!sql) { setOutput(""); setError(""); return; }

      const indent = INDENT_MAP[indentW];
      let result = sql
        .replace(/\s+/g, " ")
        .replace(/\s*([(),;])\s*/g, "$1");

      if (operatorSpacing) {
        result = result.replace(/\s*=\s*/g, " = ")
          .replace(/\s*([<>!]=?)\s*/g, " $1 ")
          .replace(/\s*([+\-*/%])\s*/g, " $1 ");
      } else {
        result = result.replace(/\s*=\s*/g, "=")
          .replace(/\s*([<>!]=?)\s*/g, "$1")
          .replace(/\s*([+\-*/%])\s*/g, "$1");
      }

      result = result.trim();

      const sortedKW = [...KEYWORDS].sort((a, b) => b.length - a.length);
      for (const kw of sortedKW) {
        const re = new RegExp(`\\b${kw.replace(/\s+/g, "\\s+")}\\b`, "gi");
        result = result.replace(re, `\n__KW__${kw}`);
      }

      if (newLineDistinct) {
        result = result.replace(/\n__KW__DISTINCT\b/g, "\n  DISTINCT");
        result = result.replace(/\bDISTINCT\b/gi, "\n  DISTINCT");
      }

      if (logicalNewline) {
        result = result.replace(/\s+AND\s+/gi, "\n  AND ");
        result = result.replace(/\s+OR\s+/gi, "\n  OR ");
      }

      if (commaPos === "before") {
        result = result.replace(/,\s*/g, ",\n  ");
        result = result.replace(/SELECT\n  \n  /g, "SELECT\n  ");
      } else {
        result = result.replace(/,\s*/g, ",\n  ");
        result = result.replace(/SELECT\n  ,/g, "SELECT\n  ");
      }

      if (trailingCommas) {
        result = result.replace(/\n  (\w+)/g, ",\n  $1");
        result = result.replace(/SELECT,\n/g, "SELECT\n");
      } else {
        result = result.replace(/,\s*(\n\s*FROM)/gi, "$1");
      }

      const lines = result.split("\n").filter(Boolean);
      const formattedLines: string[] = [];
      let depth = 0;

      for (const line of lines) {
        const trimmed = line.replace(/^__KW__/, "").trim();
        const upper = trimmed.toUpperCase();

        if (/^(END|\))/.test(upper)) depth = Math.max(0, depth - 1);

        const leading = upper.startsWith("SELECT") || upper.startsWith("FROM") || upper.startsWith("WHERE") ||
          upper.startsWith("ORDER BY") || upper.startsWith("GROUP BY") || upper.startsWith("HAVING") ||
          upper.startsWith("LIMIT") || upper.startsWith("OFFSET") || upper.startsWith("FETCH") ||
          upper.startsWith("UNION") || upper.startsWith("INTERSECT") || upper.startsWith("EXCEPT") ||
          upper.startsWith("INSERT") || upper.startsWith("UPDATE") || upper.startsWith("DELETE") ||
          upper.startsWith("CREATE") || upper.startsWith("ALTER") || upper.startsWith("DROP") ||
          upper.startsWith("TRUNCATE") || upper.startsWith("MERGE") || upper.startsWith("WITH") ||
          upper.startsWith("QUALIFY") || upper.startsWith("WINDOW") || upper.startsWith("RETURNING") ||
          upper.startsWith("LEFT") || upper.startsWith("RIGHT") || upper.startsWith("INNER") ||
          upper.startsWith("OUTER") || upper.startsWith("CROSS") || upper.startsWith("FULL") ||
          upper.startsWith("JOIN") || upper.startsWith("ON") ||
          upper.startsWith("LATERAL") || upper.startsWith("PIVOT") || upper.startsWith("UNPIVOT") ||
          upper.startsWith("MATCH_RECOGNIZE") || upper.startsWith("SAMPLE") || upper.startsWith("TABLESAMPLE");

        const clause = upper.startsWith("AND") || upper.startsWith("OR") || upper.startsWith(",");

        if (leading) {
          formattedLines.push("\n" + indent.repeat(depth) + trimmed);
        } else if (clause) {
          formattedLines.push(indent.repeat(depth + 1) + trimmed);
        } else {
          formattedLines.push(indent.repeat(depth + 1) + trimmed);
        }

        if (/\($/.test(trimmed) || upper.startsWith("CASE") || upper.startsWith("BEGIN")) depth++;
        if (trimmed === ")" || upper === "END") depth = Math.max(0, depth - 1);
      }

      let final = formattedLines.join("\n").replace(/\n{2,}/g, "\n").trim();

      if (keywordCase !== "preserve") {
        final = highlightKeywords(final, keywordCase);
      }
      final = final.replace(/\b\d{4}-\d{2}-\d{2}\b/g, (d) => `'${d}'`);

      if (lineWidth > 0) {
        const wrappedLines: string[] = [];
        for (const l of final.split("\n")) {
          if (l.length > lineWidth && !l.trim().startsWith("'")) {
            let remaining = l;
            while (remaining.length > lineWidth) {
              const breakIdx = remaining.lastIndexOf(" ", lineWidth);
              if (breakIdx === -1) break;
              wrappedLines.push(remaining.slice(0, breakIdx));
              remaining = indent + remaining.slice(breakIdx).trim();
            }
            wrappedLines.push(remaining);
          } else {
            wrappedLines.push(l);
          }
        }
        final = wrappedLines.join("\n");
      }

      if (linesBetweenQueries > 0) {
        final = final.replace(/;(?!\s*$)/g, (m) => m + "\n".repeat(linesBetweenQueries));
      }

      setOutput(final);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, keywordCase, indentW, lineWidth, commaPos, newLineDistinct, logicalNewline, trailingCommas, linesBetweenQueries, operatorSpacing]);

  const minify = useCallback(() => {
    try {
      const result = input.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([(),;])\s*/g, "$1").trim();
      setOutput(result);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input]);

  const validate = useCallback(() => {
    try {
      if (!input.trim()) { setError("Empty input"); setOutput(""); return; }
      const tokens = input.toUpperCase().split(/\s+/);
      const hasSelect = tokens.includes("SELECT") || tokens.includes("WITH") || tokens.includes("INSERT") || tokens.includes("UPDATE") || tokens.includes("DELETE") || tokens.includes("CREATE");
      if (!hasSelect) {
        setError("Input does not appear to contain valid SQL statements");
        setOutput("");
        return;
      }
      setError("");
      setOutput("SQL appears valid.");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (input.trim()) format(); }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [input, format]);

  const copy = useCallback(async () => { if (output) await navigator.clipboard.writeText(output); }, [output]);
  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/sql" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "formatted.sql"; a.click(); URL.revokeObjectURL(url);
  }, [output]);
  const clear = useCallback(() => { setInput(""); setOutput(""); setError(""); }, []);

  const tables = useMemo(() => input ? extractTables(input) : [], [input]);
  const functions = useMemo(() => input ? extractFunctions(input) : [], [input]);
  const keywordCount = useMemo(() => input ? countKeywords(input) : 0, [input]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">SQL Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="SELECT * FROM users WHERE id = 1" rows={8} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Dialect</label>
          <select value={dialect} onChange={(e) => setDialect(e.target.value as Dialect)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {(Object.entries(DIALECT_LABELS) as [Dialect, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Keyword case</label>
          <select value={keywordCase} onChange={(e) => setKeywordCase(e.target.value as KeywordCase)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="upper">UPPER</option><option value="lower">lower</option><option value="capitalize">Capitalize</option><option value="preserve">Preserve</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Indent</label>
          <select value={indentW} onChange={(e) => setIndentW(e.target.value as Indent)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="2">2 spaces</option><option value="4">4 spaces</option><option value="8">8 spaces</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Comma position</label>
          <select value={commaPos} onChange={(e) => setCommaPos(e.target.value as CommaPos)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="after">After</option><option value="before">Before</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Wrap at</label>
          <input type="number" min={0} max={200} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" placeholder="80" />
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Lines between</label>
          <select value={linesBetweenQueries} onChange={(e) => setLinesBetweenQueries(Number(e.target.value))}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={newLineDistinct} onChange={(e) => setNewLineDistinct(e.target.checked)} className="rounded border-surface-300" /> DISTINCT on new line
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={logicalNewline} onChange={(e) => setLogicalNewline(e.target.checked)} className="rounded border-surface-300" /> AND/OR on new line
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={trailingCommas} onChange={(e) => setTrailingCommas(e.target.checked)} className="rounded border-surface-300" /> Trailing commas
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={operatorSpacing} onChange={(e) => setOperatorSpacing(e.target.checked)} className="rounded border-surface-300" /> Operator spacing
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={format} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> Format</button>
        <button onClick={minify} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Minimize className="w-3.5 h-3.5" /> Minify</button>
        <button onClick={validate} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><ShieldCheck className="w-3.5 h-3.5" /> Validate</button>
        <button onClick={copy} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Copy className="w-3.5 h-3.5" /> Copy</button>
        <button onClick={download} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Download className="w-3.5 h-3.5" /> Download</button>
        <button onClick={clear} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Clear</button>
      </div>

      {input && (
        <div className="flex flex-wrap gap-3 text-xs text-surface-500 dark:text-dark-muted">
          <span>Length: {input.length} chars</span>
          <span>Keywords: {keywordCount}</span>
          {tables.length > 0 && <span>Tables: {tables.join(", ")}</span>}
          {functions.length > 0 && <span>Functions: {functions.join(", ")}</span>}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Formatted SQL</label>
            <span className="text-xs text-surface-400 dark:text-dark-muted">{DIALECT_LABELS[dialect]}</span>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap break-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
