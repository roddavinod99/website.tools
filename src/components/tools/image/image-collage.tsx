"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { validateFileUpload } from "@/lib/file-security";
import { randomUUID } from "@/lib/web-crypto";

type Layout = "horizontal" | "vertical" | "grid";
type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

const INPUT_ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_FILES = 20;
const MIN_FILES = 2;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const CELL_SIZE = 260;

const FORMAT_OPTIONS: { value: OutputFormat; label: string; ext: string }[] = [
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

interface CollageEntry {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
}

function readImageFile(file: File): Promise<{ url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ url, width: img.width, height: img.height });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function ImageCollage() {
  const [images, setImages] = useState<CollageEntry[]>([]);
  const [layout, setLayout] = useState<Layout>("grid");
  const [gridCols, setGridCols] = useState(2);
  const [spacing, setSpacing] = useState(8);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [borderRadius, setBorderRadius] = useState(0);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(92);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      setError("");
      const totalSize = images.reduce((s, e) => s + e.file.size, 0);
      const newEntries: CollageEntry[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const validation = await validateFileUpload(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          continue;
        }
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
          setError("Only JPEG, PNG and WebP are supported");
          continue;
        }
        if (images.length + newEntries.length >= MAX_FILES) {
          setError(`Maximum ${MAX_FILES} images allowed`);
          break;
        }
        if (totalSize + newEntries.reduce((s, e) => s + e.file.size, 0) + file.size > MAX_TOTAL_SIZE) {
          setError(`Total size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit`);
          break;
        }
        try {
          const info = await readImageFile(file);
          newEntries.push({
            id: randomUUID(),
            file,
            url: info.url,
            width: info.width,
            height: info.height,
          });
        } catch {
          setError(`Failed to load ${file.name}`);
        }
      }
      if (newEntries.length > 0) {
        setImages((prev) => [...prev, ...newEntries]);
      }
    },
    [images]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
      if (fileRef.current) fileRef.current.value = "";
    },
    [handleFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const move = useCallback((id: string, direction: number) => {
    setImages((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[idx];
      copy[idx] = copy[nextIdx];
      copy[nextIdx] = tmp;
      return copy;
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) URL.revokeObjectURL(entry.url);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    images.forEach((e) => URL.revokeObjectURL(e.url));
    setImages([]);
    setError("");
  }, [images]);

  const handleReorderDrop = useCallback(
    (targetId: string) => {
      if (dragIndex === null) return;
      setImages((prev) => {
        const dragged = prev[dragIndex];
        if (!dragged) return prev;
        const targetIdx = prev.findIndex((f) => f.id === targetId);
        if (targetIdx === -1 || targetIdx === dragIndex) return prev;
        const copy = [...prev];
        copy.splice(dragIndex, 1);
        copy.splice(targetIdx, 0, dragged);
        return copy;
      });
      setDragIndex(null);
    },
    [dragIndex]
  );

  const renderCollage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const n = images.length;
    const sp = Math.max(0, Math.min(40, spacing));
    const radius = Math.max(0, Math.min(20, borderRadius));
    const cols = layout === "grid" ? Math.max(2, Math.min(4, gridCols)) : layout === "horizontal" ? n : 1;
    const rows = layout === "grid" ? Math.ceil(n / cols) : layout === "vertical" ? n : 1;

    let canvasW: number;
    let canvasH: number;
    if (layout === "horizontal") {
      canvasW = n * CELL_SIZE + sp * (n + 1);
      canvasH = CELL_SIZE + sp * 2;
    } else if (layout === "vertical") {
      canvasW = CELL_SIZE + sp * 2;
      canvasH = n * CELL_SIZE + sp * (n + 1);
    } else {
      canvasW = cols * CELL_SIZE + sp * (cols + 1);
      canvasH = rows * CELL_SIZE + sp * (rows + 1);
    }
    canvasW = Math.max(1, canvasW);
    canvasH = Math.max(1, canvasH);
    canvas.width = canvasW;
    canvas.height = canvasH;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    const loaded = await Promise.all(
      images.map(async (entry) => {
        try {
          const img = await loadImage(entry.url);
          return { entry, img };
        } catch {
          return { entry, img: null as unknown as HTMLImageElement };
        }
      })
    );

    for (let i = 0; i < loaded.length; i++) {
      const { img } = loaded[i];
      if (!img) continue;
      let col: number;
      let row: number;
      if (layout === "horizontal") {
        col = i;
        row = 0;
      } else if (layout === "vertical") {
        col = 0;
        row = i;
      } else {
        col = i % cols;
        row = Math.floor(i / cols);
      }
      const cellX = sp + col * (CELL_SIZE + sp);
      const cellY = sp + row * (CELL_SIZE + sp);
      const cellW = CELL_SIZE;
      const cellH = CELL_SIZE;

      // scale image to fit cell with contain
      const ratio = Math.min(cellW / img.width, cellH / img.height);
      const drawW = Math.round(img.width * ratio);
      const drawH = Math.round(img.height * ratio);
      const offsetX = cellX + Math.round((cellW - drawW) / 2);
      const offsetY = cellY + Math.round((cellH - drawH) / 2);

      ctx.save();
      if (radius > 0) {
        // rounded rect clip per cell
        const r = Math.min(radius, cellW / 2, cellH / 2);
        ctx.beginPath();
        // manual rounded rect for compatibility
        ctx.moveTo(cellX + r, cellY);
        ctx.lineTo(cellX + cellW - r, cellY);
        ctx.quadraticCurveTo(cellX + cellW, cellY, cellX + cellW, cellY + r);
        ctx.lineTo(cellX + cellW, cellY + cellH - r);
        ctx.quadraticCurveTo(cellX + cellW, cellY + cellH, cellX + cellW - r, cellY + cellH);
        ctx.lineTo(cellX + r, cellY + cellH);
        ctx.quadraticCurveTo(cellX, cellY + cellH, cellX, cellY + cellH - r);
        ctx.lineTo(cellX, cellY + r);
        ctx.quadraticCurveTo(cellX, cellY, cellX + r, cellY);
        ctx.closePath();
        ctx.clip();
        // fill cell background (white) to show radius nicely if spacing has color
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cellX, cellY, cellW, cellH);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cellX, cellY, cellW, cellH);
      }
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    }
  }, [images, layout, gridCols, spacing, bgColor, borderRadius]);

  useEffect(() => {
    renderCollage();
  }, [renderCollage]);

  useEffect(() => {
    return () => {
      images.forEach((e) => URL.revokeObjectURL(e.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || images.length < MIN_FILES) {
      setError(`Add at least ${MIN_FILES} images to export`);
      return;
    }
    await renderCollage();
    const q = format === "image/png" ? undefined : quality / 100;
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), format, q));
    if (!blob) {
      setError("Failed to generate collage");
      return;
    }
    const ext = FORMAT_OPTIONS.find((f) => f.value === format)?.ext || "jpg";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `collage.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [images.length, format, quality, renderCollage]);

  const hasEnough = images.length >= MIN_FILES;

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images for collage, click or drop JPEG PNG WebP here, 2 to 20 images"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
          dragging ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-surface-200 bg-white hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface"
        }`}
      >
        <input ref={fileRef} type="file" accept={INPUT_ACCEPT} multiple onChange={handleFileInput} className="hidden" aria-label="Choose images for collage" />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-surface-500 dark:text-dark-muted">{images.length > 0 ? `${images.length} image(s) selected — click or drop to add more` : "Click or drop 2–20 images here"}</p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">JPEG, PNG, WebP · Max {MAX_FILES} files · {MAX_TOTAL_SIZE / (1024 * 1024)}MB total · 100% local</p>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <>
          <div className="grid gap-3 rounded-md border border-surface-200 p-3 dark:border-dark-border sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted">Layout</label>
              <select value={layout} onChange={(e) => setLayout(e.target.value as Layout)} aria-label="Collage layout" className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
                <option value="grid">Grid</option>
              </select>
              {layout === "grid" && <p className="mt-1 text-[10px] text-surface-400 dark:text-dark-muted">Rows = ceil(n / cols)</p>}
            </div>
            {layout === "grid" && (
              <div>
                <label htmlFor="collage-cols" className="block text-xs font-medium text-surface-500 dark:text-dark-muted">
                  Columns: {gridCols}
                </label>
                <select id="collage-cols" value={gridCols} onChange={(e) => setGridCols(parseInt(e.target.value))} aria-label="Grid columns 2 to 4" className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                  <option value={2}>2 columns</option>
                  <option value={3}>3 columns</option>
                  <option value={4}>4 columns</option>
                </select>
              </div>
            )}
            <div>
              <label htmlFor="collage-spacing" className="block text-xs font-medium text-surface-500 dark:text-dark-muted">
                Spacing: {spacing}px
              </label>
              <input id="collage-spacing" type="range" min={0} max={40} value={spacing} onChange={(e) => setSpacing(parseInt(e.target.value))} aria-label="Spacing 0 to 40 pixels" className="mt-1 w-full accent-brand-500" />
              <input type="number" min={0} max={40} value={spacing} onChange={(e) => setSpacing(Math.min(40, Math.max(0, parseInt(e.target.value) || 0)))} aria-label="Spacing number" className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            </div>
            <div>
              <label htmlFor="collage-bg" className="block text-xs font-medium text-surface-500 dark:text-dark-muted">
                Background
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input id="collage-bg" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} aria-label="Background color" className="h-8 w-14 rounded-md border border-surface-200 bg-white p-1 dark:border-dark-border dark:bg-dark-surface" />
                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} aria-label="Background color hex" placeholder="#ffffff" className="flex-1 rounded-md border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
              </div>
            </div>
            <div>
              <label htmlFor="collage-radius" className="block text-xs font-medium text-surface-500 dark:text-dark-muted">
                Border radius: {borderRadius}px
              </label>
              <input id="collage-radius" type="range" min={0} max={20} value={borderRadius} onChange={(e) => setBorderRadius(parseInt(e.target.value))} aria-label="Border radius 0 to 20" className="mt-1 w-full accent-brand-500" />
              <input type="number" min={0} max={20} value={borderRadius} onChange={(e) => setBorderRadius(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))} aria-label="Border radius number" className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            </div>
            <div>
              <label htmlFor="collage-format" className="block text-xs font-medium text-surface-500 dark:text-dark-muted">
                Output format
              </label>
              <select id="collage-format" value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)} aria-label="Output format" className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            {(format === "image/jpeg" || format === "image/webp") && (
              <div>
                <label htmlFor="collage-quality" className="block text-xs font-medium text-surface-500 dark:text-dark-muted">
                  Quality: {quality}%
                </label>
                <input id="collage-quality" type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} aria-label="Output quality" className="mt-1 w-full accent-brand-500" />
              </div>
            )}
            {format === "image/png" && <p className="self-end text-xs text-surface-400 dark:text-dark-muted">PNG is lossless (quality ignored)</p>}
          </div>

          <div className="space-y-3 rounded-md border border-surface-200 p-3 dark:border-dark-border">
            <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">Preview</h3>
            <p className="text-xs text-surface-400 dark:text-dark-muted">Canvas composite: each image scaled with drawImage to fit cell, grid rows = ceil(n / cols), spacing {spacing}px, background {bgColor}, radius {borderRadius}px.</p>
            <div data-testid="tool-output" className="overflow-auto rounded border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface">
              <canvas ref={canvasRef} aria-label="Collage preview" className="mx-auto block max-w-full rounded object-contain" />
            </div>
            {!hasEnough && <p className="text-xs text-amber-600 dark:text-amber-400">Add at least {MIN_FILES} images to enable download.</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleDownload} disabled={!hasEnough} aria-label="Download collage" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Download as {FORMAT_OPTIONS.find((f) => f.value === format)?.label}
              </button>
              <button type="button" onClick={clearAll} aria-label="Clear all images" className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Clear all
              </button>
            </div>
            <p className="text-xs text-surface-400 dark:text-dark-muted">All processing is 100% local via canvas. No Date.now() in render, no setState in useMemo.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">Images — drag to reorder or use move buttons</h3>
            <p className="text-xs text-surface-400 dark:text-dark-muted">Upload 2–20 images. New entries via newEntries logic. Use drag or Up/Down to reorder. Canvas draws each image scaled to fit cell with drawImage.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((entry, idx) => (
                <div
                  key={entry.id}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleReorderDrop(entry.id)}
                  onDragEnd={() => setDragIndex(null)}
                  className={`rounded-md border p-2 ${dragIndex === idx ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10" : "border-surface-200 dark:border-dark-border"}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium text-surface-700 dark:text-dark-text">
                      {idx + 1}. {entry.file.name}
                    </span>
                    <span className="shrink-0 text-[10px] text-surface-400">{formatSize(entry.file.size)}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={entry.url} alt={`Collage source ${idx + 1}`} className="h-24 w-full rounded border border-surface-200 object-contain dark:border-dark-border" style={{ borderRadius: borderRadius ? `${Math.min(borderRadius, 8)}px` : undefined }} />
                  <p className="mt-1 text-[10px] text-surface-400 dark:text-dark-muted">
                    {entry.width}×{entry.height}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <button type="button" onClick={() => move(entry.id, -1)} disabled={idx === 0} aria-label={`Move ${entry.file.name} up`} className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">
                      Up
                    </button>
                    <button type="button" onClick={() => move(entry.id, 1)} disabled={idx === images.length - 1} aria-label={`Move ${entry.file.name} down`} className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">
                      Down
                    </button>
                    <button type="button" onClick={() => removeImage(entry.id)} aria-label={`Remove ${entry.file.name}`} className="ml-auto rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
