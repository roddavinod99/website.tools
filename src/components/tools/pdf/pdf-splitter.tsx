"use client";

import { useState, useRef, useCallback } from "react";
import { validateFileUpload } from "@/lib/file-security";
import { buildZip } from "@/lib/image-utils";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function parseRange(input: string, maxPage: number): number[] | null {
  const raw = input.trim();
  if (!raw) return null;
  const pages = new Set<number>();
  const parts = raw.split(",");
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes("-")) {
      const [a, b] = p.split("-").map((x) => parseInt(x.trim(), 10));
      if (Number.isNaN(a) || Number.isNaN(b) || a < 1 || b < 1 || a > maxPage || b > maxPage) return null;
      const from = Math.min(a, b);
      const to = Math.max(a, b);
      for (let i = from; i <= to; i++) pages.add(i);
    } else {
      const n = parseInt(p, 10);
      if (Number.isNaN(n) || n < 1 || n > maxPage) return null;
      pages.add(n);
    }
  }
  if (pages.size === 0) return null;
  return Array.from(pages).sort((a, b) => a - b);
}

export function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rangeInput, setRangeInput] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputPages, setOutputPages] = useState<number[]>([]);
  const [outputSize, setOutputSize] = useState(0);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setError("");
    setOutputUrl(null);
    setZipUrl(null);
    const validation = await validateFileUpload(f);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file");
      return;
    }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setFile(f);
      setPageCount(count);
      setRangeInput(`1-${count}`);
    } catch {
      setError("Failed to read PDF — file may be corrupted or encrypted");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const extractRange = async () => {
    if (!file) {
      setError("Please upload a PDF first");
      return;
    }
    const pages = parseRange(rangeInput, pageCount);
    if (!pages) {
      setError(`Invalid range. Use format like "1-3,5,7" (1-${pageCount})`);
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const buf = await file.arrayBuffer();
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p - 1));
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setOutputPages(pages);
      setOutputSize(blob.size);
      setZipUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract pages");
    } finally {
      setProcessing(false);
    }
  };

  const splitAllBurst = async () => {
    if (!file) {
      setError("Please upload a PDF first");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const buf = await file.arrayBuffer();
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      const count = src.getPageCount();
      const files: { name: string; data: Uint8Array }[] = [];
      const baseName = file.name.replace(/\.pdf$/i, "");
      for (let i = 0; i < count; i++) {
        const out = await PDFDocument.create();
        const [copied] = await out.copyPages(src, [i]);
        out.addPage(copied);
        const bytes = await out.save();
        files.push({ name: `${baseName}-page-${i + 1}.pdf`, data: bytes });
      }
      const zip = await buildZip(files);
      if (zipUrl) URL.revokeObjectURL(zipUrl);
      const url = URL.createObjectURL(zip);
      setZipUrl(url);
      setZipSize(zip.size);
      setOutputUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split PDF");
    } finally {
      setProcessing(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPageCount(0);
    setRangeInput("");
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setOutputUrl(null);
    setZipUrl(null);
    setError("");
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-surface-200 bg-white p-6 hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
        aria-label="Upload PDF to split"
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          className="hidden"
        />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-7 7m7-7l-7-7" />
        </svg>
        <p className="text-sm text-surface-600 dark:text-dark-text text-center">
          {file ? `${file.name} — ${pageCount} page(s)` : "Click or drop a PDF to split"}
        </p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted text-center">PDF only · 10MB max · 100% local</p>
      </div>

      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

      {file && pageCount > 0 && (
        <>
          <div className="rounded-md border border-surface-200 dark:border-dark-border p-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">
                Pages to extract (1-{pageCount})
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder={`e.g. 1-3,5 or 1-${pageCount}`}
                className="w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                aria-label="Page range to extract"
              />
              <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">Supports ranges: <code>1-3</code>, single pages: <code>5</code>, combos: <code>1-3,5,7-9</code></p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={extractRange}
                disabled={processing}
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"
              >
                {processing ? "Processing..." : "Extract Pages"}
              </button>
              <button
                onClick={splitAllBurst}
                disabled={processing}
                className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
              >
                Split All Pages (ZIP)
              </button>
              <button
                onClick={clearAll}
                className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </>
      )}

      {outputUrl && (
        <div data-testid="tool-output" className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-300">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Extracted {outputPages.length} page(s): {outputPages.join(", ")} · {formatSize(outputSize)}
          </div>
          <a
            href={outputUrl}
            download={`${file?.name.replace(/\.pdf$/i, "") || "extracted"}-pages-${outputPages.join("-")}.pdf`}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            Download Extracted PDF
          </a>
          <p className="text-xs text-green-700 dark:text-green-400">Processed locally — file never left your browser.</p>
        </div>
      )}

      {zipUrl && (
        <div data-testid="tool-output" className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-300">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Split into {pageCount} PDFs · ZIP {formatSize(zipSize)}
          </div>
          <a
            href={zipUrl}
            download={`${file?.name.replace(/\.pdf$/i, "") || "split"}-all-pages.zip`}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            Download ZIP (all pages)
          </a>
        </div>
      )}
    </div>
  );
}
