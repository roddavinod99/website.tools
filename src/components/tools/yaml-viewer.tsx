"use client";

import { useState, useCallback, useMemo } from "react";

type TokenType = "key" | "string" | "number" | "boolean" | "null" | "punctuation" | "comment";

interface Token {
  text: string;
  type: TokenType;
}

const TOKEN_COLORS: Record<TokenType, string> = {
  key: "text-blue-600 dark:text-blue-400",
  string: "text-green-600 dark:text-green-400",
  number: "text-orange-500 dark:text-orange-400",
  boolean: "text-purple-600 dark:text-purple-400",
  null: "text-gray-400 dark:text-gray-500",
  punctuation: "text-surface-600 dark:text-dark-text",
  comment: "text-surface-400 dark:text-dark-muted italic",
};

function tokenizeYAML(yaml: string): Token[][] {
  const lines: Token[][] = [];
  const inputLines = yaml.split("\n");

  for (const line of inputLines) {
    const tokens: Token[] = [];

    if (/^\s*#/.test(line)) {
      tokens.push({ text: line, type: "comment" });
      lines.push(tokens);
      continue;
    }

    const trimmed = line;
    const keyMatch = trimmed.match(/^(\s*)(- )?("[^"]*"|'[^']*'|[^:#\n]+?)(: )(.*)/);
    if (keyMatch) {
      const [, indent, dash, key, colon, value] = keyMatch;
      if (indent) tokens.push({ text: indent, type: "punctuation" });
      if (dash) tokens.push({ text: dash, type: "punctuation" });
      tokens.push({ text: key, type: "key" });
      tokens.push({ text: colon, type: "punctuation" });
      if (value) {
        const val = value.trim();
        if (val === "true" || val === "false") {
          tokens.push({ text: " " + val, type: "boolean" });
        } else if (val === "null" || val === "~") {
          tokens.push({ text: " " + val, type: "null" });
        } else if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(val)) {
          tokens.push({ text: " " + val, type: "number" });
        } else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          tokens.push({ text: " " + val, type: "string" });
        } else {
          tokens.push({ text: " " + val, type: "string" });
        }
      }
    } else if (/^\s*- /.test(trimmed)) {
      const dashMatch = trimmed.match(/^(\s*)(- )(.*)/);
      if (dashMatch) {
        const [, indent, dash, val] = dashMatch;
        tokens.push({ text: indent, type: "punctuation" });
        tokens.push({ text: dash, type: "punctuation" });
        if (/^-?\d+(\.\d+)?$/.test(val)) {
          tokens.push({ text: val, type: "number" });
        } else if (val === "true" || val === "false") {
          tokens.push({ text: val, type: "boolean" });
        } else if (val === "null" || val === "~") {
          tokens.push({ text: val, type: "null" });
        } else {
          tokens.push({ text: val, type: "string" });
        }
      }
    } else if (/^\s*-\s*$/.test(trimmed)) {
      tokens.push({ text: trimmed, type: "punctuation" });
    } else if (trimmed.trim()) {
      const parts = trimmed.split(/(:\s)/);
      for (const part of parts) {
        if (part === ": " || part === ":") {
          tokens.push({ text: part, type: "punctuation" });
        } else {
          tokens.push({ text: part, type: part.trim().length > 0 ? "key" : "punctuation" });
        }
      }
    } else {
      tokens.push({ text: trimmed, type: "punctuation" });
    }

    lines.push(tokens);
  }

  return lines;
}

function validateYAML(input: string): { valid: boolean; error: string | null; line: number | null } {
  if (!input.trim()) return { valid: true, error: null, line: null };

  try {
    const lines = input.split("\n");
    let lastIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*#/.test(line) || line.trim() === "") continue;

      const indent = line.search(/\S/);
      if (indent > lastIndent + 2) {
        return { valid: false, error: `Unexpected indentation at line ${i + 1}`, line: i + 1 };
      }
      lastIndent = indent;
    }

    const stack: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "" || /^\s*#/.test(line)) continue;

      if (line.includes("[") && !line.includes("]")) {
        stack.push("array");
      }
      if (line.includes("{") && !line.includes("}")) {
        stack.push("object");
      }
      if (line.includes("]") && stack[stack.length - 1] === "array") {
        stack.pop();
      }
      if (line.includes("}") && stack[stack.length - 1] === "object") {
        stack.pop();
      }
    }

    if (stack.length > 0) {
      return { valid: false, error: `Unclosed ${stack[stack.length - 1]} at end of document`, line: lines.length };
    }

    return { valid: true, error: null, line: null };
  } catch (e) {
    return { valid: false, error: (e as Error).message, line: null };
  }
}

export function YAMLViewer() {
  const [input, setInput] = useState('name: my-app\nversion: "1.0"\ndescription: A sample YAML file\n\nserver:\n  host: localhost\n  port: 8080\n  debug: true\n\nfeatures:\n  - authentication\n  - logging\n  - caching\n\nconfig:\n  database:\n    driver: postgres\n    host: db.example.com\n    port: 5432\n    name: mydb\n  cache:\n    enabled: true\n    ttl: 3600\n\nmetadata:\n  created: 2024-01-15\n  author: null');
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  const validation = useMemo(() => validateYAML(input), [input]);
  const tokens = useMemo(() => input ? tokenizeYAML(input) : [], [input]);

  const formattedOutput = useMemo(() => {
    return input;
  }, [input]);

  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  const lineCount = input.split("\n").length;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Input YAML</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-400 dark:text-dark-muted">{lineCount} lines</span>
            <button
              onClick={() => copy(formattedOutput)}
              disabled={!input}
              className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          placeholder="Paste your YAML here..."
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      {validation.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{validation.error}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={wordWrap} onChange={(e) => setWordWrap(e.target.checked)} className="rounded border-surface-300" /> Word wrap
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Syntax Highlighted Output</label>
        <pre className={`rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono dark:border-dark-border dark:bg-dark-bg overflow-auto max-h-96 ${wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"}`}>
          {tokens.map((lineTokens, li) => (
            <div key={li} className="flex">
              <span className="select-none text-right text-surface-300 dark:text-dark-muted w-8 mr-3 shrink-0 text-xs leading-5">{li + 1}</span>
              <span className="leading-5">
                {lineTokens.map((token, ti) => (
                  <span key={ti} className={TOKEN_COLORS[token.type]}>{token.text}</span>
                ))}
              </span>
            </div>
          ))}
        </pre>
      </div>

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        YAML parsing is done with a simple client-side parser. For complex YAML features, use a dedicated library.
      </p>
    </div>
  );
}
