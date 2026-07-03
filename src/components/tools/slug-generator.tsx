"use client";

import { useState, useMemo, useEffect, useRef } from "react";

type Separator = "-" | "_" | "~" | ".";
type CaseOption = "lowercase" | "uppercase" | "original";
type SanitizeMode = "spaces-only" | "full";

function transliterate(text: string): string {
  const map: Record<string, string> = {
    à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", æ: "ae",
    ç: "c", è: "e", é: "e", ê: "e", ë: "e",
    ì: "i", í: "i", î: "i", ï: "i",
    ð: "d", ñ: "n", ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o",
    ù: "u", ú: "u", û: "u", ü: "u",
    ý: "y", þ: "th", ß: "ss", ÿ: "y",
    À: "A", Á: "A", Â: "A", Ã: "A", Ä: "A", Å: "A", Æ: "AE",
    Ç: "C", È: "E", É: "E", Ê: "E", Ë: "E",
    Ì: "I", Í: "I", Î: "I", Ï: "I",
    Ð: "D", Ñ: "N", Ò: "O", Ó: "O", Ô: "O", Õ: "O", Ö: "O", Ø: "O",
    Ù: "U", Ú: "U", Û: "U", Ü: "U",
    Ý: "Y", Þ: "TH",
  };
  return text.replace(/[^\x00-\x7F]/g, (c) => map[c] || c);
}

function generateSlug(
  text: string,
  separator: Separator,
  caseOpt: CaseOption,
  sanitizeMode: SanitizeMode,
  maxLength: number,
  prefix: string,
  suffix: string,
  numbered: boolean,
  history: string[]
): string {
  let slug = text;

  slug = transliterate(slug);

  if (sanitizeMode === "full") {
    slug = slug.replace(/[^a-zA-Z0-9\s_-]/g, "");
  } else {
    slug = slug.replace(/[^\S\n]+/g, " ");
  }

  slug = slug.replace(/[\s_]+/g, " ").trim();

  if (caseOpt === "lowercase") slug = slug.toLowerCase();
  else if (caseOpt === "uppercase") slug = slug.toUpperCase();

  slug = slug.replace(/\s+/g, separator);

  slug = slug.replace(new RegExp(`${separator}{2,}`), separator);
  slug = slug.replace(new RegExp(`^${separator}|${separator}$`), "");

  if (maxLength > 0 && slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(new RegExp(`${separator}$`), "");
  }

  if (prefix) slug = prefix + separator + slug;
  if (suffix) slug = slug + separator + suffix;

  if (numbered && slug) {
    let counter = 1;
    let candidate = slug;
    while (history.includes(candidate)) {
      candidate = `${slug}${separator}${counter}`;
      counter++;
    }
    slug = candidate;
  }

  if (!slug) {
    const rand = Math.random().toString(36).substring(2, 8);
    slug = `slug-${rand}`;
  }

  return slug;
}

const SEPARATORS: { id: Separator; label: string }[] = [
  { id: "-", label: "Hyphen (-)" },
  { id: "_", label: "Underscore (_)" },
  { id: "~", label: "Tilde (~)" },
  { id: ".", label: "Dot (.)" },
];

export function SlugGenerator() {
  const [input, setInput] = useState("Hello World! This is a URL Slug Example");
  const [separator, setSeparator] = useState<Separator>("-");
  const [caseOpt, setCaseOpt] = useState<CaseOption>("lowercase");
  const [sanitizeMode, setSanitizeMode] = useState<SanitizeMode>("full");
  const [maxLength, setMaxLength] = useState(60);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [numbered, setNumbered] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [debouncedInput, setDebouncedInput] = useState(input);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedInput(input), 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input]);

  const slug = useMemo(() => {
    return generateSlug(debouncedInput, separator, caseOpt, sanitizeMode, maxLength, prefix, suffix, numbered, []);
  }, [debouncedInput, separator, caseOpt, sanitizeMode, maxLength, prefix, suffix, numbered]);

  const [history, setHistory] = useState<string[]>([]);

  const copy = async () => {
    await navigator.clipboard.writeText(slug);
    setCopied(true);
    setHistory((prev) => [slug, ...prev.filter((h) => h !== slug)].slice(0, 20));
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input Text</label>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to slugify..."
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Separator:</label>
          <select value={separator} onChange={(e) => setSeparator(e.target.value as Separator)}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {SEPARATORS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Case:</label>
          <select value={caseOpt} onChange={(e) => setCaseOpt(e.target.value as CaseOption)}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="lowercase">Lowercase</option>
            <option value="uppercase">Uppercase</option>
            <option value="original">Original</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Sanitize:</label>
          <select value={sanitizeMode} onChange={(e) => setSanitizeMode(e.target.value as SanitizeMode)}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="full">Full (remove special chars)</option>
            <option value="spaces-only">Spaces only</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Max Length:</label>
          <input type="number" min={0} max={200} value={maxLength} onChange={(e) => setMaxLength(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-14 rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer select-none">
          <input type="checkbox" checked={numbered} onChange={(e) => setNumbered(e.target.checked)} className="accent-brand-500 rounded" />
          Numbered
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Prefix:</label>
          <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="(optional)"
            className="w-24 rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Suffix:</label>
          <input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="(optional)"
            className="w-24 rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div className="flex-1" />
        <button onClick={copy} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
          {copied ? "Copied!" : "Copy Slug"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Original Text</label>
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text break-all min-h-[2.5rem]">
            {input || <span className="text-surface-400 italic">(empty)</span>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Generated Slug</label>
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm font-mono text-brand-800 dark:border-brand-700 dark:bg-brand-900/20 dark:text-brand-300 break-all select-all min-h-[2.5rem]">
            {slug}
          </div>
        </div>
      </div>

      <div className="flex gap-2 text-xs text-surface-500 dark:text-dark-muted">
        <span>Length: <strong className="text-surface-700 dark:text-dark-text">{slug.length}</strong> chars</span>
        <span>Original: <strong className="text-surface-700 dark:text-dark-text">{input.length}</strong> chars</span>
      </div>

      {history.length > 1 && (
        <div className="border-t border-surface-200 dark:border-dark-border pt-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-surface-500 dark:text-dark-muted">History</p>
            <button onClick={clearHistory} className="text-[10px] text-surface-400 hover:text-surface-600 dark:text-dark-muted dark:hover:text-dark-text">Clear</button>
          </div>
          <div className="max-h-24 overflow-y-auto space-y-0.5">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-surface-500 dark:text-dark-muted">
                <span className="text-surface-300 dark:text-dark-muted w-4 text-right">{i + 1}.</span>
                <code className="font-mono text-surface-700 dark:text-dark-text truncate">{h}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
