"use client";

import { useState, useRef, useCallback } from "react";
import { validateFileUpload } from "@/lib/file-security";
import { sanitize } from "@/lib/sanitize";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function escapeXmlAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function ImageToSvg() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [svgString, setSvgString] = useState("");
  const [svgUrl, setSvgUrl] = useState<string | null>(null);
  const [svgSize, setSvgSize] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const buildSvg = useCallback((url: string, w: number, h: number): string => {
    const safeUrl = escapeXmlAttr(url);
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">\n  <image href="${safeUrl}" xlink:href="${safeUrl}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" />\n</svg>`;
  }, []);

  const handleFile = useCallback(async (f: File) => {
    setError("");
    if (svgUrl) URL.revokeObjectURL(svgUrl);
    setSvgUrl(null);
    setSvgString("");
    setSvgSize(0);
    const validation = await validateFileUpload(f);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WebP, GIF, BMP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const w = img.width || 300;
        const h = img.height || 200;
        const svg = buildSvg(url, w, h);
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const objectUrl = URL.createObjectURL(blob);
        setFile(f);
        setDataUrl(url);
        setWidth(w);
        setHeight(h);
        setSvgString(svg);
        setSvgUrl(objectUrl);
        setSvgSize(blob.size);
      };
      img.onerror = () => setError("Failed to read image dimensions");
      img.src = url;
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsDataURL(f);
  }, [buildSvg, svgUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const copySvg = async () => {
    if (!svgString) return;
    await navigator.clipboard.writeText(svgString);
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = (file?.name.replace(/\.[^.]+$/, "") || "image");
    a.href = url;
    a.download = `${base}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setFile(null);
    setDataUrl("");
    setWidth(0);
    setHeight(0);
    setSvgString("");
    setSvgSize(0);
    if (svgUrl) URL.revokeObjectURL(svgUrl);
    setSvgUrl(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
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
        aria-label="Upload raster image to convert to SVG"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          className="hidden"
        />
        <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-surface-600 dark:text-dark-text text-center">
          {file ? `${file.name} — ${width}×${height} · ${formatSize(file.size)}` : "Click or drop a raster image to wrap as SVG"}
        </p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted text-center">PNG, JPG, WebP, GIF, BMP · 10MB max · embeds as base64 &lt;image&gt; · 100% local</p>
      </div>

      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

      {svgString && (
        <div data-testid="tool-output" className="space-y-3 rounded-md border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex flex-wrap gap-2 text-xs text-surface-500 dark:text-dark-muted">
            <span>Dimensions: {width}×{height}</span>
            <span>Original: {file ? formatSize(file.size) : "—"}</span>
            <span>SVG: {formatSize(svgSize)}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-surface-600 dark:text-dark-muted">Raster preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dataUrl} alt={file?.name || "Original"} className="max-h-64 w-full rounded border border-surface-200 object-contain dark:border-dark-border" />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-surface-600 dark:text-dark-muted">SVG preview (embedded image)</p>
              <div
                className="flex max-h-64 w-full items-center justify-center overflow-auto rounded border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-bg"
                // sanitize still allows <image href> with data: URI; xlink:href preserved
                dangerouslySetInnerHTML={{ __html: sanitize(svgString) }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copySvg}
              className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors"
            >
              Copy SVG
            </button>
            <button
              onClick={downloadSvg}
              className="rounded-md border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              Download .svg
            </button>
            <button
              onClick={clearAll}
              className="rounded-md border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              Clear
            </button>
          </div>

          <details className="rounded-md border border-surface-200 dark:border-dark-border">
            <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">Show SVG source</summary>
            <pre className="max-h-60 overflow-auto border-t border-surface-200 bg-surface-50 p-3 text-xs font-mono text-surface-800 break-all dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">{svgString}</pre>
          </details>
          <p className="text-xs text-surface-400 dark:text-dark-muted">SVG wraps the raster as a base64 <code className="rounded bg-surface-100 px-1 dark:bg-dark-border">{"<image>"}</code> — vector effects remain raster; file size grows ~33% due to base64.</p>
        </div>
      )}
    </div>
  );
}
