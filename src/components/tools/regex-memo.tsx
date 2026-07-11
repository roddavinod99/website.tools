"use client";

import { useState } from "react";

interface CheatEntry { symbol: string; desc: string; example?: string }

const SECTIONS: { title: string; entries: CheatEntry[] }[] = [
  { title: "Character Classes", entries: [
    { symbol: ".", desc: "Any character except newline" },
    { symbol: "\\w", desc: "Word character (a-z, A-Z, 0-9, _)", example: "\\w+ matches 'hello_123'" },
    { symbol: "\\W", desc: "Non-word character" },
    { symbol: "\\d", desc: "Digit (0-9)", example: "\\d{3} matches '123'" },
    { symbol: "\\D", desc: "Non-digit" },
    { symbol: "\\s", desc: "Whitespace (space, tab, newline)" },
    { symbol: "\\S", desc: "Non-whitespace" },
    { symbol: "[abc]", desc: "Match a, b, or c", example: "[aeiou] matches any vowel" },
    { symbol: "[^abc]", desc: "Not a, b, or c", example: "[^0-9] matches non-digits" },
    { symbol: "[a-z]", desc: "Range: a to z", example: "[A-Za-z] matches any letter" },
  ]},
  { title: "Quantifiers", entries: [
    { symbol: "*", desc: "Zero or more", example: "ab*c matches 'ac', 'abc', 'abbc'" },
    { symbol: "+", desc: "One or more", example: "ab+c matches 'abc', 'abbc' (not 'ac')" },
    { symbol: "?", desc: "Zero or one (optional)", example: "colou?r matches 'color' and 'colour'" },
    { symbol: "{n}", desc: "Exactly n times", example: "\\d{4} matches '2024'" },
    { symbol: "{n,}", desc: "n or more times" },
    { symbol: "{n,m}", desc: "Between n and m times", example: "\\d{2,4} matches '12', '123', '1234'" },
    { symbol: "*?", desc: "Zero or more (lazy/non-greedy)" },
    { symbol: "+?", desc: "One or more (lazy/non-greedy)" },
  ]},
  { title: "Anchors", entries: [
    { symbol: "^", desc: "Start of string/line", example: "^Hello matches 'Hello World'" },
    { symbol: "$", desc: "End of string/line", example: "world$ matches 'Hello world'" },
    { symbol: "\\b", desc: "Word boundary", example: "\\bcat\\b matches 'cat' in 'the cat sat'" },
    { symbol: "\\B", desc: "Non-word boundary" },
  ]},
  { title: "Groups & Alternation", entries: [
    { symbol: "(abc)", desc: "Capture group", example: "(\\d{3})-(\\d{4}) captures area code" },
    { symbol: "(?:abc)", desc: "Non-capturing group" },
    { symbol: "(?<name>abc)", desc: "Named capture group", example: "(?<year>\\d{4})" },
    { symbol: "a|b", desc: "Alternation (a or b)", example: "cat|dog matches 'cat' or 'dog'" },
    { symbol: "\\1", desc: "Backreference to group 1" },
  ]},
  { title: "Lookahead & Lookbehind", entries: [
    { symbol: "(?=abc)", desc: "Positive lookahead", example: "\\d(?=px) matches '5' in '5px'" },
    { symbol: "(?!abc)", desc: "Negative lookahead", example: "\\d(?!px) matches '5' in '5em'" },
    { symbol: "(?<=abc)", desc: "Positive lookbehind", example: "(?<=\\$)\\d+ matches '100' in '$100'" },
    { symbol: "(?<!abc)", desc: "Negative lookbehind" },
  ]},
  { title: "Flags", entries: [
    { symbol: "g", desc: "Global: match all occurrences" },
    { symbol: "i", desc: "Case-insensitive matching" },
    { symbol: "m", desc: "Multiline: ^ and $ match line boundaries" },
    { symbol: "s", desc: "Dotall: . matches newline" },
    { symbol: "u", desc: "Unicode support" },
  ]},
  { title: "Escape Sequences", entries: [
    { symbol: "\\n", desc: "Newline" },
    { symbol: "\\t", desc: "Tab" },
    { symbol: "\\r", desc: "Carriage return" },
    { symbol: "\\", desc: "Escape special character", example: "\\. matches literal dot" },
    { symbol: "\\0", desc: "Null character" },
  ]},
  { title: "Common Patterns", entries: [
    { symbol: "^[\\w.-]+@[\\w.-]+\\.\\w{2,}$", desc: "Email address" },
    { symbol: "https?://[\\w.-]+(:\\d+)?(/\\S*)?", desc: "URL" },
    { symbol: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b", desc: "IPv4 address" },
    { symbol: "\\d{4}-\\d{2}-\\d{2}", desc: "Date (YYYY-MM-DD)" },
    { symbol: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}", desc: "US phone number" },
    { symbol: "#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\\b", desc: "Hex color code" },
  ]},
];

export function RegexMemo() {
  const [search, setSearch] = useState("");

  const filtered = SECTIONS.map(s => ({
    ...s,
    entries: search ? s.entries.filter(e => e.symbol.toLowerCase().includes(search.toLowerCase()) || e.desc.toLowerCase().includes(search.toLowerCase())) : s.entries,
  })).filter(s => s.entries.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patterns..."
          className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        <a href="https://regex101.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline whitespace-nowrap">regex101.com</a>
      </div>

      <div className="space-y-3">
        {filtered.map(section => (
          <div key={section.title} className="rounded-lg border border-surface-200 dark:border-dark-border overflow-hidden">
            <div className="px-3 py-2 bg-surface-50 dark:bg-dark-surface">
              <h3 className="text-sm font-medium text-surface-900 dark:text-dark-text">{section.title}</h3>
            </div>
            <div className="divide-y divide-surface-100 dark:divide-dark-border">
              {section.entries.map((e, i) => (
                <div key={i} className="px-3 py-2 flex items-start gap-3">
                  <code className="text-xs font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded whitespace-nowrap">{e.symbol}</code>
                  <div className="min-w-0">
                    <p className="text-xs text-surface-700 dark:text-dark-text">{e.desc}</p>
                    {e.example && <p className="text-[10px] text-surface-400 dark:text-dark-muted mt-0.5 font-mono">{e.example}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
