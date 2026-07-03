"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { sanitize } from "@/lib/sanitize";

const FORMATS = [
  "CODE128", "CODE39", "EAN-13", "EAN-8", "UPC-A", "UPC-E", "ITF-14",
  "Codabar", "CODE93", "GS1-128", "PDF417", "DATA-MATRIX", "AZTEC",
] as const;

type BarcodeFormat = (typeof FORMATS)[number];

interface ValidationResult { valid: boolean; error?: string }

const FORMAT_VALIDATORS: Partial<Record<BarcodeFormat, (v: string) => ValidationResult>> = {
  "EAN-13": (v) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length !== 12 && clean.length !== 13) return { valid: false, error: "EAN-13 requires 12 or 13 digits" };
    return { valid: true };
  },
  "EAN-8": (v) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length !== 7 && clean.length !== 8) return { valid: false, error: "EAN-8 requires 7 or 8 digits" };
    return { valid: true };
  },
  "UPC-A": (v) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length !== 11 && clean.length !== 12) return { valid: false, error: "UPC-A requires 11 or 12 digits" };
    return { valid: true };
  },
  "UPC-E": (v) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length !== 6 && clean.length !== 7 && clean.length !== 8) return { valid: false, error: "UPC-E requires 6-8 digits" };
    return { valid: true };
  },
  "ITF-14": (v) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length !== 14) return { valid: false, error: "ITF-14 requires exactly 14 digits" };
    return { valid: true };
  },
  "CODE39": (v) => {
    if (!/^[A-Z0-9\-.$/+%\s]+$/.test(v.trim())) return { valid: false, error: "Code 39 allows A-Z, 0-9, -, ., $, /, +, %, space" };
    return { valid: true };
  },
};

function validateInput(format: BarcodeFormat, value: string): ValidationResult {
  if (!value.trim()) return { valid: true };
  const validator = FORMAT_VALIDATORS[format];
  if (validator) return validator(value);
  return { valid: true };
}

