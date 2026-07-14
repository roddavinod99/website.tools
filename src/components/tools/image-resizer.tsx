"use client";

import { useState, useRef, useCallback } from "react";


type ImageFormat = "image/jpeg" | "image/png" | "image/webp";
type FitMode = "exact" | "contain" | "cover" | "fill";
type UnitType = "px" | "percent" | "cm" | "inch";

interface Preset {
  label: string;
  width: number;
  height: number;
  category: string;
}

const PRESETS: Preset[] = [
  { label: "Instagram Square", width: 1080, height: 1080, category: "Social Media" },
  { label: "Instagram Portrait", width: 1080, height: 1350, category: "Social Media" },
  { label: "Twitter Post", width: 1200, height: 675, category: "Social Media" },
  { label: "Facebook Post", width: 1200, height: 630, category: "Social Media" },
  { label: "LinkedIn Post", width: 1200, height: 627, category: "Social Media" },
  { label: "YouTube Thumbnail", width: 1280, height: 720, category: "Social Media" },
  { label: "Pinterest Pin", width: 1000, height: 1500, category: "Social Media" },
  { label: "Twitter Header", width: 1500, height: 500, category: "Social Media" },
  { label: "Facebook Cover", width: 820, height: 312, category: "Social Media" },
  { label: "LinkedIn Cover", width: 1584, height: 396, category: "Social Media" },
  { label: "A4 (300 DPI)", width: 2480, height: 3508, category: "Print" },
  { label: "US Letter (300 DPI)", width: 2550, height: 3300, category: "Print" },
  { label: "4x6 Photo", width: 1200, height: 1800, category: "Print" },
  { label: "Icon (512x512)", width: 512, height: 512, category: "Icons" },
  { label: "Icon (192x192)", width: 192, height: 192, category: "Icons" },
];

const SOCIAL_BUTTONS: { label: string; w: number; h: number }[] = [
  { label: "Instagram", w: 1080, h: 1080 },
  { label: "Facebook", w: 1200, h: 630 },
  { label: "Twitter", w: 1200, h: 675 },
  { label: "LinkedIn", w: 1200, h: 627 },
  { label: "YouTube", w: 1280, h: 720 },
  { label: "HD", w: 1920, h: 1080 },
];

const ASPECT_RATIOS: { label: string; ratio: number }[] = [
  { label: "16:9", ratio: 16 / 9 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "1:1", ratio: 1 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "Custom", ratio: 0 },
];

const FORMAT_OPTIONS: { value: ImageFormat; label: string; ext: string }[] = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

const INPUT_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/bmp";
const MAX_FILES = 20;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;
const MAX_HISTORY = 5;

