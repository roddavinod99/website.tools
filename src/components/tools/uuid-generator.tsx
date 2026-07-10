"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type UuidVersion = "v4" | "v7" | "v1";
type FormatStyle = "hyphens" | "no-hyphens" | "uppercase" | "lowercase" | "curly" | "uuid-format" | "base64";
type ExportFormat = "text" | "json" | "csv" | "tsv";

function uuidV4(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  buf[6] = (buf[6] & 0x0f) | 0x40;
  buf[8] = (buf[8] & 0x3f) | 0x80;
  const h = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function uuidV7(): string {
  const now = Date.now();
  const hex = now.toString(16).padStart(12, "0");
  const buf = new Uint8Array(10);
  crypto.getRandomValues(buf);
  const rand = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  const variant = (8 + (buf[0] % 4)).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-7${rand.slice(0, 3)}-${variant}${rand.slice(3, 6)}-${rand.slice(6, 18)}`;
}

function uuidV1(): string {
  const now = Date.now();
  const hex = now.toString(16).padStart(12, "0") + "00000000";
  const timeLow = hex.slice(4, 12);
  const timeMid = hex.slice(0, 4);
  const timeHi = hex.slice(12, 14);
  const buf1 = new Uint16Array(1);
  const buf2 = new Uint8Array(6);
  crypto.getRandomValues(buf1);
  crypto.getRandomValues(buf2);
  const clockSeq = ((buf1[0] & 0x3fff) | 0x8000).toString(16).padStart(4, "0");
  const node = Array.from(buf2, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${timeLow}-${timeMid}-1${timeHi}-${clockSeq.slice(0, 2)}-${clockSeq.slice(2, 4)}${node}`;
}

function formatUuid(raw: string, style: FormatStyle): string {
  const clean = raw.replace(/-/g, "").toLowerCase();
  switch (style) {
    case "no-hyphens": return clean;
    case "uppercase": return raw.toUpperCase();
    case "lowercase": return raw.toLowerCase();
    case "curly": return `{${raw}}`;
    case "uuid-format": return `urn:uuid:${raw}`;
    case "base64": {
      const bytes: number[] = [];
      for (let i = 0; i < 32; i += 2) bytes.push(parseInt(clean.slice(i, i + 2), 16));
      return btoa(String.fromCharCode(...bytes)).replace(/=+$/, "");
    }
    default: return raw;
  }
}

function makeUuid(version: UuidVersion): string {
  switch (version) {
    case "v4": return uuidV4();
    case "v7": return uuidV7();
    case "v1": return uuidV1();
  }
}

function extractTimestamp(raw: string, version: UuidVersion): string | null {
  const clean = raw.replace(/-/g, "").toLowerCase();
  if (clean.length < 32) return null;
  if (version === "v1") {
    const timeLow = parseInt(clean.slice(0, 8), 16);
    const timeMid = parseInt(clean.slice(8, 12), 16);
    const timeHi = parseInt(clean.slice(13, 16), 16);
    const msSinceEpoch = timeHi * 28147497671.0656 + timeMid * 429496.7296 + timeLow / 10000 - 12219292800000;
    return new Date(Math.round(msSinceEpoch)).toISOString();
  }
  if (version === "v7") {
    const ts = parseInt(clean.slice(0, 12), 16);
    return new Date(ts).toISOString();
  }
  return null;
}

function generateTimestampId(type: "snowflake" | "nanoid"): string {
  if (type === "snowflake") {
    const ts = Date.now().toString(36).padStart(8, "0");
    const buf = new Uint8Array(3);
    crypto.getRandomValues(buf);
    const rand = Array.from(buf, (b) => b.toString(36).padStart(2, "0")).join("");
    return `${ts}-${rand}`;
  }
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";
  const len = 21;
  let id = "";
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) id += alphabet[buf[i] % alphabet.length];
  return id;
}

