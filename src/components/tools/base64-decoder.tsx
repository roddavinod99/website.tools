"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type CharEncoding = "utf-8" | "ascii" | "utf-16le" | "utf-16be";

function detectEncoding(raw: string): CharEncoding {
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return "utf-16le";
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return "utf-16be";
  try { decodeURIComponent(escape(raw)); return "utf-8"; } catch {}
  return "ascii";
}

function decodeBase64(str: string, enc: CharEncoding): string {
  const raw = atob(str);
  if (enc === "utf-16le") {
    if (raw.length % 2 !== 0) throw new Error("Invalid UTF-16LE data (odd byte count)");
    const chars: number[] = [];
    for (let i = 0; i < raw.length; i += 2) chars.push(raw.charCodeAt(i) | (raw.charCodeAt(i + 1) << 8));
    return String.fromCharCode(...chars);
  }
  if (enc === "utf-16be") {
    if (raw.length % 2 !== 0) throw new Error("Invalid UTF-16BE data (odd byte count)");
    const chars: number[] = [];
    for (let i = 0; i < raw.length; i += 2) chars.push((raw.charCodeAt(i) << 8) | raw.charCodeAt(i + 1));
    return String.fromCharCode(...chars);
  }
  if (enc === "ascii") {
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return String.fromCharCode(...bytes);
  }
  return decodeURIComponent(escape(raw));
}

function isBinary(decoded: string): boolean {
  for (let i = 0; i < Math.min(decoded.length, 512); i++) {
    const c = decoded.charCodeAt(i);
    if (c === 0 || (c < 32 && c !== 9 && c !== 10 && c !== 13)) return true;
  }
  return false;
}

export function Base64Decoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [encoding, setEncoding] = useState<CharEncoding>("utf-8");
  const [autoDetect, setAutoDetect] = useState(true);
  const [detectedEnc, setDetectedEnc] = useState<CharEncoding | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [isBin, setIsBin] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const decode = useCallback(() => {
    setError("");
    setValid(null);
    setDetectedEnc(null);
    setIsBin(false);
    if (!input.trim()) { setOutput(""); return; }
    const cleaned = input.trim()
      .replace(/^data:[^;]+;base64,/, "")
      .replace(/\s+/g, "");
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
      setValid(false);
      setError("Input contains invalid Base64 characters");
      setOutput("");
      return;
    }
    setValid(true);
    try {
      const raw = atob(cleaned);
      const detected = detectEncoding(raw);
      setDetectedEnc(detected);
      const enc = autoDetect ? detected : encoding;
      const decoded = decodeBase64(cleaned, enc);
      setOutput(decoded);
      setIsBin(isBinary(decoded));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to decode");
      setOutput("");
    }
  }, [input, encoding, autoDetect]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(decode, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [decode]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const downloadText = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "decoded.txt"; a.click();
    URL.revokeObjectURL(url);
  };
  const downloadBinary = () => {
    if (!output) return;
    const bytes = new Uint8Array(output.length);
    for (let i = 0; i < output.length; i++) bytes[i] = output.charCodeAt(i) & 0xff;
    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "decoded.bin"; a.click();
    URL.revokeObjectURL(url);
  };

  const inputBytes = input ? Math.ceil(input.trim().replace(/\s/g, "").length * 3 / 4) : 0;
  const outputSize = output ? new TextEncoder().encode(output).length : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={autoDetect} onChange={(e) => setAutoDetect(e.target.checked)} className="rounded border-surface-300" /> Auto-detect encoding
        </label>
        {!autoDetect && (
          <select value={encoding} onChange={(e) => setEncoding(e.target.value as CharEncoding)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="utf-8">UTF-8</option>
            <option value="ascii">ASCII</option>
            <option value="utf-16le">UTF-16 LE</option>
            <option value="utf-16be">UTF-16 BE</option>
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Base64 Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Paste Base64 string here..." rows={6} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      {valid !== null && (
        <div className={`rounded-lg border p-3 ${valid ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"}`}>
          <p className={`text-sm ${valid ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
            {valid ? `Valid Base64 string` : "Invalid Base64 input"}
            {detectedEnc && autoDetect && ` — Detected: ${detectedEnc.toUpperCase()}`}
          </p>
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
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Decoded Output</label>
            <div className="flex gap-1">
              <button onClick={copy} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
              <button onClick={downloadText} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">.txt</button>
              {isBin && <button onClick={downloadBinary} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Save Binary</button>}
            </div>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 break-all select-all">{output}</pre>
        </div>
      )}

      {input && (
        <div className="flex flex-wrap gap-3 text-xs text-surface-500 dark:text-dark-muted">
          <span>Decoded size: {inputBytes.toLocaleString()} bytes</span>
          <span>Text length: {output.length.toLocaleString()} chars</span>
          {outputSize > 0 && <span>Output: {outputSize.toLocaleString()} bytes</span>}
        </div>
      )}
    </div>
  );
}