interface ImageEntry {
  id: string;
  file: File;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  outputUrl?: string;
  outputWidth?: number;
  outputHeight?: number;
  outputSize?: number;
  processing: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function readImageFile(file: File): Promise<{ url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ url, width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): [number, number] {
  const d = date.getDate(), m = date.getMonth() + 1, y = date.getFullYear();
  const h = date.getHours(), min = date.getMinutes(), s = date.getSeconds();
  const datePart = ((y - 1980) << 9) | (m << 5) | d;
  const timePart = (h << 11) | (min << 5) | Math.floor(s / 2);
  return [timePart, datePart];
}

async function createZIP(files: { name: string; data: Blob }[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const centralEntries: Uint8Array[] = [];
  let localOffset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = new Uint8Array(await file.data.arrayBuffer());
    const crc = crc32(dataBytes);

    const localHeader = new ArrayBuffer(30 + nameBytes.length);
    const lh = new Uint8Array(localHeader);
    const lhDV = new DataView(localHeader);

    lhDV.setUint32(0, 0x04034b50, true);
    lhDV.setUint16(4, 20, true);
    lhDV.setUint16(6, 0, true);
    lhDV.setUint16(8, 0, true);
    const [time, date] = dosDateTime(new Date());
    lhDV.setUint16(10, time, true);
    lhDV.setUint16(12, date, true);
    lhDV.setUint32(14, crc, true);
    lhDV.setUint32(18, dataBytes.length, true);
    lhDV.setUint32(22, dataBytes.length, true);
    lhDV.setUint16(26, nameBytes.length, true);
    lh.set(nameBytes, 30);

    chunks.push(lh);
    chunks.push(dataBytes);

    const centralHeader = new ArrayBuffer(46 + nameBytes.length);
    const ch = new Uint8Array(centralHeader);
    const chDV = new DataView(centralHeader);

    chDV.setUint32(0, 0x02014b50, true);
    chDV.setUint16(4, 20, true);
    chDV.setUint16(6, 20, true);
    chDV.setUint16(8, 0, true);
    chDV.setUint16(10, 0, true);
    const [time2, date2] = dosDateTime(new Date());
    chDV.setUint16(12, time2, true);
    chDV.setUint16(14, date2, true);
    chDV.setUint32(16, crc, true);
    chDV.setUint32(20, dataBytes.length, true);
    chDV.setUint32(24, dataBytes.length, true);
    chDV.setUint16(28, nameBytes.length, true);
    chDV.setUint16(30, 0, true);
    chDV.setUint16(32, 0, true);
    chDV.setUint16(34, 0, true);
    chDV.setUint16(36, 0, true);
    chDV.setUint32(38, 0, true);
    chDV.setUint32(42, localOffset, true);
    ch.set(nameBytes, 46);

    centralEntries.push(ch);
    localOffset += 30 + nameBytes.length + dataBytes.length;
  }

  const centralSize = centralEntries.reduce((s, e) => s + e.length, 0);
  const centralOffset = chunks.reduce((s, e) => s + e.length, 0);

  const eocd = new ArrayBuffer(22);
  const eocdDV = new DataView(eocd);
  eocdDV.setUint32(0, 0x06054b50, true);
  eocdDV.setUint16(4, 0, true);
  eocdDV.setUint16(6, 0, true);
  eocdDV.setUint16(8, files.length, true);
  eocdDV.setUint16(10, files.length, true);
  eocdDV.setUint32(12, centralSize, true);
  eocdDV.setUint32(16, centralOffset, true);
  eocdDV.setUint16(20, 0, true);

  const allParts = [...chunks, ...centralEntries, new Uint8Array(eocd)];
  const totalLen = allParts.reduce((s, e) => s + e.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const part of allParts) { result.set(part, pos); pos += part.length; }

  return new Blob([result], { type: "application/zip" });
}

export function ImageResizer() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [history, setHistory] = useState<ImageEntry[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockRatio, setLockRatio] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [unit, setUnit] = useState<UnitType>("px");
  const [fitMode, setFitMode] = useState<FitMode>("exact");
  const [keepRatio] = useState(true);
  const [format, setFormat] = useState<ImageFormat>("image/png");
  const [quality, setQuality] = useState(85);
  const [preserveExif, setPreserveExif] = useState(false);
  const [suffix, setSuffix] = useState("-resized");
  const [maxFileSize, setMaxFileSize] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [aspectRatioMode, setAspectRatioMode] = useState<string>("Custom");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const DPI = 96;

  const toPixels = useCallback(
    (val: number, origDim: number): number => {
      switch (unit) {
        case "percent": return Math.round(origDim * (val / 100));
        case "cm": return Math.round((val / 2.54) * DPI);
        case "inch": return Math.round(val * DPI);
        default: return val;
      }
    },
    [unit]
  );