function validateUuid(input: string): { valid: boolean; version: string; variant: string; error?: string } {
  const clean = input.replace(/[{}uUrRnN:]/g, "").trim();
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const hexRe = /^[0-9a-f]{32}$/i;
  const formatted = clean.includes("-") ? clean : clean.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  if (!uuidRe.test(formatted) && !hexRe.test(clean)) return { valid: false, version: "N/A", variant: "N/A", error: "Not a valid UUID" };
  const normalized = formatted.toLowerCase();
  const versionChar = normalized[14];
  const variantChar = normalized[19];
  const vMap: Record<string, string> = { "1": "v1 (Time-based)", "2": "v2 (DCE)", "3": "v3 (Name-based MD5)", "4": "v4 (Random)", "5": "v5 (Name-based SHA-1)", "7": "v7 (Time-ordered)" };
  const variant = variantChar >= "8" && variantChar <= "b" ? "RFC 4122" : "Other";
  return { valid: true, version: vMap[versionChar] || `Unknown (${versionChar})`, variant };
}

export function UUIDGenerator() {
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<FormatStyle>("hyphens");
  const [exportFmt, setExportFmt] = useState<ExportFormat>("text");
  const [uuids, setUuids] = useState<string[]>(() => {
    const init: string[] = [];
    for (let i = 0; i < 5; i++) init.push(formatUuid(makeUuid("v4"), "hyphens"));
    return init;
  });
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const [history, setHistory] = useState<{ time: string; uuids: string[] }[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [validateInput, setValidateInput] = useState("");
  const [validateResult, setValidateResult] = useState<ReturnType<typeof validateUuid> | null>(null);
  const [tsIdType, setTsIdType] = useState<"snowflake" | "nanoid">("snowflake");
  const [tsIds, setTsIds] = useState<string[]>([]);
  const cancelRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    setProgress(0);
    cancelRef.current = false;
    const batchSize = Math.min(count, 100);
    const results: string[] = [];
    const total = Math.min(count, 10000);
    for (let i = 0; i < total; i += batchSize) {
      if (cancelRef.current) break;
      const n = Math.min(batchSize, total - i);
      for (let j = 0; j < n; j++) {
        const raw = makeUuid(version);
        results.push(formatUuid(raw, format));
      }
      setProgress(Math.min(100, Math.round(((i + n) / total) * 100)));
      if (total > 1000) await new Promise((r) => setTimeout(r, 0));
    }
    setUuids(results);
    if (results.length > 0) {
      setHistory((prev) => [{ time: new Date().toISOString(), uuids: results.slice(0, 5) }, ...prev].slice(0, 10));
    }
    setGenerating(false);
    setProgress(100);
  }, [version, count, format, generating]);

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(() => { generate(); }, 3000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); cancelRef.current = true; };
  }, [autoRefresh, generate]);

  const handleVersionChange = (v: UuidVersion) => {
    setVersion(v);
    if (autoRefresh) generate();
  };

  const handleFormatChange = (f: FormatStyle) => {
    setFormat(f);
    if (autoRefresh) generate();
  };

  const copyOne = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 2000);
  };

  const copyAll = async (variant: "text" | "json" | "csv") => {
    let text = "";
    if (variant === "json") text = JSON.stringify(uuids, null, 2);
    else if (variant === "csv") text = uuids.join(",\n");
    else text = uuids.join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedIdx(-2);
    setTimeout(() => setCopiedIdx(-1), 2000);
  };

  const handleExport = () => {
    let content = "";
    switch (exportFmt) {
      case "json": content = JSON.stringify(uuids, null, 2); break;
      case "csv": content = "uuid\n" + uuids.join("\n"); break;
      case "tsv": content = "uuid\n" + uuids.join("\t"); break;
      default: content = uuids.join("\n");
    }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `uuids.${exportFmt === "json" ? "json" : "txt"}`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTxt = () => {
    const content = uuids.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "uuids.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidate = () => {
    setValidateResult(validateUuid(validateInput));
  };

  const handleGenTsId = () => {
    setTsIds(Array.from({ length: 5 }, () => generateTimestampId(tsIdType)));
  };

  const stats = uuids.length > 0 && format !== "base64" ? (() => {
    const raw = makeUuid(version);
    const ts = extractTimestamp(raw, version);
    return { count: uuids.length, version: `UUID ${version}`, timestamp: ts || "N/A" };
  })() : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Version:</label>
          <select value={version} onChange={(e) => handleVersionChange(e.target.value as UuidVersion)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="v4">UUID v4 (Random)</option>
            <option value="v7">UUID v7 (Time-ordered)</option>
            <option value="v1">UUID v1 (Time-based MAC)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Count:</label>
          <input type="number" min={1} max={10000} value={count}
            onChange={(e) => setCount(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Format:</label>
          <select value={format} onChange={(e) => handleFormatChange(e.target.value as FormatStyle)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="hyphens">Standard</option>
            <option value="uppercase">Uppercase</option>
            <option value="curly">Braces {}</option>
            <option value="uuid-format">URN (urn:uuid:)</option>
            <option value="no-hyphens">No Hyphens</option>
            <option value="lowercase">Lowercase</option>
            <option value="base64">Base64</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={generate} disabled={generating}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
          {generating ? `Generating ${progress}%` : "Generate"}
        </button>
        {uuids.length > 0 && (
          <>
            <button onClick={() => copyAll("text")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
              {copiedIdx === -2 ? "Copied!" : "Copy All"}
            </button>
            <button onClick={() => copyAll("json")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Copy as JSON</button>
            <button onClick={() => copyAll("csv")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Copy as CSV</button>
            <button onClick={downloadTxt} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download .txt</button>
          </>
        )}
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="accent-brand-500" />
          Auto-refresh (3s)
        </label>
      </div>

      {generating && (
        <div className="h-2 rounded-full bg-surface-200 dark:bg-dark-border overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {stats && (
        <div className="flex gap-4 text-xs text-surface-600 dark:text-dark-muted">
          <span>Count: <strong>{stats.count}</strong></span>
          <span>Version: <strong>{stats.version}</strong></span>
          <span>Timestamp: <strong>{stats.timestamp}</strong></span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <select value={exportFmt} onChange={(e) => setExportFmt(e.target.value as ExportFormat)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="text">Text (line)</option>
          <option value="json">JSON Array</option>
          <option value="csv">CSV</option>
          <option value="tsv">TSV</option>
        </select>
        <button onClick={handleExport} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Export</button>
      </div>

      {uuids.length > 0 && (
        <div className="max-h-80 overflow-y-auto space-y-1">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text select-all truncate">{uuid}</code>
              <button onClick={() => copyOne(uuid, i)} className="text-xs text-brand-500 hover:text-brand-600 whitespace-nowrap">
                {copiedIdx === i ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
        <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">UUID Validation</p>
        <div className="flex gap-2">
          <input type="text" value={validateInput} onChange={(e) => setValidateInput(e.target.value)} placeholder="Enter a UUID to validate..."
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          <button onClick={handleValidate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Validate</button>
        </div>
        {validateResult && (
          <div className={`mt-2 rounded-lg border p-2 text-xs ${validateResult.valid ? "border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300" : "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
            {validateResult.valid ? `Valid UUID — ${validateResult.version}, ${validateResult.variant}` : validateResult.error}
          </div>
        )}
      </div>

      <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
        <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">Timestamp-based IDs</p>
        <div className="flex gap-2 mb-2">
          <select value={tsIdType} onChange={(e) => setTsIdType(e.target.value as "snowflake" | "nanoid")}
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="snowflake">Snowflake-style</option>
            <option value="nanoid">NanoID-style</option>
          </select>
          <button onClick={handleGenTsId} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Generate</button>
        </div>
        {tsIds.length > 0 && (
          <div className="space-y-1">
            {tsIds.map((id, i) => (
              <div key={i} className="flex items-center gap-2 rounded border border-surface-200 bg-surface-50 px-3 py-1.5 dark:border-dark-border dark:bg-dark-surface">
                <code className="flex-1 text-xs font-mono text-surface-900 dark:text-dark-text select-all">{id}</code>
                <button onClick={() => copyOne(id, i + 1000)} className="text-xs text-brand-500 hover:text-brand-600">
                  {copiedIdx === i + 1000 ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Recent Generations</p>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {history.map((h, i) => (
              <div key={i} className="text-xs text-surface-500 dark:text-dark-muted truncate">
                <span className="font-mono">{new Date(h.time).toLocaleTimeString()}</span> — {h.uuids.length} UUIDs
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
