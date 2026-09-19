"use client";

import { useState, useRef, useCallback } from "react";
import { validateFileUpload } from "@/lib/file-security";

interface ImageEntry {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
}

type PageSize = "a4" | "letter" | "fit";
type Orientation = "portrait" | "landscape";
type Margin = "none" | "small" | "medium";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function readImage(file: File): Promise<{ url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ url, width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
}

const PAGE_SIZES: Record<PageSize, { label: string; w: number; h: number }> = {
  a4: { label: "A4", w: 595.28, h: 841.89 },
  letter: { label: "Letter", w: 612, h: 792 },
  fit: { label: "Fit image", w: 0, h: 0 },
};

const MARGINS: Record<Margin, number> = { none: 0, small: 18, medium: 36 };

export function ImageToPdf() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<Margin>("small");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList) => {
    setError("");
    const newEntries: ImageEntry[] = [];
    const totalExisting = images.length;
    for (let i = 0; i < fileList.length; i++) {
      if (totalExisting + newEntries.length >= 30) {
        setError("Maximum 30 images allowed");
        break;
      }
      const file = fileList[i];
      const validation = await validateFileUpload(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        continue;
      }
      if (!file.type.match(/^image\/(jpeg|png|webp|gif|bmp)$/)) {
        setError(`Skipped ${file.name}: unsupported image type`);
        continue;
      }
      try {
        const info = await readImage(file);
        newEntries.push({ id: `${Date.now()}-${i}-${file.name}`, file, url: info.url, width: info.width, height: info.height });
      } catch {
        setError(`Failed to read ${file.name}`);
      }
    }
    setImages((prev) => [...prev, ...newEntries]);
    setOutputUrl(null);
  }, [images.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((e) => e.id !== id));
    setOutputUrl(null);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setImages(next);
    setOutputUrl(null);
  };

  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== idx) {
      moveImage(dragIndex, idx);
      setDragIndex(idx);
    }
  };

  const clearAll = () => {
    images.forEach((e) => URL.revokeObjectURL(e.url));
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setImages([]);
    setOutputUrl(null);
    setError("");
  };

  const generatePdf = async () => {
    if (images.length === 0) {
      setError("Add at least one image");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const marginPt = MARGINS[margin];

      for (const entry of images) {
        const bytes = await entry.file.arrayBuffer();
        let embedded: Awaited<ReturnType<typeof pdf.embedJpg>> | Awaited<ReturnType<typeof pdf.embedPng>>;
        const isPng = entry.file.type === "image/png";
        // WebP/GIF/BMP need canvas conversion to PNG first
        if (isPng) {
          embedded = await pdf.embedPng(bytes);
        } else if (entry.file.type === "image/jpeg") {
          try {
            embedded = await pdf.embedJpg(bytes);
          } catch {
            // fallback via canvas
            const canvas = document.createElement("canvas");
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = reject;
              img.src = entry.url;
            });
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
            if (!blob) throw new Error("Failed to convert image");
            const pngBytes = await blob.arrayBuffer();
            embedded = await pdf.embedPng(pngBytes);
          }
        } else {
          // Convert webp/gif/bmp via canvas to PNG
          const canvas = document.createElement("canvas");
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = entry.url;
          });
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
          if (!blob) throw new Error("Failed to convert image");
          const pngBytes = await blob.arrayBuffer();
          embedded = await pdf.embedPng(pngBytes);
        }

        const imgW = embedded.width;
        const imgH = embedded.height;

        let pageW: number;
        let pageH: number;
        if (pageSize === "fit") {
          pageW = imgW + marginPt * 2;
          pageH = imgH + marginPt * 2;
        } else {
          const base = PAGE_SIZES[pageSize];
          if (orientation === "landscape") {
            pageW = Math.max(base.w, base.h);
            pageH = Math.min(base.w, base.h);
          } else {
            pageW = Math.min(base.w, base.h);
            pageH = Math.max(base.w, base.h);
          }
        }

        const page = pdf.addPage([pageW, pageH]);
        const availW = pageW - marginPt * 2;
        const availH = pageH - marginPt * 2;
        const scale = Math.min(availW / imgW, availH / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const x = (pageW - drawW) / 2;
        const y = (pageH - drawH) / 2;
        page.drawImage(embedded, { x, y, width: drawW, height: drawH });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setOutputSize(blob.size);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setProcessing(false);
    }
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
        aria-label="Upload images to convert to PDF"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          multiple
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
          className="hidden"
        />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-surface-600 dark:text-dark-text text-center">
          {images.length > 0 ? `${images.length} image(s) — click or drop more` : "Click or drop images here"}
        </p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted text-center">JPG, PNG, WebP, GIF, BMP · Max 30 images · 10MB per file · 100% local</p>
      </div>

      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

      {images.length > 0 && (
        <>
          <div className="flex flex-wrap gap-3 rounded-md border border-surface-200 dark:border-dark-border p-3">
            <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted">
              Page size
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value as PageSize)} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="fit">Fit image</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted">
              Orientation
              <select value={orientation} onChange={(e) => setOrientation(e.target.value as Orientation)} disabled={pageSize === "fit"} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text disabled:opacity-40">
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted">
              Margin
              <select value={margin} onChange={(e) => setMargin(e.target.value as Margin)} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((entry, idx) => (
              <div
                key={entry.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={() => setDragIndex(null)}
                className={`rounded-md border p-2 ${dragIndex === idx ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-surface-200 dark:border-dark-border bg-white dark:bg-dark-surface"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-surface-100 dark:bg-dark-border text-xs font-medium text-surface-600 dark:text-dark-muted shrink-0">{idx + 1}</span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => moveImage(idx, idx - 1)} disabled={idx === 0} className="rounded p-1 text-surface-400 hover:bg-surface-100 disabled:opacity-30 dark:hover:bg-dark-border" aria-label={`Move ${entry.file.name} up`}>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => moveImage(idx, idx + 1)} disabled={idx === images.length - 1} className="rounded p-1 text-surface-400 hover:bg-surface-100 disabled:opacity-30 dark:hover:bg-dark-border" aria-label={`Move ${entry.file.name} down`}>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button onClick={() => removeImage(entry.id)} className="rounded p-1 text-surface-400 hover:text-red-500 dark:hover:bg-dark-border" aria-label={`Remove ${entry.file.name}`}>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.url} alt={entry.file.name} className="h-28 w-full rounded border border-surface-200 object-contain dark:border-dark-border mb-1" />
                <p className="truncate text-xs font-medium text-surface-700 dark:text-dark-text">{entry.file.name}</p>
                <p className="text-xs text-surface-400 dark:text-dark-muted">{entry.width}×{entry.height} · {formatSize(entry.file.size)}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={generatePdf}
              disabled={processing}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"
            >
              {processing ? "Generating..." : `Convert ${images.length} image(s) to PDF`}
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
            PDF ready — {images.length} page(s) · {formatSize(outputSize)} · {PAGE_SIZES[pageSize].label} {pageSize !== "fit" ? `· ${orientation}` : ""}
          </div>
          <a
            href={outputUrl}
            download="images.pdf"
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            Download PDF
          </a>
          <p className="text-xs text-green-700 dark:text-green-400">Created entirely in your browser — images never uploaded.</p>
        </div>
      )}
    </div>
  );
}