  const handleFiles = useCallback(async (fileList: FileList) => {
    setError("");
    const totalSize = images.reduce((s, i) => s + i.file.size, 0);
    const newEntries: ImageEntry[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.match(/^image\/(jpeg|png|gif|webp|bmp)$/)) continue;
      if (images.length + newEntries.length >= MAX_FILES) {
        setError("Maximum 20 files allowed");
        break;
      }
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        setError("Total size exceeds 25MB limit");
        break;
      }
      const info = await readImageFile(file);
      newEntries.push({
        id: crypto.randomUUID(),
        file,
        originalUrl: info.url,
        originalWidth: info.width,
        originalHeight: info.height,
        processing: false,
      });
    }
    setImages((prev) => [...prev, ...newEntries]);
    if (newEntries.length > 0) {
      const first = newEntries[0];
      setOriginalDimensions({ width: first.originalWidth, height: first.originalHeight });
    }
  }, [images]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const applyPreset = useCallback((label: string) => {
    const preset = PRESETS.find((p) => p.label === label);
    if (!preset) return;
    setSelectedPreset(label);
    setWidth(preset.width);
    setHeight(preset.height);
    setUnit("px");
  }, []);

  const applySocialButton = useCallback((w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setUnit("px");
    setSelectedPreset("");
  }, []);

  const applyAspectRatio = useCallback((label: string, ratio: number) => {
    setAspectRatioMode(label);
    if (ratio > 0) {
      const w = width || 800;
      setHeight(Math.round(w / ratio));
    }
  }, [width]);

  const resizeImage = useCallback(
    async (entry: ImageEntry): Promise<ImageEntry> => {
      const canvas = canvasRef.current;
      if (!canvas) return entry;
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = entry.originalUrl;
      });

      let targetW = toPixels(width, img.width);
      let targetH = toPixels(height, img.height);

      if (unit === "percent") {
        targetW = Math.max(1, targetW);
        targetH = Math.max(1, targetH);
      }

      let drawW: number;
      let drawH: number;
      let offsetX = 0;
      let offsetY = 0;

      switch (fitMode) {
        case "exact":
          drawW = targetW;
          drawH = targetH;
          break;
        case "contain": {
          const ratio = Math.min(targetW / img.width, targetH / img.height);
          drawW = Math.round(img.width * ratio);
          drawH = Math.round(img.height * ratio);
          break;
        }
        case "cover": {
          const ratio = Math.max(targetW / img.width, targetH / img.height);
          drawW = Math.round(img.width * ratio);
          drawH = Math.round(img.height * ratio);
          offsetX = Math.round((targetW - drawW) / 2);
          offsetY = Math.round((targetH - drawH) / 2);
          break;
        }
        case "fill": {
          drawW = targetW;
          drawH = targetH;
          break;
        }
        default:
          drawW = targetW;
          drawH = targetH;
      }

      if (keepRatio && fitMode === "exact") {
        const ratio = img.width / img.height;
        if (targetW / targetH > ratio) {
          drawH = targetH;
          drawW = Math.round(targetH * ratio);
        } else {
          drawW = targetW;
          drawH = Math.round(targetW / ratio);
        }
      }

      const outW = fitMode === "contain" || fitMode === "cover" ? targetW : drawW;
      const outH = fitMode === "contain" || fitMode === "cover" ? targetH : drawH;
      canvas.width = Math.max(1, outW);
      canvas.height = Math.max(1, outH);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, fitMode === "cover" ? offsetX : 0, fitMode === "cover" ? offsetY : 0, drawW, drawH);

      const qualityVal = quality / 100;
      let blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), format, qualityVal)
      );

      if (maxFileSize > 0 && blob && blob.size > maxFileSize * 1024) {
        let low = 0.05;
        let high = qualityVal;
        for (let i = 0; i < 10; i++) {
          const mid = (low + high) / 2;
          blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), format, mid)
          );
          if (!blob) break;
          if (blob.size <= maxFileSize * 1024) low = mid;
          else high = mid;
        }
      }

      if (!blob) return entry;
      return {
        ...entry,
        outputUrl: URL.createObjectURL(blob),
        outputWidth: canvas.width,
        outputHeight: canvas.height,
        outputSize: blob.size,
        processing: false,
      };
    },
    [width, height, unit, fitMode, keepRatio, format, quality, maxFileSize, toPixels]
  );

  const resizeAll = useCallback(async () => {
    setImages((prev) => prev.map((img) => ({ ...img, processing: true })));
    const results = await Promise.all(images.map((entry) => resizeImage(entry)));
    setImages(results);
    setHistory((prev) => {
      const completed = results.filter((r) => r.outputUrl);
      const combined = [...completed, ...prev].slice(0, MAX_HISTORY);
      return combined;
    });
  }, [images, resizeImage]);

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearAll = () => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.outputUrl) URL.revokeObjectURL(img.outputUrl);
    });
    setImages([]);
  };

  const downloadImage = (entry: ImageEntry) => {
    if (!entry.outputUrl) return;
    const link = document.createElement("a");
    const base = entry.file.name.replace(/\.[^.]+$/, "");
    const ext = FORMAT_OPTIONS.find((f) => f.value === format)?.ext || "png";
    link.download = `${base}${suffix}.${ext}`;
    link.href = entry.outputUrl;
    link.click();
  };

  const downloadAll = () => {
    images.forEach((entry, i) => {
      if (entry.outputUrl) {
        setTimeout(() => downloadImage(entry), 100 * i);
      }
    });
  };

  const downloadAllAsZip = useCallback(async () => {
    const ext = FORMAT_OPTIONS.find((f) => f.value === format)?.ext || "png";
    const entries = images.filter((e) => e.outputUrl);
    const zipFiles = await Promise.all(
      entries.map(async (entry) => {
        const base = entry.file.name.replace(/\.[^.]+$/, "");
        const resp = await fetch(entry.outputUrl!);
        const blob = await resp.blob();
        return { name: `${base}${suffix}.${ext}`, data: blob };
      })
    );
    const zipBlob = await createZIP(zipFiles);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "resized-images.zip";
    link.click();
    URL.revokeObjectURL(link.href);
  }, [images, format, suffix]);

  const hasOutput = images.some((img) => img.outputUrl);
  const categorizedPresets = PRESETS.reduce<Record<string, Preset[]>>((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-surface-200 bg-white hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface"
        }`}
      >
        <input ref={fileRef} type="file" accept={INPUT_ACCEPT} multiple onChange={handleFileInput} className="hidden" />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-surface-500 dark:text-dark-muted">
          {images.length > 0 ? `${images.length} image(s) selected` : "Click or drop images here"}
        </p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">JPEG, PNG, GIF, WebP, BMP &middot; Max 20 files &middot; 25MB total</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {images.length > 0 && (
        <>
          <div className="rounded-lg border border-surface-200 p-3 dark:border-dark-border">
            <label className="mb-2 block text-xs font-medium text-surface-500 dark:text-dark-muted">Quick Social Media Presets</label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SOCIAL_BUTTONS.map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => applySocialButton(btn.w, btn.h)}
                  className="rounded-lg border border-surface-200 px-2.5 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"
                >
                  {btn.label} ({btn.w}x{btn.h})
                </button>
              ))}
            </div>
            <label className="mb-2 block text-xs font-medium text-surface-500 dark:text-dark-muted">Aspect Ratio Presets</label>
            <div className="flex flex-wrap gap-1.5">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.label}
                  onClick={() => applyAspectRatio(ar.label, ar.ratio)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                    aspectRatioMode === ar.label
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 p-3 dark:border-dark-border">
            <label className="mb-2 block text-xs font-medium text-surface-500 dark:text-dark-muted">Preset Dimensions</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(categorizedPresets).map(([category, presets]) => (
                <details key={category} className="min-w-0">
                  <summary className="cursor-pointer rounded-lg border border-surface-200 px-2.5 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">
                    {category}
                  </summary>
                  <div className="absolute z-10 mt-1 w-48 rounded-lg border border-surface-200 bg-white p-1 shadow-lg dark:border-dark-border dark:bg-dark-surface">
                    {presets.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => applyPreset(p.label)}
                        className={`block w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                          selectedPreset === p.label
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                            : "text-surface-700 hover:bg-surface-50 dark:text-dark-text dark:hover:bg-dark-border"
                        }`}
                      >
                        {p.label}
                        <span className="ml-1 text-surface-400">({p.width}x{p.height})</span>
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-surface-200 p-3 dark:border-dark-border">
            <div>
              <label className="block text-xs text-surface-500 dark:text-dark-muted">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => {
                  const newWidth = parseInt(e.target.value) || 0;
                  setWidth(newWidth);
                  setSelectedPreset("");
                  if (lockRatio && originalDimensions.width > 0 && newWidth > 0) {
                    setHeight(Math.round(newWidth * (originalDimensions.height / originalDimensions.width)));
                  }
                }}
                min={1}
                className="w-20 rounded-lg border border-surface-200 bg-white px-2 py-1 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              />
            </div>
            <button
              onClick={() => setLockRatio(!lockRatio)}
              className={`mt-5 rounded p-1.5 transition-colors ${
                lockRatio
                  ? "text-brand-500 bg-brand-50 dark:bg-brand-500/10"
                  : "text-surface-400 hover:text-surface-600 dark:text-dark-muted"
              }`}
              title="Lock aspect ratio"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m0 0v8m0-8L8 16" />
              </svg>
            </button>
            <div>
              <label className="block text-xs text-surface-500 dark:text-dark-muted">Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => {
                  const newHeight = parseInt(e.target.value) || 0;
                  setHeight(newHeight);
                  setSelectedPreset("");
                  if (lockRatio && originalDimensions.height > 0 && newHeight > 0) {
                    setWidth(Math.round(newHeight * (originalDimensions.width / originalDimensions.height)));
                  }
                }}
                min={1}
                className="w-20 rounded-lg border border-surface-200 bg-white px-2 py-1 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-xs text-surface-500 dark:text-dark-muted">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              >
                <option value="px">Pixels</option>
                <option value="percent">%</option>
                <option value="cm">cm</option>
                <option value="inch">in</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-surface-500 dark:text-dark-muted">Fit</label>
              <select
                value={fitMode}
                onChange={(e) => setFitMode(e.target.value as FitMode)}
                className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              >
                <option value="exact">Exact</option>
                <option value="contain">Fit (Contain)</option>
                <option value="cover">Crop (Cover)</option>
                <option value="fill">Fill (Stretch)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-surface-500 dark:text-dark-muted">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ImageFormat)}
                className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              >
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-surface-500 dark:text-dark-muted">Quality: {quality}%</label>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-20 accent-brand-500"
              />
            </div>
          </div>

          <details className="rounded-lg border border-surface-200 dark:border-dark-border">
            <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">
              Advanced Options
            </summary>
            <div className="flex flex-wrap items-center gap-4 border-t border-surface-200 p-3 dark:border-dark-border">
              <div>
                <label className="block text-xs text-surface-500 dark:text-dark-muted">Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-24 rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 dark:text-dark-muted">Max Size (KB, 0 = off)</label>
                <input
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-20 rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
                <input
                  type="checkbox"
                  checked={preserveExif}
                  onChange={(e) => setPreserveExif(e.target.checked)}
                  className="accent-brand-500"
                />
                Preserve EXIF
              </label>
            </div>
          </details>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={resizeAll}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            >
              Resize {images.length > 1 ? `All (${images.length})` : ""}
            </button>
            {hasOutput && (
              <>
                <button
                  onClick={downloadAll}
                  className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
                >
                  Download All
                </button>
                <button
                  onClick={downloadAllAsZip}
                  className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
                >
                  Download as ZIP
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
                <div className="mb-2 text-xs text-surface-500 dark:text-dark-muted">
                  Original: {entry.originalWidth}x{entry.originalHeight}
                  {entry.outputWidth && entry.outputHeight && (
                    <span className="ml-2 text-brand-500">→ {entry.outputWidth}x{entry.outputHeight}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-xs text-surface-500 dark:text-dark-muted">Original</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.originalUrl}
                      alt="Original"
                      className="max-h-28 w-full rounded border border-surface-200 object-contain dark:border-dark-border"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-surface-500 dark:text-dark-muted">Resized</p>
                    {entry.processing ? (
                      <div className="flex h-full items-center justify-center text-xs text-surface-400">Processing...</div>
                    ) : entry.outputUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={entry.outputUrl}
                        alt="Resized"
                        className="max-h-28 w-full rounded border border-surface-200 object-contain dark:border-dark-border"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-surface-300 dark:text-dark-muted">Not resized</div>
                    )}
                  </div>
                </div>
                {entry.outputSize && (
                  <div className="mt-2 text-xs text-surface-500 dark:text-dark-muted">Size: {formatSize(entry.outputSize)}</div>
                )}
                {entry.outputUrl && (
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

          {history.length > 0 && (
            <details className="rounded-lg border border-surface-200 dark:border-dark-border">
              <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">
                Processing History (last {history.length})
              </summary>
              <div className="grid gap-3 border-t border-surface-200 p-3 sm:grid-cols-2 lg:grid-cols-3 dark:border-dark-border">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 rounded-lg border border-surface-200 p-2 dark:border-dark-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.outputUrl || entry.originalUrl}
                      alt=""
                      className="h-10 w-10 rounded border border-surface-100 object-contain dark:border-dark-border"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-surface-700 dark:text-dark-text">{entry.file.name}</p>
                      <p className="text-[10px] text-surface-400">
                        {entry.outputWidth}x{entry.outputHeight} &middot; {entry.outputSize ? formatSize(entry.outputSize) : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
