"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { validateFileUpload } from "@/lib/file-security";

type ImageFormat = "image/jpeg" | "image/png" | "image/webp";
type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type FontFamily = "sans" | "serif" | "mono";

const INPUT_ACCEPT = "image/jpeg,image/png,image/webp";
const LOGO_ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_DIM = 2000;

const FORMAT_OPTIONS: { value: ImageFormat; label: string; ext: string }[] = [
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

const POSITIONS: { value: Position; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "middle-left", label: "Middle left" },
  { value: "center", label: "Center" },
  { value: "middle-right", label: "Middle right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  sans: "sans-serif",
  serif: "serif",
  mono: "monospace",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

export function ImageWatermark() {
  const [base, setBase] = useState<{ file: File; url: string; width: number; height: number } | null>(null);
  const [logo, setLogo] = useState<{ file: File; url: string; width: number; height: number } | null>(null);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [logoDragging, setLogoDragging] = useState(false);

  // text watermark controls
  const [watermarkText, setWatermarkText] = useState("© DevStackIO");
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [textOpacity, setTextOpacity] = useState(60);
  const [fontFamily, setFontFamily] = useState<FontFamily>("sans");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [rotation, setRotation] = useState(-30);

  // image watermark controls
  const [logoScale, setLogoScale] = useState(20);
  const [logoOpacity, setLogoOpacity] = useState(80);

  // position
  const [position, setPosition] = useState<Position>("bottom-right");
  const [offsetX, setOffsetX] = useState(20);
  const [offsetY, setOffsetY] = useState(20);
  const [tiled, setTiled] = useState(false);

  // output
  const [outputFormat, setOutputFormat] = useState<ImageFormat>("image/png");
  const [quality, setQuality] = useState(92);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const clearBase = useCallback(() => {
    if (base) URL.revokeObjectURL(base.url);
    setBase(null);
    setError("");
    setOutputSize(null);
    if (fileRef.current) fileRef.current.value = "";
  }, [base]);

  const clearLogo = useCallback(() => {
    if (logo) URL.revokeObjectURL(logo.url);
    setLogo(null);
    setLogoError("");
    if (logoFileRef.current) logoFileRef.current.value = "";
  }, [logo]);

  const handleClearAll = useCallback(() => {
    clearBase();
    clearLogo();
    setOutputSize(null);
  }, [clearBase, clearLogo]);

  const handleBaseFile = useCallback(async (file: File) => {
    setError("");
    if (file.size === 0) {
      setError("File is empty.");
      return;
    }
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
    try {
      const img = await loadImage(url);
      if (base) URL.revokeObjectURL(base.url);
      setBase({ file, url, width: img.width, height: img.height });
    } catch {
      URL.revokeObjectURL(url);
      setError("Invalid image file");
    }
  }, [base]);

  const handleLogoFile = useCallback(async (file: File) => {
    setLogoError("");
    if (file.size === 0) {
      setLogoError("File is empty.");
      return;
    }
    const validation = await validateFileUpload(file);
    if (!validation.valid) {
      setLogoError(validation.error || "Invalid file");
      return;
    }
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setLogoError("Only PNG, JPEG and WebP logos are supported");
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      if (logo) URL.revokeObjectURL(logo.url);
      setLogo({ file, url, width: img.width, height: img.height });
    } catch {
      URL.revokeObjectURL(url);
      setLogoError("Invalid image file");
    }
  }, [logo]);

  const handleBaseFiles = useCallback(async (list: FileList) => {
    const file = list[0];
    if (!file) return;
    if (list.length > 1) setError("Only one base image at a time — using the first file");
    await handleBaseFile(file);
  }, [handleBaseFile]);

  const handleLogoFiles = useCallback(async (list: FileList) => {
    const file = list[0];
    if (!file) return;
    await handleLogoFile(file);
  }, [handleLogoFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleBaseFiles(e.target.files);
  }, [handleBaseFiles]);

  const handleLogoInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleLogoFiles(e.target.files);
  }, [handleLogoFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleBaseFiles(e.dataTransfer.files);
  }, [handleBaseFiles]);

  const handleLogoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setLogoDragging(false);
    if (e.dataTransfer.files.length) handleLogoFiles(e.dataTransfer.files);
  }, [handleLogoFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleLogoDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setLogoDragging(true);
  }, []);

  const handleLogoDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setLogoDragging(false);
  }, []);

  const renderPreview = useCallback(async () => {
    if (!base) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsRendering(true);
    try {
      const img = await loadImage(base.url);
      let w = img.width;
      let h = img.height;
      const maxSide = Math.max(w, h);
      if (maxSide > MAX_DIM) {
        const scale = MAX_DIM / maxSide;
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      w = Math.max(1, w);
      h = Math.max(1, h);
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // Prepare logo image if exists
      let logoImg: HTMLImageElement | null = null;
      let logoW = 0;
      let logoH = 0;
      if (logo) {
        try {
          logoImg = await loadImage(logo.url);
          const scaleFactor = logoScale / 100;
          logoW = Math.max(1, Math.round(logoImg.width * scaleFactor));
          logoH = Math.max(1, Math.round(logoImg.height * scaleFactor));
          // prevent logo larger than canvas
          if (logoW > w || logoH > h) {
            const fit = Math.min(w / logoW, h / logoH) * 0.9;
            logoW = Math.round(logoW * fit);
            logoH = Math.round(logoH * fit);
          }
        } catch {
          logoImg = null;
        }
      }

      const drawTextAt = (x: number, y: number) => {
        ctx.save();
        ctx.globalAlpha = textOpacity / 100;
        ctx.fillStyle = fontColor;
        const stylePart = `${italic ? "italic " : ""}${bold ? "bold " : ""}`;
        ctx.font = `${stylePart}${fontSize}px ${FONT_FAMILY_MAP[fontFamily]}`;
        const isLeft = position.includes("left");
        const isRight = position.includes("right");
        const isCenterH = position.includes("center") || position === "center";
        const isTop = position.includes("top");
        const isBottom = position.includes("bottom");
        ctx.textAlign = isLeft ? "left" : isRight ? "right" : isCenterH ? "center" : "center";
        ctx.textBaseline = isTop ? "top" : isBottom ? "bottom" : "middle";
        // translate to position, rotate, then draw at 0,0
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(watermarkText, 0, 0);
        ctx.restore();
      };

      const getTextPosition = (): { x: number; y: number } => {
        const isLeft = position.includes("left");
        const isRight = position.includes("right");
        const isTop = position.includes("top");
        const isBottom = position.includes("bottom");
        let x = 0;
        let y = 0;
        if (isLeft) x = offsetX;
        else if (isRight) x = w - offsetX;
        else x = w / 2 + offsetX;
        if (isTop) y = offsetY;
        else if (isBottom) y = h - offsetY;
        else y = h / 2 + offsetY;
        return { x, y };
      };

      const getLogoPosition = (): { x: number; y: number } => {
        const isLeft = position.includes("left");
        const isRight = position.includes("right");
        const isTop = position.includes("top");
        const isBottom = position.includes("bottom");
        let x = 0;
        let y = 0;
        if (isLeft) x = offsetX;
        else if (isRight) x = w - logoW - offsetX;
        else x = Math.round((w - logoW) / 2 + offsetX);
        if (isTop) y = offsetY;
        else if (isBottom) y = h - logoH - offsetY;
        else y = Math.round((h - logoH) / 2 + offsetY);
        x = Math.max(0, Math.min(x, w - logoW));
        y = Math.max(0, Math.min(y, h - logoH));
        return { x, y };
      };

      // Draw watermarks
      if (watermarkText.trim()) {
        if (tiled) {
          ctx.save();
          ctx.globalAlpha = textOpacity / 100;
          ctx.fillStyle = fontColor;
          const stylePart = `${italic ? "italic " : ""}${bold ? "bold " : ""}`;
          ctx.font = `${stylePart}${fontSize}px ${FONT_FAMILY_MAP[fontFamily]}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const metrics = ctx.measureText(watermarkText);
          const textW = metrics.width || fontSize * watermarkText.length * 0.6;
          const stepX = textW + 80;
          const stepY = fontSize + 80;
          for (let ty = -h; ty < h * 2; ty += stepY) {
            for (let tx = -w; tx < w * 2; tx += stepX) {
              ctx.save();
              ctx.translate(tx, ty);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.fillText(watermarkText, 0, 0);
              ctx.restore();
            }
          }
          ctx.restore();
        } else {
          const pos = getTextPosition();
          drawTextAt(pos.x, pos.y);
        }
      }

      if (logoImg && logoW > 0 && logoH > 0) {
        if (tiled) {
          ctx.save();
          ctx.globalAlpha = logoOpacity / 100;
          const stepX = logoW + 40;
          const stepY = logoH + 40;
          for (let ty = -h; ty < h * 2; ty += stepY) {
            for (let tx = -w; tx < w * 2; tx += stepX) {
              ctx.save();
              ctx.translate(tx, ty);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
              ctx.restore();
            }
          }
          ctx.restore();
        } else {
          const pos = getLogoPosition();
          ctx.save();
          ctx.globalAlpha = logoOpacity / 100;
          if (rotation !== 0) {
            const cx = pos.x + logoW / 2;
            const cy = pos.y + logoH / 2;
            ctx.translate(cx, cy);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
          } else {
            ctx.drawImage(logoImg, pos.x, pos.y, logoW, logoH);
          }
          ctx.restore();
        }
      }

      // update output size estimate
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), outputFormat, outputFormat === "image/png" ? undefined : quality / 100)
      );
      if (blob) setOutputSize(blob.size);
      else setOutputSize(null);
    } catch {
      // ignore render errors, keep previous preview
    } finally {
      setIsRendering(false);
    }
  }, [base, logo, watermarkText, fontSize, fontColor, textOpacity, fontFamily, bold, italic, rotation, logoScale, logoOpacity, position, offsetX, offsetY, tiled, outputFormat, quality]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (base) renderPreview();
    }, 100);
    return () => clearTimeout(id);
  }, [base, renderPreview]);

  useEffect(() => {
    return () => {
      if (base) URL.revokeObjectURL(base.url);
      if (logo) URL.revokeObjectURL(logo.url);
    };
  }, [base, logo]);

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !base) return;
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), outputFormat, outputFormat === "image/png" ? undefined : quality / 100)
    );
    if (!blob) {
      setError("Failed to generate image");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const baseName = base.file.name.replace(/\.[^.]+$/, "") || "image";
    const ext = FORMAT_OPTIONS.find((f) => f.value === outputFormat)?.ext || "png";
    link.download = `${baseName}-watermarked.${ext}`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setOutputSize(blob.size);
  }, [base, outputFormat, quality]);

  return (
    <div className="space-y-4">
      {/* Base image drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload base image, click or drop image here, press Enter to browse"
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
          aria-label="Choose base image file"
        />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-surface-500 dark:text-dark-muted">
          {base ? `${base.file.name} — ${base.width}×${base.height} — click or drop to replace` : "Click or drop base image here"}
        </p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">Supports JPEG, PNG, WebP · 10MB max · 100% local</p>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Logo drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload logo image for watermark, click or drop logo here"
        onDrop={handleLogoDrop}
        onDragOver={handleLogoDragOver}
        onDragLeave={handleLogoDragLeave}
        onClick={() => logoFileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            logoFileRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
          logoDragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-surface-200 bg-white hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface"
        }`}
      >
        <input
          ref={logoFileRef}
          type="file"
          accept={LOGO_ACCEPT}
          onChange={handleLogoInput}
          className="hidden"
          aria-label="Choose logo image file"
        />
        <svg className="mb-2 h-6 w-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <p className="text-sm text-surface-500 dark:text-dark-muted">
          {logo ? `${logo.file.name} — ${logo.width}×${logo.height} — click or drop to replace` : "Optional: Click or drop logo image (PNG with transparency recommended)"}
        </p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">Supports PNG, JPEG, WebP · 10MB max · used as image watermark</p>
      </div>

      {logoError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {logoError}
        </p>
      )}

      {logo && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearLogo}
            aria-label="Remove logo image"
            className="rounded-md border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Remove logo
          </button>
          <span className="text-xs text-surface-500 dark:text-dark-muted">{logo.file.name}</span>
        </div>
      )}

      {/* Controls */}
      {base && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Text section */}
            <div className="space-y-3 rounded-md border border-surface-200 p-3 dark:border-dark-border">
              <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">Text Watermark</h3>
              <div>
                <label htmlFor="wm-text" className="block text-xs text-surface-500 dark:text-dark-muted">
                  Watermark text
                </label>
                <input
                  id="wm-text"
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark text"
                  aria-label="Watermark text"
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="wm-fontsize" className="block text-xs text-surface-500 dark:text-dark-muted">
                    Font size: {fontSize}px
                  </label>
                  <input
                    id="wm-fontsize"
                    type="range"
                    min={10}
                    max={120}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 10)}
                    aria-label="Font size"
                    className="mt-1 w-full accent-brand-500"
                  />
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={fontSize}
                    onChange={(e) => setFontSize(Math.max(10, Math.min(120, parseInt(e.target.value) || 10)))}
                    aria-label="Font size number"
                    className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                  />
                </div>
                <div>
                  <label htmlFor="wm-color" className="block text-xs text-surface-500 dark:text-dark-muted">
                    Color
                  </label>
                  <input
                    id="wm-color"
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    aria-label="Watermark color"
                    className="mt-1 h-8 w-full rounded-md border border-surface-200 bg-white p-1 dark:border-dark-border dark:bg-dark-surface"
                  />
                  <div className="mt-1 flex items-center gap-2">
                    <label htmlFor="wm-text-opacity" className="text-xs text-surface-500 dark:text-dark-muted">
                      Opacity: {textOpacity}%
                    </label>
                  </div>
                  <input
                    id="wm-text-opacity"
                    type="range"
                    min={0}
                    max={100}
                    value={textOpacity}
                    onChange={(e) => setTextOpacity(parseInt(e.target.value))}
                    aria-label="Text opacity"
                    className="w-full accent-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="wm-fontfamily" className="block text-xs text-surface-500 dark:text-dark-muted">
                    Font family
                  </label>
                  <select
                    id="wm-fontfamily"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                    aria-label="Font family"
                    className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                  >
                    <option value="sans">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="wm-rotation" className="block text-xs text-surface-500 dark:text-dark-muted">
                    Rotation: {rotation}°
                  </label>
                  <input
                    id="wm-rotation"
                    type="range"
                    min={-180}
                    max={180}
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    aria-label="Rotation"
                    className="mt-1 w-full accent-brand-500"
                  />
                  <input
                    type="number"
                    min={-180}
                    max={180}
                    value={rotation}
                    onChange={(e) => setRotation(Math.max(-180, Math.min(180, parseInt(e.target.value) || 0)))}
                    aria-label="Rotation number"
                    className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
                  <input
                    type="checkbox"
                    checked={bold}
                    onChange={(e) => setBold(e.target.checked)}
                    aria-label="Bold"
                    className="accent-brand-500"
                  />
                  Bold
                </label>
                <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
                  <input
                    type="checkbox"
                    checked={italic}
                    onChange={(e) => setItalic(e.target.checked)}
                    aria-label="Italic"
                    className="accent-brand-500"
                  />
                  Italic
                </label>
              </div>
            </div>

            {/* Image logo section + Position */}
            <div className="space-y-3">
              <div className="rounded-md border border-surface-200 p-3 dark:border-dark-border">
                <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">Image Watermark</h3>
                <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">Upload a logo above to enable image watermark. Scale and opacity below.</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="wm-logoscale" className="block text-xs text-surface-500 dark:text-dark-muted">
                      Scale: {logoScale}%
                    </label>
                    <input
                      id="wm-logoscale"
                      type="range"
                      min={5}
                      max={100}
                      value={logoScale}
                      onChange={(e) => setLogoScale(parseInt(e.target.value))}
                      aria-label="Logo scale"
                      className="mt-1 w-full accent-brand-500"
                      disabled={!logo}
                    />
                  </div>
                  <div>
                    <label htmlFor="wm-logoopacity" className="block text-xs text-surface-500 dark:text-dark-muted">
                      Opacity: {logoOpacity}%
                    </label>
                    <input
                      id="wm-logoopacity"
                      type="range"
                      min={0}
                      max={100}
                      value={logoOpacity}
                      onChange={(e) => setLogoOpacity(parseInt(e.target.value))}
                      aria-label="Logo opacity"
                      className="mt-1 w-full accent-brand-500"
                      disabled={!logo}
                    />
                  </div>
                </div>
                {!logo && <p className="mt-2 text-xs text-surface-400 dark:text-dark-muted">No logo uploaded — image watermark disabled</p>}
              </div>

              <div className="rounded-md border border-surface-200 p-3 dark:border-dark-border">
                <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">Position</h3>
                <div className="mt-2 grid grid-cols-3 gap-1.5" role="group" aria-label="Watermark position">
                  {POSITIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      aria-label={p.label}
                      aria-pressed={position === p.value}
                      onClick={() => setPosition(p.value)}
                      className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        position === p.value
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-surface-200 bg-white text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="wm-offsetx" className="block text-xs text-surface-500 dark:text-dark-muted">
                      Offset X (px)
                    </label>
                    <input
                      id="wm-offsetx"
                      type="number"
                      value={offsetX}
                      onChange={(e) => setOffsetX(parseInt(e.target.value) || 0)}
                      aria-label="Offset X"
                      className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                    />
                  </div>
                  <div>
                    <label htmlFor="wm-offsety" className="block text-xs text-surface-500 dark:text-dark-muted">
                      Offset Y (px)
                    </label>
                    <input
                      id="wm-offsety"
                      type="number"
                      value={offsetY}
                      onChange={(e) => setOffsetY(parseInt(e.target.value) || 0)}
                      aria-label="Offset Y"
                      className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                    />
                  </div>
                </div>
                <label className="mt-3 flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
                  <input
                    type="checkbox"
                    checked={tiled}
                    onChange={(e) => setTiled(e.target.checked)}
                    aria-label="Tiled watermark"
                    className="accent-brand-500"
                  />
                  Tiled watermark (repeat across image)
                </label>
              </div>
            </div>
          </div>

          {/* Output format */}
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-surface-200 p-3 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <label htmlFor="wm-format" className="text-xs text-surface-500 dark:text-dark-muted">
                Output format
              </label>
              <select
                id="wm-format"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as ImageFormat)}
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
                <label htmlFor="wm-quality" className="text-xs text-surface-500 dark:text-dark-muted">
                  Quality: {quality}%
                </label>
                <input
                  id="wm-quality"
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  aria-label="Output quality"
                  className="w-24 accent-brand-500"
                />
              </div>
            )}
            {outputFormat === "image/png" && (
              <span className="text-xs text-surface-400 dark:text-dark-muted">PNG is lossless (quality ignored)</span>
            )}
            <span className="ml-auto text-xs text-surface-400 dark:text-dark-muted hidden sm:inline" aria-hidden="true">
              Canvas max {MAX_DIM}px · scaled to avoid memory issues
            </span>
          </div>

          {/* Preview */}
          <div className="space-y-3 rounded-md border border-surface-200 p-3 dark:border-dark-border">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">Live Preview</h3>
              <span className="text-xs text-surface-500 dark:text-dark-muted">
                {base.width}×{base.height} {outputSize !== null && `· ${formatSize(outputSize)}`} {isRendering && "· rendering…"}
              </span>
            </div>
            <div data-testid="tool-output" className="overflow-hidden rounded border border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
              <canvas
                ref={canvasRef}
                aria-label="Watermark preview"
                className="mx-auto block max-h-[60vh] max-w-full object-contain"
              />
              {!base && <p className="p-6 text-center text-xs text-surface-400 dark:text-dark-muted">Upload a base image to see preview</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownload}
                aria-label="Download watermarked image"
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Download
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                aria-label="Clear all images"
                className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-surface-400 dark:text-dark-muted">Preview updates automatically on any control change (debounced 100ms). All processing is 100% local via canvas.</p>
          </div>
        </>
      )}
    </div>
  );
}
