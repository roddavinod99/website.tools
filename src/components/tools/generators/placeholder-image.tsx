"use client";

import { useState, useMemo, useCallback } from "react";

const PRESET_SIZES = [
  { label: "Full HD", w: 1920, h: 1080 },
  { label: "HD", w: 1280, h: 720 },
  { label: "Web", w: 800, h: 600 },
  { label: "Favicon", w: 16, h: 16 },
  { label: "Avatar", w: 150, h: 150 },
  { label: "Thumbnail", w: 300, h: 200 },
  { label: "Medium Rect", w: 300, h: 250 },
  { label: "Banner", w: 728, h: 90 },
  { label: "Square", w: 300, h: 300 },
];

const MAX_WIDTH = 3840;
const MAX_HEIGHT = 2160;

export function PlaceholderImage() {
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [bgColor, setBgColor] = useState("#0070f3");
  const [textColor, setTextColor] = useState("#ffffff");
  const [customText, setCustomText] = useState("");
  const [fontSize, setFontSize] = useState(0);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [borderRadius, setBorderRadius] = useState(0);
  const [noise, setNoise] = useState(false);
  const [copied, setCopied] = useState("");

  const text = customText || `${width} x ${height}`;
  const fs = fontSize || Math.max(14, Math.min(width, height) * 0.1);

  const svgContent = useMemo(() => {
    const fill = bgColor;
    const rx = borderRadius > 0 ? `rx="${borderRadius}" ry="${borderRadius}"` : "";
    const noiseEl = noise ? `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4"/><feColorMatrix type="saturate" values="0"/><feBlend in="SourceGraphic" mode="multiply"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.08"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect ${rx} width="100%" height="100%" fill="${fill}"/>${noiseEl}<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="system-ui,sans-serif" font-size="${fs}px" font-weight="500">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text></svg>`;
  }, [width, height, bgColor, textColor, text, fs, borderRadius, noise]);

  const dataUri = useMemo(() => {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }, [svgContent]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const renderToCanvas = useCallback((fmt: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const ctx = c.getContext("2d")!;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        c.toBlob((b) => resolve(b), `image/${fmt === "jpeg" ? "jpeg" : fmt}`);
      };
      img.onerror = () => resolve(null);
      img.src = dataUri;
    });
  }, [width, height, dataUri]);

  const download = async () => {
    const ext = format === "jpeg" ? "jpg" : format;
    if (format === "png" || format === "jpeg" || format === "webp") {
      const blob = await renderToCanvas(format);
      if (blob) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `placeholder.${ext}`;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    }
  };

  const copyDataUrl = useCallback(async () => {
    const blob = await renderToCanvas(format);
    if (blob) {
      const reader = new FileReader();
      reader.onload = () => {
        navigator.clipboard.writeText(reader.result as string);
      };
      reader.readAsDataURL(blob);
    }
  }, [renderToCanvas, format]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Width (px)</label><input type="number" value={width} onChange={(e) => setWidth(Math.min(MAX_WIDTH, +e.target.value || 0))} min={1} max={MAX_WIDTH} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" /></div>
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Height (px)</label><input type="number" value={height} onChange={(e) => setHeight(Math.min(MAX_HEIGHT, +e.target.value || 0))} min={1} max={MAX_HEIGHT} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" /></div>
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Background</label><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-full rounded border border-surface-200 cursor-pointer dark:border-dark-border" /></div>
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Text Color</label><input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-9 w-full rounded border border-surface-200 cursor-pointer dark:border-dark-border" /></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Output Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as "png" | "jpeg" | "webp")} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Border Radius: {borderRadius}px</label><input type="range" min={0} max={100} value={borderRadius} onChange={(e) => setBorderRadius(+e.target.value)} className="w-full accent-brand-500" /></div>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text"><input type="checkbox" checked={noise} onChange={(e) => setNoise(e.target.checked)} className="accent-brand-500" /> Noise texture</label>
      </div>

      <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Custom Text</label><input type="text" value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder={`${width} x ${height}`} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" /></div>

      <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Font Size: {fs}px (0 = auto)</label><input type="range" min={12} max={200} value={fontSize || 12} onChange={(e) => setFontSize(+e.target.value)} className="w-full accent-brand-500" /></div>

      <div className="flex flex-wrap gap-2">
        {PRESET_SIZES.map((p) => (
          <button key={p.label} onClick={() => { setWidth(p.w); setHeight(p.h); }} className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted">{p.label} ({p.w}x{p.h})</button>
        ))}
      </div>

      <div className="rounded-lg border border-surface-200 bg-white p-4 flex items-center justify-center dark:border-dark-border dark:bg-dark-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} alt="Placeholder preview" className="max-w-full" style={{ maxHeight: 300 }} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={download} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Download as {format.toUpperCase()}</button>
        <button onClick={copyDataUrl} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">{copied === "uri" ? "Copied!" : "Copy as Data URL"}</button>
        <button onClick={() => handleCopy(svgContent, "svg")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">{copied === "svg" ? "Copied!" : "Copy SVG Code"}</button>
      </div>
    </div>
  );
}