export function BarcodeGenerator() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [error, setError] = useState("");
  const [barWidth, setBarWidth] = useState(2);
  const [barHeight, setBarHeight] = useState(80);
  const [fontSize, setFontSize] = useState(16);
  const [displayValue, setDisplayValue] = useState(true);
  const [addCheckDigit, setAddCheckDigit] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [barColor, setBarColor] = useState("#000000");
  const [batchMode, setBatchMode] = useState(false);
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<string[]>([]);
  const [sizeDisplay, setSizeDisplay] = useState("");
  const svgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const generateSingle = useCallback(async (text: string, fmt: BarcodeFormat): Promise<string> => {
    const JsBarcode = (await import("jsbarcode")).default;
    const div = document.createElement("div");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "barcode-svg");
    div.appendChild(svg);
    (JsBarcode as (el: Element, text: string, opts: Record<string, unknown>) => void)(svg, text, {
      format: fmt,
      width: barWidth,
      height: barHeight,
      displayValue,
      fontSize,
      margin: 10,
      background: bgColor,
      lineColor: barColor,
      addCheckDigit,
    });
    return div.innerHTML;
  }, [barWidth, barHeight, displayValue, fontSize, bgColor, barColor, addCheckDigit]);

  const generate = useCallback(async () => {
    setError("");
    setBatchResults([]);
    setSizeDisplay("");
    if (batchMode) {
      const lines = batchInput.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;
      for (const line of lines) {
        const v = validateInput(format, line);
        if (!v.valid) { setError(v.error!); return; }
      }
      const results: string[] = [];
      for (const line of lines) {
        const svgStr = await generateSingle(line, format);
        results.push(svgStr);
      }
      setBatchResults(results);
      setSizeDisplay(`${lines.length} barcodes generated`);
      if (svgRef.current) {
        svgRef.current.innerHTML = results[0];
      }
    } else {
      const v = validateInput(format, input);
      if (!v.valid) { setError(v.error!); return; }
      if (!input.trim()) return;
      const svgStr = await generateSingle(input, format);
      if (svgRef.current) svgRef.current.innerHTML = svgStr;
      const tmp = document.createElement("div");
      tmp.innerHTML = svgStr;
      const svgEl = tmp.querySelector("svg");
      if (svgEl) {
        const w = svgEl.getAttribute("width") || `${barWidth * 100}`;
        const h = svgEl.getAttribute("height") || `${barHeight + 40}`;
        setSizeDisplay(`${parseInt(w).toFixed(0)} x ${parseInt(h).toFixed(0)} px`);
      }
    }
  }, [input, format, batchMode, batchInput, generateSingle, barWidth, barHeight]);

  useEffect(() => {
    if (!batchMode) {
      const t = setTimeout(() => { generate(); }, 300);
      return () => clearTimeout(t);
    }
  }, [input, format, barWidth, barHeight, fontSize, displayValue, addCheckDigit, bgColor, barColor, batchMode, generate]);

  const download = useCallback(async (type: "svg" | "png" | "jpeg") => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    if (type === "svg") {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `barcode-${input || "output"}.svg`; a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx!.fillStyle = bgColor;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0);
      const mime = type === "png" ? "image/png" : "image/jpeg";
      const blobUrl = canvas.toDataURL(mime, 0.92);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = `barcode-${input || "output"}.${type}`; a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [input, bgColor]);

  const copyImage = useCallback(async () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx!.fillStyle = bgColor;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [bgColor]);

  const clear = () => {
    setInput("");
    setBatchInput("");
    setBatchResults([]);
    setError("");
    setSizeDisplay("");
    if (svgRef.current) svgRef.current.innerHTML = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            {batchMode ? "Barcode Values (one per line)" : "Value"}
          </label>
          {batchMode ? (
            <textarea
              value={batchInput} onChange={(e) => setBatchInput(e.target.value)}
              placeholder={`Enter barcode values\none per line...`}
              rows={4}
              className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
            />
          ) : (
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Enter barcode value..." autoFocus
              className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
            className="rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {FORMATS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Bar Width</label>
          <input type="range" min={1} max={10} value={barWidth} onChange={(e) => setBarWidth(parseInt(e.target.value))}
            className="w-full accent-brand-500" />
          <span className="text-xs text-surface-500 dark:text-dark-muted">{barWidth}</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Bar Height</label>
          <input type="range" min={20} max={200} value={barHeight} onChange={(e) => setBarHeight(parseInt(e.target.value))}
            className="w-full accent-brand-500" />
          <span className="text-xs text-surface-500 dark:text-dark-muted">{barHeight}px</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Font Size</label>
          <input type="range" min={8} max={32} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full accent-brand-500" />
          <span className="text-xs text-surface-500 dark:text-dark-muted">{fontSize}px</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Bg Color</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
            className="h-8 w-full rounded border border-surface-200 cursor-pointer dark:border-dark-border" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Bar Color</label>
          <input type="color" value={barColor} onChange={(e) => setBarColor(e.target.value)}
            className="h-8 w-full rounded border border-surface-200 cursor-pointer dark:border-dark-border" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={displayValue} onChange={(e) => setDisplayValue(e.target.checked)} className="accent-brand-500" />
          Show text
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={addCheckDigit} onChange={(e) => setAddCheckDigit(e.target.checked)} className="accent-brand-500" />
          Add check digit
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={batchMode} onChange={(e) => setBatchMode(e.target.checked)} className="accent-brand-500" />
          Batch mode
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={generate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Generate</button>
        {!batchMode && input && (
          <>
            <button onClick={() => download("svg")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">SVG</button>
            <button onClick={() => download("png")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">PNG</button>
            <button onClick={() => download("jpeg")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">JPEG</button>
            <button onClick={copyImage} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
              {copied ? "Copied!" : "Copy Image"}
            </button>
          </>
        )}
        <button onClick={clear} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Clear</button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {sizeDisplay && <p className="text-xs text-surface-500 dark:text-dark-muted">{sizeDisplay}</p>}

      {batchMode && batchResults.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {batchResults.map((svgStr, i) => (
            <div key={i} className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">Barcode {i + 1}</p>
              <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: sanitize(svgStr) }} />
            </div>
          ))}
        </div>
      )}

      {!batchMode && input.trim() && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Preview</label>
          <div className="flex justify-center rounded-lg border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface">
            <div ref={svgRef} />
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}
