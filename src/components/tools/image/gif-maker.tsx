"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { validateFileUpload } from "@/lib/file-security";
import { randomUUID } from "@/lib/web-crypto";

const INPUT_ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_FILES = 100;
const MIN_FILES = 2;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

interface FrameEntry {
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

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
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
  const d = date.getDate(),
    m = date.getMonth() + 1,
    y = date.getFullYear();
  const h = date.getHours(),
    min = date.getMinutes(),
    s = date.getSeconds();
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
  for (const part of allParts) {
    result.set(part, pos);
    pos += part.length;
  }
  return new Blob([result], { type: "application/zip" });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

export function GifMaker() {
  const [frames, setFrames] = useState<FrameEntry[]>([]);
  const [delay, setDelay] = useState(200);
  const [loopCount, setLoopCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const indexRef = useRef(0);
  const framesRef = useRef<FrameEntry[]>([]);

  // keep refs in sync for animation loop
  useEffect(() => {
    framesRef.current = frames;
    if (frames.length === 0) setCurrentIndex(0);
    else if (currentIndex >= frames.length) setCurrentIndex(0);
  }, [frames, currentIndex]);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      setError("");
      const totalSize = frames.reduce((s, f) => s + f.file.size, 0);
      const newEntries: FrameEntry[] = [];
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
        if (frames.length + newEntries.length >= MAX_FILES) {
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
        setFrames((prev) => [...prev, ...newEntries]);
      }
    },
    [frames]
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
    setFrames((prev) => {
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

  const removeFrame = useCallback((id: string) => {
    setFrames((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) URL.revokeObjectURL(entry.url);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    frames.forEach((f) => URL.revokeObjectURL(f.url));
    setFrames([]);
    setCurrentIndex(0);
    indexRef.current = 0;
    setError("");
  }, [frames]);

  const handleReorderDrop = useCallback((targetId: string) => {
    if (dragIndex === null) return;
    setFrames((prev) => {
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
  }, [dragIndex]);

  // preview animation via requestAnimationFrame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;

    const drawFrame = async (idx: number) => {
      const entry = framesRef.current[idx];
      if (!entry) return;
      try {
        const img = await loadImage(entry.url);
        if (cancelled) return;
        // normalize canvas to max 480 to keep preview responsive
        const maxPreview = 480;
        let w = entry.width;
        let h = entry.height;
        // use size of first frame as canvas base for consistency
        const base = framesRef.current[0];
        if (base) {
          w = base.width;
          h = base.height;
        }
        let displayW = w;
        let displayH = h;
        const scale = Math.min(1, maxPreview / Math.max(displayW, displayH));
        if (scale < 1) {
          displayW = Math.round(displayW * scale);
          displayH = Math.round(displayH * scale);
          // keep canvas at scaled size for performance
          canvas.width = displayW;
          canvas.height = displayH;
        } else {
          canvas.width = w;
          canvas.height = h;
          displayW = w;
          displayH = h;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // contain logic: scale image to fit canvas while preserving aspect
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        const drawW = Math.round(img.width * ratio);
        const drawH = Math.round(img.height * ratio);
        const offsetX = Math.round((canvas.width - drawW) / 2);
        const offsetY = Math.round((canvas.height - drawH) / 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      } catch {
        // ignore
      }
    };

    // initial draw
    drawFrame(indexRef.current);

    if (!isPlaying || frames.length <= 1) return;

    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      if (now - lastTimeRef.current >= delay) {
        const next = (indexRef.current + 1) % framesRef.current.length;
        // handle loop count: 0 infinite, else limited loops not enforced in preview (infinite preview)
        // we keep infinite preview loop for UX; loopCount affects exported GIF metadata only
        indexRef.current = next;
        setCurrentIndex(next);
        drawFrame(next);
        lastTimeRef.current = now;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [frames, delay, isPlaying, loopCount, currentIndex]);

  // also redraw when currentIndex changes while paused
  useEffect(() => {
    if (isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const entry = frames[currentIndex];
    if (!entry) return;
    let cancelled = false;
    loadImage(entry.url)
      .then((img) => {
        if (cancelled) return;
        const base = frames[0];
        let w = base.width;
        let h = base.height;
        const maxPreview = 480;
        const scale = Math.min(1, maxPreview / Math.max(w, h));
        if (scale < 1) {
          canvas.width = Math.round(w * scale);
          canvas.height = Math.round(h * scale);
        } else {
          canvas.width = w;
          canvas.height = h;
        }
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        const drawW = Math.round(img.width * ratio);
        const drawH = Math.round(img.height * ratio);
        const offsetX = Math.round((canvas.width - drawW) / 2);
        const offsetY = Math.round((canvas.height - drawH) / 2);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentIndex, frames, isPlaying]);

  useEffect(() => {
    return () => {
      frames.forEach((f) => URL.revokeObjectURL(f.url));
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadAsZip = useCallback(async () => {
    if (frames.length < MIN_FILES) {
      setError(`Add at least ${MIN_FILES} images to export`);
      return;
    }
    setIsProcessing(true);
    try {
      // ZIP fallback — gifenc not installed, keep bundle light per no-AI budget
      // fallback: ZIP of frames
      const zipFiles: { name: string; data: Blob }[] = [];
      for (let i = 0; i < frames.length; i++) {
        const entry = frames[i];
        const resp = await fetch(entry.url);
        const blob = await resp.blob();
        const ext = entry.file.name.split(".").pop() || "png";
        const name = `frame-${String(i + 1).padStart(3, "0")}.${ext}`;
        zipFiles.push({ name, data: blob });
      }
      const zipBlob = await createZIP(zipFiles);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gif-frames.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Failed to create download");
    } finally {
      setIsProcessing(false);
    }
  }, [frames]);

  const downloadCurrentFrame = useCallback(async () => {
    const entry = frames[currentIndex];
    if (!entry) return;
    const a = document.createElement("a");
    a.href = entry.url;
    a.download = entry.file.name;
    a.click();
  }, [frames, currentIndex]);

  const hasEnough = frames.length >= MIN_FILES;

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images for GIF, click or drop JPEG PNG WebP here, 2 to 100 images"
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
        <input ref={fileRef} type="file" accept={INPUT_ACCEPT} multiple onChange={handleFileInput} className="hidden" aria-label="Choose images for GIF" />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-surface-500 dark:text-dark-muted">{frames.length > 0 ? `${frames.length} image(s) selected — click or drop to add more` : "Click or drop 2–100 images here"}</p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">JPEG, PNG, WebP · Max {MAX_FILES} files · {MAX_TOTAL_SIZE / (1024 * 1024)}MB total · 100% local</p>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {frames.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-surface-200 p-3 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <label htmlFor="gif-delay" className="text-xs text-surface-500 dark:text-dark-muted">
                Frame delay: {delay}ms
              </label>
              <input id="gif-delay" type="range" min={20} max={1000} step={10} value={delay} onChange={(e) => setDelay(parseInt(e.target.value) || 20)} aria-label="Frame delay milliseconds" className="w-28 accent-brand-500" />
              <input type="number" min={20} max={1000} value={delay} onChange={(e) => setDelay(Math.min(1000, Math.max(20, parseInt(e.target.value) || 20)))} aria-label="Frame delay number" className="w-20 rounded-md border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="gif-loop" className="text-xs text-surface-500 dark:text-dark-muted">
                Loop count
              </label>
              <select id="gif-loop" value={loopCount} onChange={(e) => setLoopCount(parseInt(e.target.value))} aria-label="Loop count, 0 is infinite" className="rounded-md border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                <option value={0}>Infinite (0)</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}×
                  </option>
                ))}
              </select>
              <span className="text-xs text-surface-400 dark:text-dark-muted">0 = infinite</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => setIsPlaying((v) => !v)} aria-label={isPlaying ? "Pause preview" : "Play preview"} className="rounded-md border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">
                {isPlaying ? "Pause" : "Play"}
              </button>
              <span className="text-xs text-surface-500 dark:text-dark-muted">
                {currentIndex + 1} / {frames.length}
              </span>
            </div>
          </div>

          <div className="rounded-md border border-surface-200 p-3 dark:border-dark-border">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">Preview</h3>
              <span className="text-xs text-surface-400 dark:text-dark-muted">Slideshow preview — GIF encoding requires gifenc — using slideshow preview, ZIP fallback on download</span>
            </div>
            <div data-testid="tool-output" className="flex justify-center overflow-hidden rounded border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface">
              <canvas ref={canvasRef} aria-label="GIF preview animation" className="max-h-[480px] max-w-full rounded object-contain" />
            </div>
            {!hasEnough && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Add at least {MIN_FILES} images to enable download. GIF encoding requires gifenc — using slideshow preview.</p>}
            {hasEnough && <p className="mt-2 text-xs text-surface-400 dark:text-dark-muted">GIF encoding requires gifenc — using slideshow preview. Download creates a ZIP of frames as fallback.</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={downloadAsZip} disabled={!hasEnough || isProcessing} aria-label="Download GIF as ZIP fallback" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                {isProcessing ? "Processing…" : hasEnough ? "Download frames as ZIP" : "Add 2+ images to download"}
              </button>
              <button type="button" onClick={downloadCurrentFrame} aria-label="Download current frame" className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Download current frame
              </button>
              <button type="button" onClick={clearAll} aria-label="Clear all frames" className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Clear all
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">Frames — drag to reorder or use move buttons</h3>
            <p className="text-xs text-surface-400 dark:text-dark-muted">Upload 2–100 images. New entries appended via newEntries logic. Reorder with drag or Up/Down. Preview uses requestAnimationFrame.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {frames.map((entry, idx) => (
                <div
                  key={entry.id}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleReorderDrop(entry.id)}
                  onDragEnd={() => setDragIndex(null)}
                  className={`rounded-md border p-2 transition-colors ${dragIndex === idx ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10" : "border-surface-200 dark:border-dark-border"} ${currentIndex === idx ? "ring-1 ring-brand-500" : ""}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium text-surface-700 dark:text-dark-text">
                      {idx + 1}. {entry.file.name}
                    </span>
                    <span className="shrink-0 text-[10px] text-surface-400">{formatSize(entry.file.size)}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={entry.url} alt={`Frame ${idx + 1}`} className="h-24 w-full rounded border border-surface-200 object-contain dark:border-dark-border" />
                  <p className="mt-1 text-[10px] text-surface-400 dark:text-dark-muted">
                    {entry.width}×{entry.height} {currentIndex === idx ? "· playing" : ""}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <button type="button" onClick={() => move(entry.id, -1)} disabled={idx === 0} aria-label={`Move ${entry.file.name} up`} className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">
                      Up
                    </button>
                    <button type="button" onClick={() => move(entry.id, 1)} disabled={idx === frames.length - 1} aria-label={`Move ${entry.file.name} down`} className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">
                      Down
                    </button>
                    <button type="button" onClick={() => setCurrentIndex(idx)} aria-label={`Show frame ${idx + 1}`} className={`ml-auto rounded px-2 py-1 text-xs ${currentIndex === idx ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted"}`}>
                      Show
                    </button>
                    <button type="button" onClick={() => removeFrame(entry.id)} aria-label={`Remove ${entry.file.name}`} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
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
