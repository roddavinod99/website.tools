"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type CharEncoding = "utf-8" | "ascii" | "utf-16le" | "utf-16be";

function encodeBase64(str: string, enc: CharEncoding): string {
  if (enc === "utf-8") return btoa(unescape(encodeURIComponent(str)));
  if (enc === "ascii") {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
    return btoa(String.fromCharCode(...bytes));
  }
  if (enc === "utf-16le") {
    const bytes = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      bytes[i * 2] = c & 0xff;
      bytes[i * 2 + 1] = (c >> 8) & 0xff;
    }
    return btoa(String.fromCharCode(...bytes));
  }
  if (enc === "utf-16be") {
    const bytes = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      bytes[i * 2] = (c >> 8) & 0xff;
      bytes[i * 2 + 1] = c & 0xff;
    }
    return btoa(String.fromCharCode(...bytes));
  }
  return btoa(str);
}

export function Base64Encoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [encoding, setEncoding] = useState<CharEncoding>("utf-8");
  const [dataUri, setDataUri] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const encode = useCallback(() => {
    if (!input) { setOutput(""); return; }
    let result = encodeBase64(input, encoding);
    if (wrapLines) result = result.match(/.{1,76}/g)?.join("\n") || result;
    if (dataUri) result = `data:text/plain;charset=utf-8;base64,${result}`;
    setOutput(result);
  }, [input, encoding, dataUri, wrapLines]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(encode, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [encode]);

  const handleFileUpload = () => {
    const el = document.createElement("input");
    el.type = "file";
    el.onchange = () => {
      const file = el.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setInput(reader.result as string);
      reader.readAsText(file);
    };
    el.click();
  };

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const copyDataUri = async () => {
    const dataUriOutput = `data:text/plain;charset=utf-8;base64,${encodeBase64(input, encoding)}`;
    await navigator.clipboard.writeText(dataUriOutput);
  };
  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "encoded.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const inputSize = new TextEncoder().encode(input).length;
  const outputSize = output ? new TextEncoder().encode(output).length : 0;
  const overhead = inputSize > 0 ? ((outputSize / inputSize - 1) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={encoding} onChange={(e) => setEncoding(e.target.value as CharEncoding)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="utf-8">UTF-8</option>
          <option value="ascii">ASCII</option>
          <option value="utf-16le">UTF-16 LE</option>
          <option value="utf-16be">UTF-16 BE</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={dataUri} onChange={(e) => setDataUri(e.target.checked)} className="rounded border-surface-300" /> Data URI prefix
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={wrapLines} onChange={(e) => setWrapLines(e.target.checked)} className="rounded border-surface-300" /> Wrap at 76 chars
        </label>
        <button onClick={handleFileUpload} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Upload File</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Text to Encode</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encode..." rows={6} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Base64 Output</label>
            <div className="flex gap-1">
              <button onClick={copy} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
              <button onClick={copyDataUri} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Copy Data URI</button>
              <button onClick={download} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">.txt</button>
            </div>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 break-all select-all">{output}</pre>
        </div>
      )}

      {input && (
        <div className="flex flex-wrap gap-3 text-xs text-surface-500 dark:text-dark-muted">
          <span>Input: {inputSize.toLocaleString()} bytes</span>
          <span>Output: {outputSize.toLocaleString()} bytes</span>
          <span className="text-accent-brand-500">+{overhead}% overhead</span>
        </div>
      )}
    </div>
  );
}
