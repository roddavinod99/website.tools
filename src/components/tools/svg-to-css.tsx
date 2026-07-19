"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Upload } from "lucide-react";
import { validateFileSize } from "@/lib/file-security";

const safeSanitize = (html: string) => {
  try { return DOMPurify.sanitize(html); } catch { return html; }
};

export function SvgToCss() {
  const [input, setInput] = useState(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`);
  const [mode, setMode] = useState("background");
  const [encoding, setEncoding] = useState<"url" | "base64">("url");
  const [vendorPrefix, setVendorPrefix] = useState(false);
  const [copied, setCopied] = useState("");
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const svgSize = useMemo(() => {
    const w = input.match(/width="(\d+)"/)?.[1];
    const h = input.match(/height="(\d+)"/)?.[1];
    return { w: w ?? "auto", h: h ?? "auto" };
  }, [input]);

  const isValid = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return false;
    return trimmed.startsWith("<svg") && (trimmed.endsWith("</svg>") || trimmed.endsWith("/>"));
  }, [input]);

  const optimized = useMemo(() => {
    return input
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\s+/g, " ")
      .replace(/>\s+</g, "><")
      .replace(/\s{2,}/g, " ")
      .trim();
  }, [input]);

  const cssOutput = useMemo(() => {
    if (!isValid) return "";
    const svg = optimized;
    let dataUri: string;
    if (encoding === "url") {
      dataUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg).replace(/%23/g, '#');
    } else {
      dataUri = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
    }

    const prefix = (prop: string) => vendorPrefix ? `  -webkit-${prop}\n  ${prop}` : `  ${prop}`;

    switch (mode) {
      case "background":
        return `.svg-icon {\n  width: ${svgSize.w};\n  height: ${svgSize.h};\n${prefix("background-image: url(\"" + dataUri + "\");")}\n  background-size: contain;\n  background-repeat: no-repeat;\n}`;
      case "mask":
        return `.svg-mask {\n  width: ${svgSize.w};\n  height: ${svgSize.h};\n  background: currentColor;\n${prefix("mask-image: url(\"" + dataUri + "\") no-repeat center;")}\n${prefix("mask-size: contain;")}\n${prefix("mask-repeat: no-repeat;")}\n}`;
      case "inline":
        return `.svg-inline {\n  width: ${svgSize.w};\n  height: ${svgSize.h};\n}\n\n.svg-inline::before {\n  content: "${encodeURIComponent(svg).replace(/"/g, '\\"')}";\n}`;
      case "clip":
        return `.svg-clip {\n  width: ${svgSize.w};\n  height: ${svgSize.h};\n${prefix("clip-path: url(\"" + dataUri + "\");")}\n}`;
      case "list":
        return `.svg-list-icon {\n${prefix("list-style-image: url(\"" + dataUri + "\");")}\n}`;
      default:
        return "";
    }
  }, [mode, encoding, isValid, optimized, svgSize, vendorPrefix]);

  const sizeComparison = useMemo(() => {
    if (!isValid) return "";
    const original = input.length;
    const cssLen = cssOutput.length;
    const ratio = cssLen > 0 ? ((cssLen - original) / original * 100).toFixed(1) : "0";
    return `${original} bytes SVG → ${cssLen} bytes CSS (${ratio}%)`;
  }, [input, cssOutput, isValid]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const downloadCss = () => {
    const a = document.createElement("a");
    a.href = "data:text/css;charset=utf-8," + encodeURIComponent(cssOutput);
    a.download = "svg-styles.css";
    a.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeCheck = validateFileSize(file, 25 * 1024 * 1024);
    if (!sizeCheck.valid) {
      setFileError(sizeCheck.error || "File too large");
      return;
    }
    setFileError("");
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">SVG Code</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        <div className="mt-1">
          <input ref={fileRef} type="file" accept=".svg" onChange={handleFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600" aria-label="Upload SVG file"><Upload className="w-3 h-3" /> Upload SVG</button>
        </div>
      </div>

      {fileError && <p className="text-sm text-red-500">{fileError}</p>}

      {!isValid && input.trim() && <p className="text-sm text-red-500">Invalid SVG — must start with &lt;svg and end with &lt;/svg&gt;</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">CSS Property</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="background">background-image</option>
            <option value="mask">mask-image</option>
            <option value="clip">clip-path</option>
            <option value="list">list-style-image</option>
            <option value="inline">Inline SVG</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Encoding</label>
          <select value={encoding} onChange={(e) => setEncoding(e.target.value as "url" | "base64")} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="url">URL-encoded</option>
            <option value="base64">Base64</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={vendorPrefix} onChange={(e) => setVendorPrefix(e.target.checked)} className="rounded border-surface-300" /> Vendor prefix (-webkit-)
        </label>
      </div>

      <div className="flex items-center gap-4 p-3 rounded-lg border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface">
        <div className="text-xs text-surface-500 dark:text-dark-muted">Preview:</div>
        <div className="flex items-center justify-center min-w-[48px] min-h-[48px]" dangerouslySetInnerHTML={{ __html: safeSanitize(optimized) }} />
        {svgSize.w !== "auto" && <span className="text-xs text-surface-400">{svgSize.w}x{svgSize.h}</span>}
        <span className="text-xs text-surface-400">{sizeComparison}</span>
      </div>

      {cssOutput && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Generated CSS</label>
          <div className="relative">
            <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 overflow-auto max-h-60 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">{cssOutput}</pre>
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => handleCopy(cssOutput, "css")} className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600" aria-label="Copy CSS">{copied === "css" ? "Copied!" : "Copy CSS"}</button>
              <button onClick={downloadCss} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" aria-label="Download CSS">Download .css</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
