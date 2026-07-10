"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Mode = "encode" | "decode";
type OutputFormat = "plain" | "datauri" | "base64url";
type CharEncoding = "utf-8" | "ascii" | "utf-16" | "latin-1";

const TEXT_MIME_TYPES = ["text/plain", "application/json", "text/csv", "application/xml", "text/xml"];

function encodeChar(str: string, enc: CharEncoding): string {
  if (enc === "ascii") {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
    return btoa(String.fromCharCode(...bytes));
  }
  if (enc === "latin-1") {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c > 255) throw new Error(`Character '${str[i]}' cannot be encoded in Latin-1`);
      bytes[i] = c;
    }
    return btoa(String.fromCharCode(...bytes));
  }
  if (enc === "utf-16") {
    const bytes = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      bytes[i * 2] = c & 0xff;
      bytes[i * 2 + 1] = (c >> 8) & 0xff;
    }
    return btoa(String.fromCharCode(...bytes));
  }
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeChar(str: string, enc: CharEncoding): string {
  const raw = atob(str);
  if (enc === "ascii" || enc === "latin-1") {
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return String.fromCharCode(...bytes);
  }
  if (enc === "utf-16") {
    if (raw.length % 2 !== 0) throw new Error("Invalid UTF-16 encoded base64 (odd byte count)");
    const chars: number[] = [];
    for (let i = 0; i < raw.length; i += 2)
      chars.push(raw.charCodeAt(i) | (raw.charCodeAt(i + 1) << 8));
    return String.fromCharCode(...chars);
  }
  return decodeURIComponent(escape(raw));
}

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [validationMsg, setValidationMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mode, setMode] = useState<Mode>("encode");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("plain");
  const [charEncoding, setCharEncoding] = useState<CharEncoding>("utf-8");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    setError("");
    setValidationMsg(null);
    if (!input.trim()) { setOutput(""); return; }
    try {
      if (mode === "encode") {
        let encoded = encodeChar(input, charEncoding);
        if (outputFormat === "base64url") {
          encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        } else if (outputFormat === "datauri") {
          const mime = "text/plain;charset=utf-8";
          encoded = `data:${mime};base64,${encoded}`;
        }
        setOutput(encoded);
      } else {
        let cleaned = input.trim();
        if (outputFormat === "datauri") {
          const match = cleaned.match(/^data:.*?;base64,(.+)$/);
          if (!match) throw new Error("Invalid data URI format");
          cleaned = match[1];
        } else if (outputFormat === "base64url") {
          cleaned = cleaned.replace(/-/g, "+").replace(/_/g, "/");
          while (cleaned.length % 4 !== 0) cleaned += "=";
        }
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
          setValidationMsg({ ok: false, text: "Input contains invalid Base64 characters" });
        } else {
          setValidationMsg({ ok: true, text: `Valid Base64 string (${cleaned.length} chars)` });
        }
        setOutput(decodeChar(cleaned, charEncoding));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, mode, outputFormat, charEncoding]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const handleInputChange = (val: string) => {
    setInput(val);
  };

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  const downloadTxt = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBin = () => {
    if (!output) return;
    const bytes = new Uint8Array(output.length);
    for (let i = 0; i < output.length; i++) bytes[i] = output.charCodeAt(i) & 0xff;
    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.bin"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setInput(result);
      setMode("decode");
      setOutputFormat("datauri");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileUpload = useCallback(() => {
    const inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.accept = ".txt,.json,.csv,.xml,text/plain,application/json,text/csv,text/xml";
    inputEl.onchange = () => {
      const file = inputEl.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setInput(content);
        setMode("encode");
      };
      if (TEXT_MIME_TYPES.some((m) => file.type.includes(m.split("/")[1]))) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
        setMode("decode");
        setOutputFormat("datauri");
      }
    };
    inputEl.click();
  }, []);

  const handleDecodedFileDownload = () => {
    if (!output || mode !== "decode") return;
    const bytes = new Uint8Array(output.length);
    for (let i = 0; i < output.length; i++) bytes[i] = output.charCodeAt(i) & 0xff;
    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "decoded.bin"; a.click();
    URL.revokeObjectURL(url);
  };

  const inputSize = new TextEncoder().encode(input).length;
  const outputSize = output ? new TextEncoder().encode(output).length : 0;
  const overhead = mode === "encode" && inputSize > 0 ? ((outputSize / inputSize - 1) * 100).toFixed(1) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {m === "encode" ? "Encode" : "Decode"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="plain">Plain Text</option>
          <option value="datauri">Data URI</option>
          <option value="base64url">Base64url</option>
        </select>
        <select value={charEncoding} onChange={(e) => setCharEncoding(e.target.value as CharEncoding)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="utf-8">UTF-8</option>
          <option value="ascii">ASCII</option>
          <option value="utf-16">UTF-16</option>
          <option value="latin-1">Latin-1</option>
        </select>
        <button onClick={handleFileUpload} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">
          Upload File
        </button>
      </div>

      <div onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()}>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
        </label>
        <textarea value={input} onChange={(e) => handleInputChange(e.target.value)}
          placeholder={mode === "encode" ? "Enter text or drop a file..." : "Enter Base64 string or drop a file..."}
          rows={5} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        {!input && (
          <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">Drag & drop a file or use Upload File button</p>
        )}
      </div>

      {validationMsg && mode === "decode" && (
        <div className={`rounded-lg border p-3 ${validationMsg.ok ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"}`}>
          <p className={`text-sm ${validationMsg.ok ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
            {validationMsg.text}
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
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <div className="flex gap-1">
              <button onClick={copy} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
              <button onClick={downloadTxt} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">.txt</button>
              <button onClick={downloadBin} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">.bin</button>
              {mode === "decode" && (
                <button onClick={handleDecodedFileDownload} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Save Decoded</button>
              )}
            </div>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 break-all select-all">{output}</pre>
        </div>
      )}

      {input && (
        <div className="flex flex-wrap gap-3 text-xs text-surface-500 dark:text-dark-muted">
          <span>Input: {inputSize} byte{inputSize !== 1 ? "s" : ""}</span>
          <span>Output: {outputSize} byte{outputSize !== 1 ? "s" : ""}</span>
          {overhead !== null && <span className="text-accent-brand-500">+{overhead}% overhead (Base64 adds ~33%)</span>}
        </div>
      )}
    </div>
  );
}
