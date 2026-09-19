"use client";

import { useState, useRef, useCallback } from "react";
import { validateFileUpload } from "@/lib/file-security";
import { buildZip } from "@/lib/image-utils";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

interface PagePreview {
  index: number;
  url: string;
  blob: Blob;
  size: number;
}

export function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const createPlaceholderJpg = (pageNum: number, total: number, filename: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const w = 800;
      const h = 1120;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, w - 8, h - 8);
      ctx.fillStyle = "#111827";
      ctx.font = "bold 32px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Page ${pageNum} of ${total}`, w / 2, 120);
      ctx.fillStyle = "#6b7280";
      ctx.font = "14px ui-sans-serif, system-ui, sans-serif";
      const shortName = filename.length > 40 ? filename.slice(0, 37) + "..." : filename;
      ctx.fillText(shortName, w / 2, 160);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Placeholder preview — true rasterization requires pdfjs-dist.", w / 2, 190);
      ctx.fillText("Install pdfjs-dist to render actual PDF content to canvas.", w / 2, 210);
      // decorative lines mimicking text
      ctx.fillStyle = "#e5e7eb";
      for (let y = 260; y < h - 80; y += 22) {
        const lineW = w - 80 - ((y / 22) % 3) * 40;
        ctx.fillRect(40, y, lineW, 10);
      }
      ctx.fillStyle = "#9ca3af";
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Download ZIP to get all placeholder JPGs.", w / 2, h - 30);
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Failed to create JPG"));
        else resolve(blob);
      }, "image/jpeg", 0.85);
    });
  };

  const handleFile = useCallback(async (f: File) => {
    setError("");
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setZipUrl(null);
    setZipSize(0);
    setPreviews([]);
    const validation = await validateFileUpload(f);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file");
      return;
    }
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setFile(f);
      setPageCount(count);
      setOriginalSize(f.size);
      // Create placeholder JPGs for each page
      const next: PagePreview[] = [];
      for (let i = 1; i <= count; i++) {
        const blob = await createPlaceholderJpg(i, count, f.name);
        const url = URL.createObjectURL(blob);
        next.push({ index: i, url, blob, size: blob.size });
      }
      setPreviews(next);
      // Auto-build ZIP when multiple pages
      if (next.length > 1) {
        const files = await Promise.all(next.map(async (p) => ({
          name: `${f.name.replace(/\.pdf$/i, "")}-page-${p.index}.jpg`,
          data: new Uint8Array(await p.blob.arrayBuffer()),
        })));
        const zip = await buildZip(files);
        const zUrl = URL.createObjectURL(zip);
        setZipUrl(zUrl);
        setZipSize(zip.size);
      }
    } catch {
      setError("Failed to read PDF — file may be corrupted or encrypted");
    } finally {
      setProcessing(false);
    }
  }, [zipUrl, previews]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const downloadSingle = (p: PagePreview) => {
    if (!file) return;
    const a = document.createElement("a");
    a.href = p.url;
    a.download = `${file.name.replace(/\.pdf$/i, "")}-page-${p.index}.jpg`;
    a.click();
  };

  const downloadZip = () => {
    if (!zipUrl || !file) return;
    const a = document.createElement("a");
    a.href = zipUrl;
    a.download = `${file.name.replace(/\.pdf$/i, "")}-pages.zip`;
    a.click();
  };

  const downloadAllAsZip = async () => {
    if (!file || previews.length === 0) return;
    const files = await Promise.all(previews.map(async (p) => ({
      name: `${file.name.replace(/\.pdf$/i, "")}-page-${p.index}.jpg`,
      data: new Uint8Array(await p.blob.arrayBuffer()),
    })));
    const zip = await buildZip(files);
    const url = URL.createObjectURL(zip);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.pdf$/i, "")}-pages.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const clearAll = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setFile(null);
    setPageCount(0);
    setOriginalSize(0);
    setPreviews([]);
    setZipUrl(null);
    setZipSize(0);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const totalJpgSize = previews.reduce((s, p) => s + p.size, 0);

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
        aria-label="Upload PDF to convert to JPG"
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          className="hidden"
        />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-surface-600 dark:text-dark-text text-center">
          {file ? `${file.name} — ${pageCount} page(s) · ${formatSize(originalSize)}` : "Click or drop a PDF to convert to JPG"}
        </p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted text-center">PDF only · 10MB max · 100% local · placeholder JPGs (no pdfjs-dist needed)</p>
      </div>

      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      {processing && <p className="text-sm text-surface-500 dark:text-dark-muted">Reading PDF and generating previews…</p>}

      {file && pageCount > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            PDF to JPG requires <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">pdfjs-dist</code> for true rasterization — preview as PDF placeholder below. Each page is a white canvas with &quot;Page N of M&quot; rendered as JPEG. Replace the canvas fallback with a <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">pdfjs-dist</code> dynamic import to rasterize real content when the dependency is added.
          </p>
        </div>
      )}

      {previews.length > 0 && (
        <div data-testid="tool-output" className="space-y-3 rounded-md border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex flex-wrap gap-2 text-xs text-surface-500 dark:text-dark-muted">
            <span>{pageCount} page(s)</span>
            <span>{formatSize(originalSize)} PDF</span>
            <span>→ {formatSize(totalJpgSize)} JPG placeholders</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((p) => (
              <div key={p.index} className="rounded-md border border-surface-200 dark:border-dark-border p-2 bg-white dark:bg-dark-surface">
                <p className="mb-1 text-xs font-medium text-surface-700 dark:text-dark-text">Page {p.index} of {pageCount} · {formatSize(p.size)}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`Page ${p.index} preview`} className="w-full rounded border border-surface-200 dark:border-dark-border object-contain" />
                <button
                  onClick={() => downloadSingle(p)}
                  className="mt-2 w-full rounded-md border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
                >
                  Download page {p.index}.jpg
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {previews.length > 1 && zipUrl ? (
              <button
                onClick={downloadZip}
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Download ZIP ({pageCount} JPGs · {formatSize(zipSize)})
              </button>
            ) : previews.length > 1 ? (
              <button
                onClick={downloadAllAsZip}
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Download ZIP ({pageCount} JPGs)
              </button>
            ) : null}
            <button
              onClick={clearAll}
              className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-surface-400 dark:text-dark-muted">Placeholders are JPEGs rendered on a canvas — to rasterize real PDF content, add <code className="rounded bg-surface-100 px-1 dark:bg-dark-border">pdfjs-dist</code> and replace <code className="rounded bg-surface-100 px-1 dark:bg-dark-border">createPlaceholderJpg</code> with a pdfjs page render.</p>
        </div>
      )}
    </div>
  );
}
