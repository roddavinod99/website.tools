"use client";

import { useState, useRef, useCallback } from "react";
import { validateFileUpload } from "@/lib/file-security";

interface PdfEntry {
  id: string;
  file: File;
  pageCount: number;
  size: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

async function getPdfPageCount(file: File): Promise<number> {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  return doc.getPageCount();
}

export function PdfMerger() {
  const [entries, setEntries] = useState<PdfEntry[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [merging, setMerging] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [outputPages, setOutputPages] = useState(0);
  const [outputFilename, setOutputFilename] = useState("merged.pdf");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList) => {
    setError("");
    const newEntries: PdfEntry[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (entries.length + newEntries.length >= 20) {
        setError("Maximum 20 PDFs allowed");
        break;
      }
      const validation = await validateFileUpload(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        continue;
      }
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setError(`Skipped ${file.name}: not a PDF`);
        continue;
      }
      try {
        const count = await getPdfPageCount(file);
        newEntries.push({
          id: `${Date.now()}-${i}-${file.name}`,
          file,
          pageCount: count,
          size: file.size,
        });
      } catch {
        setError(`Failed to read ${file.name}: corrupted or encrypted PDF`);
      }
    }
    setEntries((prev) => [...prev, ...newEntries]);
    setOutputUrl(null);
  }, [entries.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setOutputUrl(null);
  };

  const moveEntry = (from: number, to: number) => {
    if (to < 0 || to >= entries.length) return;
    const next = [...entries];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setEntries(next);
    setOutputUrl(null);
  };

  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== idx) {
      moveEntry(dragIndex, idx);
      setDragIndex(idx);
    }
  };

  const clearAll = () => {
    setEntries([]);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);
    setError("");
  };

  const mergePdfs = async () => {
    if (entries.length < 2) {
      setError("Add at least 2 PDFs to merge");
      return;
    }
    setMerging(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      let totalPages = 0;
      for (const entry of entries) {
        const buf = await entry.file.arrayBuffer();
        const src = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
        totalPages += src.getPageCount();
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setOutputSize(blob.size);
      setOutputPages(totalPages);
      setOutputFilename(`merged-${totalPages}pages.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge PDFs");
    } finally {
      setMerging(false);
    }
  };

  const totalPages = entries.reduce((s, e) => s + e.pageCount, 0);
  const totalSize = entries.reduce((s, e) => s + e.size, 0);

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
        aria-label="Upload PDFs to merge"
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
          className="hidden"
        />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm text-surface-600 dark:text-dark-text text-center">
          {entries.length > 0 ? `${entries.length} PDF(s) selected — click or drop more` : "Click or drop PDFs here to merge"}
        </p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted text-center">PDF only · Max 20 files · 10MB per file · 50MB total · 100% local</p>
      </div>

      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

      {entries.length > 0 && (
        <>
          <div className="rounded-md border border-surface-200 dark:border-dark-border p-3 text-xs text-surface-500 dark:text-dark-muted flex flex-wrap gap-4">
            <span>Total: {entries.length} files</span>
            <span>{totalPages} pages</span>
            <span>{formatSize(totalSize)}</span>
          </div>

          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <div
                key={entry.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={() => setDragIndex(null)}
                className={`flex items-center gap-2 rounded-md border p-2.5 ${dragIndex === idx ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-surface-200 dark:border-dark-border bg-white dark:bg-dark-surface"}`}
              >
                <span className="cursor-grab text-surface-400 select-none" aria-hidden="true">⋮⋮</span>
                <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-100 dark:bg-dark-border text-xs font-medium text-surface-600 dark:text-dark-muted shrink-0">{idx + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-surface-800 dark:text-dark-text">{entry.file.name}</p>
                  <p className="text-xs text-surface-400 dark:text-dark-muted">{entry.pageCount} page(s) · {formatSize(entry.size)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => moveEntry(idx, idx - 1)}
                    disabled={idx === 0}
                    className="rounded p-1 text-surface-400 hover:bg-surface-100 disabled:opacity-30 dark:hover:bg-dark-border"
                    aria-label={`Move ${entry.file.name} up`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button
                    onClick={() => moveEntry(idx, idx + 1)}
                    disabled={idx === entries.length - 1}
                    className="rounded p-1 text-surface-400 hover:bg-surface-100 disabled:opacity-30 dark:hover:bg-dark-border"
                    aria-label={`Move ${entry.file.name} down`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="rounded p-1 text-surface-400 hover:text-red-500 dark:hover:bg-dark-border"
                    aria-label={`Remove ${entry.file.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={mergePdfs}
              disabled={merging}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"
            >
              {merging ? "Merging..." : `Merge ${entries.length} PDFs`}
            </button>
            <button
              onClick={clearAll}
              className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              Clear All
            </button>
          </div>
        </>
      )}

      {outputUrl && (
        <div data-testid="tool-output" className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-300">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Merged PDF ready — {outputPages} pages · {formatSize(outputSize)}
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={outputUrl}
              download={outputFilename}
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Download Merged PDF
            </a>
            <button
              onClick={() => { if (outputUrl) { URL.revokeObjectURL(outputUrl); setOutputUrl(null); } }}
              className="rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30 transition-colors"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-green-700 dark:text-green-400">File processed 100% in your browser — never uploaded.</p>
        </div>
      )}
    </div>
  );
}
