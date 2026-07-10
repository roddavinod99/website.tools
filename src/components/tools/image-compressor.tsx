"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type ImageFormat = "image/jpeg" | "image/png" | "image/webp" | "image/avif";
type FitMode = "fit" | "contain" | "cover";
type QualityPreset = { label: string; value: number };

const QUALITY_PRESETS: QualityPreset[] = [
  { label: "Maximum", value: 100 },
  { label: "High", value: 85 },
  { label: "Medium", value: 65 },
  { label: "Low", value: 40 },
];

const FORMAT_OPTIONS: { value: ImageFormat; label: string; ext: string }[] = [
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
  { value: "image/avif", label: "AVIF", ext: "avif" },
];

const INPUT_ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

interface ImageEntry {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  fileType: string;
  compressedUrl?: string;
  compressedSize?: number;
  compressedWidth?: number;
  compressedHeight?: number;
  processing: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getFileTypeLabel(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WebP",
    "image/avif": "AVIF",
    "image/gif": "GIF",
    "image/bmp": "BMP",
    "image/tiff": "TIFF",
    "image/svg+xml": "SVG",
  };
  return map[mime] || mime.split("/")[1]?.toUpperCase() || "Unknown";
}

function readImageFile(file: File): Promise<{ url: string; width: number; height: number; bitDepth: number; colorSpace: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, 1, 1);
      const bitDepth = imageData.data.length === 4 ? 32 : 24;
      const colorSpace = "sRGB";
      resolve({ url, width: img.width, height: img.height, bitDepth, colorSpace });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function ImageCompressor() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [quality, setQuality] = useState(85);
  const [format, setFormat] = useState<ImageFormat>("image/webp");
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [fitMode, setFitMode] = useState<FitMode>("fit");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [preset, setPreset] = useState<string>("custom");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback(async (fileList: FileList) => {
    setError("");
    const totalSize = images.reduce((s, i) => s + i.file.size, 0);
    const newEntries: ImageEntry[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) continue;
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        setError("Total size exceeds 50MB limit");
        break;
      }
      const info = await readImageFile(file);
      newEntries.push({
        id: crypto.randomUUID(),
        file,
        originalUrl: info.url,
        originalSize: file.size,
        originalWidth: info.width,
        originalHeight: info.height,
        fileType: file.type,
        processing: false,
      });
    }
    setImages((prev) => [...prev, ...newEntries]);
  }, [images]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
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

  const compressImage = useCallback(
    async (entry: ImageEntry): Promise<ImageEntry> => {
      const canvas = canvasRef.current;
      if (!canvas) return entry;
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = entry.originalUrl;
      });
      let w = img.width;
      let h = img.height;
      if (maintainAspect) {
        if (maxWidth > 0 && w > maxWidth) {
          h = Math.round(h * (maxWidth / w));
          w = maxWidth;
        }
        if (maxHeight > 0 && h > maxHeight) {
          w = Math.round(w * (maxHeight / h));
          h = maxHeight;
        }
      } else {
        if (maxWidth > 0) w = maxWidth;
        if (maxHeight > 0) h = maxHeight;
      }
      if (fitMode === "cover" && maxWidth > 0 && maxHeight > 0) {
        const ratio = Math.max(maxWidth / w, maxHeight / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      if (fitMode === "contain" && maxWidth > 0 && maxHeight > 0) {
        const ratio = Math.min(maxWidth / w, maxHeight / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      w = Math.max(1, w);
      h = Math.max(1, h);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b),
          format,
          format === "image/png" ? undefined : quality / 100
        );
      });
      if (!blob) return entry;
      return {
        ...entry,
        compressedUrl: URL.createObjectURL(blob),
        compressedSize: blob.size,
        compressedWidth: w,
        compressedHeight: h,
        processing: false,
      };
    },
    [quality, format, maxWidth, maxHeight, fitMode, maintainAspect]
  );

  const compressAll = useCallback(async () => {
    setImages((prev) => prev.map((img) => ({ ...img, processing: true })));
    const results = await Promise.all(
      images.map((entry) => compressImage(entry))
    );
    setImages(results);
  }, [images, compressImage]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
    });
    setImages([]);
  }, [images]);

  const downloadImage = useCallback((entry: ImageEntry) => {
    if (!entry.compressedUrl) return;
    const link = document.createElement("a");
    const baseName = entry.file.name.replace(/\.[^.]+$/, "");
    const ext = FORMAT_OPTIONS.find((f) => f.value === format)?.ext || "webp";
    link.download = `${baseName}-compressed.${ext}`;
    link.href = entry.compressedUrl;
    link.click();
  }, [format]);

  const downloadAll = useCallback(() => {
    images.forEach((entry) => {
      if (entry.compressedUrl) {
        setTimeout(() => downloadImage(entry), 100 * images.indexOf(entry));
      }
    });
  }, [images, downloadImage]);

  const applyPreset = useCallback((p: string) => {
    setPreset(p);
    if (p === "custom") return;
    const found = QUALITY_PRESETS.find((q) => q.label.toLowerCase() === p);
    if (found) setQuality(found.value);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        compressAll();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [compressAll]);

  const hasCompressed = images.some((img) => img.compressedUrl);
  const totalOriginal = images.reduce((s, img) => s + img.originalSize, 0);
  const totalCompressed = images.reduce(
    (s, img) => s + (img.compressedSize || 0),
    0
  );
  const totalReduction =
    totalOriginal > 0
      ? Math.round((1 - totalCompressed / totalOriginal) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-surface-200 bg-white hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept={INPUT_ACCEPT}
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-surface-500 dark:text-dark-muted">
          {images.length > 0
            ? `${images.length} image(s) selected — click or drop more`
            : "Click or drop images here"}
        </p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">
          Supports JPEG, PNG, WebP &middot; 50MB total limit
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {images.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex items-center gap-2">
              <label className="text-xs text-surface-500 dark:text-dark-muted">Preset:</label>
              <select
                value={preset}
                onChange={(e) => applyPreset(e.target.value)}
                className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              >
                <option value="custom">Custom</option>
                {QUALITY_PRESETS.map((q) => (
                  <option key={q.label.toLowerCase()} value={q.label.toLowerCase()}>
                    {q.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-surface-500 dark:text-dark-muted">Quality: {quality}%</label>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => {
                  setQuality(parseInt(e.target.value));
                  setPreset("custom");
                }}
                className="w-24 accent-brand-500"
              />
            </div>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ImageFormat)}
              className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
            >
              {FORMAT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <details className="rounded-lg border border-surface-200 dark:border-dark-border">
            <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">
              Resize Options
            </summary>
            <div className="flex flex-wrap items-center gap-4 border-t border-surface-200 p-3 dark:border-dark-border">
              <div>
                <label className="block text-xs text-surface-500 dark:text-dark-muted">Max Width (0 = auto)</label>
                <input
                  type="number"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-20 rounded-lg border border-surface-200 bg-white px-2 py-1 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 dark:text-dark-muted">Max Height (0 = auto)</label>
                <input
                  type="number"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-20 rounded-lg border border-surface-200 bg-white px-2 py-1 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 dark:text-dark-muted">Fit Mode</label>
                <select
                  value={fitMode}
                  onChange={(e) => setFitMode(e.target.value as FitMode)}
                  className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                >
                  <option value="fit">Fit</option>
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                </select>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
                <input
                  type="checkbox"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                  className="accent-brand-500"
                />
                Maintain aspect ratio
              </label>
            </div>
          </details>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={compressAll}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            >
              Compress {images.length > 1 ? `All (${images.length})` : ""}
            </button>
            {hasCompressed && (
              <>
                <button
                  onClick={downloadAll}
                  className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
                >
                  Download All
                </button>
              </>
            )}
            <button
              onClick={clearAll}
              className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              Clear All
            </button>
          </div>

          {totalOriginal > 0 && hasCompressed && (
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
              Total: {formatSize(totalOriginal)} → {formatSize(totalCompressed)} ({totalReduction}% reduction)
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-surface-200 p-3 dark:border-dark-border"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="truncate text-xs font-medium text-surface-700 dark:text-dark-text">
                    {entry.file.name}
                  </span>
                  <button
                    onClick={() => removeImage(entry.id)}
                    className="text-surface-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-2 grid grid-cols-2 gap-1 text-xs text-surface-500 dark:text-dark-muted">
                  <span>Type: {getFileTypeLabel(entry.fileType)}</span>
                  <span>Size: {formatSize(entry.originalSize)}</span>
                  <span>Dim: {entry.originalWidth}x{entry.originalHeight}</span>
                  <span>DPI: 72</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-xs text-surface-500 dark:text-dark-muted">Original</p>
                    <img
                      src={entry.originalUrl}
                      alt="Original"
                      className="max-h-28 w-full rounded border border-surface-200 object-contain dark:border-dark-border"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-surface-500 dark:text-dark-muted">
                      Compressed
                      {entry.compressedSize &&
                        ` (${Math.round((1 - entry.compressedSize / entry.originalSize) * 100)}%)`}
                    </p>
                    {entry.processing ? (
                      <div className="flex h-full items-center justify-center text-xs text-surface-400">
                        Processing...
                      </div>
                    ) : entry.compressedUrl ? (
                      <img
                        src={entry.compressedUrl}
                        alt="Compressed"
                        className="max-h-28 w-full rounded border border-surface-200 object-contain dark:border-dark-border"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-surface-300 dark:text-dark-muted">
                        Not compressed
                      </div>
                    )}
                  </div>
                </div>
                {entry.compressedSize && (
                  <div className="mt-2 flex items-center justify-between text-xs text-surface-600 dark:text-dark-muted">
                    <span>
                      {formatSize(entry.originalSize)} → {formatSize(entry.compressedSize)}
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      -{Math.round((1 - entry.compressedSize / entry.originalSize) * 100)}%
                    </span>
                  </div>
                )}
                {entry.compressedUrl && (
                  <button
                    onClick={() => downloadImage(entry)}
                    className="mt-2 w-full rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
                  >
                    Download
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-surface-400 dark:text-dark-muted">
            Tip: Press Ctrl+Enter to compress all images
          </p>
        </>
      )}
    </div>
  );
}
