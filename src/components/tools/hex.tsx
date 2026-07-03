"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

type Mode = "encode" | "decode";
type CaseType = "lower" | "upper";
type SeparatorType = "space" | "continuous" | "0x";

function textToHex(str: string, caseType: CaseType, separator: SeparatorType): string {
  return str.split("").map((char) => {
    let hex = char.charCodeAt(0).toString(16).padStart(2, "0");
    if (caseType === "upper") hex = hex.toUpperCase();
    if (separator === "0x") return `0x${hex}`;
    return hex;
  }).join(separator === "continuous" ? "" : " ");
}

function hexToText(hex: string): string {
  const cleaned = hex.replace(/0x/gi, "").replace(/[^0-9a-fA-F]/g, "");
  if (!cleaned) throw new Error("No valid hex digits found");
  if (cleaned.length % 2 !== 0) throw new Error("Hex string has an odd number of digits");
  const chars: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    chars.push(parseInt(cleaned.slice(i, i + 2), 16));
  }
  return String.fromCharCode(...chars);
}

function applyXor(hex: string, key: number): string {
  const cleaned = hex.replace(/0x/gi, "").replace(/[^0-9a-fA-F]/g, "");
  const bytes: string[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    const val = parseInt(cleaned.slice(i, i + 2), 16) ^ key;
    bytes.push(val.toString(16).padStart(2, "0"));
  }
  return bytes.join(" ");
}

export function Hex() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [caseType, setCaseType] = useState<CaseType>("lower");
  const [separator, setSeparator] = useState<SeparatorType>("space");
  const [xorKey, setXorKey] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    setError("");
    if (!input.trim()) { setOutput(""); return; }
    try {
      if (mode === "encode") {
        let result = textToHex(input, caseType, separator);
        if (xorKey) {
          const key = parseInt(xorKey, 10);
          if (isNaN(key) || key < 0 || key > 255) throw new Error("XOR key must be a number between 0-255");
          const cleaned = result.replace(/\s/g, "").replace(/0x/gi, "");
          const xored: string[] = [];
          for (let i = 0; i < cleaned.length; i += 2) {
            const val = parseInt(cleaned.slice(i, i + 2), 16) ^ key;
            let h = val.toString(16).padStart(2, "0");
            if (caseType === "upper") h = h.toUpperCase();
            xored.push(separator === "0x" ? `0x${h}` : h);
          }
          result = xored.join(separator === "continuous" ? "" : " ");
        }
        setOutput(result);
      } else {
        let cleaned = input;
        if (xorKey) {
          const key = parseInt(xorKey, 10);
          if (isNaN(key) || key < 0 || key > 255) throw new Error("XOR key must be a number between 0-255");
          cleaned = applyXor(cleaned, key);
        }
        setOutput(hexToText(cleaned));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, mode, caseType, separator, xorKey]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  const byteDetails = useMemo(() => {
    if (mode !== "encode" || !input) return [];
    return input.split("").map((char, i) => {
      const code = char.charCodeAt(0);
      const hex = code.toString(16).padStart(2, "0");
      const binary = code.toString(2).padStart(8, "0");
      return { offset: i, char, code, hex, binary };
    });
  }, [input, mode]);

  const handleFileConvert = useCallback(() => {
    const inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.onchange = () => {
      const file = inputEl.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(" ");
        setInput(`[File: ${file.name} - ${bytes.length} bytes]`);
        setOutput(hex);
      };
      reader.readAsArrayBuffer(file);
    };
    inputEl.click();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {m === "encode" ? "Text to Hex" : "Hex to Text"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["lower", "upper"] as CaseType[]).map((c) => (
          <button key={c} onClick={() => setCaseType(c)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${caseType === c ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {c === "lower" ? "Lowercase" : "Uppercase"}
          </button>
        ))}
        {(["space", "continuous", "0x"] as SeparatorType[]).map((s) => (
          <button key={s} onClick={() => setSeparator(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${separator === s ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {s === "space" ? "Space-sep" : s === "continuous" ? "Continuous" : "0x-prefixed"}
          </button>
        ))}
        {mode === "encode" && (
          <button onClick={handleFileConvert} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">
            File to Hex
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          {mode === "encode" ? "Text Input" : "Hex Input"}
        </label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Hello" : "48 65 6c 6c 6f"}
          rows={4} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-surface-500 dark:text-dark-muted">XOR Key (0-255):</label>
        <input type="number" min={0} max={255} value={xorKey} onChange={(e) => setXorKey(e.target.value)}
          placeholder="Optional"
          className="w-20 rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <button onClick={copy} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 break-all select-all">{output}</pre>
        </div>
      )}

      {byteDetails.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Byte Breakdown</p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-surface-200 dark:border-dark-border">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-surface-50 text-surface-500 dark:bg-dark-surface dark:text-dark-muted">
                  <th className="px-2 py-1 text-left">Offset</th>
                  <th className="px-2 py-1 text-left">Char</th>
                  <th className="px-2 py-1 text-left">Code</th>
                  <th className="px-2 py-1 text-left">Hex</th>
                  <th className="px-2 py-1 text-left">Binary</th>
                  <th className="px-2 py-1 text-left">Decimal</th>
                </tr>
              </thead>
              <tbody>
                {byteDetails.map((b, i) => (
                  <tr key={i} className="border-t border-surface-100 text-surface-700 dark:border-dark-border dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">
                    <td className="px-2 py-1 text-surface-400">{b.offset.toString(16).padStart(4, "0")}</td>
                    <td className="px-2 py-1">{b.char === " " ? "␣" : b.char}</td>
                    <td className="px-2 py-1 text-surface-400">{b.code}</td>
                    <td className="px-2 py-1 text-brand-500">{b.hex}</td>
                    <td className="px-2 py-1">{b.binary}</td>
                    <td className="px-2 py-1">{b.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
