"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { validateFileUpload } from "@/lib/file-security";

type CropRect = { x: number; y: number; w: number; h: number };
type ImageFormat = "image/jpeg" | "image/png" | "image/webp";
type HandleType = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "move";

interface AspectPreset {
  label: string;
  value: number | null;
}

const ASPECT_PRESETS: AspectPreset[] = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
  { label: "3:2", value: 3 / 2 },
  { label: "2:3", value: 2 / 3 },
];

const INPUT_ACCEPT = "image/jpeg,image/png,image/webp";
const MIN_CROP = 20;

const FORMAT_OPTIONS: { value: ImageFormat; label: string; ext: string }[] = [
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getRatioForLabel(label: string): number | null {
  const found = ASPECT_PRESETS.find((p) => p.label === label);
  return found ? found.value : null;
}

function createCenteredCrop(imgW: number, imgH: number, ratio: number | null): CropRect {
  if (ratio === null) {
    const w = Math.round(imgW * 0.7);
    const h = Math.round(imgH * 0.7);
    return { x: Math.round((imgW - w) / 2), y: Math.round((imgH - h) / 2), w, h };
  }
  let w: number;
  let h: number;
  if (imgW / imgH > ratio) {
    h = Math.round(imgH * 0.7);
    w = Math.round(h * ratio);
  } else {
    w = Math.round(imgW * 0.7);
    h = Math.round(w / ratio);
  }
  w = Math.max(MIN_CROP, Math.min(w, imgW));
  h = Math.max(MIN_CROP, Math.min(h, imgH));
  return { x: Math.round((imgW - w) / 2), y: Math.round((imgH - h) / 2), w, h };
}

function clampCrop(rect: CropRect, imgW: number, imgH: number): CropRect {
  let { x, y, w, h } = rect;
  w = Math.max(MIN_CROP, Math.min(w, imgW));
  h = Math.max(MIN_CROP, Math.min(h, imgH));
  x = Math.max(0, Math.min(x, imgW - w));
  y = Math.max(0, Math.min(y, imgH - h));
  if (x + w > imgW) w = imgW - x;
  if (y + h > imgH) h = imgH - y;
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

export function ImageCropper() {
  const [image, setImage] = useState<{ url: string; file: File; width: number; height: number; name: string } | null>(null);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [aspect, setAspect] = useState<string>("Free");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [outputDims, setOutputDims] = useState<{ w: number; h: number } | null>(null);
  const [outputFormat, setOutputFormat] = useState<ImageFormat>("image/jpeg");
  const [quality, setQuality] = useState<number>(90);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [isCropping, setIsCropping] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ type: HandleType; startX: number; startY: number; startCrop: CropRect } | null>(null);

  const currentRatio = getRatioForLabel(aspect);

  const revokeImage = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  const clearOutput = useCallback(() => {
    setOutputUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setOutputSize(null);
    setOutputDims(null);
  }, []);

  const handleClearAll = useCallback(() => {
    if (image) revokeImage(image.url);
    clearOutput();
    setImage(null);
    setCrop(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }, [image, revokeImage, clearOutput]);

  const loadImageFile = useCallback(
    async (file: File) => {
      const validation = await validateFileUpload(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        setError("Only JPEG, PNG and WebP images are supported");
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      }).catch(() => {
        URL.revokeObjectURL(url);
        setError("Invalid image file");
        return null;
      });
      if (!dims) return;
      if (image) revokeImage(image.url);
      clearOutput();
      setImage({ url, file, width: dims.width, height: dims.height, name: file.name });
      const ratio = getRatioForLabel(aspect);
      setCrop(createCenteredCrop(dims.width, dims.height, ratio));
      setError("");
    },
    [aspect, image, revokeImage, clearOutput]
  );

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const file = fileList[0];
      if (!file) return;
      if (fileList.length > 1) {
        setError("Only one image at a time — using the first file");
      }
      await loadImageFile(file);
    },
    [loadImageFile]
  );

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

  const handleAspectChange = useCallback(
    (label: string) => {
      setAspect(label);
      const ratio = getRatioForLabel(label);
      if (!image || !crop) return;
      if (ratio === null) return;
      setCrop(createCenteredCrop(image.width, image.height, ratio));
      clearOutput();
    },
    [image, crop, clearOutput]
  );

  const handleResetCrop = useCallback(() => {
    if (!image) return;
    const ratio = getRatioForLabel(aspect);
    setCrop(createCenteredCrop(image.width, image.height, ratio));
    clearOutput();
  }, [image, aspect, clearOutput]);

  const getScales = useCallback(() => {
    const el = imgRef.current;
    if (!el || !image) return { scaleX: 1, scaleY: 1 };
    const displayedW = el.clientWidth || el.getBoundingClientRect().width || 1;
    const displayedH = el.clientHeight || el.getBoundingClientRect().height || 1;
    return { scaleX: image.width / displayedW, scaleY: image.height / displayedH };
  }, [image]);

  const updateCropFromDrag = useCallback(
    (clientX: number, clientY: number) => {
      const state = dragStateRef.current;
      if (!state || !crop || !image) return;
      const { scaleX, scaleY } = getScales();
      const dx = (clientX - state.startX) * scaleX;
      const dy = (clientY - state.startY) * scaleY;
      const s = state.startCrop;
      const ratio = getRatioForLabel(aspect);
      const next: CropRect = { ...s };

      const clampW = (w: number, x: number) => {
        w = Math.max(MIN_CROP, w);
        if (x < 0) { w += x; x = 0; }
        if (x + w > image.width) w = image.width - x;
        return w;
      };
      const clampH = (h: number, y: number) => {
        h = Math.max(MIN_CROP, h);
        if (y < 0) { h += y; y = 0; }
        if (y + h > image.height) h = image.height - y;
        return h;
      };

      switch (state.type) {
        case "move": {
          next.x = Math.max(0, Math.min(image.width - s.w, s.x + dx));
          next.y = Math.max(0, Math.min(image.height - s.h, s.y + dy));
          break;
        }
        case "e": {
          let newW = s.w + dx;
          newW = clampW(newW, s.x);
          next.w = newW;
          if (ratio !== null) {
            let newH = newW / ratio;
            newH = clampH(newH, s.y - (newH - s.h) / 2);
            next.h = Math.max(MIN_CROP, newH);
            next.y = Math.max(0, Math.min(image.height - next.h, s.y - (next.h - s.h) / 2));
            if (next.y + next.h > image.height) next.y = image.height - next.h;
          }
          break;
        }
        case "w": {
          let newW = s.w - dx;
          let newX = s.x + dx;
          if (newX < 0) { newW += newX; newX = 0; }
          if (newW < MIN_CROP) { newX -= MIN_CROP - newW; newW = MIN_CROP; }
          if (newX + newW > image.width) newW = image.width - newX;
          next.x = newX;
          next.w = newW;
          if (ratio !== null) {
            let newH = newW / ratio;
            newH = Math.max(MIN_CROP, Math.min(newH, image.height));
            const centerY = s.y + s.h / 2;
            let newY = Math.round(centerY - newH / 2);
            newY = Math.max(0, Math.min(image.height - newH, newY));
            next.y = newY;
            next.h = newH;
            if (next.y + next.h > image.height) next.h = image.height - next.y;
          }
          break;
        }
        case "s": {
          let newH = s.h + dy;
          newH = clampH(newH, s.y);
          next.h = newH;
          if (ratio !== null) {
            let newW = newH * ratio;
            newW = clampW(newW, s.x - (newW - s.w) / 2);
            next.w = Math.max(MIN_CROP, newW);
            next.x = Math.max(0, Math.min(image.width - next.w, s.x - (next.w - s.w) / 2));
            if (next.x + next.w > image.width) next.x = image.width - next.w;
          }
          break;
        }
        case "n": {
          let newH = s.h - dy;
          let newY = s.y + dy;
          if (newY < 0) { newH += newY; newY = 0; }
          if (newH < MIN_CROP) { newY -= MIN_CROP - newH; newH = MIN_CROP; }
          if (newY + newH > image.height) newH = image.height - newY;
          next.y = newY;
          next.h = newH;
          if (ratio !== null) {
            let newW = newH * ratio;
            newW = Math.max(MIN_CROP, Math.min(newW, image.width));
            const centerX = s.x + s.w / 2;
            let newX = Math.round(centerX - newW / 2);
            newX = Math.max(0, Math.min(image.width - newW, newX));
            next.x = newX;
            next.w = newW;
            if (next.x + next.w > image.width) next.w = image.width - next.x;
          }
          break;
        }
        case "se": {
          let newW = s.w + dx;
          let newH = s.h + dy;
          if (ratio !== null) {
            if (Math.abs(dx) > Math.abs(dy) * ratio) {
              newW = clampW(newW, s.x);
              newH = newW / ratio;
              if (s.y + newH > image.height) { newH = image.height - s.y; newW = newH * ratio; }
            } else {
              newH = clampH(newH, s.y);
              newW = newH * ratio;
              if (s.x + newW > image.width) { newW = image.width - s.x; newH = newW / ratio; }
            }
            next.w = Math.max(MIN_CROP, newW);
            next.h = Math.max(MIN_CROP, newH);
          } else {
            newW = clampW(newW, s.x);
            newH = clampH(newH, s.y);
            next.w = newW;
            next.h = newH;
          }
          break;
        }
        case "sw": {
          let newW = s.w - dx;
          let newX = s.x + dx;
          let newH = s.h + dy;
          if (newX < 0) { newW += newX; newX = 0; }
          if (newW < MIN_CROP) { newX -= MIN_CROP - newW; newW = MIN_CROP; }
          if (ratio !== null) {
            if (Math.abs(dx) > Math.abs(dy) * ratio) {
              newW = Math.max(MIN_CROP, Math.min(newW, image.width - newX));
              newH = newW / ratio;
              if (s.y + newH > image.height) { newH = image.height - s.y; newW = newH * ratio; newX = s.x + s.w - newW; }
            } else {
              newH = clampH(newH, s.y);
              newW = newH * ratio;
              newX = s.x + s.w - newW;
              if (newX < 0) { newX = 0; newW = s.x + s.w; newH = newW / ratio; }
            }
            next.x = Math.max(0, newX);
            next.w = Math.max(MIN_CROP, newW);
            next.h = Math.max(MIN_CROP, newH);
          } else {
            newW = Math.max(MIN_CROP, Math.min(newW, image.width - newX));
            newH = clampH(newH, s.y);
            next.x = newX;
            next.w = newW;
            next.h = newH;
          }
          break;
        }
        case "ne": {
          let newW = s.w + dx;
          let newH = s.h - dy;
          let newY = s.y + dy;
          if (newY < 0) { newH += newY; newY = 0; }
          if (newH < MIN_CROP) { newY -= MIN_CROP - newH; newH = MIN_CROP; }
          if (ratio !== null) {
            if (Math.abs(dx) > Math.abs(dy) * ratio) {
              newW = clampW(newW, s.x);
              newH = newW / ratio;
              newY = s.y + s.h - newH;
              if (newY < 0) { newY = 0; newH = s.y + s.h; newW = newH * ratio; }
            } else {
              newH = Math.max(MIN_CROP, newH);
              newW = newH * ratio;
              if (s.x + newW > image.width) { newW = image.width - s.x; newH = newW / ratio; newY = s.y + s.h - newH; }
            }
            next.w = Math.max(MIN_CROP, newW);
            next.h = Math.max(MIN_CROP, newH);
            next.y = Math.max(0, newY);
          } else {
            newW = clampW(newW, s.x);
            next.w = newW;
            next.h = newH;
            next.y = newY;
          }
          break;
        }
        case "nw": {
          let newW = s.w - dx;
          let newX = s.x + dx;
          let newH = s.h - dy;
          let newY = s.y + dy;
          if (newX < 0) { newW += newX; newX = 0; }
          if (newY < 0) { newH += newY; newY = 0; }
          if (newW < MIN_CROP) { newX -= MIN_CROP - newW; newW = MIN_CROP; }
          if (newH < MIN_CROP) { newY -= MIN_CROP - newH; newH = MIN_CROP; }
          if (ratio !== null) {
            if (Math.abs(dx) > Math.abs(dy) * ratio) {
              newW = Math.max(MIN_CROP, newW);
              if (newX + newW > image.width) newW = image.width - newX;
              newH = newW / ratio;
              newY = s.y + s.h - newH;
              if (newY < 0) { newY = 0; newH = s.y + s.h; newW = newH * ratio; newX = s.x + s.w - newW; }
            } else {
              newH = Math.max(MIN_CROP, newH);
              if (newY + newH > image.height) newH = image.height - newY;
              newW = newH * ratio;
              newX = s.x + s.w - newW;
              if (newX < 0) { newX = 0; newW = s.x + s.w; newH = newW / ratio; newY = s.y + s.h - newH; }
            }
            next.x = Math.max(0, newX);
            next.y = Math.max(0, newY);
            next.w = Math.max(MIN_CROP, newW);
            next.h = Math.max(MIN_CROP, newH);
          } else {
            next.x = newX;
            next.y = newY;
            next.w = newW;
            next.h = newH;
          }
          break;
        }
      }
      setCrop(clampCrop(next, image.width, image.height));
    },
    [crop, image, aspect, getScales]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragStateRef.current) return;
      updateCropFromDrag(e.clientX, e.clientY);
    },
    [updateCropFromDrag]
  );

  const handlePointerUp = useCallback(() => {
    dragStateRef.current = null;
    clearOutput();
  }, [clearOutput]);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent, type: HandleType) => {
      e.preventDefault();
      e.stopPropagation();
      if (!crop) return;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      dragStateRef.current = { type, startX: e.clientX, startY: e.clientY, startCrop: { ...crop } };
    },
    [crop]
  );

  const handleNudge = useCallback(
    (dx: number, dy: number) => {
      if (!crop || !image) return;
      setCrop((prev) => {
        if (!prev) return prev;
        const next = {
          x: Math.max(0, Math.min(image.width - prev.w, prev.x + dx)),
          y: Math.max(0, Math.min(image.height - prev.h, prev.y + dy)),
          w: prev.w,
          h: prev.h,
        };
        return next;
      });
      clearOutput();
    },
    [crop, image, clearOutput]
  );

  const doCrop = useCallback(
    async (overrideFormat?: ImageFormat) => {
      if (!image || !crop) {
        setError("Load an image first");
        return;
      }
      const fmt = overrideFormat ?? outputFormat;
      setIsCropping(true);
      setError("");
      try {
        const canvas = document.createElement("canvas");
        const w = Math.max(1, Math.round(crop.w));
        const h = Math.max(1, Math.round(crop.h));
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = image.url;
        });
        ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, w, h);
        const blob: Blob | null = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b), fmt, fmt === "image/png" ? undefined : quality / 100)
        );
        if (!blob) throw new Error("Failed to create cropped image");
        setOutputUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        setOutputSize(blob.size);
        setOutputDims({ w, h });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Crop failed");
      } finally {
        setIsCropping(false);
      }
    },
    [image, crop, outputFormat, quality]
  );

  const handleCropKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!crop) return;
      const step = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handleNudge(-step, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNudge(step, 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleNudge(0, -step);
          break;
        case "ArrowDown":
          e.preventDefault();
          handleNudge(0, step);
          break;
        case "Enter":
          e.preventDefault();
          doCrop();
          break;
        default:
          break;
      }
    },
    [crop, handleNudge, doCrop]
  );

  const handleDownload = useCallback(
    async (fmt: ImageFormat) => {
      if (!image || !crop) return;
      const canvas = document.createElement("canvas");
      const w = Math.max(1, Math.round(crop.w));
      const h = Math.max(1, Math.round(crop.h));
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed"));
        img.src = image.url;
      }).catch(() => undefined);
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, w, h);
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), fmt, fmt === "image/png" ? undefined : quality / 100)
      );
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const base = image.name.replace(/\.[^.]+$/, "") || "cropped";
      const ext = FORMAT_OPTIONS.find((f) => f.value === fmt)?.ext || "jpg";
      link.download = `${base}-cropped.${ext}`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    [image, crop, quality]
  );

  const handleDownloadCurrent = useCallback(() => {
    if (!outputUrl || !image || !outputDims) return;
    const link = document.createElement("a");
    const base = image.name.replace(/\.[^.]+$/, "") || "cropped";
    const ext = FORMAT_OPTIONS.find((f) => f.value === outputFormat)?.ext || "jpg";
    link.download = `${base}-cropped.${ext}`;
    link.href = outputUrl;
    link.click();
  }, [outputUrl, image, outputDims, outputFormat]);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [image, outputUrl]);

  const dropZoneLabel = image ? `${image.name} loaded — click or drop to replace` : "Click or drop image here";

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image, click or drop image here, press Enter to browse"
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
          dragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-surface-200 bg-white hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept={INPUT_ACCEPT}
          onChange={handleFileInput}
          className="hidden"
          aria-label="Choose image file"
        />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-surface-500 dark:text-dark-muted">{dropZoneLabel}</p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">Supports JPEG, PNG, WebP · 10MB max · 1 file · 100% local</p>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {image && crop && (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Aspect:</span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Aspect ratio presets">
              {ASPECT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  aria-label={`Aspect ${preset.label}`}
                  aria-pressed={aspect === preset.label}
                  onClick={() => handleAspectChange(preset.label)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    aspect === preset.label
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-surface-200 bg-white text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <span className="ml-2 text-xs text-surface-400 dark:text-dark-muted hidden sm:inline" aria-hidden="true">
              {currentRatio ? `${aspect} locked` : "Free crop"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-md border border-surface-200 p-3 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <label htmlFor="crop-format" className="text-xs text-surface-500 dark:text-dark-muted">
                Format
              </label>
              <select
                id="crop-format"
                value={outputFormat}
                onChange={(e) => {
                  setOutputFormat(e.target.value as ImageFormat);
                  clearOutput();
                }}
                aria-label="Output format"
                className="rounded-md border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              >
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            {(outputFormat === "image/jpeg" || outputFormat === "image/webp") && (
              <div className="flex items-center gap-2">
                <label htmlFor="crop-quality" className="text-xs text-surface-500 dark:text-dark-muted">
                  Quality: {quality}%
                </label>
                <input
                  id="crop-quality"
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => {
                    setQuality(parseInt(e.target.value));
                    clearOutput();
                  }}
                  aria-label="Output quality"
                  className="w-24 accent-brand-500"
                />
              </div>
            )}
            <div className="ml-auto flex items-center gap-2 text-xs text-surface-500 dark:text-dark-muted">
              <span>
                Original: {image.width}×{image.height}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Crop: {Math.round(crop.w)}×{Math.round(crop.h)}
              </span>
            </div>
          </div>

          <div
            ref={cropAreaRef}
            tabIndex={0}
            role="application"
            aria-label="Crop area, use arrow keys to nudge, Shift+arrow for 10px, Enter to crop"
            onKeyDown={handleCropKeyDown}
            className="relative flex justify-center rounded-md border border-surface-200 bg-surface-50 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-dark-border dark:bg-dark-surface"
          >
            <div className="relative inline-block max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={image.url}
                alt="Source to crop"
                className="block max-h-[60vh] max-w-full select-none rounded object-contain"
                draggable={false}
              />
              <div
                className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)] touch-none"
                style={{
                  left: `${(crop.x / image.width) * 100}%`,
                  top: `${(crop.y / image.height) * 100}%`,
                  width: `${(crop.w / image.width) * 100}%`,
                  height: `${(crop.h / image.height) * 100}%`,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.5) inset",
                  cursor: "move",
                }}
                onPointerDown={(e) => onHandlePointerDown(e, "move")}
                aria-label="Crop rectangle, drag to move"
              >
                <div
                  className="absolute -left-1.5 -top-1.5 h-3 w-3 cursor-nw-resize rounded-sm border-2 border-brand-500 bg-white shadow"
                  onPointerDown={(e) => onHandlePointerDown(e, "nw")}
                  aria-label="Resize crop from top left"
                />
                <div
                  className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 cursor-n-resize rounded-sm border-2 border-brand-500 bg-white shadow"
                  onPointerDown={(e) => onHandlePointerDown(e, "n")}
                  aria-label="Resize crop from top"
                />
                <div
                  className="absolute -right-1.5 -top-1.5 h-3 w-3 cursor-ne-resize rounded-sm border-2 border-brand-500 bg-white shadow"
                  onPointerDown={(e) => onHandlePointerDown(e, "ne")}
                  aria-label="Resize crop from top right"
                />
                <div
                  className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 cursor-e-resize rounded-sm border-2 border-brand-500 bg-white shadow"
                  onPointerDown={(e) => onHandlePointerDown(e, "e")}
                  aria-label="Resize crop from right"
                />
                <div
                  className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-se-resize rounded-sm border-2 border-brand-500 bg-white shadow"
                  onPointerDown={(e) => onHandlePointerDown(e, "se")}
                  aria-label="Resize crop from bottom right"
                />
                <div
                  className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 cursor-s-resize rounded-sm border-2 border-brand-500 bg-white shadow"
                  onPointerDown={(e) => onHandlePointerDown(e, "s")}
                  aria-label="Resize crop from bottom"
                />
                <div
                  className="absolute -bottom-1.5 -left-1.5 h-3 w-3 cursor-sw-resize rounded-sm border-2 border-brand-500 bg-white shadow"
                  onPointerDown={(e) => onHandlePointerDown(e, "sw")}
                  aria-label="Resize crop from bottom left"
                />
                <div
                  className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 cursor-w-resize rounded-sm border-2 border-brand-500 bg-white shadow"
                  onPointerDown={(e) => onHandlePointerDown(e, "w")}
                  aria-label="Resize crop from left"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => doCrop()}
              disabled={isCropping}
              aria-label="Crop image"
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {isCropping ? "Cropping…" : "Crop"}
            </button>
            <button
              type="button"
              onClick={handleResetCrop}
              aria-label="Reset crop area"
              className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              aria-label="Clear image"
              className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-surface-400 dark:text-dark-muted">Tip: Drag the rectangle or handles to adjust. Use arrow keys to nudge (Shift+10px), Enter to crop.</p>
        </>
      )}

      {outputUrl && outputDims && outputSize !== null && (
        <div className="space-y-3 rounded-md border border-surface-200 p-3 dark:border-dark-border">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">Cropped Preview</h3>
            <span className="text-xs text-surface-500 dark:text-dark-muted">
              {outputDims.w}×{outputDims.h} · {formatSize(outputSize)}
            </span>
          </div>
          <div data-testid="tool-output" className="overflow-hidden rounded border border-surface-200 dark:border-dark-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={outputUrl} alt="Cropped preview" className="mx-auto block max-h-[50vh] max-w-full object-contain" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadCurrent}
              aria-label="Download cropped image"
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Download
            </button>
            <button
              type="button"
              onClick={() => handleDownload("image/png")}
              aria-label="Download as PNG"
              className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Download as PNG
            </button>
            <button
              type="button"
              onClick={() => handleDownload("image/webp")}
              aria-label="Download as WebP"
              className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Download as WebP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
