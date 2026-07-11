"use client";

import { useState } from "react";

const SAFELINK_PATTERNS = [
  { regex: /[?&](?:url|u|q|dest|destination|redirect|redirect_to|next|continue|return_to|goto|link)=([^&]+)/i, group: 1 },
  { regex: /\/redirect\/?\?(?:.*?)(?:url|u|dest)=([^&\s]+)/i, group: 1 },
  { regex: /\/go\/(.+?)(?:\?|$)/i, group: 1 },
  { regex: /\/link\/?\?(?:.*?)(?:url|u)=([^&\s]+)/i, group: 1 },
  { regex: /safelink\.url[^?]*\?(?:.*?)(?:url|q)=([^&\s]+)/i, group: 1 },
  { regex: /safeurl[^?]*\?(?:.*?)(?:url|q|dest)=([^&\s]+)/i, group: 1 },
  { regex: /\/out\/(.+?)(?:\?|$)/i, group: 1 },
  { regex: /\/external\/(.+?)(?:\?|$)/i, group: 1 },
  { regex: /\/\?(?:.*?)(?:url|u|q|dest)=([^&\s]+)/i, group: 1 },
];

function decodeUrl(url: string): string {
  try {
    const trimmed = url.trim();
    if (!trimmed) return "";
    for (let decoded = trimmed, prev = ""; ; ) {
      try {
        const u = new URL(decoded);
        let found = false;
        for (const pat of SAFELINK_PATTERNS) {
          const m = u.search.match(pat.regex);
          if (m?.[pat.group]) {
            decoded = decodeURIComponent(m[pat.group]);
            found = true;
            break;
          }
          const pathMatch = decoded.match(pat.regex);
          if (pathMatch?.[pat.group]) {
            decoded = decodeURIComponent(pathMatch[pat.group]);
            found = true;
            break;
          }
        }
        if (!found || decoded === prev) return decoded;
        prev = decoded;
      } catch {
        return decoded;
      }
    }
  } catch {
    return url.trim();
  }
}

export function SafelinkDecoder() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{ original: string; decoded: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState(-1);

  const decode = () => {
    const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
    const res = lines.map((line) => ({
      original: line,
      decoded: decodeUrl(line),
    }));
    setResults(res);
  };

  const copyAll = async () => {
    const text = results.map((r) => r.decoded).join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedIdx(-2);
    setTimeout(() => setCopiedIdx(-1), 3000);
  };

  const copyOne = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 3000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          URL(s) to decode
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder={"Paste one or more safelink/shortened URLs, one per line:\nhttps://example.com/go?url=https%3A%2F%2Fdestination.com\nhttps://safelink.example.com/?u=aHR0cHM6Ly9..."}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={decode}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Decode URLs
        </button>
        {results.length > 0 && (
          <>
            <button
              onClick={copyAll}
              className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              {copiedIdx === -2 ? "Copied!" : "Copy All"}
            </button>
            <button
              onClick={() => { setInput(""); setResults([]); }}
              className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-1">
                    Original
                  </p>
                  <p className="text-xs font-mono text-surface-500 dark:text-dark-muted break-all truncate">
                    {r.original}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-1">
                    Decoded
                  </p>
                  <p className="text-sm font-mono text-surface-900 dark:text-dark-text break-all select-all">
                    {r.decoded}
                  </p>
                </div>
                <button
                  onClick={() => copyOne(r.decoded, i)}
                  className="shrink-0 text-xs text-brand-500 hover:text-brand-600"
                >
                  {copiedIdx === i ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
